'use client';

import { useEffect, useState } from 'react';

/**
 * Scroll-spy hook: tracks which heading id is currently considered "active"
 * based on viewport scroll position. Mirrors the source site's behavior:
 * the active heading is the last one whose top is above `scrollOffset`.
 */
export function useTocActiveId(ids: string[], scrollOffset = 134) {
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    if (!ids.length) return;

    function pick() {
      let current = '';
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top;
        if (top < scrollOffset) current = id;
        else break;
      }
      const nearBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 50;
      if (nearBottom && ids.length) current = ids[ids.length - 1];
      setActiveId((prev) => (prev === current ? prev : current));
    }

    pick();
    let raf = 0;
    const onScroll = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = requestAnimationFrame(pick);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    const onHash = () => {
      const id = decodeURIComponent(location.hash.replace(/^#/, ''));
      if (id && ids.includes(id)) setActiveId(id);
    };
    window.addEventListener('hashchange', onHash);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('hashchange', onHash);
    };
  }, [ids, scrollOffset]);

  return activeId;
}
