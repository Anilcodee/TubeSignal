# TubeSignal — Memory Document

> **Purpose:** Living document that tracks project state, architectural decisions, key learnings, and context across development sessions.  
> **Last Updated:** October 10, 2026
> **Status:** Project complete, verified, pushed to GitHub (origin/main), and officially submitted to the SerpApi India Hackathon 2026.

---

## 1. Project Identity

| Field | Value |
|---|---|
| **Project Name** | TubeSignal |
| **Tagline** | Find the signal in any YouTube channel |
| **Hackathon** | SerpApi India Hackathon 2026 |
| **Track** | Knowledge & Public Interest (Education / Research) |
| **Deadline** | October 10, 2026 at 23:59 IST (Submitted ✅) |
| **Developer** | Anil |
| **Stack** | Next.js 16 + TypeScript + SerpApi (3 Engines) + Gemini 1.5 Flash + Chart.js |
| **Deployment** | Vercel |
| **Repo** | `https://github.com/Anilcodee/TubeSignal.git` |

---

## 2. Decision Log

| # | Date | Decision | Rationale |
|---|---|---|---|
| D1 | Sep 29 | **Chose TubeSignal** over other ideas | Best balance of uniqueness, build time, demo appeal, and reusability. Fits Knowledge & Public Interest track. |
| D2 | Sep 29 | **Next.js App Router** as framework | SSR + API routes in one project, native Vercel deployment, TypeScript support. |
| D3 | Sep 29 | **Vanilla CSS + CSS Modules** over Tailwind | Full design control for sleek dark-mode glassmorphism without utility class bloat. |
| D4 | Sep 29 | **Gemini 1.5 Flash** as LLM | High speed, cost effective, clean JSON schema conformance. |
| D5 | Sep 29 | **Chart.js 4** for data viz | Fast canvas rendering, accessible table alternatives, no heavy charting dependencies. |
| D6 | Sep 29 | **Dark mode only** | Focused creator analytics aesthetic, eliminates color mode switching bugs. |
| D7 | Sep 30 | **PaidRequestGuard** rate limiting | In-process concurrency and burst limiter (20/min SerpApi, 10/min Gemini) to strictly prevent credit exhaustion. |
| D8 | Oct 1 | **3rd Engine: `youtube_video_transcript`** | Unlocks Speech Intelligence and opening 40s hook analytics, substantially boosting hackathon depth. |
| D9 | Oct 1 | **Multi-Channel Faceoff (`/compare`)** | High-utility side-by-side comparison matrix with `+Higher` advantage badges. |
| D10 | Oct 1 | **Standalone Offline Dossier Export** | Avoids `window.print()` workarounds by generating self-contained HTML, Markdown, and raw JSON dossiers. |
| D11 | Oct 2 | **Multi-Tier Caching Architecture** | Browser `sessionStorage` + server LRU cache ensures page refreshes (F5) and page navigation take 0ms and use 0 API calls. |
| D12 | Oct 2 | **Disabled Chart.js Animations** | Eliminated Chart.js 4.x interpolator bug (`this._fn is not a function at Map.forEach`) caused by dynamic color arrays. |
| D13 | Oct 4 | **Data Honesty Audit & Zero-Fabrication** | Eliminated simulated weekday distributions, relative dates treated as approximate only, removed causal claims across insights, and derived Audience Pulse strictly from actual catalog signals. |
| D14 | Oct 4 | **Signal Report UX Suite (Step A: Misreading Prevention)** | Inline TL;DR summary with `<details>` for full text, explicit baseline context row (`Typical: X • Top: Y • n=Z uploads • Cumulative views, not growth pace`), inline age caveats, sweet-spot count gating (`n >= 4`), and relative age column in VideoTable. |
| D15 | Oct 4 | **Signal Report UX Suite (Step B: Scannable Numbers & Guidance)** | Unified 4-cell KPI panel with hairline dividers, SVG sparklines with amber terminal dot, upload pace context (`~X / week`), qualitative WPM scale bar (`<130 deliberate • 130–165 conversational • >165 high-energy`), `★ Standout` top-video badge, sticky header provenance pill, and contextual cross-tab continue buttons. |
| D16 | Oct 10 | **Age-adjusted velocity with explicit unknowns** | Median lifetime views/day is calculated from publishing age, excludes unknown dates, marks approximate dates, and is presented as a retrieval-time snapshot rather than recent growth. |
| D17 | Oct 10 | **Strict demo/live transcript separation** | Sample transcripts are only returned for explicitly flagged sample reports; live reports surface unavailable-caption states instead of using illustrative speech. |
| D18 | Oct 10 | **Lazy channel-level hook comparison** | Compare samples up to three leading openings per creator on demand, caches client responses for 15 minutes, and reports transcript heuristics with sample counts and provenance. |
| D19 | Oct 10 | **Browser verification as a release gate** | UI contracts, 17 backend checks, production build, and Playwright/Axe flows must pass before handoff. |
| D20 | Oct 10 | **Hackathon Submission Complete** | Project pushed to `Anilcodee/TubeSignal`, verified with 17/17 tests, licensed under MIT, demo video recorded, and submitted ahead of the 23:59 IST deadline. |

