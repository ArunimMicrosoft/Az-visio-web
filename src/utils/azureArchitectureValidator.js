/**
 * Azure Architecture Validator
 * 
 * Validates Azure architecture designs against real-world deployment rules and best practices.
 * Critical for ensuring Terraform/ARM templates will actually deploy successfully.
 */

// Azure deployment rules based on official documentation
export const azureDeploymentRules = {
  
  // REQUIRED DEPENDENCIES - These MUST exist for deployment
  requiredDependencies: {
    virtualmachine: {
      required: ['vnet', 'virtualnetworks', 'nsg', 'networksecuritygroups'],
      recommended: ['disks', 'storage', 'storageaccounts', 'publicip', 'publicipaddresses'],
      message: 'VMs require a Virtual Network and Network Security Group'
    },
    vmss: {
      required: ['vnet', 'virtualnetworks', 'loadbalancer', 'loadbalancers'],
      recommended: ['nsg', 'networksecuritygroups'],
      message: 'VM Scale Sets require Virtual Network and Load Balancer'
    },
    aks: {
      required: ['vnet', 'virtualnetworks'],
      recommended: ['containerregistry', 'containerregistries', 'keyvault'],
      message: 'AKS requires Virtual Network for secure deployment'
    },
    kubernetesservices: {
      required: ['vnet', 'virtualnetworks'],
      recommended: ['containerregistry', 'containerregistries', 'keyvault'],
      message: 'AKS requires Virtual Network for secure deployment'
    },
    appservice: {
      required: ['appserviceplan'],
      recommended: ['vnet', 'virtualnetworks', 'keyvault', 'appinsights', 'applicationinsights'],
      message: 'App Services require an App Service Plan'
    },
    appservices: {
      required: ['appserviceplan'],
      recommended: ['vnet', 'virtualnetworks', 'keyvault', 'appinsights', 'applicationinsights'],
      message: 'App Services require an App Service Plan'
    },
    functionapps: {
      required: ['storage', 'storageaccounts'],
      recommended: ['appinsights', 'applicationinsights', 'keyvault'],
      message: 'Azure Functions require Storage Account for runtime'
    },
    sqldb: {
      required: ['sqlserver'],
      recommended: ['vnet', 'virtualnetworks', 'keyvault'],
      message: 'SQL Database requires SQL Server logical server'
    },
    sqldatabase: {
      required: ['sqlserver'],
      recommended: ['vnet', 'virtualnetworks', 'keyvault'],
      message: 'SQL Database requires SQL Server logical server'
    },
    containerinstances: {
      required: [],
      recommended: ['containerregistry', 'containerregistries', 'vnet', 'virtualnetworks'],
      message: 'Container Instances work best with Container Registry'
    },
    privateendpoint: {
      required: ['vnet', 'virtualnetworks', 'subnet'],
      recommended: ['privatedns', 'privatednszones'],
      message: 'Private Endpoints require Virtual Network and Subnet'
    },
    applicationgateway: {
      required: ['vnet', 'virtualnetworks', 'publicip', 'publicipaddresses'],
      recommended: ['nsg', 'networksecuritygroups'],
      message: 'Application Gateway requires VNet and Public IP'
    },
    appgw: {
      required: ['vnet', 'virtualnetworks', 'publicip', 'publicipaddresses'],
      recommended: ['nsg', 'networksecuritygroups'],
      message: 'Application Gateway requires VNet and Public IP'
    },
    vpngateway: {
      required: ['vnet', 'virtualnetworks', 'publicip', 'publicipaddresses'],
      recommended: ['localnetworkgateway'],
      message: 'VPN Gateway requires VNet and Public IP'
    },
    loadbalancer: {
      required: [],
      recommended: ['publicip', 'publicipaddresses', 'vnet', 'virtualnetworks'],
      message: 'Load Balancer typically needs Public IP for external access'
    },
  },

  // INVALID CONNECTIONS - These should never exist
  invalidConnections: {
    // Storage accounts shouldn't connect to other storage
    storage: ['storage', 'storageaccounts'],
    storageaccounts: ['storage', 'storageaccounts'],
    
    // VNets shouldn't directly connect to databases
    vnet: ['sqldb', 'sqldatabase', 'cosmosdb', 'azurecosmosdb', 'mysql', 'postgres'],
    virtualnetworks: ['sqldb', 'sqldatabase', 'cosmosdb', 'azurecosmosdb', 'mysql', 'postgres'],
    
    // Public IPs shouldn't connect to other public IPs
    publicip: ['publicip', 'publicipaddresses'],
    publicipaddresses: ['publicip', 'publicipaddresses'],
    
    // NSGs shouldn't connect to databases directly
    nsg: ['sqldb', 'sqldatabase', 'cosmosdb', 'azurecosmosdb'],
    networksecuritygroups: ['sqldb', 'sqldatabase', 'cosmosdb', 'azurecosmosdb'],
  },

  // REGIONAL CONSTRAINTS - Some services must be in same region
  regionalConstraints: {
    mustBeSameRegion: [
      ['virtualmachine', 'vnet', 'virtualnetworks'],
      ['appservice', 'appserviceplan'],
      ['sqldb', 'sqldatabase', 'sqlserver'],
      ['aks', 'kubernetesservices', 'vnet', 'virtualnetworks'],
    ]
  },

  // SECURITY BEST PRACTICES
  securityRules: {
    // Services that should have Private Endpoints
    shouldHavePrivateEndpoint: [
      'storage', 'storageaccounts', 'sqldb', 'sqldatabase', 'keyvault', 
      'cosmosdb', 'azurecosmosdb', 'containerregistry', 'containerregistries'
    ],
    
    // Services that should be in VNet
    shouldBeInVNet: [
      'virtualmachine', 'vm', 'aks', 'kubernetesservices', 'vmss', 'vmscalesets',
      'appservice', 'appservices', 'functionapps'
    ],
    
    // Services that should have NSG
    shouldHaveNSG: [
      'virtualmachine', 'vm', 'subnet', 'vmss', 'vmscalesets'
    ],
    
    // Secrets should be in Key Vault
    shouldUseKeyVault: [
      'virtualmachine', 'vm', 'appservice', 'appservices', 'functionapps',
      'aks', 'kubernetesservices', 'sqldb', 'sqldatabase'
    ]
  },

  // HIGH AVAILABILITY RULES
  haRules: {
    // Services that should have load balancers
    shouldHaveLoadBalancer: [
      'vmss', 'vmscalesets', 'aks', 'kubernetesservices'
    ],
    
    // Services that should have multiple instances
    shouldHaveRedundancy: [
      'virtualmachine', 'vm', 'sqldb', 'sqldatabase', 'appservice', 'appservices'
    ]
  },

  // COST OPTIMIZATION
  costOptimization: {
    // Services that generate high egress costs if not in same VNet
    egressCostWarning: [
      ['virtualmachine', 'storage', 'storageaccounts'],
      ['appservice', 'sqldb', 'sqldatabase'],
      ['functionapps', 'cosmosdb', 'azurecosmosdb']
    ]
  }
};

