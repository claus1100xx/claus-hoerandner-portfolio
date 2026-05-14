# Handoff: Claus Hoerandner — Personal Portfolio Site

## Overview

A single-page personal portfolio for **Claus Hoerandner**, Finance Transformation Lead at Zurich North America. The audience is recruiters and hiring managers at Fortune 500 insurers / financial services firms. The design is intentionally institutional — a "Bloomberg-meets-Swiss-bank" aesthetic with a ticker bar, mono data rows, sharp grid, and a single Zurich-blue accent against off-white.

The site is bilingual (English / German) with a runtime EN/DE toggle that re-renders all `data-i18n` strings.

---

## About the Design Files

**The files in this bundle are design references created in HTML** — a fully-styled prototype showing the intended look, layout, copy, and behavior. They are **not production code to ship as-is**.

Your task is to **recreate this design in the target codebase's existing environment** (React, Next.js, Vue, etc.), using that codebase's established patterns, component library, routing, and i18n stack. If no codebase exists yet, pick the most appropriate framework — for a content-heavy single-page personal site I'd recommend **Next.js (App Router) with static export**, but Astro or plain Vite + React are equally valid.

The HTML/CSS/JS provided here is canonical — colors, typography, spacing, breakpoints, copy, and interaction logic should all be lifted faithfully. The structure (semantic regions, section ordering) should be preserved. The implementation language is the developer's choice.

---

## Fidelity

**High-fidelity.** Final colors, typography (Syne display + Inter body + JetBrains Mono labels), exact spacing, hover/active states, animations, and copy are all set. Recreate pixel-perfectly using your codebase's component primitives.

---

## Page Structure (top → bottom)

The page is one continuous scroll, in this order. Each `<section>` has a numeric label rendered as eyebrow text (`data-i18n="exp-num"` etc) — these are **decorative labels**, not visible numbering anymore (the section-number column was removed in the final pass; numbers live as eyebrow context only).

