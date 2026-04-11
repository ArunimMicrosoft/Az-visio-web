// Enterprise-Grade Terraform Configuration Generator
// Generates production-ready, deployable Terraform code following Azure best practices

/**
 * Analyze boundaries to extract organizational structure
 * @param {Array} boundaries - Boundary elements
 * @param {Array} items - Service items
 * @returns {Object} - Organizational structure
 */
const analyzeBoundaries = (boundaries = [], items = []) => {
  const structure = {
    subscriptions: [],
    resourceGroups: [],
    vnets: [],
    subnets: [],
    nsgs: []
  };
  
  boundaries.forEach(boundary => {
    const type = (boundary.type || '').toLowerCase();
    const label = boundary.label || 'Unnamed';
    
    if (type.includes('subscription')) {
      structure.subscriptions.push({ label, boundary });
    } else if (type.includes('resource-group')) {
      structure.resourceGroups.push({ label, boundary });
    } else if (type.includes('virtual-network') || type.includes('vnet')) {
      structure.vnets.push({ label, boundary });
    } else if (type.includes('subnet')) {
      structure.subnets.push({ label, boundary });
    } else if (type.includes('nsg')) {
      structure.nsgs.push({ label, boundary });
    }
  });
  
  return structure;
};

/**
 * Generate complete enterprise Terraform configuration
 * @param {Array} items - Azure service items
 * @param {Array} connections - Service connections
 * @param {Array} boundaries - Boundary/grouping elements (optional)
 * @returns {Object} - Object with main.tf, variables.tf, outputs.tf content
 */
export const generateTerraform = (items, connections, boundaries = []) => {
  const timestamp = new Date().toISOString();
  
  // Extract organizational structure from boundaries
  const orgStructure = analyzeBoundaries(boundaries, items);
  
  console.log(`🏗️ Generating enterprise Terraform with ${items.length} services, ${connections.length} connections, ${boundaries.length} boundaries`);
  
  return {
    main: generateMainTF(items, connections, orgStructure, timestamp),
    variables: generateVariablesTF(items, timestamp),
    outputs: generateOutputsTF(items, timestamp),
    tfvars: generateTFVars(items, timestamp),
    readme: generateReadme(items, connections, boundaries, timestamp)
  };
};

/**
 * Generate main.tf with provider, resources, and dependencies
 */
const generateMainTF = (items, connections, orgStructure, timestamp) => {
  const lines = [];
  
  // Header with enterprise branding
  lines.push(`##############################################################################`);
  lines.push(`# Arunim's IT Caffe — Cloud Canvas Designer`);
  lines.push(`# Version: v2.5.0 | Author: Arunim Pandey | ${timestamp}`);
  lines.push(`# Compliance: Enterprise Microsoft Azure Best Practices`);
  lines.push(`# Architecture: ${orgStructure.resourceGroups.length} Resource Groups, ${orgStructure.vnets.length} VNets`);
  lines.push(`# https://docs.microsoft.com/en-us/azure/architecture/framework/`);
  lines.push(`##############################################################################`);
  lines.push(``);
  
  // Terraform Block
  lines.push(`terraform {`);
  lines.push(`  required_version = ">= 1.0"`);
  lines.push(``);
  lines.push(`  required_providers {`);
  lines.push(`    azurerm = {`);
  lines.push(`      source  = "hashicorp/azurerm"`);
  lines.push(`      version = "~> 3.100"`);
  lines.push(`    }`);
  lines.push(`    random = {`);
  lines.push(`      source  = "hashicorp/random"`);
  lines.push(`      version = "~> 3.6"`);
  lines.push(`    }`);
  lines.push(`  }`);
  lines.push(``);
  lines.push(`  # IMPORTANT: Configure backend for state management`);
  lines.push(`  # Uncomment and configure for production use`);
  lines.push(`  # backend "azurerm" {`);
  lines.push(`  #   resource_group_name  = "tfstate-rg"`);
  lines.push(`  #   storage_account_name = "tfstate<unique>"`);
  lines.push(`  #   container_name       = "tfstate"`);
  lines.push(`  #   key                  = "terraform.tfstate"`);
  lines.push(`  # }`);
  lines.push(`}`);
  lines.push(``);
  
  // Provider Configuration
  lines.push(`##############################################################################`);
  lines.push(`# Provider Configuration`);
  lines.push(`##############################################################################`);
  lines.push(``);
  lines.push(`provider "azurerm" {`);
  lines.push(`  features {`);
  lines.push(`    key_vault {`);
  lines.push(`      purge_soft_delete_on_destroy    = true`);
  lines.push(`      recover_soft_deleted_key_vaults = true`);
  lines.push(`    }`);
  lines.push(`    resource_group {`);
  lines.push(`      prevent_deletion_if_contains_resources = false`);
  lines.push(`    }`);
  lines.push(`  }`);
  lines.push(`}`);
  lines.push(``);
  
  // Data Sources
  lines.push(`##############################################################################`);
  lines.push(`# Data Sources`);
  lines.push(`##############################################################################`);
  lines.push(``);
  lines.push(`data "azurerm_client_config" "current" {}`);
  lines.push(``);
  lines.push(`resource "random_string" "suffix" {`);
  lines.push(`  length  = 6`);
  lines.push(`  special = false`);
  lines.push(`  upper   = false`);
  lines.push(`}`);
  lines.push(``);
  
  // Resource Group
  lines.push(`##############################################################################`);
  lines.push(`# Resource Group`);
  lines.push(`##############################################################################`);
  lines.push(``);
  lines.push(`resource "azurerm_resource_group" "main" {`);
  lines.push(`  name     = "\${var.resource_prefix}-\${var.environment}-rg"`);
  lines.push(`  location = var.location`);
  lines.push(``);
  lines.push(`  tags = merge(`);
  lines.push(`    var.tags,`);
  lines.push(`    {`);
  lines.push(`      "Environment" = var.environment`);
  lines.push(`      "ManagedBy"   = "Terraform"`);
  lines.push(`    }`);
  lines.push(`  )`);
  lines.push(`}`);
  lines.push(``);
  
  // Core Networking (if VNet exists)
  const hasVnet = items.some(item => ['vnet', 'virtualnetwork'].includes(item.serviceType.toLowerCase()));
  if (hasVnet) {
    lines.push(...generateVNetConfig());
  }
  
  // Generate resources by category
  const resourceGroups = categorizeResources(items);
  
  // Networking Resources
  if (resourceGroups.networking.length > 0) {
    lines.push(`##############################################################################`);
    lines.push(`# Networking Resources`);
    lines.push(`##############################################################################`);
    lines.push(``);
    resourceGroups.networking.forEach((item, index) => {
      lines.push(...generateEnterpriseResource(item, index, items, connections));
      lines.push(``);
    });
  }
  
  // Compute Resources
  if (resourceGroups.compute.length > 0) {
    lines.push(`##############################################################################`);
    lines.push(`# Compute Resources`);
    lines.push(`##############################################################################`);
    lines.push(``);
    resourceGroups.compute.forEach((item, index) => {
      lines.push(...generateEnterpriseResource(item, index, items, connections));
      lines.push(``);
    });
  }
  
  // Storage Resources
  if (resourceGroups.storage.length > 0) {
    lines.push(`##############################################################################`);
    lines.push(`# Storage Resources`);
    lines.push(`##############################################################################`);
    lines.push(``);
    resourceGroups.storage.forEach((item, index) => {
      lines.push(...generateEnterpriseResource(item, index, items, connections));
      lines.push(``);
    });
  }
  
  // Database Resources
  if (resourceGroups.database.length > 0) {
    lines.push(`##############################################################################`);
    lines.push(`# Database Resources`);
    lines.push(`##############################################################################`);
    lines.push(``);
    resourceGroups.database.forEach((item, index) => {
      lines.push(...generateEnterpriseResource(item, index, items, connections));
      lines.push(``);
    });
  }
  
  // App Services
  if (resourceGroups.appservices.length > 0) {
    lines.push(`##############################################################################`);
    lines.push(`# App Services`);
    lines.push(`##############################################################################`);
    lines.push(``);
    resourceGroups.appservices.forEach((item, index) => {
      lines.push(...generateEnterpriseResource(item, index, items, connections));
      lines.push(``);
    });
  }
  
  // Security Resources
  if (resourceGroups.security.length > 0) {
    lines.push(`##############################################################################`);
    lines.push(`# Security Resources`);
    lines.push(`##############################################################################`);
    lines.push(``);
    resourceGroups.security.forEach((item, index) => {
      lines.push(...generateEnterpriseResource(item, index, items, connections));
      lines.push(``);
    });
  }
  
  // Other Resources
  if (resourceGroups.other.length > 0) {
    lines.push(`##############################################################################`);
    lines.push(`# Additional Resources`);
    lines.push(`##############################################################################`);
    lines.push(``);
    resourceGroups.other.forEach((item, index) => {
      lines.push(...generateEnterpriseResource(item, index, items, connections));
      lines.push(``);
    });
  }
  
  return lines.join('\n');
};

