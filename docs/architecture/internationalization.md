# Internationalization (i18n) Architecture

Design document for adding multi-language support to TCG Master Guide.

## 1. Overview

TCG Master Guide currently serves content exclusively in English. Adding internationalization would expand the audience — particularly to the large Japanese, Korean, and Spanish-speaking Pokemon TCG communities — by translating both the UI chrome and (optionally) the premium deck guide content.

### Goals

- Support multiple languages for UI elements (navigation, buttons, labels, error messages)
- Provide a framework for translating long-form Markdown content (deck guides, announcements)
- Maintain SEO best practices with proper `hreflang`, locale-prefixed URLs, and per-locale metadata
- Preserve existing static generation performance
- Work seamlessly with both Server Components and Client Components

### Non-Goals (Initial Phase)

- Real-time machine translation of deck guides
- User-generated content translation (comments, Q&A)
- Right-to-left (RTL) language support (can be added later)

---

## 2. Current State Assessment

### Where User-Facing Text Lives

All strings are **hardcoded directly in components** — there is no extraction or abstraction layer.

| Location | String Count (approx.) | Examples |
|----------|----------------------|----------|
| `Navbar.tsx` | ~15 | "About", "Subscribe", "Q&A", "Sign In" |
| `Footer.tsx` | ~5 | "Expert deck guides by Grant Manley" |
| `page.tsx` (home) | ~10 | "TCG Master Guide", "Decks", "Tier 1" |
| `subscribe/page.tsx` | ~20 | "$20", "/month", "Subscribe Now" |
| `DeckContent.tsx` | ~15 | "Table of Contents", "Free Preview" |
| `Comments.tsx` | ~20 | "Discussion", "Post Comment", "Pending approval" |
| `qa/page.tsx` | ~25 | "Questions and Answers", "Submit Question" |
| `LockedSection.tsx` | ~10 | "Unlock the Full Guide", "Subscribe Now" |
| `LockedDeckContent.tsx` | ~10 | "Premium Content", "What's Inside" |
| `admin/page.tsx` | ~30 | "Admin Dashboard", "Pending Comments" |
| `about/page.tsx` | ~30 | Full page of body text |
| Other pages/components | ~50 | 404, success, live, history modal |
| **Total** | **~240-300+** | |

### Other i18n-Relevant Hardcoding

- `<html lang="en">` in `layout.tsx`
- `locale: 'en_US'` in OpenGraph metadata
- `'en-US'` in `toLocaleDateString()` calls (Comments, HistoryModal, QA)
- Clerk auth UI renders in English by default
- `sitemap.ts` generates flat URLs with no locale prefix
- `confirm()` browser dialogs use English strings

### Content Sources (English-Only)

- `content/decks/*.md` — 8+ premium deck guides with YAML frontmatter
- `content/announcements/*.md` — News posts with YAML frontmatter

---

## 3. Technology Choice: `next-intl`

### Why `next-intl`?

| Requirement | `next-intl` | `react-i18next` | `react-intl` | `lingui` |
|------------|-------------|-----------------|--------------|----------|
| App Router support | First-class | Requires adapters | Manual setup | Experimental |
| Server Components | Native | Limited | No | Limited |
| Static generation | Built-in | Manual | Manual | Manual |
| Middleware routing | Built-in | Manual | Manual | Manual |
| ICU message format | Yes | Yes | Yes | Yes |
| Bundle size | ~2KB | ~10KB | ~12KB | ~5KB |
| Active maintenance | Very active | Active | Active | Active |

**Decision: `next-intl`** — purpose-built for the Next.js App Router with the best developer experience for our stack.

### Alternatives Considered

- **`react-i18next` / `next-i18next`**: The most popular i18n library, but `next-i18next` is designed for Pages Router. Using `react-i18next` with App Router requires significant manual wiring for Server Components.
- **`react-intl` (FormatJS)**: Powerful but heavier, requires more boilerplate, no built-in Next.js routing integration.
- **`lingui`**: Good extraction tooling but App Router support is still experimental.
- **Next.js built-in i18n**: Only available in Pages Router, not App Router.

---

## 4. Architecture Design

### 4.1 URL Strategy

Use **locale-prefixed paths** with a default locale:

```
/                     → English (default, no prefix)
/ja/                  → Japanese
/ja/decks/charizard   → Japanese deck page
/es/                  → Spanish
/es/subscribe         → Spanish subscribe page
```

The default locale (`en`) will not have a URL prefix to preserve existing URLs and SEO equity.

### 4.2 Directory Structure

