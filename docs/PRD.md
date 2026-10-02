# 📋 TubeSignal — Product Requirements Document (PRD)

> **Version:** 1.0  
> **Last Updated:** September 29, 2026  
> **Author:** Anil  
> **Hackathon:** SerpApi India Hackathon 2026  
>
> **Deadline:** October 10, 2026, 23:59 IST  
> **Track:** Knowledge & Public Interest (Education / Research)  

---

## 1. Executive Summary

**TubeSignal** is an AI-powered YouTube creator analytics tool that uses SerpApi's YouTube APIs to fetch real-time channel and video data, then leverages an LLM (Gemini) to produce actionable content strategy insights. It helps content creators, marketers, and researchers understand a YouTube creator's content themes, title patterns, publishing cadence, and overall channel strategy — all from a single search.

---

## 2. Problem Statement

### The Pain
- **Creators** spend hours manually studying competitor channels, trying to reverse-engineer what works.
- **Marketers** need quick competitive analysis of YouTube channels before sponsorship decisions.
- **Researchers** want structured data about creator content patterns but YouTube's native analytics only works for your own channel.

### The Gap
- YouTube Studio only shows analytics for channels you own.
- Third-party tools (Social Blade, VidIQ) are paid, bloated, and don't provide AI-driven content strategy analysis.
- No tool combines **live search data** + **AI analysis** into a single, beautiful research brief.

---

## 3. Product Vision

> *"Paste a YouTube channel name → get an AI-powered content strategy report in 30 seconds."*

TubeSignal turns raw YouTube data from SerpApi into a **visual, AI-analyzed research brief** that reveals:
- What topics a creator covers
- How they craft titles and thumbnails
- When and how often they publish
- Which content performs best and why
- Actionable takeaways for competing or collaborating

---

## 4. Target Users

| Persona | Need | How TubeSignal Helps |
|---|---|---|
| **Aspiring Creator** | Study successful creators to learn strategies | AI breaks down what makes top videos work |
| **Marketing Manager** | Evaluate creators for brand partnerships | Quick channel health + content alignment check |
| **Content Strategist** | Competitive analysis across multiple channels | Side-by-side pattern comparison |
| **Researcher / Journalist** | Understand a creator's content evolution | Data-backed timeline of content shifts |

---

## 5. Core Features (MVP — Hackathon Scope)

### F1: Channel Search & Discovery
- **Input:** User types a creator name or channel handle (e.g., `@mkbhd`)
- **Engine:** `youtube` search engine via SerpApi
- **Output:** Search results with channel suggestions, user picks one
- **Priority:** P0 (Must Have)

### F2: Channel Data Fetching
- **Engine:** `youtube_channel` via SerpApi  
- **Data Retrieved:**
  - Channel name, handle, description, subscriber count
  - List of recent videos (title, views, published date, length, thumbnail)
