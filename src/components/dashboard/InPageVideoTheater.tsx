'use client';

import { useState, useRef, useEffect } from 'react';
import { ExternalLink, Pause, Play, Sparkles, X, Zap } from 'lucide-react';
import styles from './InPageVideoTheater.module.css';

interface InPageVideoTheaterProps {
  videoId: string;
  videoTitle: string;
  initialSeconds?: number;
  onClose: () => void;
}

export const InPageVideoTheater = ({
  videoId,
  videoTitle,
  initialSeconds = 0,
  onClose,
}: InPageVideoTheaterProps) => {
  const [currentSeconds, setCurrentSeconds] = useState<number>(initialSeconds);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLElement>(null);

  const jumpTimestamps = [
    { label: 'Opening Hook', seconds: 0 },
    { label: 'Core Promise', seconds: 15 },
    { label: 'Tension / Setup', seconds: 30 },
    { label: 'Full Breakdown', seconds: 50 },
  ];

  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&start=${initialSeconds}&enablejsapi=1&rel=0&modestbranding=1`;

  // Smooth scroll into view when opened
  useEffect(() => {
    containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [videoId]);

  // Audio cleanup on unmount
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

  const handleJump = (seconds: number) => {
    setCurrentSeconds(seconds);
    setIsPlaying(true);
    try {
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: 'command', func: 'seekTo', args: [seconds, true] }),
        '*'
      );
      iframeRef.current?.contentWindow?.postMessage(
        JSON.stringify({ event: 'command', func: 'playVideo', args: '' }),
        '*'
      );
    } catch {}
  };

  const handleClose = () => {
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
    onClose();
  };

  return (
    <section ref={containerRef} className={styles.theaterContainer} aria-label={`In-page video player for ${videoTitle}`}>
      {/* Header Bar */}
      <div className={styles.header}>
        <div className={styles.titleInfo}>
             <span className={styles.badge}>
             <Play size={10} fill="currentColor" /> In-page video
          </span>
          <h3 className={styles.title} title={videoTitle}>
            {videoTitle}
          </h3>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.playPauseBtn}
            onClick={togglePlayPause}
            title={isPlaying ? 'Pause video audio' : 'Play video'}
          >
            {isPlaying ? <Pause size={13} /> : <Play size={13} />}
            <span>{isPlaying ? 'Pause Audio' : 'Play Audio'}</span>
          </button>
          <a
            href={`https://www.youtube.com/watch?v=${videoId}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.externalLink}
          >
            Open on YouTube <ExternalLink size={12} />
          </a>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={handleClose}
            aria-label="Close in-page video player"
          >
            <X size={15} />
            <span>Close Player</span>
          </button>
        </div>
      </div>

      {/* 16:9 In-Page Responsive Embed */}
      <div className={styles.playerWrapper}>
        <iframe
          ref={iframeRef}
          key={videoId}
          className={styles.iframe}
          src={embedUrl}
          title={videoTitle}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      {/* Jump Scrubber Controls */}
      <div className={styles.controlsBar}>
           <span className={styles.controlsLabel}>
           <Zap size={13} style={{ color: '#ffc16e' }} /> Jump to a part of the video:
        </span>

        <div className={styles.jumpPills}>
          {jumpTimestamps.map((item) => {
            const active = currentSeconds === item.seconds;
            return (
              <button
                key={item.seconds}
                type="button"
                className={`${styles.jumpBtn} ${active ? styles.active : ''}`}
                onClick={() => handleJump(item.seconds)}
              >
                <Sparkles size={11} />
                <span>{item.label}</span>
                <span className={styles.jumpTime}>
                  {Math.floor(item.seconds / 60)}:
                  {String(item.seconds % 60).padStart(2, '0')}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
