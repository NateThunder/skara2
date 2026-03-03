"use client";

import { useEffect, useState } from "react";

const navItems = [
  { href: "#kpis", label: "Overview" },
  { href: "#charts", label: "Charts" },
  { href: "#tables", label: "Tables" },
  { href: "#content", label: "Site editor" },
  { href: "#setup", label: "GA4 setup" },
];

export function SidebarNav() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  useEffect(() => {
    if (!mobileOpen) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeMobileMenu();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [mobileOpen]);

  return (
    <aside className="dash-sidebar" aria-label="Dashboard navigation">
      <div className="dash-sidebar__brand">
        <div className="dash-sidebar__brand-head">
          <div className="dash-sidebar__brand-copy">
            <p className="dash-sidebar__eyebrow">Skara ceilidh band</p>
            <p className="dash-sidebar__title">Insight studio</p>
          </div>

          <button
            type="button"
            className={`dash-sidebar__toggle${mobileOpen ? " is-open" : ""}`}
            aria-expanded={mobileOpen}
            aria-controls="dash-sidebar-drawer"
            aria-label={mobileOpen ? "Close section menu" : "Open section menu"}
            onClick={() => setMobileOpen((current) => !current)}
          >
            <span className="dash-sidebar__toggle-icon" aria-hidden="true">
              <span />
              <span />
              <span />
            </span>
          </button>
        </div>
      </div>

      <nav className="dash-sidebar__nav">
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="dash-sidebar__link"
            onClick={closeMobileMenu}
          >
            {item.label}
          </a>
        ))}
      </nav>

      <div className={`dash-sidebar__drawer-wrap${mobileOpen ? " is-open" : ""}`}>
        <button
          type="button"
          className="dash-sidebar__drawer-backdrop"
          onClick={closeMobileMenu}
          aria-label="Close section menu"
        />

        <nav id="dash-sidebar-drawer" className="dash-sidebar__drawer">
          {navItems.map((item) => (
            <a
              key={`mobile-${item.href}`}
              href={item.href}
              className="dash-sidebar__link"
              onClick={closeMobileMenu}
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </aside>
  );
}
