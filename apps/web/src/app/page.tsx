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