```
src/
├── app/
│   └── [locale]/              ← All routes nested under locale segment
│       ├── layout.tsx         ← Dynamic <html lang={locale}>
│       ├── page.tsx           ← Home
│       ├── about/page.tsx
│       ├── decks/[slug]/page.tsx
│       ├── subscribe/page.tsx
│       ├── announcements/page.tsx
│       └── ...
├── i18n/
│   ├── config.ts              ← Supported locales, default locale
│   ├── request.ts             ← next-intl request config
│   └── routing.ts             ← Routing/navigation helpers
├── middleware.ts               ← Locale detection & routing
└── ...

messages/                       ← Translation files (project root)
├── en.json
├── ja.json
└── es.json

content/
├── decks/
│   ├── en/                    ← English deck guides (moved from root)
│   │   ├── charizard-pidgeot.md
│   │   └── ...
│   └── ja/                    ← Japanese deck guides (future)
│       ├── charizard-pidgeot.md
│       └── ...
└── announcements/
    ├── en/
    └── ja/
```

### 4.3 Translation File Structure

```jsonc
// messages/en.json
{
  "metadata": {
    "site_title": "TCG Master Guide",
    "site_description": "In-depth Pokemon TCG deck guides by Grant Manley"
  },
  "nav": {
    "home": "Home",
    "about": "About",
    "decks": "Decks",
    "announcements": "Announcements",
    "subscribe": "Subscribe",
    "subscription": "Subscription",
    "qa": "Q&A",
    "live": "Live",
    "admin": "Admin",
    "sign_in": "Sign In",
    "toggle_menu": "Toggle menu"
  },
  "home": {
    "hero_title": "TCG Master Guide",
    "hero_subtitle": "In-depth Pokemon Trading Card Game deck guides by Grant Manley...",
    "decks_heading": "Decks",
    "announcements_heading": "Announcements",
    "view_all": "View all",
    "updated": "Updated {date}",
    "tier": "Tier {number}"
  },
  "subscribe": {
    "title": "Subscribe",
    "subtitle": "Unlock all deck guides and expert strategies",
    "monthly_access": "Monthly Access",
    "price": "$20",
    "per_month": "/month",
    "cta": "Subscribe Now",
    "sign_in_to_subscribe": "Sign In to Subscribe",
    "loading": "Loading...",
    "manage_subscription": "Manage Subscription",
    "secure_payment": "Secure payment powered by Stripe",
    "already_subscribed": "You're subscribed!",
    "admin_access": "You have admin access!"
  },
  "deck": {
    "back_to_guides": "Back to Guides",
    "last_updated": "Last updated {date}",
    "table_of_contents": "Table of Contents",
    "preview_contents": "Preview Contents",
    "free_preview": "Free Preview",
    "preview_message": "You're viewing a limited preview. Subscribe for full access to all guides.",
    "explore_more": "Explore More Guides",
    "explore_subtitle": "Continue your journey with our other expert guides",
    "browse_all": "Browse All Decks",
    "full_guide_includes": "Full guide includes:",
    "more_sections": "+ {count} more sections..."
  },
  "comments": {
    "discussion": "Discussion",
    "sort": "Sort:",
    "date": "Date",
    "subscriber_only": "Subscriber-Only Feature",
    "subscriber_only_message": "Discussion is exclusively available to subscribers...",
    "placeholder": "Share your thoughts on this deck...",
    "post_comment": "Post Comment",
    "posting": "Posting...",
    "cancel": "Cancel",
    "post_reply": "Post Reply",
    "pending": "Pending approval",
    "admin": "Admin",
    "no_comments": "No comments yet. Be the first to share your thoughts!",
    "sign_in_prompt": "Sign in to join the discussion",
    "load_failed": "Failed to load comments",
    "delete_failed": "Failed to delete",
    "approve_failed": "Failed to approve comment",
    "confirm_delete": "Are you sure you want to delete this?",
    "previous": "Previous",
    "next": "Next",
    "page_of": "Page {current} of {total}"
  },
  "qa": {
    "title": "Questions and Answers",
    "subtitle": "Want to know more about a deck...",
    "related_deck": "Related Deck (optional)",
    "your_question": "Your Question",
    "question_placeholder": "What would you like to know?",
    "submit": "Submit Question",
    "submitting": "Submitting...",
    "all_decks": "All Decks",
    "other": "Other",
    "no_questions": "No questions yet. Be the first to ask!"
  },
  "locked": {
    "unlock_title": "Unlock the Full Guide",
    "unlock_message": "Subscribe to access detailed gameplay strategies...",
    "premium_content": "Premium Content",
    "premium_message": "Subscribe to unlock full deck guides...",
    "whats_inside": "What's Inside",
    "get_access": "Get access to all premium guides",
    "get_unlimited": "Get unlimited access to all premium guides"
  },
  "not_found": {
    "code": "404",
    "title": "Page Not Found",
    "message": "The page you're looking for doesn't exist...",
    "go_home": "Go Home"
  },
  "common": {
    "loading": "Loading...",
    "error": "Something went wrong",
    "previous": "Previous",
    "next": "Next"
  }
}
```

### 4.4 Middleware

```typescript
// src/middleware.ts
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: ['/', '/(ja|es|ko|de)/:path*']
};
```

### 4.5 Component Integration Pattern

**Server Components** use `getTranslations()`:

```tsx
// src/app/[locale]/page.tsx
import { getTranslations } from 'next-intl/server';

export default async function HomePage() {
  const t = await getTranslations('home');
  return <h1>{t('hero_title')}</h1>;
}
```

