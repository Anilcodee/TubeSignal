'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { ChartWrapper } from './ChartWrapper';
import { BarChart3 } from 'lucide-react';
import { formatViews } from '@/utils/format';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ViewsDistributionProps {
  data: {
    labels: string[];
    datasets: {
      label?: string;
      data: number[];
      backgroundColor?: string;
      borderRadius?: number;
    }[];
  };
}

export const ViewsDistribution = ({ data }: ViewsDistributionProps) => {
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
          label: (context: any) => ` Views: ${formatViews(context.raw)}`,
        },
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: { color: '#8888a0', font: { size: 10 } },
      },
      y: {
        grid: { color: 'rgba(255,255,255,0.04)' },
        ticks: {
          color: '#8888a0',
          callback: (value: any) => formatViews(Number(value)),
        },
      },
    },
  };

  return (
    <ChartWrapper title="Views Distribution (Top Uploads)" icon={<BarChart3 size={16} />}>
      <Bar data={data} options={options} />
    </ChartWrapper>
  );
};
