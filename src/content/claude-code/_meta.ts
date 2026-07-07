import type { DirMeta } from '@/lib/content-types';

/**
 * Claude Code uniquely splits across a CLI / Desktop sub-menu because the two
 * have different config files. `cli` and `desktop` are subdirectories that
 * render as collapsible sidebar sub-menus; `errors` is the troubleshooting
 * landing page whose detail pages live in errors/.
 */
const meta: DirMeta = {
  order: ['cli', 'desktop', 'errors'],
  groups: {
    cli: { label: 'CLI / VSCode 版本' },
    desktop: { label: '桌面版' },
  },
};

export default meta;
