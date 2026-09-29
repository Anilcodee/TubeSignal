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
import { BarChart2 } from 'lucide-react';
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
  const chartData = {
    ...data,
    datasets: data.datasets.map((ds) => ({
      ...ds,
      backgroundColor: '#6366f1',
      borderRadius: 4,
      barThickness: 20,
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
          label: (context: any) => ` Views: ${formatViews(context.raw)}`,
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
        ticks: {
          color: '#5e6074',
          font: { size: 10 },
          callback: (value: any) => formatViews(Number(value)),
        },
      },
    },
  };

  return (
    <ChartWrapper title="Views Distribution (Sampled Uploads)" icon={<BarChart2 size={14} />}>
      <Bar data={chartData} options={options} />
    </ChartWrapper>
  );
};
