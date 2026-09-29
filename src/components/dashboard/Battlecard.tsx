import React, { useState } from 'react';
import { AIAnalysis } from '@/types/analysis';
import { ShieldCheck, Copy, Check, Target, TrendingUp, AlertTriangle } from 'lucide-react';
import styles from './Battlecard.module.css';

interface BattlecardProps {
  analysis: AIAnalysis;
  channelName: string;
}

export const Battlecard = ({ analysis, channelName }: BattlecardProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = `TUBE SIGNAL STRATEGY DOSSIER: ${channelName.toUpperCase()}
--------------------------------------------------
EDITORIAL MOAT:
${analysis.summary}

COMPETITIVE DIRECTIVES:
${analysis.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}

TOP VIRAL TRAITS:
${analysis.performanceInsights.topPerformingTraits.map((t) => `- ${t}`).join('\n')}
`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleGroup}>
          <div className={styles.iconBox}>
            <ShieldCheck size={16} />
          </div>
          <div>
            <h3 className={styles.title}>Strategic Intelligence & Directives</h3>
            <span className={styles.subtitle}>
              Actionable playbook for competing or positioning against {channelName}
            </span>
          </div>
        </div>

        <button type="button" className={styles.copyBtn} onClick={handleCopy}>
          {copied ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
          <span>{copied ? 'Dossier Copied' : 'Copy Brief'}</span>
        </button>
      </div>

      <div className={styles.moatBox}>
        <p>{analysis.summary}</p>
      </div>

      <div>
        <span className={styles.sectionHeader}>Tactical Playbook Directives</span>
        <div className={styles.directiveGrid}>
          {analysis.recommendations.map((rec, idx) => (
            <div key={idx} className={styles.directiveItem}>
              <span className={styles.numBadge}>{idx + 1}</span>
              <span className={styles.directiveText}>{rec}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.splitInsights}>
        <div className={styles.insightCol}>
          <span className={styles.colHeaderPositive}>✓ High-Retention & Viral Catalysts</span>
          <ul className={styles.list}>
            {analysis.performanceInsights.topPerformingTraits.map((trait, i) => (
              <li key={i}>{trait}</li>
            ))}
            {analysis.performanceInsights.viralFactors.map((viral, i) => (
              <li key={`v-${i}`}>Catalyst: {viral}</li>
            ))}
          </ul>
        </div>

        <div className={styles.insightCol}>
          <span className={styles.colHeaderNegative}>⚠️ Audience Drop-off Signals</span>
          <ul className={styles.list}>
            {analysis.performanceInsights.underperformingTraits.map((trait, i) => (
              <li key={i}>{trait}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
