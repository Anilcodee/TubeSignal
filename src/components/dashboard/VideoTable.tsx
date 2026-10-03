'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ExternalLink, Flame, Play, Zap } from 'lucide-react';
import type { VideoData } from '@/types/analysis';
import { formatViews } from '@/utils/format';
import { calculateVelocity, calculateMAD, type VideoVelocity } from '@/utils/math-analytics';
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
  const [sortMode, setSortMode] = useState<'views' | 'velocity'>('views');

  const hasViews = (video: VideoData) =>
    video.viewsAvailable !== false && Number.isFinite(video.views) && video.views >= 0;

  // Pre-calculate velocities
  const velocityMap = new Map<string, VideoVelocity>();
  videos.forEach((v) => {
    velocityMap.set(v.videoId, calculateVelocity(v));
  });

  // Calculate Hampel MAD for outlier detection
  const validViews = videos.filter(hasViews).map((v) => v.views);
  const madStats = calculateMAD(validViews);

  const ranked = [...videos].sort((a, b) => {
    if (sortMode === 'velocity') {
      const velA = velocityMap.get(a.videoId)?.viewsPerDay || 0;
      const velB = velocityMap.get(b.videoId)?.viewsPerDay || 0;
      return velB - velA;
    }
    return Number(hasViews(b)) - Number(hasViews(a)) || b.views - a.views;
  });

  const medianLabel = videos.some(hasViews) ? formatViews(medianViews) : 'Unavailable';

  return (
    <section className={styles.tablePanel} aria-labelledby="videos-title">
      <div className={styles.panelHeader}>
        <div>
          <h3 id="videos-title">The uploads behind the report</h3>
          <p>
            {sortMode === 'views' ? 'Ranked by cumulative views' : 'Ranked by pace (views/day velocity)'} · Median: {medianLabel} · {videos.length} uploads
          </p>
        </div>
        <div className={styles.headerControls}>
          <div className={styles.sortToggleGroup} role="group" aria-label="Sort videos by">
            <button
              type="button"
              className={`${styles.sortBtn} ${sortMode === 'views' ? styles.sortBtnActive : ''}`}
              onClick={() => setSortMode('views')}
            >
              Total Views
            </button>
            <button
              type="button"
              className={`${styles.sortBtn} ${sortMode === 'velocity' ? styles.sortBtnActive : ''}`}
              onClick={() => setSortMode('velocity')}
              title="Views accumulated per day since publish date"
            >
              <Zap size={11} /> Views / Day
            </button>
          </div>
          <span className={styles.sampleLabel}>{isSample ? 'Illustrative sample' : 'Public metadata'}</span>
        </div>
      </div>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <caption className="sr-only">
            Analyzed videos ranked by views or velocity, with percentage difference from the sample median
          </caption>
          <thead>
            <tr>
              <th scope="col" className={styles.rank}>#</th>
              <th scope="col">Video</th>
              <th scope="col" className={styles.numeric}>Views</th>
              <th scope="col" className={styles.numeric} title="Average views gained per day since publication">
                Velocity (Pace)
              </th>
              <th scope="col" className={styles.numeric}>vs median</th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((video, index) => {
              const difference =
                hasViews(video) && medianViews > 0
                  ? Math.round((video.views / medianViews - 1) * 100)
                  : null;
              const validLink = /^https:\/\/(www\.|m\.)?(youtube\.com|youtu\.be)\//i.test(video.url);
              const vel = velocityMap.get(video.videoId);
              const isOutlier =
                hasViews(video) &&
                madStats.outlierCutoff > 0 &&
                video.views >= madStats.outlierCutoff;

              return (
                <tr key={`${video.videoId}-${index}`}>
                  <td className={styles.rank}>{String(index + 1).padStart(2, '0')}</td>
                  <td>
                    <div className={styles.videoCell}>
                      <div
                        className={styles.thumb}
                        aria-hidden="true"
                        onClick={() => onWatchVideo?.(video.videoId, video.title)}
                        style={{ cursor: onWatchVideo ? 'pointer' : 'default' }}
                        title={onWatchVideo ? 'Click to watch in-app theater' : undefined}
                      >
                        <Play size={17} />
                        {!isSample && video.thumbnail && (
                          <Image
                            unoptimized
                            src={video.thumbnail}
                            alt=""
                            width={96}
                            height={54}
                            onError={(event) => {
                              event.currentTarget.style.display = 'none';
                            }}
                          />
                        )}
                      </div>
                      <div className={styles.videoInfo}>
                        <div>
                          {validLink && !isSample ? (
                            <a
                              href={video.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={styles.title}
                            >
                              {video.title}
                              <ExternalLink size={11} aria-hidden="true" />
                              <span className="sr-only"> (opens YouTube in a new tab)</span>
                            </a>
                          ) : (
                            <span className={styles.title}>{video.title}</span>
                          )}
                          {isOutlier && (
                            <span className={styles.breakoutBadge} title="Statistical breakout upload (exceeds 2x MAD threshold)">
                              <Flame size={10} /> Breakout
                            </span>
                          )}
                        </div>
                        <span className={styles.videoMeta}>
                          {video.lengthSeconds > 0 ? video.length : 'Duration unavailable'}
                          <span aria-hidden="true"> · </span>
                          {video.relativeDate || video.publishedDate || 'Date unavailable'}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className={`${styles.numeric} tabular-nums`}>
                    {hasViews(video) ? formatViews(video.views) : 'Unavailable'}
                  </td>
                  <td className={`${styles.numeric} tabular-nums`}>
                    {vel ? (
                      <span className={styles.velocityVal} title={`${formatViews(vel.viewsPerDay)} views/day over ${vel.daysSince} days`}>
                        <Zap size={11} /> {vel.formatted}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className={`${styles.numeric} tabular-nums`}>
                    <span
                      className={
                        difference !== null && difference > 0 ? styles.positive : styles.neutral
                      }
                    >
                      {difference === null ? '—' : `${difference > 0 ? '+' : ''}${difference}%`}
                    </span>
                  </td>
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
