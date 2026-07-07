import type { DirMeta } from '@/lib/content-types';

/**
 * Error detail pages. These are marked `hidden` in their own frontmatter so
 * they stay out of the sidebar (reached via the symptom index on the /errors
 * landing page) but remain in the prev/next reading flow in this order.
 */
const meta: DirMeta = {
  order: [
    'cc-onboarding-connection-block',
    'cc-connection-error',
    'cc-request-timed-out',
    'cc-webfetch-preflight-fail',
    'cc-401-ide-mcp-conflict',
    'cc-401-leftover-env',
    'cc-oauth-conflict',
    'cc-invalid-key-format',
    'cc-400-experimental-betas',
    'cc-413-invalid-model',
    'cc-024-third-party-system-role-400',
    'cc-429-rate-limit',
    'cc-permission-denied',
    'cc-023-skip-auto-permission-prompt-plan-fail',
    'cc-022-duplicate-cache-billing',
    'claude-mem-data-loss',
    'claude-mem-worker-zombie',
  ],
};

export default meta;
