import React from 'react';
import styles from './Footer.module.css';

export const Footer = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <span>TubeSignal • YouTube creator strategy instrument built with SerpApi & Gemini</span>
      </div>
    </footer>
  );
};
