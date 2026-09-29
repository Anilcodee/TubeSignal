import React, { ReactNode, HTMLAttributes } from 'react';
import styles from './Card.module.css';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  headerAction?: ReactNode;
  hoverable?: boolean;
  gradientBorder?: boolean;
}

export const Card = ({
  children,
  title,
  subtitle,
  icon,
  headerAction,
  hoverable = false,
  gradientBorder = false,
  className = '',
  ...props
}: CardProps) => {
  return (
    <div
      className={`${styles.card} ${hoverable ? styles.hoverable : ''} ${
        gradientBorder ? styles.gradientBorder : ''
      } ${className}`}
      {...props}
    >
      {(title || icon || headerAction) && (
        <div className={styles.header}>
          <div className={styles.titleArea}>
            {icon && <div className={styles.iconWrapper}>{icon}</div>}
            <div>
              {title && <h3 className={styles.title}>{title}</h3>}
              {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
            </div>
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className={styles.content}>{children}</div>
    </div>
  );
};
