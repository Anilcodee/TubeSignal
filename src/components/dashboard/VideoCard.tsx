import React from 'react';
import { VideoData } from '@/types/analysis';
import { Eye } from 'lucide-react';
import styles from './VideoCard.module.css';

interface VideoCardProps {
  video: VideoData;
  maxViews?: number;
}

export const VideoCard = ({ video, maxViews = 1 }: VideoCardProps) => {
  const percentage = Math.min(100, Math.round((video.views / Math.max(1, maxViews)) * 100));

  return (
    <a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.card}
    >
      <div className={styles.thumbnailWrapper}>
        <img
          src={video.thumbnail}
          alt={video.title}
          className={styles.thumbnail}
          onError={(e) => {
            (e.target as HTMLImageElement).src =
              'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&auto=format&fit=crop&q=80';
          }}
        />
        <span className={styles.durationBadge}>{video.length}</span>
      </div>

      <div className={styles.content}>
        <h4 className={styles.title} title={video.title}>
          {video.title}
        </h4>

        <div className={styles.metaRow}>
          <span className={styles.views}>
            <Eye size={11} />
            <span>{video.viewsFormatted}</span>
          </span>
          <span>{video.relativeDate || video.publishedDate}</span>
        </div>

        <div className={styles.perfTrack} title={`Relative Index: ${percentage}%`}>
          <div className={styles.perfFill} style={{ width: `${percentage}%` }} />
        </div>
      </div>
    </a>
  );
};
