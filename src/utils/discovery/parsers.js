// Parses each supported format into a common internal resource shape:
//   { azureType, name, resourceId, location, resourceGroup, subscription,
//     properties, identity, tags, raw }

import { FORMAT } from './detectors.js';
import { parseTerraformFile } from '../terraformParser.js';

// ── ID utilities ─────────────────────────────────────────────────────────

/**
 * Parse an Azure resource ID like
 *   /subscriptions/{s}/resourceGroups/{rg}/providers/{ns}/{type}/{name}[/sub/{n}]
 * into { subscription, resourceGroup, providerNamespace, type, name }
 */
export function parseResourceId(id) {
  if (!id || typeof id !== 'string') return null;
  const parts = id.split('/').filter(Boolean);
  const result = { raw: id };
  for (let i = 0; i < parts.length; i++) {
    const key = parts[i].toLowerCase();
    if (key === 'subscriptions' && parts[i + 1]) result.subscription = parts[++i];
    else if (key === 'resourcegroups' && parts[i + 1]) result.resourceGroup = parts[++i];
    else if (key === 'providers' && parts[i + 1]) {
      result.providerNamespace = parts[++i];
      // remaining pairs are type/name/type/name/...
      const rest = parts.slice(i + 1);
      const typeParts = [];
      const nameParts = [];
      for (let j = 0; j < rest.length; j++) {
        if (j % 2 === 0) typeParts.push(rest[j]);
        else nameParts.push(rest[j]);
      }
      result.type = result.providerNamespace + '/' + typeParts.join('/');
      result.name = nameParts.join('/');
      break;
    }
  }
  return result;
}

// Normalize a raw resource object to internal shape.
function normalizeResource(raw, defaults = {}) {
  const id = raw.id || raw.resourceId || raw.ID || null;
  const parsed = id ? parseResourceId(id) : {};

  return {
    resourceId: id,
    azureType: raw.type || parsed.type || defaults.type,
    name: raw.name || parsed.name || defaults.name || 'unnamed',
    location: raw.location || defaults.location || 'unknown',
    resourceGroup: (raw.resourceGroup || raw.resourceGroupName || parsed.resourceGroup || defaults.resourceGroup || 'default').toLowerCase(),
    subscription: raw.subscriptionId || parsed.subscription || defaults.subscription || null,
    properties: raw.properties || {},
    identity: raw.identity || null,
    sku: raw.sku || null,
    tags: raw.tags || {},
    kind: raw.kind || null,
    raw,
  };
}

// ── ARM Template / ARM Export ────────────────────────────────────────────

