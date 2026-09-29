import React, { useState } from 'react';
import { VideoData } from '@/types/analysis';
import { VideoCard } from './VideoCard';
import { Video } from 'lucide-react';
import styles from './TopVideos.module.css';

interface TopVideosProps {
  videos: VideoData[];
}

export const TopVideos = ({ videos }: TopVideosProps) => {
  const [sortKey, setSortKey] = useState<'views' | 'length' | 'date'>('views');

  const sortedVideos = [...videos].sort((a, b) => {
    if (sortKey === 'views') return b.views - a.views;
    if (sortKey === 'length') return b.lengthSeconds - a.lengthSeconds;
    return 0;
  });

  const maxViews = videos.length > 0 ? Math.max(...videos.map((v) => v.views)) : 1;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.iconBox}>
            <Video size={14} />
          </div>
          <h3 className={styles.title}>Catalog Upload Explorer ({videos.length} Analyzed)</h3>
        </div>

        <div className={styles.sortControls}>
          <span style={{ fontSize: 'var(--text-2xs)', color: 'var(--color-text-tertiary)', marginRight: '4px' }}>
            Sort:
          </span>
          <button
            type="button"
            className={`${styles.sortBtn} ${sortKey === 'views' ? styles.sortBtnActive : ''}`}
            onClick={() => setSortKey('views')}
          >
            Views
          </button>
          <button
            type="button"
            className={`${styles.sortBtn} ${sortKey === 'length' ? styles.sortBtnActive : ''}`}
            onClick={() => setSortKey('length')}
          >
            Duration
          </button>
        </div>
      </div>

      <div className={styles.grid}>
        {sortedVideos.map((video) => (
          <VideoCard key={video.videoId} video={video} maxViews={maxViews} />
        ))}
      </div>
    </div>
  );
};
