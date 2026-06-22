'use client';

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { TocEntry } from '@/lib/content';

/**
 * TOC entries are produced per-page (in page.tsx) but consumed by the
 * persistent shell (MobileDocBar in layout.tsx). Pages publish their toc
 * via this context; the shell reads it. The context provider is mounted
 * once in PersistentDocFrame so navigation doesn't tear it down.
 */

type Ctx = {
  toc: TocEntry[];
  setToc: (t: TocEntry[]) => void;
};

const TocCtx = createContext<Ctx>({ toc: [], setToc: () => {} });

export function TocProvider({ children }: { children: ReactNode }) {
  const [toc, setToc] = useState<TocEntry[]>([]);
  return <TocCtx.Provider value={{ toc, setToc }}>{children}</TocCtx.Provider>;
}

export function useToc(): TocEntry[] {
  return useContext(TocCtx).toc;
}

/** Page-side: publish this page's toc to the shell. */
export function PublishToc({ toc }: { toc: TocEntry[] }) {
  const { setToc } = useContext(TocCtx);
  useEffect(() => {
    setToc(toc);
    return () => setToc([]);
  }, [toc, setToc]);
  return null;
}
