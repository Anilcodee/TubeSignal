# 🧠 TubeSignal — Memory Document

> **Purpose:** Living document that tracks project state, decisions made, key learnings, and context for continuity across sessions.  
> **Last Updated:** September 29, 2026  
> **Status:** 🟡 Pre-Development — Planning Complete  

---

## 1. Project Identity

| Field | Value |
|---|---|
| **Project Name** | TubeSignal |
| **Tagline** | Find the signal in any YouTube channel |
| **Hackathon** | SerpApi India Hackathon 2026 |
| **Track** | Knowledge & Public Interest (Education / Research) |
| **Deadline** | October 10, 2026 at 23:59 IST |
| **Days Remaining** | ~11 days (as of Sep 29) |
| **Developer** | Anil (Solo) |
| **Stack** | Next.js 14 + TypeScript + SerpApi + Gemini AI + Chart.js |
| **Deployment** | Vercel |
| **Repo** | TBD (GitHub, public) |

---

## 2. Decision Log

Track every significant decision and its rationale for future reference.

| # | Date | Decision | Rationale | Alternatives Considered |
|---|---|---|---|---|
| D1 | Sep 29 | **Chose TubeSignal** (originally "Creator Lens") over 7 other project ideas | Best balance of uniqueness, build time, demo appeal, and reusability. Fits "Knowledge & Public Interest" track perfectly. | PriceScope (Commerce track, too common), GoTrip AI (Travel track, too complex), Research Brief Bot (AI Agents track, less visual) |
| D2 | Sep 29 | **Next.js 14 App Router** as framework | SSR + API routes in one project, native Vercel deployment, TypeScript support | Vite + Express (2 repos), plain React (no SSR) |
| D3 | Sep 29 | **Vanilla CSS + CSS Modules** over Tailwind | Max control for premium design, no dependency overhead, matches hackathon guidelines | Tailwind (utility classes blur premium look), styled-components (runtime overhead) |
| D4 | Sep 29 | **Gemini 1.5 Flash** as LLM | Free tier available, fast responses, good at structured JSON output | Claude (paid), GPT-4 (expensive), local model (slow) |
| D5 | Sep 29 | **Chart.js** for data viz | Lightweight, well-documented, react-chartjs-2 wrapper exists | D3.js (complex for hackathon), Recharts (less customizable), Victory (less popular) |
| D6 | Sep 29 | **Dark mode only** (no light mode toggle) | Saves development time, dark mode looks more premium, consistent with analytics tool aesthetic | Both modes (double the CSS work) |
| D7 | Sep 29 | **In-memory cache** over database | No persistence needed for hackathon, simpler setup, zero cost | Redis (overkill), SQLite (unnecessary), localStorage (client-side only) |
| D8 | Sep 29 | **Demo mode with pre-cached data** | Essential for reliable hackathon demo, protects against API rate limits | Live-only (risky during demo) |

---

## 3. Architecture Decisions Record (ADR)

### ADR-001: Server-Side Only API Calls
- **Status:** Accepted
- **Context:** SerpApi key must never be exposed to the client
- **Decision:** All SerpApi and Gemini calls go through Next.js API routes
- **Consequences:** Slight latency overhead, but complete key security

### ADR-002: Single Analysis Endpoint
- **Status:** Accepted
- **Context:** Could have separate endpoints for each step (search, fetch, analyze)
- **Decision:** One `/api/analyze` endpoint orchestrates the full pipeline
- **Consequences:** Simpler frontend, but longer endpoint response time (~5-8s). Mitigated by progressive loading UI.

### ADR-003: JSON-Only LLM Output
- **Status:** Accepted
- **Context:** AI could return markdown, plain text, or JSON
- **Decision:** Force structured JSON output from Gemini with TypeScript interface in prompt
- **Consequences:** Easier to parse and display, but requires JSON validation fallback

---

## 4. Current State Tracker

### Overall Progress
```
Planning     ████████████████████ 100%
Foundation   ████████████████████ 100%
SerpApi      ████████████████████ 100%
AI Engine    ████████████████████ 100%
Dashboard    ████████████████████ 100%
Polish       ██████████░░░░░░░░░░  50%
Deploy       ░░░░░░░░░░░░░░░░░░░░   0%
```

