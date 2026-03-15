// Azure Cost Calculator
// Estimates monthly costs for Azure services based on current pricing (2026)

/**
 * Azure Regions with pricing multipliers
 */
export const azureRegions = {
  'eastus': { name: 'East US', multiplier: 1.0 },
  'eastus2': { name: 'East US 2', multiplier: 1.0 },
  'westus': { name: 'West US', multiplier: 1.0 },
  'westus2': { name: 'West US 2', multiplier: 1.0 },
  'centralus': { name: 'Central US', multiplier: 1.0 },
  'northcentralus': { name: 'North Central US', multiplier: 1.0 },
  'southcentralus': { name: 'South Central US', multiplier: 1.0 },
  'westcentralus': { name: 'West Central US', multiplier: 1.0 },
  'northeurope': { name: 'North Europe', multiplier: 1.05 },
  'westeurope': { name: 'West Europe', multiplier: 1.10 },
  'uksouth': { name: 'UK South', multiplier: 1.12 },
  'ukwest': { name: 'UK West', multiplier: 1.12 },
  'francecentral': { name: 'France Central', multiplier: 1.08 },
  'germanywestcentral': { name: 'Germany West Central', multiplier: 1.09 },
  'switzerlandnorth': { name: 'Switzerland North', multiplier: 1.25 },
  'norwayeast': { name: 'Norway East', multiplier: 1.15 },
  'eastasia': { name: 'East Asia', multiplier: 1.08 },
  'southeastasia': { name: 'Southeast Asia', multiplier: 1.12 },
  'japaneast': { name: 'Japan East', multiplier: 1.15 },
  'japanwest': { name: 'Japan West', multiplier: 1.18 },
  'australiaeast': { name: 'Australia East', multiplier: 1.20 },
  'australiasoutheast': { name: 'Australia Southeast', multiplier: 1.22 },
  'brazilsouth': { name: 'Brazil South', multiplier: 1.30 },
  'canadacentral': { name: 'Canada Central', multiplier: 1.05 },
  'canadaeast': { name: 'Canada East', multiplier: 1.07 },
  'southafricanorth': { name: 'South Africa North', multiplier: 1.25 },
  'uaenorth': { name: 'UAE North', multiplier: 1.20 },
  'indiacentral': { name: 'India Central', multiplier: 0.95 },
  'southindia': { name: 'South India', multiplier: 0.97 },
  'koreacentral': { name: 'Korea Central', multiplier: 1.10 }
};

/**
 * Currency exchange rates (relative to USD)
 */
export const currencies = {
  'USD': { symbol: '$', name: 'US Dollar', rate: 1.0 },
  'EUR': { symbol: '€', name: 'Euro', rate: 0.92 },
  'GBP': { symbol: '£', name: 'British Pound', rate: 0.79 },
  'JPY': { symbol: '¥', name: 'Japanese Yen', rate: 149.50 },
  'AUD': { symbol: 'A$', name: 'Australian Dollar', rate: 1.54 },
  'CAD': { symbol: 'C$', name: 'Canadian Dollar', rate: 1.35 },
  'CHF': { symbol: 'CHF', name: 'Swiss Franc', rate: 0.89 },
  'CNY': { symbol: '¥', name: 'Chinese Yuan', rate: 7.24 },
  'INR': { symbol: '₹', name: 'Indian Rupee', rate: 83.25 },
  'BRL': { symbol: 'R$', name: 'Brazilian Real', rate: 4.98 },
  'ZAR': { symbol: 'R', name: 'South African Rand', rate: 18.65 },
  'AED': { symbol: 'د.إ', name: 'UAE Dirham', rate: 3.67 },
  'KRW': { symbol: '₩', name: 'South Korean Won', rate: 1329.50 },
  'SEK': { symbol: 'kr', name: 'Swedish Krona', rate: 10.42 },
  'NOK': { symbol: 'kr', name: 'Norwegian Krone', rate: 10.68 }
};

/**
 * Azure Pricing Database (USD/month - East US region)
 * Updated: February 2026
 */
