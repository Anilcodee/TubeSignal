'use client';

import React from 'react';
import {
  Chart as ChartJS,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';
import { ChartWrapper } from './ChartWrapper';
import { Clock } from 'lucide-react';
import { formatViews } from '@/utils/format';

ChartJS.register(LinearScale, PointElement, LineElement, Tooltip, Legend);

interface LengthVsViewsProps {
  data: {
    labels?: string[];
    datasets: {
      label?: string;
      data: { x: number; y: number }[];
      backgroundColor?: string;
      pointRadius?: number;
      pointHoverRadius?: number;
    }[];
  };
}

export const LengthVsViews = ({ data }: LengthVsViewsProps) => {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1a1a28',
        titleColor: '#f0f0f5',
        bodyColor: '#8888a0',
        borderColor: 'rgba(255,255,255,0.08)',
        borderWidth: 1,
        padding: 10,
        callbacks: {
          label: (context: any) =>
            ` Duration: ${context.raw.x}m • Views: ${formatViews(context.raw.y)}`,
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Video Duration (Minutes)',
          color: '#8888a0',
          font: { size: 10 },
        },
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#8888a0' },
      },
      y: {
        title: {
          display: true,
          text: 'Total Views',
          color: '#8888a0',
          font: { size: 10 },
        },
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: {
          color: '#8888a0',
          callback: (val: any) => formatViews(Number(val)),
        },
      },
    },
  };

  return (
    <ChartWrapper title="Duration vs Views Correlation" icon={<Clock size={16} />}>
      <Scatter data={data} options={options} />
    </ChartWrapper>
  );
};
