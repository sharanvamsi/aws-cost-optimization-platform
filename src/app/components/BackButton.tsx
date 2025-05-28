import { useRouter } from 'next/navigation';
import styles from './BackButton.module.css';

type BackButtonProps = {
  href: string;
};

export default function BackButton({ href }: BackButtonProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(href)}
      className={styles.backButton}
    >
      ← Back
    </button>
  );
} 