'use client';

import React, { use } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useAnalysis } from '@/hooks/useAnalysis';
import { ChannelOverview } from '@/components/dashboard/ChannelOverview';
import { AIBrief } from '@/components/dashboard/AIBrief';
import { ViewsDistribution } from '@/components/charts/ViewsDistribution';
import { ContentThemes } from '@/components/charts/ContentThemes';
import { PublishingTimeline } from '@/components/charts/PublishingTimeline';
import { LengthVsViews } from '@/components/charts/LengthVsViews';
import { TopVideos } from '@/components/dashboard/TopVideos';
import { Button } from '@/components/ui/Button';
import Loading from './loading';
import {
  ArrowLeft,
  Share2,
  Download,
  AlertCircle,
  RefreshCw,
  Zap,
} from 'lucide-react';
import styles from './page.module.css';

interface PageProps {
  params: Promise<{
    channelId: string;
  }>;
}

export default function AnalyzePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const searchParams = useSearchParams();
  const isDemoParam = searchParams.get('demo') === 'true';

  const channelId = decodeURIComponent(resolvedParams.channelId);
  const { data, isLoading, error, refetch, isDemoMode, toggleDemoMode } =
    useAnalysis(channelId, isDemoParam);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      alert('Report link copied to clipboard!');
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  if (error || !data) {
    return (
      <div className={styles.container}>
        <div className={styles.errorCard}>
          <div className={styles.errorIcon}>
            <AlertCircle size={24} />
          </div>
          <h2 className={styles.errorTitle}>Analysis Unavailable</h2>
          <p className={styles.errorMsg}>
            {error || 'Unable to load channel analysis. Please check your SerpApi key or try Demo Mode.'}
          </p>
          <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
            <Button variant="secondary" onClick={() => refetch()} leftIcon={<RefreshCw size={14} />}>
              Try Again
            </Button>
            <Button variant="primary" onClick={toggleDemoMode} leftIcon={<Zap size={14} />}>
              Switch to Demo Mode
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Top Navigation & Actions Bar */}
      <div className={styles.topBar}>
        <Link href="/" className={styles.backBtn}>
          <ArrowLeft size={16} />
          <span>New Channel Search</span>
        </Link>

        <div className={styles.actionsRight}>
          <button
            type="button"
            className={`${styles.demoToggleBtn} ${
              isDemoMode ? styles.demoToggleBtnActive : ''
            }`}
            onClick={toggleDemoMode}
          >
            <Zap size={14} />
            <span>{isDemoMode ? 'Demo Mode Active' : 'Live SerpApi Mode'}</span>
          </button>

          <button type="button" className={styles.actionBtn} onClick={handleShare}>
            <Share2 size={14} />
            <span>Share</span>
          </button>

          <button type="button" className={styles.actionBtn} onClick={handlePrint}>
            <Download size={14} />
            <span>Export Brief</span>
          </button>
        </div>
      </div>

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

      {/* Core Distribution & Cadence Charts */}
      <div className={styles.equalGrid}>
        <ViewsDistribution data={data.chartData.viewsDistribution} />
        <PublishingTimeline data={data.chartData.publishingTimeline} />
      </div>

      {/* Deep Analytics Scatter Plot */}
      <div className={styles.equalGrid}>
        <LengthVsViews data={data.chartData.lengthVsViews} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          <div
            style={{
              background: 'var(--color-surface-glass)',
              border: '1px solid var(--color-surface-border)',
              borderRadius: 'var(--radius-xl)',
              padding: 'var(--space-6)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: 'var(--space-3)',
            }}
          >
            <span
              style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--weight-semibold)',
                color: 'var(--color-accent-hover)',
                textTransform: 'uppercase',
                letterSpacing: 'var(--tracking-wider)',
              }}
            >
              Audience Retention Synthesis
            </span>
            <h4 style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-bold)' }}>
              Optimal Length: {data.analytics.avgVideoLength}
            </h4>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)', lineHeight: '1.6' }}>
              Videos clustering near the {data.analytics.avgVideoLength} duration show higher
              relative share rates and above-median view counts. Avoid outlier durations without
              strong narrative hooks.
            </p>
          </div>
        </div>
      </div>

      {/* Top Performing Uploads */}
      <TopVideos videos={data.videos} />
    </div>
  );
}
