# ModelGatewayDocs 安全合规与内容审计报告

- 项目：foropencode 文档站
- 项目目录：/Users/macos/Downloads/ModelGatewayDocs
- 审计与核对日期：2026-07-26
- 核对时区：Asia/Shanghai
- 范围：代码、52 个 MDX 源页面、公共组件、静态资源、PWA、SEO、下载与安装指引、API Key 与第三方网关配置
- 结论边界：本报告是基于 Google 官方政策、产品官方文档、官方 GitHub 和本地验证进行的风险降低工作，不代表或保证 Google Safe Browsing、Google Search 或 Google Ads 已解除或不会产生警告。
- 修订：本报告含三轮工作。第一轮为主体整改（第 1–11 节）；第二轮为残余风险复核与事实再核对（第 12 节），修复了第一轮遗留的约 30 处 P2/P3 问题；第三轮为排版/视觉/UX 与技术信任优化（第 13 节）。

## 1. 项目现状总结

项目继续使用 Next.js 15、React 19、App Router、MDX、CSS Modules 和 pnpm，未改变现有主要路由、侧边栏、搜索、主题、截图、页面结构或视觉风格。

整改后状态：

- 当前有 52 个 MDX 源页面。其中 51 个为整改前已有内容页，新增 1 个站点说明页 /site-info。
- 51 个原有有序内容路由全部保留；构建生成 10 个侧边栏分组、52 篇搜索文档和 57 个静态路由。
- 已执行三轮复审：静态安全/下载/密钥；官方来源/版本/模型/配置；生产 SEO/响应头/搜索/桌面与移动端交互。
- 未发现 P0：没有自动下载、伪装下载、同源或第三方可执行文件、压缩包、下载属性、页面加载触发下载、外链跳转器、短链接、混淆脚本或伪装系统警告。
- 原有主要风险集中在 P1：发布方与第三方身份不够清晰、安装提示不足、绕过系统保护的做法、缺少稳定信任信息，以及运营主体、联系方式和商业关系未披露。
- P2 主要是过时或未经官方确认的环境变量、模型列表、客户端内部字段、命令与排障步骤。
- P3 主要是 canonical、结构化数据、404、外链可识别性、PWA 身份、可访问性和生产安全响应头。
- 已完成低改动整改。仍有一项上线及广告投放前的业务阻塞：必须由运营方提供真实运营主体、可用联系方式、纠错渠道以及与 foropencode 网关或推荐工具的商业/关联关系说明。

本站用途没有被隐藏：它仍明确提供第三方网关、第三方客户端和社区工具配置教程，并在页面中说明这些服务与 OpenAI、Anthropic 等模型厂商的关系边界。

## 2. Google 风险矩阵

下表中的“原文或行为”描述整改前审计到的内容；“最小修改建议”列同时记录本次处理状态。

| 等级 | 页面/文件 | 原文或行为 | 可能触发的 Google 风险 | 最小修改建议 |
|---|---|---|---|---|
| P0 | src、public、所有 MDX | 审计未发现页面加载、滚动、弹窗关闭或普通按钮触发下载；未发现 a[download]、可执行文件、压缩包或外链脚本注入 | Malware、Dangerous Downloads、Deceptive Pages | 保持现状；已再次扫描并确认 |
| P0 | public/sw.js | Service worker 会缓存页面和静态资源，但没有下载事件或外域缓存 | 若缓存被滥用可能造成持久恶意内容 | 已限制为同源 GET；搜索索引不缓存；更新缓存版本 |
| P0 | scripts/lib/content-fs.mjs | 构建阶段通过 new Function 读取仓库内受信任的 _meta.ts | 若未来允许不可信内容进入仓库，可能成为构建期代码执行面；不是浏览器脚本注入 | 本次不重构生成系统；列为低优先级供应链控制项 |
| P1 | CC Switch、TokenGroupFilter | 出现“官方号池”“官方分组”等容易把网关控制台概念理解为模型厂商官方资源的描述 | 官方身份混淆、误导性陈述、不可靠声明 | 已删除“官方”身份暗示；倍率、模型、分组均改为以第三方控制台实时结果为准 |
| P1 | CC Switch、Cherry Studio、Codex 安装页 | 曾提供绕过 Gatekeeper、SmartScreen 或系统安全警告的操作思路 | Unwanted Software、Dangerous Downloads、Social Engineering | 已撤下绕过方法，改为停止安装、回官方发布页核对发布方、签名和最终域名 |
| P1 | Codex CLI 安装页 | 远程 PowerShell 命令包含 ExecutionPolicy Bypass | 鼓励弱化安全控制、危险软件安装行为 | 已删除 Bypass；保留官方入口和来源核对说明 |
| P1 | 首页及安装页 | curl 管道执行、PowerShell 远程执行命令附近缺少足够的来源、作用和审阅提示 | 诱导执行不透明脚本、危险下载 | 已在命令前说明官方域名、作用、审阅方式和停止条件；优先链接官方安装文档 |
| P1 | Claude 桌面版相关页 | 把未公开确认的内部配置位置或第三方推理方式写成确定可用步骤 | 客户端篡改、官方支持范围混淆 | 已撤下确定性内部路径；要求仅在官方界面或文档明确提供入口时使用 |
| P1 | claude-mem 两个错误页 | 直接结束进程、删除数据库记录或使用强制恢复步骤，缺少数据备份边界 | 数据丢失、不受信任软件操作、误导性“修复” | 已重写为社区项目官方 status/logs/restart 和交互式队列恢复；先备份，不直接 DELETE |
| P1 | Footer、首页、API Key、安装页 | 缺少稳定的独立站身份、不托管安装包、不上传 API Key 和商标关系说明 | 官方身份混淆、社会工程、信任不足 | 已在 Footer 和就近提示稳定显示；新增 /site-info |
| P1 | 全站 | 未提供可验证运营主体、真实联系方式和商业/关联关系说明 | Ads 目标页面可信度不足、误导性遗漏、投诉无渠道 | 未编造；必须由运营方在上线或投放前补齐，当前仍为阻塞项 |
| P1 | API Key 与第三方网关页 | 网关域名、密钥管理和模型厂商之间的关系不够清楚 | 用户可能误把第三方网关当作 OpenAI/Anthropic 官方密钥平台 | 已明确第三方属性、最终域名、计费与数据处理边界；示例仅使用 sk-xxx |
| P1 | 错误页公共组件 | “已修复”及确定性根因表达容易把单个案例当作官方结论 | 不可靠声明、保证性结果 | 已改为“案例中已恢复”，并提示案例不等于官方根因 |
| P2 | Claude Code 配置页 | 使用 ANTHROPIC_API_TOKEN | 过时或错误环境变量导致鉴权失败和误操作 | 已按官方文档更正为 ANTHROPIC_AUTH_TOKEN，并区分 x-api-key 与 Bearer |
| P2 | Claude Code 页面 | 修改 hasCompletedOnboarding 等内部状态以跳过引导 | 未公开内部字段、可能破坏登录与配置状态 | 已撤下；改为官方账户/API 与第三方 LLM Gateway 的正常流程 |
| P2 | Claude Code 页面 | 使用未在当前官方资料确认的 skipWebFetchPreflight | 过时配置、虚假兼容性承诺 | 已撤下并说明不自行推断内部变量 |
| P2 | GPT/兼容性页面 | 伪造 User-Agent 或使用 Foundry 伪装端点 | 身份伪装、协议误导、配置失败 | 已删除；仅保留官方支持的协议与客户端配置方式 |
| P2 | GPT Image、Claude GPT 页面 | 从旧截图或静态表宣称第三方网关支持固定 GPT 模型 | 过时模型、第三方能力冒充官方能力 | 已撤下静态清单；OpenAI 官方模型目录与网关实时能力分开说明 |
| P2 | 排障页 | 打印完整环境变量或真实 Key 以诊断不可见字符 | 密钥泄露 | 已改为只输出长度、空白或控制字符状态，不打印值 |
| P2 | 排障页 | 泛化 chmod 644/755、结束全部 Node/Python 进程 | 破坏其他应用、权限扩大或配置损坏 | 已删除泛化操作；仅保留产品官方、目标明确的诊断 |
| P2 | 多产品版本徽章及安装页 | 版本、平台、安装命令和支持范围未与当前 Release 同步 | 安装失败、下载错误资产、兼容性误导 | 已按官方文档和官方 Release 更新；滚动发布产品不虚构固定版本 |
| P2 | OpenClaw、Hermes、CC Switch | 同名项目或第三方客户端身份存在混淆风险 | 错把同名 GitHub 搜索结果当官方项目 | 已确认仓库所有者、官网和文档域名；页面明确社区/第三方属性 |
| P2 | 截图相关页面 | 截图中的版本、模型或 UI 可能旧于当前版本 | 用户照抄旧模型或旧入口 | 保留有价值截图；正文明确截图不代表当前模型或功能可用性 |
| P2 | OpenClaw 安装页 | 把 OpenClaw 概括成唯一部署形态，并列出当前官方资料未确认的渠道 | 过时兼容性、安装和渠道误导 | 已改为 CLI/Gateway/Control UI 与配套应用边界；渠道只保留官方当前清单 |
| P2 | Cherry Studio 安装页 | “50+/62 Provider”等数字未能由当前官方 README 确认 | 不可靠数量声明、内容过时 | 已撤下固定 Provider 数量；保留当前 README 可确认的 300+ assistants |
| P3 | src/app、52 个 MDX | 页面 title/description、canonical、OG 和结构化数据不完整或不一致 | Search 展示质量、页面归一化与信任信息不足 | 已补全唯一 title/description、canonical、OG、WebSite 和 TechArticle |
| P3 | scripts/lib/content-fs.mjs、public/search-index.json | 多行 MDX 组件参数、`/>` 和行内代码占位符曾污染或缺失于搜索摘要 | 搜索结果像源码残片、降低页面可信度与可用性 | 已改为 quote/brace/inline-code aware 解析；构建拒绝空 heading、空正文和重复 route |
| P3 | src/app/sitemap.ts | sitemap 使用统一构建时间作为 lastModified | 向搜索引擎发送不准确更新时间 | 已删除伪造 lastModified；保留真实路由、优先级和更新频率 |
| P3 | 404 | 初始 HTML 与水合后标题/robots 不一致 | 错误页可索引、元信息冲突 | 已让 catch-all 对未知路由返回“页面不存在”与 noindex；浏览器复核通过 |
| P3 | MDX 外链及 Feature/VersionBadge | 新窗口外链未全部统一安全关系或目标域名可见性弱 | 反向标签页控制、目标不透明 | 已统一 noopener noreferrer，并显示外链符号；不对正常官方链接一律 nofollow |
| P3 | SearchButton | 移动端图标按钮缺少稳定可访问名 | 可访问性和交互可理解性不足 | 已增加 aria-label“搜索文档” |
| P3 | manifest、Footer、首页 Hero | PWA 和页面摘要未充分说明独立文档及第三方用途 | 安装后身份混淆 | 已更新描述和稳定身份说明，不改变 PWA 使用流程 |
| P3 | next.config.mjs | 缺少生产安全头 | 浏览器 MIME、引用来源、嵌入和权限边界较弱 | 仅生产模式启用实际可用 CSP、nosniff、Referrer-Policy、Permissions-Policy、frame-ancestors 和 HSTS |

