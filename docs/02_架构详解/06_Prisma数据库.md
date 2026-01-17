# Prisma 详解

> 面向初级开发者的 Prisma 教程，遵循二八原则

## 官方资源

| 资源 | 链接 |
|------|------|
| 官方文档 | [prisma.io/docs](https://www.prisma.io/docs) |
| Schema 参考 | [prisma.io/docs/concepts/components/prisma-schema](https://www.prisma.io/docs/concepts/components/prisma-schema) |
| Client API | [prisma.io/docs/concepts/components/prisma-client](https://www.prisma.io/docs/concepts/components/prisma-client) |
| 迁移指南 | [prisma.io/docs/concepts/components/prisma-migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate) |
| Prisma Studio | [prisma.io/studio](https://www.prisma.io/studio) |
| GitHub | [github.com/prisma/prisma](https://github.com/prisma/prisma) |
| 示例项目 | [github.com/prisma/prisma-examples](https://github.com/prisma/prisma-examples) |

## 1. Prisma 是什么

### 一句话解释
Prisma 是一个**现代化的数据库工具包**，让你用 TypeScript 安全地操作数据库。

### 与传统 ORM 的区别

| 特性 | 传统 ORM (TypeORM/Sequelize) | Prisma |
|------|------------------------------|--------|
| 类型安全 | 部分 | **完全类型安全** |
| 学习曲线 | 陡峭 | 平缓 |
| Schema 定义 | 代码中定义 | **独立 schema 文件** |
| 查询语法 | 类 SQL/魔法方法 | **直观的对象 API** |
| 迁移工具 | 需要额外配置 | **内置** |
| 自动补全 | 有限 | **完美** |

### 类比理解
- **原生 SQL**：自己写信，容易出错
- **传统 ORM**：用模板写信，还是要懂很多规则
- **Prisma**：语音输入，说什么就写什么，还帮你检查错别字

### Prisma 三大组件

```
┌─────────────────────────────────────────────────────┐
│                    Prisma                            │
├─────────────────┬─────────────────┬─────────────────┤
│  Prisma Client  │  Prisma Migrate │  Prisma Studio  │
│   查询数据库    │    管理迁移     │   可视化界面    │
└─────────────────┴─────────────────┴─────────────────┘
```

---

## 2. Schema 语法详解

### 2.1 基础结构

```prisma
// prisma/schema.prisma

// 1. 生成器配置
generator client {
  provider = "prisma-client-js"
}

// 2. 数据源配置
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// 3. 数据模型
model User {
  id    String @id @default(cuid())
  email String @unique
  name  String
}
```

### 2.2 字段类型

| Prisma 类型 | 说明 | 示例 |
|-------------|------|------|
| `String` | 字符串 | `name String` |
| `Int` | 整数 | `age Int` |
| `Float` | 浮点数 | `price Float` |
| `Boolean` | 布尔值 | `isActive Boolean` |
| `DateTime` | 日期时间 | `createdAt DateTime` |
| `Json` | JSON 数据 | `metadata Json` |
| `Bytes` | 二进制 | `avatar Bytes` |

### 2.3 字段修饰符

```prisma
model User {
  // 必填字段
  email String

  // 可选字段（加 ?）
  bio String?

  // 数组字段（加 []）
  tags String[]

  // 默认值
  role String @default("USER")
  createdAt DateTime @default(now())

  // 自动更新时间
  updatedAt DateTime @updatedAt
}
```

### 2.4 字段属性

```prisma
model User {
  id String @id @default(cuid())
  // @id: 主键
  // @default(cuid()): 自动生成唯一 ID

  email String @unique
  // @unique: 唯一约束

  slug String @unique @map("url_slug")
  // @map: 映射到数据库的实际列名

  @@index([email, createdAt])
  // @@index: 复合索引

  @@map("users")
  // @@map: 映射到数据库的实际表名
}
```

---

## 3. 项目中 schema.prisma 详解

### 3.1 枚举类型

```prisma
enum UserRole {
  USER
  ADMIN
}
```

使用：
```typescript
// 创建管理员
await prisma.user.create({
  data: { email: 'admin@example.com', role: 'ADMIN' }
});

// 类型安全：只能是 'USER' 或 'ADMIN'
```

### 3.2 用户模型

```prisma
model User {
  id           String         @id @default(cuid())
  // 主键，自动生成 cuid（如 'clx1234567890'）

  email        String         @unique
  username     String         @unique
  // 邮箱和用户名必须唯一

  passwordHash String?
  // 可选，OAuth 用户可能没有密码

  role         UserRole       @default(USER)
  // 默认是普通用户

  avatar       String?
  bio          String?

  // 关系字段（不会在数据库创建列）
  oauth        OAuthAccount[]
  posts        Post[]
  comments     Comment[]

  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt
}
```

### 3.3 关系定义

#### 一对多关系

```prisma
model User {
  id    String @id @default(cuid())
  posts Post[]  // 一个用户有多篇文章
}

model Post {
  id       String @id @default(cuid())
  author   User   @relation(fields: [authorId], references: [id])
  authorId String // 外键
}
```

#### 多对多关系（通过中间表）

```prisma
model Post {
  id   String    @id @default(cuid())
  tags PostTag[] // 文章有多个标签
}

model Tag {
  id    String    @id @default(cuid())
  posts PostTag[] // 标签属于多篇文章
}

// 中间表
model PostTag {
  post   Post   @relation(fields: [postId], references: [id], onDelete: Cascade)
  postId String
  tag    Tag    @relation(fields: [tagId], references: [id], onDelete: Cascade)
  tagId  String

  @@id([postId, tagId])  // 复合主键
}
```

#### 自引用关系（评论回复）

```prisma
model Comment {
  id       String    @id @default(cuid())
  content  String

  // 自引用：评论可以回复评论
  parent   Comment?  @relation("CommentReplies", fields: [parentId], references: [id])
  parentId String?
  replies  Comment[] @relation("CommentReplies")
}
```

### 3.4 索引优化

```prisma
model Post {
  id          String    @id @default(cuid())
  published   Boolean   @default(false)
  createdAt   DateTime  @default(now())
  slug        String    @unique

  // 复合索引：加速 "查询已发布文章按时间排序"
  @@index([published, createdAt(sort: Desc)])

  // 单字段索引：加速按 slug 查询
  @@index([slug])
}
```

---

## 4. CRUD 操作代码示例

### 4.1 创建（Create）

```typescript
// 创建单条
const user = await prisma.user.create({
  data: {
    email: 'zhang@example.com',
    username: 'zhangsan',
  },
});

// 创建并返回关联数据
const post = await prisma.post.create({
  data: {
    title: 'Hello World',
    slug: 'hello-world',
    content: '...',
    author: {
      connect: { id: userId },  // 关联已有用户
    },
    tags: {
      create: [
        { tag: { create: { name: 'TypeScript', slug: 'typescript' } } },
      ],
    },
  },
  include: {
    author: true,
    tags: { include: { tag: true } },
  },
});

// 批量创建
const users = await prisma.user.createMany({
  data: [
    { email: 'a@example.com', username: 'a' },
    { email: 'b@example.com', username: 'b' },
  ],
});
```

### 4.2 查询（Read）

```typescript
// 查询单条
const user = await prisma.user.findUnique({
  where: { email: 'zhang@example.com' },
});

// 查询单条（不存在则抛错）
const user = await prisma.user.findUniqueOrThrow({
  where: { id: 'xxx' },
});

// 查询第一条匹配的
const post = await prisma.post.findFirst({
  where: { published: true },
  orderBy: { createdAt: 'desc' },
});

// 查询多条
const posts = await prisma.post.findMany({
  where: {
    published: true,
    author: { role: 'ADMIN' },  // 嵌套条件
  },
  orderBy: { createdAt: 'desc' },
  skip: 0,   // 分页：跳过
  take: 10,  // 分页：获取数量
});

// 计数
const count = await prisma.post.count({
  where: { published: true },
});
```

### 4.3 更新（Update）

```typescript
// 更新单条
const user = await prisma.user.update({
  where: { id: 'xxx' },
  data: { bio: '新的个人简介' },
});

// 更新或创建（Upsert）
const user = await prisma.user.upsert({
  where: { email: 'zhang@example.com' },
  update: { username: 'zhangsan_new' },
  create: { email: 'zhang@example.com', username: 'zhangsan' },
});

// 批量更新
const result = await prisma.post.updateMany({
  where: { authorId: 'xxx' },
  data: { published: false },
});
// result.count = 更新的数量
```

### 4.4 删除（Delete）

```typescript
// 删除单条
const user = await prisma.user.delete({
  where: { id: 'xxx' },
});

// 批量删除
const result = await prisma.post.deleteMany({
  where: { published: false },
});
```

---

## 5. 关联查询

### 5.1 include（包含关联）

```typescript
// 获取文章及其作者和标签
const post = await prisma.post.findUnique({
  where: { slug: 'hello-world' },
  include: {
    author: true,  // 包含作者信息
    tags: {
      include: {
        tag: true,  // 包含标签详情
      },
    },
    comments: {
      where: { approved: true },  // 只获取已审核评论
      orderBy: { createdAt: 'desc' },
      take: 10,
    },
  },
});
```

### 5.2 select（选择字段）

```typescript
// 只获取需要的字段（减少数据传输）
const posts = await prisma.post.findMany({
  select: {
    id: true,
    title: true,
    slug: true,
    author: {
      select: {
        id: true,
        username: true,
        avatar: true,
      },
    },
  },
});
```

### 5.3 include vs select

```typescript
// include：获取所有字段 + 关联
const post = await prisma.post.findUnique({
  where: { id: 'xxx' },
  include: { author: true },
});
// 返回：{ id, title, content, ..., author: { id, email, ... } }

// select：只获取指定字段
const post = await prisma.post.findUnique({
  where: { id: 'xxx' },
  select: {
    title: true,
    author: { select: { username: true } },
  },
});
// 返回：{ title, author: { username } }
```

---

## 6. 迁移命令详解

### 6.1 常用命令

```bash
# 开发环境：创建并应用迁移
npx prisma migrate dev --name init
# 创建 prisma/migrations/xxx_init/migration.sql
# 自动运行 prisma generate

# 生产环境：应用迁移
npx prisma migrate deploy

# 重置数据库（危险！会删除所有数据）
npx prisma migrate reset

# 不迁移，直接同步 schema 到数据库（开发用）
npx prisma db push

# 生成 Prisma Client
npx prisma generate

# 打开可视化管理界面
npx prisma studio
```

### 6.2 迁移工作流

```
1. 修改 schema.prisma
        ↓
2. npx prisma migrate dev --name add_bio_field
        ↓
3. 自动生成 SQL 迁移文件
        ↓
4. 自动应用到数据库
        ↓
5. 自动运行 prisma generate
        ↓
6. 代码中立即获得新类型
```

---

## 7. 项目中的 Prisma 配置

### packages/database/src/index.ts

```typescript
import { PrismaClient } from '@prisma/client';

// 防止开发环境热更新创建多个连接
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']  // 开发环境打印 SQL
      : ['error'],                   // 生产环境只打印错误
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// 导出 Prisma 生成的类型
export * from '@prisma/client';

// 导出实例别名
export { prisma as db };
```

### 使用方式

```typescript
// 在 NestJS Service 中
import { db } from '@repo/database';

@Injectable()
export class UsersService {
  async findAll() {
    return db.user.findMany();
  }
}

// 或者在 Next.js 中
import { db } from '@repo/database';

export async function getUsers() {
  return db.user.findMany();
}
```

---

## 8. 常见陷阱与最佳实践

### ❌ 陷阱 1：修改 schema 后忘记 generate

```bash
# 错误：修改了 schema 但代码没有新类型
# 解决：
npx prisma generate
```

### ❌ 陷阱 2：N+1 查询问题

```typescript
// 错误：N+1 查询（每篇文章单独查作者）
const posts = await prisma.post.findMany();
for (const post of posts) {
  const author = await prisma.user.findUnique({
    where: { id: post.authorId }
  });
}

// 正确：使用 include 一次查询
const posts = await prisma.post.findMany({
  include: { author: true },
});
```

### ❌ 陷阱 3：忽略 onDelete 行为

```prisma
// 问题：删除用户时，文章会怎样？
model Post {
  author   User   @relation(fields: [authorId], references: [id])
  authorId String
}
// 默认：删除用户会报错（因为有关联文章）

// 解决方案 1：级联删除
model Post {
  author   User   @relation(fields: [authorId], references: [id], onDelete: Cascade)
  authorId String
}
// 删除用户时自动删除其所有文章

// 解决方案 2：设为 null
model Post {
  author   User?   @relation(fields: [authorId], references: [id], onDelete: SetNull)
  authorId String?
}
// 删除用户时将 authorId 设为 null
```

### ✅ 最佳实践

1. **使用 select 减少数据传输**
   ```typescript
   // 列表只需要摘要信息
   const posts = await prisma.post.findMany({
     select: { id: true, title: true, slug: true },
   });
   ```

2. **事务处理**
   ```typescript
   // 多个操作需要原子性
   await prisma.$transaction([
     prisma.user.update({ where: { id }, data: { balance: { decrement: 100 } } }),
     prisma.order.create({ data: { userId: id, amount: 100 } }),
   ]);
   ```

3. **软删除模式**
   ```prisma
   model Post {
     deletedAt DateTime?  // null 表示未删除
   }
   ```
   ```typescript
   // 查询时过滤
   const posts = await prisma.post.findMany({
     where: { deletedAt: null },
   });
   ```

4. **使用中间件记录日志**
   ```typescript
   prisma.$use(async (params, next) => {
     const before = Date.now();
     const result = await next(params);
     const after = Date.now();
     console.log(`${params.model}.${params.action} took ${after - before}ms`);
     return result;
   });
   ```

---

## 9. 总结

### 记住这 5 点就够了

1. **Schema 定义模型**：`model User { id String @id }`
2. **关系用 @relation**：`author User @relation(fields: [authorId], references: [id])`
3. **CRUD 四件套**：`create`, `findMany`, `update`, `delete`
4. **关联查询用 include**：`include: { author: true }`
5. **修改 schema 后要 generate**：`npx prisma generate`

### Prisma 的核心价值

```
原生 SQL：容易写错，没有类型检查
传统 ORM：配置复杂，魔法多
Prisma：类型安全，直观易用，自动补全
```

**一句话总结**：Prisma 让数据库操作像写 TypeScript 对象一样简单安全。
