# TubeSignal — Product Requirements Document (PRD)

> **Version:** 2.0  
> **Last Updated:** October 2, 2026  
> **Author:** Anil  
> **Hackathon:** SerpApi India Hackathon 2026  
> **Deadline:** October 10, 2026, 23:59 IST  
> **Track:** Knowledge & Public Interest (Education / Research)  

---

## 1. Executive Summary

**TubeSignal** is an AI-powered YouTube creator intelligence and research workspace. By harnessing 3 SerpApi YouTube engines (`youtube`, `youtube_channel`, and `youtube_video_transcript`), TubeSignal extracts real-time creator profiles, upload catalogs, and video hook scripts. It couples these observations with Google Gemini AI to generate actionable, cautious strategy briefs without false metrics or algorithm myths.

---

## 2. Problem Statement

### The Creator Pain
- **Aspiring Creators & Teams** spend hours manually reverse-engineering top channels, guessing why opening hooks work or what publishing cadences succeed.
- **Brand Marketers & Sponsors** need unbiased competitive intelligence before sponsoring channels.
- **Researchers & Educators** lack structured, honest tools that analyze public creator catalogs without requiring private YouTube Studio access.

### The Gap in Existing Tools
- Traditional analytics tools (Social Blade, VidIQ) are cluttered with ads, paywalled, or present vanity growth projections.
- No existing tool combines **live search discovery**, **speech hook intelligence**, and **multi-channel faceoff** in a single, glanceable research console.

---

## 3. Product Vision & Principles

> *"Paste a YouTube handle or creator name — receive an executive content strategy dossier and speech hook breakdown in seconds."*

1. **Honesty Over Hype**: Public data is bounded. Lifetime views do not equal growth rate, and public catalogs cannot see retention curves or CTRs. TubeSignal is transparent about what public data proves.
2. **Speed & Efficiency**: Instant multi-tier caching (client `sessionStorage` + server LRU cache) ensures 0ms reloads and zero wasted API credits.
3. **Actionable Insights**: Direct takeaways on video duration, hook archetype pacing, title structure, and competitive advantages.

---

## 4. Implemented Feature Matrix

| Feature | Description | Status |
|---|---|---|
| **Channel Discovery** | Fuzzy search by creator name or handle via SerpApi `youtube` engine | ✅ Complete |
| **Direct Analysis** | Direct URL, `@handle`, or channel ID resolution via SerpApi `youtube_channel` | ✅ Complete |
| **Executive Verdict** | 60-second summary, standout upload spotlight, and median view ratio | ✅ Complete |
| **KPI Matrix** | Median views, upload cadence, estimated weekly views, and views-to-sub ratio | ✅ Complete |
| **Content Patterns** | Title character length analysis, recurring packaging formulas, duration scatter plot | ✅ Complete |
| **Hook & Script Lab** | Speech intelligence via SerpApi `youtube_video_transcript`—analyzing 40s opening hook archetypes, WPM pacing, and power words | ✅ Complete |
| **Creator Faceoff (`/compare`)** | Head-to-head comparison between two creators with real-time KPI matrix and advantage badges | ✅ Complete |
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
- **Technical Rigor**: 3 SerpApi engines integrated, Turbopack Next.js build, strict TypeScript types, 0 lint warnings.
- **Aesthetic Excellence**: Dark-mode glassmorphism, responsive data charts, zero layout shift, bespoke 3D signal sculpture.
