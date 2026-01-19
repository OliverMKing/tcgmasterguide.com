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
  value       = length(azurerm_key_vault_secret.sql_connection_string) > 0 ? azurerm_key_vault_secret.sql_connection_string[0].name : null
}

output "custom_domain_validation_token" {
  description = "TXT record value for custom domain validation. Add this as a TXT record for your apex domain."
  value       = var.custom_domain != "" ? azurerm_static_web_app_custom_domain.apex[0].validation_token : null
  sensitive   = true # this isn't actually sensitive, you need domain ownership to use this value
}

output "static_web_app_alias_target" {
  description = "The Azure Static Web Apps hostname to use as the ALIAS record target for the apex domain"
  value       = azurerm_static_web_app.main.default_host_name
}

output "application_insights_name" {
  description = "Name of the Application Insights instance"
  value       = azurerm_application_insights.main.name
}

output "github_actions_sql_credentials" {
  description = "Azure credentials JSON for GitHub Actions to manage SQL firewall rules. Add this as AZURE_CREDENTIALS secret in GitHub."
  sensitive   = true
  value = jsonencode({
    clientId       = azuread_application.github_actions_sql.client_id
    clientSecret   = azuread_service_principal_password.github_actions_sql.value
    subscriptionId = data.azurerm_client_config.current.subscription_id
    tenantId       = data.azurerm_client_config.current.tenant_id
  })
}
