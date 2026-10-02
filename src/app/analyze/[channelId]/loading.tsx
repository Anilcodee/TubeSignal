'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, AudioLines, ShieldCheck } from 'lucide-react';
import styles from './loading.module.css';

export default function Loading() {
  const [isTakingLonger, setIsTakingLonger] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setIsTakingLonger(true), 12000);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div className={styles.loadingContainer}>
      <section className={styles.loadingCard} aria-label="Loading channel analysis">
        <div className={styles.scanner} aria-hidden="true"><i /><i /><span><AudioLines size={32} /></span></div>
        <span className={styles.eyebrow}>TUNING INTO THE CHANNEL</span>
        <h1>A little less noise.<br /><span>A little more clarity.</span></h1>
        <p className={styles.status} role="status">{isTakingLonger ? 'Still waiting for the analysis. Some channels take a little longer.' : 'Preparing your report from the available channel data…'}</p>
        <div className={styles.pipeline} aria-hidden="true"><span>Public uploads</span><i /><span>Comparisons</span><i /><span>Your brief</span></div>
        <div className={styles.skeletons} aria-hidden="true">{[0, 1, 2, 3].map((item) => <div key={item}><span /><span /><span /></div>)}</div>
        <p className={styles.privacy}><ShieldCheck size={13} /> Only public data. No YouTube account access.</p>
        <Link href="/" className={styles.back}><ArrowLeft size={13} /> Back to search</Link>
      </section>
    </div>
  );
}
