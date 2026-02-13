// Azure service connection validation rules
// Green: Valid connection | Red: Invalid/Warning connection

export const connectionRules = {  // Compute services can connect to most things
  virtualmachine: {
    valid: ['disks', 'storage', 'storageaccounts', 'sqldb', 'sqldatabase', 'vnet', 'virtualnetworks', 'subnet', 'subnets', 'loadbalancer', 'loadbalancers', 'keyvault', 'monitor', 'backup', 'networkinterface', 'nsg', 'networksecuritygroups', 'publicip', 'publicipaddresses'],
    warning: ['cosmosdb', 'azurecosmosdb', 'eventhubs', 'servicebus'],
    invalid: []
  },
  vm: {
    valid: ['disks', 'storage', 'storageaccounts', 'sqldb', 'sqldatabase', 'vnet', 'virtualnetworks', 'subnet', 'subnets', 'loadbalancer', 'loadbalancers', 'keyvault', 'monitor', 'backup', 'networkinterface', 'nsg', 'networksecuritygroups', 'publicip', 'publicipaddresses'],
    warning: ['cosmosdb', 'azurecosmosdb', 'eventhubs', 'servicebus'],
    invalid: []
  },
  vmscalesets: {
    valid: ['disks', 'storage', 'storageaccounts', 'sqldb', 'sqldatabase', 'vnet', 'virtualnetworks', 'subnet', 'subnets', 'loadbalancer', 'loadbalancers', 'keyvault', 'monitor'],
    warning: ['cosmosdb', 'azurecosmosdb'],
    invalid: []
  },
  vmss: {
    valid: ['disks', 'storage', 'storageaccounts', 'sqldb', 'sqldatabase', 'vnet', 'virtualnetworks', 'subnet', 'subnets', 'loadbalancer', 'loadbalancers', 'keyvault', 'monitor'],
    warning: ['cosmosdb', 'azurecosmosdb'],
    invalid: []
  },function: {
    valid: ['storage', 'storageaccounts', 'sqldb', 'sqldatabase', 'cosmosdb', 'azurecosmosdb', 'servicebus', 'eventhubs', 'apim', 'keyvault', 'appinsights', 'applicationinsights'],
    warning: ['vm', 'virtualmachine'],
    invalid: []
  },
  functionapps: {
    valid: ['storage', 'storageaccounts', 'sqldb', 'sqldatabase', 'cosmosdb', 'azurecosmosdb', 'servicebus', 'eventhubs', 'apim', 'keyvault', 'appinsights', 'applicationinsights'],
    warning: ['vm', 'virtualmachine'],
    invalid: []
  },
  appservice: {
    valid: ['storage', 'storageaccounts', 'sqldb', 'sqldatabase', 'cosmosdb', 'azurecosmosdb', 'vnet', 'virtualnetworks', 'keyvault', 'appinsights', 'applicationinsights', 'apim'],
    warning: [],
    invalid: []
  },
  appservices: {
    valid: ['storage', 'storageaccounts', 'sqldb', 'sqldatabase', 'cosmosdb', 'azurecosmosdb', 'vnet', 'virtualnetworks', 'keyvault', 'appinsights', 'applicationinsights', 'apim'],
    warning: [],
    invalid: []
  },
  aks: {
    valid: ['storage', 'storageaccounts', 'vnet', 'virtualnetworks', 'loadbalancer', 'loadbalancers', 'keyvault', 'monitor', 'cosmosdb', 'azurecosmosdb', 'sqldb', 'sqldatabase', 'containerregistry', 'containerregistries'],
    warning: [],
    invalid: []
  },
  kubernetesservices: {
    valid: ['storage', 'storageaccounts', 'vnet', 'virtualnetworks', 'loadbalancer', 'loadbalancers', 'keyvault', 'monitor', 'cosmosdb', 'azurecosmosdb', 'sqldb', 'sqldatabase', 'containerregistry', 'containerregistries'],
    warning: [],
    invalid: []
  },

  // Storage services
  disks: {
    valid: ['vm', 'virtualmachine', 'vmss', 'vmscalesets', 'backup', 'monitor'],
    warning: [],
    invalid: []
  },
  storage: {
    valid: ['vm', 'virtualmachine', 'vmss', 'vmscalesets', 'function', 'functionapps', 'appservice', 'appservices', 'aks', 'kubernetesservices', 'backup', 'monitor'],
    warning: [],
    invalid: []
  },
  storageaccounts: {
    valid: ['vm', 'virtualmachine', 'vmss', 'vmscalesets', 'function', 'functionapps', 'appservice', 'appservices', 'aks', 'kubernetesservices', 'backup', 'monitor'],
    warning: [],
    invalid: []
  },  datalake: {
    valid: ['databricks', 'azuredatabricks', 'synapse', 'synapseanalytics', 'datafactory', 'datafactories', 'aks', 'kubernetesservices'],
    warning: ['vm', 'virtualmachine'],
    invalid: []
  },
  datalakestorage: {
    valid: ['databricks', 'azuredatabricks', 'synapse', 'synapseanalytics', 'datafactory', 'datafactories', 'aks', 'kubernetesservices'],
    warning: ['vm', 'virtualmachine'],
    invalid: []
  },

  // Database services
  sqldb: {
    valid: ['vm', 'virtualmachine', 'appservice', 'appservices', 'function', 'functionapps', 'vnet', 'virtualnetworks', 'keyvault', 'backup', 'monitor'],
    warning: [],
    invalid: []
  },
  sqldatabase: {
    valid: ['vm', 'virtualmachine', 'appservice', 'appservices', 'function', 'functionapps', 'vnet', 'virtualnetworks', 'keyvault', 'backup', 'monitor'],
    warning: [],
    invalid: []
  },
  cosmosdb: {
    valid: ['appservice', 'appservices', 'function', 'functionapps', 'aks', 'kubernetesservices', 'keyvault', 'monitor'],
    warning: ['vm', 'virtualmachine'],
    invalid: []
  },
  azurecosmosdb: {
    valid: ['appservice', 'appservices', 'function', 'functionapps', 'aks', 'kubernetesservices', 'keyvault', 'monitor'],
    warning: ['vm', 'virtualmachine'],
    invalid: []
  },
  mysql: {
    valid: ['appservice', 'appservices', 'function', 'functionapps', 'vm', 'virtualmachine', 'vnet', 'virtualnetworks', 'keyvault'],
    warning: [],
    invalid: []
  },
  mysqlserver: {
    valid: ['appservice', 'appservices', 'function', 'functionapps', 'vm', 'virtualmachine', 'vnet', 'virtualnetworks', 'keyvault'],
    warning: [],
    invalid: []
  },
  postgres: {
    valid: ['appservice', 'appservices', 'function', 'functionapps', 'vm', 'virtualmachine', 'vnet', 'virtualnetworks', 'keyvault'],
    warning: [],
    invalid: []
  },
  postgresqlserver: {
    valid: ['appservice', 'appservices', 'function', 'functionapps', 'vm', 'virtualmachine', 'vnet', 'virtualnetworks', 'keyvault'],
    warning: [],
    invalid: []
  },
  // Networking
  vnet: {
    valid: ['subnet', 'subnets', 'gatewaysubnet', 'vm', 'virtualmachine', 'vmss', 'vmscalesets', 'aks', 'kubernetesservices', 'appservice', 'appservices', 'sqldb', 'sqldatabase', 'loadbalancer', 'loadbalancers', 'vpngateway', 'bastion', 'bastions', 'nsg', 'networksecuritygroups'],
    warning: [],
    invalid: []
  },
  virtualnetworks: {
    valid: ['subnet', 'subnets', 'gatewaysubnet', 'vm', 'virtualmachine', 'vmss', 'vmscalesets', 'aks', 'kubernetesservices', 'appservice', 'appservices', 'sqldb', 'sqldatabase', 'loadbalancer', 'loadbalancers', 'vpngateway', 'bastion', 'bastions', 'nsg', 'networksecuritygroups'],
    warning: [],
    invalid: []
  },
  subnet: {
    valid: ['vnet', 'virtualnetworks', 'vm', 'virtualmachine', 'vmss', 'vmscalesets', 'nsg', 'networksecuritygroups', 'routetable', 'routetables', 'natgateway'],
    warning: [],
    invalid: []
  },
  subnets: {
    valid: ['vnet', 'virtualnetworks', 'vm', 'virtualmachine', 'vmss', 'vmscalesets', 'nsg', 'networksecuritygroups', 'routetable', 'routetables', 'natgateway'],
    warning: [],
    invalid: []
  },
  gatewaysubnet: {
    valid: ['vnet', 'virtualnetworks', 'vpngateway', 'expressroute', 'expressroutecircuits'],
    warning: [],
    invalid: []
  },
  loadbalancer: {
    valid: ['vm', 'virtualmachine', 'vmss', 'vmscalesets', 'aks', 'kubernetesservices', 'vnet', 'virtualnetworks', 'appgw', 'applicationgateway', 'applicationgateways'],
    warning: [],
    invalid: []
  },
  loadbalancers: {
    valid: ['vm', 'virtualmachine', 'vmss', 'vmscalesets', 'aks', 'kubernetesservices', 'vnet', 'virtualnetworks', 'appgw', 'applicationgateway', 'applicationgateways'],
    warning: [],
    invalid: []
  },
  vpngateway: {
    valid: ['vnet', 'virtualnetworks'],
    warning: [],
    invalid: []
  },  nsg: {
    valid: ['vm', 'virtualmachine', 'vnet', 'virtualnetworks', 'subnet', 'subnets', 'gatewaysubnet', 'networkinterface'],
    warning: [],
    invalid: []
  },
  networksecuritygroups: {
    valid: ['vm', 'virtualmachine', 'vnet', 'virtualnetworks', 'subnet', 'subnets', 'gatewaysubnet', 'networkinterface'],
    warning: [],
    invalid: []
  },
  // Security
  keyvault: {
    valid: ['vm', 'virtualmachine', 'appservice', 'appservices', 'function', 'functionapps', 'sqldb', 'sqldatabase', 'cosmosdb', 'azurecosmosdb', 'aks', 'kubernetesservices'],
    warning: [],
    invalid: []
  },

  // Integration
  servicebus: {
    valid: ['function', 'functionapps', 'appservice', 'appservices', 'logicapps', 'eventhubs'],
    warning: ['vm', 'virtualmachine'],
    invalid: []
  },
  eventhubs: {
    valid: ['function', 'functionapps', 'appservice', 'appservices', 'servicebus', 'logicapps', 'aks', 'kubernetesservices'],
    warning: [],
    invalid: []
  },
  apim: {
    valid: ['appservice', 'appservices', 'function', 'functionapps', 'aks', 'kubernetesservices', 'vnet', 'virtualnetworks', 'keyvault'],
    warning: [],
    invalid: []
  },
  logicapps: {
    valid: ['servicebus', 'eventhubs', 'sqldb', 'sqldatabase', 'cosmosdb', 'azurecosmosdb', 'storage', 'storageaccounts'],
    warning: [],
    invalid: []
  },

  // Monitoring
  monitor: {
    valid: ['vm', 'virtualmachine', 'vmss', 'vmscalesets', 'appservice', 'appservices', 'function', 'functionapps', 'aks', 'kubernetesservices', 'sqldb', 'sqldatabase', 'cosmosdb', 'azurecosmosdb', 'storage', 'storageaccounts', 'vnet', 'virtualnetworks', 'disks'],
    warning: [],
    invalid: []
  },
  appinsights: {
    valid: ['appservice', 'appservices', 'function', 'functionapps', 'aks', 'kubernetesservices', 'monitor'],
    warning: [],
    invalid: []
  },  applicationinsights: {
    valid: ['appservice', 'appservices', 'function', 'functionapps', 'aks', 'kubernetesservices', 'monitor'],
    warning: [],
    invalid: []
  },

  // DNS and Domain Services
  dns: {
    valid: ['vnet', 'virtualnetworks', 'loadbalancer', 'loadbalancers', 'trafficmanager', 'frontdoor', 'applicationgateway', 'appgw'],
    warning: [],
    invalid: []
  },
  dnszones: {
    valid: ['vnet', 'virtualnetworks', 'loadbalancer', 'loadbalancers', 'trafficmanager', 'frontdoor', 'applicationgateway', 'appgw'],
    warning: [],
    invalid: []
  },
  privatedns: {
    valid: ['vnet', 'virtualnetworks', 'privateendpoint'],
    warning: [],
    invalid: []
  },
  privatednszones: {
    valid: ['vnet', 'virtualnetworks', 'privateendpoint'],
    warning: [],
    invalid: []
  },

  // Default for unlisted services
  default: {
    valid: [],
    warning: [],
    invalid: []
  }
};

