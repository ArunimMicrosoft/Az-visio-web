// Azure ARM resource type → Canvas metadata mapping
// Covers the resource families listed in the discovery spec.

import { azureIconCategories } from '../azureIcons.js';

// Flatten icon lookup once
const _iconLookup = (() => {
  const map = new Map();
  for (const category of Object.values(azureIconCategories)) {
    for (const icon of category) map.set(icon.id.toLowerCase(), icon);
  }
  return map;
})();

export const getIconPath = (iconId) => {
  if (!iconId) return '/icons/general/10007-icon-service-Resource-Groups.svg';
  const hit = _iconLookup.get(iconId.toLowerCase());
  if (hit) return hit.path;
  for (const [key, icon] of _iconLookup) {
    if (key.includes(iconId.toLowerCase()) || iconId.toLowerCase().includes(key)) return icon.path;
  }
  return '/icons/general/10007-icon-service-Resource-Groups.svg';
};

// Layout tiers (matching the discovery spec order)
//  0 = Top     — Internet / Users / CDN / Front Door
//  1 = Upper   — Networking (VNets, Gateways, Firewalls, LBs, App Gw, Private Endpoints)
//  2 = Middle  — Application layer (App Services, AKS, Functions, VMs, Containers)
//  3 = Lower   — Data layer (SQL, Cosmos, Storage, Redis, Key Vault)
//  4 = Bottom  — Monitoring / Ops (Log Analytics, Monitor, Recovery, Automation)
//  5 = Identity/Management — Entra ID, Managed Identity, RBAC references

