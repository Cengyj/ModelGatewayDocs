import createMDX from '@next/mdx';
import remarkGfm from 'remark-gfm';
import remarkFrontmatter from 'remark-frontmatter';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';
import rehypeSlug from 'rehype-slug';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypePrettyCode from 'rehype-pretty-code';

const withMDX = createMDX({
  extension: /\.mdx?$/,
  options: {
    remarkPlugins: [
      remarkGfm,
      remarkFrontmatter,
      [remarkMdxFrontmatter, { name: 'frontmatter' }],
    ],
    rehypePlugins: [
      rehypeSlug,
      [
        rehypeAutolinkHeadings,
        {
          behavior: 'append',
          properties: { className: ['header-anchor'], ariaLabel: 'Permalink' },
          content: { type: 'text', value: '​' },
        },
      ],
      [
        rehypePrettyCode,
        {
          theme: { light: 'github-light', dark: 'github-dark' },
          keepBackground: false,
        },
      ],
    ],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['ts', 'tsx', 'mdx'],
  reactStrictMode: true,
  experimental: {
    mdxRs: false,
  },
  async redirects() {
    return [
      // Tool group roots → first page
      { source: '/claude-code',          destination: '/claude-code/cli/install',     permanent: false },
      { source: '/claude-code/cli',      destination: '/claude-code/cli/install',     permanent: false },
      { source: '/claude-code/desktop',  destination: '/claude-code/desktop/install', permanent: false },
      { source: '/codex',                destination: '/codex/cli/install',           permanent: false },
      { source: '/codex/cli',            destination: '/codex/cli/install',           permanent: false },
      { source: '/codex/desktop',        destination: '/codex/desktop/install',       permanent: false },
      { source: '/opencode',             destination: '/opencode/cli/install',        permanent: false },
      { source: '/opencode/cli',         destination: '/opencode/cli/install',        permanent: false },
      { source: '/opencode/desktop',     destination: '/opencode/desktop/install',    permanent: false },
      { source: '/openclaw',             destination: '/openclaw/install',            permanent: false },
      { source: '/cherry-studio',        destination: '/cherry-studio/install',       permanent: false },
      { source: '/hermes',               destination: '/hermes/install',              permanent: false },
    ];
  },
};

export default withMDX(nextConfig);