/**
 * Categorize resources by type
 */
const categorizeResources = (items) => {
  const categories = {
    networking: [],
    compute: [],
    storage: [],
    database: [],
    appservices: [],
    security: [],
    other: []
  };
  
  items.forEach(item => {
    const type = item.serviceType.toLowerCase();
    
    if (['vnet', 'virtualnetwork', 'subnet', 'nsg', 'loadbalancer', 'applicationgateway', 'firewall'].includes(type)) {
      categories.networking.push(item);
    } else if (['vm', 'virtualmachine', 'vmss', 'aks', 'containerinstance'].includes(type)) {
      categories.compute.push(item);
    } else if (['storage', 'storageaccount', 'blob', 'filesfils', 'queue', 'table'].includes(type)) {
      categories.storage.push(item);
    } else if (['sqldb', 'sqldatabase', 'cosmosdb', 'postgresql', 'mysql', 'redis'].includes(type)) {
      categories.database.push(item);
    } else if (['appservice', 'functionapp', 'webapp', 'logicapp'].includes(type)) {
      categories.appservices.push(item);
    } else if (['keyvault', 'securitycenter', 'sentinel'].includes(type)) {
      categories.security.push(item);
    } else {
      categories.other.push(item);
    }
  });
  
  return categories;
};

/**
 * Generate VNet configuration
 */
const generateVNetConfig = () => {
  return [
    `##############################################################################`,
    `# Virtual Network`,
    `##############################################################################`,
    ``,
    `resource "azurerm_virtual_network" "main" {`,
    `  name                = "\${var.resource_prefix}-\${var.environment}-vnet"`,
    `  address_space       = var.vnet_address_space`,
    `  location            = azurerm_resource_group.main.location`,
    `  resource_group_name = azurerm_resource_group.main.name`,
    ``,
    `  tags = var.tags`,
    `}`,
    ``,
    `resource "azurerm_subnet" "default" {`,
    `  name                 = "default"`,
    `  resource_group_name  = azurerm_resource_group.main.name`,
    `  virtual_network_name = azurerm_virtual_network.main.name`,
    `  address_prefixes     = var.subnet_prefixes`,
    `}`,
    ``,
    `resource "azurerm_network_security_group" "default" {`,
    `  name                = "\${var.resource_prefix}-\${var.environment}-nsg"`,
    `  location            = azurerm_resource_group.main.location`,
    `  resource_group_name = azurerm_resource_group.main.name`,
    ``,
    `  tags = var.tags`,
    `}`,
    ``,
    `resource "azurerm_subnet_network_security_group_association" "default" {`,
    `  subnet_id                 = azurerm_subnet.default.id`,
    `  network_security_group_id = azurerm_network_security_group.default.id`,
    `}`,
    ``
  ];
};

/**
 * Generate enterprise resource configuration
 */
