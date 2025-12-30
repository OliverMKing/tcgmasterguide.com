# Technology Stack & Architecture Decisions

## Executive Summary

TCG Master Guide is a content subscription platform for competitive Pokemon TCG players. The architecture is designed for:
- **Low operational cost** for a small subscription business
- **Rapid development** with modern, well-supported tools
- **Scalability** to handle growth without architectural changes
- **Azure deployment** with Infrastructure as Code

## Tech Stack Overview

### Frontend
- **Next.js 16 (App Router)** - Latest React framework version
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library

### Backend
- **Next.js API Routes** - Serverless backend
- **Prisma** - Database ORM
- **Azure SQL Database** - Relational database

### Authentication & Payments
- **Clerk** - Authentication & user management
- **Stripe** - Payment processing

### Infrastructure
- **Azure Static Web Apps** - Hosting (with API support)
- **Azure SQL Database** - Database
- **Azure Key Vault** - Secrets management
- **Terraform** - Infrastructure as Code
- **GitHub Actions** - CI/CD pipeline

---

## Detailed Architecture Decisions

### 1. Frontend: Next.js 16 with App Router

**Why Next.js?**
- **Full-stack framework**: API routes eliminate need for separate backend
- **Server-Side Rendering (SSR)**: Better SEO for public landing page
- **Static Site Generation (SSG)**: Fast, cacheable pages for guides
- **Edge runtime support**: Low-latency API responses
- **Excellent Azure integration**: First-class Static Web Apps support

**Why App Router (vs Pages Router)?**
- Modern React Server Components for better performance
- Built-in layouts for consistent navigation
- Improved data fetching patterns
- Better TypeScript support

**Alternatives Considered:**
- **Vanilla React (SPA)**: Worse SEO, need separate backend
- **Vue/Nuxt**: Smaller ecosystem, less Azure integration
- **Remix**: Less mature, smaller ecosystem

### 2. Language: TypeScript

**Why TypeScript?**
- **Type safety**: Catch errors at compile time
- **Better IDE support**: Autocomplete, refactoring
- **Required for modern Next.js**: Best practices
- **Excellent for full-stack**: Share types between frontend/backend

### 3. Database: Azure SQL Database (Serverless)

**Why Azure SQL?**
- **Serverless tier**: Auto-pauses when idle, pay per second of use
- **Perfect for low traffic**: Ideal for subscription site starting out
- **Relational model**: Natural fit for users, subscriptions, content
- **Excellent Prisma support**: Type-safe queries
- **Azure native**: Built-in security, backups, monitoring

**Cost Optimization:**
- Start with **Serverless Basic tier** (~$5-10/month at low usage)
- Auto-scales with demand
- Auto-pauses after inactivity (no compute charges)

**Alternatives Considered:**
- **Azure Cosmos DB**: Overkill, more expensive for small relational data
- **PostgreSQL**: Azure SQL cheaper at small scale, better Prisma support
- **MongoDB Atlas**: Wrong data model, document DB not ideal here

### 4. ORM: Prisma

**Why Prisma?**
- **Type-safe database queries**: TypeScript integration
- **Excellent DX**: Intuitive schema definition
- **Migration management**: Version controlled schema changes
- **Azure SQL support**: First-class support for SQL Server
- **Auto-generated types**: Sync DB schema with TypeScript types

### 5. Authentication: Clerk

**Why Clerk?**
- **Generous free tier**: Up to 10,000 monthly active users
- **Built for Next.js**: Drop-in components and hooks
- **Pre-built UI**: Sign-up, sign-in, user profile pages
- **Webhook support**: Sync user events with your database
- **No backend code needed**: Fully managed service
- **Session management**: Secure, automatic
- **Social logins**: Optional Google, Discord, etc.

**Pricing:**
- **Free**: 0-10,000 MAU
- **Pro**: $25/month for 10,000+ MAU (only pay when growing)

**Alternatives Considered:**
- **Auth0**: More expensive, overkill for this use case
- **NextAuth.js**: Self-hosted, more work, need to manage sessions
- **Azure AD B2C**: Complex setup, overkill, not ideal for consumer apps
- **Supabase Auth**: Ties you to Supabase ecosystem

### 6. Payments: Stripe

**Why Stripe?**
- **Industry standard**: Battle-tested, reliable
- **Simple pricing**: 2.9% + $0.30 per transaction, no monthly fees
- **Subscription management**: Built-in recurring billing
- **Customer portal**: Self-service for users to manage subscriptions
- **Excellent documentation**: Best-in-class developer experience
- **Webhook support**: Real-time subscription events
- **Tax handling**: Stripe Tax available if needed
- **No merchant of record**: You maintain control (simpler for US-based)

**For $10/month subscription:**
- Stripe fee: $0.59 per transaction
- Net revenue: $9.41 per subscriber

