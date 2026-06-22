import type { ReactNode } from 'react';
import styles from './HomeLayout.module.css';

export function HomeLayout({ children }: { children: ReactNode }) {
  return <div className={styles.home}>{children}</div>;
}

export function HomeProse({ children }: { children: ReactNode }) {
  return (
    <div className={styles.proseWrap}>
      <div className={`prose ${styles.prose}`}>{children}</div>
    </div>
  );
}
