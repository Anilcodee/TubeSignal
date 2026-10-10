'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, ArrowLeft, ArrowRight, ChartNoAxesCombined, ChevronDown, Info, LayoutGrid, Mic, Play, RefreshCw, TrendingUp } from 'lucide-react';
import { useAnalysis } from '@/hooks/useAnalysis';
import { ChannelOverview } from './ChannelOverview';
import { KpiStrip } from './KpiStrip';
import { Recommendations } from './Recommendations';
import { TitleLab } from './TitleLab';
import { TranscriptLab } from './TranscriptLab';
import { VideoTable } from './VideoTable';
import { ContentThemes } from '@/components/charts/ContentThemes';
import { ViewsDistribution } from '@/components/charts/ViewsDistribution';
import { PublishingTimeline } from '@/components/charts/PublishingTimeline';
import { LengthVsViews } from '@/components/charts/LengthVsViews';
import { InPageVideoTheater } from './InPageVideoTheater';
import { GrowthPlaybook } from './GrowthPlaybook';
import { ReportPulse } from './ReportPulse';
import Loading from '@/app/analyze/[channelId]/loading';
import styles from '@/app/analyze/[channelId]/page.module.css';

const TABS = [
  { id: 'overview', label: 'At a glance', shortLabel: 'Overview', description: 'Decide what matters', step: '01', Icon: LayoutGrid },
  { id: 'patterns', label: 'Content patterns', shortLabel: 'Patterns', description: 'Find what repeats', step: '02', Icon: ChartNoAxesCombined },
  { id: 'transcripts', label: 'Hook & Script Lab', shortLabel: 'Hooks', description: 'Study the opening', step: '03', Icon: Mic },
  { id: 'uploads', label: 'Videos', shortLabel: 'Videos', description: 'Verify the evidence', step: '04', Icon: Play },
] as const;
type ReportTab = typeof TABS[number]['id'];
const isReportTab = (value: string | null): value is ReportTab => TABS.some((tab) => tab.id === value);

