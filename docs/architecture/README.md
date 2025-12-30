# Architecture Documentation

Comprehensive architecture documentation for TCG Master Guide.

## Quick Navigation

- **[Tech Stack Summary](./tech-stack-summary.md)**: High-level overview of all technologies
- **[Architecture Decisions](./architecture-decisions.md)**: Detailed rationale for each tech choice
- **[System Architecture](./system-architecture.md)**: Visual diagrams and infrastructure overview
- **[Data Model](./data-model.md)**: Database schema and relationships
- **[Original Tech Stack Doc](./tech-stack.md)**: Complete combined reference (legacy)

## Getting Started

### For Developers
1. Read [Tech Stack Summary](./tech-stack-summary.md)
2. Review [Data Model](./data-model.md)
3. Follow setup guides in `/terraform` and `/.github/workflows`

### For Understanding Decisions
1. Read [Architecture Decisions](./architecture-decisions.md)
2. Review alternatives considered for each technology
3. See cost breakdowns and scaling plans

### For System Overview
1. Review [System Architecture](./system-architecture.md)
2. Understand user flows and data flows
3. See deployment pipeline and security architecture

## Project Structure

```
tcgmasterguide.com/
├── docs/
│   ├── architecture/          ← You are here
│   │   ├── README.md          ← This file
│   │   ├── tech-stack-summary.md
│   │   ├── architecture-decisions.md
│   │   ├── system-architecture.md
│   │   ├── data-model.md
│   │   └── tech-stack.md      ← Original combined doc
│   └── business/
│       └── product-overview.md
├── terraform/                 ← Infrastructure as Code
│   ├── main.tf
│   ├── variables.tf
│   ├── resources.tf
│   ├── outputs.tf
│   └── README.md
├── .github/
│   └── workflows/             ← CI/CD pipelines
│       ├── ci.yml
│       ├── deploy.yml
│       ├── terraform-plan.yml
│       ├── terraform-apply.yml
│       └── README.md
└── (Next.js app to be created)
```

## Key Technologies

| Category | Technology | Why |
|----------|-----------|-----|
| **Frontend** | Next.js 16 | Full-stack framework with SSR/SSG |
| **Language** | TypeScript | Type safety for reliability |
| **Database** | Azure SQL Serverless | Auto-scales, $5-10/month starting |
| **Auth** | Clerk | Free tier up to 10K users |
| **Payments** | Stripe | 2.9% + $0.30, industry standard |
| **CMS** | Tina CMS | Git-based, non-technical friendly |
| **Hosting** | Azure Static Web Apps | Free tier with CDN |
| **IaC** | Terraform | Standard infrastructure as code |
| **CI/CD** | GitHub Actions | Native GitHub integration |

## Cost Summary

**Starting (< 100 subscribers)**: ~$6-11/month
**At Scale (1000 @ $10/month)**: ~$635/month, $9,350 net (93.5% margin)

## Architecture at a Glance

```
User → Azure Static Web Apps (Next.js)
         ↓
         ├─→ Clerk (Auth)
         ├─→ Stripe (Payments)
         ├─→ Azure SQL (Data)
         └─→ Key Vault (Secrets)
```

## Next Steps

1. **Review Architecture**: Read the documentation files above
2. **Setup Infrastructure**: Follow [terraform/README.md](../../terraform/README.md)
3. **Configure CI/CD**: Follow [.github/workflows/README.md](../../.github/workflows/README.md)
4. **Build Application**: Initialize Next.js project (next phase)
5. **Integrate Services**: Add Clerk, Stripe, Prisma (next phase)
6. **Add Content**: Configure CMS for deck guides (next phase)

## Questions?

For detailed explanations of any technology choice, see:
- [Architecture Decisions](./architecture-decisions.md)

For implementation details, see:
- Infrastructure: [terraform/README.md](../../terraform/README.md)
- CI/CD: [.github/workflows/README.md](../../.github/workflows/README.md)
- Data: [Data Model](./data-model.md)
