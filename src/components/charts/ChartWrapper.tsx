import type { ReactNode } from 'react';
import styles from './ChartWrapper.module.css';

interface ChartWrapperProps { title: string; caption?: string; children?: ReactNode; dataTable?: ReactNode; emptyMessage?: string; }

export const ChartWrapper = ({ title, caption, children, dataTable, emptyMessage }: ChartWrapperProps) => (
  <section className={styles.wrapper} aria-label={title}>
    <div className={styles.header}><h3 className={styles.title}>{title}</h3>{caption && <p className={styles.caption}>{caption}</p>}</div>
    {emptyMessage ? <p className={styles.empty}>{emptyMessage}</p> : <div className={styles.chartContainer}>{children}</div>}
    {dataTable && <details className={styles.dataDetails}><summary>View chart data</summary><div className={styles.dataScroll}>{dataTable}</div></details>}
  </section>
);
