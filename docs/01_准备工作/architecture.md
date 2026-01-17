# 技术架构文档

## 1. 系统架构概览

```
┌─────────────────────────────────────────────────────────────────┐
│                          Client                                  │
│  (Browser / Mobile)                                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     CDN (Vercel Edge / Cloudflare)              │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌──────────────────────────┐    ┌──────────────────────────┐
│      Frontend (Web)       │    │      Backend (API)        │
│      Next.js 14+          │    │      NestJS 10+           │
│      Vercel / Docker      │    │      Docker / VPS         │
└──────────────────────────┘    └──────────────────────────┘
                                              │
              ┌───────────────┬───────────────┼───────────────┐
              ▼               ▼               ▼               ▼
        ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐
        │PostgreSQL│   │  Redis   │   │   S3/    │   │ Search   │
        │ Database │   │  Cache   │   │   OSS    │   │(Optional)│
        └──────────┘   └──────────┘   └──────────┘   └──────────┘
```

---

## 2. Monorepo 项目结构

```
TheRoadInCode/
├── apps/
│   ├── web/                    # Next.js 前端应用
│   │   ├── app/                # App Router 目录
│   │   ├── components/         # React 组件
│   │   ├── lib/                # 工具函数
│   │   ├── styles/             # 全局样式
│   │   └── public/             # 静态资源
│   │
│   └── api/                    # NestJS 后端应用
│       ├── src/
│       │   ├── modules/        # 业务模块
│       │   ├── common/         # 公共组件
│       │   └── config/         # 配置
│       ├── prisma/             # Prisma schema
│       └── test/               # E2E 测试
│
├── packages/
│   ├── ui/                     # 共享 UI 组件库
│   ├── database/               # Prisma client 封装
│   ├── shared/                 # 共享类型、常量、工具
│   ├── eslint-config/          # ESLint 配置
│   └── typescript-config/      # TypeScript 配置
│
├── docs/                       # 项目文档
├── docker/                     # Docker 配置
├── .github/                    # GitHub Actions
├── turbo.json                  # Turborepo 配置
├── pnpm-workspace.yaml         # pnpm workspace
└── package.json                # 根配置
```

---

## 3. 前端架构 (Next.js 14+)

### 3.1 App Router 目录结构

```
apps/web/
├── app/
│   ├── layout.tsx              # 根布局
│   ├── page.tsx                # 首页
│   ├── globals.css             # 全局样式
│   │
│   ├── (blog)/                 # 博客路由组
│   │   ├── posts/
│   │   │   ├── page.tsx        # 文章列表 /posts
│   │   │   └── [slug]/
│   │   │       └── page.tsx    # 文章详情 /posts/[slug]
│   │   ├── categories/
│   │   │   ├── page.tsx        # 分类列表
│   │   │   └── [slug]/
│   │   │       └── page.tsx    # 分类文章
│   │   └── tags/
│   │       ├── page.tsx        # 标签列表
│   │       └── [slug]/
│   │           └── page.tsx    # 标签文章
│   │
│   ├── works/
│   │   ├── page.tsx            # 作品列表
│   │   └── [slug]/
│   │       └── page.tsx        # 作品详情
│   │
│   ├── about/
│   │   └── page.tsx            # 关于页面
│   │
│   ├── admin/                  # 管理后台
│   │   ├── layout.tsx          # 后台布局
│   │   ├── page.tsx            # 仪表盘
│   │   ├── posts/              # 文章管理
│   │   ├── works/              # 作品管理
│   │   └── settings/           # 设置
│   │
│   └── api/                    # API Routes（可选）
│       └── og/
│           └── route.tsx       # OG 图片生成
│
├── components/
│   ├── ui/                     # Shadcn/ui 组件
│   ├── layout/                 # 布局组件
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   ├── Sidebar.tsx
│   │   └── Navigation.tsx
│   ├── blog/                   # 博客组件
│   │   ├── PostCard.tsx
│   │   ├── PostList.tsx
│   │   ├── PostContent.tsx
│   │   ├── TableOfContents.tsx
│   │   └── Comments.tsx
│   ├── works/                  # 作品组件
│   │   ├── WorkCard.tsx
│   │   └── WorkGrid.tsx
│   └── common/                 # 通用组件
│       ├── ThemeToggle.tsx
│       ├── SearchDialog.tsx
│       ├── CommandPalette.tsx
│       └── MDXComponents.tsx
│
├── lib/
│   ├── api.ts                  # API 客户端
│   ├── utils.ts                # 工具函数
│   └── constants.ts            # 常量
│
├── hooks/
│   ├── useTheme.ts
│   └── useSearch.ts
│
└── types/
    └── index.ts                # 类型定义
```