function parseArm(json) {
  const resources = flattenArmResources(json.resources || [], []);
  return resources
    .map((r) => normalizeResource({
      id: r.id || `/arm/${r.type}/${r.name}`,
      type: r.type,
      name: (r.name || '').replace(/\[.*?\]/g, '').replace(/\'/g, '').trim() || 'unnamed',
      location: r.location,
      properties: r.properties || {},
      identity: r.identity || null,
      sku: r.sku || null,
      tags: r.tags || {},
      kind: r.kind || null,
    }))
    .filter(r => !!r.azureType);
}

// Recursively flatten ARM template resources — nested resources are children of parent
function flattenArmResources(list, parentPath) {
  const out = [];
  for (const r of list) {
    const type = r.type;
    if (!type) continue;
    // Compose full type for nested resources
    const fullType = parentPath.length > 0
      ? parentPath.map(p => p.type).join('/') + '/' + type
      : type;
    out.push({ ...r, type: fullType });
    if (Array.isArray(r.resources) && r.resources.length > 0) {
      out.push(...flattenArmResources(r.resources, [...parentPath, r]));
    }
  }
  return out;
}

// ── Resource Graph / Az CLI / Inventory / Value wrapper ──────────────────

function parseFlatArray(items) {
  if (!Array.isArray(items)) return [];
  return items
    .map(r => normalizeResource(r))
    .filter(r => !!r.azureType);
}

function parseResourceGraph(json) {
  const rows = Array.isArray(json) ? json : (json.data || json.value || []);
  return parseFlatArray(rows);
}

// ── PowerShell (Get-AzResource) ──────────────────────────────────────────

function parsePowerShell(json) {
  const arr = Array.isArray(json) ? json : (json.Resources || []);
  return arr.map(r => normalizeResource({
    id: r.ResourceId || r.Id || r.id,
    type: r.ResourceType || r.Type || r.type,
    name: r.Name || r.name,
    location: r.Location || r.location,
    resourceGroupName: r.ResourceGroupName || r.resourceGroupName,
    properties: r.Properties || r.properties || {},
    tags: r.Tags || r.tags || {},
    identity: r.Identity || r.identity || null,
    sku: r.Sku || r.sku || null,
  })).filter(r => !!r.azureType);
}

// ── Discovery .ccd format ────────────────────────────────────────────────

function parseCcd(json) {
  const disc = json.discovery || json;
  const list = disc.resources || disc.items || [];
  const defaults = {
    subscription: disc.subscriptionId || disc.subscription || null,
  };
  return list.map(r => normalizeResource(r, defaults)).filter(r => !!r.azureType);
}

// ── Terraform state (JSON) ───────────────────────────────────────────────

function parseTerraformState(json) {
  const results = [];
  const arr = json.resources || [];
  for (const res of arr) {
    if (res.mode !== 'managed') continue;
    const provider = (res.provider || '').includes('azurerm');
    if (!provider) continue;
    for (const inst of (res.instances || [])) {
      const attrs = inst.attributes || {};
      const azureType = tfToArmType(res.type);
      if (!azureType) continue;
      results.push(normalizeResource({
        id: attrs.id,
        type: azureType,
        name: attrs.name || res.name,
        location: attrs.location,
        resourceGroupName: attrs.resource_group_name,
        properties: attrs,
        tags: attrs.tags || {},
      }));
    }
  }
  return results.filter(r => !!r.azureType);
}

// Minimal Terraform provider type → ARM type mapping (for state files)
const TF_TO_ARM = {
  'azurerm_resource_group': 'Microsoft.Resources/resourceGroups',
  'azurerm_virtual_network': 'Microsoft.Network/virtualNetworks',
  'azurerm_subnet': 'Microsoft.Network/virtualNetworks/subnets',
  'azurerm_network_security_group': 'Microsoft.Network/networkSecurityGroups',
  'azurerm_public_ip': 'Microsoft.Network/publicIPAddresses',
  'azurerm_load_balancer': 'Microsoft.Network/loadBalancers',
  'azurerm_application_gateway': 'Microsoft.Network/applicationGateways',
  'azurerm_firewall': 'Microsoft.Network/azureFirewalls',
  'azurerm_network_interface': 'Microsoft.Network/networkInterfaces',
  'azurerm_route_table': 'Microsoft.Network/routeTables',
  'azurerm_bastion_host': 'Microsoft.Network/bastionHosts',
  'azurerm_nat_gateway': 'Microsoft.Network/natGateways',
  'azurerm_private_endpoint': 'Microsoft.Network/privateEndpoints',
  'azurerm_dns_zone': 'Microsoft.Network/dnszones',
  'azurerm_private_dns_zone': 'Microsoft.Network/privateDnsZones',
  'azurerm_virtual_network_gateway': 'Microsoft.Network/virtualNetworkGateways',
  'azurerm_frontdoor': 'Microsoft.Network/frontDoors',
  'azurerm_cdn_frontdoor_profile': 'Microsoft.Cdn/profiles',
  'azurerm_cdn_profile': 'Microsoft.Cdn/profiles',
  'azurerm_virtual_machine': 'Microsoft.Compute/virtualMachines',
  'azurerm_linux_virtual_machine': 'Microsoft.Compute/virtualMachines',
  'azurerm_windows_virtual_machine': 'Microsoft.Compute/virtualMachines',
  'azurerm_virtual_machine_scale_set': 'Microsoft.Compute/virtualMachineScaleSets',
  'azurerm_linux_virtual_machine_scale_set': 'Microsoft.Compute/virtualMachineScaleSets',
  'azurerm_windows_virtual_machine_scale_set': 'Microsoft.Compute/virtualMachineScaleSets',
  'azurerm_kubernetes_cluster': 'Microsoft.ContainerService/managedClusters',
  'azurerm_container_group': 'Microsoft.ContainerInstance/containerGroups',
  'azurerm_container_registry': 'Microsoft.ContainerRegistry/registries',
  'azurerm_app_service': 'Microsoft.Web/sites',
  'azurerm_linux_web_app': 'Microsoft.Web/sites',
  'azurerm_windows_web_app': 'Microsoft.Web/sites',
  'azurerm_function_app': 'Microsoft.Web/sites',
  'azurerm_service_plan': 'Microsoft.Web/serverfarms',
  'azurerm_app_service_plan': 'Microsoft.Web/serverfarms',
  'azurerm_storage_account': 'Microsoft.Storage/storageAccounts',
  'azurerm_sql_server': 'Microsoft.Sql/servers',
  'azurerm_mssql_server': 'Microsoft.Sql/servers',
  'azurerm_sql_database': 'Microsoft.Sql/servers/databases',
  'azurerm_mssql_database': 'Microsoft.Sql/servers/databases',
  'azurerm_cosmosdb_account': 'Microsoft.DocumentDB/databaseAccounts',
  'azurerm_redis_cache': 'Microsoft.Cache/redis',
  'azurerm_key_vault': 'Microsoft.KeyVault/vaults',
  'azurerm_log_analytics_workspace': 'Microsoft.OperationalInsights/workspaces',
  'azurerm_application_insights': 'Microsoft.Insights/components',
  'azurerm_recovery_services_vault': 'Microsoft.RecoveryServices/vaults',
  'azurerm_user_assigned_identity': 'Microsoft.ManagedIdentity/userAssignedIdentities',
};

const tfToArmType = (t) => TF_TO_ARM[t] || null;

// ── Bicep (best-effort) ──────────────────────────────────────────────────
// Simple regex parser for the common patterns. Full Bicep parsing is out of
// scope — this handles the shape most exports produce.
function parseBicep(text) {
  const results = [];
  const resRegex = /resource\s+(\w+)\s+'([^@]+)@[^']+'\s+=\s+/g;
  let match;
  while ((match = resRegex.exec(text)) !== null) {
    const varName = match[1];
    const azureType = match[2];
    // Extract following {...} block
    const bodyStart = text.indexOf('{', resRegex.lastIndex);
    if (bodyStart === -1) continue;
    const bodyEnd = matchBrace(text, bodyStart);
    const body = text.slice(bodyStart + 1, bodyEnd);

    const nameMatch = body.match(/\bname:\s*'([^']+)'/) || body.match(/\bname:\s*"([^"]+)"/);
    const locMatch = body.match(/\blocation:\s*'([^']+)'/) || body.match(/\blocation:\s*"([^"]+)"/);
    results.push(normalizeResource({
      id: `/bicep/${azureType}/${varName}`,
      type: azureType,
      name: nameMatch ? nameMatch[1] : varName,
      location: locMatch ? locMatch[1] : 'unknown',
      properties: {},
    }));
  }
  return results;
}

