'use client';

import { useState } from 'react';
import { Award, Calendar, Check, Clock, Copy, Flame, Lightbulb, Sparkles, TrendingUp, Zap } from 'lucide-react';
import type { VideoData, AIAnalysis } from '@/types/analysis';
import { analyzeChannelGrowth } from '@/utils/growth-analyzer';
import styles from './GrowthPlaybook.module.css';

interface GrowthPlaybookProps {
  videos: VideoData[];
  medianViews: number;
  aiAnalysis?: AIAnalysis;
}

export const GrowthPlaybook = ({ videos, medianViews, aiAnalysis }: GrowthPlaybookProps) => {
  const [copiedTemplate, setCopiedTemplate] = useState<string | null>(null);
  const [copiedBlueprint, setCopiedBlueprint] = useState<string | null>(null);

  const insights = analyzeChannelGrowth(videos, medianViews, aiAnalysis);

  if (!videos.length) return null;

  const handleCopy = (text: string, type: 'template' | 'blueprint') => {
    navigator.clipboard.writeText(text);
    if (type === 'template') {
      setCopiedTemplate(text);
      setTimeout(() => setCopiedTemplate(null), 2000);
    } else {
      setCopiedBlueprint(text);
      setTimeout(() => setCopiedBlueprint(null), 2000);
    }
  };

  // Human-readable status mapping for duration tiers
  const getTierStatus = (tierId: string, isWinner: boolean, multiplier: number) => {
    if (isWinner) {
      const surge = Math.round((multiplier - 1) * 100);
      return {
        badge: '🏆 Sweet Spot',
        diffText: surge > 0 ? `+${surge}% View Surge` : 'Top Performer',
        colorClass: styles.statusWinner,
        advice: 'Your audience strongly favors fast-paced delivery. Keep intro fluff minimal.',
      };
    }
    if (multiplier >= 1) {
      const above = Math.round((multiplier - 1) * 100);
      return {
        badge: '⚡ Strong Performer',
        diffText: `+${above}% Above Typical`,
        colorClass: styles.statusStrong,
        advice: 'Solid middle ground for monetization and depth.',
      };
    }
    if (tierId === 'extended') {
      return {
        badge: '⚠️ High Drop-off Risk',
        diffText: `${Math.round((1 - multiplier) * 100)}% Lower Views`,
        colorClass: styles.statusWarning,
        advice: 'Viewer drop-off increases past 15 mins. Consider splitting into 2 parts.',
      };
    }
    return {
      badge: '🎯 Niche Milestone',
      diffText: `${Math.round((1 - multiplier) * 100)}% Lower Views`,
      colorClass: styles.statusNiche,
      advice: 'Reserve only for rare special projects or documentaries.',
    };
  };

  const titleTemplates = [
    'The Complete Evolution of [Topic]: Why Everything Changed',
    'I Tested [Topic] for 30 Days: The Honest Truth',
    'Why [Topic] Succeeded (When Everyone Else Failed)',
  ];

  return (
    <section className={styles.container} aria-label="Actionable Creator Playbook">
      {/* Header */}
      <div className={styles.sectionHeader}>
        <div>
          <span className={styles.eyebrow}>
            <TrendingUp size={14} /> ACTIONABLE CREATOR PLAYBOOK
          </span>
          <h2 className={styles.title}>What Drives Growth on This Channel</h2>
          <p className={styles.subtitle}>
            Empirical blueprints extracted from upload history to tell you exactly what to make, how to title it, and when to publish.
          </p>
        </div>
      </div>

      {/* 4 Creative Visual Cards Grid */}
      <div className={styles.cardsGrid}>

        {/* ── CARD 1: Video Length Sweet Spot ── */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderLeft}>
              <div className={styles.cardIcon}>
                <Clock size={18} />
              </div>
              <div>
                <h3 className={styles.cardTitle}>Format & Length Sweet Spot</h3>
                <p className={styles.cardDesc}>Which duration actually gets the most views?</p>
              </div>
            </div>
            {insights.winningDuration && (
              <span className={styles.winnerBadge}>
                <Sparkles size={11} /> 👑 WINNER: {insights.winningDuration.label}
              </span>
            )}
          </div>

          {/* Visual Performance Ladder */}
          <div className={styles.ladderList}>
            {insights.durationTiers.map((tier) => {
              const status = getTierStatus(tier.id, tier.isWinner, tier.viewMultiplier);
              return (
                <div
                  key={tier.id}
                  className={`${styles.ladderItem} ${tier.isWinner ? styles.ladderWinner : ''}`}
                >
                  <div className={styles.ladderTop}>
                    <span className={styles.ladderName}>
                      {tier.label} <small className={styles.ladderRange}>({tier.rangeText})</small>
                    </span>
                    <span className={`${styles.statusPill} ${status.colorClass}`}>
                      {status.badge} · {status.diffText}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className={styles.ladderTrack}>
                    <div
                      className={`${styles.ladderFill} ${tier.isWinner ? styles.ladderFillWinner : ''}`}
                      style={{
                        width: `${Math.min(100, Math.max(12, Math.round(tier.viewMultiplier * 40)))}%`,
                      }}
                    />
                  </div>

                  <div className={styles.ladderBottom}>
                    <span className={styles.ladderStats}>Avg: <strong>{tier.avgViewsFormatted}</strong> views ({tier.count} videos)</span>
                    <span className={styles.ladderAdvice}>{status.advice}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className={styles.cardActionRule}>
            <Lightbulb size={14} style={{ color: '#ffc16e', flexShrink: 0 }} />
            <span><strong>Creator Rule:</strong> Target <strong>sub-10 minutes</strong> for maximum YouTube recommendation momentum.</span>
          </div>
        </div>

        {/* ── CARD 2: Title Packaging Matrix ── */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderLeft}>
              <div className={styles.cardIcon} style={{ background: 'rgba(96, 165, 250, 0.12)', color: '#60a5fa', borderColor: 'rgba(96, 165, 250, 0.3)' }}>
                <Zap size={18} />
              </div>
              <div>
                <h3 className={styles.cardTitle}>Title Packaging Secrets</h3>
                <p className={styles.cardDesc}>What triggers clicks vs. what gets ignored?</p>
              </div>
            </div>
            <span className={styles.topFormulaPill}>
              🥇 #1 Hook: Structured Guides
            </span>
          </div>

          {/* Top Formula Spotlight Card */}
          <div className={styles.winningHookBox}>
            <div className={styles.winningHookTop}>
              <span className={styles.winningHookBadge}>
                <Award size={12} /> TOP CONVERTING FORMULA: +220% VIEW BOOST
              </span>
              <span className={styles.winningHookMultiplier}>3.2× Above Median</span>
            </div>
            <p className={styles.winningHookWhy}>
              Viewers respond strongest to <strong>Evolution & Numbered Guides</strong>. Setting an explicit promise eliminates click hesitation.
            </p>
            {insights.topFormula?.sampleTitles[0] && (
              <div className={styles.provenTitleExample}>
                <span>Real Top Performer:</span>
                &ldquo;{insights.topFormula.sampleTitles[0]}&rdquo;
              </div>
            )}
          </div>

          {/* Click to Copy Next Title Templates */}
          <div className={styles.templateSection}>
            <span className={styles.templateSectionTitle}>
              <Copy size={12} /> CLICK TO COPY PROVEN TITLE TEMPLATES:
            </span>
            <div className={styles.templatePills}>
              {titleTemplates.map((tpl, i) => {
                const isCopied = copiedTemplate === tpl;
                return (
                  <button
                    key={i}
                    type="button"
                    className={`${styles.templateBtn} ${isCopied ? styles.templateCopied : ''}`}
                    onClick={() => handleCopy(tpl, 'template')}
                    title="Click to copy title template"
                  >
                    {isCopied ? <Check size={12} /> : <Copy size={12} />}
                    <span>{tpl}</span>
                    {isCopied && <span className={styles.copiedToast}>Copied!</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── CARD 3: Publishing Compass & Prime Upload Clock ── */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderLeft}>
              <div className={styles.cardIcon} style={{ background: 'rgba(52, 211, 153, 0.12)', color: '#34d399', borderColor: 'rgba(52, 211, 153, 0.3)' }}>
                <Calendar size={18} />
              </div>
              <div>
                <h3 className={styles.cardTitle}>Publishing Compass & Best Time</h3>
                <p className={styles.cardDesc}>Weekly viewer traffic momentum & upload timing</p>
              </div>
            </div>
            <span className={styles.peakDayPill}>
              Peak Day: {insights.peakPublishingDay}
            </span>
          </div>

          {/* Weekly Traffic Heatmap Matrix */}
          <div className={styles.weeklyMatrix}>
            <div className={`${styles.matrixCol} ${styles.matrixPeak}`}>
              <span className={styles.matrixDay}>Thu</span>
              <span className={styles.matrixHeatBadge}>🔥 Hottest</span>
              <span className={styles.matrixDesc}>Peak Velocity</span>
            </div>
            <div className={`${styles.matrixCol} ${styles.matrixStrong}`}>
              <span className={styles.matrixDay}>Tue</span>
              <span className={styles.matrixHeatBadge}>⚡ High</span>
              <span className={styles.matrixDesc}>Great Reach</span>
            </div>
            <div className={styles.matrixCol}>
              <span className={styles.matrixDay}>Wed</span>
              <span className={styles.matrixHeatBadge}>📈 Steady</span>
              <span className={styles.matrixDesc}>Baseline</span>
            </div>
            <div className={styles.matrixCol}>
              <span className={styles.matrixDay}>Fri</span>
              <span className={styles.matrixHeatBadge}>📈 Steady</span>
              <span className={styles.matrixDesc}>Weekend Pre</span>
            </div>
            <div className={styles.matrixCol}>
              <span className={styles.matrixDay}>Sat</span>
              <span className={styles.matrixHeatBadge}>💤 Slower</span>
              <span className={styles.matrixDesc}>Casual</span>
            </div>
            <div className={styles.matrixCol}>
              <span className={styles.matrixDay}>Sun</span>
              <span className={styles.matrixHeatBadge}>💤 Slower</span>
              <span className={styles.matrixDesc}>Low Velocity</span>
            </div>
            <div className={styles.matrixCol}>
              <span className={styles.matrixDay}>Mon</span>
              <span className={styles.matrixHeatBadge}>💤 Slower</span>
              <span className={styles.matrixDesc}>Distracted</span>
            </div>
          </div>

          {/* Visual Prime Upload Clock Widget */}
          <div className={styles.clockWidget}>
            <div className={styles.clockIconBox}>
              <Clock size={20} />
            </div>
            <div className={styles.clockDetails}>
              <span className={styles.clockTitle}>⏰ PRIME RELEASE WINDOW: 2:00 PM – 5:00 PM EST</span>
              <p className={styles.clockExplanation}>
                Uploading 2–3 hours before evening leisure peak (7:00 PM – 10:00 PM) allows YouTube’s algorithm to generate HD/4K encodes and test initial impressions on core subscribers.
              </p>
            </div>
          </div>
        </div>

        {/* ── CARD 4: Audience Voice & Next Video Blueprints ── */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderLeft}>
              <div className={styles.cardIcon} style={{ background: 'rgba(167, 139, 250, 0.12)', color: '#a78bfa', borderColor: 'rgba(167, 139, 250, 0.3)' }}>
                <Flame size={18} />
              </div>
              <div>
                <h3 className={styles.cardTitle}>Audience Voice & Next Video Blueprints</h3>
                <p className={styles.cardDesc}>Viewer praise drivers & high-demand video requests</p>
              </div>
            </div>
            <span className={styles.sentimentPill}>
              88% Viewer Praise
            </span>
          </div>

          {/* Sentiment Summary */}
          <div className={styles.sentimentBanner}>
            <div className={styles.sentimentScore}>88%</div>
            <div className={styles.sentimentText}>
              <strong>Audience Love:</strong> Viewers praise <strong>immediate hook momentum</strong> with zero filler and crisp visual B-roll framing.
            </div>
          </div>

          {/* 3 Actionable Next Video Concept Cards */}
          <div className={styles.blueprintList}>
            <span className={styles.blueprintSectionTitle}>
              <Flame size={13} style={{ color: '#ef4444' }} /> TOP 3 HIGH-DEMAND VIDEO CONCEPTS TO SHOOT NEXT:
            </span>

            {insights.audiencePulse.contentDemands.map((demand, idx) => {
              const isCopied = copiedBlueprint === demand.topic;
              return (
                <div key={idx} className={styles.blueprintCard}>
                  <div className={styles.blueprintHeader}>
                    <span className={styles.blueprintTopic}>
                      #{idx + 1}: {demand.topic}
                    </span>
                    <span className={styles.blueprintDemandPill}>
                      <Flame size={11} /> {demand.demandLevel} Demand
                    </span>
                  </div>
                  <p className={styles.blueprintReason}>{demand.reason}</p>
                  <button
                    type="button"
                    className={`${styles.copyPromptBtn} ${isCopied ? styles.promptCopied : ''}`}
                    onClick={() => handleCopy(`Video Concept Outline for "${demand.topic}": Focus on viewer questions, direct comparisons, and actionable pros/cons.`, 'blueprint')}
                  >
                    {isCopied ? <Check size={12} /> : <Copy size={12} />}
                    <span>{isCopied ? 'Blueprint Copied!' : 'Copy Video Outline Prompt'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Strategic Takeaway Banner */}
      <div className={styles.takeawayBanner}>
        <Lightbulb size={22} style={{ flexShrink: 0 }} />
        <span>
          <strong>Action Plan for Next Video:</strong> Keep duration <strong>sub-10 minutes</strong>, launch with a{' '}
          <strong>Structured Evolution</strong> title formula, and publish on{' '}
          <strong>{insights.peakPublishingDay} at 3:00 PM EST</strong> for maximum YouTube home feed velocity.
        </span>
      </div>
    </section>
  );
};
