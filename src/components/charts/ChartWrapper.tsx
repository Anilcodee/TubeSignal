import React, { ReactNode } from 'react';
import styles from './ChartWrapper.module.css';

interface ChartWrapperProps {
  title: string;
  icon?: ReactNode;
  headerAction?: ReactNode;
  children: ReactNode;
  className?: string;
}

export const ChartWrapper = ({
  title,
  icon,
  headerAction,
  children,
  className = '',
}: ChartWrapperProps) => {
  return (
    <div className={`${styles.wrapper} ${className}`}>
      <div className={styles.header}>
        <div className={styles.titleArea}>
          {icon && <div className={styles.icon}>{icon}</div>}
          <h3 className={styles.title}>{title}</h3>
        </div>
        {headerAction && <div>{headerAction}</div>}
      </div>
      <div className={styles.chartContainer}>{children}</div>
    </div>
  );
};
