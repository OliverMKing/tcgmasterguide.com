#!/bin/bash

# Quick deployment script for TCG Master Guide infrastructure
# Usage: ./deploy.sh <environment>
# Example: ./deploy.sh dev

set -e

ENVIRONMENT=$1

if [ -z "$ENVIRONMENT" ]; then
  echo "Usage: ./deploy.sh <environment>"
  echo "Example: ./deploy.sh dev"
  exit 1
fi

if [ "$ENVIRONMENT" != "dev" ] && [ "$ENVIRONMENT" != "staging" ] && [ "$ENVIRONMENT" != "prod" ]; then
  echo "Error: Environment must be dev, staging, or prod"
  exit 1
fi

echo "🚀 Deploying TCG Master Guide - $ENVIRONMENT environment"

# Check if required environment variables are set
if [ -z "$TF_VAR_sql_admin_username" ]; then
  echo "⚠️  Warning: TF_VAR_sql_admin_username not set"
fi

if [ -z "$TF_VAR_sql_admin_password" ]; then
  echo "⚠️  Warning: TF_VAR_sql_admin_password not set"
fi

# Initialize Terraform
echo "📦 Initializing Terraform..."
terraform init -backend-config=environments/$ENVIRONMENT/backend.conf -reconfigure

# Validate configuration
echo "✅ Validating configuration..."
terraform validate

# Plan changes
echo "📋 Planning changes..."
terraform plan -var-file=environments/$ENVIRONMENT/terraform.tfvars -out=tfplan

# Prompt for confirmation
read -p "Do you want to apply these changes? (yes/no): " -r
echo
if [[ ! $REPLY =~ ^[Yy]es$ ]]; then
  echo "Deployment cancelled"
  exit 1
fi

# Apply changes
echo "🔧 Applying changes..."
terraform apply tfplan

# Clean up plan file
rm -f tfplan

echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Get the Static Web App deployment token:"
echo "   terraform output -raw static_web_app_api_key"
echo ""
echo "2. Update Key Vault secrets with actual values"
echo ""
echo "3. Configure GitHub Actions with the deployment token"
echo ""
echo "4. Run database migrations"
