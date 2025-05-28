import React from 'react';
import styles from './LoadingSpinner.module.css';

type LoadingSpinnerProps = {
  message?: string;
};

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ message = 'Calculating...' }) => {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinner}>
        <div className={styles.pulse}></div>
      </div>
      <p className={styles.message}>{message}</p>
    </div>
  );
};

export default LoadingSpinner; 