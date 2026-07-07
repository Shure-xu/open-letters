import { navItems } from "@/data/page-content";
import { Brand } from "./Brand";

export function Footer() {
  return (
    <footer data-od-id="site-footer">
      <div className="container foot-inner">
        <Brand />
        <nav className="foot-links" aria-label="页脚导航">
          {navItems.map((item) => (
            <a href={item.href} key={item.href}>
              {item.label}
            </a>
          ))}
          <a href="#subscribe">订阅</a>
        </nav>
        <p className="foot-copy">
          每天早上 8:00,一封关于 AI 的信 · 写给认真做产品的人。© 2026 open
          letters
        </p>
      </div>
    </footer>
  );
}
