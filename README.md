# foropencode docs

[foropencode.com](https://foropencode.com) 的中文 AI 编程客户端接入手册：Claude Code、Codex、OpenCode、OpenClaw、Cherry Studio、Hermes 六款工具的安装、接入网关、跑起来、排障。

```text
Key  ->  CC Switch  ->  Provider  ->  Tool  ->  Verify
```

## 技术栈

- **Next.js 15**（App Router, React 19, Server Components）
- **MDX** 内容（`src/content/**/*.mdx`）
- **CSS Modules** + design tokens（`src/styles/tokens.css`）
- **shiki** 构建时语法高亮（通过 `rehype-pretty-code`）
- **FlexSearch** 本地全文搜索（构建时索引）

## 单一内容真相源

路由表、侧边栏、上一页/下一页、搜索索引、TOC **全部从内容自动派生**，没有手维护的映射数组：

- 每个 MDX 文件的 **frontmatter**（`title` / `description` / `navLabel` / `order` / `hidden` / `version`）
- 每个目录的 **`_meta.ts`**（分组标签、顶栏、子项顺序、2 级嵌套）

构建期脚本 `scripts/gen-content-manifest.mjs` 扫描 `src/content/**`，生成 `src/generated/content-manifest.ts`（gitignored），导出 `routeToImporter` / `contentByRoute` / `orderedRoutes` / `sidebar` / `topNav`。

> **加一个页面 = 新建一个 `.mdx` 文件 + 填 frontmatter。** 不用改任何数组。新目录再加一个 3 行的 `_meta.ts`。

TOC 锚点 id 由 `github-slugger`（与 rehype-slug 同一库）在构建期产出，与渲染时的 `<h2 id>` 逐字节一致——CJK / emoji 标题也对。

## 关键目录

| 路径 | 用途 |
| --- | --- |
| `src/app/[[...slug]]/page.tsx` | 单 catch-all 路由，渲染所有页面 |
| `src/content/` | 全部 MDX，路径即路由；`_meta.ts` 声明分组与顺序 |
| `src/generated/` | codegen 产物（gitignored，dev/build 前自动生成） |
| `src/lib/content-types.ts` | frontmatter / 导航 / manifest 的类型契约 |
| `src/lib/content.ts`、`nav.ts` | 读 manifest 的薄适配层 + 纯查找函数 |
| `src/components/ui/` | 通用原子件（Callout/Tabs/Steps/CodeBlock/Feature…） |
| `src/components/layout/` | Header/Footer/Sidebar/Toc/AppShell/PersistentDocFrame… |
| `src/components/docs/` | 文档专属（Breadcrumbs/Pager/PageHeader/RelatedPages/ErrorMeta…） |
| `src/components/search/` | SearchButton / SearchModal |
| `src/hooks/` | `useTheme`、`useTocActiveId`、`useCodeCopy`、`useKey` |
| `src/styles/` | `tokens.css` + `reset.css` + `prose.css` + `global.css` |
| `scripts/lib/content-fs.mjs` | 共享：walk / slug / TOC / 正文提取（codegen 与搜索索引复用） |
| `scripts/gen-content-manifest.mjs` | 内容 manifest codegen（含死链护栏） |
| `scripts/build-search-index.mjs` | 生成 `public/search-index.json` |

> 这是 **pnpm** 仓库——用 `pnpm`，不要用 `npm`。

## 本地开发

```bash
pnpm install
pnpm dev          # http://127.0.0.1:3020（predev 自动跑 codegen）
```

## 验证

```bash
pnpm typecheck    # codegen + tsc --noEmit
pnpm build        # codegen + 搜索索引 + next build
pnpm start        # 生产 server
```

> 注意：dev server 运行时不要跑 `pnpm build`——会覆盖 `.next` 缓存导致 500。先停 dev → `rm -rf .next` → 重启。

## 添加 / 编辑文档

1. 在 `src/content/<route>.mdx` 新建文件，填 frontmatter（至少 `title`）
2. 如需控制侧栏标签 / 顺序 / 隐藏，填 `navLabel` / `order` / `hidden`
3. 新目录顺手加一个 `_meta.ts`（见现有目录）
4. `pnpm dev` 热重载验证——路由 / 侧栏 / 翻页 / 搜索全部自动生效

内部链接指向不存在的路由会在 `pnpm build`（codegen 阶段）**直接报错**，不会静默上线。

## 内容维护规则

- Key 示例只能用 `sk-xxx`；不展示真实 Key/Token/邮箱/账号/余额/账单
- 教程图片必须来自真实软件或真实网页
- 改动一手事实（版本号/命令/路径/环境变量）请核对官方源并在页内标注来源
- Codex CLI 与 App 复用 `~/.codex/config.toml`；Claude Code CLI / Desktop 分开说明

## 部署

```bash
docker build -t foropencode-docs .
docker run -p 3020:3020 foropencode-docs
```

完整流程见 [DEPLOY.md](./DEPLOY.md)。
