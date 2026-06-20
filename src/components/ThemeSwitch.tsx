'use client';

import { useTheme } from '@/hooks/useTheme';
import styles from './ThemeSwitch.module.css';

export function ThemeSwitch() {
  const { isDark, toggle, mounted } = useTheme();
  // suppressHydrationWarning so the icon swap doesn't trigger SSR mismatch
  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? '切换到亮色主题' : '切换到暗色主题'}
      className={styles.switch}
      onClick={toggle}
      suppressHydrationWarning
    >
      <span className={styles.knob}>
        <span className={styles.icon} aria-hidden="true">
          {mounted ? (isDark ? <MoonIcon /> : <SunIcon />) : <SunIcon />}
        </span>
      </span>
    </button>
  );
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