**Alternatives Considered:**
- **Paddle**: 5% + $0.50 per transaction = $1.00 fee (vs Stripe's $0.59). Acts as merchant of record (handles VAT/sales tax) but more expensive at low price points.
- **Lemon Squeezy**: Similar to Paddle, 5% + $0.50. Good for digital goods but more expensive.
- **PayPal**: Higher fees, worse developer experience
- **Chargebee/Recurly**: Monthly platform fees, overkill

**Integration Pattern:**
```
User signs up (Clerk) → Stripe Checkout → Webhook → Update DB → Grant access
```

### 7. Hosting: Azure Static Web Apps

**Why Azure Static Web Apps?**
- **Free tier**: Generous limits for starting out
- **Built for Next.js**: Official integration
- **Includes API hosting**: Serverless functions for backend
- **Global CDN**: Fast content delivery
- **Custom domains**: Free SSL certificates
- **Preview environments**: Automatic for PRs via GitHub Actions
- **Azure integration**: Easy access to Key Vault, SQL, monitoring

**Pricing:**
- **Free tier**: 100 GB bandwidth, 2 free custom domains
- **Standard tier**: $9/month (when you outgrow free tier)

**Architecture:**
- Static pages served from CDN
- API routes run as Azure Functions (serverless)
- Connects to Azure SQL Database via private connection

**Alternatives Considered:**
- **Vercel**: Best Next.js experience but higher costs at scale
- **Azure App Service**: More expensive, overkill for this workload
- **Azure Container Apps**: More complex, higher cost
- **AWS Amplify**: Not Azure ecosystem

### 8. Infrastructure as Code: Terraform

**Why Terraform?**
- **Multi-cloud standard**: Industry standard IaC tool
- **Azure support**: Official azurerm provider
- **State management**: Track infrastructure changes
- **Reproducible**: Entire infrastructure in version control
- **Team-friendly**: Easy to review changes in PRs

**What we'll provision:**
- Azure Resource Group
- Azure Static Web App
- Azure SQL Database (Serverless)
- Azure Key Vault
- Necessary permissions and networking

**Alternatives Considered:**
- **Azure Bicep**: Azure-only, less portable
- **ARM Templates**: Verbose, harder to read
- **Pulumi**: Less mature for Azure, smaller community

### 9. CI/CD: GitHub Actions

**Why GitHub Actions?**
- **Native GitHub integration**: Built into our repo
- **Free for public repos**: Generous free tier for private repos
- **Azure integration**: Official Azure actions
- **Terraform support**: Community actions available
- **Preview deployments**: Automatic for PRs

**Pipeline Strategy:**
1. **PR Pipeline**: Lint, type-check, test, Terraform plan
2. **Main Pipeline**: Build, test, Terraform apply, deploy to production
3. **Deployment**: Automatic via Azure Static Web Apps GitHub integration

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         User Browser                         │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│              Azure Static Web Apps (Global CDN)              │
│  ┌─────────────────────┐         ┌──────────────────────┐  │
│  │   Next.js Frontend  │         │  Next.js API Routes  │  │
│  │   (Static Pages)    │         │  (Azure Functions)   │  │
│  └─────────────────────┘         └──────────┬───────────┘  │
└───────────────────────────────────────────────┼─────────────┘
                                                │
                    ┌───────────────────────────┼───────────────────────┐
                    │                           │                       │
                    ↓                           ↓                       ↓
         ┌──────────────────┐      ┌────────────────────┐   ┌─────────────────┐
         │  Clerk API        │      │  Stripe API        │   │ Azure SQL DB    │
         │  (Auth)           │      │  (Payments)        │   │ (Serverless)    │
         └──────────────────┘      └────────────────────┘   └─────────────────┘
                    │                           │                       │
                    └───────────────────────────┴───────────────────────┘
                                                │
                                                ↓
                                    ┌────────────────────┐
                                    │  Azure Key Vault   │
                                    │  (Secrets)         │
                                    └────────────────────┘
```

---

## Data Model (Prisma Schema)

```prisma
model User {
  id                String   @id @default(cuid())
  clerkUserId       String   @unique
  email             String   @unique
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  subscription      Subscription?
}

model Subscription {
  id                String   @id @default(cuid())
  userId            String   @unique
  stripeCustomerId  String   @unique
  stripeSubscriptionId String @unique
  status            String   // active, canceled, past_due, etc.
  currentPeriodEnd  DateTime
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  user              User     @relation(fields: [userId], references: [id])
}

model DeckGuide {
  id                String   @id @default(cuid())
  slug              String   @unique
  title             String
  deckList          String   // JSON or text
  matchupAnalysis   String   // Markdown
  playGuide         String   // Markdown
  recommendations   String   // Markdown
  published         Boolean  @default(false)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}
```

---

## Security Considerations

1. **Authentication**: Clerk handles session management, secure by default
2. **API Protection**: All API routes check authentication via Clerk middleware
3. **Payment Security**: Stripe handles PCI compliance, we never store card data
4. **Secrets Management**: All secrets in Azure Key Vault, never in code
5. **Database**: Private endpoint, only accessible from Static Web App
6. **HTTPS**: Enforced by Azure Static Web Apps (automatic SSL)

---

## Deployment Strategy

### Environments
- **Production**: Main branch → prod.tcgmasterguide.com
- **Preview**: PR branches → auto-generated URLs

### Deployment Flow
1. Push to GitHub
2. GitHub Actions runs:
   - Install dependencies
   - Lint & type-check
   - Run tests (when added)
   - Build Next.js app
   - Terraform plan (show changes)
3. Merge to main:
   - Terraform apply (provision/update infrastructure)
   - Deploy to Azure Static Web Apps
   - Run database migrations (Prisma)
4. Automatic rollback on failure

---

## Cost Estimate (Monthly)

**Starting Out (< 100 subscribers):**
- Azure Static Web Apps: **Free tier**
- Azure SQL Database Serverless: **$5-10** (auto-pauses when idle)
- Clerk Auth: **Free** (up to 10K MAU)
- Stripe: **Pay per transaction** (no monthly fee)
- Azure Key Vault: **< $1**
- **Total: ~$6-11/month + Stripe fees**

**Growing (1000 subscribers @ $10/month):**
- Azure Static Web Apps: **Free or $9/month**
- Azure SQL Database: **$10-30** (scales with usage)
- Clerk Auth: **$25/month** (10K+ MAU)
- Stripe: **$590/month** (2.9% + $0.30 per transaction)
- **Total: ~$634-654/month**
- **Revenue: $10,000/month**
- **Net: ~$9,350/month** (93.5% margin after platform fees)

---

## Development Workflow

1. **Local Development**:
   - Run Next.js dev server locally
   - Use local SQL Server or Azure SQL dev database
   - Test Stripe webhooks with Stripe CLI
   - Test Clerk with test keys

2. **Version Control**:
   - Feature branches for new work
   - PR reviews before merging
   - Conventional commits for clarity

3. **Testing** (to be implemented):
   - Unit tests for business logic
   - Integration tests for API routes
   - E2E tests for critical flows (signup, subscription)

---

## Content Management Strategy

**Requirement**: Non-technical content editors must be able to edit articles and publish changes without understanding complex technology.

**Solution: Markdown Files + Git-based CMS**

We'll use **Markdown files** stored in the repo with a **Git-based CMS** for non-technical editing:

### Option 1: Tina CMS (Recommended)
- **Why**: Open-source, Next.js native, Git-based
- **Editor Experience**: Visual editor, live preview, no code knowledge needed
- **Workflow**: Editors make changes in visual UI → saves to Git → auto-deploys
- **Cost**: Free for small teams (up to 2 users)
- **Integration**: Drop-in Next.js components
- **Content Storage**: Markdown files in `/content` directory

### Option 2: Decap CMS (formerly Netlify CMS)
- **Why**: Open-source, Git-based, platform agnostic
- **Editor Experience**: Admin panel at `/admin`, form-based editing
- **Workflow**: Edit in admin panel → commits to Git → auto-deploys
- **Cost**: Completely free
- **Integration**: Static admin panel served from your site

### Content Structure
```
/content
  /guides
    /arceus-vstar.md
    /lugia-vstar.md
    /lost-zone-box.md
  /pages
    /about.md
    /appendix.md
```

### Editor Workflow
1. Editor logs into CMS (Tina or Decap admin panel)
2. Selects a deck guide to edit
3. Makes changes in visual editor (WYSIWYG for Tina, forms for Decap)
4. Clicks "Save" → automatically commits to Git
5. GitHub Actions auto-deploys changes
6. Changes live in 2-3 minutes

### Benefits
- **No deployment knowledge needed**: Editor never touches code
- **Version controlled**: All changes tracked in Git
- **Preview before publish**: See changes before going live
- **Rollback capability**: Easy to undo changes
- **No database needed**: Content lives alongside code

### Implementation
- Content stored as Markdown with frontmatter
- CMS provides editing interface
- Next.js reads Markdown files at build time
- Static pages generated for fast performance

---

## Future Considerations

**Potential Enhancements:**
- **Caching**: Redis (Azure Cache for Redis) for frequently accessed data
- **Search**: Azure Cognitive Search for deck guide search
- **Analytics**: Application Insights for monitoring
- **CDN Optimization**: Azure Front Door for advanced routing
- **Email**: Azure Communication Services or SendGrid for transactional emails
- **Upgrade CMS**: Move to Sanity or Contentful if advanced features needed (media library, workflows, etc.)

**Scaling Triggers:**
- Move from Free tier to Standard tier when exceeding limits
- Consider dedicated SQL tier when database auto-pauses too frequently
- Add Redis when database query performance degrades
- Implement comprehensive caching strategy at 10K+ users

---

## Getting Started

See deployment guides:
- `docs/architecture/local-development.md` (to be created)
- `docs/architecture/deployment.md` (to be created)
- `terraform/README.md` (to be created)
