/**
 * Terraform Parser - Parses .tf files and generates canvas items + connections
 * Maps Azure Terraform resource types to icon IDs from azureIcons.js
 */

import { azureIconCategories } from './azureIcons.js';

// Build icon ID → path lookup from the real icon catalog
const ICON_PATH_MAP = {};
for (const catKey of Object.keys(azureIconCategories)) {
  for (const ic of azureIconCategories[catKey]) {
    if (!ICON_PATH_MAP[ic.id]) {
      ICON_PATH_MAP[ic.id] = ic.path;
    }
  }
}

function getIconPath(iconId) {
  return ICON_PATH_MAP[iconId] || '/icons/general/10007-icon-service-Resource-Groups.svg';
}

const TERRAFORM_TO_ICON = {
  'azurerm_linux_virtual_machine': { iconId: 'virtualmachine', category: 'compute' },
  'azurerm_windows_virtual_machine': { iconId: 'virtualmachine', category: 'compute' },
  'azurerm_virtual_machine': { iconId: 'virtualmachine', category: 'compute' },
  'azurerm_virtual_machine_scale_set': { iconId: 'vmscalesets', category: 'compute' },
  'azurerm_availability_set': { iconId: 'availabilitysets', category: 'compute' },
  'azurerm_managed_disk': { iconId: 'disks', category: 'storage' },
  'azurerm_image': { iconId: 'images', category: 'compute' },
  'azurerm_shared_image': { iconId: 'sharedimagegalleries', category: 'compute' },
  'azurerm_shared_image_gallery': { iconId: 'azurecomputegalleries', category: 'compute' },
  'azurerm_ssh_public_key': { iconId: 'sshkeys', category: 'compute' },
  'azurerm_proximity_placement_group': { iconId: 'proximityplacementgroups', category: 'compute' },
  'azurerm_dedicated_host': { iconId: 'hosts', category: 'compute' },
  'azurerm_dedicated_host_group': { iconId: 'hostgroups', category: 'compute' },
  'azurerm_batch_account': { iconId: 'batchaccounts', category: 'compute' },
  'azurerm_batch_pool': { iconId: 'batchaccounts', category: 'compute' },
  'azurerm_container_group': { iconId: 'containerinstances', category: 'containers' },
  'azurerm_virtual_network': { iconId: 'virtualnetworks', category: 'networking' },
  'azurerm_subnet': { iconId: 'subnet', category: 'networking' },
  'azurerm_network_interface': { iconId: 'networkinterfaces', category: 'networking' },
  'azurerm_public_ip': { iconId: 'publicipaddresses', category: 'networking' },
  'azurerm_public_ip_prefix': { iconId: 'publicipprefixes', category: 'networking' },
  'azurerm_network_security_group': { iconId: 'networksecuritygroups', category: 'networking' },
  'azurerm_lb': { iconId: 'loadbalancers', category: 'networking' },
  'azurerm_load_balancer': { iconId: 'loadbalancers', category: 'networking' },
  'azurerm_application_gateway': { iconId: 'applicationgateways', category: 'networking' },
  'azurerm_firewall': { iconId: 'firewalls', category: 'networking' },
  'azurerm_firewall_policy': { iconId: 'azurefirewallpolicy', category: 'networking' },
  'azurerm_route_table': { iconId: 'routetables', category: 'networking' },
  'azurerm_nat_gateway': { iconId: 'nat', category: 'networking' },
  'azurerm_dns_zone': { iconId: 'dnszones', category: 'networking' },
  'azurerm_private_dns_zone': { iconId: 'dnszones', category: 'networking' },
  'azurerm_private_endpoint': { iconId: 'privateendpoints', category: 'networking' },
  'azurerm_private_link_service': { iconId: 'privatelinkservice', category: 'networking' },
  'azurerm_virtual_network_gateway': { iconId: 'virtualnetworkgateways', category: 'networking' },
  'azurerm_vpn_gateway': { iconId: 'virtualnetworkgateways', category: 'networking' },
  'azurerm_express_route_circuit': { iconId: 'expressroutecircuits', category: 'networking' },
  'azurerm_virtual_wan': { iconId: 'virtualwans', category: 'networking' },
  'azurerm_virtual_hub': { iconId: 'virtualwanhub', category: 'networking' },
  'azurerm_bastion_host': { iconId: 'bastions', category: 'networking' },
  'azurerm_traffic_manager_profile': { iconId: 'trafficmanagerprofiles', category: 'networking' },
  'azurerm_cdn_profile': { iconId: 'cdnprofiles', category: 'networking' },
  'azurerm_frontdoor': { iconId: 'frontdoorandcdnprofiles', category: 'networking' },
  'azurerm_cdn_frontdoor_profile': { iconId: 'frontdoorandcdnprofiles', category: 'networking' },
  'azurerm_network_watcher': { iconId: 'networkwatcher', category: 'networking' },
  'azurerm_web_application_firewall_policy': { iconId: 'webapplicationfirewallpolicieswaf', category: 'networking' },
  'azurerm_ip_group': { iconId: 'ipgroups', category: 'networking' },
  'azurerm_application_security_group': { iconId: 'applicationsecuritygroups', category: 'networking' },
  'azurerm_network_ddos_protection_plan': { iconId: 'ddosprotectionplans', category: 'networking' },
  'azurerm_storage_account': { iconId: 'storageaccounts', category: 'storage' },
  'azurerm_storage_container': { iconId: 'storagecontainer', category: 'storage' },
  'azurerm_storage_blob': { iconId: 'storagecontainer', category: 'storage' },
  'azurerm_storage_queue': { iconId: 'storagequeue', category: 'storage' },
  'azurerm_storage_share': { iconId: 'storageazurefiles', category: 'storage' },
  'azurerm_storage_table': { iconId: 'storagecontainer', category: 'storage' },
  'azurerm_netapp_account': { iconId: 'azurenetappfiles', category: 'storage' },
  'azurerm_netapp_pool': { iconId: 'azurenetappfiles', category: 'storage' },
  'azurerm_hpc_cache': { iconId: 'cache', category: 'storage' },
  'azurerm_data_lake_store': { iconId: 'datalakestoregen1', category: 'storage' },
  'azurerm_storage_sync': { iconId: 'storagesyncservices', category: 'storage' },
  'azurerm_mssql_server': { iconId: 'sqlserver', category: 'databases' },
  'azurerm_mssql_database': { iconId: 'sqldatabase', category: 'databases' },
  'azurerm_mssql_elasticpool': { iconId: 'sqlelasticpools', category: 'databases' },
  'azurerm_mssql_managed_instance': { iconId: 'sqlmanagedinstance', category: 'databases' },
  'azurerm_sql_server': { iconId: 'sqlserver', category: 'databases' },
  'azurerm_sql_database': { iconId: 'sqldatabase', category: 'databases' },
  'azurerm_cosmosdb_account': { iconId: 'azurecosmosdb', category: 'databases' },
  'azurerm_cosmosdb_sql_database': { iconId: 'azurecosmosdb', category: 'databases' },
  'azurerm_mysql_server': { iconId: 'azuredatabasemysqlserver', category: 'databases' },
  'azurerm_mysql_flexible_server': { iconId: 'azuredatabasemysqlserver', category: 'databases' },
  'azurerm_postgresql_server': { iconId: 'azuredatabasepostgresqlserver', category: 'databases' },
  'azurerm_postgresql_flexible_server': { iconId: 'azuredatabasepostgresqlserver', category: 'databases' },
  'azurerm_mariadb_server': { iconId: 'azuredatabasemariadbserver', category: 'databases' },
  'azurerm_redis_cache': { iconId: 'cache', category: 'databases' },
  'azurerm_redis_enterprise_cluster': { iconId: 'cache', category: 'databases' },
  'azurerm_kubernetes_cluster': { iconId: 'kubernetesservices', category: 'containers' },
  'azurerm_container_registry': { iconId: 'containerregistries', category: 'containers' },
  'azurerm_container_app': { iconId: 'workercontainerapp', category: 'containers' },
  'azurerm_container_app_environment': { iconId: 'containerappsenvironments', category: 'containers' },
  'azurerm_service_plan': { iconId: 'appserviceplans', category: 'web' },
  'azurerm_app_service_plan': { iconId: 'appserviceplans', category: 'web' },
  'azurerm_linux_web_app': { iconId: 'appservices', category: 'web' },
  'azurerm_windows_web_app': { iconId: 'appservices', category: 'web' },
  'azurerm_app_service': { iconId: 'appservices', category: 'web' },
  'azurerm_function_app': { iconId: 'functionapps', category: 'web' },
  'azurerm_linux_function_app': { iconId: 'functionapps', category: 'web' },
  'azurerm_windows_function_app': { iconId: 'functionapps', category: 'web' },
  'azurerm_static_web_app': { iconId: 'staticapps', category: 'web' },
  'azurerm_api_management': { iconId: 'apimanagementservices', category: 'web' },
  'azurerm_signalr_service': { iconId: 'signalr', category: 'web' },
  'azurerm_app_configuration': { iconId: 'appconfiguration', category: 'web' },
  'azurerm_key_vault': { iconId: 'keyvaults', category: 'security' },
  'azurerm_key_vault_secret': { iconId: 'keyvaults', category: 'security' },
  'azurerm_key_vault_key': { iconId: 'keyvaults', category: 'security' },
  'azurerm_key_vault_certificate': { iconId: 'keyvaults', category: 'security' },
  'azurerm_user_assigned_identity': { iconId: 'managedidentities', category: 'security' },
  'azurerm_role_assignment': { iconId: 'managedidentities', category: 'security' },
  'azurerm_monitor_action_group': { iconId: 'monitor', category: 'management' },
  'azurerm_monitor_metric_alert': { iconId: 'alerts', category: 'management' },
  'azurerm_log_analytics_workspace': { iconId: 'loganalyticsworkspaces', category: 'management' },
  'azurerm_application_insights': { iconId: 'applicationinsights', category: 'management' },
  'azurerm_monitor_diagnostic_setting': { iconId: 'diagnosticssettings', category: 'management' },
  'azurerm_automation_account': { iconId: 'automationaccounts', category: 'management' },
  'azurerm_policy_assignment': { iconId: 'policy', category: 'management' },
  'azurerm_resource_group': { iconId: 'resourcegroups', category: 'management' },
  'azurerm_servicebus_namespace': { iconId: 'azureservicebus', category: 'integration' },
  'azurerm_servicebus_queue': { iconId: 'azureservicebus', category: 'integration' },
  'azurerm_servicebus_topic': { iconId: 'azureservicebus', category: 'integration' },
  'azurerm_eventhub_namespace': { iconId: 'eventhubs', category: 'integration' },
  'azurerm_eventhub': { iconId: 'eventhubs', category: 'integration' },
  'azurerm_eventgrid_topic': { iconId: 'eventgridtopics', category: 'integration' },
  'azurerm_eventgrid_domain': { iconId: 'eventgriddomains', category: 'integration' },
  'azurerm_logic_app_workflow': { iconId: 'logicapps', category: 'integration' },
  'azurerm_relay_namespace': { iconId: 'relays', category: 'integration' },
  'azurerm_cognitive_account': { iconId: 'cognitiveservices', category: 'ai' },
  'azurerm_machine_learning_workspace': { iconId: 'machinelearning', category: 'ai' },
  'azurerm_search_service': { iconId: 'cognitivesearch', category: 'ai' },
  'azurerm_bot_service_azure_bot': { iconId: 'botservices', category: 'ai' },
  'azurerm_openai_deployment': { iconId: 'azureopenai', category: 'ai' },
  'azurerm_synapse_workspace': { iconId: 'azuresynapseanalytics', category: 'analytics' },
  'azurerm_data_factory': { iconId: 'datafactories', category: 'analytics' },
  'azurerm_databricks_workspace': { iconId: 'azuredatabricks', category: 'analytics' },
  'azurerm_stream_analytics_job': { iconId: 'streamanalyticsjobs', category: 'analytics' },
  'azurerm_hdinsight_hadoop_cluster': { iconId: 'hdinsightclusters', category: 'analytics' },
  'azurerm_hdinsight_spark_cluster': { iconId: 'hdinsightclusters', category: 'analytics' },
  'azurerm_analysis_services_server': { iconId: 'analysisservices', category: 'analytics' },
  'azurerm_kusto_cluster': { iconId: 'azuredataexplorerclusters', category: 'analytics' },
  'azurerm_purview_account': { iconId: 'microsoftpurview', category: 'analytics' },
  'azurerm_dev_test_lab': { iconId: 'devtestlabs', category: 'devops' },
  'azurerm_notification_hub': { iconId: 'notificationhubs', category: 'devops' },
  'azurerm_iothub': { iconId: 'iothub', category: 'iot' },
  'azurerm_iot_security_solution': { iconId: 'microsoftdefenderforiot', category: 'iot' },
  'azurerm_digital_twins_instance': { iconId: 'digitaltwins', category: 'iot' },
  'azurerm_maps_account': { iconId: 'azuremapsaccounts', category: 'iot' },
  'azurerm_recovery_services_vault': { iconId: 'recoveryservicesvaults', category: 'management' },
  'azurerm_site_recovery_fabric': { iconId: 'recoveryservicesvaults', category: 'management' },
  'azurerm_backup_policy_vm': { iconId: 'recoveryservicesvaults', category: 'management' },
};

