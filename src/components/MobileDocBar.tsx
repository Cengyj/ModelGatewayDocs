'use client';

import { useEffect, useRef, useState, type TouchEvent } from 'react';
import { Sidebar } from './Sidebar';
import { useToc } from './TocContext';
import styles from './MobileDocBar.module.css';

type Panel = 'menu' | 'toc' | null;

const SWIPE_THRESHOLD = 80;

export function MobileDocBar() {
  const toc = useToc();
  const [panel, setPanel] = useState<Panel>(null);
  const [animating, setAnimating] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);
  const panelRef = useRef<HTMLDivElement | null>(null);

  // Body scroll lock + Escape key
  useEffect(() => {
    if (!panel) return;
    document.body.style.overflow = 'hidden';
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setPanel(null);
    }
    document.addEventListener('keydown', onKey);
    // Force re-render after first paint so transform animates in
    requestAnimationFrame(() => setAnimating(true));
    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKey);
      setAnimating(false);
    };
  }, [panel]);

  const onTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };

  const onTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (touchStartX.current === null) return;
    const delta = e.touches[0].clientX - touchStartX.current;
    touchDeltaX.current = delta;
    if (panelRef.current) {
      const isMenu = panel === 'menu';
      // Menu drawer slides from the left, so dismiss-direction is negative
      const dir = isMenu ? Math.min(0, delta) : Math.max(0, delta);
      panelRef.current.style.transform = `translateX(${dir}px)`;
    }
  };

  const onTouchEnd = () => {
    const delta = touchDeltaX.current;
    touchStartX.current = null;
    touchDeltaX.current = 0;
    if (panelRef.current) panelRef.current.style.transform = '';
    if (Math.abs(delta) >= SWIPE_THRESHOLD) {
      setPanel(null);
    }
  };

  return (
    <>
      <div className={styles.bar}>
        <button
          type="button"
          aria-expanded={panel === 'menu'}
          className={panel === 'menu' ? styles.open : ''}
          onClick={() => setPanel((p) => (p === 'menu' ? null : 'menu'))}
        >
          <MenuIcon /> 菜单
        </button>
        {toc.length ? (
          <button
            type="button"
            aria-expanded={panel === 'toc'}
            className={panel === 'toc' ? styles.open : ''}
            onClick={() => setPanel((p) => (p === 'toc' ? null : 'toc'))}
          >
            本页目录
          </button>
        ) : null}
      </div>
      {panel ? (
        <div
          className={`${styles.overlay} ${panel === 'menu' ? styles.menuOverlay : styles.tocOverlay} ${animating ? styles.open : ''}`}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            className={styles.backdrop}
            aria-label="关闭"
            onClick={() => setPanel(null)}
          />
          <div
            className={styles.panel}
            ref={panelRef}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            <div className={styles.grabber} aria-hidden="true" />
            {panel === 'menu' ? (
              <Sidebar onNavigate={() => setPanel(null)} />
            ) : (
              <nav className={styles.tocNav}>
                <a href="#" onClick={() => setPanel(null)}>回到顶部</a>
                {toc.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className={styles[`level${item.level}`]}
                    onClick={() => setPanel(null)}
                  >
                    {item.text}
                  </a>
                ))}
              </nav>
            )}
          </div>
        </div>
      ) : null}
    </>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M3 12h18M3 18h18" />
    </svg>
  );
}