const generateEnterpriseResource = (item, index, allItems, connections) => {
  const resourceName = sanitizeResourceName(item.name);
  const uniqueName = `${resourceName}_${index}`;
  const type = item.serviceType.toLowerCase();
  
  const generators = {
    vm: generateVM,
    virtualmachine: generateVM,
    storage: generateStorage,
    storageaccount: generateStorage,
    sqldb: generateSQLDatabase,
    sqldatabase: generateSQLDatabase,
    cosmosdb: generateCosmosDB,
    appservice: generateAppService,
    webapp: generateAppService,
    functionapp: generateFunctionApp,
    keyvault: generateKeyVault,
    aks: generateAKS,
    redis: generateRedis,
    postgresql: generatePostgreSQL,
    mysql: generateMySQL,
    loadbalancer: generateLoadBalancer,
    applicationgateway: generateAppGateway,
    appinsights: generateAppInsights,
    loganalytics: generateLogAnalytics
  };
  
  const generator = generators[type];
  if (generator) {
    return generator(uniqueName, resourceName, item);
  }
  
  return [
    `# ${item.name} (${item.serviceType})`,
    `# Resource configuration not available - please configure manually`
  ];
};

/**
 * Resource generators
 */

const generateVM = (uniqueName, resourceName, item) => {
  return [
    `# Virtual Machine: ${item.name}`,
    `resource "azurerm_network_interface" "${uniqueName}_nic" {`,
    `  name                = "\${var.resource_prefix}-${resourceName}-nic"`,
    `  location            = azurerm_resource_group.main.location`,
    `  resource_group_name = azurerm_resource_group.main.name`,
    ``,
    `  ip_configuration {`,
    `    name                          = "internal"`,
    `    subnet_id                     = azurerm_subnet.default.id`,
    `    private_ip_address_allocation = "Dynamic"`,
    `  }`,
    ``,
    `  tags = var.tags`,
    `}`,
    ``,
    `resource "azurerm_linux_virtual_machine" "${uniqueName}" {`,
    `  name                = "\${var.resource_prefix}-${resourceName}-vm"`,
    `  resource_group_name = azurerm_resource_group.main.name`,
    `  location            = azurerm_resource_group.main.location`,
    `  size                = var.vm_size`,
    `  admin_username      = var.vm_admin_username`,
    ``,
    `  disable_password_authentication = true`,
    ``,
    `  network_interface_ids = [`,
    `    azurerm_network_interface.${uniqueName}_nic.id,`,
    `  ]`,
    ``,
    `  admin_ssh_key {`,
    `    username   = var.vm_admin_username`,
    `    public_key = var.vm_ssh_public_key`,
    `  }`,
    ``,
    `  os_disk {`,
    `    name                 = "\${var.resource_prefix}-${resourceName}-osdisk"`,
    `    caching              = "ReadWrite"`,
    `    storage_account_type = "Premium_LRS"`,
    `  }`,
    ``,
    `  source_image_reference {`,
    `    publisher = "Canonical"`,
    `    offer     = "0001-com-ubuntu-server-jammy"`,
    `    sku       = "22_04-lts-gen2"`,
    `    version   = "latest"`,
    `  }`,
    ``,
    `  boot_diagnostics {`,
    `    storage_account_uri = null`,
    `  }`,
    ``,
    `  tags = merge(`,
    `    var.tags,`,
    `    {`,
    `      "Component" = "Compute"`,
    `    }`,
    `  )`,
    `}`,
  ];
};

const generateStorage = (uniqueName, resourceName, item) => {
  return [
    `# Storage Account: ${item.name}`,
    `resource "azurerm_storage_account" "${uniqueName}" {`,
    `  name                     = "\${var.resource_prefix}\${random_string.suffix.result}${resourceName}sa"`,
    `  resource_group_name      = azurerm_resource_group.main.name`,
    `  location                 = azurerm_resource_group.main.location`,
    `  account_tier             = "Standard"`,
    `  account_replication_type = "LRS"`,    `  account_kind             = "StorageV2"`,
    ``,
    `  https_traffic_only_enabled = true`,
    `  min_tls_version            = "TLS1_2"`,
    ``,
    `  blob_properties {`,
    `    delete_retention_policy {`,
    `      days = 7`,
    `    }`,
    `  }`,
    ``,
    `  tags = merge(`,
    `    var.tags,`,
    `    {`,
    `      "Component" = "Storage"`,
    `    }`,
    `  )`,
    `}`,
    ``,
    `resource "azurerm_storage_container" "${uniqueName}_container" {`,
    `  name                  = "data"`,
    `  storage_account_name  = azurerm_storage_account.${uniqueName}.name`,
    `  container_access_type = "private"`,
    `}`,
  ];
};

const generateSQLDatabase = (uniqueName, resourceName, item) => {
  return [
    `# SQL Database: ${item.name}`,
    `resource "azurerm_mssql_server" "${uniqueName}_server" {`,
    `  name                         = "\${var.resource_prefix}-${resourceName}-sql\${random_string.suffix.result}"`,
    `  resource_group_name          = azurerm_resource_group.main.name`,
    `  location                     = azurerm_resource_group.main.location`,
    `  version                      = "12.0"`,
    `  administrator_login          = var.sql_admin_username`,
    `  administrator_login_password = var.sql_admin_password`,
    `  minimum_tls_version          = "1.2"`,
    ``,
    `  tags = var.tags`,
    `}`,
    ``,
    `resource "azurerm_mssql_database" "${uniqueName}" {`,
    `  name         = "${resourceName}-db"`,
    `  server_id    = azurerm_mssql_server.${uniqueName}_server.id`,
    `  collation    = "SQL_Latin1_General_CP1_CI_AS"`,
    `  license_type = "LicenseIncluded"`,
    `  max_size_gb  = 2`,
    `  sku_name     = "Basic"`,
    ``,
    `  tags = merge(`,
    `    var.tags,`,
    `    {`,
    `      "Component" = "Database"`,
    `    }`,
    `  )`,
    `}`,
    ``,
    `resource "azurerm_mssql_firewall_rule" "${uniqueName}_fw" {`,
    `  name             = "AllowAzureServices"`,
    `  server_id        = azurerm_mssql_server.${uniqueName}_server.id`,
    `  start_ip_address = "0.0.0.0"`,
    `  end_ip_address   = "0.0.0.0"`,
    `}`,
  ];
};

