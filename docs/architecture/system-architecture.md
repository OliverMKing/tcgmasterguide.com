# System Architecture

Visual diagrams and infrastructure overview for TCG Master Guide.

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         User Browser                         │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│               Azure Static Web Apps (No CDN)                 │
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

## User Flow

### Anonymous User Flow
```
1. Landing Page (public)
   ↓
2. View limited content preview
   ↓
3. Click "Subscribe" button
   ↓
4. Sign up with Clerk (email/Google/etc)
   ↓
5. Redirect to Stripe Checkout
   ↓
6. Complete payment
   ↓
7. Webhook updates database
   ↓
8. Full content access granted
```

### Authenticated User Flow
```
1. Sign in with Clerk
   ↓
2. Check subscription status in database
   ↓
3. If active subscription:
   → Full access to all deck guides
   ↓
4. If no subscription:
   → Prompt to subscribe
   ↓
5. Browse deck guides
   ↓
6. View matchup analysis, play guides
```

## Data Flow

### User Registration & Subscription
```
User → Clerk (Sign Up) → Webhook → API Route → Database (Create User)
                                        ↓
User → Stripe Checkout → Webhook → API Route → Database (Create Subscription)
                                        ↓
                            Grant access to content
```

### Content Editing (Non-Technical Editor)
```
Editor → CMS Admin Panel → Edit Markdown → Save
           ↓
       Commit to Git
           ↓
    GitHub Actions (CI/CD)
           ↓
    Build & Deploy
           ↓
    Content Live (2-3 min)
```

### API Request Flow
```
User Request → Next.js API Route
                    ↓
              Verify Clerk Session
                    ↓
              Query Database (Prisma)
                    ↓
              Check Subscription Status
                    ↓
              Return Content or 403
```

## Infrastructure Components

### Azure Resources
- **Resource Group**: Container for all resources
- **Static Web App**:
  - Hosts Next.js frontend (static files, no CDN initially)
  - Runs API routes as Azure Functions
  - Automatic HTTPS and custom domains
  - CDN can be added later when traffic justifies the cost
- **SQL Database**:
  - Serverless tier (auto-pause when idle)
  - Stores users, subscriptions, metadata
- **Key Vault**:
  - Stores database connection strings
  - Stores API keys (Clerk, Stripe)

### External Services
- **Clerk**: Authentication, user management
- **Stripe**: Payment processing, subscription management
- **GitHub**: Source control, CI/CD triggers

## Deployment Pipeline

```
Developer Push → GitHub
                   ↓
           GitHub Actions CI/CD
                   ↓
        ┌──────────┴──────────┐
        ↓                     ↓
   Terraform              Application
   (Infrastructure)       (Next.js)
        ↓                     ↓
   Azure Resources      Build & Deploy
        ↓                     ↓
   Provisioned          Static Web App
                             ↓
                        Run Migrations
                             ↓
                        Production Live
```

### PR Preview Flow
```
Create PR → GitHub Actions
              ↓
         Build & Deploy
              ↓
    Preview URL Generated
              ↓
    Test in Isolation
              ↓
    Merge → Production
              ↓
    Preview Deleted
```

## Security Architecture

### Authentication Flow
```
User → Clerk (Login) → JWT Token
         ↓
   API Request (with token)
         ↓
   Clerk Middleware (verify)
         ↓
   API Route (authorized)
```

### Secrets Management
```
All Secrets → Azure Key Vault
                ↓
         Static Web App (read at runtime)
                ↓
         API Routes (environment variables)
```

### Database Access
```
Static Web App → Private Connection → Azure SQL
                                        ↓
                              TLS 1.2+ Encrypted
                                        ↓
                              Azure AD Authenticated
```

## Performance Optimizations

### Static Generation
- Landing page: SSG (pre-rendered at build time)
- Deck guides: SSG with ISR (Incremental Static Regeneration)
- User dashboard: SSR (server-side rendered with auth)

### Caching Strategy
- Static assets: Browser cache (short TTL initially)
- API responses: Short cache (5 min)
- Database queries: No cache initially (add Redis later if needed)
- CDN: Not used initially to minimize costs

### Edge Computing
- API routes run on Azure Functions (single region initially)
- Static content served from Azure Static Web Apps (no CDN initially)
- Can enable global CDN later when traffic and budget justify it

## Scalability Plan

### Phase 1: Launch (< 100 users)
- Free/Serverless tiers
- No additional services needed
- Cost: ~$6-11/month

### Phase 2: Growth (100-1000 users)
- Monitor database performance
- Add caching if needed (Azure Cache for Redis)
- Consider enabling CDN if users report slow load times
- Stay on serverless tier
- Cost: ~$50-100/month

### Phase 3: Scale (1000+ users)
- Upgrade to dedicated SQL tier if needed
- Implement comprehensive caching
- Enable CDN for global content delivery
- Cost: ~$200-500/month

## Monitoring & Observability

### Metrics to Track
- **Application Insights**: Request latency, errors, dependencies
- **Azure SQL**: DTU usage, query performance
- **Stripe Dashboard**: Subscription metrics, churn
- **Clerk Dashboard**: User growth, authentication metrics

### Alerting
- Database auto-pause (too frequent = need upgrade)
- API error rate > 1%
- Payment failures
- Static Web App deployment failures

## Disaster Recovery

### Backup Strategy
- **Database**: Automatic backups (Azure SQL, 7-day retention)
- **Code**: Git repository (GitHub)
- **Infrastructure**: Terraform state (Azure Blob Storage)

### Recovery Procedures
1. Infrastructure failure: Re-run Terraform
2. Database corruption: Restore from backup
3. Code issue: Git revert + redeploy
4. Complete disaster: Rebuild from Terraform + Git + latest DB backup

### RTO/RPO
- **Recovery Time Objective (RTO)**: < 1 hour
- **Recovery Point Objective (RPO)**: < 15 minutes (transaction log backups)
