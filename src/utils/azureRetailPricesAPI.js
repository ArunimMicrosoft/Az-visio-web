/**
 * Azure Retail Prices API Integration
 * Fetches real-time pricing from official Azure Retail Prices API
 * https://learn.microsoft.com/en-us/rest/api/cost-management/retail-prices/azure-retail-prices
 */

// Use CORS proxy to bypass browser CORS restrictions
const CORS_PROXY = 'https://corsproxy.io/?';
const AZURE_RETAIL_PRICES_API = 'https://prices.azure.com/api/retail/prices';
const PROXIED_API = CORS_PROXY + encodeURIComponent(AZURE_RETAIL_PRICES_API);

// Cache for API responses (expires after 1 hour)
const priceCache = new Map();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

/**
 * Retired/Deprecated Azure Services
 * These services no longer have pricing in the Azure Retail Prices API
 */
const retiredServices = {
  'batchai': {
    name: 'Batch AI',
    status: 'Retired',
    retiredDate: 'March 2020',
    replacement: 'Azure Machine Learning',
    message: 'Batch AI was retired in March 2020. Please use Azure Machine Learning instead.'
  },
  'machinelearningstudioclassicwebservices': {
    name: 'Machine Learning Studio (classic)',
    status: 'Deprecated',
    retiredDate: 'August 2024',
    replacement: 'Azure Machine Learning',
    message: 'ML Studio (classic) is deprecated. Please migrate to Azure Machine Learning.'
  },
  'containerservicesdeprecated': {
    name: 'Container Services (Deprecated)',
    status: 'Retired',
    retiredDate: 'January 2020',
    replacement: 'Azure Kubernetes Service (AKS)',
    message: 'Azure Container Service was retired. Please use AKS instead.'
  },
  'cloudservicesclassic': {
    name: 'Cloud Services (Classic)',
    status: 'Retiring',
    retiredDate: 'August 2024',
    replacement: 'Cloud Services (Extended Support)',
    message: 'Classic Cloud Services is retiring. Migrate to Extended Support or App Service.'
  },
  'virtualmachinesclassic': {
    name: 'Virtual Machines (Classic)',
    status: 'Retiring',
    retiredDate: 'September 2023',
    replacement: 'Virtual Machines (ARM)',
    message: 'Classic VMs are being retired. Migrate to Azure Resource Manager VMs.'
  },
  'storageaccountsclassic': {
    name: 'Storage Accounts (Classic)',
    status: 'Retiring',
    retiredDate: 'August 2024',
    replacement: 'Storage Accounts (ARM)',
    message: 'Classic Storage is retiring. Migrate to ARM-based Storage Accounts.'
  },
  'virtualnetworksclassic': {
    name: 'Virtual Networks (Classic)',
    status: 'Retiring',
    retiredDate: 'August 2024',
    replacement: 'Virtual Networks (ARM)',
    message: 'Classic VNets are retiring. Migrate to ARM-based Virtual Networks.'
  },
  'azureblockchainservice': {
    name: 'Azure Blockchain Service',
    status: 'Retired',
    retiredDate: 'September 2021',
    replacement: 'ConsenSys Quorum Blockchain Service',
    message: 'Azure Blockchain Service was retired. Consider ConsenSys Quorum or other alternatives.'
  }
};

/**
 * Service type to Azure Retail Prices API meter name mapping
 * COMPREHENSIVE MAPPING - 700+ Azure Services
 */
