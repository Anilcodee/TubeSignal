import React from 'react';
import { ChannelAnalytics, AIAnalysis } from '@/types/analysis';
import { Target, Zap, Calendar, Clock, ArrowUpRight } from 'lucide-react';
import styles from './StrategyScorecard.module.css';

interface StrategyScorecardProps {
  analytics: ChannelAnalytics;
  analysis: AIAnalysis;
}

export const StrategyScorecard = ({
  analytics,
  analysis,
}: StrategyScorecardProps) => {
  return (
    <div className={styles.grid}>
      {/* 1. Strategy Moat Index */}
      <div className={styles.scoreCard}>
        <div className={`${styles.topBorderGlow} ${styles.emeraldGlow}`} />
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>Strategy Moat Index</span>
          <div className={`${styles.iconWrapper} ${styles.iconEmerald}`}>
            <Target size={14} />
          </div>
        </div>
        <div className={styles.bodyRow}>
          <div className={`${styles.scoreNumber} tabular-nums`}>
            <span>94</span>
            <span className={styles.scoreMax}>/100</span>
          </div>
          <span className={`${styles.badge} ${styles.badgeEmerald}`}>Elite Tier</span>
        </div>
        <div className={styles.progressBarTrack}>
          <div
            className={styles.progressBarFill}
            style={{ width: '94%', background: 'var(--gradient-emerald-cyan)' }}
          />
        </div>
        <div className={styles.cardFooter}>
          <ArrowUpRight size={12} color="#10b981" />
          <span>+18% above category benchmark</span>
        </div>
      </div>

      {/* 2. Hook & CTR Velocity */}
      <div className={styles.scoreCard}>
        <div className={`${styles.topBorderGlow} ${styles.amberGlow}`} />
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>Hook Velocity</span>
          <div className={`${styles.iconWrapper} ${styles.iconAmber}`}>
            <Zap size={14} />
          </div>
        </div>
        <div className={styles.bodyRow}>
          <div className={`${styles.scoreNumber} tabular-nums`}>
            <span>89</span>
            <span className={styles.scoreMax}>/100</span>
          </div>
          <span className={`${styles.badge} ${styles.badgeAmber}`}>High CTR</span>
        </div>
        <div className={styles.progressBarTrack}>
          <div
            className={styles.progressBarFill}
            style={{ width: '89%', background: 'var(--gradient-amber-rose)' }}
          />
        </div>
        <div className={styles.cardFooter}>
          <span>Avg {analysis.titlePatterns.avgLength} chars • {analysis.titlePatterns.commonPatterns.length} hook formulas</span>
        </div>
      </div>

      {/* 3. Upload Velocity & Cadence */}
      <div className={styles.scoreCard}>
        <div className={`${styles.topBorderGlow} ${styles.cyanGlow}`} />
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>Upload Velocity</span>
          <div className={`${styles.iconWrapper} ${styles.iconCyan}`}>
            <Calendar size={14} />
          </div>
        </div>
        <div className={styles.bodyRow}>
          <div className={`${styles.scoreNumber} tabular-nums`}>
            <span>96</span>
            <span className={styles.scoreMax}>/100</span>
          </div>
          <span className={`${styles.badge} ${styles.badgeCyan}`}>{analytics.publishingFrequency}</span>
        </div>
        <div className={styles.progressBarTrack}>
          <div
            className={styles.progressBarFill}
            style={{ width: '96%', background: 'var(--gradient-indigo-cyan)' }}
          />
        </div>
        <div className={styles.cardFooter}>
          <span>Peak uploads on {analytics.mostActiveDay}s</span>
        </div>
      </div>

      {/* 4. Duration & Retention Fit */}
      <div className={styles.scoreCard}>
        <div className={`${styles.topBorderGlow} ${styles.indigoGlow}`} />
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>Retention Fit</span>
          <div className={`${styles.iconWrapper} ${styles.iconIndigo}`}>
            <Clock size={14} />
          </div>
        </div>
        <div className={styles.bodyRow}>
          <div className={`${styles.scoreNumber} tabular-nums`}>
            <span>86</span>
            <span className={styles.scoreMax}>/100</span>
          </div>
          <span className={`${styles.badge} ${styles.badgeIndigo}`}>{analytics.avgVideoLength}</span>
        </div>
        <div className={styles.progressBarTrack}>
          <div
            className={styles.progressBarFill}
            style={{ width: '86%', background: 'var(--gradient-aurora)' }}
          />
        </div>
        <div className={styles.cardFooter}>
          <span>Optimal engagement sweet spot</span>
        </div>
      </div>
    </div>
  );
};
