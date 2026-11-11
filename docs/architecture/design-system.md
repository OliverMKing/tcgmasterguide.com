# Design System: Playmat

This document describes the visual design of TCG Master Guide. Read it before you change any user interface (UI) code.

## Concept

The site uses objects from a real Pokémon TCG table.

- The page is the table. It is a quiet, light lilac-gray in light mode and a deep violet in dark mode.
- The tier list on the home page is a **playmat**. The playmat is deep purple in both themes, as a real mat is.
- Each deck is a **trading card** with a silver border, a name bar, an art window, and a footer.
- **Holo foil** makes a card look like a premium collectible. All deck cards and the membership card use foil. Do not put foil on other elements.
- The foil metal shows the tier, as foil types show rarity on real cards. Tier 1 is gold, Tier 2 is silver, Tier 3 is copper, and Tier 4 is lavender. Each tier shines equally. Only the color changes. Add the class `foil-tier-1` to `foil-tier-4` next to `.holo`, or pass `tier` to `DeckCard`. The membership card has no tier class, so it uses the rainbow foil.

Use one bold element on a page. Keep everything around it quiet. The playmat is the bold element on the home page. On other pages, the bold element is usually one card or one heading.

## Color tokens

All colors come from CSS variables in `src/styles/globals.css`. Tailwind exposes them as utilities, for example `bg-page`, `text-ink-2`, and `border-line`. The variables change with the theme. Thus, do not use `dark:` variants for these tokens.

| Token | Use |
|-------|-----|
| `page` | Page background (the table) |
| `surface`, `surface-2` | Panels on the page, and hover or inset fills |
| `ink`, `ink-2`, `ink-3` | Primary, secondary, and tertiary text |
| `line`, `line-strong` | Hairlines, and borders on inputs and secondary buttons |
| `accent`, `accent-hover`, `accent-ink` | Primary buttons (accent fill with accent-ink text) |
| `accent-soft`, `accent-text` | Soft accent fill, and accent text and links on the page |
| `mat`, `mat-2`, `mat-line`, `mat-ink`, `mat-ink-2` | Playmat surfaces, printed zone lines, and text on the mat |
| `card`, `card-edge`, `card-art`, `card-ink`, `card-ink-2` | Trading card faces |
| `tier-1` to `tier-4` | Tier metals: gold, silver, bronze, and lavender. Use them only on `mat` backgrounds. |
| `ok`, `warn`, `bad` (and `-soft`) | Status text and status fills |

The accent is the pink of the Master Ball domes. Do not use the old violet and purple Tailwind palettes (`violet-*`, `purple-*`, `slate-*`, `stone-*`, `neutral-*`). Do not use gradient text. Do not use decorative gradient washes or blurred color orbs.

## Type

The site uses two typefaces.

- **Big Shoulders** (`font-display`) is for headlines, tier labels, card names, and large numbers. It is a condensed face from athletic signage. Use weight 800 (`font-extrabold`) or 900 (`font-black`). Set large headlines tight: `leading-[0.85]` to `leading-none`.
- **Atkinson Hyperlegible Next** (`font-sans`, the default) is for body text and all UI. It is easy to read in long guides.

Use this type scale: 14, 16, 17 (body), 18 (guide text), 20, 24, 30, 36, 48, 60, and 72 to 116 pixels (hero only).

Obey these rules:

- Do not use all caps for labels. Use sentence case.
- Do not put small "eyebrow" labels above headings.
- Do not use a monospace face for metadata. Use `font-mono` only for real code or decklist text.
- Do not color or italicize one word in a headline.
- Do not join metadata with middle dots. Use separate elements, or write a sentence.
- Do not add `→` to link or button text.
- Keep body text lines shorter than about 70 characters (`max-w-[68ch]` or less).

## Shape and depth

| Element | Radius |
|---------|--------|
| Trading card | 12px (`.tcg-card`) |
| Button, input | 10px (`rounded-[10px]`) |
| Panel on the page | 16px (`rounded-2xl`) |
| Playmat | 28px |
| Printed zone on the mat | 20px (`.mat-zone`) |
| Chip, badge | Full |

Panels are flat: `bg-surface border border-line`. Do not add soft gray shadows to panels. Only trading cards have a shadow, because they are physical objects.

## Components and classes

| Name | Location | Use |
|------|----------|-----|
| `.playmat` | `globals.css` | A purple mat with grain and printed light. Set your own radius and padding. |
| `.mat-zone`, `.mat-slot` | `globals.css` | A printed zone outline, and an empty card spot |
| `.tcg-card`, `.tcg-card-face`, `.tcg-card-art` | `globals.css` | Trading card frame, face, and art window |
| `.holo` and `useHolo()` | `globals.css`, `src/hooks/useHolo.ts` | Foil and tilt that follow the pointer |
| `.guide-prose` | `globals.css` | Long-form guide text: 18px, 1.7 line height |
| `.sprite` | `globals.css` | Keeps pixel sprites sharp when they are scaled |
| `DeckCard` | `src/components/DeckCard.tsx` | A deck as a trading card |
| `LogoMark` | `src/components/Logo.tsx` | The brand mark: two fanned cards |
| `Button`, `Badge`, `Card`, `Skeleton`, `EmptyState` | `src/components/ui` | Basic UI parts |
| `TierBadge` | `src/components/TierBadge.tsx` | A dark chip in the tier metal color |

Put new component classes in `globals.css` inside `@layer components`. Tailwind utilities are in a later layer. Thus, a utility such as `absolute` on an element overrides the `position` of a component class.

## Layout

- Align content to the left. Center only short, single-purpose screens, such as the 404 page.
- Use `max-w-6xl` for wide pages and the navigation bar. Use a reading column of about `68ch` for guides and posts.
- Use `px-4 sm:px-6 lg:px-8` for page gutters.
- Make every page work at 360 pixels wide, with no horizontal scroll.

## Motion

- The home page has one load animation: the hero hand of cards deals in (`.deal`). Do not add other load animations or scroll-reveal effects.
- Use motion only as a response to an action: hover, open, expand, or confirm.
- `globals.css` turns off animation when the user asks for reduced motion. Do not override this.

## Writing

- Use plain verbs and sentence case.
- A button label tells what the button does, for example "Copy decklist", not "Submit".
- An error message tells what went wrong and how to fix it.
- An empty state tells the reader what to do next.