const serviceToMeterMapping = {  // ==================== COMPUTE ====================
  'vm': { serviceName: 'Virtual Machines', meterName: 'B2s' },
  'virtualmachine': { serviceName: 'Virtual Machines', meterName: 'B2s' },
  'virtualmachines': { serviceName: 'Virtual Machines', meterName: 'B2s' }, // Terraform import uses plural
  'vmss': { serviceName: 'Virtual Machines', meterName: 'B2s' },
  'vmscalesets': { serviceName: 'Virtual Machines', meterName: 'B2s' },
  'aks': { serviceName: 'Azure Kubernetes Service', meterName: 'Standard_B2s' },
  'kubernetesservices': { serviceName: 'Azure Kubernetes Service', meterName: 'Standard_B2s' },
  'appservice': { serviceName: 'Azure App Service', meterName: 'B1' },
  'appservices': { serviceName: 'Azure App Service', meterName: 'B1' },
  'functionapps': { serviceName: 'Functions', meterName: 'Execution' },
  'containerinstances': { serviceName: 'Container Instances', meterName: '1 vCPU' },
  'batchaccounts': { serviceName: 'Batch', meterName: 'Standard' },
  'batch': { serviceName: 'Batch', meterName: 'Standard' },
  'servicefabricclusters': { serviceName: 'Service Fabric', meterName: 'Standard' },
  'servicefabric': { serviceName: 'Service Fabric', meterName: 'Standard' },
  'cloudservices': { serviceName: 'Cloud Services', meterName: 'Standard' },
  'cloudservicesclassic': { serviceName: 'Cloud Services', meterName: 'Standard' },
  'containerregistry': { serviceName: 'Container Registry', meterName: 'Basic' },
  'containerregistries': { serviceName: 'Container Registry', meterName: 'Basic' },
  'azurespringapps': { serviceName: 'Azure Spring Apps', meterName: 'Standard' },
  'azurespringcloud': { serviceName: 'Azure Spring Apps', meterName: 'Standard' },
  'availabilitysets': { serviceName: 'Virtual Machines', meterName: 'Availability' },
  'hostgroups': { serviceName: 'Dedicated Host', meterName: 'Standard' },
  'hosts': { serviceName: 'Dedicated Host', meterName: 'Standard' },
  'dedicatedhost': { serviceName: 'Dedicated Host', meterName: 'Standard' },
  'images': { serviceName: 'Virtual Machines', meterName: 'Image' },
  'sharedimagegalleries': { serviceName: 'Virtual Machines', meterName: 'Gallery' },
  'imagedefinitions': { serviceName: 'Virtual Machines', meterName: 'Gallery' },
  'imageversions': { serviceName: 'Virtual Machines', meterName: 'Gallery' },
  'azurecomputegalleries': { serviceName: 'Virtual Machines', meterName: 'Gallery' },
  'diskencryptionsets': { serviceName: 'Storage', meterName: 'Encryption' },
  'proximityplacementgroups': { serviceName: 'Virtual Machines', meterName: 'Placement' },
  'restorepoints': { serviceName: 'Virtual Machines', meterName: 'Restore' },
  'restorepointscollections': { serviceName: 'Virtual Machines', meterName: 'Restore' },
  'capacityreservationgroups': { serviceName: 'Virtual Machines', meterName: 'Reservation' },
  'aksautomatic': { serviceName: 'Azure Kubernetes Service', meterName: 'Automatic' },
  'meshapplications': { serviceName: 'Service Fabric Mesh', meterName: 'Standard' },
  'managedservicefabric': { serviceName: 'Service Fabric', meterName: 'Managed' },
  'computefleet': { serviceName: 'Virtual Machines', meterName: 'Fleet' },

  // ==================== STORAGE ====================
  'storage': { serviceName: 'Storage', meterName: 'LRS' },
  'storageaccounts': { serviceName: 'Storage', meterName: 'LRS' },
  'storageaccountsclassic': { serviceName: 'Storage', meterName: 'LRS' },
  'disks': { serviceName: 'Storage', meterName: 'Standard SSD' },
  'manageddisks': { serviceName: 'Storage', meterName: 'Standard SSD' },
  'blob': { serviceName: 'Storage', meterName: 'LRS' },
  'blobstorage': { serviceName: 'Storage', meterName: 'LRS' },
  'filestorage': { serviceName: 'Storage', meterName: 'Files' },
  'azurefileshares': { serviceName: 'Storage', meterName: 'Files' },
  'queuestorage': { serviceName: 'Storage', meterName: 'Queue' },
  'tablestorage': { serviceName: 'Storage', meterName: 'Table' },
  'datalakestorage': { serviceName: 'Data Lake Storage', meterName: 'Gen2' },
  'datalakestoregen1': { serviceName: 'Data Lake Storage', meterName: 'Gen1' },
  'azurehcpcache': { serviceName: 'HPC Cache', meterName: 'Standard' },
  'azurenetappfiles': { serviceName: 'Azure NetApp Files', meterName: 'Standard' },
  'storagesyncservices': { serviceName: 'Azure File Sync', meterName: 'Standard' },
  'databox': { serviceName: 'Data Box', meterName: 'Standard' },
  'databoxgateway': { serviceName: 'Data Box Gateway', meterName: 'Standard' },
  'azuredataboxgateway': { serviceName: 'Data Box Gateway', meterName: 'Standard' },
  'azurestackedge': { serviceName: 'Azure Stack Edge', meterName: 'Standard' },
  'storsimple': { serviceName: 'StorSimple', meterName: 'Standard' },
  'storsimpledevicemanagers': { serviceName: 'StorSimple', meterName: 'Standard' },
  'storsimpledatamanagers': { serviceName: 'StorSimple', meterName: 'Standard' },
  'storageexplorer': { serviceName: 'Storage', meterName: 'Explorer' },
  'datashares': { serviceName: 'Data Share', meterName: 'Standard' },
  'datashareinvitations': { serviceName: 'Data Share', meterName: 'Standard' },
  'importexportjobs': { serviceName: 'Import/Export', meterName: 'Standard' },
  'diskpool': { serviceName: 'Azure Disk Pool', meterName: 'Standard' },
  'elasticsan': { serviceName: 'Elastic SAN', meterName: 'Standard' },
  'azurestoragemover': { serviceName: 'Azure Storage Mover', meterName: 'Standard' },
  'storageactions': { serviceName: 'Storage', meterName: 'Actions' },
  'managedfileshares': { serviceName: 'Storage', meterName: 'Files' },
  'edgestorageaccelerator': { serviceName: 'Azure Stack Edge', meterName: 'Accelerator' },

  // ==================== DATABASES ====================
  'sqldatabase': { serviceName: 'SQL Database', meterName: 'S0' },
  'sqldb': { serviceName: 'SQL Database', meterName: 'S0' },
  'sqlserver': { serviceName: 'SQL Database', meterName: 'Server' },
  'sqlmanagedinstance': { serviceName: 'SQL Managed Instance', meterName: 'GP_Gen5' },
  'manageddatabase': { serviceName: 'SQL Managed Instance', meterName: 'Database' },
  'sqlelasticpools': { serviceName: 'SQL Database', meterName: 'Pool' },
  'sqlserverregistries': { serviceName: 'SQL Database', meterName: 'Registry' },
  'azuresqlvm': { serviceName: 'SQL Server on VMs', meterName: 'Standard' },
  'azuresqledge': { serviceName: 'Azure SQL Edge', meterName: 'Standard' },
  'azuresql': { serviceName: 'SQL Database', meterName: 'Standard' },
  'cosmosdb': { serviceName: 'Azure Cosmos DB', meterName: 'RU' },
  'azurecosmosdb': { serviceName: 'Azure Cosmos DB', meterName: 'RU' },
  'mysql': { serviceName: 'Azure Database for MySQL', meterName: 'Basic' },
  'azuredatabasemysqlserver': { serviceName: 'Azure Database for MySQL', meterName: 'Basic' },
  'postgresql': { serviceName: 'Azure Database for PostgreSQL', meterName: 'Basic' },
  'azuredatabasepostgresqlserver': { serviceName: 'Azure Database for PostgreSQL', meterName: 'Basic' },
  'azuredatabasepostgresqlservergroup': { serviceName: 'Azure Database for PostgreSQL', meterName: 'Hyperscale' },
  'mariadb': { serviceName: 'Azure Database for MariaDB', meterName: 'Basic' },
  'azuredatabasemariadbserver': { serviceName: 'Azure Database for MariaDB', meterName: 'Basic' },
  'redis': { serviceName: 'Azure Cache for Redis', meterName: 'Basic' },
  'cacheredis': { serviceName: 'Azure Cache for Redis', meterName: 'Basic' },
  'azurecacheredis': { serviceName: 'Azure Cache for Redis', meterName: 'Basic' },
  'azuremanagedredis': { serviceName: 'Azure Cache for Redis', meterName: 'Enterprise' },
  'azuredatabasemigrationservices': { serviceName: 'Database Migration Service', meterName: 'Standard' },
  'elasticjobagents': { serviceName: 'SQL Database', meterName: 'Elastic Jobs' },
  'virtualclusters': { serviceName: 'SQL Managed Instance', meterName: 'Virtual Cluster' },
  'instancepools': { serviceName: 'SQL Managed Instance', meterName: 'Pool' },
  'azuresqlserverstretchdatabases': { serviceName: 'SQL Server Stretch Database', meterName: 'Standard' },
  'sqldatawarehouses': { serviceName: 'Azure Synapse Analytics', meterName: 'DW100c' },
  'managedinstanceapachecassandra': { serviceName: 'Managed Cassandra', meterName: 'Standard' },
  'oracledatabase': { serviceName: 'Oracle Database', meterName: 'Standard' },
  'sqldatabasefleetmanager': { serviceName: 'SQL Database', meterName: 'Fleet' },

  // ==================== ANALYTICS ====================
  'synapse': { serviceName: 'Azure Synapse Analytics', meterName: 'DW100c' },
  'azuresynapseanalytics': { serviceName: 'Azure Synapse Analytics', meterName: 'DW100c' },
  'datafactory': { serviceName: 'Data Factory', meterName: 'Cloud' },
  'datafactories': { serviceName: 'Data Factory', meterName: 'Cloud' },
  'databricks': { serviceName: 'Azure Databricks', meterName: 'Standard' },
  'azuredatabricks': { serviceName: 'Azure Databricks', meterName: 'Standard' },
  'hdinsight': { serviceName: 'HDInsight', meterName: 'Standard' },
  'hdinsightclusters': { serviceName: 'HDInsight', meterName: 'Standard' },
  'hdiakscluster': { serviceName: 'HDInsight', meterName: 'AKS' },
  'datalakeanalytics': { serviceName: 'Data Lake Analytics', meterName: 'Standard' },
  'azuredataexplorerclusters': { serviceName: 'Azure Data Explorer', meterName: 'Standard' },
  'dataexplorer': { serviceName: 'Azure Data Explorer', meterName: 'Standard' },
  'eventhubs': { serviceName: 'Event Hubs', meterName: 'Standard' },
  'eventhub': { serviceName: 'Event Hubs', meterName: 'Standard' },
  'eventhubclusters': { serviceName: 'Event Hubs', meterName: 'Dedicated' },
  'streamanalyticsjobs': { serviceName: 'Stream Analytics', meterName: 'Standard' },
  'streamanalytics': { serviceName: 'Stream Analytics', meterName: 'Standard' },
  'loganalyticsworkspaces': { serviceName: 'Log Analytics', meterName: 'Pay-as-you-go' },
  'loganalytics': { serviceName: 'Log Analytics', meterName: 'Pay-as-you-go' },
  'analysisservices': { serviceName: 'Analysis Services', meterName: 'Standard' },
  'powerbiembedded': { serviceName: 'Power BI Embedded', meterName: 'A1' },
  'powerbi': { serviceName: 'Power BI Embedded', meterName: 'A1' },
  'powerplatform': { serviceName: 'Power Platform', meterName: 'Standard' },
  'azuredatacatalog': { serviceName: 'Data Catalog', meterName: 'Standard' },
  'privatelinkservices': { serviceName: 'Private Link', meterName: 'Standard' },
  'endpointanalytics': { serviceName: 'Endpoint Analytics', meterName: 'Standard' },
  'azureworkbooks': { serviceName: 'Azure Workbooks', meterName: 'Standard' },

  // ==================== AI + MACHINE LEARNING ====================  'machinelearning': { serviceName: 'Azure Machine Learning', meterName: 'Standard' },
  'azuremachinelearning': { serviceName: 'Azure Machine Learning', meterName: 'Standard' },
  'machinelearningstudioworkspaces': { serviceName: 'Azure Machine Learning', meterName: 'Standard' },
  'machinelearningstudiowebserviceplans': { serviceName: 'Azure Machine Learning', meterName: 'Standard' },
  'machinelearningstudioclassicwebservices': { serviceName: 'Azure Machine Learning', meterName: 'Standard' },
  'cognitiveservices': { serviceName: 'Cognitive Services', meterName: 'S0' },
  'cognitive': { serviceName: 'Cognitive Services', meterName: 'S0' },
  'openai': { serviceName: 'Azure OpenAI Service', meterName: 'Standard' },
  'azureopenai': { serviceName: 'Azure OpenAI Service', meterName: 'Standard' },
  'computervision': { serviceName: 'Cognitive Services', meterName: 'S1' },
  'customvision': { serviceName: 'Cognitive Services', meterName: 'S0' },  'faceapis': { serviceName: 'Cognitive Services', meterName: 'S0' },
  'faceapi': { serviceName: 'Cognitive Services', meterName: 'S0' },
  'speechservices': { serviceName: 'Cognitive Services', meterName: 'S0' },
  'speech': { serviceName: 'Cognitive Services', meterName: 'S0' },
  'translatortext': { serviceName: 'Cognitive Services', meterName: 'S1' },
  'translator': { serviceName: 'Cognitive Services', meterName: 'S1' },
  'languageunderstanding': { serviceName: 'Cognitive Services', meterName: 'S0' },
  'luis': { serviceName: 'Cognitive Services', meterName: 'S0' },
  'language': { serviceName: 'Cognitive Services', meterName: 'S' },
  'qnamakers': { serviceName: 'Cognitive Services', meterName: 'S0' },
  'qnamaker': { serviceName: 'Cognitive Services', meterName: 'S0' },
  'anomalydetector': { serviceName: 'Cognitive Services', meterName: 'S0' },
  'personalizers': { serviceName: 'Cognitive Services', meterName: 'S0' },
  'personalizer': { serviceName: 'Cognitive Services', meterName: 'S0' },
  'formrecognizers': { serviceName: 'Cognitive Services', meterName: 'S0' },
  'formrecognizer': { serviceName: 'Cognitive Services', meterName: 'S0' },
  'immersivereaders': { serviceName: 'Cognitive Services', meterName: 'S0' },
  'immersivereader': { serviceName: 'Cognitive Services', meterName: 'S0' },
  'contentmoderators': { serviceName: 'Cognitive Services', meterName: 'S0' },
  'contentmoderator': { serviceName: 'Cognitive Services', meterName: 'S0' },
  'contentsafety': { serviceName: 'Cognitive Services', meterName: 'S0' },
  'metricsadvisor': { serviceName: 'Cognitive Services', meterName: 'S0' },
  'botservices': { serviceName: 'Azure Bot Service', meterName: 'S1' },
  'bot': { serviceName: 'Azure Bot Service', meterName: 'S1' },
  'cognitivesearch': { serviceName: 'Azure Cognitive Search', meterName: 'basic' },
  'search': { serviceName: 'Azure Cognitive Search', meterName: 'basic' },
  'serverlesssearch': { serviceName: 'Azure Cognitive Search', meterName: 'standard' },
  'batchai': { serviceName: 'Batch', meterName: 'Standard' },
  'genomics': { serviceName: 'Genomics', meterName: 'Standard' },
  'genomicsaccounts': { serviceName: 'Genomics', meterName: 'Standard' },
  'bonsai': { serviceName: 'Bonsai', meterName: 'Standard' },
  'aistudio': { serviceName: 'AI Studio', meterName: 'Standard' },
  'azureappliedaiservices': { serviceName: 'Applied AI Services', meterName: 'Standard' },
  'azureobjectunderstanding': { serviceName: 'Object Understanding', meterName: 'Standard' },
  'azureexperimentationstudio': { serviceName: 'Experimentation Studio', meterName: 'Standard' },
  'cognitiveservicesdecisions': { serviceName: 'Cognitive Services', meterName: 'Decision' },
  // ==================== NETWORKING ====================
  'vnet': { serviceName: 'Virtual Network', meterName: 'VNet' },
  'virtualnetworks': { serviceName: 'Virtual Network', meterName: 'VNet' },
  'virtualnetworksclassic': { serviceName: 'Virtual Network', meterName: 'Classic' },
  'subnet': { serviceName: 'Virtual Network', meterName: 'Subnet' },
  'subnets': { serviceName: 'Virtual Network', meterName: 'Subnet' }, // Terraform import uses plural
  'loadbalancer': { serviceName: 'Load Balancer', meterName: 'Basic' },
  'loadbalancers': { serviceName: 'Load Balancer', meterName: 'Basic' },
  'loadbalancerhub': { serviceName: 'Load Balancer', meterName: 'Hub' },
  'applicationgateway': { serviceName: 'Application Gateway', meterName: 'Standard' },
  'applicationgateways': { serviceName: 'Application Gateway', meterName: 'Standard' },
  'appgw': { serviceName: 'Application Gateway', meterName: 'Standard' },
  'applicationgatewaycontainers': { serviceName: 'Application Gateway', meterName: 'Containers' },
  'vpngateway': { serviceName: 'VPN Gateway', meterName: 'Basic' },
  'virtualnetworkgateways': { serviceName: 'VPN Gateway', meterName: 'Basic' },
  'localnetworkgateways': { serviceName: 'Local Network Gateway', meterName: 'Standard' },
  'expressroute': { serviceName: 'ExpressRoute', meterName: 'Standard' },
  'expressroutecircuits': { serviceName: 'ExpressRoute', meterName: 'Standard' },
  'expressroutedirect': { serviceName: 'ExpressRoute Direct', meterName: 'Standard' },
  'expressroutetrafficcollector': { serviceName: 'ExpressRoute', meterName: 'Traffic Collector' },
  'publicip': { serviceName: 'IP Addresses', meterName: 'Static' },
  'publicipaddresses': { serviceName: 'IP Addresses', meterName: 'Static' },
  'publicipaddressesclassic': { serviceName: 'IP Addresses', meterName: 'Classic' },
  'publicipprefixes': { serviceName: 'IP Addresses', meterName: 'Prefix' },
  'reservedipaddressesclassic': { serviceName: 'IP Addresses', meterName: 'Reserved' },
  'customipprefix': { serviceName: 'IP Addresses', meterName: 'Custom Prefix' },
  'ipaddressmanager': { serviceName: 'IP Address Manager', meterName: 'Standard' },
  'trafficmanager': { serviceName: 'Traffic Manager', meterName: 'Basic' },
  'trafficmanagerprofiles': { serviceName: 'Traffic Manager', meterName: 'Basic' },
  'cdn': { serviceName: 'Content Delivery Network', meterName: 'Standard' },
  'cdnprofiles': { serviceName: 'Content Delivery Network', meterName: 'Standard' },
  'frontdoor': { serviceName: 'Azure Front Door', meterName: 'Standard' },
  'frontdoorandcdnprofiles': { serviceName: 'Azure Front Door', meterName: 'Standard' },
  'firewall': { serviceName: 'Azure Firewall', meterName: 'Standard' },
  'firewalls': { serviceName: 'Azure Firewall', meterName: 'Standard' },
  'azurefirewall': { serviceName: 'Azure Firewall', meterName: 'Standard' },
  'azurefirewallmanager': { serviceName: 'Azure Firewall Manager', meterName: 'Standard' },
  'azurefirewallpolicy': { serviceName: 'Azure Firewall', meterName: 'Policy' },
  'nsg': { serviceName: 'Network Security Group', meterName: 'Standard' },
  'networksecuritygroups': { serviceName: 'Network Security Group', meterName: 'Standard' },
  'applicationsecuritygroups': { serviceName: 'Application Security Group', meterName: 'Standard' },
  'networksecurityperimeters': { serviceName: 'Network Security Perimeter', meterName: 'Standard' },
  'networksecurityhub': { serviceName: 'Network Security', meterName: 'Hub' },
  'dnszones': { serviceName: 'Azure DNS', meterName: 'Standard' },
  'dns': { serviceName: 'Azure DNS', meterName: 'Standard' },
  'dnsprivateresolver': { serviceName: 'Azure DNS', meterName: 'Private Resolver' },
  'dnssecuritypolicy': { serviceName: 'Azure DNS', meterName: 'Security Policy' },
  'dnsmultistack': { serviceName: 'Azure DNS', meterName: 'Multistack' },
  'networkwatcher': { serviceName: 'Network Watcher', meterName: 'Standard' },
  'networkinterfaces': { serviceName: 'Network Interfaces', meterName: 'Standard' },
  'routetables': { serviceName: 'Route Tables', meterName: 'Standard' },
  'routefilters': { serviceName: 'Route Filters', meterName: 'Standard' },
  'connections': { serviceName: 'VPN Connections', meterName: 'Standard' },
  'ddosprotectionplans': { serviceName: 'DDoS Protection', meterName: 'Standard' },
  'ddos': { serviceName: 'DDoS Protection', meterName: 'Standard' },
  'serviceendpointpolicies': { serviceName: 'Service Endpoint Policies', meterName: 'Standard' },
  'privatelink': { serviceName: 'Private Link', meterName: 'Standard' },
  'privatelinkservice': { serviceName: 'Private Link', meterName: 'Service' },
  'privateendpoints': { serviceName: 'Private Endpoint', meterName: 'Standard' },
  'virtualwans': { serviceName: 'Virtual WAN', meterName: 'Standard' },
  'virtualwan': { serviceName: 'Virtual WAN', meterName: 'Standard' },
  'virtualwanhub': { serviceName: 'Virtual WAN', meterName: 'Hub' },
  'nat': { serviceName: 'NAT Gateway', meterName: 'Standard' },
  'natgateway': { serviceName: 'NAT Gateway', meterName: 'Standard' },
  'bastions': { serviceName: 'Azure Bastion', meterName: 'Standard' },
  'bastion': { serviceName: 'Azure Bastion', meterName: 'Standard' },
  'virtualrouter': { serviceName: 'Virtual Router', meterName: 'Standard' },
  'ipgroups': { serviceName: 'IP Groups', meterName: 'Standard' },
  'webapplicationfirewallpolicieswaf': { serviceName: 'Web Application Firewall', meterName: 'Policy' },
  'waf': { serviceName: 'Web Application Firewall', meterName: 'Policy' },
  'networkmanagers': { serviceName: 'Azure Virtual Network Manager', meterName: 'Standard' },
  'resourcemanagementprivatelink': { serviceName: 'Private Link', meterName: 'Resource Manager' },
  'onpremisesdatagateways': { serviceName: 'On-premises Data Gateway', meterName: 'Standard' },
  'peerings': { serviceName: 'VNet Peering', meterName: 'Standard' },
  'peeringservice': { serviceName: 'Peering Service', meterName: 'Standard' },
  'connectedcache': { serviceName: 'Connected Cache', meterName: 'Standard' },
  'azurecommunicationsgateway': { serviceName: 'Azure Communications Gateway', meterName: 'Standard' },
  'vnetappliance': { serviceName: 'Network Virtual Appliance', meterName: 'Standard' },
  'networkfoundationhub': { serviceName: 'Network Foundation', meterName: 'Hub' },
  'hybridconnectivityhub': { serviceName: 'Hybrid Connectivity', meterName: 'Hub' },
  'atmmultistack': { serviceName: 'ATM', meterName: 'Multistack' },

  // ==================== SECURITY ====================
  'keyvault': { serviceName: 'Key Vault', meterName: 'Standard' },
  'keyvaults': { serviceName: 'Key Vault', meterName: 'Standard' },
  'sentinel': { serviceName: 'Microsoft Sentinel', meterName: 'Pay-as-you-go' },
  'azuresentinel': { serviceName: 'Microsoft Sentinel', meterName: 'Pay-as-you-go' },
  'securitycenter': { serviceName: 'Microsoft Defender for Cloud', meterName: 'Standard' },
  'microsoftdefenderforcloud': { serviceName: 'Microsoft Defender for Cloud', meterName: 'Standard' },
  'defenderforcloud': { serviceName: 'Microsoft Defender for Cloud', meterName: 'Standard' },
  'defender': { serviceName: 'Microsoft Defender for Cloud', meterName: 'Standard' },
  'microsoftdefenderforiot': { serviceName: 'Microsoft Defender for IoT', meterName: 'Standard' },
  'microsoftdefendereasm': { serviceName: 'Microsoft Defender EASM', meterName: 'Standard' },
  'azureinformationprotection': { serviceName: 'Azure Information Protection', meterName: 'Standard' },  'dedicatedhsm': { serviceName: 'Dedicated HSM', meterName: 'Standard' },
  'confidentialledgers': { serviceName: 'Confidential Ledger', meterName: 'Standard' },
  'azureattestation': { serviceName: 'Azure Attestation', meterName: 'Standard' },
  'conditionalaccess': { serviceName: 'Conditional Access', meterName: 'Standard' },
  'extendedsecurityupdates': { serviceName: 'Extended Security Updates', meterName: 'Standard' },
  'detonation': { serviceName: 'Detonation', meterName: 'Standard' },
  'identitysecurescore': { serviceName: 'Identity Secure Score', meterName: 'Standard' },
  'multifactorauthentication': { serviceName: 'Multi-Factor Authentication', meterName: 'Standard' },
  
  // Defender IoT Device Types
  'defendercmlocalmanager': { serviceName: 'Microsoft Defender for IoT', meterName: 'Local Manager' },
  'defenderexternalmanagement': { serviceName: 'Microsoft Defender for IoT', meterName: 'External' },
  'defenderfreezermonitor': { serviceName: 'Microsoft Defender for IoT', meterName: 'Freezer' },
  'defenderhistorian': { serviceName: 'Microsoft Defender for IoT', meterName: 'Historian' },
  'defenderhmi': { serviceName: 'Microsoft Defender for IoT', meterName: 'HMI' },
  'defendermarquee': { serviceName: 'Microsoft Defender for IoT', meterName: 'Marquee' },
  'defenderrobotcontroller': { serviceName: 'Microsoft Defender for IoT', meterName: 'Robot' },
  'defendersensor': { serviceName: 'Microsoft Defender for IoT', meterName: 'Sensor' },
  'defenderslot': { serviceName: 'Microsoft Defender for IoT', meterName: 'Slot' },
  'defenderwebguidingsystem': { serviceName: 'Microsoft Defender for IoT', meterName: 'Web Guide' },
  'defenderdcscontroller': { serviceName: 'Microsoft Defender for IoT', meterName: 'DCS' },
  'defenderdistributercontrolsystem': { serviceName: 'Microsoft Defender for IoT', meterName: 'DCS' },
  'defenderengineeringstation': { serviceName: 'Microsoft Defender for IoT', meterName: 'Engineering' },
  'defenderindustrialpackagingsystem': { serviceName: 'Microsoft Defender for IoT', meterName: 'Packaging' },
  'defenderindustrialprinter': { serviceName: 'Microsoft Defender for IoT', meterName: 'Printer' },
  'defenderindustrialscalesystem': { serviceName: 'Microsoft Defender for IoT', meterName: 'Scale' },
  'defenderindustrialrobot': { serviceName: 'Microsoft Defender for IoT', meterName: 'Robot' },
  'defendermeter': { serviceName: 'Microsoft Defender for IoT', meterName: 'Meter' },
  'defenderplc': { serviceName: 'Microsoft Defender for IoT', meterName: 'PLC' },
  'defenderpneumaticdevice': { serviceName: 'Microsoft Defender for IoT', meterName: 'Pneumatic' },
  'defenderprogramableboard': { serviceName: 'Microsoft Defender for IoT', meterName: 'Board' },
  'defenderrelay': { serviceName: 'Microsoft Defender for IoT', meterName: 'Relay' },
  'defenderrtu': { serviceName: 'Microsoft Defender for IoT', meterName: 'RTU' },

  // ==================== IDENTITY ====================
  'activedirectory': { serviceName: 'Azure Active Directory', meterName: 'Free' },
  'azuread': { serviceName: 'Azure Active Directory', meterName: 'Free' },
  'entraid': { serviceName: 'Microsoft Entra ID', meterName: 'Free' },
  'entradomainservices': { serviceName: 'Microsoft Entra Domain Services', meterName: 'Standard' },
  'domainservices': { serviceName: 'Microsoft Entra Domain Services', meterName: 'Standard' },
  'entramanagedidentities': { serviceName: 'Managed Identities', meterName: 'Standard' },
  'managedidentities': { serviceName: 'Managed Identities', meterName: 'Standard' },
  'azureadb2c': { serviceName: 'Azure AD B2C', meterName: 'Standard' },
  'b2c': { serviceName: 'Azure AD B2C', meterName: 'Standard' },
  'entraidprotection': { serviceName: 'Microsoft Entra ID Protection', meterName: 'Standard' },
  'identityprotection': { serviceName: 'Microsoft Entra ID Protection', meterName: 'Standard' },
  'identitygovernance': { serviceName: 'Identity Governance', meterName: 'Standard' },
  'entraprivlegedidentitymanagement': { serviceName: 'Privileged Identity Management', meterName: 'Standard' },
  'pim': { serviceName: 'Privileged Identity Management', meterName: 'Standard' },
  'verifiablecredentials': { serviceName: 'Verifiable Credentials', meterName: 'Standard' },
  'entraverifiedid': { serviceName: 'Verified ID', meterName: 'Standard' },
  'externalidentities': { serviceName: 'External Identities', meterName: 'MAU' },
  'entraconnect': { serviceName: 'Microsoft Entra Connect', meterName: 'Standard' },
  'entraconnecthealth': { serviceName: 'Connect Health', meterName: 'Standard' },
  'activedirectoryconnecthealth': { serviceName: 'Connect Health', meterName: 'Standard' },
  'entraconnectsync': { serviceName: 'Microsoft Entra Connect', meterName: 'Sync' },
  'entraglobalsecureaccess': { serviceName: 'Global Secure Access', meterName: 'Standard' },
  'entraprivateaccess': { serviceName: 'Private Access', meterName: 'Standard' },
  'entrainternetaccess': { serviceName: 'Internet Access', meterName: 'Standard' },
  'users': { serviceName: 'Microsoft Entra ID', meterName: 'User' },
  'groups': { serviceName: 'Microsoft Entra ID', meterName: 'Group' },
  'enterpriseapplications': { serviceName: 'Microsoft Entra ID', meterName: 'Enterprise App' },
  'appregistrations': { serviceName: 'Microsoft Entra ID', meterName: 'App Registration' },
  'entraidentityrolesandadministrators': { serviceName: 'Microsoft Entra ID', meterName: 'Roles' },
  'administrativeunits': { serviceName: 'Microsoft Entra ID', meterName: 'Admin Units' },
  'tenantproperties': { serviceName: 'Microsoft Entra ID', meterName: 'Tenant' },
  'entraidentitycustomroles': { serviceName: 'Microsoft Entra ID', meterName: 'Custom Roles' },
  'entraidentitylicenses': { serviceName: 'Microsoft Entra ID', meterName: 'Licenses' },
  'apiproxy': { serviceName: 'Microsoft Entra ID', meterName: 'API Proxy' },
  'verificationasaservice': { serviceName: 'Verification as a Service', meterName: 'Standard' },
  'entraidentityriskysignins': { serviceName: 'Microsoft Entra ID Protection', meterName: 'Risky Sign-ins' },
  'entraidentityriskyusers': { serviceName: 'Microsoft Entra ID Protection', meterName: 'Risky Users' },
  'usersettings': { serviceName: 'Microsoft Entra ID', meterName: 'Settings' },

  // ==================== MANAGEMENT & GOVERNANCE ====================
  'monitor': { serviceName: 'Azure Monitor', meterName: 'Pay-as-you-go' },  'azuremonitor': { serviceName: 'Azure Monitor', meterName: 'Pay-as-you-go' },
  'applicationinsights': { serviceName: 'Application Insights', meterName: 'Pay-as-you-go' },
  'alerts': { serviceName: 'Azure Monitor', meterName: 'Alerts' },
  'metrics': { serviceName: 'Azure Monitor', meterName: 'Metrics' },
  'activitylog': { serviceName: 'Azure Monitor', meterName: 'Activity Log' },
  'diagnosticssettings': { serviceName: 'Azure Monitor', meterName: 'Diagnostics' },
  'autoscale': { serviceName: 'Azure Monitor', meterName: 'Autoscale' },
  'azuremonitorpipeline': { serviceName: 'Azure Monitor', meterName: 'Pipeline' },
  'azuremanagedgrafana': { serviceName: 'Azure Managed Grafana', meterName: 'Standard' },
  'grafana': { serviceName: 'Azure Managed Grafana', meterName: 'Standard' },
  'advisor': { serviceName: 'Azure Advisor', meterName: 'Free' },
  'policy': { serviceName: 'Azure Policy', meterName: 'Standard' },
  'blueprints': { serviceName: 'Azure Blueprints', meterName: 'Standard' },
  'resourcegraphexplorer': { serviceName: 'Resource Graph', meterName: 'Standard' },
  'managedapplicationscenter': { serviceName: 'Azure Managed Applications', meterName: 'Standard' },
  'automationaccounts': { serviceName: 'Azure Automation', meterName: 'Standard' },
  'automation': { serviceName: 'Azure Automation', meterName: 'Standard' },
  'scheduler': { serviceName: 'Scheduler', meterName: 'Standard' },
  'schedulerjobcollections': { serviceName: 'Scheduler', meterName: 'Standard' },
  'siterecovery': { serviceName: 'Site Recovery', meterName: 'Standard' },
  'recoveryservicesvaults': { serviceName: 'Recovery Services Vault', meterName: 'Standard' },
  'backup': { serviceName: 'Azure Backup', meterName: 'Standard' },
  'azurebackupcenter': { serviceName: 'Azure Backup', meterName: 'Center' },
  'backupvault': { serviceName: 'Backup Vault', meterName: 'Standard' },
  'resourceguard': { serviceName: 'Resource Guard', meterName: 'Standard' },
  'costmanagementandbilling': { serviceName: 'Cost Management', meterName: 'Standard' },
  'costmanagement': { serviceName: 'Cost Management', meterName: 'Standard' },
  'costanalysis': { serviceName: 'Cost Management', meterName: 'Analysis' },
  'costbudgets': { serviceName: 'Cost Management', meterName: 'Budgets' },
  'costalerts': { serviceName: 'Cost Management', meterName: 'Alerts' },
  'costexport': { serviceName: 'Cost Management', meterName: 'Export' },
  'azureconsumptioncommitment': { serviceName: 'Azure Consumption Commitment', meterName: 'Standard' },
  'azurelighthouse': { serviceName: 'Azure Lighthouse', meterName: 'Standard' },
  'lighthouse': { serviceName: 'Azure Lighthouse', meterName: 'Standard' },
  'mycustomers': { serviceName: 'Azure Lighthouse', meterName: 'Customers' },
  'serviceproviders': { serviceName: 'Azure Lighthouse', meterName: 'Providers' },
  'azurearc': { serviceName: 'Azure Arc', meterName: 'Standard' },
  'arc': { serviceName: 'Azure Arc', meterName: 'Standard' },
  'arcmachines': { serviceName: 'Azure Arc', meterName: 'Machines' },
  'machinesazurearc': { serviceName: 'Azure Arc', meterName: 'Machines' },
  'arckubernetes': { serviceName: 'Azure Arc', meterName: 'Kubernetes' },
  'arcpostgresql': { serviceName: 'Azure Arc', meterName: 'PostgreSQL' },
  'arcsqlmanagedinstance': { serviceName: 'Azure Arc', meterName: 'SQL MI' },
  'arcsqlserver': { serviceName: 'Azure Arc', meterName: 'SQL Server' },
  'arcdataservices': { serviceName: 'Azure Arc', meterName: 'Data' },
  'changeanalysis': { serviceName: 'Change Analysis', meterName: 'Standard' },
  'solutions': { serviceName: 'Management Solutions', meterName: 'Standard' },
  'manageddesktop': { serviceName: 'Managed Desktop', meterName: 'Standard' },
  'universalprint': { serviceName: 'Universal Print', meterName: 'Standard' },
  'customerlockboxformicrosoftazure': { serviceName: 'Customer Lockbox', meterName: 'Standard' },
  'updatemanagementcenter': { serviceName: 'Update Management Center', meterName: 'Standard' },
  'resourcemover': { serviceName: 'Azure Resource Mover', meterName: 'Standard' },
  'azurequotas': { serviceName: 'Azure Quotas', meterName: 'Standard' },
  'azurechaos': { serviceName: 'Azure Chaos Studio', meterName: 'Standard' },
  'azurechaosstudio': { serviceName: 'Azure Chaos Studio', meterName: 'Standard' },
  'intunetrends': { serviceName: 'Intune Trends', meterName: 'Standard' },
  'userprivacy': { serviceName: 'User Privacy', meterName: 'Standard' },
  'resourcesprovider': { serviceName: 'Resource Provider', meterName: 'Standard' },
  'compliancecenter': { serviceName: 'Compliance Center', meterName: 'Standard' },
  'compliance': { serviceName: 'Azure Policy', meterName: 'Compliance' },
  'azuresustainability': { serviceName: 'Azure Sustainability', meterName: 'Standard' },
  'monitorissues': { serviceName: 'Azure Monitor', meterName: 'Issues' },
  'monitorhealthmodels': { serviceName: 'Azure Monitor', meterName: 'Health' },
  'azuremonitordashboard': { serviceName: 'Azure Monitor', meterName: 'Dashboard' },

  // ==================== DEVOPS ====================
  'azuredevops': { serviceName: 'Azure DevOps', meterName: 'Basic' },
  'devops': { serviceName: 'Azure DevOps', meterName: 'Basic' },
  'repos': { serviceName: 'Azure DevOps', meterName: 'Repos' },
  'pipelines': { serviceName: 'Azure DevOps', meterName: 'Pipelines' },
  'boards': { serviceName: 'Azure DevOps', meterName: 'Boards' },
  'artifacts': { serviceName: 'Azure DevOps', meterName: 'Artifacts' },
  'testplans': { serviceName: 'Azure DevOps', meterName: 'Test Plans' },
  'apimanagementservices': { serviceName: 'API Management', meterName: 'Developer' },
  'apimanagement': { serviceName: 'API Management', meterName: 'Developer' },
  'apim': { serviceName: 'API Management', meterName: 'Developer' },
  'apiconnections': { serviceName: 'API Management', meterName: 'Connection' },
  'apicenter': { serviceName: 'API Center', meterName: 'Standard' },
  'devtestlabs': { serviceName: 'DevTest Labs', meterName: 'Standard' },
  'labservices': { serviceName: 'Lab Services', meterName: 'Standard' },
  'labaccounts': { serviceName: 'Lab Services', meterName: 'Account' },
  'loadtesting': { serviceName: 'Azure Load Testing', meterName: 'Standard' },
  'azureloadtesting': { serviceName: 'Azure Load Testing', meterName: 'Standard' },
  'cloudtest': { serviceName: 'Cloud Test', meterName: 'Standard' },
  'devopsstarter': { serviceName: 'DevOps Starter', meterName: 'Standard' },
  'manageddevopspools': { serviceName: 'Managed DevOps Pools', meterName: 'Standard' },
  'codeoptimization': { serviceName: 'Code Optimization', meterName: 'Standard' },
  'workspacegateway': { serviceName: 'Workspace Gateway', meterName: 'Standard' },
  'microsoftdevbox': { serviceName: 'Microsoft Dev Box', meterName: 'Standard' },
  'devbox': { serviceName: 'Microsoft Dev Box', meterName: 'Standard' },
  'azuredeploymentenvironments': { serviceName: 'Azure Deployment Environments', meterName: 'Standard' },
  'azuredevtunnels': { serviceName: 'Azure Dev Tunnels', meterName: 'Standard' },

  // ==================== IOT ====================
  'iothub': { serviceName: 'IoT Hub', meterName: 'S1' },
  'iot': { serviceName: 'IoT Hub', meterName: 'S1' },
  'iotcentral': { serviceName: 'IoT Central', meterName: 'Standard' },
  'iotcentralapplications': { serviceName: 'IoT Central', meterName: 'Standard' },
  'iotedge': { serviceName: 'IoT Edge', meterName: 'Standard' },
  'deviceprovisioningservices': { serviceName: 'IoT Hub DPS', meterName: 'Standard' },
  'dps': { serviceName: 'IoT Hub DPS', meterName: 'Standard' },
  'digitaltwins': { serviceName: 'Azure Digital Twins', meterName: 'Standard' },
  'timeseries': { serviceName: 'Time Series Insights', meterName: 'Standard' },
  'timeseriesinsightsenvironments': { serviceName: 'Time Series Insights', meterName: 'Standard' },
  'timeseriesinsightseventsources': { serviceName: 'Time Series Insights', meterName: 'Source' },
  'timeseriesinsightsaccesspolicies': { serviceName: 'Time Series Insights', meterName: 'Policy' },
  'timeseriesdatasets': { serviceName: 'Time Series Insights', meterName: 'Dataset' },
  'azuremaps': { serviceName: 'Azure Maps', meterName: 'S0' },
  'azuremapsaccounts': { serviceName: 'Azure Maps', meterName: 'S0' },
  'maps': { serviceName: 'Azure Maps', meterName: 'S0' },
  'azuresphere': { serviceName: 'Azure Sphere', meterName: 'Standard' },
  'sphere': { serviceName: 'Azure Sphere', meterName: 'Standard' },
  'windows10coreservices': { serviceName: 'Windows 10 IoT Core', meterName: 'Standard' },
  'industrialiot': { serviceName: 'Industrial IoT', meterName: 'Standard' },
  'azureiotoperations': { serviceName: 'Azure IoT Operations', meterName: 'Standard' },
  'deviceupdateiothub': { serviceName: 'Device Update for IoT Hub', meterName: 'Standard' },
  'rtos': { serviceName: 'Azure RTOS', meterName: 'Standard' },

  // ==================== INTEGRATION ====================
  'logicapps': { serviceName: 'Logic Apps', meterName: 'Standard' },
  'logicapp': { serviceName: 'Logic Apps', meterName: 'Standard' },
  'integrationaccounts': { serviceName: 'Logic Apps', meterName: 'Integration Account' },
  'integrationserviceenvironments': { serviceName: 'Logic Apps', meterName: 'ISE' },
  'integrationenvironments': { serviceName: 'Integration Environments', meterName: 'Standard' },
  'logicappscustomconnector': { serviceName: 'Logic Apps', meterName: 'Custom Connector' },
  'logicappstemplate': { serviceName: 'Logic Apps', meterName: 'Template' },
  'eventgrid': { serviceName: 'Event Grid', meterName: 'Standard' },
  'eventgridtopics': { serviceName: 'Event Grid', meterName: 'Topic' },
  'eventgriddomains': { serviceName: 'Event Grid', meterName: 'Domain' },
  'eventgridsubscriptions': { serviceName: 'Event Grid', meterName: 'Subscription' },
  'systemtopic': { serviceName: 'Event Grid', meterName: 'System Topic' },
  'partnertopic': { serviceName: 'Event Grid', meterName: 'Partner Topic' },
  'partnernamespace': { serviceName: 'Event Grid', meterName: 'Partner Namespace' },
  'partnerregistration': { serviceName: 'Event Grid', meterName: 'Partner Registration' },
  'servicebus': { serviceName: 'Service Bus', meterName: 'Standard' },
  'azureservicebus': { serviceName: 'Service Bus', meterName: 'Standard' },
  'relays': { serviceName: 'Azure Relay', meterName: 'Standard' },
  'relay': { serviceName: 'Azure Relay', meterName: 'Standard' },
  'notificationhubs': { serviceName: 'Notification Hubs', meterName: 'Free' },
  'notificationhubnamespaces': { serviceName: 'Notification Hubs', meterName: 'Namespace' },
  'appconfiguration': { serviceName: 'App Configuration', meterName: 'Standard' },
  'appconfig': { serviceName: 'App Configuration', meterName: 'Standard' },
  'sendgridaccounts': { serviceName: 'SendGrid', meterName: 'Free' },
  'sendgrid': { serviceName: 'SendGrid', meterName: 'Free' },
  'softwareasaservice': { serviceName: 'SaaS', meterName: 'Standard' },
  'saas': { serviceName: 'SaaS', meterName: 'Standard' },
  'azureapiforfhir': { serviceName: 'Azure API for FHIR', meterName: 'Standard' },
  'fhir': { serviceName: 'Azure API for FHIR', meterName: 'Standard' },
  'fhirservice': { serviceName: 'FHIR Service', meterName: 'Standard' },
  'medtechservice': { serviceName: 'MedTech Service', meterName: 'Standard' },
  'ssisliftandshiftir': { serviceName: 'SSIS Integration Runtime', meterName: 'Standard' },  'businessprocesstracking': { serviceName: 'Business Process Tracking', meterName: 'Standard' },

  // ==================== CONTAINERS ====================
  'acr': { serviceName: 'Container Registry', meterName: 'Basic' },
  'aci': { serviceName: 'Container Instances', meterName: '1 vCPU' },
  'containerapps': { serviceName: 'Container Apps', meterName: 'Consumption' },
  'containerappsenvironments': { serviceName: 'Container Apps', meterName: 'Environment' },
  'workercontainerapp': { serviceName: 'Container Apps', meterName: 'Worker' },
  'azurecontainerstorage': { serviceName: 'Azure Container Storage', meterName: 'Standard' },
  'containerservicesdeprecated': { serviceName: 'Container Service', meterName: 'Deprecated' },
  'azureredhatopenshift': { serviceName: 'Azure Red Hat OpenShift', meterName: 'Standard' },
  'aro': { serviceName: 'Azure Red Hat OpenShift', meterName: 'Standard' },
  'kubernetesfleetmanager': { serviceName: 'Kubernetes Fleet Manager', meterName: 'Standard' },
  'kuberneteshub': { serviceName: 'Kubernetes', meterName: 'Hub' },
  'aksistio': { serviceName: 'AKS', meterName: 'Istio' },
  'aksnetworkpolicy': { serviceName: 'AKS', meterName: 'Network Policy' },

  // ==================== WEB ====================
  'appserviceplans': { serviceName: 'Azure App Service', meterName: 'B1' },
  'appserviceplan': { serviceName: 'Azure App Service', meterName: 'B1' },
  'webapp': { serviceName: 'Azure App Service', meterName: 'B1' },
  'webapps': { serviceName: 'Azure App Service', meterName: 'B1' },
  'appserviceenvironments': { serviceName: 'App Service Environment', meterName: 'v3' },
  'ase': { serviceName: 'App Service Environment', meterName: 'v3' },
  'appservicecertificates': { serviceName: 'App Service', meterName: 'Certificate' },
  'appservicedomains': { serviceName: 'App Service', meterName: 'Domain' },
  'staticapps': { serviceName: 'Static Web Apps', meterName: 'Free' },
  'staticwebapps': { serviceName: 'Static Web Apps', meterName: 'Free' },
  'signalr': { serviceName: 'Azure SignalR Service', meterName: 'Free' },
  'signalrservice': { serviceName: 'Azure SignalR Service', meterName: 'Free' },
  'azuremediaservice': { serviceName: 'Azure Media Services', meterName: 'Standard' },
  'mediaservices': { serviceName: 'Azure Media Services', meterName: 'Standard' },
  'appspace': { serviceName: 'App Space', meterName: 'Standard' },
  'appspacecomponent': { serviceName: 'App Space', meterName: 'Component' },
  'webjobs': { serviceName: 'Web Jobs', meterName: 'Standard' },

  // ==================== MOBILE ====================
  'mobileengagement': { serviceName: 'Mobile Engagement', meterName: 'Standard' },
  'windowsnotificationservices': { serviceName: 'Windows Notification Services', meterName: 'Standard' },
  'wns': { serviceName: 'Windows Notification Services', meterName: 'Standard' },

  // ==================== MIXED REALITY ====================
  'spatialanchoraccounts': { serviceName: 'Azure Spatial Anchors', meterName: 'Standard' },
  'spatialanchors': { serviceName: 'Azure Spatial Anchors', meterName: 'Standard' },
  'remoterendering': { serviceName: 'Azure Remote Rendering', meterName: 'Standard' },
  'azureremoterendering': { serviceName: 'Azure Remote Rendering', meterName: 'Standard' },

  // ==================== MIGRATION ====================  'azuremigrate': { serviceName: 'Azure Migrate', meterName: 'Standard' },
  'migrate': { serviceName: 'Azure Migrate', meterName: 'Standard' },
  'dms': { serviceName: 'Database Migration Service', meterName: 'Standard' },

  // ==================== AZURE VMWARE SOLUTION ====================
  'azurevmwaresolution': { serviceName: 'Azure VMware Solution', meterName: 'AV36' },
  'avs': { serviceName: 'Azure VMware Solution', meterName: 'AV36' },
  'avsvm': { serviceName: 'Azure VMware Solution', meterName: 'VM' },

  // ==================== SAP ====================
  'azuremonitorsforsapsolutions': { serviceName: 'Azure Monitor for SAP Solutions', meterName: 'Standard' },
  'sapmonitor': { serviceName: 'Azure Monitor for SAP Solutions', meterName: 'Standard' },
  'azurecenterforsap': { serviceName: 'Azure Center for SAP', meterName: 'Standard' },
  'virtualinstanceforsap': { serviceName: 'Virtual Instance for SAP', meterName: 'Standard' },
  'centralserviceinstanceforsap': { serviceName: 'Central Service Instance for SAP', meterName: 'Standard' },
  'databaseinstanceforsap': { serviceName: 'Database Instance for SAP', meterName: 'Standard' },

  // ==================== AZURE STACK ====================
  'azurestack': { serviceName: 'Azure Stack', meterName: 'Standard' },
  'azurestackhci': { serviceName: 'Azure Stack HCI', meterName: 'Standard' },
  'stackhci': { serviceName: 'Azure Stack HCI', meterName: 'Standard' },
  'azurestackhcisizer': { serviceName: 'Azure Stack HCI', meterName: 'Sizer' },
  'stackhcipremium': { serviceName: 'Azure Stack HCI', meterName: 'Premium' },
  'azurelocal': { serviceName: 'Azure Local', meterName: 'Standard' },
  'multitenancy': { serviceName: 'Azure Stack', meterName: 'Multi-tenancy' },
  'infrastructurebackup': { serviceName: 'Azure Stack', meterName: 'Backup' },
  'capacity': { serviceName: 'Azure Stack', meterName: 'Capacity' },
  'offers': { serviceName: 'Azure Stack', meterName: 'Offers' },
  'usersubscriptions': { serviceName: 'Azure Stack', meterName: 'Subscriptions' },
  'plans': { serviceName: 'Azure Stack', meterName: 'Plans' },
  'updates': { serviceName: 'Azure Stack', meterName: 'Updates' },
  'edgemanagement': { serviceName: 'Azure Stack Edge', meterName: 'Management' },

  // ==================== BLOCKCHAIN ====================
  'blockchainapplications': { serviceName: 'Blockchain', meterName: 'Application' },
  'blockchain': { serviceName: 'Blockchain', meterName: 'Standard' },
  'azureblockchainservice': { serviceName: 'Azure Blockchain Service', meterName: 'Standard' },
  'azuretokenservice': { serviceName: 'Azure Blockchain Tokens', meterName: 'Standard' },
  'absmember': { serviceName: 'Azure Blockchain Service', meterName: 'Member' },
  'consortium': { serviceName: 'Azure Blockchain Service', meterName: 'Consortium' },
  'outboundconnection': { serviceName: 'Azure Blockchain Service', meterName: 'Connection' },

  // ==================== INTUNE ====================
  'intune': { serviceName: 'Microsoft Intune', meterName: 'Standard' },
  'ebooks': { serviceName: 'Microsoft Intune', meterName: 'eBooks' },
  'clientapps': { serviceName: 'Microsoft Intune', meterName: 'Client Apps' },
  'devices': { serviceName: 'Microsoft Intune', meterName: 'Devices' },
  'devicecompliance': { serviceName: 'Microsoft Intune', meterName: 'Compliance' },
  'softwareupdates': { serviceName: 'Microsoft Intune', meterName: 'Updates' },
  'securitybaselines': { serviceName: 'Microsoft Intune', meterName: 'Baselines' },
  'deviceenrollment': { serviceName: 'Microsoft Intune', meterName: 'Enrollment' },
  'deviceconfiguration': { serviceName: 'Microsoft Intune', meterName: 'Configuration' },
  'exchangeaccess': { serviceName: 'Microsoft Intune', meterName: 'Exchange' },
  'exchangeonpremisesaccess': { serviceName: 'Microsoft Intune', meterName: 'Exchange On-Prem' },
  'tenantstatus': { serviceName: 'Microsoft Intune', meterName: 'Tenant' },
  'intuneforeducation': { serviceName: 'Intune for Education', meterName: 'Standard' },
  'intuneappprotection': { serviceName: 'Microsoft Intune', meterName: 'App Protection' },
  'devicesecurity': { serviceName: 'Microsoft Intune', meterName: 'Security' },
  'devicesecurityapple': { serviceName: 'Microsoft Intune', meterName: 'Apple Security' },
  'devicesecuritygoogle': { serviceName: 'Microsoft Intune', meterName: 'Google Security' },
  'devicesecuritywindows': { serviceName: 'Microsoft Intune', meterName: 'Windows Security' },
  'mindaro': { serviceName: 'Mindaro', meterName: 'Standard' },

  // ==================== HYBRID + MULTICLOUD ====================
  'azureoperator5gcore': { serviceName: 'Azure Operator 5G Core', meterName: 'Standard' },
  'azureoperatornexus': { serviceName: 'Azure Operator Nexus', meterName: 'Standard' },
  'azureoperatorinsights': { serviceName: 'Azure Operator Insights', meterName: 'Standard' },
  'azureoperatorservicemanager': { serviceName: 'Azure Operator Service Manager', meterName: 'Standard' },
  'azureprogrammableconnectivity': { serviceName: 'Azure Programmable Connectivity', meterName: 'Standard' },
  'mobilenetworks': { serviceName: 'Mobile Networks', meterName: 'Standard' },

  // ==================== OTHER / SPECIALIZED ====================
  'azurecommunicationservices': { serviceName: 'Azure Communication Services', meterName: 'Standard' },
  'communication': { serviceName: 'Azure Communication Services', meterName: 'Standard' },
  'videoanalyzers': { serviceName: 'Video Analyzers', meterName: 'Standard' },
  'azurevideoindexer': { serviceName: 'Azure Video Indexer', meterName: 'Standard' },
  'videoindexer': { serviceName: 'Azure Video Indexer', meterName: 'Standard' },
  'azurecloudshell': { serviceName: 'Cloud Shell', meterName: 'Standard' },
  'cloudshell': { serviceName: 'Cloud Shell', meterName: 'Standard' },
  'internetanalyzerprofiles': { serviceName: 'Internet Analyzer', meterName: 'Standard' },
  'internetanalyzer': { serviceName: 'Internet Analyzer', meterName: 'Standard' },
  'azurevirtualdesktop': { serviceName: 'Azure Virtual Desktop', meterName: 'Standard' },
  'avd': { serviceName: 'Azure Virtual Desktop', meterName: 'Standard' },  'wvd': { serviceName: 'Virtual Machines', meterName: 'D2s v3' }, // AVD uses VM pricing
  'hostpools': { serviceName: 'Virtual Machines', meterName: 'D2s v3' }, // Host pools charge for underlying VMs
  'applicationgroup': { serviceName: 'Virtual Machines', meterName: 'D2s v3' }, // App groups charge for VMs
  'workspaces': { serviceName: 'Virtual Machines', meterName: 'D2s v3' }, // Workspaces charge for VMs
  'sshkeys': { serviceName: 'SSH Keys', meterName: 'Standard' },
  'templatespecs': { serviceName: 'Template Specs', meterName: 'Standard' },
  'dashboardhub': { serviceName: 'Dashboard Hub', meterName: 'Standard' },
  'dashboard': { serviceName: 'Azure Dashboard', meterName: 'Standard' },
  'loganalyticsquerypack': { serviceName: 'Log Analytics', meterName: 'Query Pack' },
  'datacollectionrules': { serviceName: 'Azure Monitor', meterName: 'Data Collection' },
  'baremetalinfrastructure': { serviceName: 'Bare Metal Infrastructure', meterName: 'Standard' },
  'modulardat center': { serviceName: 'Modular Data Center', meterName: 'Standard' },
  'azureorbital': { serviceName: 'Azure Orbital', meterName: 'Standard' },
  'orbital': { serviceName: 'Azure Orbital', meterName: 'Standard' },
  'azurehpcworkbenches': { serviceName: 'Azure HPC Workbenches', meterName: 'Standard' },
  'opensupplychainplatform': { serviceName: 'Open Supply Chain Platform', meterName: 'Standard' },
  'connectedvehicleplatform': { serviceName: 'Connected Vehicle Platform', meterName: 'Standard' },
  'testbase': { serviceName: 'Test Base', meterName: 'Standard' },
  'reservedcapacity': { serviceName: 'Reserved Capacity', meterName: 'Standard' },  'savingsplans': { serviceName: 'Savings Plans', meterName: 'Standard' },
  'reservations': { serviceName: 'Reservations', meterName: 'Standard' },
  'virtualvisitsbuilder': { serviceName: 'Virtual Visits Builder', meterName: 'Standard' },
  'appcompliance automation': { serviceName: 'App Compliance Automation', meterName: 'Standard' },
  'planetarycomputerpro': { serviceName: 'Planetary Computer Pro', meterName: 'Standard' },
  'azureapptesting': { serviceName: 'Azure App Testing', meterName: 'Standard' },
  'maintenanceconfiguration': { serviceName: 'Maintenance Configuration', meterName: 'Standard' },
  'automanagedvm': { serviceName: 'Automanaged VM', meterName: 'Standard' },
  'imagetemplates': { serviceName: 'VM Image Builder', meterName: 'Standard' },
  'communityimages': { serviceName: 'Community Images', meterName: 'Standard' },
  'vmimageversion': { serviceName: 'VM Image Version', meterName: 'Standard' },
  'vmap pdefinitions': { serviceName: 'VM App Definitions', meterName: 'Standard' },
  'vmappversions': { serviceName: 'VM App Versions', meterName: 'Standard' },
  'scvmmmanagementservers': { serviceName: 'SCVMM Management Servers', meterName: 'Standard' },
  'cloudservicesextendedsupport': { serviceName: 'Cloud Services Extended Support', meterName: 'Standard' },
  'azuresupportcenterblue': { serviceName: 'Azure Support', meterName: 'Standard' },
  'webappdatabase': { serviceName: 'Web App + Database', meterName: 'Standard' },
  'azureedgehardwarecenter': { serviceName: 'Azure Edge Hardware Center', meterName: 'Standard' },
  'missionlandingzone': { serviceName: 'Mission Landing Zone', meterName: 'Standard' },
  'targetman sagement': { serviceName: 'Targets Management', meterName: 'Standard' },
  'storagefunctions': { serviceName: 'Storage Functions', meterName: 'Standard' },
  'azurenetworkfunctionmanager': { serviceName: 'Network Function Manager', meterName: 'Standard' },
  'azurenetworkfunctionmanagerfunctions': { serviceName: 'Network Function Manager', meterName: 'Functions' },
  'wac': { serviceName: 'Windows Admin Center', meterName: 'Standard' },
  'wacinstaller': { serviceName: 'Windows Admin Center', meterName: 'Installer' },
  'spotvm': { serviceName: 'Spot Virtual Machines', meterName: 'Standard' },
  'spotvmss': { serviceName: 'Spot VM Scale Sets', meterName: 'Standard' },
  'osimagesclassic': { serviceName: 'OS Images (Classic)', meterName: 'Standard' },
  'vmimagesclassic': { serviceName: 'VM Images (Classic)', meterName: 'Standard' },
  'virtualmachinesclassic': { serviceName: 'Virtual Machines (Classic)', meterName: 'Standard' },
  'disksclassic': { serviceName: 'Disks (Classic)', meterName: 'Standard' },
  'diskssnapshots': { serviceName: 'Storage', meterName: 'Standard HDD Snapshots' },
  'disksnapshots': { serviceName: 'Storage', meterName: 'Standard HDD Snapshots' },
  
  // ==================== GENERAL / UI ELEMENTS ====================
  'allresources': { serviceName: 'Azure Portal', meterName: 'Free' },
  'subscriptions': { serviceName: 'Azure Portal', meterName: 'Free' },
  'resourcegroups': { serviceName: 'Azure Portal', meterName: 'Free' },
  'marketplace': { serviceName: 'Azure Marketplace', meterName: 'Free' },
  'marketplacemanagement': { serviceName: 'Azure Marketplace', meterName: 'Management' },
  'templates': { serviceName: 'ARM Templates', meterName: 'Free' },
  'quickstartcenter': { serviceName: 'Quickstart Center', meterName: 'Free' },
  'managementgroups': { serviceName: 'Management Groups', meterName: 'Free' },
  'servicehealth': { serviceName: 'Service Health', meterName: 'Free' },
  'helpandsupport': { serviceName: 'Azure Support', meterName: 'Free' },
  'tag': { serviceName: 'Tags', meterName: 'Free' },
  'tags': { serviceName: 'Tags', meterName: 'Free' },
  'freeservices': { serviceName: 'Free Services', meterName: 'Free' },
  'previewfeatures': { serviceName: 'Preview Features', meterName: 'Free' },
  'recent': { serviceName: 'Azure Portal', meterName: 'Recent' },
  'information': { serviceName: 'Azure Portal', meterName: 'Info' },
  'resourceexplorer': { serviceName: 'Resource Explorer', meterName: 'Free' },
  'troubleshoot': { serviceName: 'Troubleshoot', meterName: 'Free' },
  'regionmanagement': { serviceName: 'Region Management', meterName: 'Free' },
  'education': { serviceName: 'Azure for Education', meterName: 'Free' },
  'servicecatalogmad': { serviceName: 'Service Catalog', meterName: 'Free' },
  'operationlogclassic': { serviceName: 'Activity Log', meterName: 'Classic' },
  'azurea': { serviceName: 'Azure', meterName: 'Standard' }
};

