# 需求分析文档

## 1. 项目概述

### 1.1 项目名称

TheRoadInCode - 个人博客系统

### 1.2 项目定位

现代化个人博客系统，围绕三大核心定位：

1. **技术分享**：发布技术文章、教程、学习笔记
   - 支持 Markdown/MDX 写作
   - 代码片段复用与版本管理
   - 系列文章组织与导航

2. **作品展示**：展示个人项目、开源贡献
   - 项目元数据结构化管理
   - 技术栈标签化
   - Demo 预览与外链管理

3. **技术学习实验**：技术探索、新框架/库试验平台
   - 实验记录与运行数据
   - 对比数据可视化
   - 实验笔记分类与关联

### 1.3 项目特点

- 学习导向：优先尝试最新技术栈
- 实验性质：允许激进的技术选型
- 个人使用：单用户博客，简化权限模型

---

## 2. 三大定位功能映射

### 2.1 技术分享功能清单

| 功能         | 描述                                          | 优先级 | 数据模型                |
| ------------ | --------------------------------------------- | ------ | ----------------------- |
| 文章 CRUD    | 创建、编辑、删除、发布文章                    | P0     | Post                    |
| Markdown/MDX | 支持 Markdown 写作，嵌入 React 组件（白名单） | P0     | Post.content            |
| 分类标签     | 文章分类（单选）、标签（多选）                | P0     | Category, Tag           |
| 草稿与发布   | 草稿/已发布/下线状态管理                      | P0     | Post.status             |
| 代码片段库   | 可复用代码片段，支持跨文章引用                | P1     | Snippet, SnippetVersion |
| 文章版本管理 | 每次编辑形成版本，支持回滚和 diff 对比        | P1     | PostRevision            |
| 系列文章     | 系列组织、排序、章节管理                      | P1     | Series, SeriesItem      |
| 文章元数据   | slug 规则、摘要、封面图、阅读时间、SEO 字段   | P0     | Post.\*                 |

**关键决策**：

- MDX 编译时机：发布时编译并缓存编译产物
- 允许组件白名单：CodeBlock, Callout, DemoCard（禁止任意 JS 执行）
- 发布工作流：草稿 → 预览 → 发布（锁定 revision）→ 可选下线

### 2.2 作品展示功能清单

| 功能          | 描述                                  | 优先级 | 数据模型       |
| ------------- | ------------------------------------- | ------ | -------------- |
| 作品列表/详情 | 展示个人项目，支持分页和筛选          | P0     | Work           |
| 项目元数据    | 状态、角色、时间线、亮点              | P0     | Work.\*        |
| 多媒体管理    | 项目截图、视频、封面图                | P0     | WorkMedia      |
| 技术栈标签化  | 技术栈作为独立实体，支持分类和统计    | P1     | Tech, WorkTech |
| 外链管理      | Demo/源码/文档/博客链接，支持状态检测 | P1     | WorkLink       |
| 作品分类      | 按类型分类（Web/Mobile/CLI/Library）  | P1     | Work.type      |
| 开源贡献      | GitHub PR/Issue 贡献记录              | P2     | Contribution   |

**关键决策**：

- 技术栈避免使用 `String[]`，采用实体化 `Tech` 表
- 外链支持定时/手动健康检查（可选后期实现）
- 支持项目状态：ACTIVE（进行中）/ ARCHIVED（已归档）

### 2.3 技术学习实验功能清单

| 功能     | 描述                               | 优先级 | 数据模型                     |
| -------- | ---------------------------------- | ------ | ---------------------------- |
| 实验记录 | 实验定义、目标、假设、方法论、结论 | P0     | Experiment                   |
| 运行数据 | 多次运行记录，参数、环境、结果     | P0     | ExperimentRun                |
| 对比数据 | 基线对比、指标对比、可视化图表     | P1     | Comparison, ExperimentMetric |
| 实验笔记 | 学习笔记、技术笔记分类             | P1     | Note, Notebook               |
| 实验关联 | 关联相关文章、作品、其他实验       | P1     | Relation                     |

