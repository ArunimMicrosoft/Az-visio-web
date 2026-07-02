// Parses each supported format into a common internal resource shape:
//   { azureType, name, resourceId, location, resourceGroup, subscription,
//     properties, identity, tags, raw }

import { FORMAT } from './detectors.js';
import { createEvaluator, synthesizeResourceId, ARM_PLACEHOLDERS } from './armExpressions.js';
import { mapAzureType } from './typeMap.js';
import { terraformHclToArmResources } from './tfEnricher.js';

// Drop resources that aren't recognized architectural nodes (child rules,
// diagnostic settings, extensions, etc. → represented by parent or edges).
function keepArchitectural(resources) {
  return resources.filter(r => !!mapAzureType(r.azureType));
}

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

// Detect the Resource Group name from ARM template parameters — many exports
// embed cross-resource references as full ARM IDs (e.g. externalid parameters)
// which contain `/resourceGroups/<name>/`. Falls back to placeholder.
function detectArmResourceGroup(json) {
  const params = json?.parameters || {};
  for (const p of Object.values(params)) {
    const v = p?.defaultValue;
    if (typeof v === 'string') {
      const m = v.match(/\/resourceGroups\/([^/]+)\//i);
      if (m) return m[1];
    }
  }
  return ARM_PLACEHOLDERS.resourceGroup;
}

// ── ARM Template / ARM Export ────────────────────────────────────────────

function parseArm(json) {
  const detectedRg = detectArmResourceGroup(json);
  const evaluator = createEvaluator(json, { resourceGroup: detectedRg });

  const evalOne = (r) => ({
    ...r,
    name:      evaluator.evalString(r.name),
    location:  evaluator.evalString(r.location || ''),
    properties: evaluator.eval(r.properties || {}),
    identity:  evaluator.eval(r.identity || null),
    sku:       r.sku ? evaluator.eval(r.sku) : null,
    tags:      r.tags ? evaluator.eval(r.tags) : {},
  });

  // Step 1 — flatten nested `resources` into single list, evaluate ARM expressions
  const rawFlat = flattenArmResources(json.resources || [], []);
  const evaluatedTopLevel = rawFlat.map(evalOne);

  // Step 2 — extract inline sub-resources (subnets inside VNets, etc.). Parent
  // names are now RESOLVED so child paths are clean strings.
  const inline = [];
  for (const r of evaluatedTopLevel) inline.push(...extractInlineChildren(r));
  const evaluatedInline = inline.map(evalOne);

  const combined = evaluatedTopLevel.concat(evaluatedInline);

  // Step 3 — normalize + synthesize proper ARM resource IDs
  const normalized = combined.map(r => {
    const id = synthesizeResourceId(r.type, r.name, detectedRg);
    return normalizeResource({
      id,
      type: r.type,
      name: r.name || 'unnamed',
      location: r.location || 'unknown',
      resourceGroupName: detectedRg,
      subscriptionId: ARM_PLACEHOLDERS.subscription,
      properties: r.properties,
      identity: r.identity,
      sku: r.sku,
      tags: r.tags,
      kind: r.kind,
    });
  }).filter(r => !!r.azureType);

  // Step 4 — dedupe by resourceId (inline subnet + top-level subnet declaration)
  const byId = new Map();
  for (const r of normalized) {
    const key = (r.resourceId || '').toLowerCase();
    if (!key) continue;
    const existing = byId.get(key);
    if (!existing) byId.set(key, r);
    else if (Object.keys(r.properties || {}).length > Object.keys(existing.properties || {}).length) {
      byId.set(key, r);
    }
  }

  return [...byId.values()];
}

// Recursively flatten ARM `resources` — nested resources are children of parent.
// Composes full type (parent/type/child) and full name (parentName/childName).
function flattenArmResources(list, parentPath) {
  const out = [];
  for (const r of list) {
    if (!r || !r.type) continue;

    let fullType = r.type;
    let fullName = r.name || '';
    if (parentPath.length > 0) {
      // Child of nested resource — prepend parent type & name segments
      const parentTypes = parentPath.map(p => p.type);
      const parentNames = parentPath.map(p => p.name);
      // Parent type may already be a compound (e.g., "Microsoft.Network/virtualNetworks")
      // Concat with child's simple type
      fullType = parentTypes[0] + '/' + parentTypes.slice(1).map(t => tailSegment(t)).concat(r.type).join('/');
      fullName = parentNames.join('/') + '/' + r.name;
    }

    out.push({ ...r, type: fullType, name: fullName });

    if (Array.isArray(r.resources) && r.resources.length > 0) {
      out.push(...flattenArmResources(r.resources, [...parentPath, { type: fullType, name: fullName }]));
    }
  }
  return out;
}

function tailSegment(compoundType) {
  const parts = compoundType.split('/');
  return parts[parts.length - 1];
}

// Extract inline sub-resources declared inside a parent's `properties` array,
// e.g. VNet.properties.subnets[] → separate `Microsoft.Network/virtualNetworks/subnets`
// resources. Ensures every architectural component becomes its own node.
function extractInlineChildren(parent) {
  const out = [];
  const type = (parent.type || '').toLowerCase();
  const props = parent.properties || {};

  const emit = (childType, childArray, propKey = 'properties') => {
    if (!Array.isArray(childArray)) return;
    for (const child of childArray) {
      if (!child || !child.name) continue;
      out.push({
        type: `${parent.type}/${childType}`,
        name: `${parent.name}/${child.name}`,
        location: parent.location,
        properties: child[propKey] || child.properties || {},
      });
    }
  };

  // Only subnets become architectural nodes. Peerings, rules, routes stay as
  // properties on the parent and are surfaced through discovered edges.
  if (type === 'microsoft.network/virtualnetworks') {
    emit('subnets', props.subnets);
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

      // TF state IDs are real Azure resource IDs. Convert TF attributes into
      // ARM-style properties so relationship inference picks them up.
      const properties = tfAttrsToArmProperties(res.type, attrs);

      results.push(normalizeResource({
        id: attrs.id,
        type: azureType,
        name: attrs.name || res.name,
        location: attrs.location,
        resourceGroupName: attrs.resource_group_name,
        properties,
        tags: attrs.tags || {},
      }));
    }
  }
  return results.filter(r => !!r.azureType);
}

