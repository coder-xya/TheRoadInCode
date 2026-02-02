# M1: 项目初始化与统一内容基座 Entry

> **目标**：搭建 Monorepo 基础架构，实现统一内容基座 Entry 的 CRUD，为三大定位（技术分享/作品展示/学习实验）奠定基础。
>
> **预计时间**：1-2 周
> **优先级**：P0（必须完成）

---

## 任务概览

M1 分为 3 个主要阶段：

1. **基础设施搭建**（数据库、共享包、开发环境）
2. **后端核心**（Entry 模型 + 基础 CRUD API）
3. **前端基础**（路由结构 + Entry 列表/详情页）

---

## 阶段 1：基础设施搭建

### 任务 1.1：数据库初始化

**目标**：应用 Codex 生成的 Prisma Schema，初始化 PostgreSQL 数据库

**步骤**：

1. **启动 PostgreSQL**

   ```bash
   cd docker
   docker-compose up -d
   ```

   - 验证：`docker ps` 看到 postgres 容器运行

2. **配置数据库连接**

   ```bash
   # packages/database/.env
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/theroadincode_dev?schema=public"
   ```

3. **应用 Prisma Schema**

   ```bash
   cd packages/database
   pnpm db:push
   ```

   - 预期输出：显示创建的 30+ 个表
   - 验证：`pnpm db:studio` 打开 Prisma Studio 查看表结构

4. **（可选）创建初始 migration**
   ```bash
   pnpm db:migrate dev --name init
   ```

   - 生成 `prisma/migrations/` 目录

**验收标准**：

- ✅ PostgreSQL 运行正常
- ✅ Prisma Studio 可以打开并看到所有表
- ✅ `Entry`、`EntryRevision`、`Post`、`Work`、`Experiment` 等核心表存在

**潜在问题**：

- 如果遇到 PostgreSQL 扩展问题（pg_trgm），暂时跳过，搜索功能后期再实现
- Schema 中的 enum 如果报错，检查 PostgreSQL 版本（需要 >= 12）

---

### 任务 1.2：共享类型包更新

**目标**：在 `packages/shared` 中定义前后端共享的 TypeScript 类型

**步骤**：

1. **创建 Entry 相关类型**

   ```bash
   # 文件位置：packages/shared/src/types/entry.ts
   ```

2. **需要定义的类型**：
   - `EntryType`（POST | WORK | EXPERIMENT | NOTE）
   - `EntryStatus`（DRAFT | PUBLISHED | ARCHIVED）
   - `EntryListItem`（列表展示）
   - `EntryDetail`（详情展示）
   - `CreateEntryDto`（创建入参）
   - `UpdateEntryDto`（更新入参）

3. **参考 Prisma Schema**：

   ```typescript
   // 示例结构（你来编写具体实现）
   export enum EntryType {
     POST = 'POST',
     WORK = 'WORK',
     EXPERIMENT = 'EXPERIMENT',
     NOTE = 'NOTE',
   }

   export interface EntryListItem {
     id: string;
     type: EntryType;
     slug: string;
     title: string;
     summary?: string;
     coverImage?: string;
     status: EntryStatus;
     publishedAt?: string;
     createdAt: string;
   }
   ```

**验收标准**：

- ✅ 类型文件创建完成
- ✅ 前后端都能 import 使用
- ✅ 类型与 Prisma Schema 保持一致

---

### 任务 1.3：开发环境配置

**目标**：确保开发环境顺畅运行

**检查清单**：

- [ ] **后端环境变量**

  ```bash
  # apps/api/.env.local
  DATABASE_URL="postgresql://postgres:postgres@localhost:5432/theroadincode_dev?schema=public"
  JWT_SECRET="your-dev-secret-change-in-production"
  JWT_EXPIRES_IN="15m"
  REFRESH_TOKEN_EXPIRES_IN="7d"
  PORT=4000
  ```

