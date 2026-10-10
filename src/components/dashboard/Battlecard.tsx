import React, { useState } from 'react';
import { AIAnalysis } from '@/types/analysis';
import { Copy, Check, TrendingUp, AlertTriangle, BookOpen } from 'lucide-react';
import styles from './Battlecard.module.css';

interface BattlecardProps {
  analysis: AIAnalysis;
  channelName: string;
}

export const Battlecard = ({ analysis, channelName }: BattlecardProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    const text = `TUBE SIGNAL STRATEGY PLAYBOOK: ${channelName.toUpperCase()}
==================================================
SUMMARY:
${analysis.summary}

KEY DIRECTIVES:
${analysis.recommendations.map((r, i) => `${i + 1}. ${r}`).join('\n')}

TOP PERFORMING TRAITS:
${analysis.performanceInsights.topPerformingTraits.map((t) => `+ ${t}`).join('\n')}

RISK FACTORS:
${analysis.performanceInsights.underperformingTraits.map((t) => `- ${t}`).join('\n')}
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
            <BookOpen size={15} />
          </div>
          <div>
             <h3 className={styles.title}>Channel strategy notes</h3>
            <span className={styles.subtitle}>
              Format structure and content patterns for {channelName}
            </span>
          </div>
        </div>

        <button type="button" className={styles.copyBtn} onClick={handleCopy}>
          {copied ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
               <span>{copied ? 'Copied' : 'Copy notes'}</span>
        </button>
      </div>

      {/* Summary Box */}
      <div className={styles.summaryBox}>
         <span className={styles.summaryLabel}>Channel summary</span>
        <p className={styles.summaryText}>{analysis.summary}</p>
      </div>

      {/* Directives */}
      <div className={styles.directivesSection}>
       <span className={styles.sectionTitle}>Ideas worth testing</span>
        <div className={styles.directiveList}>
          {analysis.recommendations.map((rec, idx) => (
            <div key={idx} className={styles.directiveItem}>
              <span className={styles.directiveIndex}>{idx + 1}</span>
              <p className={styles.directiveText}>{rec}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Traits Breakdown */}
      <div className={styles.traitsGrid}>
        <div className={styles.traitBox}>
          <div className={styles.traitHeaderGreen}>
            <TrendingUp size={13} />
             <span>Patterns in stronger videos</span>
          </div>
          <div className={styles.traitList}>
            {analysis.performanceInsights.topPerformingTraits.map((trait, i) => (
              <div key={i} className={styles.traitItemGreen}>
                <span className={styles.dotGreen}>+</span>
                <span>{trait}</span>
              </div>
            ))}
            {analysis.performanceInsights.viralFactors.map((viral, i) => (
              <div key={`v-${i}`} className={styles.traitItemGreen}>
                <span className={styles.dotGreen}>+</span>
                <span>{viral}</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.traitBox}>
          <div className={styles.traitHeaderRed}>
            <AlertTriangle size={13} />
             <span>Patterns to watch</span>
          </div>
          <div className={styles.traitList}>
            {analysis.performanceInsights.underperformingTraits.map((trait, i) => (
              <div key={i} className={styles.traitItemRed}>
                <span className={styles.dotRed}>-</span>
                <span>{trait}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
