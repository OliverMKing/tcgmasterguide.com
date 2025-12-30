project_name            = "tcgmasterguide"
environment             = "dev"
location                = "eastus2"
static_web_app_sku      = "Free"
sql_max_size_gb         = 2
sql_azuread_admin_login = "your-email@domain.com"

# Set these via environment variables or command line:
# sql_admin_username = "sqladmin"
# sql_admin_password = "your-secure-password"

# Optional: Add your IP for SQL access during development
allowed_ip_addresses = []

tags = {
  Project     = "TCG Master Guide"
  Environment = "Development"
  ManagedBy   = "Terraform"
}