/**
 * Validate a connection between two Azure services
 * @param {string} fromServiceType - Service type of the source (e.g., 'vm', 'storage')
 * @param {string} toServiceType - Service type of the target
 * @returns {string} - 'valid', 'warning', or 'invalid'
 */
export const validateConnection = (fromServiceType, toServiceType) => {
  const rules = connectionRules[fromServiceType] || connectionRules.default;
  
  if (rules.valid.includes(toServiceType)) {
    return 'valid';
  } else if (rules.warning.includes(toServiceType)) {
    return 'warning';
  } else if (rules.invalid.includes(toServiceType)) {
    return 'invalid';
  }
  
  // If not specified, consider it a warning (uncommon but possible)
  return 'warning';
};

/**
 * Get connection validation message with helpful hints
 * @param {string} status - 'valid', 'warning', or 'invalid'
 * @param {string} fromType - Source service type
 * @param {string} toType - Target service type
 * @returns {object} - Message, color, icon, and hint
 */
export const getConnectionMessage = (status, fromType = '', toType = '') => {
  const messages = {
    valid: {
      text: `✅ Valid: ${fromType} → ${toType} is a standard Azure pattern`,
      color: '#28a745',
      icon: '✓',
      hint: 'This connection follows Azure best practices'
    },
    warning: {
      text: `⚠️ Uncommon: ${fromType} → ${toType} is not typical`,
      color: '#ffc107',
      icon: '⚠',
      hint: 'Consider if this connection is necessary for your architecture'
    },
    invalid: {
      text: `❌ Invalid: ${fromType} → ${toType} is not recommended`,
      color: '#dc3545',
      icon: '✗',
      hint: 'This connection violates Azure best practices. Use an intermediary service.'
    }
  };
  
  return messages[status] || messages.warning;
};
