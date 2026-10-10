
# TubeSignal — Sprint Plan & Task Checklist

> **Version:** 2.3
> **Last Updated:** October 10, 2026
> **Status:** Feature work complete and locally verified ✅ (build, TypeScript, lint, UI contracts, backend checks, Playwright/Axe)
> **Next Milestone:** Manual product review, commit, demo video, and hackathon submission
> **Hackathon Deadline:** October 10, 2026 at 23:59 IST

---

## 1. Feature Completion Checklist

### Phase 1: Foundation & Design System

- [X] Next.js 16 (App Router) + TypeScript foundation
- [X] Dark mode design system with CSS custom properties and glassmorphism tokens
- [X] CSS-only 3D Signal sculpture on landing console
- [X] Header and Navigation with direct `/compare` faceoff links
- [X] Keyboard-accessible tab navigation across all views

### Phase 2: SerpApi Core Integration

- [X] `youtube` engine: channel search and discovery with fuzzy matching (`/api/search`)
- [X] `youtube_channel` engine: creator profile, verified status, subscriber count, and latest ~30 uploads (`/api/analyze`)
- [X] Data transformer service: duration parsing, view count normalization, approximate date parsing
- [X] Quota protection guard (`PaidRequestGuard`) enforcing 20 req/min for SerpApi and 10 req/min for Gemini
- [X] In-flight request coalescing to prevent duplicate simultaneous upstream requests

### Phase 3: AI Intelligence & Analytics

- [X] Google Gemini 1.5 Flash integration with structured schema validation
- [X] Mathematical computed observational fallback when Gemini is unconfigured or rate-limited
- [X] Guardrails against fabricated claims (CTR, retention rate, algorithm myths)
- [X] Title packaging anatomy (character length, pattern extraction, emotional trigger words)
- [X] Standout upload ratio vs median baseline

### Phase 4: Data Visualization & Hardening

- [X] Views distribution chart with standout upload highlighting
- [X] Duration vs. views scatter plot
- [X] Monthly publishing timeline chart
- [X] Disabled Chart.js animations globally to prevent interpolator bugs (`this._fn is not a function`)
- [X] Data table view alternatives for all charts (accessibility)

### Phase 5: Speech Intelligence (3rd SerpApi Engine)

- [X] `youtube_video_transcript` engine integration (`/api/transcript`)
- [X] Opening 40-second hook analytics utility (`transcript-analyzer.ts`)
- [X] Hook archetype classification (Story, Curiosity, Direct Statement, Contrarian)
- [X] Speech pacing metrics (Words Per Minute / WPM)
- [X] High-retention power words and viewer cues extractor
- [X] Interactive Hook & Script Lab tab in dashboard with video selector and search

### Phase 6: Creator Faceoff & Comparison

- [X] Multi-channel comparison view (`/compare`)
- [X] Side-by-side KPI comparison matrix with `+Higher` advantage badges
- [X] Head-to-head verdict and direct report links
- [X] 4 instant sample presets (e.g., MKBHD vs. Veritasium)

### Phase 7: Export & Sharing Suite

- [X] Standalone offline HTML dossier generator (`report-generator.ts`)
- [X] Executive Markdown report download
- [X] Raw JSON dataset export
- [X] Native Web Share API integration
- [X] 1-click clipboard summary card copying
- [X] Social sharing links for X (Twitter) and LinkedIn

### Phase 8: Multi-Tier Quota & Cache Preservation

- [X] Client-side browser `sessionStorage` caching in `useAnalysis` hook (0ms instant reloads on F5 refresh or navigation)
- [X] Client cache integration in `/compare` (loads previously viewed creators with 0 network calls)
- [X] Component-level memory cache in `TranscriptLab` for instant video switching
- [X] Server-side 1-hour memory LRU cache for assembled analyses

### Phase 9: Data Honesty Audit & Zero-Fabrication Hardening

