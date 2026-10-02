import React, { useState, useMemo } from 'react';
import { VideoData } from '@/types/analysis';
import { VideoCard } from './VideoCard';
import { Video, Search } from 'lucide-react';
import styles from './TopVideos.module.css';

interface TopVideosProps {
  videos: VideoData[];
}

export const TopVideos = ({ videos }: TopVideosProps) => {
  const [sortKey, setSortKey] = useState<'views' | 'outlier' | 'length'>('views');
  const [searchQuery, setSearchQuery] = useState('');
  const [durationFilter, setDurationFilter] = useState<'all' | 'shorts' | 'standard' | 'long'>('all');

  const avgViews = useMemo(() => {
    if (!videos.length) return 0;
    const total = videos.reduce((acc, v) => acc + v.views, 0);
    return Math.round(total / videos.length);
  }, [videos]);

  const maxViews = useMemo(() => {
    return videos.length > 0 ? Math.max(...videos.map((v) => v.views)) : 1;
  }, [videos]);

  const filteredVideos = useMemo(() => {
    return videos.filter((v) => {
      // Search query filter
      if (searchQuery.trim()) {
        const matches = v.title.toLowerCase().includes(searchQuery.toLowerCase());
        if (!matches) return false;
      }

      // Duration filter
      if (durationFilter === 'shorts') return v.lengthSeconds <= 60;
      if (durationFilter === 'standard') return v.lengthSeconds > 60 && v.lengthSeconds <= 1200;
      if (durationFilter === 'long') return v.lengthSeconds > 1200;

      return true;
    });
  }, [videos, searchQuery, durationFilter]);

  const sortedVideos = useMemo(() => {
    return [...filteredVideos].sort((a, b) => {
      if (sortKey === 'views') return b.views - a.views;
      if (sortKey === 'outlier') {
        const outA = avgViews > 0 ? a.views / avgViews : 0;
        const outB = avgViews > 0 ? b.views / avgViews : 0;
        return outB - outA;
      }
      if (sortKey === 'length') return b.lengthSeconds - a.lengthSeconds;
      return 0;
    });
  }, [filteredVideos, sortKey, avgViews]);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.iconBox}>
            <Video size={14} />
          </div>
          <h3 className={styles.title}>Catalog Upload Explorer ({filteredVideos.length} of {videos.length})</h3>
        </div>

        {/* Filter Controls */}
        <div className={styles.controlsRow}>
          {/* Quick Search */}
          <div className={styles.searchBox}>
            <Search size={12} className={styles.searchIcon} />
            <input
              type="text"
              placeholder="Filter title keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={styles.searchInput}
            />
          </div>

          {/* Duration Filters */}
          <div className={styles.filterGroup}>
            <button
              type="button"
              className={`${styles.filterBtn} ${durationFilter === 'all' ? styles.filterBtnActive : ''}`}
              onClick={() => setDurationFilter('all')}
            >
              All
            </button>
            <button
              type="button"
              className={`${styles.filterBtn} ${durationFilter === 'standard' ? styles.filterBtnActive : ''}`}
              onClick={() => setDurationFilter('standard')}
            >
              5-20m
            </button>
            <button
              type="button"
              className={`${styles.filterBtn} ${durationFilter === 'long' ? styles.filterBtnActive : ''}`}
              onClick={() => setDurationFilter('long')}
            >
              20m+
            </button>
            <button
              type="button"
              className={`${styles.filterBtn} ${durationFilter === 'shorts' ? styles.filterBtnActive : ''}`}
              onClick={() => setDurationFilter('shorts')}
            >
              Shorts
            </button>
          </div>

          {/* Sort Controls */}
          <div className={styles.sortControls}>
            <button
              type="button"
              className={`${styles.sortBtn} ${sortKey === 'views' ? styles.sortBtnActive : ''}`}
              onClick={() => setSortKey('views')}
            >
              Views
            </button>
            <button
              type="button"
              className={`${styles.sortBtn} ${sortKey === 'outlier' ? styles.sortBtnActive : ''}`}
              onClick={() => setSortKey('outlier')}
              title="Sort by performance multiplier above average"
            >
              Outliers
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
      </div>

      {sortedVideos.length === 0 ? (
        <div className={styles.emptyState}>
          <span>No uploads match the selected filters.</span>
        </div>
      ) : (
        <div className={styles.grid}>
          {sortedVideos.map((video, idx) => (
            <VideoCard
              key={video.videoId}
              video={video}
              maxViews={maxViews}
              avgViews={avgViews}
              rank={sortKey === 'views' || sortKey === 'outlier' ? idx + 1 : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
};
