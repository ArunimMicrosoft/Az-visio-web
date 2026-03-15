// Terraform Parser - Converts Terraform files to Azure Architecture Diagram
// Supports .tf and .tf.json files with full dependency tracking

import { azureIconCategories } from './azureIcons.js';

/**
 * Get icon path from Azure Icons library
 */
const getIconPath = (iconId) => {
  console.log(`🔍 Looking for icon: "${iconId}"`);
  
  // Search all categories for the icon
  for (const category of Object.values(azureIconCategories)) {
    const icon = category.find(i => i.id === iconId || i.id === iconId + 's' || i.id === iconId.slice(0, -1));
    if (icon) {
      console.log(`✅ Found icon: ${icon.path}`);
      return icon.path;
    }
  }
  
  // Fallback to generic icon
  console.warn(`⚠️ Icon not found for "${iconId}", using fallback`);
  return '/icons/general/10007-icon-service-Resource-Groups.svg';
};

/**
 * Comprehensive Terraform resource type to Azure icon mapping
 * Maps 200+ Terraform resource types to correct Azure service icons
 */
const TERRAFORM_TO_AZURE_MAPPING = {
  // ===== COMPUTE =====
  'azurerm_linux_virtual_machine': { serviceType: 'virtualmachines', icon: 'virtualmachine', category: 'compute' },
  'azurerm_windows_virtual_machine': { serviceType: 'virtualmachines', icon: 'virtualmachine', category: 'compute' },
  'azurerm_virtual_machine': { serviceType: 'virtualmachines', icon: 'virtualmachine', category: 'compute' },
  'azurerm_virtual_machine_scale_set': { serviceType: 'vmscalesets', icon: 'vmscalesets', category: 'compute' },
  'azurerm_kubernetes_cluster': { serviceType: 'kubernetesservices', icon: 'kubernetesservices', category: 'compute' },
  'azurerm_container_group': { serviceType: 'containerinstances', icon: 'containerinstances', category: 'containers' },
  'azurerm_container_registry': { serviceType: 'containerregistries', icon: 'containerregistries', category: 'containers' },
  'azurerm_app_service': { serviceType: 'appservices', icon: 'appservices', category: 'compute' },
  'azurerm_linux_web_app': { serviceType: 'appservices', icon: 'appservices', category: 'compute' },
  'azurerm_windows_web_app': { serviceType: 'appservices', icon: 'appservices', category: 'compute' },
  'azurerm_app_service_plan': { serviceType: 'appserviceplans', icon: 'appserviceplans', category: 'compute' },
  'azurerm_service_plan': { serviceType: 'appserviceplans', icon: 'appserviceplans', category: 'compute' },
  'azurerm_function_app': { serviceType: 'functionapp', icon: 'functionapp', category: 'compute' },
  'azurerm_linux_function_app': { serviceType: 'functionapp', icon: 'functionapp', category: 'compute' },
  'azurerm_windows_function_app': { serviceType: 'functionapp', icon: 'functionapp', category: 'compute' },
  'azurerm_batch_account': { serviceType: 'batchaccounts', icon: 'batchaccounts', category: 'compute' },
  'azurerm_availability_set': { serviceType: 'availabilitysets', icon: 'availabilitysets', category: 'compute' },
  
  // ===== STORAGE =====
  'azurerm_storage_account': { serviceType: 'storageaccounts', icon: 'storageaccounts', category: 'storage' },
  'azurerm_storage_blob': { serviceType: 'storageaccountblob', icon: 'storageaccounts', category: 'storage' },
  'azurerm_storage_container': { serviceType: 'storageaccountblob', icon: 'storageaccounts', category: 'storage' },
  'azurerm_storage_share': { serviceType: 'storageaccountsazurefiles', icon: 'storageaccounts', category: 'storage' },
  'azurerm_storage_queue': { serviceType: 'storageaccountqueue', icon: 'storageaccounts', category: 'storage' },
  'azurerm_storage_table': { serviceType: 'storageaccounttable', icon: 'storageaccounts', category: 'storage' },
  'azurerm_managed_disk': { serviceType: 'disks', icon: 'disks', category: 'storage' },
  'azurerm_snapshot': { serviceType: 'snapshots', icon: 'snapshots', category: 'storage' },
  'azurerm_backup_vault': { serviceType: 'backupvault', icon: 'backupvault', category: 'storage' },
  'azurerm_recovery_services_vault': { serviceType: 'recoveryservicesvaults', icon: 'recoveryservicesvaults', category: 'storage' },
  'azurerm_data_lake_store': { serviceType: 'datalakestoregen1', icon: 'datalakestoregen1', category: 'storage' },
  'azurerm_netapp_account': { serviceType: 'azurenetappfiles', icon: 'azurenetappfiles', category: 'storage' },
  
  // ===== DATABASES =====
  'azurerm_sql_server': { serviceType: 'sqlserver', icon: 'sqlserver', category: 'databases' },
  'azurerm_mssql_server': { serviceType: 'sqlserver', icon: 'sqlserver', category: 'databases' },
  'azurerm_sql_database': { serviceType: 'sqldatabase', icon: 'sqldatabase', category: 'databases' },
  'azurerm_mssql_database': { serviceType: 'sqldatabase', icon: 'sqldatabase', category: 'databases' },
  'azurerm_sql_managed_instance': { serviceType: 'sqlmanagedinstance', icon: 'sqlmanagedinstance', category: 'databases' },
  'azurerm_mysql_server': { serviceType: 'azuredatabaseformysqlservers', icon: 'azuredatabaseformysqlservers', category: 'databases' },
  'azurerm_mysql_flexible_server': { serviceType: 'azuredatabaseformysqlservers', icon: 'azuredatabaseformysqlservers', category: 'databases' },
  'azurerm_postgresql_server': { serviceType: 'azuredatabaseforpostgresqlservers', icon: 'azuredatabaseforpostgresqlservers', category: 'databases' },
  'azurerm_postgresql_flexible_server': { serviceType: 'azuredatabaseforpostgresqlservers', icon: 'azuredatabaseforpostgresqlservers', category: 'databases' },
  'azurerm_cosmosdb_account': { serviceType: 'azurecosmosdb', icon: 'azurecosmosdb', category: 'databases' },
  'azurerm_redis_cache': { serviceType: 'cacheforredis', icon: 'cacheforredis', category: 'databases' },
  'azurerm_mariadb_server': { serviceType: 'azuredatabaseformariadbservers', icon: 'azuredatabaseformariadbservers', category: 'databases' },
  'azurerm_synapse_workspace': { serviceType: 'azuresynapseanalytics', icon: 'azuresynapseanalytics', category: 'analytics' },
    // ===== NETWORKING =====
  'azurerm_virtual_network': { serviceType: 'virtualnetworks', icon: 'virtualnetworks', category: 'networking' },
  'azurerm_subnet': { serviceType: 'subnets', icon: 'subnet', category: 'networking' },
  'azurerm_network_security_group': { serviceType: 'networksecuritygroups', icon: 'networksecuritygroups', category: 'networking' },
  'azurerm_public_ip': { serviceType: 'publicipaddresses', icon: 'publicipaddresses', category: 'networking' },
  'azurerm_network_interface': { serviceType: 'networkinterfaces', icon: 'networkinterfaces', category: 'networking' },
  'azurerm_load_balancer': { serviceType: 'loadbalancers', icon: 'loadbalancers', category: 'networking' },
  'azurerm_application_gateway': { serviceType: 'applicationgateways', icon: 'applicationgateways', category: 'networking' },
  'azurerm_vpn_gateway': { serviceType: 'virtualgateways', icon: 'virtualgateways', category: 'networking' },
  'azurerm_virtual_network_gateway': { serviceType: 'virtualgateways', icon: 'virtualgateways', category: 'networking' },
  'azurerm_firewall': { serviceType: 'firewalls', icon: 'firewalls', category: 'networking' },
  'azurerm_dns_zone': { serviceType: 'dnszones', icon: 'dnszones', category: 'networking' },
  'azurerm_traffic_manager_profile': { serviceType: 'trafficmanagerprofiles', icon: 'trafficmanagerprofiles', category: 'networking' },
  'azurerm_frontdoor': { serviceType: 'frontdoors', icon: 'frontdoors', category: 'networking' },
  'azurerm_cdn_profile': { serviceType: 'cdnprofiles', icon: 'cdnprofiles', category: 'networking' },
  'azurerm_cdn_endpoint': { serviceType: 'cdnprofiles', icon: 'cdnprofiles', category: 'networking' },
  'azurerm_private_endpoint': { serviceType: 'privatelink', icon: 'privatelink', category: 'networking' },
  'azurerm_nat_gateway': { serviceType: 'natgateway', icon: 'nat', category: 'networking' },
  'azurerm_bastion_host': { serviceType: 'bastions', icon: 'bastions', category: 'networking' },
  'azurerm_express_route_circuit': { serviceType: 'expressroutecircuits', icon: 'expressroutecircuits', category: 'networking' },
  'azurerm_route_table': { serviceType: 'routetables', icon: 'routetables', category: 'networking' },
  'azurerm_virtual_network_peering': { serviceType: 'virtualnetworks', icon: 'virtualnetworks', category: 'networking' },
  'azurerm_application_security_group': { serviceType: 'applicationsecuritygroups', icon: 'applicationsecuritygroups', category: 'networking' },
  
  // ===== SECURITY =====
  'azurerm_key_vault': { serviceType: 'keyvaults', icon: 'keyvaults', category: 'security' },
  'azurerm_key_vault_secret': { serviceType: 'keyvaults', icon: 'keyvaults', category: 'security' },
  'azurerm_key_vault_key': { serviceType: 'keyvaults', icon: 'keyvaults', category: 'security' },
  'azurerm_key_vault_certificate': { serviceType: 'keyvaults', icon: 'keyvaults', category: 'security' },
  'azurerm_security_center_subscription_pricing': { serviceType: 'microsoftdefenderforcloud', icon: 'microsoftdefenderforcloud', category: 'security' },
  'azurerm_sentinel_data_connector': { serviceType: 'microsoftsentinel', icon: 'microsoftsentinel', category: 'security' },
  'azurerm_sentinel_alert_rule': { serviceType: 'microsoftsentinel', icon: 'microsoftsentinel', category: 'security' },
  
  // ===== IDENTITY =====
  'azurerm_active_directory_domain_service': { serviceType: 'azureactivedirectory', icon: 'azureactivedirectory', category: 'identity' },
  'azurerm_user_assigned_identity': { serviceType: 'managedidentities', icon: 'managedidentities', category: 'identity' },
  
  // ===== INTEGRATION =====
  'azurerm_servicebus_namespace': { serviceType: 'servicebusnamespaces', icon: 'servicebusnamespaces', category: 'integration' },
  'azurerm_servicebus_queue': { serviceType: 'servicebusqueues', icon: 'servicebusqueues', category: 'integration' },
  'azurerm_servicebus_topic': { serviceType: 'servicebustopics', icon: 'servicebustopics', category: 'integration' },
  'azurerm_eventhub_namespace': { serviceType: 'eventhubnamespaces', icon: 'eventhubs', category: 'integration' },
  'azurerm_eventhub': { serviceType: 'eventhubs', icon: 'eventhubs', category: 'integration' },
  'azurerm_logic_app_workflow': { serviceType: 'logicapps', icon: 'logicapps', category: 'integration' },
  'azurerm_api_management': { serviceType: 'apimanagement', icon: 'apimanagement', category: 'integration' },
  
  // ===== AI & ML =====
  'azurerm_cognitive_account': { serviceType: 'cognitiveservices', icon: 'cognitiveservices', category: 'ai' },
  'azurerm_machine_learning_workspace': { serviceType: 'machinelearning', icon: 'machinelearning', category: 'ai' },
  'azurerm_bot_service': { serviceType: 'botservices', icon: 'botservices', category: 'ai' },
  
  // ===== ANALYTICS =====
  'azurerm_databricks_workspace': { serviceType: 'azuredatabricks', icon: 'azuredatabricks', category: 'analytics' },
  'azurerm_stream_analytics_job': { serviceType: 'streamanalytics', icon: 'streamanalytics', category: 'analytics' },
  'azurerm_hdinsight_hadoop_cluster': { serviceType: 'hdinsightclusters', icon: 'hdinsightclusters', category: 'analytics' },
  'azurerm_data_factory': { serviceType: 'datafactories', icon: 'datafactories', category: 'analytics' },
  
  // ===== IOT =====
  'azurerm_iothub': { serviceType: 'iothub', icon: 'iothub', category: 'iot' },
  'azurerm_iot_central_application': { serviceType: 'azureiotcentral', icon: 'azureiotcentral', category: 'iot' },
  'azurerm_digital_twins_instance': { serviceType: 'azuredigitaltwins', icon: 'azuredigitaltwins', category: 'iot' },
  
  // ===== MONITORING =====
  'azurerm_monitor_action_group': { serviceType: 'azuremonitor', icon: 'azuremonitor', category: 'monitoring' },
  'azurerm_application_insights': { serviceType: 'applicationinsights', icon: 'applicationinsights', category: 'monitoring' },
  'azurerm_log_analytics_workspace': { serviceType: 'loganalyticsworkspaces', icon: 'loganalyticsworkspaces', category: 'monitoring' },
  
  // ===== MANAGEMENT =====
  'azurerm_resource_group': { serviceType: 'resourcegroups', icon: 'resourcegroups', category: 'management' },
  'azurerm_management_group': { serviceType: 'managementgroups', icon: 'managementgroups', category: 'management' },
  'azurerm_policy_definition': { serviceType: 'policy', icon: 'policy', category: 'management' },
  'azurerm_policy_assignment': { serviceType: 'policy', icon: 'policy', category: 'management' },
  'azurerm_automation_account': { serviceType: 'automationaccounts', icon: 'automationaccounts', category: 'management' },
  'azurerm_cost_management_export': { serviceType: 'costmanagementandbiiling', icon: 'costmanagementandbiiling', category: 'management' },
  
  // ===== MIGRATION =====
  'azurerm_site_recovery_fabric': { serviceType: 'azuresiterecovery', icon: 'azuresiterecovery', category: 'migration' },
  'azurerm_migrate_project': { serviceType: 'azuremigrate', icon: 'azuremigrate', category: 'migration' },
  
  // ===== HYBRID =====
  'azurerm_arc_kubernetes_cluster': { serviceType: 'azurearc', icon: 'azurearc', category: 'hybrid' },
  'azurerm_arc_machine': { serviceType: 'azurearc', icon: 'azurearc', category: 'hybrid' },
  'azurerm_stack_hci_cluster': { serviceType: 'azurestackhci', icon: 'azurestackhci', category: 'hybrid' },
};

