'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useTocActiveId } from '@/hooks/useTocActiveId';
import { useToc } from './TocContext';
import styles from './Toc.module.css';

export function Toc() {
  const entries = useToc();
  const ids = useMemo(() => entries.map((e) => e.id), [entries]);
  const activeId = useTocActiveId(ids);
  const listRef = useRef<HTMLUListElement | null>(null);
  const markerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const list = listRef.current;
    const marker = markerRef.current;
    if (!list || !marker) return;
    if (!activeId) {
      marker.style.opacity = '0';
      return;
    }
    const link = list.querySelector<HTMLAnchorElement>(
      `a[href="#${CSS.escape(activeId)}"]`,
    );
    if (!link) {
      marker.style.opacity = '0';
      return;
    }
    const linkRect = link.getBoundingClientRect();
    const listRect = list.getBoundingClientRect();
    marker.style.top = `${linkRect.top - listRect.top + 6}px`;
    marker.style.height = `${linkRect.height - 12}px`;
    marker.style.opacity = '1';
  }, [activeId]);

  if (!entries.length) return <aside className={styles.toc} aria-hidden="true" />;

  const roots = entries.filter((e) => e.level === 2);

  return (
    <aside className={styles.toc}>
      <nav aria-labelledby="toc-title">
        <div id="toc-title" className={styles.title}>本页目录</div>
        <div className={styles.scroll}>
          <div className={styles.marker} ref={markerRef} aria-hidden="true" />
          <ul className={styles.list} ref={listRef}>
            {roots.map((root, i) => {
              const start = entries.indexOf(root) + 1;
              const next = entries.findIndex((e, j) => j >= start && e.level === 2);
              const children = entries
                .slice(start, next === -1 ? entries.length : next)
                .filter((e) => e.level > 2);
              const childActive = children.some((c) => c.id === activeId);
              const isActive = activeId === root.id;
              return (
                <li key={`${root.id}-${i}`}>
                  <a
                    href={`#${root.id}`}
                    className={`${styles.link} ${isActive || childActive ? styles.linkActive : ''}`}
                    aria-current={isActive ? 'location' : undefined}
                  >
                    {root.text}
                  </a>
                  {children.length ? (
                    <ul className={`${styles.list} ${styles.nested}`}>
                      {children.map((child) => (
                        <li key={`${child.id}-${child.text}`}>
                          <a
                            href={`#${child.id}`}
                            className={`${styles.link} ${activeId === child.id ? styles.linkActive : ''}`}
                            aria-current={activeId === child.id ? 'location' : undefined}
                          >
                            {child.text}
                          </a>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    </aside>
  );
}
