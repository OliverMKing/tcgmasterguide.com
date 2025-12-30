# Architecture Decisions

Detailed rationale for all technology choices in TCG Master Guide.

## 1. Frontend: Next.js 16 with App Router

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

---

## 2. Language: TypeScript

**Why TypeScript?**
- **Type safety**: Catch errors at compile time
- **Better IDE support**: Autocomplete, refactoring
- **Required for modern Next.js**: Best practices
- **Excellent for full-stack**: Share types between frontend/backend

---

## 3. Database: Azure SQL Database (Serverless)

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

---

## 4. ORM: Prisma

**Why Prisma?**
- **Type-safe database queries**: TypeScript integration
- **Excellent DX**: Intuitive schema definition
- **Migration management**: Version controlled schema changes
- **Azure SQL support**: First-class support for SQL Server
- **Auto-generated types**: Sync DB schema with TypeScript types

---

## 5. Authentication: Clerk

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

---

## 6. Payments: Stripe

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

---

## 7. Hosting: Azure Static Web Apps

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

---

## 8. Infrastructure as Code: Terraform

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

---

## 9. CI/CD: GitHub Actions

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

## 10. Content Management: Git-based CMS

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
