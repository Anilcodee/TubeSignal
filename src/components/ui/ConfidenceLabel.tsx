import styles from './ConfidenceLabel.module.css';

interface ConfidenceLabelProps {
  sampleSize: number;
  detail?: string;
  className?: string;
}

export const ConfidenceLabel = ({ sampleSize, detail, className = '' }: ConfidenceLabelProps) => {
  const level = sampleSize >= 8 ? 'Strong signal' : sampleSize >= 4 ? 'Directional' : sampleSize >= 2 ? 'Early signal' : 'Limited data';
  const tone = sampleSize >= 8 ? styles.strong : sampleSize >= 4 ? styles.directional : styles.early;

  return (
    <span className={`${styles.label} ${tone} ${className}`} title={`${level}${detail ? ` · ${detail}` : ''}`}>
      <span className={styles.dot} aria-hidden="true" />
      <strong>{level}</strong>
      {detail && <small>{detail}</small>}
    </span>
  );
};
