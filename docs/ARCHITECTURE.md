# 🏗️ TubeSignal — Architecture Document

> **Version:** 1.0  
> **Last Updated:** September 29, 2026  
> **Stack:** Next.js 14 (App Router) + TypeScript + SerpApi + Gemini AI  
> **Hackathon Track:** Knowledge & Public Interest (Education / Research)  
> **Deadline:** October 10, 2026, 23:59 IST  

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                        │
│  ┌───────────────┐ ┌───────────────┐ ┌───────────────────────┐ │
│  │  Search Page   │ │ Loading State │ │  Analysis Dashboard   │ │
│  │  (React)       │ │ (Skeleton)    │ │  (Charts + AI Brief)  │ │
│  └───────┬───────┘ └───────────────┘ └───────────┬───────────┘ │
│          │                                       │             │
│          │         Next.js App Router             │             │
│          └──────────────┬────────────────────────┘             │
└─────────────────────────┼──────────────────────────────────────┘
                          │ HTTP (fetch)
                          ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SERVER (Next.js API Routes)                  │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────┐  │
│  │ /api/search      │  │ /api/analyze     │  │ /api/export  │  │
│  │ YouTube Search   │  │ Full Pipeline    │  │ PDF Export   │  │
│  └────────┬─────────┘  └───────┬──────────┘  └──────────────┘  │
│           │                    │                                │
│  ┌────────┴────────────────────┴──────────────────────────────┐ │
│  │                    Service Layer                            │ │
│  │  ┌──────────────┐ ┌────────────────┐ ┌──────────────────┐  │ │
│  │  │ SerpApi      │ │ AI Analysis    │ │ Data Transform   │  │ │
│  │  │ Service      │ │ Service        │ │ Service          │  │ │
│  │  └──────┬───────┘ └───────┬────────┘ └──────────────────┘  │ │
│  └─────────┼─────────────────┼────────────────────────────────┘ │
│            │                 │                                  │
└────────────┼─────────────────┼──────────────────────────────────┘
             │                 │
             ▼                 ▼
    ┌────────────────┐  ┌──────────────────┐
    │   SerpApi      │  │  Google Gemini   │
    │   REST API     │  │  AI API          │
    │                │  │                  │
    │ • youtube      │  │ • Content Theme  │
    │ • youtube_     │  │   Analysis       │
    │   channel      │  │ • Title Pattern  │
    │ • youtube_     │  │   Detection      │
    │   video        │  │ • Strategy       │
    │ • youtube_     │  │   Generation     │
    │   video_       │  │                  │
    │   transcript   │  │                  │
    └────────────────┘  └──────────────────┘
