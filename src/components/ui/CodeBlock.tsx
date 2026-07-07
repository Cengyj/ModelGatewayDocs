'use client';

import type { HTMLAttributes, ReactElement } from 'react';
import { Children, cloneElement, isValidElement, useEffect, useRef, useState } from 'react';
import styles from './CodeBlock.module.css';

type Props = HTMLAttributes<HTMLPreElement> & {
  'data-language'?: string;
  'data-theme'?: string;
};

/**
 * Wraps rehype-pretty-code output (<pre><code>...</code></pre>) in a
 * container with a hover toolbar (language label + copy + expand).
 * Highlighting is generated at build time by shiki.
 */
export function CodeBlock(props: Props) {
  const { children, className, ...rest } = props;
  const lang = (rest as Record<string, string>)['data-language'];
  const child = Children.only(children);
  const codeEl =
    isValidElement(child) && child.type === 'code'
      ? (child as ReactElement<HTMLAttributes<HTMLElement>>)
      : null;

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [expanded, setExpanded] = useState(false);

  // Esc to exit expanded mode
  useEffect(() => {
    if (!expanded) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setExpanded(false);
    }
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [expanded]);

  if (!codeEl) {
    return <pre className={className} {...rest}>{children}</pre>;
  }

  return (
    <div
      ref={wrapRef}
      className={`${styles.wrap} ${expanded ? styles.expanded : ''}`}
      data-code-block
    >
      <div className={styles.toolbar} aria-hidden={!expanded}>
        {lang ? <span className={styles.lang}>{lang}</span> : null}
        <div className={styles.actions}>
          <button
            type="button"
            className={styles.actionBtn}
            aria-label={expanded ? '退出全屏' : '展开全屏'}
            title={expanded ? '退出全屏 (Esc)' : '展开全屏'}
            onClick={() => setExpanded((v) => !v)}
          >
            {expanded ? <CollapseIcon /> : <ExpandIcon />}
          </button>
          <button
            type="button"
            className={`${styles.actionBtn} ${styles.copy}`}
            aria-label="复制代码"
            title="复制代码"
            data-code-copy
          >
            <CopyIcon />
          </button>
        </div>
      </div>
      <pre className={`${styles.pre} ${className ?? ''}`} {...rest}>
        {cloneElement(codeEl, {
          className: `${styles.code} ${codeEl.props.className ?? ''}`,
        })}
      </pre>
      {expanded ? (
        <button
          type="button"
          className={styles.expandedBackdrop}
          aria-label="关闭全屏"
          onClick={() => setExpanded(false)}
        />
      ) : null}
    </div>
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function ExpandIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
    </svg>
  );
}

function CollapseIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 14h6v6M20 10h-6V4M14 10l7-7M3 21l7-7" />
    </svg>
  );
}
