import React from 'react';
import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  progress: number; // 0 to 100
  label?: string;
  showPercentage?: boolean;
  animated?: boolean;
}

export const ProgressBar = ({
  progress,
  label,
  showPercentage = true,
  animated = true,
}: ProgressBarProps) => {
  const clamped = Math.min(100, Math.max(0, progress));

  return (
    <div className={styles.container}>
      {(label || showPercentage) && (
        <div className={styles.labelRow}>
          {label && <span className={styles.label}>{label}</span>}
          {showPercentage && <span className={styles.percentage}>{Math.round(clamped)}%</span>}
        </div>
      )}
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${clamped}%` }}>
          {animated && <div className={styles.shimmerEffect} />}
        </div>
      </div>
    </div>
  );
};