---

## 3. Architecture Decisions Record (ADR)

### ADR-001: Server-Side API Boundaries
- **Status:** Accepted
- **Context:** API keys (`SERPAPI_API_KEY`, `GEMINI_API_KEY`) must never be leaked to the client.
- **Decision:** All SerpApi and Gemini calls execute exclusively inside server route handlers (`/api/analyze`, `/api/search`, `/api/transcript`).
- **Consequences:** Client never has direct API keys; request bodies and outputs are sanitized and bounded.

### ADR-002: Multi-Tier Cache with Zero-Call Client Reloads
- **Status:** Accepted
- **Context:** Creators frequently refresh pages, compare channels, or revisit reports. Repeated API calls would quickly deplete limited hackathon API credits.
- **Decision:** Store completed reports in `sessionStorage` on client, alongside a 1-hour server-side LRU memory cache.
- **Consequences:** Page refreshes and navigating back and forth between `/analyze` and `/compare` consume 0 network requests and 0 API credits.

### ADR-003: Strict Data Grounding & Provenance Disclosure
- **Status:** Accepted
- **Context:** Users can easily mistake public sample metadata for channel-wide truth or mistake lifetime views for current growth pace.
- **Decision:** Every report prominently discloses sample provenance (sample vs live, sample size `n=`, Gemini vs deterministic computation), pairs lifetime views with relative video age, gates small samples (`n < 4`), and never simulates missing dates or private metrics (CTR, retention).
- **Consequences:** TubeSignal reports are completely trustworthy, defensible, and clear under hackathon judge scrutiny.

### ADR-004: Lifetime Views and Age-Adjusted Velocity Are Separate Signals
- **Status:** Accepted
- **Context:** A lifetime view total cannot establish recent growth because uploads have different ages.
- **Decision:** Keep lifetime totals and median lifetime views/day as separate metrics. Unknown dates produce unavailable velocity values; approximate dates remain labeled.
- **Consequences:** Compare, Videos, and Overview can provide useful pace context without implying a time-series growth claim.

### ADR-005: Demo Transcripts Must Never Masquerade as Live Data
- **Status:** Accepted
- **Context:** Fixture speech is useful for demos but unsafe as evidence for a live channel.
- **Decision:** The transcript API requires an explicit demo flag for sample fixtures, and the client keeps demo/live cache keys separate.
- **Consequences:** Live caption failures remain visible and cannot silently produce illustrative hook metrics.

---

## 4. Current Verification Snapshot

- `npm.cmd run build` — passed.
- `npm.cmd run lint` — passed.
- `npx.cmd tsc --noEmit` — passed.
- `npm.cmd run ui-check` — 3/3 passed.
- `node scripts/backend-checks.mjs` — 17/17 passed.
- `npm.cmd run e2e` — 3/3 passed, including lazy opening analysis and accessibility checks.
