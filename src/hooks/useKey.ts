'use client';

import { useEffect } from 'react';

function isEditable(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false;
  return Boolean(target.closest('input, textarea, select, [contenteditable="true"]'));
}

/**
 * Global keyboard shortcut: fires `onMatch` when Cmd/Ctrl+K is pressed
 * outside of an editable element. Used for opening the search modal.
 */
export function useSearchHotkey(onMatch: () => void) {
  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      const key = event.key.toLowerCase();
      const isCmdK = (event.metaKey || event.ctrlKey) && key === 'k';
      const isSlash = event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey;
      if (isEditable(event.target)) return;
      if (isCmdK || isSlash) {
        event.preventDefault();
        onMatch();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onMatch]);
}
