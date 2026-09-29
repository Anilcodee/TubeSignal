# ✅ TubeSignal — Tasks & Sprint Plan

> **Version:** 1.0  
> **Last Updated:** September 29, 2026  
> **Timeline:** Sep 29 – Oct 10, 2026 (11 days, deadline 23:59 IST)  
> **Available Hours:** ~3-4 hours/day = ~35 total hours  
> **Methodology:** Daily sprints with clear deliverables  

---

## Sprint Overview

```
Day 1  (Sep 29) ▸ Foundation            ~4 hrs   ██░░░░░░░░░░░░░░░░░░░░
Day 2  (Sep 30) ▸ SerpApi Integration   ~3.5 hrs ████░░░░░░░░░░░░░░░░░░
Day 3  (Oct 1)  ▸ AI Analysis Engine    ~3.5 hrs ██████░░░░░░░░░░░░░░░░
Day 4  (Oct 2)  ▸ Dashboard & Charts    ~4 hrs   ████████░░░░░░░░░░░░░░
Day 5  (Oct 3)  ▸ Polish & UX           ~3 hrs   ██████████░░░░░░░░░░░░
Day 6  (Oct 4)  ▸ Deploy & README       ~2.5 hrs ████████████░░░░░░░░░░
Day 7  (Oct 5)  ▸ Stretch: Transcript   ~3 hrs   ██████████████░░░░░░░░
Day 8  (Oct 6)  ▸ Stretch: Multi-Chan   ~3 hrs   ████████████████░░░░░░
Day 9  (Oct 7)  ▸ Final Polish & Edge   ~3 hrs   ██████████████████░░░░
Day 10 (Oct 8)  ▸ Demo Video & Submit   ~2.5 hrs ████████████████████░░
Day 11 (Oct 9)  ▸ Buffer Day            ~1 hr    ██████████████████████
───────────────────────────────────────────────────
Oct 10 DEADLINE ▸ Final fixes only              DEADLINE 23:59 IST
```

---

## Day 1: Foundation (Sep 29) — ~4 hours

### Goal: Working Next.js app with design system, layout, and landing page

| # | Task | Est. | Priority | Status |
|---|---|---|---|---|
| 1.1 | Initialize Next.js 14 project with TypeScript (`npx create-next-app@latest`) | 10 min | P0 | ⬜ |
| 1.2 | Install dependencies: `chart.js`, `react-chartjs-2`, `lucide-react` | 5 min | P0 | ⬜ |
| 1.3 | Set up project structure (folders per ARCHITECTURE.md) | 15 min | P0 | ⬜ |
| 1.4 | Create `.env.local` and `.env.example` with API key placeholders | 5 min | P0 | ⬜ |
| 1.5 | Build `globals.css` with complete design token system (per DESIGN.md) | 30 min | P0 | ⬜ |
| 1.6 | Set up Google Fonts (Inter + JetBrains Mono) in `layout.tsx` | 10 min | P0 | ⬜ |
| 1.7 | Build `Header` component with logo and GitHub link | 20 min | P0 | ⬜ |
| 1.8 | Build `Footer` component with credits | 10 min | P1 | ⬜ |
| 1.9 | Build UI primitives: `Button`, `Card`, `Badge`, `Skeleton`, `Input` | 40 min | P0 | ⬜ |
| 1.10 | Build `SearchBar` component with glassmorphism styling | 30 min | P0 | ⬜ |
| 1.11 | Build Landing Page (`page.tsx`) with hero, search bar, how-it-works | 45 min | P0 | ⬜ |
| 1.12 | Add hero background gradient/glow effects and animations | 20 min | P1 | ⬜ |
| 1.13 | Verify responsive layout on mobile and desktop | 15 min | P0 | ⬜ |
| 1.14 | Initial Git commit: "feat: project foundation with landing page" | 5 min | P0 | ⬜ |

**Day 1 Deliverable:** Beautiful landing page with search bar, fully responsive, design system in place.

