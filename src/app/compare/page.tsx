'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, ArrowRightLeft, Award, Clock, ExternalLink, Eye, Flame, Loader2, Sparkles, TrendingUp, Users, Video } from 'lucide-react';
import { motion } from 'framer-motion';
import type { FullAnalysisResponse } from '@/types/analysis';
import { formatViews, parseDurationToSeconds, formatSecondsToDuration } from '@/utils/format';
import { getClientCachedAnalysis, setClientCachedAnalysis } from '@/hooks/useAnalysis';
import { HookComparison } from '@/components/dashboard/HookComparison';
import styles from './page.module.css';

interface ChannelComparisonState {
  c1Data: FullAnalysisResponse | null;
  c2Data: FullAnalysisResponse | null;
  loading: boolean;
  error: string | null;
}

const ComparisonBar = ({
  label,
  leftName,
  leftValue,
  rightName,
  rightValue,
  formatValue = formatViews,
  higherLabel = 'Higher',
  context,
}: {
  label: string;
  leftName: string;
  leftValue: number | null;
  rightName: string;
  rightValue: number | null;
  formatValue?: (value: number) => string;
  higherLabel?: string;
  context?: string;
}) => {
  const left = typeof leftValue === 'number' && Number.isFinite(leftValue) ? leftValue : null;
  const right = typeof rightValue === 'number' && Number.isFinite(rightValue) ? rightValue : null;
  const max = Math.max(left ?? 0, right ?? 0, 1);
  const leftPercent = (left ?? 0) / max * 100;
  const rightPercent = (right ?? 0) / max * 100;
  const outcome = left === null || right === null ? 'Incomplete data' : left === right ? 'Equal' : `${higherLabel}: ${left > right ? leftName : rightName}`;

  return (
    <section className={styles.comparisonMetric} aria-label={label}>
      <div className={styles.comparisonMetricHeader}><span>{label}</span><strong>{outcome}</strong></div>
      <div className={styles.comparisonMetricRow}>
        <span className={styles.comparisonMetricName} title={leftName}>{leftName}</span>
        <div className={styles.comparisonTrack} aria-hidden="true"><motion.span className={styles.comparisonFillA} initial={{ width: 0 }} animate={{ width: `${leftPercent}%` }} transition={{ duration: .65, ease: 'easeOut' }} /></div>
        <strong className={styles.comparisonMetricValue}>{left === null ? 'Unavailable' : formatValue(left)}</strong>
      </div>
      <div className={styles.comparisonMetricRow}>
        <span className={styles.comparisonMetricName} title={rightName}>{rightName}</span>
        <div className={styles.comparisonTrack} aria-hidden="true"><motion.span className={styles.comparisonFillB} initial={{ width: 0 }} animate={{ width: `${rightPercent}%` }} transition={{ duration: .65, ease: 'easeOut', delay: .08 }} /></div>
        <strong className={styles.comparisonMetricValue}>{right === null ? 'Unavailable' : formatValue(right)}</strong>
      </div>
      {context && <p className={styles.metricContext}>{context}</p>}
    </section>
  );
};

const parseFrequency = (value: string) => {
  const match = value.match(/^(\d+(?:\.\d+)?)\s+videos\/week/);
  return match ? Number(match[1]) : null;
};
const parseDuration = (value: string) => {
  return parseDurationToSeconds(value) || null;
};
const formatCadence = (value: number) => `${value.toFixed(1)} / week`;
const formatLength = formatSecondsToDuration;

const PRESETS = [
  { label: 'MKBHD vs Veritasium', c1: 'mkbhd', c2: 'veritasium', demo: true },
  { label: 'Veritasium vs Fireship', c1: 'veritasium', c2: 'fireship', demo: true },
  { label: 'MKBHD vs Fireship', c1: 'mkbhd', c2: 'fireship', demo: true },
  { label: 'MrBeast vs Mark Rober', c1: '@MrBeast', c2: '@MarkRober', demo: false },
];

