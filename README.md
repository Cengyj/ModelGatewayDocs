# micuapi docs

AI Coding 中文配置手册的本地文档站，与 [docs.micuapi.ai](https://docs.micuapi.ai) 视觉/结构对齐。

```text
Key  ->  CC Switch  ->  Provider  ->  Tool  ->  Verify
```

## 技术栈

- **Next.js 15** (App Router, React 19, Server Components)
- **MDX** 单一真相源（`src/content/**/*.mdx`）
- **CSS Modules** + design tokens（`src/styles/tokens.css`）
- **shiki** 构建时语法高亮（通过 `rehype-pretty-code`）
- **FlexSearch** 本地全文搜索（构建时索引）

## 关键目录

| 路径 | 用途 |
| --- | --- |
| `src/app/` | App Router 入口：`layout.tsx`（壳）、`[[...slug]]/page.tsx`（catch-all） |
| `src/components/` | 组件库，每个组件配同名 `*.module.css` |
| `src/hooks/` | `useTheme`、`useTocActiveId`、`useCodeCopy`、`useKey` |
| `src/lib/` | `nav.ts`（顶栏/侧栏配置）、`content.ts`（MDX 元数据）、`mdx-map.ts`（路由到 MDX 模块） |
| `src/content/` | 全部 MDX 文档，路径即路由 |
| `src/styles/` | `tokens.css` + `reset.css` + `prose.css` + `global.css` |
| `public/` | 静态资源（图片、字体、`search-index.json`） |
| `scripts/build-search-index.mjs` | 构建时生成 `public/search-index.json` |
| `scripts/convert-html-to-mdx.mjs` | 一次性导入器（从 legacy `micuPages.ts` 转出 MDX，**不要重复运行**） |
| `scripts/screenshot-check.mjs` | Playwright 验证关键路由能 200 渲染 |
| `legacy-docusaurus/` | 2026-06-19 cut-over 前的 Docusaurus 旧栈，保留作参考 |

## 本地开发

```bash
corepack pnpm install
corepack pnpm dev
```

默认 `http://127.0.0.1:3020`。

## 验证

```bash
corepack pnpm typecheck       # tsc --noEmit
corepack pnpm build           # 构建搜索索引 + Next.js 生产构建
corepack pnpm start           # 启动生产 server
```

## 添加 / 编辑文档

1. 在 `src/content/<route>.mdx` 创建或编辑文件（支持 frontmatter `title:`、`description:`）
2. 在 `src/lib/mdx-map.ts` 注册路由 -> import 映射
3. 在 `src/lib/nav.ts` 把页面加入侧栏 / 顶栏
4. `corepack pnpm dev` 热重载验证

## 内容维护规则

- Key 示例只能使用 `sk-xxxx`；不展示真实 Key/Token/邮箱/账号/余额/账单
- 教程图片必须来自真实软件或真实网页
- Codex CLI 与 Codex App 复用 `~/.codex/config.toml` + `~/.codex/auth.json`
- Claude Code CLI、Claude Desktop、Claude Code Desktop 分开说明

## 部署

容器化：

```bash
docker build -t micuapi-docs .
docker run -p 3020:3020 micuapi-docs
```

完整流程见 [DEPLOY.md](./DEPLOY.md)。

## 搜索

本地构建的 FlexSearch 索引，无外部依赖。索引在 `pnpm build` 期间生成到 `public/search-index.json`，客户端首次 `Cmd+K` 时按需加载。
