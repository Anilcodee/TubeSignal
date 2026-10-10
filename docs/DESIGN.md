# TubeSignal — Design Document v2

> **Version:** 2.1 (implementation update) · **Updated:** October 10, 2026
> **Direction:** An instrument, not a poster. Quiet graphite surfaces, hairline structure, one signal-amber accent, and an AI verdict that leads every page.

---

## 0. Why v1 changes

The polished products you're benchmarking against (Linear, Stripe, Vercel, Posthog) don't look premium because of glow, glass, and gradients. They look premium because of **restraint**: few colors, consistent spacing, hairline borders, dense but calm typography, and data that is the hero. v1 (purple glassmorphism, gradient buttons, glowing shadows, hover-lift on every card) is what most hackathon dashboards look like, so it reads as generic.

| v1 element | v2 replacement | Reason |
|---|---|---|
| Purple→cyan gradient everywhere | One accent: signal amber, used only for "the thing that matters" | Color should carry meaning |
| Glassmorphism + `backdrop-filter` | Solid surfaces + 1px hairline borders | Cheaper to render, sharper, timeless |
| Glow shadows, mesh gradients, gradient shift | Removed. Shadows only on popovers | Decoration with no information |
| Every card lifts on hover | Only clickable rows/cards react | Motion should answer a click, not decorate |
| Uppercase tracked labels | Sentence-case labels | Cleaner, easier to read |
| 5 boxed "stat pills" | One KPI strip separated by hairlines | Reads as data, not widgets |
| Chart titles like "Views distribution" | Chart titles state the finding | Insight-first is what makes analytics feel smart |
| Carousel of video cards | Dense ranked table with thumbnails | Analysts scan tables; carousels hide data |
| Inter | Geist Sans + Geist Mono | Sharper numerals, distinct identity |
| Marketing "how it works" section | Already removed (D9). Stays removed | The product is the pitch |

---

## 1. Signature idea: the verdict

Every big analytics product has one moment people remember. Ours: **the dashboard opens with one sentence of AI judgment**, set large, before any chart. Charts below are the evidence for it.

> **MKBHD wins on polished 10–15 minute reviews, and his top 5 videos are all flagships.**
> Publishes ~2× a week, mostly Tuesday and Thursday. Shorter videos underperform the channel median by 38%.

This is the single place the UI is allowed to be big and expressive. Everything else stays quiet.

### 1.1 Implemented report workflow

The report is organized as four shareable evidence views rather than one uninterrupted wall of panels:

- **Overview** leads with `ReportPulse`: standout signal, repeatable lever, and next experiment.
- **Patterns** groups title, theme, duration, and publishing evidence.
- **Hook & Script** keeps transcript analysis progressive and adds the actionable “What to borrow” takeaway.
- **Videos** provides searchable, filterable upload evidence with lifetime and age-adjusted velocity labels.

The selected view is preserved in the URL as `?tab=overview|patterns|transcripts|uploads`, so a finding can be shared directly.

### 1.2 Comparison design

`/compare` uses visual rails for mean views, median views, median lifetime views/day, upload cadence, and average length. Each rail names the statistic and includes context where interpretation could be misunderstood. A separate **Content focus** section summarizes the largest observed theme, while **Opening style** is opt-in and loads transcript heuristics for up to three leading videos per creator.

Velocity is always framed as lifetime views divided by publishing age. It is not presented as recent growth.

---

## 2. Color

Dark only (decision D6 stands). Neutral graphite, not blue-black, so the amber accent reads clean.

