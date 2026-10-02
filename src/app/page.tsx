'use client';

import type { CSSProperties } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowDown, ArrowRight, AudioLines, Check, ChevronRight, FlaskConical, Flame, ScanLine, ShieldCheck, Sparkles, TrendingUp, Video } from 'lucide-react';
import { CommandBar } from '@/components/search/CommandBar';
import { SignalScene } from '@/components/home/SignalScene';
import styles from './page.module.css';

const SAMPLES = [
  { name: 'Marques Brownlee', handle: 'mkbhd', category: 'The tech perspective', detail: 'Reviews, launches & the bigger picture.', count: 5, Icon: Video, color: 'var(--accent)', bars: [82, 59, 100, 51, 42] },
  { name: 'Fireship', handle: 'fireship', category: 'The developer perspective', detail: 'Code, fast takes & curious minds.', count: 3, Icon: Flame, color: 'var(--series-4)', bars: [100, 40, 66] },
  { name: 'Veritasium', handle: 'veritasium', category: 'The science perspective', detail: 'Big questions. Unexpected answers.', count: 3, Icon: FlaskConical, color: 'var(--series-3)', bars: [100, 71, 78] },
];

export default function WorkspacePage() {
  const router = useRouter();
  return (
    <div className={styles.workspace}>
      <section className={styles.hero} aria-labelledby="workspace-title">
        <div className={styles.heroCopy}>
          <div className={styles.eyebrow}><span className={styles.liveDot} /> A clearer lens on YouTube</div>
          <h1 id="workspace-title">Less noise.<br /><span>More signal.</span></h1>
          <p className={styles.subtitle}>Understand any channel.<br />Find what stands out. Know where to look next.</p>
          <div className={styles.searchWrapper}>
            <CommandBar isHero placeholder="Paste a channel link or @handle" onSearch={(id) => router.push(`/analyze/${encodeURIComponent(id)}`)} />
          </div>
          <div className={styles.searchHint}><span>Or search a creator by name</span><kbd>Ctrl / ⌘ K</kbd></div>
          <div className={styles.trustRow}>
            <span><ShieldCheck size={14} /> Public data only</span>
            <span><Check size={14} /> No YouTube login</span>
            <Link href="/compare" style={{ color: 'var(--accent)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <TrendingUp size={13} /> Compare creators
            </Link>
          </div>
        </div>
        <SignalScene />
      </section>

      <section className={styles.journey} aria-label="What your report helps you understand">
        <div className={styles.journeyIntro}><AudioLines size={19} /><span>A channel.<br /><strong>Three clear answers.</strong></span></div>
        <div className={styles.journeyItem}><span>01</span><div><h2>What stands out?</h2><p>Spot the uploads worth a closer look.</p></div></div>
        <ChevronRight className={styles.journeyArrow} size={16} aria-hidden="true" />
        <div className={styles.journeyItem}><span>02</span><div><h2>What’s the pattern?</h2><p>See the titles, timing and formats.</p></div></div>
        <ChevronRight className={styles.journeyArrow} size={16} aria-hidden="true" />
        <div className={styles.journeyItem}><span>03</span><div><h2>What’s next?</h2><p>Turn observations into ideas to test.</p></div></div>
      </section>

      <section id="sample-reports" className={styles.samples} aria-labelledby="samples-title">
        <div className={styles.sectionHeader}>
          <div><span className={styles.sectionEyebrow}><ScanLine size={13} /> TAKE A LOOK INSIDE</span><h2 id="samples-title">Start with a familiar face.</h2><p>Three sample reports. Zero setup. A feel for the full picture.</p></div>
          <span className={styles.sampleNote}>Explore the experience <ArrowDown size={14} /></span>
        </div>
        <div className={styles.sampleGrid}>
          {SAMPLES.map(({ Icon, ...sample }) => (
            <Link key={sample.handle} href={`/analyze/${sample.handle}?demo=true`} className={styles.sampleCard} style={{ '--card-color': sample.color } as CSSProperties}>
              <div className={styles.sampleTop}><span className={styles.sampleIcon}><Icon size={22} strokeWidth={1.6} /></span><span className={styles.sampleTag}>SAMPLE REPORT</span><ArrowRight size={17} className={styles.cardArrow} /></div>
              <div className={styles.cardInfo}><span className={styles.category}>{sample.category}</span><h3>{sample.name}</h3><p>{sample.detail}</p></div>
              <div className={styles.cardBottom}><span>@{sample.handle}<small>{sample.count} illustrative uploads</small></span><div className={styles.miniBars} aria-hidden="true">{sample.bars.map((height, i) => <i key={i} style={{ height: `${height}%` }} />)}</div></div>
            </Link>
          ))}
        </div>
        <p className={styles.disclosure}><Sparkles size={13} /> Built for clarity, not information overload. Samples are illustrative, not live channel stats.</p>
      </section>
    </div>
  );
}
