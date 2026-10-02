'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Check, ChevronDown, Copy, Download, FileCode, FileText, Link2, Share2, Sparkles, X } from 'lucide-react';
import type { ChannelData, FullAnalysisResponse } from '@/types/analysis';
import { generateReport, generateHtmlDossier, downloadFile, buildShareText, buildMarkdownSummary } from '@/utils/report-generator';
import styles from './ChannelOverview.module.css';

type Toast = { message: string; type: 'success' | 'info' };

export const ChannelOverview = ({ channel, meta, data }: { channel: ChannelData; meta: FullAnalysisResponse['meta']; data?: FullAnalysisResponse }) => {
  const [failedAvatar, setFailedAvatar] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [shareOpen, setShareOpen] = useState(false);
  const [exportOpen, setExportOpen] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const sample = meta.dataSource === 'sample';

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(e.target as Node)) setShareOpen(false);
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) setExportOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const showToast = useCallback((message: string, type: Toast['type'] = 'success') => setToast({ message, type }), []);

  // ═══ Share Actions ═══
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      showToast('Report URL copied to clipboard');
    } catch {
      showToast('Could not copy — URL is in your browser bar', 'info');
    }
    setShareOpen(false);
  };

  const copySummaryCard = async () => {
    if (!data) return;
    try {
      const summary = buildMarkdownSummary(channel, data.analytics, data.aiAnalysis);
      await navigator.clipboard.writeText(summary);
      showToast('Channel brief copied! Ready to paste into Slack/Notion');
    } catch {
      showToast('Could not copy summary', 'info');
    }
    setShareOpen(false);
  };

  const nativeShare = async () => {
    if (!data) return;
    try {
      await navigator.share({
        title: `TubeSignal: ${channel.name} Analysis`,
        text: buildShareText(channel, data.analytics),
        url: window.location.href,
      });
    } catch (e) {
      if ((e as DOMException).name !== 'AbortError') {
        showToast('Share cancelled', 'info');
      }
    }
    setShareOpen(false);
  };

  const shareToX = () => {
    if (!data) return;
    const text = buildShareText(channel, data.analytics);
    const url = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setShareOpen(false);
  };

  const shareToLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    setShareOpen(false);
  };

  const canNativeShare = typeof navigator !== 'undefined' && !!navigator.share;

  // ═══ Export Actions ═══
  const cleanSlug = channel.handle?.replace('@', '') || channel.name.toLowerCase().replace(/[^a-z0-9]/g, '-');

  const downloadHtmlReport = () => {
    if (!data) return;
    const html = generateHtmlDossier(data);
    const filename = `tubesignal-${cleanSlug}-dossier.html`;
    downloadFile(html, filename, 'text/html');
    showToast('Executive HTML Dossier downloaded');
    setExportOpen(false);
  };

  const downloadMarkdown = () => {
    if (!data) return;
    const report = generateReport(data);
    const filename = `tubesignal-${cleanSlug}-report.md`;
    downloadFile(report, filename, 'text/markdown');
    showToast('Report downloaded as Markdown');
    setExportOpen(false);
  };

  const downloadJSON = () => {
    if (!data) return;
    const filename = `tubesignal-${cleanSlug}-data.json`;
    downloadFile(JSON.stringify(data, null, 2), filename, 'application/json');
    showToast('Structured data downloaded as JSON');
    setExportOpen(false);
  };

  return (
    <section className={styles.headerRow} aria-label="Channel report">
      <div className={styles.left}>
        <div className={styles.avatarWrapper}>
          {!failedAvatar && channel.avatar && !sample ? (
            <Image unoptimized src={channel.avatar} width={48} height={48} alt="" className={styles.avatar} onError={() => setFailedAvatar(true)} />
          ) : (
            <span aria-hidden="true">{channel.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join('')}</span>
          )}
        </div>
        <div className={styles.info}>
          <div className={styles.titleLine}>
            <h1 className={styles.channelName}>{channel.name}</h1>
            <span className={`${styles.sourceTag} ${sample ? '' : styles.liveTag}`}>
              {sample ? 'Sample report' : 'Live YouTube data'}
            </span>
          </div>
          <div className={styles.metaLine}>
            <span className={styles.handle}>{channel.handle || channel.channelId}</span>
            <span aria-hidden="true">·</span>
            <span>{channel.totalVideosAnalyzed} uploads analyzed</span>
          </div>
          <p className={styles.timestamp}>
            {sample ? 'Illustrative data' : `Retrieved ${new Date(meta.generatedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}`} · {meta.analysisSource === 'gemini' ? 'Gemini-assisted interpretation' : 'Calculated observations'}
          </p>
        </div>
      </div>

      <div className={`${styles.actions} no-print`}>
        {/* Share dropdown */}
        <div ref={shareRef} className={styles.dropdown}>
          <button type="button" className={styles.actionBtn} onClick={() => { setShareOpen(!shareOpen); setExportOpen(false); }}>
            <Share2 size={14} /> Share <ChevronDown size={12} className={`${styles.chevron} ${shareOpen ? styles.chevronOpen : ''}`} />
          </button>
          {shareOpen && (
            <div className={styles.dropdownMenu} role="menu">
              <button role="menuitem" onClick={copyLink}>
                <Link2 size={14} /> Copy report link
              </button>
              <button role="menuitem" onClick={copySummaryCard}>
                <Sparkles size={14} /> Copy brief summary card
              </button>
              {canNativeShare && (
                <button role="menuitem" onClick={nativeShare}>
                  <Share2 size={14} /> Share via…
                </button>
              )}
              <button role="menuitem" onClick={shareToX}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                Post on X (Twitter)
              </button>
              <button role="menuitem" onClick={shareToLinkedIn}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/></svg>
                Post on LinkedIn
              </button>
            </div>
          )}
        </div>

        {/* Export / Save dropdown */}
        <div ref={exportRef} className={styles.dropdown}>
          <button type="button" className={`${styles.actionBtn} ${styles.exportBtn}`} onClick={() => { setExportOpen(!exportOpen); setShareOpen(false); }}>
            <Download size={14} /> Save Dossier <ChevronDown size={12} className={`${styles.chevron} ${exportOpen ? styles.chevronOpen : ''}`} />
          </button>
          {exportOpen && (
            <div className={styles.dropdownMenu} role="menu">
              <button role="menuitem" onClick={downloadHtmlReport}>
                <FileCode size={14} /> Download HTML Dossier (.html)
              </button>
              <button role="menuitem" onClick={downloadMarkdown}>
                <FileText size={14} /> Download Markdown (.md)
              </button>
              <button role="menuitem" onClick={downloadJSON}>
                <Copy size={14} /> Download Raw Data (.json)
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Toast notification */}
      {toast && (
        <div className={`${styles.toast} ${styles[toast.type]}`} role="status">
          <span>{toast.type === 'success' ? <Check size={14} /> : null} {toast.message}</span>
          <button type="button" onClick={() => setToast(null)} aria-label="Dismiss"><X size={13} /></button>
        </div>
      )}
    </section>
  );
};