| # | Section | Anchor | Background |
|---|---------|--------|-----------|
| — | Ticker bar | — | `--ink` (#0a0a0a) |
| — | Sticky nav | `#nav` | `--surface` (#fcfcfa) |
| 1 | Hero | `#hero` | `--bg` (#f4f1ec) |
| 2 | About | `#about` | `--surface` |
| — | Companies strip | — | `--bg` |
| 3 | Experience | `#experience` | `--bg-alt` (#eeeae3) |
| 4 | Capabilities (skills) | `#skills` | `--surface` |
| 5 | Highlights (achievements) | `#achievements` | `--bg-alt` |
| 6 | Speaking (featured talk) | `#talk` | `--blue-deep` (#000068) — dark feature treatment |
| 7 | Record (performance reviews) | `#reviews` | `--bg-alt` |
| 8 | Credentials (education) | `#education` | `--surface` |
| 9 | Community | `#community` | `--bg-alt` |
| 10 | Contact | `#contact` | `--bg` |
| — | Footer | `#footer` | `--ink` |

---

## Design Tokens

All tokens are defined as CSS custom properties at `:root` in `styles.css`. A non-exhaustive list:

### Colors
```css
--ink:        #0a0a0a;   /* primary text, footer bg */
--ink-2:      #1a1a1a;   /* secondary dark */
--bg:         #f4f1ec;   /* warm off-white page background */
--bg-alt:     #eeeae3;   /* alternating section bg */
--surface:    #fcfcfa;   /* card / surface bg */
--line:       #d8d2c8;   /* hairline dividers */
--line-2:     #c4bdb0;   /* stronger dividers */
--muted:      #4a4640;   /* body muted */
--muted-2:    #7a7468;   /* labels muted */

--blue-deep:  #000068;   /* Zurich brand navy — primary accent */
--blue-mid:   #4066b3;   /* Zurich brand mid-blue — hover/secondary */
--blue-light: #e8edf6;   /* tint for hover backgrounds */

--up:         #0d8b4a;   /* "positive" green for ticker up arrows */
```

### Typography
```css
--font-display: "Syne", "Helvetica Neue", Arial, sans-serif;
                /* uppercase headings, hero name; weights 700–800 */
--font-sans:    "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
                /* body copy; weights 400/500/600 */
--font-mono:    "JetBrains Mono", "SF Mono", Menlo, monospace;
                /* labels, ticker, data rows, nav */
```

Google Fonts loaded via `@import` in `styles.css` head. Move to `<link>` preconnect or `next/font` in production.

**Type scale (rough):**
- Hero name: `clamp(3rem, 8vw, 5.5rem)` — Syne 800, letter-spacing -0.04em, line-height 0.92
- Section title: `clamp(1.75rem, 3vw, 2.4rem)` — Syne 700, uppercase, letter-spacing -0.02em
- Body copy: 1rem (16px) — Inter 400, line-height 1.7
- Mono labels: 0.62–0.7rem — JetBrains Mono, uppercase, letter-spacing 0.06–0.14em

### Spacing
```css
--shell-max:  1280px;     /* max content width */
--shell-pad:  clamp(1.25rem, 4vw, 2.5rem);
--section-y:  clamp(4rem, 8vw, 6.5rem);
```

### Borders & shadows
- Almost no border-radius — design is **sharp-cornered** throughout. Cards, buttons, pills are all `border-radius: 0`. Exception: portrait-tag and one dot.
- Hairline dividers (`1px solid var(--line)`) are the primary spatial device — heavier than typical "card" treatments.
- One soft shadow on the hero portrait: `0 18px 40px -16px rgba(0, 0, 104, 0.32)` (the navy shadow is intentional — gives the photo a quiet brand tint).

### Easing
```css
--ease: cubic-bezier(0.22, 1, 0.36, 1);
```

---

## Components & Sections — Detail

### 1. Ticker bar
- Full-width strip, `var(--ink)` background, white text
- Single horizontal row of `Label / Value` pairs (Role, Employer, Experience, Trained, Automations, Hours saved, Languages, Status)
- Up arrows / green dots use `--up` (#0d8b4a)
- `overflow: hidden` so it crops on narrow screens — does not actually animate/scroll in this build, but the markup is ready for a marquee animation if desired
- Mono, 0.7rem, letter-spacing 0.08em

### 2. Sticky nav
- Position `sticky; top: 0; z-index: 50`
- Height: 48px, `--surface` background with `--line` bottom border
- Layout: brand left, links center (flex: 1 with vertical dividers between each), right cluster (lang toggle + hamburger)
- All link cells: 0.7rem JetBrains Mono, weight 600, letter-spacing 0.08em, uppercase — **identical sizing to brand**
- Active/hover state: text turns `--blue-deep`, background `--blue-light`
- Hamburger appears below 960px viewport
- IntersectionObserver in `main.js` adds `.active` to nav items as their section enters viewport

### 3. Hero
Two-column grid (50/50 with thin divider between):

**Left column (`.hero__main`):**
- Eyebrow chip: "Finance Transformation Lead · Zurich North America" — small mono text with a small blue dot
- Massive h1: "Claus / Hoerandner" — Syne 800, line-break between first/last name
- Data rows: 5 rows of `Label / Value` (Location, Employer, Credentials, Languages, Focus) — mono labels, sans values, dotted-line separators
- Lede paragraph
- Three CTAs: primary (Download résumé, navy filled), two ghosts (LinkedIn, Get in touch)

**Right column (`.hero__sidebar`):**
- Portrait fills top — 340px min-height — with a 3px Zurich-blue gradient bar across the top, a subtle radial vignette, and a small mono "CHI · 2026" tag in the top-left corner. Photo gets `filter: contrast(1.08) brightness(1.02) saturate(1.05)` — enriched, not desaturated.
- KPI grid below the portrait: 2×2 grid of (number, label) — 20+ years / 500+ trained / 50+ automations / 2k+ hours

Below 900px the columns stack and the divider hides.

### 4. About
- 3-column layout: prose / vertical hairline / "At a glance" sidebar dl
- Sidebar dl is mono labels, sans values
- One italic phrase in the section title (`<em>and a practical taste for change.</em>`)

### 5. Companies strip
- 5-column grid of logo tiles (Zurich, Farmers, Lincoln, Movado, Lake Forest College)
- Logos are `filter: grayscale(100%) opacity(0.6)` — go to full color/opacity on tile hover
- Date range (e.g. "2005 – Present") in mono below logo

### 6. Experience
- Timeline list. Each item is a 130px-date / 1fr-body grid row, with hairline borders between
- Date column: mono, 0.82rem, two lines (start / end), right-bordered with `--line`
- Body: role title (Syne 700), company line, tag pills, and bullet list
- "Earlier career" divider is **clickable to expand/collapse** — uses `aria-expanded`, height-animated panel, "+ Show / − Hide" toggle indicator on the right
- Toggle JS lives in the inline script at the bottom of `index.html`

### 7. Capabilities (Skills)
- 4-column grid of categories: Analytics & Reporting / Automation & AI / Finance & Accounting / Credentials & Languages
- Each category has a header with a 10px Zurich-blue square marker, uppercase Syne 800, 2px navy underline
- Pills: tag-style, sharp corners, small. Variants:
  - default: hairline outline, sans
  - `.pill--accent`: navy background, white text — for primary skills (Power BI, IFRS 17, Copilot, etc.)
  - `.pill--ink`: black background, white text — for credentials (CPCU, AIAF, Blue Prism)

### 8. Highlights (Achievements)
- 3×2 card grid
- Each card: title + description, hairline border. **No numeric labels** (H/01 etc were removed in the final pass)
- Hover: background tints to `--blue-light`

### 9. Speaking (Talk) — featured dark section
- Background flips to `--blue-deep` (#000068)
- All text inverts to white / rgba(255,255,255,*)
- Iframe embed of a Wistia video (Alteryx customer panel)
- Two-column: video left, content right (eyebrow / title / description / tags / "Watch on Alteryx ↗" link)
- This is the only dark mid-page section — gives the page rhythm

### 10. Record (Reviews)
- List of 7 yearly reviews (2019 → 2025)
- Each row: 6rem year column / 1fr body / "Full review" PDF link
- Year is Syne 800, 1.85rem, with a small "Latest" tag below 2025
- Body has a blockquote and a bulleted highlight list

### 11. Credentials (Education)
- 4-card grid
- Each card has a 56×56 logo box on the left and metadata stack on the right
- Lake Forest, Institutes (×2 — for CPCU and AIAF), and a custom Six Sigma SVG badge (black with green belt stripe, mono "6σ" + "GREEN BELT")

### 12. Community
- 2-card grid: DANK Haus board service + FAR Social Committee
- Same icon-on-left card pattern as Credentials
- Both cards use Zurich logo / DANK Haus logo

### 13. Contact
- 2-column: lede left / 4 contact cards stacked right
- Cards: Email (mailto:claus.hoerandner@gmail.com), LinkedIn, Location, Résumé download
- Each card is a horizontal row with mono label / sans value / arrow on right

### 14. Footer
- `--ink` background, white-ish text
- Name, role line, copyright, "↑ Back to top" link
- All on one row at desktop, stacks below 768px

---

## Interactions & Behavior

| Interaction | Implementation |
|---|---|
| **Reveal on scroll** | `.reveal` class + IntersectionObserver in `main.js`. Fades + 12px translate-up. Honors `prefers-reduced-motion`. |
| **Active nav highlighting** | IntersectionObserver tracks each `<section>`; the link matching the most-visible section gets `.active`. |
| **EN/DE language toggle** | `langToggle` button cycles `en`/`de` and `i18n.js` re-renders all `[data-i18n]` and `[data-i18n-html]` nodes. Persists to `localStorage` under `lang`. |
| **Hamburger menu** | Below 960px, the `.nav__menu-btn` toggles `.nav--open` on the nav element which expands the link list as a vertical drawer. |
| **KPI count-up** | Optional — currently the hero KPIs render as static text; the `data-target` and `data-suffix` attributes are present so a count-up animation can be added. |
| **"Earlier career" toggle** | Inline script at end of `index.html`. Clicking the divider toggles `aria-expanded`, animates `max-height` from 0 to `scrollHeight`, swaps "+ Show" / "− Hide" label. Keyboard accessible (Enter / Space). |
| **Smooth scroll** | Native `scroll-behavior: smooth` on `html` element. |

### Animations
- Reveal: `opacity 0 → 1`, `translateY(12px) → 0`, 600ms `var(--ease)`, with optional per-element delay via `--delay` custom property.
- Tag/pill hover: 150ms color transition.
- Earlier-career expand: 450ms `max-height` transition with `var(--ease)`.
- All hover transitions: 150ms.

---

## Responsive Behavior

| Breakpoint | What changes |
|---|---|
| ≤ 960px | Nav links collapse to hamburger drawer; lang toggle stays inline |
| ≤ 900px | Hero grid stacks (content above portrait); `.hero__divider` hides |
| ≤ 768px | Experience date column collapses; skills / achievements / community grids → 1 col; reviews row stacks year over body; footer wraps |
| ≤ 560px | Hero name shrinks further; ticker scales down; about / contact stack to 1 col |
| ≤ 480px | Tag pills wrap, padding reduces, KPI grid stays 2-col but tighter |

`overflow-x: hidden` on `body` prevents any accidental horizontal scroll. Test at iPhone SE (375px), iPhone 14 (390px), iPad (768px), and 1440px / 1920px desktop.

---

## i18n

All translatable strings have a `data-i18n="<key>"` attribute. HTML-bearing strings (italics, line breaks, `<em>`) use `data-i18n-html="<key>"` so the i18n loader sets `innerHTML` instead of `textContent`. The full dictionary is in **`i18n.js`** as `const I18N = { en: {...}, de: {...} }`.

In your target codebase, port this to your i18n stack:
- Next.js / React → `next-intl`, `react-i18next`, or static JSON loaded by `i18n` package
- Vue → `vue-i18n`
- Astro → `astro:i18n` or any static dictionary
- Translation strings can be lifted verbatim from `i18n.js` — both EN and DE have already been written.

Persist the user's choice to localStorage (`lang` key). Default to `en`.

---

## Assets

All assets are **provided in this folder**:

| Asset | Used by |
|---|---|
| `Headshot2.jpg` | Hero portrait |
| `logos/Work_Experience_image1.jpeg` | Zurich logo (Companies strip, FAR community card) |
| `logos/Work_Experience_image2.jpeg` | Farmers Insurance logo |
| `logos/Work_Experience_image3.jpeg` | Lincoln Financial logo |
| `logos/Work_Experience_image4.jpeg` | Movado Group logo |
| `logos/Work_Experience_image5.jpeg` | Lake Forest College logo (also Credentials card) |
| `logos/Certifications_image1.jpeg` | The Institutes logo (CPCU + AIAF cards) |
| `logos/Board_member_image1.jpeg` | DANK Haus logo (Community card) |
| `CLAUS HOERANDNER 1 page.docx` | Résumé download (linked from hero + contact) |
| `MyPerformance2019…2025_*.pdf` | Linked from each Reviews row |
| Six Sigma badge | **Inline SVG** in index.html (no asset file) — black background, green belt stripe at the bottom, mono 6σ + GREEN BELT text |

In production, optimize the JPGs to WebP/AVIF and consider an `<picture>` element with appropriate `sizes`. The portrait is the only `fetchpriority="high"` image.

---

## State Management

This site is mostly stateless. Two pieces of persisted UI state:

1. **Language** — `localStorage.lang` ∈ `{'en','de'}`
2. **Earlier career toggle** — ephemeral; not persisted

No data fetching. The video is an iframe embed (Wistia). PDFs and résumé are linked directly.

---

## Files in this Bundle

| File | Purpose |
|---|---|
| `index.html` | Main HTML structure — all sections, all i18n attributes, inline toggle script |
| `styles.css` | All styles, custom properties, breakpoints |
| `main.js` | IntersectionObserver for reveals + active-nav, hamburger toggle, lang toggle wiring |
| `i18n.js` | Full EN/DE translation dictionary (450+ keys) |
| `Headshot2.jpg` | Hero portrait |
| `logos/` | All company / institution logos |
| `CLAUS HOERANDNER 1 page.docx` | Résumé file |
| `MyPerformance*.pdf` | 7 years of performance review PDFs |
| `index-v1.html` | **Earlier institutional version** — included as reference for an alternative aesthetic (lighter weight, no ticker, no dark talk section). Probably not needed for implementation but kept for context. |

---

## Recommended Implementation Approach

For a Next.js (App Router) implementation:

1. Move design tokens to `app/globals.css` as CSS custom properties (or to a Tailwind config if Tailwind is in use).
2. Load Syne / Inter / JetBrains Mono via `next/font/google` to avoid layout shift.
3. Build each section as a server component under `app/(home)/_components/<Section>.tsx`.
4. Convert the i18n dictionary to `next-intl` messages JSON (`messages/en.json`, `messages/de.json`).
5. The earlier-career toggle and hamburger become client components (`'use client'`).
6. Optimize images via `next/image` with explicit dimensions; convert JPGs to WebP at build time.
7. Performance reviews + résumé go in `public/` and are linked directly.
8. Wistia iframe stays as-is in the Talk section.
9. Build static (`output: 'export'`) and host on Netlify/Vercel — no SSR needed.

**Accessibility:**
- All interactive elements have proper `aria-*` attributes (toggle uses `aria-expanded` + `aria-controls`, lang button has `aria-label`).
- Color contrast meets WCAG AA against both light and dark backgrounds.
- `prefers-reduced-motion` is honored — reveals fall back to static.
- All icons are decorative (`aria-hidden`) and all images have alt text.

**Performance budget:**
- Total page weight should stay under ~600KB excluding the Wistia iframe.
- Avoid blocking fonts — use `font-display: swap`.
- The portrait is the LCP element; preload it.
