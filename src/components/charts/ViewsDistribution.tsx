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
  const isStandout = (val: number) => medianViews > 0 && val >= medianViews * 1.5;
  const chartData = {
    labels: entries.map((entry) => entry.label.length > 26 ? `${entry.label.slice(0, 25)}…` : entry.label),
    datasets: [{
      data: entries.map((entry) => entry.value),
      backgroundColor: entries.map((entry) => isStandout(entry.value) ? chartColors.accent : chartColors.base),
      hoverBackgroundColor: entries.map((entry) => isStandout(entry.value) ? chartColors.accentHover : chartColors.baseHover),
      borderRadius: 6,
      maxBarThickness: 20,
    }],
  };
  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    animation: false,
    plugins: {
      tooltip: {
        callbacks: {
          title: (items) => entries[items[0]?.dataIndex]?.label || '',
          label: (item) => {
            const val = Number(item.raw);
            const mult = medianViews > 0 ? ` (${(val / medianViews).toFixed(1)}× median)` : '';
            return `${formatViews(val)} views${mult}`;
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        grid: { color: chartColors.grid },
        ticks: {
          color: chartColors.text,
          callback: (value) => formatViews(Number(value)),
          maxTicksLimit: 5,
        },
      },
      y: {
        grid: { display: false },
        ticks: {
          color: 'rgba(236, 237, 239, 0.9)',
          font: { size: 11 },
        },
      },
    },
  };
  const medianLine: Plugin<'bar'> = {
    id: 'median-baseline',
    afterDatasetsDraw(chart) {
      if (!entries.length || medianViews <= 0) return;
      const x = chart.scales.x.getPixelForValue(medianViews);
      if (x < chart.chartArea.left || x > chart.chartArea.right) return;
      const { ctx, chartArea } = chart;
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 193, 110, 0.45)';
      ctx.setLineDash([4, 4]);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x, chartArea.top);
      ctx.lineTo(x, chartArea.bottom);
      ctx.stroke();
      ctx.restore();
    },
  };

  const peakVal = entries[0]?.value ?? 0;

  return (
    <ChartWrapper
      title="Which uploads stand out?"
      caption={`Top 8 uploads by cumulative views. Dashed line denotes channel median (${formatViews(medianViews)}).`}
      badge={
        entries.length > 0 ? (
          <span>
            Peak: <strong style={{ color: 'var(--accent)' }}>{formatViews(peakVal)}</strong> · Median: {formatViews(medianViews)}
          </span>
        ) : undefined
      }
      emptyMessage={!entries.length ? 'No view counts are available.' : undefined}
      dataTable={
        entries.length > 0 && (
          <table>
            <caption>Views by upload</caption>
            <thead>
              <tr>
                <th scope="col">Video</th>
                <th scope="col">Views</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, index) => (
                <tr key={index}>
                  <td>{entry.label}</td>
                  <td>{entry.value.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )
      }
    >
      <Bar data={chartData} options={options} plugins={[medianLine]} role="img" aria-label="Views by upload. Exact values are in View chart data below." />
    </ChartWrapper>
  );
};
