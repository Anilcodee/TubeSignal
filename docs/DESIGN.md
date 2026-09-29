# 🎨 TubeSignal — Design Document

> **Version:** 1.0  
> **Last Updated:** September 29, 2026  
> **Design Philosophy:** Premium dark-mode SaaS aesthetic with glassmorphism and vibrant accents  

---

## 1. Design Philosophy

TubeSignal should feel like a **premium analytics tool** — think Linear, Raycast, or Vercel's dashboard. Not a hackathon project. The design must:

1. **Impress at first glance** — dark mode with glowing accents
2. **Communicate trust** — clean data visualization, professional typography
3. **Feel alive** — micro-animations, smooth transitions, interactive charts
4. **Be instantly usable** — no onboarding needed, one search bar, clear results

---

## 2. Color System

### 2.1 Core Palette

```css
:root {
  /* ═══════════════════════════════════════════ */
  /* BACKGROUND LAYERS (darkest → lightest)      */
  /* ═══════════════════════════════════════════ */
  --color-bg-primary:     #0a0a0f;        /* Page background */
  --color-bg-secondary:   #12121a;        /* Card backgrounds */
  --color-bg-tertiary:    #1a1a28;        /* Elevated surfaces */
  --color-bg-hover:       #222236;        /* Hover states */
  --color-bg-active:      #2a2a40;        /* Active/pressed states */

  /* ═══════════════════════════════════════════ */
  /* SURFACE (glassmorphism layers)              */
  /* ═══════════════════════════════════════════ */
  --color-surface:        rgba(255, 255, 255, 0.03);
  --color-surface-hover:  rgba(255, 255, 255, 0.06);
  --color-surface-border: rgba(255, 255, 255, 0.08);
  --color-surface-glass:  rgba(255, 255, 255, 0.04);

  /* ═══════════════════════════════════════════ */
  /* TEXT                                        */
  /* ═══════════════════════════════════════════ */
  --color-text-primary:   #f0f0f5;        /* Main text */
  --color-text-secondary: #8888a0;        /* Subdued text */
  --color-text-tertiary:  #55556a;        /* Muted text */
  --color-text-inverse:   #0a0a0f;        /* Text on light bg */

  /* ═══════════════════════════════════════════ */
  /* BRAND / ACCENT                              */
  /* ═══════════════════════════════════════════ */
  --color-accent:         #7c5cfc;        /* Primary purple */
  --color-accent-hover:   #9178ff;        /* Purple hover */
  --color-accent-muted:   rgba(124, 92, 252, 0.15);
  --color-accent-glow:    rgba(124, 92, 252, 0.4);

  /* ═══════════════════════════════════════════ */
  /* SEMANTIC COLORS                             */
  /* ═══════════════════════════════════════════ */
  --color-success:        #34d399;
  --color-success-muted:  rgba(52, 211, 153, 0.15);
  --color-warning:        #fbbf24;
  --color-warning-muted:  rgba(251, 191, 36, 0.15);
  --color-error:          #f87171;
  --color-error-muted:    rgba(248, 113, 113, 0.15);
  --color-info:           #60a5fa;
  --color-info-muted:     rgba(96, 165, 250, 0.15);

  /* ═══════════════════════════════════════════ */
  /* CHART COLORS (harmonious palette)          */
  /* ═══════════════════════════════════════════ */
  --chart-1:              #7c5cfc;        /* Purple */
  --chart-2:              #06b6d4;        /* Cyan */
  --chart-3:              #f472b6;        /* Pink */
  --chart-4:              #34d399;        /* Green */
  --chart-5:              #fbbf24;        /* Yellow */
  --chart-6:              #fb923c;        /* Orange */
  --chart-7:              #a78bfa;        /* Light Purple */
  --chart-8:              #38bdf8;        /* Sky Blue */
}
```

### 2.2 Gradient Presets

