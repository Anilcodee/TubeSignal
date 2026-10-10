'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface FlipWordsProps {
  words: string[];
  duration?: number;
  className?: string;
}

export const FlipWords = ({
  words,
  duration = 2800,
  className = '',
}: FlipWordsProps) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const measureRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const [wordWidths, setWordWidths] = useState<number[]>([]);

  useEffect(() => {
    if (words.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentWordIndex((prev) => (prev + 1) % words.length);
    }, duration);

    return () => clearInterval(interval);
  }, [words, duration]);

  const currentWord = words[currentWordIndex] || '';

  useEffect(() => {
    const measure = () => {
      setWordWidths(words.map((_, index) => measureRefs.current[index]?.getBoundingClientRect().width || 0));
    };

    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    measureRefs.current.forEach((node) => { if (node) observer.observe(node); });
    return () => observer.disconnect();
  }, [words, className]);

  const fallbackWidth = `${Math.max(currentWord.length + 1, 2)}ch`;
  const measuredWidth = wordWidths[currentWordIndex] ? `${wordWidths[currentWordIndex] + 4}px` : fallbackWidth;

  return (
    <motion.span
      className={className}
      animate={{ width: measuredWidth }}
      transition={{ width: { duration: 0.28, ease: [0.22, 1, 0.36, 1] } }}
      style={{
        display: 'inline-grid',
        position: 'relative',
        verticalAlign: 'baseline',
      }}
    >
      <span aria-hidden="true" style={{ position: 'absolute', left: 0, top: 0, height: 0, overflow: 'hidden', visibility: 'hidden', whiteSpace: 'nowrap', pointerEvents: 'none' }}>
        {words.map((word, index) => (
          <span
            key={`${word}-${index}`}
            ref={(node) => { measureRefs.current[index] = node; }}
            style={{ display: 'inline-block', font: 'inherit', fontWeight: 'inherit' }}
          >
            {word}
          </span>
          ))}
        </span>
      <span aria-hidden="true" style={{ gridArea: '1 / 1', visibility: 'hidden', whiteSpace: 'nowrap' }}>
        {currentWord}
      </span>
      <AnimatePresence initial={false} mode="sync">
        <motion.span
          key={currentWord}
          initial={{ opacity: 0, y: 10, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          exit={{ opacity: 0, y: -10, filter: 'blur(4px)' }}
          transition={{
            duration: 0.28,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{ gridArea: '1 / 1', display: 'block', whiteSpace: 'nowrap' }}
        >
          {currentWord}
        </motion.span>
      </AnimatePresence>
    </motion.span>
  );
};