- **Priority:** P0 (Mu### F3: Video Deep-Dive & Ranked Performance Table
- **Engine:** `youtube_video` via SerpApi / `youtube_channel`
- **Output:** Dense ranked table with 16:9 thumbnails, views (`tabular-nums`), "vs median" percentage delta badge (e.g. `▲ +288%`), and duration
- **Priority:** P0 (Must Have)

### F4: AI-Powered Content Analysis
- **LLM Provider:** Google Gemini API (Gemini 2.5 Flash)
- **Analysis Modules:**
  1. **Strategic Verdict** — One punchy AI judgment leading the dashboard
  2. **Content Themes** — Categorize videos into topic clusters (horizontal bars)
  3. **Title Pattern Analysis** — Common words, recurring syntax, character count sweetspots
  4. **Publishing Strategy** — Frequency, day-of-week cadence matrix
  5. **Performance Insights** — What separates outlier videos from baseline median
  6. **Actionable Recommendations** — Numbered rules with concrete catalog evidence
- **Priority:** P0 (Must Have)

### F5: Visual Analytics Dashboard
- **F5a: Strategy Verdict (P0)** — The dashboard opens with a one-sentence AI judgment plus 1–2 supporting sentences with key numbers highlighted in Signal Amber.
- **Charts (Insight-Led Titles):**
  - 📊 Views distribution bar chart (amber outlier highlights + dashed median line)
  - 📈 Publishing frequency timeline / weekday strip
  - 🏷️ Content themes **horizontal bar chart** (sorted descending, ≤5 + Other)
  - 📏 Video length vs. views scatter plot (duration sweetspot)
- **Library:** Chart.js with unified `chart-theme.ts`
- **Priority:** P0 (Must Have)

### F6: Export & Share
- **Options:**
  - 1-click PDF export via print stylesheet (`window.print()` with `@media print`)
  - Copy shareable snapshot link
- **Priority:** P1 (Should Have)

---

## 6. Feature: Stretch Goals (Post-MVP)

| Feature | Description | SerpApi Engine |
|---|---|---|
| **Transcript Analysis** | Analyze video transcripts for speaking style, keywords | `youtube_video_transcript` |
| **Trend Context** | Show how channel topics align with Google Trends | `google` search |
| **Comment Sentiment** | Analyze audience sentiment from comments | `youtube_video` (comments) |

---

## 7. User Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     HOME / WORKSPACE                        │
│   "Analyze any creator's channel."                          │
│   [ 🔍 Search a creator or @handle...             Analyze ] │
│                                                             │
│   Recent and sample dossiers:                               │
│   • Marques Brownlee (@mkbhd) — 19.5M                       │
│   • Fireship (@fireship) — 3.4M                             │
│   • Veritasium (@veritasium) — 15.0M                        │
└──────────────────────────────┬──────────────────────────────┘
                               │ (user searches or clicks sample)
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 SKELETON IN-LAYOUT LOADING                  │
│   Fetching channel... → Reading videos... → Writing brief...│
│   [ Skeletons in full dashboard layout with shimmer ]       │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                     DOSSIER DASHBOARD                       │
│                                                             │
│   Marques Brownlee (@mkbhd)                 [Share] [Export]│
│   19.5M subscribers • 47 videos analyzed • live             │
│                                                             │
│   ▌ VERDICT: MKBHD wins on polished 10–15m reviews...       │
│                                                             │
│   [ 19.5M Subs | 3.2M Avg Views | 2.1/wk Cadence | 11:42 ]  │
│                                                             │
│   ┌──────────────────────────┐  ┌─────────────────────────┐ │
│   │ 🏷️ Content Themes (Bars) │  │ 🎯 What to do next      │ │
│   │ "Reviews drive 62% views"│  │ 1. Recommendation       │ │
│   └──────────────────────────┘  └─────────────────────────┘ │
│                                                             │
│   ┌──────────────────────────┐  ┌─────────────────────────┐ │
│   │ 📏 Length vs Views       │  │ 📈 Publishing Cadence   │ │
│   │ "10–15m videos beat..."  │  │ "Publishes Tue & Thu"   │ │
│   └──────────────────────────┘  └─────────────────────────┘ │
│                                                             │
│   ┌───────────────────────────────────────────────────────┐ │
│   │ 📊 Views Distribution ("Top outliers drive...")       │ │
│   └───────────────────────────────────────────────────────┘ │
│                                                             │
│   ┌───────────────────────────────────────────────────────┐ │
│   │ 🎬 Ranked Video Table (#, Thumb, Title, Views, Median)│ │
│   └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```�� │
│  │ Avg Views: 3.2M          │  │ 5 Recommendations...    │ │
│  └──────────────────────────┘  └──────────────────────────┘ │
│                                                             │
│  ┌──────────────────────────┐  ┌──────────────────────────┐ │
│  │ 📊 VIEWS DISTRIBUTION    │  │ 🏷️ CONTENT THEMES       │ │
│  │ [Bar Chart]              │  │ [Donut Chart]            │ │
│  └──────────────────────────┘  └──────────────────────────┘ │
│                                                             │
│  ┌──────────────────────────┐  ┌──────────────────────────┐ │
│  │ 📈 PUBLISHING TIMELINE   │  │ 📏 LENGTH vs VIEWS      │ │
│  │ [Line Chart]             │  │ [Scatter Plot]           │ │
│  └──────────────────────────┘  └──────────────────────────┘ │
│                                                             │
│  ┌──────────────────────────────────────────────────────────┐│
│  │ 🎯 TOP PERFORMING VIDEOS                                 ││
│  │ 1. "iPhone 16 Pro Review" — 12.4M views                  ││
│  │ 2. "Best Tech of 2026" — 9.8M views                      ││
│  │ [See All Videos →]                                       ││
│  └──────────────────────────────────────────────────────────┘│
│                                                             │
│  [📥 Download PDF]  [🔗 Share Report]                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 8. SerpApi Integration Points

| API Engine | Purpose | Endpoint | Key Params |
|---|---|---|---|
| `youtube` | Search for channels/creators | `GET /search?engine=youtube` | `search_query`, `gl`, `hl` |
| `youtube_channel` | Fetch channel metadata + video list | `GET /search?engine=youtube_channel` | `channel_id` (handle or UC ID) |
| `youtube_video` | Fetch detailed video metadata | `GET /search?engine=youtube_video` | `v` (video ID) |
| `youtube_video_transcript` | Fetch video transcripts (stretch) | `GET /search?engine=youtube_video_transcript` | `v`, `language_code` |

### API Credit Budget
- Free tier: 100 searches/month
- Per analysis: ~3-5 API calls (1 search + 1 channel + 1-3 video details)
- **Budget for demo:** ~20 full analyses

---

## 9. Non-Functional Requirements

| Requirement | Target |
|---|---|
| **Page Load** | < 2 seconds (cached), < 8 seconds (fresh analysis) |
| **Mobile Responsive** | Full functionality on mobile viewport |
| **Browser Support** | Chrome, Firefox, Edge (latest 2 versions) |
| **Accessibility** | WCAG 2.1 AA compliance for charts and navigation |
| **Error Handling** | Graceful degradation when API limits are hit |
| **Rate Limiting** | Client-side debounce on search, server-side rate limit |

---

## 10. Success Metrics (Hackathon)

### Judging Criteria (Official — Unweighted)
| Criterion | How TubeSignal Scores |
|---|---|
| **Idea Strength & Originality** | Unique niche — no existing tool combines SerpApi YouTube data + AI content strategy analysis |
| **Technical Complexity** | Multi-stage pipeline: 3 SerpApi engines + AI analysis + data transforms + interactive charts |
| **Usefulness** | Genuinely useful for creators, marketers, and researchers studying YouTube channels |
| **Meaningful SerpApi Usage** | Core functionality depends on SerpApi — `youtube`, `youtube_channel`, `youtube_video` engines |

### Deliverable Metrics
| Metric | Target |
|---|---|
| **Working Demo** | Full flow from search → analysis → dashboard |
| **Demo Video** | Under 3 minutes, screen recording running locally |
| **Unique Value** | AI insights that you can't get from YouTube Studio |
| **Code Quality** | Clean, documented, public GitHub repository |
| **Visual Polish** | Looks like a premium SaaS product, not a hackathon MVP |
| **AI Tool Disclosure** | Documented in README (required by rules) |

---

## 11. Risks & Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| SerpApi rate limits hit during demo | High | Cache results, use pre-fetched data as fallback |
| LLM API costs exceed budget | Medium | Use Gemini free tier, cache AI responses |
| Channel has < 10 videos | Low | Show "insufficient data" warning, still analyze what's available |
| Complex channel names fail search | Low | Allow direct channel URL/handle input |
| Time constraint (6 days) | High | Strict MVP scope, no scope creep, daily milestones |

---

## 12. Out of Scope (for Hackathon)

- ❌ User authentication / accounts
- ❌ Historical tracking over time
- ❌ Monetization / premium tier
- ❌ Mobile native app
- ❌ Custom branding / white-label
- ❌ Multi-language UI (English only)

---

## 13. Submission Requirements (Official)

- [ ] Sign in through hackathon website with GitHub account
- [ ] Public GitHub repository with code, documentation, and setup instructions
- [ ] Demo video (< 3 minutes) — screen demo running locally
- [ ] Explain which SerpApi APIs/engines are used and why usage is meaningful
- [ ] AI tool usage disclosed in README

## 14. Deliverables Checklist

- [ ] Public GitHub repository with comprehensive README
- [ ] Working deployed application (Vercel) — also runs locally
- [ ] Demo video (< 3 minutes) recorded running locally
- [ ] At least 3 SerpApi engine integrations (`youtube`, `youtube_channel`, `youtube_video`)
- [ ] AI-powered analysis with visible insights
- [ ] Responsive, polished UI with charts
- [ ] Track selected: Knowledge & Public Interest
