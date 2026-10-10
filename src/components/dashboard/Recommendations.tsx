import { ArrowUpRight, ChevronDown, Lightbulb } from 'lucide-react';
import type { AIAnalysis } from '@/types/analysis';
import styles from './Recommendations.module.css';

const LABELS = ['Start here', 'Try next', 'Keep in mind'];

export const Recommendations = ({ analysis, source }: { analysis: AIAnalysis; source: 'gemini' | 'computed' }) => (
  <section className={styles.panel} aria-labelledby="recommendations-title">
    <div className={styles.header}><span className={styles.headerIcon}><Lightbulb size={18} /></span><ArrowUpRight size={17} aria-hidden="true" /></div>
    <span className={styles.eyebrow}>IDEAS TO TEST</span>
    <h3 id="recommendations-title" className={styles.title}>What could you try next?</h3>
    <p className={styles.caption}>{source === 'gemini' ? 'Suggested from the available videos. Treat these as experiments, not guarantees.' : 'A few grounded ideas based on the videos in this report.'}</p>
     <div className={styles.list}>
       {analysis.recommendations.slice(0, 3).map((text, index) => (
         <details key={index} className={styles.item} open={index === 0}>
           <summary><span className={styles.number}>{String(index + 1).padStart(2, '0')}</span><span>{LABELS[index] || `One more idea (${index + 1})`}</span><ChevronDown size={14} /></summary>
           <p>{text}</p>
         </details>
       ))}
     </div>
     {analysis.recommendations.length > 3 && (
       <details className={styles.moreIdeas}>
         <summary>Show {analysis.recommendations.length - 3} more idea{analysis.recommendations.length - 3 === 1 ? '' : 's'} <ChevronDown size={13} /></summary>
         <div className={styles.moreIdeaList}>
           {analysis.recommendations.slice(3).map((text, index) => <p key={index}><span>{String(index + 4).padStart(2, '0')}</span>{text}</p>)}
         </div>
       </details>
     )}
     {!analysis.recommendations.length && <p className={styles.empty}>More public data is needed before suggesting a next step.</p>}
   </section>
 );
