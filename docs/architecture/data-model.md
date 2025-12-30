# Data Model

Database schema and relationships for TCG Master Guide.

## Entity Relationship Diagram

```
┌─────────────────┐
│      User       │
├─────────────────┤
│ id (PK)         │
│ clerkUserId     │◀────── From Clerk authentication
│ email           │
│ createdAt       │
│ updatedAt       │
└────────┬────────┘
         │
         │ 1:1
         │
         ↓
┌─────────────────────────┐
│    Subscription         │
├─────────────────────────┤
│ id (PK)                 │
│ userId (FK)             │
│ stripeCustomerId        │◀────── From Stripe
│ stripeSubscriptionId    │◀────── From Stripe
│ status                  │        active, canceled, past_due, etc.
│ currentPeriodEnd        │
│ createdAt               │
│ updatedAt               │
└─────────────────────────┘
```

**Note**: Deck guides are NOT stored in the database. They are Markdown files with images in the `/content/guides/` directory.

## Prisma Schema

```prisma
// prisma/schema.prisma

datasource db {
  provider = "sqlserver"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model User {
  id                String         @id @default(cuid())
  clerkUserId       String         @unique
  email             String         @unique
  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @updatedAt

  subscription      Subscription?

  @@index([clerkUserId])
  @@index([email])
}

model Subscription {
  id                   String   @id @default(cuid())
  userId               String   @unique
  stripeCustomerId     String   @unique
  stripeSubscriptionId String   @unique
  status               String   // active, canceled, past_due, trialing, incomplete, incomplete_expired
  currentPeriodStart   DateTime
  currentPeriodEnd     DateTime
  cancelAtPeriodEnd    Boolean  @default(false)
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt

  user                 User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([stripeCustomerId])
  @@index([stripeSubscriptionId])
  @@index([status])
}
```

## Model Descriptions

### User

Stores basic user information synced from Clerk.

**Fields:**
- `id`: Internal unique identifier (cuid)
- `clerkUserId`: User ID from Clerk (for authentication lookups)
- `email`: User email address (unique)
- `createdAt`: Account creation timestamp
- `updatedAt`: Last update timestamp

**Relationships:**
- One-to-one with Subscription

**Indexes:**
- `clerkUserId`: Fast lookups during authentication
- `email`: Fast lookups for user queries

**Sync Strategy:**
- Created via Clerk webhook when user signs up
- Email updates synced via Clerk webhook

---

### Subscription

Stores subscription information synced from Stripe.

**Fields:**
- `id`: Internal unique identifier (cuid)
- `userId`: Foreign key to User
- `stripeCustomerId`: Stripe customer ID (for API calls)
- `stripeSubscriptionId`: Stripe subscription ID (for API calls)
- `status`: Subscription status
  - `active`: Subscription is active, user has access
  - `canceled`: Subscription canceled, may still have access until period end
  - `past_due`: Payment failed, grace period
  - `trialing`: In trial period (if implemented)
  - `incomplete`: Initial payment incomplete
  - `incomplete_expired`: Initial payment failed after 23 hours
- `currentPeriodStart`: Current billing period start
- `currentPeriodEnd`: Current billing period end (used to check access)
- `cancelAtPeriodEnd`: Whether subscription will cancel at period end
- `createdAt`: Subscription creation timestamp
- `updatedAt`: Last update timestamp

**Relationships:**
- Belongs to User (one-to-one)
- Cascade delete: If user deleted, subscription deleted

**Indexes:**
- `userId`: Fast lookups for user subscription
- `stripeCustomerId`: Fast lookups during Stripe webhooks
- `stripeSubscriptionId`: Fast lookups during Stripe webhooks
- `status`: Fast queries for active subscriptions

**Sync Strategy:**
- Created via Stripe webhook: `customer.subscription.created`
- Updated via Stripe webhooks:
  - `customer.subscription.updated`
  - `customer.subscription.deleted`
  - `invoice.payment_succeeded`
  - `invoice.payment_failed`