export const AnalysisDashboard = ({ channelId, isDemo }: { channelId: string; isDemo: boolean }) => {
  const { data, isLoading, error, refetch } = useAnalysis(channelId, isDemo);
  const router = useRouter();
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get('tab');
  const initialTab: ReportTab = isReportTab(requestedTab) ? requestedTab : 'overview';
  const [selectedTab, setSelectedTab] = useState<ReportTab>(initialTab);
  const activeTab: ReportTab = isReportTab(requestedTab) ? requestedTab : selectedTab;
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
         <h1 className={styles.errorTitle}>We couldn’t build this report yet.</h1>
         <p className={styles.errorDesc}>{error || 'No report is available for this channel right now.'}</p>
        <div className={styles.errorActions}>
          <button type="button" className={styles.btnSecondary} onClick={refetch}><RefreshCw size={14} /> Try again</button>
           <Link href="/analyze/mkbhd?demo=true" className={styles.btnPrimary}>Open a sample report <ArrowRight size={14} /></Link>
        </div>
        <Link href="/" className={styles.backLink}><ArrowLeft size={13} /> Search another channel</Link>
      </section>
    </div>
  );
  const sample = data.meta.dataSource === 'sample';
  const handleTabChange = (targetTab: ReportTab) => {
    setSelectedTab(targetTab);
    setActiveModalVideo(null);
    const params = new URLSearchParams(searchParams.toString());
    if (targetTab === 'overview') params.delete('tab');
    else params.set('tab', targetTab);
    if (isDemo) params.set('demo', 'true');
    const query = params.toString();
    router.replace(`/analyze/${encodeURIComponent(channelId)}${query ? `?${query}` : ''}`, { scroll: false });
  };
  const nextView = () => {
    handleTabChange('patterns');
    document.getElementById('tab-patterns')?.focus();
    document.getElementById('report-tabs')?.scrollIntoView({ block: 'start' });
  };
  return (
    <div className={styles.pageContainer}>
        <div className={styles.dashboard}>
        <div className={`${styles.breadcrumb} ${styles.breadcrumbRow} no-print`}>
          <div className={styles.breadcrumbPath}>
            <Link href="/">Workspace</Link><span>/</span><span>Channel report</span><span className={styles.reportLabel}>Channel report</span>
          </div>
          <div className={styles.breadcrumbMeta}>
            <span className={styles.provenancePill}>
              <span
                className={`${styles.provenanceDot} ${sample ? styles.sampleDot : styles.liveDot}`}
                aria-hidden="true"
              />
              {sample ? 'Illustrative sample' : 'Public YouTube data'} • {data.videos.length} videos
            </span>
            <Link href={`/compare?c1=${encodeURIComponent(data.channel.handle || data.channel.channelId)}`} className={styles.compareLink}>
              <TrendingUp size={13} /> Compare with another creator
            </Link>
          </div>
        </div>
        <ChannelOverview channel={data.channel} meta={data.meta} data={data} />
        <details className={styles.notice}>
          <summary><Info size={14} /><span>{sample ? 'Illustrative sample · use it to explore the report' : `Public-data snapshot · ${data.videos.length} recent videos`}</span><span className={styles.noticeMore}>How to read the numbers</span><ChevronDown size={13} /></summary>
          <p>{data.meta.notice} {sample ? 'The numbers come from the sample videos shown here.' : 'Views are lifetime totals, so older videos have had more time to collect views.'} {data.meta.analysisSource === 'gemini' ? 'Written explanations are AI-assisted.' : 'Written explanations are calculated from the available data.'}</p>
        </details>
         <ReportPulse
           data={data}
           onExplorePatterns={() => {
             handleTabChange('patterns');
             document.getElementById('tab-patterns')?.focus();
             document.getElementById('report-tabs')?.scrollIntoView({ block: 'start' });
           }}
         />
         <div id="report-tabs" className={`${styles.tabBar} no-print`}>
           <div role="tablist" aria-label="Report views" className={styles.tabs}>
             {TABS.map(({ id, label, shortLabel, description, step, Icon }, index) => <button key={id} type="button" role="tab" id={`tab-${id}`} aria-label={`${label} — ${description}`} aria-selected={activeTab === id} aria-controls={`panel-${id}`} tabIndex={activeTab === id ? 0 : -1}
               onClick={() => handleTabChange(id)} onKeyDown={(event) => {
                let target = index;
                if (event.key === 'ArrowRight') target = (index + 1) % TABS.length;
                else if (event.key === 'ArrowLeft') target = (index + TABS.length - 1) % TABS.length;
                else if (event.key === 'Home') target = 0;
                else if (event.key === 'End') target = TABS.length - 1;
                else return;
                event.preventDefault(); handleTabChange(TABS[target].id); document.getElementById(`tab-${TABS[target].id}`)?.focus();
               }}><span className={styles.tabStep}>{step}</span><Icon size={14} className={styles.tabIcon} /><span className={styles.tabCopy}><span className={styles.tabLabel}>{label}</span><span className={styles.tabLabelShort}>{shortLabel}</span><small>{description}</small></span>{id === 'uploads' && <span className={styles.tabCount}>{data.videos.length}</span>}</button>)}
           </div>
         </div>
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab} 
            id={`panel-${activeTab}`} 
            role="tabpanel" 
            aria-labelledby={`tab-${activeTab}`} 
            tabIndex={0} 
            className={styles.view}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
          >
            {activeTab === 'overview' && <>
             <KpiStrip channel={data.channel} analytics={data.analytics} videos={data.videos} />
             {data.videos.length > 0 && <div className={styles.grid7_5}><ViewsDistribution data={data.chartData.viewsDistribution} medianViews={data.analytics.medianViews} /><Recommendations analysis={data.aiAnalysis} source={data.meta.analysisSource} /></div>}
             {data.videos.length > 0 && <button type="button" className={`${styles.continueButton} no-print`} onClick={nextView}><span><ChartNoAxesCombined size={18} /><span>Want to understand the pattern?<small>Compare titles, video length, topics, and publishing pace.</small></span></span><ArrowRight size={18} /></button>}
          </>}
           {activeTab === 'patterns' && <>
              <div className={styles.viewHeading}><div className={styles.viewHeadingCopy}><span>PACKAGING AND TIMING</span><h2>What repeats across the videos?</h2><p>Find the repeatable lever behind performance, then turn it into one testable idea.</p></div><span className={styles.viewOutcome}>Leave with one pattern to reuse</span></div>
             {data.videos.length > 0 && (
               <GrowthPlaybook
                 videos={data.videos}
                 medianViews={data.analytics.medianViews}
                 aiAnalysis={data.aiAnalysis}
               />
             )}
             <TitleLab
              patterns={data.aiAnalysis.titlePatterns}
              videos={data.videos}
              medianViews={data.analytics.medianViews}
            />
            <div className={styles.chartGrid}><LengthVsViews data={data.chartData.lengthVsViews} /><PublishingTimeline data={data.chartData.publishingTimeline} /></div>
            {data.aiAnalysis.contentThemes.length > 0 && <ContentThemes data={data.chartData.contentThemes} />}
            <button
              type="button"
              className={`${styles.continueButton} no-print`}
              onClick={() => {
                handleTabChange('transcripts');
                document.getElementById('tab-transcripts')?.focus();
                document.getElementById('report-tabs')?.scrollIntoView({ block: 'start' });
              }}
            >
              <span>
                <Mic size={18} />
                 <span>Want to study the opening?<small>See how the strongest videos begin and what they say first.</small></span>
              </span>
              <ArrowRight size={18} />
            </button>
          </>}
          {activeTab === 'transcripts' && (
            <>
              <TranscriptLab
                key={data.channel.channelId}
                videos={data.videos}
                channelName={data.channel.name}
                isDemo={sample}
                onPlayStart={() => setActiveModalVideo(null)}
              />
              <button
                type="button"
                className={`${styles.continueButton} no-print`}
                onClick={() => {
                  handleTabChange('uploads');
                  document.getElementById('tab-uploads')?.focus();
                  document.getElementById('report-tabs')?.scrollIntoView({ block: 'start' });
                }}
              >
                <span>
                  <Play size={18} />
                   <span>Ready to see every video?<small>Compare the uploads side by side and open the original video.</small></span>
                </span>
                <ArrowRight size={18} />
              </button>
            </>
          )}
           {activeTab === 'uploads' && <>
              <div className={styles.viewHeading}><div className={styles.viewHeadingCopy}><span>THE SOURCE VIDEOS</span><h2>Every video, side by side.</h2><p>Use the source list to validate the story, spot outliers, and choose the next upload to study.</p></div><span className={styles.viewOutcome}>Verify before you copy</span></div>
            {activeModalVideo && (
              <InPageVideoTheater
                videoId={activeModalVideo.videoId}
                videoTitle={activeModalVideo.title}
                initialSeconds={activeModalVideo.initialSeconds || 0}
                onClose={() => setActiveModalVideo(null)}
              />
            )}
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
          </motion.div>
        </AnimatePresence>
        <details className={styles.methodNote}>
           <summary>How this report is made</summary>
          <p>
             This report looks at the latest <strong>{data.videos.length} public videos</strong> to find patterns in titles, length, topics, timing, and openings.
             Public YouTube data can show views and publishing history, but not private metrics such as audience retention, click-through rate, or revenue.
             {data.meta.analysisSource === 'gemini' ? ' The written explanations are assisted by AI.' : ' The written explanations are calculated from the available data.'}
          </p>
        </details>
       </div>
    </div>
  );
};