---

## Day 2: SerpApi Integration (Sep 30) — ~3.5 hours

### Goal: Search for YouTube channels and fetch channel data through SerpApi

| # | Task | Est. | Priority | Status |
|---|---|---|---|---|
| 2.1 | Create `SerpApiService` class in `src/services/serpapi.ts` | 20 min | P0 | ⬜ |
| 2.2 | Implement `searchChannels()` — `engine=youtube` | 25 min | P0 | ⬜ |
| 2.3 | Implement `getChannelData()` — `engine=youtube_channel` | 25 min | P0 | ⬜ |
| 2.4 | Implement `getVideoDetails()` — `engine=youtube_video` | 20 min | P0 | ⬜ |
| 2.5 | Implement `batchGetVideoDetails()` — parallel fetch top 5 | 15 min | P1 | ⬜ |
| 2.6 | Create `POST /api/search` route with validation | 20 min | P0 | ⬜ |
| 2.7 | Create `POST /api/analyze` route (SerpApi portion only, no AI yet) | 30 min | P0 | ⬜ |
| 2.8 | Create `CacheService` for in-memory caching | 15 min | P1 | ⬜ |
| 2.9 | Build `DataTransformerService` — parse views, dates, calculate stats | 25 min | P0 | ⬜ |
| 2.10 | Define TypeScript types in `src/types/` (serpapi, analysis, chart) | 20 min | P0 | ⬜ |
| 2.11 | Build `ChannelResult` component — shows search results list | 20 min | P0 | ⬜ |
| 2.12 | Connect SearchBar → API → Results display on landing page | 15 min | P0 | ⬜ |
| 2.13 | Test with real SerpApi calls (at least 3 channels) | 15 min | P0 | ⬜ |
| 2.14 | Save sample API responses as demo cache data (`public/demo/`) | 10 min | P1 | ⬜ |
| 2.15 | Git commit: "feat: SerpApi integration with search and channel fetch" | 5 min | P0 | ⬜ |

**Day 2 Deliverable:** User can search for a creator, see results, and clicking one fetches real channel data from SerpApi.

---

## Day 3: AI Analysis Engine (Oct 1) — ~3.5 hours

### Goal: Feed channel data to Gemini AI, get structured analysis back

| # | Task | Est. | Priority | Status |
|---|---|---|---|---|
| 3.1 | Set up Gemini AI client (`@google/generative-ai` SDK) | 15 min | P0 | ⬜ |
| 3.2 | Create `AIAnalyzerService` class in `src/services/ai-analyzer.ts` | 15 min | P0 | ⬜ |
| 3.3 | Write master analysis prompt (content themes, titles, publishing, perf) | 30 min | P0 | ⬜ |
| 3.4 | Implement `analyzeChannel()` — sends data to Gemini, parses JSON response | 30 min | P0 | ⬜ |
| 3.5 | Add JSON validation and error handling for AI responses | 20 min | P0 | ⬜ |
| 3.6 | Build fallback analysis (computed stats when AI fails) | 20 min | P1 | ⬜ |
| 3.7 | Create prompt templates in `src/utils/prompts.ts` | 15 min | P0 | ⬜ |
| 3.8 | Wire AI analysis into `/api/analyze` route (complete pipeline) | 20 min | P0 | ⬜ |
| 3.9 | Create `DataTransformerService` chart data methods (Chart.js datasets) | 25 min | P0 | ⬜ |
| 3.10 | Test full pipeline end-to-end (search → fetch → analyze → structured response) | 20 min | P0 | ⬜ |
| 3.11 | Cache AI analysis results alongside channel data | 10 min | P1 | ⬜ |
| 3.12 | Iterate on prompt quality based on test results | 15 min | P0 | ⬜ |
| 3.13 | Git commit: "feat: AI analysis engine with Gemini integration" | 5 min | P0 | ⬜ |

