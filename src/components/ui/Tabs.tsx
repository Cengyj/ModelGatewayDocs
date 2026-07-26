'use client';

import { useId, useRef, useState, type ReactNode } from 'react';
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
  const baseId = useId();
  const tablistRef = useRef<HTMLDivElement>(null);

  const tabId = (v: string) => `${baseId}-tab-${v}`;
  const panelId = (v: string) => `${baseId}-panel-${v}`;

  // Roving tabindex: ArrowLeft/ArrowRight move focus and activate.
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    const idx = tabs.findIndex((t) => t.props.value === active);
    if (idx === -1) return;
    e.preventDefault();
    const delta = e.key === 'ArrowRight' ? 1 : -1;
    const next = tabs[(idx + delta + tabs.length) % tabs.length].props.value;
    setActive(next);
    tablistRef.current
      ?.querySelector<HTMLButtonElement>(`[id="${tabId(next)}"]`)
      ?.focus();
  };

  return (
    <div className={styles.tabs}>
      <div className={styles.tablist} role="tablist" ref={tablistRef} onKeyDown={onKeyDown}>
        {tabs.map((t) => (
          <button
            key={t.props.value}
            id={tabId(t.props.value)}
            type="button"
            role="tab"
            aria-selected={active === t.props.value}
            aria-controls={panelId(t.props.value)}
            tabIndex={active === t.props.value ? 0 : -1}
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
            id={panelId(t.props.value)}
            role="tabpanel"
            aria-labelledby={tabId(t.props.value)}
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
