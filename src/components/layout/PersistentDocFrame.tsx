'use client';

/**
 * Sidebar, Toc and MobileDocBar all live here in the persistent layout —
 * Next does not unmount layout.tsx on navigation, so these widgets keep
 * their state (filter input, parent expanded, scroll position, animations)
 * across page changes. Pages publish their per-route TOC via TocContext.
 *
 * Home (`/`) bypasses the doc grid entirely.
 */

import { usePathname } from 'next/navigation';
import { Sidebar } from './Sidebar';
import { Toc } from './Toc';
import { MobileDocBar } from './MobileDocBar';
import { TocProvider } from './TocContext';
import styles from '@/components/docs/DocLayout.module.css';
import type { ReactNode } from 'react';

export function PersistentDocFrame({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '/';
  const isHome = pathname === '/';

  if (isHome) {
    return <>{children}</>;
  }

  return (
    <TocProvider>
      <MobileDocBar />
      <div className={styles.grid}>
        <div className={styles.sidebarCol}>
          <Sidebar />
        </div>
        <div className={styles.pageSlot}>{children}</div>
        <div className={styles.tocCol}>
          <Toc />
        </div>
      </div>
    </TocProvider>
  );
}
