import Link from 'next/link';
import { resolveNav } from '@/lib/nav';
import styles from './Breadcrumbs.module.css';

type Props = { route: string };

export function Breadcrumbs({ route }: Props) {
  const nav = resolveNav(route);
  if (!nav) return null;

  return (
    <nav className={styles.breadcrumbs} aria-label="面包屑">
      <ol className={styles.list}>
        <li>
          <Link href="/" className={styles.link}>首页</Link>
        </li>
        {nav.groupLabel && nav.groupLabel !== nav.label ? (
          <>
            <li className={styles.sep} aria-hidden="true">/</li>
            <li>
              <span className={styles.group}>{nav.groupLabel}</span>
            </li>
          </>
        ) : null}
        <li className={styles.sep} aria-hidden="true">/</li>
        <li>
          <span className={styles.current}>{nav.label}</span>
        </li>
      </ol>
    </nav>
  );
}
