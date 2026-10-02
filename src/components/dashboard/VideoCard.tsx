import Image from 'next/image';
import { VideoData } from '@/types/analysis';
import { Eye, ExternalLink } from 'lucide-react';
import styles from './VideoCard.module.css';

interface VideoCardProps {
  video: VideoData;
  maxViews?: number;
  avgViews?: number;
  rank?: number;
}

export const VideoCard = ({ video, maxViews = 1, avgViews, rank }: VideoCardProps) => {
  const percentage = Math.min(100, Math.round((video.views / Math.max(1, maxViews)) * 100));

  // Calculate Outlier Multiplier (e.g. 2.4x channel average)
  const multiplier = avgViews && avgViews > 0 ? (video.views / avgViews).toFixed(1) : null;
  const isHighOutlier = multiplier && parseFloat(multiplier) >= 1.5;
  const isUnderperforming = multiplier && parseFloat(multiplier) < 0.7;

  return (
    <a
      href={video.url}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.card}
    >
      <div className={styles.thumbnailWrapper}>
        {video.thumbnail && <Image
          src={video.thumbnail}
          alt={video.title}
          className={styles.thumbnail}
          width={600}
          height={338}
          unoptimized
          onError={(event) => { event.currentTarget.style.display = 'none'; }}
        />}
        {typeof rank === 'number' && (
          <span className={styles.rankBadge}>#{rank}</span>
        )}
        <span className={styles.durationBadge}>{video.length}</span>
      </div>

      <div className={styles.content}>
        <div className={styles.titleRow}>
          <h4 className={styles.title} title={video.title}>
            {video.title}
          </h4>
          <ExternalLink size={12} className={styles.extIcon} />
        </div>

        <div className={styles.metaRow}>
          <span className={styles.views}>
            <Eye size={12} />
            <span>{video.viewsFormatted}</span>
          </span>

          {multiplier && (
            <span
              className={`${styles.multiplierBadge} ${
                isHighOutlier
                  ? styles.multiplierHigh
                  : isUnderperforming
                  ? styles.multiplierLow
                  : styles.multiplierNormal
              }`}
            >
              {multiplier}x avg
            </span>
          )}

          <span className={styles.date}>{video.relativeDate || video.publishedDate}</span>
        </div>

        <div className={styles.perfTrack} title={`Relative: ${percentage}%`}>
          <div className={styles.perfFill} style={{ width: `${Math.max(5, percentage)}%` }} />
        </div>
      </div>
    </a>
  );
};