```css
:root {
  --gradient-brand:       linear-gradient(135deg, #7c5cfc 0%, #06b6d4 100%);
  --gradient-card:        linear-gradient(135deg, rgba(124, 92, 252, 0.08) 0%, rgba(6, 182, 212, 0.04) 100%);
  --gradient-hero:        radial-gradient(ellipse at 50% 0%, rgba(124, 92, 252, 0.15) 0%, transparent 60%);
  --gradient-glow:        radial-gradient(circle, var(--color-accent-glow) 0%, transparent 70%);
  --gradient-mesh:        conic-gradient(from 0deg at 50% 50%, #7c5cfc22, #06b6d422, #f472b622, #7c5cfc22);
}
```

---

## 3. Typography

### 3.1 Font Stack

```css
:root {
  --font-sans:   'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-mono:   'JetBrains Mono', 'Fira Code', 'Consolas', monospace;
  --font-display: 'Inter', sans-serif;  /* For hero headings */
}
```

### 3.2 Type Scale

```css
:root {
  /* Size scale */
  --text-xs:    0.75rem;    /* 12px */
  --text-sm:    0.875rem;   /* 14px */
  --text-base:  1rem;       /* 16px */
  --text-lg:    1.125rem;   /* 18px */
  --text-xl:    1.25rem;    /* 20px */
  --text-2xl:   1.5rem;     /* 24px */
  --text-3xl:   1.875rem;   /* 30px */
  --text-4xl:   2.25rem;    /* 36px */
  --text-5xl:   3rem;       /* 48px */
  --text-6xl:   3.75rem;    /* 60px */

  /* Line heights */
  --leading-tight:    1.2;
  --leading-snug:     1.375;
  --leading-normal:   1.5;
  --leading-relaxed:  1.625;

  /* Font weights */
  --weight-regular:   400;
  --weight-medium:    500;
  --weight-semibold:  600;
  --weight-bold:      700;
  --weight-extrabold: 800;

  /* Letter spacing */
  --tracking-tight:   -0.02em;
  --tracking-normal:  0;
  --tracking-wide:    0.02em;
  --tracking-wider:   0.05em;
}
```

### 3.3 Typography Usage

| Element | Size | Weight | Color | Tracking |
|---|---|---|---|---|
| Hero heading | `text-5xl` / `text-6xl` | extrabold | text-primary | tight |
| Page title | `text-3xl` | bold | text-primary | tight |
| Section heading | `text-xl` | semibold | text-primary | normal |
| Card title | `text-lg` | semibold | text-primary | normal |
| Body text | `text-base` | regular | text-secondary | normal |
| Caption / label | `text-sm` | medium | text-tertiary | wide |
| Stat number | `text-3xl` | bold | accent | tight |
| Monospace / data | `text-sm` | regular (mono) | text-secondary | normal |

---

## 4. Spacing System

```css
:root {
  --space-0:    0;
  --space-1:    0.25rem;    /* 4px */
  --space-2:    0.5rem;     /* 8px */
  --space-3:    0.75rem;    /* 12px */
  --space-4:    1rem;       /* 16px */
  --space-5:    1.25rem;    /* 20px */
  --space-6:    1.5rem;     /* 24px */
  --space-8:    2rem;       /* 32px */
  --space-10:   2.5rem;     /* 40px */
  --space-12:   3rem;       /* 48px */
  --space-16:   4rem;       /* 64px */
  --space-20:   5rem;       /* 80px */
  --space-24:   6rem;       /* 96px */
}
```

---

## 5. Border Radius & Shadows

```css
:root {
  /* Border radius */
  --radius-sm:    6px;
  --radius-md:    8px;
  --radius-lg:    12px;
  --radius-xl:    16px;
  --radius-2xl:   24px;
  --radius-full:  9999px;

  /* Shadows */
  --shadow-sm:    0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md:    0 4px 6px rgba(0, 0, 0, 0.3), 0 1px 3px rgba(0, 0, 0, 0.2);
  --shadow-lg:    0 10px 15px rgba(0, 0, 0, 0.3), 0 4px 6px rgba(0, 0, 0, 0.2);
  --shadow-xl:    0 20px 25px rgba(0, 0, 0, 0.3), 0 8px 10px rgba(0, 0, 0, 0.2);
  --shadow-glow:  0 0 20px var(--color-accent-glow), 0 0 60px rgba(124, 92, 252, 0.1);
  --shadow-inner: inset 0 2px 4px rgba(0, 0, 0, 0.2);
}
```

