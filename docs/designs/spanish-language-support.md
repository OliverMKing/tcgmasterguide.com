# Spanish Language Support Design

## Context

This design adds Spanish language support to TCG Master Guide with **separate paid subscriptions** for each language. Key requirements:

1. **Separate Stripe products** for English vs Spanish subscriptions
2. **Language-gated content** - subscribers only access content in their subscribed language(s)
3. **Revenue tracking** - admin dashboard shows subscriber counts by language
4. **Translated UI** - site chrome translated (except deck pages and Q&A content)
5. **Separate Q&A** - Spanish Q&A is independent from English
6. **Spanish deck pages** - under `content/decks/es/` with same format

Users wanting both languages must purchase both subscriptions separately.

---

## Architecture Decisions

### 1. Database: Add Spanish Subscription Fields Only

**Key principle: NO changes to existing columns.** Keep existing fields unchanged (they implicitly represent English). Only ADD new fields for Spanish.

```prisma
model User {
  id                     String    @id @default(cuid())
  authId                 String    @unique @map("auth_id")
  email                  String?   @unique
  name                   String?
  role                   String    @default("USER")
  stripeCustomerId       String?   @map("stripe_customer_id")

  // EXISTING - unchanged (implicitly = English subscription)
  stripeSubscriptionId       String?   @map("stripe_subscription_id")
  stripeSubscriptionStatus   String?   @map("stripe_subscription_status")
  subscriptionEndsAt         DateTime? @map("subscription_ends_at")

  // NEW - Spanish subscription only
  stripeSubscriptionIdEs     String?   @map("stripe_subscription_id_es")
  stripeSubscriptionStatusEs String?   @map("stripe_subscription_status_es")
  subscriptionEndsAtEs       DateTime? @map("subscription_ends_at_es")

  createdAt              DateTime  @default(now()) @map("created_at")
  updatedAt              DateTime  @updatedAt @map("updated_at")
}
```

**Benefits:**
- Zero changes to existing columns - existing code continues working
- Existing users completely unaffected
- Only 3 new nullable columns added
- Original fields implicitly represent English subscriptions
- Simple to query, clear revenue attribution, no joins needed
- The SUBSCRIBER role remains for backwards compatibility (user has at least one active subscription)

### 2. URL Structure: Locale Prefix

```
/           → English home (default)
/es/        → Spanish home
/decks/absol → English deck
/es/decks/absol → Spanish deck
/qa         → English Q&A
/es/qa      → Spanish Q&A
```

Using `next-intl` library with `[locale]` dynamic segment.

### 3. Content Structure

```
content/
├── decks/           # English decks (existing)
│   ├── absol.md
│   ├── charizard-pidgeot.md
│   └── images/
└── decks/es/        # Spanish decks (new)
    ├── absol.md
    └── (images shared from parent)
```

### 4. Q&A: Add Locale Field to Comments

```prisma
model Comment {
  // ... existing fields
  locale    String   @default("en")  // 'en' | 'es'
}
```

Q&A threads are completely separate per language.

---

## Implementation Phases

### Phase 1: Database Migration

**Files to modify:**
- `prisma/schema.prisma`

**Changes:**
1. ADD Spanish subscription fields only (no changes to existing):
   - `stripeSubscriptionIdEs`
   - `stripeSubscriptionStatusEs`
   - `subscriptionEndsAtEs`
2. Add `locale` field to Comment model

**Migration SQL (additive only, no column renames):**
```sql
-- Add Spanish subscription fields (existing English fields unchanged)
ALTER TABLE users ADD stripe_subscription_id_es NVARCHAR(255) NULL;
ALTER TABLE users ADD stripe_subscription_status_es NVARCHAR(50) NULL;
ALTER TABLE users ADD subscription_ends_at_es DATETIME2 NULL;

-- Add locale to comments
ALTER TABLE comments ADD locale NVARCHAR(10) NOT NULL DEFAULT 'en';
CREATE INDEX comments_locale_idx ON comments(locale);
```

