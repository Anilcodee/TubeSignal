import { ArrowUpRight, AudioLines, ScanLine, Sparkles } from 'lucide-react';
import styles from './SignalScene.module.css';

/** Decorative, CSS-only depth; no WebGL runtime or external assets. */
export const SignalScene = () => (
  <div className={styles.scene} aria-hidden="true">
    <div className={styles.halo} />
    <div className={styles.coordinates}><span>CREATOR INTELLIGENCE</span><ScanLine size={16} /></div>
    <div className={styles.orbit}><i /><i /><i /></div>
    <div className={styles.sculpture}>
      <div className={styles.ringOuter} />
      <div className={styles.ringMiddle} />
      <div className={styles.ringInner} />
      <div className={styles.core}><AudioLines size={64} strokeWidth={1.5} /></div>
    </div>
    <div className={styles.signalTag}><span /><span>Finding the signal</span><Sparkles size={13} /></div>
    <div className={styles.preview}>
      <div className={styles.previewTop}><span className={styles.avatar}>M</span><div><strong>Channel, decoded.</strong><span>Illustrative preview</span></div><ArrowUpRight size={18} /></div>
      <div className={styles.barChart}>{[38, 60, 46, 92, 53, 70, 42, 82, 56, 100, 65, 76].map((height, index) => <span key={index} style={{ height: `${height}%`, animationDelay: `${index * 45}ms` }} />)}</div>
      <div className={styles.previewBottom}><span>See what stands out</span><span className={styles.legend}>Not just more numbers</span></div>
    </div>
    <div className={styles.insight}><div><Sparkles size={15} /></div><span>From data overload<br /><strong>to your next idea.</strong></span></div>
    <span className={styles.caption}>A different lens on YouTube.</span>
  </div>
);
