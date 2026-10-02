import type { CSSProperties } from 'react';
import { Users, Eye, CalendarDays, Clock3 } from 'lucide-react';
import type { ChannelData, ChannelAnalytics, VideoData } from '@/types/analysis';
import { formatViews } from '@/utils/format';
import styles from './KpiStrip.module.css';

export const KpiStrip = ({ channel, analytics, videos }: { channel: ChannelData; analytics: ChannelAnalytics; videos: VideoData[] }) => {
  const viewCount = videos.filter((video) => video.viewsAvailable !== false && Number.isFinite(video.views) && video.views >= 0).length;
  const durationCount = videos.filter((video) => video.lengthSeconds > 0).length;
  const frequencyAvailable = analytics.publishingFrequency !== 'Unavailable';
  const metrics = [
    { label: 'Subscribers', value: channel.subscribers || '—', caption: 'Channel-wide audience', Icon: Users, color: 'var(--accent)' },
    { label: 'Typical views', value: viewCount ? formatViews(analytics.medianViews) : '—', caption: `Median across ${viewCount} uploads`, Icon: Eye, color: 'var(--series-2)' },
    { label: 'Average duration', value: durationCount ? analytics.avgVideoLength : '—', caption: durationCount ? 'Minutes : seconds per upload' : 'No durations available', Icon: Clock3, color: 'var(--series-5)' },
    { label: 'Upload pace', value: frequencyAvailable ? analytics.publishingFrequency.split('(')[0].replace('videos/week', '/ week').trim() : '—', caption: frequencyAvailable ? 'Observed sample, not a schedule' : 'More publication dates needed', Icon: CalendarDays, color: 'var(--series-3)' },
  ];
  return (
    <div className={styles.kpiPanel} aria-label="Key metrics">
      {metrics.map(({ Icon, ...metric }, i) => (
        <div key={metric.label} className={styles.kpiCard} style={{ '--kpi-color': metric.color, animationDelay: `${i * .06}s` } as CSSProperties}>
          <div className={styles.kpiHeader}><span>{metric.label}</span><Icon size={16} aria-hidden="true" /></div>
          <span className={styles.value}>{metric.value}</span>
          <span className={styles.caption}>{metric.caption}</span>
        </div>
      ))}
    </div>
  );
};