const azurePricing = {
  // Compute
  vm: {
    name: 'Virtual Machine',
    baseCost: 29.20, // Standard_B2s (2 vCPU, 4 GB RAM)
    unit: 'per VM/month',
    details: 'Standard_B2s: 2 vCPU, 4 GB RAM, Pay-as-you-go'
  },
  vmss: {
    name: 'VM Scale Set',
    baseCost: 58.40, // 2 instances @ $29.20 each
    unit: 'per 2 instances/month',
    details: 'Standard_B2s: 2 instances x 2 vCPU, 4 GB RAM each'
  },
  function: {
    name: 'Function App',
    baseCost: 0.20, // Consumption plan - includes 1M executions free
    unit: 'per million executions',
    details: 'Consumption Plan (first 1M executions/month free)'
  },
  appservice: {
    name: 'App Service',
    baseCost: 54.75, // B1: Basic tier
    unit: 'per instance/month',
    details: 'Basic B1: 1 Core, 1.75 GB RAM, 10 GB storage'
  },
  aks: {
    name: 'Kubernetes Service',
    baseCost: 73.00, // Free control plane + 2 nodes @ $36.50 each
    unit: 'per cluster/month',
    details: 'Free cluster management + 2x Standard_B2s nodes'
  },
  batch: {
    name: 'Batch Accounts',
    baseCost: 0.00,
    unit: 'free',
    details: 'No additional cost (pay only for underlying compute)'
  },
  cloudservices: {
    name: 'Cloud Services',
    baseCost: 96.00,
    unit: 'per instance/month',
    details: 'Standard A1: 1 Core, 1.75 GB RAM'
  },
  containerinstances: {
    name: 'Container Instances',
    baseCost: 44.21,
    unit: 'per instance/month',
    details: '1 vCPU, 1.5 GB RAM, Linux'
  },
  servicefabric: {
    name: 'Service Fabric',
    baseCost: 87.60,
    unit: 'per 3-node cluster/month',
    details: '3x Standard_D2s_v3 nodes'
  },

  // Storage
  storage: {
    name: 'Storage Account',
    baseCost: 20.48, // 1 TB LRS
    unit: 'per TB/month',
    details: 'General Purpose v2, LRS, 1 TB, Hot tier'
  },
  datalake: {
    name: 'Data Lake Storage',
    baseCost: 18.40, // 1 TB
    unit: 'per TB/month',
    details: 'Gen2, Standard performance, 1 TB'
  },
  netapp: {
    name: 'Azure NetApp Files',
    baseCost: 163.84,
    unit: 'per TB/month',
    details: 'Standard tier, 4 TB minimum'
  },
  databox: {
    name: 'Data Box',
    baseCost: 0.00,
    unit: 'per order',
    details: 'One-time order cost varies'
  },
  fileshares: {
    name: 'File Shares',
    baseCost: 25.60,
    unit: 'per 100 GB/month',
    details: 'Premium tier, 100 GB'
  },
  recovery: {
    name: 'Recovery Services Vault',
    baseCost: 10.00,
    unit: 'per protected instance/month',
    details: 'Azure Backup, Standard tier'
  },

  // Databases
  sqldb: {
    name: 'SQL Database',
    baseCost: 4.90, // Basic tier
    unit: 'per database/month',
    details: 'Basic tier: 5 DTUs, 2 GB storage'
  },
  cosmosdb: {
    name: 'Cosmos DB',
    baseCost: 23.36, // 400 RU/s
    unit: 'per 400 RU/s/month',
    details: 'Provisioned throughput, 400 RU/s, 1 GB storage'
  },
  mysql: {
    name: 'MySQL Database',
    baseCost: 51.48,
    unit: 'per instance/month',
    details: 'General Purpose: 2 vCore, 10 GB storage'
  },
  postgres: {
    name: 'PostgreSQL Database',
    baseCost: 51.48,
    unit: 'per instance/month',
    details: 'General Purpose: 2 vCore, 10 GB storage'
  },
  mariadb: {
    name: 'MariaDB Database',
    baseCost: 51.48,
    unit: 'per instance/month',
    details: 'General Purpose: 2 vCore, 10 GB storage'
  },
  synapse: {
    name: 'Synapse Analytics',
    baseCost: 1.20,
    unit: 'per DWU/hour',
    details: 'DW100c, pay-as-you-go (≈$876/month if always on)'
  },
  datafactory: {
    name: 'Data Factory',
    baseCost: 0.50,
    unit: 'per pipeline run',
    details: 'Pay per activity run + compute hours'
  },
  sqlserver: {
    name: 'SQL Server',
    baseCost: 4.90,
    unit: 'per database/month',
    details: 'Logical server, no additional cost'
  },
  sqlmi: {
    name: 'SQL Managed Instance',
    baseCost: 622.08,
    unit: 'per instance/month',
    details: 'General Purpose: 4 vCore, 32 GB RAM'
  },
  cache: {
    name: 'Cache for Redis',
    baseCost: 16.06,
    unit: 'per cache/month',
    details: 'Basic C0: 250 MB cache'
  },

  // Networking
  vnet: {
    name: 'Virtual Network',
    baseCost: 0.00,
    unit: 'free',
    details: 'No charge for virtual networks'
  },
  loadbalancer: {
    name: 'Load Balancer',
    baseCost: 18.25, // Standard
    unit: 'per instance/month',
    details: 'Standard SKU, 5 rules'
  },
  vpngateway: {
    name: 'VPN Gateway',
    baseCost: 127.75,
    unit: 'per gateway/month',
    details: 'VpnGw1: 650 Mbps, 30 S2S tunnels'
  },
  dns: {
    name: 'DNS Zones',
    baseCost: 0.50,
    unit: 'per zone/month',
    details: 'First 25 zones, 1M queries'
  },
  trafficmgr: {
    name: 'Traffic Manager',
    baseCost: 0.54,
    unit: 'per profile/month',
    details: '1M health checks, 1M DNS queries'
  },
  bastion: {
    name: 'Bastion',
    baseCost: 140.16,
    unit: 'per instance/month',
    details: 'Basic SKU, 2 scale units'
  },
  firewall: {
    name: 'Azure Firewall',
    baseCost: 912.50,
    unit: 'per instance/month',
    details: 'Standard tier, 1 TB data processed'
  },
  appgw: {
    name: 'Application Gateway',
    baseCost: 179.13,
    unit: 'per gateway/month',
    details: 'WAF V2, 2 capacity units'
  },
  nsg: {
    name: 'Network Security Group',
    baseCost: 0.00,
    unit: 'free',
    details: 'No additional charge'
  },
  publicip: {
    name: 'Public IP Address',
    baseCost: 3.65,
    unit: 'per IP/month',
    details: 'Static IP address'
  },
  frontdoor: {
    name: 'Front Door',
    baseCost: 35.00,
    unit: 'per instance/month',
    details: 'Standard tier, 100 GB outbound transfer'
  },
  expressroute: {
    name: 'ExpressRoute',
    baseCost: 51.00,
    unit: 'per circuit/month',
    details: 'Metered data plan, 50 Mbps'
  },
  privatelink: {
    name: 'Private Link',
    baseCost: 7.30,
    unit: 'per endpoint/month',
    details: 'Per private endpoint'
  },
  nat: {
    name: 'NAT Gateway',
    baseCost: 32.85,
    unit: 'per gateway/month',
    details: 'NAT Gateway + 1 TB data processed'
  },

  // Security
  keyvault: {
    name: 'Key Vault',
    baseCost: 0.03,
    unit: 'per 10K operations',
    details: 'Standard tier, 10K operations'
  },
  sentinel: {
    name: 'Azure Sentinel',
    baseCost: 2.46,
    unit: 'per GB/day',
    details: 'Pay-as-you-go, 5 GB/day ingestion'
  },
  defender: {
    name: 'Defender for Cloud',
    baseCost: 15.00,
    unit: 'per server/month',
    details: 'Standard tier per resource'
  },
  appsecgroup: {
    name: 'Application Security Group',
    baseCost: 0.00,
    unit: 'free',
    details: 'No additional charge'
  },
  conditionalaccess: {
    name: 'Conditional Access',
    baseCost: 0.00,
    unit: 'included in Azure AD',
    details: 'Requires Azure AD Premium P1'
  },
  mfa: {
    name: 'Multifactor Authentication',
    baseCost: 0.00,
    unit: 'included in Azure AD',
    details: 'Free with Azure AD'
  },
  defenderiot: {
    name: 'Defender for IoT',
    baseCost: 50.00,
    unit: 'per device/month',
    details: 'Enterprise tier, 100 devices'
  },

  // Integration
  servicebus: {
    name: 'Service Bus',
    baseCost: 0.05,
    unit: 'per million operations',
    details: 'Standard tier, 12.5M ops included'
  },
  eventhubs: {
    name: 'Event Hubs',
    baseCost: 11.23,
    unit: 'per throughput unit/month',
    details: 'Standard tier, 1 throughput unit'
  },
  apim: {
    name: 'API Management',
    baseCost: 48.95,
    unit: 'per unit/month',
    details: 'Developer tier, 1 unit'
  },
  logicapps: {
    name: 'Logic Apps',
    baseCost: 0.000125,
    unit: 'per action execution',
    details: 'Consumption plan (≈$12.50 per 100K actions)'
  },
  eventgrid: {
    name: 'Event Grid',
    baseCost: 0.60,
    unit: 'per million operations',
    details: 'First 100K operations free/month'
  },
  relays: {
    name: 'Relays',
    baseCost: 0.011,
    unit: 'per relay hour',
    details: 'Standard tier (≈$8/month per relay)'
  },
  apiconnections: {
    name: 'API Connections',
    baseCost: 0.00,
    unit: 'free',
    details: 'No additional cost (part of Logic Apps)'
  },
  appconfig: {
    name: 'App Configuration',
    baseCost: 1.20,
    unit: 'per store/day',
    details: 'Standard tier (≈$36/month)'
  },

  // Monitoring
  monitor: {
    name: 'Azure Monitor',
    baseCost: 2.76,
    unit: 'per GB ingested',
    details: 'Log Analytics, 5 GB/month (first 5 GB free)'
  },
  appinsights: {
    name: 'Application Insights',
    baseCost: 2.88,
    unit: 'per GB ingested',
    details: '5 GB/month (first 5 GB free)'
  },
  loganalytics: {
    name: 'Log Analytics',
    baseCost: 2.76,
    unit: 'per GB ingested',
    details: '5 GB/month (first 5 GB free)'
  },
  activitylog: {
    name: 'Activity Log',
    baseCost: 0.00,
    unit: 'free',
    details: 'Included with Azure subscription'
  },
  diagnostics: {
    name: 'Diagnostics Settings',
    baseCost: 0.00,
    unit: 'free',
    details: 'No additional charge'
  },
  metrics: {
    name: 'Metrics',
    baseCost: 0.00,
    unit: 'free',
    details: 'Platform metrics included'
  },
  workbooks: {
    name: 'Azure Workbooks',
    baseCost: 0.00,
    unit: 'free',
    details: 'No additional charge'
  },
  autoscale: {
    name: 'Auto Scale',
    baseCost: 0.00,
    unit: 'free',
    details: 'Included with resources'
  },
  networkwatcher: {
    name: 'Network Watcher',
    baseCost: 0.50,
    unit: 'per GB analyzed',
    details: 'Traffic Analytics, 1 GB'
  },

  // AI + ML
  cogservices: {
    name: 'Cognitive Services',
    baseCost: 1.00,
    unit: 'per 1K transactions',
    details: 'Standard tier, varies by service'
  },
  ml: {
    name: 'Machine Learning',
    baseCost: 9.62,
    unit: 'per compute hour',
    details: 'Standard DS1 v2 compute instance'
  },
  openai: {
    name: 'Azure OpenAI',
    baseCost: 0.002,
    unit: 'per 1K tokens',
    details: 'GPT-3.5-turbo model'
  },  botservice: {
    name: 'Bot Service',
    baseCost: 0.50,
    unit: 'per 1K messages',
    details: 'Standard channel, 10K messages free/month'
  },

  // ── Aliases so normalizeServiceType keys always resolve ──────────────────

  // Integration aliases
  eventhub: {
    name: 'Event Hubs',
    baseCost: 11.23,
    unit: 'per throughput unit/month',
    details: 'Standard tier, 1 throughput unit'
  },
  logicapp: {
    name: 'Logic Apps',
    baseCost: 12.50,
    unit: 'per month (est. 100K actions)',
    details: 'Consumption plan (~$0.000125/action × 100K)'
  },
  notificationhubs: {
    name: 'Notification Hubs',
    baseCost: 10.00,
    unit: 'per namespace/month',
    details: 'Basic tier, 1M pushes/month'
  },

  // Compute aliases
  containerregistry: {
    name: 'Container Registry',
    baseCost: 5.00,
    unit: 'per registry/month',
    details: 'Basic tier, 10 GB storage'
  },

  // Analytics
  databricks: {
    name: 'Azure Databricks',
    baseCost: 0.07,
    unit: 'per DBU/hour',
    details: 'Standard tier (~$50/month light usage)'
  },
  hdinsight: {
    name: 'HDInsight',
    baseCost: 146.00,
    unit: 'per cluster/month',
    details: 'Spark cluster, 2 worker nodes (D3 v2)'
  },
  streamanalytics: {
    name: 'Stream Analytics',
    baseCost: 80.30,
    unit: 'per streaming unit/month',
    details: '1 Streaming Unit (standard)'
  },

  // AI/ML aliases
  cognitive: {
    name: 'Cognitive Services',
    baseCost: 1.00,
    unit: 'per 1K transactions',
    details: 'Standard tier, varies by service'
  },
  search: {
    name: 'Azure AI Search',
    baseCost: 73.73,
    unit: 'per search unit/month',
    details: 'Basic tier, 1 search unit'
  },

  // IoT
  iothub: {
    name: 'IoT Hub',
    baseCost: 10.00,
    unit: 'per month',
    details: 'S1 Standard tier, 400K messages/day'
  },
  iotcentral: {
    name: 'IoT Central',
    baseCost: 2.00,
    unit: 'per device/month',
    details: 'Standard tier, 10 devices'
  },
  digitaltwins: {
    name: 'Azure Digital Twins',
    baseCost: 0.1228,
    unit: 'per 1K operations',
    details: 'Pay-as-you-go'
  },

  // Networking aliases
  cdn: {
    name: 'CDN Profile',
    baseCost: 7.50,
    unit: 'per month',
    details: 'Standard Verizon, 100 GB transfer'
  },
  trafficmanager: {
    name: 'Traffic Manager',
    baseCost: 0.54,
    unit: 'per profile/month',
    details: '1M health checks, 1M DNS queries'
  },
  routetable: {
    name: 'Route Table',
    baseCost: 0.00,
    unit: 'free',
    details: 'No additional charge'
  },
  nic: {
    name: 'Network Interface',
    baseCost: 0.00,
    unit: 'free',
    details: 'No additional charge'
  },

  // Security aliases
  securitycenter: {
    name: 'Defender for Cloud',
    baseCost: 15.00,
    unit: 'per server/month',
    details: 'Standard tier per resource'
  },

  // Storage aliases
  disks: {
    name: 'Managed Disks',
    baseCost: 9.60,
    unit: 'per 128 GB disk/month',
    details: 'Standard SSD E10, 128 GB'
  },

  // Identity / Management (free or near-free)
  aad: {
    name: 'Azure Active Directory',
    baseCost: 0.00,
    unit: 'free (Basic)',
    details: 'Azure AD Free tier included'
  },
  identity: {
    name: 'Managed Identity',
    baseCost: 0.00,
    unit: 'free',
    details: 'No additional charge'
  },
  resourcegroup: {
    name: 'Resource Group',
    baseCost: 0.00,
    unit: 'free',
    details: 'No additional charge'
  },
  automation: {
    name: 'Automation Account',
    baseCost: 0.002,
    unit: 'per 500 minutes/month',
    details: 'First 500 minutes free/month'
  },
  policy: {
    name: 'Azure Policy',
    baseCost: 0.00,
    unit: 'free',
    details: 'Included with Azure subscription'
  },
};

