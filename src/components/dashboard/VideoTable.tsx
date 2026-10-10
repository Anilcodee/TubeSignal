'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ExternalLink, Flame, Play, Search, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { slideUp, fadeIn } from '@/utils/animations';
import type { VideoData } from '@/types/analysis';
import { formatViews } from '@/utils/format';
import { calculateVelocity, calculateMAD, type VideoVelocity } from '@/utils/math-analytics';
import { ConfidenceLabel } from '@/components/ui/ConfidenceLabel';
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
  const [filterMode, setFilterMode] = useState<'all' | 'above' | 'below'>('all');
  const [searchQuery, setSearchQuery] = useState('');

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

  const isOutlier = (video: VideoData) =>
    hasViews(video) && madStats.outlierCutoff > 0 && video.views >= madStats.outlierCutoff;

  const visibleVideos = videos.filter((video) => {
    const matchesSearch = !searchQuery.trim() || video.title.toLowerCase().includes(searchQuery.trim().toLowerCase());
    if (!matchesSearch) return false;
    if (filterMode === 'all' || !medianViews) return true;
    return filterMode === 'above' ? hasViews(video) && video.views >= medianViews : hasViews(video) && video.views < medianViews;
  });

  const ranked = [...visibleVideos].sort((a, b) => {
      if (sortMode === 'velocity') {
       const velA = velocityMap.get(a.videoId)?.viewsPerDay || 0;
       const velB = velocityMap.get(b.videoId)?.viewsPerDay || 0;
      return velB - velA;
    }
    if (filterMode === 'all' && searchQuery.trim()) return Number(hasViews(b)) - Number(hasViews(a)) || b.views - a.views;
    return Number(hasViews(b)) - Number(hasViews(a)) || b.views - a.views;
  });

  const medianLabel = videos.some(hasViews) ? formatViews(medianViews) : 'Unavailable';

  return (
    <section className={styles.tablePanel} aria-labelledby="videos-title">
      <div className={styles.panelHeader}>
        <div>
          <h3 id="videos-title">The uploads behind the report</h3>
          <p>
              {sortMode === 'views' ? 'Sorted by lifetime views; older videos may have had more time to grow.' : 'Sorted by age-adjusted views per day since publication.'} · Typical lifetime: {medianLabel} · {ranked.length} of {videos.length} shown
            </p>
          </div>
          <div className={styles.headerControls}>
            <label className={styles.tableSearch}>
              <Search size={13} />
              <span className="sr-only">Search videos</span>
              <input type="search" placeholder="Find a video" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} />
            </label>
            <div className={styles.filterToggleGroup} role="group" aria-label="Filter videos">
              <button type="button" className={`${styles.filterBtn} ${filterMode === 'all' ? styles.filterBtnActive : ''}`} onClick={() => setFilterMode('all')}>All</button>
              <button type="button" className={`${styles.filterBtn} ${filterMode === 'above' ? styles.filterBtnActive : ''}`} onClick={() => setFilterMode('above')}>Above typical</button>
              <button type="button" className={`${styles.filterBtn} ${filterMode === 'below' ? styles.filterBtnActive : ''}`} onClick={() => setFilterMode('below')}>Below</button>
            </div>
            <div className={styles.sortToggleGroup} role="group" aria-label="Sort videos by">
            <button
              type="button"
              className={`${styles.sortBtn} ${sortMode === 'views' ? styles.sortBtnActive : ''}`}
              onClick={() => setSortMode('views')}
              title="Ranked by cumulative lifetime views (older uploads accumulate more)"
            >
               Most views
            </button>
            <button
              type="button"
              className={`${styles.sortBtn} ${sortMode === 'velocity' ? styles.sortBtnActive : ''}`}
              onClick={() => setSortMode('velocity')}
              title="Ranked by daily view velocity since publish date (~views/day)"
            >
               <Zap size={11} /> Fastest pace
            </button>
          </div>
           <ConfidenceLabel sampleSize={validViews.length} detail={`${validViews.length} with view data`} />
           <span className={styles.sampleLabel}>{isSample ? 'Illustrative sample' : 'Public metadata'}</span>
        </div>
      </div>

       <div className={styles.tableWrapper}>
         <div className={styles.desktopTable}>
         <table className={styles.table}>
          <caption className="sr-only">
         Videos ranked by views or estimated views per day, with publication timing and difference from the typical video
          </caption>
          <thead>
            <tr>
              <th scope="col" className={styles.rank}>#</th>
              <th scope="col">Video</th>
               <th scope="col" className={styles.numeric} title="Time since publication">Published</th>
              <th scope="col" className={styles.numeric}>Views</th>
               <th scope="col" className={styles.numeric} title="Estimated views gained per day since publication">
                 Views / day
              </th>
               <th scope="col" className={styles.numeric} title="Difference from the typical video">vs typical</th>
            </tr>
          </thead>
          <motion.tbody
  initial="hidden"
  animate="visible"
  variants={fadeIn}