const generateCosmosDB = (uniqueName, resourceName, item) => {
  return [
    `# Cosmos DB: ${item.name}`,
    `resource "azurerm_cosmosdb_account" "${uniqueName}" {`,
    `  name                = "\${var.resource_prefix}-${resourceName}-cosmos\${random_string.suffix.result}"`,
    `  location            = azurerm_resource_group.main.location`,
    `  resource_group_name = azurerm_resource_group.main.name`,
    `  offer_type          = "Standard"`,
    `  kind                = "GlobalDocumentDB"`,
    ``,
    `  consistency_policy {`,
    `    consistency_level       = "Session"`,
    `    max_interval_in_seconds = 5`,
    `    max_staleness_prefix    = 100`,
    `  }`,
    ``,
    `  geo_location {`,
    `    location          = azurerm_resource_group.main.location`,
    `    failover_priority = 0`,
    `  }`,
    ``,
    `  tags = merge(`,
    `    var.tags,`,
    `    {`,
    `      "Component" = "Database"`,
    `    }`,
    `  )`,
    `}`,
  ];
};

const generateAppService = (uniqueName, resourceName, item) => {
  return [
    `# App Service: ${item.name}`,
    `resource "azurerm_service_plan" "${uniqueName}_plan" {`,
    `  name                = "\${var.resource_prefix}-${resourceName}-plan"`,
    `  resource_group_name = azurerm_resource_group.main.name`,
    `  location            = azurerm_resource_group.main.location`,
    `  os_type             = "Linux"`,
    `  sku_name            = "B1"`,
    ``,
    `  tags = var.tags`,
    `}`,
    ``,
    `resource "azurerm_linux_web_app" "${uniqueName}" {`,
    `  name                = "\${var.resource_prefix}-${resourceName}-app\${random_string.suffix.result}"`,
    `  resource_group_name = azurerm_resource_group.main.name`,
    `  location            = azurerm_resource_group.main.location`,
    `  service_plan_id     = azurerm_service_plan.${uniqueName}_plan.id`,
    ``,
    `  site_config {`,
    `    always_on = true`,
    `    `,
    `    application_stack {`,
    `      node_version = "18-lts"`,
    `    }`,
    `  }`,
    ``,
    `  https_only = true`,
    ``,
    `  tags = merge(`,
    `    var.tags,`,
    `    {`,
    `      "Component" = "AppService"`,
    `    }`,
    `  )`,
    `}`,
  ];
};

const generateFunctionApp = (uniqueName, resourceName, item) => {
  return [
    `# Function App: ${item.name}`,
    `resource "azurerm_storage_account" "${uniqueName}_storage" {`,
    `  name                     = "\${var.resource_prefix}\${random_string.suffix.result}${resourceName}fn"`,
    `  resource_group_name      = azurerm_resource_group.main.name`,
    `  location                 = azurerm_resource_group.main.location`,
    `  account_tier             = "Standard"`,
    `  account_replication_type = "LRS"`,
    ``,
    `  tags = var.tags`,
    `}`,
    ``,
    `resource "azurerm_service_plan" "${uniqueName}_plan" {`,
    `  name                = "\${var.resource_prefix}-${resourceName}-plan"`,
    `  resource_group_name = azurerm_resource_group.main.name`,
    `  location            = azurerm_resource_group.main.location`,
    `  os_type             = "Linux"`,
    `  sku_name            = "Y1"`,
    ``,
    `  tags = var.tags`,
    `}`,
    ``,
    `resource "azurerm_linux_function_app" "${uniqueName}" {`,
    `  name                       = "\${var.resource_prefix}-${resourceName}-func\${random_string.suffix.result}"`,
    `  resource_group_name        = azurerm_resource_group.main.name`,
    `  location                   = azurerm_resource_group.main.location`,
    `  service_plan_id            = azurerm_service_plan.${uniqueName}_plan.id`,
    `  storage_account_name       = azurerm_storage_account.${uniqueName}_storage.name`,
    `  storage_account_access_key = azurerm_storage_account.${uniqueName}_storage.primary_access_key`,
    ``,
    `  site_config {`,
    `    application_stack {`,
    `      node_version = "18"`,
    `    }`,
    `  }`,
    ``,
    `  tags = merge(`,
    `    var.tags,`,
    `    {`,
    `      "Component" = "Functions"`,
    `    }`,
    `  )`,
    `}`,
  ];
};

const generateKeyVault = (uniqueName, resourceName, item) => {
  return [
    `# Key Vault: ${item.name}`,
    `resource "azurerm_key_vault" "${uniqueName}" {`,
    `  name                       = "\${var.resource_prefix}-${resourceName}-kv\${random_string.suffix.result}"`,
    `  location                   = azurerm_resource_group.main.location`,
    `  resource_group_name        = azurerm_resource_group.main.name`,
    `  tenant_id                  = data.azurerm_client_config.current.tenant_id`,
    `  sku_name                   = "standard"`,
    `  soft_delete_retention_days = 7`,
    `  purge_protection_enabled   = false`,
    ``,
    `  access_policy {`,
    `    tenant_id = data.azurerm_client_config.current.tenant_id`,
    `    object_id = data.azurerm_client_config.current.object_id`,
    ``,
    `    key_permissions = [`,
    `      "Get", "List", "Create", "Delete", "Update"`,
    `    ]`,
    ``,
    `    secret_permissions = [`,
    `      "Get", "List", "Set", "Delete"`,
    `    ]`,
    ``,
    `    certificate_permissions = [`,
    `      "Get", "List", "Create", "Delete"`,
    `    ]`,
    `  }`,
    ``,
    `  tags = merge(`,
    `    var.tags,`,
    `    {`,
    `      "Component" = "Security"`,
    `    }`,
    `  )`,
    `}`,
  ];
};

