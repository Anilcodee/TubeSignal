'use client';

import { Chart as ChartJS, LinearScale, PointElement, LineElement, Tooltip, type ChartOptions } from 'chart.js';
import { Scatter } from 'react-chartjs-2';
import type { FullAnalysisResponse } from '@/types/analysis';
import { formatViews } from '@/utils/format';
import { chartColors } from '@/lib/chart-theme';
import { ChartWrapper } from './ChartWrapper';

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip);

export const LengthVsViews = ({ data }: { data: FullAnalysisResponse['chartData']['lengthVsViews'] }) => {
  const points = (data.datasets[0]?.data ?? []).filter((point) => point.x > 0 && Number.isFinite(point.y));
  const maxViews = Math.max(0, ...points.map((point) => point.y));
  const peakPoint = points.find((p) => p.y === maxViews);

  const chartData = {
    datasets: [{
      data: points,
      backgroundColor: points.map((point) => point.y === maxViews ? chartColors.accent : 'rgba(96, 165, 250, 0.65)'),
      borderColor: points.map((point) => point.y === maxViews ? '#FFFFFF' : 'rgba(96, 165, 250, 0.9)'),
      borderWidth: points.map((point) => point.y === maxViews ? 2 : 1),
      pointRadius: points.map((point) => point.y === maxViews ? 7 : 5),
      pointHoverRadius: points.map((point) => point.y === maxViews ? 10 : 8),
    }],
  };

  const options: ChartOptions<'scatter'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      tooltip: {
        callbacks: {
          label: (item) => `${item.parsed.x} min duration · ${formatViews(Number(item.parsed.y ?? 0))} views`,
        },
      },
    },
    scales: {
      x: {
        title: { display: true, text: 'Duration (minutes)', color: chartColors.textMuted },
        grid: { color: chartColors.grid },
        ticks: { color: chartColors.text, maxTicksLimit: 6 },
      },
      y: {
        beginAtZero: true,
        grid: { color: chartColors.grid },
        ticks: {
          color: chartColors.text,
          callback: (value) => formatViews(Number(value)),
          maxTicksLimit: 5,
        },
      },
    },
  };

  return (
    <ChartWrapper
      title="Duration and views"
      caption="Correlation between video length and cumulative views. Amber node marks the top-performing upload."
      badge={
        peakPoint ? (
          <span>
            Top Performer: <strong style={{ color: 'var(--accent)' }}>{peakPoint.x}m</strong> ({formatViews(maxViews)})
          </span>
        ) : undefined
      }
      emptyMessage={!points.length ? 'Known video durations are needed for this comparison.' : undefined}
      dataTable={
        points.length > 0 && (
          <table>
            <caption>Duration and cumulative views</caption>
            <thead>
              <tr>
                <th scope="col">Duration (minutes)</th>
                <th scope="col">Views</th>
              </tr>
            </thead>
            <tbody>
              {points.map((point, index) => (
                <tr key={index}>
                  <td>{point.x}m</td>
                  <td>{point.y.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      }
    >
      <Scatter data={chartData} options={options} role="img" aria-label="Duration versus views. Exact values are in View chart data below." />
    </ChartWrapper>
  );
};