### 3.2 渲染策略

| 页面 | 策略 | 理由 |
|------|------|------|
| 首页 | ISR (60s) | 内容更新频率中等 |
| 文章列表 | ISR (60s) | 新文章发布后刷新 |
| 文章详情 | SSG + ISR | 静态生成，按需重验证 |
| 分类/标签 | SSG | 相对静态 |
| 作品页 | SSG | 更新频率低 |
| 关于页 | SSG | 静态内容 |
| 管理后台 | CSR | 需要认证，动态交互 |

### 3.3 状态管理

```typescript
// React Query - 服务端状态
const { data: posts } = useQuery({
  queryKey: ['posts', page],
  queryFn: () => api.getPosts({ page }),
  staleTime: 60 * 1000,
});

// Zustand - 客户端状态
const useUIStore = create((set) => ({
  sidebarOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
}));
```

### 3.4 主题系统

```typescript
// next-themes 配置
<ThemeProvider
  attribute="class"
  defaultTheme="system"
  enableSystem
  disableTransitionOnChange
>
  {children}
</ThemeProvider>

// Tailwind CSS 暗黑模式
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  // ...
}
```

### 3.5 SEO 优化

```typescript
// app/posts/[slug]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const post = await getPost(params.slug);
  return {
    title: post.title,
    description: post.summary,
    openGraph: {
      title: post.title,
      description: post.summary,
      type: 'article',
      publishedTime: post.publishedAt,
      images: [`/api/og?title=${encodeURIComponent(post.title)}`],
    },
    twitter: {
      card: 'summary_large_image',
    },
  };
}
```

---

## 4. 后端架构 (NestJS 10+)

### 4.1 模块结构

```
apps/api/src/
├── main.ts                     # 入口
├── app.module.ts               # 根模块
│
├── config/
│   ├── configuration.ts        # 配置加载
│   └── validation.ts           # 环境变量验证
│
├── common/
│   ├── decorators/
│   │   ├── public.decorator.ts
│   │   └── roles.decorator.ts
│   ├── filters/
│   │   └── http-exception.filter.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   ├── interceptors/
│   │   ├── logging.interceptor.ts
│   │   └── transform.interceptor.ts
│   └── pipes/
│       └── validation.pipe.ts
│
├── modules/
│   ├── auth/
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── strategies/
│   │   │   ├── jwt.strategy.ts
│   │   │   ├── jwt-refresh.strategy.ts
│   │   │   └── github.strategy.ts
│   │   └── dto/
│   │       ├── login.dto.ts
│   │       └── register.dto.ts
│   │
│   ├── users/
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── dto/
│   │
│   ├── posts/
│   │   ├── posts.module.ts
│   │   ├── posts.controller.ts
│   │   ├── posts.service.ts
│   │   └── dto/
│   │       ├── create-post.dto.ts
│   │       ├── update-post.dto.ts
│   │       └── query-post.dto.ts
│   │
│   ├── categories/
│   ├── tags/
│   ├── comments/
│   ├── works/
│   └── search/
│
└── prisma/
    ├── prisma.module.ts
    └── prisma.service.ts
```

### 4.2 数据库模型 (Prisma)

