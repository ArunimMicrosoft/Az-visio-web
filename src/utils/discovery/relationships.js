// Discovers relationships between normalized Azure resources.
// Follows the discovery spec: parent resources, resource IDs, subnet refs,
// backend pools, private endpoint connections, managed identities, DNS links.

import { parseResourceId } from './parsers.js';

const REL = {
  parent_of:        'parent_of',
  belongs_to:       'belongs_to',
  attached_to:      'attached_to',
  associated_with:  'associated_with',
  uses:             'uses',
  routes_via:       'routes_via',
  protected_by:     'protected_by',
  peered_with:      'peered_with',
  connected_via:    'connected_via',
  located_in:       'located_in',
  linked_to:        'linked_to',
  targets:          'targets',
  backs:            'backs',
  identity_of:      'identity_of',
};

/**
 * Build resource lookup keyed by resourceId (lowercase) for quick matching.
 * Also keeps a fallback by "type/name" and by name alone.
 */
function buildLookup(resources) {
  const byId = new Map();
  const byTypeName = new Map();
  const byName = new Map();
  for (const r of resources) {
    if (r.resourceId) byId.set(r.resourceId.toLowerCase(), r);
    byTypeName.set(`${(r.azureType || '').toLowerCase()}/${(r.name || '').toLowerCase()}`, r);
    // Only store first occurrence of a name (avoid overwrite noise)
    if (!byName.has((r.name || '').toLowerCase())) byName.set((r.name || '').toLowerCase(), r);
  }
  return { byId, byTypeName, byName };
}

function findByRef(lookup, ref) {
  if (!ref) return null;
  const norm = ref.toLowerCase();
  return lookup.byId.get(norm) || null;
}

/**
 * Deep-walk the properties tree looking for `.id` fields that reference
 * other Azure resources by full ARM id.
 */
function collectIdRefs(obj, out = []) {
  if (!obj || typeof obj !== 'object') return out;
  if (Array.isArray(obj)) {
    for (const item of obj) collectIdRefs(item, out);
    return out;
  }
  for (const [k, v] of Object.entries(obj)) {
    if (k === 'id' && typeof v === 'string' && v.toLowerCase().startsWith('/subscriptions/')) {
      out.push(v);
    } else if (typeof v === 'object') {
      collectIdRefs(v, out);
    } else if (typeof v === 'string' && v.toLowerCase().startsWith('/subscriptions/')) {
      out.push(v);
    }
  }
  return out;
}

/**
 * Main entry — returns an array of edge objects:
 *   { id, from, to, type, relation, inferred }
 */