**关键决策**：

- 实验不是单篇文章，需要支持多次运行记录
- 对比数据优先使用 JSONB 存储，关键指标可提取为独立字段便于查询
- 笔记可以是独立类型或 `Post.type=NOTE`

### 2.4 跨域功能（三大定位共享）

| 功能             | 描述                           | 优先级 | 数据模型           |
| ---------------- | ------------------------------ | ------ | ------------------ |
| 统一标签体系     | 跨文章/作品/实验的主题标签     | P0     | Tag                |
| 统一系列/集合    | 支持混合编排（文章+实验+作品） | P1     | Series, SeriesItem |
| 内容关联         | 内容之间的显式关联关系         | P1     | Relation           |
| 全文搜索         | 跨类型统一搜索                 | P1     | 搜索索引           |
| 统一 RSS/Sitemap | 所有已发布内容的聚合输出       | P1     | -                  |

---

## 3. 功能需求（传统视角）

### 3.1 内容管理

| 功能         | 描述                                | 优先级 |
| ------------ | ----------------------------------- | ------ |
| 文章 CRUD    | 创建、编辑、删除、发布文章          | P0     |
| Markdown/MDX | 支持 Markdown 写作，嵌入 React 组件 | P0     |
| 分类管理     | 文章分类（单选）                    | P0     |
| 标签管理     | 文章标签（多选）                    | P0     |
| 草稿箱       | 未发布文章管理                      | P1     |
| 草稿自动保存 | 编辑时自动保存草稿，防止内容丢失    | P1     |
| 文章系列     | 系列文章关联                        | P2     |
| 发布后修改   | 已发布文章可修改，修改后需重新审核  | P0     |

### 3.2 作品展示

| 功能     | 描述                                 | 优先级 |
| -------- | ------------------------------------ | ------ |
| 作品列表 | 展示个人项目                         | P0     |
| 作品详情 | 项目描述、技术栈、截图、链接         | P0     |
| 作品分类 | 按类型分类（Web/Mobile/CLI/Library） | P1     |

### 3.3 图片管理

| 功能     | 描述                 | 优先级 |
| -------- | -------------------- | ------ |
| 图片上传 | 支持本地上传图片     | P0     |
| 外链图片 | 支持引用外部图片 URL | P0     |
| 图片压缩 | 上传时自动压缩优化   | P1     |
| 图片裁剪 | 支持在线裁剪调整     | P1     |

### 3.4 多语言支持

| 功能       | 描述                    | 优先级 |
| ---------- | ----------------------- | ------ |
| 界面多语言 | 支持中文/英文界面切换   | P1     |
| 内容多语言 | 文章/作品支持中英文版本 | P2     |

### 3.5 用户系统

| 功能       | 描述                     | 优先级 |
| ---------- | ------------------------ | ------ |
| 管理员登录 | JWT 认证                 | P0     |
| OAuth 登录 | GitHub/Google 第三方登录 | P1     |
| 访客登录   | 访客需登录才能点赞/收藏  | P1     |

### 3.6 交互功能

| 功能      | 描述                              | 优先级 |
| --------- | --------------------------------- | ------ |
| 评论系统  | 文章评论、嵌套回复，支持 Markdown | P1     |
| 评论审核  | 评论需审核后才对访客可见          | P1     |
| 站内通知  | 评论回复时发送站内通知            | P1     |
| 全文搜索  | 跨文章/作品/实验的统一搜索        | P1     |
| 阅读统计  | 文章浏览量                        | P2     |
| 点赞/收藏 | 需登录，含防刷机制                | P2     |

### 3.7 辅助功能

