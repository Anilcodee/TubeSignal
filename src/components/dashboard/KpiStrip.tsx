import type { CSSProperties } from 'react';
import { useEffect, useState } from 'react';
import { Users, Eye, CalendarDays, Clock3 } from 'lucide-react';
import type { ChannelData, ChannelAnalytics, VideoData } from '@/types/analysis';
import { formatViews, parseSubscribers } from '@/utils/format';
import styles from './KpiStrip.module.css';

function AnimatedValue({ 
  value, 
  targetNum, 
  formatFn 
}: { 
  value: string | number, 
  targetNum?: number, 
  formatFn?: (val: number) => string 
}) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (targetNum === undefined || targetNum <= 0) {
      setCount(targetNum || 0);
      return;
    }
    let startTimestamp: number | null = null;
    const duration = 1200; // 1.2s

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutQuart
      const ease = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(ease * targetNum));
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(targetNum);
      }
    };
    window.requestAnimationFrame(step);
  }, [targetNum]);

  if (targetNum === undefined) return <>{value}</>;
  
  // Return to original string when done, in case of specific API string formats
  if (count === targetNum && typeof value === 'string') {
    return <>{value}</>;
  }
  
  return <>{formatFn ? formatFn(count) : count}</>;
}

export const KpiStrip = ({ channel, analytics, videos }: { channel: ChannelData; analytics: ChannelAnalytics; videos: VideoData[] }) => {
  const viewCount = videos.filter((video) => video.viewsAvailable !== false && Number.isFinite(video.views) && video.views >= 0).length;
  const durationCount = videos.filter((video) => video.lengthSeconds > 0).length;
  const frequencyAvailable = analytics.publishingFrequency !== 'Unavailable';
  
  const subCount = channel.subscriberCount ?? parseSubscribers(channel.subscribers);

  const metrics = [
    { label: 'Subscribers', value: channel.subscribers || '—', targetNum: subCount, formatFn: formatViews, caption: 'Channel-wide audience', Icon: Users, color: 'var(--accent)' },
    { label: 'Typical views', value: viewCount ? formatViews(analytics.medianViews) : '—', targetNum: viewCount ? analytics.medianViews : undefined, formatFn: formatViews, caption: `Median across ${viewCount} uploads`, Icon: Eye, color: 'var(--series-2)' },
    { label: 'Average duration', value: durationCount ? analytics.avgVideoLength : '—', caption: durationCount ? 'Minutes : seconds per upload' : 'No durations available', Icon: Clock3, color: 'var(--series-5)' },
    { label: 'Upload pace', value: frequencyAvailable ? analytics.publishingFrequency.split('(')[0].replace('videos/week', '/ week').trim() : '—', caption: frequencyAvailable ? 'Observed sample, not a schedule' : 'More publication dates needed', Icon: CalendarDays, color: 'var(--series-3)' },
  ];
  return (
    <div className={styles.kpiPanel} aria-label="Key metrics">
      {metrics.map(({ Icon, targetNum, formatFn, ...metric }, i) => (
        <div key={metric.label} className={styles.kpiCard} style={{ '--kpi-color': metric.color, animationDelay: `${i * .06}s` } as CSSProperties}>
          <div className={styles.kpiHeader}><span>{metric.label}</span><Icon size={16} aria-hidden="true" /></div>
          <span className={styles.value}>
            <AnimatedValue value={metric.value} targetNum={targetNum} formatFn={formatFn} />
          </span>
          <span className={styles.caption}>{metric.caption}</span>
        </div>
      ))}
    </div>
  );
};
