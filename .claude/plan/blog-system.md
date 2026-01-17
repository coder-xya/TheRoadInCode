# TheRoadInCode - 实施计划

## 项目概述
现代化个人博客系统，用于技术分享、作品展示和实验平台。

## 文档清单

| 文档 | 路径 | 状态 |
|------|------|------|
| 需求分析 | `docs/requirements.md` | ✅ 已完成 |
| 技术架构 | `docs/architecture.md` | ✅ 已完成 |
| 项目路线图 | `docs/roadmap.md` | ✅ 已完成 |
| 技术选型对比 | `docs/tech-comparison.md` | ✅ 已完成 |

## 技术栈确认（方案 A：稳定可扩展）

### 后端 (apps/api)
| 维度 | 选择 | 备选 |
|------|------|------|
| 框架 | NestJS 10+ | Hono/Fastify |
| ORM | Prisma | Drizzle |
| 数据库 | PostgreSQL | SQLite |
| 认证 | JWT + Lucia Auth | Auth.js |
| API | RESTful | tRPC |
| 缓存 | Redis（后期） | In-memory LRU |

### 前端 (apps/web)
| 维度 | 选择 | 备选 |
|------|------|------|
| 框架 | Next.js 14+ (App Router) | Astro |
| UI | Shadcn/ui + TailwindCSS | Mantine |
| 状态 | TanStack Query + Zustand | SWR + Jotai |
| 内容 | Velite + MDX | Keystatic |
| 表单 | React Hook Form + Zod | TanStack Form |
| 动画 | Framer Motion | Motion One |

### 工具链
| 维度 | 选择 |
|------|------|
| Monorepo | Turborepo + pnpm |
| 类型 | TypeScript 5+ |
| 代码质量 | ESLint + Prettier + Husky |
| 测试 | Vitest + Supertest + Testing Library |

### 部署
| 维度 | 选择 |
|------|------|
| 前端 | Vercel |
| 后端 | Railway / Docker |
| 数据库 | Railway PostgreSQL / Docker |

## 多模型协作记录

| 模型 | SESSION_ID | 用途 |
|------|------------|------|
| Codex | `019bcaf2-5ea9-7db1-b5ac-0c32709c39b9` | 后端技术对比分析 |
| Gemini | `16aa0180-c7a0-4085-8974-bf551bba0d80` | 前端技术对比分析 |

## 下一步

用户批准后进入 **阶段 4：实施**，按 M1 里程碑开始项目初始化：

1. 初始化 pnpm workspace + Turborepo
2. 创建 Next.js 14 前端应用
3. 创建 NestJS 10 后端应用
4. 配置共享包 (ui, database, shared)
5. 设置 Docker Compose 开发环境
6. 配置代码质量工具链
