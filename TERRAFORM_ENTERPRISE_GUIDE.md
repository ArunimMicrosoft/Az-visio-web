# Enterprise Terraform Generator Guide

## Overview
The Azure Architecture Designer now includes a production-ready, enterprise-grade Terraform code generator that creates deployable infrastructure as code following Azure Well-Architected Framework and Terraform best practices.

## Generated Files

### 1. main.tf (Primary Configuration)
Complete infrastructure definition with:
- Terraform and provider configuration
- Remote state backend (commented for setup)
- Resource group
- All Azure resources categorized by type
- Proper resource dependencies

### 2. variables.tf (Variable Definitions)
All input variables with:
- Descriptions and types
- Default values
- Validation rules
- Sensitive flags for passwords

### 3. outputs.tf (Output Values)
Export important resource information:
- Resource group details
- Resource endpoints
- Connection strings (marked sensitive)
- IP addresses

### 4. terraform.tfvars (Variable Values)
User-editable values:
- Environment configuration
- Resource naming
- Tags
- Service-specific settings

### 5. README.md (Documentation)
Complete deployment guide:
- Prerequisites
- Step-by-step instructions
- Security best practices
- Cost optimization tips
- Troubleshooting

## Supported Azure Services

### ✅ Compute (5 services)
- **Virtual Machines**: Linux VMs with SSH authentication, NICs, OS disks
- **AKS**: Kubernetes clusters with system-assigned identity, CNI networking
- **Container Instances**: Lightweight container deployments
- **VM Scale Sets**: Auto-scaling compute resources
- **Batch**: Large-scale parallel computing

### ✅ Storage (4 services)
- **Storage Accounts**: StorageV2 with TLS 1.2, blob containers, retention
- **Blob Storage**: Private containers, lifecycle management
- **File Storage**: Azure Files shares
- **Queue Storage**: Message queuing

### ✅ Databases (6 services)
- **SQL Database**: SQL Server + Database, firewall rules, TLS 1.2
- **Cosmos DB**: Global distribution, Session consistency
- **PostgreSQL**: Flexible Server with firewall, databases
- **MySQL**: Flexible Server with connection security
- **Redis Cache**: In-memory cache, non-SSL disabled
- **SQL Managed Instance**: Fully managed SQL Server

### ✅ Networking (7 services)
- **Virtual Network**: VNet with subnets, address spaces
- **Subnet**: Multiple subnets with delegation
- **Network Security Group**: Security rules, subnet association
- **Load Balancer**: Public IP, frontend config, backend pools
- **Application Gateway**: WAF, routing rules, health probes
- **VPN Gateway**: Site-to-site connectivity
- **ExpressRoute**: Private network connectivity

### ✅ App Services (3 services)
- **App Service**: Linux web apps with Node.js stack
- **Function Apps**: Serverless compute, consumption plan
- **Logic Apps**: Workflow automation

### ✅ Security (3 services)
- **Key Vault**: Secret/key/certificate management, RBAC
- **Azure Security Center**: Threat protection
- **Azure Sentinel**: SIEM and SOAR

### ✅ Monitoring (3 services)
- **Application Insights**: APM and telemetry
- **Log Analytics Workspace**: Log aggregation, retention
- **Azure Monitor**: Metrics and alerting

## Enterprise Features

### 🔐 Security Best Practices

#### 1. Sensitive Data Handling
```hcl
variable "sql_admin_password" {
  description = "Administrator password for SQL Server"
  type        = string
  sensitive   = true  # Never logged or displayed
}
```

#### 2. TLS Enforcement
```hcl
resource "azurerm_storage_account" "example" {
  enable_https_traffic_only = true
  min_tls_version           = "TLS1_2"
}
```

#### 3. Key Vault Integration
```hcl
resource "azurerm_key_vault" "example" {
  soft_delete_retention_days = 7
  purge_protection_enabled   = false  # Enable in production
  
  access_policy {
    tenant_id = data.azurerm_client_config.current.tenant_id
    object_id = data.azurerm_client_config.current.object_id
    # Least privilege permissions
  }
}
```

### 🏗️ Resource Organization

#### Categorization
Resources grouped by function:
1. **Networking** - VNet, Subnet, NSG first
2. **Compute** - VMs, AKS, containers
3. **Storage** - Storage accounts, blobs
4. **Database** - SQL, Cosmos, PostgreSQL
5. **App Services** - Web apps, functions
6. **Security** - Key Vault, security center
7. **Other** - Remaining services

#### Naming Convention
```hcl
resource "azurerm_linux_virtual_machine" "vm_0" {
  name = "${var.resource_prefix}-${resourceName}-vm"
  # Example: azarch-webserver-vm
}
```

### 📊 State Management

#### Remote Backend (Production)
```hcl
terraform {
  backend "azurerm" {
    resource_group_name  = "tfstate-rg"
    storage_account_name = "tfstate<unique>"
    container_name       = "tfstate"
    key                  = "terraform.tfstate"
  }
}
```

#### Local Backend (Development)
```hcl
# Default: terraform.tfstate in current directory
# Use for testing and development only
```

