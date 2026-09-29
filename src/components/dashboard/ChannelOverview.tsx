import React from 'react';
import { ChannelData, ChannelAnalytics } from '@/types/analysis';
import { Badge } from '@/components/ui/Badge';
import { Users, Eye, Video, Calendar, Sparkles } from 'lucide-react';
import styles from './ChannelOverview.module.css';

interface ChannelOverviewProps {
  channel: ChannelData;
  analytics: ChannelAnalytics;
  isDemo?: boolean;
}

export const ChannelOverview = ({
  channel,
  analytics,
  isDemo = false,
}: ChannelOverviewProps) => {
  return (
    <div className={styles.overviewCard}>
      <div className={styles.profileRow}>
        <div className={styles.profileLeft}>
          <img
            src={channel.avatar}
            alt={channel.name}
            className={styles.avatar}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80';
            }}
          />
          <div className={styles.profileInfo}>
            <div className={styles.nameRow}>
              <h1 className={styles.channelName}>{channel.name}</h1>
              {isDemo && (
                <Badge variant="brand" icon={<Sparkles size={12} />}>
                  Demo Mode
                </Badge>
              )}
            </div>
            <span className={styles.handle}>{channel.handle}</span>
            <p className={styles.description}>{channel.description}</p>
          </div>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statPill}>
          <span className={styles.statLabel}>Subscribers</span>
          <span className={styles.statValue}>{channel.subscribers}</span>
          <span className={styles.statSub}>Audience Reach</span>
        </div>

        <div className={styles.statPill}>
          <span className={styles.statLabel}>Videos Analyzed</span>
          <span className={styles.statValue}>{channel.totalVideosAnalyzed}</span>
          <span className={styles.statSub}>Recent Catalog</span>
        </div>

        <div className={styles.statPill}>
          <span className={styles.statLabel}>Avg Views / Video</span>
          <span className={styles.statValue}>{analytics.avgViewsFormatted}</span>
          <span className={styles.statSub}>Per Upload</span>
        </div>

        <div className={styles.statPill}>
          <span className={styles.statLabel}>Upload Cadence</span>
          <span className={styles.statValue}>{analytics.publishingFrequency}</span>
          <span className={styles.statSub}>Weekly Pace</span>
        </div>
      </div>
    </div>
  );
};
