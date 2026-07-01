// Detects the format of an uploaded Azure infrastructure export.

export const FORMAT = {
  ARM_TEMPLATE:       'arm-template',
  ARM_EXPORT:         'arm-export',
  BICEP:              'bicep',
  TERRAFORM:          'terraform',
  TERRAFORM_STATE:    'terraform-state',
  RESOURCE_GRAPH:     'resource-graph',
  AZURE_CLI:          'azure-cli',
  POWERSHELL:         'powershell',
  DISCOVERY_CCD:      'discovery-ccd',
  RESOURCE_INVENTORY: 'inventory',
  SINGLE_RESOURCE:    'single-resource',
  UNKNOWN:            'unknown',
};

export const SCOPE = {
  SUBSCRIPTION:     'subscription',
  MANAGEMENT_GROUP: 'management-group',
  RESOURCE_GROUP:   'resource-group',
  SINGLE_RESOURCE:  'single-resource',
  MIXED:            'mixed',
  NETWORKING:       'networking',
  AKS:              'aks',
  LANDING_ZONE:     'landing-zone',
};

/**
 * Given raw file text (and optional filename), detect the format.
 */
export function detectFormat(rawText, filename = '') {
  const text = (rawText || '').trim();
  const lower = filename.toLowerCase();

  // Extension-based hints first
  if (lower.endsWith('.bicep')) return FORMAT.BICEP;
  if (lower.endsWith('.tf'))    return FORMAT.TERRAFORM;
  if (lower.endsWith('.tfstate')) return FORMAT.TERRAFORM_STATE;
  if (lower.endsWith('.ccd'))   return FORMAT.DISCOVERY_CCD;

  // Detect Bicep by content (no braces at top-level, `resource ... = {`)
  if (/^resource\s+[\w]+\s+'/m.test(text) && !text.startsWith('{')) return FORMAT.BICEP;

  // Terraform HCL
  if (/^resource\s+"azurerm_/m.test(text) || /^provider\s+"azurerm"/m.test(text)) return FORMAT.TERRAFORM;

  // JSON-based: parse and dispatch
  if (text.startsWith('{') || text.startsWith('[')) {
    let json;
    try { json = JSON.parse(text); } catch { return FORMAT.UNKNOWN; }

    // Array root — Az CLI, Resource Graph, or inventory
    if (Array.isArray(json)) {
      if (json.length === 0) return FORMAT.RESOURCE_INVENTORY;
      const first = json[0];
      // Resource Graph rows have `id`, `type`, `location`, `resourceGroup`, `subscriptionId`
      if (first && first.id && first.type && first.subscriptionId) return FORMAT.RESOURCE_GRAPH;
      // Az CLI `az resource list` — has `id`, `type`, `name`, `location`, `resourceGroup`
      if (first && first.id && first.type && first.name) return FORMAT.AZURE_CLI;
      return FORMAT.RESOURCE_INVENTORY;
    }

    // Object root
    if (json.$schema && /deploymentTemplate/i.test(json.$schema)) return FORMAT.ARM_TEMPLATE;
    if (json.resources && Array.isArray(json.resources) && json.$schema) return FORMAT.ARM_TEMPLATE;
    if (json.resources && Array.isArray(json.resources) && !json.$schema) {
      // ARM export from portal is same shape without $schema always
      return FORMAT.ARM_EXPORT;
    }

    // Terraform state
    if (json.version && json.terraform_version && Array.isArray(json.resources)) return FORMAT.TERRAFORM_STATE;

    // Terraform .tf.json
    if (json.resource && typeof json.resource === 'object') return FORMAT.TERRAFORM;

    // Discovery .ccd — expects `{ discovery: { subscription, resources: [] } }`
    if (json.discovery || json.ccdVersion) return FORMAT.DISCOVERY_CCD;

    // Resource Graph result — sometimes wrapped `{ data: [...] }`
    if (Array.isArray(json.data)) return FORMAT.RESOURCE_GRAPH;

    // Value wrapper — `{ value: [...] }` (ARM REST list)
    if (Array.isArray(json.value)) return FORMAT.RESOURCE_INVENTORY;

    // Single resource — has id/type/name at root
    if (json.id && json.type && json.name) return FORMAT.SINGLE_RESOURCE;
  }

  return FORMAT.UNKNOWN;
}

/**
 * Infer the architectural scope from a list of normalized resources.
 */
export function detectScope(resources) {
  if (!resources || resources.length === 0) return SCOPE.SINGLE_RESOURCE;
  if (resources.length === 1) return SCOPE.SINGLE_RESOURCE;

  const subs = new Set(resources.map(r => r.subscription).filter(Boolean));
  const rgs  = new Set(resources.map(r => r.resourceGroup).filter(Boolean));
  const cats = new Set(resources.map(r => r.category));

  const hasNetworking = cats.has('networking');
  const onlyNetworking = cats.size === 1 && hasNetworking;
  const hasAKS = resources.some(r => r.azureType?.startsWith('Microsoft.ContainerService/'));

  // AKS-heavy
  if (hasAKS && resources.length < 25) return SCOPE.AKS;

  // Purely networking
  if (onlyNetworking) return SCOPE.NETWORKING;

  // Landing zone signals: multiple RGs, mgmt groups, hub-spoke naming
  const hasMgmtGroup = resources.some(r => r.azureType === 'Microsoft.Management/managementGroups');
  const hasHubSpoke  = resources.some(r => /hub|spoke|connectivity|identity|management/i.test(r.resourceGroup || ''));
  if (hasMgmtGroup || (rgs.size >= 3 && hasHubSpoke)) return SCOPE.LANDING_ZONE;

  if (subs.size > 1) return SCOPE.MIXED;
  if (rgs.size === 1) return SCOPE.RESOURCE_GROUP;
  return SCOPE.SUBSCRIPTION;
}