### 🏷️ Tagging Strategy

#### Common Tags
```hcl
variable "tags" {
  description = "Common tags for all resources"
  type        = map(string)
  default = {
    "Project"     = "AzureArchitecture"
    "ManagedBy"   = "Terraform"
    "Environment" = "Development"
    "Owner"       = "YourName"
  }
}
```

#### Resource-Specific Tags
```hcl
tags = merge(
  var.tags,
  {
    "Component" = "Compute"
    "Tier"      = "Web"
  }
)
```

## Deployment Workflow

### 1. Initial Setup

```bash
# Clone or download generated files
cd terraform-config

# Review main.tf
code main.tf

# Update variable values
code terraform.tfvars
```

### 2. Configure Backend

```bash
# Create resource group for state
az group create --name tfstate-rg --location eastus

# Create storage account
az storage account create \
  --name tfstate$(uuidgen | cut -c1-8) \
  --resource-group tfstate-rg \
  --location eastus \
  --sku Standard_LRS

# Create container
az storage container create \
  --name tfstate \
  --account-name tfstate<unique>

# Uncomment backend block in main.tf
```

### 3. Set Sensitive Variables

```bash
# Environment variables (recommended)
export TF_VAR_sql_admin_password="YourSecurePassword123!"
export TF_VAR_db_admin_password="YourSecurePassword123!"

# Or use .tfvars file (DO NOT commit)
echo 'sql_admin_password = "YourSecurePassword123!"' > secrets.tfvars
```

### 4. Initialize Terraform

```bash
terraform init

# Output:
# Initializing the backend...
# Initializing provider plugins...
# Terraform has been successfully initialized!
```

### 5. Plan Deployment

```bash
terraform plan -out=tfplan

# Review:
# - Resources to be created
# - Estimated costs
# - Configuration correctness
```

### 6. Apply Configuration

```bash
terraform apply tfplan

# Confirm: yes

# Monitor deployment progress
# Terraform will show resource creation status
```

### 7. Verify Deployment

```bash
# View outputs
terraform output

# Check Azure portal
az resource list --resource-group azarch-dev-rg --output table

# Test connectivity
az vm run-command invoke \
  --resource-group azarch-dev-rg \
  --name azarch-webserver-vm \
  --command-id RunShellScript \
  --scripts "echo 'VM is running'"
```

## Configuration Examples

### Virtual Machine with Full Setup

```hcl
# Network Interface
resource "azurerm_network_interface" "vm_0_nic" {
  name                = "${var.resource_prefix}-webserver-nic"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name

  ip_configuration {
    name                          = "internal"
    subnet_id                     = azurerm_subnet.default.id
    private_ip_address_allocation = "Dynamic"
  }

  tags = var.tags
}

# Linux VM
resource "azurerm_linux_virtual_machine" "vm_0" {
  name                = "${var.resource_prefix}-webserver-vm"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  size                = var.vm_size
  admin_username      = var.vm_admin_username

  disable_password_authentication = true

  network_interface_ids = [
    azurerm_network_interface.vm_0_nic.id,
  ]

  admin_ssh_key {
    username   = var.vm_admin_username
    public_key = var.vm_ssh_public_key
  }

  os_disk {
    name                 = "${var.resource_prefix}-webserver-osdisk"
    caching              = "ReadWrite"
    storage_account_type = "Premium_LRS"
  }

  source_image_reference {
    publisher = "Canonical"
    offer     = "0001-com-ubuntu-server-jammy"
    sku       = "22_04-lts-gen2"
    version   = "latest"
  }

  boot_diagnostics {
    storage_account_uri = null  # Uses managed storage
  }

  tags = merge(
    var.tags,
    {
      "Component" = "Compute"
    }
  )
}
```

### SQL Database with Security

```hcl
# SQL Server
resource "azurerm_mssql_server" "sqldb_0_server" {
  name                         = "${var.resource_prefix}-database-sql${random_string.suffix.result}"
  resource_group_name          = azurerm_resource_group.main.name
  location                     = azurerm_resource_group.main.location
  version                      = "12.0"
  administrator_login          = var.sql_admin_username
  administrator_login_password = var.sql_admin_password
  minimum_tls_version          = "1.2"

  tags = var.tags
}

# Database
resource "azurerm_mssql_database" "sqldb_0" {
  name         = "database-db"
  server_id    = azurerm_mssql_server.sqldb_0_server.id
  collation    = "SQL_Latin1_General_CP1_CI_AS"
  license_type = "LicenseIncluded"
  max_size_gb  = 2
  sku_name     = "Basic"

  tags = merge(
    var.tags,
    {
      "Component" = "Database"
    }
  )
}

# Firewall Rule
resource "azurerm_mssql_firewall_rule" "sqldb_0_fw" {
  name             = "AllowAzureServices"
  server_id        = azurerm_mssql_server.sqldb_0_server.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}
```

### Storage Account with Compliance

