variable "project_name" {
  description = "Project name used as prefix for all resources"
  type        = string
  default     = "tcgmasterguide"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod"
  }
}

variable "location" {
  description = "Azure region for resources"
  type        = string
  default     = "eastus2"
}

variable "static_web_app_sku" {
  description = "SKU for Azure Static Web App (Free or Standard)"
  type        = string
  default     = "Free"
  validation {
    condition     = contains(["Free", "Standard"], var.static_web_app_sku)
    error_message = "Static Web App SKU must be Free or Standard"
  }
}

variable "enable_enterprise_edge" {
  description = "Enable Enterprise Edge (global CDN powered by Azure Front Door). Requires Standard SKU."
  type        = bool
  default     = true
}

variable "custom_domain" {
  description = "Custom apex domain for the Static Web App (e.g., tcgmasterguide.com)"
  type        = string
  default     = "tcgmasterguide.com"
}

variable "sql_admin_username" {
  description = "SQL Server administrator username. If not set, existing value in Azure will be preserved."
  type        = string
  sensitive   = true
  default     = null
}

variable "sql_admin_password" {
  description = "SQL Server administrator password. If not set, existing value in Azure will be preserved."
  type        = string
  sensitive   = true
  default     = null
}

variable "sql_azuread_admin_login" {
  description = "Azure AD administrator login for SQL Server"
  type        = string
}

variable "sql_max_size_gb" {
  description = "Maximum size of SQL Database in GB"
  type        = number
  default     = 2
}

variable "allowed_ip_addresses" {
  description = "List of IP addresses allowed to access SQL Server"
  type        = list(string)
  default     = []
}

variable "clerk_secret_key" {
  description = "Clerk API secret key"
  type        = string
  sensitive   = true
  default     = ""
}

variable "stripe_secret_key" {
  description = "Stripe API secret key"
  type        = string
  sensitive   = true
  default     = ""
}

variable "stripe_webhook_secret" {
  description = "Stripe webhook secret"
  type        = string
  sensitive   = true
  default     = ""
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default = {
    Project     = "TCG Master Guide"
    ManagedBy   = "Terraform"
  }
}

variable "appinsights_daily_cap_gb" {
  description = "Daily data cap for Application Insights in GB (0.4 = ~200K page views/day)"
  type        = number
  default     = 0.4
}
