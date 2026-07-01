// Discovers logical traffic flows from the resource graph.
// e.g.  Internet → Front Door → App Gateway → AKS → SQL

const FRONT_DOOR_TYPES = new Set([
  'microsoft.network/frontdoors', 'microsoft.cdn/profiles', 'microsoft.cdn/profiles/afdendpoints',
  'microsoft.network/trafficmanagerprofiles',
]);
const APP_GW_TYPES     = new Set(['microsoft.network/applicationgateways']);
const LB_TYPES         = new Set(['microsoft.network/loadbalancers']);
const FIREWALL_TYPES   = new Set(['microsoft.network/azurefirewalls']);
const APP_TYPES        = new Set([
  'microsoft.web/sites', 'microsoft.containerservice/managedclusters',
  'microsoft.compute/virtualmachinescalesets', 'microsoft.compute/virtualmachines',
  'microsoft.app/containerapps', 'microsoft.containerinstance/containergroups',
]);
const DATA_TYPES       = new Set([
  'microsoft.sql/servers', 'microsoft.sql/servers/databases',
  'microsoft.documentdb/databaseaccounts', 'microsoft.cache/redis',
  'microsoft.dbformysql/servers', 'microsoft.dbformysql/flexibleservers',
  'microsoft.dbforpostgresql/servers', 'microsoft.dbforpostgresql/flexibleservers',
  'microsoft.storage/storageaccounts',
]);
const GATEWAY_TYPES    = new Set([
  'microsoft.network/virtualnetworkgateways', 'microsoft.network/vpngateways',
  'microsoft.network/expressroutecircuits',
]);

const has = (set, r) => set.has((r.azureType || '').toLowerCase());

/**
 * Build an adjacency map: resourceId → array of outgoing edges (to resource, relation)
 */
function adjacency(edges) {
  const adj = new Map();
  for (const e of edges) {
    const key = e.from.resourceId || e.from.name;
    if (!adj.has(key)) adj.set(key, []);
    adj.get(key).push({ target: e.to, relation: e.relation });
  }
  return adj;
}

function pickEntryPoints(resources) {
  const entries = [];
  for (const r of resources) {
    if (has(FRONT_DOOR_TYPES, r)) entries.push({ kind: 'internet', node: r });
  }
  if (entries.length > 0) return entries;

  for (const r of resources) {
    if (has(APP_GW_TYPES, r) || has(LB_TYPES, r)) entries.push({ kind: 'internet', node: r });
  }
  if (entries.length > 0) return entries;

  // Fallback: use public IPs
  for (const r of resources) {
    if ((r.azureType || '').toLowerCase() === 'microsoft.network/publicipaddresses') {
      entries.push({ kind: 'internet', node: r });
    }
  }
  return entries;
}

/**
 * Traverse from an entry point through relationships, emitting an ordered path.
 * Uses BFS to gather all reachable data-tier destinations.
 */
function tracePath(entry, adj, maxDepth = 6) {
  const paths = [];
  const stack = [{ node: entry, path: [entry] }];
  const visitedGlobal = new Set();

  while (stack.length > 0) {
    const { node, path } = stack.shift();
    const key = node.resourceId || node.name;
    if (visitedGlobal.has(key)) continue;
    visitedGlobal.add(key);
    if (path.length >= maxDepth) continue;

    const next = adj.get(key) || [];
    if (next.length === 0 && has(DATA_TYPES, node)) {
      paths.push(path);
      continue;
    }

    let extended = false;
    for (const { target } of next) {
      if (path.includes(target)) continue;
      stack.push({ node: target, path: [...path, target] });
      extended = true;
    }
    // If we hit a data-tier resource, emit path
    if (has(DATA_TYPES, node) && path.length > 1) {
      paths.push(path);
    }
    if (!extended && path.length > 1 && !has(DATA_TYPES, node)) {
      paths.push(path);
    }
  }
  return paths;
}

export function discoverFlows(resources, edges) {
  const adj = adjacency(edges);
  const entries = pickEntryPoints(resources);
  const flows = [];

  for (const entry of entries) {
    const paths = tracePath(entry.node, adj);
    for (const p of paths) {
      flows.push({
        id: `flow-${flows.length}`,
        entry: entry.kind,
        steps: p.map(n => ({
          name: n.name,
          type: n.azureType,
          resourceId: n.resourceId,
        })),
        label: describeFlow(entry.kind, p),
      });
    }
  }

  // Hybrid on-prem flows
  for (const r of resources) {
    if (has(GATEWAY_TYPES, r)) {
      flows.push({
        id: `flow-${flows.length}`,
        entry: 'on-premises',
        steps: [{ name: 'On-premises', type: 'external' }, {
          name: r.name, type: r.azureType, resourceId: r.resourceId,
        }],
        label: `On-prem → ${r.name}`,
      });
    }
  }

  return flows;
}

function describeFlow(entryKind, path) {
  const prefix = entryKind === 'internet' ? 'Users' : 'On-premises';
  return `${prefix} → ` + path.map(n => n.name).join(' → ');
}