```

---

## 2. Tech Stack

| Layer | Technology | Rationale |
|---|---|---|
| **Framework** | Next.js 14 (App Router) | SSR + API routes in one project, fast deployment on Vercel |
| **Language** | TypeScript | Type safety, better DX, fewer runtime bugs |
| **Styling** | Vanilla CSS + CSS Modules | Maximum control, no dependency overhead, premium aesthetics |
| **Charts** | Chart.js + react-chartjs-2 | Lightweight, beautiful, well-documented |
| **AI/LLM** | Google Gemini API (`gemini-1.5-flash`) | Free tier available, fast responses, good at structured analysis |
| **Search Data** | SerpApi (YouTube engines) | Hackathon requirement, structured JSON, reliable |
| **State Mgmt** | React Context + `useState` | Simple app, no need for Redux/Zustand |
| **HTTP Client** | Native `fetch` | No extra dependencies needed |
| **Deployment** | Vercel | Free, instant, Next.js-native deployment |
| **Icons** | Lucide React | Clean, modern, tree-shakeable icons |
| **Fonts** | Google Fonts (Inter + JetBrains Mono) | Premium typography |

---

## 3. Project Structure

```
creator-lens/
├── public/
│   ├── favicon.ico
│   ├── og-image.png               # Social share image
│   └── demo/                      # Pre-cached demo data
│       └── mkbhd.json
│
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout with fonts, metadata
│   │   ├── page.tsx               # Landing / Search page
│   │   ├── globals.css            # Global styles + design tokens
│   │   │
│   │   ├── analyze/
│   │   │   └── [channelId]/
│   │   │       ├── page.tsx       # Analysis dashboard (main feature)
│   │   │       └── loading.tsx    # Skeleton loading state
│   │   │
│   │   └── api/
│   │       ├── search/
│   │       │   └── route.ts       # POST: Search YouTube channels
│   │       ├── analyze/
│   │       │   └── route.ts       # POST: Full analysis pipeline
│   │       └── export/
│   │           └── route.ts       # POST: Generate PDF export
│   │
│   ├── components/
│   │   ├── ui/                    # Reusable UI primitives
│   │   │   ├── Button.tsx
│   │   │   ├── Button.module.css
│   │   │   ├── Input.tsx
│   │   │   ├── Input.module.css
│   │   │   ├── Card.tsx
│   │   │   ├── Card.module.css
│   │   │   ├── Badge.tsx
│   │   │   ├── Badge.module.css
│   │   │   ├── Skeleton.tsx
│   │   │   ├── Skeleton.module.css
│   │   │   ├── ProgressBar.tsx
│   │   │   └── ProgressBar.module.css
│   │   │
│   │   ├── search/                # Search-specific components
│   │   │   ├── SearchBar.tsx
│   │   │   ├── SearchBar.module.css
│   │   │   ├── ChannelResult.tsx
│   │   │   └── ChannelResult.module.css
│   │   │
│   │   ├── dashboard/             # Dashboard components
│   │   │   ├── ChannelOverview.tsx
│   │   │   ├── ChannelOverview.module.css
│   │   │   ├── AIBrief.tsx
│   │   │   ├── AIBrief.module.css
│   │   │   ├── TopVideos.tsx
│   │   │   ├── TopVideos.module.css
│   │   │   └── VideoCard.tsx
│   │   │
│   │   ├── charts/                # Chart components
│   │   │   ├── ViewsDistribution.tsx
│   │   │   ├── PublishingTimeline.tsx
│   │   │   ├── ContentThemes.tsx
│   │   │   ├── LengthVsViews.tsx
│   │   │   └── ChartWrapper.tsx
│   │   │
│   │   └── layout/                # Layout components
│   │       ├── Header.tsx
│   │       ├── Header.module.css
│   │       ├── Footer.tsx
│   │       └── Footer.module.css
│   │
│   ├── services/                  # Business logic layer
│   │   ├── serpapi.ts             # SerpApi client wrapper
│   │   ├── ai-analyzer.ts        # LLM analysis orchestration
│   │   ├── data-transformer.ts   # Raw → chart-ready data transforms
│   │   └── cache.ts              # In-memory result caching
│   │
│   ├── types/                     # TypeScript type definitions
│   │   ├── serpapi.ts             # SerpApi response types
│   │   ├── analysis.ts           # AI analysis result types
│   │   └── chart.ts              # Chart data types
│   │
│   ├── utils/                     # Utility functions
│   │   ├── format.ts             # Number/date formatting
│   │   ├── constants.ts          # App constants, API URLs
│   │   └── prompts.ts            # LLM prompt templates
│   │
│   └── hooks/                     # Custom React hooks
│       ├── useAnalysis.ts         # Fetch + cache analysis data
│       └── useSearch.ts           # Search with debounce
│
├── .env.local                     # API keys (gitignored)
├── .env.example                   # Template for env vars
├── next.config.js
├── tsconfig.json
├── package.json
└── README.md
```

---

## 4. API Route Design

### 4.1 `POST /api/search`

Search for YouTube channels by name.

```typescript
// Request
{
  "query": "mkbhd"
}

// Response
{
  "channels": [
    {
      "name": "Marques Brownlee",
      "handle": "@mkbhd",
      "channelId": "UCBcRF18a7Qf58cCRy5xuWwQ",
      "thumbnail": "https://...",
      "subscribers": "19.5M",
      "videoCount": "1,800",
      "description": "MKBHD: Quality Tech Videos..."
    }
  ]
}
```

**SerpApi Call:**
```typescript
GET https://serpapi.com/search?engine=youtube&search_query=mkbhd&api_key=KEY
```

---

### 4.2 `POST /api/analyze`

Full analysis pipeline — fetches channel data, processes it, runs AI analysis.

```typescript
// Request
{
  "channelId": "mkbhd",           // handle or UC ID
  "analysisDepth": "standard"      // "quick" | "standard" | "deep"
}

