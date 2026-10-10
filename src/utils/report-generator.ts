import type { FullAnalysisResponse } from '@/types/analysis';
import { formatViews } from './format';

/** Generate a clean, readable markdown report from analysis data. */
export function generateReport(data: FullAnalysisResponse): string {
  const { channel, videos, analytics, aiAnalysis, meta } = data;
  const sample = meta.dataSource === 'sample';
  const observed = videos.filter((v) => v.viewsAvailable !== false && Number.isFinite(v.views) && v.views >= 0);
  const sorted = [...observed].sort((a, b) => b.views - a.views);
  const top5 = sorted.slice(0, 5);
  const date = new Date(meta.generatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const lines: string[] = [];
  const add = (...args: string[]) => lines.push(...args);

  // Header
  add(
     `# TubeSignal report: ${channel.name}`,
    ``,
    `> Generated on ${date}${sample ? ' (Sample report — illustrative data, not live stats)' : ''}`,
     `> Notes: ${meta.analysisSource === 'gemini' ? 'Written explanations assisted by AI' : 'Written explanations calculated from public data'}`,
    ``,
  );

  // Channel overview
  add(
     `## About this channel`,
    ``,
    `| Metric | Value |`,
    `|--------|-------|`,
    `| **Channel** | ${channel.name} |`,
    `| **Handle** | ${channel.handle || channel.channelId} |`,
    `| **Subscribers** | ${channel.subscribers || 'Unavailable'} |`,
     `| **Videos checked** | ${channel.totalVideosAnalyzed} |`,
    ``,
  );

  // Key Metrics
  add(
     `## At a glance`,
    ``,
    `| Metric | Value |`,
    `|--------|-------|`,
     `| **Average views** | ${analytics.avgViewsFormatted} |`,
     `| **Typical views** | ${formatViews(analytics.medianViews)} |`,
    `| **Total Views** | ${analytics.totalViewsFormatted} |`,
     `| **Uploads per week** | ${analytics.publishingFrequency} |`,
     `| **Average video length** | ${analytics.avgVideoLength} |`,
     `| **Typical video length** | ${analytics.medianVideoLength || 'Unavailable'} |`,
    ``,
  );

  // AI Summary
  add(
     `## Quick summary`,
    ``,
    aiAnalysis.summary,
    ``,
  );

  // Top Videos
  if (top5.length > 0) {
    add(
       `## Videos with the most views`,
      ``,
       `| # | Title | Views | vs Typical | Duration |`,
      `|---|-------|-------|-----------|----------|`,
    );
    top5.forEach((video, i) => {
      const delta = analytics.medianViews > 0
        ? `${video.views >= analytics.medianViews ? '+' : ''}${Math.round(((video.views - analytics.medianViews) / analytics.medianViews) * 100)}%`
        : '—';
      add(`| ${i + 1} | ${video.title} | ${formatViews(video.views)} | ${delta} | ${video.length} |`);
    });
    add(``);
  }

  // All videos table
  if (videos.length > 0) {
    add(
       `## All videos in this report (${videos.length})`,
      ``,
      `| Title | Views | Duration | Published |`,
      `|-------|-------|----------|-----------|`,
    );
    sorted.forEach((video) => {
      add(`| ${video.title} | ${formatViews(video.views)} | ${video.length} | ${video.publishedDate} |`);
    });
    // Add videos without views
    videos.filter((v) => !observed.includes(v)).forEach((video) => {
      add(`| ${video.title} | Unavailable | ${video.length} | ${video.publishedDate} |`);
    });
    add(``);
  }

  // Title Patterns
  if (aiAnalysis.titlePatterns) {
     add(`## Title patterns`, ``);
    add(`- **Average title length**: ${aiAnalysis.titlePatterns.avgLength} characters`);
    if (aiAnalysis.titlePatterns.commonPatterns.length > 0) {
      aiAnalysis.titlePatterns.commonPatterns.forEach((p) => add(`- ${p}`));
    }
    add(`- ${aiAnalysis.titlePatterns.useOfNumbers}`);
    add(``);
  }

  // Recommendations
  if (aiAnalysis.recommendations.length > 0) {
     add(`## Ideas to test`, ``);
    aiAnalysis.recommendations.forEach((rec, i) => {
      add(`${i + 1}. ${rec}`);
    });
    add(``);
  }

  // Footer
  add(
    `---`,
    ``,
     `*Based on public YouTube data and the videos included in this report.*`,
    `*Views are cumulative and not adjusted for video age. Covers recent analyzed uploads.*`,
  );

  return lines.join('\n');
}

/** Generate a self-contained, beautifully styled standalone HTML dossier */
export function generateHtmlDossier(data: FullAnalysisResponse): string {
  const { channel, videos, analytics, aiAnalysis, meta } = data;
  const sample = meta.dataSource === 'sample';
  const observed = videos.filter((v) => v.viewsAvailable !== false && Number.isFinite(v.views) && v.views >= 0);
  const sorted = [...observed].sort((a, b) => b.views - a.views);
  const top5 = sorted.slice(0, 5);
  const date = new Date(meta.generatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <title>TubeSignal report: ${channel.name}</title>
  <style>
    :root {
      --bg: #0B0E14;
      --card: #151921;
      --card-alt: #1C222C;
      --border: rgba(255, 255, 255, 0.08);
      --accent: #FFB224;
      --accent-soft: rgba(255, 178, 36, 0.12);
      --text: #F3F4F6;
      --text-muted: #9CA3AF;
      --green: #34D399;
      --font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: var(--font);
      line-height: 1.6;
      padding: 40px 20px;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
    }
    header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--border);
      padding-bottom: 24px;
      margin-bottom: 32px;
      flex-wrap: wrap;
      gap: 16px;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .brand-badge {
      background: var(--accent);
      color: #000;
      font-size: 10px;
      font-weight: 800;
      padding: 3px 7px;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .channel-header {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 28px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 20px;
    }
    .channel-title {
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.03em;
      margin-bottom: 4px;
    }
    .channel-meta {
      color: var(--text-muted);
      font-size: 14px;
      font-family: var(--font-mono);
    }
    .pill {
      display: inline-block;
      padding: 4px 10px;
      border-radius: 20px;
      font-size: 12px;
      background: var(--accent-soft);
      color: var(--accent);
      border: 1px solid rgba(255, 178, 36, 0.25);
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 16px;
      margin-bottom: 28px;
    }
    .stat-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 20px;
    }
    .stat-label {
      color: var(--text-muted);
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      margin-bottom: 6px;
    }
    .stat-value {
      font-size: 24px;
      font-weight: 700;
      color: var(--text);
      font-family: var(--font-mono);
    }
    .section-card {
      background: var(--card);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 28px;
      margin-bottom: 28px;
    }
    .section-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 16px;
      color: var(--accent);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .summary-text {
      font-size: 15px;
      line-height: 1.7;
      color: #E5E7EB;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 12px;
      font-size: 14px;
    }
    th {
      text-align: left;
      padding: 10px 12px;
      color: var(--text-muted);
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.04em;
      border-bottom: 1px solid var(--border);
    }
    td {
      padding: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.04);
    }
    tr:last-child td { border-bottom: none; }
    .num { font-family: var(--font-mono); }
    .badge-win { color: var(--green); font-weight: 600; font-size: 12px; }
    .rec-item {
      padding: 12px 16px;
      background: var(--card-alt);
      border-radius: 8px;
      margin-bottom: 10px;
      font-size: 14px;
      border-left: 3px solid var(--accent);
    }
    footer {
      border-top: 1px solid var(--border);
      padding-top: 20px;
      margin-top: 40px;
      color: var(--text-muted);
      font-size: 12px;
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: 12px;
    }
    @media print {
      body { background: #FFF !important; color: #111 !important; }
      .stat-card, .section-card, .channel-header { background: #F9FAFB !important; border-color: #E5E7EB !important; }
      .stat-value, .channel-title { color: #111 !important; }
      .pill { background: #F3F4F6 !important; color: #111 !important; border-color: #D1D5DB !important; }
      .rec-item { background: #F3F4F6 !important; color: #111 !important; border-color: #111 !important; }
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div class="brand">
         <span style="color: var(--accent); font-size: 20px;">◈</span>
         <span>TubeSignal report</span>
         <span class="brand-badge">Saved report</span>
      </div>
      <div style="font-size: 13px; color: var(--text-muted);">
        Generated ${date}
      </div>
    </header>

    <div class="channel-header">
      <div>
        <h1 class="channel-title">${channel.name}</h1>
        <div class="channel-meta">${channel.handle || channel.channelId} · ${channel.subscribers || 'Subscriber count unavailable'}</div>
      </div>
      <div>
         <span class="pill">${sample ? 'Illustrative sample' : 'Public data snapshot'}</span>
      </div>
    </div>

    <div class="grid">
      <div class="stat-card">
        <div class="stat-label">Average Views</div>
        <div class="stat-value">${analytics.avgViewsFormatted}</div>
      </div>
      <div class="stat-card">
         <div class="stat-label">Typical views</div>
        <div class="stat-value">${formatViews(analytics.medianViews)}</div>
      </div>
      <div class="stat-card">
         <div class="stat-label">Uploads per week</div>
        <div class="stat-value" style="font-size: 18px;">${analytics.publishingFrequency}</div>
      </div>
      <div class="stat-card">
         <div class="stat-label">Average video length</div>
        <div class="stat-value">${analytics.avgVideoLength}</div>
      </div>
    </div>

    <div class="section-card">
       <div class="section-title">Quick summary</div>
      <p class="summary-text">${aiAnalysis.summary}</p>
    </div>

    ${top5.length > 0 ? `
    <div class="section-card">
       <div class="section-title">Top videos</div>
      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Title</th>
            <th>Views</th>
             <th>vs Typical</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          ${top5.map((v, i) => {
            const delta = analytics.medianViews > 0
              ? `${v.views >= analytics.medianViews ? '+' : ''}${Math.round(((v.views - analytics.medianViews) / analytics.medianViews) * 100)}%`
              : '—';
            return `
            <tr>
              <td class="num">#${i + 1}</td>
              <td style="font-weight: 500;">${v.title}</td>
              <td class="num">${formatViews(v.views)}</td>
              <td class="num badge-win">${delta}</td>
              <td class="num" style="color: var(--text-muted);">${v.length}</td>
            </tr>`;
          }).join('')}
        </tbody>
      </table>
    </div>
    ` : ''}

    ${aiAnalysis.recommendations.length > 0 ? `
    <div class="section-card">
       <div class="section-title">Ideas to test</div>
      ${aiAnalysis.recommendations.map((rec) => `
        <div class="rec-item">${rec}</div>
      `).join('')}
    </div>
    ` : ''}

    <footer>
       <span>Based on public YouTube data${meta.analysisSource === 'gemini' ? ' · written explanations assisted by AI' : ''}</span>
       <span>${channel.totalVideosAnalyzed} videos checked</span>
    </footer>
  </div>
</body>
</html>`;
}

/** Build markdown snippet for Notion/Slack/Discord */
export function buildMarkdownSummary(channel: FullAnalysisResponse['channel'], analytics: FullAnalysisResponse['analytics'], aiAnalysis: FullAnalysisResponse['aiAnalysis']): string {
   return `### TubeSignal report: ${channel.name} (${channel.handle || ''})
- **Subscribers**: ${channel.subscribers || 'N/A'}
- **Average views**: ${analytics.avgViewsFormatted} (Typical: ${formatViews(analytics.medianViews)})
- **Uploads per week**: ${analytics.publishingFrequency} | **Average length**: ${analytics.avgVideoLength}
- **Quick summary**: ${aiAnalysis.summary.slice(0, 220)}...
- *Based on public YouTube data with TubeSignal*`;
}

/** Download text content as a file. */
export function downloadFile(content: string, filename: string, mimeType = 'text/markdown') {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/** Build share text for social media. */
export function buildShareText(channel: FullAnalysisResponse['channel'], analytics: FullAnalysisResponse['analytics']): string {
  return `I analyzed ${channel.name}'s YouTube channel with TubeSignal.\n\n` +
    `${analytics.avgViewsFormatted} average views across ${channel.totalVideosAnalyzed} videos\n` +
    `${analytics.avgVideoLength} average video length\n\n` +
    `See the full report:`;
}
