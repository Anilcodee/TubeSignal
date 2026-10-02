'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, Copy, ExternalLink, Loader2, MessageSquare, Mic, Play, Search, Sparkles, Zap } from 'lucide-react';
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
  onWatchVideo,
}: {
  videos: VideoData[];
  channelName: string;
  isDemo?: boolean;
  onWatchVideo?: (videoId: string, title: string, initialSeconds?: number) => void;
}) => {
  // Sort videos by views descending, pick top candidates
  const topVideos = useMemo(() => {
    return [...videos].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
  }, [videos]);

  const [selectedVideoId, setSelectedVideoId] = useState<string>(topVideos[0]?.videoId || '');
  const activeVideoId = (selectedVideoId && topVideos.some((v) => v.videoId === selectedVideoId))
    ? selectedVideoId
    : (topVideos[0]?.videoId || '');

  const [loading, setLoading] = useState<boolean>(() => !transcriptClientCache.has(activeVideoId));
  const [data, setData] = useState<TranscriptResponse | null>(() => transcriptClientCache.get(activeVideoId) ?? null);
  const [copied, setCopied] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const currentVideo = topVideos.find((v) => v.videoId === activeVideoId) || topVideos[0];

  useEffect(() => {
    if (!activeVideoId) return;

    let cancelled = false;
    const cached = transcriptClientCache.get(activeVideoId);
    if (cached) {
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
          transcriptClientCache.set(activeVideoId, resData);
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
  }, [activeVideoId, isDemo]);

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

  if (topVideos.length === 0) {
    return null;
  }

  const analysis = data?.analysis;

  return (
    <div className={styles.container}>
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
          {onWatchVideo && (
            <button
              type="button"
              className={styles.copyBtn}
              style={{ background: 'rgba(255, 193, 110, 0.15)', color: '#ffc16e', borderColor: 'rgba(255, 193, 110, 0.35)', cursor: 'pointer' }}
              onClick={() => onWatchVideo(selectedVideoId, currentVideo?.title || 'Video', 0)}
              title="Open in-app video theater"
            >
              <Play size={12} fill="currentColor" />
              <span>Watch In-App Theater</span>
            </button>
          )}
        </div>
      </div>

      {/* Video Selector */}
      <div className={styles.selectorBar} role="tablist" aria-label="Select video to analyze">
        {topVideos.map((video, idx) => (
          <button
            key={video.videoId}
            type="button"
            className={`${styles.videoChip} ${video.videoId === selectedVideoId ? styles.activeChip : ''}`}
            onClick={() => setSelectedVideoId(video.videoId)}
            title={video.title}
          >
            <span>#{idx + 1}</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{video.title}</span>
            {video.viewsFormatted && <span className={styles.chipViews}>{video.viewsFormatted}</span>}
          </button>
        ))}
      </div>

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
        </div>
      )}

      {!loading && data?.success && analysis && (
        <>
          {/* Hook Hero Card */}
          <div className={styles.hookCard}>
            <div className={styles.cardHeader}>
              <div>
                <span className={styles.archetypeBadge}>
                  <Sparkles size={13} />
                  {analysis.hookArchetype}
                </span>
                <p className={styles.archetypeDesc}>{analysis.archetypeDescription}</p>
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

            {/* Metrics Grid */}
            <div className={styles.hookMetrics}>
              <div className={styles.metricTile}>
                <div className={styles.metricLabel}>Speech Pacing</div>
                <div className={styles.metricValue}>{analysis.wordsPerMinute} <small style={{ fontSize: 11, fontWeight: 400 }}>WPM</small></div>
                <div className={styles.metricSub}>{analysis.wordsPerMinute > 165 ? '⚡ High-energy' : '🗣️ Conversational'}</div>
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
                const jumpUrl = currentVideo?.url ? `${currentVideo.url}&t=${seconds}s` : `https://www.youtube.com/watch?v=${selectedVideoId}&t=${seconds}s`;

                return (
                  <div
                    key={`${segment.startMs}-${index}`}
                    className={`${styles.segmentItem} ${isHook ? styles.highlightHook : ''}`}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        if (onWatchVideo) {
                          onWatchVideo(selectedVideoId, currentVideo?.title || 'Video', seconds);
                        } else {
                          window.open(jumpUrl, '_blank', 'noopener,noreferrer');
                        }
                      }}
                      className={styles.timestamp}
                      title={`Jump to ${segment.timestampText} in theater`}
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
    </div>
  );
};
