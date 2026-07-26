# 部署指南

把当前 Next.js 站点部署到 Linux 服务器（x86_64）上的 Docker 容器。

**推荐方式：服务器直接拉取 GitHub Actions 预构建的镜像**（无需在服务器上装 Node/pnpm 或编译）。每次推送到 `main`，GitHub Actions 会自动构建 `linux/amd64` 镜像并推送到 GHCR：

- 镜像地址：`ghcr.io/cengyj/modelgatewaydocs:latest`
- 附带 `sha-<commit>` 标签可用于回滚

项目提供以下部署文件：

- `.github/workflows/docker-image.yml` — CI 构建并推送镜像到 GHCR
- `Dockerfile` — 多阶段构建，输出 Node.js 运行时镜像
- `compose.yaml` — Docker Compose 编排（默认拉取 GHCR 镜像）
- `.env.container.example` — 环境变量模板

## 前置条件

服务器需要具备：

- Docker 24+
- Docker Compose Plugin
- 可访问 `ghcr.io` 的网络

如果直接通过端口访问，需放行对外端口（默认 `8081`）。挂在 Nginx / Caddy / 1Panel 反向代理后面只需让代理转发到容器端口即可。

## 方式 A：拉取预构建镜像（推荐）

服务器上只需要 `compose.yaml` 和 `.env` 两个文件：

```bash
mkdir -p /opt/foropencode-docs && cd /opt/foropencode-docs
curl -fsSLO https://raw.githubusercontent.com/Cengyj/ModelGatewayDocs/main/compose.yaml
curl -fsSL https://raw.githubusercontent.com/Cengyj/ModelGatewayDocs/main/.env.container.example -o .env
docker compose up -d
docker compose ps
```

若仓库或镜像设为私有，先登录 GHCR（用 GitHub 账号 + 具有 `read:packages` 权限的 token）：

```bash
docker login ghcr.io -u Cengyj
```

### 更新发布

推送到 `main` → Actions 自动出新镜像 → 服务器上：

```bash
docker compose pull && docker compose up -d
docker image prune -f
```

### 回滚

```bash
IMAGE_TAG=sha-<旧提交短哈希> docker compose up -d
```

## 方式 B：服务器本地构建（备用）

克隆仓库后把 `.env` 中的 `IMAGE_NAME` 改为 `foropencode-docs`，然后：

```bash
docker compose up -d --build
```

## 反向代理示例（Nginx）

应用容器只发与协议无关的安全头；**HTTPS 跳转和 HSTS 请在反向代理层配置**（域名全站 HTTPS 后再加 HSTS）：

```nginx
server {
  listen 443 ssl http2;
  server_name docs.example.com;

  ssl_certificate     /etc/letsencrypt/live/docs.example.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/docs.example.com/privkey.pem;

  # 域名确认全站 HTTPS 后启用：
  add_header Strict-Transport-Security "max-age=31536000" always;

  location / {
    proxy_pass         http://127.0.0.1:8081;
    proxy_http_version 1.1;
    proxy_set_header   Host              $host;
    proxy_set_header   X-Real-IP         $remote_addr;
    proxy_set_header   X-Forwarded-For   $proxy_add_x_forwarded_for;
    proxy_set_header   X-Forwarded-Proto $scheme;
  }
}
```

## 1Panel 用法

### 方式一：直接使用 `compose.yaml`

- 在 1Panel 中导入或创建 Compose 项目
- 使用仓库根目录的 `compose.yaml`
- 通过 `.env` 或面板环境变量填写 `HOST_PORT` 等

### 方式二：按 Dockerfile 构建应用

- 构建文件选择仓库根目录的 `Dockerfile`
- 容器端口 `3020`
- 外部访问端口或域名映射由 1Panel 处理

## 常见问题

### 容器启动了，但外网打不开

- 检查服务器安全组与系统防火墙
- 确认 `HOST_PORT` 已监听：`ss -tlnp | grep 8081`
- 反向代理转发地址是否正确

### 拉取镜像报 unauthorized / denied

- 公开镜像无需登录；若镜像为私有，先 `docker login ghcr.io -u Cengyj`（密码使用具有 `read:packages` 权限的 GitHub token）
- 也可在 GitHub 仓库的 Packages 设置里把镜像可见性改为 Public

### 搜索面板没有结果

本地 FlexSearch 索引在 `pnpm build` 期间生成到 `public/search-index.json`。容器构建已包含这一步；若手动构建出错，可单独运行：

```bash
node scripts/build-search-index.mjs
```

### 静态资源 404

容器内 Next.js 直接服务 `public/` 下的资源。若发布前手动删除了 `public/img/` 中的截图，会导致 404。重新填回原图或更新 MDX 引用。
