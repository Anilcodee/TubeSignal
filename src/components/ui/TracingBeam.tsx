'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import styles from './TracingBeam.module.css';

interface TracingBeamProps {
  children: React.ReactNode;
  className?: string;
}

export const TracingBeam = ({ children, className = '' }: TracingBeamProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 400,
    damping: 40,
    mass: 0.2,
  });

  const scaleY = smoothProgress;
  const dotScale = useTransform(smoothProgress, [0, 0.05, 1], [0.8, 1.1, 1]);

  return (
    <div ref={containerRef} className={`${styles.tracingContainer} ${className}`}>
      {/* Mobile Top Progress Bar */}
      <div className={styles.mobileProgress} aria-hidden="true">
        <motion.div
          className={styles.mobileFill}
          style={{ scaleX: smoothProgress, transformOrigin: '0% 50%' }}
        />
      </div>

      {/* Desktop Vertical Tracing Beam */}
      <div className={styles.beamWrapper} aria-hidden="true">
        <div className={styles.stickyTrack}>
          <motion.div
            className={styles.indicatorDot}
            style={{ scale: dotScale }}
          >
            <div className={styles.indicatorCore} />
          </motion.div>
          <div className={styles.trackLine}>
            <motion.div
              className={styles.fillLine}
              style={{
                height: '100%',
                scaleY,
                transformOrigin: 'top',
              }}
            />
          </div>
        </div>
      </div>

      {children}
    </div>
  );
};
