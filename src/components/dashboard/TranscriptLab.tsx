'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { AudioLines, Check, Copy, ExternalLink, Loader2, MessageSquare, Mic, Pause, Play, Search, Sparkles, X, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeIn } from '@/utils/animations';
import type { VideoData } from '@/types/analysis';
import type { HookAnalysis } from '@/utils/transcript-analyzer';
import styles from './TranscriptLab.module.css';

interface TranscriptResponse {
  success: boolean;
  segments?: { start_ms?: number; startMs?: number; snippet?: string; text?: string; start_time_text?: string; timestampText?: string }[];
  analysis?: HookAnalysis;
  error?: string;
  source?: string;
  notice?: string;
}

const transcriptClientCache = new Map<string, TranscriptResponse>();

export const TranscriptLab = ({
  videos,
  channelName,
  isDemo,
  onPlayStart,
}: {
  videos: VideoData[];
  channelName: string;
  isDemo?: boolean;
  onWatchVideo?: (videoId: string, title: string, initialSeconds?: number) => void;
  onPlayStart?: () => void;
}) => {
  // Sort videos by views descending, pick top candidates
  const topVideos = useMemo(() => {
    return [...videos].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
  }, [videos]);

  const [selectedVideoId, setSelectedVideoId] = useState<string>(topVideos[0]?.videoId || '');
  const activeVideoId = (selectedVideoId && topVideos.some((v) => v.videoId === selectedVideoId))
    ? selectedVideoId
    : (topVideos[0]?.videoId || '');

  const [loading, setLoading] = useState<boolean>(() => {
    const cached = transcriptClientCache.get(activeVideoId);
    return !cached || !cached.success;
  });
  const [data, setData] = useState<TranscriptResponse | null>(() => {
    const cached = transcriptClientCache.get(activeVideoId);
    return cached && cached.success ? cached : null;
  });
  const [retryCount, setRetryCount] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isPlayingInline, setIsPlayingInline] = useState<boolean>(false);
  const [inlineSecond, setInlineSecond] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const currentVideo = topVideos.find((v) => v.videoId === activeVideoId) || topVideos[0];

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSelectedVideoId(topVideos[0]?.videoId || '');
  }, [channelName, topVideos]);

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

  useEffect(() => {
    if (!activeVideoId) return;

    let cancelled = false;
    const cached = transcriptClientCache.get(activeVideoId);
    if (cached && cached.success) {
      queueMicrotask(() => {
        if (!cancelled) {
          setData(cached);
          setLoading(false);
        }
      });
      return () => {
        cancelled = true;
      };
    }

    const runFetch = async () => {
      await Promise.resolve();
      if (cancelled) return;
      setLoading(true);
      setData(null);

      try {
        const res = await fetch('/api/transcript', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ videoId: activeVideoId, isDemo }),
        });
        const resData = (await res.json()) as TranscriptResponse;
        if (!cancelled) {
          if (resData.success) {
            transcriptClientCache.set(activeVideoId, resData);
          }
          setData(resData);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setData({ success: false, error: err instanceof Error ? err.message : 'Failed to load transcript.' });
          setLoading(false);
        }
      }
    };

    void runFetch();

    return () => {
      cancelled = true;
    };
  }, [activeVideoId, isDemo, retryCount]);

  const handleCopyTranscript = () => {
    if (!data?.analysis?.fullTranscriptText) return;
    navigator.clipboard.writeText(data.analysis.fullTranscriptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const segments = data?.analysis?.segments;
  const filteredSegments = useMemo(() => {
    if (!segments) return [];
    if (!searchQuery.trim()) return segments;
    const q = searchQuery.toLowerCase();
    return segments.filter((s) => s.text.toLowerCase().includes(q));
  }, [segments, searchQuery]);

  const analysis = data?.analysis;

  const waveformSlices = useMemo(() => {
    if (!analysis) return [];
    const totalBars = 23;
    const hookSec = analysis.hookDurationSeconds || 30;
    return Array.from({ length: totalBars }, (_, i) => {
      const second = i * 2;
      const isHook = second <= hookSec;
      const matchingSeg = segments?.find(
        (s) => Math.abs((s.startMs / 1000) - second) <= 2
      );
      const wordLen = matchingSeg?.text ? matchingSeg.text.split(' ').length : 0;
      const baseHeight = 30 + ((i * 11 + 17) % 45);
      const height = matchingSeg ? Math.min(100, Math.max(25, wordLen * 7 + 25)) : baseHeight;
      const color = isHook ? 'rgba(255, 193, 110, 0.75)' : 'rgba(96, 165, 250, 0.45)';
      return {
        second,
        height,
        color,
        isHook,
        intensityLabel: isHook ? 'Hook zone' : 'Body zone',
      };
    });
  }, [analysis, segments]);

  if (topVideos.length === 0) {
    return null;
  }

  const handleScrubToSecond = (sec: number) => {
    setInlineSecond(sec);
    setIsPlaying(true);
    if (!isPlayingInline) {
      setIsPlayingInline(true);
      onPlayStart?.();
    } else {
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
    }
  };

  return (
    <motion.div className={styles.container} initial="hidden" animate="visible" variants={fadeIn}>
      <div className={styles.headingRow}>
        <div className={styles.titleArea}>
          <span>SERPAPI SPEECH INTELLIGENCE</span>
          <h2>Hook & Script Breakdown</h2>
          <p>Analyze how {channelName} hooks viewers in the first 40 seconds of their top uploads.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div className={styles.serpBadge}>
            <Mic size={13} />
            <span>SerpApi youtube_video_transcript</span>
          </div>
          <button
            type="button"
            className={styles.copyBtn}
            style={{
              background: isPlayingInline ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 193, 110, 0.15)',
              color: isPlayingInline ? '#ef4444' : '#ffc16e',
              borderColor: isPlayingInline ? 'rgba(239, 68, 68, 0.35)' : 'rgba(255, 193, 110, 0.35)',
              cursor: 'pointer',
            }}
            onClick={() => {
              if (isPlayingInline) {
                handleHidePlayer();
              } else {
                setIsPlayingInline(true);
                setIsPlaying(true);
                onPlayStart?.();
              }
            }}
            title="Toggle in-page video playback"
          >
            <Play size={12} fill="currentColor" />
            <span>{isPlayingInline ? 'Hide In-Page Video' : 'Watch In-Page Video'}</span>
          </button>
        </div>
      </div>

      {/* Video Selector */}
      <div className={styles.selectorBar} role="tablist" aria-label="Select video to analyze">
        {topVideos.map((video, idx) => (
          <button
            key={video.videoId}
            type="button"
            className={`${styles.videoChip} ${video.videoId === activeVideoId ? styles.activeChip : ''}`}
            onClick={() => {
              if (activeVideoId !== video.videoId) {
                try {
                  iframeRef.current?.contentWindow?.postMessage(
                    JSON.stringify({ event: 'command', func: 'stopVideo', args: '' }),
                    '*'
                  );
                } catch {}
                setSelectedVideoId(video.videoId);
                setInlineSecond(0);
              }
            }}
            title={video.title}
          >
            <span>#{idx + 1}</span>
            {idx === 0 && <span className={styles.standoutChipBadge}>★ Standout</span>}
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{video.title}</span>
            {video.viewsFormatted && <span className={styles.chipViews}>{video.viewsFormatted}</span>}
          </button>
        ))}
      </div>

      {/* Inline In-Page Video Player */}
      {isPlayingInline && activeVideoId && (
        <div className={styles.inlinePlayerContainer}>
          <div className={styles.inlinePlayerHeader}>
            <span className={styles.inlinePlayerTitle}>
              <Play size={12} fill="currentColor" /> Playing in-page: {currentVideo?.title}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                className={styles.copyBtn}
                onClick={togglePlayPause}
                style={{
                  padding: '0.25rem 0.6rem',
                  fontSize: '0.72rem',
                  cursor: 'pointer',
                  background: isPlaying ? 'rgba(255, 193, 110, 0.15)' : 'rgba(74, 222, 128, 0.15)',
                  color: isPlaying ? '#ffc16e' : '#4ade80',
                  borderColor: isPlaying ? 'rgba(255, 193, 110, 0.35)' : 'rgba(74, 222, 128, 0.35)',
                }}
                title={isPlaying ? 'Pause video audio' : 'Play video'}
              >
                {isPlaying ? <Pause size={11} /> : <Play size={11} />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>
              <button
                type="button"
                className={styles.inlineCloseBtn}
                onClick={handleHidePlayer}
              >
                <X size={13} /> Hide player
              </button>
            </div>
          </div>
          <div className={styles.inlineIframeWrapper}>
            <iframe
              ref={iframeRef}
              key={activeVideoId}
              className={styles.inlineIframe}
              src={`https://www.youtube-nocookie.com/embed/${activeVideoId}?autoplay=1&start=${inlineSecond}&enablejsapi=1&rel=0&modestbranding=1`}
              title={currentVideo?.title || 'Video'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {loading && (
        <div className={styles.loadingBox}>
          <Loader2 size={24} className={styles.spinner} />
          <span>Extracting spoken transcript via SerpApi...</span>
        </div>
      )}

      {!loading && !data?.success && (
        <div className={styles.emptyState}>
          <MessageSquare size={24} style={{ marginBottom: 8, opacity: 0.7 }} />
          <p>{data?.error || 'No public transcript or spoken audio found for this video.'}</p>
          <small style={{ color: 'var(--text-3)', display: 'block', marginTop: 4 }}>
            Try selecting another video above or testing a sample report.
          </small>
          <div style={{ marginTop: 12 }}>
            <button
              type="button"
              onClick={() => {
                transcriptClientCache.delete(activeVideoId);
                setRetryCount((c) => c + 1);
              }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '6px 14px',
                borderRadius: '8px',
                background: 'var(--surface-3)',
                color: 'var(--text)',
                border: '1px solid var(--line)',
                cursor: 'pointer',
                fontSize: '12px',
              }}
            >
              Retry transcript
            </button>
          </div>
        </div>
      )}

      {!loading && data?.success && analysis && (
        <>
          {/* Hook Hero Card */}
          <div className={styles.hookCard}>
            <div className={styles.cardHeader}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span className={styles.archetypeBadge}>
                    <Sparkles size={13} />
                    {analysis.hookArchetype}
                  </span>
                  <span className={styles.archetypeWhy}>
                    <strong>Why this hook works:</strong> {analysis.archetypeDescription}
                  </span>
                </div>
              </div>
              {currentVideo?.url && (
                <a
                  href={currentVideo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.timestamp}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}
                >
                  Watch Video <ExternalLink size={12} />
                </a>
              )}
            </div>

            {/* Hook Text Quote */}
            <div className={styles.hookQuoteBox}>
              &ldquo;{analysis.hookText}&rdquo;
            </div>

            {/* Interactive Spoken Waveform & Hook Timeline Scrubber */}
            <div className={styles.waveformContainer}>
              <div className={styles.waveformHeader}>
                <div className={styles.waveformTitle}>
                  <AudioLines size={14} className={styles.waveformIcon} />
                  <span>Opening 45s Spoken Cadence &amp; Hook Waveform</span>
                </div>
                <span className={styles.waveformHint}>Click any bar to scrub video</span>
              </div>
              <div className={styles.waveformBars} role="region" aria-label="Audio timeline scrubber">
                {waveformSlices.map((slice) => {
                  const isActive = Math.abs(inlineSecond - slice.second) < 2;
                  return (
                    <button
                      key={slice.second}
                      type="button"
                      className={`${styles.waveformBarCol} ${isActive ? styles.waveformBarColActive : ''}`}
                      onClick={() => handleScrubToSecond(slice.second)}
                      title={`Scrub to 0:${slice.second.toString().padStart(2, '0')} (${slice.intensityLabel})`}
                    >
                      <span
                        className={styles.waveformBarLine}
                        style={{ height: `${slice.height}%`, background: slice.color }}
                      />
                      <span className={styles.waveformBarTime}>{slice.second}s</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Metrics Grid */}
            <div className={styles.hookMetrics}>
              <div className={`${styles.metricTile} ${styles.pacingTile}`}>
                <div className={styles.metricLabel}>Speech Pacing</div>
                <div className={styles.metricValue}>{analysis.wordsPerMinute} <small style={{ fontSize: 11, fontWeight: 400 }}>WPM</small></div>
                <div className={styles.metricSub}>
                  {analysis.wordsPerMinute < 130
                    ? 'Deliberate cadence'
                    : analysis.wordsPerMinute > 165
                      ? '⚡ High-energy'
                      : '🗣️ Conversational'}
                </div>
                <div className={styles.wpmScaleBar} aria-label={`Pacing benchmark: ${analysis.wordsPerMinute} WPM`}>
                  <div className={styles.wpmTrack}>
                    <div
                      className={`${styles.wpmSegment} ${analysis.wordsPerMinute < 130 ? styles.wpmSegmentActive : ''}`}
                      title="<130 deliberate"
                    />
                    <div
                      className={`${styles.wpmSegment} ${analysis.wordsPerMinute >= 130 && analysis.wordsPerMinute <= 165 ? styles.wpmSegmentActive : ''}`}
                      title="130–165 conversational"
                    />
                    <div
                      className={`${styles.wpmSegment} ${analysis.wordsPerMinute > 165 ? styles.wpmSegmentActive : ''}`}
                      title=">165 high-energy"
                    />
                    <div
                      className={styles.wpmPip}
                      style={{
                        left: `${Math.max(4, Math.min(96, ((analysis.wordsPerMinute - 90) / (200 - 90)) * 100))}%`,
                      }}
                    />
                  </div>
                  <div className={styles.wpmScaleLabels}>
                    <span className={analysis.wordsPerMinute < 130 ? styles.activeLabel : ''}>&lt;130 deliberate</span>
                    <span className={analysis.wordsPerMinute >= 130 && analysis.wordsPerMinute <= 165 ? styles.activeLabel : ''}>130–165 conversational</span>
                    <span className={analysis.wordsPerMinute > 165 ? styles.activeLabel : ''}>&gt;165 high-energy</span>
                  </div>
                </div>
              </div>
              <div className={styles.metricTile}>
                <div className={styles.metricLabel}>Hook Duration</div>
                <div className={styles.metricValue}>{analysis.hookDurationSeconds}s</div>
                <div className={styles.metricSub}>{analysis.wordCount} words spoken</div>
              </div>
              <div className={styles.metricTile}>
                <div className={styles.metricLabel}>Viewer Address</div>
                <div className={styles.metricValue}>{analysis.audienceAddresses}x</div>
                <div className={styles.metricSub}>Direct &apos;You / We&apos; cues</div>
              </div>
              <div className={styles.metricTile}>
                <div className={styles.metricLabel}>Open Loops</div>
                <div className={styles.metricValue}>{analysis.questionCount}</div>
                <div className={styles.metricSub}>Curiosity questions</div>
              </div>
            </div>

            {/* Power Words */}
            {analysis.powerWords.length > 0 && (
              <div className={styles.powerWordsRow}>
                <span style={{ color: 'var(--text-3)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Zap size={12} style={{ color: 'var(--accent)' }} /> Psychological Power Words:
                </span>
                {analysis.powerWords.map((word) => (
                  <span key={word} className={styles.powerWordTag}>{word}</span>
                ))}
              </div>
            )}
          </div>

          {/* Full Transcript Inspector */}
          <div className={styles.transcriptCard}>
            <div className={styles.transcriptControls}>
              <div className={styles.searchBox}>
                <Search size={14} style={{ color: 'var(--text-3)' }} />
                <input
                  type="text"
                  placeholder="Search spoken keywords in script..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <button type="button" className={styles.copyBtn} onClick={handleCopyTranscript}>
                {copied ? <Check size={13} style={{ color: '#34D399' }} /> : <Copy size={13} />}
                <span>{copied ? 'Copied Transcript!' : 'Copy Full Transcript'}</span>
              </button>
            </div>

            <div className={styles.segmentList}>
              {filteredSegments.map((segment, index) => {
                const isHook = segment.startMs <= 40_000;
                const seconds = Math.floor(segment.startMs / 1000);

                return (
                  <div
                    key={`${segment.startMs}-${index}`}
                    className={`${styles.segmentItem} ${isHook ? styles.highlightHook : ''}`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setInlineSecond(seconds);
                        setIsPlaying(true);
                        if (!isPlayingInline) {
                          setIsPlayingInline(true);
                          onPlayStart?.();
                        } else {
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
                        }
                      }}
                      className={styles.timestamp}
                      title={`Play at ${segment.timestampText} in-page`}
                      style={{ cursor: 'pointer', border: 'none', background: 'none' }}
                    >
                      <Play size={10} fill="currentColor" style={{ marginRight: 4 }} />
                      {segment.timestampText}
                    </button>
                    <span className={styles.segmentText}>{segment.text}</span>
                  </div>
                );
              })}

              {filteredSegments.length === 0 && (
                <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-3)', fontSize: '13px' }}>
                  No spoken lines match &quot;{searchQuery}&quot;
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};
