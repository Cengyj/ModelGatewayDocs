/** Site-wide metadata. */

export const site = {
  name: 'foropencode',
  tagline: 'AI Coding 中文配置手册',
  description: 'foropencode（For API）网关的配套中文配置文档：Claude Code、Codex、OpenCode、OpenClaw、Cherry Studio、Hermes 的接入配置与排障，含官方来源核对。',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://foropencode.com',
  ogImage: '/og.png',
  locale: 'zh_CN',
  footer: {
    message: 'foropencode',
    copyright: 'Copyright © 2026 foropencode.com',
  },
} as const;

/**
 * Operator disclosure — the ONLY place the site operator needs to fill in
 * before launch / running ads. Every field is optional; anything left null is
 * simply not rendered (nothing is fabricated). When filled, the values appear
 * in the Footer, /site-info, and (if `legalName` is set) an Organization
 * JSON-LD block, satisfying Google Ads Misrepresentation requirements for
 * identity, contact, and affiliation transparency.
 *
 * IMPORTANT: only put REAL, verifiable information here. Do not invent a
 * company name, email, or affiliation to "look trustworthy" — inaccurate
 * disclosure is itself a Misrepresentation violation.
 */
export const operator = {
  /** Real operating entity, e.g. "某某网络科技有限公司" or a personal name. */
  legalName: null as string | null,
  /** A monitored contact email for corrections & security reports, e.g. "contact@foropencode.com". */
  contactEmail: null as string | null,
  /** Issue tracker or feedback form URL, if any. */
  feedbackUrl: null as string | null,
  /**
   * Relationship between this docs site and the foropencode gateway.
   * Confirmed by the operator (2026-07-26): this documentation site is run
   * by the foropencode.com gateway itself, as its companion docs. Rendered
   * on /site-info and echoed in the Footer.
   */
  affiliationDisclosure:
    '本文档站与 foropencode.com API 网关（站内名称 For API）由同一运营方提供，是该网关的官方配套配置文档。文档中对该网关的介绍属于自家服务说明，不构成 OpenAI、Anthropic 等模型厂商的背书；对 CC Switch、Cherry Studio 等第三方客户端的介绍不涉及付费推广或佣金关系。' as string | null,
  /**
   * User-facing support channels that exist today on the gateway console
   * (announcement QR codes). No public email is available yet.
   */
  supportChannels: '网关控制台公告中提供微信交流群与 QQ 售后群入口（登录 foropencode.com 后可见）' as string | null,
} as const;

