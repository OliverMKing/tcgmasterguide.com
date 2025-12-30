project_name            = "tcgmasterguide"
environment             = "prod"
location                = "eastus2"
static_web_app_sku      = "Standard"
sql_max_size_gb         = 4
sql_azuread_admin_login = "olivermerkleyking@gmail.com"

# Set these via environment variables or command line:
# sql_admin_username = "sqladmin"
# sql_admin_password = "your-secure-password"

# Production should restrict IP access
allowed_ip_addresses = []

tags = {
  Project     = "TCG Master Guide"
  Environment = "Production"
  ManagedBy   = "Terraform"
}
