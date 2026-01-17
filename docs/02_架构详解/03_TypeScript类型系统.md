# TypeScript 详解

> 面向初级开发者的 TypeScript 教程，遵循二八原则

## 官方资源

| 资源 | 链接 |
|------|------|
| 官方文档 | [typescriptlang.org/docs](https://www.typescriptlang.org/docs/) |
| 中文文档 | [ts.nodejs.cn](https://ts.nodejs.cn/) |
| Playground | [typescriptlang.org/play](https://www.typescriptlang.org/play) |
| TSConfig 参考 | [typescriptlang.org/tsconfig](https://www.typescriptlang.org/tsconfig) |
| 类型工具 | [typescriptlang.org/docs/handbook/utility-types.html](https://www.typescriptlang.org/docs/handbook/utility-types.html) |
| GitHub | [github.com/microsoft/TypeScript](https://github.com/microsoft/TypeScript) |

## 1. TypeScript 是什么

### 一句话解释
TypeScript 是 **JavaScript 的超集**，添加了**类型系统**，让代码更安全、更易维护。

### 类比理解
- **JavaScript**：自由发挥的草稿纸，写什么都行
- **TypeScript**：带格子的作业本，有规范但更整齐

### 为什么要用 TypeScript

```javascript
// JavaScript：运行时才发现错误
function add(a, b) {
  return a + b;
}
add("1", 2);  // 返回 "12"，不是 3！运行时才发现问题

// TypeScript：写代码时就发现错误
function add(a: number, b: number): number {
  return a + b;
}
add("1", 2);  // ❌ 编辑器立即报错：类型"string"不能赋值给"number"
```

### 核心价值
| 问题 | TypeScript 解决方案 |
|------|-------------------|
| 运行时类型错误 | 编译时捕获 |
| 函数参数不清楚 | 类型注解说明 |
| 重构担心改错 | 类型检查保护 |
| 编辑器补全差 | 完美的智能提示 |

---

## 2. 基础类型（20% 核心知识）

### 2.1 原始类型

```typescript
// 字符串
let name: string = "张三";

// 数字（整数和浮点数都是 number）
let age: number = 25;
let price: number = 99.99;

// 布尔值
let isActive: boolean = true;

// 空值
let nothing: null = null;
let notDefined: undefined = undefined;
```

### 2.2 数组

```typescript
// 方式一：类型[]
let numbers: number[] = [1, 2, 3];
let names: string[] = ["张三", "李四"];

// 方式二：Array<类型>
let numbers2: Array<number> = [1, 2, 3];

// 混合类型数组
let mixed: (string | number)[] = [1, "two", 3];
```

### 2.3 对象

```typescript
// 内联类型
let user: { name: string; age: number } = {
  name: "张三",
  age: 25
};

// 可选属性
let config: { host: string; port?: number } = {
  host: "localhost"
  // port 可以不写
};
```

### 2.4 函数

```typescript
// 函数参数和返回值类型
function greet(name: string): string {
  return `Hello, ${name}!`;
}

// 箭头函数
const add = (a: number, b: number): number => a + b;

// 无返回值
function log(message: string): void {
  console.log(message);
}

// 可选参数
function greet2(name: string, greeting?: string): string {
  return `${greeting || "Hello"}, ${name}!`;
}

// 默认参数
function greet3(name: string, greeting: string = "Hello"): string {
  return `${greeting}, ${name}!`;
}
```

---

## 3. 接口与类型别名

### 3.1 接口（interface）

```typescript
// 定义对象的形状
interface User {
  id: string;
  name: string;
  email: string;
  age?: number;        // 可选属性
  readonly createdAt: string;  // 只读属性
}

// 使用接口
const user: User = {
  id: "1",
  name: "张三",
  email: "zhangsan@example.com",
  createdAt: "2024-01-01"
};

// user.createdAt = "2024-02-01";  // ❌ 错误：只读属性
```

### 3.2 类型别名（type）

```typescript
// 基础类型别名
type ID = string | number;

// 对象类型别名
type Point = {
  x: number;
  y: number;
};

// 函数类型别名
type Formatter = (input: string) => string;

// 使用
let userId: ID = "abc123";
let point: Point = { x: 10, y: 20 };
const uppercase: Formatter = (s) => s.toUpperCase();
```

### 3.3 interface vs type

| 场景 | 推荐 | 原因 |
|------|------|------|
| 定义对象结构 | interface | 可扩展、可合并 |
| 联合类型 | type | interface 不支持 |
| 函数类型 | type | 更简洁 |
| API 响应 | interface | 更语义化 |

```typescript
// interface 可以扩展
interface Animal {
  name: string;
}
interface Dog extends Animal {
  breed: string;
}

// interface 可以合并（同名自动合并）
interface User {
  name: string;
}
interface User {
  age: number;
}
// User 现在有 name 和 age

// type 支持联合类型
type Status = "pending" | "success" | "error";
type StringOrNumber = string | number;
```

---

## 4. 联合类型与类型收窄

### 4.1 联合类型

```typescript
// 变量可以是多种类型之一
let id: string | number;
id = "abc";  // ✅
id = 123;    // ✅
id = true;   // ❌ 错误

// 常用于函数参数
function printId(id: string | number) {
  console.log(`ID: ${id}`);
}
```

### 4.2 类型收窄（Type Narrowing）

```typescript
function printId(id: string | number) {
  // 使用 typeof 收窄类型
  if (typeof id === "string") {
    // 这里 id 是 string
    console.log(id.toUpperCase());
  } else {
    // 这里 id 是 number
    console.log(id.toFixed(2));
  }
}

// 使用 in 操作符
interface Bird {
  fly(): void;
}
interface Fish {
  swim(): void;
}

function move(animal: Bird | Fish) {
  if ("fly" in animal) {
    animal.fly();
  } else {
    animal.swim();
  }
}
```

---

## 5. 泛型入门

### 5.1 什么是泛型

泛型就是**类型的参数**，让代码更灵活：

```typescript
// 没有泛型：需要为每种类型写一个函数
function identityString(arg: string): string {
  return arg;
}
function identityNumber(arg: number): number {
  return arg;
}

// 使用泛型：一个函数搞定
function identity<T>(arg: T): T {
  return arg;
}

identity<string>("hello");  // 返回 string
identity<number>(42);       // 返回 number
identity(true);             // 自动推断为 boolean
```

### 5.2 常见泛型用法

```typescript
// 泛型接口
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

// 使用
const userResponse: ApiResponse<User> = {
  data: { id: "1", name: "张三", email: "a@b.com", createdAt: "2024-01-01" },
  status: 200,
  message: "success"
};

// 泛型数组
function firstElement<T>(arr: T[]): T | undefined {
  return arr[0];
}

firstElement([1, 2, 3]);        // 返回 number
firstElement(["a", "b", "c"]);  // 返回 string
```

### 5.3 项目中的泛型示例

来自 `packages/shared/src/types.ts`：

```typescript
// API 响应泛型
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

// 分页响应泛型
export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// 使用
type PostListResponse = PaginatedResponse<PostListItem>;
// 等同于：
// {
//   data: PostListItem[];
//   meta: { total: number; page: number; ... }
// }
```

---

## 6. 项目 tsconfig 配置详解

### 6.1 packages/typescript-config/base.json

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  // 提供 JSON 自动补全

  "compilerOptions": {
    "strict": true,
    // 启用所有严格检查（强烈推荐）

    "strictNullChecks": true,
    // null 和 undefined 必须显式处理

    "esModuleInterop": true,
    // 允许 import React from 'react' 语法

    "skipLibCheck": true,
    // 跳过 node_modules 类型检查，加快编译

    "forceConsistentCasingInFileNames": true,
    // 文件名大小写必须一致

    "moduleResolution": "bundler",
    // 使用现代打包工具的模块解析方式

    "resolveJsonModule": true,
    // 允许 import json 文件

    "isolatedModules": true,
    // 确保每个文件可以单独编译

    "noEmit": true,
    // 不输出编译结果（由打包工具处理）

    "declaration": true,
    // 生成 .d.ts 类型声明文件

    "declarationMap": true,
    // 生成声明文件的 source map

    "incremental": true
    // 增量编译，加快速度
  }
}
```

### 6.2 packages/typescript-config/nextjs.json

```json
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "extends": "./base.json",
  // 继承 base.json 的配置

  "compilerOptions": {
    "lib": ["dom", "dom.iterable", "ES2022"],
    // 包含浏览器 API 类型

    "target": "ES2022",
    // 编译目标

    "module": "ESNext",
    // 使用 ES 模块

    "jsx": "preserve",
    // 保留 JSX，由 Next.js 处理

    "plugins": [{ "name": "next" }],
    // Next.js 类型插件

    "allowJs": true,
    // 允许 .js 文件

    "noEmit": true
    // 不输出，由 Next.js 处理
  }
}
```

### 6.3 常用配置速查

| 配置 | 作用 | 推荐值 |
|------|------|--------|
| `strict` | 启用严格模式 | `true` |
| `noImplicitAny` | 禁止隐式 any | `true` |
| `strictNullChecks` | 严格空值检查 | `true` |
| `noUnusedLocals` | 禁止未使用变量 | `true` |
| `noUnusedParameters` | 禁止未使用参数 | `true` |
| `baseUrl` | 模块解析基础路径 | `"."` |
| `paths` | 路径别名 | `{"@/*": ["./src/*"]}` |

---

## 7. 项目中的类型定义解读

### packages/shared/src/types.ts

```typescript
// 用户类型
export interface User {
  id: string;
  email: string;
  username: string;
  role: 'USER' | 'ADMIN';  // 字面量类型
  avatar?: string;          // 可选
  bio?: string;
  createdAt: string;
  updatedAt: string;
}

// 文章类型
export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  summary?: string;
  coverImage?: string;
  published: boolean;
  featured: boolean;
  views: number;
  author: User;            // 嵌套类型
  authorId: string;
  category?: Category;     // 可选嵌套
  categoryId?: string;
  tags: Tag[];             // 数组类型
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

// 文章列表项（精简版）
export interface PostListItem {
  id: string;
  title: string;
  slug: string;
  summary?: string;
  coverImage?: string;
  published: boolean;
  featured: boolean;
  views: number;
  author: Pick<User, 'id' | 'username' | 'avatar'>;  // 只取部分属性
  category?: Pick<Category, 'id' | 'name' | 'slug'>;
  tags: Pick<Tag, 'id' | 'name' | 'slug'>[];
  createdAt: string;
  publishedAt?: string;
}
```

### 实用工具类型

```typescript
// Pick：选取部分属性
type UserBasic = Pick<User, 'id' | 'username' | 'avatar'>;
// 等同于 { id: string; username: string; avatar?: string }

// Omit：排除部分属性
type UserWithoutPassword = Omit<User, 'passwordHash'>;

// Partial：所有属性变可选
type UpdateUserDto = Partial<User>;

// Required：所有属性变必选
type CompleteUser = Required<User>;

// Record：创建键值对类型
type UserRoles = Record<string, 'USER' | 'ADMIN'>;
// { [key: string]: 'USER' | 'ADMIN' }
```

---

## 8. 常见陷阱与最佳实践

### ❌ 陷阱 1：滥用 any

```typescript
// 错误：any 等于放弃类型检查
function process(data: any) {
  return data.foo.bar.baz;  // 运行时可能爆炸
}

// 正确：使用 unknown 或具体类型
function process(data: unknown) {
  if (typeof data === 'object' && data !== null && 'foo' in data) {
    // 安全访问
  }
}
```

### ❌ 陷阱 2：忽略 null 检查

```typescript
// 错误：可能是 undefined
function getLength(str?: string) {
  return str.length;  // ❌ 对象可能为"undefined"
}

// 正确：先检查
function getLength(str?: string) {
  return str?.length ?? 0;  // 可选链 + 空值合并
}
```

### ❌ 陷阱 3：类型断言滥用

```typescript
// 错误：强制断言可能出错
const user = {} as User;
console.log(user.name.toUpperCase());  // 运行时错误！

// 正确：提供完整数据或使用 Partial
const user: Partial<User> = {};
console.log(user.name?.toUpperCase());
```

### ✅ 最佳实践

1. **开启 strict 模式**
   ```json
   { "compilerOptions": { "strict": true } }
   ```

2. **优先使用 interface 定义对象**
   ```typescript
   interface User { ... }  // ✅
   type User = { ... }     // 也可以，但 interface 更推荐
   ```

3. **善用类型推断**
   ```typescript
   // 不必要的类型注解
   const name: string = "张三";  // ❌ 冗余

   // 让 TS 推断
   const name = "张三";  // ✅ 自动推断为 string
   ```

4. **使用工具类型**
   ```typescript
   // 而不是手写重复的类型
   type UpdateDto = Partial<CreateDto>;
   ```

---

## 9. 总结

### 记住这 5 点就够了

1. **基础类型**：`string`, `number`, `boolean`, `array`, `object`
2. **定义对象用 interface**：`interface User { name: string }`
3. **联合类型**：`string | number`
4. **泛型**：`ApiResponse<User>`
5. **严格模式**：开启 `strict: true`

### TypeScript 的核心价值

```
JavaScript：运行时发现错误 → 用户受影响
TypeScript：编写时发现错误 → 开发者修复
```

**一句话总结**：TypeScript 让你在代码运行前就发现大部分错误。
