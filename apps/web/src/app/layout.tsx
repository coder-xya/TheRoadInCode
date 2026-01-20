import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { QueryProvider, ThemeProvider } from '@/components/providers';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'TheRoadInCode',
    template: '%s | TheRoadInCode',
  },
  description: '现代化个人博客系统 - 技术分享、作品展示、实验平台',
  keywords: ['博客', '技术', '前端', '后端', 'TypeScript', 'React', 'Next.js'],
  authors: [{ name: 'TDY0903' }],
  creator: 'TDY0903',
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    siteName: 'TheRoadInCode',
    title: 'TheRoadInCode',
    description: '现代化个人博客系统 - 技术分享、作品展示、实验平台',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TheRoadInCode',
    description: '现代化个人博客系统 - 技术分享、作品展示、实验平台',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        <ThemeProvider>
          <QueryProvider>
            <div className="relative flex min-h-screen flex-col">
              <Header />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
