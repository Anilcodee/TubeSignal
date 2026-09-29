'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAnalysis } from '@/hooks/useAnalysis';
import { ChannelOverview } from '@/components/dashboard/ChannelOverview';
import { Battlecard } from '@/components/dashboard/Battlecard';
import { TitleLab } from '@/components/dashboard/TitleLab';
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
  LayoutDashboard,
  Type,
  TrendingUp,
  Video,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import styles from './page.module.css';

const PRESET_CHANNELS = [
  { label: 'Marques Brownlee', id: 'mkbhd', handle: '@mkbhd' },
  { label: 'Fireship', id: 'fireship', handle: '@fireship' },
  { label: 'Veritasium', id: 'veritasium', handle: '@veritasium' },
];

type ViewTab = 'overview' | 'title-lab' | 'growth' | 'catalog';

export default function WorkspacePage() {
  const [selectedChannel, setSelectedChannel] = useState('mkbhd');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<ViewTab>('overview');
  const searchInputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading, error, refetch, isDemoMode, toggleDemoMode } =
    useAnalysis(selectedChannel, false);

  // Keyboard shortcut ⌘K / Ctrl+K focus on search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
      alert('Workspace link copied to clipboard!');
    }
  };

  return (
    <div className={styles.workspace}>
      {/* Command Station / Omnibar */}
      <div className={styles.commandStation}>
        <form className={styles.searchRow} onSubmit={handleSearchSubmit}>
          <div className={styles.omnibar}>
            <Search size={14} className={styles.searchIcon} />
            <input
              ref={searchInputRef}
              type="text"
              className={styles.searchInput}
              placeholder="Search or inspect any YouTube creator (e.g. mkbhd, fireship, veritasium)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <span className={styles.kbd}>⌘K</span>
          </div>
          <button type="submit" className={styles.analyzeBtn} disabled={isLoading || !searchQuery.trim()}>
            <Sparkles size={13} />
            <span>Analyze</span>
          </button>
        </form>

        <div className={styles.channelsRow}>
          <div className={styles.pillGroup}>
            <span className={styles.pillsLabel}>Dossiers:</span>
            {PRESET_CHANNELS.map((ch) => (
              <button
                key={ch.id}
                type="button"
                className={`${styles.pillBtn} ${
                  selectedChannel === ch.id ? styles.pillBtnActive : ''
                }`}
                onClick={() => handlePillSelect(ch.id)}
              >
                <span>{ch.handle}</span>
              </button>
            ))}
          </div>

          <div className={styles.actionGroup}>
            <button
              type="button"
              className={`${styles.actionBtn} ${isDemoMode ? styles.pillBtnActive : ''}`}
              onClick={toggleDemoMode}
              title="Toggle between cached dataset and live SerpApi API calls"
            >
              <Zap size={11} />
              <span>{isDemoMode ? 'Demo Dataset' : 'Live SerpApi'}</span>
            </button>

            <button type="button" className={styles.actionBtn} onClick={handleShare}>
              <Share2 size={11} />
              <span>Share</span>
            </button>

            <button type="button" className={styles.actionBtn} onClick={handlePrint}>
              <Download size={11} />
              <span>Export</span>
            </button>
          </div>
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
            boxShadow: 'var(--shadow-panel), var(--shadow-tactile)',
          }}
        >
          <AlertCircle size={24} color="#f43f5e" />
          <h3 style={{ fontSize: 'var(--text-base)', fontWeight: 'var(--weight-bold)' }}>
            Channel Analysis Unavailable
          </h3>
          <p style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)', lineHeight: '1.5' }}>
            {error || 'Unable to retrieve metrics. Verify channel identifier or switch to Demo Dataset.'}
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
            <Button variant="secondary" size="sm" onClick={() => refetch()} leftIcon={<RefreshCw size={13} />}>
              Retry Query
            </Button>
            <Button variant="primary" size="sm" onClick={toggleDemoMode} leftIcon={<Zap size={13} />}>
              Load Cached Dataset
            </Button>
          </div>
        </div>
      )}

      {/* Active Intelligence Workspace */}
      {!isLoading && data && (
        <>
          {/* Header Overview Card */}
          <ChannelOverview
            channel={data.channel}
            analytics={data.analytics}
            isDemo={isDemoMode}
          />

          {/* Segmented Workspace Tabs */}
          <div className={styles.tabNav}>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === 'overview' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <LayoutDashboard size={13} />
              <span>Strategic Overview</span>
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === 'title-lab' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('title-lab')}
            >
              <Type size={13} />
              <span>Title & Hook Lab</span>
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === 'growth' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('growth')}
            >
              <TrendingUp size={13} />
              <span>Growth & Cadence</span>
            </button>
            <button
              type="button"
              className={`${styles.tabBtn} ${activeTab === 'catalog' ? styles.tabBtnActive : ''}`}
              onClick={() => setActiveTab('catalog')}
            >
              <Video size={13} />
              <span>Catalog Explorer ({data.videos.length})</span>
            </button>
          </div>

          {/* Tab 1: Strategic Overview */}
          {activeTab === 'overview' && (
            <div className={styles.viewContainer}>
              <div className={styles.twoColGrid}>
                <Battlecard analysis={data.aiAnalysis} channelName={data.channel.name} />
                <ContentThemes data={data.chartData.contentThemes} />
              </div>

              <div className={styles.equalGrid}>
                <ViewsDistribution data={data.chartData.viewsDistribution} />
                <PublishingTimeline data={data.chartData.publishingTimeline} />
              </div>

              <TopVideos videos={data.videos.slice(0, 4)} />
            </div>
          )}

          {/* Tab 2: Title & Hook Lab */}
          {activeTab === 'title-lab' && (
            <div className={styles.viewContainer}>
              <TitleLab patterns={data.aiAnalysis.titlePatterns} />
            </div>
          )}

          {/* Tab 3: Growth & Cadence */}
          {activeTab === 'growth' && (
            <div className={styles.viewContainer}>
              <div className={styles.equalGrid}>
                <PublishingTimeline data={data.chartData.publishingTimeline} />
                <LengthVsViews data={data.chartData.lengthVsViews} />
              </div>

              <div className={styles.retentionCard}>
                <span className={styles.retentionLabel}>Audience Retention Synthesis</span>
                <h4 className={styles.retentionTitle}>
                  Target Video Duration: {data.analytics.avgVideoLength}
                </h4>
                <p className={styles.retentionText}>
                  Statistical clustering reveals videos published near {data.analytics.avgVideoLength} sustain
                  the highest algorithmic recommendation probability. Videos exceeding 20+ minutes require
                  strong chapter structuring to prevent mid-roll abandonment.
                </p>
              </div>
            </div>
          )}

          {/* Tab 4: Catalog Explorer */}
          {activeTab === 'catalog' && (
            <div className={styles.viewContainer}>
              <TopVideos videos={data.videos} />
            </div>
          )}
        </>
      )}
    </div>
  );
}