### Files Created
| File | Status | Notes |
|---|---|---|
| `docs/PRD.md` | ✅ Complete | Full product requirements |
| `docs/ARCHITECTURE.md` | ✅ Complete | System design + project structure |
| `docs/RULES.md` | ✅ Complete | Coding standards + conventions |
| `docs/DESIGN.md` | ✅ Complete | Design system + component specs |
| `docs/TASKS.md` | ✅ Complete | 121 tasks, sprint plan |
| `docs/MEMORY.md` | ✅ Complete | Living context document |
| `src/app/globals.css` | ✅ Complete | Full token palette, keyframes, reset |
| `src/app/layout.tsx` | ✅ Complete | Inter & JetBrains Mono, SEO metadata |
| `src/app/page.tsx` | ✅ Complete | Hero, SearchBar, Features, Engines |
| `src/app/analyze/[channelId]/page.tsx` | ✅ Complete | Full analytics dashboard with Chart.js |
| `src/app/analyze/[channelId]/loading.tsx` | ✅ Complete | Animated pipeline loading skeleton |
| `src/app/api/search/route.ts` | ✅ Complete | Channel discovery endpoint |
| `src/app/api/analyze/route.ts` | ✅ Complete | Full data + AI pipeline endpoint |
| `src/services/serpapi.ts` | ✅ Complete | Client for youtube/youtube_channel/video/transcript |
| `src/services/ai-analyzer.ts` | ✅ Complete | Gemini SDK integration + heuristic fallback |
| `src/services/data-transformer.ts` | ✅ Complete | Normalizers, aggregate stats & chart datasets |
| `src/services/cache.ts` | ✅ Complete | In-memory 30m TTL cache |
| `public/demo/mkbhd.json` | ✅ Complete | Offline demo dataset for Marques Brownlee |
| `public/demo/fireship.json` | ✅ Complete | Offline demo dataset for Fireship |
| `README.md` | ⬜ Up next | Day 6 task |

### API Keys Status
| Service | Key Status | Free Tier |
|---|---|---|
| SerpApi | 🟡 Integrated (Fallback ready) | 100 searches/month |
| Google Gemini | 🟡 Integrated (Fallback ready) | 15 RPM free tier |

---

## 5. Key Technical Notes

### SerpApi YouTube Engines Quick Reference
```
┌─────────────────────────┬──────────────────────────────────────────┐
│ Engine                  │ Key Parameters                           │
├─────────────────────────┼──────────────────────────────────────────┤
│ engine=youtube          │ search_query, gl, hl                     │
│ engine=youtube_channel  │ channel_id (handle or UC ID)             │
│ engine=youtube_video    │ v (video ID)                             │
│ engine=youtube_video_   │ v, language_code, type                   │
│   transcript            │                                          │
└─────────────────────────┴──────────────────────────────────────────┘

Base URL: https://serpapi.com/search
Auth: api_key query parameter
Response: JSON
```

### Data Parsing Gotchas (to remember during development)
- **Views:** Come as strings like "1.2M views" or "123,456 views" — need regex parser
- **Dates:** Come as relative strings like "2 weeks ago" or "Sep 15, 2026" — need multi-format parser
- **Video Length:** Comes as "14:32" — need to convert to seconds for scatter plot
- **Subscribers:** Come as "19.5M subscribers" — need parser
- **Channel ID:** Can be handle (`@mkbhd`) or UC ID (`UCBcRF18a7Qf58cCRy5xuWwQ`) — support both
- **Thumbnail URLs:** Various quality levels, use highest available
- **Pagination:** `next_page_token` for fetching more videos if channel has many

### Gemini API Notes
- Model: `gemini-1.5-flash` (best speed/quality ratio for free tier)
- Max input tokens: 1M (plenty for our use case)
- Max output tokens: 8K (set to 2K for our needs)
- Temperature: 0.3 (consistent, analytical output)
- Response format: Request `application/json` in system prompt
- Rate limit: 15 requests per minute on free tier
- SDK: `@google/generative-ai` npm package

---

## 6. Blockers & Issues Log

| # | Date | Issue | Status | Resolution |
|---|---|---|---|---|
| — | — | No blockers yet | — | — |

---

## 7. Daily Standup Log

### Sep 29 (Day 1)
- **Plan:** Complete all documentation, start project setup
- **Done:** ✅ All 6 docs created (PRD, Architecture, Rules, Design, Tasks, Memory)
- **Blockers:** None
- **Tomorrow:** Initialize Next.js project, build design system, landing page
- **Mood:** 🟢 Good — clear plan in place

### Sep 30 (Day 2)
- **Plan:** —
- **Done:** —
- **Blockers:** —
- **Tomorrow:** —
- **Mood:** —

### Oct 1 (Day 3)
- **Plan:** —
- **Done:** —
- **Blockers:** —
- **Tomorrow:** —
- **Mood:** —