const generateAKS = (uniqueName, resourceName, item) => {
  return [
    `# AKS Cluster: ${item.name}`,
    `resource "azurerm_kubernetes_cluster" "${uniqueName}" {`,
    `  name                = "\${var.resource_prefix}-${resourceName}-aks"`,
    `  location            = azurerm_resource_group.main.location`,
    `  resource_group_name = azurerm_resource_group.main.name`,
    `  dns_prefix          = "\${var.resource_prefix}-${resourceName}"`,
    ``,
    `  default_node_pool {`,
    `    name       = "default"`,
    `    node_count = 2`,
    `    vm_size    = "Standard_D2_v2"`,
    `    vnet_subnet_id = azurerm_subnet.default.id`,
    `  }`,
    ``,
    `  identity {`,
    `    type = "SystemAssigned"`,
    `  }`,
    ``,
    `  network_profile {`,
    `    network_plugin    = "azure"`,
    `    load_balancer_sku = "standard"`,
    `  }`,
    ``,
    `  tags = merge(`,
    `    var.tags,`,
    `    {`,
    `      "Component" = "Kubernetes"`,
    `    }`,
    `  )`,
    `}`,
  ];
};

const generateRedis = (uniqueName, resourceName, item) => {
  return [
    `# Redis Cache: ${item.name}`,
    `resource "azurerm_redis_cache" "${uniqueName}" {`,
    `  name                = "\${var.resource_prefix}-${resourceName}-redis\${random_string.suffix.result}"`,
    `  location            = azurerm_resource_group.main.location`,
    `  resource_group_name = azurerm_resource_group.main.name`,
    `  capacity            = 0`,
    `  family              = "C"`,    `  sku_name            = "Basic"`,
    `  non_ssl_port_enabled = false`,
    `  minimum_tls_version = "1.2"`,
    ``,
    `  redis_configuration {`,
    `  }`,
    ``,
    `  tags = merge(`,
    `    var.tags,`,
    `    {`,
    `      "Component" = "Cache"`,
    `    }`,
    `  )`,
    `}`,
  ];
};

const generatePostgreSQL = (uniqueName, resourceName, item) => {
  return [
    `# PostgreSQL: ${item.name}`,
    `resource "azurerm_postgresql_flexible_server" "${uniqueName}" {`,
    `  name                   = "\${var.resource_prefix}-${resourceName}-psql\${random_string.suffix.result}"`,
    `  resource_group_name    = azurerm_resource_group.main.name`,
    `  location               = azurerm_resource_group.main.location`,
    `  version                = "14"`,
    `  administrator_login    = var.db_admin_username`,
    `  administrator_password = var.db_admin_password`,
    `  storage_mb             = 32768`,
    `  sku_name               = "B_Standard_B1ms"`,
    ``,
    `  tags = merge(`,
    `    var.tags,`,
    `    {`,
    `      "Component" = "Database"`,
    `    }`,
    `  )`,
    `}`,
    ``,
    `resource "azurerm_postgresql_flexible_server_database" "${uniqueName}_db" {`,
    `  name      = "${resourceName}db"`,
    `  server_id = azurerm_postgresql_flexible_server.${uniqueName}.id`,
    `  charset   = "UTF8"`,
    `  collation = "en_US.utf8"`,
    `}`,
  ];
};

const generateMySQL = (uniqueName, resourceName, item) => {
  return [
    `# MySQL: ${item.name}`,
    `resource "azurerm_mysql_flexible_server" "${uniqueName}" {`,
    `  name                   = "\${var.resource_prefix}-${resourceName}-mysql\${random_string.suffix.result}"`,
    `  resource_group_name    = azurerm_resource_group.main.name`,
    `  location               = azurerm_resource_group.main.location`,
    `  administrator_login    = var.db_admin_username`,
    `  administrator_password = var.db_admin_password`,
    `  sku_name               = "B_Standard_B1s"`,
    ``,
    `  tags = merge(`,
    `    var.tags,`,
    `    {`,
    `      "Component" = "Database"`,
    `    }`,
    `  )`,
    `}`,
    ``,
    `resource "azurerm_mysql_flexible_database" "${uniqueName}_db" {`,
    `  name                = "${resourceName}db"`,
    `  resource_group_name = azurerm_resource_group.main.name`,
    `  server_name         = azurerm_mysql_flexible_server.${uniqueName}.name`,
    `  charset             = "utf8"`,
    `  collation           = "utf8_unicode_ci"`,
    `}`,
  ];
};

const generateLoadBalancer = (uniqueName, resourceName, item) => {
  return [
    `# Load Balancer: ${item.name}`,
    `resource "azurerm_public_ip" "${uniqueName}_pip" {`,
    `  name                = "\${var.resource_prefix}-${resourceName}-pip"`,
    `  location            = azurerm_resource_group.main.location`,
    `  resource_group_name = azurerm_resource_group.main.name`,
    `  allocation_method   = "Static"`,
    `  sku                 = "Standard"`,
    ``,
    `  tags = var.tags`,
    `}`,
    ``,
    `resource "azurerm_lb" "${uniqueName}" {`,
    `  name                = "\${var.resource_prefix}-${resourceName}-lb"`,
    `  location            = azurerm_resource_group.main.location`,
    `  resource_group_name = azurerm_resource_group.main.name`,
    `  sku                 = "Standard"`,
    ``,
    `  frontend_ip_configuration {`,
    `    name                 = "PublicIPAddress"`,
    `    public_ip_address_id = azurerm_public_ip.${uniqueName}_pip.id`,
    `  }`,
    ``,
    `  tags = merge(`,
    `    var.tags,`,
    `    {`,
    `      "Component" = "LoadBalancer"`,
    `    }`,
    `  )`,
    `}`,
  ];
};

const generateAppGateway = (uniqueName, resourceName, item) => {
  return [
    `# Application Gateway: ${item.name}`,
    `resource "azurerm_public_ip" "${uniqueName}_pip" {`,
    `  name                = "\${var.resource_prefix}-${resourceName}-agw-pip"`,
    `  location            = azurerm_resource_group.main.location`,
    `  resource_group_name = azurerm_resource_group.main.name`,
    `  allocation_method   = "Static"`,
    `  sku                 = "Standard"`,
    ``,
    `  tags = var.tags`,
    `}`,
    ``,
    `resource "azurerm_subnet" "${uniqueName}_subnet" {`,
    `  name                 = "ApplicationGatewaySubnet"`,
    `  resource_group_name  = azurerm_resource_group.main.name`,
    `  virtual_network_name = azurerm_virtual_network.main.name`,
    `  address_prefixes     = ["10.0.2.0/24"]`,
    `}`,
    ``,
    `# Note: Application Gateway configuration is complex and requires manual customization`,
    `# Please refer to: https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs/resources/application_gateway`,
  ];
};

