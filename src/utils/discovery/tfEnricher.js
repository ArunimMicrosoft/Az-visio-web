// Terraform HCL → ARM-shaped resources.
// Extracts the property references the discovery engine needs (subnet_id,
// public_ip_address_id, network_security_group_id, network_interface_ids,
// route_table_id, virtual_network_peering) and rewrites them as Azure ARM
// `properties.*.id` fields. That way the same relationship inference that
// works for ARM/Bicep also works for Terraform without special-casing.

import { synthesizeResourceId } from './armExpressions.js';

// Map from Terraform provider type → ARM type
const TF_TO_ARM = {
  azurerm_resource_group:                'Microsoft.Resources/resourceGroups',
  azurerm_virtual_network:               'Microsoft.Network/virtualNetworks',
  azurerm_subnet:                        'Microsoft.Network/virtualNetworks/subnets',
  azurerm_network_security_group:        'Microsoft.Network/networkSecurityGroups',
  azurerm_public_ip:                     'Microsoft.Network/publicIPAddresses',
  azurerm_network_interface:             'Microsoft.Network/networkInterfaces',
  azurerm_route_table:                   'Microsoft.Network/routeTables',
  azurerm_load_balancer:                 'Microsoft.Network/loadBalancers',
  azurerm_application_gateway:           'Microsoft.Network/applicationGateways',
  azurerm_firewall:                      'Microsoft.Network/azureFirewalls',
  azurerm_bastion_host:                  'Microsoft.Network/bastionHosts',
  azurerm_nat_gateway:                   'Microsoft.Network/natGateways',
  azurerm_private_endpoint:              'Microsoft.Network/privateEndpoints',
  azurerm_virtual_network_gateway:       'Microsoft.Network/virtualNetworkGateways',
  azurerm_virtual_network_peering:       'Microsoft.Network/virtualNetworks/virtualNetworkPeerings',
  azurerm_frontdoor:                     'Microsoft.Network/frontDoors',
  azurerm_cdn_profile:                   'Microsoft.Cdn/profiles',
  azurerm_dns_zone:                      'Microsoft.Network/dnszones',
  azurerm_private_dns_zone:              'Microsoft.Network/privateDnsZones',
  azurerm_virtual_machine:               'Microsoft.Compute/virtualMachines',
  azurerm_linux_virtual_machine:         'Microsoft.Compute/virtualMachines',
  azurerm_windows_virtual_machine:       'Microsoft.Compute/virtualMachines',
  azurerm_virtual_machine_scale_set:     'Microsoft.Compute/virtualMachineScaleSets',
  azurerm_linux_virtual_machine_scale_set:   'Microsoft.Compute/virtualMachineScaleSets',
  azurerm_windows_virtual_machine_scale_set: 'Microsoft.Compute/virtualMachineScaleSets',
  azurerm_availability_set:              'Microsoft.Compute/availabilitySets',
  azurerm_managed_disk:                  'Microsoft.Compute/disks',
  azurerm_kubernetes_cluster:            'Microsoft.ContainerService/managedClusters',
  azurerm_container_group:               'Microsoft.ContainerInstance/containerGroups',
  azurerm_container_registry:            'Microsoft.ContainerRegistry/registries',
  azurerm_app_service:                   'Microsoft.Web/sites',
  azurerm_linux_web_app:                 'Microsoft.Web/sites',
  azurerm_windows_web_app:               'Microsoft.Web/sites',
  azurerm_function_app:                  'Microsoft.Web/sites',
  azurerm_service_plan:                  'Microsoft.Web/serverfarms',
  azurerm_app_service_plan:              'Microsoft.Web/serverfarms',
  azurerm_storage_account:               'Microsoft.Storage/storageAccounts',
  azurerm_sql_server:                    'Microsoft.Sql/servers',
  azurerm_mssql_server:                  'Microsoft.Sql/servers',
  azurerm_sql_database:                  'Microsoft.Sql/servers/databases',
  azurerm_mssql_database:                'Microsoft.Sql/servers/databases',
  azurerm_cosmosdb_account:              'Microsoft.DocumentDB/databaseAccounts',
  azurerm_redis_cache:                   'Microsoft.Cache/redis',
  azurerm_key_vault:                     'Microsoft.KeyVault/vaults',
  azurerm_log_analytics_workspace:       'Microsoft.OperationalInsights/workspaces',
  azurerm_application_insights:          'Microsoft.Insights/components',
  azurerm_recovery_services_vault:       'Microsoft.RecoveryServices/vaults',
  azurerm_user_assigned_identity:        'Microsoft.ManagedIdentity/userAssignedIdentities',
};

