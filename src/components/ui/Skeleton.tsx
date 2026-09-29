import React from 'react';
import styles from './Skeleton.module.css';

interface SkeletonProps {
  variant?: 'text' | 'rect' | 'circle';
  width?: string | number;
  height?: string | number;
  className?: string;
}

export const Skeleton = ({
  variant = 'rect',
  width,
  height,
  className = '',
}: SkeletonProps) => {
  const variantClass = {
    text: styles.text,
    rect: styles.rect,
    circle: styles.circle,
  }[variant];

  return (
    <div
      className={`${styles.skeleton} ${variantClass} ${className}`}
      style={{
        width: width ? (typeof width === 'number' ? `${width}px` : width) : '100%',
        height: height ? (typeof height === 'number' ? `${height}px` : height) : undefined,
      }}
    />
  );
};
