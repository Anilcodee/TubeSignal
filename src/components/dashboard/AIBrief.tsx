import React from 'react';
import { AIAnalysis } from '@/types/analysis';
import { Sparkles, Target } from 'lucide-react';
import styles from './AIBrief.module.css';

interface AIBriefProps {
  analysis: AIAnalysis;
}

export const AIBrief = ({ analysis }: AIBriefProps) => {
  return (
    <div className={styles.container}>
      <div className={styles.glowCorner} />

      <div className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.aiBadge}>
            <Sparkles size={14} />
             <span>Strategy summary</span>
          </div>
           <h2 className={styles.title}>What to learn from this channel</h2>
        </div>
      </div>

      <div className={styles.summaryText}>
        <p>{analysis.summary}</p>
      </div>

      <div>
        <h3 className={styles.sectionTitle}>
          <Target size={16} color="#7c5cfc" />
           <span>Ideas to test</span>
        </h3>
        <div className={styles.recommendationsList}>
          {analysis.recommendations.map((rec, idx) => (
            <div key={idx} className={styles.recItem}>
              <span className={styles.recNum}>#{idx + 1}</span>
              <span>{rec}</span>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.insightsGrid}>
        <div className={styles.insightCard}>
           <span className={styles.insightCardTitle}>Title patterns</span>
          <ul className={styles.insightList}>
            <li>Average Length: {analysis.titlePatterns.avgLength} characters</li>
            <li>Number Usage: {analysis.titlePatterns.useOfNumbers}</li>
            {analysis.titlePatterns.commonPatterns.map((p, i) => (
              <li key={i}>Pattern: {p}</li>
            ))}
          </ul>
        </div>

        <div className={styles.insightCard}>
           <span className={styles.insightCardTitle}>What performs well</span>
          <ul className={styles.insightList}>
            {analysis.performanceInsights.topPerformingTraits.map((trait, i) => (
              <li key={i}>{trait}</li>
            ))}
            {analysis.performanceInsights.viralFactors.map((viral, i) => (
              <li key={`v-${i}`}>Catalyst: {viral}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