| 功能     | 描述                | 优先级 |
| -------- | ------------------- | ------ |
| 关于页面 | 个人介绍            | P0     |
| RSS 订阅 | 文章 RSS Feed       | P1     |
| 站点地图 | SEO Sitemap         | P0     |
| 暗黑模式 | Dark/Light 主题切换 | P0     |

---

## 4. 非功能需求

### 4.1 性能

- 首屏加载 < 2s（LCP）
- 静态页面 SSG/ISR 生成
- 图片懒加载 + WebP 优化
- 代码分割按需加载

### 4.2 SEO

- 服务端渲染/静态生成
- Open Graph 元数据
- 动态 OG 图片生成
- 结构化数据（JSON-LD）

### 4.3 可访问性

- WCAG 2.1 AA 标准
- 键盘导航支持
- 屏幕阅读器兼容
- 高对比度模式

### 4.4 响应式

- 移动端优先设计
- 断点：sm(640) / md(768) / lg(1024) / xl(1280)

### 4.5 安全性

- JWT + HTTP-only Cookie
- CSRF 防护
- XSS 防护
- 速率限制
- 点赞/收藏防刷机制

---

## 5. 用户角色

| 角色     | 权限                                   |
| -------- | -------------------------------------- |
| 访客     | 浏览文章、作品、搜索                   |
| 登录用户 | 访客权限 + 评论、点赞、收藏、接收通知  |
| 管理员   | 全部权限：内容管理、评论审核、系统配置 |

---

## 6. 核心用例

### UC1: 访客浏览文章

1. 访客打开首页
2. 查看文章列表（支持分页）
3. 按分类/标签筛选
4. 点击进入文章详情
5. 阅读文章、查看已审核评论

### UC2: 管理员发布文章

1. 管理员登录后台
2. 进入文章编辑器
3. 使用 Markdown/MDX 撰写（自动保存草稿）
4. 上传/裁剪封面图
5. 设置分类、标签、语言版本
6. 预览并发布

### UC3: 管理员修改已发布文章

1. 管理员进入文章编辑
2. 修改内容
3. 保存后文章状态变为"待审核"
4. 审核通过后重新发布

### UC4: 全文搜索

1. 用户点击搜索图标
2. 输入关键词
3. 查看搜索结果（文章/作品/实验）
4. 按类型筛选
5. 点击进入目标内容

### UC5: 用户评论文章

1. 用户登录
2. 进入文章详情页
3. 撰写评论（支持 Markdown）
4. 提交评论
5. 评论进入待审核状态
6. 管理员审核通过后，评论可见

### UC6: 评论回复通知

1. 用户 A 评论文章
2. 用户 B 回复用户 A 的评论
3. 管理员审核通过
4. 用户 A 收到站内通知
5. 用户 A 查看通知并跳转到评论

### UC7: 访客浏览作品

1. 访客打开作品展示页
2. 查看作品列表
3. 按类型/技术栈筛选
4. 点击进入作品详情
5. 查看项目介绍、截图、Demo 链接

### UC8: 管理员添加作品

1. 管理员进入作品管理
2. 填写作品信息（标题、描述、角色、时间线）
3. 上传项目截图（支持压缩裁剪）
4. 添加技术栈标签
5. 添加 Demo/源码链接
6. 设置语言版本
7. 发布作品

### UC9: 用户点赞/收藏

1. 用户登录
2. 浏览文章/作品
3. 点击点赞/收藏按钮
4. 系统记录操作（含防刷检测）
5. 用户可在个人中心查看收藏列表

### UC10: 切换语言

1. 用户点击语言切换按钮
2. 选择中文/英文
3. 界面语言切换
4. 内容显示对应语言版本（如有）

---

## 7. 数据模型定义

### 7.1 核心内容模型

#### 统一内容基座（推荐方案）

