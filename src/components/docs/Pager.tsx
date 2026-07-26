'use client';

import Link from 'next/link';
import { pageOrder, resolveNav } from '@/lib/nav';
import styles from './Pager.module.css';

type Props = { currentRoute: string };

export function Pager({ currentRoute }: Props) {
  const idx = pageOrder.indexOf(currentRoute);
  const prev = idx > 0 ? resolveNav(pageOrder[idx - 1]) : null;
  const next = idx >= 0 && idx < pageOrder.length - 1 ? resolveNav(pageOrder[idx + 1]) : null;

  if (!prev && !next) return null;

  return (
    <nav className={styles.pager} aria-label="上一页和下一页">
      {prev ? (
        <Link href={prev.route} rel="prev" className={`${styles.link} ${styles.prev}`}>
          <span className={styles.label}>上一页</span>
          <span className={styles.title}>{prev.label}</span>
        </Link>
      ) : <span />}
      {next ? (
        <Link href={next.route} rel="next" className={`${styles.link} ${styles.next}`}>
          <span className={styles.label}>下一页</span>
          <span className={styles.title}>{next.label}</span>
        </Link>
      ) : null}
    </nav>
  );
}