**Day 3 Deliverable:** Complete backend pipeline — SerpApi data + AI analysis — returns structured JSON ready for frontend.

---

## Day 4: Dashboard & Charts (Oct 2) — ~4 hours

### Goal: Beautiful analysis dashboard with all charts and AI brief display

| # | Task | Est. | Priority | Status |
|---|---|---|---|---|
| 4.1 | Create `analyze/[channelId]/page.tsx` — dashboard page shell | 15 min | P0 | ⬜ |
| 4.2 | Create `analyze/[channelId]/loading.tsx` — animated loading state | 25 min | P0 | ⬜ |
| 4.3 | Build `ChannelOverview` component (avatar, name, stat pills) | 25 min | P0 | ⬜ |
| 4.4 | Build `AIBrief` component (summary, themes, title patterns, recommendations) | 35 min | P0 | ⬜ |
| 4.5 | Build `ChartWrapper` component (reusable chart container with card styling) | 10 min | P0 | ⬜ |
| 4.6 | Build `ViewsDistribution` chart (bar chart) | 20 min | P0 | ⬜ |
| 4.7 | Build `ContentThemes` chart (doughnut chart) | 20 min | P0 | ⬜ |
| 4.8 | Build `PublishingTimeline` chart (line chart) | 20 min | P0 | ⬜ |
| 4.9 | Build `LengthVsViews` chart (scatter plot) | 20 min | P1 | ⬜ |
| 4.10 | Build `TopVideos` component with horizontal scroll grid | 25 min | P0 | ⬜ |
| 4.11 | Build `VideoCard` component (thumbnail, title, views, perf bar) | 20 min | P0 | ⬜ |
| 4.12 | Wire `useAnalysis` hook — fetch analysis data on page load | 15 min | P0 | ⬜ |
| 4.13 | Implement staggered fade-in animations for dashboard cards | 15 min | P1 | ⬜ |
| 4.14 | Add responsive grid layout for dashboard | 15 min | P0 | ⬜ |
| 4.15 | Test dashboard with real analysis data from Day 3 | 15 min | P0 | ⬜ |
| 4.16 | Git commit: "feat: analysis dashboard with charts and AI brief" | 5 min | P0 | ⬜ |

**Day 4 Deliverable:** Full analysis dashboard — channel overview, AI brief, 4 charts, top videos — all populated with real data.

---

## Day 5: Polish & UX (Oct 3) — ~3 hours

### Goal: Hackathon-winning visual polish, error handling, and demo mode

| # | Task | Est. | Priority | Status |
|---|---|---|---|---|
| 5.1 | Add animated number counting for stat values | 15 min | P1 | ⬜ |
| 5.2 | Polish loading state with step-by-step progress updates | 20 min | P0 | ⬜ |
| 5.3 | Add error states with friendly messages and retry buttons | 15 min | P0 | ⬜ |
| 5.4 | Add empty state for channels with few/no videos | 10 min | P1 | ⬜ |
| 5.5 | Implement demo mode toggle (uses pre-cached data) | 20 min | P0 | ⬜ |
| 5.6 | Cache demo data for 2 channels (MKBHD, Fireship) | 15 min | P0 | ⬜ |
| 5.7 | Add "Try these creators" quick-select on landing page | 10 min | P1 | ⬜ |
| 5.8 | Polish all hover/focus states across components | 15 min | P1 | ⬜ |
| 5.9 | Cross-browser testing (Chrome, Firefox, Edge) | 15 min | P0 | ⬜ |
| 5.10 | Mobile responsive testing and fixes | 20 min | P0 | ⬜ |
| 5.11 | Add SEO meta tags, OG image, favicon | 15 min | P1 | ⬜ |
| 5.12 | Performance audit — lazy load charts, optimize images | 15 min | P1 | ⬜ |
| 5.13 | Add `prefers-reduced-motion` support | 5 min | P1 | ⬜ |
| 5.14 | Git commit: "style: visual polish and UX improvements" | 5 min | P0 | ⬜ |

