'use client';

import { useState } from 'react';
import { ExternalLink, Play, Sparkles, X, Zap } from 'lucide-react';
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

  const jumpTimestamps = [
    { label: 'Opening Hook', seconds: 0 },
    { label: 'Core Promise', seconds: 15 },
    { label: 'Tension / Setup', seconds: 30 },
    { label: 'Full Breakdown', seconds: 50 },
  ];

  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&start=${currentSeconds}&rel=0&modestbranding=1`;

  return (
    <section className={styles.theaterContainer} aria-label={`In-page video player for ${videoTitle}`}>
      {/* Header Bar */}
      <div className={styles.header}>
        <div className={styles.titleInfo}>
          <span className={styles.badge}>
            <Play size={10} fill="currentColor" /> IN-PAGE THEATER
          </span>
          <h3 className={styles.title} title={videoTitle}>
            {videoTitle}
          </h3>
        </div>

        <div className={styles.actions}>
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
            onClick={onClose}
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
          key={`${videoId}-${currentSeconds}`}
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
          <Zap size={13} style={{ color: '#ffc16e' }} /> DISSECT THE SCRIPT (JUMP TO SECOND):
        </span>

        <div className={styles.jumpPills}>
          {jumpTimestamps.map((item) => {
            const active = currentSeconds === item.seconds;
            return (
              <button
                key={item.seconds}
                type="button"
                className={`${styles.jumpBtn} ${active ? styles.active : ''}`}
                onClick={() => setCurrentSeconds(item.seconds)}
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