```css
:root {
  /* Surfaces */
  --bg:          #0C0D0F;   /* canvas */
  --surface-1:   #131417;   /* panels */
  --surface-2:   #191B1F;   /* inputs, row hover, popovers */
  --surface-3:   #21242A;   /* pressed */

  /* Lines */
  --line:        #24262B;   /* default hairline */
  --line-strong: #33363D;   /* input borders, dividers that need presence */

  /* Text (all ≥ 4.5:1 on --surface-1) */
  --text:        #ECEDEF;
  --text-2:      #A0A4AD;
  --text-3:      #7E838D;

  /* Accent: signal amber. Use sparingly. */
  --accent:      #FFB224;
  --accent-ink:  #1A1200;                    /* text on amber */
  --accent-soft: rgba(255, 178, 36, 0.12);   /* selected row, chip bg */
  --accent-line: rgba(255, 178, 36, 0.40);   /* focus ring */

  /* Semantic */
  --positive:    #3DD68C;
  --negative:    #FF6B6B;

  /* Data series. Neutral first; color only where it means something. */
  --series-base: #666B77;   /* context (all other videos) */
  --series-1:    #FFB224;   /* highlight (top performers, current focus) */
  --series-2:    #5B9DFF;
  --series-3:    #3CCFB4;
  --series-4:    #FF7A90;
  --series-5:    #A58BFF;
}
```

**Usage rules**
- Amber appears in: primary button, focus ring, the highlighted series in charts, the verdict's key figure, and the selected state. Nowhere else.
- No gradients on surfaces, text, or buttons.
- Body text is `--text-2`; only headings, numbers, and the verdict use `--text`.

---

## 3. Typography

```
npm i geist
```
```tsx
// layout.tsx
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
// <html className={`${GeistSans.variable} ${GeistMono.variable}`}>
```
```css
:root {
  --font-sans: var(--font-geist-sans), -apple-system, 'Segoe UI', sans-serif;
  --font-mono: var(--font-geist-mono), 'SF Mono', Consolas, monospace;
}
body { font-family: var(--font-sans); font-feature-settings: 'tnum' 1, 'cv11' 1; }
```

| Role | Size / line-height | Weight | Tracking | Color |
|---|---|---|---|---|
| Verdict | 32 / 1.2 (26 on mobile) | 500 | -0.025em | `--text` |
| Page title (channel name) | 24 / 1.25 | 600 | -0.02em | `--text` |
| Panel title (the finding) | 15 / 1.4 | 600 | -0.005em | `--text` |
| Body | 14 / 1.6 | 400 | 0 | `--text-2` |
| KPI number | 28 / 1 | 500 | -0.02em | `--text` |
| Label / caption | 12 / 1.4 | 500 | 0 | `--text-3` |
| Handles, IDs, durations | 12 / 1.4 (mono) | 400 | 0 | `--text-2` |

- Two weights on a page (400, 500) plus 600 for titles. No 700/800.
- **Every number uses tabular figures** (`tnum`), so columns and KPIs align.
- Line length: body copy max `68ch`.
- Sentence case everywhere. No all-caps labels, no letter-spaced eyebrows.

---

## 4. Spacing, radius, elevation

```css
:root {
  /* 4px base: 4 8 12 16 24 32 48 64 96 */
  --s-1: .25rem; --s-2: .5rem; --s-3: .75rem; --s-4: 1rem;
  --s-6: 1.5rem; --s-8: 2rem; --s-12: 3rem; --s-16: 4rem; --s-24: 6rem;

  /* Only two radii */
  --r-control: 6px;   /* buttons, inputs, chips */
  --r-panel:   10px;  /* panels, popovers */

  --shadow-popover: 0 8px 24px rgba(0,0,0,.45), 0 0 0 1px var(--line-strong);
  --page-max: 1200px;
  --gutter: clamp(16px, 4vw, 32px);
}
```
No shadows on panels. Elevation is expressed by surface step (`--bg` → `--surface-1` → `--surface-2`) and borders.

---

## 5. Layout

### 5.1 Global frame (all pages)

