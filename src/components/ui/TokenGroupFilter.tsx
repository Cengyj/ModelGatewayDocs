'use client';

import { useMemo, useState } from 'react';
import styles from './TokenGroupFilter.module.css';

type Category = 'Claude 渠道' | 'OpenAI 兼容' | '其他兼容渠道';

type GroupRow = {
  id: string;
  category: Category;
  note: string;
  rate: string;
  model: string;
};

const ROWS: GroupRow[] = [
  { id: 'claude_max',  category: 'Claude 渠道', note: '第三方网关控制台中的分组名；不代表 Anthropic 官方服务', rate: '以控制台为准', model: '以控制台模型列表为准' },
  { id: 'claude_free', category: 'Claude 渠道', note: '第三方网关控制台中的社区渠道；使用前核对来源、稳定性与数据处理', rate: '以控制台为准', model: '以控制台模型列表为准' },
  { id: 'gpt_plus', category: 'OpenAI 兼容', note: '第三方网关控制台中的 OpenAI 兼容分组', rate: '以控制台为准', model: '以控制台模型列表为准' },
  { id: 'grok_free', category: '其他兼容渠道', note: '第三方网关控制台中的 Grok 兼容分组', rate: '以控制台为准', model: '以控制台模型列表为准' },
];

const CATEGORIES: Array<Category | '全部'> = ['全部', 'Claude 渠道', 'OpenAI 兼容', '其他兼容渠道'];

function highlight(text: string, query: string) {
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

export function TokenGroupFilter() {
  const [active, setActive] = useState<Category | '全部'>('全部');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return ROWS.filter((r) => {
      if (active !== '全部' && r.category !== active) return false;
      if (!needle) return true;
      return (
        r.id.toLowerCase().includes(needle) ||
        r.note.toLowerCase().includes(needle) ||
        r.model.toLowerCase().includes(needle) ||
        r.category.toLowerCase().includes(needle)
      );
    });
  }, [active, query]);

  const trimmed = query.trim();

  return (
    <div className={styles.wrap}>
      <div className={styles.controls}>
        <div className={styles.tabs} role="group" aria-label="按分类筛选">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              aria-pressed={active === c}
              className={`${styles.tab} ${active === c ? styles.tabActive : ''}`}
              onClick={() => setActive(c)}
            >
              {c}
              {c !== '全部' ? (
                <span className={styles.count}>
                  {ROWS.filter((r) => r.category === c).length}
                </span>
              ) : null}
            </button>
          ))}
        </div>
        <div className={styles.searchWrap}>
          <span className={styles.searchIcon} aria-hidden="true">
            <SearchIcon />
          </span>
          <input
            type="text"
            className={styles.search}
            placeholder="筛选分组名 / 说明 / 模型"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="筛选令牌分组"
          />
          {query ? (
            <button
              type="button"
              className={styles.clear}
              onClick={() => setQuery('')}
              aria-label="清除筛选"
            >
              ✕
            </button>
          ) : null}
        </div>
      </div>

      <p className={styles.meta}>
        显示 <strong>{filtered.length}</strong> / {ROWS.length} 个分组
        {trimmed ? <> · 匹配 <code>{trimmed}</code></> : null}
      </p>

      {filtered.length === 0 ? (
        <p className={styles.empty}>没有匹配的分组。试试别的关键词。</p>
      ) : (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>分组</th>
              <th>分类</th>
              <th>倍率</th>
              <th>说明</th>
              <th><code>model</code> 填写建议</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id}>
                <td><code>{highlight(r.id, trimmed)}</code></td>
                <td><span className={styles.catTag}>{r.category}</span></td>
                <td><span className={styles.rateBadge}>{r.rate}</span></td>
                <td>{highlight(r.note, trimmed)}</td>
                <td>{highlight(r.model, trimmed)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
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
