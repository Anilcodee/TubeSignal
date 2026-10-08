'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  Zap, 
  Calendar, 
  Check, 
  Flame, 
  Copy
} from 'lucide-react';
import type { VideoData, AIAnalysis } from '@/types/analysis';
import { analyzeChannelGrowth } from '@/utils/growth-analyzer';
import styles from './GrowthPlaybook.module.css';

interface GrowthPlaybookProps {
  videos: VideoData[];
  medianViews: number;
  aiAnalysis?: AIAnalysis;
}

type GrowthLens = 'duration' | 'titles' | 'schedule' | 'concepts';

const LENSES = [
  { id: 'duration' as const, label: 'Video Length', Icon: Clock },
  { id: 'titles' as const, label: 'Title Packaging', Icon: Zap },
  { id: 'schedule' as const, label: 'Release Windows', Icon: Calendar },
  { id: 'concepts' as const, label: 'Content Ideas', Icon: Flame },
];

export const GrowthPlaybook = ({ videos, medianViews, aiAnalysis }: GrowthPlaybookProps) => {
  const [activeLens, setActiveLens] = useState<GrowthLens>('duration');
  const [copiedTopic, setCopiedTopic] = useState<string | null>(null);

  const insights = analyzeChannelGrowth(videos, medianViews, aiAnalysis);

  if (!videos.length) return null;

  const handleCopyTopic = (topic: string) => {
    navigator.clipboard.writeText(`Video Concept Outline for "${topic}": Focus on viewer questions, comparisons, and key takeaways.`);
    setCopiedTopic(topic);
    setTimeout(() => setCopiedTopic(null), 2000);
  };

  const activeTiers = insights.durationTiers.filter(t => t.count > 0);
  const maxTierAvg = Math.max(...activeTiers.map(t => t.avgViews), 1);
  const activeFormulas = insights.titleFormulas.filter(f => f.count > 0);
  const maxDayVideos = Math.max(...insights.publishingDays.map(d => d.videoCount), 1);

  return (
    <section className={styles.section} aria-label="What Drives Growth">
      {/* ── Studio Header & Integrated Segment Switcher ── */}
      <div className={styles.header}>
        <div>
          <h2 className={styles.title}>What Drives Growth</h2>
          <p className={styles.subtitle}>
            Empirical levers identified across video length, title packaging, and publishing timing.
          </p>
        </div>

        {/* ── Segmented Studio Tabs (Bklit / Linear style) ── */}
        <div className={styles.tabTrack} role="tablist" aria-label="Growth dimensions">
          {LENSES.map(({ id, label, Icon }) => {
            const isActive = activeLens === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`${styles.tabBtn} ${isActive ? styles.tabBtnActive : ''}`}
                onClick={() => setActiveLens(id)}
              >
                <Icon size={14} />
                <span>{label}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeGrowthTab"
                    className={styles.tabGlow}
                    transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Focused Studio Canvas ── */}
      <div className={styles.canvasWrapper}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeLens}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.16, ease: 'easeOut' }}
            className={styles.canvas}
          >
            {/* ═══ LENS 1: DURATION ═══ */}
            {activeLens === 'duration' && (
              <div className={styles.lensLayout}>
                <div className={styles.metricStrip}>
                  <div className={styles.metricItem}>
                    <span className={styles.metricLabel}>Optimal Duration</span>
                    <span className={styles.metricValue} style={{ color: 'var(--accent)' }}>
                      {insights.winningDuration?.rangeText || '15–30 mins'}
                    </span>
                  </div>
                  <div className={styles.metricItem}>
                    <span className={styles.metricLabel}>Performance Lift</span>
                    <span className={styles.metricValue}>
                      {insights.winningDuration ? `${insights.winningDuration.viewMultiplier}× median` : 'Higher views'}
                    </span>
                  </div>
                  <div className={styles.metricItem}>
                    <span className={styles.metricLabel}>Sample Density</span>
                    <span className={styles.metricValue}>
                      {insights.winningDuration?.count ?? 0} uploads in sample
                    </span>
                  </div>
                </div>

                {/* Minimalist Tier Performance Bars */}
                <div className={styles.tierGrid}>
                  {activeTiers.map((tier) => {
                    const width = Math.max(12, (tier.avgViews / maxTierAvg) * 100);
                    return (
                      <div key={tier.id} className={styles.tierItem}>
                        <div className={styles.tierTop}>
                          <span className={`${styles.tierLabel} ${tier.isWinner ? styles.tierLabelWinner : ''}`}>
                            {tier.label}
                            {tier.isWinner && <span className={styles.winnerBadge}>Top Performer</span>}
                          </span>
                          <span className={styles.tierStat}>
                            <strong>{tier.avgViewsFormatted}</strong> views ({tier.viewMultiplier}× typical)
                          </span>
                        </div>
                        <div className={styles.tierTrack}>
                          <motion.div
                            className={`${styles.tierFill} ${tier.isWinner ? styles.tierFillWinner : ''}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${width}%` }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ═══ LENS 2: TITLE PACKAGING ═══ */}
            {activeLens === 'titles' && (
              <div className={styles.lensLayout}>
                <div className={styles.metricStrip}>
                  <div className={styles.metricItem}>
                    <span className={styles.metricLabel}>Lead Hook Pattern</span>
                    <span className={styles.metricValue} style={{ color: '#60a5fa' }}>
                      {insights.topFormula?.badge || 'Structured'}
                    </span>
                  </div>
                  <div className={styles.metricItem}>
                    <span className={styles.metricLabel}>Win Rate</span>
                    <span className={styles.metricValue}>
                      {insights.topFormula?.winRate || 75}% beat typical
                    </span>
                  </div>
                  <div className={styles.metricItem}>
                    <span className={styles.metricLabel}>View Multiplier</span>
                    <span className={styles.metricValue}>
                      {insights.topFormula?.avgMultiplier || 1.3}× typical views
                    </span>
                  </div>
                </div>

                <div className={styles.formulaList}>
                  {activeFormulas.map((formula) => {
                    const color = formula.accentColor;
                    return (
                      <div key={formula.id} className={styles.formulaRow}>
                        <div className={styles.formulaRowTop}>
                          <span className={styles.formulaTag} style={{ color, borderColor: color }}>
                            {formula.badge}
                          </span>
                          <span className={styles.formulaStat}>
                            <strong>{formula.winRate}%</strong> win rate ({formula.avgMultiplier}× views)
                          </span>
                        </div>
                        <div className={styles.tierTrack}>
                          <motion.div
                            className={styles.tierFill}
                            style={{ background: color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.max(8, formula.winRate)}%` }}
                            transition={{ duration: 0.5, ease: 'easeOut' }}
                          />
                        </div>
                        {formula.sampleTitles[0] && (
                          <div className={styles.sampleQuote}>
                            &ldquo;{formula.sampleTitles[0]}&rdquo;
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ═══ LENS 3: RELEASE WINDOWS ═══ */}
            {activeLens === 'schedule' && (
              <div className={styles.lensLayout}>
                <div className={styles.metricStrip}>
                  <div className={styles.metricItem}>
                    <span className={styles.metricLabel}>Momentum Day</span>
                    <span className={styles.metricValue} style={{ color: '#34d399' }}>
                      {insights.hasExactDates ? insights.peakPublishingDay : 'Mid-Week'}
                    </span>
                  </div>
                  <div className={styles.metricItem}>
                    <span className={styles.metricLabel}>Velocity Lift</span>
                    <span className={styles.metricValue}>
                      {insights.hasExactDates ? `${insights.peakLiftMultiplier}× typical` : 'Approximate dates'}
                    </span>
                  </div>
                  <div className={styles.metricItem}>
                    <span className={styles.metricLabel}>Active Windows</span>
                    <span className={styles.metricValue}>
                      {insights.publishingDays.filter(d => d.videoCount > 0).length} of 7 days
                    </span>
                  </div>
                </div>

                {insights.hasExactDates ? (
                  <div className={styles.equalizerTrack}>
                    {insights.publishingDays.map((day) => {
                      const intensity = day.videoCount > 0 ? (day.videoCount / maxDayVideos) : 0;
                      const barHeightPct = day.videoCount > 0 ? Math.max(16, intensity * 100) : 6;

                      return (
                        <div key={day.shortName} className={styles.equalizerCol}>
                          <div className={styles.equalizerBarBox}>
                            {day.isPeak && day.liftMultiplier > 1 && (
                              <span className={styles.equalizerPeakTag}>
                                {day.liftMultiplier}×
                              </span>
                            )}
                            <motion.div
                              className={`${styles.equalizerBar} ${day.isPeak ? styles.equalizerBarPeak : ''}`}
                              initial={{ height: 0 }}
                              animate={{ height: `${barHeightPct}%` }}
                              whileHover={{ scaleY: 1.08, originY: 1 }}
                              transition={{ duration: 0.4 }}
                              style={{ opacity: day.videoCount > 0 ? 1 : 0.25 }}
                            />
                          </div>
                          <span className={`${styles.equalizerLabel} ${day.isPeak ? styles.equalizerLabelPeak : ''}`}>
                            {day.shortName}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className={styles.emptyNote}>
                    Exact release weekdays require specific calendar timestamps.
                  </p>
                )}
              </div>
            )}

            {/* ═══ LENS 4: CONTENT CONCEPTS ═══ */}
            {activeLens === 'concepts' && (
              <div className={styles.lensLayout}>
                <div className={styles.metricStrip}>
                  <div className={styles.metricItem}>
                    <span className={styles.metricLabel}>Top Content Demand</span>
                    <span className={styles.metricValue} style={{ color: '#a78bfa' }}>
                      {insights.audiencePulse.contentDemands[0]?.topic || 'Reviews & Teardowns'}
                    </span>
                  </div>
                  <div className={styles.metricItem}>
                    <span className={styles.metricLabel}>Audience Appetite</span>
                    <span className={styles.metricValue}>
                      High Market Demand
                    </span>
                  </div>
                  <div className={styles.metricItem}>
                    <span className={styles.metricLabel}>Opportunities</span>
                    <span className={styles.metricValue}>
                      {insights.audiencePulse.contentDemands.length} strategic themes
                    </span>
                  </div>
                </div>

                <div className={styles.conceptDeck}>
                  {insights.audiencePulse.contentDemands.slice(0, 3).map((demand, idx) => {
                    const isCopied = copiedTopic === demand.topic;
                    return (
                      <button
                        key={idx}
                        type="button"
                        className={styles.conceptCard}
                        onClick={() => handleCopyTopic(demand.topic)}
                        title="Click to copy concept outline to clipboard"
                      >
                        <div className={styles.conceptCardTop}>
                          <span className={styles.conceptTitle}>{demand.topic}</span>
                          <span className={styles.conceptBadge}>
                            {isCopied ? <Check size={11} /> : <Copy size={11} />}
                            {isCopied ? 'Copied' : demand.demandLevel}
                          </span>
                        </div>
                        <p className={styles.conceptDesc}>{demand.reason}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
};