### Oct 2 (Day 4)
- **Plan:** —
- **Done:** —
- **Blockers:** —
- **Tomorrow:** —
- **Mood:** —

### Oct 3 (Day 5)
- **Plan:** —
- **Done:** —
- **Blockers:** —
- **Tomorrow:** —
- **Mood:** —

### Oct 4 (Day 6)
- **Plan:** —
- **Done:** —
- **Blockers:** —
- **Mood:** —

---

## 8. Testing Checklist (Pre-Submission)

### Functional Tests
- [ ] Search for a channel → results appear
- [ ] Click channel → loading state → dashboard appears
- [ ] All 4 charts render correctly with data
- [ ] AI brief shows structured analysis
- [ ] Top videos section shows video cards with thumbnails
- [ ] "New Search" button works from dashboard
- [ ] Demo mode works when toggled on
- [ ] Demo mode fallback when API fails
- [ ] Channel with few videos (<5) handles gracefully
- [ ] Invalid search query shows appropriate error

### Visual Tests
- [ ] Landing page looks premium on desktop
- [ ] Landing page looks good on mobile (375px width)
- [ ] Dashboard is readable on tablet (768px)
- [ ] All animations are smooth (60fps)
- [ ] Charts are not cut off on small screens
- [ ] Loading skeleton animates correctly
- [ ] Hover states work on all interactive elements
- [ ] No text overflow or layout breaks

### Technical Tests
- [ ] No API keys in client-side code
- [ ] No console errors in production build
- [ ] `npm run build` completes without errors
- [ ] Deployed version matches local development
- [ ] API routes return proper error codes
- [ ] Cache prevents duplicate API calls within 30 minutes

---

## 9. Useful Commands

```bash
# Development
npm run dev                          # Start dev server
npm run build                        # Production build
npm run lint                         # Lint check

# Git
git add -A && git commit -m "msg"    # Quick commit
git push origin main                 # Push to GitHub

# Deployment
npx vercel                           # Deploy to Vercel (first time)
npx vercel --prod                    # Deploy to production

# API Testing (PowerShell)
# Test search endpoint
Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/search" `
  -ContentType "application/json" `
  -Body '{"query": "mkbhd"}'

# Test analyze endpoint
Invoke-RestMethod -Method POST -Uri "http://localhost:3000/api/analyze" `
  -ContentType "application/json" `
  -Body '{"channelId": "mkbhd"}'
```

---

## 10. Links & Resources

| Resource | URL |
|---|---|
| SerpApi Dashboard | https://serpapi.com/dashboard |
| SerpApi YouTube Search Docs | https://serpapi.com/youtube-search-api |
| SerpApi YouTube Channel Docs | https://serpapi.com/youtube-channel-api |
| SerpApi YouTube Video Docs | https://serpapi.com/youtube-video-api |
| Google Gemini AI Studio | https://aistudio.google.com/ |
| Gemini API Docs | https://ai.google.dev/docs |
| Next.js 14 Docs | https://nextjs.org/docs |
| Chart.js Docs | https://www.chartjs.org/docs/ |
| react-chartjs-2 | https://react-chartjs-2.js.org/ |
| Vercel Dashboard | https://vercel.com/dashboard |
| Hackathon Page | https://serpapi.github.io/serpapi-india-hackathon-2026/ |
| Lucide Icons | https://lucide.dev/icons/ |
| Google Fonts (Inter) | https://fonts.google.com/specimen/Inter |

---

## 11. Inspiration & References

### Analytics Dashboard Inspiration
- **Linear** — Clean dark mode, beautiful data density
- **Vercel Analytics** — Minimal, purple accents, great charts
- **Raycast** — Glassmorphism done right
- **GitHub Copilot Dashboard** — Clean data cards with good hierarchy

### Color Inspiration
- Primary Purple: `#7c5cfc` (inspired by Linear + Vercel blend)
- Cyan accent: `#06b6d4` (Vercel's secondary color family)
- Background: Deep navy-black (not pure black — `#0a0a0f` has warmth)

---

## 12. Post-Hackathon Ideas (Someday/Maybe)

If the project does well and I want to continue:
- [ ] Add user accounts for saved analyses
- [ ] Multi-channel comparison mode
- [ ] Transcript analysis for speaking style
- [ ] Historical tracking (analyze same channel over months)
- [ ] Comment sentiment analysis
- [ ] Export to Notion/Google Docs
- [ ] Chrome extension for quick analysis on any YouTube page
- [ ] API access for programmatic channel analysis
- [ ] Monetization: Freemium model with advanced features
