// Layout — builds canvas items, connections, and a Resource-Group boundary.
// Uses a "workload column" strategy: each compute anchor (VM / VMSS / AKS /
// App Service / Container App) becomes a column and everything attached to it
// (NIC → PIP / NSG → Subnet → VNet) stacks vertically above it in tier order.
// Result: short, mostly-vertical edges. Shared or isolated resources go into
// a Networking column on the left and a Data / Storage strip at the bottom.

import { mapAzureType, getIconPath } from './typeMap.js';

const CARD_W = 130;
const CARD_H = 130;
const H_GAP  = 40;
const V_GAP  = 60;

const RG_PAD_X = 40;
const RG_PAD_Y = 60;

// Which Azure types are workload anchors — each anchors a vertical column
const COMPUTE_TYPES = new Set([
  'microsoft.compute/virtualmachines',
  'microsoft.compute/virtualmachinescalesets',
  'microsoft.containerservice/managedclusters',
  'microsoft.web/sites',
  'microsoft.app/containerapps',
  'microsoft.containerinstance/containergroups',
]);

// Types considered "shared network fabric" — get a dedicated column, not per-workload
const SHARED_NETWORK_TYPES = new Set([
  'microsoft.network/virtualnetworks',
  'microsoft.network/routetables',
  'microsoft.network/firewalls',
  'microsoft.network/azurefirewalls',
  'microsoft.network/virtualnetworkgateways',
  'microsoft.network/vpngateways',
  'microsoft.network/expressroutecircuits',
  'microsoft.network/frontdoors',
  'microsoft.network/applicationgateways',
  'microsoft.network/loadbalancers',
  'microsoft.network/bastionhosts',
  'microsoft.network/natgateways',
  'microsoft.cdn/profiles',
  'microsoft.network/dnszones',
  'microsoft.network/privatednszones',
]);

// Types that go in the "data / storage strip" at the bottom
const DATA_TYPES = new Set([
  'microsoft.compute/snapshots',
  'microsoft.compute/disks',
  'microsoft.storage/storageaccounts',
  'microsoft.sql/servers',
  'microsoft.sql/servers/databases',
  'microsoft.documentdb/databaseaccounts',
  'microsoft.cache/redis',
  'microsoft.keyvault/vaults',
  'microsoft.recoveryservices/vaults',
  'microsoft.dbformysql/servers',
  'microsoft.dbformysql/flexibleservers',
  'microsoft.dbforpostgresql/servers',
  'microsoft.dbforpostgresql/flexibleservers',
]);

// Within a workload column, higher order value = placed lower on canvas.
// The compute anchor (VM etc.) goes at the bottom.
const COLUMN_ORDER = {
  vnet:     0,
  subnet:   1,
  pip:      2,
  nsg:      2,
  nic:      3,
  compute:  4,
};

// Classify a resource for column-order purposes
function classify(azureType) {
  const t = (azureType || '').toLowerCase();
  if (COMPUTE_TYPES.has(t)) return 'compute';
  if (t === 'microsoft.network/networkinterfaces')         return 'nic';
  if (t === 'microsoft.network/publicipaddresses')         return 'pip';
  if (t === 'microsoft.network/networksecuritygroups')     return 'nsg';
  if (t === 'microsoft.network/virtualnetworks/subnets')   return 'subnet';
  if (t === 'microsoft.network/virtualnetworks')           return 'vnet';
  return 'other';
}

function isDataType(t) { return DATA_TYPES.has((t || '').toLowerCase()); }
function isSharedNet(t) { return SHARED_NETWORK_TYPES.has((t || '').toLowerCase()); }

/**
 * Build a lookup from an internal resource → array of its direct neighbours
 * (both incoming and outgoing edges collapsed into undirected adjacency).
 */
function buildAdjacency(resources, edges) {
  const idx = new Map(resources.map((r, i) => [r, i]));
  const adj = new Map(resources.map(r => [r, new Set()]));
  for (const e of edges) {
    if (!adj.has(e.from) || !adj.has(e.to)) continue;
    adj.get(e.from).add(e.to);
    adj.get(e.to).add(e.from);
  }
  return { idx, adj };
}

/**
 * Convert internal resources + edges into canvas items, connections, boundary.
 */
