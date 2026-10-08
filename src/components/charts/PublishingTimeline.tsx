'use client';

import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, type ChartOptions } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import type { FullAnalysisResponse } from '@/types/analysis';
import { chartColors } from '@/lib/chart-theme';
import { ChartWrapper } from './ChartWrapper';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip);

export const PublishingTimeline = ({ data }: { data: FullAnalysisResponse['chartData']['publishingTimeline'] }) => {
  const values = data.datasets[0]?.data ?? [];
  const maxUploads = values.length > 0 ? Math.max(...values) : 0;
  const peakIdx = values.indexOf(maxUploads);
  const peakMonth = peakIdx >= 0 ? data.labels[peakIdx] : '';

  const chartData = {
    labels: data.labels,
    datasets: [{
      data: values,
      backgroundColor: values.map((val) => val === maxUploads && maxUploads > 0 ? chartColors.accent : chartColors.base),
      hoverBackgroundColor: values.map((val) => val === maxUploads && maxUploads > 0 ? chartColors.accentHover : chartColors.baseHover),
      borderRadius: { topLeft: 5, topRight: 5, bottomLeft: 0, bottomRight: 0 },
      maxBarThickness: 28,
    }],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: (item) => `${item.raw} uploads published`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: chartColors.text, maxRotation: 0, maxTicksLimit: 6 },
      },
      y: {
        beginAtZero: true,
        grid: { color: chartColors.grid },
        ticks: { color: chartColors.text, precision: 0 },
        title: { display: true, text: 'Uploads', color: chartColors.textMuted },
      },
    },
  };

  return (
    <ChartWrapper
      title="When were these videos published?"
      caption="Monthly cadence across analyzed uploads. Amber marks the highest-volume month."
      badge={
        maxUploads > 0 ? (
          <span>
            Peak Month: <strong style={{ color: 'var(--accent)' }}>{peakMonth}</strong> ({maxUploads} uploads)
          </span>
        ) : undefined
      }
      emptyMessage={!values.length ? 'There are no usable publication dates in this sample.' : undefined}
      dataTable={
        values.length > 0 && (
          <table>
            <caption>Sample uploads by month</caption>
            <thead>
              <tr>
                <th scope="col">Month</th>
                <th scope="col">Uploads</th>
              </tr>
            </thead>
            <tbody>
              {data.labels.map((label, index) => (
                <tr key={label}>
                  <td>{label}</td>
                  <td>{values[index]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      }
    >
      <Bar data={chartData} options={options} role="img" aria-label="Uploads by month. Exact values are in View chart data below." />
    </ChartWrapper>
  );
};