**Access Logic:**
```typescript
function hasAccess(subscription: Subscription): boolean {
  if (!subscription) return false;

  const isActive = subscription.status === 'active';
  const notExpired = new Date(subscription.currentPeriodEnd) > new Date();

  return isActive && notExpired;
}
```

---

## Deck Guides: Markdown Files Approach

Deck guides are stored as Markdown files in the repository, NOT in the database.

### Content Structure

```
/content
  /guides
    /my-first-deck-guide.md
    /another-deck-guide.md
    /images
      /deck1-screenshot.png
      /matchup-chart.png
  /pages
    /about.md
    /table-of-contents.md
```

### Markdown File Format

Each deck guide is a single Markdown file with frontmatter metadata:

```markdown
---
title: "My Deck Guide"
description: "A comprehensive guide to this deck"
author: "Editor Name"
published: true
publishedAt: "2025-12-29"
updatedAt: "2025-12-29"
---

# Deck Overview

This deck focuses on...

![Deck Screenshot](/content/guides/images/deck1-screenshot.png)

## Strategy

The main strategy is...

## Matchups

Against other decks...

![Matchup Chart](/content/guides/images/matchup-chart.png)

## Recommendations

Consider these tech choices...
```

### Benefits

1. **Simple**: No database queries needed for content
2. **Fast**: Static site generation, served from CDN
3. **Version Control**: Full Git history of content changes
4. **CMS-Friendly**: Tina CMS and Decap CMS work directly with Markdown files
5. **Editor-Friendly**: Non-technical editors can edit through CMS UI
6. **Image Support**: Images stored alongside content in `/content/guides/images/`
7. **Flexible Format**: No rigid schema, editors can write freely

### Table of Contents Generation

The table of contents page (`/guides`) is automatically generated by:
1. Reading all Markdown files in `/content/guides/`
2. Parsing frontmatter for metadata (title, description, dates)
3. Filtering by `published: true`
4. Sorting by `updatedAt` or `publishedAt`
5. Rendering as a list of links

```typescript
// Example: lib/guides.ts
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

export function getAllGuides() {
  const guidesDirectory = path.join(process.cwd(), 'content/guides');
  const filenames = fs.readdirSync(guidesDirectory)
    .filter(filename => filename.endsWith('.md'));

  const guides = filenames.map(filename => {
    const filePath = path.join(guidesDirectory, filename);
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContents);

    return {
      slug: filename.replace(/\.md$/, ''),
      title: data.title,
      description: data.description,
      published: data.published,
      publishedAt: data.publishedAt,
      updatedAt: data.updatedAt,
    };
  });

  // Filter published guides and sort by date
  return guides
    .filter(guide => guide.published)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}
```

### Rendering Guides

Use a Next.js package like `next-mdx-remote` or `remark` to render Markdown:

```typescript
// app/guides/[slug]/page.tsx
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { MDXRemote } from 'next-mdx-remote/rsc';

export default async function GuidePage({ params }: { params: { slug: string } }) {
  const filePath = path.join(process.cwd(), 'content/guides', `${params.slug}.md`);
  const fileContents = fs.readFileSync(filePath, 'utf8');
  const { data, content } = matter(fileContents);

  return (
    <article>
      <h1>{data.title}</h1>
      <p>{data.description}</p>
      <MDXRemote source={content} />
    </article>
  );
}
```

### CMS Integration

**Tina CMS** or **Decap CMS** will provide a visual editor for non-technical editors:

1. Editor logs into CMS at `/admin`
2. Selects a guide to edit or creates a new one
3. Edits text and uploads images through UI
4. Clicks "Save" → automatically commits to Git
5. GitHub Actions deploys changes
6. Changes live in 2-3 minutes

No database involvement required!

---

## Access Control Logic

Deck guides are publicly accessible files, but access is controlled at the page/route level by checking subscription status.

### Page Protection Example