export function buildLayout(resources, edges) {
  // ── Step 1: create canvas items for every resource ──────────────────────
  const items = [];
  const resourceToItem = new Map();

  resources.forEach((r, idx) => {
    const meta = mapAzureType(r.azureType);
    if (!meta) return;
    const item = {
      id: `disc-${idx}`,
      serviceType: meta.serviceType,
      type: meta.serviceType,
      name: shortName(r.name, r.azureType),
      label: r.name,
      x: 0, y: 0,
      path: getIconPath(meta.icon),
      metadata: {
        azureType: r.azureType,
        category: meta.category,
        tier: meta.tier,
        resourceGroup: r.resourceGroup,
        location: r.location,
        subscription: r.subscription,
        resourceId: r.resourceId,
        tags: r.tags,
      },
    };
    items.push(item);
    resourceToItem.set(r, item);
  });

  // Filter resources to only those that got items (drops SKIP_CHILD_TYPES etc.)
  const kept = resources.filter(r => resourceToItem.has(r));

  // ── Step 2: build adjacency for workload discovery ──────────────────────
  const { adj } = buildAdjacency(kept, edges);

  // ── Step 3: pick workload anchors (compute nodes) ───────────────────────
  const anchors = kept.filter(r => COMPUTE_TYPES.has((r.azureType || '').toLowerCase()));

  // Assign each resource to a workload cluster (by nearest anchor via BFS)
  const clusterOf = new Map();   // resource → clusterId
  const clusterMembers = new Map(); // clusterId → resource[]

  anchors.forEach((anchor, ci) => {
    const clusterId = `w${ci}`;
    clusterOf.set(anchor, clusterId);
    clusterMembers.set(clusterId, [anchor]);
  });

  // BFS from all anchors simultaneously, claiming unclaimed neighbours.
  // Depth-limited to 3 hops so we don't hoover in shared fabric like VNets.
  const MAX_DEPTH = 3;
  let frontier = anchors.map(a => ({ node: a, depth: 0, cluster: clusterOf.get(a) }));
  while (frontier.length > 0) {
    const next = [];
    for (const { node, depth, cluster } of frontier) {
      if (depth >= MAX_DEPTH) continue;
      for (const nb of adj.get(node) || []) {
        if (clusterOf.has(nb)) continue;
        // Skip shared network fabric — kept as a global cluster
        if (isSharedNet(nb.azureType)) continue;
        clusterOf.set(nb, cluster);
        clusterMembers.get(cluster).push(nb);
        next.push({ node: nb, depth: depth + 1, cluster });
      }
    }
    frontier = next;
  }

  // ── Step 4: classify remaining resources ────────────────────────────────
  const sharedNetwork = [];  // VNets, route tables, gateways, LBs, firewalls
  const dataStrip     = [];  // snapshots, disks, storage, DBs, key vaults
  const orphan        = [];  // anything else without a cluster

  for (const r of kept) {
    if (clusterOf.has(r)) continue;
    if (isSharedNet(r.azureType))    { sharedNetwork.push(r); continue; }
    if (isDataType(r.azureType))     { dataStrip.push(r);     continue; }
    orphan.push(r);
  }

  // ── Step 5: position each workload cluster as a vertical column ─────────
  const COL_W = CARD_W + H_GAP;      // horizontal step between columns
  const ROW_H = CARD_H + V_GAP;      // vertical step between rows

  let cursorX = RG_PAD_X;
  const topY  = RG_PAD_Y;

  // 5a — Shared Networking column (left-most)
  if (sharedNetwork.length > 0) {
    sortByAzureType(sharedNetwork);
    // Prefer VNet at top, then LB / App Gw, then route tables
    for (let i = 0; i < sharedNetwork.length; i++) {
      const item = resourceToItem.get(sharedNetwork[i]);
      item.x = cursorX;
      item.y = topY + i * ROW_H;
    }
    cursorX += COL_W;
  }

  // 5b — Workload columns (one per anchor). Sort so that the biggest
  // cluster is placed first (looks nicer).
  const clusterEntries = [...clusterMembers.entries()]
    .sort((a, b) => b[1].length - a[1].length);

  for (const [, members] of clusterEntries) {
    // Bucket members by role
    const buckets = { vnet: [], subnet: [], pip: [], nsg: [], nic: [], compute: [], other: [] };
    for (const m of members) buckets[classify(m.azureType)].push(m);

    // Stack top → bottom: subnet → pip/nsg (side by side) → nic → compute
    let rowY = topY;
    const placeRow = (nodes) => {
      if (nodes.length === 0) return;
      nodes.forEach((n, i) => {
        const item = resourceToItem.get(n);
        item.x = cursorX + i * (CARD_W * 0.6);   // slight overlap when >1 per row
        item.y = rowY;
      });
      rowY += ROW_H;
    };

    placeRow(buckets.subnet);
    // PIP and NSG occupy the same visual row (PIP on the left, NSG on the right)
    if (buckets.pip.length || buckets.nsg.length) {
      const combined = [...buckets.pip, ...buckets.nsg];
      combined.forEach((n, i) => {
        const item = resourceToItem.get(n);
        item.x = cursorX + i * (CARD_W + 10);
        item.y = rowY;
      });
      rowY += ROW_H;
    }
    placeRow(buckets.nic);
    placeRow(buckets.compute);
    placeRow(buckets.other);

    // Column width scales with widest row in this cluster
    const widest = Math.max(1, buckets.pip.length + buckets.nsg.length, buckets.subnet.length);
    cursorX += Math.max(COL_W, widest * (CARD_W + 10) + H_GAP);
  }

  // 5c — Data / storage strip at the bottom
  const bottomY = topY + 5 * ROW_H;   // below the compute row
  if (dataStrip.length > 0) {
    sortByAzureType(dataStrip);
    dataStrip.forEach((r, i) => {
      const item = resourceToItem.get(r);
      item.x = RG_PAD_X + i * (CARD_W + H_GAP);
      item.y = bottomY;
    });
  }

  // 5d — Any leftover orphan resources — place on the right side
  if (orphan.length > 0) {
    orphan.forEach((r, i) => {
      const item = resourceToItem.get(r);
      item.x = cursorX + (i % 3) * COL_W;
      item.y = topY + Math.floor(i / 3) * ROW_H;
    });
    cursorX += 3 * COL_W;
  }

  // ── Step 6: enclosing Resource Group boundary ──────────────────────────
  const rgName = kept.find(r => r.resourceGroup)?.resourceGroup || 'default';
  const bounds = getBoundingBox(items);
  const boundaries = [{
    id: 'boundary-rg-0',
    label: `📦 ${rgName}`,
    name: rgName,
    type: 'resource-group',
    x: bounds.x - 30,
    y: bounds.y - 40,
    width:  bounds.width + 60,
    height: bounds.height + 70,
    color: '#0078D4',
    itemIds: items.map(it => it.id),
  }];

  // ── Step 7: canvas connections ─────────────────────────────────────────
  const connections = [];
  const seen = new Set();
  for (const e of edges) {
    const fromItem = resourceToItem.get(e.from);
    const toItem   = resourceToItem.get(e.to);
    if (!fromItem || !toItem) continue;
    const key = `${fromItem.id}→${toItem.id}`;
    if (seen.has(key)) continue;
    seen.add(key);
    connections.push({
      id: `conn-${connections.length}`,
      from: fromItem.id,
      to: toItem.id,
      type: e.relation || 'dependency',
      status: e.confidence === 'inferred' ? 'inferred' : 'valid',
    });
  }

  return { items, connections, boundaries };
}

