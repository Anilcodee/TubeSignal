# TubeSignal — Memory Document

> **Purpose:** Living document that tracks project state, architectural decisions, key learnings, and context across development sessions.  
> **Last Updated:** October 2, 2026  
> **Status:** Feature Complete, Audited & Hardened (Ready for GitHub Push & Deployment)  

---

## 1. Project Identity

| Field | Value |
|---|---|
| **Project Name** | TubeSignal |
| **Tagline** | Find the signal in any YouTube channel |
| **Hackathon** | SerpApi India Hackathon 2026 |
| **Track** | Knowledge & Public Interest (Education / Research) |
| **Deadline** | October 10, 2026 at 23:59 IST |
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