```typescript
// Entry - 统一内容基座
Entry {
  id: string
  type: 'POST' | 'WORK' | 'EXPERIMENT' | 'NOTE'
  slug: string (unique)
  title: string
  summary?: string
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  publishedAt?: DateTime
  createdAt: DateTime
  updatedAt: DateTime
}

// Post - 文章扩展
Post {
  entryId: string (FK)
  content: string (MDX)
  coverImage?: string
  readingTime?: number
  categoryId?: string (FK)
}

// Work - 作品扩展
Work {
  entryId: string (FK)
  content: string (案例研究/详情)
  role?: string
  startAt?: DateTime
  endAt?: DateTime
  highlights: json
  featured: boolean
  order: number
}

// Experiment - 实验扩展
Experiment {
  entryId: string (FK)
  goal: string
  hypothesis?: string
  methodology: string (MDX)
  conclusion?: string
}
```

**设计理由**：

- 统一管理标签、系列、关联、搜索
- 避免跨域关联表膨胀
- 支持统一版本管理和权限控制

### 7.2 资产与元数据模型

#### 代码片段（技术分享）

```typescript
Snippet {
  id: string
  slug: string
  title: string
  language: string
  code: string
  description?: string
  tags: string[]
  createdAt: DateTime
  updatedAt: DateTime
}

SnippetVersion {
  id: string
  snippetId: string (FK)
  version: number
  code: string
  changeNote?: string
  createdAt: DateTime
}
```

#### 技术栈（作品展示）

```typescript
Tech {
  id: string
  slug: string
  name: string
  type: 'LANGUAGE' | 'FRAMEWORK' | 'TOOL' | 'SERVICE'
  homepageUrl?: string
}

WorkTech {
  workId: string (FK)
  techId: string (FK)
  level?: string
  order: number
}
```

#### 外链管理（作品展示）

```typescript
WorkLink {
  id: string
  workId: string (FK)
  type: 'DEMO' | 'SOURCE' | 'DOC' | 'BLOG' | 'VIDEO'
  label: string
  url: string
  status: 'OK' | 'BROKEN' | 'UNKNOWN'
  lastCheckedAt?: DateTime
}

WorkMedia {
  id: string
  workId: string (FK)
  type: 'IMAGE' | 'VIDEO'
  url: string
  alt?: string
  order: number
}
```

#### 实验运行数据（学习实验）

```typescript
ExperimentRun {
  id: string
  experimentId: string (FK)
  name: string
  parameters: json
  environment: json // nodeVersion, os, gitSha
  results: json
  createdAt: DateTime
}

ExperimentMetric {
  id: string
  runId: string (FK)
  key: string
  value: number
  unit?: string
}

Comparison {
  id: string
  experimentId: string (FK)
  baselineRunId: string (FK)
  runIds: string[]
  summary: string
  chartData: json
  createdAt: DateTime
}
```

### 7.3 组织与关联模型

#### 分类与标签

```typescript
Category {
  id: string
  slug: string
  name: string
  description?: string
  order: number
}

Tag {
  id: string
  slug: string
  name: string
  description?: string
}

EntryTag {
  entryId: string (FK)
  tagId: string (FK)
}
```

#### 系列与集合

```typescript
Series {
  id: string
  slug: string
  title: string
  description?: string
  coverImage?: string
  createdAt: DateTime
}

SeriesItem {
  id: string
  seriesId: string (FK)
  entryId: string (FK)
  order: number
  titleOverride?: string
  createdAt: DateTime
}
```

#### 内容关联

```typescript
Relation {
  id: string
  fromEntryId: string (FK)
  toEntryId: string (FK)
  type: 'RELATED' | 'PREREQUISITE' | 'FOLLOWUP' | 'REFERENCE'
  note?: string
}
```

### 7.4 版本管理

```typescript
EntryRevision {
  id: string
  entryId: string (FK)
  revisionNo: number
  content: string
  summary?: string
  meta: json
  createdAt: DateTime
}

// Entry 扩展字段
Entry {
  ...
  currentRevisionId?: string (FK)
  publishedRevisionId?: string (FK)
}
```