const generateAppInsights = (uniqueName, resourceName, item) => {
  return [
    `# Application Insights: ${item.name}`,
    `resource "azurerm_application_insights" "${uniqueName}" {`,
    `  name                = "\${var.resource_prefix}-${resourceName}-ai"`,
    `  location            = azurerm_resource_group.main.location`,
    `  resource_group_name = azurerm_resource_group.main.name`,
    `  application_type    = "web"`,
    ``,
    `  tags = merge(`,
    `    var.tags,`,
    `    {`,
    `      "Component" = "Monitoring"`,
    `    }`,
    `  )`,
    `}`,
  ];
};

const generateLogAnalytics = (uniqueName, resourceName, item) => {
  return [
    `# Log Analytics Workspace: ${item.name}`,
    `resource "azurerm_log_analytics_workspace" "${uniqueName}" {`,
    `  name                = "\${var.resource_prefix}-${resourceName}-law"`,
    `  location            = azurerm_resource_group.main.location`,
    `  resource_group_name = azurerm_resource_group.main.name`,
    `  sku                 = "PerGB2018"`,
    `  retention_in_days   = 30`,
    ``,
    `  tags = merge(`,
    `    var.tags,`,
    `    {`,
    `      "Component" = "Monitoring"`,
    `    }`,
    `  )`,
    `}`,
  ];
};

/**
 * Generate variables.tf
 */
const generateVariablesTF = (items, timestamp) => {
  const lines = [];
  
  lines.push(`##############################################################################`);
  lines.push(`# Terraform Variables`);
  lines.push(`# Generated: ${timestamp}`);
  lines.push(`##############################################################################`);
  lines.push(``);
  
  lines.push(`variable "environment" {`);
  lines.push(`  description = "Environment name (dev, staging, prod)"`);
  lines.push(`  type        = string`);
  lines.push(`  default     = "dev"`);
  lines.push(`}`);
  lines.push(``);
  
  lines.push(`variable "location" {`);
  lines.push(`  description = "Azure region for all resources"`);
  lines.push(`  type        = string`);
  lines.push(`  default     = "eastus"`);
  lines.push(`}`);
  lines.push(``);
  
  lines.push(`variable "resource_prefix" {`);
  lines.push(`  description = "Prefix for all resource names"`);
  lines.push(`  type        = string`);
  lines.push(`  default     = "azarch"`);
  lines.push(`  validation {`);
  lines.push(`    condition     = length(var.resource_prefix) <= 10`);
  lines.push(`    error_message = "Resource prefix must be 10 characters or less."`);
  lines.push(`  }`);
  lines.push(`}`);
  lines.push(``);
  
  lines.push(`variable "tags" {`);
  lines.push(`  description = "Common tags for all resources"`);
  lines.push(`  type        = map(string)`);
  lines.push(`  default = {`);
  lines.push(`    "Project"   = "AzureArchitecture"`);
  lines.push(`    "ManagedBy" = "Terraform"`);
  lines.push(`  }`);
  lines.push(`}`);
  lines.push(``);
  
  // Add VNet variables if needed
  const hasVnet = items.some(item => ['vnet', 'virtualnetwork'].includes(item.serviceType.toLowerCase()));
  if (hasVnet) {
    lines.push(`variable "vnet_address_space" {`);
    lines.push(`  description = "Address space for the virtual network"`);
    lines.push(`  type        = list(string)`);
    lines.push(`  default     = ["10.0.0.0/16"]`);
    lines.push(`}`);
    lines.push(``);
    
    lines.push(`variable "subnet_prefixes" {`);
    lines.push(`  description = "Subnet address prefixes"`);
    lines.push(`  type        = list(string)`);
    lines.push(`  default     = ["10.0.1.0/24"]`);
    lines.push(`}`);
    lines.push(``);
  }
  
  // Add VM variables if needed
  const hasVM = items.some(item => ['vm', 'virtualmachine'].includes(item.serviceType.toLowerCase()));
  if (hasVM) {
    lines.push(`variable "vm_size" {`);
    lines.push(`  description = "Size of the virtual machine"`);
    lines.push(`  type        = string`);
    lines.push(`  default     = "Standard_B2s"`);
    lines.push(`}`);
    lines.push(``);
    
    lines.push(`variable "vm_admin_username" {`);
    lines.push(`  description = "Admin username for virtual machines"`);
    lines.push(`  type        = string`);
    lines.push(`  default     = "azureuser"`);
    lines.push(`}`);
    lines.push(``);
      lines.push(`variable "vm_ssh_public_key" {`);
    lines.push(`  description = "SSH public key content for VM authentication"`);
    lines.push(`  type        = string`);
    lines.push(`  sensitive   = true`);
    lines.push(`}`);
    lines.push(``);
  }
  
  // Add database variables if needed
  const hasDB = items.some(item => ['sqldb', 'sqldatabase', 'postgresql', 'mysql'].includes(item.serviceType.toLowerCase()));
  if (hasDB) {
    lines.push(`variable "sql_admin_username" {`);
    lines.push(`  description = "Administrator username for SQL Server"`);
    lines.push(`  type        = string`);
    lines.push(`  default     = "sqladmin"`);
    lines.push(`  sensitive   = true`);
    lines.push(`}`);
    lines.push(``);
    
    lines.push(`variable "sql_admin_password" {`);
    lines.push(`  description = "Administrator password for SQL Server"`);
    lines.push(`  type        = string`);
    lines.push(`  sensitive   = true`);
    lines.push(`}`);
    lines.push(``);
    
    lines.push(`variable "db_admin_username" {`);
    lines.push(`  description = "Administrator username for database servers"`);
    lines.push(`  type        = string`);
    lines.push(`  default     = "dbadmin"`);
    lines.push(`  sensitive   = true`);
    lines.push(`}`);
    lines.push(``);
    
    lines.push(`variable "db_admin_password" {`);
    lines.push(`  description = "Administrator password for database servers"`);
    lines.push(`  type        = string`);
    lines.push(`  sensitive   = true`);
    lines.push(`}`);
    lines.push(``);
  }
  
  return lines.join('\n');
};

