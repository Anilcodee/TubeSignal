import React from 'react';
import { VideoData } from '@/types/analysis';
import { VideoCard } from './VideoCard';
import { Trophy } from 'lucide-react';
import styles from './TopVideos.module.css';

interface TopVideosProps {
  videos: VideoData[];
}

export const TopVideos = ({ videos }: TopVideosProps) => {
  const sortedVideos = [...videos].sort((a, b) => b.views - a.views);
  const maxViews = sortedVideos.length > 0 ? sortedVideos[0].views : 1;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <Trophy size={20} color="#fbbf24" />
          <div>
            <h3 className={styles.title}>Top Performing Uploads</h3>
            <p className={styles.subtitle}>Ranked by total view count across analyzed catalog</p>
          </div>
        </div>
      </div>

      <div className={styles.grid}>
        {sortedVideos.slice(0, 8).map((video) => (
          <VideoCard key={video.videoId} video={video} maxViews={maxViews} />
        ))}
      </div>
    </div>
  );
};
