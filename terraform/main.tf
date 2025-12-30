terraform {
  required_version = ">= 1.5.0"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
    azuread = {
      source  = "hashicorp/azuread"
      version = "~> 2.0"
    }
  }

  backend "azurerm" {
    # Backend configuration will be provided via backend config file
    # or command line arguments during terraform init
  }
}

provider "azurerm" {
  features {
    key_vault {
      purge_soft_delete_on_destroy    = false
      recover_soft_deleted_key_vaults = true
    }

    resource_group {
      prevent_deletion_if_contains_resources = false
    }
  }
}

provider "azuread" {}

data "azurerm_client_config" "current" {}

# Resource Group
resource "azurerm_resource_group" "main" {
  name     = "${var.project_name}-${var.environment}-rg"
  location = var.location

  tags = var.tags
}

# Static Web App
resource "azurerm_static_web_app" "main" {
  name                = "${var.project_name}-${var.environment}-swa"
  resource_group_name = azurerm_resource_group.main.name
  location            = var.location
  sku_tier            = var.static_web_app_sku
  sku_size            = var.static_web_app_sku

  identity {
    type = "SystemAssigned"
  }

  tags = var.tags
}

# Note: OIDC authentication for GitHub Actions is configured in the workflow file
# and handled by Azure automatically when github_id_token is provided.
# No additional Terraform configuration is required for OIDC support.

# SQL Server
resource "azurerm_mssql_server" "main" {
  name                         = "${var.project_name}-${var.environment}-sql"
  resource_group_name          = azurerm_resource_group.main.name
  location                     = azurerm_resource_group.main.location
  version                      = "12.0"
  administrator_login          = var.sql_admin_username
  administrator_login_password = var.sql_admin_password

  minimum_tls_version = "1.2"

  azuread_administrator {
    login_username = var.sql_azuread_admin_login
    object_id      = data.azurerm_client_config.current.object_id
  }

  tags = var.tags
}

# SQL Database - Serverless
resource "azurerm_mssql_database" "main" {
  name                        = "${var.project_name}-${var.environment}-db"
  server_id                   = azurerm_mssql_server.main.id
  collation                   = "SQL_Latin1_General_CP1_CI_AS"
  max_size_gb                 = var.sql_max_size_gb
  sku_name                    = "GP_S_Gen5_1"  # Serverless, 1 vCore
  min_capacity                = 0.5
  auto_pause_delay_in_minutes = 60
  zone_redundant              = false

  tags = var.tags
}

# SQL Firewall Rule - Allow Azure Services
resource "azurerm_mssql_firewall_rule" "allow_azure_services" {
  name             = "AllowAzureServices"
  server_id        = azurerm_mssql_server.main.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}

# SQL Firewall Rule - Allow specific IPs if needed (optional)
resource "azurerm_mssql_firewall_rule" "allow_ips" {
  for_each = toset(var.allowed_ip_addresses)

  name             = "AllowIP-${each.key}"
  server_id        = azurerm_mssql_server.main.id
  start_ip_address = each.key
  end_ip_address   = each.key
}

# Key Vault
resource "azurerm_key_vault" "main" {
  name                        = "${var.project_name}-${var.environment}-kv"
  location                    = azurerm_resource_group.main.location
  resource_group_name         = azurerm_resource_group.main.name
  enabled_for_disk_encryption = true
  tenant_id                   = data.azurerm_client_config.current.tenant_id
  soft_delete_retention_days  = 7
  purge_protection_enabled    = false
  sku_name                    = "standard"

  access_policy {
    tenant_id = data.azurerm_client_config.current.tenant_id
    object_id = data.azurerm_client_config.current.object_id

    key_permissions = [
      "Get", "List", "Create", "Delete", "Update"
    ]

    secret_permissions = [
      "Get", "List", "Set", "Delete", "Recover", "Backup", "Restore"
    ]

    certificate_permissions = [
      "Get", "List", "Create", "Delete", "Update"
    ]
  }

  # Access policy for Static Web App (using system-assigned managed identity)
  access_policy {
    tenant_id = data.azurerm_client_config.current.tenant_id
    object_id = azurerm_static_web_app.main.identity[0].principal_id

    secret_permissions = [
      "Get", "List"
    ]
  }

  tags = var.tags

  depends_on = [azurerm_static_web_app.main]
}

# Store SQL Connection String in Key Vault
resource "azurerm_key_vault_secret" "sql_connection_string" {
  name         = "sql-connection-string"
  value        = "Server=tcp:${azurerm_mssql_server.main.fully_qualified_domain_name},1433;Initial Catalog=${azurerm_mssql_database.main.name};Persist Security Info=False;User ID=${var.sql_admin_username};Password=${var.sql_admin_password};MultipleActiveResultSets=False;Encrypt=True;TrustServerCertificate=False;Connection Timeout=30;"
  key_vault_id = azurerm_key_vault.main.id

  depends_on = [azurerm_key_vault.main]
}

# Store Clerk API Keys in Key Vault (must be set manually or via CI/CD)
resource "azurerm_key_vault_secret" "clerk_secret_key" {
  name         = "clerk-secret-key"
  value        = var.clerk_secret_key != "" ? var.clerk_secret_key : "PLACEHOLDER-SET-VIA-PORTAL-OR-CLI"
  key_vault_id = azurerm_key_vault.main.id

  lifecycle {
    ignore_changes = [value]
  }

  depends_on = [azurerm_key_vault.main]
}

# Store Stripe API Keys in Key Vault (must be set manually or via CI/CD)
resource "azurerm_key_vault_secret" "stripe_secret_key" {
  name         = "stripe-secret-key"
  value        = var.stripe_secret_key != "" ? var.stripe_secret_key : "PLACEHOLDER-SET-VIA-PORTAL-OR-CLI"
  key_vault_id = azurerm_key_vault.main.id

  lifecycle {
    ignore_changes = [value]
  }

  depends_on = [azurerm_key_vault.main]
}

resource "azurerm_key_vault_secret" "stripe_webhook_secret" {
  name         = "stripe-webhook-secret"
  value        = var.stripe_webhook_secret != "" ? var.stripe_webhook_secret : "PLACEHOLDER-SET-VIA-PORTAL-OR-CLI"
  key_vault_id = azurerm_key_vault.main.id

  lifecycle {
    ignore_changes = [value]
  }

  depends_on = [azurerm_key_vault.main]
}
