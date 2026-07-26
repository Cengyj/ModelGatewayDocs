'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMemo, useState, type ReactNode } from 'react';
import { sidebar, type NavItem } from '@/lib/nav';
import styles from './Sidebar.module.css';

/** Highlight `needle` inside `text` with a <mark> wrapper. Case-insensitive,
    matches one occurrence (the first). Returns the original string when there's
    no match — so a non-filtering render is identical to the old behaviour. */
function highlight(text: string, needle: string): ReactNode {
  if (!needle) return text;
  const idx = text.toLowerCase().indexOf(needle.toLowerCase());
  if (idx < 0) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className={styles.mark}>{text.slice(idx, idx + needle.length)}</mark>
      {text.slice(idx + needle.length)}
    </>
  );
}

function normalize(path: string) {
  if (path === '/') return '/';
  return path.replace(/\/$/, '');
}

/** Route matches itself or any of its children. Used to compute "current parent". */
function matchItem(item: NavItem, current: string): boolean {
  if (stripHash(item.route) === current) return true;
  return item.children?.some((c) => stripHash(c.route) === current) ?? false;
}

function stripHash(route: string): string {
  const hashAt = route.indexOf('#');
  return hashAt >= 0 ? route.slice(0, hashAt) : route;
}

function filterItem(item: NavItem, needle: string): NavItem | null {
  const labelHit = item.label.toLowerCase().includes(needle) || item.route.toLowerCase().includes(needle);
  if (!item.children?.length) {
    return labelHit ? item : null;
  }
  const childHits = item.children.filter((c) => c.label.toLowerCase().includes(needle) || c.route.toLowerCase().includes(needle));
  if (labelHit) return item; // parent matches → keep all children
  if (childHits.length) return { ...item, children: childHits };
  return null;
}

type Props = {
  onNavigate?: () => void;
};