function matchBrace(str, startIdx) {
  let depth = 0;
  for (let i = startIdx; i < str.length; i++) {
    if (str[i] === '{') depth++;
    else if (str[i] === '}') { depth--; if (depth === 0) return i; }
  }
  return str.length - 1;
}

// ── Terraform HCL — delegate to existing parser via re-mapping ──────────
// We convert TF parser items back into internal shape.
function parseTerraformHcl(text) {
  const result = parseTerraformFile(text, 'main.tf');
  return result.items.map(item => {
    const azureType = tfToArmType(item.metadata?.terraformType) || 'Microsoft.Resources/deployments';
    return normalizeResource({
      id: `/terraform/${item.metadata?.terraformType}/${item.metadata?.terraformName || item.id}`,
      type: azureType,
      name: item.name || item.label,
      location: 'unknown',
      resourceGroupName: item.metadata?.rgRef || 'default',
      properties: {},
    });
  }).filter(r => !!r.azureType);
}

// ── Single resource ─────────────────────────────────────────────────────

function parseSingle(json) {
  return [normalizeResource(json)].filter(r => !!r.azureType);
}

// ── Master dispatcher ────────────────────────────────────────────────────

export async function parseByFormat(format, rawText) {
  const parsed = tryJson(rawText);

  switch (format) {
    case FORMAT.ARM_TEMPLATE:
    case FORMAT.ARM_EXPORT:
      return parseArm(parsed || {});

    case FORMAT.RESOURCE_GRAPH:
      return parseResourceGraph(parsed || []);

    case FORMAT.AZURE_CLI:
    case FORMAT.RESOURCE_INVENTORY: {
      const arr = Array.isArray(parsed) ? parsed : (parsed?.value || parsed?.data || []);
      return parseFlatArray(arr);
    }

    case FORMAT.POWERSHELL:
      return parsePowerShell(parsed || []);

    case FORMAT.DISCOVERY_CCD:
      return parseCcd(parsed || {});

    case FORMAT.TERRAFORM_STATE:
      return parseTerraformState(parsed || {});

    case FORMAT.TERRAFORM:
      // If JSON, treat as .tf.json
      if (parsed && parsed.resource) return parseTerraformHcl(rawText);
      return parseTerraformHcl(rawText);

    case FORMAT.BICEP:
      return parseBicep(rawText);

    case FORMAT.SINGLE_RESOURCE:
      return parseSingle(parsed || {});

    default:
      // Try to auto-recover: if it's an array, treat as inventory
      if (Array.isArray(parsed)) return parseFlatArray(parsed);
      if (parsed && Array.isArray(parsed.value)) return parseFlatArray(parsed.value);
      return [];
  }
}

function tryJson(text) {
  try { return JSON.parse(text); } catch { return null; }
}
