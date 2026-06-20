'use client';

import { useCallback, useEffect, useState } from 'react';

export type Appearance = 'auto' | 'light' | 'dark';

const STORAGE_KEY = 'vitepress-theme-appearance';

function read(): Appearance {
  if (typeof window === 'undefined') return 'auto';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'auto') return stored;
  return 'auto';
}

function systemPrefersDark(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
}

/**
 * If the browser supports view transitions and the user hasn't opted out of
 * motion, run `fn` inside startViewTransition so background / text color
 * changes crossfade instead of flashing.
 */
function withViewTransition(fn: () => void) {
  type VT = { ready: Promise<void>; finished: Promise<void> };
  type Doc = Document & { startViewTransition?: (cb: () => void) => VT };
  if (typeof document === 'undefined') return fn();
  const doc = document as Doc;
  const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  if (reduced || typeof doc.startViewTransition !== 'function') {
    fn();
    return;
  }
  const vt = doc.startViewTransition(fn);
  // When a second transition fires before this one finishes, the browser
  // aborts it with AbortError: Transition was skipped. The DOM update still
  // happens correctly — suppress the unhandled rejection noise.
  vt.ready.catch(() => {});
  vt.finished.catch(() => {});
}

/**
 * Theme hook with tri-state appearance (auto/light/dark).
 * The choice persists in localStorage; system preference is honored when auto.
 * Toggling uses the View Transitions API when available so the change
 * crossfades instead of flickering.
 */
export function useTheme() {
  const [appearance, setAppearance] = useState<Appearance>('auto');
  const [systemDark, setSystemDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setAppearance(read());
    setSystemDark(systemPrefersDark());
    setMounted(true);
    const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
    const onChange = (e: MediaQueryListEvent) => setSystemDark(e.matches);
    mq?.addEventListener?.('change', onChange);
    return () => mq?.removeEventListener?.('change', onChange);
  }, []);

  const isDark = appearance === 'dark' || (appearance === 'auto' && systemDark);

  useEffect(() => {
    if (!mounted) return;
    window.localStorage.setItem(STORAGE_KEY, appearance);
    // The class toggle is what visually flips the palette. Wrapping it in a
    // view transition lets the browser snapshot the old paint and crossfade
    // into the new one.
    withViewTransition(() => {
      document.documentElement.classList.toggle('dark', isDark);
    });
  }, [appearance, isDark, mounted]);

  const toggle = useCallback(() => {
    setAppearance((current) => {
      const effectiveDark = current === 'dark' || (current === 'auto' && systemPrefersDark());
      if (effectiveDark) return current === 'dark' ? 'auto' : 'light';
      return 'dark';
    });
  }, []);

  return { appearance, isDark, toggle, mounted } as const;
}
