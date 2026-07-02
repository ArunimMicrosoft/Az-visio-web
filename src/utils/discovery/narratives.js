// Generates plain-English descriptions of "who talks to what" from the
// discovered resources + relationships. Result is a list of sentences the
// Discovery modal renders as bullet points so non-technical users can read
// the architecture like a story.

const T = (r, x) => (r?.azureType || '').toLowerCase() === x.toLowerCase();

// Friendly names for Azure resource categories
function friendlyType(azureType) {
  const t = (azureType || '').toLowerCase();
  if (t === 'microsoft.compute/virtualmachines')            return 'virtual machine';
  if (t === 'microsoft.compute/virtualmachinescalesets')    return 'VM scale set';
  if (t === 'microsoft.network/networkinterfaces')          return 'network card';
  if (t === 'microsoft.network/publicipaddresses')          return 'public IP address';
  if (t === 'microsoft.network/networksecuritygroups')      return 'firewall (NSG)';
  if (t === 'microsoft.network/virtualnetworks')            return 'virtual network';
  if (t === 'microsoft.network/virtualnetworks/subnets')    return 'subnet';
  if (t === 'microsoft.network/routetables')                return 'route table';
  if (t === 'microsoft.network/azurefirewalls')             return 'Azure Firewall';
  if (t === 'microsoft.network/applicationgateways')        return 'Application Gateway';
  if (t === 'microsoft.network/loadbalancers')              return 'load balancer';
  if (t === 'microsoft.network/frontdoors')                 return 'Front Door';
  if (t === 'microsoft.network/bastionhosts')               return 'Bastion (secure remote access)';
  if (t === 'microsoft.network/privateendpoints')           return 'private endpoint';
  if (t === 'microsoft.containerservice/managedclusters')   return 'AKS Kubernetes cluster';
  if (t === 'microsoft.web/sites')                          return 'App Service';
  if (t === 'microsoft.web/serverfarms')                    return 'App Service Plan';
  if (t === 'microsoft.storage/storageaccounts')            return 'storage account';
  if (t === 'microsoft.sql/servers')                        return 'SQL server';
  if (t === 'microsoft.sql/servers/databases')              return 'SQL database';
  if (t === 'microsoft.documentdb/databaseaccounts')        return 'Cosmos DB';
  if (t === 'microsoft.cache/redis')                        return 'Redis cache';
  if (t === 'microsoft.keyvault/vaults')                    return 'Key Vault (secrets store)';
  if (t === 'microsoft.compute/snapshots')                  return 'disk snapshot (backup)';
  if (t === 'microsoft.compute/disks')                      return 'managed disk';
  if (t === 'microsoft.recoveryservices/vaults')            return 'backup vault';
  return azureType?.split('/').pop() || 'resource';
}

const displayName = (r) => (r?.name || 'unnamed').split('/').pop();

/**
 * Build per-workload traffic paths.
 * Returns an array of paths, each = { anchor: name, steps: [{ role, name, note }] }.
 */
