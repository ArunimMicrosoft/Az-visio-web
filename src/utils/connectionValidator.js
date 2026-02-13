// Azure service connection validation rules
// Green: Valid connection | Red: Invalid/Warning connection

export const connectionRules = {
  // Compute services can connect to most things
  vm: {
    valid: ['storage', 'sqldb', 'vnet', 'loadbalancer', 'keyvault', 'monitor', 'backup'],
    warning: ['cosmosdb', 'eventhubs', 'servicebus'],
    invalid: []
  },
  vmss: {
    valid: ['storage', 'sqldb', 'vnet', 'loadbalancer', 'keyvault', 'monitor'],
    warning: ['cosmosdb'],
    invalid: []
  },
  function: {
    valid: ['storage', 'sqldb', 'cosmosdb', 'servicebus', 'eventhubs', 'apim', 'keyvault', 'appinsights'],
    warning: ['vm'],
    invalid: []
  },
  appservice: {
    valid: ['storage', 'sqldb', 'cosmosdb', 'vnet', 'keyvault', 'appinsights', 'apim'],
    warning: [],
    invalid: []
  },
  aks: {
    valid: ['storage', 'vnet', 'loadbalancer', 'keyvault', 'monitor', 'cosmosdb', 'sqldb'],
    warning: [],
    invalid: []
  },

  // Storage services
  storage: {
    valid: ['vm', 'vmss', 'function', 'appservice', 'aks', 'backup', 'monitor'],
    warning: [],
    invalid: []
  },
  datalake: {
    valid: ['databricks', 'synapse', 'datafactory', 'aks'],
    warning: ['vm'],
    invalid: []
  },

  // Database services
  sqldb: {
    valid: ['vm', 'appservice', 'function', 'vnet', 'keyvault', 'backup', 'monitor'],
    warning: [],
    invalid: []
  },
  cosmosdb: {
    valid: ['appservice', 'function', 'aks', 'keyvault', 'monitor'],
    warning: ['vm'],
    invalid: []
  },
  mysql: {
    valid: ['appservice', 'function', 'vm', 'vnet', 'keyvault'],
    warning: [],
    invalid: []
  },
  postgres: {
    valid: ['appservice', 'function', 'vm', 'vnet', 'keyvault'],
    warning: [],
    invalid: []
  },

  // Networking
  vnet: {
    valid: ['vm', 'vmss', 'aks', 'appservice', 'sqldb', 'loadbalancer', 'vpngateway', 'bastion'],
    warning: [],
    invalid: []
  },
  loadbalancer: {
    valid: ['vm', 'vmss', 'aks', 'vnet', 'appgw'],
    warning: [],
    invalid: []
  },
  vpngateway: {
    valid: ['vnet'],
    warning: [],
    invalid: []
  },

  // Security
  keyvault: {
    valid: ['vm', 'appservice', 'function', 'sqldb', 'cosmosdb', 'aks'],
    warning: [],
    invalid: []
  },

  // Integration
  servicebus: {
    valid: ['function', 'appservice', 'logicapps', 'eventhubs'],
    warning: ['vm'],
    invalid: []
  },
  eventhubs: {
    valid: ['function', 'appservice', 'servicebus', 'logicapps', 'aks'],
    warning: [],
    invalid: []
  },
  apim: {
    valid: ['appservice', 'function', 'aks', 'vnet', 'keyvault'],
    warning: [],
    invalid: []
  },
  logicapps: {
    valid: ['servicebus', 'eventhubs', 'sqldb', 'cosmosdb', 'storage'],
    warning: [],
    invalid: []
  },

  // Monitoring
  monitor: {
    valid: ['vm', 'vmss', 'appservice', 'function', 'aks', 'sqldb', 'cosmosdb', 'storage', 'vnet'],
    warning: [],
    invalid: []
  },
  appinsights: {
    valid: ['appservice', 'function', 'aks', 'monitor'],
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
