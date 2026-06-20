declare module '*.mdx' {
  import type { ComponentType } from 'react';
  export const frontmatter: Record<string, unknown>;
  const Component: ComponentType<Record<string, unknown>>;
  export default Component;
}

declare module '*.md' {
  import type { ComponentType } from 'react';
  const Component: ComponentType<Record<string, unknown>>;
  export default Component;
}
