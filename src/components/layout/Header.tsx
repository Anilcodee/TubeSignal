import React from 'react';
import Link from 'next/link';
import { Activity, ExternalLink, Sparkles } from 'lucide-react';
import styles from './Header.module.css';

export const Header = () => {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <div className={styles.logoIconWrapper}>
            <Activity size={18} strokeWidth={2.5} />
          </div>
          <span className={styles.logoText}>TubeSignal</span>
          <span className={styles.badge}>AI Insights</span>
        </Link>

        <nav className={styles.nav}>
          <a
            href="https://serpapi.com/youtube-search-api"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.navLink}
          >
            <span>SerpApi Docs</span>
            <ExternalLink size={14} />
          </a>

          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className={styles.githubBtn}
          >
            <Sparkles size={14} color="#a78bfa" />
            <span>Hackathon 2026</span>
          </a>
        </nav>
      </div>
    </header>
  );
};