/**
 * Generate outputs.tf
 */
const generateOutputsTF = (items, timestamp) => {
  const lines = [];
  
  lines.push(`##############################################################################`);
  lines.push(`# Terraform Outputs`);
  lines.push(`# Generated: ${timestamp}`);
  lines.push(`##############################################################################`);
  lines.push(``);
  
  lines.push(`output "resource_group_name" {`);
  lines.push(`  description = "Name of the resource group"`);
  lines.push(`  value       = azurerm_resource_group.main.name`);
  lines.push(`}`);
  lines.push(``);
  
  lines.push(`output "location" {`);
  lines.push(`  description = "Azure region"`);
  lines.push(`  value       = azurerm_resource_group.main.location`);
  lines.push(`}`);
  lines.push(``);
  
  // Add resource-specific outputs
  items.forEach((item, index) => {
    const uniqueName = `${sanitizeResourceName(item.name)}_${index}`;
    const type = item.serviceType.toLowerCase();
    
    if (type === 'vm' || type === 'virtualmachine') {
      lines.push(`output "${uniqueName}_private_ip" {`);
      lines.push(`  description = "Private IP address of ${item.name}"`);
      lines.push(`  value       = azurerm_linux_virtual_machine.${uniqueName}.private_ip_address`);
      lines.push(`}`);
      lines.push(``);
    } else if (type === 'storage' || type === 'storageaccount') {
      lines.push(`output "${uniqueName}_name" {`);
      lines.push(`  description = "Name of ${item.name}"`);
      lines.push(`  value       = azurerm_storage_account.${uniqueName}.name`);
      lines.push(`}`);
      lines.push(``);
      
      lines.push(`output "${uniqueName}_primary_endpoint" {`);
      lines.push(`  description = "Primary blob endpoint of ${item.name}"`);
      lines.push(`  value       = azurerm_storage_account.${uniqueName}.primary_blob_endpoint`);
      lines.push(`}`);
      lines.push(``);
    } else if (type === 'appservice' || type === 'webapp') {
      lines.push(`output "${uniqueName}_url" {`);
      lines.push(`  description = "URL of ${item.name}"`);
      lines.push(`  value       = "https://\${azurerm_linux_web_app.${uniqueName}.default_hostname}"`);
      lines.push(`}`);
      lines.push(``);
    }
  });
  
  return lines.join('\n');
};

/**
 * Generate terraform.tfvars
 */
const generateTFVars = (items, timestamp) => {
  const lines = [];
  
  lines.push(`##############################################################################`);
  lines.push(`# Terraform Variable Values`);
  lines.push(`# Generated: ${timestamp}`);
  lines.push(`#`);
  lines.push(`# IMPORTANT: Update these values before deployment`);
  lines.push(`##############################################################################`);
  lines.push(``);
  
  lines.push(`environment     = "dev"`);
  lines.push(`location        = "eastus"`);
  lines.push(`resource_prefix = "azarch"`);
  lines.push(``);
  
  lines.push(`tags = {`);
  lines.push(`  "Project"     = "AzureArchitecture"`);
  lines.push(`  "ManagedBy"   = "Terraform"`);
  lines.push(`  "Environment" = "Development"`);
  lines.push(`  "Owner"       = "YourName"`);
  lines.push(`}`);
  lines.push(``);
  
  // Add VM variables if needed
  const hasVM = items.some(item => ['vm', 'virtualmachine'].includes(item.serviceType.toLowerCase()));
  if (hasVM) {    lines.push(`# VM Configuration`);
    lines.push(`vm_size           = "Standard_B2s"`);
    lines.push(`vm_admin_username = "azureuser"`);
    lines.push(`# vm_ssh_public_key = "ssh-rsa AAAAB3... your-ssh-key"  # Required — set via TF_VAR_vm_ssh_public_key`);
    lines.push(``);
  }
  
  // Add database variables if needed
  const hasDB = items.some(item => ['sqldb', 'sqldatabase', 'postgresql', 'mysql'].includes(item.serviceType.toLowerCase()));
  if (hasDB) {
    lines.push(`# Database Configuration`);
    lines.push(`# IMPORTANT: Set these in environment variables or use Azure Key Vault`);
    lines.push(`# sql_admin_username = "sqladmin"`);
    lines.push(`# sql_admin_password = "YourSecurePassword123!"  # Use environment variable: TF_VAR_sql_admin_password`);
    lines.push(`# db_admin_username  = "dbadmin"`);
    lines.push(`# db_admin_password  = "YourSecurePassword123!"  # Use environment variable: TF_VAR_db_admin_password`);
    lines.push(``);
  }
  
  return lines.join('\n');
};

/**
 * Generate README.md
 */