function buildWorkloadPaths(resources, edges) {
  // Build lookup adjacency (undirected)
  const adj = new Map(resources.map(r => [r, new Map()]));
  for (const e of edges) {
    if (!adj.has(e.from) || !adj.has(e.to)) continue;
    adj.get(e.from).set(e.to, e.relation);
    adj.get(e.to).set(e.from, e.relation);
  }

  // Anchors = VMs, VMSS, AKS, App Services, Container Apps
  const anchors = resources.filter(r => (
    T(r, 'Microsoft.Compute/virtualMachines') ||
    T(r, 'Microsoft.Compute/virtualMachineScaleSets') ||
    T(r, 'Microsoft.ContainerService/managedClusters') ||
    T(r, 'Microsoft.Web/sites') ||
    T(r, 'Microsoft.App/containerApps')
  ));

  const paths = [];
  for (const vm of anchors) {
    // Walk edges: VM → NIC (via `uses`); NIC → PIP (`attached_to` reversed);
    // NIC → subnet (`located_in`); NIC → NSG (`protected_by` reversed);
    // subnet → route table (`routes_via`); subnet's parent VNet is implicit.
    const nic = findNeighbour(vm, adj, r => T(r, 'Microsoft.Network/networkInterfaces'));
    if (!nic) {
      paths.push({
        anchor: displayName(vm),
        anchorType: friendlyType(vm.azureType),
        steps: [{ role: 'note', text: `Runs standalone with no network card discovered.` }],
      });
      continue;
    }

    const pip    = findNeighbour(nic, adj, r => T(r, 'Microsoft.Network/publicIPAddresses'));
    const nsg    = findNeighbour(nic, adj, r => T(r, 'Microsoft.Network/networkSecurityGroups'));
    const subnet = findNeighbour(nic, adj, r => T(r, 'Microsoft.Network/virtualNetworks/subnets'));
    const rt     = subnet && findNeighbour(subnet, adj, r => T(r, 'Microsoft.Network/routeTables'));

    // Extract PIP address if present
    const pipAddress = pip?.properties?.ipAddress;
    const vnetName   = subnet?.name?.split('/')?.[0];

    const steps = [];
    if (pip) {
      steps.push({
        role: 'inbound',
        text: pipAddress
          ? `Public traffic reaches the workload through public IP address <b>${displayName(pip)}</b> (<code>${pipAddress}</code>).`
          : `Public traffic reaches the workload through public IP address <b>${displayName(pip)}</b>.`,
      });
    } else {
      steps.push({
        role: 'inbound',
        text: `This workload has no public IP — it can only be reached from inside the network.`,
      });
    }
    if (nsg) {
      steps.push({
        role: 'filter',
        text: `Firewall <b>${displayName(nsg)}</b> checks every incoming packet and blocks anything not allowed.`,
      });
    } else {
      steps.push({
        role: 'filter',
        text: `⚠️ No firewall (NSG) is attached — the network card has no port-level protection.`,
      });
    }
    steps.push({
      role: 'nic',
      text: `Traffic then arrives at network card <b>${displayName(nic)}</b>${
        nic.properties?.ipConfigurations?.[0]?.properties?.privateIPAddress
          ? ` (internal IP <code>${nic.properties.ipConfigurations[0].properties.privateIPAddress}</code>)`
          : ''
      }.`,
    });
    if (subnet) {
      steps.push({
        role: 'subnet',
        text: `The network card lives in subnet <b>${displayName(subnet)}</b>${vnetName ? ` inside virtual network <b>${vnetName}</b>` : ''}.`,
      });
    }
    if (rt) {
      steps.push({
        role: 'route',
        text: `Outgoing traffic from this subnet follows the rules in route table <b>${displayName(rt)}</b>.`,
      });
    }
    steps.push({
      role: 'target',
      text: `Finally, the traffic reaches your ${friendlyType(vm.azureType)} <b>${displayName(vm)}</b>.`,
    });

    paths.push({
      anchor: displayName(vm),
      anchorType: friendlyType(vm.azureType),
      steps,
    });
  }
  return paths;
}

function findNeighbour(from, adj, predicate) {
  const neighbours = adj.get(from);
  if (!neighbours) return null;
  for (const [r] of neighbours) {
    if (predicate(r)) return r;
  }
  return null;
}

/**
 * Turn raw discovered edges into short human sentences ("X → Y" style).
 */
function edgeSentences(edges) {
  const out = [];
  for (const e of edges) {
    const from = displayName(e.from);
    const to   = displayName(e.to);
    const fromT = friendlyType(e.from.azureType);
    const toT   = friendlyType(e.to.azureType);
    let s = null;

    switch (e.relation) {
      case 'attached_to':
        s = `Public IP <b>${from}</b> is attached to ${toT} <b>${to}</b>.`;
        break;
      case 'located_in':
        s = `${cap(fromT)} <b>${from}</b> sits inside ${toT} <b>${to}</b>.`;
        break;
      case 'protected_by':
        s = `Firewall <b>${from}</b> protects ${toT} <b>${to}</b>.`;
        break;
      case 'routes_via':
        s = `${cap(fromT)} <b>${from}</b> routes its traffic through <b>${to}</b>.`;
        break;
      case 'uses':
        s = `${cap(fromT)} <b>${from}</b> uses ${toT} <b>${to}</b>.`;
        break;
      case 'peered_with':
        s = `Virtual network <b>${from}</b> is peered with <b>${to}</b> — they can talk to each other privately.`;
        break;
      case 'connected_via':
        s = `<b>${from}</b> connects privately to ${toT} <b>${to}</b> through a private endpoint.`;
        break;
      case 'identity_of':
        s = `Managed identity <b>${from}</b> is assigned to ${toT} <b>${to}</b> for authentication.`;
        break;
      case 'belongs_to':
        // Implicit via nested boundary — skip
        continue;
      case 'linked_to':
        s = `<b>${from}</b> is linked to ${toT} <b>${to}</b>.`;
        break;
      case 'targets':
      case 'backs':
        s = `${cap(fromT)} <b>${from}</b> forwards traffic to ${toT} <b>${to}</b>.`;
        break;
      case 'parent_of':
        // Skip — hierarchical, implicit
        continue;
      default:
        s = `<b>${from}</b> is associated with <b>${to}</b> (${e.relation}).`;
    }
    if (s) out.push({ sentence: s, inferred: e.confidence === 'inferred' });
  }
  return dedupe(out);
}

function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

function dedupe(arr) {
  const seen = new Set();
  return arr.filter(x => {
    if (seen.has(x.sentence)) return false;
    seen.add(x.sentence);
    return true;
  });
}

/**
 * Public entry — returns { workloads, connections } narratives.
 */
export function buildNarratives(resources, edges) {
  return {
    workloads:   buildWorkloadPaths(resources, edges),
    connections: edgeSentences(edges),
  };
}