export const AZURE_TYPE_MAP = {
  // ── Edge / Top ─────────────────────────────────────────────────────────
  'Microsoft.Cdn/profiles':                       { icon: 'cdnprofiles',       serviceType: 'cdnprofiles',       category: 'networking',  tier: 0, label: 'CDN Profile' },
  'Microsoft.Cdn/profiles/endpoints':             { icon: 'cdnprofiles',       serviceType: 'cdnprofiles',       category: 'networking',  tier: 0, label: 'CDN Endpoint' },
  'Microsoft.Network/frontDoors':                 { icon: 'frontdoors',        serviceType: 'frontdoors',        category: 'networking',  tier: 0, label: 'Front Door (Classic)' },
  'Microsoft.Cdn/profiles/afdEndpoints':          { icon: 'frontdoors',        serviceType: 'frontdoors',        category: 'networking',  tier: 0, label: 'Front Door Endpoint' },
  'Microsoft.Network/trafficmanagerprofiles':     { icon: 'trafficmanagerprofiles', serviceType: 'trafficmanagerprofiles', category: 'networking', tier: 0, label: 'Traffic Manager' },
  'Microsoft.Network/dnszones':                   { icon: 'dnszones',          serviceType: 'dnszones',          category: 'networking',  tier: 0, label: 'DNS Zone' },
  'Microsoft.Network/privateDnsZones':            { icon: 'dnszones',          serviceType: 'dnszones',          category: 'networking',  tier: 1, label: 'Private DNS Zone' },

  // ── Networking / Upper tier ────────────────────────────────────────────
  'Microsoft.Network/virtualNetworks':            { icon: 'virtualnetworks',   serviceType: 'virtualnetworks',   category: 'networking',  tier: 1, label: 'Virtual Network' },
  'Microsoft.Network/virtualNetworks/subnets':    { icon: 'virtualnetworks',   serviceType: 'subnets',           category: 'networking',  tier: 1, label: 'Subnet' },
  'Microsoft.Network/networkSecurityGroups':      { icon: 'networksecuritygroups', serviceType: 'networksecuritygroups', category: 'networking', tier: 1, label: 'NSG' },
  'Microsoft.Network/routeTables':                { icon: 'routetables',       serviceType: 'routetables',       category: 'networking',  tier: 1, label: 'Route Table' },
  'Microsoft.Network/publicIPAddresses':          { icon: 'publicipaddresses', serviceType: 'publicipaddresses', category: 'networking',  tier: 1, label: 'Public IP' },
  'Microsoft.Network/publicIPPrefixes':           { icon: 'publicipaddresses', serviceType: 'publicipaddresses', category: 'networking',  tier: 1, label: 'Public IP Prefix' },
  'Microsoft.Network/loadBalancers':              { icon: 'loadbalancers',     serviceType: 'loadbalancers',     category: 'networking',  tier: 1, label: 'Load Balancer' },
  'Microsoft.Network/applicationGateways':        { icon: 'applicationgateways', serviceType: 'applicationgateways', category: 'networking', tier: 1, label: 'Application Gateway' },
  'Microsoft.Network/azureFirewalls':             { icon: 'firewalls',         serviceType: 'firewalls',         category: 'networking',  tier: 1, label: 'Azure Firewall' },
  'Microsoft.Network/firewallPolicies':           { icon: 'firewalls',         serviceType: 'firewalls',         category: 'networking',  tier: 1, label: 'Firewall Policy' },
  'Microsoft.Network/virtualNetworkGateways':     { icon: 'virtualnetworkgateways', serviceType: 'virtualgateways', category: 'networking', tier: 1, label: 'VNet Gateway' },
  'Microsoft.Network/localNetworkGateways':       { icon: 'virtualnetworkgateways', serviceType: 'virtualgateways', category: 'networking', tier: 1, label: 'Local Network Gateway' },
  'Microsoft.Network/vpnGateways':                { icon: 'virtualnetworkgateways', serviceType: 'virtualgateways', category: 'networking', tier: 1, label: 'VPN Gateway' },
  'Microsoft.Network/expressRouteCircuits':       { icon: 'expressroutecircuits', serviceType: 'expressroutecircuits', category: 'networking', tier: 1, label: 'ExpressRoute Circuit' },
  'Microsoft.Network/expressRouteGateways':       { icon: 'expressroutecircuits', serviceType: 'expressroutecircuits', category: 'networking', tier: 1, label: 'ExpressRoute Gateway' },
  'Microsoft.Network/bastionHosts':               { icon: 'bastions',          serviceType: 'bastions',          category: 'networking',  tier: 1, label: 'Bastion' },
  'Microsoft.Network/natGateways':                { icon: 'natgateway',        serviceType: 'natgateway',        category: 'networking',  tier: 1, label: 'NAT Gateway' },
  'Microsoft.Network/privateEndpoints':           { icon: 'privatelinkservices', serviceType: 'privatelink',    category: 'networking',  tier: 1, label: 'Private Endpoint' },
  'Microsoft.Network/privateLinkServices':        { icon: 'privatelinkservices', serviceType: 'privatelink',    category: 'networking',  tier: 1, label: 'Private Link Service' },
  'Microsoft.Network/networkInterfaces':          { icon: 'networkinterfaces', serviceType: 'networkinterfaces', category: 'networking',  tier: 1, label: 'Network Interface' },
  'Microsoft.Network/networkWatchers':            { icon: 'networkwatcher',    serviceType: 'networkwatcher',    category: 'networking',  tier: 1, label: 'Network Watcher' },
  'Microsoft.Network/applicationSecurityGroups':  { icon: 'applicationsecuritygroups', serviceType: 'applicationsecuritygroups', category: 'networking', tier: 1, label: 'Application Security Group' },
  'Microsoft.Network/virtualWans':                { icon: 'virtualwans',       serviceType: 'virtualwans',       category: 'networking',  tier: 1, label: 'Virtual WAN' },
  'Microsoft.Network/virtualHubs':                { icon: 'virtualwans',       serviceType: 'virtualwans',       category: 'networking',  tier: 1, label: 'Virtual Hub' },
  'Microsoft.Network/dnsResolvers':               { icon: 'dnszones',          serviceType: 'dnszones',          category: 'networking',  tier: 1, label: 'DNS Private Resolver' },

  // ── Compute / Middle tier ──────────────────────────────────────────────
  'Microsoft.Compute/virtualMachines':            { icon: 'virtualmachines',   serviceType: 'virtualmachines',   category: 'compute',     tier: 2, label: 'Virtual Machine' },
  'Microsoft.Compute/virtualMachineScaleSets':    { icon: 'virtualmachinescalesets', serviceType: 'vmscalesets', category: 'compute',     tier: 2, label: 'VM Scale Set' },
  'Microsoft.Compute/availabilitySets':           { icon: 'availabilitysets',  serviceType: 'availabilitysets',  category: 'compute',     tier: 2, label: 'Availability Set' },
  'Microsoft.Compute/disks':                      { icon: 'disks',             serviceType: 'disks',             category: 'storage',     tier: 3, label: 'Managed Disk' },
  'Microsoft.Compute/snapshots':                  { icon: 'snapshots',         serviceType: 'snapshots',         category: 'storage',     tier: 3, label: 'Snapshot' },
  'Microsoft.Compute/images':                     { icon: 'disks',             serviceType: 'disks',             category: 'compute',     tier: 2, label: 'VM Image' },
  'Microsoft.Compute/galleries':                  { icon: 'disks',             serviceType: 'disks',             category: 'compute',     tier: 2, label: 'Shared Image Gallery' },
  'Microsoft.ContainerService/managedClusters':   { icon: 'kubernetesservices', serviceType: 'kubernetesservices', category: 'containers', tier: 2, label: 'AKS Cluster' },
  'Microsoft.ContainerService/managedClusters/agentPools': { icon: 'kubernetesservices', serviceType: 'kubernetesservices', category: 'containers', tier: 2, label: 'AKS Node Pool' },
  'Microsoft.App/containerApps':                  { icon: 'containerinstances', serviceType: 'containerapps',    category: 'containers',  tier: 2, label: 'Container App' },
  'Microsoft.App/managedEnvironments':            { icon: 'containerinstances', serviceType: 'containerapps',    category: 'containers',  tier: 2, label: 'Container Apps Env' },
  'Microsoft.ContainerInstance/containerGroups':  { icon: 'containerinstances', serviceType: 'containerinstances', category: 'containers', tier: 2, label: 'Container Instance' },
  'Microsoft.ContainerRegistry/registries':       { icon: 'containerregistries', serviceType: 'containerregistries', category: 'containers', tier: 2, label: 'Container Registry' },
  'Microsoft.Web/sites':                          { icon: 'appservices',       serviceType: 'appservices',       category: 'compute',     tier: 2, label: 'App Service' },
  'Microsoft.Web/serverfarms':                    { icon: 'appserviceplans',   serviceType: 'appserviceplans',   category: 'compute',     tier: 2, label: 'App Service Plan' },
  'Microsoft.Web/staticSites':                    { icon: 'appservices',       serviceType: 'appservices',       category: 'compute',     tier: 2, label: 'Static Web App' },
  'Microsoft.Logic/workflows':                    { icon: 'logicapps',         serviceType: 'logicapps',         category: 'integration', tier: 2, label: 'Logic App' },
  'Microsoft.Batch/batchAccounts':                { icon: 'batchaccounts',     serviceType: 'batchaccounts',     category: 'compute',     tier: 2, label: 'Batch Account' },

  // ── Data / Lower tier ──────────────────────────────────────────────────
  'Microsoft.Sql/servers':                        { icon: 'sqlserver',         serviceType: 'sqlserver',         category: 'databases',   tier: 3, label: 'SQL Server' },
  'Microsoft.Sql/servers/databases':              { icon: 'sqldatabases',     serviceType: 'sqldatabases',      category: 'databases',   tier: 3, label: 'SQL Database' },
  'Microsoft.Sql/managedInstances':               { icon: 'sqlmanagedinstances', serviceType: 'sqlmanagedinstances', category: 'databases', tier: 3, label: 'SQL Managed Instance' },
  'Microsoft.Sql/managedInstances/databases':     { icon: 'sqldatabases',     serviceType: 'sqldatabases',      category: 'databases',   tier: 3, label: 'MI Database' },
  'Microsoft.DocumentDB/databaseAccounts':        { icon: 'azurecosmosdb',    serviceType: 'azurecosmosdb',     category: 'databases',   tier: 3, label: 'Cosmos DB' },
  'Microsoft.Cache/redis':                        { icon: 'cacheforredis',    serviceType: 'cacheforredis',     category: 'databases',   tier: 3, label: 'Redis Cache' },
  'Microsoft.DBforMySQL/servers':                 { icon: 'azuredatabaseformysqlservers', serviceType: 'azuredatabaseformysqlservers', category: 'databases', tier: 3, label: 'MySQL Server' },
  'Microsoft.DBforMySQL/flexibleServers':         { icon: 'azuredatabaseformysqlservers', serviceType: 'azuredatabaseformysqlservers', category: 'databases', tier: 3, label: 'MySQL Flexible' },
  'Microsoft.DBforPostgreSQL/servers':            { icon: 'azuredatabaseforpostgresqlservers', serviceType: 'azuredatabaseforpostgresqlservers', category: 'databases', tier: 3, label: 'PostgreSQL' },
  'Microsoft.DBforPostgreSQL/flexibleServers':    { icon: 'azuredatabaseforpostgresqlservers', serviceType: 'azuredatabaseforpostgresqlservers', category: 'databases', tier: 3, label: 'PostgreSQL Flexible' },
  'Microsoft.DBforMariaDB/servers':               { icon: 'azuredatabaseformariadbservers', serviceType: 'azuredatabaseformariadbservers', category: 'databases', tier: 3, label: 'MariaDB' },
  'Microsoft.Storage/storageAccounts':            { icon: 'storageaccounts',  serviceType: 'storageaccounts',   category: 'storage',     tier: 3, label: 'Storage Account' },
  'Microsoft.Storage/storageAccounts/blobServices': { icon: 'storageaccounts', serviceType: 'storageaccounts',  category: 'storage',     tier: 3, label: 'Blob Service' },
  'Microsoft.NetApp/netAppAccounts':              { icon: 'azurenetappfiles', serviceType: 'azurenetappfiles',  category: 'storage',     tier: 3, label: 'NetApp Files' },
  'Microsoft.DataLakeStore/accounts':             { icon: 'datalakestoregen1', serviceType: 'datalakestoregen1', category: 'storage',     tier: 3, label: 'Data Lake Store' },
  'Microsoft.Synapse/workspaces':                 { icon: 'azuresynapseanalytics', serviceType: 'azuresynapseanalytics', category: 'analytics', tier: 3, label: 'Synapse Workspace' },
  'Microsoft.Databricks/workspaces':              { icon: 'azuresynapseanalytics', serviceType: 'azuresynapseanalytics', category: 'analytics', tier: 3, label: 'Databricks Workspace' },

  // ── Integration ────────────────────────────────────────────────────────
  'Microsoft.ApiManagement/service':              { icon: 'appservices',      serviceType: 'apimanagement',    category: 'integration', tier: 2, label: 'API Management' },
  'Microsoft.ServiceBus/namespaces':              { icon: 'appservices',      serviceType: 'servicebusnamespaces', category: 'integration', tier: 2, label: 'Service Bus' },
  'Microsoft.EventHub/namespaces':                { icon: 'appservices',      serviceType: 'eventhubs',        category: 'integration', tier: 2, label: 'Event Hubs' },
  'Microsoft.EventGrid/topics':                   { icon: 'appservices',      serviceType: 'eventgridtopics',  category: 'integration', tier: 2, label: 'Event Grid Topic' },
  'Microsoft.EventGrid/systemTopics':             { icon: 'appservices',      serviceType: 'eventgridtopics',  category: 'integration', tier: 2, label: 'Event Grid System Topic' },
  'Microsoft.SignalRService/signalR':             { icon: 'appservices',      serviceType: 'signalr',          category: 'integration', tier: 2, label: 'SignalR' },

  // ── Security / Identity ────────────────────────────────────────────────
  'Microsoft.KeyVault/vaults':                    { icon: 'keyvaults',        serviceType: 'keyvaults',        category: 'security',    tier: 3, label: 'Key Vault' },
  'Microsoft.ManagedIdentity/userAssignedIdentities': { icon: 'keyvaults',    serviceType: 'managedidentities', category: 'identity',    tier: 5, label: 'Managed Identity' },
  'Microsoft.Security/pricings':                  { icon: 'microsoftdefenderforcloud', serviceType: 'microsoftdefenderforcloud', category: 'security', tier: 4, label: 'Defender for Cloud' },
  'Microsoft.SecurityInsights/workspaces':        { icon: 'microsoftsentinel', serviceType: 'microsoftsentinel', category: 'security',    tier: 4, label: 'Sentinel' },

  // ── Monitoring / Ops ───────────────────────────────────────────────────
  'Microsoft.OperationalInsights/workspaces':     { icon: 'loganalyticsworkspaces', serviceType: 'loganalyticsworkspaces', category: 'monitoring', tier: 4, label: 'Log Analytics' },
  'Microsoft.Insights/components':                { icon: 'applicationinsights', serviceType: 'applicationinsights', category: 'monitoring', tier: 4, label: 'Application Insights' },
  'Microsoft.Insights/actionGroups':              { icon: 'azuremonitor',     serviceType: 'azuremonitor',     category: 'monitoring',  tier: 4, label: 'Action Group' },
  'Microsoft.Insights/metricAlerts':              { icon: 'azuremonitor',     serviceType: 'azuremonitor',     category: 'monitoring',  tier: 4, label: 'Metric Alert' },
  'Microsoft.RecoveryServices/vaults':            { icon: 'recoveryservicesvaults', serviceType: 'recoveryservicesvaults', category: 'monitoring', tier: 4, label: 'Recovery Vault' },
  'Microsoft.DataProtection/backupVaults':        { icon: 'backupvaults',     serviceType: 'backupvaults',     category: 'monitoring',  tier: 4, label: 'Backup Vault' },
  'Microsoft.Automation/automationAccounts':      { icon: 'automationaccounts', serviceType: 'automationaccounts', category: 'management', tier: 4, label: 'Automation Account' },

  // ── Management / Governance ────────────────────────────────────────────
  'Microsoft.Resources/resourceGroups':           { icon: 'resourcegroups',   serviceType: 'resourcegroups',   category: 'management',  tier: 5, label: 'Resource Group' },
  'Microsoft.Resources/subscriptions':            { icon: 'resourcegroups',   serviceType: 'subscriptions',    category: 'management',  tier: 5, label: 'Subscription' },
  'Microsoft.Management/managementGroups':        { icon: 'resourcegroups',   serviceType: 'managementgroups', category: 'management',  tier: 5, label: 'Management Group' },
  'Microsoft.Authorization/policyDefinitions':    { icon: 'resourcegroups',   serviceType: 'policy',           category: 'management',  tier: 5, label: 'Policy Definition' },
  'Microsoft.Authorization/policyAssignments':    { icon: 'resourcegroups',   serviceType: 'policy',           category: 'management',  tier: 5, label: 'Policy Assignment' },
  'Microsoft.Authorization/roleAssignments':      { icon: 'resourcegroups',   serviceType: 'policy',           category: 'identity',    tier: 5, label: 'Role Assignment' },
};

