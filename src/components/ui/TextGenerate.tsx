'use client';

import { motion } from 'framer-motion';
import { useMemo } from 'react';

interface TextGenerateProps {
  words: string;
  className?: string;
  delayPerWord?: number;
  initialDelay?: number;
}

export const TextGenerate = ({
  words,
  className = '',
  delayPerWord = 0.022,
  initialDelay = 0.1,
}: TextGenerateProps) => {
  const wordsArray = useMemo(() => words.split(' '), [words]);

  return (
    <span className={className}>
      {wordsArray.map((word, idx) => (
        <motion.span
          key={`${word}-${idx}`}
          initial={{ opacity: 0, y: 4, filter: 'blur(4px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{
            duration: 0.25,
            delay: initialDelay + idx * delayPerWord,
            ease: [0.22, 1, 0.36, 1],
          }}
          style={{ display: 'inline-block', marginRight: '0.28em' }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
};