function CompareContent() {
  const searchParams = useSearchParams();
  const initialC1 = searchParams.get('c1') || '';
  const initialC2 = searchParams.get('c2') || '';
  const initialDemo = searchParams.get('demo') === 'true';

  const [channel1Input, setChannel1Input] = useState(initialC1);
  const [channel2Input, setChannel2Input] = useState(initialC2);

  const [state, setState] = useState<ChannelComparisonState>({
    c1Data: null,
    c2Data: null,
    loading: false,
    error: null,
  });
  const requestId = useRef(0);

  const runComparison = async (c1: string, c2: string, demo?: boolean) => {
    if (!c1.trim() || !c2.trim()) return;
    const attempt = ++requestId.current;

    const sampleList = ['mkbhd', 'fireship', 'veritasium'];
    const isSample1 = sampleList.includes(c1.trim().toLowerCase().replace(/^@/, ''));
    const isSample2 = sampleList.includes(c2.trim().toLowerCase().replace(/^@/, ''));
    const useDemo1 = demo === true && isSample1;
    const useDemo2 = demo === true && isSample2;

    const cached1 = getClientCachedAnalysis(c1, useDemo1);
    const cached2 = getClientCachedAnalysis(c2, useDemo2);

    if (cached1 && cached2) {
      setState({
        c1Data: cached1,
        c2Data: cached2,
        loading: false,
        error: null,
      });
      return;
    }

    setState({ c1Data: null, c2Data: null, loading: true, error: null });

    try {
      const fetchC1 = cached1 ? Promise.resolve(cached1) : (async () => {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ channelId: c1.trim(), isDemo: useDemo1 }),
        });
        const d = await res.json();
        if (!res.ok || d.error) throw new Error(d.error || `Could not load data for ${c1}`);
        setClientCachedAnalysis(c1, useDemo1, d);
        return d as FullAnalysisResponse;
      })();

      const fetchC2 = cached2 ? Promise.resolve(cached2) : (async () => {
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ channelId: c2.trim(), isDemo: useDemo2 }),
        });
        const d = await res.json();
        if (!res.ok || d.error) throw new Error(d.error || `Could not load data for ${c2}`);
        setClientCachedAnalysis(c2, useDemo2, d);
        return d as FullAnalysisResponse;
      })();

      const [data1, data2] = await Promise.all([fetchC1, fetchC2]);
      if (attempt !== requestId.current) return;
      setState({
        c1Data: data1,
        c2Data: data2,
        loading: false,
        error: null,
      });
    } catch (err) {
      if (attempt !== requestId.current) return;
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : 'Comparison failed. Please retry.',
      }));
    }
  };

  useEffect(() => {
    if (initialC1.trim() && initialC2.trim()) {
      runComparison(initialC1, initialC2, initialDemo);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSwap = () => {
    const temp = channel1Input;
    setChannel1Input(channel2Input);
    setChannel2Input(temp);
    if (state.c1Data && state.c2Data) {
      setState((previous) => ({ ...previous, c1Data: previous.c2Data, c2Data: previous.c1Data }));
    } else if (channel2Input.trim() && temp.trim()) {
      void runComparison(channel2Input, temp);
    }
  };

  const c1 = state.c1Data;
  const c2 = state.c2Data;

  // Compute advantages
  const c1Avg = c1?.analytics.avgViews || 0;
  const c2Avg = c2?.analytics.avgViews || 0;
  const avgViewsWinner = c1Avg > c2Avg ? 'c1' : c2Avg > c1Avg ? 'c2' : 'tie';

  const c1Med = c1?.analytics.medianViews || 0;
  const c2Med = c2?.analytics.medianViews || 0;
  const medianViewsWinner = c1Med > c2Med ? 'c1' : c2Med > c1Med ? 'c2' : 'tie';
  const c1Cadence = parseFrequency(c1?.analytics.publishingFrequency || '');
  const c2Cadence = parseFrequency(c2?.analytics.publishingFrequency || '');
  const c1Length = parseDuration(c1?.analytics.avgVideoLength || '');
  const c2Length = parseDuration(c2?.analytics.avgVideoLength || '');

  return (
    <div className={styles.container}>
      <motion.nav className={styles.breadcrumb} aria-label="Breadcrumbs" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.35 }}>
        <Link href="/">Workspace</Link>
        <span>/</span>
        <span className={styles.breadcrumbCurrent}>Creator Benchmark</span>
      </motion.nav>

      <motion.section className={styles.hero} initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}>
        <motion.span className={styles.eyebrow} variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}>
          <Sparkles size={12} /> COMPETITIVE INTELLIGENCE
        </motion.span>
        <motion.h1 className={styles.title} variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}>
          Compare <span>creators</span>
        </motion.h1>
        <motion.p className={styles.subtitle} variants={{ hidden: { opacity: 0, y: 14 }, visible: { opacity: 1, y: 0 } }}>
          See how two creators differ in typical views, publishing rhythm, video length, and content focus.
        </motion.p>

        {/* Input Form */}
        <motion.form
          className={styles.compareForm}
          variants={{ hidden: { opacity: 0, y: 18, scale: 0.98 }, visible: { opacity: 1, y: 0, scale: 1 } }}
          onSubmit={(e) => {
            e.preventDefault();
            runComparison(channel1Input, channel2Input);
          }}
        >
           <label className={styles.channelInputWrapper}>
            <span className={styles.inputKicker}>Creator A</span>
            <input
              type="text"
              className={styles.inputField}
              placeholder="First creator (e.g. @mkbhd)"
              value={channel1Input}
              onChange={(e) => setChannel1Input(e.target.value)}
            />
           </label>

          <button type="button" className={styles.vsBadge} disabled={state.loading} onClick={handleSwap} title="Swap creators" aria-label="Swap creators">
            <ArrowRightLeft size={14} />
          </button>

           <label className={styles.channelInputWrapper}>
            <span className={styles.inputKicker}>Creator B</span>
            <input
              type="text"
              className={styles.inputField}
              placeholder="Second creator (e.g. @veritasium)"
              value={channel2Input}
              onChange={(e) => setChannel2Input(e.target.value)}
            />
           </label>

          <button type="submit" className={styles.compareButton} disabled={state.loading || !channel1Input.trim() || !channel2Input.trim()}>
            {state.loading ? <Loader2 size={16} className={styles.spinner} /> : <TrendingUp size={16} />}
            <span>Compare</span>
          </button>
        </motion.form>

        {/* Presets */}
        <motion.div className={styles.presetRow} variants={{ hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0 } }}>
            <span className={styles.presetLabel}>Quick starts</span>
          {PRESETS.map((p) => (
            <motion.button
              key={p.label}
              type="button"
              className={styles.presetBtn}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setChannel1Input(p.c1);
                setChannel2Input(p.c2);
                runComparison(p.c1, p.c2, p.demo);
              }}
            >
              {p.label}
            </motion.button>
          ))}
        </motion.div>
      </motion.section>

      {state.loading && (
        <motion.div className={styles.loadingArea} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <div className={styles.loadingGraphic} aria-hidden="true"><span /><span /><span /></div>
          <div><strong>Building the comparison</strong><p>Reading the available videos for both creators…</p></div>
        </motion.div>
      )}

      {state.error && (
        <motion.div className={styles.errorBox} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <AlertCircle size={20} />
          <div>{state.error}</div>
        </motion.div>
      )}

      {!state.loading && !c1 && !c2 && !state.error && (
        <motion.section className={styles.emptyState} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} aria-label="Comparison preview">
          <div className={styles.emptyGraphic} aria-hidden="true">
            <motion.div className={styles.emptyNode} animate={{ y: [0, -6, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}><span>A</span><small>Creator A</small></motion.div>
            <div className={styles.emptyConnector}><i /><span>VS</span><i /></div>
            <motion.div className={styles.emptyNode} animate={{ y: [0, 6, 0] }} transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}><span>B</span><small>Creator B</small></motion.div>
          </div>
          <div className={styles.emptyCopy}>
            <span className={styles.emptyKicker}>Comparison canvas</span>
            <h2>Find the useful difference.</h2>
            <p>Pick two creators above to reveal where their views, cadence, and content strategy diverge.</p>
          </div>
          <div className={styles.emptySignals}>
            <span><Eye size={14} /> Typical views</span>
            <span><TrendingUp size={14} /> Upload rhythm</span>
            <span><Video size={14} /> Content focus</span>
          </div>
        </motion.section>
      )}

      {!state.loading && c1 && c2 && (
          <motion.div initial="hidden" animate="visible" variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}>
            {/* Comparative Edge Verdict */}
           <motion.div className={styles.verdictBox} variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}>
            <div className={styles.verdictIcon}>
              <Award size={22} />
            </div>
            <div className={styles.verdictContent}>
               <h2>Quick comparison</h2>
              <p>
                <strong>{c1.channel.name}</strong> averages{' '}
                 <span className={styles.verdictAccent}>{c1.analytics.avgViewsFormatted}</span> views per upload
                compared to <strong>{c2.channel.name}</strong>&apos;s{' '}
                 <span className={styles.verdictAccent}>{c2.analytics.avgViewsFormatted}</span>. In terms of upload cadence, {c1.channel.name} posts{' '}
                <strong>{c1.analytics.publishingFrequency}</strong> while {c2.channel.name} posts{' '}
                <strong>{c2.analytics.publishingFrequency}</strong>.
               </p>
               <div className={styles.comparisonRail}>
                 <div className={styles.comparisonRailHeader}><span>Head-to-head signals</span><small>relative scale</small></div>
                  <ComparisonBar label="Average views (mean)" leftName={c1.channel.name} leftValue={c1.analytics.avgViewsFormatted === 'Unavailable' ? null : c1Avg} rightName={c2.channel.name} rightValue={c2.analytics.avgViewsFormatted === 'Unavailable' ? null : c2Avg} />
                  <ComparisonBar label="Typical views (median)" leftName={c1.channel.name} leftValue={c1.analytics.avgViewsFormatted === 'Unavailable' ? null : c1Med} rightName={c2.channel.name} rightValue={c2.analytics.avgViewsFormatted === 'Unavailable' ? null : c2Med} />
                  <ComparisonBar label="Typical views / day" leftName={c1.channel.name} leftValue={c1.analytics.medianViewsPerDay} rightName={c2.channel.name} rightValue={c2.analytics.medianViewsPerDay}
                    context={`Median of lifetime views ÷ days since publication. Not recent growth. A: ${c1.analytics.velocitySampleSize} usable dates (${c1.analytics.approximateVelocityCount} approximate); B: ${c2.analytics.velocitySampleSize} (${c2.analytics.approximateVelocityCount} approximate). Snapshot at retrieval; minimum age 1 day.`} />
                  <ComparisonBar label="Upload cadence / week" higherLabel="More frequent" leftName={c1.channel.name} leftValue={c1Cadence} rightName={c2.channel.name} rightValue={c2Cadence} formatValue={formatCadence} />
                  <ComparisonBar label="Average video length" higherLabel="Longer" leftName={c1.channel.name} leftValue={c1Length} rightName={c2.channel.name} rightValue={c2Length} formatValue={formatLength} />
               </div>
               <div className={styles.focusSummary}>
                 <div className={styles.focusHeader}><span>Content focus</span><small>largest observed theme</small></div>
                 <div className={styles.focusCards}>
                   {[{ data: c1, tone: 'focusA' }, { data: c2, tone: 'focusB' }].map(({ data: channel, tone }) => {
                      const theme = [...channel.aiAnalysis.contentThemes].sort((a, b) => b.percentage - a.percentage)[0];
                     const titlePattern = channel.aiAnalysis.titlePatterns.commonPatterns[0];
                     return <div key={channel.channel.channelId} className={`${styles.focusCard} ${tone === 'focusA' ? styles.focusA : styles.focusB}`}><strong>{channel.channel.name}</strong><span>{theme?.theme || 'Theme unavailable'}</span><small>{theme ? `${theme.percentage}% · ${theme.videoCount} videos` : titlePattern || 'More public data needed'}</small></div>;
                   })}
                 </div>
               </div>
                <HookComparison key={`${c1.channel.channelId}:${c1.meta.generatedAt}:${c2.channel.channelId}:${c2.meta.generatedAt}`} left={c1} right={c2} />
             </div>
           </motion.div>

            {/* Matrix Grid */}
           <div className={styles.matrixGrid}>
            {/* Channel 1 Card */}
            <motion.div className={`${styles.channelCard} ${avgViewsWinner === 'c1' ? styles.winnerHighlight : ''}`} variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }} whileHover={{ y: -4 }}>
              <div className={styles.channelCardHeader}>
                <div className={styles.avatar}>
                  {c1.channel.name.slice(0, 2).toUpperCase()}
                </div>
                <div className={styles.channelDetails}>
                  <h3>{c1.channel.name}</h3>
                  <span>{c1.channel.handle || c1.channel.channelId}</span>
                </div>
              </div>

              <div className={styles.metricRow}>
                <div className={styles.metricLabel}>
                   <Users size={14} /> Subscribers
                </div>
                <div className={styles.metricVal}>{c1.channel.subscribers || 'Unavailable'}</div>
              </div>

              <div className={styles.metricRow}>
                <div className={styles.metricLabel}>
                   <Eye size={14} /> Average views
                </div>
                <div className={styles.metricVal}>
                  {c1.analytics.avgViewsFormatted}
                  {avgViewsWinner === 'c1' && <span className={styles.edgeBadge}>+Higher</span>}
                </div>
              </div>

              <div className={styles.metricRow}>
                <div className={styles.metricLabel}>
                    <TrendingUp size={14} /> Typical views
                </div>
                <div className={styles.metricVal}>
                  {formatViews(c1.analytics.medianViews)}
                  {medianViewsWinner === 'c1' && <span className={styles.edgeBadge}>+Higher</span>}
                </div>
              </div>

              <div className={styles.metricRow}>
                <div className={styles.metricLabel}>
                   <Flame size={14} /> Upload pace
                </div>
                <div className={styles.metricVal}>{c1.analytics.publishingFrequency}</div>
              </div>

              <div className={styles.metricRow}>
                <div className={styles.metricLabel}>
                   <Clock size={14} /> Average length
                </div>
                <div className={styles.metricVal}>{c1.analytics.avgVideoLength}</div>
              </div>

              <div className={styles.metricRow}>
                <div className={styles.metricLabel}>
                   <Video size={14} /> Videos checked
                </div>
                <div className={styles.metricVal}>{c1.videos.length} videos</div>
              </div>

              <Link
                href={`/analyze/${encodeURIComponent(c1.channel.handle || c1.channel.channelId)}${c1.meta.dataSource === 'sample' ? '?demo=true' : ''}`}
                className={styles.viewFullLink}
              >
                 <span>Open full report</span>
                <ExternalLink size={12} />
              </Link>
            </motion.div>

            {/* Channel 2 Card */}
            <motion.div className={`${styles.channelCard} ${avgViewsWinner === 'c2' ? styles.winnerHighlight : ''}`} variants={{ hidden: { opacity: 0, y: 18 }, visible: { opacity: 1, y: 0 } }} whileHover={{ y: -4 }}>
              <div className={styles.channelCardHeader}>
                <div className={styles.avatar}>
                  {c2.channel.name.slice(0, 2).toUpperCase()}
                </div>
                <div className={styles.channelDetails}>
                  <h3>{c2.channel.name}</h3>
                  <span>{c2.channel.handle || c2.channel.channelId}</span>
                </div>
              </div>

              <div className={styles.metricRow}>
                <div className={styles.metricLabel}>
                  <Users size={14} /> Subscribers
                </div>
                <div className={styles.metricVal}>{c2.channel.subscribers || 'Unavailable'}</div>
              </div>

              <div className={styles.metricRow}>
                <div className={styles.metricLabel}>
                   <Eye size={14} /> Average views
                </div>
                <div className={styles.metricVal}>
                  {c2.analytics.avgViewsFormatted}
                  {avgViewsWinner === 'c2' && <span className={styles.edgeBadge}>+Higher</span>}
                </div>
              </div>

              <div className={styles.metricRow}>
                <div className={styles.metricLabel}>
                    <TrendingUp size={14} /> Typical views
                </div>
                <div className={styles.metricVal}>
                  {formatViews(c2.analytics.medianViews)}
                  {medianViewsWinner === 'c2' && <span className={styles.edgeBadge}>+Higher</span>}
                </div>
              </div>

              <div className={styles.metricRow}>
                <div className={styles.metricLabel}>
                   <Flame size={14} /> Upload pace
                </div>
                <div className={styles.metricVal}>{c2.analytics.publishingFrequency}</div>
              </div>

              <div className={styles.metricRow}>
                <div className={styles.metricLabel}>
                   <Clock size={14} /> Average length
                </div>
                <div className={styles.metricVal}>{c2.analytics.avgVideoLength}</div>
              </div>

              <div className={styles.metricRow}>
                <div className={styles.metricLabel}>
                   <Video size={14} /> Videos checked
                </div>
                <div className={styles.metricVal}>{c2.videos.length} videos</div>
              </div>

              <Link
                href={`/analyze/${encodeURIComponent(c2.channel.handle || c2.channel.channelId)}${c2.meta.dataSource === 'sample' ? '?demo=true' : ''}`}
                className={styles.viewFullLink}
              >
                 <span>Open full report</span>
                <ExternalLink size={12} />
              </Link>
            </motion.div>
          </div>
          </motion.div>
      )}
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div className={styles.pageLoading}>
          <Loader2 size={32} className={styles.spinner} />
        </div>
      }
    >
      <CompareContent />
    </Suspense>
  );
}
