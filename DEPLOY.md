# Linux 服务器容器部署

本文档用于把当前 Docusaurus 站点部署到 Linux 服务器上的 Docker 容器中。

项目已经提供以下生产部署文件：

- `Dockerfile`
- `compose.yaml`
- `nginx.conf`
- `.env.container.example`
- `compose.prebuilt.yaml`

## 推荐：使用 GitHub 预编译镜像部署

如果不希望在服务器上重新编译，推荐使用 GitHub Actions 生成的预编译镜像：

```text
ghcr.io/cengyj/model-gateway-docs:latest
```

仓库已经提供 `.github/workflows/build-image.yml`。推送到 `main` 分支后，GitHub 会自动构建 `linux/amd64` 镜像并发布到 GitHub Container Registry。你的 Debian x86_64 服务器可以直接拉取这个镜像运行。

### 在 GitHub 上编译

1. 推送代码到 `main` 分支，或者在 GitHub 仓库的 `Actions` 页面手动运行 `Build prebuilt container image`。
2. 如果需要指定正式访问域名，在仓库的 `Settings` -> `Secrets and variables` -> `Actions` -> `Variables` 中添加：

```text
SITE_URL=https://你的域名
```

也可以手动运行 workflow 时填写 `site_url`。

注意：`SITE_URL` 是构建阶段写入 Docusaurus 的，域名变更后需要重新运行 GitHub Actions 构建镜像。

### 在服务器 `/opt` 部署

在服务器创建目录：

```bash
mkdir -p /opt/model-gateway-docs
cd /opt/model-gateway-docs
```

把仓库中的 `compose.prebuilt.yaml` 内容保存为 `/opt/model-gateway-docs/compose.yaml`，或者在 1Panel 中直接导入：

```yaml
services:
  docs:
    image: ghcr.io/cengyj/model-gateway-docs:${IMAGE_TAG:-latest}
    container_name: model-gateway-docs
    ports:
      - "${HOST_PORT:-8081}:80"
    restart: unless-stopped
```

可选创建 `/opt/model-gateway-docs/.env`：

```dotenv
IMAGE_TAG=latest
HOST_PORT=8081
```

启动：

```bash
docker compose up -d
```

如果使用 1Panel：

- 应用目录选择 `/opt/model-gateway-docs`
- Compose 内容使用 `compose.prebuilt.yaml`
- 外部端口默认 `8081`
- 反向代理目标填 `http://127.0.0.1:8081`

如果 GHCR 镜像不是公开的，需要先在服务器登录：

```bash
docker login ghcr.io
```

更新时，只需要让 GitHub Actions 重新构建镜像，然后服务器执行：

```bash
docker compose pull
docker compose up -d
```

## 先导出部署包

如果你是先在本机打包、再上传到 Linux 服务器，推荐直接执行：

```bash
pnpm package:deploy
```

脚本会在项目上一级目录生成一个带时间戳的 `tar.gz` 文件，适合直接上传到服务器。
脚本会在项目当前目录生成一个带时间戳的 `tar.gz` 文件，适合直接上传到服务器。
同时会自动排除以下不需要上传的内容：

- `node_modules`
- `build`
- `.docusaurus`
- `.sisyphus`

生成后把压缩包上传到服务器并解压，再继续下面的部署步骤即可。

## 前置条件

服务器需要具备：

- Docker
- Docker Compose Plugin
- 可访问项目目录的权限

如果你打算直接通过端口访问站点，还需要放行对外端口，比如 `8081`。
如果你打算挂在 Nginx、Caddy、1Panel 反向代理后面，则只需要让代理转发到容器端口即可。

## 1. 上传项目

把项目代码放到服务器某个目录，例如：

```bash
mkdir -p /opt/model-gateway-docs
cd /opt/model-gateway-docs
```

然后用 `git clone`、`scp`、SFTP 或面板同步代码都可以。

## 2. 配置环境变量

在项目根目录复制示例配置：

```bash
cp .env.container.example .env
```

按需修改 `.env`：

```dotenv
IMAGE_NAME=model-gateway-docs
IMAGE_TAG=latest
HOST_PORT=8081
SITE_URL=https://docs.example.com
ALGOLIA_APP_ID=
ALGOLIA_SEARCH_API_KEY=
ALGOLIA_INDEX_NAME=
```

关键说明：

- `HOST_PORT` 是宿主机暴露的端口。
- `SITE_URL` 必须写用户最终访问到的公网地址。
- 如果你通过域名 + HTTPS 访问，就写 `https://你的域名`。
- 如果你只是先用 IP 直连测试，就写 `http://服务器IP:端口`。
- `ALGOLIA_*` 变量不是必填，不配也可以正常访问站点。

注意：

- `SITE_URL` 和 `ALGOLIA_*` 都是构建阶段写入镜像的。
- 这几个值修改后，需要重新执行带 `--build` 的部署命令。

## 3. 启动容器

在项目根目录执行：

```bash
docker compose up -d --build
```

查看运行状态：

```bash
docker compose ps
```

查看日志：

```bash
docker compose logs -f docs
```

默认情况下，站点会映射到：

```text
http://服务器IP:HOST_PORT
```

如果 `.env` 中使用默认值，那么访问地址就是：

```text
http://服务器IP:8081
```

## 4. 验证部署

可以在服务器上先自检：

```bash
curl -I http://127.0.0.1:8081
```

如果你使用了反向代理或域名，也可以直接在本机打开：

```text
https://你的域名
```

## 5. 反向代理建议

如果服务器前面还有 Nginx、Caddy、Traefik、1Panel 网关：

- 容器内部端口使用 `80`
- 反向代理转发到 `127.0.0.1:${HOST_PORT}`
- `SITE_URL` 写公网最终访问地址，不要写容器内地址

例如：

- 真实访问地址是 `https://docs.example.com`
- 宿主机映射端口是 `8081`
- 反向代理转发到 `http://127.0.0.1:8081`
- `.env` 里的 `SITE_URL` 应写成 `https://docs.example.com`

## 6. 更新发布

后续更新项目时：

```bash
git pull
docker compose up -d --build
```

如果你不是通过 Git 同步代码，而是重新上传目录，也是在新代码到位后重新执行：

```bash
docker compose up -d --build
```

可选清理旧镜像：

```bash
docker image prune -f
```

## 7. 1Panel 用法

如果你用的是 1Panel，可以有两种方式：

### 方式一：直接使用 `compose.yaml`

- 在 1Panel 中导入或创建 Compose 项目
- 使用仓库根目录的 `compose.yaml`
- 通过 `.env` 或面板环境变量填写参数

### 方式二：按 Dockerfile 构建应用

- 构建文件选择仓库根目录的 `Dockerfile`
- 构建参数传入 `SITE_URL` 和可选的 `ALGOLIA_*`
- 容器端口填写 `80`
- 外部访问端口或域名映射由 1Panel 处理

## 8. 常见问题

### 页面能打开，但链接或 sitemap 域名不对

通常是 `SITE_URL` 配错了。修改 `.env` 后重新执行：

```bash
docker compose up -d --build
```

### 容器启动了，但外网打不开

优先检查：

- 服务器安全组
- 系统防火墙
- `HOST_PORT` 是否已监听
- 反向代理是否转发到正确端口

### Algolia 搜索没有出现

这是因为构建镜像时没有传入以下变量：

- `ALGOLIA_APP_ID`
- `ALGOLIA_SEARCH_API_KEY`
- `ALGOLIA_INDEX_NAME`

补齐后重新构建即可。