/**
 * Validate entire architecture
 */
export function validateArchitecture(items, connections) {
  const errors = [];
  const warnings = [];
  const recommendations = [];

  // Build connection map
  const serviceMap = new Map();
  items.forEach(item => {
    const serviceType = normalizeServiceType(item.icon?.id || item.type);
    serviceMap.set(item.id, {
      ...item,
      serviceType,
      connectedTo: []
    });
  });

  // Map connections
  connections.forEach(conn => {
    const source = serviceMap.get(conn.from);
    const target = serviceMap.get(conn.to);
    if (source && target) {
      source.connectedTo.push(target.serviceType);
      target.connectedTo.push(source.serviceType);
    }
  });

  // Validate each service
  serviceMap.forEach((service, id) => {
    // Check required dependencies
    const requiredDeps = azureDeploymentRules.requiredDependencies[service.serviceType];
    if (requiredDeps) {
      const missingRequired = requiredDeps.required.filter(dep => 
        !service.connectedTo.some(conn => matchesServiceType(conn, dep))
      );
      
      if (missingRequired.length > 0) {
        errors.push({
          serviceId: id,
          serviceName: service.name || service.icon?.name,
          severity: 'error',
          type: 'missing_dependency',
          message: `${requiredDeps.message}. Missing: ${missingRequired.join(', ')}`,
          missingServices: missingRequired
        });
      }

      // Check recommended dependencies
      const missingRecommended = requiredDeps.recommended.filter(dep =>
        !service.connectedTo.some(conn => matchesServiceType(conn, dep))
      );
      
      if (missingRecommended.length > 0) {
        warnings.push({
          serviceId: id,
          serviceName: service.name || service.icon?.name,
          severity: 'warning',
          type: 'missing_recommended',
          message: `Consider adding: ${missingRecommended.join(', ')} for production deployment`,
          recommendedServices: missingRecommended
        });
      }
    }

    // Check invalid connections
    const invalidConns = azureDeploymentRules.invalidConnections[service.serviceType];
    if (invalidConns) {
      const foundInvalid = service.connectedTo.filter(conn =>
        invalidConns.some(invalid => matchesServiceType(conn, invalid))
      );
      
      if (foundInvalid.length > 0) {
        errors.push({
          serviceId: id,
          serviceName: service.name || service.icon?.name,
          severity: 'error',
          type: 'invalid_connection',
          message: `Invalid connection: ${service.serviceType} should not connect to ${foundInvalid.join(', ')}`,
          invalidConnections: foundInvalid
        });
      }
    }

    // Security best practices
    if (azureDeploymentRules.securityRules.shouldHavePrivateEndpoint.includes(service.serviceType)) {
      if (!service.connectedTo.includes('privateendpoint')) {
        recommendations.push({
          serviceId: id,
          serviceName: service.name || service.icon?.name,
          severity: 'info',
          type: 'security',
          message: '🔒 Consider using Private Endpoint for secure access',
          category: 'security'
        });
      }
    }

    if (azureDeploymentRules.securityRules.shouldBeInVNet.includes(service.serviceType)) {
      if (!service.connectedTo.some(conn => matchesServiceType(conn, 'vnet') || matchesServiceType(conn, 'virtualnetworks'))) {
        warnings.push({
          serviceId: id,
          serviceName: service.name || service.icon?.name,
          severity: 'warning',
          type: 'security',
          message: '⚠️ Should be deployed in Virtual Network for security isolation',
          category: 'security'
        });
      }
    }

    if (azureDeploymentRules.securityRules.shouldUseKeyVault.includes(service.serviceType)) {
      if (!service.connectedTo.some(conn => matchesServiceType(conn, 'keyvault'))) {
        recommendations.push({
          serviceId: id,
          serviceName: service.name || service.icon?.name,
          severity: 'info',
          type: 'security',
          message: '🔑 Consider using Key Vault for secrets management',
          category: 'security'
        });
      }
    }

    // High availability
    if (azureDeploymentRules.haRules.shouldHaveLoadBalancer.includes(service.serviceType)) {
      if (!service.connectedTo.some(conn => matchesServiceType(conn, 'loadbalancer') || matchesServiceType(conn, 'loadbalancers'))) {
        warnings.push({
          serviceId: id,
          serviceName: service.name || service.icon?.name,
          severity: 'warning',
          type: 'high_availability',
          message: '⚠️ Consider adding Load Balancer for high availability',
          category: 'ha'
        });
      }
    }
  });

  // Calculate validation score
  const totalIssues = errors.length + warnings.length;
  const score = totalIssues === 0 ? 100 : Math.max(0, 100 - (errors.length * 10 + warnings.length * 5));
  
  return {
    isValid: errors.length === 0,
    score,
    errors,
    warnings,
    recommendations,
    summary: {
      total: items.length,
      errors: errors.length,
      warnings: warnings.length,
      recommendations: recommendations.length,
      readyForDeployment: errors.length === 0
    }
  };
}

