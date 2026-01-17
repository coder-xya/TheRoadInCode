# 架构详解目录

本目录包含项目所有核心技术的详细教程，面向初级开发者，遵循二八原则。

## 文档列表

| 序号 | 文档 | 技术 | 主要内容 |
|------|------|------|----------|
| 01 | [pnpm包管理器](./01_pnpm包管理器.md) | pnpm | Monorepo、workspace、常用命令 |
| 02 | [Turborepo构建系统](./02_Turborepo构建系统.md) | Turborepo | 任务编排、缓存机制、配置详解 |
| 03 | [TypeScript类型系统](./03_TypeScript类型系统.md) | TypeScript | 类型、接口、泛型、tsconfig |
| 04 | [NextJS框架](./04_NextJS框架.md) | Next.js | App Router、渲染模式、数据获取 |
| 05 | [NestJS框架](./05_NestJS框架.md) | NestJS | 模块、控制器、服务、依赖注入 |
| 06 | [Prisma数据库](./06_Prisma数据库.md) | Prisma | Schema、CRUD、关联查询、迁移 |
| 07 | [TailwindCSS样式](./07_TailwindCSS样式.md) | TailwindCSS | 原子类、响应式、暗黑模式 |
| 08 | [Docker容器化](./08_Docker容器化.md) | Docker | 镜像、容器、Compose、Dockerfile |
| 09 | [代码质量工具](./09_代码质量工具.md) | ESLint/Prettier | 代码检查、格式化、Git钩子 |
| 10 | [项目结构说明](./10_项目结构说明.md) | Monorepo | 目录结构、文件职责、数据流向 |
| 11 | [配置文件详解](./11_配置文件详解.md) | 全部 | 所有配置文件逐行解释 |

## 官方文档链接速查

| 技术 | 官方文档 | 中文文档 |
|------|----------|----------|
| pnpm | [pnpm.io](https://pnpm.io/) | [pnpm.io/zh](https://pnpm.io/zh/) |
| Turborepo | [turbo.build](https://turbo.build/repo/docs) | - |
| TypeScript | [typescriptlang.org](https://www.typescriptlang.org/docs/) | [ts.nodejs.cn](https://ts.nodejs.cn/) |
| Next.js | [nextjs.org/docs](https://nextjs.org/docs) | [nextjs.org/docs/zh](https://nextjs.org/docs) |
| NestJS | [docs.nestjs.com](https://docs.nestjs.com/) | [docs.nestjs.cn](https://docs.nestjs.cn/) |
| Prisma | [prisma.io/docs](https://www.prisma.io/docs) | - |
| TailwindCSS | [tailwindcss.com/docs](https://tailwindcss.com/docs) | [tailwindcss.cn](https://www.tailwindcss.cn/) |
| Docker | [docs.docker.com](https://docs.docker.com/) | [docker-practice.github.io](https://docker-practice.github.io/zh-cn/) |
| ESLint | [eslint.org](https://eslint.org/docs/latest/) | - |
| Prettier | [prettier.io](https://prettier.io/docs/en/) | - |

## 学习路径

### 🟢 入门级（先看这些）

1. **pnpm** - 理解项目如何管理依赖
2. **TypeScript** - 理解类型系统基础
3. **TailwindCSS** - 快速上手写样式

### 🟡 进阶级（核心框架）

4. **Next.js** - 前端框架核心
5. **NestJS** - 后端框架核心
6. **Prisma** - 数据库操作

### 🔴 高级（工程化）

7. **Turborepo** - Monorepo 构建优化
8. **Docker** - 容器化部署
9. **ESLint/Prettier** - 代码质量保障

## 项目技术栈总览

```
TheRoadInCode/
├── 前端 (apps/web)
│   ├── Next.js 15      → 04_NextJS框架.md
│   ├── React 19        → (React 基础知识)
│   ├── TailwindCSS     → 07_TailwindCSS样式.md
│   └── TypeScript      → 03_TypeScript类型系统.md
│
├── 后端 (apps/api)
│   ├── NestJS 10       → 05_NestJS框架.md
│   ├── Prisma          → 06_Prisma数据库.md
│   └── TypeScript      → 03_TypeScript类型系统.md
│
├── 工具链
│   ├── pnpm            → 01_pnpm包管理器.md
│   ├── Turborepo       → 02_Turborepo构建系统.md
│   ├── ESLint/Prettier → 09_代码质量工具.md
│   └── Docker          → 08_Docker容器化.md
│
└── 数据库
    └── PostgreSQL      → 06_Prisma数据库.md
```

## 每篇文档结构

每篇文档都遵循统一结构：

1. **是什么** - 技术简介和核心价值
2. **核心概念** - 20% 覆盖 80% 场景的知识点
3. **配置详解** - 项目中实际配置的逐行解释
4. **常用场景** - 日常开发最常用的操作
5. **常见陷阱** - 初学者容易犯的错误
6. **最佳实践** - 推荐的使用方式
7. **总结** - 核心要点速记

## 快速参考

### 常用命令速查

```bash
# 安装依赖
pnpm install

# 启动开发
pnpm dev

# 构建项目
pnpm build

# 代码检查
pnpm lint

# 格式化代码
pnpm format

# 启动数据库
cd docker && docker compose up -d

# 数据库迁移
pnpm --filter @repo/database db:push

# 打开数据库管理界面
pnpm --filter @repo/database db:studio
```

### 项目目录速查

```
apps/web/src/app/       → Next.js 页面
apps/api/src/           → NestJS 源码
packages/database/      → Prisma 配置
packages/shared/        → 共享类型和工具
docker/                 → Docker 配置
docs/                   → 项目文档
```
