# TheRoadInCode

现代化个人博客系统 - 技术分享、作品展示、实验平台

## 技术栈

### 前端 (apps/web)
- **Framework**: Next.js 15 (App Router)
- **UI**: Shadcn/ui + TailwindCSS
- **State**: TanStack Query + Zustand
- **Language**: TypeScript

### 后端 (apps/api)
- **Framework**: NestJS 10
- **ORM**: Prisma
- **Database**: PostgreSQL
- **Auth**: JWT

### 工具链
- **Monorepo**: Turborepo + pnpm
- **Code Quality**: ESLint + Prettier + Husky
- **Containerization**: Docker Compose

## 项目结构

```
TheRoadInCode/
├── apps/
│   ├── web/                 # Next.js 前端
│   └── api/                 # NestJS 后端
├── packages/
│   ├── database/            # Prisma schema & client
│   ├── shared/              # 共享类型、常量、工具
│   ├── typescript-config/   # TS 配置
│   └── eslint-config/       # ESLint 配置
├── docker/                  # Docker 配置
└── docs/                    # 项目文档
```

## 快速开始

### 环境要求
- Node.js >= 20.0.0
- pnpm >= 9.0.0
- Docker (可选，用于本地数据库)

### 安装依赖

```bash
pnpm install
```

### 启动数据库

```bash
cd docker && docker-compose up -d
```

### 配置环境变量

```bash
# 后端
cp apps/api/.env.example apps/api/.env.local

# 前端
cp apps/web/.env.example apps/web/.env.local
```

### 初始化数据库

```bash
pnpm --filter @repo/database db:push
```

### 启动开发服务器

```bash
pnpm dev
```

- 前端: http://localhost:3000
- 后端: http://localhost:4000

## 开发命令

```bash
# 全部应用开发模式
pnpm dev

# 构建
pnpm build

# 代码检查
pnpm lint

# 格式化
pnpm format

# 测试
pnpm test

# 清理
pnpm clean
```

## 文档

- [需求分析](./docs/requirements.md)
- [技术架构](./docs/architecture.md)
- [项目路线图](./docs/roadmap.md)
- [技术选型对比](./docs/tech-comparison.md)

## License

MIT