- [X] Cache TTL calculation bugfix (`Date.now() + Math.max(1000, ttlMs)`) ensuring full 1h/24h cache longevity
- [X] `/compare` demo flag preservation (`demo ?? isSample`)
- [X] Eliminated fabricated weekday and hour distributions (`hasExactDates` gating; no invented spread or simulated afternoon hours)
- [X] Dynamic Audience Pulse deriving sentiment score from standout velocity and demands from actual upload signals
- [X] Eradicated causal claims across growth playbook and AI prompts (strictly observational phrasing)
- [X] Filtered unobserved views (`v.viewsAvailable !== false`) in growth analyzer
- [X] Single-video duration tier winner bugfix (requires `count > 1` or explicit qualification)

### Phase 10: Signal Report UX/UI Enhancement Suite

- [X] **Step A: Reduce Misreading & Ground Data Claims**
  - [X] Verdict inline age caveat `(not age-adjusted)` and baseline summary row (`Typical: X • Top: Y • n=Z uploads • Cumulative views, not growth pace`)
  - [X] Inline 2-sentence TL;DR in Verdict with full text inside `<details>`
  - [X] Jargon elimination in GrowthPlaybook (`Beat typical`, `typical`, `% above typical`, `n=` badges)
  - [X] Sweet-spot count gating (`count >= 4`) and sample size badges in TitleLab
  - [X] Age column (`vel.daysSince`), sort clarity (daily pace vs lifetime), and accessible thumbnail button in VideoTable
- [X] **Step B: Scannable Numbers & Guided Workflows**
  - [X] Unified 4-cell KPI panel with hairline dividers, SVG sparklines, and range context
  - [X] Reduced-motion guard and calm 600ms count-up strictly on numeric counts
  - [X] `★ Standout` badge on #1 video chip in TranscriptLab
  - [X] 1-line "Why this hook works" psychological rationale next to Archetype badge
  - [X] Qualitative WPM scale bar (`<130 deliberate • 130–165 conversational • >165 high-energy`) with active indicator pip
  - [X] Sticky `.provenancePill` (`Sample Fixture / Live YouTube Data • N uploads • Gemini AI / Deterministic`) in report header
  - [X] Contextual next-step action buttons connecting tab workflows

### Phase 11: Velocity, Faceoff, and Release Hardening

- [X] Age-adjusted median lifetime views/day with unknown-date exclusion and approximate-date labels
- [X] Separate lifetime, typical, and age-adjusted velocity signals in Videos and Compare
- [X] Shareable report tabs using `?tab=overview|patterns|transcripts|uploads`
- [X] Lazy channel-level hook comparison for up to three leading openings per creator
- [X] Demo/live transcript separation with bounded client caching and timeout handling
- [X] UI contract checks for disclosure, evidence controls, and comparison surfaces
- [X] Playwright/Axe coverage for tabs, Compare, opening analysis, and accessibility
- [X] Production build, strict TypeScript, lint, and 17 backend regression checks

---

## 2. Submission Preparation

| Step                       | Description                                                                   | Status                      |
| -------------------------- | ----------------------------------------------------------------------------- | --------------------------- |
| **Code Audit**       | Turbopack build check, TypeScript strict typing, ESLint zero-warning check    | ✅ 0 errors, 0 warnings     |
| **Backend Suite**    | 17 backend verification checks (`scripts/backend-checks.mjs`)               | ✅ 17/17 passed             |
| **Production Build** | Static generation & compilation check (`next build`)                        | ✅ Exit code 0              |
| **Documentation**    | Update README.md, ARCHITECTURE.md, PRD.md, TASKS.md, and MEMORY.md            | ✅ Updated for Phase 11   |
| **GitHub Push**      | Commit and push the current working-tree changes to `Anilcodee/TubeSignal`    | ⏳ User action              |
| **Deployment**       | Import GitHub repo into Vercel and configure`SERPAPI_API_KEY`               | ⏳ Ready                    |
| **Demo Video**       | Record ~3-minute video demonstrating 3 SerpApi engines, Hook Lab, and Faceoff | ⏳ Next                     |
| **Final Submission** | Submit project on hackathon portal before Oct 10                              | ⏳ On track                 |
