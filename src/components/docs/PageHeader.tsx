import type { ReactNode } from 'react';
import styles from './PageHeader.module.css';

type Props = {
  useCase?: ReactNode;
  audience?: ReactNode;
  tldr?: ReactNode;
};

/**
 * Three-cell info strip placed just below the H1 on quickstart pages.
 * Each cell is optional; the strip auto-collapses cells that are empty.
 */
export function PageHeader({ useCase, audience, tldr }: Props) {
  if (!useCase && !audience && !tldr) return null;
  return (
    <div className={styles.strip}>
      {useCase ? (
        <div className={styles.cell}>
          <div className={styles.label}>适用场景</div>
          <div className={styles.value}>{useCase}</div>
        </div>
      ) : null}
      {audience ? (
        <div className={styles.cell}>
          <div className={styles.label}>面向读者</div>
          <div className={styles.value}>{audience}</div>
        </div>
      ) : null}
      {tldr ? (
        <div className={styles.cell}>
          <div className={styles.label}>TL;DR</div>
          <div className={styles.value}>{tldr}</div>
        </div>
      ) : null}
    </div>
  );
}
