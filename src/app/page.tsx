'use client';

import React, { useState } from 'react';
import { useAnalysis } from '@/hooks/useAnalysis';
import { ChannelOverview } from '@/components/dashboard/ChannelOverview';
import { AIBrief } from '@/components/dashboard/AIBrief';
import { ViewsDistribution } from '@/components/charts/ViewsDistribution';
import { ContentThemes } from '@/components/charts/ContentThemes';
import { PublishingTimeline } from '@/components/charts/PublishingTimeline';
import { LengthVsViews } from '@/components/charts/LengthVsViews';
import { TopVideos } from '@/components/dashboard/TopVideos';
import Loading from '@/app/analyze/[channelId]/loading';
import {
  Search,
  Sparkles,
  Share2,
  Download,
  Zap,
  Activity,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import styles from './page.module.css';

const PRESET_CHANNELS = [
  { label: 'Marques Brownlee', id: 'mkbhd', handle: '@mkbhd' },
  { label: 'Fireship', id: 'fireship', handle: '@fireship' },
  { label: 'Veritasium', id: 'veritasium', handle: '@veritasium' },
];

export default function WorkspacePage() {
  const [selectedChannel, setSelectedChannel] = useState('mkbhd');
  const [searchQuery, setSearchQuery] = useState('');

  const { data, isLoading, error, refetch, isDemoMode, toggleDemoMode } =
    useAnalysis(selectedChannel, false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = searchQuery.replace(/^@/, '').trim().toLowerCase();
    if (clean) {
      setSelectedChannel(clean);
    }
  };

  const handlePillSelect = (channelId: string) => {
    setSelectedChannel(channelId);
    setSearchQuery('');
  };

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.origin);
      alert('Workspace dossier link copied to clipboard!');
    }
  };

  return (
    <div className={styles.workspace}>
      {/* Workspace Control Bar */}
      <div className={styles.controlBar}>
        <form className={styles.searchRow} onSubmit={handleSearchSubmit}>
          <div className={styles.searchInputWrapper}>
            <Search size={16} className={styles.searchIcon} />
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Search or enter any YouTube channel handle (e.g. mkbhd, fireship, veritasium)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button type="submit" className={styles.analyzeBtn} disabled={isLoading || !searchQuery.trim()}>
            <Sparkles size={14} />
            <span>Analyze Channel</span>
          </button>
        </form>

        <div className={styles.quickPillsRow}>
          <span className={styles.pillsLabel}>Preset Dossiers:</span>
          {PRESET_CHANNELS.map((ch) => (
            <button
              key={ch.id}
              type="button"
              className={`${styles.pillBtn} ${
                selectedChannel === ch.id ? styles.pillBtnActive : ''
              }`}
              onClick={() => handlePillSelect(ch.id)}
            >
              <Activity size={12} />
              <span>{ch.handle}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Action Bar */}
      <div className={styles.actionRow}>
        <div className={styles.statusIndicator}>
          <span>Active Target:</span>
          <strong style={{ color: 'var(--color-text-primary)' }}>
            {data?.channel.name || selectedChannel.toUpperCase()}
          </strong>
        </div>

        <div className={styles.actionButtons}>
          <button
            type="button"
            className={`${styles.actionBtn} ${isDemoMode ? styles.pillBtnActive : ''}`}
            onClick={toggleDemoMode}
            title="Toggle between cached dataset and live SerpApi API calls"
          >
            <Zap size={13} />
            <span>{isDemoMode ? 'Demo Dataset' : 'Live SerpApi'}</span>
          </button>

          <button type="button" className={styles.actionBtn} onClick={handleShare}>
            <Share2 size={13} />
            <span>Share</span>
          </button>

          <button type="button" className={styles.actionBtn} onClick={handlePrint}>
            <Download size={13} />
            <span>Export Brief</span>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && <Loading />}

      {/* Error State */}
      {!isLoading && (error || !data) && (
        <div
          style={{
            maxWidth: '520px',
            margin: 'var(--space-12) auto',
            background: 'var(--color-bg-secondary)',
            border: '1px solid var(--color-surface-border)',
            borderRadius: 'var(--radius-xl)',
            padding: 'var(--space-8)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 'var(--space-4)',
          }}
        >
          <AlertCircle size={28} color="#f87171" />
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)' }}>
            Dossier Extraction Failed
          </h3>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
            {error || 'Unable to retrieve channel metrics. Check channel identifier or toggle Demo Dataset.'}
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <Button variant="secondary" onClick={() => refetch()} leftIcon={<RefreshCw size={14} />}>
              Retry Query
            </Button>
            <Button variant="primary" onClick={toggleDemoMode} leftIcon={<Zap size={14} />}>
              Load Cached Dataset
            </Button>
          </div>
        </div>
      )}

      {/* Active Intelligence Workspace Data */}
      {!isLoading && data && (
        <>
          {/* Channel Header Overview */}
          <ChannelOverview
            channel={data.channel}
            analytics={data.analytics}
            isDemo={isDemoMode}
          />

          {/* AI Strategy Brief + Content Themes */}
          <div className={styles.twoColGrid}>
            <AIBrief analysis={data.aiAnalysis} />
            <ContentThemes data={data.chartData.contentThemes} />
          </div>

          {/* Views Distribution & Publishing Cadence Charts */}
          <div className={styles.equalGrid}>
            <ViewsDistribution data={data.chartData.viewsDistribution} />
            <PublishingTimeline data={data.chartData.publishingTimeline} />
          </div>

          {/* Length vs Views Scatter & Retention Synthesis */}
          <div className={styles.equalGrid}>
            <LengthVsViews data={data.chartData.lengthVsViews} />
            <div className={styles.retentionCard}>
              <span className={styles.retentionLabel}>Audience Retention Synthesis</span>
              <h4 className={styles.retentionTitle}>
                Optimal Duration: {data.analytics.avgVideoLength}
              </h4>
              <p className={styles.retentionText}>
                Catalog analysis indicates uploads within the {data.analytics.avgVideoLength}{' '}
                window sustain maximum completion ratios and relative performance index. Videos
                outside this range require structured chapter signposts.
              </p>
            </div>
          </div>

          {/* Top Performing Uploads Grid */}
          <TopVideos videos={data.videos} />
        </>
      )}
    </div>
  );
}
