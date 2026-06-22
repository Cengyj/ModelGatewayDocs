'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { topNav } from '@/lib/nav';
import styles from './SearchModal.module.css';

/** Quick links shown in the empty state (before any query is typed). */
const QUICK_LINKS = topNav.filter((n) => n.route !== '/');

type SearchDoc = {
  route: string;
  title: string;
  headings: Array<{ id: string; text: string; level: number }>;
  text: string;
};

type SearchHit = {
  route: string;
  routeHash: string;
  titles: string[];
  snippet?: string;
};

type Props = {
  open: boolean;
  onClose: () => void;
};

const RECENT_KEY = 'foropencode.recent.search';
const RECENT_CAP = 5;

function loadRecents(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string').slice(0, RECENT_CAP) : [];
  } catch {
    return [];
  }
}

function saveRecent(q: string) {
  if (typeof window === 'undefined') return;
  const trimmed = q.trim();
  if (!trimmed) return;
  const current = loadRecents();
  const next = [trimmed, ...current.filter((r) => r !== trimmed)].slice(0, RECENT_CAP);
  try {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
  } catch {}
}

export function SearchModal({ open, onClose }: Props) {
  const [query, setQuery] = useState('');
  const [docs, setDocs] = useState<SearchDoc[] | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recents, setRecents] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const router = useRouter();
  const trimmed = query.trim();

  useEffect(() => {
    if (!open || docs) return;
    fetch('/search-index.json')
      .then((r) => r.json())
      .then((data: SearchDoc[]) => setDocs(data))
      .catch(() => setDocs([]));
  }, [open, docs]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setRecents(loadRecents());
      setTimeout(() => inputRef.current?.focus(), 20);
    }
  }, [open]);

  const commitRecent = (q: string) => {
    saveRecent(q);
    setRecents(loadRecents());
  };

  const clearRecents = () => {
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.removeItem(RECENT_KEY);
      } catch {}
    }
    setRecents([]);
  };

  const hits = useMemo<SearchHit[]>(() => {
    if (!docs || !trimmed) return [];
    const needle = trimmed.toLowerCase();
    const results: Array<SearchHit & { score: number }> = [];
    for (const doc of docs) {
      // Title-level hit
      const titleScore = scoreText(doc.title.toLowerCase(), needle);
      if (titleScore > 0) {
        results.push({
          route: doc.route,
          routeHash: doc.route,
          titles: [doc.title],
          score: titleScore + 500,
        });
      }
      // Heading-level hits
      for (const h of doc.headings) {
        const s = scoreText(h.text.toLowerCase(), needle);
        if (s > 0) {
          const route = doc.route === '/' ? `/#${h.id}` : `${doc.route}#${h.id}`;
          results.push({
            route: doc.route,
            routeHash: route,
            titles: doc.route === '/' ? [h.text] : [doc.title, h.text],
            score: s,
          });
        }
      }
      // Body snippet (lower priority)
      const idx = doc.text.toLowerCase().indexOf(needle);
      if (idx >= 0) {
        const start = Math.max(0, idx - 40);
        const end = Math.min(doc.text.length, idx + needle.length + 80);
        results.push({
          route: doc.route,
          routeHash: doc.route,
          titles: [doc.title],
          snippet: doc.text.slice(start, end),
          score: 50,
        });
      }
    }
    // dedupe by routeHash, keep highest score
    const byHash = new Map<string, SearchHit & { score: number }>();
    for (const r of results) {
      const existing = byHash.get(r.routeHash);
      if (!existing || existing.score < r.score) byHash.set(r.routeHash, r);
    }
    return [...byHash.values()].sort((a, b) => b.score - a.score).slice(0, 20);
  }, [docs, trimmed]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [trimmed]);

  useEffect(() => {
    if (!open) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowDown' && hits.length) {
        event.preventDefault();
        setSelectedIndex((i) => (i + 1) % hits.length);
      }
      if (event.key === 'ArrowUp' && hits.length) {
        event.preventDefault();
        setSelectedIndex((i) => (i - 1 + hits.length) % hits.length);
      }
      if (event.key === 'Enter' && hits[selectedIndex]) {
        event.preventDefault();
        commitRecent(trimmed);
        router.push(hits[selectedIndex].routeHash);
        onClose();
      }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, hits, selectedIndex, onClose, router]);

  if (!open) return null;

  return (
    <div className={styles.overlay} role="dialog" aria-label="搜索文档" aria-modal="true">
      <button type="button" className={styles.backdrop} aria-label="关闭搜索" onClick={onClose} />
      <div className={styles.panel}>
        <div className={styles.form}>
          <SearchIcon />
          <input
            ref={inputRef}
            type="text"
            className={styles.input}
            placeholder="搜索文档"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            type="button"
            className={styles.close}
            onClick={() => (query ? setQuery('') : onClose())}
            aria-label={query ? '清除' : '关闭'}
          >
            {query ? <ClearIcon /> : 'esc'}
          </button>
        </div>
        <ul className={styles.results} role="listbox">
          {!trimmed ? (
            <li className={styles.emptyState}>
              {recents.length > 0 ? (
                <div className={styles.section}>
                  <div className={styles.sectionHead}>
                    <span>最近搜索</span>
                    <button type="button" className={styles.recentsClear} onClick={clearRecents}>
                      清除
                    </button>
                  </div>
                  <div className={styles.recentsRow}>
                    {recents.map((r) => (
                      <button
                        key={r}
                        type="button"
                        className={styles.recentChip}
                        onClick={() => {
                          setQuery(r);
                          setTimeout(() => inputRef.current?.focus(), 0);
                        }}
                      >
                        <ClockIcon />
                        {r}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              <div className={styles.section}>
                <div className={styles.sectionHead}>
                  <span>快速跳转</span>
                </div>
                <div className={styles.quickGrid}>
                  {QUICK_LINKS.map((link) => (
                    <Link
                      key={link.route}
                      href={link.route}
                      className={styles.quickLink}
                      onClick={onClose}
                    >
                      <span className={styles.quickIcon} aria-hidden="true">
                        <ArrowIcon />
                      </span>
                      {link.label}
                    </Link>
                  ))}
                </div>
              </div>
            </li>
          ) : null}
          {trimmed && hits.length === 0 ? (
            <li className={styles.empty}>
              <span className={styles.emptyIcon} aria-hidden="true"><SearchIcon /></span>
              <span>未找到与「{trimmed}」匹配的内容</span>
              <span className={styles.emptyHint}>试试更换关键词，或浏览上方的快速跳转</span>
            </li>
          ) : null}
          {hits.map((hit, i) => (
            <li key={`${hit.routeHash}-${i}`} role="option" aria-selected={i === selectedIndex}>
              <Link
                href={hit.routeHash}
                className={`${styles.hit} ${i === selectedIndex ? styles.hitActive : ''}`}
                onMouseEnter={() => setSelectedIndex(i)}
                onClick={() => {
                  commitRecent(trimmed);
                  onClose();
                }}
              >
                <span className={styles.hitTitles}>
                  <span className={styles.hashIcon} aria-hidden="true">#</span>
                  {hit.titles.map((t, j) => (
                    <span key={j} className={j === hit.titles.length - 1 ? styles.hitMain : styles.hitParent}>
                      {markQuery(t, trimmed)}
                      {j < hit.titles.length - 1 ? <ChevronIcon /> : null}
                    </span>
                  ))}
                </span>
                {hit.snippet ? (
                  <span className={styles.hitSnippet}>…{markQuery(hit.snippet, trimmed)}…</span>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
        <div className={styles.footer}>
          <span><kbd>↑</kbd><kbd>↓</kbd> 切换</span>
          <span><kbd>↵</kbd> 选择</span>
          <span><kbd>esc</kbd> 关闭</span>
        </div>
      </div>
    </div>
  );
}

function scoreText(haystack: string, needle: string): number {
  const idx = haystack.indexOf(needle);
  if (idx < 0) return 0;
  let s = 100 - idx;
  if (haystack === needle) s += 200;
  // word boundary bonus
  if (idx === 0 || /[\s\W]/.test(haystack[idx - 1])) s += 30;
  return Math.max(s, 1);
}

function markQuery(text: string, query: string) {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className={styles.mark}>{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.icon}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

function ClearIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.chevron}>
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17 17 7M9 7h8v8" />
    </svg>
  );
}
