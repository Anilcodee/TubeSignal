'use client';

import Link from 'next/link';
import { ArrowUp, AudioLines, CheckCircle2, ExternalLink, Sparkles, Zap } from 'lucide-react';
import styles from './Footer.module.css';

export const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className={`${styles.footer} no-print`} role="contentinfo">
      {/* Radiant Top Glow Line */}
      <div className={styles.radiantGlow} aria-hidden="true" />

      <div className={styles.container}>
        {/* Top Grid: Brand + 3 Nav Columns */}
        <div className={styles.topGrid}>
          {/* Brand Info */}
          <div className={styles.brandCol}>
            <Link href="/" className={styles.logo} aria-label="TubeSignal Home">
              <span className={styles.logoMark}>
                <AudioLines size={20} aria-hidden="true" />
              </span>
              <span>
                TubeSignal<span className={styles.logoPeriod}>.</span>
              </span>
            </Link>
            <p className={styles.brandTagline}>
              The competitive intelligence instrument for high-growth YouTube creators.
              Reverse-engineer packaging, duration sweet spots, and spoken hooks with SerpApi & Gemini.
            </p>

            <div className={styles.statusBadge}>
              <span className={styles.statusDot} />
              <span>SerpApi & Gemini 2.5: Operational</span>
            </div>
          </div>

          {/* Column 1: Intelligence Tools */}
          <div className={styles.navCol}>
            <h4 className={styles.colTitle}>Intelligence Suite</h4>
            <ul className={styles.linkList}>
              <li>
                <Link href="/analyze/mkbhd?demo=true" className={styles.link}>
                  <span>Channel Deep Audit</span>
                  <span className={styles.badgeNew}>Core</span>
                </Link>
              </li>
              <li>
                <Link href="/compare" className={styles.link}>
                  <span>Creator Head-to-Head</span>
                </Link>
              </li>
              <li>
                <Link href="/analyze/mkbhd?demo=true" className={styles.link}>
                  <span>Hook & Script Studio</span>
                </Link>
              </li>
              <li>
                <Link href="/analyze/mkbhd?demo=true" className={styles.link}>
                  <span>Actionable Growth Playbook</span>
                </Link>
              </li>
              <li>
                <Link href="/analyze/mkbhd?demo=true" className={styles.link}>
                  <span>In-Page Video Theater</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 2: Sample Reports */}
          <div className={styles.navCol}>
            <h4 className={styles.colTitle}>Sample Dossiers</h4>
            <ul className={styles.linkList}>
              <li>
                <Link href="/analyze/mkbhd?demo=true" className={styles.link}>
                  <span>MKBHD</span>
                  <small className={styles.subtext}>Tech Reviews</small>
                </Link>
              </li>
              <li>
                <Link href="/analyze/fireship?demo=true" className={styles.link}>
                  <span>Fireship</span>
                  <small className={styles.subtext}>Code & Fast Takes</small>
                </Link>
              </li>
              <li>
                <Link href="/analyze/veritasium?demo=true" className={styles.link}>
                  <span>Veritasium</span>
                  <small className={styles.subtext}>Science & Education</small>
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Trust & Methodology */}
          <div className={styles.navCol}>
            <h4 className={styles.colTitle}>Data & Technology</h4>
            <ul className={styles.linkList}>
              <li>
                <a
                  href="https://serpapi.com/youtube-api"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  <span>SerpApi YouTube Engine</span>
                  <ExternalLink size={11} className={styles.extIcon} />
                </a>
              </li>
              <li>
                <a
                  href="https://ai.google.dev/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.link}
                >
                  <span>Google Gemini 2.5 Flash</span>
                  <ExternalLink size={11} className={styles.extIcon} />
                </a>
              </li>
              <li>
                <span className={styles.staticLink}>
                  <CheckCircle2 size={12} style={{ color: '#34d399' }} />
                  <span>Zero-Storage Privacy Protocol</span>
                </span>
              </li>
              <li>
                <span className={styles.staticLink}>
                  <CheckCircle2 size={12} style={{ color: '#34d399' }} />
                  <span>No Passwords or Logins Needed</span>
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className={styles.divider} />

        {/* Bottom Bar: Copyright, Badges, and Back to Top */}
        <div className={styles.bottomBar}>
          <div className={styles.copyrightArea}>
            <span>© 2026 TubeSignal. Built for the SerpApi Hackathon.</span>
            <span className={styles.bullet}>•</span>
            <span className={styles.disclaimerText}>
              Public channel analysis based on observable video metadata.
            </span>
          </div>

          <div className={styles.bottomRight}>
            <div className={styles.badges}>
              <span className={styles.pillBadge}>
                <Zap size={11} style={{ color: '#ffc16e' }} /> SerpApi Fast Data
              </span>
              <span className={styles.pillBadge}>
                <Sparkles size={11} style={{ color: '#60a5fa' }} /> Gemini AI Synthesis
              </span>
            </div>

            <button
              type="button"
              className={styles.backToTopBtn}
              onClick={scrollToTop}
              aria-label="Back to top of page"
            >
              <span>Back to top</span>
              <ArrowUp size={13} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
