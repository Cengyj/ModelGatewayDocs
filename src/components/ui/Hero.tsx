import type { ReactNode } from 'react';
import Link from 'next/link';
import styles from './Hero.module.css';

type Action = {
  label: string;
  href: string;
  variant?: 'primary' | 'secondary';
};

type Props = {
  name?: string;
  text: string;
  tagline?: string;
  actions?: Action[];
  children?: ReactNode;
};

export function Hero({ name, text, tagline, actions }: Props) {
  return (
    <section className={styles.hero}>
      <div className={styles.inner}>
        <h1 className={styles.heading}>
          {name ? <span className={styles.name}>{name}</span> : null}
          <span className={styles.text}>{text}</span>
        </h1>
        {tagline ? <p className={styles.tagline}>{tagline}</p> : null}
        {actions?.length ? (
          <div className={styles.actions}>
            {actions.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className={`${styles.button} ${a.variant === 'secondary' ? styles.secondary : styles.primary}`}
              >
                {a.label}
              </Link>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
