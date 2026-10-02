'use client';

import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, type ChartOptions } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { FullAnalysisResponse } from '@/types/analysis';
import { chartColors } from '@/lib/chart-theme';
import { ChartWrapper } from './ChartWrapper';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

export const ContentThemes = ({ data }: { data: FullAnalysisResponse['chartData']['contentThemes'] }) => {
  const entries = data.labels.map((label, index) => ({ label, value: data.datasets[0]?.data[index] ?? 0 })).sort((a, b) => b.value - a.value);
  const grouped = entries.length > 5 ? [...entries.slice(0, 5), { label: 'Other themes', value: entries.slice(5).reduce((sum, entry) => sum + entry.value, 0) }] : entries;
  const chartData = { labels: grouped.map((entry) => entry.label), datasets: [{ data: grouped.map((entry) => entry.value), backgroundColor: grouped.map((_, index) => index === 0 ? chartColors.accent : chartColors.base), borderRadius: 3, maxBarThickness: 22 }] };
  const options: ChartOptions<'bar'> = { indexAxis: 'y', responsive: true, maintainAspectRatio: false, plugins: { tooltip: { callbacks: { label: (item) => `${item.raw}% of categorized uploads` } } }, scales: { x: { beginAtZero: true, max: 100, ticks: { callback: (value) => `${value}%` } }, y: { grid: { display: false } } } };
  return (
    <ChartWrapper title="Topics in this sample" caption="AI-estimated share of categorized uploads—not share of views. Categories can be imperfect."
      emptyMessage={!grouped.length ? 'Topic classification is unavailable for this report.' : undefined}
      dataTable={grouped.length > 0 && <table><caption>Estimated content themes</caption><thead><tr><th scope="col">Theme</th><th scope="col">Share of uploads</th></tr></thead><tbody>{grouped.map((entry, index) => <tr key={index}><td>{entry.label}</td><td>{entry.value}%</td></tr>)}</tbody></table>}>
      <Bar data={chartData} options={options} role="img" aria-label="Content themes. Exact values are in View chart data below." />
    </ChartWrapper>
  );
};
