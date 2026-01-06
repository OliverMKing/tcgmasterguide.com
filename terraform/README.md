# Terraform Infrastructure

This directory contains Terraform configuration for deploying the TCG Master Guide infrastructure to Azure.

## Architecture

The infrastructure includes:
- **Azure Static Web App** (no CDN initially to minimize costs)
- **Azure SQL Database** (Serverless tier)
- **Azure Key Vault** (for secrets management)

## Prerequisites

1. **Azure CLI** installed and authenticated
   ```bash
   az login
   ```

2. **Terraform** installed (>= 1.5.0)
   ```bash
   terraform --version
   ```

3. **Azure Subscription** with appropriate permissions

## Initial Setup

### 1. Create Storage Account for Terraform State

Before deploying infrastructure, create a storage account to store Terraform state:

```bash
# Set variables
RESOURCE_GROUP_NAME="tcgmasterguide-terraform-rg"
STORAGE_ACCOUNT_NAME="tcgmtfstate"
CONTAINER_NAME="tfstate"
LOCATION="eastus"

# Create resource group
az group create --name $RESOURCE_GROUP_NAME --location $LOCATION

# Create storage account
az storage account create \
  --name $STORAGE_ACCOUNT_NAME \
  --resource-group $RESOURCE_GROUP_NAME \
  --location $LOCATION \
  --sku Standard_LRS \
  --encryption-services blob

# Create blob container
az storage container create \
  --name $CONTAINER_NAME \
  --account-name $STORAGE_ACCOUNT_NAME
```

### 2. Configure Environment Variables

Set required environment variables for sensitive data:

```bash
export TF_VAR_sql_admin_username="sqladmin"
export TF_VAR_sql_admin_password="YourSecurePassword123!"
export TF_VAR_clerk_secret_key="your-clerk-secret-key"
export TF_VAR_stripe_secret_key="your-stripe-secret-key"
export TF_VAR_stripe_webhook_secret="your-stripe-webhook-secret"
```

Alternatively, create a `terraform.tfvars` file (DO NOT commit to Git):

```hcl
sql_admin_username = "sqladmin"
sql_admin_password = "YourSecurePassword123!"
```

## Deployment

### Quick Deployment (Recommended)

Use the deployment script for a streamlined deployment process:

```bash
cd terraform

# Deploy to development
./deploy.sh dev

# Deploy to production
./deploy.sh prod
```

The script will:
- Initialize Terraform with the correct backend
- Validate the configuration
- Show you a plan of changes
- Prompt for confirmation before applying

### Manual Deployment

If you prefer to run Terraform commands manually:

#### Deploy Development Environment

```bash
cd terraform

# Initialize Terraform with dev backend
terraform init -backend-config=environments/dev/backend.conf

# Review the plan
terraform plan -var-file=environments/dev/terraform.tfvars

# Apply the configuration
terraform apply -var-file=environments/dev/terraform.tfvars
```

#### Deploy Production Environment

```bash
cd terraform

# Initialize Terraform with prod backend
terraform init -backend-config=environments/prod/backend.conf -reconfigure

# Review the plan
terraform plan -var-file=environments/prod/terraform.tfvars

# Apply the configuration
terraform apply -var-file=environments/prod/terraform.tfvars
```

## After Deployment

### 1. Get Static Web App Deployment Token

```bash
# Get the deployment token (needed for GitHub Actions)
terraform output -raw static_web_app_api_key
```

Add this to GitHub Secrets as `AZURE_STATIC_WEB_APPS_API_TOKEN`.

### 2. Update Key Vault Secrets

Update placeholder secrets in Key Vault with actual values:

```bash
# Get Key Vault name
KEY_VAULT_NAME=$(terraform output -raw key_vault_name)

# Update Clerk secret key
az keyvault secret set \
  --vault-name $KEY_VAULT_NAME \
  --name clerk-secret-key \
  --value "your-actual-clerk-secret-key"

# Update Stripe secret key
az keyvault secret set \
  --vault-name $KEY_VAULT_NAME \
  --name stripe-secret-key \
  --value "your-actual-stripe-secret-key"

# Update Stripe webhook secret
az keyvault secret set \
  --vault-name $KEY_VAULT_NAME \
  --name stripe-webhook-secret \
  --value "your-actual-stripe-webhook-secret"
```

### 3. Configure Application Settings

The Static Web App will need environment variables configured:

