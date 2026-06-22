'use client';

import { useEffect, useState } from 'react';
import styles from './SearchButton.module.css';

type Props = { onClick: () => void };

export function SearchButton({ onClick }: Props) {
  const [mac, setMac] = useState(false);
  useEffect(() => {
    setMac(/Mac|iPhone|iPod|iPad/i.test(navigator.platform));
  }, []);
  return (
    <button type="button" className={styles.button} onClick={onClick}>
      <span className={styles.icon} aria-hidden="true">
        <SearchIcon />
      </span>
      <span className={styles.placeholder}>搜索文档</span>
      <span className={styles.keys} aria-hidden="true" suppressHydrationWarning>
        <kbd>{mac ? '⌘' : 'Ctrl'}</kbd>
        <kbd>K</kbd>
      </span>
    </button>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
