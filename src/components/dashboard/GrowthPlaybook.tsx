'use client';

import { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { 
  Clock, 
  Zap, 
  Calendar, 
  Sparkles, 
  Check, 
  Flame, 
  TrendingUp, 
  ArrowRight
} from 'lucide-react';
import type { VideoData, AIAnalysis } from '@/types/analysis';
import { analyzeChannelGrowth } from '@/utils/growth-analyzer';
import styles from './GrowthPlaybook.module.css';

interface GrowthPlaybookProps {
  videos: VideoData[];
  medianViews: number;
  aiAnalysis?: AIAnalysis;
}

export const GrowthPlaybook = ({ videos, medianViews, aiAnalysis }: GrowthPlaybookProps) => {
  const [copiedTopic, setCopiedTopic] = useState<string | null>(null);

  const insights = analyzeChannelGrowth(videos, medianViews, aiAnalysis);

  if (!videos.length) return null;

  const handleCopyTopic = (topic: string) => {
    navigator.clipboard.writeText(`Video Concept Outline for "${topic}": Focus on viewer questions, comparisons, and key takeaways.`);
    setCopiedTopic(topic);
    setTimeout(() => setCopiedTopic(null), 2000);
  };

  // Only take active duration tiers (count > 0)
  const activeTiers = insights.durationTiers.filter(t => t.count > 0);
  const maxTierAvg = Math.max(...activeTiers.map(t => t.avgViews), 1);

  // Active formulas (count > 0)
  const activeFormulas = insights.titleFormulas.filter(f => f.count > 0);

  // Max video count for day bars
  const maxDayVideos = Math.max(...insights.publishingDays.map(d => d.videoCount), 1);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.08 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 12 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 320, damping: 26 } }
  };

  return (
    <section className={styles.container} aria-label="Actionable Creator Playbook">
      {/* ── Section Header ── */}
      <div className={styles.sectionHeader}>
        <div>
          <span className={styles.eyebrow}>
            <TrendingUp size={13} /> ACTIONABLE CREATOR PLAYBOOK
          </span>
          <h2 className={styles.title}>What Drives This Channel&apos;s Growth</h2>
          <p className={styles.subtitle}>
            Empirical packaging and pacing signals extracted from public upload history.
          </p>
        </div>
      </div>

      {/* ── Integrated Winning Formula Flow Strip ── */}
      <motion.div 
        className={styles.formulaStrip}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className={styles.formulaStepCard}>
          <div className={styles.formulaStepIcon} style={{ color: '#ffc16e', background: 'rgba(255, 193, 110, 0.12)' }}>
            <Clock size={16} />
          </div>
          <div className={styles.formulaStepMeta}>
            <span className={styles.formulaStepLabel}>1. Optimal Duration</span>
            <span className={styles.formulaStepVal}>{insights.winningDuration?.rangeText || "15–30 mins"}</span>
          </div>
        </div>

        <ArrowRight size={16} className={styles.flowArrow} />

        <div className={styles.formulaStepCard}>
          <div className={styles.formulaStepIcon} style={{ color: '#60a5fa', background: 'rgba(96, 165, 250, 0.12)' }}>
            <Zap size={16} />
          </div>
          <div className={styles.formulaStepMeta}>
            <span className={styles.formulaStepLabel}>2. Top Hook Pattern</span>
            <span className={styles.formulaStepVal}>{insights.topFormula?.badge || "Structured"}</span>
          </div>
        </div>

        <ArrowRight size={16} className={styles.flowArrow} />

        <div className={styles.formulaStepCard}>
          <div className={styles.formulaStepIcon} style={{ color: '#34d399', background: 'rgba(52, 211, 153, 0.12)' }}>
            <Calendar size={16} />
          </div>
          <div className={styles.formulaStepMeta}>
            <span className={styles.formulaStepLabel}>3. Peak Release Day</span>
            <span className={styles.formulaStepVal}>{insights.hasExactDates ? insights.peakPublishingDay : 'Varies'}</span>
          </div>
        </div>

        <ArrowRight size={16} className={styles.flowArrow} />

        <div className={styles.formulaStepCard}>
          <div className={styles.formulaStepIcon} style={{ color: '#a78bfa', background: 'rgba(167, 139, 250, 0.12)' }}>
            <Flame size={16} />
          </div>
          <div className={styles.formulaStepMeta}>
            <span className={styles.formulaStepLabel}>4. Demanded Topic</span>
            <span className={styles.formulaStepVal} style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={insights.audiencePulse.contentDemands[0]?.topic || "Comparisons"}>
              {insights.audiencePulse.contentDemands[0]?.topic || "Reviews"}
            </span>
          </div>
        </div>
      </motion.div>

      {/* ── 4 Visual Intelligence Cards ── */}
      <motion.div 
        className={styles.cardsGrid}
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {/* ═══ CARD 1: Video Duration Spectrum ═══ */}
        <motion.div className={styles.card} variants={itemVariants}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderLeft}>
              <div className={styles.cardIcon}>
                <Clock size={16} />
              </div>
              <div>
                <h3 className={styles.cardTitle}>Format & Length Spectrum</h3>
                <p className={styles.cardDesc}>Which video duration commands highest average views?</p>
              </div>
            </div>
            {insights.winningDuration && (
              <span className={styles.winnerBadge}>
                <Sparkles size={11} /> {insights.winningDuration.rangeText} (n={insights.winningDuration.count}, {insights.winningDuration.viewMultiplier}× typical)
              </span>
            )}
          </div>

          {/* Segmented Duration Spectrum Gauge */}
          <div className={styles.spectrumTrack}>
            <div className={`${styles.spectrumSegment} ${insights.winningDuration?.id === 'short' ? styles.spectrumWinner : ''}`}>
              <span>&lt; 8m</span>
              <small>Short</small>
            </div>
            <div className={`${styles.spectrumSegment} ${insights.winningDuration?.id === 'standard' ? styles.spectrumWinner : ''}`}>
              <span>8–15m</span>
              <small>Standard</small>
            </div>
            <div className={`${styles.spectrumSegment} ${insights.winningDuration?.id === 'extended' ? styles.spectrumWinner : ''}`}>
              <span>15–30m</span>
              <small>Extended ★</small>
            </div>
            <div className={`${styles.spectrumSegment} ${insights.winningDuration?.id === 'deep' ? styles.spectrumWinner : ''}`}>
              <span>30m+</span>
              <small>Deep</small>
            </div>
          </div>

          {/* Visual Comparison Bars for Active Tiers */}
          <div className={styles.activeTierList}>
            {activeTiers.map((tier) => {
              const width = Math.max(12, (tier.avgViews / maxTierAvg) * 100);
              return (
                <div key={tier.id} className={styles.tierRow}>
                  <div className={styles.tierMeta}>
                    <span className={styles.tierName}>{tier.label} <small>({tier.rangeText}, n={tier.count})</small></span>
                    <span className={styles.tierStats}>
                      <strong>{tier.avgViewsFormatted}</strong> views ({tier.viewMultiplier}× typical)
                    </span>
                  </div>
                  <div className={styles.barTrack}>
                    <motion.div 
                      className={`${styles.barFill} ${tier.isWinner ? styles.barFillWinner : ''}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${width}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ═══ CARD 2: Title Formula Beat Typical ═══ */}
        <motion.div className={styles.card} variants={itemVariants}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderLeft}>
              <div className={styles.cardIcon} style={{ background: 'rgba(96, 165, 250, 0.12)', color: '#60a5fa', borderColor: 'rgba(96, 165, 250, 0.25)' }}>
                <Zap size={16} />
              </div>
              <div>
                <h3 className={styles.cardTitle}>Title Patterns That Beat Typical</h3>
                <p className={styles.cardDesc}>Phrasing styles that outperform the channel median</p>
              </div>
            </div>
            {insights.topFormula && (
              <span className={styles.formulaPill}>
                Top: {insights.topFormula.badge} ({insights.topFormula.winRate}% beat typical)
              </span>
            )}
          </div>

          {/* Formula Comparison Meter */}
          <div className={styles.formulaRankList}>
            {activeFormulas.map((formula) => {
              const color = formula.accentColor;

              return (
                <div 
                  key={formula.id} 
                  className={styles.formulaItem}
                >
                  <div className={styles.formulaItemHeader}>
                    <span className={styles.formulaBadge} style={{ color, borderColor: color, background: `${color}18` }}>
                      {formula.badge}
                    </span>
                    <span className={styles.formulaRate} style={{ color }}>
                      {formula.winRate}% beat typical <small style={{ color: '#8d949a' }}>(n={formula.count}, {formula.avgMultiplier}× typical)</small>
                    </span>
                  </div>

                  <div className={styles.formulaBarTrack}>
                    <motion.div 
                      className={styles.formulaBarFill}
                      style={{ background: color }}
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(6, formula.winRate)}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>

                  {formula.sampleTitles[0] && (
                    <div className={styles.formulaSampleLine}>
                      <span className={styles.sampleDot} style={{ background: color }} />
                      <span className={styles.sampleText}>&ldquo;{formula.sampleTitles[0]}&rdquo;</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ═══ CARD 3: Optimal Upload Day Window ═══ */}
        <motion.div className={styles.card} variants={itemVariants}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderLeft}>
              <div className={styles.cardIcon} style={{ background: 'rgba(52, 211, 153, 0.12)', color: '#34d399', borderColor: 'rgba(52, 211, 153, 0.25)' }}>
                <Calendar size={16} />
              </div>
              <div>
                <h3 className={styles.cardTitle}>Optimal Upload Day Window</h3>
                <p className={styles.cardDesc}>Day-of-week clustering of above-median uploads</p>
              </div>
            </div>
            <span className={styles.peakDayBadge}>
              {insights.hasExactDates ? `Peak: ${insights.peakPublishingDay} (${insights.peakLiftMultiplier}× typical)` : 'Dates relative'}
            </span>
          </div>

          {/* Visual Heatwave Bar Equalizer */}
          {insights.hasExactDates ? (
            <div className={styles.heatwaveContainer}>
              {insights.publishingDays.map((day) => {
                const intensity = day.videoCount > 0 ? (day.videoCount / maxDayVideos) : 0;
                const barHeightPct = day.videoCount > 0 ? Math.max(14, intensity * 100) : 4;

                return (
                  <div 
                    key={day.shortName} 
                    className={`${styles.heatwaveCol} ${day.isPeak ? styles.heatwaveColPeak : ''}`}
                  >
                    <div className={styles.heatwaveBarBox}>
                      {day.isPeak && day.liftMultiplier > 1 && (
                        <span className={styles.peakTag}>
                          <Sparkles size={9} /> {day.liftMultiplier}×
                        </span>
                      )}
                      <motion.div 
                        className={`${styles.heatwaveBar} ${day.isPeak ? styles.heatwaveBarPeak : ''}`}
                        initial={{ height: 0 }}
                        animate={{ height: `${barHeightPct}%` }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        style={{ opacity: day.videoCount > 0 ? 1 : 0.25 }}
                      />
                    </div>
                    <span className={`${styles.heatwaveLabel} ${day.isPeak ? styles.heatwaveLabelPeak : ''}`}>
                      {day.shortName}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-3)', fontSize: '13px', background: 'var(--surface-2)', borderRadius: 'var(--radius-md)', margin: '16px 0' }}>
              Specific release weekdays cannot be determined because uploads use approximate relative dates (e.g. &ldquo;2 weeks ago&rdquo;).
            </div>
          )}

          {/* Publishing Window Banner */}
          <div className={styles.goldenWindowPill}>
            <Clock size={13} style={{ color: '#34d399', flexShrink: 0 }} />
            <span>
              {insights.hasExactDates ? (
                <>Most frequent upload day: <strong>{insights.peakPublishingDay}</strong> ({insights.peakLiftMultiplier}× typical views)</>
              ) : (
                <>Observed release day breakdown: <strong>Unavailable for relative date samples</strong></>
              )}
            </span>
          </div>
        </motion.div>

        {/* ═══ CARD 4: Performance Signals & Demand Concepts ═══ */}
        <motion.div className={styles.card} variants={itemVariants}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderLeft}>
              <div className={styles.cardIcon} style={{ background: 'rgba(167, 139, 250, 0.12)', color: '#a78bfa', borderColor: 'rgba(167, 139, 250, 0.25)' }}>
                <Flame size={16} />
              </div>
              <div>
                <h3 className={styles.cardTitle}>Performance Signals & Concepts</h3>
                <p className={styles.cardDesc}>Empirical format signals and high-probability follow-ups</p>
              </div>
            </div>
            <span className={styles.sentimentPill} title="Percentage of sample uploads meeting or beating channel median views">
              {insights.audiencePulse.sentimentScore}% above typical
            </span>
          </div>

          {/* Semicircle / Radial Gauge with Tag Pills */}
          <div className={styles.sentimentHeaderBox}>
            <div className={styles.miniGauge}>
              <svg viewBox="0 0 64 64" className={styles.gaugeSvg}>
                <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(167, 139, 250, 0.15)" strokeWidth="5" />
                <circle 
                  cx="32" cy="32" r="26" 
                  fill="none" 
                  stroke="#a78bfa" 
                  strokeWidth="5"
                  strokeDasharray={`${(insights.audiencePulse.sentimentScore / 100) * 163} 163`}
                  strokeLinecap="round"
                  transform="rotate(-90 32 32)"
                />
              </svg>
              <span className={styles.gaugeValue}>{insights.audiencePulse.sentimentScore}%</span>
            </div>

            <div className={styles.sentimentTags}>
              {insights.audiencePulse.observedSignals.map((sig) => (
                <span key={sig} className={styles.signalPill}>{sig}</span>
              ))}
            </div>
          </div>

          {/* Next Video Concept Chips */}
          <div className={styles.demandsBox}>
            <span className={styles.demandsTitle}>
              <Flame size={12} style={{ color: '#f87171' }} /> HIGH-POTENTIAL FOLLOW-UP CONCEPTS (CLICK TO COPY OUTLINE)
            </span>
            <div className={styles.demandChipsList}>
              {insights.audiencePulse.contentDemands.slice(0, 3).map((demand, idx) => {
                const isCopied = copiedTopic === demand.topic;
                return (
                  <button
                    key={idx}
                    type="button"
                    className={styles.demandChip}
                    onClick={() => handleCopyTopic(demand.topic)}
                    title={demand.reason}
                  >
                    <span className={styles.chipText}>{demand.topic}</span>
                    <span className={styles.demandBadge}>
                      {isCopied ? <Check size={10} /> : <Flame size={10} />}
                      {isCopied ? 'Copied' : demand.demandLevel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};