**Client Components** use `useTranslations()`:

```tsx
// src/components/Navbar.tsx
'use client';
import { useTranslations } from 'next-intl';

export default function Navbar() {
  const t = useTranslations('nav');
  return <nav><a>{t('about')}</a></nav>;
}
```

### 4.6 Static Generation

Update `generateStaticParams` to include locale dimension:

```tsx
// src/app/[locale]/decks/[slug]/page.tsx
import { routing } from '@/i18n/routing';

export function generateStaticParams() {
  const slugs = getAllDeckSlugs();
  return routing.locales.flatMap(locale =>
    slugs.map(slug => ({ locale, slug }))
  );
}
```

### 4.7 Content Translation Strategy

For Markdown content (deck guides, announcements), use **locale-partitioned directories**:

```
content/decks/en/charizard-pidgeot.md
content/decks/ja/charizard-pidgeot.md   ← same slug, different language
```

The content loading functions (`src/lib/decks.ts`, `src/lib/announcements.ts`) will accept a `locale` parameter:

```typescript
export async function getDeckContent(slug: string, locale: string = 'en') {
  const filePath = path.join(CONTENT_DIR, 'decks', locale, `${slug}.md`);
  // Fall back to English if translation doesn't exist
  if (!existsSync(filePath)) {
    return getDeckContent(slug, 'en');
  }
  // ... read and parse
}
```

**Fallback behavior**: If a deck guide isn't translated yet, serve the English version with a banner indicating the content is in English.

### 4.8 SEO Updates

- **Dynamic `<html lang>`**: Set from `[locale]` param in root layout
- **`hreflang` alternate links**: Add to page `<head>` for all available locales
- **Sitemap**: Generate entries for each `locale × page` combination
- **OpenGraph**: Set `og:locale` dynamically per page
- **Metadata**: Translate title, description per locale

### 4.9 Date & Number Formatting

Replace hardcoded `'en-US'` locale in date formatting:

```tsx
// Before
date.toLocaleDateString('en-US', { ... })

// After
import { useLocale } from 'next-intl';
const locale = useLocale();
date.toLocaleDateString(locale, { ... })

// Or use next-intl's built-in formatting
import { useFormatter } from 'next-intl';
const format = useFormatter();
format.dateTime(date, { year: 'numeric', month: 'long', day: 'numeric' });
```

### 4.10 Third-Party Localization

**Clerk Auth**: Pass localization to `ClerkProvider`:

```tsx
import { jaJP, esES } from '@clerk/localizations';

const localizationMap = { ja: jaJP, es: esES };

<ClerkProvider localization={localizationMap[locale]}>
```

**Stripe Checkout**: Pass `locale` parameter when creating checkout sessions.

### 4.11 Language Switcher Component

Add a language switcher to the Navbar:

```tsx
function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <select value={locale} onChange={(e) => router.replace(pathname, { locale: e.target.value })}>
      <option value="en">English</option>
      <option value="ja">日本語</option>
      <option value="es">Español</option>
    </select>
  );
}
```

---

## 5. Target Languages

### Recommended Initial Languages

| Language | Code | Rationale |
|----------|------|-----------|
| English | `en` | Current language, default |
| Japanese | `ja` | Largest non-English Pokemon TCG market, game originates in Japan |

### Future Expansion Candidates

| Language | Code | Rationale |
|----------|------|-----------|
| Spanish | `es` | Large Latin American Pokemon TCG community |
| Korean | `ko` | Growing competitive scene |
| German | `de` | Largest European market |
| Portuguese | `pt` | Strong Brazilian community |

---

## 6. Translation Workflow

### UI Strings

1. Developer adds/modifies English string in `messages/en.json`
2. Translation needed flag is set (or CI detects missing keys in other locale files)
3. Translator updates `messages/{locale}.json`
4. PR review includes translation review
5. Deploy

### Content (Deck Guides)

Three options, not mutually exclusive:

| Approach | Pros | Cons |
|----------|------|------|
| **Human translation** | Highest quality, understands TCG terminology | Expensive, slow |
| **AI-assisted + human review** | Fast first draft, lower cost | Needs TCG-knowledgeable reviewer |
| **Community contribution** | Free, community engagement | Quality control, consistency |

**Recommended**: AI-assisted translation with human review for initial languages, community contributions for expansion.

---

## 7. Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Route restructuring breaks existing URLs | SEO loss, broken bookmarks | Redirect middleware for old URLs, default locale has no prefix |
| Stale translations | Poor user experience | CI check for missing translation keys, fallback to English |
| Increased build time | Slower deployments | Locale × page matrix grows; monitor and optimize |
| Content drift | Translated guides out of date vs English | Track content versions per locale, show "translation outdated" banner |
| TCG terminology inconsistency | Confusing for players | Maintain a glossary per language |

---

## 8. Dependencies

- `next-intl` — Core i18n library
- `@clerk/localizations` — Clerk UI translations (already available as peer package)
- No other new runtime dependencies required