```hcl
resource "azurerm_storage_account" "storage_0" {
  name                     = "${var.resource_prefix}${random_string.suffix.result}datasa"
  resource_group_name      = azurerm_resource_group.main.name
  location                 = azurerm_resource_group.main.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  account_kind             = "StorageV2"

  enable_https_traffic_only = true
  min_tls_version           = "TLS1_2"

  blob_properties {
    delete_retention_policy {
      days = 7
    }
  }

  tags = merge(
    var.tags,
    {
      "Component" = "Storage"
    }
  )
}

resource "azurerm_storage_container" "storage_0_container" {
  name                  = "data"
  storage_account_name  = azurerm_storage_account.storage_0.name
  container_access_type = "private"
}
```

## Best Practices

### ✅ Version Control
- Use `.gitignore` for sensitive files:
  ```
  *.tfstate
  *.tfstate.backup
  .terraform/
  secrets.tfvars
  *.tfvars  # Optional
  ```

### ✅ Code Review
- Review generated code before deployment
- Customize resource sizes for your workload
- Adjust security rules as needed
- Update naming conventions

### ✅ Testing
1. Test in dev environment first
2. Use `terraform plan` extensively
3. Validate with `terraform validate`
4. Format code with `terraform fmt`

### ✅ Documentation
- Update README with custom notes
- Document any manual changes
- Keep architecture diagrams in sync

### ✅ Cost Management
- Review estimated costs before apply
- Use appropriate SKUs (Basic, Standard, Premium)
- Implement auto-shutdown for dev/test
- Set up budget alerts

### ✅ Security
- Use Azure Key Vault for secrets
- Enable Azure Security Center
- Implement RBAC
- Enable audit logging
- Use private endpoints where possible

## Troubleshooting

### Error: "Backend initialization required"
```bash
terraform init -upgrade
```

### Error: "Resource name already exists"
```bash
# Change resource_prefix in terraform.tfvars
resource_prefix = "azarch2"
```

### Error: "Insufficient permissions"
```bash
# Verify Azure RBAC
az role assignment list --assignee $(az account show --query user.name -o tsv)

# Required role: Contributor or Owner
```

### Error: "Invalid password complexity"
```bash
# SQL passwords must be:
# - 8-128 characters
# - Include 3 of: uppercase, lowercase, numbers, symbols
export TF_VAR_sql_admin_password="SecureP@ssw0rd123!"
```

## Advanced Features

### Conditional Resources
```hcl
resource "azurerm_public_ip" "example" {
  count = var.enable_public_ip ? 1 : 0
  # ...
}
```

### For_each Loops
```hcl
resource "azurerm_subnet" "subnets" {
  for_each = var.subnets
  
  name                 = each.key
  address_prefixes     = [each.value]
  # ...
}
```

### Data Sources
```hcl
data "azurerm_client_config" "current" {}

data "azurerm_subscription" "current" {}
```

### Modules (Future)
```hcl
module "networking" {
  source = "./modules/networking"
  
  resource_group_name = azurerm_resource_group.main.name
  location            = var.location
}
```

## Migration from Manual Resources

### 1. Import Existing Resources
```bash
terraform import azurerm_resource_group.main /subscriptions/<id>/resourceGroups/my-rg
```

### 2. Generate Configuration
```bash
terraform show -no-color > imported.tf
```

### 3. Refactor and Apply
```bash
terraform plan
terraform apply
```

## CI/CD Integration

### GitHub Actions
```yaml
name: Terraform Deploy
on:
  push:
    branches: [main]
    paths: ['terraform/**']

jobs:
  terraform:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v2
        
      - name: Terraform Init
        run: terraform init
        
      - name: Terraform Plan
        run: terraform plan
        
      - name: Terraform Apply
        if: github.ref == 'refs/heads/main'
        run: terraform apply -auto-approve
```

### Azure DevOps
```yaml
trigger:
  branches:
    include:
      - main
  paths:
    include:
      - terraform/*

pool:
  vmImage: 'ubuntu-latest'

steps:
- task: TerraformInstaller@0
  inputs:
    terraformVersion: 'latest'

- task: TerraformTaskV2@2
  inputs:
    provider: 'azurerm'
    command: 'init'
    workingDirectory: '$(System.DefaultWorkingDirectory)/terraform'

- task: TerraformTaskV2@2
  inputs:
    provider: 'azurerm'
    command: 'plan'
    workingDirectory: '$(System.DefaultWorkingDirectory)/terraform'

- task: TerraformTaskV2@2
  inputs:
    provider: 'azurerm'
    command: 'apply'
    workingDirectory: '$(System.DefaultWorkingDirectory)/terraform'
```

## References

- [Terraform Azure Provider](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs)
- [Azure Well-Architected Framework](https://docs.microsoft.com/en-us/azure/architecture/framework/)
- [Terraform Best Practices](https://www.terraform-best-practices.com/)
- [Azure Naming Conventions](https://docs.microsoft.com/en-us/azure/cloud-adoption-framework/ready/azure-best-practices/naming-and-tagging)
- [Terraform State Management](https://www.terraform.io/docs/language/state/index.html)

---

**Last Updated**: February 13, 2026  
**Generator Version**: 2.0.0  
**Terraform Version**: >= 1.0  
**Azure Provider Version**: ~> 3.100