- [ ] **前端环境变量**

  ```bash
  # apps/web/.env.local
  NEXT_PUBLIC_API_URL="http://localhost:4000/api/v1"
  REVALIDATE_SECRET="your-revalidate-secret"
  ```

- [ ] **Turborepo 配置检查**
  - 确认 `turbo.json` 中 `dev` 任务正确
  - 测试：`pnpm dev` 能同时启动前后端

**验收标准**：

- ✅ `pnpm dev` 成功启动前后端
- ✅ 前端访问 http://localhost:3000 正常
- ✅ 后端访问 http://localhost:4000/api/v1/health 返回 200（需先实现健康检查端点）

---

## 阶段 2：后端核心实现

### 任务 2.1：Entry 模块搭建

**目标**：创建 NestJS Entry 模块，实现统一内容基座的 CRUD

**步骤**：

1. **创建模块文件**

   ```bash
   # apps/api/src/modules/entries/
   ├── entries.module.ts
   ├── entries.controller.ts
   ├── entries.service.ts
   ├── dto/
   │   ├── create-entry.dto.ts
   │   ├── update-entry.dto.ts
   │   └── query-entry.dto.ts
   └── entities/
       └── entry.entity.ts
   ```

2. **实现优先级**：
   - **P0**：`EntriesService.create()` - 创建草稿
   - **P0**：`EntriesService.findAll()` - 列表查询（支持分页、类型筛选、状态筛选）
   - **P0**：`EntriesService.findOne()` - 详情查询（通过 slug）
   - **P0**：`EntriesService.update()` - 更新元数据（不含 content）
   - **P1**：`EntriesService.remove()` - 软删除（设置 deletedAt）

3. **关键点**：
   - 使用 Prisma Client：`this.prisma.entry.xxx`
   - 公开读接口只返回 `status = PUBLISHED` 且 `deletedAt IS NULL`
   - 管理接口可以查询所有状态
   - Slug 唯一性检查：`@@unique([type, slug])`

**示例 Service 方法签名**（你来实现）：

```typescript
@Injectable()
export class EntriesService {
  constructor(private prisma: PrismaService) {}

  async create(createEntryDto: CreateEntryDto, authorId: string) {
    // TODO: 实现创建逻辑
    // 1. 校验 slug 唯一性
    // 2. 创建 Entry
    // 3. 创建首个 EntryRevision
    // 4. 更新 Entry.currentRevisionId
  }

  async findAll(query: QueryEntryDto) {
    // TODO: 实现列表查询
    // 1. 构建 where 条件（type, status, 公开/管理）
    // 2. 应用分页（page, limit）
    // 3. 返回 { data, meta }
  }

  async findOne(type: EntryType, slug: string, isPublic: boolean) {
    // TODO: 实现详情查询
    // 1. 根据 type + slug 查询
    // 2. 公开查询：检查 status = PUBLISHED
    // 3. 包含关联数据（tags, category, author）
  }
}
```

**验收标准**：

- ✅ Entry 模块在 `AppModule` 中注册
- ✅ API 端点可通过 Postman/curl 测试
- ✅ 创建草稿成功返回 Entry 对象
- ✅ 列表查询返回正确的分页数据

---

### 任务 2.2：EntryRevision 模块（版本管理）

**目标**：实现内容版本管理，支持草稿保存和回滚

**步骤**：

1. **创建 Revisions 模块**

   ```bash
   # apps/api/src/modules/revisions/
   ├── revisions.module.ts
   ├── revisions.service.ts
   └── dto/
       └── create-revision.dto.ts
   ```

2. **核心方法**：
   - `create()` - 创建新版本（revisionNo 自增）
   - `findAll()` - 获取 Entry 的所有版本列表
   - `restore()` - 回滚到指定版本

3. **关键逻辑**：
   ```typescript
   async create(entryId: string, content: string) {
     // 1. 获取当前最大 revisionNo
     // 2. 创建新 revision（revisionNo + 1）
     // 3. 更新 Entry.currentRevisionId
   }
   ```

