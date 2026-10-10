'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { FullAnalysisResponse, HookSummary } from '@/types/analysis';
import type { HookAnalysis } from '@/utils/transcript-analyzer';
import { summarizeHooks } from '@/utils/hook-summary';
import { loadTranscript } from '@/services/transcript-client';
import styles from './HookComparison.module.css';

interface Sample { summary: HookSummary | null; attempted: number; errors: number }

export function HookComparison({ left, right }: { left: FullAnalysisResponse; right: FullAnalysisResponse }) {
  const [state, setState] = useState<{ loading: boolean; samples: Sample[] }>({ loading: false, samples: [] });
  const controller = useRef<AbortController | null>(null);
  useEffect(() => () => controller.current?.abort(), []);

  const analyze = async () => {
    if (controller.current) return;
    const request = new AbortController();
    controller.current = request;
    setState({ loading: true, samples: [] });
    const sample = async (report: FullAnalysisResponse): Promise<Sample> => {
      const candidates = report.videos.filter((v) => v.viewsAvailable !== false && Number.isFinite(v.views) && v.views >= 0)
        .sort((a, b) => b.views - a.views).slice(0, 3);
      const analyses: HookAnalysis[] = [];
      // Sequential within a channel: at most two requests run concurrently for the pair.
      for (const video of candidates) {
        const result = await loadTranscript(video.videoId, report.meta.dataSource === 'sample', request.signal);
        if (result.success && result.analysis) analyses.push(result.analysis);
      }
      return { summary: summarizeHooks(analyses), attempted: candidates.length, errors: candidates.length - analyses.length };
    };
    try {
      const samples = await Promise.all([sample(left), sample(right)]);
      if (!request.signal.aborted) setState({ loading: false, samples });
    } finally { if (controller.current === request) controller.current = null; }
  };

  return (
    <section className={styles.panel} aria-labelledby="opening-style-title" aria-busy={state.loading}>
      <div className={styles.header}>
        <div><h3 id="opening-style-title">Opening style</h3><p>Sample up to three leading uploads per creator.</p></div>
        <button type="button" onClick={() => { void analyze().catch(() => { /* Unmounted or cancelled. */ }); }} disabled={state.loading}>
          {state.loading ? 'Reading openings…' : state.samples.length ? 'Retry opening analysis' : 'Analyze openings'}
        </button>
      </div>
      <p className={styles.note} role="status">{state.loading ? 'Reading captions for both creators…' : 'Transcript heuristics, not measured retention. Demo reports use illustrative speech.'}</p>
      {state.samples.length > 0 && <div className={styles.grid}>
        {[left, right].map((report, index) => {
          const result = state.samples[index];
          const summary = result.summary;
          return <article key={`${report.channel.channelId}:${index}`}>
            <h4>{report.channel.name}</h4>
            <small>{summary?.sampledVideoCount ?? 0} of {result.attempted} openings available · {report.meta.dataSource === 'sample' ? 'Illustrative sample' : 'Public captions'}</small>
            {summary ? <>
              <strong>{summary.dominantArchetype}</strong>
              <dl>
                <div><dt>Estimated pace</dt><dd>{summary.averageWordsPerMinute} WPM</dd></div>
                <div><dt>Sampled opening</dt><dd>{summary.averageHookDurationSeconds}s</dd></div>
                <div><dt>Use questions</dt><dd>{summary.questionRate}%</dd></div>
                <div><dt>Address the viewer</dt><dd>{summary.directAddressRate}%</dd></div>
              </dl>
            </> : <p>No usable captions returned. Try again or inspect another upload.</p>}
            {result.errors > 0 && summary && <p>{result.errors} unavailable; excluded from these figures.</p>}
            <Link href={`/analyze/${encodeURIComponent(report.channel.handle || report.channel.channelId)}?tab=transcripts${report.meta.dataSource === 'sample' ? '&demo=true' : ''}`}>Inspect source openings →</Link>
          </article>;
        })}
      </div>}
    </section>
  );
}