**Day 5 Deliverable:** Production-quality UX — smooth loading, error handling, demo mode, responsive, cross-browser.

---

## Day 6: Deploy & README (Oct 4) — ~2.5 hours

### Goal: Deployed app, comprehensive README, and initial testing

| # | Task | Est. | Priority | Status |
|---|---|---|---|---|
| 6.1 | Deploy to Vercel (connect GitHub repo) | 10 min | P0 | ⬜ |
| 6.2 | Set environment variables on Vercel (SERPAPI_KEY, GEMINI_KEY) | 5 min | P0 | ⬜ |
| 6.3 | Test deployed version end-to-end | 10 min | P0 | ⬜ |
| 6.4 | Write comprehensive README.md (setup, features, SerpApi usage, screenshots) | 30 min | P0 | ⬜ |
| 6.5 | Add AI tool usage disclosure to README (hackathon requirement) | 5 min | P0 | ⬜ |
| 6.6 | Add screenshots to README | 15 min | P0 | ⬜ |
| 6.7 | Document which SerpApi engines are used and why (hackathon requirement) | 10 min | P0 | ⬜ |
| 6.8 | Code review — remove console.logs, dead code, TODOs | 15 min | P0 | ⬜ |
| 6.9 | Add .env.example with clear instructions | 5 min | P0 | ⬜ |
| 6.10 | Git commit: "docs: comprehensive README and deployment" | 5 min | P0 | ⬜ |

**Day 6 Deliverable:** Deployed app on Vercel, comprehensive README with screenshots, clean codebase.

---

## Day 7: Stretch — Transcript Analysis (Oct 5) — ~3 hours

### Goal: Add video transcript analysis using SerpApi's youtube_video_transcript engine

| # | Task | Est. | Priority | Status |
|---|---|---|---|---|
| 7.1 | Add `getVideoTranscript()` to SerpApi service | 20 min | P2 | ⬜ |
| 7.2 | Extend AI prompt to analyze speaking style, keywords, content depth | 25 min | P2 | ⬜ |
| 7.3 | Build `TranscriptInsights` component (word cloud, key topics, speaking style) | 30 min | P2 | ⬜ |
| 7.4 | Add transcript section to dashboard (collapsible/expandable) | 20 min | P2 | ⬜ |
| 7.5 | Handle missing transcripts gracefully (not all videos have them) | 15 min | P2 | ⬜ |
| 7.6 | Test with 3-4 channels (some with/without transcripts) | 15 min | P2 | ⬜ |
| 7.7 | Update README with 4th SerpApi engine usage | 10 min | P2 | ⬜ |
| 7.8 | Git commit: "feat: transcript analysis with youtube_video_transcript" | 5 min | P2 | ⬜ |

**Day 7 Deliverable:** 4th SerpApi engine integrated (stronger "meaningful usage" score), deeper content analysis.

---

## Day 8: Stretch — Multi-Channel Compare (Oct 6) — ~3 hours

### Goal: Allow comparing 2 creators side-by-side

| # | Task | Est. | Priority | Status |
|---|---|---|---|---|
| 8.1 | Create `/compare` page with 2 search inputs | 20 min | P2 | ⬜ |
| 8.2 | Create `POST /api/compare` route (parallel analyze × 2) | 25 min | P2 | ⬜ |
| 8.3 | Build `ComparisonDashboard` layout (side-by-side stats) | 30 min | P2 | ⬜ |
| 8.4 | Add comparison charts (overlaid bar charts, dual doughnuts) | 30 min | P2 | ⬜ |
| 8.5 | AI comparative analysis prompt ("How do these two creators differ?") | 20 min | P2 | ⬜ |
| 8.6 | Add navigation to compare from single analysis page | 10 min | P2 | ⬜ |
| 8.7 | Test compare feature with 2-3 channel pairs | 15 min | P2 | ⬜ |
| 8.8 | Git commit: "feat: multi-channel comparison mode" | 5 min | P2 | ⬜ |