// ── Utilities ─────────────────────────────────────────────────────────────

function sortByAzureType(arr) {
  arr.sort((a, b) => (a.azureType || '').localeCompare(b.azureType || ''));
}

function getBoundingBox(items) {
  if (items.length === 0) return { x: 0, y: 0, width: 400, height: 300 };
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const it of items) {
    minX = Math.min(minX, it.x);
    minY = Math.min(minY, it.y);
    maxX = Math.max(maxX, it.x + CARD_W);
    maxY = Math.max(maxY, it.y + CARD_H);
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

function shortName(name = '', azureType = '') {
  if (!name) return 'Resource';
  let str = String(name);
  const paramMatch = str.match(/parameters\('([^']+)'\)/);
  if (paramMatch) {
    str = paramMatch[1]
      .replace(/^[a-z]+(?:_)?([A-Za-z0-9]+.*?)_name$/, '$1')
      .replace(/_name$/, '');
  }

  // For subnets, keep the parent/child pair so users can tell them apart
  const isSubnet = /virtualNetworks\/subnets$/i.test(azureType);
  if (isSubnet && str.includes('/')) {
    const parts = str.split('/');
    const vnet = parts[0].replace(/[-_]+/g, ' ');
    const sub  = parts[parts.length - 1].replace(/[-_]+/g, ' ');
    return `${vnet} · ${sub}`.slice(0, 40);
  }

  const last = str.split('/').pop();
  return (last || str).replace(/[-_]+/g, ' ').slice(0, 32);
}
