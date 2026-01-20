import Link from 'next/link';

const footerLinks = {
  navigation: [
    { name: '首页', href: '/' },
    { name: '文章', href: '/posts' },
    { name: '作品', href: '/works' },
    { name: '关于', href: '/about' },
  ],
  social: [
    { name: 'GitHub', href: 'https://github.com' },
    { name: 'Twitter', href: 'https://twitter.com' },
  ],
};

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <Link href="/" className="text-xl font-bold">
              TheRoadInCode
            </Link>
            <p className="mt-2 text-sm text-muted-foreground">
              技术分享 · 作品展示 · 实验平台
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h3 className="text-sm font-semibold">导航</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.navigation.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="text-sm font-semibold">社交</h3>
            <ul className="mt-4 space-y-2">
              {footerLinks.social.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} TheRoadInCode. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
