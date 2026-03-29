// Enterprise Bicep Template Generator
// Generates production-ready Azure Bicep (.bicep) files from canvas items
// Maps serviceType IDs (from azureIcons.js) to proper Bicep resource definitions

// ── Resource mappings keyed by serviceType (icon ID) ──
const BICEP_MAP = {
  // Compute
  virtualmachine:       { type: 'Microsoft.Compute/virtualMachines',           api: '2024-03-01', sku: 'Standard_D2s_v5' },
  vmscalesets:          { type: 'Microsoft.Compute/virtualMachineScaleSets',   api: '2024-03-01', sku: 'Standard_D2s_v5' },
  appservices:          { type: 'Microsoft.Web/sites',                         api: '2023-12-01', kind: 'app' },
  functionapps:         { type: 'Microsoft.Web/sites',                         api: '2023-12-01', kind: 'functionapp' },
  kubernetesservices:   { type: 'Microsoft.ContainerService/managedClusters',  api: '2024-01-01', sku: 'Standard_D4s_v5' },
  batchaccounts:        { type: 'Microsoft.Batch/batchAccounts',               api: '2024-02-01' },
  // Containers
  containerregistries:  { type: 'Microsoft.ContainerRegistry/registries',      api: '2023-11-01-preview', skuName: 'Standard' },
  containerinstances:   { type: 'Microsoft.ContainerInstance/containerGroups',  api: '2023-05-01' },
  // Networking
  virtualnetworks:      { type: 'Microsoft.Network/virtualNetworks',           api: '2024-01-01' },
  subnets:              { type: 'Microsoft.Network/virtualNetworks/subnets',   api: '2024-01-01' },
  applicationgateways:  { type: 'Microsoft.Network/applicationGateways',       api: '2024-01-01', sku: 'Standard_v2' },
  loadbalancers:        { type: 'Microsoft.Network/loadBalancers',             api: '2024-01-01', skuName: 'Standard' },
  firewalls:            { type: 'Microsoft.Network/azureFirewalls',            api: '2024-01-01', skuName: 'AZFW_VNet', skuTier: 'Standard' },
  bastions:             { type: 'Microsoft.Network/bastionHosts',              api: '2024-01-01', skuName: 'Standard' },
  virtualnetworkgateways: { type: 'Microsoft.Network/virtualNetworkGateways',  api: '2024-01-01' },
  publicipaddresses:    { type: 'Microsoft.Network/publicIPAddresses',         api: '2024-01-01', skuName: 'Standard' },
  networksecuritygroups:{ type: 'Microsoft.Network/networkSecurityGroups',     api: '2024-01-01' },
  dnszones:             { type: 'Microsoft.Network/dnsZones',                  api: '2023-07-01-preview' },
  trafficmanagerprofiles:{ type: 'Microsoft.Network/trafficManagerProfiles',   api: '2022-04-01' },
  frontdoorandcdnprofiles:{ type: 'Microsoft.Cdn/profiles',                   api: '2024-02-01', skuName: 'Premium_AzureFrontDoor' },
  cdnprofiles:          { type: 'Microsoft.Cdn/profiles',                      api: '2024-02-01', skuName: 'Standard_Microsoft' },
  expressroutecircuits: { type: 'Microsoft.Network/expressRouteCircuits',      api: '2024-01-01' },
  routetables:          { type: 'Microsoft.Network/routeTables',               api: '2024-01-01' },
  networkinterfaces:    { type: 'Microsoft.Network/networkInterfaces',         api: '2024-01-01' },
  // Storage
  storageaccounts:      { type: 'Microsoft.Storage/storageAccounts',           api: '2023-05-01', kind: 'StorageV2', skuName: 'Standard_LRS' },
  disks:                { type: 'Microsoft.Compute/disks',                     api: '2024-03-02', skuName: 'Premium_LRS', diskSizeGb: 128 },
  // Databases
  sqldatabase:          { type: 'Microsoft.Sql/servers',                       api: '2023-08-01-preview' },
  sqlserver:            { type: 'Microsoft.Sql/servers',                       api: '2023-08-01-preview' },
  azurecosmosdb:        { type: 'Microsoft.DocumentDB/databaseAccounts',       api: '2024-02-15-preview' },
  cacheredis:           { type: 'Microsoft.Cache/redis',                       api: '2024-03-01', skuName: 'Standard', skuFamily: 'C', skuCapacity: 1 },
  azuredatabasemysqlserver:      { type: 'Microsoft.DBforMySQL/flexibleServers',       api: '2023-12-30' },
  azuredatabasepostgresqlserver: { type: 'Microsoft.DBforPostgreSQL/flexibleServers',  api: '2023-12-01-preview' },
  // Security
  keyvaults:            { type: 'Microsoft.KeyVault/vaults',                   api: '2023-07-01' },
  azuresentinel:        { type: 'Microsoft.OperationalInsights/workspaces',    api: '2023-09-01' },
  microsoftdefenderforcloud: { type: 'Microsoft.Security/pricings',            api: '2024-01-01' },
  // Monitoring
  applicationinsights:  { type: 'Microsoft.Insights/components',               api: '2020-02-02', kind: 'web' },
  loganalyticsworkspaces:{ type: 'Microsoft.OperationalInsights/workspaces',   api: '2023-09-01' },
  // Integration
  azureservicebus:      { type: 'Microsoft.ServiceBus/namespaces',             api: '2022-10-01-preview', skuName: 'Standard' },
  servicebusnamespaces: { type: 'Microsoft.ServiceBus/namespaces',             api: '2022-10-01-preview', skuName: 'Standard' },
  eventhubs:            { type: 'Microsoft.EventHub/namespaces',               api: '2024-01-01', skuName: 'Standard' },
  eventgridtopics:      { type: 'Microsoft.EventGrid/topics',                  api: '2024-06-01-preview' },
  apimanagementservices:{ type: 'Microsoft.ApiManagement/service',             api: '2023-09-01-preview', skuName: 'Consumption', skuCapacity: 0 },
  // Analytics
  datafactories:        { type: 'Microsoft.DataFactory/factories',             api: '2018-06-01' },
  azuredatabricks:      { type: 'Microsoft.Databricks/workspaces',             api: '2024-05-01', skuName: 'premium' },
  azuresynapseanalytics:{ type: 'Microsoft.Synapse/workspaces',                api: '2021-06-01' },
  streamanalyticsjobs:  { type: 'Microsoft.StreamAnalytics/streamingJobs',     api: '2021-10-01-preview' },
  azuredataexplorerclusters:{ type: 'Microsoft.Kusto/clusters',                api: '2023-08-15', skuName: 'Standard_E2ads_v5' },
  powerbiembedded:      { type: 'Microsoft.PowerBIDedicated/capacities',       api: '2021-01-01', skuName: 'A1' },
  // AI/ML
  cognitiveservices:    { type: 'Microsoft.CognitiveServices/accounts',        api: '2024-04-01-preview', kind: 'CognitiveServices', skuName: 'S0' },
  azureopenai:          { type: 'Microsoft.CognitiveServices/accounts',        api: '2024-04-01-preview', kind: 'OpenAI', skuName: 'S0' },
  cognitivesearch:      { type: 'Microsoft.Search/searchServices',             api: '2024-03-01-preview', skuName: 'standard' },
  machinelearning:      { type: 'Microsoft.MachineLearningServices/workspaces',api: '2024-04-01' },
  botservices:          { type: 'Microsoft.BotService/botServices',            api: '2022-09-15', kind: 'azurebot', skuName: 'S1' },
  // IoT
  iothub:               { type: 'Microsoft.Devices/IotHubs',                   api: '2023-06-30', skuName: 'S1', skuCapacity: 1 },
  // DevOps
  azuredevops:          { type: 'Microsoft.DevOps/pipelines',                  api: '2020-07-13-preview' },
  // Recovery
  recoveryservicesvaults:{ type: 'Microsoft.RecoveryServices/vaults',          api: '2024-01-01', skuName: 'Standard' },
};
