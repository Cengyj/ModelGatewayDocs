import type { DirMeta } from '@/lib/content-types';

const meta: DirMeta = {
  order: ['cli', 'desktop', 'cc-switch', 'manual'],
  groups: {
    cli: { label: 'CLI 版本' },
    desktop: { label: '桌面版' },
  },
};

export default meta;