// Child resource types to skip on the canvas (represented by parent or by edges)
export const SKIP_CHILD_TYPES = new Set([
  // Network sub-resources — represented by their parent
  'Microsoft.Network/networkSecurityGroups/securityRules',
  'Microsoft.Network/loadBalancers/backendAddressPools',
  'Microsoft.Network/loadBalancers/frontendIPConfigurations',
  'Microsoft.Network/loadBalancers/loadBalancingRules',
  'Microsoft.Network/loadBalancers/probes',
  'Microsoft.Network/loadBalancers/inboundNatRules',
  'Microsoft.Network/applicationGateways/backendAddressPools',
  'Microsoft.Network/applicationGateways/frontendIPConfigurations',
  'Microsoft.Network/applicationGateways/httpListeners',
  'Microsoft.Network/applicationGateways/routingRules',
  'Microsoft.Network/routeTables/routes',
  'Microsoft.Network/virtualNetworks/virtualNetworkPeerings',
  'Microsoft.Network/networkInterfaces/ipConfigurations',
  'Microsoft.Network/dnszones/A',
  'Microsoft.Network/dnszones/CNAME',
  'Microsoft.Network/privateDnsZones/virtualNetworkLinks',
  'Microsoft.Network/privateDnsZones/A',
  // Compute sub-resources — noise on the diagram
  'Microsoft.Compute/virtualMachines/extensions',
  'Microsoft.Compute/virtualMachines/runCommands',
  // DevTestLab / auto-shutdown schedules — operational, not architectural
  'Microsoft.DevTestLab/schedules',
  'microsoft.devtestlab/schedules',
  // Data plane / config sub-resources
  'Microsoft.Storage/storageAccounts/blobServices',
  'Microsoft.Storage/storageAccounts/blobServices/containers',
  'Microsoft.Storage/storageAccounts/fileServices',
  'Microsoft.Storage/storageAccounts/queueServices',
  'Microsoft.Sql/servers/firewallRules',
  'Microsoft.Sql/servers/administrators',
  'Microsoft.Sql/servers/auditingSettings',
  // Alerts and diagnostic settings — attach via edges rather than clutter
  'microsoft.insights/metricAlerts',
  'Microsoft.Insights/diagnosticSettings',
  'microsoft.insights/webtests',
  // Maintenance configs — ops metadata, not architectural
  'Microsoft.Maintenance/maintenanceConfigurations',
  'microsoft.maintenance/maintenanceconfigurations',
]);

// Get metadata for a resource type — supports partial match for versioned names
// Pre-compute lowercase lookups so ARM type-casing quirks don't cause misses.
const _typeMapLower = new Map(Object.entries(AZURE_TYPE_MAP).map(([k, v]) => [k.toLowerCase(), v]));
const _skipLower    = new Set([...SKIP_CHILD_TYPES].map(t => t.toLowerCase()));

export function mapAzureType(azureType) {
  if (!azureType) return null;
  const lower = azureType.toLowerCase();
  if (_skipLower.has(lower)) return null;

  // Exact match (case-insensitive)
  if (_typeMapLower.has(lower)) return _typeMapLower.get(lower);

  // Try parent path (drop last segment iteratively)
  const parts = lower.split('/');
  while (parts.length > 2) {
    parts.pop();
    const parent = parts.join('/');
    if (_typeMapLower.has(parent)) return _typeMapLower.get(parent);
  }

  // Not a recognized architectural resource — signal caller to drop it.
  return null;
}
