// Builds canvas-ready nodes, edges, and container boundaries from normalized
// resources + discovered relationships. Tier-based top-down layout.

import { mapAzureType, getIconPath } from './typeMap.js';

const CARD_W = 130;
const CARD_H = 130;
const H_GAP  = 40;
const V_GAP  = 60;

const RG_PAD_X = 40;
const RG_PAD_Y = 60;

// Which tiers stack top-to-bottom
const TIER_ORDER = [0, 1, 2, 3, 4, 5];

/**
 * Convert internal resources → canvas items + connections + boundaries.
 *
 * @returns { items, connections, boundaries, containers }
 */
export function buildLayout(resources, edges) {
  // Assign canvas metadata to each resource
  const items = [];
  const resourceToItem = new Map();

  resources.forEach((r, idx) => {
    const meta = mapAzureType(r.azureType);
    if (!meta) return; // silently drop — engine already filtered, but stay safe
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

  // Group items by resource group (containers)
  const rgGroups = new Map();
  for (let i = 0; i < resources.length; i++) {
    const r = resources[i];
    const rg = r.resourceGroup || 'default';
    if (!rgGroups.has(rg)) rgGroups.set(rg, []);
    rgGroups.get(rg).push({ resource: r, item: items[i] });
  }

  // Layout: for each RG, arrange members by tier (rows) and index within tier (cols).
  const boundaries = [];
  const containerHGap = 60;
  const containerVGap = 40;

  let cursorX = 40;
  const startY = 40;
  let maxHeight = 0;

  const rgList = [...rgGroups.entries()].sort((a, b) => a[0].localeCompare(b[0]));

  for (const [rgName, members] of rgList) {
    // Bucket by tier
    const tierBuckets = new Map();
    for (const m of members) {
      const t = m.item.metadata.tier ?? 2;
      if (!tierBuckets.has(t)) tierBuckets.set(t, []);
      tierBuckets.get(t).push(m);
    }

    // Determine max columns in any tier
    const maxCols = Math.max(1, ...[...tierBuckets.values()].map(b => Math.min(6, b.length)));
    const boxInnerW = maxCols * (CARD_W + H_GAP) - H_GAP;
    let rowY = startY + RG_PAD_Y;

    for (const tier of TIER_ORDER) {
      const bucket = tierBuckets.get(tier);
      if (!bucket || bucket.length === 0) continue;
      // Sort within tier for stable output
      bucket.sort((a, b) => (a.item.name || '').localeCompare(b.item.name || ''));
      const cols = Math.min(6, bucket.length);
      bucket.forEach((m, idx) => {
        const col = idx % cols;
        const row = Math.floor(idx / cols);
        m.item.x = cursorX + RG_PAD_X + col * (CARD_W + H_GAP);
        m.item.y = rowY + row * (CARD_H + V_GAP);
      });
      const rowsUsed = Math.ceil(bucket.length / cols);
      rowY += rowsUsed * (CARD_H + V_GAP);
    }

    // Boundary box size
    const boxHeight = rowY - startY + RG_PAD_Y * 0.4;
    boundaries.push({
      id: `boundary-rg-${boundaries.length}`,
      // Canvas reads `label` for the displayed text and `name` for internal use.
      // Provide both so it works everywhere.
      label: `📦 ${rgName}`,
      name: rgName,
      type: 'resource-group',
      x: cursorX,
      y: startY,
      width: boxInnerW + RG_PAD_X * 2,
      height: boxHeight,
      color: '#0078D4',
      itemIds: members.map(m => m.item.id),
    });

    cursorX += boxInnerW + RG_PAD_X * 2 + containerHGap;
    maxHeight = Math.max(maxHeight, boxHeight);
  }

  // Build canvas connections
  const connections = [];
  const connectionSet = new Set();
  for (const e of edges) {
    const fromItem = resourceToItem.get(e.from);
    const toItem   = resourceToItem.get(e.to);
    if (!fromItem || !toItem) continue;
    const key = `${fromItem.id}→${toItem.id}`;
    if (connectionSet.has(key)) continue;
    connectionSet.add(key);
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

function shortName(name = '', azureType = '') {
  if (!name) return 'Resource';
  let str = String(name);
  // If eval failed, try to extract a readable name from an ARM expression.
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

  // For other nested names, keep the last segment for display
  const last = str.split('/').pop();
  return (last || str).replace(/[-_]+/g, ' ').slice(0, 32);
}
