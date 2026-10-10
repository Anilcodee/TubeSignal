# 📏 TubeSignal — Development Rules

> **Version:** 1.0  
> **Last Updated:** October 10, 2026
> **Purpose:** Coding standards, conventions, and guardrails for consistent, high-quality development  

---

## 1. General Principles

### 1.1 Speed Over Perfection (Hackathon Mode)
- **Ship working features, then polish.** Don't gold-plate code that nobody will review.
- **Copy-paste is acceptable** when the alternative is building an abstraction you'll only use once.
- **Skip unit tests** — focus on integration testing through manual QA.
- **Don't over-engineer** — no Redux, no ORMs, no complex state machines.

### 1.2 Code Quality Still Matters
- **TypeScript strict mode** — no `any` types except in SerpApi raw responses.
- **Meaningful names** — `analyzeContentThemes()` not `process()`.
- **Small functions** — each function does one thing.
- **No dead code** — delete it, don't comment it out.

---

## 2. File & Naming Conventions

### 2.1 Files
| Type | Convention | Example |
|---|---|---|
| React Component | PascalCase | `SearchBar.tsx` |
| CSS Module | PascalCase + `.module.css` | `SearchBar.module.css` |
| Service | kebab-case | `serpapi.ts`, `ai-analyzer.ts` |
| Type definitions | kebab-case | `serpapi.ts` (in `types/`) |
| Utility | kebab-case | `format.ts`, `constants.ts` |
| API Route | `route.ts` inside named folder | `api/search/route.ts` |
| Custom Hook | camelCase with `use` prefix | `useAnalysis.ts` |

### 2.2 Variables & Functions
| Type | Convention | Example |
|---|---|---|
| Variables | camelCase | `channelData`, `videoResults` |
| Functions | camelCase | `fetchChannelData()` |
| Constants | SCREAMING_SNAKE | `MAX_VIDEOS`, `API_BASE_URL` |
| Types / Interfaces | PascalCase | `ChannelData`, `VideoDetails` |
| Enums | PascalCase | `AnalysisDepth.Standard` |
| CSS classes | camelCase (CSS Modules) | `styles.searchContainer` |
| Boolean vars | `is`/`has`/`should` prefix | `isLoading`, `hasError` |

### 2.3 Directory Rules
- Components go in `src/components/{category}/`
- Every component that needs styles gets a co-located `.module.css` file
- Business logic lives in `src/services/`, never in components
- Type definitions live in `src/types/`, shared across the app
- No barrel exports (`index.ts`) — direct imports only (simpler, faster)

---

## 3. React Component Rules

### 3.1 Component Structure Template
```tsx
// 1. Imports (external → internal → styles)
import { useState } from 'react';
import { Chart } from 'chart.js';

import { formatViews } from '@/utils/format';
import type { VideoData } from '@/types/analysis';

import styles from './ComponentName.module.css';

// 2. Types (if component-specific)
interface ComponentNameProps {
  data: VideoData[];
  onSelect?: (id: string) => void;
}

// 3. Component (named export, arrow function)
export const ComponentName = ({ data, onSelect }: ComponentNameProps) => {
  // 3a. Hooks
  const [selected, setSelected] = useState<string | null>(null);

  // 3b. Derived state / computed values
  const sortedData = data.sort((a, b) => b.views - a.views);

  // 3c. Handlers
  const handleSelect = (id: string) => {
    setSelected(id);
    onSelect?.(id);
  };

  // 3d. Early returns (loading, error, empty states)
  if (data.length === 0) {
    return <div className={styles.empty}>No data available</div>;
  }

  // 3e. Render
  return (
    <div className={styles.container}>
      {/* JSX */}
    </div>
  );
};
```

### 3.2 Component Do's and Don'ts

| ✅ Do | ❌ Don't |
|---|---|
| Use named exports | Use default exports |
| Co-locate styles with components | Put all CSS in one giant file |
| Pass data as props | Fetch data inside presentational components |
| Use CSS Modules for scoping | Use global class names in components |
| Handle loading, error, empty states | Assume data always exists |
| Use semantic HTML (`<section>`, `<article>`) | Use `<div>` for everything |
| Memoize expensive computations | Optimize prematurely |

### 3.3 Component Size Limits
- **Max 150 lines** per component file. If longer, extract sub-components.
- **Max 5 props** per component. If more, create a composite type.
- **Max 3 `useState`** hooks per component. If more, consider `useReducer` or extracting logic to a hook.

---

## 4. CSS Rules

### 4.1 Design Token Usage
All visual values **MUST** reference CSS custom properties defined in `globals.css`:

```css
/* ✅ Correct */
.card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  box-shadow: var(--shadow-md);
}

/* ❌ Wrong */
.card {
  background: #1a1a2e;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
```

### 4.2 CSS Module Rules
- One `.module.css` per component
- Use `composes` for shared styles when needed
- Mobile-first responsive design (`min-width` media queries)
- No `!important` — fix specificity instead
- Use `rem` for sizing, `em` for component-relative, `px` only for borders/shadows

### 4.3 Animation Rules
- All animations must respect `prefers-reduced-motion`
- Transition duration: `150ms` for micro-interactions, `300ms` for page transitions
- Use `transform` and `opacity` for performant animations
- No layout-triggering animations (`width`, `height`, `top`, `left`)

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## 5. API Route Rules

### 5.1 Request/Response Pattern
```typescript
// Every API route follows this pattern
export async function POST(request: Request) {
  try {
    // 1. Parse and validate input
    const body = await request.json();
    const { query } = body;
    
    if (!query || typeof query !== 'string') {
      return Response.json(
        { error: 'Query is required' }, 
        { status: 400 }
      );
    }

    // 2. Business logic (delegate to services)
    const result = await serpApiService.searchChannels(query);

    // 3. Return success response
    return Response.json({ data: result });

  } catch (error) {
    // 4. Error handling
    console.error('[API /search]', error);
    return Response.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}
```

