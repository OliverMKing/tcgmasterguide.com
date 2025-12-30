output "resource_group_name" {
  description = "Name of the resource group"
  value       = azurerm_resource_group.main.name
}

output "static_web_app_name" {
  description = "Name of the Static Web App"
  value       = azurerm_static_web_app.main.name
}

output "static_web_app_default_host_name" {
  description = "Default hostname for the Static Web App"
  value       = azurerm_static_web_app.main.default_host_name
}

output "static_web_app_api_key" {
  description = "API key for deploying to the Static Web App"
  value       = azurerm_static_web_app.main.api_key
  sensitive   = true
}

output "sql_server_name" {
  description = "Name of the SQL Server"
  value       = azurerm_mssql_server.main.name
}

output "sql_server_fqdn" {
  description = "Fully qualified domain name of the SQL Server"
  value       = azurerm_mssql_server.main.fully_qualified_domain_name
}

output "sql_database_name" {
  description = "Name of the SQL Database"
  value       = azurerm_mssql_database.main.name
}

output "key_vault_name" {
  description = "Name of the Key Vault"
  value       = azurerm_key_vault.main.name
}

output "key_vault_uri" {
  description = "URI of the Key Vault"
  value       = azurerm_key_vault.main.vault_uri
}

output "sql_connection_string_secret_name" {
  description = "Name of the SQL connection string secret in Key Vault"
  value       = azurerm_key_vault_secret.sql_connection_string.name
}
