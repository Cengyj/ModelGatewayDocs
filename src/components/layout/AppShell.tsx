'use client';

import { useState, type ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { ServiceWorker } from './ServiceWorker';
import { SearchModal } from '@/components/search/SearchModal';
import { ScrollProgress } from '@/components/ui/ScrollProgress';
import { BackToTop } from '@/components/ui/BackToTop';
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
      <a href="#main-content" className={styles.skipLink}>跳到正文</a>
      <ScrollProgress />
      <Header onOpenSearch={() => setSearchOpen(true)} />
      <main id="main-content" className={styles.main}>{children}</main>
      <Footer />
      <BackToTop />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
      <ServiceWorker />
    </div>
  );
}
