import React from 'react';
import { ChannelData, ChannelAnalytics } from '@/types/analysis';
import { Users, Eye, Video, Calendar, CheckCircle, Radio } from 'lucide-react';
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
          <div className={styles.avatarWrapper}>
            <img
              src={channel.avatar}
              alt={channel.name}
              className={styles.avatar}
              onError={(e) => {
                (e.target as HTMLImageElement).src =
                  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80';
              }}
            />
          </div>
          <div className={styles.profileInfo}>
            <div className={styles.nameRow}>
              <h2 className={styles.channelName}>{channel.name}</h2>
              <span className={styles.verifiedBadge} title="Verified Authority">
                <CheckCircle size={14} />
              </span>
              <span className={styles.handle}>{channel.handle}</span>
            </div>
            <p className={styles.description}>{channel.description}</p>
          </div>
        </div>
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statPill}>
          <div className={styles.statHeader}>
            <span>Audience Reach</span>
            <Users size={12} />
          </div>
          <span className={`${styles.statValue} tabular-nums`}>{channel.subscribers}</span>
          <span className={styles.statSub}>Subscribed Base</span>
        </div>

        <div className={styles.statPill}>
          <div className={styles.statHeader}>
            <span>Sampled Catalog</span>
            <Video size={12} />
          </div>
          <span className={`${styles.statValue} tabular-nums`}>{channel.totalVideosAnalyzed}</span>
          <span className={styles.statSub}>Uploads Deep-Dived</span>
        </div>

        <div className={styles.statPill}>
          <div className={styles.statHeader}>
            <span>Avg Performance</span>
            <Eye size={12} />
          </div>
          <span className={`${styles.statValue} tabular-nums`}>{analytics.avgViewsFormatted}</span>
          <span className={styles.statSub}>Views / Video</span>
        </div>

        <div className={styles.statPill}>
          <div className={styles.statHeader}>
            <span>Upload Velocity</span>
            <Calendar size={12} />
          </div>
          <span className={`${styles.statValue} tabular-nums`}>{analytics.publishingFrequency}</span>
          <span className={styles.statSub}>Weekly Release Cadence</span>
        </div>
      </div>
    </div>
  );
};
