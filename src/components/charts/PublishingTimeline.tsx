'use client';

import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, type ChartOptions } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { FullAnalysisResponse } from '@/types/analysis';
import { chartColors } from '@/lib/chart-theme';
import { ChartWrapper } from './ChartWrapper';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

export const PublishingTimeline = ({ data }: { data: FullAnalysisResponse['chartData']['publishingTimeline'] }) => {
  const values = data.datasets[0]?.data ?? [];
  const chartData = { labels: data.labels, datasets: [{ data: values, backgroundColor: chartColors.base, borderRadius: 3, maxBarThickness: 28 }] };
  const options: ChartOptions<'bar'> = {
    responsive: true, maintainAspectRatio: false,
    plugins: { tooltip: { callbacks: { label: (item) => `${item.raw} uploads in this sample` } } },
    scales: { x: { grid: { display: false }, ticks: { maxRotation: 0, maxTicksLimit: 6 } }, y: { beginAtZero: true, ticks: { precision: 0 }, title: { display: true, text: 'Uploads' } } },
  };
  return (
    <ChartWrapper title="When were these videos published?" caption="Included uploads by month—not a complete channel history. Relative dates are approximate."
      emptyMessage={!values.length ? 'There are no usable publication dates in this sample.' : undefined}
      dataTable={values.length > 0 && <table><caption>Sample uploads by month</caption><thead><tr><th scope="col">Month</th><th scope="col">Uploads</th></tr></thead><tbody>{data.labels.map((label, index) => <tr key={label}><td>{label}</td><td>{values[index]}</td></tr>)}</tbody></table>}>
      <Bar data={chartData} options={options} role="img" aria-label="Uploads by month. Exact values are in View chart data below." />
    </ChartWrapper>
  );
};
