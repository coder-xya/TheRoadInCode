# Next.js 详解

> 面向初级开发者的 Next.js 教程，遵循二八原则

## 官方资源

| 资源 | 链接 |
|------|------|
| 官方文档 | [nextjs.org/docs](https://nextjs.org/docs) |
| App Router | [nextjs.org/docs/app](https://nextjs.org/docs/app) |
| API 参考 | [nextjs.org/docs/app/api-reference](https://nextjs.org/docs/app/api-reference) |
| Learn 教程 | [nextjs.org/learn](https://nextjs.org/learn) |
| GitHub | [github.com/vercel/next.js](https://github.com/vercel/next.js) |
| 示例项目 | [github.com/vercel/next.js/tree/canary/examples](https://github.com/vercel/next.js/tree/canary/examples) |

## 1. Next.js 是什么

### 一句话解释
Next.js 是一个基于 React 的**全栈框架**，让你能构建快速、SEO 友好的网站。

### 与普通 React 的区别

| 特性 | React (Create React App) | Next.js |
|------|-------------------------|---------|
| 渲染方式 | 仅客户端渲染 (CSR) | SSR/SSG/ISR/CSR 都支持 |
| SEO | 差（爬虫看到空页面） | 优秀（服务端生成 HTML） |
| 路由 | 需要 react-router | 内置文件路由 |
| API | 需要单独后端 | 内置 API Routes |
| 首屏速度 | 慢（需下载 JS） | 快（直接返回 HTML） |

### 类比理解
- **React**：给你积木，你自己搭房子
- **Next.js**：给你一个精装修的房子，可以直接入住

---

## 2. App Router 核心概念

### 2.1 文件即路由

```
app/
├── page.tsx          → /
├── about/
│   └── page.tsx      → /about
├── posts/
│   ├── page.tsx      → /posts
│   └── [slug]/
│       └── page.tsx  → /posts/hello-world
└── admin/
    ├── layout.tsx    → 管理后台布局
    └── page.tsx      → /admin
```

**规则**：
- `page.tsx` = 可访问的页面
- `layout.tsx` = 布局（包裹子页面）
- `[slug]` = 动态路由参数
- `(group)` = 路由分组（不影响 URL）

### 2.2 特殊文件

| 文件 | 作用 |
|------|------|
| `page.tsx` | 页面组件 |
| `layout.tsx` | 布局（持久化，不重新渲染） |
| `loading.tsx` | 加载状态 |
| `error.tsx` | 错误边界 |
| `not-found.tsx` | 404 页面 |

### 2.3 项目中的 layout.tsx

```tsx
// apps/web/src/app/layout.tsx
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';

// 网站元数据（SEO）
export const metadata: Metadata = {
  title: {
    default: 'TheRoadInCode',
    template: '%s | TheRoadInCode',  // 子页面标题模板
  },
  description: '技术分享、作品展示、实验平台',
  keywords: ['博客', '技术', '前端', '后端', 'React', 'NestJS'],
};

// 根布局组件
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
```

**解释**：
- `metadata`：定义页面 SEO 信息
- `children`：子页面内容会插入这里
- `suppressHydrationWarning`：避免服务端/客户端不匹配警告

### 2.4 项目中的 page.tsx

```tsx
// apps/web/src/app/page.tsx
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-6xl">
          TheRoadInCode
        </h1>
        <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-400">
          技术分享 · 作品展示 · 实验平台
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <a
            href="/posts"
            className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
          >
            开始阅读
          </a>
          <a
            href="/about"
            className="text-sm font-semibold leading-6 text-gray-900 dark:text-gray-100"
          >
            关于我 <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </main>
  );
}
```

**注意**：这是一个 **Server Component**（服务端组件），默认在服务端渲染。

---

## 3. 渲染模式详解

### 3.1 四种渲染模式

```
┌─────────────────────────────────────────────────────────────┐
│                      渲染时机                                │
├─────────────┬─────────────┬─────────────┬──────────────────┤
│     SSG     │     ISR     │     SSR     │       CSR        │
│  构建时生成  │ 构建时+定时  │  请求时生成  │   浏览器渲染     │
│             │   重新生成   │             │                  │
└─────────────┴─────────────┴─────────────┴──────────────────┘
      最快          快            中等           慢（首屏）
```

### 3.2 SSG（静态生成）- 最常用

页面在**构建时**生成，之后直接返回静态 HTML。

```tsx
// app/about/page.tsx
// 默认就是 SSG，无需特殊配置
export default function AboutPage() {
  return <div>关于我</div>;
}
```

**适用场景**：关于页、文档、博客文章

### 3.3 ISR（增量静态再生）

SSG + 定时刷新，兼顾速度和新鲜度。

```tsx
// app/posts/page.tsx
async function getPosts() {
  const res = await fetch('https://api.example.com/posts', {
    next: { revalidate: 60 }  // 60 秒后重新验证
  });
  return res.json();
}

export default async function PostsPage() {
  const posts = await getPosts();
  return <PostList posts={posts} />;
}
```

**适用场景**：文章列表、产品列表

### 3.4 SSR（服务端渲染）

每次请求都在服务端生成新页面。

```tsx
// app/dashboard/page.tsx
async function getUserData() {
  const res = await fetch('https://api.example.com/user', {
    cache: 'no-store'  // 不缓存，每次请求都获取最新
  });
  return res.json();
}

export default async function DashboardPage() {
  const user = await getUserData();
  return <Dashboard user={user} />;
}
```

**适用场景**：用户仪表盘、个性化内容

### 3.5 CSR（客户端渲染）

在浏览器中用 JavaScript 渲染。

```tsx
'use client';  // 标记为客户端组件

import { useState, useEffect } from 'react';

export default function CommentsSection() {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    fetch('/api/comments')
      .then(res => res.json())
      .then(setComments);
  }, []);

  return <CommentList comments={comments} />;
}
```

**适用场景**：需要交互的组件（评论、点赞）

### 3.6 渲染模式选择指南

| 页面类型 | 推荐模式 | 原因 |
|----------|----------|------|
| 首页 | ISR (60s) | 内容不常变，但需要偶尔更新 |
| 博客文章 | SSG/ISR | 发布后很少变化 |
| 文章列表 | ISR | 新文章发布后需要更新 |
| 关于页面 | SSG | 静态内容 |
| 用户仪表盘 | SSR | 需要最新用户数据 |
| 评论区 | CSR | 频繁交互，实时更新 |

---

## 4. Server Components vs Client Components

### 4.1 区别

| 特性 | Server Component | Client Component |
|------|------------------|------------------|
| 默认 | ✅ 默认 | 需要 `'use client'` |
| 运行位置 | 服务端 | 浏览器 |
| 可用 hooks | ❌ 不能用 useState/useEffect | ✅ 可以 |
| 可用事件 | ❌ 不能用 onClick 等 | ✅ 可以 |
| 直接访问数据库 | ✅ 可以 | ❌ 不能 |
| 包大小影响 | 不增加 | 增加 |

### 4.2 使用原则

```tsx
// ✅ Server Component（默认）
// 用于：布局、数据获取、静态内容
export default async function PostPage({ params }) {
  const post = await getPost(params.slug);  // 直接获取数据
  return <article>{post.content}</article>;
}

// ✅ Client Component（交互组件）
'use client';
export function LikeButton({ postId }) {
  const [liked, setLiked] = useState(false);
  return (
    <button onClick={() => setLiked(!liked)}>
      {liked ? '❤️' : '🤍'}
    </button>
  );
}
```

### 4.3 混合使用

```tsx
// Server Component
import { LikeButton } from './LikeButton';  // Client Component

export default async function PostPage({ params }) {
  const post = await getPost(params.slug);

  return (
    <article>
      <h1>{post.title}</h1>
      <div>{post.content}</div>
      {/* 在 Server Component 中使用 Client Component */}
      <LikeButton postId={post.id} />
    </article>
  );
}
```

---

## 5. 数据获取

### 5.1 在 Server Component 中获取

```tsx
// 推荐方式：直接 async/await
async function getPost(slug: string) {
  const res = await fetch(`https://api.example.com/posts/${slug}`, {
    next: { revalidate: 3600 }  // 缓存 1 小时
  });

  if (!res.ok) {
    throw new Error('Failed to fetch post');
  }

  return res.json();
}

export default async function PostPage({ params }) {
  const post = await getPost(params.slug);
  return <article>{post.title}</article>;
}
```

### 5.2 fetch 缓存选项

```tsx
// 永久缓存（SSG）
fetch(url, { cache: 'force-cache' });

// 不缓存（SSR）
fetch(url, { cache: 'no-store' });

// 定时重新验证（ISR）
fetch(url, { next: { revalidate: 60 } });
```

### 5.3 在 Client Component 中获取

```tsx
'use client';
import { useEffect, useState } from 'react';

export function PostComments({ postId }) {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      try {
        setIsLoading(true);
        setError(null);

        const res = await fetch(`/api/posts/${postId}/comments`, {
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new Error(`请求失败：${res.status}`);
        }

        const json = await res.json();
        setData(json);
      } catch (e) {
        if (e instanceof Error && e.name === 'AbortError') return;
        setError(e instanceof Error ? e.message : '未知错误');
      } finally {
        setIsLoading(false);
      }
    }

    void load();
    return () => controller.abort();
  }, [postId]);

  if (isLoading) return <div>加载中...</div>;
  if (error) return <div>加载失败：{error}</div>;

  return <CommentList comments={data} />;
}
```

---

## 6. 常用场景（面向实际开发）

### 6.1 对接 NestJS：三种最常见方式

#### 方式 A：Server Component 直接请求后端（推荐起步）

```tsx
export default async function PostsPage() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts`, {
    cache: 'no-store',
  });

  if (!res.ok) {
    throw new Error('Failed to fetch posts');
  }

  const posts = await res.json();
  return <PostList posts={posts} />;
}
```

要点：
- 适合需要后端鉴权（cookie）或需要隐藏密钥的请求
- 如果你的后端地址是内网或包含敏感信息，建议用不带 NEXT_PUBLIC 前缀的服务端环境变量

#### 方式 B：同源代理（开发体验好）

思路是让浏览器只请求 `web` 的同源 `/api/v1/*`，再由 Next.js 转发到 `api`。

```tsx
export default async function PostsPage() {
  const res = await fetch('http://localhost:3000/api/v1/posts', { cache: 'no-store' });
  const posts = await res.json();
  return <PostList posts={posts} />;
}
```

这种方式通常配合 `next.config.ts` 的 rewrites 使用（把 `/api/v1/:path*` 转发到 `http://localhost:4000/api/v1/:path*`）。

#### 方式 C：Route Handler 做 BFF（前后端“夹层”）

当你想“统一前端接口形状”“隐藏后端细节”“合并多个后端请求”时，可以用 Route Handler。

```ts
import { NextResponse } from 'next/server';

export async function GET() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts`, { cache: 'no-store' });
  const data = await res.json();
  return NextResponse.json({ data });
}
```

### 6.2 登录态与权限：middleware 做路由保护

```ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  const isProtected = request.nextUrl.pathname.startsWith('/admin');

  if (isProtected && !session) {
    const url = new URL('/login', request.url);
    url.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}
