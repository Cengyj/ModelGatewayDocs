# ForOpenCode 新手接入向导

一个面向 Windows 新手的中文 Docusaurus 文档站，帮助用户完成：

- 下载安装 `CC Switch`
- 充值余额、创建并复制 API Key
- 配置 OpenClaw、OpenCode、Codex 接入 ForOpenCode
- 在失败时按现象排障

## 技术栈

- Docusaurus 3
- React 19
- TypeScript
- pnpm
- Markdown / MDX

## 本地开发

```bash
pnpm install
pnpm start
```

默认开发地址：`http://localhost:3000`

## 构建与本地生产预览

```bash
pnpm build
pnpm serve:prod
```

## 导出 Linux 部署包

如果你需要把项目打包后上传到 Linux 服务器，可以直接执行：

```bash
pnpm package:deploy
```

脚本会在项目上一级目录生成一个带时间戳的 `tar.gz` 部署包，并自动排除：
脚本会在项目当前目录生成一个带时间戳的 `tar.gz` 部署包，并自动排除：

- `node_modules/`
- `build/`
- `.docusaurus/`
- `.sisyphus/`

后续如果你让我帮你部署，我会默认先按这个流程生成部署包。

如果希望一条命令先构建再启动生产预览：

```bash
pnpm start:prod
```

如果 `3000` 端口已被占用，可在启动前设置：

```powershell
$env:PORT = "3001"
pnpm start:prod
```

如果需要让局域网其他设备访问，可在启动前设置：

```powershell
$env:SITE_URL = "http://YOUR_HOST_OR_IP:3000"
pnpm start:prod
```

## 当前信息架构

- 开始使用与分流入口
- 账号与软件前置准备
- OpenClaw、OpenCode、Codex 图文教程
- 配置参数总表
- 排障地图
- 名词解释与截图总表
- ADR 决策记录

## 项目约定

- `build/` 和 `.docusaurus/` 都是生成物，不应入库
- `.sisyphus/` 保存规划过程资料，保留但不进入站点导航
- `docs/adr/` 保存关键决策记录，保留并参与站点构建
- 本机配置、日志和敏感信息文件不应入库

## Docker / 1Panel 部署

项目已提供容器化部署文件：

- `Dockerfile`
- `.dockerignore`
- `nginx.conf`

容器默认对外提供 `80` 端口，适合直接放到 1Panel 的应用容器里运行。

### Linux 服务器快速部署

如果你是直接部署到 Linux 服务器上的 Docker / Docker Compose，建议按下面流程：

```bash
pnpm package:deploy
cp .env.container.example .env
docker compose up -d --build
docker compose ps
docker compose logs -f docs
```

其中：

- `HOST_PORT` 控制宿主机暴露端口，默认是 `8081`
- `SITE_URL` 要写用户实际访问到的公网地址
- 修改 `SITE_URL` 或 `ALGOLIA_*` 后，要重新执行 `docker compose up -d --build`

更完整的服务器部署步骤见 [DEPLOY.md](./DEPLOY.md)。

### 本地构建镜像

```bash
docker build -t model-gateway-docs .
docker run -d --name model-gateway-docs -p 8081:80 model-gateway-docs
```

### 需要自定义站点地址时

如果你希望构建时写入自己的正式域名，可以传入构建参数：

```bash
docker build -t model-gateway-docs \
  --build-arg SITE_URL=https://your-domain.com \
  .
```

### 1Panel 推荐用法

1. 在 1Panel 中选择从代码仓库或目录构建镜像。
2. 构建文件使用仓库根目录下的 `Dockerfile`。
3. 容器端口填写 `80`，再由 1Panel 做外部端口或反向代理映射。
4. 如果你有正式域名，构建时传入 `SITE_URL`。
5. 如果需要 Algolia 搜索，再额外传入：
   - `ALGOLIA_APP_ID`
   - `ALGOLIA_SEARCH_API_KEY`
   - `ALGOLIA_INDEX_NAME`

说明：

- `SITE_URL` 和 Algolia 变量是在镜像构建阶段写入的，不是运行阶段动态注入。
- 如果你只是先部署开发环境，可以先不传 Algolia 变量。

## 搜索

若要启用 Algolia DocSearch，需要提供以下环境变量：

- `ALGOLIA_APP_ID`
- `ALGOLIA_SEARCH_API_KEY`
- `ALGOLIA_INDEX_NAME`

如果未提供这些变量，站点仍可正常构建与访问，只是不启用搜索集成。
