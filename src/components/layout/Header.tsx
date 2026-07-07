'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { topNav, type TopNavItem } from '@/lib/nav';
import { ThemeSwitch } from './ThemeSwitch';
import { SearchButton } from '@/components/search/SearchButton';
import styles from './Header.module.css';

type Props = {
  onOpenSearch: () => void;
};

function normalize(path: string) {
  if (path === '/') return '/';
  return path.replace(/\/$/, '');
}

function isActive(item: TopNavItem, current: string): boolean {
  if (item.matchPrefix) {
    return current === item.matchPrefix || current.startsWith(item.matchPrefix + '/');
  }
  return current === item.route;
}

export function Header({ onOpenSearch }: Props) {
  const pathname = usePathname() ?? '/';
  const current = normalize(pathname);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={styles.bar}>
        <Link className={styles.brand} href="/" aria-label="foropencode 首页">
          <img src="/logo.svg" alt="" width={28} height={28} />
          <span>foropencode</span>
        </Link>
        <div className={styles.content}>
          <SearchButton onClick={onOpenSearch} />
          <nav className={styles.links} aria-label="Main Navigation">
            {topNav.map((item) => (
              <Link
                key={item.route}
                href={item.route}
                className={isActive(item, current) ? styles.active : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <ThemeSwitch />
          <button
            type="button"
            className={`${styles.hamburger} ${menuOpen ? styles.hamburgerOpen : ''}`}
            aria-label={menuOpen ? '关闭菜单' : '打开菜单'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>
      {menuOpen ? (
        <div className={styles.mobileMenu}>
          <button
            type="button"
            className={styles.mobileBackdrop}
            aria-label="关闭菜单"
            onClick={() => setMenuOpen(false)}
          />
          <div className={styles.mobilePanel}>
            <nav aria-label="移动端导航">
              {topNav.map((item) => (
                <Link
                  key={item.route}
                  href={item.route}
                  onClick={() => setMenuOpen(false)}
                  className={isActive(item, current) ? styles.active : undefined}
                >
                  {item.label}
                </Link>
              ))}
              <div className={styles.mobileAppearance}>
                <span>Appearance</span>
                <ThemeSwitch />
              </div>
            </nav>
          </div>
        </div>
      ) : null}
    </header>
  );
}
