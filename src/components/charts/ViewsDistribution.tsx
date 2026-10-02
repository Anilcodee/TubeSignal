'use client';

import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, type ChartOptions, type Plugin } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { FullAnalysisResponse } from '@/types/analysis';
import { formatViews } from '@/utils/format';
import { chartColors } from '@/lib/chart-theme';
import { ChartWrapper } from './ChartWrapper';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

export const ViewsDistribution = ({ data, medianViews }: { data: FullAnalysisResponse['chartData']['viewsDistribution']; medianViews: number }) => {
  const entries = data.labels.map((label, index) => ({ label, value: data.datasets[0]?.data[index] ?? 0 })).sort((a, b) => b.value - a.value).slice(0, 8);
  const chartData = { labels: entries.map((entry) => entry.label.length > 26 ? `${entry.label.slice(0, 25)}…` : entry.label), datasets: [{ data: entries.map((entry) => entry.value), backgroundColor: entries.map((entry) => medianViews > 0 && entry.value >= medianViews * 1.5 ? chartColors.accent : chartColors.base), borderRadius: 3, maxBarThickness: 22 }] };
  const options: ChartOptions<'bar'> = {
    responsive: true, maintainAspectRatio: false, indexAxis: 'y',
    plugins: { tooltip: { callbacks: { title: (items) => entries[items[0]?.dataIndex]?.label || '', label: (item) => `${formatViews(Number(item.raw))} views` } } },
    scales: { x: { beginAtZero: true, ticks: { callback: (value) => formatViews(Number(value)), maxTicksLimit: 5 } }, y: { grid: { display: false }, ticks: { font: { size: 10 } } } },
  };
  const medianLine: Plugin<'bar'> = { id: 'median-baseline', afterDatasetsDraw(chart) {
    if (!entries.length || medianViews <= 0) return;
    const x = chart.scales.x.getPixelForValue(medianViews);
    if (x < chart.chartArea.left || x > chart.chartArea.right) return;
    const { ctx, chartArea } = chart;
    ctx.save(); ctx.strokeStyle = chartColors.text; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(x, chartArea.top); ctx.lineTo(x, chartArea.bottom); ctx.stroke(); ctx.restore();
  } };
  return (
    <ChartWrapper title="Which uploads stand out?" caption={`Up to 8 highest-view uploads · Median of analyzed uploads: ${formatViews(medianViews)} (dashed) · Amber: at least 1.5× median`}
      emptyMessage={!entries.length ? 'No view counts are available.' : undefined}
      dataTable={entries.length > 0 && <table><caption>Views by upload</caption><thead><tr><th scope="col">Video</th><th scope="col">Views</th></tr></thead><tbody>{entries.map((entry, index) => <tr key={index}><td>{entry.label}</td><td>{entry.value.toLocaleString()}</td></tr>)}</tbody></table>}>
      <Bar data={chartData} options={options} plugins={[medianLine]} role="img" aria-label="Views by upload. Exact values are in View chart data below." />
    </ChartWrapper>
  );
};
