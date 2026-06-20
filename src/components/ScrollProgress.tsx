'use client';

import { useEffect, useState } from 'react';
import styles from './ScrollProgress.module.css';

/**
 * Thin fixed progress bar at the top of the viewport indicating how far the
 * reader has scrolled through the current page. Clicking it smooth-scrolls
 * back to the top. Hidden when the document is too short to scroll.
 */
export function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    function update() {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      if (max <= 60) {
        setVisible(false);
        return;
      }
      setVisible(true);
      const p = Math.min(1, Math.max(0, window.scrollY / max));
      setProgress(p);
    }
    update();
    let raf = 0;
    function onScroll() {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(update);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  if (!visible) return null;

  return (
    <button
      type="button"
      aria-label="返回顶部"
      title="返回顶部"
      className={styles.bar}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
    >
      <span className={styles.fill} style={{ transform: `scaleX(${progress})` }} />
    </button>
  );
}