---

## 6. Component Design Specs

### 6.1 Search Bar (Hero Component)

```
┌──────────────────────────────────────────────────────────────┐
│  🔍  Search any YouTube creator...                  [Analyze] │
└──────────────────────────────────────────────────────────────┘
```

**Specs:**
- Width: `min(640px, 90vw)`
- Height: `56px`
- Background: `var(--color-bg-tertiary)`
- Border: `1px solid var(--color-surface-border)`
- Border on focus: `1px solid var(--color-accent)`
- Box shadow on focus: `var(--shadow-glow)`
- Border radius: `var(--radius-xl)`
- Font size: `var(--text-lg)`
- Padding: `0 var(--space-4)` (with icon inset)
- Transition: `border-color 200ms, box-shadow 200ms`
- Button inside: gradient background, `var(--radius-lg)`, `padding: var(--space-2) var(--space-6)`

### 6.2 Dashboard Card

```
┌─────────────────────────────────────────┐
│  📊 Views Distribution                  │
│─────────────────────────────────────────│
│                                         │
│         [Chart Content]                 │
│                                         │
│                                         │
└─────────────────────────────────────────┘
```

**Specs:**
- Background: `var(--color-surface-glass)`
- Backdrop filter: `blur(12px) saturate(150%)`
- Border: `1px solid var(--color-surface-border)`
- Border radius: `var(--radius-xl)`
- Padding: `var(--space-6)`
- Transition: `transform 200ms, border-color 200ms`
- Hover: `transform: translateY(-2px)`, `border-color: var(--color-accent-muted)`

### 6.3 Channel Overview Card

```
┌──────────────────────────────────────────────────────────┐
│  ┌──────┐                                                │
│  │ AVATAR│  MKBHD (@mkbhd)                               │
│  │      │  Quality Tech Videos | 19.5M subscribers        │
│  └──────┘                                                │
│                                                          │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐        │
│  │ 19.5M  │  │  47    │  │ 3.2M   │  │ 3.4/wk │        │
│  │ Subs   │  │ Videos │  │ Avg    │  │ Upload │        │
│  │        │  │Analyzed│  │ Views  │  │ Freq.  │        │
│  └────────┘  └────────┘  └────────┘  └────────┘        │
└──────────────────────────────────────────────────────────┘
```

**Stat pill specs:**
- Background: `var(--color-accent-muted)` or respective chart color muted
- Border radius: `var(--radius-lg)`
- Padding: `var(--space-4) var(--space-5)`
- Number: `var(--text-2xl)`, `var(--weight-bold)`, `var(--color-text-primary)`
- Label: `var(--text-xs)`, `var(--weight-medium)`, `var(--color-text-tertiary)`, `var(--tracking-wider)`, uppercase

### 6.4 AI Brief Card

```
┌──────────────────────────────────────────────────────────┐
│  ✨ AI Content Strategy Brief                     Gemini │
│──────────────────────────────────────────────────────────│
│                                                          │
│  MKBHD is a tech review channel that has mastered the    │
│  art of clean, product-focused content...                │
│                                                          │
│  🎯 Key Recommendations                                  │
│  ┌──────────────────────────────────────────────────────┐│
│  │ 1. Focus on review content in the 10-15 min sweet   ││
│  │    spot for maximum engagement                       ││
│  │ 2. Publish on Tuesdays and Thursdays...             ││
│  └──────────────────────────────────────────────────────┘│
│                                                          │
│  📊 Content Themes     📝 Title Patterns                 │
│  • Tech Reviews (35%)  • Avg Length: 42 chars            │
│  • Commentary (20%)    • Uses "Review" in 45%            │
│  • Comparisons (18%)   • Numbers in 23%                  │
└──────────────────────────────────────────────────────────┘
```

**Specs:**
- Special gradient border: `var(--gradient-brand)` as border via pseudo-element
- Inner background: `var(--color-bg-secondary)`
- AI badge: pill with sparkle icon, `var(--gradient-brand)` background
- Recommendation list: numbered, slight left border accent

