import { useEffect, useState } from 'react';
import { Users, Eye, CalendarDays, Clock3 } from 'lucide-react';
import type { ChannelData, ChannelAnalytics, VideoData } from '@/types/analysis';
import { formatViews, parseSubscribers } from '@/utils/format';
import { motion } from 'framer-motion';
import { kpiCardVariant } from '@/utils/animations';
import { Sparkline } from './Sparkline';


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

  // Per-upload distributions, not historical growth. Never invent unavailable history.
  const viewsSpark = observedVideos.slice(0, 8).map((video) => video.views);
  const durationSpark = durationVideos.slice(0, 8).map((video) => video.lengthSeconds);

  const metrics = [
    {
      label: 'Subscribers',
      value: channel.subscribers || '—',
      targetNum: subCount,
      formatFn: formatViews,
      caption: 'Public channel audience',
      Icon: Users,
      sparkPoints: [],
      sparkLabel: '',
    },
    {
       label: 'Typical views',
      value: viewCount ? formatViews(analytics.medianViews) : '—',
      targetNum: viewCount ? analytics.medianViews : undefined,
      formatFn: formatViews,
      caption: viewsCaption,
      Icon: Eye,
      sparkPoints: viewsSpark,
      sparkLabel: 'Lifetime views per sampled upload in report order; not a growth trend',
    },
    {
       label: 'Average video length',
      value: durationCount ? analytics.avgVideoLength : '—',
      caption: durationCaption,
      Icon: Clock3,
      sparkPoints: durationSpark,
      sparkLabel: 'Duration per sampled upload in report order',
    },
    {
       label: 'Uploads per week',
      value: paceDisplay,
      caption: paceCaption,
      Icon: CalendarDays,
      sparkPoints: [],
      sparkLabel: '',
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
            {metric.sparkPoints.length >= 2 && (
              <span role="img" aria-label={metric.sparkLabel} title={metric.sparkLabel}>
                <Sparkline data={metric.sparkPoints} width={64} height={24} color="var(--accent)" />
              </span>
            )}
          </div>
          <span className={styles.caption} title={metric.caption}>{metric.caption}</span>
        </motion.div>
      ))}
    </div>
  );
};
