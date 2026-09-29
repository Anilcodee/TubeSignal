import React from 'react';
import styles from './Footer.module.css';

export const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.left}>
          <span>TubeSignal • Real-Time YouTube Creator Intelligence</span>
        </div>
        <div className={styles.right}>
          <span>SerpApi Engine v1.0</span>
          <span>•</span>
          <span>Gemini AI 1.5</span>
        </div>
      </div>
    </footer>
  );
};