const SUB = '00000000-0000-0000-0000-000000000000';
const DEFAULT_RG = 'terraform';

// Strip HCL comments so regex passes don't false-match inside them
function stripComments(text) {
  return String(text || '')
    .replace(/#[^\n]*/g, '')
    .replace(/\/\/[^\n]*/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '');
}

// Given the full HCL body of a resource, find `key = "literal"` or a
// reference like `key = azurerm_TYPE.NAME.attribute` — returns the parsed hit.
function readAttr(body, key) {
  // Try quoted literal first
  const litRe = new RegExp(`\\b${key}\\s*=\\s*"([^"]+)"`);
  const m1 = body.match(litRe);
  if (m1) return { kind: 'literal', value: m1[1] };

  // Reference: key = azurerm_type.name[.attr]
  const refRe = new RegExp(`\\b${key}\\s*=\\s*azurerm_([a-z_]+)\\.([a-z0-9_]+)`);
  const m2 = body.match(refRe);
  if (m2) return { kind: 'ref', tfType: `azurerm_${m2[1]}`, tfName: m2[2] };

  return null;
}

// Reads all references inside `key = [azurerm_X.Y.id, azurerm_X.Z.id]`
function readAttrArray(body, key) {
  const re = new RegExp(`\\b${key}\\s*=\\s*\\[([^\\]]*)\\]`, 's');
  const m = body.match(re);
  if (!m) return [];
  const parts = m[1].split(',').map(s => s.trim()).filter(Boolean);
  const out = [];
  for (const p of parts) {
    const rm = p.match(/^azurerm_([a-z_]+)\.([a-z0-9_]+)/);
    if (rm) out.push({ tfType: `azurerm_${rm[1]}`, tfName: rm[2] });
  }
  return out;
}

// Read the entire body of a named nested block, e.g.  ip_configuration { ... }
function extractBlockBody(body, blockName) {
  // Simple, non-nested extractor — the block bodies we need are all top-level
  const re = new RegExp(`\\b${blockName}\\s*\\{`);
  const m = body.match(re);
  if (!m) return null;
  const startIdx = m.index + m[0].length - 1;
  let depth = 0;
  for (let i = startIdx; i < body.length; i++) {
    if (body[i] === '{') depth++;
    else if (body[i] === '}') {
      depth--;
      if (depth === 0) return body.slice(startIdx + 1, i);
    }
  }
  return null;
}

// Return ALL occurrences of a named nested block (network_interface, ip_configuration)
function extractAllBlocks(body, blockName) {
  const re = new RegExp(`\\b${blockName}\\s*\\{`, 'g');
  const results = [];
  let m;
  while ((m = re.exec(body)) !== null) {
    const startIdx = m.index + m[0].length - 1;
    let depth = 0;
    for (let i = startIdx; i < body.length; i++) {
      if (body[i] === '{') depth++;
      else if (body[i] === '}') {
        depth--;
        if (depth === 0) {
          results.push(body.slice(startIdx + 1, i));
          break;
        }
      }
    }
  }
  return results;
}

/**
 * Split a Terraform HCL blob into a list of `{ tfType, tfName, body }` records.
 */
function splitResources(text) {
  const cleaned = stripComments(text);
  const out = [];
  const headerRe = /\bresource\s+"([^"]+)"\s+"([^"]+)"\s*\{/g;
  let m;
  while ((m = headerRe.exec(cleaned)) !== null) {
    const tfType = m[1];
    const tfName = m[2];
    const start = m.index + m[0].length - 1;
    let depth = 0;
    for (let i = start; i < cleaned.length; i++) {
      if (cleaned[i] === '{') depth++;
      else if (cleaned[i] === '}') {
        depth--;
        if (depth === 0) {
          out.push({ tfType, tfName, body: cleaned.slice(start + 1, i) });
          break;
        }
      }
    }
  }
  return out;
}

// Build a lookup so we can resolve `azurerm_TYPE.NAME` references into the
// actual `name` attribute inside that resource's body (falling back to tfName).
function buildNameIndex(records) {
  const idx = new Map();
  for (const r of records) {
    const nameAttr = readAttr(r.body, 'name');
    const resolved = nameAttr?.kind === 'literal' ? nameAttr.value : r.tfName;
    idx.set(`${r.tfType}.${r.tfName}`, { tfType: r.tfType, tfName: r.tfName, resolvedName: resolved });
  }
  return idx;
}

// Turn a TF ref → ARM synthesized resource ID (if we can map its type).
function refToArmId(ref, nameIndex, rgName) {
  if (!ref) return null;
  const info = nameIndex.get(`${ref.tfType}.${ref.tfName}`);
  const resolvedName = info?.resolvedName || ref.tfName;
  const armType = TF_TO_ARM[ref.tfType];
  if (!armType) return null;
  return synthesizeResourceId(armType, resolvedName, rgName, SUB);
}

// Handle top-level subnet child names for TF (a subnet's tf ref must resolve
// to "vnetname/subnetname" for ARM shape). We stitch the parent VNet name in.
function subnetArmName(tfSubnetRecord, nameIndex) {
  const bodyVnet = readAttr(tfSubnetRecord.body, 'virtual_network_name');
  const nameAttr = readAttr(tfSubnetRecord.body, 'name');
  const subnetName = nameAttr?.kind === 'literal' ? nameAttr.value : tfSubnetRecord.tfName;
  let vnetName = null;
  if (bodyVnet?.kind === 'literal') vnetName = bodyVnet.value;
  else if (bodyVnet?.kind === 'ref') {
    const info = nameIndex.get(`${bodyVnet.tfType}.${bodyVnet.tfName}`);
    vnetName = info?.resolvedName || bodyVnet.tfName;
  }
  return vnetName ? `${vnetName}/${subnetName}` : subnetName;
}

// Special TF ref → ARM ID for subnets (needs parent VNet)
function subnetRefToArmId(ref, records, nameIndex, rgName) {
  if (!ref) return null;
  const rec = records.find(r => r.tfType === ref.tfType && r.tfName === ref.tfName);
  if (!rec) return refToArmId(ref, nameIndex, rgName);
  const armName = subnetArmName(rec, nameIndex);
  return synthesizeResourceId('Microsoft.Network/virtualNetworks/subnets', armName, rgName, SUB);
}

// Build ARM-shaped `properties` for a specific TF resource
function buildProperties(rec, records, nameIndex, rgName) {
  const t = rec.tfType;
  const body = rec.body;
  const props = {};

  // ── Network Interface ──────────────────────────────────────────────────
  if (t === 'azurerm_network_interface') {
    // NSG association (older syntax on NIC itself)
    const nsg = readAttr(body, 'network_security_group_id');
    if (nsg?.kind === 'ref') {
      const id = refToArmId(nsg, nameIndex, rgName);
      if (id) props.networkSecurityGroup = { id };
    }

    // ip_configuration blocks
    const ipCfgs = extractAllBlocks(body, 'ip_configuration');
    props.ipConfigurations = ipCfgs.map((cfgBody, i) => {
      const cfg = { name: `ipconfig${i + 1}`, properties: {} };
      const sub = readAttr(cfgBody, 'subnet_id');
      if (sub?.kind === 'ref') {
        const id = subnetRefToArmId(sub, records, nameIndex, rgName);
        if (id) cfg.properties.subnet = { id };
      }
      const pip = readAttr(cfgBody, 'public_ip_address_id');
      if (pip?.kind === 'ref') {
        const id = refToArmId(pip, nameIndex, rgName);
        if (id) cfg.properties.publicIPAddress = { id };
      }
      const pia = readAttr(cfgBody, 'private_ip_address');
      if (pia?.kind === 'literal') cfg.properties.privateIPAddress = pia.value;
      return cfg;
    });
  }

  // ── Subnet ─────────────────────────────────────────────────────────────
  if (t === 'azurerm_subnet') {
    const nsg = readAttr(body, 'network_security_group_id');
    if (nsg?.kind === 'ref') {
      const id = refToArmId(nsg, nameIndex, rgName);
      if (id) props.networkSecurityGroup = { id };
    }
    const rt = readAttr(body, 'route_table_id');
    if (rt?.kind === 'ref') {
      const id = refToArmId(rt, nameIndex, rgName);
      if (id) props.routeTable = { id };
    }
    const prefixLit = readAttr(body, 'address_prefix');
    if (prefixLit?.kind === 'literal') props.addressPrefix = prefixLit.value;
    // address_prefixes = [...] — best-effort
    const prefixRe = /address_prefixes\s*=\s*\[([^\]]*)\]/;
    const pm = body.match(prefixRe);
    if (pm) {
      props.addressPrefixes = pm[1].split(',').map(s => s.trim().replace(/"/g, '')).filter(Boolean);
    }
  }

  // ── Subnet-NSG association (separate resource in TF) ───────────────────
  // We patch this back onto the subnet in a post-processing pass below

  // ── Virtual Machine (Linux / Windows / generic) ────────────────────────
  if (t === 'azurerm_linux_virtual_machine' || t === 'azurerm_windows_virtual_machine' || t === 'azurerm_virtual_machine') {
    const nicRefs = readAttrArray(body, 'network_interface_ids');
    if (nicRefs.length > 0) {
      props.networkProfile = {
        networkInterfaces: nicRefs.map(ref => ({ id: refToArmId(ref, nameIndex, rgName) })).filter(x => !!x.id),
      };
    }
    // Availability set / zone
    const avset = readAttr(body, 'availability_set_id');
    if (avset?.kind === 'ref') {
      const id = refToArmId(avset, nameIndex, rgName);
      if (id) props.availabilitySet = { id };
    }
    const size = readAttr(body, 'size') || readAttr(body, 'vm_size');
    if (size?.kind === 'literal') props.hardwareProfile = { vmSize: size.value };
  }

  // ── VM Scale Set ───────────────────────────────────────────────────────
  if (t === 'azurerm_linux_virtual_machine_scale_set' || t === 'azurerm_windows_virtual_machine_scale_set' || t === 'azurerm_virtual_machine_scale_set') {
    const nicBlocks = extractAllBlocks(body, 'network_interface');
    const ifConfigs = nicBlocks.map((nb) => {
      const ipCfgs = extractAllBlocks(nb, 'ip_configuration').map(cb => {
        const sub = readAttr(cb, 'subnet_id');
        const cfg = { properties: {} };
        if (sub?.kind === 'ref') {
          const id = subnetRefToArmId(sub, records, nameIndex, rgName);
          if (id) cfg.properties.subnet = { id };
        }
        return cfg;
      });
      return { properties: { ipConfigurations: ipCfgs } };
    });
    if (ifConfigs.length > 0) {
      props.virtualMachineProfile = { networkProfile: { networkInterfaceConfigurations: ifConfigs } };
    }
  }

  // ── AKS cluster ────────────────────────────────────────────────────────
  if (t === 'azurerm_kubernetes_cluster') {
    // default_node_pool { vnet_subnet_id = ... }
    const dnp = extractBlockBody(body, 'default_node_pool');
    if (dnp) {
      const sub = readAttr(dnp, 'vnet_subnet_id');
      if (sub?.kind === 'ref') {
        const id = subnetRefToArmId(sub, records, nameIndex, rgName);
        if (id) props.networkProfile = { vnetSubnetId: id };
      }
    }
  }

  // ── App Service → App Service Plan ─────────────────────────────────────
  if (t === 'azurerm_linux_web_app' || t === 'azurerm_windows_web_app' || t === 'azurerm_app_service' || t === 'azurerm_function_app') {
    const plan = readAttr(body, 'service_plan_id') || readAttr(body, 'app_service_plan_id');
    if (plan?.kind === 'ref') {
      const id = refToArmId(plan, nameIndex, rgName);
      if (id) props.serverFarmId = id;
    }
  }

  // ── VNet peering ───────────────────────────────────────────────────────
  if (t === 'azurerm_virtual_network_peering') {
    const remote = readAttr(body, 'remote_virtual_network_id');
    const local  = readAttr(body, 'virtual_network_name');
    if (remote?.kind === 'ref') {
      const id = refToArmId(remote, nameIndex, rgName);
      if (id) props.remoteVirtualNetwork = { id };
    }
    // Attach the peering onto its parent VNet as inline property
    if (local?.kind === 'literal' || local?.kind === 'ref') {
      const localName = local.kind === 'literal' ? local.value : (nameIndex.get(`${local.tfType}.${local.tfName}`)?.resolvedName || local.tfName);
      // The parent VNet record will read this back — store on record for post-pass
      rec._parentVnetName = localName;
    }
  }

  // ── Private Endpoint ───────────────────────────────────────────────────
  if (t === 'azurerm_private_endpoint') {
    const sub = readAttr(body, 'subnet_id');
    if (sub?.kind === 'ref') {
      const id = subnetRefToArmId(sub, records, nameIndex, rgName);
      if (id) props.subnet = { id };
    }
    const conn = extractBlockBody(body, 'private_service_connection');
    if (conn) {
      const target = readAttr(conn, 'private_connection_resource_id');
      if (target?.kind === 'ref') {
        const id = refToArmId(target, nameIndex, rgName);
        if (id) props.privateLinkServiceConnections = [{ properties: { privateLinkServiceId: id } }];
      }
    }
  }

  return props;
}

/**
 * Main entry — turns Terraform HCL text into an ARM-shaped resource array.
 * Each item: { id, type, name, location, properties }
 */
export function terraformHclToArmResources(text, rgName = DEFAULT_RG) {
  const records = splitResources(text);
  const nameIndex = buildNameIndex(records);

  // ── First pass: create ARM-shape resource for each TF record ──────────
  const resources = [];
  for (const rec of records) {
    const armType = TF_TO_ARM[rec.tfType];
    if (!armType) continue;

    let armName;
    if (rec.tfType === 'azurerm_subnet') {
      armName = subnetArmName(rec, nameIndex);
    } else if (rec.tfType === 'azurerm_sql_database' || rec.tfType === 'azurerm_mssql_database') {
      const serverRef = readAttr(rec.body, 'server_id');
      const dbName    = readAttr(rec.body, 'name')?.value || rec.tfName;
      const server = serverRef?.kind === 'ref'
        ? (nameIndex.get(`${serverRef.tfType}.${serverRef.tfName}`)?.resolvedName || serverRef.tfName)
        : null;
      armName = server ? `${server}/${dbName}` : dbName;
    } else {
      const info = nameIndex.get(`${rec.tfType}.${rec.tfName}`);
      armName = info?.resolvedName || rec.tfName;
    }

    const locAttr = readAttr(rec.body, 'location');
    const location = locAttr?.kind === 'literal' ? locAttr.value : 'unknown';
    const properties = buildProperties(rec, records, nameIndex, rgName);

    resources.push({
      id: synthesizeResourceId(armType, armName, rgName, SUB),
      type: armType,
      name: armName,
      location,
      resourceGroupName: rgName,
      subscriptionId: SUB,
      properties,
    });
  }

  // ── Second pass: fold TF-specific association resources into targets ──
  // azurerm_subnet_network_security_group_association → subnet.properties.networkSecurityGroup
  // azurerm_subnet_route_table_association             → subnet.properties.routeTable
  for (const rec of records) {
    if (rec.tfType === 'azurerm_subnet_network_security_group_association' ||
        rec.tfType === 'azurerm_subnet_route_table_association') {
      const subRef = readAttr(rec.body, 'subnet_id');
      if (subRef?.kind !== 'ref') continue;
      const subnetId = subnetRefToArmId(subRef, records, nameIndex, rgName);
      const subnet = resources.find(r => r.id === subnetId);
      if (!subnet) continue;

      if (rec.tfType === 'azurerm_subnet_network_security_group_association') {
        const nsg = readAttr(rec.body, 'network_security_group_id');
        if (nsg?.kind === 'ref') {
          const id = refToArmId(nsg, nameIndex, rgName);
          if (id) subnet.properties.networkSecurityGroup = { id };
        }
      } else {
        const rt = readAttr(rec.body, 'route_table_id');
        if (rt?.kind === 'ref') {
          const id = refToArmId(rt, nameIndex, rgName);
          if (id) subnet.properties.routeTable = { id };
        }
      }
    }
  }

  // ── Third pass: hoist VNet peerings onto their parent VNet resource ──
  for (const rec of records) {
    if (rec.tfType !== 'azurerm_virtual_network_peering') continue;
    if (!rec._parentVnetName) continue;
    const vnet = resources.find(r =>
      r.type === 'Microsoft.Network/virtualNetworks' && r.name === rec._parentVnetName);
    if (!vnet) continue;
    const remote = readAttr(rec.body, 'remote_virtual_network_id');
    if (remote?.kind !== 'ref') continue;
    const remoteId = refToArmId(remote, nameIndex, rgName);
    if (!remoteId) continue;
    vnet.properties.virtualNetworkPeerings = vnet.properties.virtualNetworkPeerings || [];
    vnet.properties.virtualNetworkPeerings.push({
      properties: { remoteVirtualNetwork: { id: remoteId } },
    });
  }

  return resources;
}
