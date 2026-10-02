'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, ArrowRightLeft, Award, Clock, ExternalLink, Eye, Flame, Loader2, Sparkles, TrendingUp, Users, Video } from 'lucide-react';
import type { FullAnalysisResponse } from '@/types/analysis';
import { formatViews } from '@/utils/format';
import { getClientCachedAnalysis, setClientCachedAnalysis } from '@/hooks/useAnalysis';
import styles from './page.module.css';

interface ChannelComparisonState {
  c1Data: FullAnalysisResponse | null;
  c2Data: FullAnalysisResponse | null;
  loading: boolean;
  error: string | null;
}

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

  const runComparison = async (c1: string, c2: string, demo?: boolean) => {
    if (!c1.trim() || !c2.trim()) return;

    const sampleList = ['mkbhd', 'fireship', 'veritasium'];
    const isSample1 = sampleList.includes(c1.trim().toLowerCase().replace(/^@/, ''));
    const isSample2 = sampleList.includes(c2.trim().toLowerCase().replace(/^@/, ''));
    const useDemo1 = demo !== undefined ? (demo && isSample1) : isSample1;
    const useDemo2 = demo !== undefined ? (demo && isSample2) : isSample2;

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

    setState((prev) => ({ ...prev, loading: true, error: null }));

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

      setState({
        c1Data: data1,
        c2Data: data2,
        loading: false,
        error: null,
      });
    } catch (err) {
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
    if (channel2Input.trim() && temp.trim()) {
      runComparison(channel2Input, temp, false);
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

  return (
    <div className={styles.container}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumbs">
        <Link href="/">Workspace</Link>
        <span>/</span>
        <span style={{ color: 'var(--text)' }}>Creator Benchmark</span>
      </nav>

      <section className={styles.hero}>
        <span className={styles.eyebrow}>
          <Sparkles size={12} /> COMPETITIVE INTELLIGENCE
        </span>
        <h1 className={styles.title}>
          Creator <span>Faceoff</span>
        </h1>
        <p className={styles.subtitle}>
          Compare metrics, upload pacing, and content performance across any two creators using real SerpApi data.
        </p>

        {/* Input Form */}
        <form
          className={styles.compareForm}
          onSubmit={(e) => {
            e.preventDefault();
            runComparison(channel1Input, channel2Input, false);
          }}
        >
          <div className={styles.channelInputWrapper}>
            <input
              type="text"
              className={styles.inputField}
              placeholder="First creator (e.g. @mkbhd)"
              value={channel1Input}
              onChange={(e) => setChannel1Input(e.target.value)}
            />
          </div>

          <button type="button" className={styles.vsBadge} onClick={handleSwap} title="Swap creators">
            <ArrowRightLeft size={14} />
          </button>

          <div className={styles.channelInputWrapper}>
            <input
              type="text"
              className={styles.inputField}
              placeholder="Second creator (e.g. @veritasium)"
              value={channel2Input}
              onChange={(e) => setChannel2Input(e.target.value)}
            />
          </div>

          <button type="submit" className={styles.compareButton} disabled={state.loading || !channel1Input.trim() || !channel2Input.trim()}>
            {state.loading ? <Loader2 size={16} className={styles.spinner} /> : <TrendingUp size={16} />}
            <span>Compare</span>
          </button>
        </form>

        {/* Presets */}
        <div className={styles.presetRow}>
          <span>Popular Benchmarks:</span>
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              className={styles.presetBtn}
              onClick={() => {
                setChannel1Input(p.c1);
                setChannel2Input(p.c2);
                runComparison(p.c1, p.c2, p.demo);
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </section>

      {state.loading && (
        <div className={styles.loadingArea}>
          <Loader2 size={32} className={styles.spinner} />
          <p>Extracting YouTube data for both channels via SerpApi...</p>
        </div>
      )}

      {state.error && (
        <div style={{
          maxWidth: 620,
          margin: '20px auto 32px',
          padding: '16px 20px',
          borderRadius: 'var(--r-panel)',
          background: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid rgba(239, 68, 68, 0.25)',
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          color: '#FCA5A5',
          fontSize: 13,
          lineHeight: 1.5,
          textAlign: 'left',
        }}>
          <AlertCircle size={20} style={{ flexShrink: 0, color: '#F87171' }} />
          <div>{state.error}</div>
        </div>
      )}

      {!state.loading && !c1 && !c2 && !state.error && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-2)' }}>
          <Sparkles size={28} style={{ color: 'var(--accent)', opacity: 0.8, marginBottom: 12, display: 'inline-block' }} />
          <h3 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', marginBottom: 8 }}>Ready for a Creator Faceoff</h3>
          <p style={{ fontSize: 14, maxWidth: 460, margin: '0 auto', color: 'var(--text-3)' }}>
            Enter any two creator handles above or select one of the popular benchmarks to compare performance side-by-side.
          </p>
        </div>
      )}

      {!state.loading && c1 && c2 && (
        <>
          {/* Comparative Edge Verdict */}
          <div className={styles.verdictBox}>
            <div className={styles.verdictIcon}>
              <Award size={22} />
            </div>
            <div className={styles.verdictContent}>
              <h4>Head-to-Head Signal Synthesis</h4>
              <p>
                <strong>{c1.channel.name}</strong> averages{' '}
                <span style={{ color: 'var(--accent)' }}>{c1.analytics.avgViewsFormatted}</span> views per upload
                compared to <strong>{c2.channel.name}</strong>&apos;s{' '}
                <span style={{ color: 'var(--accent)' }}>{c2.analytics.avgViewsFormatted}</span>. In terms of upload cadence, {c1.channel.name} posts{' '}
                <strong>{c1.analytics.publishingFrequency}</strong> while {c2.channel.name} posts{' '}
                <strong>{c2.analytics.publishingFrequency}</strong>.
              </p>
            </div>
          </div>

          {/* Matrix Grid */}
          <div className={styles.matrixGrid}>
            {/* Channel 1 Card */}
            <div className={`${styles.channelCard} ${avgViewsWinner === 'c1' ? styles.winnerHighlight : ''}`}>
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
                  <Eye size={14} /> Average Views
                </div>
                <div className={styles.metricVal}>
                  {c1.analytics.avgViewsFormatted}
                  {avgViewsWinner === 'c1' && <span className={styles.edgeBadge}>+Higher</span>}
                </div>
              </div>

              <div className={styles.metricRow}>
                <div className={styles.metricLabel}>
                  <TrendingUp size={14} /> Median Views
                </div>
                <div className={styles.metricVal}>
                  {formatViews(c1.analytics.medianViews)}
                  {medianViewsWinner === 'c1' && <span className={styles.edgeBadge}>+Higher</span>}
                </div>
              </div>

              <div className={styles.metricRow}>
                <div className={styles.metricLabel}>
                  <Flame size={14} /> Cadence
                </div>
                <div className={styles.metricVal}>{c1.analytics.publishingFrequency}</div>
              </div>

              <div className={styles.metricRow}>
                <div className={styles.metricLabel}>
                  <Clock size={14} /> Avg Duration
                </div>
                <div className={styles.metricVal}>{c1.analytics.avgVideoLength}</div>
              </div>

              <div className={styles.metricRow}>
                <div className={styles.metricLabel}>
                  <Video size={14} /> Sample Uploads
                </div>
                <div className={styles.metricVal}>{c1.videos.length} videos</div>
              </div>

              <Link
                href={`/analyze/${encodeURIComponent(c1.channel.handle || c1.channel.channelId)}${c1.meta.dataSource === 'sample' ? '?demo=true' : ''}`}
                className={styles.viewFullLink}
              >
                <span>View complete intelligence report</span>
                <ExternalLink size={12} />
              </Link>
            </div>

            {/* Channel 2 Card */}
            <div className={`${styles.channelCard} ${avgViewsWinner === 'c2' ? styles.winnerHighlight : ''}`}>
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
                  <Eye size={14} /> Average Views
                </div>
                <div className={styles.metricVal}>
                  {c2.analytics.avgViewsFormatted}
                  {avgViewsWinner === 'c2' && <span className={styles.edgeBadge}>+Higher</span>}
                </div>
              </div>

              <div className={styles.metricRow}>
                <div className={styles.metricLabel}>
                  <TrendingUp size={14} /> Median Views
                </div>
                <div className={styles.metricVal}>
                  {formatViews(c2.analytics.medianViews)}
                  {medianViewsWinner === 'c2' && <span className={styles.edgeBadge}>+Higher</span>}
                </div>
              </div>

              <div className={styles.metricRow}>
                <div className={styles.metricLabel}>
                  <Flame size={14} /> Cadence
                </div>
                <div className={styles.metricVal}>{c2.analytics.publishingFrequency}</div>
              </div>

              <div className={styles.metricRow}>
                <div className={styles.metricLabel}>
                  <Clock size={14} /> Avg Duration
                </div>
                <div className={styles.metricVal}>{c2.analytics.avgVideoLength}</div>
              </div>

              <div className={styles.metricRow}>
                <div className={styles.metricLabel}>
                  <Video size={14} /> Sample Uploads
                </div>
                <div className={styles.metricVal}>{c2.videos.length} videos</div>
              </div>

              <Link
                href={`/analyze/${encodeURIComponent(c2.channel.handle || c2.channel.channelId)}${c2.meta.dataSource === 'sample' ? '?demo=true' : ''}`}
                className={styles.viewFullLink}
              >
                <span>View complete intelligence report</span>
                <ExternalLink size={12} />
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div style={{ display: 'grid', placeItems: 'center', minHeight: '60vh', color: 'var(--text-2)' }}>
          <Loader2 size={32} className={styles.spinner} />
        </div>
      }
    >
      <CompareContent />
    </Suspense>
  );
}
