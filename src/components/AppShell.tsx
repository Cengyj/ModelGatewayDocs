'use client';

import { useState, type ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { SearchModal } from './SearchModal';
import { ScrollProgress } from './ScrollProgress';
import { BackToTop } from './BackToTop';
import { ServiceWorker } from './ServiceWorker';
import { useSearchHotkey } from '@/hooks/useKey';
import { useCodeCopy } from '@/hooks/useCodeCopy';
import styles from './AppShell.module.css';

type Props = {
  children: ReactNode;
};

export function AppShell({ children }: Props) {
  const [searchOpen, setSearchOpen] = useState(false);
  useSearchHotkey(() => setSearchOpen(true));
  useCodeCopy();

  return (
    <div className={styles.shell}>
      <ScrollProgress />
      <Header onOpenSearch={() => setSearchOpen(true)} />
      <main className={styles.main}>{children}</main>
      <Footer />
      <BackToTop />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      <ServiceWorker />
    </div>
  );
}
