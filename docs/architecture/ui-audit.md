# UI Audit & Improvement Plan

A usability-first review of the tcgmasterguide.com UI with concrete, file-level recommendations. Ordered by impact.

## Summary of the current state

Strengths: coherent violet/purple brand palette, good typography base (Lexend, 17px), dark-mode parity, generous spacing, thoughtful hero animation on the homepage, and a clean sticky navbar with backdrop blur.

Weaknesses cluster around three themes:
1. **Feedback & loading states** — async/image content pops in without skeletons.
2. **Visual hierarchy** — section dividers and headers are text-only; it is hard to scan long pages.
3. **Form & interaction polish** — comment form, subscribe CTA, and mobile menu lack the micro-details users subconsciously read as "professional".

The redesign goal is not to change the aesthetic — it is already tasteful — but to tighten hierarchy, reduce decorative noise, and add the small cues (skeletons, relative time, hover lift, progress bars) that separate a hobby site from a product.

---

## High-impact recommendations

### 1. Homepage — reduce decoration, increase scanability
File: `src/app/[locale]/page.tsx`

- **Hero divider (lines 203–208)**: the three-dot-and-line flourish under the subtitle adds visual noise without guidance. Replace with a single primary CTA button that scrolls to `#decks` ("Browse decks") plus a secondary ghost link ("About Grant"). This gives the hero a job.
- **Format headers (line 234)**: currently a bare `h3`. Give each format a left-side accent — e.g., a 4px violet bar, a rotation icon, and a small count badge ("7 decks"). This makes the page skimmable.
- **Tier pills (line 243)**: keep the color tokens but add a small icon per tier (crown / star / shield) and align with the divider line at equal optical weight. Today the pill feels heavier than the line beside it.
- **Empty state**: if a tier has zero decks, today nothing renders. Add a muted card ("No Tier 3 decks for this format yet") so the page never collapses unexpectedly after a content edit.
- **Deck card (line 111)**: the overall shape is good. Three upgrades:
  - Add `hover:-translate-y-0.5 hover:shadow-lg` for a tactile hover.
  - Reserve sprite space with a fixed-width flex container + skeleton shimmer so cards do not reflow as sprites load.
  - Move the "last edited" line into a small footer row with an icon, and left-align with the title for better rhythm.
- **LiveBanner placement (line 261)**: currently buried at the bottom of the deck list. If it represents a live stream, it is the highest-priority content when active — render it above the deck grid when `isLive`, and hide entirely when offline rather than showing an offline banner.

### 2. Deck detail page — add structure the reader can navigate
Files: `src/components/DeckContent.tsx`, `src/components/MarkdownRenderer.tsx`, `src/components/DeckList.tsx`

- **Sticky table of contents** on `lg:` and up, generated from the h2/h3 IDs the markdown renderer already emits. Highlight the active section with an IntersectionObserver. Long guides are unreadable without this.
- **Prose typography**: wrap markdown output in a Tailwind `prose` container (`prose prose-stone dark:prose-invert`) and tune heading scale. Today list items and body are the same weight/size, which flattens hierarchy.
- **Reading progress bar** at the top of the article (a 2px violet bar that fills as the user scrolls). Cheap to add, big perceived-quality win.
- **Loading state**: show a skeleton article (title bar + 6 paragraph bars + list) while content fetches, so the page never blanks.
- **Deck list component**: the copy button should show a transient "Copied!" confirmation (swap icon to check for 1.5s). The list header could use a subtle card chrome (border, background) to separate it from surrounding prose.
- **Locked sections**: make the gate aspirational, not apologetic. A short bullet list of what is behind the gate, then a single primary CTA — no secondary "maybe later" link.

### 3. Comments — form polish and signal strength
File: `src/components/Comments.tsx`

- **Composer**: replace the text-only character counter with a thin progress bar below the textarea that turns amber near the limit and red past it. Keep the numeric counter as a label.
- **Primary action**: the "Post" button should be a filled violet button with a loading spinner when submitting; disable while the textarea is empty instead of letting users click and see an error.
- **Relative timestamps**: render `formatDistanceToNow(date)` ("2 hours ago") with the absolute date in a `title` tooltip. Absolute dates on every comment make the thread feel stale.
- **Reply affordance**: the reply button should be visible on every comment, not only on hover. Hidden controls perform poorly on touch devices.
- **Threaded indentation**: cap visual nesting at 2–3 levels and switch to a "Replying to @user" label after that; infinite indentation breaks on mobile.
- **Subscriber gate**: today a plain message. Give it the same treatment as the locked deck section — icon, two bullets on what subscribers get, one CTA.
- **Pagination**: replace text links with a proper pager (prev / page numbers / next) with disabled states.

### 4. Subscribe page — show the offer
File: `src/app/[locale]/subscribe/page.tsx`

