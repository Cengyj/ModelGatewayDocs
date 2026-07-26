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
      // NOTE: no `upgrade-insecure-requests` here. The container may be
      // served over plain HTTP (IP:port, LAN, health checks); that directive
      // makes browsers rewrite every asset URL to https:// and breaks such
      // deployments. HTTPS enforcement (redirect + HSTS) belongs on the TLS
      // reverse proxy / CDN in front — see DEPLOY.md.
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
  // Strict-Transport-Security is intentionally NOT set at the app layer:
  // browsers ignore it over HTTP, and the terminating proxy is the right
  // place to add it once the domain is HTTPS-only.
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
