import type { ReactNode } from 'react';
import styles from './Callout.module.css';

type Variant = 'info' | 'tip' | 'warning' | 'danger';

const ICONS: Record<Variant, ReactNode> = {
  info: <InfoIcon />,
  tip: <TipIcon />,
  warning: <WarningIcon />,
  danger: <DangerIcon />,
};

const TITLES: Record<Variant, string> = {
  info: '提示',
  tip: '建议',
  warning: '注意',
  danger: '警告',
};

type Props = {
  type?: Variant;
  title?: string;
  children: ReactNode;
};

export function Callout({ type = 'info', title, children }: Props) {
  return (
    <aside className={`${styles.callout} ${styles[type]}`} role="note">
      <div className={styles.head}>
        <span className={styles.icon} aria-hidden="true">{ICONS[type]}</span>
        <span className={styles.title}>{title ?? TITLES[type]}</span>
      </div>
      <div className={styles.body}>{children}</div>
    </aside>
  );
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  );
}

function TipIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.6 1 1.5 1 2.3v1h6v-1c0-.8.4-1.7 1-2.3A7 7 0 0 0 12 2z" />
    </svg>
  );
}

function WarningIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.3 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.41 0zM12 9v4M12 17h.01" />
    </svg>
  );
}

function DangerIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M15 9l-6 6M9 9l6 6" />
    </svg>
  );
}
