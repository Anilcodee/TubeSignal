'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { fadeIn } from '@/utils/animations';
import { ArrowUpRight, Eye, Pause, Play, Sparkles, X, Zap } from 'lucide-react';
import type { FullAnalysisResponse } from '@/types/analysis';
import { formatViews } from '@/utils/format';
import styles from './Verdict.module.css';

export const Verdict = ({
  data,
  onPlayStart,
}: {
  data: FullAnalysisResponse;
  onWatchVideo?: (videoId: string, title: string) => void;
  onPlayStart?: () => void;
}) => {
  const { videos, analytics, aiAnalysis, meta } = data;
  const [isPlayingInline, setIsPlayingInline] = useState(false);
  const [seekSecond, setSeekSecond] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const observed = videos.filter((video) => video.viewsAvailable !== false && Number.isFinite(video.views) && video.views >= 0);
  const top = [...observed].sort((a, b) => b.views - a.views)[0];
  const ratio = top && analytics.medianViews > 0 ? top.views / analytics.medianViews : null;
  const share = top && analytics.totalViews > 0 ? Math.round(top.views / analytics.totalViews * 100) : null;
  const isSample = meta.dataSource === 'sample';
  const hasComparison = ratio !== null && observed.length > 1;
  const headline = hasComparison
    ? <>The top upload gets <em>{ratio.toFixed(1)}×</em> typical views <span className={styles.ageCaveat}>(not age-adjusted)</span></>
    : top ? <>Every channel has a story.<br /><em>Start with this upload.</em></> : <>Your channel,<br /><em>in perspective.</em></>;

  const rawSummary = (aiAnalysis.summary || '').trim();
  const summarySentences = rawSummary
    ? rawSummary
        .replace(/([.!?])\s+(?=[A-Z0-9])/g, '$1|__SENTENCE_SEP__|')
        .split('|__SENTENCE_SEP__|')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];
  const inlineSummary = summarySentences.slice(0, 2).join(' ').trim();
  const remainingSummary = summarySentences.slice(2).join(' ').trim();

  const handleStartInlinePlay = () => {
    setIsPlayingInline(true);
    setIsPlaying(true);
    onPlayStart?.();
  };

  const handleHidePlayer = () => {
    try {
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: 'command', func: 'pauseVideo', args: '' }),
        '*'
      );
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: 'command', func: 'stopVideo', args: '' }),
        '*'
      );
    } catch {}
    setIsPlayingInline(false);
  };

  const handleJump = (sec: number) => {
    setSeekSecond(sec);
    setIsPlaying(true);
    try {
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: 'command', func: 'seekTo', args: [sec, true] }),
        '*'
      );
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: 'command', func: 'playVideo', args: '' }),
        '*'
      );
    } catch {}
  };

  const togglePlayPause = () => {
    try {
      if (isPlaying) {
        iframeRef.current?.contentWindow?.postMessage(
          JSON.stringify({ event: 'command', func: 'pauseVideo', args: '' }),
          '*'
        );
        setIsPlaying(false);
      } else {
        iframeRef.current?.contentWindow?.postMessage(
          JSON.stringify({ event: 'command', func: 'playVideo', args: '' }),
          '*'
        );
        setIsPlaying(true);
      }
    } catch {}
  };

  useEffect(() => {
    const currentIframe = iframeRef.current;
    return () => {
      try {
        currentIframe?.contentWindow?.postMessage(
          JSON.stringify({ event: 'command', func: 'pauseVideo', args: '' }),
          '*'
        );
        currentIframe?.contentWindow?.postMessage(
          JSON.stringify({ event: 'command', func: 'stopVideo', args: '' }),
          '*'
        );
      } catch {}
    };
  }, []);

  return (
    <section className={styles.verdict} aria-label="Your 60-second brief">
      <motion.div
        className={styles.content}
        initial="hidden"
        animate="visible"
        variants={fadeIn}
      >
        <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className={styles.tag}><Sparkles size={14} /><span>Your 60-Second Brief</span></motion.div>
        <motion.h2 variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className={styles.headline}>{headline}</motion.h2>
        <motion.div variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className={styles.baselineRow}>
          <span>Typical: <strong>{formatViews(analytics.medianViews)}</strong></span>
          <span className={styles.baselineSep}>•</span>
          <span>Top: <strong>{top ? formatViews(top.views) : '—'}</strong></span>
          <span className={styles.baselineSep}>•</span>
          <span>Sample: <strong>{videos.length}</strong> uploads</span>
          <span className={styles.baselineSep}>•</span>
          <span style={{ color: 'var(--text-3)' }}>Cumulative views, not growth</span>
        </motion.div>
        {inlineSummary ? (
          <motion.p variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className={styles.inlineSummary}>
            {inlineSummary}
          </motion.p>
        ) : (
          <motion.p variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className={styles.supporting}>
            {hasComparison ? `A typical upload in this report has ${formatViews(analytics.medianViews)} views. Compare the leading upload, then explore the patterns.` : 'A snapshot of the public uploads available.'}
          </motion.p>
        )}
        {remainingSummary && (
          <motion.details variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }} className={styles.summary}>
            <summary>{meta.analysisSource === 'gemini' ? 'Read full AI interpretation' : 'Read full calculated summary'}</summary>
            <p>{remainingSummary}</p>
          </motion.details>
        )}

      </motion.div>

      {top && <motion.div 
        className={styles.spotlight}
        initial={{ opacity: 0, scale: 0.95, x: 20 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ delay: 0.5, type: "spring", stiffness: 200, damping: 20 }}
      >
        <div className={styles.spotlightLabel}>
          <span>Standout Upload</span>
          <ArrowUpRight size={15} />
        </div>

        {isPlayingInline ? (
          <div className={styles.inlinePlayerBox}>
            <div className={styles.inlinePlayerWrapper}>
              <iframe
                ref={iframeRef}
                key={top.videoId}
                className={styles.inlineIframe}
                src={`https://www.youtube-nocookie.com/embed/${top.videoId}?autoplay=1&start=${seekSecond}&enablejsapi=1&rel=0&modestbranding=1`}
                title={top.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            <div className={styles.inlineControls}>
              <div className={styles.jumpRow}>
                <button
                  type="button"
                  className={styles.playToggleBtn}
                  onClick={togglePlayPause}
                  title={isPlaying ? 'Pause video audio' : 'Play video'}
                  style={{
                    background: isPlaying ? 'rgba(255, 193, 110, 0.15)' : 'rgba(74, 222, 128, 0.15)',
                    border: isPlaying ? '1px solid rgba(255, 193, 110, 0.35)' : '1px solid rgba(74, 222, 128, 0.35)',
                    color: isPlaying ? '#ffc16e' : '#4ade80',
                  }}
                >
                  {isPlaying ? <Pause size={10} /> : <Play size={10} />}
                  <span>{isPlaying ? 'Pause' : 'Play'}</span>
                </button>
                <span className={styles.jumpLabel}><Zap size={11} /> Jump:</span>
                <button
                  type="button"
                  className={`${styles.jumpPill} ${seekSecond === 0 ? styles.jumpActive : ''}`}
                  onClick={() => handleJump(0)}
                >
                  0:00 Hook
                </button>
                <button
                  type="button"
                  className={`${styles.jumpPill} ${seekSecond === 15 ? styles.jumpActive : ''}`}
                  onClick={() => handleJump(15)}
                >
                  0:15 Promise
                </button>
                <button
                  type="button"
                  className={`${styles.jumpPill} ${seekSecond === 35 ? styles.jumpActive : ''}`}
                  onClick={() => handleJump(35)}
                >
                  0:35 Core
                </button>
              </div>
              <button
                type="button"
                className={styles.closePlayerBtn}
                onClick={handleHidePlayer}
              >
                <X size={12} /> Hide Player
              </button>
            </div>
          </div>
        ) : (
          <div
            className={styles.videoArt}
            aria-hidden="true"
            onClick={handleStartInlinePlay}
            style={{ cursor: 'pointer' }}
            title="Click to play in-page"
          >
            <div className={styles.artGrid} />
            <Play size={25} className={styles.playIcon} fill="currentColor" />
            {!isSample && top.thumbnail && (
              <Image
                unoptimized
                src={top.thumbnail}
                fill
                sizes="320px"
                alt=""
                onError={(event) => { event.currentTarget.style.display = 'none'; }}
              />
            )}
            <span className={styles.duration}>{top.lengthSeconds > 0 ? top.length : 'Video'}</span>
          </div>
        )}

        <h3>{top.title}</h3>
        <div className={styles.spotlightStats}>
          <span><Eye size={14} /> {formatViews(top.views)} views</span>
          {ratio !== null && (
            <span className={styles.spotlightChip}>
              <Zap size={11} /> {ratio.toFixed(1)}× typical
            </span>
          )}
          {share !== null && <span>{share}% of total</span>}
        </div>
        <p className={styles.scope}>Highest views among these uploads · not age-adjusted</p>

        {!isPlayingInline && (
          <button
            type="button"
            className={styles.watchBtn}
            onClick={handleStartInlinePlay}
          >
            <Play size={12} fill="currentColor" /> Watch In-Page
          </button>
        )}
      </motion.div>}
    </section>
  );
};
