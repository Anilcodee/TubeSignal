import React from 'react';
import Link from 'next/link';
import { Activity } from 'lucide-react';
import styles from './Header.module.css';

export const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <div className={styles.logoIconWrapper}>
            <Activity size={16} strokeWidth={2.5} />
          </div>
          <span className={styles.logoText}>TubeSignal</span>
          <span className={styles.tag}>Creator Intelligence Console</span>
        </Link>

        <nav className={styles.nav}>
          <div className={styles.badgeLive}>
            <span className={styles.dot} />
            <span>Engines Online</span>
          </div>
        </nav>
      </div>
    </header>
  );
};
