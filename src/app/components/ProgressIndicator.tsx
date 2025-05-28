import styles from './ProgressIndicator.module.css';

type Step = {
  number: number;
  title: string;
  path: string;
};

const steps: Step[] = [
  { number: 1, title: 'Upload Files', path: '/' },
  { number: 2, title: 'Customer Info', path: '/customer-info' },
  { number: 3, title: 'Additional Info', path: '/extra-info' },
  { number: 4, title: 'Results', path: '/results' },
  { number: 5, title: 'Forecast', path: '/forecast' },
  { number: 6, title: 'New Customer', path: '/new-customer-forecast' },
];

type ProgressIndicatorProps = {
  currentPath: string;
};

export default function ProgressIndicator({ currentPath }: ProgressIndicatorProps) {
  const currentStepIndex = steps.findIndex(step => step.path === currentPath);
  
  return (
    <div className={styles.progressContainer}>
      <div className={styles.steps}>
        {steps.map((step, index) => {
          const isActive = index === currentStepIndex;
          const isCompleted = index < currentStepIndex;
          
          return (
            <div key={step.number} className={styles.stepWrapper}>
              <div
                className={`${styles.step} ${isActive ? styles.active : ''} ${isCompleted ? styles.completed : ''}`}
              >
                <div className={styles.stepNumber}>
                  {isCompleted ? '✓' : step.number}
                </div>
                <div className={styles.stepTitle}>{step.title}</div>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`${styles.connector} ${isCompleted ? styles.completed : ''}`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
} 