export function discoverRelationships(resources) {
  const lookup = buildLookup(resources);
  const edges = [];
  const seen = new Set();

  const addEdge = (fromR, toR, relation, opts = {}) => {
    if (!fromR || !toR) return;
    if (fromR === toR) return;
    const key = `${fromR.resourceId || fromR.name}→${toR.resourceId || toR.name}|${relation}`;
    if (seen.has(key)) return;
    seen.add(key);
    edges.push({
      id: `edge-${edges.length}`,
      from: fromR,
      to: toR,
      relation,
      inferred: !!opts.inferred,
      confidence: opts.inferred ? 'inferred' : 'confirmed',
    });
  };

  for (const r of resources) {
    const type = (r.azureType || '').toLowerCase();
    const props = r.properties || {};

    // ── Parent resource (nested) ────────────────────────────────────────
    // Example: SQL DB "server/dbname" → parent is server
    if (r.name && r.name.includes('/')) {
      const parentName = r.name.split('/').slice(0, -1).join('/');
      const parentType = r.azureType.split('/').slice(0, -1).join('/');
      const parent = lookup.byTypeName.get(`${parentType.toLowerCase()}/${parentName.toLowerCase()}`);
      if (parent) addEdge(parent, r, REL.parent_of);
    }

    // Subnet → VNet (from resource ID)
    if (type === 'microsoft.network/virtualnetworks/subnets') {
      const parsed = parseResourceId(r.resourceId);
      if (parsed) {
        // vnet is 2 levels up in the ID chain — reconstruct
        const vnetName = r.name.split('/')[0];
        const vnetId = r.resourceId?.split('/subnets/')[0];
        const vnet = vnetId ? findByRef(lookup, vnetId) : lookup.byTypeName.get(`microsoft.network/virtualnetworks/${vnetName?.toLowerCase()}`);
        if (vnet) addEdge(r, vnet, REL.belongs_to);
      }
    }

    // ── Subnet references (NIC, PE, Bastion, AKS, App GW, Firewall) ─────
    const subnetId = props.subnet?.id || props.ipConfigurations?.[0]?.properties?.subnet?.id;
    if (subnetId) {
      const subnet = findByRef(lookup, subnetId);
      if (subnet) addEdge(r, subnet, REL.located_in);
    }

    // NIC ipConfigurations
    if (Array.isArray(props.ipConfigurations)) {
      for (const cfg of props.ipConfigurations) {
        const sId = cfg.properties?.subnet?.id;
        const pId = cfg.properties?.publicIPAddress?.id;
        if (sId) { const s = findByRef(lookup, sId); if (s) addEdge(r, s, REL.located_in); }
        if (pId) { const p = findByRef(lookup, pId); if (p) addEdge(p, r, REL.attached_to); }
      }
    }

    // ── NSG association ────────────────────────────────────────────────
    if (props.networkSecurityGroup?.id) {
      const nsg = findByRef(lookup, props.networkSecurityGroup.id);
      if (nsg) addEdge(nsg, r, REL.protected_by);
    }

    // ── Route Table ────────────────────────────────────────────────────
    if (props.routeTable?.id) {
      const rt = findByRef(lookup, props.routeTable.id);
      if (rt) addEdge(r, rt, REL.routes_via);
    }

    // ── VNet peering (subResource-style, best effort) ──────────────────
    if (Array.isArray(props.virtualNetworkPeerings)) {
      for (const peer of props.virtualNetworkPeerings) {
        const remoteId = peer.properties?.remoteVirtualNetwork?.id;
        if (remoteId) {
          const remote = findByRef(lookup, remoteId);
          if (remote) addEdge(r, remote, REL.peered_with);
        }
      }
    }

    // ── Load Balancer backend pools → NICs / VMs ────────────────────────
    if (type === 'microsoft.network/loadbalancers' && Array.isArray(props.backendAddressPools)) {
      for (const pool of props.backendAddressPools) {
        const backendIPs = pool.properties?.backendIPConfigurations || [];
        for (const ip of backendIPs) {
          if (ip.id) {
            // ip.id points at NIC/ipConfigurations/... → find owning NIC
            const nicId = ip.id.split('/ipConfigurations/')[0];
            const nic = findByRef(lookup, nicId);
            if (nic) addEdge(r, nic, REL.backs);
          }
        }
      }
    }

    // ── Application Gateway backend pools ──────────────────────────────
    if (type === 'microsoft.network/applicationgateways') {
      const pools = props.backendAddressPools || [];
      for (const pool of pools) {
        for (const addr of (pool.properties?.backendAddresses || [])) {
          if (addr.fqdn) {
            // FQDN backend — try to match against app services / static sites by name
            const name = addr.fqdn.split('.')[0]?.toLowerCase();
            const target = lookup.byName.get(name);
            if (target) addEdge(r, target, REL.targets, { inferred: true });
          }
        }
      }
    }

    // ── Private Endpoint → target service ──────────────────────────────
    if (type === 'microsoft.network/privateendpoints') {
      const connections = props.privateLinkServiceConnections || props.manualPrivateLinkServiceConnections || [];
      for (const conn of connections) {
        const targetId = conn.properties?.privateLinkServiceId;
        if (targetId) {
          const target = findByRef(lookup, targetId);
          if (target) addEdge(r, target, REL.connected_via);
        }
      }
    }

    // ── AKS network profile & node pools ───────────────────────────────
    if (type === 'microsoft.containerservice/managedclusters') {
      const netSubnet = props.networkProfile?.vnetSubnetId || props.agentPoolProfiles?.[0]?.vnetSubnetID;
      if (netSubnet) {
        const s = findByRef(lookup, netSubnet);
        if (s) addEdge(r, s, REL.located_in);
      }
    }

    // ── App Service → App Service Plan ─────────────────────────────────
    if (type === 'microsoft.web/sites' && props.serverFarmId) {
      const plan = findByRef(lookup, props.serverFarmId);
      if (plan) addEdge(r, plan, REL.uses);
    }

    // ── VM → NIC / Disk / OS Disk ──────────────────────────────────────
    if (type === 'microsoft.compute/virtualmachines') {
      const nics = props.networkProfile?.networkInterfaces || [];
      for (const nic of nics) {
        if (nic.id) {
          const n = findByRef(lookup, nic.id);
          if (n) addEdge(r, n, REL.uses);
        }
      }
      const osDisk = props.storageProfile?.osDisk?.managedDisk?.id;
      if (osDisk) {
        const d = findByRef(lookup, osDisk);
        if (d) addEdge(r, d, REL.uses);
      }
      for (const disk of (props.storageProfile?.dataDisks || [])) {
        if (disk.managedDisk?.id) {
          const d = findByRef(lookup, disk.managedDisk.id);
          if (d) addEdge(r, d, REL.uses);
        }
      }
      if (props.availabilitySet?.id) {
        const av = findByRef(lookup, props.availabilitySet.id);
        if (av) addEdge(r, av, REL.belongs_to);
      }
    }

    // ── VMSS → subnet (from networkProfile.networkInterfaceConfigurations) ──
    if (type === 'microsoft.compute/virtualmachinescalesets') {
      const cfgs = props.virtualMachineProfile?.networkProfile?.networkInterfaceConfigurations || [];
      for (const cfg of cfgs) {
        for (const ip of (cfg.properties?.ipConfigurations || [])) {
          const sId = ip.properties?.subnet?.id;
          if (sId) { const s = findByRef(lookup, sId); if (s) addEdge(r, s, REL.located_in); }
        }
      }
    }

    // ── Managed Identity references ────────────────────────────────────
    if (r.identity && r.identity.userAssignedIdentities) {
      for (const uaiId of Object.keys(r.identity.userAssignedIdentities)) {
        const mi = findByRef(lookup, uaiId);
        if (mi) addEdge(mi, r, REL.identity_of);
      }
    }

    // ── Private DNS zone links ─────────────────────────────────────────
    if (type === 'microsoft.network/privatednszones' && Array.isArray(props.virtualNetworkLinks)) {
      for (const link of props.virtualNetworkLinks) {
        const vnetId = link.properties?.virtualNetwork?.id;
        if (vnetId) {
          const v = findByRef(lookup, vnetId);
          if (v) addEdge(r, v, REL.linked_to);
        }
      }
    }

    // ── Firewall → VNet (via ipConfigurations.subnet) ──────────────────
    if (type === 'microsoft.network/azurefirewalls') {
      const ipCfgs = props.ipConfigurations || [];
      for (const cfg of ipCfgs) {
        const sId = cfg.properties?.subnet?.id;
        if (sId) { const s = findByRef(lookup, sId); if (s) addEdge(r, s, REL.located_in); }
      }
    }

    // ── Generic fallback: scan properties for any Azure resource id ────
    const refs = collectIdRefs(props);
    for (const ref of refs) {
      const target = findByRef(lookup, ref);
      if (target && target !== r) addEdge(r, target, REL.associated_with, { inferred: true });
    }
  }

  return edges;
}
