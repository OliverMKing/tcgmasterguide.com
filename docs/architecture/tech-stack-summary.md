# Technology Stack

TCG Master Guide tech stack optimized for low cost, rapid development, and scalability.

## Frontend
- **Next.js 16 (App Router)** - Latest React framework version
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library

## Backend
- **Next.js API Routes** - Serverless backend
- **Prisma** - Database ORM
- **Azure SQL Database** - Relational database

## Authentication & Payments
- **Clerk** - Authentication & user management (free up to 10K users)
- **Stripe** - Payment processing (2.9% + $0.30 per transaction)

## Content Management
- **Tina CMS** or **Decap CMS** - Git-based CMS for non-technical editors
- **Markdown** - Content format stored in `/content` directory

## Infrastructure
- **Azure Static Web Apps** - Hosting (free tier)
- **Azure SQL Database** - Database (serverless, $5-10/month)
- **Azure Key Vault** - Secrets management
- **Terraform** - Infrastructure as Code
- **GitHub Actions** - CI/CD pipeline

## Development Tools
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Prisma Studio** - Database GUI

## Cost Estimate

**Starting (< 100 subscribers)**:
- Azure Static Web Apps: **Free**
- Azure SQL Database Serverless: **$5-10**
- Clerk: **Free** (up to 10K MAU)
- Stripe: **Pay per transaction**
- Azure Key Vault: **< $1**
- **Total: ~$6-11/month + Stripe fees**

**At Scale (1000 subscribers @ $10/month)**:
- Platform costs: **~$634-654/month**
- Revenue: **$10,000/month**
- Net profit: **~$9,350/month** (93.5% margin)

## Why These Choices?

See [architecture-decisions.md](./architecture-decisions.md) for detailed rationale on each technology choice.
