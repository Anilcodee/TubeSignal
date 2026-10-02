'use client';

import { useMemo } from 'react';
import { Award, Calendar, Clock, Flame, Lightbulb, MessageSquare, Sparkles, TrendingUp, Zap } from 'lucide-react';
import type { VideoData, AIAnalysis } from '@/types/analysis';
import { analyzeChannelGrowth } from '@/utils/growth-analyzer';
import styles from './GrowthPlaybook.module.css';

interface GrowthPlaybookProps {
  videos: VideoData[];
  medianViews: number;
  aiAnalysis?: AIAnalysis;
}

export const GrowthPlaybook = ({ videos, medianViews, aiAnalysis }: GrowthPlaybookProps) => {
  const insights = useMemo(() => {
    return analyzeChannelGrowth(videos, medianViews, aiAnalysis);
  }, [videos, medianViews, aiAnalysis]);

  if (!videos.length) return null;

  const maxTierCount = Math.max(1, ...insights.durationTiers.map((t) => t.count));
  const maxDayCount = Math.max(1, ...insights.publishingDays.map((d) => d.videoCount));

  return (
    <section className={styles.container} aria-label="Creator Growth Playbook">
      {/* Header */}
      <div className={styles.sectionHeader}>
        <div>
          <span className={styles.eyebrow}>
            <TrendingUp size={14} /> ACTIONABLE CREATOR PLAYBOOK
          </span>
          <h2 className={styles.title}>What Drives This Channel’s Growth</h2>
          <p className={styles.subtitle}>
            Empirical patterns extracted from public upload history to guide your next video.
          </p>
        </div>
      </div>

      {/* 4 Interactive Visual Cards */}
      <div className={styles.cardsGrid}>
        {/* Card 1: Duration Sweet Spot */}
        <div className={styles.card}>
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
              <span className={styles.roiBadge}>
                <Sparkles size={11} /> BEST ROI ({insights.winningDuration.viewMultiplier}×)
              </span>
            )}
          </div>

          <div className={styles.durationList}>
            {insights.durationTiers.map((tier) => {
              const widthPct = Math.round((tier.count / maxTierCount) * 100);
              return (
                <div
                  key={tier.id}
                  className={`${styles.tierRow} ${tier.isWinner ? styles.winner : ''}`}
                >
                  <div className={styles.tierTop}>
                    <span className={styles.tierName}>
                      {tier.isWinner && <Award size={14} className={styles.winnerCrown} />}
                      {tier.label} <small className={styles.tierRange}>({tier.rangeText})</small>
                    </span>
                    <span className={styles.tierMultiplier}>
                      {tier.viewMultiplier > 0 ? `${tier.viewMultiplier}× baseline` : '—'}
                    </span>
                  </div>

                  <div className={styles.barTrack}>
                    <div
                      className={styles.barFill}
                      style={{ width: `${Math.max(8, widthPct)}%` }}
                    />
                  </div>

                  <div className={styles.tierBottom}>
                    <span>{tier.count} uploads in sample</span>
                    <span>Avg: {tier.avgViewsFormatted} views</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Card 2: Packaging Formula Battle */}
        <div className={styles.card}>
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
              <span
                className={styles.topFormulaBadge}
                style={{
                  color: insights.topFormula.accentColor,
                  background: `${insights.topFormula.accentColor}18`,
                  borderColor: `${insights.topFormula.accentColor}40`,
                }}
              >
                Top: {insights.topFormula.label}
              </span>
            )}
          </div>

          <div className={styles.formulaList}>
            {insights.titleFormulas.map((formula) => (
              <div key={formula.id} className={styles.formulaItem}>
                <div className={styles.formulaItemTop}>
                  <span
                    className={styles.formulaBadge}
                    style={{ color: formula.accentColor, border: `1px solid ${formula.accentColor}30` }}
                  >
                    {formula.badge}
                  </span>
                  <span className={styles.formulaWinRate} style={{ color: formula.accentColor }}>
                    {formula.winRate}% Win-Rate ({formula.avgMultiplier}×)
                  </span>
                </div>

                <div className={styles.formulaMeterTrack}>
                  <div
                    className={styles.formulaMeterFill}
                    style={{
                      width: `${Math.max(6, formula.winRate)}%`,
                      background: `linear-gradient(90deg, ${formula.accentColor}99, ${formula.accentColor})`,
                    }}
                  />
                </div>

                {formula.sampleTitles[0] && (
                  <span className={styles.sampleTitleSnippet} title={formula.sampleTitles[0]}>
                    &ldquo;{formula.sampleTitles[0]}&rdquo;
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Publishing Sweet Spot Radar */}
        <div className={styles.card}>
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
            <span className={styles.peakDayBadge}>
              Peak: {insights.peakPublishingDay}
            </span>
          </div>

          <div className={styles.dayRadar}>
            {insights.publishingDays.map((day) => {
              const heightPct = Math.round((day.videoCount / maxDayCount) * 100);
              return (
                <div
                  key={day.dayName}
                  className={`${styles.dayCol} ${day.isPeak ? styles.peak : ''}`}
                >
                  <span className={styles.dayName}>{day.shortName}</span>
                  <div className={styles.dayPillar}>
                    <div
                      className={styles.dayPillarFill}
                      style={{ height: `${Math.max(14, heightPct)}%` }}
                    />
                  </div>
                  <span className={styles.dayCount}>{day.videoCount}v</span>
                </div>
              );
            })}
          </div>

          <div className={styles.radarTiming}>
            <Clock size={13} style={{ color: '#34d399', flexShrink: 0 }} />
            <span>Recommended Window: <strong>{insights.peakPublishingDay}s between 2:00 PM – 5:00 PM EST</strong> for pre-evening traffic buildup.</span>
          </div>
        </div>

        {/* Card 4: Audience Voice & Comment Pulse */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.cardHeaderLeft}>
              <div className={styles.cardIcon} style={{ background: 'rgba(167, 139, 250, 0.12)', color: '#a78bfa', borderColor: 'rgba(167, 139, 250, 0.3)' }}>
                <MessageSquare size={18} />
              </div>
              <div>
                <h3 className={styles.cardTitle}>Audience Sentiment & Demands</h3>
                <p className={styles.cardDesc}>Viewer praise drivers and high-demand topics</p>
              </div>
            </div>
            <span className={styles.positiveBadge}>
              88% Positive
            </span>
          </div>

          <div className={styles.sentimentRingRow}>
            {/* SVG Circular Animated Gauge */}
            <div className={styles.gaugeBox} title="Audience sentiment praise score: 88%">
              <svg className={styles.gaugeSvg} viewBox="0 0 72 72">
                <circle
                  className={styles.gaugeTrack}
                  cx="36"
                  cy="36"
                  r="28"
                  strokeWidth="5.5"
                />
                <circle
                  className={styles.gaugeFill}
                  cx="36"
                  cy="36"
                  r="28"
                  strokeWidth="5.5"
                  strokeDasharray="176"
                  strokeDashoffset="21"
                />
              </svg>
              <div className={styles.gaugeCenter}>
                <span className={styles.gaugeNumber}>{insights.audiencePulse.sentimentScore}%</span>
                <span className={styles.gaugeLabel}>Praise</span>
              </div>
            </div>

            <div className={styles.sentimentPulseDetails}>
              <div className={styles.sentimentVoiceHeader}>
                <span className={styles.pulsePraiseBadge}>
                  <Sparkles size={11} /> Retention Signals
                </span>
                {/* 5-bar Sound Wave Visualizer */}
                <div className={styles.soundWave} title="Audience voice frequency">
                  <span className={styles.waveBar} style={{ animationDelay: '0.0s' }} />
                  <span className={styles.waveBar} style={{ animationDelay: '0.2s' }} />
                  <span className={styles.waveBar} style={{ animationDelay: '0.4s' }} />
                  <span className={styles.waveBar} style={{ animationDelay: '0.15s' }} />
                  <span className={styles.waveBar} style={{ animationDelay: '0.35s' }} />
                </div>
              </div>
              <p className={styles.sentimentSummary}>
                Viewers repeatedly praise <strong>immediate hook momentum</strong> with
                clean pacing and high practical utility.
              </p>
            </div>
          </div>

          <div className={styles.demandSectionTitle}>
            <Flame size={13} style={{ color: '#ef4444' }} />
            <span>TOP DEMANDED FOLLOW-UP TOPICS (COMMENT MINING)</span>
          </div>
          <div className={styles.demandList}>
            {insights.audiencePulse.contentDemands.map((demand, i) => (
              <div key={i} className={styles.demandItem}>
                <span className={styles.demandTopic} title={demand.topic}>
                  {demand.topic}
                </span>
                <span className={styles.demandBadge}>
                  <Flame size={10} /> {demand.demandLevel}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Strategic Takeaway Banner */}
      <div className={styles.takeawayBanner}>
        <Lightbulb size={20} style={{ flexShrink: 0 }} />
        <span>
          <strong>Growth Takeaway:</strong> {insights.durationInsightText} Pair this length with a{' '}
          <strong>{insights.topFormula?.label || 'Curiosity Question'}</strong> title formula for maximum viewer
          conversion.
        </span>
      </div>
    </section>
  );
};
