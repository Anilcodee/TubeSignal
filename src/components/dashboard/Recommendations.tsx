import { ArrowUpRight, ChevronDown, Lightbulb } from 'lucide-react';
import type { AIAnalysis } from '@/types/analysis';
import styles from './Recommendations.module.css';

const LABELS = ['Start here', 'Then consider', 'Keep in mind'];

export const Recommendations = ({ analysis, source }: { analysis: AIAnalysis; source: 'gemini' | 'computed' }) => (
  <section className={styles.panel} aria-labelledby="recommendations-title">
    <div className={styles.header}><span className={styles.headerIcon}><Lightbulb size={18} /></span><ArrowUpRight size={17} aria-hidden="true" /></div>
    <span className={styles.eyebrow}>FROM INSIGHT TO ACTION</span>
    <h3 id="recommendations-title" className={styles.title}>Your next move.</h3>
    <p className={styles.caption}>{source === 'gemini' ? 'AI-assisted ideas to test, not guarantees.' : 'A few grounded ideas to explore.'}</p>
    <div className={styles.list}>
      {analysis.recommendations.map((text, index) => (
        <details key={index} className={styles.item} open={index === 0}>
          <summary><span className={styles.number}>{String(index + 1).padStart(2, '0')}</span><span>{LABELS[index] || `One more idea (${index + 1})`}</span><ChevronDown size={14} /></summary>
          <p>{text}</p>
        </details>
      ))}
    </div>
    {!analysis.recommendations.length && <p className={styles.empty}>More public data is needed before suggesting a next step.</p>}
  </section>
);
