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

const productionSecurityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "object-src 'none'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-src 'none'",
      "manifest-src 'self'",
      "worker-src 'self' blob:",
      'upgrade-insecure-requests',
    ].join('; '),
  },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Legacy-browser complement to CSP frame-ancestors 'none'
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), geolocation=(), microphone=(), payment=(), usb=()',
  },
  // Do not cover subdomains until the operator confirms every subdomain is
  // HTTPS-only. HSTS is ignored on local HTTP and only takes effect over HTTPS.
  { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['ts', 'tsx', 'mdx'],
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    mdxRs: false,
  },
  async headers() {
    if (process.env.NODE_ENV !== 'production') return [];
    return [
      {
        source: '/:path*',
        headers: productionSecurityHeaders,
      },
    ];
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
