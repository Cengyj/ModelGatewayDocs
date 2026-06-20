'use client';

import { useEffect } from 'react';

/**
 * Attaches a single delegated click listener for `.copy` buttons inside
 * any code block. Copies the sibling <pre><code> text to the clipboard
 * and shows transient feedback via the .copied class.
 */
export function useCodeCopy() {
  useEffect(() => {
    async function onClick(event: MouseEvent) {
      const target = event.target as HTMLElement | null;
      const button = target?.closest('button[data-code-copy]') as HTMLButtonElement | null;
      if (!button) return;
      const pre = button.closest('[data-code-block]');
      const text = pre?.querySelector('pre code')?.textContent ?? '';
      if (!text) return;
      try {
        await navigator.clipboard.writeText(text);
      } catch {
        return;
      }
      button.classList.add('copied');
      window.setTimeout(() => button.classList.remove('copied'), 2000);
    }
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
}
