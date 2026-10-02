import Image from 'next/image';
import { ExternalLink, Play } from 'lucide-react';
import type { VideoData } from '@/types/analysis';
import { formatViews } from '@/utils/format';
import styles from './VideoTable.module.css';

export const VideoTable = ({
  videos,
  medianViews,
  isSample = false,
  onWatchVideo,
}: {
  videos: VideoData[];
  medianViews: number;
  isSample?: boolean;
  onWatchVideo?: (videoId: string, title: string) => void;
}) => {
  const hasViews = (video: VideoData) => video.viewsAvailable !== false && Number.isFinite(video.views) && video.views >= 0;
  const ranked = [...videos].sort((a, b) => Number(hasViews(b)) - Number(hasViews(a)) || b.views - a.views);
  const medianLabel = videos.some(hasViews) ? formatViews(medianViews) : 'Unavailable';
  return (
    <section className={styles.tablePanel} aria-labelledby="videos-title">
      <div className={styles.panelHeader}><div><h3 id="videos-title">The uploads behind the report</h3><p>Ranked by cumulative views · Median: {medianLabel} · {videos.length} uploads</p></div><span className={styles.sampleLabel}>{isSample ? 'Illustrative sample' : 'Public metadata'}</span></div>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <caption className="sr-only">Analyzed videos ranked by views, with percentage difference from the sample median</caption>
          <thead><tr><th scope="col" className={styles.rank}>#</th><th scope="col">Video</th><th scope="col" className={styles.numeric}>Views</th><th scope="col" className={styles.numeric}>vs median</th></tr></thead>
          <tbody>
            {ranked.map((video, index) => {
              const difference = hasViews(video) && medianViews > 0 ? Math.round((video.views / medianViews - 1) * 100) : null;
              const validLink = /^https:\/\/(www\.|m\.)?(youtube\.com|youtu\.be)\//i.test(video.url);
              return (
                <tr key={`${video.videoId}-${index}`}>
                  <td className={styles.rank}>{String(index + 1).padStart(2, '0')}</td>
                  <td><div className={styles.videoCell}>
                    <div
                      className={styles.thumb}
                      aria-hidden="true"
                      onClick={() => onWatchVideo?.(video.videoId, video.title)}
                      style={{ cursor: onWatchVideo ? 'pointer' : 'default' }}
                      title={onWatchVideo ? 'Click to watch in-app theater' : undefined}
                    >
                      <Play size={17} />
                      {!isSample && video.thumbnail && <Image unoptimized src={video.thumbnail} alt="" width={96} height={54} onError={(event) => { event.currentTarget.style.display = 'none'; }} />}
                    </div>
                    <div className={styles.videoInfo}>{validLink && !isSample ? <a href={video.url} target="_blank" rel="noopener noreferrer" className={styles.title}>{video.title}<ExternalLink size={11} aria-hidden="true" /><span className="sr-only"> (opens YouTube in a new tab)</span></a> : <span className={styles.title}>{video.title}</span>}<span className={styles.videoMeta}>{video.lengthSeconds > 0 ? video.length : 'Duration unavailable'}<span aria-hidden="true"> · </span>{video.relativeDate || video.publishedDate || 'Date unavailable'}</span></div>
                  </div></td>
                  <td className={`${styles.numeric} tabular-nums`}>{hasViews(video) ? formatViews(video.views) : 'Unavailable'}</td>
                  <td className={`${styles.numeric} tabular-nums`}><span className={difference !== null && difference > 0 ? styles.positive : styles.neutral}>{difference === null ? '—' : `${difference > 0 ? '+' : ''}${difference}%`}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {!ranked.length && <p className={styles.empty}>No videos are available yet.</p>}
      </div>
    </section>
  );
};
