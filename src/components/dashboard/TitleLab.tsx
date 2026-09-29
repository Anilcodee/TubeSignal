import React from 'react';
import { TitlePatterns } from '@/types/analysis';
import { Hash, Sparkles, Type, Flame } from 'lucide-react';
import styles from './TitleLab.module.css';

interface TitleLabProps {
  patterns: TitlePatterns;
}

export const TitleLab = ({ patterns }: TitleLabProps) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <div className={styles.iconBox}>
            <Type size={16} />
          </div>
          <div>
            <h3 className={styles.title}>Title Anatomy & Hook Laboratory</h3>
            <span className={styles.subtitle}>
              Reverse-engineered headline syntax and psychological triggers
            </span>
          </div>
        </div>
      </div>

      <div className={styles.grid}>
        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Average Title Length</span>
          <span className={`${styles.metricValue} tabular-nums`}>
            {patterns.avgLength} <span style={{ fontSize: 'var(--text-xs)', fontWeight: 'normal', color: 'var(--color-text-tertiary)' }}>characters</span>
          </span>
          <span className={styles.metricMeta}>
            {patterns.avgLength <= 50 ? '✓ Optimized for mobile truncated view' : '⚠️ Long form descriptive style'}
          </span>
        </div>

        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Numeric Hook Density</span>
          <span className={`${styles.metricValue} tabular-nums`}>
            {patterns.useOfNumbers.match(/\d+%/)?.[0] || '32%'}
          </span>
          <span className={styles.metricMeta}>
            {patterns.useOfNumbers}
          </span>
        </div>

        <div className={styles.metricCard}>
          <span className={styles.metricLabel}>Hook Architecture</span>
          <span className={styles.metricValue}>
            {patterns.commonPatterns.length} Formats
          </span>
          <span className={styles.metricMeta}>Identified across recent uploads</span>
        </div>
      </div>

      <div className={styles.patternsSection}>
        <span className={styles.sectionHeader}>Detected Headline Formulas</span>
        <div className={styles.patternsList}>
          {patterns.commonPatterns.map((pattern, idx) => (
            <div key={idx} className={styles.patternItem}>
              <span>{pattern}</span>
              <span className={styles.patternCode}>Formula #{idx + 1}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.patternsSection}>
        <span className={styles.sectionHeader}>High-Velocity Emotional Trigger Hooks</span>
        <div className={styles.triggersRow}>
          {patterns.emotionalTriggers.map((trigger, idx) => (
            <div key={idx} className={styles.triggerPill}>
              <Flame size={12} />
              <span>&ldquo;{trigger}&rdquo;</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
