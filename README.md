# TubeSignal

TubeSignal is a focused YouTube creator research workspace. Enter a creator name, `@handle`, channel URL, or channel ID to inspect a bounded set of public uploads, compare observable metadata, analyze video hook scripts, compare creators head-to-head, and turn the result into a cautious strategy brief.

The product is intentionally explicit about what public metadata can and cannot show: lifetime views are not a growth series, and the report does not claim to know retention, click-through rate, revenue, audience demographics, or causation.

## What it does

- **3-Engine SerpApi Integration**:
  - `youtube`: Creator and channel discovery with instant fuzzy matching.
  - `youtube_channel`: Comprehensive channel metadata and latest public uploads catalog.
  - `youtube_video_transcript`: Speech intelligence, opening 40-second hook breakdowns, and pacing metrics.
- **Creator Faceoff (`/compare`)**: Side-by-side comparative analysis between two creators with real-time KPI matrix, advantage indicators, and head-to-head verdict.
- **Visual Intelligence Workspace**: Interactive 3D signal sculpture, instant sample presets, and zero-clutter research console.
- **Organized 4-View Deep Dive**:
  - **At a glance**: 60-second executive brief, standout upload spotlight, median view baseline, KPI strip, and actionable next steps.
  - **Content patterns**: Title length distribution, recurring packaging formulas, duration vs. views scatter plot, and monthly publishing cadence.
  - **Hook & Script Lab**: Speech intelligence powered by video transcripts—analyzing 40s opening hook archetypes (Story/Curiosity/Direct/Contrarian), words-per-minute (WPM) pacing, high-retention power words, and interactive transcript search.
  - **All uploads**: Full public upload catalog ranked by views, accompanied by velocity badges and direct links.
- **Multi-Format Dossier Export**: Generate self-contained offline HTML dossiers, structured Markdown briefs, or raw JSON datasets—no `window.print()` workarounds.
- **Native Sharing**: Web Share API integration, 1-click clipboard summary cards, and quick sharing to X (Twitter) and LinkedIn.
- **Multi-Tier API Preservation**: Browser `sessionStorage` cache (0ms reloads on refresh/navigation without burning API credits), server-side LRU memory cache, and strict rate limiting via `PaidRequestGuard`.
- **Gemini AI + Statistical Fallback**: Grounded narrative observations via Gemini 1.5 Flash with mathematical, deterministic fallbacks when unconfigured or rate-limited.
- **Offline Sample Reports**: 100% offline demonstration fixtures for MKBHD, Fireship, and Veritasium that require zero API keys.

## Run locally

Requirements:

- Node.js 20 or newer
- npm
- A SerpApi key for live channel discovery and analysis
- A Gemini key is optional; without it, TubeSignal uses the computed observational fallback

```bash
npm install
copy .env.example .env.local # Windows
# cp .env.example .env.local # macOS/Linux
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The sample report links work without either API key.

### Environment variables

```dotenv
SERPAPI_API_KEY=your_serpapi_key_here
GEMINI_API_KEY=your_gemini_key_here
# Optional; defaults to gemini-1.5-flash
GEMINI_MODEL=gemini-1.5-flash
```

Keys are read only by server-side route handlers and services. Do not prefix them with `NEXT_PUBLIC_` and do not commit `.env.local`.

## Search and report flow

1. Search a creator name to receive verified channel candidates from `/api/search`.
2. Choose a result, or submit a known `@handle`, `UC...` channel ID, or supported YouTube channel URL directly.
3. TubeSignal calls `/api/analyze`, fetches the public channel catalog, and limits the normalized catalog to the returned sample (at most 50 uploads).
4. The UI labels whether the report is live public data or an illustrative fixture and whether the narrative came from Gemini or the computed fallback.

The workspace’s direct identifier path bypasses discovery and verifies the channel during analysis; creator names first return search candidates.

## SerpApi usage

TubeSignal leverages 3 distinct SerpApi engines to provide deep, reliable creator intelligence:

| Engine | Used for | Key input |
| --- | --- | --- |
| `youtube` | Creator/channel discovery and search | `search_query` plus channel filter (`sp=EgIQAg%3D%3D`) |
| `youtube_channel` | Channel profile, statistics, and latest public uploads | `channel_id`, `tab=videos`, `sort=latest` |
| `youtube_video_transcript` | Speech intelligence, opening 40s hook breakdowns, speech pacing | `v` (YouTube video ID) |

Responses are cached in a bounded process-local TTL/LRU cache and identical in-flight requests are coalesced. A dedicated in-process `PaidRequestGuard` limits concurrent and burst requests to protect quota (max 20 SerpApi calls/min, 10 Gemini calls/min).

## AI behavior and disclosure

Gemini 1.5 Flash is used only for a focused narrative brief and recommendations grounded in the server-computed baseline. The baseline strictly controls numeric observations, title-pattern metrics, publication-date calculations, and performance traits. Responses are schema-checked, constrained against fabricated metric claims (such as retention or CTR promises), and safely replaced by the deterministic computed fallback if Gemini is unconfigured, rate-limited, or invalid.

This project was developed with AI coding assistance. The assistant was used for repository exploration, implementation suggestions, and code review; the final application behavior, data boundaries, and checks are maintained in this repository.

## API examples

Direct sample analysis requires no credentials:

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"channelId":"mkbhd","isDemo":true}'
```

Search a live channel name (requires `SERPAPI_API_KEY`):

```bash
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query":"Marques Brownlee"}'
```

Retrieve video hook and transcript intelligence (requires `SERPAPI_API_KEY` or sample flag):

```bash
curl -X POST http://localhost:3000/api/transcript \
  -H "Content-Type: application/json" \
  -d '{"videoId":"dQw4w9WgXcQ","isDemo":true}'
```

All request bodies are validated and bounded. Error responses are clean JSON objects with an `error` message; the server never returns upstream payloads or URLs containing API credentials.

## Checks

Run the repository checks from the project root:

```bash
npm run lint
node scripts/backend-checks.mjs
node scripts/backend-checks.mjs --typecheck
npm run build
```

The backend check script uses mocked provider responses, so it never spends API credits. It covers identifier validation, sample provenance, request limits, numeric/date parsing, cache and quota behavior, provider failures, concurrent request coalescing, and Gemini response validation.

## Deployment

TubeSignal is production-ready for deployment as a standard Next.js application on Vercel or any Node.js host:

```bash
npm run build
npm run start
```

Set `SERPAPI_API_KEY` and, optionally, `GEMINI_API_KEY` / `GEMINI_MODEL` in the host's server-side environment variables.

## Scope and data boundaries

- Reports analyze the latest public video uploads returned by the provider (typically 30 uploads), not an infinite channel archive.
- View counts are cumulative and uploads naturally have different ages.
- Relative publication dates are marked approximate and are not treated as precise weekday evidence.
- Missing counts, dates, durations, and thumbnails remain cleanly labeled as "Unavailable" instead of being fabricated.
- Sample reports are static illustrative fixtures and do not consume live network requests.
- Private creator metrics (click-through rates, audience retention percentages, YouTube Studio revenue) are never guessed or simulated.