```typescript
// app/guides/[slug]/page.tsx
import { auth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getGuideBySlug } from '@/lib/guides';

export default async function GuidePage({ params }: { params: { slug: string } }) {
  // 1. Verify authentication
  const { userId } = auth();
  if (!userId) {
    redirect('/sign-in?redirect=/guides/' + params.slug);
  }

  // 2. Check subscription status
  const user = await prisma.user.findUnique({
    where: { clerkUserId: userId },
    include: { subscription: true }
  });

  // 3. Verify subscription is active
  const hasAccess = user?.subscription &&
    user.subscription.status === 'active' &&
    new Date(user.subscription.currentPeriodEnd) > new Date();

  if (!hasAccess) {
    redirect('/subscribe?redirect=/guides/' + params.slug);
  }

  // 4. Load and render guide
  const guide = getGuideBySlug(params.slug);

  return (
    <article>
      <h1>{guide.title}</h1>
      <MDXRemote source={guide.content} />
    </article>
  );
}
```

### Helper Function

```typescript
// lib/subscription.ts
import { prisma } from '@/lib/prisma';

export async function hasActiveSubscription(clerkUserId: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { clerkUserId },
    include: { subscription: true }
  });

  if (!user?.subscription) return false;

  const isActive = user.subscription.status === 'active';
  const notExpired = new Date(user.subscription.currentPeriodEnd) > new Date();

  return isActive && notExpired;
}
```

---

## Migration Strategy

### Initial Setup

```bash
# Create migration
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate

# Deploy to production
npx prisma migrate deploy
```

### Adding Fields

When adding new fields, create a migration:

```bash
npx prisma migrate dev --name add_description_to_deck_guide
```

This will:
1. Update `schema.prisma`
2. Create migration SQL file
3. Apply to local database
4. Regenerate Prisma Client

In production (via GitHub Actions):
```bash
npx prisma migrate deploy
```

---

## Database Connection

### Connection String Format (SQL Server)

```
sqlserver://username:password@hostname:1433;database=dbname;encrypt=true;trustServerCertificate=false;hostNameInCertificate=*.database.windows.net;loginTimeout=30;
```

### Prisma Client Instantiation

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

---

## Query Examples

### Create User (from Clerk webhook)

```typescript
await prisma.user.create({
  data: {
    clerkUserId: clerkUser.id,
    email: clerkUser.emailAddresses[0].emailAddress,
  },
});
```

### Create Subscription (from Stripe webhook)

```typescript
await prisma.subscription.create({
  data: {
    userId: user.id,
    stripeCustomerId: stripeCustomer.id,
    stripeSubscriptionId: stripeSubscription.id,
    status: stripeSubscription.status,
    currentPeriodStart: new Date(stripeSubscription.current_period_start * 1000),
    currentPeriodEnd: new Date(stripeSubscription.current_period_end * 1000),
  },
});
```

### Check Subscription Status

```typescript
const user = await prisma.user.findUnique({
  where: { clerkUserId: userId },
  include: { subscription: true },
});

const hasActiveSubscription =
  user?.subscription?.status === 'active' &&
  new Date(user.subscription.currentPeriodEnd) > new Date();
```

---

## Performance Considerations

### Database Query Optimization
- Use `select` to fetch only needed fields
- Use `include` for relations only when needed
- Add indexes for frequently queried fields (already defined in schema)
- Use connection pooling (built into Prisma)

### Content Loading
- Deck guides loaded at build time (Static Site Generation)
- No database queries for content (Markdown files read from filesystem)
- Images served from CDN
- Fast page loads from static HTML

### Caching Strategy (Future)
- Cache subscription status for 5 minutes (reduce database load)
- Invalidate cache on Stripe webhook updates
- Use Redis for distributed cache if needed at scale

### Scaling
- Serverless SQL auto-scales with usage
- Connection pooling prevents exhaustion
- Static content served from global CDN
- Read replicas available if needed (premium SQL tier)
