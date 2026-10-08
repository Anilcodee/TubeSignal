import { useEffect, useState } from 'react';
import { Users, Eye, CalendarDays, Clock3 } from 'lucide-react';
import type { ChannelData, ChannelAnalytics, VideoData } from '@/types/analysis';
import { formatViews, parseSubscribers } from '@/utils/format';
import { motion } from 'framer-motion';
import { kpiCardVariant } from '@/utils/animations';


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
  const [count, setCount] = useState(() => (targetNum && targetNum > 0 ? 0 : (targetNum || 0)));

  useEffect(() => {
    if (targetNum === undefined || targetNum <= 0) {
      return;
    }
    // Respect prefers-reduced-motion
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCount(targetNum);
      return;
    }

    let rafId: number;
    let startTimestamp: number | null = null;
    const duration = 600; // Calmer 600ms count-up once

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // easeOutQuart
      const ease = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(ease * targetNum));
      
      if (progress < 1) {
        rafId = window.requestAnimationFrame(step);
      } else {
        setCount(targetNum);
      }
    };
    rafId = window.requestAnimationFrame(step);

    return () => {
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [targetNum]);

  if (targetNum === undefined) return <>{value}</>;
  
  if (count === targetNum && typeof value === 'string') {
    return <>{value}</>;
  }
  
  return <>{formatFn ? formatFn(count) : count}</>;
}

export const KpiStrip = ({ channel, analytics, videos }: { channel: ChannelData; analytics: ChannelAnalytics; videos: VideoData[] }) => {
  const observedVideos = videos.filter((video) => video.viewsAvailable !== false && Number.isFinite(video.views) && video.views >= 0);
  const viewCount = observedVideos.length;
  const durationVideos = videos.filter((video) => video.lengthSeconds > 0);
  const durationCount = durationVideos.length;
  const frequencyAvailable = analytics.publishingFrequency !== 'Unavailable';
  const subCount = channel.subscriberCount ?? parseSubscribers(channel.subscribers);

  // Range context for views
  const sortedViews = [...observedVideos].map((v) => v.views).sort((a, b) => a - b);
  const minViews = sortedViews[0] || 0;
  const maxViews = sortedViews[sortedViews.length - 1] || 0;
  const viewsCaption = sortedViews.length > 1
    ? `Range: ${formatViews(minViews)} – ${formatViews(maxViews)}`
    : `Across ${viewCount} observed uploads`;

  // Duration context
  const durationCaption = durationCount
    ? `Typical: ${analytics.medianVideoLength || analytics.avgVideoLength}`
    : 'No durations available';

  // Pace context
  const rawPace = analytics.publishingFrequency || '';
  const isApproximatePace = rawPace.toLowerCase().includes('approximate');
  const paceNum = rawPace.split(' ')[0] || '';
  const paceDisplay = frequencyAvailable ? `${isApproximatePace ? '~' : ''}${paceNum} / week` : '—';
  const paceCaption = frequencyAvailable
    ? (isApproximatePace ? 'Estimated from dated sample' : 'Observed dated upload pace')
    : 'More publication dates needed';

  // Sparkline data
  const recentViews = [...videos].slice(0, 8).reverse().map((v) => (v.views && v.views >= 0 ? v.views : 0));
  const maxSpark = Math.max(...recentViews, 1);
  const minSpark = Math.min(...recentViews, 0);
  const viewsSpark = recentViews.length >= 2
    ? recentViews.map((val) => Math.round(((val - minSpark) / (maxSpark - minSpark || 1)) * 12 + 2))
    : [4, 6, 8, 12, 10, 14];

  const metrics = [
    {
      label: 'Subscribers',
      value: channel.subscribers || '—',
      targetNum: subCount,
      formatFn: formatViews,
      caption: 'Public channel audience',
      Icon: Users,
      sparkPoints: [4, 6, 7, 9, 11, 13, 15],
    },
    {
      label: 'Typical views',
      value: viewCount ? formatViews(analytics.medianViews) : '—',
      targetNum: viewCount ? analytics.medianViews : undefined,
      formatFn: formatViews,
      caption: viewsCaption,
      Icon: Eye,
      sparkPoints: viewsSpark,
    },
    {
      label: 'Average duration',
      value: durationCount ? analytics.avgVideoLength : '—',
      caption: durationCaption,
      Icon: Clock3,
      sparkPoints: [6, 9, 11, 8, 12, 10, 13],
    },
    {
      label: 'Upload pace',
      value: paceDisplay,
      caption: paceCaption,
      Icon: CalendarDays,
      sparkPoints: [5, 12, 7, 13, 9, 11, 14],
    },
  ];

  return (
    <div className={styles.kpiPanel} aria-label="Key metrics">
      {metrics.map(({ Icon, targetNum, formatFn, ...metric }, i) => (
        <motion.div
          key={metric.label}
          className={styles.kpiCard}
          custom={i}
          variants={kpiCardVariant}
          initial="hidden"
          animate="visible"
        >
          <div className={styles.kpiHeader}>
            <span>{metric.label}</span>
            <Icon size={15} className={styles.kpiIcon} aria-hidden="true" />
          </div>
          <div className={styles.valueRow}>
            <span className={styles.value}>
              <AnimatedValue value={metric.value} targetNum={targetNum} formatFn={formatFn} />
            </span>
          </div>
          <span className={styles.caption} title={metric.caption}>{metric.caption}</span>
        </motion.div>
      ))}
    </div>
  );
};
