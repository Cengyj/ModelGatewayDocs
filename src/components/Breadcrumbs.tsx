import Link from 'next/link';
import { findGroup, findItem } from '@/lib/nav';
import styles from './Breadcrumbs.module.css';

type Props = { route: string };

export function Breadcrumbs({ route }: Props) {
  const group = findGroup(route);
  const item = findItem(route);
  if (!group || !item) return null;

  return (
    <nav className={styles.breadcrumbs} aria-label="面包屑">
      <ol className={styles.list}>
        <li>
          <Link href="/" className={styles.link}>首页</Link>
        </li>
        <li className={styles.sep} aria-hidden="true">/</li>
        <li>
          <span className={styles.group}>{group.label}</span>
        </li>
        <li className={styles.sep} aria-hidden="true">/</li>
        <li>
          <span className={styles.current}>{item.label}</span>
        </li>
      </ol>
    </nav>
  );
}
