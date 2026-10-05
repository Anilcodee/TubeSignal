# TubeSignal — Architecture Document

> **Version:** 2.2  
> **Last Updated:** October 5, 2026  
> **Stack:** Next.js (App Router) + TypeScript + Turbopack + SerpApi + Gemini AI + Chart.js  
> **Hackathon Track:** Knowledge & Public Interest (Education / Research)  
> **Deadline:** October 10, 2026, 23:59 IST  

---

## 1. High-Level Architecture

```mermaid
graph TD
    subgraph Client["CLIENT (Browser)"]
        UI["Landing & Search Console (React)"]
        Provenance["Header Provenance Pill (Sample/Live, n=, Gemini/Computed)"]
        Dash["Analysis Dashboard (4 Guided Tabs)"]
        KPI["Unified 4-Cell KPI Panel + SVG Sparklines"]
        HookLab["Hook & Script Lab + WPM Benchmark Scale"]
        Compare["Creator Faceoff (/compare)"]
        ClientCache[("Browser sessionStorage Cache")]
    end

    subgraph Server["SERVER (Next.js App Router API)"]
        SearchAPI["/api/search"]
        AnalyzeAPI["/api/analyze"]
        TranscriptAPI["/api/transcript"]
        
        subgraph Guard["Protection Layer"]
            QuotaGuard["PaidRequestGuard (Rate Limiter)"]
            RequestGuard["Input Bounds & Validation"]
            PendingMap["In-Flight Promise Coalescing"]
        end

        subgraph Service["Service Layer"]
            SerpApiService["SerpApiService"]
            AIAnalyzerService["AIAnalyzerService"]
            DataTransformer["DataTransformerService"]
            ServerCache[("CacheService (LRU Memory)")]
        end
    end

    subgraph External["External APIs"]
        SerpApi["SerpApi (3 Engines: youtube, youtube_channel, youtube_video_transcript)"]
        Gemini["Google Gemini AI (1.5 Flash)"]
    end

    UI --> ClientCache
    Dash --> ClientCache
    Compare --> ClientCache
    
    UI --> SearchAPI
    Dash --> AnalyzeAPI
    Compare --> AnalyzeAPI
    HookLab --> TranscriptAPI

    AnalyzeAPI --> Guard
    TranscriptAPI --> Guard
    SearchAPI --> Guard

    Guard --> Service
    Service --> ServerCache
    SerpApiService --> SerpApi
    AIAnalyzerService --> Gemini
```

---

## 2. Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Framework** | Next.js 16 (Turbopack, App Router) | Server-side API protection, server components, fast routing |
| **Language** | TypeScript | Strict type safety across raw API payloads and transformed datasets |
| **Styling** | Vanilla CSS + CSS Modules | Bespoke design system, dark graphite surfaces, hairline dividers, zero runtime bloat |
| **Data Provider** | SerpApi (3 Engines) | Google search, channel details, and speech transcript intelligence |
| **AI Layer** | Google Gemini 1.5 Flash | Fast, cost-effective synthesis with deterministic server baseline |
| **Visualization** | Chart.js 4 + SVG Sparklines | High-performance canvas data charts and lightweight SVG sparklines |
| **Icons** | Lucide React | Clean, lightweight icon suite |
| **Deployment** | Vercel | Seamless edge/node hosting for Next.js |

---

## 3. Project Structure

