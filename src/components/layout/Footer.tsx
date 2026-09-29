import React from 'react';
import styles from './Footer.module.css';

export const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.topSection}>
          <div className={styles.brand}>
            <span className={styles.brandTitle}>TubeSignal</span>
            <span className={styles.brandSubtitle}>
              AI-Powered YouTube Creator Intelligence & Strategy Analysis
            </span>
          </div>

          <div className={styles.links}>
            <a
              href="https://serpapi.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              Powered by SerpApi
            </a>
            <a
              href="https://ai.google.dev"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              Google Gemini AI
            </a>
            <a
              href="https://serpapi.github.io/serpapi-india-hackathon-2026/"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
            >
              SerpApi Hackathon 2026
            </a>
          </div>
        </div>

        <div className={styles.bottomSection}>
          <span>
            Created by <strong>Anil</strong> for SerpApi India Hackathon 2026 (Knowledge & Public Interest Track)
          </span>
          <div className={styles.pill}>
            <span>Next.js 14 • TypeScript • Chart.js</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