**验收标准**：

- ✅ 可以为 Entry 创建多个 revision
- ✅ 版本号自动递增
- ✅ 可以回滚到历史版本

**注意事项**：

- MDX 编译暂时不实现，`compiled` 字段留空
- 发布功能（Task 2.3）会用到 revision

---

### 任务 2.3：发布流程实现

**目标**：实现 Entry 的发布/下线功能

**步骤**：

1. **在 EntriesService 中添加方法**：

   ```typescript
   async publish(id: string, revisionId?: string) {
     // 1. 校验：Entry 存在、有对应的扩展表（Post/Work等）
     // 2. 校验：revisionId 有效（默认用 currentRevisionId）
     // 3. 更新 Entry：
     //    - status = PUBLISHED
     //    - publishedAt = now()
     //    - publishedRevisionId = revisionId
     // 4. 写入 OutboxEvent（暂时可选，后续再实现）
   }

   async unpublish(id: string) {
     // 1. 更新 Entry：
     //    - status = ARCHIVED
     // 2. 写入 OutboxEvent
   }
   ```

2. **创建对应的 Controller 端点**：
   ```typescript
   @Post(':id/publish')
   @UseGuards(JwtAuthGuard) // 需要先实现认证，或暂时跳过
   async publish(@Param('id') id: string) {
     return this.entriesService.publish(id);
   }
   ```

**验收标准**：

- ✅ 草稿状态的 Entry 可以发布
- ✅ 发布后 status 变为 PUBLISHED
- ✅ publishedAt 时间戳正确
- ✅ 可以将已发布的 Entry 下线

---

### 任务 2.4：认证系统（简化版）

**目标**：实现管理员登录，保护后台 API

**步骤**：

1. **创建 Auth 模块**

   ```bash
   # apps/api/src/modules/auth/
   ├── auth.module.ts
   ├── auth.controller.ts
   ├── auth.service.ts
   ├── strategies/
   │   └── jwt.strategy.ts
   └── guards/
       └── jwt-auth.guard.ts
   ```

2. **简化实现**（暂不支持 OAuth）：
   - 硬编码管理员账号（环境变量）
   - 登录接口：校验账号密码，返回 JWT
   - JWT 策略：验证 token

3. **环境变量**：

   ```bash
   ADMIN_EMAIL="admin@example.com"
   ADMIN_PASSWORD="change-me-in-production"
   ```

4. **应用 Guard**：
   ```typescript
   @Post()
   @UseGuards(JwtAuthGuard)
   create(@Request() req, @Body() dto: CreateEntryDto) {
     return this.entriesService.create(dto, req.user.id);
   }
   ```

**验收标准**：

- ✅ POST `/auth/login` 返回 JWT token
- ✅ 带 token 访问受保护接口成功
- ✅ 不带 token 访问受保护接口返回 401

**注意事项**：

- 这是 MVP 版本，仅用于开发
- 生产环境需要完善密码加密、Session 管理等

---

## 阶段 3：前端基础实现

### 任务 3.1：API Client 封装

**目标**：封装后端 API 调用，提供类型安全的客户端

**步骤**：

1. **创建 API Client**

   ```bash
   # apps/web/src/lib/api/
   ├── client.ts          # 基础 fetch 封装
   ├── entries.ts         # Entry 相关 API
   └── types.ts           # API 响应类型（引用 @repo/shared）
   ```

2. **实现基础 Client**：

   ```typescript
   // client.ts
   const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

   export async function apiClient<T>(endpoint: string, options?: RequestInit): Promise<T> {
     // TODO: 实现 fetch 封装
     // 1. 拼接完整 URL
     // 2. 添加默认 headers
     // 3. 处理响应（成功/失败）
     // 4. 返回类型安全的数据
   }
   ```