/**
 * Parse a Terraform .tf file and extract resources and their relationships
 * @param {string} tfContent - Content of a .tf file
 * @returns {{ items: Array, connections: Array }} Canvas-ready items and connections
 */
export function parseTerraform(tfContent) {
  var resources = extractResources(tfContent);
  var references = extractReferences(resources);
  var result = generateCanvasItems(resources);
  var connections = generateConnections(references, result.resourceMap);
  return { items: result.items, connections: connections };
}

/**
 * Extract resource blocks from Terraform content
 */
function extractResources(content) {
  var resources = [];
  var resourceRegex = /resource\s+"([^"]+)"\s+"([^"]+)"\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/gs;
  var match;

  while ((match = resourceRegex.exec(content)) !== null) {
    var resourceType = match[1];
    var resourceName = match[2];
    var body = match[3];
    var nameMatch = body.match(/^\s*name\s*=\s*"([^"]+)"/m);
    var displayName = nameMatch ? nameMatch[1] : resourceName;

    resources.push({
      type: resourceType,
      localName: resourceName,
      displayName: displayName,
      body: body,
    });
  }

  return resources;
}

/**
 * Extract references between resources by scanning each resource body
 * for azurerm_xxx.yyy.zzz patterns
 */
function extractReferences(resources) {
  var references = [];
  var knownKeys = {};
  var i, res;

  for (i = 0; i < resources.length; i++) {
    res = resources[i];
    knownKeys[res.type + "." + res.localName] = true;
  }

  for (i = 0; i < resources.length; i++) {
    res = resources[i];
    var selfKey = res.type + "." + res.localName;
    var refRegex = /azurerm_(\w+)\.(\w+)\.\w+/g;
    var refMatch;

    while ((refMatch = refRegex.exec(res.body)) !== null) {
      var refType = "azurerm_" + refMatch[1];
      var refName = refMatch[2];
      var targetKey = refType + "." + refName;

      if (knownKeys[targetKey] && targetKey !== selfKey) {
        var exists = false;
        for (var j = 0; j < references.length; j++) {
          if (references[j].from === selfKey && references[j].to === targetKey) {
            exists = true;
            break;
          }
        }
        if (!exists) {
          references.push({ from: selfKey, to: targetKey });
        }
      }
    }
  }

  return references;
}

