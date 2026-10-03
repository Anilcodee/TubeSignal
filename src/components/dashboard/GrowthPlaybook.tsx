'use client';

import { useState, type CSSProperties } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { Calendar, Check, Clock, Flame, Lightbulb, MessageCircle, Sparkles, TrendingUp, Zap, BarChart2, Eye } from 'lucide-react';
import type { VideoData, AIAnalysis } from '@/types/analysis';
import { analyzeChannelGrowth } from '@/utils/growth-analyzer';
import styles from './GrowthPlaybook.module.css';

interface GrowthPlaybookProps {
  videos: VideoData[];
  medianViews: number;
  aiAnalysis?: AIAnalysis;
}

export const GrowthPlaybook = ({ videos, medianViews, aiAnalysis }: GrowthPlaybookProps) => {
  const [copiedBlueprint, setCopiedBlueprint] = useState<string | null>(null);
  const [showData, setShowData] = useState(false);

  const insights = analyzeChannelGrowth(videos, medianViews, aiAnalysis);

  if (!videos.length) return null;

  const handleCopyBlueprint = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedBlueprint(text);
    setTimeout(() => setCopiedBlueprint(null), 2000);
  };

  // Find the max average views across tiers for scaling bar widths
  const maxTierAvg = Math.max(...insights.durationTiers.map(t => t.avgViews), 1);

  // Find max video count across days for heatmap scaling
  const maxDayVideos = Math.max(...insights.publishingDays.map(d => d.videoCount), 1);

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <section className={styles.container} aria-label="Actionable Creator Playbook">
      {/* Section Header */}
      <div className={styles.sectionHeader}>
        <div>
          <span className={styles.eyebrow}>
            <TrendingUp size={14} /> ACTIONABLE CREATOR PLAYBOOK
          </span>
          <h2 className={styles.title}>What Drives This Channel&apos;s Growth</h2>
          <p className={styles.subtitle}>
            Empirical patterns extracted from public upload history to guide your next video.
          </p>
        </div>
        <button type="button" className={styles.toggleBtn} onClick={() => setShowData(!showData)}>
          {showData ? <><Eye size={14} /> The Winning Formula</> : <><BarChart2 size={14} /> View Raw Analytics</>}
        </button>
      </div>

      {/* ── Visual Blueprint vs Data Grid ── */}
      <AnimatePresence mode="wait">
        {!showData ? (
          <motion.div 
            key="formula"
            className={styles.formulaContainer}
            variants={containerVariants}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
          >
            <motion.div className={styles.formulaCard} variants={itemVariants}>
              <Clock size={20} color="#ffc16e" />
              <span className={styles.formulaStep}>Step 1</span>
              <span className={styles.formulaValue}>{insights.winningDuration?.label || "Flexible"}</span>
              <span className={styles.formulaLabel}>Duration</span>
              <span className={styles.formulaDesc}>Highest performing length</span>
            </motion.div>
            <motion.div className={styles.formulaCard} variants={itemVariants}>
              <Zap size={20} color="#60a5fa" />
              <span className={styles.formulaStep}>Step 2</span>
              <span className={styles.formulaValue}>{insights.topFormula?.badge || "Varies"}</span>
              <span className={styles.formulaLabel}>Hook</span>
              <span className={styles.formulaDesc}>Top phrasing pattern</span>
            </motion.div>
            <motion.div className={styles.formulaCard} variants={itemVariants}>
              <Calendar size={20} color="#34d399" />
              <span className={styles.formulaStep}>Step 3</span>
              <span className={styles.formulaValue}>{insights.peakPublishingDay || "Any Day"}</span>
              <span className={styles.formulaLabel}>Timing</span>
              <span className={styles.formulaDesc}>Optimal upload window</span>
            </motion.div>
            <motion.div className={styles.formulaCard} variants={itemVariants}>
              <MessageCircle size={20} color="#a78bfa" />
              <span className={styles.formulaStep}>Step 4</span>
              <span className={styles.formulaValue} style={{ fontSize: "1.05rem", whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden", maxWidth: "100%" }} title={insights.audiencePulse.contentDemands[0]?.topic || "General Topic"}>
                {insights.audiencePulse.contentDemands[0]?.topic || "General"}
              </span>
              <span className={styles.formulaLabel}>Content</span>
              <span className={styles.formulaDesc}>Top audience request</span>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div 
            key="grid"
            className={styles.cardsGrid}
            variants={containerVariants}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, y: 20, transition: { duration: 0.2 } }}
          >

        {/* ═══ CARD 1: Format & Length Sweet Spot ═══ */}
        <motion.div className={styles.card} variants={itemVariants}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderLeft}>
              <div className={styles.cardIcon}>
                <Clock size={18} />
              </div>
              <div>
                <h3 className={styles.cardTitle}>Format & Length Sweet Spot</h3>
                <p className={styles.cardDesc}>Which video duration commands the highest views?</p>
              </div>
            </div>
            {insights.winningDuration && (
              <span className={styles.bestRoiBadge}>
                <Sparkles size={10} /> BEST ROI ({insights.winningDuration.viewMultiplier}×)
              </span>
            )}
          </div>

          {/* Visual Duration Bars */}
          <div className={styles.durationBars}>
            {insights.durationTiers.map((tier) => {
              const barWidth = tier.avgViews > 0 ? Math.max(8, (tier.avgViews / maxTierAvg) * 100) : 4;
              const multiplierText = `${tier.viewMultiplier}× baseline`;
              return (
                <div
                  key={tier.id}
                  className={`${styles.durationRow} ${tier.isWinner ? styles.durationRowWinner : ''}`}
                >
                  <div className={styles.durationMeta}>
                    <span className={styles.durationLabel}>
                      <strong>{tier.label}</strong> <small>({tier.rangeText})</small>
                    </span>
                    <span className={styles.durationMultiplier}>
                      {multiplierText}
                    </span>
                  </div>
                  <div className={styles.barTrack}>
                    <div
                      className={`${styles.barFill} ${tier.isWinner ? styles.barFillWinner : ''}`}
                      style={{ '--bar-width': `${barWidth}%` } as CSSProperties}
                    />
                  </div>
                  <div className={styles.durationStats}>
                    <span>{tier.count} uploads in sample</span>
                    <span>Avg: {tier.avgViewsFormatted} views</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* ═══ CARD 2: Title Formula Win-Rate ═══ */}
        <motion.div className={styles.card} variants={itemVariants}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderLeft}>
              <div className={styles.cardIcon} style={{ background: 'rgba(96, 165, 250, 0.12)', color: '#60a5fa', borderColor: 'rgba(96, 165, 250, 0.3)' }}>
                <Zap size={18} />
              </div>
              <div>
                <h3 className={styles.cardTitle}>Title Formula Win-Rate</h3>
                <p className={styles.cardDesc}>Which phrasing beats the channel median?</p>
              </div>
            </div>
            {insights.topFormula && (
              <span className={styles.topFormulaTag}>
                Top: {insights.topFormula.badge}
              </span>
            )}
          </div>

          {/* Title Formula Bars */}
          <div className={styles.formulaList}>
            {insights.titleFormulas.map((formula) => {
              const barWidth = Math.max(4, formula.winRate);
              const color = formula.accentColor;
              return (
                <div key={formula.id} className={styles.formulaRow}>
                  <div className={styles.formulaHeader}>
                    <span className={styles.formulaBadge} style={{ color, borderColor: color, background: `${color}15` }}>
                      {formula.badge}
                    </span>
                    <span className={styles.formulaWinRate} style={{ color }}>
                      {formula.winRate}% Win-Rate ({formula.avgMultiplier}×)
                    </span>
                  </div>
                  <div className={styles.formulaBarTrack}>
                    <div
                      className={styles.formulaBarFill}
                      style={{
                        '--bar-width': `${barWidth}%`,
                        '--bar-color': color,
                      } as CSSProperties}
                    />
                  </div>
                  {formula.sampleTitles[0] && (
                    <p className={styles.formulaSample}>
                      &ldquo;{formula.sampleTitles[0]}&rdquo;
                    </p>
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
              <div className={styles.cardIcon} style={{ background: 'rgba(52, 211, 153, 0.12)', color: '#34d399', borderColor: 'rgba(52, 211, 153, 0.3)' }}>
                <Calendar size={18} />
              </div>
              <div>
                <h3 className={styles.cardTitle}>Optimal Upload Day Window</h3>
                <p className={styles.cardDesc}>Day-of-week clustering of above-median uploads</p>
              </div>
            </div>
            <span className={styles.peakDayTag}>
              Peak: {insights.peakPublishingDay} {insights.peakLiftMultiplier > 1 ? `(${insights.peakLiftMultiplier}× lift)` : ''}
            </span>
          </div>

          {/* Visual Heatmap / Bar Chart Grid */}
          <div className={styles.dayGrid}>
            {insights.publishingDays.map((day) => {
              const intensity = day.videoCount / maxDayVideos;
              const barHeight = Math.max(8, intensity * 100);
              return (
                <div
                  key={day.shortName}
                  className={`${styles.dayCol} ${day.isPeak ? styles.dayColPeak : ''}`}
                  title={`${day.dayName}: ${day.videoCount} uploads, ${day.liftMultiplier}× median views`}
                >
                  <div className={styles.dayBarContainer}>
                    <div
                      className={`${styles.dayBar} ${day.isPeak ? styles.dayBarPeak : ''}`}
                      style={{ '--bar-height': `${barHeight}%` } as CSSProperties}
                    />
                  </div>
                  <span className={`${styles.dayLabel} ${day.isPeak ? styles.dayLabelPeak : ''}`}>
                    {day.shortName}
                  </span>
                  <span className={styles.dayCount}>
                    {day.videoCount > 0 ? `${day.liftMultiplier}×` : '0v'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Recommended Window */}
          <div className={styles.recommendedWindow}>
            <Clock size={14} />
            <span>
              Recommended Window: <strong>{insights.peakPublishingDay}s between 2:00 PM – 5:00 PM EST</strong>
              {insights.peakLiftMultiplier > 1 ? ` (${Math.round((insights.peakLiftMultiplier - 1) * 100)}% lift over channel baseline)` : ''} for pre-evening traffic buildup.
            </span>
          </div>
        </motion.div>

        {/* ═══ CARD 4: Audience Sentiment & Demands ═══ */}
        <motion.div className={styles.card} variants={itemVariants}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderLeft}>
              <div className={styles.cardIcon} style={{ background: 'rgba(167, 139, 250, 0.12)', color: '#a78bfa', borderColor: 'rgba(167, 139, 250, 0.3)' }}>
                <MessageCircle size={18} />
              </div>
              <div>
                <h3 className={styles.cardTitle}>Audience Sentiment & Demands</h3>
                <p className={styles.cardDesc}>Viewer praise drivers and high-demand topics</p>
              </div>
            </div>
            <span className={styles.sentimentTag}>
              {insights.audiencePulse.sentimentScore}% Positive
            </span>
          </div>

          {/* Donut Gauge + Praise Summary */}
          <div className={styles.sentimentRow}>
            <div className={styles.donutGauge}>
              <svg viewBox="0 0 80 80" className={styles.donutSvg}>
                <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(167, 139, 250, 0.12)" strokeWidth="6" />
                <circle
                  cx="40" cy="40" r="32"
                  fill="none"
                  stroke="#a78bfa"
                  strokeWidth="6"
                  strokeDasharray={`${(insights.audiencePulse.sentimentScore / 100) * 201} 201`}
                  strokeLinecap="round"
                  transform="rotate(-90 40 40)"
                  className={styles.donutFill}
                />
              </svg>
              <div className={styles.donutCenter}>
                <span className={styles.donutPercent}>{insights.audiencePulse.sentimentScore}%</span>
                <span className={styles.donutLabel}>PRAISE</span>
              </div>
            </div>
            <div className={styles.retentionSignals}>
              <div className={styles.retentionHeader}>
                <Sparkles size={12} /> RETENTION SIGNALS
                <span className={styles.retentionBars}>
                  <i /><i /><i /><i /><i />
                </span>
              </div>
              <p>
                Viewers repeatedly praise <strong>immediate hook momentum</strong> with clean pacing and high practical utility.
              </p>
            </div>
          </div>

          {/* Top Demanded Follow-up Topics */}
          <div className={styles.demandSection}>
            <span className={styles.demandSectionTitle}>
              <Flame size={12} style={{ color: '#ef4444' }} /> TOP DEMANDED FOLLOW-UP TOPICS (COMMENT MINING)
            </span>

            {insights.audiencePulse.contentDemands.map((demand, idx) => {
              const isCopied = copiedBlueprint === demand.topic;
              return (
                <button
                  key={idx}
                  type="button"
                  className={styles.demandRow}
                  onClick={() => handleCopyBlueprint(`Video Concept Outline for "${demand.topic}": Focus on viewer questions, direct comparisons, and actionable pros/cons.`)}
                >
                  <span className={styles.demandTopic}>{demand.topic}</span>
                  <span className={`${styles.demandLevel} ${demand.demandLevel === 'Very High' ? styles.demandVeryHigh : styles.demandHigh}`}>
                    {isCopied ? <Check size={10} /> : <Flame size={10} />}
                    {isCopied ? 'Copied!' : demand.demandLevel}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.div>
        </motion.div>
        )}
      </AnimatePresence>

      {/* ── Strategic Takeaway ── */}
      <motion.div 
        className={styles.takeaway}
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.5, type: "spring", stiffness: 300, damping: 24 }}
      >
        <Lightbulb size={20} style={{ flexShrink: 0 }} />
        <span>
          <strong>Action Plan for Next Video:</strong> Keep duration <strong>sub-10 minutes</strong>, launch with a{' '}
          <strong>{insights.topFormula?.badge || 'Structured'}</strong> title formula, and publish on{' '}
          <strong>{insights.peakPublishingDay} at 3:00 PM EST</strong> for maximum YouTube home feed velocity.
        </span>
      </motion.div>
    </section>
  );
};
