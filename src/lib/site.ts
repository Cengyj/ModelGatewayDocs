/** Site-wide metadata. */

export const site = {
  name: 'foropencode',
  tagline: 'AI Coding 中文配置手册',
  description: 'foropencode · Claude Code、Codex、OpenCode、OpenClaw、Hermes 中文配置手册',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://foropencode.com',
  ogImage: '/logo.png',
  locale: 'zh_CN',
  footer: {
    message: 'foropencode',
    copyright: 'Copyright © 2026 foropencode.com',
  },
} as const;
