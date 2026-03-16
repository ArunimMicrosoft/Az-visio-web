// Terraform Parser - Converts Terraform files to Azure Architecture Diagram
// Supports .tf and .tf.json files with full dependency tracking

import { azureIconCategories } from './azureIcons.js';

// ---------------------------------------------------------------------------
// Icon resolution
// Build a flat lookup: iconId → { id, name, path } once at module load
// ---------------------------------------------------------------------------
const _iconLookup = (() => {
  const map = new Map();
  for (const category of Object.values(azureIconCategories)) {
    for (const icon of category) {
      map.set(icon.id.toLowerCase(), icon);
    }
  }
  return map;
})();

const getIconPath = (iconId) => {
  if (!iconId) return '/icons/general/10007-icon-service-Resource-Groups.svg';
  const hit = _iconLookup.get(iconId.toLowerCase());
  if (hit) return hit.path;
  // partial match — find first key that contains the search term
  for (const [key, icon] of _iconLookup) {
    if (key.includes(iconId.toLowerCase()) || iconId.toLowerCase().includes(key)) {
      return icon.path;
    }
  }
  return '/icons/general/10007-icon-service-Resource-Groups.svg';
};

// ---------------------------------------------------------------------------
// Resource type → { serviceType, icon, category, label } mapping
// serviceType must match what Canvas / connectionValidator expects
// icon must match an id in azureIcons.js
// ---------------------------------------------------------------------------
const TERRAFORM_TO_AZURE_MAPPING = {
  // ===== COMPUTE =====
  'azurerm_linux_virtual_machine':            { serviceType: 'virtualmachines', icon: 'virtualmachines', category: 'compute',    label: 'Linux VM' },
  'azurerm_windows_virtual_machine':          { serviceType: 'virtualmachines', icon: 'virtualmachines', category: 'compute',    label: 'Windows VM' },
  'azurerm_virtual_machine':                  { serviceType: 'virtualmachines', icon: 'virtualmachines', category: 'compute',    label: 'VM' },
  'azurerm_linux_virtual_machine_scale_set':  { serviceType: 'vmscalesets',     icon: 'virtualmachinescalesets', category: 'compute', label: 'VMSS (Linux)' },
  'azurerm_windows_virtual_machine_scale_set':{ serviceType: 'vmscalesets',     icon: 'virtualmachinescalesets', category: 'compute', label: 'VMSS (Windows)' },
  'azurerm_virtual_machine_scale_set':        { serviceType: 'vmscalesets',     icon: 'virtualmachinescalesets', category: 'compute', label: 'VMSS' },
  'azurerm_kubernetes_cluster':               { serviceType: 'kubernetesservices', icon: 'kubernetesservices', category: 'compute', label: 'AKS' },
  'azurerm_container_group':                  { serviceType: 'containerinstances', icon: 'containerinstances', category: 'containers', label: 'Container Instance' },
  'azurerm_container_registry':               { serviceType: 'containerregistries', icon: 'containerregistries', category: 'containers', label: 'Container Registry' },
  'azurerm_app_service':                      { serviceType: 'appservices', icon: 'appservices', category: 'compute', label: 'App Service' },
  'azurerm_linux_web_app':                    { serviceType: 'appservices', icon: 'appservices', category: 'compute', label: 'Web App (Linux)' },
  'azurerm_windows_web_app':                  { serviceType: 'appservices', icon: 'appservices', category: 'compute', label: 'Web App (Windows)' },
  'azurerm_app_service_plan':                 { serviceType: 'appserviceplans', icon: 'appserviceplans', category: 'compute', label: 'App Service Plan' },
  'azurerm_service_plan':                     { serviceType: 'appserviceplans', icon: 'appserviceplans', category: 'compute', label: 'Service Plan' },
  'azurerm_function_app':                     { serviceType: 'functionapp', icon: 'functionapps', category: 'compute', label: 'Function App' },
  'azurerm_linux_function_app':               { serviceType: 'functionapp', icon: 'functionapps', category: 'compute', label: 'Function App (Linux)' },
  'azurerm_windows_function_app':             { serviceType: 'functionapp', icon: 'functionapps', category: 'compute', label: 'Function App (Windows)' },
  'azurerm_batch_account':                    { serviceType: 'batchaccounts', icon: 'batchaccounts', category: 'compute', label: 'Batch Account' },
  'azurerm_availability_set':                 { serviceType: 'availabilitysets', icon: 'availabilitysets', category: 'compute', label: 'Availability Set' },
  'azurerm_spring_cloud_service':             { serviceType: 'appservices', icon: 'appservices', category: 'compute', label: 'Spring Cloud' },

  // ===== STORAGE =====
  'azurerm_storage_account':                  { serviceType: 'storageaccounts', icon: 'storageaccounts', category: 'storage', label: 'Storage Account' },
  'azurerm_storage_blob':                     { serviceType: 'storageaccounts', icon: 'storageaccounts', category: 'storage', label: 'Blob Storage' },
  'azurerm_storage_container':                { serviceType: 'storageaccounts', icon: 'storageaccounts', category: 'storage', label: 'Storage Container' },
  'azurerm_storage_share':                    { serviceType: 'storageaccounts', icon: 'storageaccounts', category: 'storage', label: 'File Share' },
  'azurerm_storage_queue':                    { serviceType: 'storageaccounts', icon: 'storageaccounts', category: 'storage', label: 'Storage Queue' },
  'azurerm_storage_table':                    { serviceType: 'storageaccounts', icon: 'storageaccounts', category: 'storage', label: 'Storage Table' },
  'azurerm_managed_disk':                     { serviceType: 'disks', icon: 'disks', category: 'storage', label: 'Managed Disk' },
  'azurerm_snapshot':                         { serviceType: 'snapshots', icon: 'snapshots', category: 'storage', label: 'Snapshot' },
  'azurerm_backup_vault':                     { serviceType: 'backupvaults', icon: 'backupvaults', category: 'storage', label: 'Backup Vault' },
  'azurerm_recovery_services_vault':          { serviceType: 'recoveryservicesvaults', icon: 'recoveryservicesvaults', category: 'storage', label: 'Recovery Vault' },
  'azurerm_data_lake_store':                  { serviceType: 'datalakestoregen1', icon: 'datalakestoregen1', category: 'storage', label: 'Data Lake Store' },
  'azurerm_netapp_account':                   { serviceType: 'azurenetappfiles', icon: 'azurenetappfiles', category: 'storage', label: 'NetApp Files' },

  // ===== DATABASES =====
  'azurerm_sql_server':                       { serviceType: 'sqlserver', icon: 'sqlserver', category: 'databases', label: 'SQL Server' },
  'azurerm_mssql_server':                     { serviceType: 'sqlserver', icon: 'sqlserver', category: 'databases', label: 'SQL Server' },
  'azurerm_sql_database':                     { serviceType: 'sqldatabases', icon: 'sqldatabases', category: 'databases', label: 'SQL Database' },
  'azurerm_mssql_database':                   { serviceType: 'sqldatabases', icon: 'sqldatabases', category: 'databases', label: 'SQL Database' },
  'azurerm_sql_managed_instance':             { serviceType: 'sqlmanagedinstances', icon: 'sqlmanagedinstances', category: 'databases', label: 'SQL Managed Instance' },
  'azurerm_mysql_server':                     { serviceType: 'azuredatabaseformysqlservers', icon: 'azuredatabaseformysqlservers', category: 'databases', label: 'MySQL Server' },
  'azurerm_mysql_flexible_server':            { serviceType: 'azuredatabaseformysqlservers', icon: 'azuredatabaseformysqlservers', category: 'databases', label: 'MySQL Flexible Server' },
  'azurerm_postgresql_server':                { serviceType: 'azuredatabaseforpostgresqlservers', icon: 'azuredatabaseforpostgresqlservers', category: 'databases', label: 'PostgreSQL Server' },
  'azurerm_postgresql_flexible_server':       { serviceType: 'azuredatabaseforpostgresqlservers', icon: 'azuredatabaseforpostgresqlservers', category: 'databases', label: 'PostgreSQL Flexible Server' },
  'azurerm_cosmosdb_account':                 { serviceType: 'azurecosmosdb', icon: 'azurecosmosdb', category: 'databases', label: 'Cosmos DB' },
  'azurerm_redis_cache':                      { serviceType: 'cacheforredis', icon: 'cacheforredis', category: 'databases', label: 'Redis Cache' },
  'azurerm_mariadb_server':                   { serviceType: 'azuredatabaseformariadbservers', icon: 'azuredatabaseformariadbservers', category: 'databases', label: 'MariaDB Server' },
  'azurerm_synapse_workspace':                { serviceType: 'azuresynapseanalytics', icon: 'azuresynapseanalytics', category: 'analytics', label: 'Synapse Workspace' },

  // ===== NETWORKING =====
  'azurerm_virtual_network':                  { serviceType: 'virtualnetworks', icon: 'virtualnetworks', category: 'networking', label: 'Virtual Network' },
  'azurerm_subnet':                           { serviceType: 'subnets', icon: 'virtualnetworks', category: 'networking', label: 'Subnet' },
  'azurerm_network_security_group':           { serviceType: 'networksecuritygroups', icon: 'networksecuritygroups', category: 'networking', label: 'NSG' },
  'azurerm_public_ip':                        { serviceType: 'publicipaddresses', icon: 'publicipaddresses', category: 'networking', label: 'Public IP' },
  'azurerm_network_interface':                { serviceType: 'networkinterfaces', icon: 'networkinterfaces', category: 'networking', label: 'NIC' },
  'azurerm_load_balancer':                    { serviceType: 'loadbalancers', icon: 'loadbalancers', category: 'networking', label: 'Load Balancer' },
  'azurerm_application_gateway':              { serviceType: 'applicationgateways', icon: 'applicationgateways', category: 'networking', label: 'App Gateway' },
  'azurerm_vpn_gateway':                      { serviceType: 'virtualgateways', icon: 'virtualnetworkgateways', category: 'networking', label: 'VPN Gateway' },
  'azurerm_virtual_network_gateway':          { serviceType: 'virtualgateways', icon: 'virtualnetworkgateways', category: 'networking', label: 'VNet Gateway' },
  'azurerm_firewall':                         { serviceType: 'firewalls', icon: 'firewalls', category: 'networking', label: 'Firewall' },
  'azurerm_dns_zone':                         { serviceType: 'dnszones', icon: 'dnszones', category: 'networking', label: 'DNS Zone' },
  'azurerm_private_dns_zone':                 { serviceType: 'dnszones', icon: 'dnszones', category: 'networking', label: 'Private DNS Zone' },
  'azurerm_traffic_manager_profile':          { serviceType: 'trafficmanagerprofiles', icon: 'trafficmanagerprofiles', category: 'networking', label: 'Traffic Manager' },
  'azurerm_cdn_profile':                      { serviceType: 'cdnprofiles', icon: 'cdnprofiles', category: 'networking', label: 'CDN Profile' },
  'azurerm_cdn_endpoint':                     { serviceType: 'cdnprofiles', icon: 'cdnprofiles', category: 'networking', label: 'CDN Endpoint' },
  'azurerm_private_endpoint':                 { serviceType: 'privatelink', icon: 'privatelinkservices', category: 'networking', label: 'Private Endpoint' },
  'azurerm_nat_gateway':                      { serviceType: 'natgateway', icon: 'natgateway', category: 'networking', label: 'NAT Gateway' },
  'azurerm_bastion_host':                     { serviceType: 'bastions', icon: 'bastions', category: 'networking', label: 'Bastion' },
  'azurerm_express_route_circuit':            { serviceType: 'expressroutecircuits', icon: 'expressroutecircuits', category: 'networking', label: 'ExpressRoute' },
  'azurerm_route_table':                      { serviceType: 'routetables', icon: 'routetables', category: 'networking', label: 'Route Table' },
  'azurerm_virtual_network_peering':          { serviceType: 'virtualnetworks', icon: 'virtualnetworks', category: 'networking', label: 'VNet Peering' },
  'azurerm_application_security_group':       { serviceType: 'applicationsecuritygroups', icon: 'applicationsecuritygroups', category: 'networking', label: 'App Security Group' },
  'azurerm_frontdoor':                        { serviceType: 'frontdoors', icon: 'frontdoors', category: 'networking', label: 'Front Door' },
  'azurerm_cdn_frontdoor_profile':            { serviceType: 'frontdoors', icon: 'frontdoors', category: 'networking', label: 'Front Door (CDN)' },
  'azurerm_cdn_frontdoor_endpoint':           { serviceType: 'frontdoors', icon: 'frontdoors', category: 'networking', label: 'Front Door Endpoint' },
  'azurerm_virtual_wan':                      { serviceType: 'virtualwans', icon: 'virtualwans', category: 'networking', label: 'Virtual WAN' },
  'azurerm_virtual_hub':                      { serviceType: 'virtualwans', icon: 'virtualwans', category: 'networking', label: 'Virtual Hub' },
  'azurerm_network_watcher':                  { serviceType: 'networkwatcher', icon: 'networkwatcher', category: 'networking', label: 'Network Watcher' },
  'azurerm_lb_rule':                          null, // child resource — skip
  'azurerm_lb_backend_address_pool':          null,
  'azurerm_lb_probe':                         null,
  'azurerm_subnet_network_security_group_association': null,
  'azurerm_subnet_route_table_association':   null,
  'azurerm_network_interface_security_group_association': null,

  // ===== SECURITY =====
  'azurerm_key_vault':                        { serviceType: 'keyvaults', icon: 'keyvaults', category: 'security', label: 'Key Vault' },
  'azurerm_key_vault_secret':                 null, // child resource — skip
  'azurerm_key_vault_key':                    null,
  'azurerm_key_vault_certificate':            null,
  'azurerm_key_vault_access_policy':          null,
  'azurerm_security_center_subscription_pricing': { serviceType: 'microsoftdefenderforcloud', icon: 'microsoftdefenderforcloud', category: 'security', label: 'Defender for Cloud' },
  'azurerm_sentinel_data_connector':          { serviceType: 'microsoftsentinel', icon: 'microsoftsentinel', category: 'security', label: 'Sentinel' },
  'azurerm_sentinel_alert_rule_scheduled':    { serviceType: 'microsoftsentinel', icon: 'microsoftsentinel', category: 'security', label: 'Sentinel Alert Rule' },
  'azurerm_role_assignment':                  null, // IAM — skip visual
  'azurerm_role_definition':                  null,

  // ===== IDENTITY =====
  'azurerm_active_directory_domain_service':  { serviceType: 'azureactivedirectory', icon: 'azureactivedirectory', category: 'identity', label: 'AD Domain Services' },
  'azurerm_user_assigned_identity':           { serviceType: 'managedidentities', icon: 'managedidentities', category: 'identity', label: 'Managed Identity' },
  // ===== CONTAINERS (modern) =====
  'azurerm_container_app':                    { serviceType: 'containerapps', icon: 'containerapps', category: 'containers', label: 'Container App' },
  'azurerm_container_app_environment':        { serviceType: 'containerapps', icon: 'containerapps', category: 'containers', label: 'Container App Env' },

  // ===== WEB / APP SERVICES (modern) =====
  'azurerm_static_web_app':                   { serviceType: 'appservices', icon: 'appservices', category: 'compute', label: 'Static Web App' },
  'azurerm_signalr_service':                  { serviceType: 'signalr', icon: 'signalr', category: 'integration', label: 'SignalR Service' },
  'azurerm_app_configuration':                { serviceType: 'appconfiguration', icon: 'appconfiguration', category: 'integration', label: 'App Configuration' },

  // ===== INTEGRATION =====
  'azurerm_servicebus_namespace':             { serviceType: 'servicebusnamespaces', icon: 'servicebusnamespaces', category: 'integration', label: 'Service Bus' },
  'azurerm_servicebus_queue':                 { serviceType: 'servicebusqueues', icon: 'servicebusnamespaces', category: 'integration', label: 'Service Bus Queue' },
  'azurerm_servicebus_topic':                 { serviceType: 'servicebustopics', icon: 'servicebusnamespaces', category: 'integration', label: 'Service Bus Topic' },
  'azurerm_eventhub_namespace':               { serviceType: 'eventhubnamespaces', icon: 'eventhubs', category: 'integration', label: 'Event Hub Namespace' },
  'azurerm_eventhub':                         { serviceType: 'eventhubs', icon: 'eventhubs', category: 'integration', label: 'Event Hub' },
  'azurerm_logic_app_workflow':               { serviceType: 'logicapps', icon: 'logicapps', category: 'integration', label: 'Logic App' },
  'azurerm_logic_app_standard':               { serviceType: 'logicapps', icon: 'logicapps', category: 'integration', label: 'Logic App Standard' },
  'azurerm_api_management':                   { serviceType: 'apimanagement', icon: 'apimanagement', category: 'integration', label: 'API Management' },
  'azurerm_eventgrid_topic':                  { serviceType: 'eventgridtopics', icon: 'eventgridtopics', category: 'integration', label: 'Event Grid Topic' },
  'azurerm_eventgrid_system_topic':           { serviceType: 'eventgridtopics', icon: 'eventgridtopics', category: 'integration', label: 'Event Grid System Topic' },
  'azurerm_notification_hub':                 { serviceType: 'notificationhubs', icon: 'notificationhubs', category: 'integration', label: 'Notification Hub' },
  'azurerm_notification_hub_namespace':       { serviceType: 'notificationhubs', icon: 'notificationhubs', category: 'integration', label: 'Notification Hub NS' },
  'azurerm_relay_namespace':                  { serviceType: 'relays', icon: 'servicebusnamespaces', category: 'integration', label: 'Relay Namespace' },
  // ===== AI & ML =====
  'azurerm_cognitive_account':                { serviceType: 'cognitiveservices', icon: 'cognitiveservices', category: 'ai', label: 'Cognitive Services' },
  'azurerm_machine_learning_workspace':       { serviceType: 'machinelearning', icon: 'machinelearning', category: 'ai', label: 'ML Workspace' },
  'azurerm_bot_service':                      { serviceType: 'botservices', icon: 'botservices', category: 'ai', label: 'Bot Service' },
  'azurerm_search_service':                   { serviceType: 'cognitivesearch', icon: 'cognitivesearch', category: 'ai', label: 'AI Search' },
  'azurerm_ai_services':                      { serviceType: 'cognitiveservices', icon: 'cognitiveservices', category: 'ai', label: 'Azure AI Services' },
  'azurerm_openai':                           { serviceType: 'azureopenai', icon: 'azureopenai', category: 'ai', label: 'Azure OpenAI' },
  'azurerm_cognitive_deployment':             null, // child resource — skip

  // ===== ANALYTICS =====
  'azurerm_databricks_workspace':             { serviceType: 'azuredatabricks', icon: 'azuredatabricks', category: 'analytics', label: 'Databricks' },
  'azurerm_stream_analytics_job':             { serviceType: 'streamanalyticsjobs', icon: 'streamanalyticsjobs', category: 'analytics', label: 'Stream Analytics' },
  'azurerm_hdinsight_hadoop_cluster':         { serviceType: 'hdinsightclusters', icon: 'hdinsightclusters', category: 'analytics', label: 'HDInsight' },
  'azurerm_hdinsight_kafka_cluster':          { serviceType: 'hdinsightclusters', icon: 'hdinsightclusters', category: 'analytics', label: 'HDInsight Kafka' },
  'azurerm_hdinsight_spark_cluster':          { serviceType: 'hdinsightclusters', icon: 'hdinsightclusters', category: 'analytics', label: 'HDInsight Spark' },
  'azurerm_data_factory':                     { serviceType: 'datafactories', icon: 'datafactories', category: 'analytics', label: 'Data Factory' },
  'azurerm_data_factory_pipeline':            null, // child resource — skip
  'azurerm_kusto_cluster':                    { serviceType: 'azuredataexplorerclusters', icon: 'azuredataexplorerclusters', category: 'analytics', label: 'Data Explorer' },
  'azurerm_analysis_services_server':         { serviceType: 'analysisservices', icon: 'analysisservices', category: 'analytics', label: 'Analysis Services' },
  'azurerm_purview_account':                  { serviceType: 'microsoftpurview', icon: 'microsoftpurview', category: 'analytics', label: 'Purview' },

  // ===== IOT =====
  'azurerm_iothub':                           { serviceType: 'iothub', icon: 'iothub', category: 'iot', label: 'IoT Hub' },
  'azurerm_iot_central_application':          { serviceType: 'azureiotcentral', icon: 'azureiotcentral', category: 'iot', label: 'IoT Central' },
  'azurerm_digital_twins_instance':           { serviceType: 'azuredigitaltwins', icon: 'azuredigitaltwins', category: 'iot', label: 'Digital Twins' },

  // ===== MONITORING =====
  'azurerm_monitor_action_group':             { serviceType: 'azuremonitor', icon: 'azuremonitor', category: 'monitoring', label: 'Monitor Action Group' },
  'azurerm_application_insights':             { serviceType: 'applicationinsights', icon: 'applicationinsights', category: 'monitoring', label: 'App Insights' },
  'azurerm_log_analytics_workspace':          { serviceType: 'loganalyticsworkspaces', icon: 'loganalyticsworkspaces', category: 'monitoring', label: 'Log Analytics' },
  'azurerm_monitor_diagnostic_setting':       null, // skip — config only

  // ===== MANAGEMENT =====
  'azurerm_resource_group':                   { serviceType: 'resourcegroups', icon: 'resourcegroups', category: 'management', label: 'Resource Group' },
  'azurerm_management_group':                 { serviceType: 'managementgroups', icon: 'managementgroups', category: 'management', label: 'Management Group' },
  'azurerm_policy_definition':                { serviceType: 'policy', icon: 'policy', category: 'management', label: 'Policy' },
  'azurerm_policy_assignment':                { serviceType: 'policy', icon: 'policy', category: 'management', label: 'Policy Assignment' },
  'azurerm_automation_account':               { serviceType: 'automationaccounts', icon: 'automationaccounts', category: 'management', label: 'Automation Account' },

  // ===== MIGRATION / HYBRID =====
  'azurerm_site_recovery_fabric':             { serviceType: 'azuresiterecovery', icon: 'azuresiterecovery', category: 'migration', label: 'Site Recovery' },
  'azurerm_migrate_project':                  { serviceType: 'azuremigrate', icon: 'azuremigrate', category: 'migration', label: 'Azure Migrate' },
  'azurerm_arc_kubernetes_cluster':           { serviceType: 'azurearc', icon: 'azurearc', category: 'hybrid', label: 'Arc Kubernetes' },
  'azurerm_arc_machine':                      { serviceType: 'azurearc', icon: 'azurearc', category: 'hybrid', label: 'Arc Machine' },
  'azurerm_stack_hci_cluster':                { serviceType: 'azurestackhci', icon: 'azurestackhci', category: 'hybrid', label: 'Stack HCI' },
};

