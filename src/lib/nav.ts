/**
 * Single source of truth for top nav + sidebar groups.
 *
 * Structure: each AI client is its own top-level sidebar group. Inside each
 * group are fixed sub-items (Install, CC Switch config, Manual config),
 * with Claude Code uniquely splitting Install + the two configs across a
 * CLI / Desktop sub-menu because the two have different config files.
 */

export type NavItem = {
  label: string;
  route: string;
  /** Optional second-level children for grouped sub-items (Claude Code). */
  children?: NavItem[];
  /**
   * Optional prefix for "current section" matching on the top nav. When a
   * page under `prefix` is active, the link with this prefix is highlighted.
   */
  matchPrefix?: string;
};

export type SidebarGroup = {
  label: string;
  route?: string;
  collapsed?: boolean;
  items: NavItem[];
};

export const topNav: NavItem[] = [
  { label: '首页', route: '/' },
  { label: 'Claude Code', route: '/claude-code/cli/install', matchPrefix: '/claude-code' },
  { label: 'Codex', route: '/codex/cli/install', matchPrefix: '/codex' },
  { label: 'OpenCode', route: '/opencode/cli/install', matchPrefix: '/opencode' },
  { label: 'OpenClaw', route: '/openclaw/install', matchPrefix: '/openclaw' },
  { label: 'Cherry Studio', route: '/cherry-studio/install', matchPrefix: '/cherry-studio' },
  { label: 'Hermes', route: '/hermes/install', matchPrefix: '/hermes' },
  { label: '工具', route: '/tools' },
];

export const sidebar: SidebarGroup[] = [
  {
    label: 'Claude Code',
    items: [
      {
        label: 'CLI 版本',
        route: '/claude-code/cli/install',
        children: [
          { label: '安装', route: '/claude-code/cli/install' },
          { label: 'CC Switch 配置', route: '/claude-code/cli/cc-switch' },
          { label: '手动配置', route: '/claude-code/cli/manual' },
          { label: '常用命令', route: '/claude-code/cli/usage' },
        ],
      },
      {
        label: '桌面版',
        route: '/claude-code/desktop/install',
        children: [
          { label: '安装', route: '/claude-code/desktop/install' },
          { label: 'CC Switch 配置', route: '/claude-code/desktop/cc-switch' },
          { label: '手动配置', route: '/claude-code/desktop/manual' },
        ],
      },
      { label: '排障', route: '/claude-code/errors' },
    ],
  },
  {
    label: 'Codex',
    items: [
      { label: '安装 · CLI 版本', route: '/codex/cli/install' },
      { label: '常用命令 · CLI', route: '/codex/cli/usage' },
      { label: '安装 · 桌面版', route: '/codex/desktop/install' },
      { label: 'CC Switch 配置', route: '/codex/cc-switch' },
      { label: '手动配置', route: '/codex/manual' },
    ],
  },
  {
    label: 'OpenCode',
    items: [
      { label: '安装 · CLI 版本', route: '/opencode/cli/install' },
      { label: '常用命令 · CLI', route: '/opencode/cli/usage' },
      { label: '安装 · 桌面版 (BETA)', route: '/opencode/desktop/install' },
      { label: 'CC Switch 配置', route: '/opencode/cc-switch' },
      { label: '手动配置', route: '/opencode/manual' },
    ],
  },
  {
    label: 'OpenClaw',
    items: [
      { label: '安装', route: '/openclaw/install' },
      { label: 'CC Switch 配置', route: '/openclaw/cc-switch' },
      { label: '手动配置', route: '/openclaw/manual' },
      { label: '飞书渠道', route: '/openclaw/feishu' },
    ],
  },
  {
    label: 'Cherry Studio',
    items: [
      { label: '安装', route: '/cherry-studio/install' },
      { label: '软件配置', route: '/cherry-studio/manual' },
    ],
  },
  {
    label: 'Hermes Agent',
    items: [
      { label: '安装', route: '/hermes/install' },
      { label: 'CC Switch 配置', route: '/hermes/cc-switch' },
      { label: '手动配置', route: '/hermes/manual' },
    ],
  },
  {
    label: 'CC Switch',
    route: '/cc-switch',
    items: [],
  },
];

/**
 * Explicit prev/next page order. Independent from sidebar grouping so
 * regrouping doesn't break the reading flow.
 */
export const pageOrder: string[] = [
  // Claude Code
  '/claude-code/cli/install',
  '/claude-code/cli/cc-switch',
  '/claude-code/cli/manual',
  '/claude-code/cli/usage',
  '/claude-code/desktop/install',
  '/claude-code/desktop/cc-switch',
  '/claude-code/desktop/manual',
  '/claude-code/errors',
  '/claude-code/errors/cc-onboarding-connection-block',
  '/claude-code/errors/cc-connection-error',
  '/claude-code/errors/cc-request-timed-out',
  '/claude-code/errors/cc-webfetch-preflight-fail',
  '/claude-code/errors/cc-401-ide-mcp-conflict',
  '/claude-code/errors/cc-401-leftover-env',
  '/claude-code/errors/cc-oauth-conflict',
  '/claude-code/errors/cc-invalid-key-format',
  '/claude-code/errors/cc-400-experimental-betas',
  '/claude-code/errors/cc-413-invalid-model',
  '/claude-code/errors/cc-024-third-party-system-role-400',
  '/claude-code/errors/cc-429-rate-limit',
  '/claude-code/errors/cc-permission-denied',
  '/claude-code/errors/cc-023-skip-auto-permission-prompt-plan-fail',
  '/claude-code/errors/cc-022-duplicate-cache-billing',
  '/claude-code/errors/claude-mem-data-loss',
  '/claude-code/errors/claude-mem-worker-zombie',

  // Codex
  '/codex/cli/install',
  '/codex/cli/usage',
  '/codex/desktop/install',
  '/codex/cc-switch',
  '/codex/manual',

  // OpenCode
  '/opencode/cli/install',
  '/opencode/cli/usage',
  '/opencode/desktop/install',
  '/opencode/cc-switch',
  '/opencode/manual',

  // OpenClaw
  '/openclaw/install',
  '/openclaw/cc-switch',
  '/openclaw/manual',
  '/openclaw/feishu',

  // Cherry Studio
  '/cherry-studio/install',
  '/cherry-studio/manual',

  // Hermes
  '/hermes/install',
  '/hermes/cc-switch',
  '/hermes/manual',

  // CC Switch
  '/cc-switch',
  '/tools',
];

/** Flatten one or two levels into a route list for membership tests. */
function flattenItems(items: NavItem[]): NavItem[] {
  return items.flatMap((i) => (i.children ? [i, ...i.children] : [i]));
}

export function findGroup(route: string): SidebarGroup | undefined {
  return sidebar.find((g) => flattenItems(g.items).some((i) => i.route === route));
}

export function findItem(route: string): NavItem | undefined {
  for (const g of sidebar) {
    for (const item of flattenItems(g.items)) {
      if (item.route === route) return item;
    }
  }
  return undefined;
}