/**
 * Calculate total monthly cost for architecture
 * @param {Array} items - Array of Azure service items
 * @returns {Object} - Cost breakdown
 /**
 * Calculate cost with region and currency support
 * @param {Array} items - Array of Azure services
 * @param {string} regionKey - Azure region key (default: 'eastus')
 * @param {string} currencyKey - Currency code (default: 'USD')
 */
/**
 * Normalize service type to match pricing keys
 */
const normalizeServiceType = (serviceType) => {
  if (!serviceType) return 'generic';

  const normalized = serviceType.toLowerCase().replace(/[^a-z0-9]/g, '');

  // Canonical map — covers drag-drop ids, Terraform parser serviceType values,
  // and every plural/abbreviated variant used across the app
  const mappings = {
    // ── Compute ──────────────────────────────────────────────────────────────
    'vm': 'vm',
    'virtualmachine': 'vm',
    'virtualmachines': 'vm',
    'vmss': 'vmss',
    'vmscalesets': 'vmss',
    'virtualmachinescalesets': 'vmss',
    'functionapp': 'function',
    'functionapps': 'function',
    'appservice': 'appservice',
    'appservices': 'appservice',
    'webapp': 'appservice',
    'webapps': 'appservice',
    'appserviceplans': 'appservice',
    'aks': 'aks',
    'kubernetesservices': 'aks',
    'kubernetes': 'aks',
    'containerinstances': 'containerinstances',
    'containerinstance': 'containerinstances',
    'containerregistries': 'containerregistry',
    'containerregistry': 'containerregistry',
    'batchaccounts': 'batch',
    'batch': 'batch',
    'availabilitysets': 'vm',   // priced as VM

    // ── Storage ───────────────────────────────────────────────────────────────
    'storage': 'storage',
    'storageaccount': 'storage',
    'storageaccounts': 'storage',
    'storageaccountblob': 'storage',
    'storageaccountqueue': 'storage',
    'storageaccounttable': 'storage',
    'storageaccountsazurefiles': 'storage',
    'disks': 'disks',
    'manageddisks': 'disks',
    'snapshots': 'disks',
    'backupvault': 'recovery',
    'backupvaults': 'recovery',
    'recoveryservicesvaults': 'recovery',
    'recovery': 'recovery',
    'datalakestoregen1': 'datalake',
    'datalakestoregen2': 'datalake',
    'azurenetappfiles': 'netapp',

    // ── Databases ─────────────────────────────────────────────────────────────
    'sqldb': 'sqldb',
    'sqldatabase': 'sqldb',
    'sqldatabases': 'sqldb',
    'sqlserver': 'sqldb',
    'mssqlserver': 'sqldb',
    'mssqldatabase': 'sqldb',
    'sqlmanagedinstance': 'sqlmi',
    'sqlmanagedinstances': 'sqlmi',
    'cosmosdb': 'cosmosdb',
    'azurecosmosdb': 'cosmosdb',
    'mysql': 'mysql',
    'azuredatabaseformysqlservers': 'mysql',
    'mysqlflexibleserver': 'mysql',    'postgresql': 'postgres',
    'azuredatabaseforpostgresqlservers': 'postgres',
    'postgresqlflexibleserver': 'postgres',
    'mariadb': 'mariadb',
    'azuredatabaseformariadbservers': 'mariadb',    'redis': 'cache',
    'cacheforredis': 'cache',
    'azurecacheforredis': 'cache',
    'azuresynapseanalytics': 'synapse',
    'synapse': 'synapse',

    // ── Networking ────────────────────────────────────────────────────────────
    'vnet': 'vnet',
    'virtualnetwork': 'vnet',
    'virtualnetworks': 'vnet',
    'subnets': 'vnet',
    'subnet': 'vnet',
    'loadbalancer': 'loadbalancer',
    'loadbalancers': 'loadbalancer',
    'applicationgateway': 'appgw',
    'applicationgateways': 'appgw',
    'networksecuritygroups': 'nsg',
    'networksecuritygroup': 'nsg',
    'nsg': 'nsg',
    'publicipaddresses': 'publicip',
    'publicipaddress': 'publicip',
    'publicip': 'publicip',
    'dnszones': 'dns',
    'dnszone': 'dns',
    'dns': 'dns',
    'firewalls': 'firewall',
    'firewall': 'firewall',
    'bastions': 'bastion',
    'bastion': 'bastion',
    'trafficmanagerprofiles': 'trafficmanager',
    'trafficmanager': 'trafficmanager',
    'frontdoors': 'frontdoor',
    'frontdoor': 'frontdoor',
    'cdnprofiles': 'cdn',
    'cdn': 'cdn',
    'expressroutecircuits': 'expressroute',
    'expressroute': 'expressroute',
    'privatelinkservices': 'privatelink',
    'privatelink': 'privatelink',
    'virtualnetworkgateways': 'vpngateway',
    'virtualgateways': 'vpngateway',
    'vpngateway': 'vpngateway',
    'natgateway': 'nat',
    'nat': 'nat',
    'networkinterfaces': 'nic',
    'networkinterface': 'nic',
    'routetables': 'routetable',

    // ── Security ──────────────────────────────────────────────────────────────
    'keyvault': 'keyvault',
    'keyvaults': 'keyvault',
    'microsoftdefenderforcloud': 'securitycenter',
    'securitycenter': 'securitycenter',
    'microsoftsentinel': 'sentinel',
    'sentinel': 'sentinel',

    // ── Monitoring ────────────────────────────────────────────────────────────
    'appinsights': 'appinsights',
    'applicationinsights': 'appinsights',
    'loganalyticsworkspaces': 'loganalytics',
    'loganalytics': 'loganalytics',
    'azuremonitor': 'monitor',
    'monitor': 'monitor',

    // ── Integration ───────────────────────────────────────────────────────────
    'servicebus': 'servicebus',
    'servicebusnamespaces': 'servicebus',
    'servicebusqueues': 'servicebus',
    'servicebustopics': 'servicebus',
    'eventhub': 'eventhub',
    'eventhubs': 'eventhub',
    'eventhubnamespaces': 'eventhub',
    'logicapps': 'logicapp',
    'logicapp': 'logicapp',
    'apimanagement': 'apim',
    'apim': 'apim',
    'eventgridtopics': 'eventgrid',
    'eventgrid': 'eventgrid',
    'notificationhubs': 'notificationhubs',

    // ── Analytics ─────────────────────────────────────────────────────────────
    'datafactory': 'datafactory',
    'datafactories': 'datafactory',
    'databricks': 'databricks',
    'azuredatabricks': 'databricks',
    'hdinsightclusters': 'hdinsight',
    'hdinsight': 'hdinsight',
    'streamanalyticsjobs': 'streamanalytics',
    'streamanalytics': 'streamanalytics',

    // ── AI / ML ───────────────────────────────────────────────────────────────
    'cognitiveservices': 'cognitive',
    'cognitive': 'cognitive',
    'machinelearning': 'ml',
    'ml': 'ml',
    'botservices': 'botservice',
    'botservice': 'botservice',
    'cognitivesearch': 'search',
    'search': 'search',
    'azureopenai': 'openai',
    'openai': 'openai',

    // ── IoT ───────────────────────────────────────────────────────────────────
    'iothub': 'iothub',
    'azureiotcentral': 'iotcentral',
    'azuredigitaltwins': 'digitaltwins',

    // ── Identity / Management ─────────────────────────────────────────────────
    'managedidentities': 'identity',
    'azureactivedirectory': 'aad',
    'resourcegroups': 'resourcegroup',
    'automationaccounts': 'automation',
    'policy': 'policy',
  };

  return mappings[normalized] || normalized;
};