### 5.2 API Rules
- **POST only** for all data-fetching routes (prevents URL caching of sensitive queries)
- **Always validate** request body before processing
- **Always return JSON** — even errors are `{ error: "message" }`
- **Log errors** with route context: `[API /route-name]`
- **No direct SerpApi calls** from client — always go through API routes
- **Environment variables** accessed only in API routes / services, never in client components

---

## 6. SerpApi Integration Rules

### 6.1 API Key Safety
```typescript
// ✅ Correct — server-side only
const apiKey = process.env.SERPAPI_API_KEY;

// ❌ NEVER — exposes key to client
const apiKey = process.env.NEXT_PUBLIC_SERPAPI_KEY;
```

### 6.2 Request Pattern
```typescript
// Always use this pattern for SerpApi calls
async function serpApiRequest(params: Record<string, string>) {
  const url = new URL('https://serpapi.com/search');
  url.searchParams.set('api_key', process.env.SERPAPI_API_KEY!);
  
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const response = await fetch(url.toString());
  
  if (!response.ok) {
    throw new SerpApiError(response.status, await response.text());
  }
  
  return response.json();
}
```

### 6.3 Credit Conservation
- **Cache all responses** for 30 minutes
- **Check cache first** before making API calls
- **Use `no_cache: false`** (default) to leverage SerpApi's caching
- **Limit video detail fetches** to top 5 videos per analysis
- **Provide demo mode** with pre-cached data for presentations

---

## 7. AI/LLM Integration Rules

### 7.1 Prompt Rules
- **Always request JSON output** — structured responses are easier to parse
- **Include the TypeScript interface** in the prompt so the LLM matches the shape
- **Set temperature to 0.3** — we want consistent, analytical output, not creative
- **Cap max tokens at 2000** — sufficient for analysis, prevents runaway costs
- **Validate LLM output** — always `try/catch` JSON.parse and have a fallback

### 7.2 Fallback Strategy
```typescript
// If AI analysis fails, return basic computed analysis
function getFallbackAnalysis(videos: Video[]): AIAnalysis {
  return {
    contentThemes: computeThemesFromTitles(videos),
    titlePatterns: computeBasicTitleStats(videos),
    publishingStrategy: computePublishingStats(videos),
    performanceInsights: computePerformanceStats(videos),
    recommendations: getGenericRecommendations(),
    summary: `Channel has ${videos.length} videos with an average of ${avgViews} views.`
  };
}
```

---

## 8. Error Handling Rules

### 8.1 Error Display Hierarchy
1. **Inline errors** for form validation (field-level)
2. **Toast notifications** for API errors (non-blocking)
3. **Full-page error state** only for unrecoverable errors
4. **Never show raw error messages** to users — always user-friendly text

### 8.2 Required Error States
Every data-dependent component MUST handle:
- ⏳ **Loading** — skeleton or spinner
- ❌ **Error** — friendly message + retry action
- 📭 **Empty** — helpful message explaining why it's empty
- ✅ **Success** — the actual content

---

## 9. Git & Version Control Rules

### 9.1 Commit Message Format
```
type: short description

[optional body]
```

**Types:**
- `feat:` — new feature
- `fix:` — bug fix
- `style:` — CSS/styling changes
- `refactor:` — code restructuring
- `docs:` — documentation
- `chore:` — tooling, deps, config

**Examples:**
```
feat: add channel search with SerpApi integration
fix: handle channels with zero videos gracefully
style: add glassmorphism effect to dashboard cards
docs: add API usage examples to README
```

### 9.2 Branch Strategy
- `main` — always deployable, this is what judges see
- `dev` — active development branch
- Feature branches only if needed (probably won't be for solo work)

### 9.3 What to Commit
- ✅ Source code, configs, docs, README
- ❌ `.env.local`, `node_modules/`, `.next/`, cached API responses with keys

---

## 10. Performance Budgets

| Metric | Budget |
|---|---|
| First Contentful Paint | < 1.5s |
| Largest Contentful Paint | < 2.5s |
| Time to Interactive | < 3.5s |
| JavaScript bundle size | < 200 KB (gzipped) |
| CSS total size | < 30 KB |
| Image sizes | < 100 KB each (use WebP) |
| API response time | < 8s (full analysis including AI) |

---

## 11. Accessibility Minimums

- All images have `alt` text
- All interactive elements are keyboard-navigable
- Color contrast ratio ≥ 4.5:1 for text
- Charts have text alternatives (data tables or descriptions)
- Focus indicators are visible
- Semantic HTML is used throughout (`header`, `main`, `section`, `article`, `nav`)
- `aria-label` on icon-only buttons

---

## 12. Demo Mode Rules

For hackathon presentation reliability:
- **Always have pre-cached data** for at least 2 channels (e.g., MKBHD, Fireship)
- **Demo mode toggle** in the UI that uses cached data instead of live API
- **Use cached demo fixtures** for presentation reliability; never substitute them for live-channel transcript evidence
- **Never show API errors** in the demo video

## 13. Release Verification Rules

- Run `npm.cmd run build`, `npm.cmd run lint`, and `npx.cmd tsc --noEmit` before handoff.
- Run `npm.cmd run ui-check` after changing report structure or comparison copy.
- Run `node scripts/backend-checks.mjs` after changing data transformation, validation, caching, or provider behavior.
- Run `npm.cmd run e2e` after changing report navigation, Compare, transcript loading, or accessibility-sensitive markup.
- Do not use illustrative transcript fixtures for live channels; sample speech requires an explicit demo flag.
- Do not describe lifetime views or age-adjusted lifetime views/day as recent growth.