// Response
{
  "channel": {
    "name": "Marques Brownlee",
    "handle": "@mkbhd",
    "subscribers": "19.5M",
    "description": "...",
    "totalVideosAnalyzed": 47
  },
  "videos": [
    {
      "title": "iPhone 16 Pro Review",
      "videoId": "abc123",
      "views": 12400000,
      "publishedDate": "2026-09-15",
      "length": "14:32",
      "thumbnail": "https://..."
    }
  ],
  "analytics": {
    "avgViews": 3200000,
    "medianViews": 2100000,
    "totalViews": 150000000,
    "publishingFrequency": "3.2 videos/week",
    "avgVideoLength": "12:45",
    "mostActiveDay": "Tuesday",
    "viewsGrowthTrend": "stable"
  },
  "aiAnalysis": {
    "contentThemes": [
      { "theme": "Smartphone Reviews", "percentage": 35, "videoCount": 16 },
      { "theme": "Tech Industry Commentary", "percentage": 20, "videoCount": 9 },
      { "theme": "Product Comparisons", "percentage": 18, "videoCount": 8 },
      { "theme": "Annual Best-Of Lists", "percentage": 12, "videoCount": 6 },
      { "theme": "Behind the Scenes", "percentage": 15, "videoCount": 8 }
    ],
    "titlePatterns": {
      "avgLength": 42,
      "commonPatterns": ["Product + 'Review'", "Superlative + Category", "Question format"],
      "emotionalTriggers": ["Best", "Worst", "Truth", "Actually"],
      "useOfNumbers": "23% of titles contain numbers"
    },
    "publishingStrategy": {
      "frequency": "3-4 videos per week",
      "peakDays": ["Tuesday", "Thursday", "Saturday"],
      "consistency": "Very consistent (92% on-schedule)",
      "seasonalPatterns": "Ramps up during product launch seasons"
    },
    "performanceInsights": {
      "topPerformingTraits": ["Review videos with product in title", "Videos 10-15 min long"],
      "underperformingTraits": ["Behind-the-scenes content", "Videos over 25 min"],
      "viralFactors": ["First-to-review advantage", "Clean thumbnail with product"]
    },
    "recommendations": [
      "Focus on review content in the 10-15 minute sweet spot",
      "Publish on Tuesdays and Thursdays for maximum reach",
      "Use product name + 'Review' in titles for discoverability",
      "Avoid overly long behind-the-scenes content",
      "Leverage 'Best of' and list-format videos for year-end traffic"
    ],
    "summary": "MKBHD is a tech review channel that has mastered the art of..."
  },
  "chartData": {
    "viewsDistribution": { /* Chart.js ready data */ },
    "publishingTimeline": { /* Chart.js ready data */ },
    "contentThemes": { /* Chart.js ready data */ },
    "lengthVsViews": { /* Chart.js ready data */ }
  }
}
```

**Pipeline Stages:**
```
1. SerpApi: youtube_channel → channel metadata + video list
2. SerpApi: youtube_video × 5 → detailed top video data
3. Transform: Raw data → structured analytics
4. Gemini AI: Structured data → content strategy analysis
5. Transform: Analysis → chart-ready datasets
```

---

### 4.3 `POST /api/export` (Stretch)

Generate a PDF report.

```typescript
// Request
{ "channelId": "mkbhd" }