/**
 * Free Azure resources (no pricing in API)
 * These resources don't incur direct costs
 */
const freeAzureResources = {
  'resourcegroups': { name: 'Resource Groups', description: 'Free - Management container' },
  'resourcegroup': { name: 'Resource Groups', description: 'Free - Management container' },
  'networkinterfaces': { name: 'Network Interfaces', description: 'Free - No direct cost (bandwidth may apply)' },
  'networkinterface': { name: 'Network Interfaces', description: 'Free - No direct cost (bandwidth may apply)' },
  'networksecuritygroups': { name: 'Network Security Groups', description: 'Free - No direct cost' },
  'networksecuritygroup': { name: 'Network Security Groups', description: 'Free - No direct cost' },
  'nsg': { name: 'Network Security Groups', description: 'Free - No direct cost' },
  'subnets': { name: 'Subnets', description: 'Free - Part of Virtual Network' },
  'subnet': { name: 'Subnets', description: 'Free - Part of Virtual Network' },
  'routetables': { name: 'Route Tables', description: 'Free - No direct cost' },
  'routetable': { name: 'Route Tables', description: 'Free - No direct cost' },
  'managedidentities': { name: 'Managed Identities', description: 'Free - No direct cost' },
  'managedidentity': { name: 'Managed Identities', description: 'Free - No direct cost' },
  'availabilityzones': { name: 'Availability Zones', description: 'Free - Infrastructure feature' },
  'availabilityzone': { name: 'Availability Zones', description: 'Free - Infrastructure feature' },
  'tags': { name: 'Tags', description: 'Free - Metadata' },
  'tag': { name: 'Tags', description: 'Free - Metadata' }
};

