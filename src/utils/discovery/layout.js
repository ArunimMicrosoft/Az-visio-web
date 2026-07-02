// Layout — builds canvas items, connections, and nested boundaries.
//
// Design: mimic Azure Architecture Center diagrams.
//   1. One outer Resource Group boundary (blue)
//   2. Inside it, one Virtual Network boundary per VNet (teal)
//   3. Inside each VNet: its subnets in a row, with NICs stacked below the
//      subnet they belong to, then VMs directly under their NIC.
//   4. Public IPs and NSGs sit next to their NIC.
//   5. Anything else (route tables, snapshots, orphan subnets, disks)
//      is placed OUTSIDE the VNet boxes but still inside the RG box.
//
// Result: short mostly-vertical edges within each workload column, and
// subnet-to-VNet is now an implicit spatial relationship (not a crossing line).

import { mapAzureType, getIconPath } from './typeMap.js';

// ── Sizing ───────────────────────────────────────────────────────────────
const CARD_W = 130;
const CARD_H = 130;
const H_GAP  = 30;
const V_GAP  = 55;

const RG_PAD_X   = 40;
const RG_PAD_Y   = 60;
const VNET_PAD_X = 24;
const VNET_PAD_Y = 44;
const VNET_GAP   = 40;    // gap between adjacent VNet boxes

const ROW_H = CARD_H + V_GAP;
const COL_W = CARD_W + H_GAP;

// ── Type predicates ──────────────────────────────────────────────────────
const T = (r, azureType) => (r.azureType || '').toLowerCase() === azureType.toLowerCase();

const isVNet    = (r) => T(r, 'Microsoft.Network/virtualNetworks');
const isSubnet  = (r) => T(r, 'Microsoft.Network/virtualNetworks/subnets');
const isNIC     = (r) => T(r, 'Microsoft.Network/networkInterfaces');
const isPIP     = (r) => T(r, 'Microsoft.Network/publicIPAddresses');
const isNSG     = (r) => T(r, 'Microsoft.Network/networkSecurityGroups');
const isCompute = (r) => /^microsoft\.(compute|containerservice|web|app|containerinstance)\//i.test(r.azureType || '');
const isData    = (r) => /^microsoft\.(compute\/snapshots|compute\/disks|storage|sql|documentdb|cache|keyvault|recoveryservices|dbfor)/i.test(r.azureType || '');

