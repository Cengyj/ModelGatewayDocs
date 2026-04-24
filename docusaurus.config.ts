import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const algoliaAppId = process.env.ALGOLIA_APP_ID;
const algoliaApiKey = process.env.ALGOLIA_SEARCH_API_KEY;
const algoliaIndexName = process.env.ALGOLIA_INDEX_NAME;
const siteUrl = process.env.SITE_URL ?? 'https://www.foropencode.com';
const siteTitle = 'ForOpenCode 新手配置教程';
const siteTagline = '让 Windows 新手也能一步一步把 OpenCode、OpenClaw、Codex、Claude Code 接到 ForOpenCode';

const config: Config = {
  title: siteTitle,
  tagline: siteTagline,
  favicon: 'img/favicon.ico',
  future: {
    v4: true,
  },
  url: siteUrl,
  baseUrl: '/',
  onBrokenLinks: 'throw',
  i18n: {
    defaultLocale: 'zh-Hans',
    locales: ['zh-Hans'],
  },
  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
        },
        blog: false,
        pages: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],
  themeConfig: {
    image: 'img/social-card.png',
    tableOfContents: {
      minHeadingLevel: 2,
      maxHeadingLevel: 2,
    },
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: siteTitle,
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'docsSidebar',
          position: 'left',
          label: '文档',
        },
        {
          to: '/getting-started/which-page',
          label: '选择软件',
          position: 'left',
        },
        {
          to: '/site-config/',
          label: '配置参数',
          position: 'left',
        },
        {
          to: '/troubleshooting/',
          label: '排障',
          position: 'left',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: '开始',
          items: [
            {label: '选择入口', to: '/'},
            {label: '我该点哪一页', to: '/getting-started/which-page'},
            {label: '第一次推荐路线', to: '/getting-started/quick-path'},
          ],
        },
        {
          title: '软件',
          items: [
            {label: 'Codex', to: '/tools/codex/'},
            {label: 'OpenCode', to: '/tools/opencode/'},
            {label: 'OpenClaw', to: '/tools/openclaw/'},
            {label: 'Claude Code', to: '/tools/claude-code/'},
          ],
        },
        {
          title: '参考',
          items: [
            {label: '配置参数总表', to: '/site-config/'},
            {label: '名词解释', to: '/reference/glossary'},
            {label: '配置失败怎么办', to: '/troubleshooting/'},
          ],
        },
        {
          title: '部署',
          items: [
            {label: '图片生成教程', to: '/tools/cherry-studio/'},
            {label: '截图总表', to: '/visual-guide/'},
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} ${siteTitle}. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'json'],
    },
    ...(algoliaAppId && algoliaApiKey && algoliaIndexName
      ? {
          algolia: {
            appId: algoliaAppId,
            apiKey: algoliaApiKey,
            indexName: algoliaIndexName,
            contextualSearch: true,
          },
        }
      : {}),
  } satisfies Preset.ThemeConfig,
};

export default config;

