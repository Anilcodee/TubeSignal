'use client';

import { useState } from 'react';
import { Check, Copy, Hash, Type } from 'lucide-react';
import type { TitlePatterns } from '@/types/analysis';
import styles from './TitleLab.module.css';

export const TitleLab = ({ patterns }: { patterns: TitlePatterns }) => {
  const [copied, setCopied] = useState<number | null>(null);
  const [message, setMessage] = useState('');
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
  return (
    <section className={styles.panel} aria-labelledby="title-lab-heading">
      <div className={styles.header}><span className={styles.icon}><Type size={18} /></span><div><h3 id="title-lab-heading">The anatomy of a title.</h3><p>Recurring structure, not a formula for success.</p></div></div>
      <div className={styles.layout}>
        <div className={styles.lengthCard}><span className={styles.eyebrow}>AVERAGE TITLE LENGTH</span><span className={styles.lengthValue}>{patterns.avgLength > 0 ? patterns.avgLength : '—'}<small>characters</small></span><div className={styles.typeLines} aria-hidden="true"><i /><i /><i /></div><p>Observed across the uploads in this report. There is no universal ideal length.</p></div>
        <div className={styles.patterns}>
          <h4>Patterns to notice</h4>
          {patterns.commonPatterns.length ? patterns.commonPatterns.map((pattern, index) => (
            <div key={index} className={styles.pattern}><span className={styles.index}>{String(index + 1).padStart(2, '0')}</span><p>{pattern}</p><button type="button" onClick={() => void copyPattern(pattern, index)} aria-label={`Copy pattern: ${pattern}`} title="Copy pattern">{copied === index ? <Check size={15} /> : <Copy size={15} />}</button></div>
          )) : <p className={styles.empty}>No recurring title patterns were identified in these uploads.</p>}
          <div className={styles.numberNote}><Hash size={15} /><p>{patterns.useOfNumbers || 'Not enough title data to compare number usage.'}</p></div>
          {patterns.emotionalTriggers.length > 0 && <div className={styles.tags}>{patterns.emotionalTriggers.map((word, index) => <span key={index}>{word}</span>)}</div>}
          <p className={styles.copyStatus} role="status">{message}</p>
        </div>
      </div>
    </section>
  );
};