// Terraform state attributes → ARM-style properties. Only maps the fields
// the relationship engine needs (subnet, NSG, route table, PIP, NIC IDs).
function tfAttrsToArmProperties(tfType, attrs) {
  const props = {};

  if (tfType === 'azurerm_network_interface') {
    if (attrs.network_security_group_id) props.networkSecurityGroup = { id: attrs.network_security_group_id };
    if (Array.isArray(attrs.ip_configuration)) {
      props.ipConfigurations = attrs.ip_configuration.map((c, i) => ({
        name: c.name || `ipconfig${i + 1}`,
        properties: {
          ...(c.subnet_id && { subnet: { id: c.subnet_id } }),
          ...(c.public_ip_address_id && { publicIPAddress: { id: c.public_ip_address_id } }),
          ...(c.private_ip_address && { privateIPAddress: c.private_ip_address }),
        },
      }));
    }
  }

  if (tfType === 'azurerm_subnet') {
    if (attrs.network_security_group_id) props.networkSecurityGroup = { id: attrs.network_security_group_id };
    if (attrs.route_table_id) props.routeTable = { id: attrs.route_table_id };
    if (attrs.address_prefixes) props.addressPrefixes = attrs.address_prefixes;
  }

  if (['azurerm_linux_virtual_machine', 'azurerm_windows_virtual_machine', 'azurerm_virtual_machine'].includes(tfType)) {
    if (Array.isArray(attrs.network_interface_ids)) {
      props.networkProfile = {
        networkInterfaces: attrs.network_interface_ids.map(id => ({ id })),
      };
    }
    if (attrs.size || attrs.vm_size) props.hardwareProfile = { vmSize: attrs.size || attrs.vm_size };
  }

  if (tfType === 'azurerm_kubernetes_cluster' && Array.isArray(attrs.default_node_pool)) {
    const dnp = attrs.default_node_pool[0] || {};
    if (dnp.vnet_subnet_id) props.networkProfile = { vnetSubnetId: dnp.vnet_subnet_id };
  }

  if (['azurerm_linux_web_app', 'azurerm_windows_web_app', 'azurerm_app_service', 'azurerm_function_app'].includes(tfType)) {
    const planId = attrs.service_plan_id || attrs.app_service_plan_id;
    if (planId) props.serverFarmId = planId;
  }

  if (tfType === 'azurerm_virtual_network_peering' && attrs.remote_virtual_network_id) {
    props.remoteVirtualNetwork = { id: attrs.remote_virtual_network_id };
  }

  if (tfType === 'azurerm_private_endpoint') {
    if (attrs.subnet_id) props.subnet = { id: attrs.subnet_id };
    if (Array.isArray(attrs.private_service_connection)) {
      const psc = attrs.private_service_connection[0];
      if (psc?.private_connection_resource_id) {
        props.privateLinkServiceConnections = [{ properties: { privateLinkServiceId: psc.private_connection_resource_id } }];
      }
    }
  }

  return props;
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
// Bicep syntax is close to ARM JSON — object literals with property refs like
// `subnet: { id: parentVnet::subnetDefault.id }` or `nic.id`. We extract the
// same relationship-critical property paths as ARM so the layout works.
function parseBicep(text) {
  const results = [];
  const varToName = new Map();     // Bicep symbol → resolved name
  const varToType = new Map();     // Bicep symbol → ARM type
  const bodies    = new Map();     // Bicep symbol → body text

  // Pass 1: split resource declarations and remember each one's name + type
  const resRegex = /resource\s+(\w+)\s+'([^@]+)@[^']+'\s+=\s*(?:if\s*\([^)]*\)\s*)?/g;
  let match;
  while ((match = resRegex.exec(text)) !== null) {
    const symbol = match[1];
    const azureType = match[2];
    const bodyStart = text.indexOf('{', resRegex.lastIndex);
    if (bodyStart === -1) continue;
    const bodyEnd = matchBrace(text, bodyStart);
    const body = text.slice(bodyStart + 1, bodyEnd);

    const nameMatch = body.match(/\bname:\s*'([^']+)'/) || body.match(/\bname:\s*"([^"]+)"/);
    // Bicep names sometimes reference parameters — fall back to symbol
    const resolvedName = nameMatch ? nameMatch[1].replace(/\$\{[^}]+\}/g, '') : symbol;

    varToName.set(symbol, resolvedName);
    varToType.set(symbol, azureType);
    bodies.set(symbol, body);
  }

  // Helper: convert a Bicep reference like `nic.id` or `subnet.id` to an ARM ID
  const RG = 'bicep';
  const SUB_ID = '00000000-0000-0000-0000-000000000000';
  const symbolToArmId = (sym) => {
    const t = varToType.get(sym);
    if (!t) return null;
    return synthesizeResourceId(t, varToName.get(sym) || sym, RG, SUB_ID);
  };

  // Pass 2: extract properties per resource
  for (const [symbol, body] of bodies.entries()) {
    const azureType = varToType.get(symbol);
    const resolvedName = varToName.get(symbol);

    const properties = {};

    // subnet: { id: subnetVar.id }  — used by NICs, private endpoints, etc.
    const subM = body.match(/\bsubnet\s*:\s*\{[^}]*\bid\s*:\s*(\w+)\.id/);
    if (subM) {
      const id = symbolToArmId(subM[1]);
      if (id) properties.subnet = { id };
    }

    // networkSecurityGroup: { id: nsgVar.id }
    const nsgM = body.match(/\bnetworkSecurityGroup\s*:\s*\{[^}]*\bid\s*:\s*(\w+)\.id/);
    if (nsgM) {
      const id = symbolToArmId(nsgM[1]);
      if (id) properties.networkSecurityGroup = { id };
    }

    // routeTable: { id: routeTableVar.id }
    const rtM = body.match(/\brouteTable\s*:\s*\{[^}]*\bid\s*:\s*(\w+)\.id/);
    if (rtM) {
      const id = symbolToArmId(rtM[1]);
      if (id) properties.routeTable = { id };
    }

    // publicIPAddress: { id: pipVar.id }
    const pipM = body.match(/\bpublicIPAddress\s*:\s*\{[^}]*\bid\s*:\s*(\w+)\.id/);
    if (pipM) {
      const id = symbolToArmId(pipM[1]);
      if (id) properties.publicIPAddress = { id };
    }

    // ipConfigurations: [{ properties: { subnet: {id}, publicIPAddress: {id} } }]
    // Handle NICs — collect every ipConfig subnet + PIP ref
    if (/ipConfigurations\s*:/i.test(body)) {
      const cfgSubs = [...body.matchAll(/\bsubnet\s*:\s*\{[^}]*\bid\s*:\s*(\w+)\.id/g)];
      const cfgPips = [...body.matchAll(/\bpublicIPAddress\s*:\s*\{[^}]*\bid\s*:\s*(\w+)\.id/g)];
      const first = cfgSubs[0]?.[1];
      const firstPip = cfgPips[0]?.[1];
      const cfg = { name: 'ipconfig1', properties: {} };
      if (first)    cfg.properties.subnet          = { id: symbolToArmId(first) };
      if (firstPip) cfg.properties.publicIPAddress = { id: symbolToArmId(firstPip) };
      if (cfg.properties.subnet || cfg.properties.publicIPAddress) {
        properties.ipConfigurations = [cfg];
      }
    }

    // networkInterfaces: [{ id: nicVar.id }]  — used by VMs
    const nicIds = [...body.matchAll(/\bnetworkInterfaces\s*:\s*\[[\s\S]*?\bid\s*:\s*(\w+)\.id/g)];
    if (nicIds.length > 0) {
      properties.networkProfile = {
        networkInterfaces: nicIds.map(m => ({ id: symbolToArmId(m[1]) })).filter(x => !!x.id),
      };
    }

    // serverFarmId: appPlanVar.id  — App Service → ASP
    const spM = body.match(/\bserverFarmId\s*:\s*(\w+)\.id/);
    if (spM) {
      const id = symbolToArmId(spM[1]);
      if (id) properties.serverFarmId = id;
    }

    // Location
    const locMatch = body.match(/\blocation\s*:\s*'([^']+)'/);
    const location = locMatch ? locMatch[1] : 'unknown';

    results.push(normalizeResource({
      id: synthesizeResourceId(azureType, resolvedName, RG, SUB_ID),
      type: azureType,
      name: resolvedName,
      location,
      resourceGroupName: RG,
      subscriptionId: SUB_ID,
      properties,
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

// ── Terraform HCL — convert to ARM shape first, then normalize ──────────
// The enricher extracts property references (subnet_id, network_interface_ids,
// route_table_id, etc.) into an ARM-style properties tree so the same
// relationship inference used for ARM works for Terraform too.
function parseTerraformHcl(text) {
  // Detect resource-group name from any azurerm_resource_group in the HCL
  const rgMatch = text.match(/resource\s+"azurerm_resource_group"\s+"[^"]+"\s*\{[\s\S]*?\bname\s*=\s*"([^"]+)"/);
  const rgName = rgMatch ? rgMatch[1] : 'terraform';

  const armLike = terraformHclToArmResources(text, rgName);
  return armLike.map(r => normalizeResource(r)).filter(r => !!r.azureType);
}

// ── Single resource ─────────────────────────────────────────────────────

function parseSingle(json) {
  return [normalizeResource(json)].filter(r => !!r.azureType);
}

// ── Master dispatcher ────────────────────────────────────────────────────

export async function parseByFormat(format, rawText) {
  const parsed = tryJson(rawText);
  const results = await parseByFormatInternal(format, rawText, parsed);
  return keepArchitectural(results);
}

async function parseByFormatInternal(format, rawText, parsed) {
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
