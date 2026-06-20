import { site } from '@/lib/site';
import styles from './Footer.module.css';

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.message}>{site.footer.message}</p>
        <p className={styles.copyright}>{site.footer.copyright}</p>
      </div>
    </footer>
  );
}