- **Feature comparison table**: two columns (Free vs. Subscriber), 5–7 rows, green check vs. gray dash. This is the single highest-converting element on a subscription page and it is currently absent.
- **Trust strip**: a single row under the hero with Grant's credentials ("Former World #1", years of coverage, deck count). Social proof belongs above the fold.
- **Pricing card**: elevate with a subtle violet border, a "Most popular" ribbon if there is only one tier (still works — it signals confidence), and the price in a larger size than the surrounding body.
- **Error UX**: replace generic "Something went wrong" with typed errors (network / payment declined / already subscribed) and a retry button that does not require a full page reload.
- **Post-subscribe confirmation**: ensure there is a success page with a clear "what now" (link to latest premium deck, link to Discord/Q&A) instead of just showing a manage button.

### 5. Navbar — small polish, high visibility
File: `src/components/Navbar.tsx`

- **Sign-in button on mobile**: bump to `text-base` and give it the filled violet treatment so it reads as the primary action. Today it is visually weaker than the hamburger.
- **Active route indicator**: replace the rounded background with a 2px underline that animates on hover/active — cleaner against the blurred backdrop.
- **Mobile menu**: add a top/bottom gradient fade inside the scroll container so users can tell when the menu is scrollable. Add a full-height backdrop that closes on tap-outside.
- **Admin link**: gate visibility behind a role check (which you already do) but also style it differently (outlined, slate color) so it is clearly a staff tool, not a user feature.
- **Theme toggle**: animate the sun/moon swap (rotate + fade). Currently instant swaps feel jumpy.

### 6. Footer — one-line upgrades
File: `src/components/Footer.tsx`

- Add a "Last updated: <date>" line sourced from the most recent deck's `deckDates` entry — signals that the site is actively maintained.
- Make the locale switcher a labeled dropdown ("Language: English ▾") rather than a bare set of codes.
- Move social icons into a single row with `aria-label`s and a visible focus ring.

---

## Cross-cutting system improvements

### Design tokens — `tailwind.config.js`
Add a small set of shared tokens so components stop reinventing the same values:

- `boxShadow.card` / `boxShadow.cardHover` — unify the hover lift across DeckCard, LiveBanner, comment cards.
- `ringColor.focus` — a single violet focus ring used everywhere (currently gray-500).
- `transitionTimingFunction.snappy` — `cubic-bezier(0.22, 1, 0.36, 1)` for interactive feedback.
- A `container` utility with the `max-w-4xl mx-auto px-4 sm:px-6 lg:px-8` pattern that appears in every page body.

### Component additions (`src/components/ui/`)
Currently there is no primitive layer; every component inlines Tailwind. Introduce a tiny primitives folder — not a full UI kit, just:

- `Button` (variants: primary, secondary, ghost, link; loading state; icon slot).
- `Card` (padding + border + hover lift baked in).
- `Skeleton` (shimmer animation already exists in `globals.css`).
- `Badge` (tier + format + "new" variants).
- `EmptyState` (icon + title + description + optional CTA).

Once these exist, DeckCard, LockedDeckContent, AnnouncementBanner, and the subscribe pricing card all shrink by 30–50% and gain consistency.

### Loading & skeleton strategy
Every data-driven page should ship a `loading.tsx` at the route level (Next.js App Router feature). The skeleton should match the final layout's shape — reserved space prevents CLS and makes the site feel instant.

### Accessibility pass
- Confirm every interactive element has a visible focus ring (currently the custom `focus-ring` in `globals.css` uses gray — switch to violet for brand consistency and higher contrast).
- Every icon-only button needs an `aria-label` (copy button, theme toggle, social links, mobile menu toggle).
- Check color contrast on `tierColors[3]` orange-on-orange in dark mode — it may fall below 4.5:1.
- Respect `prefers-reduced-motion` for the gradient shift, float, and bouncing sprite animations.

### Typography scale
The 17px base is good. Introduce a consistent scale — `text-display` (48/52), `text-h1` (32/40), `text-h2` (24/32), `text-h3` (20/28), `text-body` (17/28), `text-meta` (13/20). Use these instead of ad-hoc `text-5xl md:text-6xl` blocks.

---

## Sequenced rollout

A reasonable order that delivers visible wins quickly and avoids churn:

1. **Foundations (half-day)**: add `ui/` primitives (Button, Card, Skeleton, Badge, EmptyState), extend tailwind tokens, add `prefers-reduced-motion` guards.
2. **Homepage pass (half-day)**: rework hero CTA, format headers, empty state, deck card hover + sprite skeleton, LiveBanner placement.
3. **Deck detail (1 day)**: prose typography, sticky TOC, reading progress bar, loading.tsx skeletons, copy-confirmation, locked-section rewrite.
4. **Comments (half-day)**: relative timestamps, progress bar counter, visible reply CTAs, subscriber gate rewrite, pager.
5. **Subscribe (half-day)**: feature comparison table, trust strip, pricing card treatment, typed error states.
6. **Navbar + footer polish (2–3 hours)**: mobile sign-in button, underline active state, animated theme toggle, locale dropdown, last-updated line.
7. **Accessibility sweep (2–3 hours)**: focus rings, aria-labels, contrast fixes.

Each step is independently shippable, so the site improves continuously rather than behind a single big PR.