export const calculateCost = (items, regionKey = 'eastus', currencyKey = 'USD') => {
  const region = azureRegions[regionKey] || azureRegions['eastus'];
  const currency = currencies[currencyKey] || currencies['USD'];
  
  let totalCost = 0;
  const breakdown = [];
    items.forEach((item) => {
    // Normalize the service type to match pricing keys
    const normalizedType = normalizeServiceType(item.type || item.serviceType);
    const pricing = azurePricing[normalizedType];
    
    if (pricing) {
      // Apply region multiplier and currency conversion
      const baseCostInRegion = pricing.baseCost * region.multiplier;
      const costInCurrency = baseCostInRegion * currency.rate;
      
      totalCost += costInCurrency;
      breakdown.push({
        name: item.name,
        service: pricing.name,
        serviceType: pricing.name,
        quantity: 1,
        monthlyCost: costInCurrency,
        cost: costInCurrency,
        unit: pricing.unit,
        details: pricing.details
      });
    }
  });
  
  return {
    totalMonthly: totalCost,
    totalYearly: totalCost * 12,
    breakdown: breakdown.sort((a, b) => b.cost - a.cost),
    currency: currencyKey,
    currencySymbol: currency.symbol,
    region: region.name,
    regionKey: regionKey,
    pricingDate: new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })
  };
};