// Resource types that are purely configuration — skip them on the canvas
const SKIP_RESOURCE_TYPES = new Set([
  'random_string', 'random_id', 'random_password', 'random_pet',
  'azurerm_client_config',           // data source
  'azurerm_subscription',            // data source
  'null_resource', 'time_sleep',
]);

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Parse Terraform file content into canvas items + connections
 */
export const parseTerraformFile = (content, filename = 'main.tf') => {
  const isJSON = filename.endsWith('.tf.json') || content.trim().startsWith('{');
  return isJSON
    ? parseTerraformJSON(content)
    : parseTerraformHCL(content);
};

// ---------------------------------------------------------------------------
// HCL parser
// ---------------------------------------------------------------------------

/**
 * Extract the body of a { } block starting at the opening brace index.
 * Handles unlimited nesting.
 */
const extractBlock = (content, startIndex) => {
  let depth = 0;
  for (let i = startIndex; i < content.length; i++) {
    if (content[i] === '{') depth++;
    else if (content[i] === '}') {
      depth--;
      if (depth === 0) return content.slice(startIndex + 1, i);
    }
  }
  return null;
};

const parseTerraformHCL = (content) => {
  // Strip HCL comments
  const cleaned = content
    .replace(/#[^\n]*/g, '')
    .replace(/\/\/[^\n]*/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '');

  // Pass 1 — collect ALL resources into resourceMap first (fixes forward-ref connections)
  const resourceMap = new Map(); // key: "type.name" → item
  const rawResources = [];       // [{ resourceType, resourceName, body }]
  let idCounter = 1;

  const headerRegex = /\bresource\s+"([^"]+)"\s+"([^"]+)"\s*\{/g;
  let match;
  while ((match = headerRegex.exec(cleaned)) !== null) {
    const resourceType = match[1];
    const resourceName = match[2];
    const body = extractBlock(cleaned, match.index + match[0].length - 1);
    if (body === null) continue;

    // Skip null-mapped and noise resources
    if (SKIP_RESOURCE_TYPES.has(resourceType)) continue;
    if (TERRAFORM_TO_AZURE_MAPPING[resourceType] === null) continue; // explicitly skipped child resource

    rawResources.push({ resourceType, resourceName, body });
    const item = buildItem(resourceType, resourceName, body, idCounter++);
    if (item) {
      resourceMap.set(`${resourceType}.${resourceName}`, item);
    }
  }

  // Also collect data sources (skip from canvas but allow reference resolution)
  const dataRegex = /\bdata\s+"([^"]+)"\s+"([^"]+)"\s*\{/g;
  while ((match = dataRegex.exec(cleaned)) !== null) {
    // data sources don't appear on canvas — only register for dep resolution
    resourceMap.set(`data.${match[1]}.${match[2]}`, null);
  }

  // Pass 2 — build items list and extract connections now that map is complete
  const items = [];
  const connections = [];
  const connectionSet = new Set();

  for (const { resourceType, resourceName, body } of rawResources) {
    const item = resourceMap.get(`${resourceType}.${resourceName}`);
    if (!item) continue;
    items.push(item);
    extractDependencies(body, item, resourceMap, connections, connectionSet);
  }

  layoutItems(items);

  return {
    items,
    connections,
    metadata: {
      source: 'terraform',
      format: 'hcl',
      resourceCount: items.length,
      connectionCount: connections.length,
    },
  };
};

// ---------------------------------------------------------------------------
// JSON parser (.tf.json format)
// ---------------------------------------------------------------------------

const parseTerraformJSON = (content) => {
  const items = [];
  const connections = [];
  const resourceMap = new Map();
  const connectionSet = new Set();
  let idCounter = 1;

  let tfData;
  try {
    tfData = JSON.parse(content);
  } catch (err) {
    return { items: [], connections: [], metadata: { error: err.message } };
  }

  if (tfData.resource) {
    // Pass 1 — build map
    for (const [resourceType, resources] of Object.entries(tfData.resource)) {
      if (SKIP_RESOURCE_TYPES.has(resourceType)) continue;
      if (TERRAFORM_TO_AZURE_MAPPING[resourceType] === null) continue;
      for (const [resourceName, config] of Object.entries(resources)) {
        const item = buildItem(resourceType, resourceName, JSON.stringify(config), idCounter++);
        if (item) resourceMap.set(`${resourceType}.${resourceName}`, item);
      }
    }
    // Pass 2 — items + connections
    for (const [resourceType, resources] of Object.entries(tfData.resource)) {
      if (SKIP_RESOURCE_TYPES.has(resourceType)) continue;
      if (TERRAFORM_TO_AZURE_MAPPING[resourceType] === null) continue;
      for (const [resourceName, config] of Object.entries(resources)) {
        const item = resourceMap.get(`${resourceType}.${resourceName}`);
        if (!item) continue;
        items.push(item);
        if (config.depends_on) {
          for (const dep of config.depends_on) {
            addConnection(dep, item, resourceMap, connections, connectionSet);
          }
        }
        extractDependencies(JSON.stringify(config), item, resourceMap, connections, connectionSet);
      }
    }
  }

  layoutItems(items);

  return {
    items,
    connections,
    metadata: {
      source: 'terraform',
      format: 'json',
      resourceCount: items.length,
      connectionCount: connections.length,
    },
  };
};

// ---------------------------------------------------------------------------
// Item builder
// ---------------------------------------------------------------------------

const buildItem = (resourceType, resourceName, body, id) => {
  const mapping = TERRAFORM_TO_AZURE_MAPPING[resourceType];

  // Extract human-readable name from body first (name = "..."), fall back to resource label
  const nameMatch = body.match(/\bname\s*=\s*"([^"]+)"/);
  const displayName = nameMatch
    ? nameMatch[1].replace(/\$\{[^}]*\}/g, '').replace(/[-_]+/g, ' ').trim() || resourceName
    : resourceName.replace(/[-_]+/g, ' ');

  if (!mapping) {
    // Unknown type — still show with fallback icon so nothing is silently dropped
    return {
      id: `tf-${id}`,
      serviceType: 'unknown',
      type: 'unknown',
      name: displayName,
      label: resourceName,
      x: 0, y: 0,
      path: '/icons/general/10007-icon-service-Resource-Groups.svg',
      metadata: { terraformType: resourceType, terraformName: resourceName, category: 'unknown' },
    };
  }

  return {
    id: `tf-${id}`,
    // serviceType is what Canvas + connectionValidator uses
    serviceType: mapping.serviceType,
    // type mirrors serviceType (Canvas reads both)
    type: mapping.serviceType,
    name: displayName,
    label: resourceName,
    x: 0, y: 0,
    path: getIconPath(mapping.icon),
    metadata: {
      terraformType: resourceType,
      terraformName: resourceName,
      serviceType: mapping.serviceType,
      category: mapping.category,
      tfLabel: mapping.label,
    },
  };
};

// ---------------------------------------------------------------------------
// Dependency / connection extraction
// ---------------------------------------------------------------------------

/**
 * Scan a resource body for references to other resources and build connections.
 * Handles: depends_on, *_id = azurerm_x.y.id, direct interpolations.
 */
const extractDependencies = (body, currentItem, resourceMap, connections, connectionSet) => {
  // 1. explicit depends_on = [azurerm_x.y, ...]
  const dependsOnMatch = body.match(/depends_on\s*=\s*\[([^\]]*)\]/s);
  if (dependsOnMatch) {
    for (const dep of dependsOnMatch[1].split(',')) {
      addConnection(dep.trim().replace(/"/g, ''), currentItem, resourceMap, connections, connectionSet);
    }
  }

  // 2. Real ID references: subnet_id, vnet_subnet_id, server_id, service_plan_id, workspace_id etc.
  //    Only match lines where the VALUE is azurerm_type.name.id (or .ids array)
  //    This excludes .name / .location / .type which are property reads, not architectural links.
  const idRefRegex = /\b[\w_]+_ids?\s*=\s*[\[\s]*azurerm_([a-z_]+)\.([a-z0-9_]+)/g;
  let m;
  while ((m = idRefRegex.exec(body)) !== null) {
    addConnection(`azurerm_${m[1]}.${m[2]}`, currentItem, resourceMap, connections, connectionSet);
  }

  // 3. Interpolated ID refs: = "...${azurerm_type.name.id}..."
  const interpIdRegex = /\$\{\s*azurerm_([a-z_]+)\.([a-z0-9_]+)\.id\s*\}/g;
  while ((m = interpIdRegex.exec(body)) !== null) {
    addConnection(`azurerm_${m[1]}.${m[2]}`, currentItem, resourceMap, connections, connectionSet);
  }
  // 4. Named deps: storage_account_name, virtual_network_name etc — real architectural links
  //    Match both = azurerm_X.Y.name and = azurerm_X.Y (no trailing attribute)
  const namedLinkRegex = /\b(?:storage_account_name|virtual_network_name|namespace_name|hub_name|profile_name|cluster_name|registry_login_server)\s*=\s*azurerm_([a-z_]+)\.([a-z0-9_]+)/g;
  while ((m = namedLinkRegex.exec(body)) !== null) {
    addConnection(`azurerm_${m[1]}.${m[2]}`, currentItem, resourceMap, connections, connectionSet);
  }
};

const addConnection = (depRef, targetItem, resourceMap, connections, connectionSet) => {
  const clean = depRef.replace(/["[\]\s]/g, '');
  if (!clean) return;

  // Accept "type.name" or "type.name.attr" — use first two parts
  const parts = clean.split('.');
  if (parts.length < 2) return;

  const key = `${parts[0]}.${parts[1]}`;
  const sourceItem = resourceMap.get(key);

  // sourceItem may be null (data source) or undefined (not in map) — skip both
  if (!sourceItem || sourceItem.id === targetItem.id) return;

  const connKey = `${sourceItem.id}→${targetItem.id}`;
  if (connectionSet.has(connKey)) return;
  connectionSet.add(connKey);

  connections.push({
    id: `conn-${sourceItem.id}-${targetItem.id}`,
    from: sourceItem.id,
    to: targetItem.id,
    type: 'dependency',
    status: 'valid',
  });
};

// ---------------------------------------------------------------------------
// Azure Well-Architected Framework tier layout
//
// Left → Right, matching real Azure architecture reference diagrams:
//
//  TIER 0         TIER 1          TIER 2           TIER 3         TIER 4          TIER 5
//  Edge /       │ Networking    │ Compute /       │ Data          │ Integration /  │ Security /
//  Management   │ (VNet,GW,FW)  │ Containers      │ (DB, Storage) │ Analytics/AI   │ Monitoring
//
// Same-tier items stack vertically. Wide tiers wrap into a second column.
// A fixed gap separates each tier for visual breathing room.
// Within each tier items are sorted by WAF sub-order (perimeter → internal).
// ---------------------------------------------------------------------------

const CATEGORY_TIER = {
  management:  0, migration: 0, hybrid: 0,
  networking:  1,
  compute:     2, containers: 2,
  storage:     3, databases:  3,
  integration: 4, analytics:  4, ai: 4, iot: 4,
  security:    5, identity:   5, monitoring: 5, unknown: 5,
};

// WAF sub-order within a tier — lower = placed first (top)
const SERVICE_SORT_ORDER = {
  // Tier 0 Management
  resourcegroups: 0, managementgroups: 1, automationaccounts: 2, policy: 3,
  // Networking — perimeter first (CDN/AppGW/FrontDoor), then internal
  cdnprofiles: 0, frontdoors: 0, applicationgateways: 1, trafficmanagerprofiles: 2,
  loadbalancers: 3,
  firewalls: 4, networksecuritygroups: 5,
  virtualnetworks: 6, subnets: 7,
  virtualnetworkgateways: 8, expressroutecircuits: 8,
  bastions: 9, publicipaddresses: 10, networkinterfaces: 11,
  // Compute — orchestrators first
  kubernetesservices: 0, containerapps: 1,
  virtualmachines: 2, vmscalesets: 3,
  appservices: 4, functionapps: 5, appserviceplans: 6,
  containerinstances: 7, containerregistries: 8,
  // Data — primary DBs first, storage last
  sqlserver: 0, sqldatabases: 1, sqlmanagedinstances: 2,
  azurecosmosdb: 3, cacheforredis: 4,
  azuredatabaseformysqlservers: 5, azuredatabaseforpostgresqlservers: 6,
  storageaccounts: 7,
  // Integration
  apimanagement: 0, logicapps: 1,
  servicebusnamespaces: 2, eventhubs: 3, eventgridtopics: 4,
  // Security/Monitoring
  keyvaults: 0, microsoftdefenderforcloud: 1, microsoftsentinel: 2,
  applicationinsights: 3, loganalyticsworkspaces: 4, azuremonitor: 5,
};

const layoutItems = (items) => {
  if (items.length === 0) return;

  // Canvas card: ~120px wide × 130px tall
  const CARD_W   = 120;
  const CARD_H   = 130;
  const COL_GAP  = 45;   // between items in same tier
  const ROW_GAP  = 30;   // between rows
  const MAX_ROWS = 5;    // before wrapping to second column within tier

  const COL_STEP = CARD_W + COL_GAP;  // 165px
  const ROW_STEP = CARD_H + ROW_GAP;  // 160px

  // FIXED tier x positions — tiers never overlap regardless of item count
  // Each tier is allocated enough columns for up to 2 inner columns + gap
  // Tier widths (in column slots): 0=1, 1=2, 2=2, 3=2, 4=2, 5=2
  const TIER_X_PX = {
    0:  80,   // Management  — 1 col
    1:  320,  // Networking  — up to 2 cols (5+5 items)
    2:  720,  // Compute     — up to 2 cols
    3: 1080,  // Data        — up to 2 cols
    4: 1440,  // Integration — up to 2 cols
    5: 1800,  // Security    — up to 2 cols
  };

  // Group by tier
  const tiers = new Map();
  for (const item of items) {
    const cat  = item.metadata?.category || 'unknown';
    const tier = CATEGORY_TIER[cat] ?? 5;
    if (!tiers.has(tier)) tiers.set(tier, []);
    tiers.get(tier).push(item);
  }

  // Sort within each tier by WAF sub-order then name
  for (const [, group] of tiers) {
    group.sort((a, b) => {
      const ao = SERVICE_SORT_ORDER[a.serviceType] ?? 99;
      const bo = SERVICE_SORT_ORDER[b.serviceType] ?? 99;
      if (ao !== bo) return ao - bo;
      return (a.name || '').localeCompare(b.name || '');
    });
  }

  // Max height across all tiers — for vertical centering
  const maxTierH = MAX_ROWS * ROW_STEP - ROW_GAP;

  // Place each item
  for (let t = 0; t <= 5; t++) {
    const group = tiers.get(t);
    if (!group?.length) continue;

    const cols      = Math.ceil(group.length / MAX_ROWS);
    const rowsInCol = Math.ceil(group.length / cols);
    const tierH     = rowsInCol * ROW_STEP - ROW_GAP;
    const topPad    = Math.max(0, Math.round((maxTierH - tierH) / 2));

    group.forEach((item, idx) => {
      const col = Math.floor(idx / rowsInCol);
      const row = idx % rowsInCol;
      item.x = TIER_X_PX[t] + col * COL_STEP;
      item.y = 80 + topPad + row * ROW_STEP;
    });
  }
};

// ---------------------------------------------------------------------------
// Validation helper (used in App.jsx before parsing)
// ---------------------------------------------------------------------------

export const validateTerraformFile = (content, filename = 'main.tf') => {
  const errors = [];
  const warnings = [];

  if (!content || content.trim().length === 0) {
    errors.push('File is empty');
    return { valid: false, errors, warnings };
  }

  if (filename.endsWith('.tf.json') || content.trim().startsWith('{')) {
    try {
      JSON.parse(content);
    } catch (e) {
      errors.push(`Invalid JSON: ${e.message}`);
      return { valid: false, errors, warnings };
    }
  } else {
    const open  = (content.match(/\{/g) || []).length;
    const close = (content.match(/\}/g) || []).length;
    if (open !== close) {
      errors.push(`Unbalanced braces (${open} open vs ${close} close) — file may be truncated`);
    }
    if (!content.includes('resource') && !content.includes('data')) {
      warnings.push('No resource or data blocks found — is this a Terraform file?');
    }
  }

  return { valid: errors.length === 0, errors, warnings };
};
