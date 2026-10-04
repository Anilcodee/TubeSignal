// src/utils/animations.ts
import { Variants } from 'framer-motion';

// KPI card entrance animation (staggered)
export const kpiCardVariant: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: custom * 0.06,
      duration: 0.4,
      ease: 'easeOut',
    },
  }),
};

// Generic fade-in for any element
export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
};

// Slide-up with fade-in
export const slideUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
};

// Subtle pulse for accent elements
export const pulse: Variants = {
  animate: {
    scale: [1, 1.05, 1],
    transition: { repeat: Infinity, duration: 1.5, ease: 'easeInOut' },
  },
};
