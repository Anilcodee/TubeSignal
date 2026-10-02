import React from 'react';
import { ChannelAnalytics, AIAnalysis } from '@/types/analysis';
import { Eye, Calendar, Type, Clock, TrendingUp } from 'lucide-react';
import styles from './StrategyScorecard.module.css';

interface StrategyScorecardProps {
  analytics: ChannelAnalytics;
  analysis: AIAnalysis;
  totalVideosAnalyzed?: number;
}

export const StrategyScorecard = ({
  analytics,
  analysis,
  totalVideosAnalyzed = 30,
}: StrategyScorecardProps) => {
  const avgLen = analysis.titlePatterns?.avgLength || 44;
  const commonFormulasCount = analysis.titlePatterns?.commonPatterns?.length || 3;

  return (
    <div className={styles.grid}>
      {/* 1. Average Video Performance */}
      <div className={styles.scoreCard}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>Average Performance</span>
          <div className={styles.iconWrapper}>
            <Eye size={14} />
          </div>
        </div>
        <div className={styles.bodyRow}>
          <div className={`${styles.scoreNumber} tabular-nums`}>
            <span>{analytics.avgViewsFormatted}</span>
          </div>
          <span className={styles.badge}>Per Upload</span>
        </div>
        <div className={styles.cardFooter}>
          <TrendingUp size={12} color="#10b981" />
          <span>Across {totalVideosAnalyzed} analyzed videos</span>
        </div>
      </div>

      {/* 2. Upload Cadence & Schedule */}
      <div className={styles.scoreCard}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>Publishing Cadence</span>
          <div className={styles.iconWrapper}>
            <Calendar size={14} />
          </div>
        </div>
        <div className={styles.bodyRow}>
          <div className={`${styles.scoreNumber} tabular-nums`}>
            <span>{analytics.publishingFrequency}</span>
          </div>
          <span className={styles.badge}>Weekly</span>
        </div>
        <div className={styles.cardFooter}>
          <span>Most active on {analytics.mostActiveDay}s</span>
        </div>
      </div>

      {/* 3. Title Length Strategy */}
      <div className={styles.scoreCard}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>Title Length</span>
          <div className={styles.iconWrapper}>
            <Type size={14} />
          </div>
        </div>
        <div className={styles.bodyRow}>
          <div className={`${styles.scoreNumber} tabular-nums`}>
            <span>{avgLen}</span>
            <span className={styles.scoreUnit}>chars avg</span>
          </div>
          <span className={styles.badge}>{avgLen >= 35 && avgLen <= 55 ? 'Optimal' : 'Standard'}</span>
        </div>
        <div className={styles.cardFooter}>
          <span>{commonFormulasCount} recurring headline formats</span>
        </div>
      </div>

      {/* 4. Video Duration Sweetspot */}
      <div className={styles.scoreCard}>
        <div className={styles.cardHeader}>
          <span className={styles.cardTitle}>Average Duration</span>
          <div className={styles.iconWrapper}>
            <Clock size={14} />
          </div>
        </div>
        <div className={styles.bodyRow}>
          <div className={`${styles.scoreNumber} tabular-nums`}>
            <span>{analytics.avgVideoLength}</span>
          </div>
          <span className={styles.badge}>Runtime</span>
        </div>
        <div className={styles.cardFooter}>
          <span>Target longform retention range</span>
        </div>
      </div>
    </div>
  );
};
