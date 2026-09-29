import React from 'react';
import { TitlePatterns } from '@/types/analysis';
import { Type, Flame, Sparkles, Sliders, Layers } from 'lucide-react';
import styles from './TitleLab.module.css';

interface TitleLabProps {
  patterns: TitlePatterns;
}

export const TitleLab = ({ patterns }: TitleLabProps) => {
  const avgLen = patterns.avgLength || 44;
  // Calculate percentage on 0-80 character scale
  const pinPercent = Math.min(100, Math.max(5, (avgLen / 80) * 100));

  return (
    <div className={styles.container}>
      <div className={styles.topGlow} />

      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <div className={styles.iconBox}>
            <Type size={16} />
          </div>
          <div>
            <h3 className={styles.title}>Title Anatomy & Hook Laboratory</h3>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
              Synthesized headline patterns, character limits, and emotional triggers
            </span>
          </div>
        </div>
      </div>

      {/* Visual Character Sweet-Spot Meter */}
      <div className={styles.meterSection}>
        <div className={styles.meterHeader}>
          <span className={styles.meterTitle}>Character Length Distribution</span>
          <span className={`${styles.meterValue} tabular-nums`}>
            {avgLen} Characters <span style={{ fontSize: 'var(--text-xs)', color: '#34d399' }}>(Optimal 40-50 Zone)</span>
          </span>
        </div>

        <div className={styles.meterTrack}>
          <div className={styles.meterPin} style={{ left: `${pinPercent}%` }} title={`Average: ${avgLen} chars`} />
        </div>

        <div className={styles.meterLegend}>
          <span>Concise (&lt;30)</span>
          <span style={{ color: '#34d399', fontWeight: 'bold' }}>✓ Sweet Spot (38 - 52 Chars)</span>
          <span>Descriptive (&gt;65)</span>
        </div>
      </div>

      {/* Visual Formula Syntax Blocks */}
      <div>
        <span style={{ fontSize: 'var(--text-2xs)', fontFamily: 'var(--font-mono)', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '8px', display: 'block' }}>
          Deconstructed Headline Syntax Blocks
        </span>
        <div className={styles.formulasGrid}>
          {patterns.commonPatterns.map((pattern, idx) => (
            <div key={idx} className={styles.formulaCard}>
              <div className={styles.formulaHeader}>
                <span className={styles.formulaBadge}>Formula #{idx + 1}</span>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
                  {pattern}
                </span>
              </div>
              <div className={styles.syntaxRow}>
                <span className={`${styles.syntaxPill} ${styles.pillHook}`}>
                  [ ⚡ Emotional Trigger ]
                </span>
                <span className={styles.syntaxPlus}>+</span>
                <span className={`${styles.syntaxPill} ${styles.pillSubject}`}>
                  [ 📦 Subject / Product Entity ]
                </span>
                <span className={styles.syntaxPlus}>+</span>
                <span className={`${styles.syntaxPill} ${styles.pillVerdict}`}>
                  [ ⚖️ Definitive Verdict ]
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Emotional Trigger Heat Cloud */}
      <div className={styles.triggersSection}>
        <span style={{ fontSize: 'var(--text-2xs)', fontFamily: 'var(--font-mono)', color: 'var(--color-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          High-Velocity Trigger Words Detected in Catalog
        </span>
        <div className={styles.triggerTags}>
          {patterns.emotionalTriggers.map((trigger, idx) => (
            <div key={idx} className={styles.triggerChip}>
              <Flame size={13} />
              <span>&ldquo;{trigger}&rdquo;</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