```

实践建议：
- 只做“粗粒度路由挡板”，细粒度权限在页面/接口里再校验
- 统一 session 存储策略：cookie（简单）或 token（更灵活）

### 6.3 表单提交：优先 Server Actions（无 JS 也能工作）

```tsx
export default function NewPostPage() {
  async function createPost(formData: FormData) {
    'use server';

    const title = String(formData.get('title') ?? '');
    const content = String(formData.get('content') ?? '');

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/posts`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ title, content }),
    });

    if (!res.ok) {
      throw new Error('创建失败');
    }
  }

  return (
    <form action={createPost} className="space-y-4">
      <input name="title" placeholder="标题" className="border px-3 py-2" />
      <textarea name="content" placeholder="内容" className="border px-3 py-2" />
      <button type="submit" className="rounded bg-indigo-600 px-3 py-2 text-white">
        提交
      </button>
    </form>
  );
}
```

### 6.4 SEO：metadata 与动态标题

```tsx
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: '文章列表',
    description: '最新文章',
  };
}

export default function Page() {
  return <div>...</div>;
}
```

### 6.5 错误与加载：用约定文件兜底

常用组合：
- `loading.tsx`：页面级加载状态（配合 streaming）
- `error.tsx`：页面级错误边界（通常是 Client Component）
- `not-found.tsx`：资源不存在时的 404

---

## 7. 项目配置文件详解

### 7.1 next.config.ts

```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // 开启 React 严格模式，帮助发现问题

  transpilePackages: ['@repo/shared'],
  // 转译 Monorepo 中的共享包
};

export default nextConfig;
```

### 7.2 tsconfig.json

```json
{
  "extends": "@repo/typescript-config/nextjs.json",
  // 继承共享的 TypeScript 配置

  "compilerOptions": {
    "baseUrl": ".",
    // 模块解析的基础路径

    "paths": {
      "@/*": ["./src/*"]
      // 路径别名：@/components → ./src/components
    }
  },

  "include": [
    "next-env.d.ts",      // Next.js 类型声明
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts" // Next.js 生成的类型
  ],

  "exclude": ["node_modules"]
}
```

### 7.3 使用路径别名

```tsx
// 不用别名（丑）
import { Button } from '../../../components/ui/Button';

// 使用别名（美）
import { Button } from '@/components/ui/Button';
```

---

## 8. 常见陷阱与最佳实践

### ❌ 陷阱 1：在 Server Component 中使用 hooks

```tsx
// 错误：Server Component 不能用 hooks
export default function Page() {
  const [count, setCount] = useState(0);  // ❌ 报错
  return <div>{count}</div>;
}

// 正确：添加 'use client'
'use client';
export default function Page() {
  const [count, setCount] = useState(0);  // ✅
  return <div>{count}</div>;
}
```

### ❌ 陷阱 2：Client Component 导入 Server-only 代码

```tsx
// server-only.ts
import 'server-only';  // 标记此文件只能在服务端使用
import { db } from '@/lib/db';

// client.tsx
'use client';
import { db } from './server-only';  // ❌ 构建时报错
```

### ❌ 陷阱 3：忘记处理 loading 和 error

```tsx
// app/posts/loading.tsx
export default function Loading() {
  return <div className="animate-pulse">加载中...</div>;
}

// app/posts/error.tsx
'use client';
export default function Error({ error, reset }) {
  return (
    <div>
      <h2>出错了：{error.message}</h2>
      <button onClick={() => reset()}>重试</button>
    </div>
  );
}
```

### ✅ 最佳实践

1. **默认使用 Server Component**
   - 只有需要交互时才用 `'use client'`

2. **数据获取放在页面组件**
   ```tsx
   // ✅ 在 page.tsx 获取数据
   export default async function Page() {
     const data = await getData();
     return <ClientComponent data={data} />;
   }
   ```

3. **合理使用 ISR**
   ```tsx
   // 不需要实时的页面，用 ISR 而不是 SSR
   fetch(url, { next: { revalidate: 60 } });
   ```

4. **组件拆分**
   - 静态部分：Server Component
   - 交互部分：Client Component

---

## 9. 总结

### 记住这 5 点就够了

1. **文件即路由**：`app/about/page.tsx` → `/about`
2. **默认 Server Component**：需要交互才加 `'use client'`
3. **四种渲染**：SSG > ISR > SSR > CSR（按性能排序）
4. **数据获取**：Server Component 直接 await fetch
5. **缓存控制**：`revalidate` 控制刷新频率

### Next.js 的核心价值

```
传统 React：用户等待 JS 下载 → 执行 → 渲染（慢）
Next.js：服务端直接返回 HTML → 用户立即看到内容（快）
```

**一句话总结**：Next.js 让你的 React 应用又快又利于 SEO。
