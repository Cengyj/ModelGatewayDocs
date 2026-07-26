import type { ReactNode } from 'react';
import Link from 'next/link';
import styles from './Feature.module.css';

type FeatureProps = {
  icon?: ReactNode;
  title: string;
  details: string;
  href: string;
  external?: boolean;
};

export function Feature({ icon, title, details, href, external }: FeatureProps) {
  const Comp: React.ElementType = external ? 'a' : Link;
  const extra = external ? { target: '_blank', rel: 'noopener noreferrer' } : {};
  return (
    <Comp href={href} className={styles.feature} {...extra}>
      <article className={styles.box}>
        {icon ? <div className={styles.icon} aria-hidden="true">{icon}</div> : null}
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.details}>{details}</p>
      </article>
    </Comp>
  );
}

export function FeatureGrid({ children }: { children: ReactNode }) {
  return (
    <section className={styles.grid}>
      <div className={styles.gridInner}>{children}</div>
    </section>
  );
}