### 6.5 Video Card (in Top Videos grid)

```
┌───────────────────────────────────┐
│ ┌───────────────────────────────┐ │
│ │         THUMBNAIL             │ │
│ │              ▶                │ │
│ │                    14:32      │ │
│ └───────────────────────────────┘ │
│ iPhone 16 Pro Review              │
│ 12.4M views · 2 weeks ago        │
│ ████████████████████░░ 89%        │
└───────────────────────────────────┘
```

**Specs:**
- Thumbnail: `aspect-ratio: 16/9`, `object-fit: cover`, `border-radius: var(--radius-md)`
- Duration badge: absolute bottom-right, `var(--color-bg-primary)` background, `var(--text-xs)`
- Title: `var(--text-sm)`, `var(--weight-semibold)`, max 2 lines with ellipsis
- Meta: `var(--text-xs)`, `var(--color-text-tertiary)`
- Performance bar: relative to channel's top video, gradient fill

### 6.6 Loading Skeleton

```
┌──────────────────────────────────────────────┐
│  🔄 Analyzing @mkbhd...                      │
│──────────────────────────────────────────────│
│  ✅ Fetching channel data          Done       │
│  ✅ Found 47 videos                Done       │
│  ⏳ Analyzing content themes...   Working     │
│  ⬜ Generating recommendations    Pending     │
│                                               │
│  ███████████████░░░░░░░░░░░ 65%               │
│                                               │
│  "Analyzing title patterns across 47 videos"  │
└──────────────────────────────────────────────┘
```

**Specs:**
- Animated progress bar with gradient shimmer
- Step-by-step status updates (simulate pipeline stages)
- Pulsing glow effect on active step
- Fun rotating tip text at the bottom

---

## 7. Page Layouts

### 7.1 Landing Page Layout

```
┌────────────────────────────────────────────────────────────┐
│ [Logo] TubeSignal                              [GitHub ↗]   │
├────────────────────────────────────────────────────────────┤
│                                                            │
│                    ✦ radial glow ✦                         │
│                                                            │
│              Decode Any Creator's                          │
│              Content Strategy                              │
│              with AI                                       │
│                                                            │
│        Paste a YouTube channel name and get an             │
│        AI-powered content analysis in seconds              │
│                                                            │
│     ┌──────────────────────────────────────────┐           │
│     │ 🔍  Search creator name or @handle...     │ Analyze  │
│     └──────────────────────────────────────────┘           │
│                                                            │
│     Try: @mkbhd  ·  @fireship  ·  @veritasium               │
│                                                            │
├────────────────────────────────────────────────────────────┤
│                                                            │
│   HOW IT WORKS                                             │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐                │
│   │ 1. Search │  │ 2. Fetch  │  │ 3. AI    │               │
│   │ Enter a   │  │ SerpApi   │  │ Get      │               │
│   │ creator   │  │ pulls     │  │ strategy │               │
│   │ name      │  │ live data │  │ insights │               │
│   └──────────┘  └──────────┘  └──────────┘                │
│                                                            │
├────────────────────────────────────────────────────────────┤
│   FEATURES                                                 │
│   ┌─────────────────┐ ┌─────────────────┐                  │
│   │ 📊 Visual Charts │ │ 🧠 AI Insights  │                  │
│   │ Interactive data │ │ Content themes, │                  │
│   │ visualizations   │ │ title analysis  │                  │
│   └─────────────────┘ └─────────────────┘                  │
│   ┌─────────────────┐ ┌─────────────────┐                  │
│   │ ⚡ Real-Time     │ │ 📱 Responsive   │                  │
│   │ Live SerpApi     │ │ Works on any    │                  │
│   │ data, no stale   │ │ device          │                  │
│   └─────────────────┘ └─────────────────┘                  │
│                                                            │
├────────────────────────────────────────────────────────────┤
│  Built with SerpApi · Powered by AI · Made for Creators    │
└────────────────────────────────────────────────────────────┘
```

### 7.2 Dashboard Layout