## 3. Google 官方政策核对

核对日期均为 2026-07-26，只使用下列 Google 官方页面：

| 规则 | 官方来源 | 与本项目的关系 |
|---|---|---|
| Safe Browsing：Social Engineering / Deceptive Pages | [Social engineering](https://developers.google.com/search/docs/monitor-debug/security/social-engineering) | 页面不能冒充受信任厂商、系统提示或下载界面，也不能诱导用户执行与其预期不符的操作 |
| Unwanted Software Policy | [Unwanted Software Policy](https://www.google.com/about/unwanted-software-policy.html) | 软件目的、主要功能、安装影响和发布方应清晰；不得弱化安全控制或隐藏重要行为 |
| Malware and Dangerous Downloads | [Malware and unwanted software](https://developers.google.com/search/docs/monitor-debug/security/malware) | 不托管、代理、重打包未知安装文件；远程脚本和下载来源要可核对 |
| Google Search Essentials | [Search Essentials](https://developers.google.com/search/docs/essentials) | 内容应对用户真实可见、可访问并准确描述页面 |
| Google Search Spam Policies | [Spam policies](https://developers.google.com/search/docs/essentials/spam-policies) | 禁止 cloaking、隐藏文本、欺骗性跳转、堆砌和虚假结构化数据 |
| Google Ads：Abusing the ad network（含恶意软件/受感染目标页面） | [Google Ads policy 6020954](https://support.google.com/adspolicy/answer/6020954) | 广告目标站不能包含恶意软件、危险安装方式或受感染资源 |
| Google Ads：Misrepresentation | [Google Ads policy 6020955](https://support.google.com/adspolicy/answer/6020955) | 身份、资质、关系、价格、结果和联系方式不能误导或遗漏重要事实 |
| Google Ads：Unwanted software | [Google Ads policy 15938073](https://support.google.com/adspolicy/answer/15938073) | 软件来源、发布方、落地页说明与下载行为需要清晰、可信和一致 |

基于上述政策，本次整改采用“公开真实用途、减少身份混淆、官方来源优先、停止绕过安全保护、去除保证性表述、补足稳定信任信息”的方式。没有使用任何检测规避方法。

正式域名是否存在历史安全问题、被入侵资源、恶意重定向或广告政策限制，不能只靠本地源码判断。

## 4. 低改动整改方案与执行状态

### 4.1 下载和安装安全

- 软件入口优先指向产品官网、官方文档或项目官方 GitHub Releases。
- 本站不托管、不代理、不重新打包安装包。
- 下载文字改成“前往官方发布页”“查看官方安装方式”等可识别目标。
- 远程脚本附近增加发布方、域名、作用、审阅和停止条件。
- 撤下 Gatekeeper、SmartScreen、ExecutionPolicy Bypass、TLS/签名绕过。
- 第三方工具与网关均明确标注，不借用模型厂商官方身份。

### 4.2 身份和信任

- Footer 稳定显示独立站身份、非官方关系、不托管安装包、不要求上传 API Key。
- 新增 /site-info，包含关于本站、安全下载、API Key、隐私、条款、免责声明、联系与商业关系待确认说明。
- 首页、安装页、API Key 页和 CC Switch 页增加就近提示。
- 未编造公司名称、邮箱、商业合作、推荐费用或隐私承诺。

### 4.3 内容准确性

- 版本、命令、环境变量、配置位置和平台支持只依据官方文档、官方仓库或 Release。
- 无法确认的客户端内部字段、模型、网关兼容性和截图内容不再写成确定事实。
- 错误页改为“案例线索 + 官方诊断入口”，不把个案描述为官方根因或保证修复。

### 4.4 技术信任与 SEO

- 52 页具备显式、唯一 title 和 description。
- 每页生成 canonical；基础 Open Graph 信息准确。
- 根布局提供 WebSite JSON-LD，文档页提供不虚构作者、评分或发布日期的 TechArticle JSON-LD。
- robots.txt 允许必要资源抓取并声明正式 sitemap；sitemap 不再伪造更新时间。
- 404 使用准确标题和 noindex。
- 生产模式增加安全响应头；开发模式不强制 CSP/HSTS，避免破坏本地调试。

### 4.5 第二、三轮复审追加整改

- 修复搜索索引解析器：不再把多行 MDX props、`/>` 或组件数据对象显示为正文/标题，同时保留行内代码中的 `<provider>/<model-id>`。
- 搜索索引生成增加失败条件：空标题、空正文、空 heading、重复 route 均阻止构建。
- OpenClaw 页面更新部署形态、companion apps、渠道清单与验证命令，撤下未确认的微信/企业微信/钉钉及 REST/MQTT 表述。
- Cherry Studio 撤下当前官方资料未确认的固定 Provider 数量和发行版/内核要求。
- Codex 页面补充 OpenAI 官方 macOS/Linux 安装脚本，说明默认发布域名与 GitHub 回退；不复制会调整 PowerShell ExecutionPolicy 的远程命令。
- GPT Image 页增加第三方图片工具接触 Key、提示词和图片内容的就近说明，并建议用途单一、额度受限、可撤销的测试 Key。
- 第三方工具入口从“推荐”改为中性“图形化配置方式”；推理档位和模型属性改为结构示例，不暗示效果或兼容性。
- CSP 的 `img-src` 收紧为实际使用的 self/data/blob，新增 `frame-src 'none'`；移除未获运营方确认的 HSTS `includeSubDomains`，关闭 `X-Powered-By`。
- 首页 Open Graph type 修正为 `website`；文档页继续为 `article`。

## 5. 实际修改文件列表

### 5.1 应用、SEO、安全与公共组件

- next.config.mjs
- mdx-components.tsx
- mdx-components.module.css
- scripts/lib/content-fs.mjs
- scripts/build-search-index.mjs
- src/app/layout.tsx
- src/app/[[...slug]]/page.tsx
- src/app/sitemap.ts
- src/app/not-found.tsx
- src/lib/site.ts
- src/components/layout/Footer.tsx
- src/components/layout/Footer.module.css
- src/components/search/SearchButton.tsx
- src/components/ui/Feature.tsx
- src/components/ui/TokenGroupFilter.tsx
- src/components/ui/VersionBadge.tsx
- src/components/docs/ErrorMeta.tsx
- src/components/docs/ErrorMeta.module.css
- public/manifest.webmanifest
- public/sw.js

### 5.2 内容

- src/content/index.mdx
- src/content/site-info.mdx（新增）
- src/content/cc-switch.mdx
- src/content/gpt-image.mdx
- src/content/get-key/create.mdx
- src/content/get-key/groups.mdx
- src/content/get-key/switch-group.mdx
- src/content/claude-code/cli 下 5 个页面
- src/content/claude-code/desktop 下 4 个页面
- src/content/claude-code/errors.mdx
- src/content/claude-code/errors 下 17 个详细错误页
- src/content/codex 下 5 个页面
- src/content/opencode 下 5 个页面
- src/content/openclaw 下 3 个页面
- src/content/cherry-studio 下 2 个页面
- src/content/hermes 下 3 个页面

### 5.3 自动生成文件

- src/generated/content-manifest.ts
- public/search-index.json
- next-env.d.ts、tsconfig.tsbuildinfo 可能由 Next.js/TypeScript 校验更新，不是手工业务改动
- AUDIT_REPORT.md（本报告）

README.md、DEPLOY.md、package.json 和其余被审计文件没有因本次任务而进行不必要改写。

## 6. 产品内容更新与官方来源

所有行的核对日期均为 2026-07-26。文档没有明确发布日期时标记为“滚动文档”，不自行推断发布日期。

| 页面 | 原内容 | 更新后内容 | 官方来源 | 来源发布日期/版本 | 核对日期 |
|---|---|---|---|---|---|
| Claude Code CLI 安装、首页 | npm 仍像当前推荐方式；安装脚本缺少安全说明 | 原生安装为当前推荐；npm 标为旧方式；列出官方脚本来源、平台要求和审阅提示 | [Setup](https://code.claude.com/docs/en/setup)、[官方仓库](https://github.com/anthropics/claude-code)、[Releases](https://github.com/anthropics/claude-code/releases/latest) | v2.1.220，2026-07-25；文档滚动更新 | 2026-07-26 |
| Claude Code CLI 手动配置、CC Switch | ANTHROPIC_API_TOKEN、内部引导字段、未经确认变量 | 更正 ANTHROPIC_AUTH_TOKEN；区分 API_KEY/Auth Token 请求头；撤下内部字段和 skipWebFetchPreflight | [LLM Gateway](https://code.claude.com/docs/en/llm-gateway-connect)、[Settings](https://code.claude.com/docs/en/settings)、[Environment variables](https://code.claude.com/docs/en/env-vars) | 滚动文档；Claude Code v2.1.220 | 2026-07-26 |
| Claude Code CLI 使用 | 高风险权限参数缺少充分边界，部分命令/参数过时 | 默认保留确认；危险参数仅作风险说明；按当前 CLI 和官方文档更新 | [Claude Code overview](https://code.claude.com/docs/en/overview)、[官方仓库](https://github.com/anthropics/claude-code) | v2.1.220，2026-07-25 | 2026-07-26 |
| Claude 桌面版安装、手动配置、CC Switch | 把第三方推理内部路径或开启方式写成确定事实 | 官方下载页优先；内部 schema 无法确认时不提供强制开启步骤 | [Claude 官方下载页](https://claude.com/download) | 滚动发布；2026-07-26 页面状态 | 2026-07-26 |
| Claude GPT 模型两页 | 根据旧截图列出静态 GPT 模型和兼容性 | 第三方网关能力、CC Switch 协议路由和 OpenAI 官方模型目录分开说明 | [OpenAI Models](https://developers.openai.com/api/docs/models)、[Responses migration](https://developers.openai.com/api/docs/guides/migrate-to-responses)、[CC Switch](https://github.com/farion1231/cc-switch) | 滚动文档；CC Switch v3.18.0 | 2026-07-26 |
| Claude 错误索引与 15 个常规错误页 | 个案被写成确定根因；含打印 Key、泛化 chmod、强制进程操作 | 改为官方诊断入口、非敏感检查、最小权限和案例边界 | [Debug config](https://code.claude.com/docs/en/debug-your-config)、[Troubleshoot installation](https://code.claude.com/docs/en/troubleshoot-install)、[Anthropic status](https://status.anthropic.com) | 滚动文档；Claude Code v2.1.220 | 2026-07-26 |
| claude-mem 两个错误页 | 直接数据库 DELETE、强制结束进程，版本过时 | 使用项目官方 status/logs/restart 与交互式恢复；先备份；不把 claude-mem 描述为 Anthropic 官方产品 | [claude-mem 文档](https://docs.claude-mem.ai/troubleshooting)、[官方仓库](https://github.com/thedotmack/claude-mem)、[v13.12.4](https://github.com/thedotmack/claude-mem/releases/tag/v13.12.4) | v13.12.4，2026-07-23 | 2026-07-26 |
| Codex CLI 安装、使用 | 远程 PowerShell Bypass、平台和登录说明过时 | 补充官方 macOS/Linux 安装脚本及发布域名；保留 npm/Release；不复制会调整 ExecutionPolicy 的远程命令；区分 ChatGPT 登录和 API 配置 | [Codex 文档](https://developers.openai.com/codex)、[CLI reference](https://developers.openai.com/codex/cli/reference)、[官方仓库](https://github.com/openai/codex)、[Releases](https://github.com/openai/codex/releases/latest) | v0.145.0，2026-07-21；文档滚动更新 | 2026-07-26 |
| Codex 手动配置、CC Switch | 第三方 Base URL/模型与官方支持范围混合 | 按官方 config/auth/model 文档说明；第三方端点能力以网关为准 | [Config basic](https://developers.openai.com/codex/config-basic)、[Config advanced](https://developers.openai.com/codex/config-advanced)、[Auth](https://developers.openai.com/codex/auth)、[Models](https://developers.openai.com/codex/models) | 滚动文档；Codex v0.145.0 | 2026-07-26 |
| Codex 桌面版安装 | 下载来源与高级 download URL 覆盖边界不清 | 使用 OpenAI 默认安装流程，不推荐未知 download URL；本站不托管安装包 | [Codex 文档](https://developers.openai.com/codex)、[官方仓库](https://github.com/openai/codex) | v0.145.0，2026-07-21 | 2026-07-26 |
| OpenCode CLI、桌面、手动、CC Switch | 安装方式、配置路径和第三方 provider 能力有旧表述 | 更新官方安装/Release、配置与 provider schema；Key 使用环境变量；桌面状态以 Release 为准 | [OpenCode docs](https://opencode.ai/docs/)、[Config](https://opencode.ai/docs/config/)、[Providers](https://opencode.ai/docs/providers/)、[官方仓库](https://github.com/anomalyco/opencode)、[Releases](https://github.com/anomalyco/opencode/releases/latest) | v1.18.5，2026-07-24 | 2026-07-26 |
| OpenClaw 安装、手动、CC Switch | 同名项目身份、Node 要求、provider、部署形态和渠道说明可能过时 | 确认为 openclaw/openclaw；更新 Node、onboard、Gateway、Control UI、companion apps、provider、渠道与验证命令；撤下未确认渠道 | [OpenClaw docs](https://docs.openclaw.ai/)、[Channels](https://docs.openclaw.ai/channels)、[Gateway configuration](https://docs.openclaw.ai/gateway/configuration)、[Model providers](https://docs.openclaw.ai/concepts/model-providers)、[官方仓库](https://github.com/openclaw/openclaw)、[Releases](https://github.com/openclaw/openclaw/releases/latest) | v2026.7.1，2026-07-13 | 2026-07-26 |
| Cherry Studio 安装、手动 | 下载资产、平台与“本地数据”边界不清；含绕过 Gatekeeper 风险；固定 Provider 数量缺少当前来源 | 只指向 CherryHQ Releases；核对平台/架构；说明模型请求仍发送到所选 provider；撤下绕过和未确认 Provider 数字 | [官方仓库](https://github.com/CherryHQ/cherry-studio)、[Releases](https://github.com/CherryHQ/cherry-studio/releases/latest) | v1.9.12，2026-07-05 | 2026-07-26 |
| Hermes 安装、手动、CC Switch | “Hermes”具体项目身份、配置位置和 provider 兼容性不够确定 | 确认为 NousResearch/hermes-agent 和 Nous Research 文档；按官方 provider/configuration 说明更新 | [Hermes docs](https://hermes-agent.nousresearch.com/docs/)、[Providers](https://hermes-agent.nousresearch.com/docs/integrations/providers)、[Configuration](https://hermes-agent.nousresearch.com/docs/user-guide/configuration)、[官方仓库](https://github.com/NousResearch/hermes-agent)、[Releases](https://github.com/NousResearch/hermes-agent/releases/latest) | 产品版本 0.19.0；tag v2026.7.20 | 2026-07-26 |
| CC Switch 安装与各产品配置页 | 支持客户端、数据位置、官方身份和下载表述不够准确 | 明确 farion1231 社区工具；只指向 ccswitch.io 和官方 Releases；更新支持范围和敏感配置说明 | [项目官网](https://ccswitch.io)、[官方仓库](https://github.com/farion1231/cc-switch)、[Releases](https://github.com/farion1231/cc-switch/releases/latest) | v3.18.0，2026-07-21 | 2026-07-26 |
| GPT Image | 静态模型/能力表可能把网关能力当成 OpenAI 官方能力；第三方图片工具处理 Key 与输入内容的边界不足 | 以 OpenAI 图片生成文档确认官方模型；网关能力由实时结果决定；增加用途单一、额度受限、可撤销 Key 与敏感内容提示 | [Image generation](https://developers.openai.com/api/docs/guides/image-generation)、[Models](https://developers.openai.com/api/docs/models) | 滚动文档 | 2026-07-26 |
| API Key 三页 | 网关分组、倍率和模型容易被理解为厂商官方事实 | 明确 foropencode 是第三方网关；示例使用 sk-xxx；倍率、计费、模型均以控制台实时结果为准 | 该网关的运营事实没有可验证的厂商官方文档；模型事实仅对照各厂商官方目录 | 待运营方提供正式资料 | 2026-07-26 |

## 7. 无法确认、需要人工决定的事实

| 事项 | 当前处理 | 上线前要求 |
|---|---|---|
| 运营主体 | 仓库无可验证公司/个人主体，未编造 | 提供真实名称、适用地区和必要登记信息 |
| 联系方式与纠错渠道 | /site-info 明确标记缺失 | 提供能实际收件和处理纠错/安全报告的邮箱或工单入口 |
| 与 foropencode 网关的关系 | 无法确认本站是否由网关运营、关联、赞助或获得推荐费用 | 如实披露所有权、关联、佣金、赞助和排序原则 |
| 隐私与日志 | 只能确认前端无广告、第三方统计、登录或 Key 上传表单 | 根据生产托管、CDN、日志、客服、支付和统计配置补充真实隐私政策 |
| 网关 Base URL、模型、倍率、价格和数据保留 | 页面只保留第三方示例并要求实时核对 | 由网关运营方提供正式、稳定、可公开引用的说明 |
| Claude 桌面版第三方推理内部 schema | 可访问的 Anthropic 官方资料未确认 | 在官方公开支持前，不恢复内部文件注入或强制开启步骤 |
| 截图版本 | 保留原截图，正文注明不代表当前能力 | 运营方可逐页重拍；不是本次低改动整改的阻塞项 |
| foropencode.com/v1 的 HTTP GET | 浏览器 GET 返回 404，但它是 API Base URL，不是网页 | 部署后用文档规定的实际 API 方法和鉴权验证，不用 GET 状态代替协议测试 |
| Anthropic 文档在部分地区的可访问性 | 当前网络可能跳转 region unavailable；低并发重试官方文档可返回 200 | 不能据此把官方链接改成镜像；生产用户仍应访问官方来源 |
| HSTS 子域边界 | 当前生产配置仅含 `max-age=31536000`，没有 `includeSubDomains` 或 preload | 只有确认所有子域长期 HTTPS 后，才考虑增加 includeSubDomains/preload；不能因主站 HTTPS 自动推定 |
| CSP 中 unsafe-inline | Next.js 元数据、主题初始化和当前样式需要；未照抄会破站的模板 | 生产部署后观察 CSP 报告；未来可用 nonce/hash 逐步收紧，不能直接删除 |
| 构建期 new Function | 仅用于仓库内受信任 _meta.ts，不进入浏览器 bundle | 限制内容仓库写权限；若未来接收外部投稿，再改为静态数据格式 |

## 8. 验证结果

### 8.1 编译与生成

| 检查 | 结果 |
|---|---|
| pnpm typecheck | 通过。最终运行生成 52 pages、10 sidebar groups、51 ordered routes，`tsc --noEmit` 通过 |
| pnpm build | 通过。Compiled successfully；57/57 静态页面生成成功；最后一次构建在全部补丁后执行 |
| 搜索索引 | public/search-index.json 为 52 docs、52 个唯一 route；空 heading/正文、重复 route、JSX props 泄露均为 0；行内代码 `<provider>/<model-id>` 保留 |
| 原有页面保留 | 51 个原有有序内容路由全部保留；新增 /site-info |
| 内部链接 | 内容生成脚本的内部链接校验通过，未发现目标路由缺失 |
| 图片引用 | 未发现内容引用的本地图片缺失 |

第一次复跑 typecheck 时，当前桌面终端没有把 Node 加入 PATH，命令在运行项目脚本前即报 node: command not found。随后使用工作区提供的 Node/pnpm 运行时复跑，typecheck 和 build 均通过；这属于执行环境问题，不是项目类型错误。

### 8.2 下载、脚本和敏感信息

| 检查 | 结果 |
|---|---|
| 自动下载 | 未发现 a[download]、beforeinstallprompt、自定义 PWA 安装提示、location 跳转或页面交互触发下载 |
| 安装包 | public 和 src 中没有 exe、msi、dmg、pkg、AppImage、zip、rar、7z、sh、ps1 文件 |
| 外链脚本 | 未发现从第三方域名注入运行时脚本 |
| 表单与上传 | 未发现表单、文件上传、密码输入或 API Key 上传控件 |
| Service worker | 仅处理同源 GET；只缓存页面、Next 静态资源、图片和字体；搜索索引网络优先 |
| 密钥扫描 | 未发现真实 API Key、Token、私钥、私人 QQ 或私人账号；示例使用 sk-xxx |
| 高风险词 | 命中均为“不要关闭/不要绕过”等安全禁止语境；没有“立即下载、一键下载、保证成功”式诱导 |

### 8.3 外部链接

- 从当前源内容提取并直接核对 73 个唯一外部 URL：72 个网页入口返回 200。
- 唯一浏览器 GET 为 404 的地址是 `https://foropencode.com/v1`；它是 API Base URL，须用网关规定的实际 API 方法与鉴权验证，不能用网页 GET 代替协议测试。
- `chatgpt.com/codex/install.sh` 最终到 OpenAI 的 `releases.openai.com`；Claude 的 install.sh/ps1/cmd 最终到 Anthropic 的 `downloads.claude.ai`，均返回 200。
- `opencode.ai/install` 最终到 `raw.githubusercontent.com/anomalyco/opencode` 官方仓库内容，返回 200。
- `developers.openai.com/codex/...` 当前会跳转到 OpenAI 的 `learn.chatgpt.com/docs/...`；页面仍保留官方仓库当前使用的 developers.openai.com 入口。
- Google 政策 8 个官方页面以 GET 复核均返回 200；Google Ads 页面不支持本次环境的 HEAD 检查，不能把 HEAD 404 误判为页面失效。
- 没有调用第三方扫描服务，也没有向外部上传项目内容。

### 8.4 SEO、响应头与页面

- robots.txt 允许抓取并指向 https://foropencode.com/sitemap.xml。
- sitemap.xml 包含首页、51 个既有内容路由和新增 /site-info，不包含伪造 lastModified。
- 首页 canonical 为 https://foropencode.com；关键内容页 canonical 与各自正式路由一致。
- 首页有 WebSite JSON-LD；文档页有 WebSite + TechArticle JSON-LD。
- 404 最终浏览器标题为“页面不存在 · foropencode”，robots 为 noindex 语义。
- 生产响应头实测存在：
  - Content-Security-Policy
  - X-Content-Type-Options: nosniff
  - Referrer-Policy: strict-origin-when-cross-origin
  - Permissions-Policy
  - frame-ancestors 'none'（在 CSP 内）
  - frame-src 'none'（在 CSP 内）
  - Strict-Transport-Security
- `img-src` 仅允许 self/data/blob，不再允许任意 HTTPS 图片；HSTS 不含 includeSubDomains；未暴露 X-Powered-By。
- CSP 与当前 Next.js、内联主题初始化、图片、字体、manifest 和 service worker 兼容；浏览器控制台无 warning/error。
- 浏览器交互复核了首页、Claude/Codex 安装、OpenClaw、API Key、GPT Image、site-info、404、Footer、主题和搜索；390×844 视口下布局容器未超出页面，宽代码行在代码块内部滚动，图片均有 alt。
- 搜索“启动方式”正确返回 Claude Code、Codex、OpenCode 标题/正文结果，没有 `', desc:`、MDX props 或 `/>` 异常 heading。

本地 pnpm start 使用生产构建但仍是 HTTP。HSTS 头只有在真实 HTTPS 响应中才会被浏览器接受；正式效果必须在生产 HTTPS 域名验证。
当前本地生产预览保持运行：`http://127.0.0.1:3020/`。

## 9. 部署后检查清单

1. 在正式 HTTPS 域名逐页核对首页、安装页、API Key、CC Switch、GPT Image、site-info、Footer 和 404。
2. 确认生产反向代理/CDN 没有删除、重复覆盖或放宽 CSP、nosniff、Referrer-Policy、Permissions-Policy 和 HSTS。
3. 当前 HSTS 不含 includeSubDomains；只有确认所有子域长期支持 HTTPS 后才考虑增加，未确认前不要提交 HSTS preload。
4. 用浏览器开发者工具检查 CSP 控制台错误、混合内容、第三方脚本和意外网络请求。
5. 检查正式 robots.txt、sitemap.xml、canonical、Open Graph、WebSite/TechArticle JSON-LD。
6. 用实际 API 方法验证 foropencode Base URL、鉴权、模型列表和错误响应；不要用浏览器 GET 结果代替。
7. 由运营方补充真实运营主体、联系方式、纠错渠道、隐私政策和商业/关联关系披露。
8. 确认生产环境是否新增统计、广告、客服、支付、嵌入内容或日志处理；如有，同步更新隐私说明和 CSP。
9. 在 Google Search Console 的 Security Issues 和 Manual Actions 中检查正式域名。
10. 检查 Google Safe Browsing 正式域名状态；若已有警告，按官方流程修复后申请复审。
11. 如投放 Google Ads，在广告账户中检查具体拒登原因、落地页最终 URL 和政策通知，不把本报告当成广告审核结果。
12. 抽查所有软件下载入口的最终域名、仓库所有者、Release 资产、签名或校验值。
13. 重新运行 pnpm typecheck、pnpm build、内部链接、外链、密钥和高风险词扫描。
14. 确认搜索索引仍为 52 文档，51 个原有页面没有丢失。

## 10. 回滚方式

当前目录不是 Git 仓库，因此不能使用 git diff、git checkout 或 git reset 回滚。

建议在部署前：

1. 复制整个 /Users/macos/Downloads/ModelGatewayDocs 到带日期的备份目录；至少备份本报告“实际修改文件列表”中的所有文件。
2. 保存部署前构建产物版本、CDN/托管平台配置和生产响应头配置。
3. 若需回滚，停止服务，恢复备份文件，重新运行 pnpm typecheck 和 pnpm build，再启动服务。
4. 不要只回滚 public/search-index.json 或 src/generated/content-manifest.ts；它们应由当前内容重新生成，避免导航、搜索和正文不一致。

## 11. 明确声明

- 本次整改没有使用 cloaking。
- 没有使用隐藏内容、隐藏关键词、UA 判断、IP 判断或搜索引擎/普通用户差异化展示。
- 没有动态替换下载链接、伪装按钮、混淆脚本、自动下载或检测规避技术。
- 没有隐瞒本站提供第三方模型网关、第三方客户端和社区工具配置教程的真实用途。
- 没有部署项目、提交 Search Console、申请 Google 复审、调用第三方扫描服务或向外部发送项目内容。
- 本地检查不能等同于 Google 已解除风险。正式域名仍必须检查 Google Search Console Security Issues、Safe Browsing 状态、Google Ads 具体政策通知以及真实生产响应头。

---

## 12. 第二轮：残余风险复核与事实再核对（2026-07-26）

第二轮以多智能体并行方式复核了全部 52 个 MDX 页面、33 个应用/组件文件、74 个唯一外部链接、7 个 Google 官方政策页面，并按产品对照官方文档与官方 GitHub 再次核对事实（Claude Code、Codex、OpenCode、OpenClaw、CC Switch、OpenAI 模型/图片文档均完成核对；Cherry Studio 与 Hermes 的独立核对轮次因执行环境 API 错误中断，仅完成 Releases 版本核对，见 12.5）。

### 12.1 复核结论

- **无 P0/P1 残余**：没有自动下载、伪装按钮、托管可执行文件、欺骗性跳转、混淆脚本、隐藏内容或 cloaking；安装命令均标注官方最终域名与来源；第三方工具与网关处处标注非官方；密钥示例仅 `sk-xxx`；无真实邮箱/账号信息。
- 第一轮遗留问题集中在 **P2（事实性偏差）** 和 **P3（可访问性/元信息）**，本轮已全部修复（详见 12.2/12.3）。
- 唯一仍然开放的合规缺口是 **运营主体、联系方式与商业关系披露**（第 7 节阻塞项，需运营方线下补齐，本轮未编造）。

### 12.2 第二轮内容修复（P2 事实性偏差，均据官方来源）

| 页面 | 原内容 | 更新后内容 | 官方来源 | 核对日期 |
|---|---|---|---|---|
| claude-code/cli/install | "npm 安装已弃用" | npm 为官方高级安装选项，安装同一原生二进制（v2.1.198 起需 Node 22+） | code.claude.com/docs/en/setup | 2026-07-26 |
| claude-code/cli/install | "Windows 原生需要 Git for Windows" | Git for Windows 为可选；未安装时使用 PowerShell 工具 | 同上 | 2026-07-26 |
| claude-code/cli/install | 版本输出示例 "Claude Code 2.1.220" | "2.1.220 (Claude Code)"（官方输出格式） | 同上 | 2026-07-26 |
| claude-code/cli/install | 磁盘约 200 MB（官方未公布） | 改为官方系统要求（4 GB+ 内存、x64/ARM64、Debian 10+） | 同上 | 2026-07-26 |
| claude-code/cli/manual | ANTHROPIC_MODEL "覆盖 /model" | 方向更正：会被 --model 与 /model 覆盖 | code.claude.com/docs/en/env-vars | 2026-07-26 |
| claude-code/cli/manual | shell 环境变量"优先级高于 settings.json" | 更正：同名变量以 settings.json env 段为准；shell 导出仅当前会话 | code.claude.com/docs/en/llm-gateway-connect | 2026-07-26 |
| claude-code/cli/manual | skipWebFetchPreflight "未确认已撤下" | 官方现已记录该 settings 选项（仅网络封锁 api.anthropic.com 时用） | 同上 | 2026-07-26 |
| claude-code/cli/usage | `--no-update-check`（官方不存在）；"检查更新但不安装"注释 | 删除该参数与示例；改为 DISABLE_AUTOUPDATER 官方方式 | code.claude.com/docs/en/cli-reference | 2026-07-26 |
| claude-code/cli/usage | /ide "在 IDE 中打开当前文件" | 更正为"管理 IDE 集成连接" | 同上 | 2026-07-26 |
| claude-code/desktop/install、manual、cc-switch | 第三方推理入口"无法确认" | 官方 llm-gateway-connect 已记录：管理员分发配置或 Help → Troubleshooting → Enable Developer Mode → Developer → Configure Third-Party Inference；补充官方限制（本机会话、表单只读优先级）与 Linux beta（Ubuntu/Debian） | code.claude.com/docs/en/llm-gateway-connect、claude.com/download | 2026-07-26 |
| claude-code/errors/cc-401-ide-mcp-conflict | 指引修改不存在的顶层 apiKey/baseURL 字段 | 改为检查 env 段官方变量与 apiKeyHelper | code.claude.com/docs/en/settings | 2026-07-26 |
| claude-code/errors/cc-400-experimental-betas | "AWS 分组对应上游"写成确定事实 | 改为中性表述，须由网关按日志确认 | —（去除未证实断言） | 2026-07-26 |
| codex/manual | wire_api chat "已弃用并计划移除" | 更正：官方配置参考中 wire_api 仅支持 responses，chat 已不在受支持取值 | learn.chatgpt.com/docs/config-file/config-reference | 2026-07-26 |
| codex/cli/install | 升级命令 npm update -g | 改为 npm install -g @openai/codex@latest | github.com/openai/codex | 2026-07-26 |
| codex/cli/install | "CLI 与 App 配置共享 ~/.codex/config.toml"（未证实） | 软化为 CODEX_HOME 共用范围以官方文档为准 | learn.chatgpt.com/docs | 2026-07-26 |
| opencode/manual、desktop/install、cc-switch | OPENCODE_CONFIG_DIR 被当作配置文件路径；Windows 路径误写 %APPDATA% | OPENCODE_CONFIG=配置文件、OPENCODE_CONFIG_DIR=扩展目录；Windows 全局配置为 %USERPROFILE%\.config\opencode\opencode.json | opencode.ai/docs/config/ | 2026-07-26 |
| opencode/cli/install | 供应商示例含 Mistral（不在当前官方目录）、Google 写法 | 换为官方目录现有条目；Google 写作 Google Vertex AI | opencode.ai/docs/providers/ | 2026-07-26 |
| opencode/manual | @ai-sdk/anthropic 适配写法未注明来源属性 | 注明为社区常见写法，以官方与端点方文档为准 | 同上 | 2026-07-26 |
| openclaw/install | "Latest LTS 即为 22.x/24.x" | 更正：Latest LTS 当前为 24.x；22.x 为维护中的旧 LTS 线 | nodejs.org/en/download | 2026-07-26 |
| openclaw/cc-switch、hermes/cc-switch | 步骤无条件指示选 "OpenAI Responses" 协议，与各自 manual 页官方支持协议矛盾 | 改为按各产品官方支持的协议选择，并补充添加后核对方法 | docs.openclaw.ai、hermes-agent.nousresearch.com/docs | 2026-07-26 |
| hermes/install | 源码安装缺 git clone/cd 步骤（照抄必然失败） | 补齐 clone + cd + 虚拟环境说明 | github.com/NousResearch/hermes-agent | 2026-07-26 |
| index.mdx | "选 foropencode 预设"（未证实）；"自动写入 Base URL，无需手动配置"（与详细页矛盾） | 改为与详细配置页一致：手动新建供应商/填入核对过的 Base URL | 本站详细页交叉一致性 + CC Switch README | 2026-07-26 |
| cc-switch.mdx | AUR cc-switch-bin 未标注社区打包 | 注明 AUR 为社区维护并给出 PKGBUILD 核对方法 | aur.archlinux.org 属性说明 | 2026-07-26 |
| claude-code/errors/cc-invalid-key-format | 失效锚点 platform.claude.com/docs/en/api/client-sdks#authentication | 改链 Anthropic Console API Keys（platform.claude.com/settings/keys，实测 200） | 实测 | 2026-07-26 |
| codex/cli/usage | 页脚"沙箱与审批"链接指向 /codex/security（现为安全扫描产品页） | 改链 /codex/sandboxing（重定向至官方 Sandbox 文档，实测 200） | learn.chatgpt.com/docs/sandboxing | 2026-07-26 |

### 12.3 第二轮组件/元信息修复（P3）

- src/app/layout.tsx：apple-touch-icon 由 SVG（iOS 不支持）改为 /logo.png。
- mdx-components.tsx：外链判定补充协议相对 `//` 前缀，防止漏加 noopener noreferrer。
- src/components/ui/Tabs.tsx：补全 WAI-ARIA Tabs 模式（tab/tabpanel 配对 id、aria-controls/aria-labelledby、方向键 roving tabindex）。
- src/components/ui/TokenGroupFilter.tsx：筛选按钮组由误用的 tablist 语义改为 role="group" + aria-pressed。
- src/components/ui/Image.tsx：灯箱图片增加键盘可达（role="button"、tabIndex、Enter/Space）。
- src/components/layout/MobileDocBar.tsx：移动端抽屉 dialog 增加可访问名称。
- src/components/search/SearchModal.tsx：输入框补 combobox 语义（aria-expanded/controls/activedescendant）；listbox 中非结果项加 role="presentation"；结果项加 id。
- claude-code/errors/cc-429-rate-limit：删除代码块内两处行尾多余反引号。
- claude-code/errors/cc-023：修正标题层级（####→###）、补充 foropencode 第三方说明。
- codex/cc-switch、hermes/cc-switch：截图 alt 文本去除与正文矛盾的指令性描述，注明截图来源。
- opencode/cli/usage：`-p/--print` 旧旗标说明改为以 `--help` 实际输出为准。

### 12.4 第二轮验证结果

| 检查 | 结果 |
|---|---|
| pnpm typecheck | 通过（52 pages、10 sidebar groups、51 ordered routes；tsc --noEmit 无错误） |
| pnpm build | 通过（停止 dev 后执行；57/57 静态页生成成功） |
| 搜索索引 | 52 docs、52 唯一 route |
| 内部链接 | 全部 MDX 内链对照 manifest 路由 + redirects 校验通过 |
| 页面 HTTP | 全部被修改页面及关键页面 200；未知路由 404 |
| 渲染抽查 | npm 表述、优先级更正、aria-pressed、no-update-check 移除、git clone、Developer Mode 入口均在渲染页面确认 |
| 新增外链 | platform.claude.com/settings/keys、developers.openai.com/codex/sandboxing（→learn.chatgpt.com）、code.claude.com/docs/en/llm-gateway-connect 实测 200 |
| 高风险词/密钥/可执行文件/自动下载 | 再扫描均为空（禁止语境命中除外） |
| 52 页完整性 | 52 个 MDX 全部保留，无丢失 |

Google 政策 7 个官方页面再次确认可访问且主题一致（核对日期 2026-07-26），政策要点与第 3 节一致。

### 12.5 第二轮无法完成/仍待确认

- Cherry Studio 与 Hermes 的完整事实核对轮次因执行环境 API 错误中断。已独立核对：Cherry Studio 最新 Release v1.9.12（2026-07-05）、Hermes v0.19.0（tag v2026.7.20，2026-07-20），与两页 VersionBadge 一致；其余细节（下载资产名、配置字段）保留第一轮结论与软表述，建议后续复核。
- CC Switch 界面细节（表单字段、写入路径）多为 unverifiable：官方 README 未逐项记录，页面已用"以当前版本/备份提示为准"软表述覆盖，不构成需修改项。
- 运营主体、联系方式、商业关系披露仍为上线/投放前阻塞项（同第 7 节）。
- CSP `script-src 'unsafe-inline'` 保留（已知权衡，见第 7 节）；后续可用 nonce/hash 收紧。

### 12.6 第二轮修改文件清单

内容（18 个）：index.mdx、cc-switch.mdx、claude-code/cli/{install,manual,usage}.mdx、claude-code/desktop/{install,manual,cc-switch}.mdx、claude-code/errors/{cc-401-ide-mcp-conflict,cc-400-experimental-betas,cc-invalid-key-format,cc-429-rate-limit,cc-023-skip-auto-permission-prompt-plan-fail}.mdx、codex/{manual,cc-switch}.mdx、codex/cli/{install,usage}.mdx、opencode/{manual,cc-switch}.mdx、opencode/cli/{install,usage}.mdx、opencode/desktop/install.mdx、openclaw/{install,cc-switch}.mdx、hermes/{install,cc-switch}.mdx

组件/应用（7 个）：src/app/layout.tsx、mdx-components.tsx、src/components/ui/{Tabs,TokenGroupFilter,Image}.tsx、src/components/layout/MobileDocBar.tsx、src/components/search/SearchModal.tsx

自动生成：src/generated/content-manifest.ts、public/search-index.json（构建再生成）

### 12.7 声明（第二轮）

第二轮同样没有使用 cloaking、隐藏内容、UA/IP 判断、差异化展示、动态替换下载链接、伪装按钮、混淆脚本、自动下载或任何检测规避技术；没有部署、提交 Search Console、调用第三方扫描服务或向外部发送项目内容（官方文档核对仅读取各产品官方公开页面）。本地验证不等同于 Google 已解除风险；正式域名仍需按第 9 节清单在生产环境验证。

---

## 13. 第三轮：排版/视觉/UX 与技术信任优化（2026-07-26）

本轮不改变整体设计、路由与内容组织，仅做以下点状优化：

### 13.1 排版与视觉

- **消除章节间"空白框"**：MDX 中 `---` 紧跟 `## 标题` 时，hr 与 h2 自带的上边框叠加产生约 130px 空白和双分隔线（错误页、索引页均可见）。现通过 `.prose hr:has(+ h2) { display: none }` 折叠，由 h2 统一的上边框作为章节分隔；不支持 `:has` 的旧浏览器回退为原样式（src/styles/prose.css）。
- **表格恢复原生语义**：`display: block` 的表格失去表格语义（影响读屏器与搜索引擎理解）。现由 MDX `table` 组件包裹 `.table-wrap` 滚动容器（mdx-components.tsx），表格恢复 `display: table`，横向滚动、圆角边框效果不变；外缘单元格去重边框。

### 13.2 UX 与可访问性

- 新增键盘"跳到正文"skip link：仅键盘聚焦时从顶部滑入，指向 `#main-content`（AppShell.tsx/.module.css），实测 Tab 后可见、Enter 落到正文。
- 移动端 375px 复核：无横向溢出；表格在窄屏可滚动。

### 13.3 技术信任与 SEO

- 每个文档页新增 **BreadcrumbList JSON-LD**，层级与可见面包屑一一对应，不虚构层级（src/app/[[...slug]]/page.tsx）。
- 生产安全响应头补充 `X-Frame-Options: DENY`（CSP frame-ancestors 的旧浏览器补充）与 `Cross-Origin-Opener-Policy: same-origin`（next.config.mjs）。

### 13.4 验证

- pnpm typecheck 通过；停 dev 后 pnpm build 通过（Compiled successfully，57/57）。
- 搜索索引仍为 52 docs；52 个 MDX 页面完整。
- Playwright 复核：hr 折叠生效（4/4 处 display:none）、表格 wrapper 生效且 display:table、BreadcrumbList 渲染正确、skip link 键盘可达、首页/暗色/移动端截图与基线一致（无回归）、全页面 console 无错误、移动端无横向溢出。
- 本轮同样未使用任何 cloaking、隐藏内容或检测规避技术；`:has` 折叠 hr 是纯视觉排版修正，对所有访问者（含 Googlebot）渲染一致。

辅助文件：.claude/shots.mjs（本地截图脚本，供后续视觉回归对比使用，不参与构建与部署）。

### 13.5 第四轮补充（同日）：对比度与导航语义

- PageHeader 元信息条的"适用场景/面向读者/TL;DR"标签在浅色主题下对比度仅 2.47:1（11px 小字），不满足 WCAG AA；由 `--c-text-subtle` 提升为 `--c-text-muted`，实测浅色 7.31:1、暗色 10.16:1（PageHeader.module.css）。
- 侧边栏、顶部导航（含移动端菜单）当前页链接补充 `aria-current="page"`；本页目录（TOC）当前小节补充 `aria-current="location"`（Sidebar.tsx、Header.tsx、Toc.tsx）——读屏器可感知当前位置，不再仅靠视觉高亮。
- 图片灯箱动画补充 `prefers-reduced-motion: reduce` 关闭（Image.module.css），与站内其余动效的既有规范对齐。
- 验证：typecheck 通过；build 通过（57/57）；Playwright 实测浅/暗双主题对比度、三处 aria-current 行为（滚动后 TOC current=1）均符合预期。

## 14. 第五轮：UX 细节、搜索去重与内容时效更新（2026-07-26）

### 14.1 内容时效核对（多智能体 + 官方来源）

7 个产品的最新 Release 已全部再次核对，**全部与文档一致，无过时版本**：Claude Code v2.1.220、Codex rust-v0.145.0、OpenCode v1.18.5、OpenClaw v2026.7.1、Cherry Studio v1.9.12、Hermes v2026.7.20 (0.19.0)、CC Switch v3.18.0（来源均为各官方 GitHub releases/latest，核对日期 2026-07-26）。

上一轮中断的 Cherry Studio / Hermes 深度核对本轮补齐，据官方文档修正：

| 页面 | 原内容 | 更新后内容 | 官方来源 |
|---|---|---|---|
| hermes/install | Python 3.10+；`pip install hermes-agent[termux]`；源码 `uv pip install -e ".[all,dev]"` | Python 3.11（官方脚本自动装，另装 Node 22/ripgrep/ffmpeg）；官方不提供面向用户的 pip 安装路径，Termux/源码改为按官方当前说明；补充 Hermes Desktop 桌面安装器与 `hermes desktop` 入口；需自备 git（Linux 另需 curl/xz-utils） | hermes-agent.nousresearch.com/docs/getting-started/installation |
| hermes/manual | ~/.hermes/{config.yaml,.env,auth.json}、`${VAR_NAME}`、auxiliary base_url 写法 | 与官方 Configuration 文档核对一致，未改动 | 同上 /docs/user-guide/configuration |
| cherry-studio/install | 把三平台数据目录写成确定路径表 | 官方文档未公布逐项路径；改为 Electron 惯例 + "以应用内设置或官方文档为准"；资料来源补官方文档域名（docs.cherry-ai.com 已 301 至 docs.cherryai.com.cn） | github.com/CherryHQ/cherry-studio、docs.cherryai.com.cn |

### 14.2 UX 与视觉

- 上一页/下一页链接补 `rel="prev"/"next"`（Pager.tsx）。
- 搜索结果去重：标题已包含小节名（如"OpenClaw · 安装"页的"安装"heading）时不再重复显示同页"页面 › 小节"低分条目，搜索"安装"的结果列表明显更干净（SearchModal.tsx）。
- 新增全局 print 样式：打印时隐藏导航/侧栏/页脚/翻页器，正文全宽，外链打印出完整 URL，代码块自动换行（reset.css）。
- 锚点跳转改为平滑滚动，且仅在 `prefers-reduced-motion: no-preference` 时启用（reset.css）；实测 reduce 环境回退 auto。

### 14.3 验证

- typecheck、build（57/57）通过；搜索索引 52 docs；被改页面 HTTP 200 且新文案已渲染。
- 搜索去重、pager rel、print 样式、smooth/reduced 滚动均经 Playwright 实测。
- 本轮外部核对仅读取官方公开页面；无 cloaking、无差异化展示。

## 15. 第六轮：身份披露落地与分享优化（2026-07-26）

运营方确认（用户提供）：本文档站的主站即 foropencode.com 网关本身，两者同一运营方。基于此事实与网关公开状态接口（api/status，公开返回 system_name "For API"、公告中的微信/QQ 群渠道）落地披露：

### 15.1 身份披露（解决此前唯一的 P1 阻塞项）

- 全站身份表述由"独立中文配置文档"更正为"foropencode.com 网关的配套中文配置文档"（首页 Hero/Callout、Footer、site.ts description、manifest、site-info）——此前的"独立"表述在确认关系后反而构成不准确披露。
- /site-info「联系、纠错与商业关系」重写为确定性披露：与网关同一运营方；对第三方客户端无付费推广/佣金；联系与售后渠道为网关控制台公告中的微信交流群与 QQ 售后群（登录后可见）；如实说明工商主体未公开，并建议投放 Ads 前补充可核验主体与公开邮箱。
- src/lib/site.ts 新增 operator 配置块：affiliationDisclosure 与 supportChannels 已按确认事实填写；legalName/contactEmail 留 null（无真实信息不编造），填写后 Footer 自动显示、根布局自动输出 Organization JSON-LD（条件生成，绝不虚构）。
- get-key/create 的第三方提示同步更新并链接到披露章节。

### 15.2 分享与视觉

- 新增 public/og.png（1200×630@2x，本地 Playwright 渲染生成，深色品牌风格，含六个产品 chip 与"网关配套文档"副标题）。
- og:image / twitter:image 接入根布局与页面级 metadata（此前页面级 openGraph 覆盖导致 og:image 从未输出——已修复）；twitter:card 升级为 summary_large_image。生产构建实测输出 https://foropencode.com/og.png。

### 15.3 验证与声明

- typecheck ✓；build ✓（57/57）；搜索索引 52 docs；Footer/site-info/首页新文案与 og 标签均经渲染实测。
- 披露内容全部来自运营方确认或网关公开接口的可见事实；无编造主体、邮箱或合作关系；无 cloaking。
- 残余待办（非阻塞）：运营方后续可补充可核验工商主体名称与公开联系邮箱（填入 src/lib/site.ts 的 operator 即自动生效）；Ads 投放前建议补齐。