/**
 * Fetch real-time pricing from Azure Retail Prices API
 */
export async function fetchAzureRetailPrice(serviceType, region = 'eastus', currency = 'USD') {
  const normalizedService = serviceType.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Check if service is retired/deprecated
  if (retiredServices[normalizedService]) {
    const retired = retiredServices[normalizedService];
    console.warn(`🚫 ${retired.name} - ${retired.status}`);
    console.warn(`   ${retired.message}`);
    console.warn(`   Retired: ${retired.retiredDate}`);
    console.warn(`   Replacement: ${retired.replacement}`);
    
    return {
      serviceName: retired.name,
      skuName: retired.status,
      meterName: 'Not Available',
      retailPrice: 0,
      unitPrice: 0,
      unitOfMeasure: 'N/A',
      currencyCode: currency,
      armRegionName: region,
      monthlyEstimate: 0,
      isRetired: true,
      retiredInfo: retired
    };
  }
  
  // Check if service is free (no direct cost)
  if (freeAzureResources[normalizedService]) {
    const freeResource = freeAzureResources[normalizedService];
    console.log(`💚 ${freeResource.name} - Free Resource`);
    console.log(`   ${freeResource.description}`);
    
    return {
      serviceName: freeResource.name,
      skuName: 'Free',
      meterName: 'No Charge',
      retailPrice: 0,
      unitPrice: 0,
      unitOfMeasure: 'Free',
      currencyCode: currency,
      armRegionName: region,
      monthlyEstimate: 0,
      isFree: true,
      freeInfo: freeResource
    };
  }
  
  const mapping = serviceToMeterMapping[normalizedService];
  
  if (!mapping) {
    console.warn(`⚠️ No Azure Retail Prices mapping for: "${serviceType}" (normalized: "${normalizedService}")`);
    console.warn(`💡 This service may not be available in the Azure Retail Prices API yet.`);
    console.warn(`   Available mappings:`, Object.keys(serviceToMeterMapping).slice(0, 10));
    
    return {
      serviceName: serviceType,
      skuName: 'Not Available in API',
      meterName: 'Not Mapped',
      retailPrice: 0,
      unitPrice: 0,
      unitOfMeasure: 'N/A',
      currencyCode: currency,
      armRegionName: region,
      monthlyEstimate: 0,
      isNotMapped: true,
      message: 'This service is not yet mapped to the Azure Retail Prices API. Using estimated pricing.'
    };
  }

  // Check cache
  const cacheKey = `${normalizedService}-${region}-${currency}`;
  const cached = priceCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < CACHE_DURATION) {
    console.log(`✅ Using cached price for ${serviceType}: $${cached.data.monthlyEstimate}/month`);
    return cached.data;
  }
  try {
    // Build API query filter
    const filter = `serviceName eq '${mapping.serviceName}' and armRegionName eq '${region}' and currencyCode eq '${currency}' and priceType eq 'Consumption'`;
    
    // Use CORS proxy for the full URL with query parameters
    const azureUrl = `${AZURE_RETAIL_PRICES_API}?$filter=${encodeURIComponent(filter)}&$top=10`;
    const url = CORS_PROXY + encodeURIComponent(azureUrl);
    
    console.log(`🌐 Fetching Azure retail price for "${serviceType}" via CORS proxy`);
    console.log(`   Azure API: ${azureUrl}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Azure Retail Prices API error: ${response.status}`);
    }    const data = await response.json();
      if (!data.Items || data.Items.length === 0) {
      console.warn(`⚠️ No pricing data found for "${serviceType}" in ${region} with currency ${currency}`);
      console.warn(`API Filter used:`, filter);
      console.warn(`💡 Service: "${mapping.serviceName}", Meter: "${mapping.meterName}"`);
      
      // Return structured error instead of null
      return {
        serviceName: mapping.serviceName,
        skuName: 'No Pricing Data',
        meterName: mapping.meterName || 'Not Found',
        retailPrice: 0,
        unitPrice: 0,
        unitOfMeasure: 'N/A',
        currencyCode: currency,
        armRegionName: region,
        monthlyEstimate: 0,
        isNotAvailable: true,
        message: `Pricing data not available in Azure Retail Prices API for this service in ${region}. The service may use indirect billing or be included in another service's cost.`
      };
    }

    console.log(`✅ Found ${data.Items.length} pricing options for "${serviceType}"`);

    // Find the best matching meter
    let bestMatch = data.Items[0];
    
    // Try to find exact meter name match
    if (mapping.meterName) {
      const exactMatch = data.Items.find(item => 
        item.meterName?.toLowerCase().includes(mapping.meterName.toLowerCase()) ||
        item.skuName?.toLowerCase().includes(mapping.meterName.toLowerCase())
      );
      if (exactMatch) {
        bestMatch = exactMatch;
        console.log(`✅ Found exact match: ${bestMatch.skuName} - ${bestMatch.meterName}`);
      }
    }

    const priceData = {
      serviceName: bestMatch.serviceName,
      skuName: bestMatch.skuName,
      meterName: bestMatch.meterName,
      retailPrice: bestMatch.retailPrice,
      unitPrice: bestMatch.unitPrice,
      unitOfMeasure: bestMatch.unitOfMeasure,
      currencyCode: bestMatch.currencyCode,
      armRegionName: bestMatch.armRegionName,
      effectiveDate: bestMatch.effectiveStartDate,
      productName: bestMatch.productName,
      // Calculate monthly estimate based on unit
      monthlyEstimate: calculateMonthlyEstimate(bestMatch)
    };

    console.log(`💰 ${serviceType} pricing: $${priceData.retailPrice}/${priceData.unitOfMeasure} → $${priceData.monthlyEstimate.toFixed(2)}/month`);

    // Cache the result
    priceCache.set(cacheKey, {
      data: priceData,
      timestamp: Date.now()
    });

    return priceData;

  } catch (error) {
    console.error(`Error fetching Azure retail price for ${serviceType}:`, error);
    return null;
  }
}