3. **实现 Entries API**：

   ```typescript
   // entries.ts
   export const entriesApi = {
     getList: (params: EntryQueryParams) => {
       return apiClient<PaginatedResponse<EntryListItem>>(
         `/entries?${new URLSearchParams(params)}`
       );
     },

     getDetail: (type: EntryType, slug: string) => {
       return apiClient<EntryDetail>(`/${type.toLowerCase()}s/${slug}`);
     },
   };
   ```

**验收标准**：

- ✅ API Client 可以成功调用后端接口
- ✅ 类型提示正确
- ✅ 错误处理友好

---

### 任务 3.2：路由结构搭建

**目标**：创建 Next.js App Router 基础路由

**步骤**：

1. **创建路由目录**

   ```bash
   # apps/web/src/app/
   ├── (home)/
   │   └── page.tsx          # 首页
   ├── posts/
   │   ├── page.tsx          # 文章列表
   │   └── [slug]/
   │       └── page.tsx      # 文章详情
   ├── works/
   │   ├── page.tsx          # 作品列表
   │   └── [slug]/
   │       └── page.tsx      # 作品详情
   └── layout.tsx            # 根布局
   ```

2. **实现首页**（简单版本）：
   ```typescript
   // (home)/page.tsx
   export default async function HomePage() {
     // TODO: 实现首页
     // 1. 调用 API 获取最新文章/作品
     // 2. 展示简单列表
     return (
       <div>
         <h1>TheRoadInCode</h1>
         {/* 文章列表 */}
         {/* 作品展示 */}
       </div>
     );
   }
   ```

**验收标准**：

- ✅ 路由访问正常（http://localhost:3000）
- ✅ 首页能显示基本内容
- ✅ 文章/作品列表页能渲染

---

### 任务 3.3：Entry 列表页组件

**目标**：实现通用的 Entry 列表展示

**步骤**：

1. **创建 EntryCard 组件**

   ```typescript
   // components/entries/EntryCard.tsx
   interface EntryCardProps {
     entry: EntryListItem;
   }

   export function EntryCard({ entry }: EntryCardProps) {
     // TODO: 实现卡片组件
     // 1. 显示标题、摘要、封面图
     // 2. 显示发布时间、标签
     // 3. 点击跳转到详情页
   }
   ```

2. **创建 EntryList 组件**

   ```typescript
   // components/entries/EntryList.tsx
   interface EntryListProps {
     entries: EntryListItem[];
   }

   export function EntryList({ entries }: EntryListProps) {
     // TODO: 实现列表组件
     // 1. 使用 Grid 或 Flex 布局
     // 2. 渲染 EntryCard
     // 3. 空状态处理
   }
   ```

3. **在列表页使用**：
   ```typescript
   // posts/page.tsx
   export default async function PostsPage() {
     const { data } = await entriesApi.getList({ type: 'POST' });
     return <EntryList entries={data} />;
   }
   ```

**验收标准**：

- ✅ 列表页能正确展示数据
- ✅ 卡片样式美观（使用 Tailwind + Shadcn/ui）
- ✅ 支持响应式布局

---

### 任务 3.4：Entry 详情页组件

**目标**：实现 Entry 详情展示（MDX 渲染暂时跳过）

**步骤**：

1. **创建详情页布局**

   ```typescript
   // posts/[slug]/page.tsx
   export default async function PostDetailPage({
     params
   }: { params: { slug: string } }) {
     const entry = await entriesApi.getDetail('POST', params.slug);

     return (
       <article>
         <h1>{entry.title}</h1>
         <p>{entry.summary}</p>
         {/* TODO: MDX 内容渲染（M2 实现） */}
         <div dangerouslySetInnerHTML={{ __html: 'Placeholder content' }} />
       </article>
     );
   }
   ```

2. **实现 generateStaticParams**（SSG）：
   ```typescript
   export async function generateStaticParams() {
     const { data } = await entriesApi.getList({
       type: 'POST',
       status: 'PUBLISHED',
     });
     return data.map((post) => ({ slug: post.slug }));
   }
   ```