/**
 * Normalize service type variations
 */
function normalizeServiceType(type) {
  if (!type) return '';
  const normalized = type.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Map common variations
  const mappings = {
    'vm': 'virtualmachine',
    'vms': 'virtualmachine',
    'vmscaleset': 'vmss',
    'kubernetes': 'aks',
    'k8s': 'aks',
    'vnet': 'virtualnetworks',
    'virtualnetwork': 'virtualnetworks',
    'nsg': 'networksecuritygroups',
    'networksecuritygroup': 'networksecuritygroups',
    'lb': 'loadbalancer',
    'loadbalancers': 'loadbalancer',
    'pip': 'publicip',
    'publicipaddress': 'publicip',
    'publicipaddresses': 'publicip',
    'storage': 'storageaccounts',
    'storageaccount': 'storageaccounts',
    'sql': 'sqldatabase',
    'sqldb': 'sqldatabase',
    'cosmos': 'cosmosdb',
    'azurecosmosdb': 'cosmosdb',
    'containerregistry': 'containerregistries',
    'acr': 'containerregistries',
    'appinsights': 'applicationinsights',
  };

  return mappings[normalized] || normalized;
}

/**
 * Check if service types match (handles variations)
 */
function matchesServiceType(type1, type2) {
  const normalized1 = normalizeServiceType(type1);
  const normalized2 = normalizeServiceType(type2);
  return normalized1 === normalized2;
}

/**
 * Get validation status for a specific connection
 */
export function validateConnection(fromServiceType, toServiceType) {
  const from = normalizeServiceType(fromServiceType);
  const to = normalizeServiceType(toServiceType);

  // Check if invalid
  const invalidConns = azureDeploymentRules.invalidConnections[from];
  if (invalidConns && invalidConns.some(invalid => matchesServiceType(to, invalid))) {
    return {
      status: 'invalid',
      color: 'red',
      message: 'Invalid connection - will fail deployment'
    };
  }

  // Check if required
  const requiredDeps = azureDeploymentRules.requiredDependencies[from];
  if (requiredDeps && requiredDeps.required.some(req => matchesServiceType(to, req))) {
    return {
      status: 'valid',
      color: 'green',
      message: 'Required connection for deployment'
    };
  }

  // Check if recommended
  if (requiredDeps && requiredDeps.recommended.some(rec => matchesServiceType(to, rec))) {
    return {
      status: 'recommended',
      color: 'blue',
      message: 'Recommended for production'
    };
  }

  // Default: valid but not critical
  return {
    status: 'valid',
    color: 'green',
    message: 'Valid connection'
  };
}
