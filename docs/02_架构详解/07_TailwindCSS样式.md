# TailwindCSS 详解

> 面向初级开发者的 TailwindCSS 教程，遵循二八原则

## 官方资源

| 资源 | 链接 |
|------|------|
| 官方文档 | [tailwindcss.com/docs](https://tailwindcss.com/docs) |
| 中文文档 | [tailwindcss.cn](https://www.tailwindcss.cn/) |
| 配置参考 | [tailwindcss.com/docs/configuration](https://tailwindcss.com/docs/configuration) |
| 类名搜索 | [tailwindcss.com/docs/installation](https://tailwindcss.com/docs) (使用搜索功能) |
| Playground | [play.tailwindcss.com](https://play.tailwindcss.com/) |
| GitHub | [github.com/tailwindlabs/tailwindcss](https://github.com/tailwindlabs/tailwindcss) |
| 组件示例 | [tailwindui.com](https://tailwindui.com/) |

## 1. TailwindCSS 是什么

### 一句话解释
TailwindCSS 是一个**原子化 CSS 框架**，让你直接在 HTML 中用类名写样式。

### 与传统 CSS 的区别

| 方式 | 传统 CSS | TailwindCSS |
|------|----------|-------------|
| 写法 | 写 CSS 文件，起类名 | 直接在元素上加类名 |
| 文件 | 多个 CSS 文件 | 几乎不需要写 CSS |
| 命名 | 要想类名（最难的事） | 不需要起名 |
| 复用 | 复制粘贴或抽组件 | 类名就是复用 |
| 体积 | 容易膨胀 | 自动裁剪未使用的 |

### 对比示例

```html
<!-- 传统 CSS -->
<style>
.card {
  background-color: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
</style>
<div class="card">内容</div>

<!-- TailwindCSS -->
<div class="bg-white rounded-lg p-4 shadow">内容</div>
```

### 类比理解
- **传统 CSS**：去餐厅点菜，要知道菜名
- **TailwindCSS**：自助餐，看到什么拿什么

---

## 2. 核心理念：Utility-First

### 2.1 什么是 Utility-First

每个类名只做**一件事**：

```html
<div class="
  flex           /* display: flex */
  items-center   /* align-items: center */
  justify-between /* justify-content: space-between */
  p-4            /* padding: 1rem */
  bg-white       /* background-color: white */
  rounded-lg     /* border-radius: 0.5rem */
  shadow-md      /* box-shadow: ... */
">
```

### 2.2 为什么这样设计

1. **不用想类名**：最消耗脑力的事没了
2. **改样式不怕影响其他地方**：每个元素独立
3. **看代码就知道样式**：不用跳到 CSS 文件
4. **自动去除未使用的样式**：生产包很小

---

## 3. 常用类名速查（20% 覆盖 80% 场景）

### 3.1 布局

```html
<!-- Flexbox -->
<div class="flex">                    <!-- display: flex -->
<div class="flex-col">                <!-- flex-direction: column -->
<div class="items-center">            <!-- align-items: center -->
<div class="justify-center">          <!-- justify-content: center -->
<div class="justify-between">         <!-- justify-content: space-between -->
<div class="gap-4">                   <!-- gap: 1rem -->
<div class="flex-1">                  <!-- flex: 1 -->
<div class="flex-shrink-0">           <!-- flex-shrink: 0 -->

<!-- Grid -->
<div class="grid">                    <!-- display: grid -->
<div class="grid-cols-3">             <!-- grid-template-columns: repeat(3, 1fr) -->
<div class="col-span-2">              <!-- grid-column: span 2 -->

<!-- 定位 -->
<div class="relative">                <!-- position: relative -->
<div class="absolute">                <!-- position: absolute -->
<div class="fixed">                   <!-- position: fixed -->
<div class="top-0 left-0">            <!-- top: 0; left: 0 -->
<div class="inset-0">                 <!-- top/right/bottom/left: 0 -->
```

### 3.2 间距

```html
<!-- Padding（内边距） -->
<div class="p-4">     <!-- padding: 1rem (16px) -->
<div class="px-4">    <!-- padding-left/right: 1rem -->
<div class="py-2">    <!-- padding-top/bottom: 0.5rem -->
<div class="pt-4">    <!-- padding-top: 1rem -->
<div class="pl-2">    <!-- padding-left: 0.5rem -->

<!-- Margin（外边距） -->
<div class="m-4">     <!-- margin: 1rem -->
<div class="mx-auto"> <!-- margin-left/right: auto（居中） -->
<div class="mt-8">    <!-- margin-top: 2rem -->
<div class="-mt-4">   <!-- margin-top: -1rem（负值） -->

<!-- 间距数值对照 -->
<!-- 0 = 0px, 1 = 4px, 2 = 8px, 4 = 16px, 8 = 32px, 16 = 64px -->
```

### 3.3 尺寸

```html
<!-- 宽度 -->
<div class="w-full">      <!-- width: 100% -->
<div class="w-1/2">       <!-- width: 50% -->
<div class="w-64">        <!-- width: 16rem (256px) -->
<div class="w-screen">    <!-- width: 100vw -->
<div class="max-w-md">    <!-- max-width: 28rem -->
<div class="min-w-0">     <!-- min-width: 0 -->

<!-- 高度 -->
<div class="h-full">      <!-- height: 100% -->
<div class="h-screen">    <!-- height: 100vh -->
<div class="min-h-screen"><!-- min-height: 100vh -->
```

### 3.4 颜色

```html
<!-- 文字颜色 -->
<p class="text-black">        <!-- color: black -->
<p class="text-white">        <!-- color: white -->
<p class="text-gray-500">     <!-- color: #6b7280 -->
<p class="text-blue-600">     <!-- color: #2563eb -->
<p class="text-red-500">      <!-- color: #ef4444 -->

<!-- 背景颜色 -->
<div class="bg-white">        <!-- background-color: white -->
<div class="bg-gray-100">     <!-- 浅灰背景 -->
<div class="bg-blue-500">     <!-- 蓝色背景 -->
<div class="bg-transparent">  <!-- 透明 -->

<!-- 边框颜色 -->
<div class="border border-gray-200">
```

### 3.5 文字

```html
<!-- 字号 -->
<p class="text-xs">       <!-- 12px -->
<p class="text-sm">       <!-- 14px -->
<p class="text-base">     <!-- 16px -->
<p class="text-lg">       <!-- 18px -->
<p class="text-xl">       <!-- 20px -->
<p class="text-2xl">      <!-- 24px -->
<p class="text-4xl">      <!-- 36px -->

<!-- 字重 -->
<p class="font-normal">   <!-- 400 -->
<p class="font-medium">   <!-- 500 -->
<p class="font-semibold"> <!-- 600 -->
<p class="font-bold">     <!-- 700 -->

<!-- 对齐 -->
<p class="text-left">
<p class="text-center">
<p class="text-right">

<!-- 行高 -->
<p class="leading-tight">  <!-- 1.25 -->
<p class="leading-normal"> <!-- 1.5 -->
<p class="leading-relaxed"><!-- 1.625 -->
```

### 3.6 边框与圆角

```html
<!-- 边框 -->
<div class="border">          <!-- 1px solid -->
<div class="border-2">        <!-- 2px solid -->
<div class="border-t">        <!-- 只有上边框 -->
<div class="border-gray-200"> <!-- 边框颜色 -->

<!-- 圆角 -->
<div class="rounded">         <!-- 4px -->
<div class="rounded-md">      <!-- 6px -->
<div class="rounded-lg">      <!-- 8px -->
<div class="rounded-xl">      <!-- 12px -->
<div class="rounded-full">    <!-- 完全圆形 -->
```

### 3.7 阴影与透明度

```html
<!-- 阴影 -->
<div class="shadow">          <!-- 小阴影 -->
<div class="shadow-md">       <!-- 中阴影 -->
<div class="shadow-lg">       <!-- 大阴影 -->
<div class="shadow-none">     <!-- 无阴影 -->

<!-- 透明度 -->
<div class="opacity-50">      <!-- 50% 透明 -->
<div class="bg-black/50">     <!-- 背景色 50% 透明 -->
```

---

## 4. 响应式设计

### 4.1 断点前缀

```html
<!-- 默认（移动端优先） -->
<div class="text-sm">

<!-- sm: 640px 以上 -->
<div class="sm:text-base">

<!-- md: 768px 以上 -->
<div class="md:text-lg">

<!-- lg: 1024px 以上 -->
<div class="lg:text-xl">

<!-- xl: 1280px 以上 -->
<div class="xl:text-2xl">

<!-- 2xl: 1536px 以上 -->
<div class="2xl:text-3xl">
```

### 4.2 实际例子

```html
<!-- 移动端单列，平板双列，桌面三列 -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <div>卡片 1</div>
  <div>卡片 2</div>
  <div>卡片 3</div>
</div>

<!-- 移动端隐藏，桌面显示 -->
<div class="hidden lg:block">
  只在大屏幕显示
</div>

<!-- 移动端显示，桌面隐藏 -->
<div class="block lg:hidden">
  只在小屏幕显示
</div>
```

---

## 5. 状态变体

### 5.1 悬停与焦点

```html
<!-- 悬停 -->
<button class="bg-blue-500 hover:bg-blue-600">
  鼠标悬停变深
</button>

<!-- 焦点 -->
<input class="border focus:border-blue-500 focus:ring-2">

<!-- 激活 -->
<button class="bg-blue-500 active:bg-blue-700">
  点击时变更深
</button>

<!-- 禁用 -->
<button class="disabled:opacity-50 disabled:cursor-not-allowed">
```

### 5.2 暗黑模式

```html
<!-- 亮色/暗色自适应 -->
<div class="bg-white dark:bg-gray-900">
  <p class="text-black dark:text-white">
    自动适应系统主题
  </p>
</div>
```

### 5.3 组合状态

```html
<!-- 暗色模式下的悬停 -->
<button class="bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700">
  按钮
</button>
```

---

## 6. 项目配置文件详解

### 6.1 tailwind.config.ts

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  // 暗黑模式策略
  darkMode: 'class',
  // 'class': 通过 <html class="dark"> 控制
  // 'media': 跟随系统设置

  // 扫描哪些文件查找类名
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],

  theme: {
    extend: {
      // 扩展默认主题
      fontFamily: {
        sans: ['var(--font-geist-sans)'],
        mono: ['var(--font-geist-mono)'],
      },

      // 可以添加自定义颜色
      colors: {
        brand: {
          50: '#f0f9ff',
          500: '#0ea5e9',
          900: '#0c4a6e',
        },
      },

      // 自定义间距
      spacing: {
        '18': '4.5rem',
      },
    },
  },

  plugins: [
    // 可以添加官方插件
    // require('@tailwindcss/typography'),
    // require('@tailwindcss/forms'),
  ],
};

export default config;
```

### 6.2 postcss.config.mjs

```javascript
export default {
  plugins: {
    tailwindcss: {},   // 处理 Tailwind 类名
    autoprefixer: {},  // 自动添加浏览器前缀
  },
};
```

### 6.3 globals.css

```css
/* 引入 Tailwind 基础层 */
@tailwind base;
/* 重置默认样式 */

@tailwind components;
/* 组件类（如 .container） */

@tailwind utilities;
/* 工具类（如 .flex, .p-4） */

/* 自定义 CSS 变量 */
:root {
  --background: #ffffff;
  --foreground: #171717;
}

@media (prefers-color-scheme: dark) {
  :root {
    --background: #0a0a0a;
    --foreground: #ededed;
  }
}

/* 使用变量 */
body {
  color: var(--foreground);
  background: var(--background);
}
```

---

## 7. 暗黑模式实现

### 7.1 配置

```typescript
// tailwind.config.ts
const config = {
  darkMode: 'class',  // 使用 class 策略
  // ...
};
```

### 7.2 使用 next-themes（推荐）

```tsx
// app/providers.tsx
'use client';
import { ThemeProvider } from 'next-themes';

export function Providers({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  );
}

// app/layout.tsx
import { Providers } from './providers';

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
```

### 7.3 主题切换按钮

```tsx
'use client';
import { useTheme } from 'next-themes';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
      className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800"
    >
      {theme === 'dark' ? '🌞' : '🌙'}
    </button>
  );
}
```

---

## 8. 常见陷阱与最佳实践

### ❌ 陷阱 1：动态类名不生效

```tsx
// 错误：动态拼接类名
const color = 'red';
<div className={`text-${color}-500`}>  // ❌ 不生效！

// 原因：Tailwind 在构建时扫描，看不到完整类名

// 正确：使用完整类名
const colorClasses = {
  red: 'text-red-500',
  blue: 'text-blue-500',
};
<div className={colorClasses[color]}>  // ✅
```

### ❌ 陷阱 2：类名太长难以阅读

```tsx
// 问题：一行类名太多
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200">

// 解决 1：换行
<div className="
  flex items-center justify-between
  p-4 bg-white rounded-lg
  shadow-md hover:shadow-lg
  transition-shadow duration-200
">

// 解决 2：抽取组件
function Card({ children }) {
  return (
    <div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md">
      {children}
    </div>
  );
}
```

### ❌ 陷阱 3：忘记 content 配置

```typescript
// 问题：样式不生效
// 检查 tailwind.config.ts 的 content 是否包含你的文件路径

const config = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',  // 确保覆盖所有文件
    './components/**/*.{js,ts,jsx,tsx}',  // 别漏了
  ],
};
```

### ✅ 最佳实践

1. **使用 cn() 合并类名**
   ```typescript
   import { clsx } from 'clsx';
   import { twMerge } from 'tailwind-merge';

   function cn(...inputs) {
     return twMerge(clsx(inputs));
   }

   // 使用
   <div className={cn(
     'p-4 rounded-lg',
     isActive && 'bg-blue-500',
     className
   )}>
   ```

2. **组件化复用**
   ```tsx
   // 而不是重复写相同的类名
   function Button({ children, variant = 'primary' }) {
     const variants = {
       primary: 'bg-blue-500 text-white hover:bg-blue-600',
       secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
     };

     return (
       <button className={`px-4 py-2 rounded-lg ${variants[variant]}`}>
         {children}
       </button>
     );
   }
   ```

3. **使用 VS Code 插件**
   - Tailwind CSS IntelliSense：自动补全
   - Headwind：自动排序类名

---

## 9. 总结

### 记住这 10 个最常用的

| 类名 | 作用 |
|------|------|
| `flex` | 开启 Flexbox |
| `items-center` | 垂直居中 |
| `justify-between` | 两端对齐 |
| `p-4` | 内边距 16px |
| `m-4` | 外边距 16px |
| `bg-white` | 白色背景 |
| `text-gray-600` | 灰色文字 |
| `rounded-lg` | 圆角 |
| `shadow` | 阴影 |
| `hover:xxx` | 悬停状态 |

### TailwindCSS 的核心价值

```
传统 CSS：写样式 → 起类名 → 关联 → 维护
Tailwind：直接写类名 → 完事
```

**一句话总结**：TailwindCSS 让你不用想类名，看代码就知道样式。