```prisma
// packages/database/prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  USER
  ADMIN
}

model User {
  id           String         @id @default(cuid())
  email        String         @unique
  username     String         @unique
  passwordHash String?
  role         UserRole       @default(USER)
  avatar       String?
  bio          String?
  oauth        OAuthAccount[]
  posts        Post[]
  comments     Comment[]
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt
}

model OAuthAccount {
  id         String   @id @default(cuid())
  provider   String
  providerId String
  user       User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  userId     String
  createdAt  DateTime @default(now())

  @@unique([provider, providerId])
}

model Post {
  id          String    @id @default(cuid())
  title       String
  slug        String    @unique
  content     String
  summary     String?
  coverImage  String?
  published   Boolean   @default(false)
  featured    Boolean   @default(false)
  views       Int       @default(0)
  author      User      @relation(fields: [authorId], references: [id])
  authorId    String
  category    Category? @relation(fields: [categoryId], references: [id])
  categoryId  String?
  tags        PostTag[]
  comments    Comment[]
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  publishedAt DateTime?

  @@index([published, createdAt(sort: Desc)])
  @@index([slug])
}

model Category {
  id          String   @id @default(cuid())
  name        String   @unique
  slug        String   @unique
  description String?
  posts       Post[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Tag {
  id        String    @id @default(cuid())
  name      String    @unique
  slug      String    @unique
  posts     PostTag[]
  createdAt DateTime  @default(now())
}

model PostTag {
  post   Post   @relation(fields: [postId], references: [id], onDelete: Cascade)
  postId String
  tag    Tag    @relation(fields: [tagId], references: [id], onDelete: Cascade)
  tagId  String

  @@id([postId, tagId])
}

model Comment {
  id        String    @id @default(cuid())
  content   String
  author    User?     @relation(fields: [authorId], references: [id])
  authorId  String?
  guestName String?
  guestEmail String?
  post      Post      @relation(fields: [postId], references: [id], onDelete: Cascade)
  postId    String
  parent    Comment?  @relation("CommentReplies", fields: [parentId], references: [id])
  parentId  String?
  replies   Comment[] @relation("CommentReplies")
  approved  Boolean   @default(false)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  @@index([postId, approved])
}

model Work {
  id          String   @id @default(cuid())
  title       String
  slug        String   @unique
  description String?
  content     String?
  coverImage  String?
  demoUrl     String?
  sourceUrl   String?
  techStack   String[]
  featured    Boolean  @default(false)
  order       Int      @default(0)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@index([order])
}
```

### 4.3 API 端点设计

```
Base URL: /api/v1

# 认证
POST   /auth/login              # 登录
POST   /auth/register           # 注册
POST   /auth/refresh            # 刷新 Token
POST   /auth/logout             # 登出
GET    /auth/oauth/github       # GitHub OAuth
GET    /auth/oauth/github/callback

# 用户
GET    /users/me                # 当前用户信息
PATCH  /users/me                # 更新个人信息

# 文章
GET    /posts                   # 文章列表（支持分页、筛选）
GET    /posts/:slug             # 文章详情
POST   /posts                   # 创建文章 [Auth]
PATCH  /posts/:id               # 更新文章 [Auth]
DELETE /posts/:id               # 删除文章 [Auth]

# 分类
GET    /categories              # 分类列表
POST   /categories              # 创建分类 [Admin]
PATCH  /categories/:id          # 更新分类 [Admin]
DELETE /categories/:id          # 删除分类 [Admin]

# 标签
GET    /tags                    # 标签列表
POST   /tags                    # 创建标签 [Admin]
DELETE /tags/:id                # 删除标签 [Admin]

# 评论
GET    /posts/:slug/comments    # 获取文章评论
POST   /comments                # 创建评论
DELETE /comments/:id            # 删除评论 [Auth]

# 作品
GET    /works                   # 作品列表
GET    /works/:slug             # 作品详情
POST   /works                   # 创建作品 [Admin]
PATCH  /works/:id               # 更新作品 [Admin]
DELETE /works/:id               # 删除作品 [Admin]

# 搜索
GET    /search?q=keyword        # 全文搜索
```

### 4.4 认证流程

