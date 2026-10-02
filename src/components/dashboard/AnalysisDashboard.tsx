'use client';

import { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, ArrowLeft, ArrowRight, ChartNoAxesCombined, ChevronDown, Info, LayoutGrid, Mic, Play, RefreshCw, TrendingUp } from 'lucide-react';
import { useAnalysis } from '@/hooks/useAnalysis';
import { ChannelOverview } from './ChannelOverview';
import { Verdict } from './Verdict';
import { KpiStrip } from './KpiStrip';
import { Recommendations } from './Recommendations';
import { TitleLab } from './TitleLab';
import { TranscriptLab } from './TranscriptLab';
import { VideoTable } from './VideoTable';
import { ContentThemes } from '@/components/charts/ContentThemes';
import { ViewsDistribution } from '@/components/charts/ViewsDistribution';
import { PublishingTimeline } from '@/components/charts/PublishingTimeline';
import { LengthVsViews } from '@/components/charts/LengthVsViews';
import { VideoPlayerModal } from './VideoPlayerModal';
import { GrowthPlaybook } from './GrowthPlaybook';
import Loading from '@/app/analyze/[channelId]/loading';
import styles from '@/app/analyze/[channelId]/page.module.css';

const TABS = [
  { id: 'overview', label: 'At a glance', Icon: LayoutGrid },
  { id: 'patterns', label: 'Content patterns', Icon: ChartNoAxesCombined },
  { id: 'transcripts', label: 'Hook & Script Lab', Icon: Mic },
  { id: 'uploads', label: 'All uploads', Icon: Play },
] as const;
type ReportTab = typeof TABS[number]['id'];

