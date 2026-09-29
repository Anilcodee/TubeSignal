'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, CheckCircle2, CircleDashed, Sparkles } from 'lucide-react';
import { ProgressBar } from '@/components/ui/ProgressBar';
import styles from './loading.module.css';

export default function Loading() {
  const [progress, setProgress] = useState(15);
  const [step, setStep] = useState(1);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setProgress(45);
      setStep(2);
    }, 1200);

    const timer2 = setTimeout(() => {
      setProgress(78);
      setStep(3);
    }, 2800);

    const timer3 = setTimeout(() => {
      setProgress(94);
      setStep(4);
    }, 4500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, []);

  return (
    <div className={styles.loadingContainer}>
      <div className={styles.loadingCard}>
        <div className={styles.header}>
          <div className={styles.spinnerWrapper}>
            <Loader2 size={22} style={{ animation: 'spin 1.2s linear infinite' }} />
          </div>
          <div>
            <h3 className={styles.title}>Analyzing YouTube Channel</h3>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-text-secondary)' }}>
              Extracting SerpApi metrics & querying Gemini AI
            </span>
          </div>
        </div>

        <ProgressBar progress={progress} label="Pipeline Progress" />

        <div className={styles.stepsList}>
          <div className={styles.stepItem}>
            <div className={styles.stepLeft}>
              {step > 1 ? (
                <CheckCircle2 size={16} color="#34d399" />
              ) : (
                <Loader2 size={16} color="#7c5cfc" style={{ animation: 'spin 1s linear infinite' }} />
              )}
              <span>1. Resolving YouTube Channel Data (SerpApi)</span>
            </div>
            <span className={styles.stepStatus}>{step > 1 ? 'Done' : 'Running'}</span>
          </div>

          <div className={styles.stepItem}>
            <div className={styles.stepLeft}>
              {step > 2 ? (
                <CheckCircle2 size={16} color="#34d399" />
              ) : step === 2 ? (
                <Loader2 size={16} color="#7c5cfc" style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <CircleDashed size={16} color="#55556a" />
              )}
              <span>2. Normalizing Video Catalog & Metrics</span>
            </div>
            <span className={styles.stepStatus}>{step > 2 ? 'Done' : step === 2 ? 'Running' : 'Pending'}</span>
          </div>

          <div className={styles.stepItem}>
            <div className={styles.stepLeft}>
              {step > 3 ? (
                <CheckCircle2 size={16} color="#34d399" />
              ) : step === 3 ? (
                <Loader2 size={16} color="#7c5cfc" style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <CircleDashed size={16} color="#55556a" />
              )}
              <span>3. AI Content Themes & Title Clustering</span>
            </div>
            <span className={styles.stepStatus}>{step > 3 ? 'Done' : step === 3 ? 'Running' : 'Pending'}</span>
          </div>

          <div className={styles.stepItem}>
            <div className={styles.stepLeft}>
              {step >= 4 ? (
                <Sparkles size={16} color="#7c5cfc" />
              ) : (
                <CircleDashed size={16} color="#55556a" />
              )}
              <span>4. Synthesizing Strategic Blueprint</span>
            </div>
            <span className={styles.stepStatus}>{step >= 4 ? 'Finalizing' : 'Pending'}</span>
          </div>
        </div>

        <p className={styles.tipBox}>
          &ldquo;Tip: TubeSignal extracts patterns across recent video titles to identify what generates above-average views.&rdquo;
        </p>
      </div>
    </div>
  );
}