**Zero risk to existing users** - we only add new nullable columns.

---

### Phase 2: Stripe Configuration

**Files to modify:**
- `src/lib/stripe.ts`
- `.env` / `.env.example`

**Environment Variables (additive only, no renames):**
```env
STRIPE_PRICE_ID=price_xxx       # EXISTING - unchanged (English)
STRIPE_PRICE_ID_ES=price_yyy    # NEW - Spanish product
```

**Stripe library updates:**
```typescript
// src/lib/stripe.ts
export const SUBSCRIPTION_PRICES = {
  en: process.env.STRIPE_PRICE_ID!,      // Existing var for English
  es: process.env.STRIPE_PRICE_ID_ES!,   // New var for Spanish
} as const;

export type SubscriptionLocale = keyof typeof SUBSCRIPTION_PRICES;

export function getSubscriptionPriceId(locale: SubscriptionLocale): string {
  return SUBSCRIPTION_PRICES[locale];
}
```

---

### Phase 3: Access Control Updates

**Files to modify:**
- `src/lib/user-roles.ts`
- `src/hooks/useCurrentUser.ts`
- `src/app/api/user/me/route.ts`

**New access control logic:**
```typescript
// src/lib/user-roles.ts
export function hasSubscriberAccessForLocale(
  user: {
    role?: string;
    stripeSubscriptionStatus?: string;    // Existing = English
    stripeSubscriptionStatusEs?: string;  // New = Spanish
  } | null,
  locale: 'en' | 'es'
): boolean {
  if (process.env.NEXT_PUBLIC_REQUIRE_SUBSCRIPTION !== 'true') {
    return true;
  }
  if (!user) return false;
  if (user.role === UserRole.ADMIN) return true;

  const status = locale === 'es'
    ? user.stripeSubscriptionStatusEs
    : user.stripeSubscriptionStatus;  // Existing field for English

  return status === 'active' || status === 'trialing';
}
```

**Update useCurrentUser hook** to return subscription status for both languages:
```typescript
interface UserData {
  id: string;
  role: string;
  stripeSubscriptionStatus: string | null;    // English (existing)
  stripeSubscriptionStatusEs: string | null;  // Spanish (new)
}
```

---

### Phase 4: Stripe Webhook Updates

**Files to modify:**
- `src/app/api/webhooks/stripe/route.ts`
- `src/app/api/stripe/checkout/route.ts`

**Checkout changes:**
```typescript
// POST /api/stripe/checkout
export async function POST(request: Request) {
  const { locale } = await request.json(); // 'en' | 'es'
  const priceId = getSubscriptionPriceId(locale);

  const session = await stripe.checkout.sessions.create({
    line_items: [{ price: priceId, quantity: 1 }],
    metadata: {
      userId: user.id,
      subscriptionLocale: locale,
    },
    // ...
  });
}
```

**Webhook changes:**
```typescript
// Handle checkout.session.completed
const subscriptionLocale = session.metadata?.subscriptionLocale || 'en';

if (subscriptionLocale === 'es') {
  // Spanish subscription - use NEW fields
  await prisma.user.update({
    where: { id: userId },
    data: {
      stripeSubscriptionIdEs: subscriptionId,
      stripeSubscriptionStatusEs: 'active',
      role: UserRole.SUBSCRIBER,
    },
  });
} else {
  // English subscription - use EXISTING fields (unchanged)
  await prisma.user.update({
    where: { id: userId },
    data: {
      stripeSubscriptionId: subscriptionId,
      stripeSubscriptionStatus: 'active',
      role: UserRole.SUBSCRIBER,
    },
  });
}

// Handle subscription.updated/deleted - check which subscription it is
const subscription = event.data.object as Stripe.Subscription;
const user = await prisma.user.findFirst({
  where: {
    OR: [
      { stripeSubscriptionId: subscription.id },    // English (existing)
      { stripeSubscriptionIdEs: subscription.id },  // Spanish (new)
    ]
  }
});

// Update appropriate language fields based on which subscription matched
```