/**
 * Calculate monthly cost estimate from Azure retail price
 */
function calculateMonthlyEstimate(priceItem) {
  const hourlyRate = priceItem.retailPrice || priceItem.unitPrice || 0;
  const unit = priceItem.unitOfMeasure?.toLowerCase() || '';

  // Calculate based on unit of measure
  if (unit.includes('hour') || unit.includes('/hour')) {
    // Hourly rate * 730 hours/month
    return hourlyRate * 730;
  } else if (unit.includes('month')) {
    return hourlyRate;
  } else if (unit.includes('day')) {
    return hourlyRate * 30;
  } else if (unit.includes('gb') || unit.includes('storage')) {
    // Storage: assume 100 GB baseline
    return hourlyRate * 100;
  } else if (unit.includes('transaction') || unit.includes('request')) {
    // Transactions: assume 1M transactions
    return hourlyRate * 1000000;
  } else if (unit.includes('execution')) {
    // Executions: assume 1M executions
    return hourlyRate * 1000000;
  }

  // Default: treat as monthly
  return hourlyRate;
}

/**
 * Fetch pricing for multiple services in parallel
 */
export async function fetchBulkAzureRetailPrices(services, region = 'eastus', currency = 'USD') {
  console.log(`📊 Fetching prices for ${services.length} services...`);
  
  const promises = services.map(service => {
    // Try multiple field names for service type
    const serviceType = service.serviceType || service.type || service.id || 'unknown';
    console.log(`   → Service: "${service.name}" (type: ${serviceType})`);
    
    return fetchAzureRetailPrice(serviceType, region, currency)
      .then(price => ({
        ...service,
        realTimePrice: price
      }))
      .catch(error => {
        console.error(`❌ Error fetching price for ${service.name}:`, error);
        return { ...service, realTimePrice: null };
      });
  });

  return Promise.all(promises);
}