// Response
Binary PDF stream
```

---

## 5. Data Flow Pipeline

```
                    ┌──────────────────────────────────┐
                    │         User Input                │
                    │    "mkbhd" or "@mkbhd"            │
                    └──────────────┬───────────────────┘
                                   │
                    ┌──────────────▼───────────────────┐
                    │   Stage 1: Channel Discovery      │
                    │   SerpApi engine=youtube           │
                    │   → Find channel ID               │
                    └──────────────┬───────────────────┘
                                   │
                    ┌──────────────▼───────────────────┐
                    │   Stage 2: Channel Data Fetch     │
                    │   SerpApi engine=youtube_channel   │
                    │   → Channel info + video list     │
                    └──────────────┬───────────────────┘
                                   │
                    ┌──────────────▼───────────────────┐
                    │   Stage 3: Video Detail Fetch     │
                    │   SerpApi engine=youtube_video     │
                    │   → Top 5 videos detailed data    │
                    │   (parallel requests)              │
                    └──────────────┬───────────────────┘
                                   │
                    ┌──────────────▼───────────────────┐
                    │   Stage 4: Data Transformation    │
                    │   • Parse view counts             │
                    │   • Normalize dates                │
                    │   • Calculate statistics           │
                    │   • Prepare chart datasets         │
                    └──────────────┬───────────────────┘
                                   │
                    ┌──────────────▼───────────────────┐
                    │   Stage 5: AI Analysis            │
                    │   Gemini gemini-1.5-flash          │
                    │   • Content theme clustering       │
                    │   • Title pattern analysis         │
                    │   • Publishing strategy eval       │
                    │   • Performance insights           │
                    │   • Recommendations                │
                    └──────────────┬───────────────────┘
                                   │
                    ┌──────────────▼───────────────────┐
                    │   Stage 6: Response Assembly       │
                    │   • Merge all data                 │
                    │   • Format for frontend            │
                    │   • Cache result                   │
                    └──────────────────────────────────┘
```

---

## 6. Service Layer Details

### 6.1 SerpApi Service (`serpapi.ts`)

```typescript
class SerpApiService {
  private apiKey: string;
  private baseUrl = 'https://serpapi.com/search';

  // Search for channels
  async searchChannels(query: string): Promise<ChannelSearchResult[]>;
  
  // Get channel details + video list
  async getChannelData(channelId: string): Promise<ChannelData>;
  
  // Get single video details
  async getVideoDetails(videoId: string): Promise<VideoDetails>;
  
  // Get video transcript (stretch goal)
  async getVideoTranscript(videoId: string): Promise<Transcript>;
  
  // Batch fetch video details (parallel)
  async batchGetVideoDetails(videoIds: string[]): Promise<VideoDetails[]>;
}
```

### 6.2 AI Analyzer Service (`ai-analyzer.ts`)

```typescript
class AIAnalyzerService {
  private model = 'gemini-1.5-flash';
  
  // Main analysis entry point
  async analyzeChannel(data: ChannelData, videos: VideoDetails[]): Promise<AIAnalysis>;
  
  // Sub-analyzers (called internally)
  private analyzeContentThemes(videos: VideoDetails[]): Promise<ContentTheme[]>;
  private analyzeTitlePatterns(titles: string[]): Promise<TitlePatterns>;
  private analyzePublishingStrategy(dates: string[]): Promise<PublishingStrategy>;
  private generateRecommendations(analysis: PartialAnalysis): Promise<string[]>;
}
```

### 6.3 Data Transformer Service (`data-transformer.ts`)

```typescript
class DataTransformerService {
  // Convert raw SerpApi data to internal format
  static normalizeChannelData(raw: SerpApiChannelResponse): ChannelData;
  
  // Parse "1.2M views" → 1200000
  static parseViewCount(viewString: string): number;
  
  // Parse "2 weeks ago" → ISO date
  static parseRelativeDate(dateString: string): string;
  
  // Generate Chart.js-ready datasets
  static toViewsDistribution(videos: Video[]): ChartDataset;
  static toPublishingTimeline(videos: Video[]): ChartDataset;
  static toContentThemes(themes: ContentTheme[]): ChartDataset;
  static toLengthVsViews(videos: Video[]): ChartDataset;
  
  // Calculate aggregate statistics
  static calculateAnalytics(videos: Video[]): ChannelAnalytics;
}
```

### 6.4 Cache Service (`cache.ts`)

```typescript
// Simple in-memory cache with TTL
class CacheService {
  private cache: Map<string, { data: any; expiry: number }>;
  private ttl = 30 * 60 * 1000; // 30 minutes
  
  get<T>(key: string): T | null;
  set<T>(key: string, data: T): void;
  has(key: string): boolean;
  invalidate(key: string): void;
}
```

---

## 7. LLM Prompt Strategy

### Master Prompt Structure

```
SYSTEM: You are a YouTube content strategy analyst. Analyze the following 
channel data and provide structured insights.

