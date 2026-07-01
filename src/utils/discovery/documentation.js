// Generates human-readable summaries for each architectural domain.

const T = (r, prefix) => (r.azureType || '').toLowerCase().startsWith(prefix.toLowerCase());
const inCat = (r, cat) => {
  const t = (r.azureType || '').toLowerCase();
  if (cat === 'networking')  return t.startsWith('microsoft.network/');
  if (cat === 'compute')     return t.startsWith('microsoft.compute/') || t.startsWith('microsoft.web/') || t.startsWith('microsoft.containerservice/') || t.startsWith('microsoft.app/') || t.startsWith('microsoft.containerinstance/');
  if (cat === 'storage')     return t.startsWith('microsoft.storage/') || t.includes('/disks') || t.startsWith('microsoft.netapp/') || t.startsWith('microsoft.datalakestore/');
  if (cat === 'databases')   return t.startsWith('microsoft.sql/') || t.startsWith('microsoft.documentdb/') || t.startsWith('microsoft.cache/') || t.startsWith('microsoft.dbfor');
  if (cat === 'security')    return t.startsWith('microsoft.keyvault/') || t.startsWith('microsoft.security/') || t.startsWith('microsoft.securityinsights/');
  if (cat === 'identity')    return t.startsWith('microsoft.managedidentity/') || t.startsWith('microsoft.authorization/');
  if (cat === 'monitoring')  return t.startsWith('microsoft.operationalinsights/') || t.startsWith('microsoft.insights/') || t.startsWith('microsoft.recoveryservices/') || t.startsWith('microsoft.dataprotection/');
  return false;
};

function count(resources, cat) {
  return resources.filter(r => inCat(r, cat)).length;
}

function names(resources, cat, max = 8) {
  const list = resources.filter(r => inCat(r, cat)).map(r => r.name);
  if (list.length > max) return list.slice(0, max).join(', ') + ` (+${list.length - max} more)`;
  return list.join(', ') || '—';
}

export function generateDocumentation(resources, edges, flows, scores, scope) {
  const rgSet = new Set(resources.map(r => r.resourceGroup).filter(Boolean));
  const locSet = new Set(resources.map(r => r.location).filter(l => l && l !== 'unknown'));

  const executive = [
    `Scope detected: **${scope}**`,
    `Total resources: **${resources.length}** across **${rgSet.size}** resource group(s), **${locSet.size}** region(s).`,
    `Overall WAF score: **${scores.overall}/100** (Security ${scores.security}, Reliability ${scores.reliability}, Cost ${scores.cost}, Performance ${scores.performance}, Operations ${scores.operations}).`,
    flows.length > 0 ? `Traffic flows discovered: **${flows.length}**.` : 'No end-to-end traffic flow could be inferred.',
    edges.length > 0 ? `Relationships mapped: **${edges.length}**.` : 'No cross-resource relationships were detectable.',
  ].join(' ');

  return {
    executive,
    architecture: `Architecture spans ${locSet.size || 1} region(s) — ${[...locSet].join(', ') || 'unspecified'}. Grouped into ${rgSet.size} resource group(s).`,
    networking:   `Networking resources: **${count(resources, 'networking')}** (${names(resources, 'networking')}).`,
    compute:      `Compute resources: **${count(resources, 'compute')}** (${names(resources, 'compute')}).`,
    storage:      `Storage resources: **${count(resources, 'storage')}** (${names(resources, 'storage')}).`,
    databases:    `Data platforms: **${count(resources, 'databases')}** (${names(resources, 'databases')}).`,
    security:     `Security controls: **${count(resources, 'security')}** (${names(resources, 'security')}).`,
    identity:     `Identity artifacts: **${count(resources, 'identity')}** (${names(resources, 'identity')}).`,
    monitoring:   `Monitoring & recovery: **${count(resources, 'monitoring')}** (${names(resources, 'monitoring')}).`,
    cost:         `Cost signals: ${resources.length} resources — apply tags (env, owner, cost-center) and review reservations/savings plans for compute + databases.`,
  };
}
