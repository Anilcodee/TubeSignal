# TubeSignal

TubeSignal is a focused YouTube creator research workspace. Enter a creator name, `@handle`, channel URL, or channel ID to inspect a bounded set of public uploads, compare observable metadata, and turn the result into a cautious strategy brief.

The product is intentionally explicit about what public metadata can and cannot show: lifetime views are not a growth series, and the report does not claim to know retention, click-through rate, revenue, audience demographics, or causation.

## What it does

- Discovers channels through SerpApi's YouTube search engine.
- Fetches a channel profile and recent video catalog through SerpApi's YouTube channel engine.
- Normalizes titles, view counts, durations, thumbnails, identifiers, and publication dates.
- Opens with a visual-first workspace, an animated CSS-only 3D signal sculpture, and three clearly labeled sample reports.
- Organizes the responsive report into three keyboard-accessible views:
  - **At a glance:** a 60-second brief, standout upload, median view comparison, key metrics, and expandable next steps;
  - **Content patterns:** title length and recurring structures, plus duration and publishing-date charts;
  - **All uploads:** ranked videos with cumulative views and median comparisons.
- Keeps detailed interpretation and data limitations available on demand instead of stacking every paragraph on the first screen.
- Supports optional Gemini-assisted narrative wording when a Gemini key is configured, with a clearly labeled calculated fallback.
- Respects reduced-motion preferences and uses no additional animation or 3D dependencies.
- Includes three offline sample reports (MKBHD, Fireship, and Veritasium) that do not make network requests.
- Supports keyboard-accessible search results, honest indeterminate loading states, retry, copy-link sharing, and **Save view** (print the selected report view to PDF).

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

TubeSignal keeps the provider boundary server-side:

| Engine | Used for | Key input |
| --- | --- | --- |
| `youtube` | Creator/channel discovery | `search_query` plus the channel filter |
| `youtube_channel` | Channel profile and recent uploads | `channel_id`, `tab=videos`, latest uploads |

Responses are cached in a bounded process-local TTL/LRU cache and identical in-flight requests are coalesced. A small in-process request guard also limits concurrent and burst requests. These protections are not a replacement for a distributed rate limiter when deployed across multiple workers.

## AI behavior and disclosure

Gemini is used only for a short narrative rewrite and recommendations based on the server-computed baseline. The baseline owns numeric observations, title-pattern counts, publication-date limitations, and performance traits. Responses are schema-checked, constrained against new numeric claims and unsupported causal claims, and safely replaced by the computed fallback if Gemini is missing, unavailable, or invalid.

This project was developed with AI coding assistance. The assistant was used for repository exploration, implementation suggestions, and code review; the final application behavior, data boundaries, and checks are maintained in this repository.

## API examples

Direct sample analysis requires no credentials:

```bash
curl -X POST http://localhost:3000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"channelId":"mkbhd","isDemo":true}'
```

Search a live name (requires `SERPAPI_API_KEY`):

```bash
curl -X POST http://localhost:3000/api/search \
  -H "Content-Type: application/json" \
  -d '{"query":"Marques Brownlee"}'
```

All request bodies are validated and bounded. Error responses are JSON objects with an `error` message; the server does not return upstream payloads or provider URLs containing credentials.

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

TubeSignal can be deployed as a standard Next.js application on Vercel or another Node-compatible host:

```bash
npm run build
npm run start
```

Set `SERPAPI_API_KEY` and, optionally, `GEMINI_API_KEY` / `GEMINI_MODEL` in the host's server-side environment settings. The in-memory cache and request guard are per process; use an external cache and distributed rate limiter if the application is scaled beyond a single process.

## Scope and data boundaries

- Reports use the public uploads returned by the provider, not a complete channel history.
- View counts are cumulative and videos have different ages.
- Relative publication dates are marked approximate and are not used as weekday evidence.
- Missing counts, dates, durations, and thumbnails remain unavailable instead of being fabricated.
- Sample reports are static illustrative fixtures and are not current or verified YouTube data.
- Transcript analysis, comments, historical tracking, authentication, and multi-channel comparison are out of scope for this version.