/**
 * Generate canvas items arranged in a grid layout
 */
function generateCanvasItems(resources) {
  var items = [];
  var resourceMap = {};
  var COLS = 4;
  var X_START = 100;
  var Y_START = 100;
  var X_SPACING = 220;
  var Y_SPACING = 180;

  for (var i = 0; i < resources.length; i++) {
    var res = resources[i];
    var iconInfo = TERRAFORM_TO_ICON[res.type] || { iconId: "resourcegroups", category: "management" };
    var col = i % COLS;
    var row = Math.floor(i / COLS);
    var key = res.type + "." + res.localName;

    var item = {
      id: Date.now() + i + Math.floor(Math.random() * 10000),
      serviceType: iconInfo.iconId,
      name: res.displayName,
      path: getIconPath(iconInfo.iconId),
      category: iconInfo.category,
      x: X_START + col * X_SPACING,
      y: Y_START + row * Y_SPACING,
      terraformType: res.type,
      terraformRef: key,
    };

    items.push(item);
    resourceMap[key] = item;
  }

  return { items: items, resourceMap: resourceMap };
}

/**
 * Generate connections from Terraform references
 */
function generateConnections(references, resourceMap) {
  var connections = [];

  for (var i = 0; i < references.length; i++) {
    var ref = references[i];
    var fromItem = resourceMap[ref.from];
    var toItem = resourceMap[ref.to];

    if (fromItem && toItem) {
      connections.push({
        id: "tf-conn-" + Date.now() + "-" + i,
        from: fromItem.id,
        to: toItem.id,
        fromType: fromItem.serviceType,
        toType: toItem.serviceType,
        label: "",
        status: "valid",
      });
    }
  }

  return connections;
}

/**
 * Get summary statistics of parsed terraform
 */
export function getTerraformSummary(tfContent) {
  var resources = extractResources(tfContent);
  var typeCount = {};
  for (var i = 0; i < resources.length; i++) {
    var res = resources[i];
    var mapped = TERRAFORM_TO_ICON[res.type];
    var category = mapped ? mapped.category : "unknown";
    typeCount[category] = (typeCount[category] || 0) + 1;
  }
  return {
    totalResources: resources.length,
    byCategory: typeCount,
  };
}
