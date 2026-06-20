'use client';

import { useState, type ReactNode } from 'react';
import styles from './Tabs.module.css';

type TabsProps = {
  defaultValue?: string;
  children: ReactNode;
};

type TabProps = {
  label: string;
  value: string;
  children: ReactNode;
};

/**
 * Lightweight tabs panel for platform-specific (Windows/macOS/Linux) etc. blocks.
 *
 * Usage in MDX:
 *   <Tabs defaultValue="mac">
 *     <Tab label="macOS" value="mac">...content...</Tab>
 *     <Tab label="Windows" value="win">...content...</Tab>
 *   </Tabs>
 */
export function Tabs({ defaultValue, children }: TabsProps) {
  // Flatten direct <Tab> children
  const tabs = (Array.isArray(children) ? children : [children])
    .filter((c): c is React.ReactElement<TabProps> => Boolean(c) && typeof c === 'object' && 'props' in c);
  const first = tabs[0]?.props.value;
  const [active, setActive] = useState(defaultValue ?? first ?? '');

  return (
    <div className={styles.tabs}>
      <div className={styles.tablist} role="tablist">
        {tabs.map((t) => (
          <button
            key={t.props.value}
            type="button"
            role="tab"
            aria-selected={active === t.props.value}
            className={`${styles.tab} ${active === t.props.value ? styles.tabActive : ''}`}
            onClick={() => setActive(t.props.value)}
          >
            {t.props.label}
          </button>
        ))}
      </div>
      <div className={styles.panels}>
        {tabs.map((t) => (
          <div
            key={t.props.value}
            role="tabpanel"
            hidden={active !== t.props.value}
            className={styles.panel}
          >
            {t.props.children}
          </div>
        ))}
      </div>
    </div>
  );
}

export function Tab(_props: TabProps): React.ReactElement | null {
  // Tab is a config-only component; rendering is done by parent <Tabs>.
  return null;
}