/**
 * Format cost as currency string with proper symbol
 * @param {number} cost - Cost amount
 * @param {string} currencyKey - Currency code (default: 'USD')
 */
export const formatCost = (cost, currencyKey = 'USD') => {
  const currency = currencies[currencyKey] || currencies['USD'];
  
  // For currencies with large numbers (JPY, KRW), don't show decimals
  const decimals = ['JPY', 'KRW'].includes(currencyKey) ? 0 : 2;
  
  return `${currency.symbol}${cost.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  })}`;
};

/**
 * Get cost category (low/medium/high)
 */
export const getCostCategory = (monthlyCost) => {
  if (monthlyCost < 100) return { category: 'Low', color: '#28a745' };
  if (monthlyCost < 500) return { category: 'Medium', color: '#ffc107' };
  return { category: 'High', color: '#dc3545' };
};

/**
 * Get cost optimization suggestions
 * Provides industry-grade recommendations based on Azure Well-Architected Framework
 */
export const getCostOptimizations = (items) => {
  const suggestions = [];

  // Normalize every item's service type through the same mapping used for pricing
  // so that drag-drop ids ('virtualmachines'), Terraform ids ('virtualmachines'),
  // and legacy ids ('vm') all resolve to the same canonical key.
  const serviceTypes = items.map(i => normalizeServiceType(i.type || i.serviceType));

  const hasVMs              = serviceTypes.some(t => t === 'vm');
  const hasVMSS             = serviceTypes.some(t => t === 'vmss');
  const hasAKS              = serviceTypes.some(t => t === 'aks');
  const hasSQL              = serviceTypes.some(t => t === 'sqldb');
  const hasCosmos           = serviceTypes.some(t => t === 'cosmosdb');
  const hasStorage          = serviceTypes.some(t => t === 'storage');
  const hasFirewall         = serviceTypes.some(t => t === 'firewall');
  const hasAppGW            = serviceTypes.some(t => t === 'appgw');
  const hasSQLMI            = serviceTypes.some(t => t === 'sqlmi');
  const hasRedis            = serviceTypes.some(t => t === 'cache');
  const hasAppService       = serviceTypes.some(t => t === 'appservice');
  const hasFunctions        = serviceTypes.some(t => t === 'function');
  const hasDataFactory      = serviceTypes.some(t => t === 'datafactory');
  const hasSynapse          = serviceTypes.some(t => t === 'synapse');
  const hasLoadBalancer     = serviceTypes.some(t => t === 'loadbalancer');
  const hasFrontDoor        = serviceTypes.some(t => t === 'frontdoor');
  const hasContainerInstances = serviceTypes.some(t => t === 'containerinstances');
  const hasDatabricks       = serviceTypes.some(t => t === 'databricks');
  const hasContainerRegistry = serviceTypes.some(t => t === 'containerregistry');
  const hasBastion          = serviceTypes.some(t => t === 'bastion');
  const hasExpressRoute     = serviceTypes.some(t => t === 'expressroute');
  const hasServiceBus       = serviceTypes.some(t => t === 'servicebus');
  const hasLogicApp         = serviceTypes.some(t => t === 'logicapp');
  const hasAPIM             = serviceTypes.some(t => t === 'apim');

  // --- Compute Optimizations ---
  if (hasVMs) {
    suggestions.push({
      category: '💻 Compute',
      service: 'Virtual Machines',
      suggestion: 'Use Azure Reserved Instances (1-year or 3-year) for predictable workloads to save up to 72% compared to pay-as-you-go pricing.',
      potentialSavings: 'Up to 72%',
      priority: 'high'
    });
    suggestions.push({
      category: '💻 Compute',
      service: 'Virtual Machines',
      suggestion: 'Enable Azure Spot VMs for fault-tolerant or batch workloads to save up to 90% on compute costs.',
      potentialSavings: 'Up to 90%',
      priority: 'medium'
    });
    suggestions.push({
      category: '💻 Compute',
      service: 'Virtual Machines',
      suggestion: 'Right-size VMs using Azure Advisor recommendations. Over-provisioned VMs are the #1 cloud waste factor.',
      potentialSavings: '20-40%',
      priority: 'high'
    });
    suggestions.push({
      category: '💻 Compute',
      service: 'Virtual Machines',
      suggestion: 'Configure auto-shutdown for dev/test VMs during non-business hours to eliminate idle costs.',
      potentialSavings: '60-70% on dev/test',
      priority: 'medium'
    });
  }

  if (hasVMSS) {
    suggestions.push({
      category: '💻 Compute',
      service: 'VM Scale Sets',
      suggestion: 'Configure autoscaling policies to scale in during low-demand periods. Combine with Spot instances for non-critical nodes.',
      potentialSavings: '30-50%',
      priority: 'high'
    });
  }

  if (hasAKS) {
    suggestions.push({
      category: '📦 Containers',
      service: 'AKS',
      suggestion: 'Enable cluster autoscaler and use Spot node pools for non-critical workloads. Consider Azure CNI Overlay to reduce IP usage.',
      potentialSavings: '30-60%',
      priority: 'high'
    });
    suggestions.push({
      category: '📦 Containers',
      service: 'AKS',
      suggestion: 'Use Kubernetes VPA (Vertical Pod Autoscaler) and HPA (Horizontal Pod Autoscaler) to right-size pod requests.',
      potentialSavings: '15-30%',
      priority: 'medium'
    });
  }

  if (hasContainerInstances) {
    suggestions.push({
      category: '📦 Containers',
      service: 'Container Instances',
      suggestion: 'Consider migrating long-running containers to AKS for better cost efficiency at scale. ACI is ideal for burst/short-lived tasks.',
      potentialSavings: '20-40% at scale',
      priority: 'low'
    });
  }

  // --- Database Optimizations ---
  if (hasSQL) {
    suggestions.push({
      category: '🗄️ Database',
      service: 'SQL Database',
      suggestion: 'Use Elastic Pools to share resources across multiple databases. Enable auto-pause for serverless tier on dev/test databases.',
      potentialSavings: '30-50%',
      priority: 'high'
    });
    suggestions.push({
      category: '🗄️ Database',
      service: 'SQL Database',
      suggestion: 'Use Azure Hybrid Benefit if you have existing SQL Server licenses to save up to 55% on vCore-based pricing.',
      potentialSavings: 'Up to 55%',
      priority: 'high'
    });
  }

  if (hasSQLMI) {
    suggestions.push({
      category: '🗄️ Database',
      service: 'SQL Managed Instance',
      suggestion: 'Consider Azure SQL Database if full SQL Server compatibility is not required. MI is significantly more expensive.',
      potentialSavings: '$600+/month',
      priority: 'high'
    });
  }

  if (hasCosmos) {
    suggestions.push({
      category: '🗄️ Database',
      service: 'Cosmos DB',
      suggestion: 'Use autoscale throughput instead of manual provisioning to avoid paying for unused RU/s. Consider serverless for intermittent workloads.',
      potentialSavings: '30-60%',
      priority: 'high'
    });
    suggestions.push({
      category: '🗄️ Database',
      service: 'Cosmos DB',
      suggestion: 'Enable TTL (Time-to-Live) to auto-delete old data and reduce storage costs. Review partition key strategy for efficiency.',
      potentialSavings: '10-25%',
      priority: 'medium'
    });
  }

  if (hasRedis) {
    suggestions.push({
      category: '🗄️ Database',
      service: 'Azure Cache for Redis',
      suggestion: 'Use the Basic tier for dev/test and Standard for production. Premium tier is only needed for clustering and geo-replication.',
      potentialSavings: '40-60%',
      priority: 'medium'
    });
  }

  // --- Storage Optimizations ---
  if (hasStorage) {
    suggestions.push({
      category: '💾 Storage',
      service: 'Storage Account',
      suggestion: 'Implement lifecycle management policies to auto-tier data from Hot → Cool → Archive. Cool tier is 50% cheaper, Archive is 90% cheaper.',
      potentialSavings: '50-90%',
      priority: 'high'
    });
    suggestions.push({
      category: '💾 Storage',
      service: 'Storage Account',
      suggestion: 'Use LRS (Locally Redundant Storage) for non-critical data instead of GRS/RA-GRS. Consider ZRS for zone-redundancy at lower cost than GRS.',
      potentialSavings: '30-50%',
      priority: 'medium'
    });
  }

  // --- Networking Optimizations ---
  if (hasFirewall) {
    suggestions.push({
      category: '🌐 Networking',
      service: 'Azure Firewall',
      suggestion: 'Use Azure Firewall Basic SKU ($276/month) instead of Standard ($912/month) for smaller workloads. Consider NSGs for basic traffic filtering.',
      potentialSavings: '$600+/month',
      priority: 'high'
    });
  }

  if (hasAppGW) {
    suggestions.push({
      category: '🌐 Networking',
      service: 'Application Gateway',
      suggestion: 'Use Azure Front Door if you only need global load balancing without WAF. For simple L4 balancing, use Azure Load Balancer (much cheaper).',
      potentialSavings: '$160+/month',
      priority: 'medium'
    });
  }

  if (hasLoadBalancer && hasFrontDoor) {
    suggestions.push({
      category: '🌐 Networking',
      service: 'Load Balancer + Front Door',
      suggestion: 'Review if both Load Balancer and Front Door are needed. Front Door includes L7 load balancing — the internal LB may be redundant.',
      potentialSavings: '$18+/month',
      priority: 'low'
    });
  }

  // --- App Platform Optimizations ---
  if (hasAppService) {
    suggestions.push({
      category: '🚀 App Platform',
      service: 'App Service',
      suggestion: 'Use Free/Shared tiers for dev/test. For production, consider B1 Basic tier unless you need scaling/slots (Standard S1+). Use Reserved Instances for 1-3 year savings.',
      potentialSavings: '30-55%',
      priority: 'medium'
    });
  }

  if (hasFunctions) {
    suggestions.push({
      category: '🚀 App Platform',
      service: 'Functions',
      suggestion: 'Stay on Consumption plan for intermittent workloads (1M executions/month free). Only use Premium plan if you need VNet integration or always-warm instances.',
      potentialSavings: 'Varies',
      priority: 'low'
    });
  }

  // --- Analytics Optimizations ---
  if (hasDataFactory) {
    suggestions.push({
      category: '📊 Analytics',
      service: 'Data Factory',
      suggestion: 'Optimize pipeline runs by batching activities. Use self-hosted integration runtime for on-premises data to avoid data movement charges.',
      potentialSavings: '20-40%',
      priority: 'medium'
    });
  }
  if (hasSynapse) {
    suggestions.push({
      category: '📊 Analytics',
      service: 'Synapse Analytics',
      suggestion: 'Use serverless SQL pools for ad-hoc queries instead of dedicated pools. Pause dedicated pools when not in use.',
      potentialSavings: '50-80%',
      priority: 'high'
    });
  }

  if (hasDatabricks) {
    suggestions.push({
      category: '📊 Analytics',
      service: 'Azure Databricks',
      suggestion: 'Use spot instances for worker nodes and auto-termination policies to shut down idle clusters. Spot VMs can save 60-90% on compute.',
      potentialSavings: '60-90%',
      priority: 'high'
    });
  }

  // --- Integration Optimizations ---
  if (hasServiceBus) {
    suggestions.push({
      category: '🔗 Integration',
      service: 'Service Bus',
      suggestion: 'Use the Basic tier for simple point-to-point messaging. Upgrade to Standard only if you need topics/subscriptions or queues > 256 KB.',
      potentialSavings: 'Up to $10/month',
      priority: 'low'
    });
  }

  if (hasLogicApp) {
    suggestions.push({
      category: '🔗 Integration',
      service: 'Logic Apps',
      suggestion: 'Audit Logic App run history — unused or failed runs still incur action charges. Consider Azure Functions for high-frequency tasks (cheaper per execution).',
      potentialSavings: '20-50%',
      priority: 'medium'
    });
  }

  if (hasAPIM) {
    suggestions.push({
      category: '🔗 Integration',
      service: 'API Management',
      suggestion: 'Use the Consumption tier (pay-per-call) for low/irregular traffic instead of the Developer ($49/month) or Standard ($695/month) tiers.',
      potentialSavings: 'Up to $695/month',
      priority: 'high'
    });
  }

  // --- Container Optimizations ---
  if (hasContainerRegistry) {
    suggestions.push({
      category: '📦 Containers',
      service: 'Container Registry',
      suggestion: 'Use the Basic tier ($5/month) for dev/test. Enable geo-replication only in Premium tier when truly needed for multi-region deployments.',
      potentialSavings: '$95+/month',
      priority: 'low'
    });
  }

  // --- Networking Optimizations ---
  if (hasBastion) {
    suggestions.push({
      category: '🌐 Networking',
      service: 'Azure Bastion',
      suggestion: 'Azure Bastion Basic SKU ($140/month) supports most use cases. Developer SKU ($21/month) is available for single-VM access scenarios.',
      potentialSavings: 'Up to $119/month',
      priority: 'medium'
    });
  }

  if (hasExpressRoute) {
    suggestions.push({
      category: '🌐 Networking',
      service: 'ExpressRoute',
      suggestion: 'Use Metered billing instead of Unlimited if outbound data volume is < 10 TB/month. Consider ExpressRoute Local for sites adjacent to Azure regions.',
      potentialSavings: '30-50%',
      priority: 'medium'
    });
  }

  // --- General Cross-Cutting Recommendations ---
  suggestions.push({
    category: '🏗️ Architecture',
    service: 'General',
    suggestion: 'Set up Azure Cost Management + Budgets with alerts at 50%, 75%, and 90% thresholds to prevent bill shock.',
    potentialSavings: 'Prevention',
    priority: 'high'
  });

  if (items.length > 5) {
    suggestions.push({
      category: '🏗️ Architecture',
      service: 'General',
      suggestion: 'Apply Azure resource tags (CostCenter, Owner, Environment) consistently to enable chargeback and cost attribution reporting.',
      potentialSavings: 'Governance',
      priority: 'medium'
    });
  }

  suggestions.push({
    category: '🏗️ Architecture',
    service: 'General',
    suggestion: 'Use Azure Advisor cost recommendations regularly. Advisor identifies idle resources, right-sizing opportunities, and reserved instance savings.',
    potentialSavings: '10-30%',
    priority: 'high'
  });

  // Sort by priority (high > medium > low)
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  suggestions.sort((a, b) => (priorityOrder[a.priority] || 2) - (priorityOrder[b.priority] || 2));

  return suggestions;
};

export default azurePricing;
