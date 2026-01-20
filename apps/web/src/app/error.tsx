'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // 可以在这里上报错误到监控服务
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-destructive">
          出错了
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          抱歉，发生了一些错误。
        </p>
        {error.digest && (
          <p className="mt-2 text-sm text-muted-foreground">
            错误代码: {error.digest}
          </p>
        )}
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
          >
            重试
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium shadow-sm hover:bg-accent"
          >
            返回首页
          </a>
        </div>
      </div>
    </div>
  );
}
