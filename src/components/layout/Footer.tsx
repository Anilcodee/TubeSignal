'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowUp, AudioLines, CheckCircle2, Code2, ExternalLink, Heart, Sparkles, Zap } from 'lucide-react';
import styles from './Footer.module.css';

export const Footer = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.1 }
    );
    const el = document.getElementById('tubesignal-footer');
    if (el) observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="tubesignal-footer" className={`${styles.footer} ${isVisible ? styles.visible : ''} no-print`} role="contentinfo">
      {/* Animated Gradient Border */}
      <div className={styles.gradientBorder} aria-hidden="true" />

      <div className={styles.container}>
        {/* Top Section: Brand + Navigation */}
        <div className={styles.topSection}>
          {/* Brand Column */}
          <div className={styles.brandCol}>
            <Link href="/" className={styles.logo} aria-label="TubeSignal Home">
              <span className={styles.logoMark}>
                <AudioLines size={20} aria-hidden="true" />
              </span>
              <span className={styles.logoText}>
                TubeSignal<span className={styles.logoDot}>.</span>
              </span>
            </Link>
            <p className={styles.brandDescription}>
              The competitive intelligence platform for high-growth YouTube creators. Reverse-engineer what works — packaging, timing, and spoken hooks.
            </p>

            {/* Engine Status */}
            <div className={styles.engineStatus}>
              <div className={styles.statusRow}>
                <span className={styles.statusIndicator}>
                  <span className={styles.statusDot} />
                  <span className={styles.statusRing} />
                </span>
                <span>All systems operational</span>
              </div>
              <div className={styles.enginesList}>
                <span className={styles.engineTag}>
                  <Zap size={10} /> SerpApi
                </span>
                <span className={styles.engineTag}>
                  <Sparkles size={10} /> Gemini 2.5
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Columns */}
          <div className={styles.navColumns}>
            {/* Column 1: Intelligence */}
            <div className={styles.navCol}>
              <h4 className={styles.colHeading}>Intelligence</h4>
              <ul className={styles.navList}>
                <li>
                  <Link href="/analyze/mkbhd?demo=true" className={styles.navLink}>
                    <span>Channel Audit</span>
                    <span className={styles.coreBadge}>Core</span>
                  </Link>
                </li>
                <li>
                  <Link href="/compare" className={styles.navLink}>
                    Creator Comparison
                  </Link>
                </li>
                <li>
                  <Link href="/analyze/mkbhd?demo=true" className={styles.navLink}>
                    Hook & Script Lab
                  </Link>
                </li>
                <li>
                  <Link href="/analyze/mkbhd?demo=true" className={styles.navLink}>
                    Growth Playbook
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Explore */}
            <div className={styles.navCol}>
              <h4 className={styles.colHeading}>Explore</h4>
              <ul className={styles.navList}>
                <li>
                  <Link href="/analyze/mkbhd?demo=true" className={styles.navLink}>
                    MKBHD <small className={styles.subLabel}>Tech</small>
                  </Link>
                </li>
                <li>
                  <Link href="/analyze/fireship?demo=true" className={styles.navLink}>
                    Fireship <small className={styles.subLabel}>Dev</small>
                  </Link>
                </li>
                <li>
                  <Link href="/analyze/veritasium?demo=true" className={styles.navLink}>
                    Veritasium <small className={styles.subLabel}>Science</small>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3: Technology */}
            <div className={styles.navCol}>
              <h4 className={styles.colHeading}>Powered By</h4>
              <ul className={styles.navList}>
                <li>
                  <a
                    href="https://serpapi.com/youtube-api"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.navLink}
                  >
                    SerpApi YouTube Engine
                    <ExternalLink size={10} className={styles.extIcon} />
                  </a>
                </li>
                <li>
                  <a
                    href="https://ai.google.dev/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.navLink}
                  >
                    Google Gemini AI
                    <ExternalLink size={10} className={styles.extIcon} />
                  </a>
                </li>
                <li>
                  <span className={styles.trustItem}>
                    <CheckCircle2 size={11} />
                    <span>Zero data stored</span>
                  </span>
                </li>
                <li>
                  <span className={styles.trustItem}>
                    <CheckCircle2 size={11} />
                    <span>No login required</span>
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Divider with gradient fade */}
        <div className={styles.divider}>
          <div className={styles.dividerLine} />
        </div>

        {/* Bottom Bar */}
        <div className={styles.bottomBar}>
          <div className={styles.copyrightSection}>
            <span className={styles.copyright}>
              © 2026 TubeSignal
            </span>
            <span className={styles.separator}>·</span>
            <span className={styles.madeWith}>
              Built with <Heart size={11} className={styles.heartIcon} /> for the SerpApi Hackathon
            </span>
          </div>

          <div className={styles.bottomActions}>
            <a
              href="https://github.com/Anilcodee/TubeSignal"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.githubLink}
              aria-label="View source on GitHub"
            >
              <Code2 size={14} />
              <span>Source</span>
            </a>

            <button
              type="button"
              className={styles.backToTop}
              onClick={scrollToTop}
              aria-label="Back to top of page"
            >
              <span>Top</span>
              <ArrowUp size={12} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};
