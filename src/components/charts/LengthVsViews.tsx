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
  const chartData = {
    ...data,
    datasets: data.datasets.map((ds) => ({
      ...ds,
      backgroundColor: '#f59e0b',
      borderColor: '#0d0f15',
      borderWidth: 2,
      pointRadius: 5,
      pointHoverRadius: 8,
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
          label: (context: any) =>
            ` Duration: ${context.raw.x}m • Views: ${formatViews(context.raw.y)}`,
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Duration (Min)',
          color: '#5e6074',
          font: { size: 10 },
        },
        grid: { display: false },
        ticks: { color: '#5e6074', font: { size: 10 } },
      },
      y: {
        title: {
          display: true,
          text: 'Views',
          color: '#5e6074',
          font: { size: 10 },
        },
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: {
          color: '#5e6074',
          font: { size: 10 },
          callback: (val: any) => formatViews(Number(val)),
        },
      },
    },
  };

  return (
    <ChartWrapper title="Duration vs Performance Correlation" icon={<Clock size={14} />}>
      <Scatter data={chartData} options={options} />
    </ChartWrapper>
  );
};
