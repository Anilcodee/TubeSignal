'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  BarChart3,
  Brain,
  Zap,
  TrendingUp,
  ArrowRight,
  ShieldCheck,
  PlaySquare,
  Search,
  CheckCircle2,
} from 'lucide-react';
import { SearchBar } from '@/components/search/SearchBar';
import styles from './page.module.css';

export default function Home() {
  const router = useRouter();
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (query: string) => {
    setIsSearching(true);
    // Sanitize handle/query
    const cleanId = query.replace(/^@/, '').trim().toLowerCase();
    router.push(`/analyze/${encodeURIComponent(cleanId)}`);
  };

  const handleDemoSelect = (channel: string) => {
    router.push(`/analyze/${channel}?demo=true`);
  };

  return (
    <div className={styles.main}>
      {/* Ambient Glows */}
      <div className={styles.ambientGlowTop} />
      <div className={styles.ambientGlowRight} />

      {/* Hero Section */}
      <section className={styles.heroSection}>
        <div className={styles.badgeRow}>
          <div className={styles.heroBadge}>
            <Sparkles size={14} />
            <span>SerpApi India Hackathon 2026 • Knowledge & Public Interest</span>
          </div>
        </div>

        <h1 className={styles.heroTitle}>
          Decode Any Creator’s <br />
          <span className={styles.gradientText}>Content Strategy</span> with AI
        </h1>

        <p className={styles.heroSubtitle}>
          Paste any YouTube channel name to generate an AI-powered intelligence brief in 30
          seconds. Uncover topic themes, title formulas, upload cadence, and competitive
          performance data.
        </p>

        <div className={styles.searchContainer}>
          <SearchBar onSearch={handleSearch} isLoading={isSearching} />
        </div>

        <div className={styles.demoBanner}>
          <ShieldCheck size={16} color="#7c5cfc" />
          <span>
            Instant Demo Available:{' '}
            <button
              type="button"
              className={styles.demoLink}
              onClick={() => handleDemoSelect('mkbhd')}
            >
              Marques Brownlee (MKBHD)
            </button>{' '}
            or{' '}
            <button
              type="button"
              className={styles.demoLink}
              onClick={() => handleDemoSelect('fireship')}
            >
              Fireship
            </button>
          </span>
        </div>
      </section>

      {/* How It Works */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>How It Works</span>
          <h2 className={styles.sectionTitle}>From Raw Search to AI Intelligence</h2>
        </div>

        <div className={styles.stepsGrid}>
          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>1</div>
            <h3 className={styles.stepTitle}>Channel Discovery</h3>
            <p className={styles.stepDesc}>
              Search for any YouTube creator by name or @handle. SerpApi instantly resolves
              the official channel ID, subscriber count, and metadata.
            </p>
          </div>

          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>2</div>
            <h3 className={styles.stepTitle}>Live Data Extraction</h3>
            <p className={styles.stepDesc}>
              Fetches recent uploads, duration, view statistics, and detailed top-performing
              video metrics directly from SerpApi YouTube engines.
            </p>
          </div>

          <div className={styles.stepCard}>
            <div className={styles.stepNumber}>3</div>
            <h3 className={styles.stepTitle}>AI Strategy Synthesis</h3>
            <p className={styles.stepDesc}>
              Google Gemini AI analyzes title formulas, clusters content themes, detects upload
              patterns, and outputs actionable competitive recommendations.
            </p>
          </div>
        </div>
      </section>

      {/* SerpApi Engine Integrations Showcase */}
      <section className={styles.enginesSection}>
        <div className={styles.enginesContainer}>
          <span className={styles.sectionLabel}>SerpApi Architecture</span>
          <h2 className={styles.sectionTitle}>Powered by 3 SerpApi YouTube Engines</h2>
          <div className={styles.enginesGrid}>
            <div className={styles.engineCard}>
              <span className={styles.engineCode}>engine=youtube</span>
              <h4 className={styles.engineTitle}>Channel Search & Discovery</h4>
              <p className={styles.engineDesc}>
                Fuzzy search queries to identify exact creator profiles, handles, and avatar
                assets in real-time.
              </p>
            </div>

            <div className={styles.engineCard}>
              <span className={styles.engineCode}>engine=youtube_channel</span>
              <h4 className={styles.engineTitle}>Channel Metadata & Video Feed</h4>
              <p className={styles.engineDesc}>
                Extracts complete upload histories, view counts, upload dates, and duration
                information.
              </p>
            </div>

            <div className={styles.engineCard}>
              <span className={styles.engineCode}>engine=youtube_video</span>
              <h4 className={styles.engineTitle}>Deep Video Analytics</h4>
              <p className={styles.engineDesc}>
                Parallel deep-dives into top 5 highest-viewed videos to extract precise engagement
                metrics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionLabel}>Key Capabilities</span>
          <h2 className={styles.sectionTitle}>Everything You Need to Analyze YouTube Channels</h2>
        </div>

        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIconWrapper}>
              <Brain size={24} />
            </div>
            <div className={styles.featureContent}>
              <h3 className={styles.featureTitle}>AI Content Theme Clustering</h3>
              <p className={styles.featureDesc}>
                Gemini AI categorizes hundreds of video titles into 4-6 high-level content
                pillars with exact distribution percentages.
              </p>
            </div>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIconWrapper}>
              <BarChart3 size={24} />
            </div>
            <div className={styles.featureContent}>
              <h3 className={styles.featureTitle}>Interactive Data Visualizations</h3>
              <p className={styles.featureDesc}>
                Beautiful Chart.js graphs for views distribution, publishing timeline cadence,
                and duration vs. performance scatter plots.
              </p>
            </div>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIconWrapper}>
              <Zap size={24} />
            </div>
            <div className={styles.featureContent}>
              <h3 className={styles.featureTitle}>Title Pattern & Emotional Triggers</h3>
              <p className={styles.featureDesc}>
                Reverse-engineers the creator’s title structures, character lengths, number
                usage, and psychological emotional hooks.
              </p>
            </div>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIconWrapper}>
              <TrendingUp size={24} />
            </div>
            <div className={styles.featureContent}>
              <h3 className={styles.featureTitle}>Competitive Action Items</h3>
              <p className={styles.featureDesc}>
                Get 5 tailored, practical recommendations if you want to compete or collaborate
                in the creator’s specific niche.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