```
c:\Projects\SerpApi-hackathon-project\
├── docs/                      # Architectural, PRD, design, and task documentation
├── public/                    # Static assets, branding, and offline fixtures
├── scripts/                   # Local CI checks and 15 mock backend tests
├── src/
│   ├── app/
│   │   ├── analyze/[channelId]/ # Main channel analysis dashboard
│   │   ├── compare/           # Head-to-head creator faceoff
│   │   ├── api/
│   │   │   ├── analyze/       # Full channel analysis pipeline
│   │   │   ├── search/        # Channel discovery fuzzy search
│   │   │   └── transcript/    # Video speech & hook breakdown
│   │   ├── layout.tsx         # Root HTML, fonts, and meta tags
│   │   └── page.tsx           # Visual intelligence landing page
│   ├── components/
│   │   ├── charts/            # Chart.js visualization components
│   │   ├── dashboard/         # Dashboard tabs (Verdict, HookLab, KpiStrip, VideoTable)
│   │   ├── layout/            # Header, Footer, and Navigation
│   │   ├── search/            # Instant channel discovery modal
│   │   └── ui/                # UI primitives (badges, buttons, cards)
│   ├── hooks/                 # Custom React hooks (useAnalysis with cache)
│   ├── lib/                   # Chart theme and global utilities
│   ├── services/              # SerpApi, Gemini AI, Transformer, Cache
│   ├── types/                 # TypeScript type declarations
│   └── utils/                 # Formatting, prompts, report generator, growth analyzer
└── package.json
```

---

## 4. 3 SerpApi Engines Integration

| Engine | Endpoint | Role in TubeSignal | Cache TTL |
|---|---|---|---|
| `youtube` | `/api/search` | Creator name lookup & channel discovery | 30 min |
| `youtube_channel` | `/api/analyze` | Channel profile, statistics, latest ~30 uploads | 30 min (raw) / 1 hour (assembled) |
| `youtube_video_transcript` | `/api/transcript` | Full video captions for opening 40s hook analysis | 24 hours |

---

## 5. API Preservation & Rate Limiting Strategy

1. **Client Browser Cache (`sessionStorage`)**:
   - Analysis results are saved immediately in `sessionStorage`.
   - Page refreshes (F5), page navigation to `/compare`, and tab switching use **0 API calls** and **0 Gemini credits**.
2. **Server Process Cache (`CacheService`)**:
   - Bounded LRU in-memory cache with strictly validated TTL (`Date.now() + Math.max(1000, ttlMs)`).
   - Assembled analyses are cached for 1 hour; raw API responses for 30 minutes; transcripts for 24 hours.
3. **In-Flight Coalescing**:
   - Deduplicates simultaneous requests for the same channel, executing only one upstream call.
4. **Paid Quota Guard (`PaidRequestGuard`)**:
   - Enforces a hard ceiling of 20 SerpApi requests/minute and 10 Gemini requests/minute to prevent credit exhaustion.
5. **Deterministic Offline Fallbacks**:
   - Demo channels (`mkbhd`, `fireship`, `veritasium`) are served locally with zero API dependency.
   - When Gemini is unconfigured or rate-limited, computed statistical analysis is produced instantly without crashing.

---

## 6. Data Honesty & Provenance Architecture

- **No Data Fabrication**: Weekday distributions are strictly derived from parseable dates (`hasExactDates`); relative dates remain explicitly labeled as approximate rather than simulated.
- **Provenance Transparency**: Every report displays a sticky provenance pill in the header:
  - Source: `Sample Fixture` vs. `Live YouTube Data`
  - Sample Size: `N uploads`
  - Model: `Gemini AI` vs. `Deterministic Heuristics`
- **Contextual Grounding**:
  - Lifetime view totals are paired with video age (`24d`, `3mo`, `1.2y`) and sorted by daily pace (`~views/day`).
  - Small sample sizes (`n < 4`) in packaging patterns are explicitly labeled as `EARLY SIGNAL` rather than `SWEET SPOT`.
  - Speech pacing is grounded against a qualitative WPM scale bar (`<130 deliberate • 130–165 conversational • >165 high-energy`).

---

## 7. Multi-Format Dossier Export System

In `src/utils/report-generator.ts`:
- **Standalone HTML Dossier (`.html`)**: Self-contained, responsive report embedding all styles and data offline.
- **Executive Markdown (`.md`)**: Structured creator brief suitable for Notion, Obsidian, or GitHub.
- **Raw JSON Dataset (`.json`)**: Machine-readable dataset for data analysts and researchers.
- **Clipboard & Social**: Clean preview card copying and direct sharing to X and LinkedIn.
