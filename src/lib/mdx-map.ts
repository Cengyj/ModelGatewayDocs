/**
 * Static map from route to lazy-loaded MDX module.
 *
 * To register a new MDX file, just drop it under src/content/ and add a
 * line below. The dev/build pipeline does not codegen this map.
 */

import type { ComponentType } from 'react';

type MdxModule = { default: ComponentType };

export const routeToImporter: Record<string, () => Promise<MdxModule>> = {
  '/': () => import('@/content/index.mdx'),
  '/cc-switch': () => import('@/content/cc-switch.mdx'),
  '/tools': () => import('@/content/tools.mdx'),

  // Claude Code
  '/claude-code/cli/install': () => import('@/content/claude-code/cli/install.mdx'),
  '/claude-code/cli/cc-switch': () => import('@/content/claude-code/cli/cc-switch.mdx'),
  '/claude-code/cli/manual': () => import('@/content/claude-code/cli/manual.mdx'),
  '/claude-code/cli/usage': () => import('@/content/claude-code/cli/usage.mdx'),
  '/claude-code/desktop/install': () => import('@/content/claude-code/desktop/install.mdx'),
  '/claude-code/desktop/cc-switch': () => import('@/content/claude-code/desktop/cc-switch.mdx'),
  '/claude-code/desktop/manual': () => import('@/content/claude-code/desktop/manual.mdx'),
  '/claude-code/errors': () => import('@/content/claude-code/errors.mdx'),
  '/claude-code/errors/cc-022-duplicate-cache-billing': () => import('@/content/claude-code/errors/cc-022-duplicate-cache-billing.mdx'),
  '/claude-code/errors/cc-023-skip-auto-permission-prompt-plan-fail': () => import('@/content/claude-code/errors/cc-023-skip-auto-permission-prompt-plan-fail.mdx'),
  '/claude-code/errors/cc-024-third-party-system-role-400': () => import('@/content/claude-code/errors/cc-024-third-party-system-role-400.mdx'),
  '/claude-code/errors/cc-400-experimental-betas': () => import('@/content/claude-code/errors/cc-400-experimental-betas.mdx'),
  '/claude-code/errors/cc-401-ide-mcp-conflict': () => import('@/content/claude-code/errors/cc-401-ide-mcp-conflict.mdx'),
  '/claude-code/errors/cc-401-leftover-env': () => import('@/content/claude-code/errors/cc-401-leftover-env.mdx'),
  '/claude-code/errors/cc-413-invalid-model': () => import('@/content/claude-code/errors/cc-413-invalid-model.mdx'),
  '/claude-code/errors/cc-429-rate-limit': () => import('@/content/claude-code/errors/cc-429-rate-limit.mdx'),
  '/claude-code/errors/cc-connection-error': () => import('@/content/claude-code/errors/cc-connection-error.mdx'),
  '/claude-code/errors/cc-invalid-key-format': () => import('@/content/claude-code/errors/cc-invalid-key-format.mdx'),
  '/claude-code/errors/cc-oauth-conflict': () => import('@/content/claude-code/errors/cc-oauth-conflict.mdx'),
  '/claude-code/errors/cc-onboarding-connection-block': () => import('@/content/claude-code/errors/cc-onboarding-connection-block.mdx'),
  '/claude-code/errors/cc-permission-denied': () => import('@/content/claude-code/errors/cc-permission-denied.mdx'),
  '/claude-code/errors/cc-request-timed-out': () => import('@/content/claude-code/errors/cc-request-timed-out.mdx'),
  '/claude-code/errors/cc-webfetch-preflight-fail': () => import('@/content/claude-code/errors/cc-webfetch-preflight-fail.mdx'),
  '/claude-code/errors/claude-mem-data-loss': () => import('@/content/claude-code/errors/claude-mem-data-loss.mdx'),
  '/claude-code/errors/claude-mem-worker-zombie': () => import('@/content/claude-code/errors/claude-mem-worker-zombie.mdx'),

  // Codex
  '/codex/cli/install': () => import('@/content/codex/cli/install.mdx'),
  '/codex/cli/usage': () => import('@/content/codex/cli/usage.mdx'),
  '/codex/desktop/install': () => import('@/content/codex/desktop/install.mdx'),
  '/codex/cc-switch': () => import('@/content/codex/cc-switch.mdx'),
  '/codex/manual': () => import('@/content/codex/manual.mdx'),

  // OpenCode
  '/opencode/cli/install': () => import('@/content/opencode/cli/install.mdx'),
  '/opencode/cli/usage': () => import('@/content/opencode/cli/usage.mdx'),
  '/opencode/desktop/install': () => import('@/content/opencode/desktop/install.mdx'),
  '/opencode/cc-switch': () => import('@/content/opencode/cc-switch.mdx'),
  '/opencode/manual': () => import('@/content/opencode/manual.mdx'),

  // OpenClaw
  '/openclaw/install': () => import('@/content/openclaw/install.mdx'),
  '/openclaw/cc-switch': () => import('@/content/openclaw/cc-switch.mdx'),
  '/openclaw/manual': () => import('@/content/openclaw/manual.mdx'),
  '/openclaw/feishu': () => import('@/content/openclaw/feishu.mdx'),

  // Cherry Studio (desktop-only)
  '/cherry-studio/install': () => import('@/content/cherry-studio/install.mdx'),
  '/cherry-studio/manual': () => import('@/content/cherry-studio/manual.mdx'),

  // Hermes
  '/hermes/install': () => import('@/content/hermes/install.mdx'),
  '/hermes/cc-switch': () => import('@/content/hermes/cc-switch.mdx'),
  '/hermes/manual': () => import('@/content/hermes/manual.mdx'),
};

export async function loadMdx(route: string) {
  const importer = routeToImporter[route];
  if (!importer) return null;
  const mod = await importer();
  return mod.default;
}