export const AnalysisDashboard = ({ channelId, isDemo }: { channelId: string; isDemo: boolean }) => {
  const { data, isLoading, error, refetch } = useAnalysis(channelId, isDemo);
  const [activeTab, setActiveTab] = useState<ReportTab>('overview');
  const [activeModalVideo, setActiveModalVideo] = useState<{
    videoId: string;
    title: string;
    initialSeconds?: number;
  } | null>(null);
  if (isLoading) return <Loading />;
  if (error || !data) return (
    <div className={styles.pageContainer}>
      <section className={styles.errorPanel} role="alert">
        <span className={styles.errorIcon}><AlertCircle size={26} /></span>
        <h1 className={styles.errorTitle}>No signal. Let’s try again.</h1>
        <p className={styles.errorDesc}>{error || 'No analysis is available for this channel.'}</p>
        <div className={styles.errorActions}>
          <button type="button" className={styles.btnSecondary} onClick={refetch}><RefreshCw size={14} /> Try again</button>
          <Link href="/analyze/mkbhd?demo=true" className={styles.btnPrimary}>Explore a sample <ArrowRight size={14} /></Link>
        </div>
        <Link href="/" className={styles.backLink}><ArrowLeft size={13} /> Search another channel</Link>
      </section>
    </div>
  );
  const sample = data.meta.dataSource === 'sample';
  const nextView = () => {
    setActiveTab('patterns');
    document.getElementById('tab-patterns')?.focus();
    document.getElementById('report-tabs')?.scrollIntoView({ block: 'start' });
  };
  return (
    <div className={styles.pageContainer}>
      <div className={styles.dashboard}>
        <div className={`${styles.breadcrumb} no-print`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><Link href="/">Workspace</Link><span>/</span><span>Channel report</span><span className={styles.reportLabel}>THE SIGNAL REPORT</span></div>
          <Link href={`/compare?c1=${encodeURIComponent(data.channel.handle || data.channel.channelId)}`} style={{ color: 'var(--accent)', textDecoration: 'none', fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <TrendingUp size={12} /> Compare with another creator
          </Link>
        </div>
        <ChannelOverview channel={data.channel} meta={data.meta} data={data} />
        <details className={styles.notice}>
          <summary><Info size={14} /><span>{sample ? 'Sample report · illustrative data, not live channel stats' : `Public-data snapshot · ${data.videos.length} uploads, not the full channel history`}</span><span className={styles.noticeMore}>About the data</span><ChevronDown size={13} /></summary>
          <p>{data.meta.notice} {sample ? 'Metrics use only the supplied sample uploads.' : 'Views are cumulative; older videos have had more time to accumulate them.'} {data.meta.analysisSource === 'gemini' ? 'Interpretations are Gemini-assisted.' : 'Interpretations are calculated, not AI-generated.'}</p>
        </details>
        <div id="report-tabs" className={`${styles.tabBar} no-print`}>
          <div role="tablist" aria-label="Report views" className={styles.tabs}>
            {TABS.map(({ id, label, Icon }, index) => <button key={id} type="button" role="tab" id={`tab-${id}`} aria-selected={activeTab === id} aria-controls={`panel-${id}`} tabIndex={activeTab === id ? 0 : -1}
              onClick={() => setActiveTab(id)} onKeyDown={(event) => {
                let target = index;
                if (event.key === 'ArrowRight') target = (index + 1) % TABS.length;
                else if (event.key === 'ArrowLeft') target = (index + TABS.length - 1) % TABS.length;
                else if (event.key === 'Home') target = 0;
                else if (event.key === 'End') target = TABS.length - 1;
                else return;
                event.preventDefault(); setActiveTab(TABS[target].id); document.getElementById(`tab-${TABS[target].id}`)?.focus();
              }}><Icon size={15} /><span>{label}</span>{id === 'uploads' && <span className={styles.tabCount}>{data.videos.length}</span>}</button>)}
          </div>
          <span className={styles.tabHint}>The overview first. The details when you need them.</span>
        </div>
        <div key={activeTab} id={`panel-${activeTab}`} role="tabpanel" aria-labelledby={`tab-${activeTab}`} tabIndex={0} className={styles.view}>
          {activeTab === 'overview' && <>
            <Verdict
              data={data}
              onWatchVideo={(videoId, title) =>
                setActiveModalVideo({ videoId, title, initialSeconds: 0 })
              }
            />
            <KpiStrip channel={data.channel} analytics={data.analytics} videos={data.videos} />
            {data.videos.length > 0 && (
              <GrowthPlaybook
                videos={data.videos}
                medianViews={data.analytics.medianViews}
                aiAnalysis={data.aiAnalysis}
              />
            )}
            {data.videos.length > 0 && <div className={styles.grid7_5}><ViewsDistribution data={data.chartData.viewsDistribution} medianViews={data.analytics.medianViews} /><Recommendations analysis={data.aiAnalysis} source={data.meta.analysisSource} /></div>}
            {data.videos.length > 0 && <button type="button" className={`${styles.continueButton} no-print`} onClick={nextView}><span><ChartNoAxesCombined size={18} /><span>Curious about the pattern?<small>Explore titles, video length and publishing pace.</small></span></span><ArrowRight size={18} /></button>}
          </>}
          {activeTab === 'patterns' && <>
            <div className={styles.viewHeading}><span>CONNECT THE DOTS</span><h2>A closer look at the craft.</h2><p>How this channel packages and publishes its content.</p></div>
            <TitleLab patterns={data.aiAnalysis.titlePatterns} />
            <div className={styles.chartGrid}><LengthVsViews data={data.chartData.lengthVsViews} /><PublishingTimeline data={data.chartData.publishingTimeline} /></div>
            {data.aiAnalysis.contentThemes.length > 0 && <ContentThemes data={data.chartData.contentThemes} />}
          </>}
          {activeTab === 'transcripts' && (
            <TranscriptLab
              videos={data.videos}
              channelName={data.channel.name}
              isDemo={sample}
              onWatchVideo={(videoId, title, initialSeconds) =>
                setActiveModalVideo({ videoId, title, initialSeconds: initialSeconds || 0 })
              }
            />
          )}
          {activeTab === 'uploads' && <>
            <div className={styles.viewHeading}><span>THE SOURCE MATERIAL</span><h2>Every upload. In perspective.</h2><p>Compare the videos behind the numbers, ranked by public views.</p></div>
            <VideoTable
              videos={data.videos}
              medianViews={data.analytics.medianViews}
              isSample={sample}
              onWatchVideo={(videoId, title) =>
                setActiveModalVideo({ videoId, title, initialSeconds: 0 })
              }
            />
          </>}
          {data.videos.length === 0 && <section className={styles.emptyPanel}><h2>No public uploads were returned</h2><p>There isn’t enough data to compare videos. Try another channel or return later.</p><Link href="/" className={styles.backLink}><ArrowLeft size={13} /> Find another creator</Link></section>}
        </div>
        <details className={styles.methodNote}><summary>What this report can (and can’t) tell you</summary><p>Comparisons apply only to these {data.videos.length} uploads. Views are not adjusted for video age. Public metadata cannot establish retention, click-through rate, revenue, or why a video performed well. {data.meta.analysisSource === 'gemini' ? 'Gemini suggestions are interpretations, not proven causes.' : 'This report uses calculated observations, not an AI-generated analysis.'}</p></details>

        {activeModalVideo && (
          <VideoPlayerModal
            videoId={activeModalVideo.videoId}
            videoTitle={activeModalVideo.title}
            initialSeconds={activeModalVideo.initialSeconds || 0}
            onClose={() => setActiveModalVideo(null)}
          />
        )}
      </div>
    </div>
  );
};