**验收标准**：

- ✅ 详情页能显示文章基本信息
- ✅ SSG 预渲染正常工作
- ✅ 动态路由参数正确

---

## 阶段 4：验证与优化

### 任务 4.1：端到端测试

**测试流程**：

1. **后端测试**
   - [ ] 创建草稿 Entry（POST 类型）
   - [ ] 创建 revision（保存内容）
   - [ ] 发布 Entry
   - [ ] 查询已发布列表（公开接口）
   - [ ] 查询详情（通过 slug）

2. **前端测试**
   - [ ] 访问首页，看到已发布内容
   - [ ] 访问列表页，看到分页数据
   - [ ] 点击卡片，进入详情页
   - [ ] 详情页显示正确内容

3. **集成测试**
   - [ ] 后端发布 → 前端 ISR revalidation（暂时可手动刷新）
   - [ ] 后端下线 → 前端列表消失

**验收标准**：

- ✅ 核心流程走通
- ✅ 无明显 bug
- ✅ 数据一致性正确

---

### 任务 4.2：代码优化与文档

**优化项**：

1. **错误处理**
   - [ ] API 统一错误响应格式
   - [ ] 前端错误边界（Error Boundary）
   - [ ] 友好的错误提示

2. **性能优化**
   - [ ] 数据库查询索引检查（通过 Prisma Studio 查看查询计划）
   - [ ] 前端图片优化（Next.js Image 组件）
   - [ ] 骨架屏 Loading 状态

3. **代码规范**
   - [ ] ESLint 检查通过
   - [ ] Prettier 格式化
   - [ ] TypeScript 无 any 类型

4. **文档更新**
   - [ ] 更新 README.md（添加 M1 完成内容）
   - [ ] API 文档（可选：Swagger）
   - [ ] 开发日志（记录遇到的问题和解决方案）

---

## 里程碑检查清单

完成 M1 后，你应该拥有：

### 后端能力

- ✅ 统一内容基座 Entry CRUD
- ✅ 版本管理 EntryRevision
- ✅ 发布/下线功能
- ✅ 简化版管理员认证
- ✅ RESTful API（至少 5 个端点）

### 前端能力

- ✅ 首页展示
- ✅ Entry 列表页（文章/作品）
- ✅ Entry 详情页
- ✅ 响应式布局
- ✅ SSG/ISR 基础支持

### 基础设施

- ✅ Prisma Schema 应用成功
- ✅ PostgreSQL 运行正常
- ✅ 前后端联调成功
- ✅ 开发环境配置完善

---

## 常见问题与解决方案

### Q1: Prisma Schema 应用失败

**A**: 检查 PostgreSQL 版本，确保 >= 12；检查 DATABASE_URL 连接字符串正确

### Q2: 前端 API 调用 CORS 错误

**A**: 后端添加 CORS 配置：

```typescript
// apps/api/src/main.ts
app.enableCors({
  origin: 'http://localhost:3000',
  credentials: true,
});
```

### Q3: TypeScript 类型错误

**A**: 确保 `@repo/shared` 正确导出类型，前后端都安装了依赖

### Q4: Next.js 路由 404

**A**: 检查文件夹结构，确认 `page.tsx` 文件存在

---

## 下一步规划（M2 预告）

M1 完成后，M2 将实现：

1. **技术分享模块**
   - Post 扩展（category, readingTime）
   - MDX 内容渲染
   - 代码片段库
   - 系列文章

2. **完善认证**
   - Session 管理
   - Refresh Token 轮换
   - 后台管理界面登录页

3. **标签与分类**
   - Tag/Category CRUD
   - 标签筛选
   - 分类导航

---

**准备好开始 M1 了吗？建议从「阶段 1：基础设施搭建」的「任务 1.1：数据库初始化」开始！**

有任何问题随时问我，我会提供指导而不是直接写代码。加油！🚀
