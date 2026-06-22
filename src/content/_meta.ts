import type { DirMeta } from '@/lib/content-types';

/**
 * Top-level content map: order of sidebar groups + which groups also appear in
 * the top navigation. Each key is a first-level directory (or root file) under
 * src/content/. Adding a tool = create a directory with its own _meta.ts and
 * list it here.
 */
const meta: DirMeta = {
  order: [
    'index',
    'get-key',
    'cc-switch',
    'gpt-image',
    'claude-code',
    'codex',
    'opencode',
    'openclaw',
    'cherry-studio',
    'hermes',
  ],
  groups: {
    'claude-code': { label: 'Claude Code', topNav: { label: 'Claude Code' } },
    codex: { label: 'Codex', topNav: { label: 'Codex' } },
    opencode: { label: 'OpenCode', topNav: { label: 'OpenCode' } },
    openclaw: { label: 'OpenClaw', topNav: { label: 'OpenClaw' } },
    'cherry-studio': { label: 'Cherry Studio', topNav: { label: 'Cherry Studio' } },
    hermes: { label: 'Hermes Agent', topNav: { label: 'Hermes' } },
    'get-key': { label: '密钥管理' },
    'cc-switch': { label: 'CC Switch' },
    'gpt-image': { label: 'GPT Image 2', topNav: { label: 'GPT Image 2' } },
  },
};

export default meta;