---

### Phase 5: i18n Framework Setup

**New files to create:**
- `src/i18n/config.ts`
- `src/i18n/request.ts`
- `src/i18n/routing.ts`
- `src/middleware.ts`
- `messages/en.json`
- `messages/es.json`

**Install dependency:**
```bash
npm install next-intl
```

**Middleware for locale routing:**
```typescript
// src/middleware.ts
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: ['/', '/(en|es)/:path*', '/((?!api|_next|.*\\..*).*)']
};
```

**App restructure:**
```
src/app/
├── [locale]/           # New: locale wrapper
│   ├── layout.tsx      # NextIntlClientProvider
│   ├── page.tsx        # Home
│   ├── about/
│   ├── decks/[slug]/
│   ├── qa/
│   ├── subscribe/
│   └── admin/
├── api/                # API routes stay at root
└── layout.tsx          # Root layout (minimal)
```

---

### Phase 6: Component Translation

**Files to modify:** All UI components with hardcoded text

**Translation structure (`messages/en.json`):**
```json
{
  "nav": {
    "about": "About",
    "decks": "Decks",
    "qa": "Q&A",
    "subscribe": "Subscribe"
  },
  "home": {
    "title": "TCG Master Guide",
    "subtitle": "In-depth Pokemon TCG deck guides"
  },
  "subscribe": {
    "title": "Subscribe",
    "monthlyPrice": "$20/month",
    "features": {
      "guides": "Comprehensive deck guides",
      "matchups": "Every matchup explained"
    }
  },
  "locked": {
    "title": "Premium Content",
    "message": "Subscribe to unlock this section"
  }
}
```

**Components to translate:**
- Navbar (`src/components/Navbar.tsx`)
- Footer
- SubscribePage (`src/app/[locale]/subscribe/page.tsx`)
- LockedSection (`src/components/LockedSection.tsx`)
- AnnouncementBanner
- LiveBanner
- Comment form labels (NOT comment content)

**Admin page can remain English-only** (internal use).

---

### Phase 7: Spanish Content Structure

**New directories:**
```
content/
└── decks/
    └── es/              # Spanish decks
        ├── absol.md
        └── ...
```

**Files to modify:**
- `src/app/api/decks/route.ts` - Accept locale param
- `src/app/api/decks/[slug]/content/route.ts` - Read from locale subfolder
- Deck content utilities

**Content loading logic:**
```typescript
function getDecksDirectory(locale: string): string {
  if (locale === 'es') {
    return path.join(process.cwd(), 'content', 'decks', 'es');
  }
  return path.join(process.cwd(), 'content', 'decks');
}
```

**Images:** Spanish decks can reference same images as English (card images are language-agnostic). Use relative paths like `../images/absol/`.

---

### Phase 8: Q&A Locale Separation

**Files to modify:**
- `src/app/api/comments/route.ts`
- `src/components/Comments.tsx`

**API changes:**
```typescript
// GET /api/comments?locale=es
const locale = searchParams.get('locale') || 'en';
const comments = await prisma.comment.findMany({
  where: { locale, ...otherFilters }
});

// POST /api/comments
const { locale, content, deckSlug } = await request.json();
await prisma.comment.create({
  data: { locale, content, deckSlug, ... }
});
```

---

### Phase 9: Admin Dashboard Updates

**Files to modify:**
- `src/app/api/admin/stats/route.ts`
- `src/app/admin/page.tsx`

**New stats structure:**
```typescript
{
  totalUsers: number,
  byRole: {
    ADMIN: number,
    SUBSCRIBER: number,
    USER: number
  },
  subscribers: {
    englishOnly: number,     // Has EN sub, no ES sub
    spanishOnly: number,     // Has ES sub, no EN sub
    both: number,            // Has both subs
    total: number
  }
}
```

