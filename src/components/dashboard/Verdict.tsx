import Image from 'next/image';
import { ArrowUpRight, Eye, Play, Sparkles } from 'lucide-react';
import type { FullAnalysisResponse } from '@/types/analysis';
import { formatViews } from '@/utils/format';
import styles from './Verdict.module.css';

export const Verdict = ({
  data,
  onWatchVideo,
}: {
  data: FullAnalysisResponse;
  onWatchVideo?: (videoId: string, title: string) => void;
}) => {
  const { videos, analytics, aiAnalysis, meta } = data;
  const observed = videos.filter((video) => video.viewsAvailable !== false && Number.isFinite(video.views) && video.views >= 0);
  const top = [...observed].sort((a, b) => b.views - a.views)[0];
  const ratio = top && analytics.medianViews > 0 ? top.views / analytics.medianViews : null;
  const share = top && analytics.totalViews > 0 ? Math.round(top.views / analytics.totalViews * 100) : null;
  const isSample = meta.dataSource === 'sample';
  const hasComparison = ratio !== null && observed.length > 1;
  const headline = hasComparison
    ? <>The top upload gets <em>{ratio.toFixed(1)}×</em> the typical views.</>
    : top ? <>Every channel has a story.<br /><em>Start with this upload.</em></> : <>Your channel,<br /><em>in perspective.</em></>;
  return (
    <section className={styles.verdict} aria-label="Your 60-second brief">
      <div className={styles.content}>
        <div className={styles.tag}><Sparkles size={14} /><span>YOUR 60-SECOND BRIEF</span></div>
        <h2 className={styles.headline}>{headline}</h2>
        <p className={styles.supporting}>{hasComparison ? `A typical upload in this report has ${formatViews(analytics.medianViews)} views. Compare the leading upload, then explore the patterns.` : 'A snapshot of the public uploads available. More videos and view counts make comparisons more useful.'}</p>
        <details className={styles.summary}>
          <summary>{meta.analysisSource === 'gemini' ? 'Read the AI interpretation' : 'Read the calculated summary'}</summary>
          <p>{aiAnalysis.summary}</p>
        </details>
        <div className={styles.meta}><span className={styles.metaDot} /> {videos.length} uploads in this report<span aria-hidden="true">/</span><span>Cumulative views, not growth</span></div>
      </div>
      {top && <div className={styles.spotlight}>
        <div className={styles.spotlightLabel}><span>THE STANDOUT UPLOAD</span><ArrowUpRight size={15} /></div>
        <div className={styles.videoArt} aria-hidden="true">
          <div className={styles.artGrid} /><Play size={25} className={styles.playIcon} fill="currentColor" />
          {!isSample && top.thumbnail && <Image unoptimized src={top.thumbnail} fill sizes="320px" alt="" onError={(event) => { event.currentTarget.style.display = 'none'; }} />}
          <span className={styles.duration}>{top.lengthSeconds > 0 ? top.length : 'Video'}</span>
        </div>
        <h3>{top.title}</h3>
        <div className={styles.spotlightStats}><span><Eye size={14} /> {formatViews(top.views)} views</span>{share !== null && <span>{share}% of total</span>}</div>
        <p className={styles.scope}>Highest views among these uploads · not age-adjusted</p>
        {onWatchVideo && (
          <button
            type="button"
            className={styles.watchBtn}
            onClick={() => onWatchVideo(top.videoId, top.title)}
          >
            <Play size={12} fill="currentColor" /> Watch & Dissect In-App
          </button>
        )}
      </div>}
    </section>
  );
};