```
┌──────────────────────────────────────────────────────────────────┐
│ ◈ TubeSignal        [ Search a creator…            ⌘K ]   Demo ◐ │  56px, sticky, 1px bottom line
├──────────────────────────────────────────────────────────────────┤
│                        content, max 1200px                       │
└──────────────────────────────────────────────────────────────────┘
```
- Search lives in the header on every page (it's a command bar, like Linear/Vercel). `⌘K` / `Ctrl K` focuses it.
- "Demo" is a small toggle switch, not a banner.
- No footer block. One line of credit at the bottom of the page in `--text-3`.

### 5.2 Home (workspace, per decision D9)

Left-aligned, not centered. Centered heroes are the template default.

```
Analyze any creator's channel.                       (40/1.1, 500, max 14ch per line)
Search a name or @handle. You get a strategy brief   (16, --text-2, max 52ch)
built from their latest uploads.

[ 🔍 Search a creator…                        Analyze ]  (56px, single primary action)

Recent and sample dossiers
┌────────────────────────────────────────────────────────────┐
│ (avatar) Marques Brownlee   @mkbhd   19.5M   Tech reviews  │  row, 64px, hairline dividers
│ (avatar) Fireship           @fireship 3.4M   Dev explainers│
│ (avatar) Veritasium         @veritasium 15M  Science       │
└────────────────────────────────────────────────────────────┘
```
Sample dossiers are **table rows, not marketing cards**. Click = open. These double as demo mode entry points.

### 5.3 Dashboard (the dossier)

```
Marques Brownlee  @mkbhd                        [Share] [Export]     ← title row
19.5M subscribers · 47 videos analyzed · updated 2 min ago

┌ VERDICT ─────────────────────────────────────────────────────────┐
│ MKBHD wins on polished 10–15 minute reviews…            (32px)   │
│ supporting sentence(s), max 68ch                                 │
│ [Gemini] Confidence: 47 videos                                   │
└──────────────────────────────────────────────────────────────────┘

 19.5M        3.2M          2.1×/week      11:42          ← KPI strip, one panel,
 Subscribers  Avg views     Upload rate    Median length    hairline dividers, sparkline each
 ▁▂▃▅▆        ▂▅▃▆▇         ▅▅▆▅▅          ▃▃▄▃▃

┌ Reviews drive 62% of views ──────┐ ┌ What to do next ────────────┐
│ [Themes: horizontal bars]        │ │ 1. Recommendation            │
│                                  │ │ 2. Recommendation            │
└──────────────────────────────────┘ │ … (5, each with the evidence)│
┌ Mid-length videos beat short ────┐ └──────────────────────────────┘
│ [Length vs views scatter]        │ ┌ Publishes Tue and Thu ──────┐
└──────────────────────────────────┘ │ [Weekday heat strip]         │
                                     └──────────────────────────────┘
┌ Top videos ──────────────────────────────────────────────────────┐
│ #  Thumb  Title                    Views     vs median   Length  │
│ 1  ▭▭▭   iPhone 16 Pro review     12.4M      +288%       14:32   │
└──────────────────────────────────────────────────────────────────┘
```

Grid: 12 columns, 24px gap. Verdict and KPI strip span 12. Below, a 7/5 split. The video table spans 12.

### 5.4 Breakpoints

| Width | Behavior |
|---|---|
| < 640 | Single column. KPI strip becomes 2×2. Video table becomes stacked rows (thumb left, title + meta right). Header search collapses to an icon. |
| 640–1024 | Single column of panels, 2-col KPI strip stays 4 across if it fits. |
| ≥ 1024 | 7/5 split as above. |

---

## 6. Components

### Button
- Height 36 (default) / 44 (mobile + hero). Radius `--r-control`.
- **Primary:** `--accent` bg, `--accent-ink` text, weight 500. Max one per view.
- **Secondary:** `--surface-2` bg, 1px `--line-strong`, `--text`.
- **Ghost:** transparent, `--text-2`, hover `--surface-2`.
- Hover: background step only (no lift, no glow). Active: `--surface-3`.

### Command bar (search)
- Height 40 in header, 56 in the home hero. `--surface-2` bg, 1px `--line-strong`.
- Focus: border `--accent`, plus `0 0 0 3px var(--accent-soft)`. This is the only "glow" in the product.
- Trailing `⌘K` kbd chip (`--surface-3`, mono 11px) hides on focus and on touch devices.
- Results open in a popover (`--shadow-popover`), max 6 rows, arrow-key navigation, Enter to select.

### Panel
- `--surface-1`, 1px `--line`, `--r-panel`, padding 20 (16 on mobile).
- Header: title (the finding) at 15/600, optional caption in `--text-3` beneath.
- Clickable panels only get `border-color: var(--line-strong)` on hover.

### Verdict block
- No card chrome. Sits directly on `--bg`, separated from the KPI strip by 32px.
- Left 2px amber rule (`border-left`) is the only decoration. It marks "AI output" and is the one place a structural device carries meaning.
- Key figure in the sentence gets `color: var(--accent)`.
- Footer line: `Generated by Gemini from 47 videos` in `--text-3` 12px. Honest provenance builds trust.

### KPI strip
- One `--surface-1` panel, four cells with 1px vertical dividers.
- Each cell: label (12, `--text-3`), value (28, `--text`, tnum), 48×16 sparkline in `--series-base` with the last point in amber. Optional delta chip: `+12%` in `--positive` with a ▲ glyph (never color alone).
- Count-up animation on first render only, 600ms, skipped for reduced motion.

### Video table row
- 72px row, hairline dividers, no zebra. Columns: rank (mono, `--text-3`), 16:9 thumb 96×54 at `--r-control`, title (14/500, 2-line clamp), views (tnum, right aligned), **vs median** (positive/negative with ▲▼), length (mono).
- Row hover `--surface-2`; the whole row is a link to YouTube with an `ExternalLink` icon revealed on hover/focus.
- Top-3 rows carry a small amber rank number. That's the entire "trophy" treatment.

### Chips / badges
- 22px tall, `--surface-2`, 1px `--line`, 12px text. Only the "Gemini" chip may use `--accent-soft`.

### Loading
Do **not** use a centered spinner card. Render the final dashboard layout as skeletons (real panel positions, shimmer at 1.6s linear, `--surface-1` → `--surface-2`). Above it, a single line of live status that updates with the pipeline: `Fetching channel… → Reading 47 videos… → Writing the brief…`, with the current step in `--text` and completed steps in `--text-3` with a ✓. No rotating tips, no progress percentage you can't measure.

### Empty, error
Plain text in a panel, one action each. Errors never apologize and say what to do.
- No results: `No channels match "xyz". Try the exact @handle.`
- Rate limited: `Live data is at its limit for now. Showing the saved MKBHD sample instead.` (demo fallback, per rules)
- Few videos: `Only 4 videos found, so trends may not be reliable.`

---

## 7. Charts (Chart.js)

**Principle:** grey by default, amber for the point. A bar chart where all bars are amber says nothing; one where the top 5 are amber and the rest grey tells the story.

| Panel | Type | Encoding |
|---|---|---|
| Views distribution | Bar (sorted by publish date) | `--series-base` bars, top 5 videos `--series-1`; dashed median line in `--text-3` labeled "median 2.1M" |
| Content themes | **Horizontal bars, not donut** | Sorted descending, ≤5 themes + "Other" grey; value labels at bar end. Donuts are hard to compare. |
| Publishing timeline | Weekday strip (7 cells) or line | Cell intensity from `--accent-soft` → `--accent`; label the peak day |
| Length vs views | Scatter | 6px `--series-base` points at 70% opacity, top performers amber; trend line dashed |

```ts
// lib/chart-theme.ts
import { Chart } from 'chart.js';
Chart.defaults.font.family = 'var(--font-geist-sans), sans-serif';
Chart.defaults.font.size = 12;
Chart.defaults.color = '#7E838D';
Chart.defaults.borderColor = '#24262B';
Chart.defaults.animation = { duration: 600, easing: 'easeOutQuart' };
Chart.defaults.plugins.legend.display = false;          // label directly instead
Chart.defaults.plugins.tooltip = {
  backgroundColor: '#191B1F', borderColor: '#33363D', borderWidth: 1,
  titleColor: '#ECEDEF', bodyColor: '#A0A4AD',
  padding: 10, cornerRadius: 6, displayColors: false,
};
// Axes: grid lines horizontal only, no axis border, no tick marks, 4–5 y ticks max.
```
- Number format: `1.2M`, `340K`; never raw `1234567`.
- Every chart has a visually hidden `<table>` alternative and an `aria-label` that states the finding.

---

## 8. Motion

Just **one** orchestrated moment, plus feedback motion.

1. **On dashboard load only:** the verdict fades in (opacity, 300ms), then the KPI strip, then the remaining panels in a single 60ms stagger. Nothing else animates on scroll.
2. Feedback motion (150ms): button/row background, focus ring, popover open, chart tooltip.
3. Remove: gradient shift, pulse glow, scale-on-hover, slide-in for results.

Animate only `opacity` and `transform`. All motion is disabled under `prefers-reduced-motion: reduce`.

---

## 9. Copy

- Sentence case. Plain verbs. No exclamation marks, no "Supercharge", "Unlock", "Insights at your fingertips".
- Buttons say the outcome: **Analyze**, **Export PDF**, **Copy link**. One action, one name across the flow (Analyze button → "Analyzing…" → toast "Analysis ready").
- Name things by what users see: "Strategy brief", "Top videos", "Upload rate", not "AI Engine 3".
- Panel titles state findings and are generated from data, e.g. `${topTheme} drives ${pct}% of views`.

---

## 10. Icons

Lucide, 16px inline, 1.5 stroke width (set `strokeWidth={1.5}`). No icons inside panel titles; icons only on buttons, rows, and inputs. Emoji are removed from the UI entirely.

---

## 11. Accessibility

- Contrast: all text ≥ 4.5:1 on its surface. `--text-3` is the floor and is used only for captions.
- Focus: `outline: 2px solid var(--accent); outline-offset: 2px` on every interactive element, never removed.
- Touch targets ≥ 44px on mobile.
- ▲▼ + sign accompany every color-coded delta.
- Charts: `aria-label` with the finding, plus a hidden data table.
- `prefers-reduced-motion` respected globally.

---

## 12. Brand

- **Wordmark:** "TubeSignal" in Geist 600, tracking -0.02em, 16px in the header.
- **Mark:** a 20px square with three ascending bars (signal-strength glyph), amber fill. Also the favicon.
- **OG image:** `--bg` background, wordmark left, the MKBHD verdict sentence large. Real content beats a tagline.
- `theme-color`: `#0C0D0F`.

---

## 13. Build order (about 3 hours, since the app is already built)

| # | Step | Time |
|---|---|---|
| 1 | Replace tokens in `globals.css` (section 2–4), install Geist, delete glass/glow/gradient utilities | 30 min |
| 2 | Restyle Header + command bar (sticky, `⌘K`), Button, Panel primitives | 30 min |
| 3 | Add Verdict block; move the AI summary sentence to the top of the dashboard | 25 min |
| 4 | KPI strip with sparklines; remove stat pills | 25 min |
| 5 | `chart-theme.ts`, re-color the four charts, swap donut for horizontal bars, insight titles | 35 min |
| 6 | Video table replaces the card carousel | 25 min |
| 7 | Skeleton-in-layout loading + single status line | 20 min |
| 8 | Motion cleanup, focus states, mobile pass at 375px | 20 min |

Ship in this order. Steps 1–3 alone change how the product looks more than everything else combined.