**Day 8 Deliverable:** Side-by-side creator comparison — massive wow factor for judges.

---

## Day 9: Final Polish & Edge Cases (Oct 7) — ~3 hours

### Goal: Bulletproof UX, handle edge cases, performance optimization

| # | Task | Est. | Priority | Status |
|---|---|---|---|---|
| 9.1 | Test with edge case channels (new creators, inactive, non-English) | 20 min | P1 | ⬜ |
| 9.2 | Add rate limit handling with user-friendly messaging | 15 min | P1 | ⬜ |
| 9.3 | Performance audit — Lighthouse score, bundle size check | 15 min | P1 | ⬜ |
| 9.4 | Polish all animations and transitions end-to-end | 20 min | P1 | ⬜ |
| 9.5 | Add OG meta tags and social sharing image | 15 min | P1 | ⬜ |
| 9.6 | Accessibility audit — keyboard nav, screen reader, contrast | 20 min | P1 | ⬜ |
| 9.7 | Cross-browser final testing (Chrome, Firefox, Edge, Safari mobile) | 15 min | P1 | ⬜ |
| 9.8 | Fix any remaining bugs from Days 7-8 stretch features | 20 min | P1 | ⬜ |
| 9.9 | Redeploy with all stretch features | 10 min | P1 | ⬜ |
| 9.10 | Git commit: "fix: final polish and edge case handling" | 5 min | P1 | ⬜ |

**Day 9 Deliverable:** Production-grade, bulletproof application.

---

## Day 10: Demo Video & Submission (Oct 8) — ~2.5 hours

### Goal: Compelling demo video and hackathon submission

| # | Task | Est. | Priority | Status |
|---|---|---|---|---|
| 10.1 | Script demo video (detailed plan, what to say at each timestamp) | 15 min | P0 | ⬜ |
| 10.2 | Practice demo walkthrough 1-2 times | 10 min | P0 | ⬜ |
| 10.3 | Record demo video — screen recording running locally | 25 min | P0 | ⬜ |
| 10.4 | Edit video — trim dead space, add captions/annotations | 20 min | P1 | ⬜ |
| 10.5 | Upload demo video (YouTube unlisted or Loom) | 10 min | P0 | ⬜ |
| 10.6 | Final README review — ensure all hackathon requirements are covered | 10 min | P0 | ⬜ |
| 10.7 | Sign in to hackathon website with GitHub | 5 min | P0 | ⬜ |
| 10.8 | Fill out submission form (repo URL, video link, track, SerpApi usage) | 15 min | P0 | ⬜ |
| 10.9 | Verify submission is complete and confirmed | 5 min | P0 | ⬜ |
| 10.10 | Git tag: "v1.0.0 — hackathon submission" | 5 min | P0 | ⬜ |

**Day 10 Deliverable:** ✅ Submitted — app deployed, video uploaded, submission complete.

---

## Day 11: Buffer (Oct 9) — Emergency Only

| # | Task | Est. | Priority | Status |
|---|---|---|---|---|
| 11.1 | Fix any critical bugs found after submission | As needed | P0 | ⬜ |
| 11.2 | Re-record demo video if issues found | As needed | P0 | ⬜ |
| 11.3 | Update submission if allowed | 10 min | P0 | ⬜ |

## Oct 10 — ABSOLUTE DEADLINE (23:59 IST)
No new work. Only emergency fixes and re-submission if critical issues found.

---

## Task Summary

