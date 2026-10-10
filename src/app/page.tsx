'use client';

import type { CSSProperties } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, AudioLines, Check, ChevronRight, FlaskConical, Flame, ScanLine, ShieldCheck, Sparkles, TrendingUp, Video } from 'lucide-react';
import { CommandBar } from '@/components/search/CommandBar';
import { SignalScene } from '@/components/home/SignalScene';
import { FlipWords } from '@/components/ui/FlipWords';
import { TiltCard } from '@/components/ui/TiltCard';
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
      <div className={styles.heroBeams} aria-hidden="true" />
      <div className={styles.gridRays} aria-hidden="true" />
      <section className={styles.hero} aria-labelledby="workspace-title">
        <div className={styles.heroCopy}>
          <div className={styles.eyebrow}><span className={styles.liveDot} /> <span>Creator intelligence</span><b>/</b><span>01</span></div>
          <h1 id="workspace-title">Less noise.<br /><span>More signal.</span></h1>
          <p className={styles.subtitle}>
            Understand any channel.<br />
            Find what{' '}
            <FlipWords
              words={['stands out.', 'drives views.', 'hooks audiences.', 'compounds growth.']}
              className={styles.flipWordHighlight}
            />{' '}
            Know where to look next.
          </p>
          <div className={styles.searchWrapper}>
            <CommandBar isHero placeholder="Paste a channel link or @handle" onSearch={(id) => router.push(`/analyze/${encodeURIComponent(id)}`)} />
          </div>
          <div className={styles.searchHint}><span>Or search a creator by name</span><kbd>Ctrl / ⌘ K</kbd></div>
          <div className={styles.trustRow}>
            <span><ShieldCheck size={14} /> Public data only</span>
            <span className={styles.trustSep}>•</span>
            <span><Check size={14} /> No YouTube login</span>
            <span className={styles.trustSep}>•</span>
            <Link href="/compare" className={styles.compareHeroLink}>
              <TrendingUp size={14} />
              <span>Compare creators</span>
            </Link>
          </div>
          <div className={styles.signalStats} aria-label="TubeSignal workflow">
            <div><span className={styles.statIndex}>01</span><span><strong>Spot the outlier</strong><small>Find the uploads worth studying.</small></span></div>
            <div><span className={styles.statIndex}>02</span><span><strong>Read the pattern</strong><small>See what repeats across the catalog.</small></span></div>
            <div><span className={styles.statIndex}>03</span><span><strong>Make the next move</strong><small>Leave with a testable idea.</small></span></div>
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
          <div><span className={styles.sectionEyebrow}><ScanLine size={13} /> Interactive Preview</span><h2 id="samples-title">Start with a familiar face.</h2><p>Three sample reports. Zero setup. A feel for the full picture.</p></div>
          <span className={styles.sampleNote}><Sparkles size={13} /> Instant access, no sign-up</span>
        </div>
        <div className={styles.sampleGrid}>
          {SAMPLES.map(({ Icon, ...sample }) => (
            <TiltCard
              key={sample.handle}
              maxTilt={8}
              glareColor="rgba(255, 178, 36, 0.1)"
              onClick={() => router.push(`/analyze/${sample.handle}?demo=true`)}
            >
              <Link href={`/analyze/${sample.handle}?demo=true`} className={styles.sampleCard} style={{ '--card-color': sample.color } as CSSProperties}>
                <div className={styles.sampleTop}><span className={styles.sampleIcon}><Icon size={22} strokeWidth={1.6} /></span><span className={styles.sampleTag}>Sample report</span><ArrowRight size={17} className={styles.cardArrow} /></div>
                <div className={styles.cardInfo}><span className={styles.category}>{sample.category}</span><h3>{sample.name}</h3><p>{sample.detail}</p></div>
                <div className={styles.cardBottom}><span>@{sample.handle}<small>{sample.count} illustrative uploads</small></span><div className={styles.miniBars} aria-hidden="true">{sample.bars.map((height, i) => <i key={i} style={{ height: `${height}%` }} />)}</div></div>
              </Link>
            </TiltCard>
          ))}
        </div>
        <p className={styles.disclosure}><Sparkles size={13} /> Built for clarity, not information overload. Samples are illustrative, not live channel stats.</p>
      </section>
    </div>
  );
}
