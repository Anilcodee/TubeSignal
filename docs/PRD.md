# TubeSignal — Product Requirements Document (PRD)

> **Version:** 2.3
> **Last Updated:** October 10, 2026
> **Author:** Anil  
> **Hackathon:** SerpApi India Hackathon 2026  
> **Deadline:** October 10, 2026, 23:59 IST  
> **Track:** Knowledge & Public Interest (Education / Research)  

---

## 1. Executive Summary

**TubeSignal** is an AI-powered YouTube creator intelligence and research workspace. By harnessing 3 SerpApi YouTube engines (`youtube`, `youtube_channel`, and `youtube_video_transcript`), TubeSignal extracts real-time creator profiles, upload catalogs, and video hook scripts. It couples these observations with Google Gemini AI to generate actionable, cautious strategy briefs without false metrics or algorithm myths, while separating lifetime totals from age-adjusted velocity snapshots.

---

## 2. Problem Statement

### The Creator Pain
- **Aspiring Creators & Teams** spend hours manually reverse-engineering top channels, guessing why opening hooks work or what publishing cadences succeed.
- **Brand Marketers & Sponsors** need unbiased competitive intelligence before sponsoring channels.
- **Researchers & Educators** lack structured, honest tools that analyze public creator catalogs without requiring private YouTube Studio access.

### The Gap in Existing Tools
- Traditional analytics tools (Social Blade, VidIQ) are cluttered with ads, paywalled, or present vanity growth projections.
- No existing tool combines **live search discovery**, **speech hook intelligence**, and **multi-channel faceoff** in a single, glanceable research console with absolute data honesty.

---

## 3. Product Vision & Principles

> *"Paste a YouTube handle or creator name — receive an executive content strategy dossier and speech hook breakdown in seconds."*

1. **Honesty Over Hype**: Public data is bounded. Lifetime views do not equal growth rate, and public catalogs cannot see retention curves or CTRs. TubeSignal is transparent about what public data proves, pairs view totals with video age, and discloses sample sizes.
2. **Speed & Efficiency**: Instant multi-tier caching (client `sessionStorage` + server LRU cache) ensures 0ms reloads and zero wasted API credits.
3. **Actionable Insights**: Direct takeaways on video duration, hook archetype pacing, title structure, and competitive advantages.
4. **Calm & Scannable Interface**: Dark graphite surfaces with signal-amber accents, unified hairline panels, SVG sparklines, and guided cross-tab exploration.
5. **Evidence Before Inference**: Every comparison identifies whether a number is a mean, median, age-adjusted snapshot, transcript heuristic, or unavailable observation.

---

## 4. Implemented Feature Matrix

| Feature | Description | Status |
|---|---|---|
| **Channel Discovery** | Fuzzy search by creator name or handle via SerpApi `youtube` engine | ✅ Complete |
| **Direct Analysis** | Direct URL, `@handle`, or channel ID resolution via SerpApi `youtube_channel` | ✅ Complete |
| **Executive Verdict** | Inline 2-sentence TL;DR, standout spotlight with `{ratio}× typical` badge, inline age caveats, and full text in `<details>` | ✅ Complete |
| **Unified KPI Panel** | 4-cell hairline panel with SVG sparklines, median views, upload pace (`~X / week`), and reduced-motion support | ✅ Complete |
| **Content Patterns** | Title character length analysis, small-sample count gating (`n >= 4` sweet spot), example titles, and duration scatter plot | ✅ Complete |
| **Hook & Script Lab** | Speech intelligence via SerpApi `youtube_video_transcript`—analyzing 40s opening hook archetypes, psychological "Why it works" explanations, qualitative WPM scale bar (`<130 deliberate • 130–165 conversational • >165 high-energy`), and `★ Standout` top-video badges | ✅ Complete |
| **Video Catalog Table** | Public upload catalog ranked by views or age-adjusted pace (`~views/day`), relative age column (`24d`, `3mo`, `1.2y`), accessible inline playback, and outlier tooltips | ✅ Complete |
| **Age-Adjusted Velocity** | Median lifetime views divided by publishing age, excluding unknown dates and labeling approximate dates | ✅ Complete |
| **Creator Faceoff (`/compare`)** | Head-to-head comparison between two creators with mean/median views, velocity, cadence, duration, content focus, and advantage signals | ✅ Complete |
| **Channel Hook Comparison** | Lazy analysis of up to three leading openings per creator with archetype, WPM, duration, question rate, and direct-address rate | ✅ Complete |
| **Shareable Report Workflow** | URL-persisted Overview, Patterns, Hook & Script, and Videos tabs with progressive disclosure and focused evidence controls | ✅ Complete |
| **Provenance Indicator** | Header badge disclosing live vs sample fixture, upload count `n=`, and Gemini AI vs deterministic calculation | ✅ Complete |
| **Standalone Dossier Export** | Downloadable offline HTML dossier, structured Markdown, and raw JSON export | ✅ Complete |
| **Native Sharing** | Web Share API integration, clipboard summary cards, X/Twitter & LinkedIn sharing | ✅ Complete |
| **Quota & Rate Guard** | In-process concurrency limiter and burst protection (20 SerpApi/min, 10 Gemini/min) | ✅ Complete |
| **Client Session Caching** | Browser `sessionStorage` saves completed analyses; F5 refreshes consume 0 API credits | ✅ Complete |
| **Offline Sample Reports** | 100% offline demonstration fixtures for MKBHD, Fireship, and Veritasium | ✅ Complete |

---

## 5. 3 SerpApi Engines

1. `youtube`: Discovers channels from free-form creator names with verified avatar and subscriber badges.
2. `youtube_channel`: Ingests the public video catalog (latest 30 uploads) and channel metadata.
3. `youtube_video_transcript`: Ingests video speech segments to compute opening 40-second hook archetypes and pacing metrics.

---

## 6. Success Metrics & Hackathon Rubric Alignment

- **Innovation & Track Fit**: Fits the Knowledge & Public Interest track by democratizing transparent creator research.
- **Technical Rigor**: 3 SerpApi engines integrated, Turbopack Next.js build, strict TypeScript types, 0 lint warnings, 17/17 backend checks, UI contract checks, and Playwright/Axe browser coverage.
- **Aesthetic Excellence**: Dark-mode graphite surfaces, responsive data charts, zero layout shift, bespoke 3D signal sculpture, scannable numbers.