INPUT DATA:
- Channel: {name}, {subscribers} subscribers
- Videos Analyzed: {count}
- Video Data: [title, views, published_date, length] × N

ANALYSIS REQUIRED (respond in JSON):
1. content_themes: Categorize videos into 4-6 topic clusters with percentages
2. title_patterns: Common words, patterns, length analysis, emotional triggers  
3. publishing_strategy: Frequency, best days, consistency score
4. performance_insights: What makes top videos succeed vs underperform
5. recommendations: 5 actionable tips for someone competing in this niche
6. summary: 2-3 sentence executive summary

OUTPUT FORMAT: Strict JSON matching the AIAnalysis TypeScript interface.
```

### Prompt Optimization
- **Token efficiency:** Send only essential fields (title, views, date, length)
- **Structured output:** Request JSON response to avoid parsing issues
- **Temperature:** 0.3 (consistent, analytical output)
- **Max tokens:** 2000 (enough for detailed analysis)

---

## 8. Error Handling Strategy

```typescript
// Custom error types
class SerpApiError extends Error {
  constructor(public statusCode: number, message: string) {}
}

class AIAnalysisError extends Error {
  constructor(message: string, public rawResponse?: string) {}
}

class RateLimitError extends Error {
  constructor(public retryAfter: number) {}
}

// Error handling middleware pattern
async function withErrorHandling<T>(
  operation: () => Promise<T>,
  fallback?: T
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (error instanceof RateLimitError) {
      // Return cached data or show rate limit message
    }
    if (error instanceof SerpApiError) {
      // Log and return friendly error
    }
    if (fallback) return fallback;
    throw error;
  }
}
```

---

## 9. Environment Variables

```bash
# .env.local
SERPAPI_API_KEY=your_serpapi_key_here
GEMINI_API_KEY=your_gemini_key_here

# Optional
NEXT_PUBLIC_APP_URL=http://localhost:3000
CACHE_TTL_MINUTES=30
MAX_VIDEOS_TO_ANALYZE=50
AI_MODEL=gemini-1.5-flash
AI_TEMPERATURE=0.3
```

---

## 10. Deployment Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Vercel                            │
│                                                     │
│  ┌──────────────┐    ┌───────────────────────────┐  │
│  │  Edge Network │    │  Serverless Functions     │  │
│  │  (Static CDN) │    │  /api/search             │  │
│  │               │    │  /api/analyze             │  │
│  │  - HTML/CSS   │    │  /api/export             │  │
│  │  - JS bundles │    │                           │  │
│  │  - Images     │    │  Runtime: Node.js 20      │  │
│  │  - Fonts      │    │  Memory: 1024 MB          │  │
│  └──────────────┘    │  Timeout: 30s             │  │
│                      └───────────────────────────┘  │
│                                                     │
│  Environment Variables: SERPAPI_API_KEY, GEMINI_KEY  │
└─────────────────────────────────────────────────────┘
         │                         │
         ▼                         ▼
  ┌──────────────┐        ┌──────────────────┐
  │   SerpApi    │        │  Google Gemini   │
  │   Cloud      │        │  AI Platform     │
  └──────────────┘        └──────────────────┘
```

---

## 11. Performance Considerations

| Concern | Solution |
|---|---|
| Multiple SerpApi calls per analysis | Parallel video detail fetches with `Promise.all()` |
| LLM response time | Stream response for progressive loading |
| Large data payloads | Send only needed video fields to AI (not full objects) |
| Repeated analyses | In-memory cache with 30-min TTL |
| Chart rendering | Lazy-load Chart.js, render below fold |
| Bundle size | Dynamic imports for heavy components |
| Cold starts on Vercel | Keep functions lightweight, minimize dependencies |

---

## 12. Security

| Concern | Solution |
|---|---|
| API key exposure | Keys stored in `.env.local`, never sent to client |
| User input injection | Sanitize all search queries server-side |
| Rate limiting abuse | Server-side rate limiter (10 requests/min per IP) |
| CORS | Next.js API routes auto-handle same-origin |
| Error information leaks | Generic error messages to client, detailed logs server-side |