/**
 * Get pricing summary for entire architecture
 */
export async function getArchitecturePricingSummary(items, region = 'eastus', currency = 'USD') {
  console.log(`\n🌐 ===== AZURE RETAIL PRICES API =====`);
  console.log(`📍 Region: ${region} | 💱 Currency: ${currency}`);
  console.log(`📦 Fetching pricing for ${items.length} services...`);
    const pricedItems = await fetchBulkAzureRetailPrices(items, region, currency);
  let retiredCount = 0;
  let notMappedCount = 0;
  let notAvailableCount = 0; // Services with no API data
  let pricedCount = 0;
  let freeCount = 0; // Track free resources
  
  const totalMonthly = pricedItems.reduce((sum, item) => {
    const price = item.realTimePrice?.monthlyEstimate || 0;
    
    if (item.realTimePrice?.isRetired) {
      retiredCount++;
      const info = item.realTimePrice.retiredInfo;
      console.log(`   🚫 ${item.name}: ${info.status} (${info.retiredDate}) → Use ${info.replacement}`);
    } else if (item.realTimePrice?.isFree) {
      freeCount++;
      console.log(`   💚 ${item.name}: Free (${item.realTimePrice.freeInfo.description})`);
    } else if (item.realTimePrice?.isNotMapped) {
      notMappedCount++;
      console.log(`   ⚠️ ${item.name}: Not yet mapped to pricing API`);
    } else if (item.realTimePrice?.isNotAvailable) {
      notAvailableCount++;
      console.log(`   ℹ️ ${item.name}: ${item.realTimePrice.message}`);
    } else if (price > 0) {
      pricedCount++;
      console.log(`   ✅ ${item.name}: $${price.toFixed(2)}/month`);
    } else {
      console.log(`   ⚠️ ${item.name}: No pricing data available`);
    }
    
    return sum + price;
  }, 0);
  console.log(`\n💰 TOTAL MONTHLY COST: $${totalMonthly.toFixed(2)}`);
  console.log(`✅ Priced: ${pricedCount}/${items.length}`);
  if (freeCount > 0) {
    console.log(`💚 Free Resources: ${freeCount}`);
  }
  if (notAvailableCount > 0) {
    console.log(`ℹ️ No API Pricing Data: ${notAvailableCount}`);
  }
  if (retiredCount > 0) {
    console.log(`🚫 Retired/Deprecated: ${retiredCount}`);
  }
  if (notMappedCount > 0) {
    console.log(`⚠️ Not Mapped: ${notMappedCount}`);
  }
  console.log(`===================================\n`);
  const serviceBreakdown = pricedItems.map(item => ({
    id: item.id,
    name: item.name,
    serviceType: item.serviceType || item.type,
    monthlyEstimate: item.realTimePrice?.monthlyEstimate || 0,
    unitPrice: item.realTimePrice?.retailPrice || 0,
    unitOfMeasure: item.realTimePrice?.unitOfMeasure || 'N/A',
    skuName: item.realTimePrice?.skuName || 'Standard',
    currencyCode: currency,
    region: region,    lastUpdated: new Date().toISOString(),
    isRetired: item.realTimePrice?.isRetired || false,
    retiredInfo: item.realTimePrice?.retiredInfo || null,
    isNotMapped: item.realTimePrice?.isNotMapped || false,
    isNotAvailable: item.realTimePrice?.isNotAvailable || false,
    isFree: item.realTimePrice?.isFree || false,
    freeInfo: item.realTimePrice?.freeInfo || null,
    message: item.realTimePrice?.message || null
  }));  return {
    totalMonthly,
    totalYearly: totalMonthly * 12,
    currency,
    region,
    itemCount: items.length,
    pricedItemCount: pricedCount,
    freeItemCount: freeCount,
    notAvailableItemCount: notAvailableCount,
    unpricedItemCount: items.length - pricedCount - freeCount,
    retiredItemCount: retiredCount,
    notMappedItemCount: notMappedCount,
    serviceBreakdown,
    generatedAt: new Date().toISOString(),
    dataSource: 'Azure Retail Prices API (Official)',
    apiEndpoint: AZURE_RETAIL_PRICES_API
  };
}

/**
 * Clear price cache (useful for forcing refresh)
 */
export function clearPriceCache() {
  priceCache.clear();
  console.log('Azure price cache cleared');
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    size: priceCache.size,
    entries: Array.from(priceCache.keys())
  };
}
