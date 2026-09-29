'use client';

import React from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { ChartWrapper } from './ChartWrapper';
import { PieChart } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ContentThemesProps {
  data: {
    labels: string[];
    datasets: {
      data: number[];
      backgroundColor: string[];
      borderWidth?: number;
    }[];
  };
}

export const ContentThemes = ({ data }: ContentThemesProps) => {
  const palette = ['#6366f1', '#06b6d4', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6'];
  const chartData = {
    ...data,
    datasets: data.datasets.map((ds) => ({
      ...ds,
      backgroundColor: ds.backgroundColor?.length ? ds.backgroundColor : palette,
      borderWidth: 2,
      borderColor: '#0d0f15',
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '74%',
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          color: '#9496a8',
          font: { size: 10 },
          padding: 10,
          usePointStyle: true,
          boxWidth: 6,
        },
      },
      tooltip: {
        backgroundColor: '#13161f',
        titleColor: '#f4f4f7',
        bodyColor: '#9496a8',
        borderColor: 'rgba(255,255,255,0.1)',
        borderWidth: 1,
        padding: 8,
        cornerRadius: 6,
        callbacks: {
          label: (context: any) => ` ${context.label}: ${context.raw}%`,
        },
      },
    },
  };

  return (
    <ChartWrapper title="Content Pillars & Category Share" icon={<PieChart size={14} />}>
      <Doughnut data={chartData} options={options} />
    </ChartWrapper>
  );
};