```
┌────────────────────────────────────────────────────────────┐
│ [Logo] TubeSignal     [← New Search]          [GitHub ↗]   │
├────────────────────────────────────────────────────────────┤
│                                                            │
│  ┌────────────────────────────────────────────────────────┐│
│  │          CHANNEL OVERVIEW (full-width)                 ││
│  │   Avatar | Name | Stats Row                           ││
│  └────────────────────────────────────────────────────────┘│
│                                                            │
│  ┌──────────────────────┐  ┌────────────────────────────┐  │
│  │                      │  │                            │  │
│  │   AI STRATEGY BRIEF  │  │   CONTENT THEMES CHART     │  │
│  │   (2/3 width)        │  │   (1/3 width)              │  │
│  │                      │  │   Donut Chart              │  │
│  │                      │  │                            │  │
│  └──────────────────────┘  └────────────────────────────┘  │
│                                                            │
│  ┌──────────────────────┐  ┌────────────────────────────┐  │
│  │                      │  │                            │  │
│  │  VIEWS DISTRIBUTION  │  │  PUBLISHING TIMELINE       │  │
│  │  (1/2 width)         │  │  (1/2 width)               │  │
│  │  Bar Chart           │  │  Line Chart                │  │
│  │                      │  │                            │  │
│  └──────────────────────┘  └────────────────────────────┘  │
│                                                            │
│  ┌──────────────────────┐  ┌────────────────────────────┐  │
│  │  LENGTH vs VIEWS     │  │  TITLE PATTERNS            │  │
│  │  (1/2 width)         │  │  (1/2 width)               │  │
│  │  Scatter Plot        │  │  Stats + Word Cloud        │  │
│  └──────────────────────┘  └────────────────────────────┘  │
│                                                            │
│  ┌────────────────────────────────────────────────────────┐│
│  │             TOP PERFORMING VIDEOS (full-width)         ││
│  │   [Card] [Card] [Card] [Card] [Card]                  ││
│  └────────────────────────────────────────────────────────┘│
│                                                            │
│  [📥 Download PDF]  [🔗 Share]                              │
│                                                            │
├────────────────────────────────────────────────────────────┤
│  Built with SerpApi · Powered by AI · Made for Creators    │
└────────────────────────────────────────────────────────────┘
```

---

## 8. Responsive Breakpoints

```css
:root {
  --breakpoint-sm:   640px;
  --breakpoint-md:   768px;
  --breakpoint-lg:   1024px;
  --breakpoint-xl:   1280px;
  --breakpoint-2xl:  1536px;
}
```

### Layout Behavior

| Breakpoint | Search Bar | Dashboard Grid | Video Cards | Charts |
|---|---|---|---|---|
| Mobile (< 640px) | Full width | Single column | 1 per row | Full width, stacked |
| Tablet (640-1024px) | 80% width | 2 columns | 2 per row | 2 columns |
| Desktop (1024px+) | 640px max | 2-3 columns | 3-5 per row | 2 columns |

---

## 9. Animation & Motion

### 9.1 Transitions

```css
:root {
  --transition-fast:    150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-normal:  300ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-slow:    500ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-spring:  500ms cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

### 9.2 Animation Catalog

| Animation | Where Used | Duration | Easing |
|---|---|---|---|
| **Fade In Up** | Dashboard cards appearing | 500ms staggered | ease-out |
| **Skeleton Shimmer** | Loading skeletons | 1.5s infinite | linear |
| **Progress Fill** | Loading bar | Real-time | ease-in-out |
| **Pulse Glow** | Active loading step | 2s infinite | ease-in-out |
| **Scale Hover** | Cards on hover | 200ms | ease-out |
| **Chart Draw** | Chart lines/bars appearing | 800ms | ease-out |
| **Gradient Shift** | Hero background | 8s infinite | linear |
| **Counter Up** | Stat numbers | 1000ms | ease-out |
| **Slide In** | Search results appearing | 300ms | spring |

### 9.3 Keyframe Definitions

```css
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

@keyframes pulseGlow {
  0%, 100% { box-shadow: 0 0 0 0 var(--color-accent-glow); }
  50%      { box-shadow: 0 0 20px 4px var(--color-accent-glow); }
}

