import { navItems } from "@/data/page-content";
import { Brand } from "./Brand";

export function Header() {
  return (
    <nav className="nav" data-od-id="site-nav">
      <div className="container nav-inner">
        <Brand />
        <div className="nav-links" data-od-id="nav-links">
          {navItems.map((item) => (
            <a key={item.href} href={item.href}>
              {item.label}
            </a>
          ))}
        </div>
        <a href="#subscribe" className="nav-cta" data-od-id="nav-subscribe">
          免费订阅
        </a>
        <a href="#subscribe" className="nav-toggle" data-od-id="nav-toggle">
          订阅
        </a>
      </div>
    </nav>
  );
}
