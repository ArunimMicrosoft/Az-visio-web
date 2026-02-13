// Azure Cost Calculator
// Estimates monthly costs for Azure services based on current pricing (2026)

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
  },
  botservice: {
    name: 'Bot Service',
    baseCost: 0.50,
    unit: 'per 1K messages',
    details: 'Standard channel, 10K messages free/month'
  }
};

/**
 * Calculate total monthly cost for architecture
 * @param {Array} items - Array of Azure service items
 * @returns {Object} - Cost breakdown
 */
export const calculateCost = (items) => {
  let totalCost = 0;
  const breakdown = [];
  
  items.forEach((item) => {
    const pricing = azurePricing[item.serviceType];
    if (pricing) {
      totalCost += pricing.baseCost;
      breakdown.push({
        name: item.name,
        serviceType: pricing.name,
        cost: pricing.baseCost,
        unit: pricing.unit,
        details: pricing.details
      });
    }
  });
  
  return {
    totalMonthly: totalCost,
    totalYearly: totalCost * 12,
    breakdown: breakdown.sort((a, b) => b.cost - a.cost),
    currency: 'USD',
    region: 'East US',
    pricingDate: 'February 2026'
  };
};

/**
 * Format cost as currency string
 */
export const formatCost = (cost) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(cost);
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
 */
export const getCostOptimizations = (items) => {
  const suggestions = [];
  
  // Check for expensive services
  items.forEach(item => {
    const pricing = azurePricing[item.serviceType];
    if (!pricing) return;
    
    if (item.serviceType === 'firewall' && pricing.baseCost > 500) {
      suggestions.push({
        service: item.name,
        suggestion: 'Consider using Network Security Groups instead of Azure Firewall for basic filtering',
        potentialSavings: '$900/month'
      });
    }
    
    if (item.serviceType === 'sqlmi' && pricing.baseCost > 500) {
      suggestions.push({
        service: item.name,
        suggestion: 'Consider Azure SQL Database instead of Managed Instance if you don\'t need full SQL Server compatibility',
        potentialSavings: '$600/month'
      });
    }
    
    if (item.serviceType === 'appgw' && pricing.baseCost > 100) {
      suggestions.push({
        service: item.name,
        suggestion: 'Consider using Azure Front Door or basic Load Balancer if WAF is not required',
        potentialSavings: '$160/month'
      });
    }
  });
  
  // Check for missing cost-saving opportunities
  const hasVMs = items.some(i => i.serviceType === 'vm');
  const hasReservedInstances = false; // Could check metadata
  if (hasVMs && !hasReservedInstances) {
    suggestions.push({
      service: 'Virtual Machines',
      suggestion: 'Use Reserved Instances for up to 72% savings on long-running VMs',
      potentialSavings: 'Up to 72% on VM costs'
    });
  }
  
  return suggestions;
};

export default azurePricing;