**Query:**
```typescript
const [enOnly, esOnly, both] = await Promise.all([
  prisma.user.count({
    where: {
      stripeSubscriptionStatus: 'active',      // English (existing field)
      stripeSubscriptionStatusEs: { not: 'active' }
    }
  }),
  prisma.user.count({
    where: {
      stripeSubscriptionStatusEs: 'active',    // Spanish (new field)
      stripeSubscriptionStatus: { not: 'active' }
    }
  }),
  prisma.user.count({
    where: {
      stripeSubscriptionStatus: 'active',      // Both active
      stripeSubscriptionStatusEs: 'active'
    }
  }),
]);
```

---

### Phase 10: Language Switcher & Auto-Detection

**Auto-detect browser language via middleware:**

The `next-intl` middleware automatically checks the `Accept-Language` header and redirects to the appropriate locale on first visit.

```typescript
// src/middleware.ts
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware({
  ...routing,
  localeDetection: true,  // Auto-detect from Accept-Language header
});
```

**Behavior:**
- First visit: Check browser's `Accept-Language` header
- If `es` or `es-*` → redirect to `/es/`
- Otherwise → serve English (`/`)
- Once visited, preference stored in `NEXT_LOCALE` cookie
- Users can override via language switcher

**Language switcher in Footer (not Navbar):**

```typescript
// src/components/Footer.tsx (add to existing footer)
import { LocaleSwitcher } from './LocaleSwitcher';

// Add LocaleSwitcher to footer content
```

**LocaleSwitcher component:** `src/components/LocaleSwitcher.tsx`

```typescript
'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from '@/i18n/routing';

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <select
      value={locale}
      onChange={(e) => router.replace(pathname, { locale: e.target.value })}
      className="bg-transparent border rounded px-2 py-1"
    >
      <option value="en">English</option>
      <option value="es">Español</option>
    </select>
  );
}
```

**Location:** Footer, near copyright/theme toggle.

---

## Key Files Summary

| File | Change |
|------|--------|
| `prisma/schema.prisma` | Add per-language subscription fields, comment locale |
| `src/lib/stripe.ts` | Multi-price support |
| `src/lib/user-roles.ts` | `hasSubscriberAccessForLocale()` |
| `src/hooks/useCurrentUser.ts` | Return both subscription statuses |
| `src/app/api/webhooks/stripe/route.ts` | Handle locale-specific subscriptions |
| `src/app/api/stripe/checkout/route.ts` | Accept locale, use correct price |
| `src/app/api/comments/route.ts` | Filter by locale |
| `src/app/api/admin/stats/route.ts` | Subscriber counts by language |
| `src/middleware.ts` | Create - locale routing |
| `src/i18n/*.ts` | Create - i18n config |
| `messages/*.json` | Create - translations |
| `src/app/[locale]/` | Restructure - locale wrapper |

---

## Verification Plan

1. **Database migration:** Run `npx prisma migrate dev`, verify schema
2. **Stripe products:** Create Spanish product in Stripe dashboard
3. **English site:** Verify `/` and `/en/` work, existing subscribers retain access
4. **Spanish site:** Verify `/es/` loads, shows Spanish UI
5. **Checkout:** Test English checkout → user gets EN access only
6. **Checkout:** Test Spanish checkout → user gets ES access only
7. **Access control:** English subscriber cannot view `/es/decks/*` premium content
8. **Both subscriptions:** User with both can access both languages
9. **Q&A:** Comments on `/qa` vs `/es/qa` are separate
10. **Admin:** Dashboard shows correct EN/ES/both subscriber counts
11. **Language switcher:** Switching preserves current page path

---

## Dependencies

- `next-intl` - Internationalization library for Next.js App Router

## Not In Scope

- Automatic deck content translation (manual Spanish deck writing)
- Spanish announcement content (admin creates Spanish announcements manually)
- Localized pricing display (can be added later)
- More than 2 languages (design supports extension but not implemented)
