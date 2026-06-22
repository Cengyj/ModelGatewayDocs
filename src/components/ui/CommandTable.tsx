'use client';

import { useState } from 'react';
import styles from './CommandTable.module.css';

type Row = { cmd: string; desc: string };

type Props = {
  rows: Row[];
  /** Column header labels. Defaults to ['命令', '说明']. Pass false to hide. */
  header?: [string, string] | false;
};

export function CommandTable({ rows, header = ['命令', '说明'] }: Props) {
  return (
    <div className={styles.card}>
      {header !== false && (
        <div className={`${styles.row} ${styles.headerRow}`}>
          <div className={styles.cmdCell}>{header[0]}</div>
          <div className={styles.descCell}>{header[1]}</div>
        </div>
      )}
      {rows.map((row, i) => (
        <CommandRow key={i} cmd={row.cmd} desc={row.desc} />
      ))}
    </div>
  );
}

function CommandRow({ cmd, desc }: Row) {
  const [state, setState] = useState<'idle' | 'copied'>('idle');

  function copy() {
    navigator.clipboard.writeText(cmd).then(() => {
      setState('copied');
      setTimeout(() => setState('idle'), 1600);
    });
  }

  return (
    <div className={styles.row}>
      <div className={styles.cmdCell}>
        <code className={styles.code}>{cmd}</code>
        <button
          type="button"
          className={`${styles.copyBtn} ${state === 'copied' ? styles.copied : ''}`}
          onClick={copy}
          aria-label={state === 'copied' ? '已复制' : '复制命令'}
          title={state === 'copied' ? '已复制！' : '复制'}
        >
          {state === 'copied' ? <CheckIcon /> : <CopyIcon />}
        </button>
      </div>
      <div className={styles.descCell}>{desc}</div>
    </div>
  );
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
