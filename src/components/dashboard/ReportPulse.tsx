'use client';

import { ArrowRight, Lightbulb, Repeat2, Sparkles, Trophy } from 'lucide-react';
import type { FullAnalysisResponse } from '@/types/analysis';
import { analyzeChannelGrowth } from '@/utils/growth-analyzer';
import { formatViews } from '@/utils/format';
import { ConfidenceLabel } from '@/components/ui/ConfidenceLabel';
import styles from './ReportPulse.module.css';

interface ReportPulseProps {
  data: FullAnalysisResponse;
  onExplorePatterns: () => void;
}

const shorten = (text: string, length: number) => (
  text.length > length ? `${text.slice(0, length - 1).trimEnd()}…` : text
);

export const ReportPulse = ({ data, onExplorePatterns }: ReportPulseProps) => {
  const observed = data.videos.filter(
    (video) => video.viewsAvailable !== false && Number.isFinite(video.views) && video.views >= 0,
  );
  const topVideo = [...observed].sort((a, b) => b.views - a.views)[0];
  const growth = analyzeChannelGrowth(data.videos, data.analytics.medianViews, data.aiAnalysis);
  const topMultiplier = topVideo && data.analytics.medianViews > 0
    ? topVideo.views / data.analytics.medianViews
    : null;
  const winningDuration = growth.winningDuration;
  const topFormula = growth.topFormula;
  const hasRepeatableSignal = Boolean(winningDuration || (topFormula && topFormula.count >= 2));
  const recommendation = data.aiAnalysis.recommendations[0]
    || 'Use the strongest upload as a baseline and test one change in your next release.';

  const leverTitle = winningDuration?.rangeText || topFormula?.badge || 'More evidence needed';
  const leverDescription = winningDuration
    ? `${winningDuration.viewMultiplier}× typical views across ${winningDuration.count} uploads`
    : topFormula && topFormula.count >= 2
      ? `${topFormula.winRate}% beat typical across ${topFormula.count} uploads`
      : 'Try the Patterns tab to find a repeatable signal';

  return (
    <section className={styles.pulse} aria-labelledby="channel-pulse-title">
      <div className={styles.pulseHeader}>
        <div className={styles.headerCopy}>
          <span className={styles.eyebrow}><Sparkles size={13} /> Channel pulse</span>
          <h2 id="channel-pulse-title">Three signals. One move.</h2>
          <p>Start with the standout, understand what repeats, then turn one observation into your next test.</p>
        </div>
        <ConfidenceLabel sampleSize={observed.length} detail={`${observed.length} uploads with view data`} />
      </div>

      <div className={styles.signalGrid}>
        <article className={`${styles.signalCard} ${styles.signalCardAccent}`}>
          <div className={styles.cardTopline}>
            <span className={styles.cardLabel}><Trophy size={13} /> Standout</span>
            {topMultiplier !== null && <span className={styles.multiplier}>{topMultiplier.toFixed(1)}× typical</span>}
          </div>
          <strong className={styles.cardValue}>{topVideo ? formatViews(topVideo.views) : '—'}</strong>
          <p>{topVideo ? shorten(topVideo.title, 58) : 'No view-based standout yet'}</p>
            <span className={styles.cardMeta}>{topVideo ? 'Lifetime views · age not adjusted' : 'Add more public uploads to compare'}</span>
        </article>

        <article className={styles.signalCard}>
          <div className={styles.cardTopline}>
            <span className={styles.cardLabel}><Repeat2 size={13} /> Repeatable lever</span>
            <span className={`${styles.evidenceTag} ${hasRepeatableSignal ? styles.evidenceTagPositive : ''}`}>
              {hasRepeatableSignal ? 'Observed' : 'Explore'}
            </span>
          </div>
          <strong className={styles.cardValue}>{leverTitle}</strong>
          <p>{leverDescription}</p>
            <span className={styles.cardMeta}><ConfidenceLabel sampleSize={winningDuration?.count || topFormula?.count || 0} detail="uploads in signal" /></span>
        </article>

        <article className={`${styles.signalCard} ${styles.nextCard}`}>
          <div className={styles.cardTopline}>
            <span className={styles.cardLabel}><Lightbulb size={13} /> Next experiment</span>
            <span className={styles.experimentIndex}>01</span>
          </div>
          <p className={styles.recommendation}>{shorten(recommendation, 140)}</p>
          <button type="button" className={styles.exploreButton} onClick={onExplorePatterns}>
            Open growth levers <ArrowRight size={14} />
          </button>
        </article>
      </div>

      <div className={styles.pulseFooter}>
        <span>Read left to right: evidence <i aria-hidden="true">→</i> pattern <i aria-hidden="true">→</i> action</span>
        <span>Typical = median views in this report · lifetime totals</span>
      </div>
    </section>
  );
};