```
┌─────────┐      POST /auth/login       ┌─────────┐
│ Client  │ ──────────────────────────▶ │   API   │
└─────────┘                             └─────────┘
     │                                       │
     │  ◀─── { accessToken, refreshToken } ──│
     │                                       │
     │       GET /posts (Authorization)      │
     │ ──────────────────────────────────▶   │
     │                                       │
     │  ◀──────── { data: [...] } ───────── │
     │                                       │
     │     POST /auth/refresh (expired)      │
     │ ──────────────────────────────────▶   │
     │                                       │
     │  ◀─── { accessToken (new) } ────────  │
```

**Token 配置**:
- Access Token: 15 分钟有效期
- Refresh Token: 7 天有效期，HTTP-only Cookie

---

## 5. 共享包设计

### 5.1 packages/shared

```typescript
// types/index.ts
export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary?: string;
  published: boolean;
  category?: Category;
  tags: Tag[];
  author: User;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

// constants/index.ts
export const API_ROUTES = {
  POSTS: '/api/v1/posts',
  CATEGORIES: '/api/v1/categories',
  // ...
} as const;

// validators/index.ts
export const postSchema = z.object({
  title: z.string().min(1).max(200),
  content: z.string().min(1),
  slug: z.string().regex(/^[a-z0-9-]+$/),
  // ...
});
```

### 5.2 packages/ui

基于 Shadcn/ui 的共享组件：
- Button, Input, Card, Dialog
- Typography (Heading, Text, Code)
- DataTable, Pagination
- Form 组件 (with react-hook-form + zod)

---

## 6. 部署架构

### 6.1 方案对比

| 方案 | 前端 | 后端 | 数据库 | 适用场景 |
|------|------|------|--------|----------|
| Vercel + Railway | Vercel | Railway | Railway PG | 快速上线、低运维 |
| Docker Compose | Docker | Docker | Docker PG | 本地开发、VPS 部署 |
| K8s | K8s | K8s | Managed DB | 大规模生产 |

### 6.2 推荐方案：Vercel + Railway

```
┌─────────────────┐     ┌─────────────────┐
│     Vercel      │     │    Railway      │
│   (Next.js)     │────▶│   (NestJS)      │
│   Edge Network  │     │   PostgreSQL    │
└─────────────────┘     │   Redis         │
                        └─────────────────┘
```

### 6.3 Docker Compose (开发/自托管)

```yaml
# docker/docker-compose.yml
version: '3.8'
services:
  web:
    build:
      context: ..
      dockerfile: docker/web.Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://api:4000
    depends_on:
      - api

  api:
    build:
      context: ..
      dockerfile: docker/api.Dockerfile
    ports:
      - "4000:4000"
    environment:
      - DATABASE_URL=postgresql://postgres:postgres@db:5432/blog
      - JWT_SECRET=${JWT_SECRET}
    depends_on:
      - db

  db:
    image: postgres:16-alpine
    volumes:
      - postgres_data:/var/lib/postgresql/data
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=postgres
      - POSTGRES_DB=blog

volumes:
  postgres_data:
```

---

## 7. 开发工具链

### 7.1 代码质量

```json
// 根 package.json scripts
{
  "scripts": {
    "dev": "turbo dev",
    "build": "turbo build",
    "lint": "turbo lint",
    "format": "prettier --write \"**/*.{ts,tsx,md}\"",
    "test": "turbo test",
    "prepare": "husky install"
  }
}
```

### 7.2 Git Hooks (Husky + lint-staged)

```json
// .lintstagedrc.js
module.exports = {
  '*.{ts,tsx}': ['eslint --fix', 'prettier --write'],
  '*.{json,md}': ['prettier --write'],
};
```

### 7.3 CI/CD (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm build
      - run: pnpm test
```

---

## 8. 环境变量

```bash
# apps/api/.env
DATABASE_URL="postgresql://user:pass@localhost:5432/blog"
JWT_SECRET="your-jwt-secret"
JWT_REFRESH_SECRET="your-refresh-secret"
JWT_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
GITHUB_CLIENT_ID="xxx"
GITHUB_CLIENT_SECRET="xxx"

# apps/web/.env.local
NEXT_PUBLIC_API_URL="http://localhost:4000"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
```
