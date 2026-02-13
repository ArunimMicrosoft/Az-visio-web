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
  // INVALID CONNECTIONS - These should never exist in production
  invalidConnections: {
    // Disks MUST NOT connect to networking/app layer services
    disks: [
      'subnet', 'subnets', 'vnet', 'virtualnetworks',
      'loadbalancer', 'loadbalancers', 
      'appgw', 'applicationgateway', 'applicationgateways',
      'dns', 'dnszones', 'privatednszones',
      'trafficmanager', 'frontdoor', 'azurefrontdoor',
      'function', 'functionapps', 
      'appservice', 'appservices', 'webapps',
      'aks', 'kubernetesservices',
      'nsg', 'networksecuritygroups',
      'publicip', 'publicipaddresses'
    ],
    
    // Storage accounts shouldn't connect to networking infrastructure
    storage: [
      'storage', 'storageaccounts',
      'loadbalancer', 'loadbalancers',
      'appgw', 'applicationgateway', 'applicationgateways',
      'dns', 'dnszones', 'privatednszones',
      'nsg', 'networksecuritygroups'
    ],
    storageaccounts: [
      'storage', 'storageaccounts',
      'loadbalancer', 'loadbalancers',
      'appgw', 'applicationgateway', 'applicationgateways',
      'dns', 'dnszones', 'privatednszones',
      'nsg', 'networksecuritygroups'
    ],
    
    // VNets shouldn't directly connect to databases (use Private Endpoint instead)
    vnet: [
      'sqldb', 'sqldatabase', 'sqlserver',
      'cosmosdb', 'azurecosmosdb',
      'mysql', 'mysqldatabase',
      'postgres', 'postgresql'
    ],
    virtualnetworks: [
      'sqldb', 'sqldatabase', 'sqlserver',
      'cosmosdb', 'azurecosmosdb',
      'mysql', 'mysqldatabase',
      'postgres', 'postgresql'
    ],
    
    // Subnets shouldn't connect to disks or storage directly
    subnet: [
      'disks', 'manageddisks',
      'storage', 'storageaccounts'
    ],
    subnets: [
      'disks', 'manageddisks',
      'storage', 'storageaccounts'
    ],
    
    // Load Balancers shouldn't connect to storage/disks
    loadbalancer: [
      'disks', 'manageddisks',
      'storage', 'storageaccounts',
      'sqldb', 'sqldatabase',
      'cosmosdb', 'azurecosmosdb',
      'loadbalancer', 'loadbalancers'
    ],
    loadbalancers: [
      'disks', 'manageddisks',
      'storage', 'storageaccounts',
      'sqldb', 'sqldatabase',
      'cosmosdb', 'azurecosmosdb',
      'loadbalancer', 'loadbalancers'
    ],
    
    // Application Gateway shouldn't connect to storage/disks
    appgw: [
      'disks', 'manageddisks',
      'storage', 'storageaccounts',
      'sqldb', 'sqldatabase'
    ],
    applicationgateway: [
      'disks', 'manageddisks',
      'storage', 'storageaccounts',
      'sqldb', 'sqldatabase'
    ],
    applicationgateways: [
      'disks', 'manageddisks',
      'storage', 'storageaccounts',
      'sqldb', 'sqldatabase'
    ],
    
    // VPN Gateway shouldn't connect to app/storage layer
    vpngateway: [
      'disks', 'manageddisks',
      'storage', 'storageaccounts',
      'vm', 'virtualmachine',
      'sqldb', 'sqldatabase'
    ],
    vpngateways: [
      'disks', 'manageddisks',
      'storage', 'storageaccounts',
      'vm', 'virtualmachine',
      'sqldb', 'sqldatabase'
    ],
    
    // Public IPs shouldn't connect to other public IPs or storage
    publicip: [
      'publicip', 'publicipaddresses',
      'disks', 'manageddisks',
      'storage', 'storageaccounts'
    ],
    publicipaddresses: [
      'publicip', 'publicipaddresses',
      'disks', 'manageddisks',
      'storage', 'storageaccounts'
    ],
    
    // NSGs shouldn't connect to databases/storage directly
    nsg: [
      'sqldb', 'sqldatabase',
      'cosmosdb', 'azurecosmosdb',
      'storage', 'storageaccounts',
      'disks', 'manageddisks',
      'nsg', 'networksecuritygroups'
    ],
    networksecuritygroups: [
      'sqldb', 'sqldatabase',
      'cosmosdb', 'azurecosmosdb',
      'storage', 'storageaccounts',
      'disks', 'manageddisks',
      'nsg', 'networksecuritygroups'
    ],
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
    // Extract service type from multiple possible properties
    const serviceType = normalizeServiceType(
      item.serviceType || 
      item.type || 
      item.icon?.id || 
      item.id || 
      ''
    );
    
    console.log(`[Validator] Item ${item.id}: serviceType=${serviceType}, name=${item.name}`);
    
    serviceMap.set(item.id, {
      ...item,
      serviceType,
      connectedTo: [],
      connectedToIds: []
    });
  });

  // Map connections with detailed logging
  connections.forEach(conn => {
    const source = serviceMap.get(conn.from);
    const target = serviceMap.get(conn.to);
    if (source && target) {
      source.connectedTo.push(target.serviceType);
      source.connectedToIds.push(target.id);
      target.connectedTo.push(source.serviceType);
      target.connectedToIds.push(source.id);
      
      console.log(`[Validator] Connection: ${source.serviceType} → ${target.serviceType}`);
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
    }    // Check invalid connections (CRITICAL FOR DEPLOYMENT)
    const invalidConns = azureDeploymentRules.invalidConnections[service.serviceType];
    if (invalidConns) {
      service.connectedTo.forEach((connectedType, index) => {
        if (invalidConns.some(invalid => matchesServiceType(connectedType, invalid))) {
          const connectedService = serviceMap.get(service.connectedToIds[index]);
          errors.push({
            serviceId: id,
            serviceName: service.name || 'Unknown Service',
            severity: 'error',
            type: 'invalid_connection',
            message: `🔴 CRITICAL: ${service.serviceType} cannot connect to ${connectedType}. This connection will fail deployment!`,
            invalidConnection: {
              from: service.serviceType,
              to: connectedType,
              fromName: service.name,
              toName: connectedService?.name || 'Unknown',
              reason: getInvalidConnectionReason(service.serviceType, connectedType)
            }
          });
          console.log(`[Validator ERROR] Invalid connection: ${service.serviceType} → ${connectedType}`);
        }
      });
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
 * Get human-readable reason for why a connection is invalid
 */
function getInvalidConnectionReason(fromType, toType) {
  const reasons = {
    'disks-subnets': 'Managed Disks attach directly to VMs, not to subnets',
    'disks-virtualnetworks': 'Disks are attached to VMs, not VNets',
    'disks-loadbalancer': 'Load Balancers route traffic to VMs, not to disks',
    'disks-applicationgateway': 'App Gateway routes HTTP/HTTPS traffic, cannot connect to disks',
    'disks-function': 'Functions use Storage Accounts, not Managed Disks',
    'disks-appservice': 'App Services use Storage Accounts, not Managed Disks',
    'storage-loadbalancer': 'Load Balancers route traffic, not storage connections',
    'storage-applicationgateway': 'App Gateway routes HTTP/HTTPS, not storage traffic',
    'vnet-sqldatabase': 'Use Private Endpoint for VNet-to-Database connectivity',
    'vnet-cosmosdb': 'Use Private Endpoint for VNet-to-CosmosDB connectivity',
    'subnet-disks': 'Disks attach to VMs, not directly to subnets',
    'subnet-storage': 'Storage should use Private Endpoint, not subnet direct connection',
    'loadbalancer-disks': 'Load Balancer routes traffic to VMs, not disks',
    'loadbalancer-storage': 'Load Balancer routes traffic to compute, not storage',
    'publicip-publicip': 'Public IPs cannot connect to each other',
    'nsg-sqldatabase': 'NSGs control network traffic, not database access',
    'vpngateway-vm': 'VPN Gateway connects networks, not individual VMs',
  };
  
  const key = `${fromType}-${toType}`;
  return reasons[key] || `${fromType} and ${toType} cannot be directly connected in Azure architecture`;
}

/**
 * Normalize service type variations to match validation rules
 */
function normalizeServiceType(type) {
  if (!type) return '';
  const normalized = type.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Comprehensive mapping of Azure service variations
  const mappings = {
    // Compute
    'vm': 'virtualmachine',
    'vms': 'virtualmachine',
    'virtualmachines': 'virtualmachine',
    'vmscaleset': 'vmss',
    'vmscalesets': 'vmss',
    'virtualmachinescalesets': 'vmss',
    
    // Containers & Kubernetes
    'kubernetes': 'aks',
    'k8s': 'aks',
    'kubernetesservice': 'aks',
    'azurekubernetesservice': 'aks',
    
    // Networking
    'vnet': 'virtualnetworks',
    'virtualnetwork': 'virtualnetworks',
    'subnet': 'subnets',
    'nsg': 'networksecuritygroups',
    'networksecuritygroup': 'networksecuritygroups',
    'lb': 'loadbalancer',
    'loadbalancers': 'loadbalancer',
    'pip': 'publicip',
    'publicipaddress': 'publicip',
    'publicipaddresses': 'publicip',
    'appgw': 'applicationgateway',
    'applicationgateways': 'applicationgateway',
    'vpn': 'vpngateway',
    'vpngateways': 'vpngateway',
    
    // Storage
    'disk': 'disks',
    'manageddisk': 'disks',
    'manageddisks': 'disks',
    'storage': 'storageaccounts',
    'storageaccount': 'storageaccounts',
    'blob': 'storageaccounts',
    'blobstorage': 'storageaccounts',
    
    // Databases
    'sql': 'sqldatabase',
    'sqldb': 'sqldatabase',
    'azuresql': 'sqldatabase',
    'cosmos': 'cosmosdb',
    'azurecosmosdb': 'cosmosdb',
    'cosmosdb': 'cosmosdb',
    'mysql': 'mysqldatabase',
    'postgres': 'postgresql',
    'postgresql': 'postgresql',
    
    // App Services
    'webapp': 'appservice',
    'webapps': 'appservice',
    'appservices': 'appservice',
    'function': 'functionapps',
    'functions': 'functionapps',
    'azurefunctions': 'functionapps',
    
    // Containers
    'containerregistry': 'containerregistries',
    'acr': 'containerregistries',
    'aci': 'containerinstances',
    
    // Monitoring & Security
    'appinsights': 'applicationinsights',
    'applicationinsight': 'applicationinsights',
    'keyvault': 'keyvault',
    'keyv ault': 'keyvault',
    
    // DNS
    'dns': 'dnszones',
    'dnszone': 'dnszones',
    'privatedns': 'privatednszones',
    'privatednszone': 'privatednszones',
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
