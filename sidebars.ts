import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docsSidebar: [
    {
      type: 'category',
      label: '开始使用',
      collapsible: false,
      items: [
        {type: 'doc', id: 'overview/index', label: '选择入口'},
        {type: 'doc', id: 'getting-started/which-page', label: '我该点哪一页'},
        {type: 'doc', id: 'getting-started/quick-path', label: '第一次推荐路线'},
        {type: 'doc', id: 'getting-started/install-tool', label: '下载安装 CC Switch'},
        {type: 'doc', id: 'getting-started/create-key', label: '创建 API Key'},
      ],
    },
    {
      type: 'category',
      label: '主流软件',
      collapsible: false,
      items: [
        {
          type: 'category',
          label: 'Codex',
          items: [
            {type: 'doc', id: 'tools/codex/index', label: 'Codex：选择方式'},
            {type: 'doc', id: 'tools/codex/ccswitch', label: 'Codex：CC Switch 配置'},
            {type: 'doc', id: 'tools/codex/config-file', label: 'Codex：手动配置文件'},
          ],
        },
        {
          type: 'category',
          label: 'OpenCode',
          items: [
            {type: 'doc', id: 'tools/opencode/index', label: 'OpenCode：选择方式'},
            {type: 'doc', id: 'tools/opencode/ccswitch', label: 'OpenCode：CC Switch 配置'},
            {type: 'doc', id: 'tools/opencode/config-file', label: 'OpenCode：手动配置'},
          ],
        },
        {
          type: 'category',
          label: 'OpenClaw',
          items: [
            {type: 'doc', id: 'tools/openclaw/index', label: 'OpenClaw：选择方式'},
            {type: 'doc', id: 'tools/openclaw/ccswitch', label: 'OpenClaw：CC Switch 配置'},
            {type: 'doc', id: 'tools/openclaw/manual', label: 'OpenClaw：手动配置'},
          ],
        },
        {
          type: 'category',
          label: 'Claude Code',
          items: [
            {type: 'doc', id: 'tools/claude-code/index', label: 'Claude Code：选择方式'},
            {type: 'doc', id: 'tools/claude-code/ccswitch', label: 'Claude Code：CC Switch 配置'},
            {type: 'doc', id: 'tools/claude-code/manual', label: 'Claude Code：手动配置'},
          ],
        },
      ],
    },
    {
      type: 'category',
      label: '图片生成',
      collapsible: false,
      items: [
        {type: 'doc', id: 'tools/cherry-studio/index', label: '图片生成：选择设备'},
        {type: 'doc', id: 'tools/gpt-image-pc', label: 'PC 使用 gpt-image-2'},
        {type: 'doc', id: 'tools/gpt-image-android', label: '安卓使用 gpt-image-2'},
        {type: 'doc', id: 'tools/gpt-image-web', label: '网页端使用 gpt-image-2'},
      ],
    },
    {
      type: 'category',
      label: '配置参考',
      collapsible: false,
      items: [
        {type: 'doc', id: 'site-config/index', label: '配置参数总表'},
        {type: 'doc', id: 'getting-started/zero-basics', label: '零基础术语'},
        {type: 'doc', id: 'reference/glossary', label: '名词解释'},
        {type: 'doc', id: 'visual-guide/index', label: '截图总表'},
      ],
    },
    {
      type: 'category',
      label: '排障',
      collapsible: false,
      items: [
        {type: 'doc', id: 'troubleshooting/index', label: '配置失败怎么办'},
      ],
    },
  ],
};

export default sidebars;
