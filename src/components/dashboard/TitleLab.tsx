'use client';

import { useMemo, useState } from 'react';
import { Check, Copy, Hash, Sparkles, TrendingUp, Type } from 'lucide-react';
import type { TitlePatterns, VideoData } from '@/types/analysis';
import { analyzeTitleLengthBuckets } from '@/utils/math-analytics';
import styles from './TitleLab.module.css';
import { motion } from 'framer-motion';
import { fadeIn } from '@/utils/animations';

interface TitleLabProps {
  patterns: TitlePatterns;
  videos?: VideoData[];
  medianViews?: number;
}

export const TitleLab = ({ patterns, videos = [], medianViews = 0 }: TitleLabProps) => {
  const [copied, setCopied] = useState<number | null>(null);
  const [message, setMessage] = useState('');

  const bucketAnalysis = useMemo(() => {
    if (!videos || videos.length === 0) return null;
    return analyzeTitleLengthBuckets(videos, medianViews);
  }, [videos, medianViews]);

  const copyPattern = async (pattern: string, index: number) => {
    try {
      await navigator.clipboard.writeText(pattern);
      setCopied(index);
      setMessage('Pattern copied.');
    } catch {
      setCopied(null);
      setMessage('Couldn’t copy. You can select and copy the pattern text instead.');
    }
  };

  const avgLen = patterns.avgLength > 0 ? patterns.avgLength : 0;
  // Calculate percentage along 0 - 100 character scale for the spectrum pin
  const pinPercent = Math.min(Math.max((avgLen / 100) * 100, 4), 96);

  return (
    <motion.section className={styles.panel} aria-labelledby="title-lab-heading" initial="hidden" animate="visible" variants={fadeIn}>
      <div className={styles.header}>
        <span className={styles.icon}>
          <Type size={18} />
        </span>
        <div>
          <h3 id="title-lab-heading">The anatomy of a title.</h3>
          <p>Recurring structure and length brackets benchmarked against channel median.</p>
        </div>
      </div>

      <div className={styles.layout}>
        {/* Left Column: Title Length Spectrum & Brackets */}
        <div className={styles.lengthCard}>
          <div className={styles.lengthHeader}>
            <span className={styles.eyebrow}>AVERAGE TITLE LENGTH</span>
            <div className={styles.lengthHero}>
              <span className={styles.lengthNumber}>{avgLen > 0 ? avgLen : '—'}</span>
              <span className={styles.lengthUnit}>characters</span>
            </div>
          </div>

          {/* Visual Spectrum Meter */}
          <div className={styles.spectrumContainer} aria-label={`Average length: ${avgLen} characters`}>
            <div className={styles.spectrumBar}>
              <div className={styles.segmentShort} title="Punchy: ≤ 35 chars" />
              <div className={styles.segmentMedium} title="Balanced: 36 - 65 chars (Optimal mobile feed)" />
              <div className={styles.segmentLong} title="Detailed: 66+ chars (Search-heavy)" />
              {avgLen > 0 && (
                <div
                  className={styles.spectrumPin}
                  style={{ left: `${pinPercent}%` }}
                >
                  <div className={styles.pinDot} />
                  <span className={styles.pinLabel}>{avgLen}</span>
                </div>
              )}
            </div>
            <div className={styles.spectrumLegend}>
              <span>0 Chars</span>
              <span>35 (Punchy)</span>
              <span>65 (Mobile Cutoff)</span>
              <span>100+</span>
            </div>
          </div>

          <p className={styles.lengthNote}>
            YouTube mobile feed truncates titles around 65 characters. Longer titles lean heavily on search keywords.
          </p>

          {/* Performance Brackets */}
          {bucketAnalysis && bucketAnalysis.buckets.some((b) => b.count > 0) && (
            <div className={styles.bucketSection}>
              <div className={styles.bucketSectionHeader}>
                <span className={styles.bucketSectionTitle}>Length Performance Brackets</span>
                <span className={styles.bucketSectionSub}>Normalized vs channel median</span>
              </div>

              <div className={styles.bucketList}>
                {bucketAnalysis.buckets.map((b) => {
                  const maxAvg = Math.max(...bucketAnalysis.buckets.map((x) => x.avgViews), 1);
                  const pct = Math.round((b.avgViews / maxAvg) * 100);
                  const exampleVideo = videos.find((v) => {
                    const len = (v.title || '').length;
                    if (b.id === 'short') return len <= 35;
                    if (b.id === 'medium') return len > 35 && len <= 65;
                    return len > 65;
                  });

                  // Format label cleanly
                  const cleanLabel = b.id === 'short' ? 'Punchy' : b.id === 'medium' ? 'Balanced' : 'Detailed / SEO';
                  const isTopWinner = b.isWinner && b.count >= 4;
                  const isEarlySignal = b.isWinner && b.count >= 2 && b.count < 4;

                  return (
                    <div
                      key={b.id}
                      className={`${styles.bracketCard} ${isTopWinner || isEarlySignal ? styles.bracketCardWinner : ''}`}
                    >
                      <div className={styles.bracketTopRow}>
                        <div className={styles.bracketTitleGroup}>
                          <span className={styles.bracketName}>{cleanLabel}</span>
                          <span className={styles.bracketRangePill}>{b.rangeText}</span>
                        </div>

                        <div className={styles.bracketBadgeGroup}>
                          {isTopWinner && (
                            <span className={styles.sweetSpotBadge}>
                              <Sparkles size={11} /> Sweet Spot
                            </span>
                          )}
                          {isEarlySignal && (
                            <span className={styles.earlySignalBadge}>
                              <TrendingUp size={11} /> Early Signal
                            </span>
                          )}
                          <span className={b.count > 0 ? styles.bracketMultiplier : styles.bracketZero}>
                            {b.count > 0 ? `${b.liftMultiplier}× typical` : '0 uploads'}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar Track */}
                      <div className={styles.bracketTrack}>
                        <div
                          className={`${styles.bracketFill} ${isTopWinner || isEarlySignal ? styles.bracketFillWinner : ''}`}
                          style={{ width: `${b.count > 0 ? Math.max(10, pct) : 0}%` }}
                        />
                      </div>

                      {/* Card Bottom: Upload Count & Sample Title */}
                      <div className={styles.bracketBottomRow}>
                        <span className={styles.bracketCount}>{b.count} upload{b.count === 1 ? '' : 's'}</span>
                        {exampleVideo && (
                          <span className={styles.bracketExample} title={exampleVideo.title}>
                            e.g. &ldquo;{exampleVideo.title}&rdquo;
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Analytical Callout */}
              {bucketAnalysis.insight && (
                <div className={styles.insightBox}>
                  <div className={styles.insightIconBox}>
                    <TrendingUp size={14} />
                  </div>
                  <div className={styles.insightContent}>
                    <strong>Key Finding</strong>
                    <p>{bucketAnalysis.insight}</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Patterns to Notice */}
        <div className={styles.patterns}>
          <div className={styles.patternsHeader}>
            <h4>Patterns to notice</h4>
            <span className={styles.patternsCount}>{patterns.commonPatterns.length} detected</span>
          </div>

          {patterns.commonPatterns.length ? (
            patterns.commonPatterns.map((pattern, index) => (
              <div key={index} className={styles.pattern}>
                <span className={styles.index}>{String(index + 1).padStart(2, '0')}</span>
                <p>{pattern}</p>
                <button
                  type="button"
                  onClick={() => void copyPattern(pattern, index)}
                  aria-label={`Copy pattern: ${pattern}`}
                  title="Copy pattern"
                >
                  {copied === index ? <Check size={15} /> : <Copy size={15} />}
                </button>
              </div>
            ))
          ) : (
            <p className={styles.empty}>No recurring title patterns were identified in these uploads.</p>
          )}

          <div className={styles.numberNote}>
            <Hash size={15} />
            <p>{patterns.useOfNumbers || 'Not enough title data to compare number usage.'}</p>
          </div>

          {patterns.emotionalTriggers.length > 0 && (
            <div className={styles.tagsContainer}>
              <span className={styles.tagsLabel}>Emotional trigger vocabulary:</span>
              <div className={styles.tags}>
                {patterns.emotionalTriggers.map((word, index) => (
                  <span key={index}>{word}</span>
                ))}
              </div>
            </div>
          )}

          {message && <p className={styles.copyStatus} role="status">{message}</p>}
        </div>
      </div>
    </motion.section>
  );
};