const generateReadme = (items, connections, boundaries, timestamp) => {
  const lines = [];
  
  lines.push(`# Azure Infrastructure - Terraform Configuration`);
  lines.push(``);
  lines.push(`Generated by Cloud Canvas Designer on ${new Date(timestamp).toLocaleString()}`);
  lines.push(``);
  lines.push(`## Overview`);
  lines.push(``);
  lines.push(`This Terraform configuration deploys the following Azure resources:`);
  lines.push(``);
  
  const categories = categorizeResources(items);
  Object.entries(categories).forEach(([category, resources]) => {
    if (resources.length > 0) {
      lines.push(`### ${category.charAt(0).toUpperCase() + category.slice(1)}`);
      resources.forEach(item => {
        lines.push(`- ${item.name} (${item.serviceType})`);
      });
      lines.push(``);
    }
  });
  
  lines.push(`## Prerequisites`);
  lines.push(``);
  lines.push(`- [Terraform](https://www.terraform.io/downloads.html) >= 1.0`);
  lines.push(`- [Azure CLI](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli)`);
  lines.push(`- Azure subscription with appropriate permissions`);
  lines.push(`- SSH key pair (for VMs)`);
  lines.push(``);
  
  lines.push(`## Quick Start`);
  lines.push(``);
  lines.push(`### 1. Authenticate with Azure`);
  lines.push(``);
  lines.push(`\`\`\`bash`);
  lines.push(`az login`);
  lines.push(`az account set --subscription "<your-subscription-id>"`);
  lines.push(`\`\`\``);
  lines.push(``);
  
  lines.push(`### 2. Update Configuration`);
  lines.push(``);
  lines.push(`Edit \`terraform.tfvars\` and update the values:`);
  lines.push(``);
  lines.push(`\`\`\`hcl`);
  lines.push(`environment     = "dev"`);
  lines.push(`location        = "eastus"`);
  lines.push(`resource_prefix = "azarch"`);
  lines.push(`\`\`\``);
  lines.push(``);
  
  const hasDB = items.some(item => ['sqldb', 'sqldatabase', 'postgresql', 'mysql'].includes(item.serviceType.toLowerCase()));
  if (hasDB) {
    lines.push(`### 3. Set Sensitive Variables`);
    lines.push(``);
    lines.push(`**IMPORTANT:** Never commit sensitive values to version control.`);
    lines.push(``);
    lines.push(`Set database passwords as environment variables:`);
    lines.push(``);
    lines.push(`\`\`\`bash`);
    lines.push(`export TF_VAR_sql_admin_password="YourSecurePassword123!"`);
    lines.push(`export TF_VAR_db_admin_password="YourSecurePassword123!"`);
    lines.push(`\`\`\``);
    lines.push(``);
  }
  
  lines.push(`### 4. Initialize Terraform`);
  lines.push(``);
  lines.push(`\`\`\`bash`);
  lines.push(`terraform init`);
  lines.push(`\`\`\``);
  lines.push(``);
  
  lines.push(`### 5. Plan Deployment`);
  lines.push(``);
  lines.push(`\`\`\`bash`);
  lines.push(`terraform plan -out=tfplan`);
  lines.push(`\`\`\``);
  lines.push(``);
  
  lines.push(`### 6. Apply Configuration`);
  lines.push(``);
  lines.push(`\`\`\`bash`);
  lines.push(`terraform apply tfplan`);
  lines.push(`\`\`\``);
  lines.push(``);
  
  lines.push(`### 7. View Outputs`);
  lines.push(``);
  lines.push(`\`\`\`bash`);
  lines.push(`terraform output`);
  lines.push(`\`\`\``);
  lines.push(``);
  
  lines.push(`## Important Notes`);
  lines.push(``);
  lines.push(`### State Management`);
  lines.push(``);
  lines.push(`For production use, configure remote state storage in \`main.tf\`:`);
  lines.push(``);
  lines.push(`\`\`\`hcl`);
  lines.push(`terraform {`);
  lines.push(`  backend "azurerm" {`);
  lines.push(`    resource_group_name  = "tfstate-rg"`);
  lines.push(`    storage_account_name = "tfstate<unique>"`);
  lines.push(`    container_name       = "tfstate"`);
  lines.push(`    key                  = "terraform.tfstate"`);
  lines.push(`  }`);
  lines.push(`}`);
  lines.push(`\`\`\``);
  lines.push(``);
  
  lines.push(`### Security Best Practices`);
  lines.push(``);
  lines.push(`1. **Secrets Management**: Use Azure Key Vault for sensitive data`);
  lines.push(`2. **Network Security**: Configure NSG rules appropriately`);
  lines.push(`3. **RBAC**: Implement least privilege access`);
  lines.push(`4. **Monitoring**: Enable Azure Monitor and Application Insights`);
  lines.push(`5. **Backup**: Configure backup policies for critical resources`);
  lines.push(``);
  
  lines.push(`### Cost Optimization`);
  lines.push(``);
  lines.push(`1. Review VM sizes and adjust for your workload`);
  lines.push(`2. Use auto-shutdown for dev/test environments`);
  lines.push(`3. Implement Azure Policy for cost governance`);
  lines.push(`4. Set up budget alerts`);
  lines.push(``);
  
  lines.push(`## File Structure`);
  lines.push(``);
  lines.push(`\`\`\``);
  lines.push(`├── main.tf          # Main configuration`);
  lines.push(`├── variables.tf     # Variable definitions`);
  lines.push(`├── outputs.tf       # Output values`);
  lines.push(`├── terraform.tfvars # Variable values`);
  lines.push(`└── README.md        # This file`);
  lines.push(`\`\`\``);
  lines.push(``);
  
  lines.push(`## Cleanup`);
  lines.push(``);
  lines.push(`To destroy all resources:`);
  lines.push(``);
  lines.push(`\`\`\`bash`);
  lines.push(`terraform destroy`);
  lines.push(`\`\`\``);
  lines.push(``);
  
  lines.push(`## Support`);
  lines.push(``);
  lines.push(`For issues or questions:`);
  lines.push(``);
  lines.push(`- [Terraform Azure Provider Documentation](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs)`);
  lines.push(`- [Azure Documentation](https://docs.microsoft.com/en-us/azure/)`);
  lines.push(`- [Azure Well-Architected Framework](https://docs.microsoft.com/en-us/azure/architecture/framework/)`);
  lines.push(``);
  
  return lines.join('\n');
};

/**
 * Utility function to sanitize resource names
 */
const sanitizeResourceName = (name) => {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .substring(0, 20);
};

/**
 * Download all Terraform files
 */
export const downloadTerraform = (items, connections) => {
  const config = generateTerraform(items, connections);
  
  // Download each file
  downloadFile(config.main, 'main.tf');
  downloadFile(config.variables, 'variables.tf');
  downloadFile(config.outputs, 'outputs.tf');
  downloadFile(config.tfvars, 'terraform.tfvars');
  downloadFile(config.readme, 'README.md');
};

/**
 * Helper to download a file
 */
const downloadFile = (content, filename) => {
  const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 100);
};
