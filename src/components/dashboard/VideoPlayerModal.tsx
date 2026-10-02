'use client';

import { useEffect, useState } from 'react';
import { ExternalLink, Play, Sparkles, X, Zap } from 'lucide-react';
import styles from './VideoPlayerModal.module.css';

interface VideoPlayerModalProps {
  videoId: string;
  videoTitle: string;
  initialSeconds?: number;
  onClose: () => void;
}

export const VideoPlayerModal = ({
  videoId,
  videoTitle,
  initialSeconds = 0,
  onClose,
}: VideoPlayerModalProps) => {
  const [currentSeconds, setCurrentSeconds] = useState<number>(initialSeconds);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Lock background body scroll
  useEffect(() => {
    const originalStyle = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, []);

  const jumpTimestamps = [
    { label: 'Opening Hook', seconds: 0 },
    { label: 'Core Promise', seconds: 12 },
    { label: 'Tension / Setup', seconds: 28 },
    { label: 'Full Breakdown', seconds: 45 },
  ];

  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&start=${currentSeconds}&rel=0&modestbranding=1`;

  return (
    <div
      className={styles.backdrop}
      role="dialog"
      aria-modal="true"
      aria-label={`Playing video: ${videoTitle}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.modal}>
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleArea}>
            <span className={styles.badge}>
              <Play size={10} fill="currentColor" /> IN-APP THEATER
            </span>
            <h3 className={styles.videoTitle} title={videoTitle}>
              {videoTitle}
            </h3>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close video player"
          >
            <X size={16} />
          </button>
        </div>

        {/* 16:9 Video Player */}
        <div className={styles.playerWrapper}>
          <iframe
            key={`${videoId}-${currentSeconds}`}
            className={styles.iframe}
            src={embedUrl}
            title={videoTitle}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>

        {/* Timestamp Jump Controls */}
        <div className={styles.controls}>
          <div className={styles.controlsTop}>
            <span className={styles.controlsLabel}>
              <Zap size={13} style={{ color: '#ffc16e' }} /> DISSECT THE SCRIPT (JUMP TO SECOND):
            </span>
            <a
              href={`https://www.youtube.com/watch?v=${videoId}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.externalLink}
            >
              Open on YouTube <ExternalLink size={12} />
            </a>
          </div>

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
      </div>
    </div>
  );
};
