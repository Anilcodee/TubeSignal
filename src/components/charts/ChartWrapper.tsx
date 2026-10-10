'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import styles from './ChartWrapper.module.css';

interface ChartWrapperProps {
  title: string;
  caption?: string;
  badge?: ReactNode;
  children?: ReactNode;
  dataTable?: ReactNode;
  emptyMessage?: string;
}

export const ChartWrapper = ({
  title,
  caption,
  badge,
  children,
  dataTable,
  emptyMessage,
}: ChartWrapperProps) => (
  <motion.section
    className={styles.wrapper}
    aria-label={title}
    initial={{ opacity: 0, y: 12 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: '-40px' }}
    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
  >
    <div className={styles.header}>
      <div className={styles.headerText}>
        <h3 className={styles.title}>{title}</h3>
        {caption && <p className={styles.caption}>{caption}</p>}
      </div>
      {badge && <div className={styles.badge}>{badge}</div>}
    </div>
    {emptyMessage ? (
      <p className={styles.empty}>{emptyMessage}</p>
    ) : (
      <div className={styles.chartContainer}>{children}</div>
    )}
    {dataTable && (
      <details className={styles.dataDetails}>
        <summary className={styles.summaryBtn}>
           <span>Show exact values</span>
        </summary>
        <div className={styles.dataScroll}>{dataTable}</div>
      </details>
    )}
  </motion.section>
);