```bash
STATIC_WEB_APP_NAME=$(terraform output -raw static_web_app_name)
RESOURCE_GROUP_NAME=$(terraform output -raw resource_group_name)
KEY_VAULT_URI=$(terraform output -raw key_vault_uri)

# Note: Static Web Apps don't support direct Key Vault references in the Free tier
# You'll need to set these via GitHub Actions or manually in the portal
```

### 4. Run Database Migrations

After deployment, run Prisma migrations:

```bash
# Get SQL connection string
SQL_SERVER_FQDN=$(terraform output -raw sql_server_fqdn)
SQL_DATABASE_NAME=$(terraform output -raw sql_database_name)

# Set DATABASE_URL environment variable
export DATABASE_URL="sqlserver://${SQL_SERVER_FQDN};database=${SQL_DATABASE_NAME};user=sqladmin;password=YourPassword;encrypt=true"

# Run migrations
npx prisma migrate deploy
```

### 5. Application Insights Page View Tracking

Terraform automatically configures Application Insights for page view tracking:

- Creates a Service Principal with "Monitoring Reader" role
- Sets environment variables on the Static Web App:
  - `NEXT_PUBLIC_APPINSIGHTS_CONNECTION_STRING` - for client-side tracking
  - `AZURE_LOG_ANALYTICS_WORKSPACE_ID` - for querying page views
  - `AZURE_CLIENT_ID`, `AZURE_CLIENT_SECRET`, `AZURE_TENANT_ID` - for Azure AD authentication

The Service Principal credentials are also stored in Key Vault for reference.

**No manual configuration required** - everything is set up automatically by Terraform.

## Outputs

After applying, Terraform will output:

- `static_web_app_default_host_name` - URL of your Static Web App
- `static_web_app_api_key` - Deployment token (sensitive)
- `sql_server_fqdn` - SQL Server hostname
- `key_vault_uri` - Key Vault URI

## Cost Optimization

### Free Tier Resources (Development)
- Static Web App: Free tier (no CDN)
- SQL Database: Serverless (auto-pause after 60 min)
- Key Vault: Standard tier (~$0.03/10k operations)

**Estimated Monthly Cost: $6-11**

### Production Resources
- Static Web App: Standard tier ($9/month, can add CDN later)
- SQL Database: Serverless with higher capacity
- Key Vault: Standard tier

**Estimated Monthly Cost: $50-100**

## Monitoring

View resource metrics in Azure Portal:

```bash
# Open resource group in portal
az group show --name $(terraform output -raw resource_group_name) --query id -o tsv
```

## Cleanup

To destroy all resources:

```bash
# Development
terraform destroy -var-file=environments/dev/terraform.tfvars

# Production
terraform destroy -var-file=environments/prod/terraform.tfvars
```

## Security Best Practices

1. **Never commit sensitive values** to Git
2. **Use environment variables** for secrets
3. **Enable soft-delete** on Key Vault (enabled by default)
4. **Restrict SQL firewall** to known IPs only
5. **Use Azure AD authentication** when possible
6. **Enable Azure SQL auditing** for production

## Troubleshooting

### Key Vault Access Denied

If you get access denied errors:

```bash
# Grant yourself Key Vault access
az keyvault set-policy \
  --name $(terraform output -raw key_vault_name) \
  --upn your-email@domain.com \
  --secret-permissions get list set delete
```

### SQL Connection Issues

If you can't connect to SQL:

```bash
# Add your current IP to firewall
MY_IP=$(curl -s ifconfig.me)
az sql server firewall-rule create \
  --resource-group $(terraform output -raw resource_group_name) \
  --server $(terraform output -raw sql_server_name) \
  --name AllowMyIP \
  --start-ip-address $MY_IP \
  --end-ip-address $MY_IP
```

### Static Web App Deployment Issues

Check the deployment status:

```bash
az staticwebapp show \
  --name $(terraform output -raw static_web_app_name) \
  --resource-group $(terraform output -raw resource_group_name)
```

## CI/CD Integration

See `.github/workflows/` for GitHub Actions workflows that use this Terraform configuration.

## References

- [Azure Static Web Apps Documentation](https://docs.microsoft.com/en-us/azure/static-web-apps/)
- [Azure SQL Database Serverless](https://docs.microsoft.com/en-us/azure/azure-sql/database/serverless-tier-overview)
- [Azure Key Vault Documentation](https://docs.microsoft.com/en-us/azure/key-vault/)
- [Terraform Azure Provider](https://registry.terraform.io/providers/hashicorp/azurerm/latest/docs)