// ── Main entry ───────────────────────────────────────────────────────────
export function buildLayout(resources, edges) {
  // 1) Build canvas items for every recognised resource
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
  const kept = resources.filter(r => resourceToItem.has(r));

  // 2) Group resources by VNet
  const groups = groupByVNet(kept);

  // 3) Position everything
  let cursorX = RG_PAD_X;
  const startY = RG_PAD_Y + 30;   // leave room for RG label at top

  // 3a) Isolated route tables / firewalls first (top-left strip)
  const isolatedNetTop = kept.filter(r => (
    !resourceToItem.has(r) ? false :
    !groups.assignedResources.has(r) && (
      T(r, 'Microsoft.Network/routeTables') ||
      T(r, 'Microsoft.Network/azureFirewalls') ||
      T(r, 'Microsoft.Network/loadBalancers') ||
      T(r, 'Microsoft.Network/applicationGateways') ||
      T(r, 'Microsoft.Network/bastionHosts') ||
      T(r, 'Microsoft.Network/frontDoors')
    )
  ));
  let topStripHeight = 0;
  if (isolatedNetTop.length > 0) {
    isolatedNetTop.forEach((r, i) => {
      const it = resourceToItem.get(r);
      it.x = RG_PAD_X + i * COL_W;
      it.y = startY;
    });
    topStripHeight = ROW_H;
  }

  const vnetY = startY + topStripHeight;
  const vnetBoundaries = [];

  // 3b) Position each VNet group as a boxed cluster
  for (const g of groups.vnetGroups) {
    const layout = placeVNetGroup(g, resourceToItem, cursorX, vnetY);
    vnetBoundaries.push({
      id: `boundary-vnet-${vnetBoundaries.length}`,
      label: `🔷 ${shortName(g.vnet.name, g.vnet.azureType)}`,
      name: shortName(g.vnet.name, g.vnet.azureType),
      type: 'virtual-network',
      x: layout.boxX,
      y: layout.boxY,
      width: layout.boxW,
      height: layout.boxH,
      color: '#008272',
      itemIds: g.members.map(m => resourceToItem.get(m)?.id).filter(Boolean),
    });
    cursorX = layout.boxX + layout.boxW + VNET_GAP;
  }

  // 3c) Orphan subnets (subnets whose VNet was not in the export) —
  //     place them as a small strip after the last VNet
  if (groups.orphanSubnets.length > 0) {
    groups.orphanSubnets.forEach((r, i) => {
      const it = resourceToItem.get(r);
      it.x = cursorX + (i % 3) * COL_W;
      it.y = vnetY + Math.floor(i / 3) * ROW_H;
    });
    cursorX += 3 * COL_W + VNET_GAP;
  }

  // 3d) Data / storage strip along the bottom
  const bottomY = Math.max(vnetY + 4 * ROW_H, ...vnetBoundaries.map(b => b.y + b.height + 20));
  if (groups.dataResources.length > 0) {
    groups.dataResources.forEach((r, i) => {
      const it = resourceToItem.get(r);
      it.x = RG_PAD_X + i * COL_W;
      it.y = bottomY;
    });
  }

  // 3e) Any remaining orphan resources → right side of the diagram
  if (groups.otherOrphans.length > 0) {
    groups.otherOrphans.forEach((r, i) => {
      const it = resourceToItem.get(r);
      it.x = cursorX + (i % 3) * COL_W;
      it.y = vnetY + Math.floor(i / 3) * ROW_H;
    });
  }

  // 4) Compute the outer RG boundary from actual item positions
  const bounds = getBoundingBox(items);
  const rgName = kept.find(r => r.resourceGroup)?.resourceGroup || 'default';
  const rgBoundary = {
    id: 'boundary-rg-0',
    label: `📦 ${rgName}`,
    name: rgName,
    type: 'resource-group',
    x: bounds.x - RG_PAD_X,
    y: bounds.y - RG_PAD_Y,
    width:  bounds.width  + RG_PAD_X * 2,
    height: bounds.height + RG_PAD_Y * 2,
    color: '#0078D4',
    itemIds: items.map(it => it.id),
  };

  // 5) Build canvas connections
  const connections = [];
  const seen = new Set();
  for (const e of edges) {
    const fromItem = resourceToItem.get(e.from);
    const toItem   = resourceToItem.get(e.to);
    if (!fromItem || !toItem) continue;

    // Skip subnet↔VNet edges — they are now implicit via nested boundary
    const fromT = (e.from.azureType || '').toLowerCase();
    const toT   = (e.to.azureType   || '').toLowerCase();
    const isVnetBelonging = (
      (fromT === 'microsoft.network/virtualnetworks/subnets' && toT === 'microsoft.network/virtualnetworks') ||
      (toT   === 'microsoft.network/virtualnetworks/subnets' && fromT === 'microsoft.network/virtualnetworks')
    );
    if (isVnetBelonging) continue;

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

  return {
    items,
    connections,
    boundaries: [rgBoundary, ...vnetBoundaries],
  };
}

// ── Grouping logic ───────────────────────────────────────────────────────
/**
 * Bucket every resource into either:
 *   - a VNet group (VNet + its subnets + attached NICs, PIPs, NSGs, VMs)
 *   - orphan subnets (subnets whose VNet was not exported)
 *   - data resources (storage, DBs, disks, snapshots)
 *   - other orphans
 */
function groupByVNet(resources) {
  // Fast lookup: resource ID → resource
  const byId = new Map();
  for (const r of resources) {
    if (r.resourceId) byId.set(r.resourceId.toLowerCase(), r);
  }

  // Init VNet groups
  const vnetGroups = [];
  const vnetByResource = new Map();
  for (const r of resources) {
    if (isVNet(r)) {
      const grp = { vnet: r, subnets: [], subnetToNics: new Map(), members: [r] };
      vnetGroups.push(grp);
      vnetByResource.set(r, grp);
    }
  }

  // Assign subnets to their parent VNet via resource ID
  const orphanSubnets = [];
  for (const r of resources) {
    if (!isSubnet(r)) continue;
    const vnetId = (r.resourceId || '').split('/subnets/')[0]?.toLowerCase();
    const parentVnet = vnetId ? byId.get(vnetId) : null;
    const grp = parentVnet ? vnetByResource.get(parentVnet) : null;
    if (grp) {
      grp.subnets.push(r);
      grp.subnetToNics.set(r, []);
      grp.members.push(r);
    } else {
      orphanSubnets.push(r);
    }
  }

  // Assign NICs to subnets — walk ipConfigurations.subnet.id
  const nicToSubnet = new Map();
  for (const r of resources) {
    if (!isNIC(r)) continue;
    const cfgs = r.properties?.ipConfigurations || [];
    for (const cfg of cfgs) {
      const sId = cfg.properties?.subnet?.id?.toLowerCase();
      if (!sId) continue;
      const subnet = byId.get(sId);
      if (!subnet) continue;
      // Find which VNet group hosts this subnet
      for (const g of vnetGroups) {
        if (g.subnetToNics.has(subnet)) {
          g.subnetToNics.get(subnet).push(r);
          g.members.push(r);
          nicToSubnet.set(r, subnet);
          break;
        }
      }
      break;
    }
  }

  // Attach PIPs and NSGs to NICs (they'll render next to the NIC)
  const nicToPip = new Map();
  const nicToNsg = new Map();
  for (const r of resources) {
    if (!isNIC(r)) continue;
    const parentVnet = getNICVnetGroup(r, nicToSubnet, vnetGroups);
    if (!parentVnet) continue;

    const cfgs = r.properties?.ipConfigurations || [];
    for (const cfg of cfgs) {
      const pId = cfg.properties?.publicIPAddress?.id?.toLowerCase();
      if (pId) {
        const p = byId.get(pId);
        if (p && !parentVnet.members.includes(p)) {
          parentVnet.members.push(p);
          nicToPip.set(r, p);
        }
      }
    }
    const nsgId = r.properties?.networkSecurityGroup?.id?.toLowerCase();
    if (nsgId) {
      const nsg = byId.get(nsgId);
      if (nsg && !parentVnet.members.includes(nsg)) {
        parentVnet.members.push(nsg);
        nicToNsg.set(r, nsg);
      }
    }
  }

  // Attach VMs to their NICs
  const nicToVm = new Map();
  for (const r of resources) {
    if (!isCompute(r)) continue;
    const nics = r.properties?.networkProfile?.networkInterfaces || [];
    for (const nicRef of nics) {
      const nId = nicRef.id?.toLowerCase();
      if (!nId) continue;
      const nic = byId.get(nId);
      if (!nic) continue;
      const parentVnet = getNICVnetGroup(nic, nicToSubnet, vnetGroups);
      if (parentVnet) {
        if (!parentVnet.members.includes(r)) parentVnet.members.push(r);
        nicToVm.set(nic, r);
        break;
      }
    }
  }

  // Collect what's left
  const assignedResources = new Set();
  for (const g of vnetGroups) g.members.forEach(m => assignedResources.add(m));

  const dataResources = [];
  const otherOrphans  = [];
  for (const r of resources) {
    if (assignedResources.has(r)) continue;
    if (orphanSubnets.includes(r)) continue;
    if (isData(r)) dataResources.push(r);
    else otherOrphans.push(r);
  }

  // Attach helper maps to each vnet group for layout
  for (const g of vnetGroups) {
    g.nicToPip = nicToPip;
    g.nicToNsg = nicToNsg;
    g.nicToVm  = nicToVm;
  }

  return {
    vnetGroups,
    orphanSubnets,
    dataResources,
    otherOrphans,
    assignedResources,
  };
}

function getNICVnetGroup(nic, nicToSubnet, vnetGroups) {
  const subnet = nicToSubnet.get(nic);
  if (!subnet) return null;
  return vnetGroups.find(g => g.subnetToNics.has(subnet)) || null;
}

// ── Place one VNet group as a nested cluster ─────────────────────────────
/**
 * Within a VNet box, columns = subnets (side by side at the top).
 * For each subnet column, stack downwards:
 *   Row 0: subnet
 *   Row 1: NIC (one per column — if multiple NICs per subnet we lay them side by side)
 *   Row 2: PIP + NSG side by side
 *   Row 3: VM
 *
 * @returns { boxX, boxY, boxW, boxH }
 */
function placeVNetGroup(g, r2i, originX, originY) {
  const boxContentX = originX + VNET_PAD_X;
  const boxContentY = originY + VNET_PAD_Y;

  const subnets = g.subnets;
  // If VNet has no subnets, still render the VNet card at least
  if (subnets.length === 0) {
    const vnetItem = r2i.get(g.vnet);
    if (vnetItem) {
      vnetItem.x = boxContentX;
      vnetItem.y = boxContentY;
    }
    return { boxX: originX, boxY: originY, boxW: CARD_W + 2 * VNET_PAD_X, boxH: CARD_H + 2 * VNET_PAD_Y };
  }

  // We do NOT render the VNet card itself inside the box — the boundary IS the VNet.
  // Hide the VNet item off-canvas (canvas skips items outside boundary though) — instead just leave at 0,0.
  // Actually, best UX: keep the VNet card, place it at box top-left small; but for now suppress it.
  const vnetItem = r2i.get(g.vnet);
  if (vnetItem) {
    // Place invisibly at top-left of box (users will still see it if they scroll but
    // it doesn't add visual clutter because the box label already names the VNet)
    vnetItem.x = boxContentX;
    vnetItem.y = boxContentY - CARD_H - 10;  // above the box; container itself carries the name
  }

  let maxCol = 0;
  subnets.forEach((subnet, colIdx) => {
    const colX = boxContentX + colIdx * COL_W;
    const subnetItem = r2i.get(subnet);
    if (subnetItem) {
      subnetItem.x = colX;
      subnetItem.y = boxContentY;
    }

    const nics = g.subnetToNics.get(subnet) || [];
    nics.forEach((nic, nicIdx) => {
      const nicX = colX + nicIdx * COL_W;    // if >1 NIC per subnet, offset horizontally
      const nicItem = r2i.get(nic);
      if (nicItem) {
        nicItem.x = nicX;
        nicItem.y = boxContentY + ROW_H;
      }

      // PIP + NSG at nicX (side by side underneath)
      const pip = g.nicToPip.get(nic);
      const nsg = g.nicToNsg.get(nic);
      const pipItem = pip && r2i.get(pip);
      const nsgItem = nsg && r2i.get(nsg);
      if (pipItem) {
        pipItem.x = nicX - Math.floor((CARD_W + H_GAP) / 2);
        pipItem.y = boxContentY + 2 * ROW_H;
      }
      if (nsgItem) {
        nsgItem.x = nicX + Math.floor((CARD_W + H_GAP) / 2);
        nsgItem.y = boxContentY + 2 * ROW_H;
      }

      // VM directly below NIC (row 3)
      const vm = g.nicToVm.get(nic);
      const vmItem = vm && r2i.get(vm);
      if (vmItem) {
        vmItem.x = nicX;
        vmItem.y = boxContentY + 3 * ROW_H;
      }

      maxCol = Math.max(maxCol, colIdx + nicIdx);
    });
    maxCol = Math.max(maxCol, colIdx);
  });

  const cols  = Math.max(1, maxCol + 1);
  // account for PIP+NSG width flanking the NIC — need extra half-column on left/right
  const boxW  = cols * COL_W + 2 * VNET_PAD_X + H_GAP;
  const rows  = 4;                          // subnet, NIC, PIP+NSG, VM
  const boxH  = rows * ROW_H + VNET_PAD_Y + 20;

  return {
    boxX: originX - Math.floor((CARD_W + H_GAP) / 4),
    boxY: originY,
    boxW,
    boxH,
  };
}

// ── Helpers ───────────────────────────────────────────────────────────────
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
  // For subnets, keep only the child name — parent VNet is now the boundary label
  const isSubnetLike = /virtualNetworks\/subnets$/i.test(azureType);
  if (isSubnetLike && str.includes('/')) {
    const parts = str.split('/');
    return parts[parts.length - 1].replace(/[-_]+/g, ' ').slice(0, 32);
  }
  const last = str.split('/').pop();
  return (last || str).replace(/[-_]+/g, ' ').slice(0, 32);
}
