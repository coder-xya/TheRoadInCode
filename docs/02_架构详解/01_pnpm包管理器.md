# pnpm 包管理器详解

> 面向初级开发者的 pnpm 教程，遵循二八原则

## 官方资源

| 资源 | 链接 |
|------|------|
| 官方文档 | [pnpm.io](https://pnpm.io/) |
| 中文文档 | [pnpm.io/zh](https://pnpm.io/zh/) |
| GitHub | [github.com/pnpm/pnpm](https://github.com/pnpm/pnpm) |
| CLI 命令参考 | [pnpm.io/cli/add](https://pnpm.io/cli/add) |
| Workspaces | [pnpm.io/workspaces](https://pnpm.io/workspaces) |

## 1. pnpm 是什么

### 一句话解释
pnpm 是一个**快速、节省磁盘空间**的 Node.js 包管理器，是 npm/yarn 的替代品。

### 类比理解
想象你有 10 个项目都用了 lodash：
- **npm/yarn**：每个项目都复制一份 lodash（占用 10 份空间）
- **pnpm**：只存一份 lodash，10 个项目共享（只占 1 份空间）

### 核心优势
| 特性 | npm | yarn | pnpm |
|------|-----|------|------|
| 安装速度 | 慢 | 中等 | **最快** |
| 磁盘占用 | 大 | 大 | **最小** |
| 幽灵依赖 | 有 | 有 | **无** |
| Monorepo 支持 | 差 | 中等 | **原生支持** |

---

## 2. 核心概念（20% 核心知识）

### 2.1 硬链接与符号链接

pnpm 的魔法来自于文件系统的链接：

```
全局存储 (~/.pnpm-store)
    └── lodash@4.17.21
           ↑ 硬链接
项目A/node_modules/.pnpm/lodash@4.17.21
项目B/node_modules/.pnpm/lodash@4.17.21
```

**你只需知道**：pnpm 不复制文件，而是"指向"同一份文件。

### 2.2 node_modules 结构

pnpm 的 node_modules 结构与 npm 不同：

```
node_modules/
├── .pnpm/                    # 真正存放包的地方
│   ├── lodash@4.17.21/
│   └── express@4.18.2/
├── lodash -> .pnpm/lodash@4.17.21/node_modules/lodash
└── express -> .pnpm/express@4.18.2/node_modules/express
```

**好处**：你只能访问 package.json 中声明的依赖，避免"幽灵依赖"。

### 2.3 什么是幽灵依赖？

```javascript
// ❌ npm/yarn 允许这样（但你没在 package.json 声明 ms）
import ms from 'ms'; // ms 是 express 的依赖

// ✅ pnpm 会报错，强制你显式声明
```

---

## 3. 常用命令速查（80% 场景覆盖）

### 3.1 基础命令

```bash
# 安装所有依赖（等同于 npm install）
pnpm install
pnpm i              # 简写

# 添加依赖
pnpm add lodash           # 生产依赖
pnpm add -D typescript    # 开发依赖
pnpm add -g pnpm          # 全局安装

# 删除依赖
pnpm remove lodash
pnpm rm lodash      # 简写

# 更新依赖
pnpm update         # 更新所有
pnpm update lodash  # 更新指定包

# 运行脚本
pnpm run dev
pnpm dev            # run 可省略
pnpm test
```

### 3.2 Monorepo 命令（本项目使用）

```bash
# 在指定包中运行命令
pnpm --filter web dev           # 只启动前端
pnpm --filter api dev           # 只启动后端
pnpm --filter @repo/shared build  # 构建 shared 包

# 在所有包中运行命令
pnpm -r build                   # 递归构建所有包

# 安装依赖到指定包
pnpm --filter web add axios
```

### 3.3 实用命令

```bash
# 查看为什么安装了某个包
pnpm why lodash

# 清理缓存
pnpm store prune

# 查看全局存储位置
pnpm store path
```

---

## 4. 项目配置文件详解

### 4.1 pnpm-workspace.yaml

```yaml
# 定义 Monorepo 的包位置
packages:
  - "apps/*"        # apps 目录下的所有文件夹都是包
  - "packages/*"    # packages 目录下的所有文件夹都是包
```

**作用**：告诉 pnpm 哪些目录是工作区包。

### 4.2 package.json 中的 packageManager

```json
{
  "packageManager": "pnpm@9.15.0"
}
```

**作用**：
- 锁定 pnpm 版本，团队使用统一版本
- 配合 `corepack enable` 自动安装正确版本

### 4.3 workspace 协议

```json
{
  "dependencies": {
    "@repo/shared": "workspace:*"
  }
}
```

**解释**：
- `workspace:*` 表示使用本地工作区的包
- 发布时会自动替换为实际版本号

---

## 5. 常见场景示例

### 场景 1：初始化新项目

```bash
# 创建项目
mkdir my-project && cd my-project

# 初始化
pnpm init

# 安装依赖
pnpm add express
pnpm add -D typescript @types/node
```

### 场景 2：克隆项目后安装依赖

```bash
git clone <repo>
cd <repo>
pnpm install    # 自动读取 pnpm-lock.yaml
```

### 场景 3：Monorepo 开发（本项目）

```bash
# 安装所有工作区依赖
pnpm install

# 启动前端开发
pnpm --filter web dev

# 启动后端开发
pnpm --filter api dev

# 同时启动（使用 turbo）
pnpm dev
```

### 场景 4：添加共享依赖

```bash
# 在根目录安装（所有包共享）
pnpm add -D prettier -w

# -w 表示安装到 workspace root
```

---

## 6. 常见陷阱与最佳实践

### ❌ 陷阱 1：忘记 -w 安装根依赖

```bash
# 错误：在根目录直接安装会报错
pnpm add prettier
# ERR_PNPM_ADDING_TO_ROOT

# 正确：加上 -w 标志
pnpm add -D prettier -w
```

### ❌ 陷阱 2：幽灵依赖报错

```javascript
// 错误：使用了未声明的依赖
import something from 'some-transitive-dep';
// Error: Cannot find module 'some-transitive-dep'

// 解决：显式安装
pnpm add some-transitive-dep
```

### ❌ 陷阱 3：lock 文件冲突

```bash
# 错误：混用 npm 和 pnpm
# 会产生 package-lock.json 和 pnpm-lock.yaml 冲突

# 解决：只用 pnpm，删除其他 lock 文件
rm package-lock.json yarn.lock
```

### ✅ 最佳实践

1. **始终提交 pnpm-lock.yaml**
   ```bash
   git add pnpm-lock.yaml
   ```

2. **使用 corepack 管理版本**
   ```bash
   corepack enable
   corepack prepare pnpm@9.15.0 --activate
   ```

3. **CI 中使用 --frozen-lockfile**
   ```bash
   pnpm install --frozen-lockfile
   ```

4. **定期清理存储**
   ```bash
   pnpm store prune
   ```

---

## 7. pnpm vs npm vs yarn 命令对照

| 操作 | npm | yarn | pnpm |
|------|-----|------|------|
| 安装依赖 | `npm install` | `yarn` | `pnpm install` |
| 添加包 | `npm install pkg` | `yarn add pkg` | `pnpm add pkg` |
| 添加开发依赖 | `npm install -D pkg` | `yarn add -D pkg` | `pnpm add -D pkg` |
| 全局安装 | `npm install -g pkg` | `yarn global add pkg` | `pnpm add -g pkg` |
| 删除包 | `npm uninstall pkg` | `yarn remove pkg` | `pnpm remove pkg` |
| 运行脚本 | `npm run dev` | `yarn dev` | `pnpm dev` |
| 更新包 | `npm update` | `yarn upgrade` | `pnpm update` |

---

## 8. 总结

### 记住这 5 个命令就够了

```bash
pnpm install              # 安装依赖
pnpm add <pkg>            # 添加依赖
pnpm add -D <pkg>         # 添加开发依赖
pnpm --filter <pkg> <cmd> # Monorepo 中指定包运行命令
pnpm dev                  # 运行开发脚本
```

### pnpm 的核心价值

1. **快**：硬链接避免重复下载
2. **省**：全局存储节省磁盘
3. **严**：禁止幽灵依赖
4. **Monorepo 友好**：原生 workspace 支持