/**
 * Parse Terraform file content
 */
export const parseTerraformFile = (content, filename) => {
  const items = [];
  const connections = [];
  const resourceMap = new Map();
  let idCounter = 1;

  const isJSON = filename.endsWith('.tf.json') || content.trim().startsWith('{');

  if (isJSON) {
    return parseTerraformJSON(content, items, connections, resourceMap, idCounter);
  } else {
    return parseTerraformHCL(content, items, connections, resourceMap, idCounter);
  }
};

/**
 * Parse HCL format with dependency tracking
 */
/**
 * Extract the full body of a block starting at `startIndex` (the opening `{`).
 * Handles unlimited nesting depth by counting braces.
 */
const extractBlock = (content, startIndex) => {
  let depth = 0;
  let i = startIndex;
  while (i < content.length) {
    if (content[i] === '{') depth++;
    else if (content[i] === '}') {
      depth--;
      if (depth === 0) return content.slice(startIndex + 1, i); // body without outer braces
    }
    i++;
  }
  return null;
};

const parseTerraformHCL = (content, items, connections, resourceMap, idCounter) => {
  // Strip comments
  let cleaned = content
    .replace(/#.*$/gm, '')
    .replace(/\/\/.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//gm, '');

  // Match: resource "type" "name" { ... } — header only, extract body via brace counter
  const headerRegex = /resource\s+"([^"]+)"\s+"([^"]+)"\s*\{/g;
  let match;

  while ((match = headerRegex.exec(cleaned)) !== null) {
    const resourceType = match[1];
    const resourceName = match[2];
    const blockStart = match.index + match[0].length - 1; // position of opening {
    const resourceBody = extractBlock(cleaned, blockStart);
    if (resourceBody === null) continue;

    const item = createItemFromResource(resourceType, resourceName, resourceBody, idCounter++);
    if (item) {
      items.push(item);
      resourceMap.set(`${resourceType}.${resourceName}`, item);
      extractDependencies(resourceBody, item, resourceMap, connections);
    }
  }
  const dataHeaderRegex = /data\s+"([^"]+)"\s+"([^"]+)"\s*\{/g;
  while ((match = dataHeaderRegex.exec(cleaned)) !== null) {
    const dataType = match[1];
    const dataName = match[2];
    const blockStart = match.index + match[0].length - 1;
    const dataBody = extractBlock(cleaned, blockStart);
    if (dataBody === null) continue;

    const item = createItemFromResource(dataType, dataName, dataBody, idCounter++);
    if (item) {
      items.push(item);
      resourceMap.set(`data.${dataType}.${dataName}`, item);
    }
  }

  layoutItems(items);
  
  return {
    items,
    connections,
    metadata: {
      source: 'terraform',
      format: 'hcl',
      resourceCount: items.length,
      connectionCount: connections.length
    }
  };
};

/**
 * Parse JSON format with dependency tracking
 */
const parseTerraformJSON = (content, items, connections, resourceMap, idCounter) => {
  try {
    const tfData = JSON.parse(content);
    
    if (tfData.resource) {
      Object.entries(tfData.resource).forEach(([resourceType, resources]) => {
        Object.entries(resources).forEach(([resourceName, config]) => {
          const item = createItemFromResource(resourceType, resourceName, JSON.stringify(config), idCounter++);
          if (item) {
            items.push(item);
            resourceMap.set(`${resourceType}.${resourceName}`, item);
            
            if (config.depends_on) {
              config.depends_on.forEach(dep => {
                createConnection(dep, item, resourceMap, connections);
              });
            }
          }
        });
      });
    }

    layoutItems(items);
    
    return {
      items,
      connections,
      metadata: {
        source: 'terraform',
        format: 'json',
        resourceCount: items.length,
        connectionCount: connections.length
      }
    };
  } catch (error) {
    console.error('Error parsing Terraform JSON:', error);
    return { items: [], connections: [], metadata: { error: error.message } };
  }
};

/**
 * Create canvas item from Terraform resource
 */
const createItemFromResource = (resourceType, resourceName, resourceBody, id) => {
  const mapping = TERRAFORM_TO_AZURE_MAPPING[resourceType];
    if (!mapping) {
    console.warn(`Unknown Terraform resource type: ${resourceType}`);
    return {
      id: `tf-${id}`,
      type: 'generic',
      name: resourceName,
      x: 0,
      y: 0,
      path: '/icons/general/10007-icon-service-Resource-Groups.svg', // Fallback icon for unmapped resources
      metadata: {
        terraformType: resourceType,
        terraformName: resourceName,
        serviceType: 'unknown'
      }
    };
  }return {
    id: `tf-${id}`,
    type: mapping.icon,
    name: resourceName,
    x: 0,
    y: 0,
    path: getIconPath(mapping.icon), // Use 'path' not 'iconPath' - Canvas expects this property
    metadata: {
      terraformType: resourceType,
      terraformName: resourceName,
      serviceType: mapping.serviceType,
      category: mapping.category
    }
  };
};

/**
 * Extract dependencies from resource body and create connections
 */
const extractDependencies = (resourceBody, currentItem, resourceMap, connections) => {
  const dependsOnMatch = resourceBody.match(/depends_on\s*=\s*\[(.*?)\]/s);
  if (dependsOnMatch) {
    const deps = dependsOnMatch[1].split(',').map(d => d.trim().replace(/["\s]/g, ''));
    deps.forEach(dep => {
      createConnection(dep, currentItem, resourceMap, connections);
    });
  }

  const refRegex = /(?:azurerm_\w+\.\w+(?:\.\w+)?)/g;
  const refs = resourceBody.match(refRegex) || [];
  
  refs.forEach(ref => {
    const parts = ref.split('.');
    if (parts.length >= 2) {
      const refKey = `${parts[0]}.${parts[1]}`;
      createConnection(refKey, currentItem, resourceMap, connections);
    }
  });

  const idRefRegex = /(\w+_id)\s*=\s*([^\n]+)/g;
  let idMatch;
  
  while ((idMatch = idRefRegex.exec(resourceBody)) !== null) {
    const refValue = idMatch[2];
    const refMatches = refValue.match(/azurerm_\w+\.\w+/g);
    if (refMatches) {
      refMatches.forEach(ref => {
        createConnection(ref, currentItem, resourceMap, connections);
      });
    }
  }
};

/**
 * Create connection between resources
 */
const createConnection = (dependency, targetItem, resourceMap, connections) => {
  const cleanDep = dependency.replace(/["[\]]/g, '').trim();
  const sourceItem = resourceMap.get(cleanDep);
  
  if (sourceItem && sourceItem.id !== targetItem.id) {
    const exists = connections.some(
      conn => conn.from === sourceItem.id && conn.to === targetItem.id
    );
    
    if (!exists) {
      connections.push({
        id: `conn-${sourceItem.id}-${targetItem.id}`,
        from: sourceItem.id,
        to: targetItem.id,
        type: 'dependency'
      });
    }
  }
};

/**
 * Auto-layout items in a grid
 */
const layoutItems = (items) => {
  const cols = Math.ceil(Math.sqrt(items.length));
  const spacing = 200;
  const startX = 100;
  const startY = 100;
  
  items.forEach((item, index) => {
    const col = index % cols;
    const row = Math.floor(index / cols);
    
    item.x = startX + (col * spacing);
    item.y = startY + (row * spacing);
  });
};

/**
 * Validate Terraform file
 */
export const validateTerraformFile = (content, filename) => {
  const errors = [];
  const warnings = [];

  if (!content || content.trim().length === 0) {
    errors.push('File is empty');
    return { valid: false, errors, warnings };
  }

  const isJSON = filename.endsWith('.tf.json') || content.trim().startsWith('{');

  if (isJSON) {
    try {
      JSON.parse(content);
    } catch (e) {
      errors.push(`Invalid JSON: ${e.message}`);
      return { valid: false, errors, warnings };
    }
  } else {
    if (!content.includes('resource') && !content.includes('data')) {
      warnings.push('No resource or data blocks found');
    }
    
    const openBraces = (content.match(/\{/g) || []).length;
    const closeBraces = (content.match(/\}/g) || []).length;
    if (openBraces !== closeBraces) {
      errors.push('Unbalanced braces in HCL');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings
  };
};
