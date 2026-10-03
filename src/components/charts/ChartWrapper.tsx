'use client';

import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import styles from './ChartWrapper.module.css';

interface ChartWrapperProps { title: string; caption?: string; children?: ReactNode; dataTable?: ReactNode; emptyMessage?: string; }

export const ChartWrapper = ({ title, caption, children, dataTable, emptyMessage }: ChartWrapperProps) => (
  <motion.section 
    className={styles.wrapper} 
    aria-label={title}
    initial={{ opacity: 0, y: 15 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-40px" }}
    transition={{ type: "spring", stiffness: 300, damping: 24 }}
  >
    <div className={styles.header}><h3 className={styles.title}>{title}</h3>{caption && <p className={styles.caption}>{caption}</p>}</div>
    {emptyMessage ? <p className={styles.empty}>{emptyMessage}</p> : <div className={styles.chartContainer}>{children}</div>}
    {dataTable && <details className={styles.dataDetails}><summary>View chart data</summary><div className={styles.dataScroll}>{dataTable}</div></details>}
  </motion.section>
);