>
            {ranked.map((video, index) => {
              const difference =
                hasViews(video) && medianViews > 0
                  ? Math.round((video.views / medianViews - 1) * 100)
                  : null;
              const validLink = /^https:\/\/(www\.|m\.)?(youtube\.com|youtu\.be)\//i.test(video.url);
              const vel = velocityMap.get(video.videoId);
              const isStandout = isOutlier(video);

              return (
                <motion.tr
  key={`${video.videoId}-${index}`}
  variants={slideUp}
>
                  <td className={styles.rank}>{String(index + 1).padStart(2, '0')}</td>
                  <td>
                    <div className={styles.videoCell}>
                      <button
                        type="button"
                         className={`${styles.thumb} ${onWatchVideo ? styles.thumbInteractive : ''}`}
                        onClick={() => onWatchVideo?.(video.videoId, video.title)}
                        title={onWatchVideo ? 'Click to watch in-app theater' : undefined}
                        aria-label={`Watch ${video.title} in theater`}
                      >
                        <Play size={17} className={styles.playIcon} />
                        {video.thumbnail && (
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
                      </button>
                      <div className={styles.videoInfo}>
                        <div>
                          {validLink ? (
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
                           {isStandout && (
                             <span className={styles.breakoutBadge} title="This video is far above the typical result in this sample">
                               <Flame size={10} /> Standout
                            </span>
                          )}
                        </div>
                        <span className={styles.videoMeta}>
                           {video.lengthSeconds > 0 ? video.length : 'Length unavailable'}
                          <span aria-hidden="true"> · </span>
                          {video.relativeDate || video.publishedDate || 'Date unavailable'}
                        </span>
                      </div>
                    </div>
                  </td>
                   <td className={`${styles.numeric} ${styles.publishedCell} tabular-nums`}>
                     {vel?.available && vel.daysSince !== null ? (
                      <span title={`Published ${vel.daysSince} days ago${vel.isApproximate ? ' (approximate date)' : ''}`}>
                        {vel.isApproximate ? '~' : ''}{vel.daysSince < 30 ? `${vel.daysSince}d` : vel.daysSince < 365 ? `${Math.round(vel.daysSince / 30)}mo` : `${(vel.daysSince / 365).toFixed(1)}y`}
                      </span>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className={`${styles.numeric} tabular-nums`}>
                    {hasViews(video) ? formatViews(video.views) : 'Unavailable'}
                  </td>
                  <td className={`${styles.numeric} tabular-nums`}>
                     {vel?.available && vel.viewsPerDay !== null ? (
                       <span className={styles.velocityVal} title={`${vel.isApproximate ? 'Estimated: ~' : ''}${formatViews(vel.viewsPerDay)} views per day over ${vel.daysSince} days`}>
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
                </motion.tr>
              );
            })}
          </motion.tbody>
         </table>
         </div>
         <div className={styles.mobileVideoList} aria-label="Video evidence cards">
           {ranked.map((video, index) => {
             const difference = hasViews(video) && medianViews > 0 ? Math.round((video.views / medianViews - 1) * 100) : null;
             const validLink = /^https:\/\/(www\.|m\.)?(youtube\.com|youtu\.be)\//i.test(video.url);
             const vel = velocityMap.get(video.videoId);
             const isStandout = isOutlier(video);
             return (
               <article key={`${video.videoId}-mobile-${index}`} className={styles.mobileVideoCard}>
                 <div className={styles.mobileCardTop}>
                   <button type="button" className={styles.mobileThumb} onClick={() => onWatchVideo?.(video.videoId, video.title)} aria-label={`Watch ${video.title}`}>
                     <Play size={17} className={styles.playIcon} />
                     {video.thumbnail && <Image unoptimized src={video.thumbnail} alt="" fill sizes="88px" onError={(event) => { event.currentTarget.style.display = 'none'; }} />}
                   </button>
                   <div className={styles.mobileTitleBlock}>
                     {validLink ? <a href={video.url} target="_blank" rel="noopener noreferrer" className={styles.title}>{video.title}<ExternalLink size={11} aria-hidden="true" /></a> : <span className={styles.title}>{video.title}</span>}
                     {isStandout && <span className={styles.breakoutBadge}><Flame size={10} /> Standout</span>}
                     <span className={styles.videoMeta}>{video.lengthSeconds > 0 ? video.length : 'Length unavailable'} · {video.relativeDate || video.publishedDate || 'Date unavailable'}</span>
                   </div>
                 </div>
                 <div className={styles.mobileMetricGrid}>
                   <span><small>Views</small><strong>{hasViews(video) ? formatViews(video.views) : '—'}</strong></span>
                    <span><small>Views / day</small><strong className={styles.velocityVal}>{vel?.available ? <><Zap size={11} /> {vel.formatted}</> : '—'}</strong></span>
                   <span><small>vs typical</small><strong className={difference !== null && difference > 0 ? styles.positive : styles.neutral}>{difference === null ? '—' : `${difference > 0 ? '+' : ''}${difference}%`}</strong></span>
                 </div>
               </article>
             );
           })}
         </div>
         {!ranked.length && <p className={styles.empty}>No videos are available yet.</p>}
      </div>
    </section>
  );
};