---

## 8. 业务决策记录

### BD-001: 统一内容基座 Entry

**状态**：已采纳
**日期**：2026-01

**问题**：
三类内容（文章/作品/实验）需要共享标签、系列、关联、搜索等功能，独立表会导致关联表膨胀。

**决策**：
采用统一内容基座 `Entry` + 类型特定扩展表的方案。

**后果**：

- ✅ 统一管理跨域功能
- ✅ 简化搜索和关联
- ✅ 支持混合系列/集合
- ❌ 初期建模复杂度增加

### BD-002: MDX 内容策略

**状态**：已采纳
**日期**：2026-01

**问题**：
MDX 运行时编译存在性能和安全风险。

**决策**：

- 发布时编译 MDX 并缓存编译产物
- 仅允许白名单组件（CodeBlock, Callout, DemoCard）
- 禁止任意 JS 执行

**后果**：

- ✅ 提升性能和安全性
- ✅ 编译错误在发布前暴露
- ❌ 需要实现编译缓存机制

### BD-003: 技术栈标签化

**状态**：已采纳
**日期**：2026-01

**问题**：
使用 `String[]` 存储技术栈导致同义词、分类、统计困难。

**决策**：
将技术栈作为独立实体 `Tech` 表，通过 `WorkTech` 关联。

**后果**：

- ✅ 支持技术栈分类和统计
- ✅ 避免同义词问题
- ✅ 便于构建技术图谱
- ❌ 增加一次性数据初始化工作

### BD-004: 身份模型

**状态**：已采纳
**日期**：2026-01

**问题**：
需要平衡用户系统复杂度与互动功能需求。

**决策**：

- 三种角色：访客（匿名）、登录用户、管理员
- 点赞/收藏/评论需要登录
- 评论需审核后可见
- P0：管理员账号（不开放注册）
- P1：OAuth 登录（GitHub/Google）供访客使用

**后果**：

- ✅ 互动功能有身份追踪
- ✅ 支持防刷机制
- ✅ 评论质量可控
- ❌ 增加用户系统复杂度

### BD-005: 全文搜索范围

**状态**：已采纳
**日期**：2026-01

**问题**：
搜索是否应覆盖所有内容类型。

**决策**：

- 全文搜索覆盖文章、作品、实验
- 支持按类型筛选结果
- 搜索结果按相关性 + 时间排序

**后果**：

- ✅ 统一搜索体验
- ✅ 方便用户发现内容
- ❌ 搜索索引维护成本增加

### BD-006: 内容审核机制

**状态**：已采纳
**日期**：2026-01

**问题**：
已发布文章修改后如何保证内容质量。

**决策**：

- 已发布文章可修改
- 修改后状态变为"待审核"
- 审核通过后重新发布
- 评论需审核后对访客可见

**后果**：

- ✅ 保证内容质量
- ✅ 防止恶意修改
- ❌ 增加管理员工作量

---

## 9. 里程碑规划

| 阶段 | 内容                                                  |
| ---- | ----------------------------------------------------- |
| M1   | 项目初始化、基础架构、统一内容基座 Entry              |
| M2   | 技术分享模块（文章 CRUD + 草稿自动保存 + 代码片段库） |
| M3   | 作品展示模块（作品管理 + 技术栈标签化）               |
| M4   | 图片管理（上传、压缩、裁剪）                          |
| M5   | 认证系统（管理员 + OAuth 登录）                       |
| M6   | 评论系统（Markdown 支持、审核机制、站内通知）         |
| M7   | 互动功能（点赞、收藏、防刷机制）                      |
| M8   | 全文搜索（跨类型搜索）                                |
| M9   | 多语言支持（中英文界面与内容）                        |
| M10  | 学习实验模块（实验记录 + 运行数据）                   |
| M11  | RSS/Sitemap、SEO 优化                                 |
| M12  | 部署上线                                              |