@keyframes gradientShift {
  0%   { background-position: 0% 50%; }
  50%  { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

@keyframes slideIn {
  from { opacity: 0; transform: translateX(-10px); }
  to   { opacity: 1; transform: translateX(0); }
}
```

---

## 10. Chart Styling

### 10.1 Global Chart Options

```javascript
const globalChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: '#8888a0',           // text-secondary
        font: { family: 'Inter', size: 12 },
        padding: 16,
        usePointStyle: true,
      }
    },
    tooltip: {
      backgroundColor: '#1a1a28',  // bg-tertiary
      titleColor: '#f0f0f5',       // text-primary
      bodyColor: '#8888a0',        // text-secondary
      borderColor: 'rgba(255,255,255,0.08)',
      borderWidth: 1,
      cornerRadius: 8,
      padding: 12,
      titleFont: { family: 'Inter', weight: '600' },
      bodyFont: { family: 'Inter' },
    }
  },
  scales: {
    x: {
      grid: { color: 'rgba(255,255,255,0.04)' },
      ticks: { color: '#55556a', font: { family: 'Inter', size: 11 } }
    },
    y: {
      grid: { color: 'rgba(255,255,255,0.04)' },
      ticks: { color: '#55556a', font: { family: 'Inter', size: 11 } }
    }
  }
};
```

### 10.2 Chart-Specific Styles

| Chart Type | Style | Colors |
|---|---|---|
| **Views Distribution** (Bar) | Rounded bars, gradient fill, 60% bar width | `chart-1` with opacity gradient |
| **Content Themes** (Doughnut) | 75% cutout, 2px spacing, hover scale | `chart-1` through `chart-6` |
| **Publishing Timeline** (Line) | Smooth tension 0.4, point dots on hover, fill area | `chart-2` line, `chart-2` fill at 10% opacity |
| **Length vs Views** (Scatter) | 8px point radius, glow on hover | `chart-3` with transparent fill |

---

## 11. Iconography

### Icon Set: Lucide React

| Context | Icon | Usage |
|---|---|---|
| Search | `Search` | Search bar |
| Channel/Creator | `User`, `Users` | Channel overview |
| Views | `Eye` | View counts |
| Videos | `Play`, `Video` | Video cards |
| Time/Date | `Clock`, `Calendar` | Publishing data |
| Analytics | `BarChart3`, `TrendingUp` | Chart sections |
| AI/Brain | `Sparkles`, `Brain` | AI analysis section |
| Themes | `Tag`, `Hash` | Content themes |
| Performance | `Zap`, `Trophy` | Top performers |
| Export | `Download`, `Share2` | Export buttons |
| External link | `ExternalLink` | YouTube links |
| Error | `AlertCircle` | Error states |
| Loading | `Loader2` (animated) | Loading spinners |

**Icon sizing:**
- Inline with text: `16px` (1rem)
- Card headers: `20px` (1.25rem)
- Feature icons: `24px` (1.5rem)
- Hero/empty state: `48px` (3rem)

---

## 12. Accessibility Design

| Element | Requirement |
|---|---|
| Text on `bg-primary` | Minimum contrast ratio 7:1 (AAA) |
| Text on `bg-secondary` | Minimum contrast ratio 4.5:1 (AA) |
| Interactive elements | Visible focus ring (`2px solid var(--color-accent)`, `2px offset`) |
| Charts | Always paired with a data summary or table alternative |
| Color-only indicators | Always supplemented with icons or text |
| Motion | All animations respect `prefers-reduced-motion` |
| Touch targets | Minimum `44px × 44px` on mobile |

---

## 13. Favicon & Branding

- **Favicon:** Lens/magnifying glass icon with purple gradient
- **Logo text:** "TubeSignal" in Inter Bold with slight letter-spacing
- **Logo mark:** Stylized lens icon overlapping a play button triangle
- **OG Image:** Dark background, logo centered, tagline below, purple glow accent
- **Color in browser tab:** `#7c5cfc` (theme-color meta tag)
