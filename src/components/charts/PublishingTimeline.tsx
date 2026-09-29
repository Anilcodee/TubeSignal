'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { ChartWrapper } from './ChartWrapper';
import { Calendar } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, Filler);

interface PublishingTimelineProps {
  data: {
    labels: string[];
    datasets: {
      label?: string;
      data: number[];
      borderColor?: string;
      backgroundColor?: string;
      fill?: boolean;
      tension?: number;
    }[];
  };
}

export const PublishingTimeline = ({ data }: PublishingTimelineProps) => {
  const chartData = {
    ...data,
    datasets: data.datasets.map((ds) => ({
      ...ds,
      borderColor: '#06b6d4',
      backgroundColor: 'rgba(6, 182, 212, 0.08)',
      pointBackgroundColor: '#06b6d4',
      pointBorderColor: '#0d0f15',
      pointBorderWidth: 2,
      pointRadius: 4,
      pointHoverRadius: 6,
      borderWidth: 2,
      fill: true,
      tension: 0.35,
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#13161f',
        titleColor: '#f4f4f7',
        bodyColor: '#9496a8',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        padding: 8,
        cornerRadius: 6,
        callbacks: {
          label: (context: any) => ` Uploads: ${context.raw} videos`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#5e6074', font: { size: 10 } },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#5e6074', font: { size: 10 } },
        beginAtZero: true,
      },
    },
  };

  return (
    <ChartWrapper title="Upload Velocity & Cadence" icon={<Calendar size={14} />}>
      <Line data={chartData} options={options} />
    </ChartWrapper>
  );
};