| Category | Total Tasks | P0 Tasks | Estimated Hours |
|---|---|---|---|
| **Day 1: Foundation** | 14 | 11 | ~4.0 hrs |
| **Day 2: SerpApi** | 15 | 11 | ~3.5 hrs |
| **Day 3: AI Engine** | 13 | 9 | ~3.5 hrs |
| **Day 4: Dashboard** | 16 | 12 | ~4.0 hrs |
| **Day 5: Polish** | 14 | 7 | ~3.0 hrs |
| **Day 6: Deploy** | 10 | 9 | ~2.5 hrs |
| **Day 7: Transcript** | 8 | 0 (P2) | ~3.0 hrs |
| **Day 8: Compare** | 8 | 0 (P2) | ~3.0 hrs |
| **Day 9: Final Polish** | 10 | 0 (P1) | ~3.0 hrs |
| **Day 10: Demo+Submit** | 10 | 8 | ~2.5 hrs |
| **Day 11: Buffer** | 3 | 3 | ~1.0 hr |
| **TOTAL** | **121** | **70** | **~33 hrs** |

---

## Critical Path

The following tasks are on the critical path — if any slip, the project is at risk:

```
Day 1: 1.1 → 1.5 → 1.9 → 1.10 → 1.11
                              │
Day 2: 2.1 → 2.2 → 2.3 → 2.6 → 2.7 → 2.9 → 2.12
                                         │
Day 3: 3.1 → 3.2 → 3.3 → 3.4 → 3.8 → 3.10
                                         │
Day 4: 4.1 → 4.3 → 4.4 → 4.6 → 4.7 → 4.12 → 4.15
                                                │
Day 5: 5.2 → 5.3 → 5.5 → 5.10
                         │
Day 6: 6.1 → 6.3 → 6.4 → 6.6 → 6.7 → 6.10 ✅
```

---

## Risk Mitigation Checkpoints

| After Day | Check | Action if Behind |
|---|---|---|
| Day 2 | API calls working with real data? | Use hardcoded mock data as fallback |
| Day 3 | AI analysis returning structured JSON? | Use computed statistics only, skip LLM |
| Day 4 | Dashboard rendering all sections? | Drop scatter plot, simplify to 2-3 charts |
| Day 5 | App feels polished? | Skip compare feature, focus on core |
| Day 6 | Deployed and working? | Deploy even if imperfect, demo with cached data |
| Day 8 | Stretch features done? | Cut compare feature, submit with transcript only |
| Day 10 | Demo video recorded? | Record even if rough, substance over production |

---

## Demo Video Script (3 minutes)

```
[0:00 - 0:15]  Title card: "TubeSignal — Find the Signal in Any YouTube Channel"
[0:15 - 0:30]  Show landing page, explain the problem
[0:30 - 0:50]  Type "mkbhd" in search → show channel results
[0:50 - 1:10]  Click channel → show loading animation with pipeline steps
[1:10 - 1:40]  Walk through channel overview + AI strategy brief
[1:40 - 2:10]  Show each chart (content themes, views, publishing timeline)
[2:10 - 2:30]  Show top performing videos section
[2:30 - 2:45]  Quick demo with second channel (Fireship) to show versatility
[2:45 - 3:00]  Closing: tech stack, SerpApi usage, GitHub link
```

---

## README Structure (Day 6)

```markdown
# 📶 TubeSignal

> AI-powered YouTube creator analytics built with SerpApi

## 🎬 Demo Video
[Link to video]

## 🌐 Live Demo  
[Link to deployed app]

## ✨ Features
- Search any YouTube creator
- AI-powered content strategy analysis (Gemini)
- Interactive charts (views, themes, publishing patterns)
- Real-time data from SerpApi

## 🛠 Tech Stack
Next.js 14 | TypeScript | SerpApi | Google Gemini | Chart.js

## 🔌 SerpApi Engines Used
- `youtube` — Channel discovery
- `youtube_channel` — Channel data + video list
- `youtube_video` — Detailed video metadata

## 🚀 Setup
1. Clone the repo
2. `npm install`
3. Add API keys to `.env.local`
4. `npm run dev`

## 📸 Screenshots
[Screenshots of key pages]

## 🏗 Architecture
[Brief architecture overview]

## 👤 Author
[Your name + links]
```