export function Sidebar({ onNavigate }: Props) {
  const pathname = usePathname() ?? '/';
  const current = normalize(pathname);
  const activeGroupLabel = useMemo(() => {
    for (const g of sidebar) {
      for (const it of g.items) {
        if (matchItem(it, current)) return g.label;
      }
    }
    return undefined;
  }, [current]);
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const [itemOverrides, setItemOverrides] = useState<Record<string, boolean>>({});
  const [filter, setFilter] = useState('');

  const isExpanded = (label: string) => {
    if (filter.trim()) return true;
    if (Object.prototype.hasOwnProperty.call(overrides, label)) return overrides[label];
    return label === activeGroupLabel;
  };

  const isItemExpanded = (route: string, hasActiveChild: boolean) => {
    if (filter.trim()) return true;
    if (Object.prototype.hasOwnProperty.call(itemOverrides, route)) return itemOverrides[route];
    return hasActiveChild;
  };

  const toggle = (label: string) =>
    setOverrides((prev) => ({ ...prev, [label]: !isExpanded(label) }));

  const toggleItem = (route: string, hasActiveChild: boolean) =>
    setItemOverrides((prev) => ({ ...prev, [route]: !isItemExpanded(route, hasActiveChild) }));

  const filtered = useMemo(() => {
    const needle = filter.trim().toLowerCase();
    if (!needle) return sidebar.map((g) => ({ group: g, items: g.items }));
    return sidebar
      .map((g) => {
        const groupMatch = g.label.toLowerCase().includes(needle);
        const items = groupMatch
          ? g.items
          : g.items.map((i) => filterItem(i, needle)).filter((x): x is NavItem => x !== null);
        return { group: g, items };
      })
      .filter((x) => x.items.length > 0);
  }, [filter]);

  const hitCount = filtered.reduce((sum, x) => sum + x.items.length, 0);
  const filtering = filter.trim().length > 0;

  return (
    <aside className={styles.sidebar}>
      <span className="visually-hidden">侧边栏导航</span>
      <div className={styles.filterWrap}>
        <span className={styles.filterIcon} aria-hidden="true">
          <SearchIcon />
        </span>
        <input
          type="text"
          className={styles.filter}
          placeholder="筛选侧栏"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          aria-label="筛选侧栏条目"
        />
        {filtering ? (
          <>
            <span className={styles.filterCount} aria-live="polite">{hitCount}</span>
            <button
              type="button"
              className={styles.filterClear}
              aria-label="清除筛选"
              onClick={() => setFilter('')}
            >
              <ClearIcon />
            </button>
          </>
        ) : null}
      </div>
      <nav aria-label="文档侧边栏">
        {filtered.length === 0 ? (
          <p className={styles.empty}>没有匹配的条目</p>
        ) : null}
        {filtered.map(({ group, items }) => {
          const expanded = isExpanded(group.label);
          const hasActive = group.label === activeGroupLabel;
          return (
            <section
              key={group.label}
              className={`${styles.group} ${hasActive ? styles.hasActive : ''} ${
                expanded ? '' : styles.collapsed
              }`}
            >
              {group.route ? (
                <div className={styles.headingRow}>
                  <Link
                    href={group.route}
                    className={current === normalize(group.route) ? styles.headingLinkActive : styles.headingLink}
                    aria-current={current === normalize(group.route) ? 'page' : undefined}
                    onClick={onNavigate}
                  >
                    {group.label}
                  </Link>
                  {group.items.length > 0 && (
                    <button
                      type="button"
                      className={styles.headingCaret}
                      aria-expanded={expanded}
                      aria-label={expanded ? '折叠' : '展开'}
                      onClick={() => toggle(group.label)}
                    >
                      <span className={styles.caret} aria-hidden="true" />
                    </button>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  className={styles.heading}
                  aria-expanded={expanded}
                  onClick={() => toggle(group.label)}
                >
                  <span className={styles.headingText}>{group.label}</span>
                  <span className={styles.caret} aria-hidden="true" />
                </button>
              )}
              <div className={styles.itemsWrap} aria-hidden={!expanded}>
                <div className={styles.items}>
                  {items.map((item) => {
                    if (!item.children?.length) {
                      return (
                        <Link
                          key={item.route}
                          href={item.route}
                          className={current === stripHash(item.route) ? styles.itemActive : styles.item}
                          aria-current={current === stripHash(item.route) ? 'page' : undefined}
                          onClick={onNavigate}
                        >
                          {filtering ? highlight(item.label, filter.trim()) : item.label}
                        </Link>
                      );
                    }
                    const hasActiveChild =
                      current === stripHash(item.route) ||
                      item.children.some((c) => stripHash(c.route) === current);
                    const itemExpanded = isItemExpanded(item.route, hasActiveChild);
                    return (
                      <div
                        key={item.route}
                        className={`${styles.parentItem} ${hasActiveChild ? styles.parentActive : ''} ${
                          itemExpanded ? '' : styles.parentCollapsed
                        }`}
                      >
                        <div className={styles.parentRow}>
                          <Link
                            href={item.route}
                            className={
                              current === stripHash(item.route) ? styles.itemActive : styles.item
                            }
                            aria-current={current === stripHash(item.route) ? 'page' : undefined}
                            onClick={onNavigate}
                          >
                            {filtering ? highlight(item.label, filter.trim()) : item.label}
                          </Link>
                          <button
                            type="button"
                            className={styles.parentCaret}
                            aria-label={itemExpanded ? '折叠' : '展开'}
                            aria-expanded={itemExpanded}
                            onClick={() => toggleItem(item.route, hasActiveChild)}
                          />
                        </div>
                        <div className={styles.childrenWrap} aria-hidden={!itemExpanded}>
                          <div className={styles.children}>
                            {item.children.map((child) => (
                              <Link
                                key={child.route}
                                href={child.route}
                                className={
                                  current === stripHash(child.route) ? styles.childActive : styles.child
                                }
                                aria-current={current === stripHash(child.route) ? 'page' : undefined}
                                onClick={onNavigate}
                              >
                                {filtering ? highlight(child.label, filter.trim()) : child.label}
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          );
        })}
      </nav>
    </aside>
  );
}

function ClearIcon() {
  return (
    <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
