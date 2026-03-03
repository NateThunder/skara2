import Link from "next/link";

const navItems = [
  { href: "#kpis", label: "Overview" },
  { href: "#charts", label: "Charts" },
  { href: "#tables", label: "Tables" },
  { href: "#content", label: "Site editor" },
  { href: "#setup", label: "GA4 setup" },
];

export function SidebarNav() {
  return (
    <aside className="dash-sidebar" aria-label="Dashboard navigation">
      <div className="dash-sidebar__brand">
        <p className="dash-sidebar__eyebrow">Skara ceilidh band</p>
        <p className="dash-sidebar__title">Insight studio</p>
      </div>

      <nav className="dash-sidebar__nav">
        {navItems.map((item) => (
          <a key={item.href} href={item.href} className="dash-sidebar__link">
            {item.label}
          </a>
        ))}
      </nav>

      <div className="dash-sidebar__footer">
        <Link href="/" className="dash-sidebar__site-link">
          Back to website
        </Link>
      </div>
    </aside>
  );
}
