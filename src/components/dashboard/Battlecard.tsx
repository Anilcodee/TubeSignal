import React, { useState } from 'react';
import { AIAnalysis } from '@/types/analysis';
import { ShieldCheck, Copy, Check, Target, Zap, TrendingUp, AlertOctagon, Sparkles, Award } from 'lucide-react';
import styles from './Battlecard.module.css';

interface BattlecardProps {
  analysis: AIAnalysis;
  channelName: string;
}

export const Battlecard = ({ analysis, channelName }: BattlecardProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = `TUBE SIGNAL CREATOR INTEL: ${channelName.toUpperCase()}
==================================================
EDITORIAL MOAT:
${analysis.summary}

TACTICAL PLAYBOOK:
${analysis.recommendations.map((r, i) => `[Directive #${i + 1}] ${r}`).join('\n')}

VIRAL CATALYSTS:
${analysis.performanceInsights.topPerformingTraits.map((t) => `✓ ${t}`).join('\n')}
`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.topGlow} />

      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <div className={styles.iconBox}>
            <Award size={16} />
          </div>
          <div>
            <h3 className={styles.title}>Strategic Intelligence & Directives</h3>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-tertiary)' }}>
              Actionable playbook reverse-engineered from {channelName}&apos;s catalog
            </span>
          </div>
        </div>

        <button type="button" className={styles.copyBtn} onClick={handleCopy}>
          {copied ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
          <span>{copied ? 'Copied to Clipboard' : 'Copy Brief'}</span>
        </button>
      </div>

      {/* Hero Moat Box */}
      <div className={styles.moatHero}>
        <div className={styles.moatHeader}>
          <Sparkles size={12} />
          <span>Core Editorial Moat</span>
        </div>
        <p className={styles.moatText}>{analysis.summary}</p>
      </div>

      {/* Visual Actionable Directives */}
      <div>
        <span className={styles.sectionTitle}>High-Impact Growth Directives</span>
        <div className={styles.directiveGrid}>
          {analysis.recommendations.map((rec, idx) => {
            const priorityClass =
              idx === 0
                ? styles.priorityHigh
                : idx === 1
                ? styles.priorityHigh
                : idx === 2
                ? styles.priorityMed
                : styles.priorityScale;

            const priorityLabel =
              idx === 0
                ? 'P0 • Critical'
                : idx === 1
                ? 'P0 • High Lift'
                : idx === 2
                ? 'P1 • Tactical'
                : 'P2 • Scale';

            return (
              <div key={idx} className={styles.directiveCard}>
                <div className={styles.directiveLeft}>
                  <span className={`${styles.priorityPill} ${priorityClass}`}>
                    {priorityLabel}
                  </span>
                </div>
                <div className={styles.directiveBody}>
                  <p className={styles.directiveTitle}>{rec}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Visual Catalyst Chips */}
      <div className={styles.catalystGrid}>
        <div className={styles.catalystBox}>
          <div className={styles.catalystHeaderGreen}>
            <TrendingUp size={13} />
            <span>Top Virality Drivers</span>
          </div>
          <div className={styles.chipsList}>
            {analysis.performanceInsights.topPerformingTraits.map((trait, i) => (
              <div key={i} className={styles.chipGreen}>
                <span style={{ color: '#10b981', fontWeight: 'bold' }}>✓</span>
                <span>{trait}</span>
              </div>
            ))}
            {analysis.performanceInsights.viralFactors.map((viral, i) => (
              <div key={`v-${i}`} className={styles.chipGreen}>
                <span style={{ color: '#06b6d4', fontWeight: 'bold' }}>⚡</span>
                <span>Catalyst: {viral}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.catalystBox}>
          <div className={styles.catalystHeaderRed}>
            <AlertOctagon size={13} />
            <span>Audience Drop-Off Signals</span>
          </div>
          <div className={styles.chipsList}>
            {analysis.performanceInsights.underperformingTraits.map((trait, i) => (
              <div key={i} className={styles.chipRed}>
                <span style={{ color: '#f43f5e', fontWeight: 'bold' }}>⚠️</span>
                <span>{trait}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
