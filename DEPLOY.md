# 部署指南

把当前 Next.js 站点部署到 Linux 服务器上的 Docker 容器。

项目提供以下部署文件：

- `Dockerfile` — 多阶段构建，输出 Node.js 运行时镜像
- `compose.yaml` — Docker Compose 编排
- `.env.container.example` — 环境变量模板

## 前置条件

服务器需要具备：

- Docker 24+
- Docker Compose Plugin
- 可访问项目目录的权限

如果直接通过端口访问，需放行对外端口（默认 `8081`）。挂在 Nginx / Caddy / 1Panel 反向代理后面只需让代理转发到容器端口即可。

## 1. 上传项目

```bash
mkdir -p /opt/foropencode-docs
cd /opt/foropencode-docs
```

用 `git clone`、`scp`、SFTP 或面板同步代码都可以。

## 2. 配置环境变量

复制示例配置：

```bash
cp .env.container.example .env
```

按需修改 `.env`：

```dotenv
IMAGE_NAME=foropencode-docs
IMAGE_TAG=latest
HOST_PORT=8081
```

`HOST_PORT` 是宿主机暴露的端口；容器内固定监听 `3020`。

## 3. 启动容器

```bash
docker compose up -d --build
docker compose ps
docker compose logs -f docs
```

默认访问地址：`http://服务器IP:8081`。

## 4. 验证

```bash
curl -I http://127.0.0.1:8081
```

## 5. 反向代理示例（Nginx）

```nginx
server {
  listen 443 ssl http2;
  server_name docs.example.com;

  ssl_certificate     /etc/letsencrypt/live/docs.example.com/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/docs.example.com/privkey.pem;

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

## 6. 更新发布

```bash
git pull
docker compose up -d --build
docker image prune -f          # 可选：清理旧镜像
```

## 7. 1Panel 用法

### 方式一：直接使用 `compose.yaml`

- 在 1Panel 中导入或创建 Compose 项目
- 使用仓库根目录的 `compose.yaml`
- 通过 `.env` 或面板环境变量填写 `HOST_PORT` 等

### 方式二：按 Dockerfile 构建应用

- 构建文件选择仓库根目录的 `Dockerfile`
- 容器端口 `3020`
- 外部访问端口或域名映射由 1Panel 处理

## 8. 常见问题

### 容器启动了，但外网打不开

- 检查服务器安全组与系统防火墙
- 确认 `HOST_PORT` 已监听：`ss -tlnp | grep 8081`
- 反向代理转发地址是否正确

### 搜索面板没有结果

本地 FlexSearch 索引在 `pnpm build` 期间生成到 `public/search-index.json`。容器构建已包含这一步；若手动构建出错，可单独运行：

```bash
node scripts/build-search-index.mjs
```

### 静态资源 404

容器内 Next.js 直接服务 `public/` 下的资源。若发布前手动删除了 `public/img/` 中的截图，会导致 404。重新填回原图或更新 MDX 引用。
