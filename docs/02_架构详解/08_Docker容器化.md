# Docker 详解

> 面向初级开发者的 Docker 教程，遵循二八原则

## 官方资源

| 资源 | 链接 |
|------|------|
| 官方文档 | [docs.docker.com](https://docs.docker.com/) |
| 中文教程 | [docker-practice.github.io](https://docker-practice.github.io/zh-cn/) |
| Dockerfile 参考 | [docs.docker.com/reference/dockerfile](https://docs.docker.com/reference/dockerfile/) |
| Compose 文件 | [docs.docker.com/compose/compose-file](https://docs.docker.com/compose/compose-file/) |
| Docker Hub | [hub.docker.com](https://hub.docker.com/) |
| GitHub | [github.com/docker](https://github.com/docker) |

## 1. Docker 是什么

### 一句话解释
Docker 是一个**容器化平台**，让你的应用在任何环境都能一致运行。

### 类比理解
- **传统部署**：搬家时一件件搬，到新家还要重新摆放
- **Docker**：把整个房间打包成集装箱，到哪都是一样的布局

### 解决的问题

| 问题 | Docker 解决方案 |
|------|----------------|
| "在我电脑上能跑" | 打包环境，到处都能跑 |
| 环境配置复杂 | 一个命令启动所有依赖 |
| 版本冲突 | 每个容器独立隔离 |
| 部署繁琐 | 镜像即部署 |

---

## 2. 核心概念（20% 核心知识）

### 2.1 三大核心概念

```
┌─────────────────────────────────────────────────────┐
│                    Docker                            │
├─────────────────┬─────────────────┬─────────────────┤
│     镜像        │      容器       │      卷         │
│    (Image)      │   (Container)   │   (Volume)      │
│   应用模板      │   运行实例      │   持久化数据    │
└─────────────────┴─────────────────┴─────────────────┘
```

| 概念 | 类比 | 说明 |
|------|------|------|
| **镜像 (Image)** | 安装光盘 | 只读模板，包含运行环境和代码 |
| **容器 (Container)** | 运行的程序 | 镜像的运行实例，可以启停 |
| **卷 (Volume)** | 移动硬盘 | 数据持久化，容器删除数据还在 |

### 2.2 镜像 vs 容器

```
镜像（静态）                    容器（动态）
┌─────────────┐                ┌─────────────┐
│   Node.js   │    docker run  │   Node.js   │
│   代码      │ ────────────>  │   代码      │
│   依赖      │                │   依赖      │
│  (只读)     │                │  (可写层)   │
└─────────────┘                └─────────────┘
     一份                          多个实例
```

### 2.3 Docker 架构

```
┌─────────────────────────────────────┐
│           Docker Client            │ ← 你输入的命令
│         (docker run ...)           │
└──────────────────┬──────────────────┘
                   │
┌──────────────────▼──────────────────┐
│           Docker Daemon            │ ← 后台服务
│         (dockerd)                  │
└──────────────────┬──────────────────┘
                   │
┌──────────────────▼──────────────────┐
│           Docker Registry          │ ← 镜像仓库
│         (Docker Hub)               │
└─────────────────────────────────────┘
```

---

## 3. 常用命令速查

### 3.1 镜像命令

```bash
# 拉取镜像
docker pull postgres:16-alpine

# 查看本地镜像
docker images

# 删除镜像
docker rmi postgres:16-alpine

# 构建镜像
docker build -t my-app:1.0 .

# 推送镜像
docker push my-app:1.0
```

### 3.2 容器命令

```bash
# 运行容器
docker run -d -p 5432:5432 --name my-db postgres:16-alpine
# -d: 后台运行
# -p: 端口映射（主机:容器）
# --name: 容器名称

# 查看运行中的容器
docker ps

# 查看所有容器（包括停止的）
docker ps -a

# 停止容器
docker stop my-db

# 启动容器
docker start my-db

# 重启容器
docker restart my-db

# 删除容器
docker rm my-db

# 强制删除运行中的容器
docker rm -f my-db

# 查看容器日志
docker logs my-db
docker logs -f my-db  # 实时跟踪

# 进入容器
docker exec -it my-db bash
docker exec -it my-db sh  # alpine 用 sh
```

### 3.3 清理命令

```bash
# 删除所有停止的容器
docker container prune

# 删除未使用的镜像
docker image prune

# 删除所有未使用的资源
docker system prune

# 查看磁盘使用
docker system df
```

---

## 4. Dockerfile 详解

### 4.1 基础指令

```dockerfile
# 基础镜像
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 复制文件
COPY package.json .
COPY . .

# 运行命令（构建时）
RUN npm install

# 暴露端口（文档作用）
EXPOSE 3000

# 环境变量
ENV NODE_ENV=production

# 启动命令
CMD ["node", "server.js"]
```

### 4.2 项目中的 api.Dockerfile 详解

```dockerfile
# ==================== 构建阶段 ====================
FROM node:20-alpine AS builder
# 使用 alpine 版本（更小）
# AS builder: 命名这个阶段

WORKDIR /app
# 设置工作目录

# 启用 pnpm
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate

# 先复制依赖文件（利用缓存）
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY apps/api/package.json ./apps/api/
COPY packages/typescript-config/package.json ./packages/typescript-config/
COPY packages/database/package.json ./packages/database/
COPY packages/shared/package.json ./packages/shared/

# 安装依赖
RUN pnpm install --frozen-lockfile
# --frozen-lockfile: 严格按 lock 文件安装

# 复制源代码
COPY packages/typescript-config ./packages/typescript-config
COPY packages/database ./packages/database
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

# 生成 Prisma Client
RUN pnpm --filter @repo/database db:generate

# 构建
RUN pnpm --filter @repo/shared build
RUN pnpm --filter @repo/database build
RUN pnpm --filter api build

# ==================== 生产阶段 ====================
FROM node:20-alpine AS runner
# 新的干净阶段，不包含构建工具

WORKDIR /app

ENV NODE_ENV=production

# 创建非 root 用户（安全）
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nestjs

# 只复制运行需要的文件
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder /app/packages/database/node_modules/.prisma ./node_modules/.prisma
# --from=builder: 从 builder 阶段复制

# 使用非 root 用户运行
USER nestjs

EXPOSE 4000

ENV PORT=4000

# 启动命令
CMD ["node", "dist/main.js"]
```

### 4.3 多阶段构建的好处

```
┌─────────────────────────────────────┐
│          Builder 阶段               │
│  - Node.js 完整版                   │
│  - 所有开发依赖                     │
│  - 源代码                           │
│  - 构建工具                         │
│  大小：~1GB                         │
└─────────────────────────────────────┘
                 ↓ 只复制需要的
┌─────────────────────────────────────┐
│          Runner 阶段                │
│  - Node.js 运行时                   │
│  - 生产依赖                         │
│  - 编译后的代码                     │
│  大小：~200MB                       │
└─────────────────────────────────────┘
```

---

## 5. Docker Compose 详解

### 5.1 什么是 Docker Compose

一个工具，用 YAML 文件定义多个容器，一键启动。

### 5.2 项目中的 docker-compose.yml 详解

```yaml
version: '3.8'
# Docker Compose 文件版本

services:
  # ==================== PostgreSQL 数据库 ====================
  db:
    image: postgres:16-alpine
    # 使用官方 PostgreSQL 镜像

    container_name: roadincode-db
    # 容器名称（方便识别）

    restart: unless-stopped
    # 重启策略：除非手动停止，否则自动重启

    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: roadincode
    # 环境变量：设置用户名、密码、数据库名

    ports:
      - '5432:5432'
    # 端口映射：主机5432 -> 容器5432

    volumes:
      - postgres_data:/var/lib/postgresql/data
    # 数据持久化：容器删除数据还在

    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres']
      interval: 10s
      timeout: 5s
      retries: 5
    # 健康检查：确保数据库已启动

  # ==================== Redis 缓存 ====================
  redis:
    image: redis:7-alpine
    container_name: roadincode-redis
    restart: unless-stopped
    ports:
      - '6379:6379'
    volumes:
      - redis_data:/data
    healthcheck:
      test: ['CMD', 'redis-cli', 'ping']
      interval: 10s
      timeout: 5s
      retries: 5

# ==================== 数据卷 ====================
volumes:
  postgres_data:
    # 持久化 PostgreSQL 数据
  redis_data:
    # 持久化 Redis 数据
```

### 5.3 常用 Docker Compose 命令

```bash
# 启动所有服务（后台）
docker compose up -d

# 查看服务状态
docker compose ps

# 查看日志
docker compose logs
docker compose logs -f db  # 实时跟踪某个服务

# 停止所有服务
docker compose down

# 停止并删除数据卷（危险！）
docker compose down -v

# 重建并启动
docker compose up -d --build

# 只启动某个服务
docker compose up -d db

# 进入某个服务的容器
docker compose exec db psql -U postgres
```

---

## 6. 常见场景示例

### 场景 1：本地开发数据库

```bash
# 进入 docker 目录
cd docker

# 启动数据库
docker compose up -d

# 查看状态
docker compose ps

# 连接数据库
docker exec -it roadincode-db psql -U postgres -d roadincode
```

### 场景 2：查看数据库内容

```bash
# 进入 PostgreSQL
docker exec -it roadincode-db psql -U postgres

# 常用 SQL
\l              # 列出数据库
\c roadincode   # 切换数据库
\dt             # 列出表
\d users        # 查看表结构
SELECT * FROM users;
\q              # 退出
```

### 场景 3：重置数据库

```bash
# 停止并删除容器和数据卷
docker compose down -v

# 重新启动
docker compose up -d

# 重新运行迁移
pnpm --filter @repo/database db:push
```

### 场景 4：构建生产镜像

```bash
# 构建 API 镜像
docker build -t roadincode-api:latest -f docker/api.Dockerfile .

# 运行
docker run -d -p 4000:4000 \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="..." \
  roadincode-api:latest
```

---

## 7. 开发环境 vs 生产环境

### 7.1 配置对比

| 方面 | 开发环境 | 生产环境 |
|------|----------|----------|
| 源码 | 挂载到容器 | 复制到镜像 |
| 依赖 | 包含 devDependencies | 仅 dependencies |
| 调试 | 开启详细日志 | 最小日志 |
| 热更新 | 开启 | 关闭 |
| 用户 | root（方便） | 非 root（安全） |
| 镜像大小 | 不关心 | 尽量小 |

### 7.2 开发环境配置示例

```yaml
# docker-compose.dev.yml
services:
  api:
    build:
      context: ..
      dockerfile: docker/api.Dockerfile
      target: builder  # 使用 builder 阶段
    volumes:
      - ../apps/api/src:/app/apps/api/src  # 挂载源码
    environment:
      - NODE_ENV=development
    command: pnpm --filter api dev  # 开发命令
```

### 7.3 生产环境配置示例

```yaml
# docker-compose.prod.yml
services:
  api:
    build:
      context: ..
      dockerfile: docker/api.Dockerfile
    environment:
      - NODE_ENV=production
      - DATABASE_URL=${DATABASE_URL}
    depends_on:
      db:
        condition: service_healthy  # 等待数据库就绪
```

---

## 8. 常见问题排查

### 8.1 容器无法启动

```bash
# 查看容器状态
docker ps -a

# 查看日志
docker logs <container_name>

# 常见原因：
# 1. 端口被占用 → 改用其他端口
# 2. 镜像不存在 → docker pull
# 3. 配置错误 → 检查环境变量
```

### 8.2 连接数据库失败

```bash
# 检查容器是否运行
docker ps | grep db

# 检查端口映射
docker port roadincode-db

# 检查健康状态
docker inspect roadincode-db | grep Health

# 检查 DATABASE_URL 格式
# postgresql://用户:密码@主机:端口/数据库
# 容器内访问用容器名：postgresql://postgres:postgres@db:5432/roadincode
# 主机访问用 localhost：postgresql://postgres:postgres@localhost:5432/roadincode
```

### 8.3 磁盘空间不足

```bash
# 查看 Docker 占用
docker system df

# 清理未使用资源
docker system prune -a

# 清理构建缓存
docker builder prune
```

### 8.4 容器间通信

```yaml
# 同一 docker-compose 中的容器可以用服务名访问
services:
  api:
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/roadincode
      #                                              ↑ 使用服务名 db
  db:
    # ...
```

---

## 9. 常见陷阱与最佳实践

### ❌ 陷阱 1：数据没有持久化

```yaml
# 错误：没有配置 volume，容器删除数据就没了
services:
  db:
    image: postgres

# 正确：配置 volume
services:
  db:
    image: postgres
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
```

### ❌ 陷阱 2：用 root 用户运行

```dockerfile
# 错误：默认 root 运行
CMD ["node", "server.js"]

# 正确：创建并使用非 root 用户
RUN adduser --system --uid 1001 appuser
USER appuser
CMD ["node", "server.js"]
```

### ❌ 陷阱 3：镜像太大

```dockerfile
# 错误：使用完整镜像
FROM node:20

# 正确：使用 alpine 版本
FROM node:20-alpine
# alpine 版本只有 ~50MB，完整版 ~1GB
```

### ✅ 最佳实践

1. **使用 .dockerignore**
   ```
   node_modules
   .git
   .env
   dist
   ```

2. **利用构建缓存**
   ```dockerfile
   # 先复制依赖文件
   COPY package.json pnpm-lock.yaml ./
   RUN pnpm install

   # 再复制源代码
   COPY . .
   # 这样源代码变化不会重新安装依赖
   ```

3. **健康检查**
   ```yaml
   healthcheck:
     test: ["CMD", "curl", "-f", "http://localhost:4000/health"]
     interval: 30s
     timeout: 10s
     retries: 3
   ```

4. **环境变量管理**
   ```bash
   # 使用 .env 文件
   docker compose --env-file .env.production up -d
   ```

---

## 10. 总结

### 记住这 5 个命令就够了

```bash
docker compose up -d      # 启动
docker compose down       # 停止
docker compose logs -f    # 查看日志
docker compose ps         # 查看状态
docker exec -it xxx sh    # 进入容器
```

### Docker 的核心价值

```
没有 Docker：安装 PostgreSQL、配置、版本冲突...
有 Docker：docker compose up -d，搞定！
```

**一句话总结**：Docker 让环境配置变成一行命令。
