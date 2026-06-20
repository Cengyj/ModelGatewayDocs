import Link from 'next/link';
import { findItem } from '@/lib/nav';
import styles from './RelatedPages.module.css';

type Item = { route: string; label?: string; hint?: string };

type Props = {
  title?: string;
  items: Item[];
};

/**
 * Bottom-of-page navigation hint. Resolves labels from nav.ts so they stay
 * in sync; you can override the label per item.
 *
 * <RelatedPages
 *   title="接下来要不要看"
 *   items={[
 *     { route: '/cc-switch', hint: '统一管理 7 个客户端' },
 *     { route: '/codex', hint: 'OpenAI 系列模型' },
 *   ]}
 * />
 */
export function RelatedPages({ title = '相关页面', items }: Props) {
  if (!items.length) return null;
  return (
    <section className={styles.section} aria-label={title}>
      <h3 className={styles.title}>{title}</h3>
      <div className={styles.grid}>
        {items.map((item) => {
          const known = findItem(item.route);
          const label = item.label ?? known?.label ?? item.route;
          return (
            <Link key={item.route} href={item.route} className={styles.card}>
              <div className={styles.cardHead}>
                <span className={styles.cardLabel}>{label}</span>
                <ArrowIcon />
              </div>
              {item.hint ? <p className={styles.cardHint}>{item.hint}</p> : null}
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M13 5l7 7-7 7" />
    </svg>
  );
}
