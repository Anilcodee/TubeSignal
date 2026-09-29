import React, { ReactNode } from 'react';
import styles from './Badge.module.css';

interface BadgeProps {
  children: ReactNode;
  variant?: 'brand' | 'success' | 'warning' | 'error' | 'info' | 'outline';
  icon?: ReactNode;
  className?: string;
}

export const Badge = ({
  children,
  variant = 'brand',
  icon,
  className = '',
}: BadgeProps) => {
  const variantClass = {
    brand: styles.brand,
    success: styles.success,
    warning: styles.warning,
    error: styles.error,
    info: styles.info,
    outline: styles.outline,
  }[variant];

  return (
    <span className={`${styles.badge} ${variantClass} ${className}`}>
      {icon}
      <span>{children}</span>
    </span>
  );
};
