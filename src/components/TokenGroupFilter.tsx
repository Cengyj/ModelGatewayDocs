'use client';

import { useMemo, useState } from 'react';
import styles from './TokenGroupFilter.module.css';

type Category = '默认' | 'Claude 官方' | 'Claude 逆向' | 'Codex / OpenAI' | 'Gemini / Grok' | '国产';

type GroupRow = {
  id: string;
  category: Category;
  note: string;
  model: string;
};

const ROWS: GroupRow[] = [
  { id: 'default', category: '默认', note: '富哥分组——实际路由到 vip_1_max_enterprise，效果相同但单价更高', model: '不建议手动选择' },

  { id: 'vip_1_api_mix', category: 'Claude 官方', note: 'Claude AWS + Azure API 混合', model: '留空' },
  { id: 'vip_1_awsbedrock', category: 'Claude 官方', note: 'Claude AWS Bedrock API', model: '留空' },
  { id: 'vip_1_ext', category: 'Claude 官方', note: 'Claude 外接专用', model: '留空或填 Claude 模型名' },
  { id: 'vip_1_jupiter', category: 'Claude 官方', note: 'Claude Jupiter', model: '留空' },
  { id: 'vip_1_max_enterprise', category: 'Claude 官方', note: 'ClaudeMAX 号池，仅 Claude Code 内部使用，假一赔十', model: '留空' },
  { id: 'vip_1_max_ext', category: 'Claude 官方', note: 'ClaudeMAX 号池，不限调用场景，每日限量', model: '留空' },

  { id: 'free_2', category: 'Claude 逆向', note: 'AWSQ（Kiro）逆向 Claude，支持外接，有内置 Prompt，不支持 Thinking', model: '留空' },
  { id: 'free_2_new', category: 'Claude 逆向', note: 'ANTI（反重力）逆向 Claude，支持外接，有内置 Prompt，不支持 Thinking', model: '留空' },
  { id: 'free_2_wf', category: 'Claude 逆向', note: 'Windsurf 逆向 Claude，支持外接', model: '留空' },

  { id: 'vip_2', category: 'Codex / OpenAI', note: 'Codex Pro 号池，可外接，假一赔十', model: '推荐 gpt-5.4 或 gpt-5.5' },
  { id: 'vip_2_cc', category: 'Codex / OpenAI', note: 'Codex → ClaudeCode（Claude Code 调用 OAI 模型）', model: '必须改为 gpt-5.4 或其他 GPT 模型，不能继续填 Claude 模型名' },
  { id: 'vip_2_remap', category: 'Codex / OpenAI', note: '临时重映射分组，gpt-5.4 自动转为 gpt-5.5', model: '填 gpt-5.4，服务端自动映射到 gpt-5.5' },
  { id: 'vip_2_azure', category: 'Codex / OpenAI', note: 'Azure OpenAI API', model: '具体可以查看模型广场填写' },
  { id: 'vip_2_image', category: 'Codex / OpenAI', note: 'GPT Image 2，图像生成专用', model: '按图像模型 ID 填写' },

  { id: 'vip_3', category: 'Gemini / Grok', note: 'Gemini API', model: '按模型广场中的 Gemini 模型 ID 填写' },
  { id: 'grok', category: 'Gemini / Grok', note: 'Grok 专用', model: '按模型广场中的 Grok 模型 ID 填写' },

  { id: 'vip_4', category: '国产', note: '国产模型混合分组', model: '按模型广场中的对应模型 ID 填写' },
  { id: 'vip_4_ds', category: '国产', note: 'DeepSeek 官方 API', model: '按 DeepSeek 模型 ID 填写' },
  { id: 'vip_4_ds_pro', category: '国产', note: 'DeepSeek 官方 API，活动限时分组', model: '按 DeepSeek 模型 ID 填写' },
];

const CATEGORIES: Array<Category | '全部'> = ['全部', '默认', 'Claude 官方', 'Claude 逆向', 'Codex / OpenAI', 'Gemini / Grok', '国产'];

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
        <div className={styles.tabs} role="tablist" aria-label="按分类筛选">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              type="button"
              role="tab"
              aria-selected={active === c}
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
              <th>说明</th>
              <th><code>model</code> 填写建议</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id}>
                <td><code>{highlight(r.id, trimmed)}</code></td>
                <td><span className={styles.catTag}>{r.category}</span></td>
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
