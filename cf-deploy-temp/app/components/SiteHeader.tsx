"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import type { NavLayoutMode } from "@/app/lib/site-content";

const navItems = [
  { label: "Home", href: "#top" },
  { label: "The Band", href: "#the-band" },
  { label: "Media", href: "#media" },
  { label: "Services", href: "#services" },
  { label: "FAQs", href: "#faqs" },
  { label: "Reviews", href: "#reviews" },
  { label: "Contact", href: "#contact" },
] as const;
const fadeRange = 120;

type NavHref = (typeof navItems)[number]["href"];
const navHrefs = new Set<NavHref>(navItems.map((item) => item.href));

type SiteHeaderProps = {
  defaultNavLayoutMode?: NavLayoutMode;
};

export default function SiteHeader({ defaultNavLayoutMode = "hamburger" }: SiteHeaderProps) {
  const headerRef = useRef<HTMLElement | null>(null);
  const mobileMenuRef = useRef<HTMLElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const pendingNavigationRef = useRef<NavHref | null>(null);
  const [isDesktopNavEnabled, setIsDesktopNavEnabled] = useState(defaultNavLayoutMode === "full");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const lockedScrollY = useRef(0);
  const previousStyles = useRef<{
    bodyPosition: string;
    bodyTop: string;
    bodyLeft: string;
    bodyRight: string;
    bodyWidth: string;
    bodyOverflow: string;
    htmlOverflow: string;
  } | null>(null);

  useEffect(() => {
    const header = headerRef.current;
    if (!header) {
      return;
    }

    const updateHeaderHeight = () => {
      const height = header.getBoundingClientRect().height;
      document.documentElement.style.setProperty("--header-height", `${height}px`);
    };

    const updateFrost = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const progress = Math.min(Math.max(scrollTop / fadeRange, 0), 1);
      header.style.setProperty("--frost-alpha", `${0.22 * progress}`);
      header.style.setProperty("--frost-blur", `${18 * progress}px`);
      header.style.setProperty("--frost-shadow", `${0.26 * progress}`);
    };

    const onScroll = () => {
      if (frameRef.current !== null) {
        return;
      }
      frameRef.current = window.requestAnimationFrame(() => {
        updateFrost();
        frameRef.current = null;
      });
    };

    updateHeaderHeight();
    updateFrost();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateHeaderHeight);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateHeaderHeight);
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const syncAddressBar = (href: NavHref) => {
    const nextUrl =
      href === "#top" ? `${window.location.pathname}${window.location.search}` : href;
    const historyMethod =
      href === "#top" || window.location.hash === href ? "replaceState" : "pushState";

    window.history[historyMethod](null, "", nextUrl);
  };

  const scrollToSection = (href: NavHref, { behavior = "smooth" }: { behavior?: ScrollBehavior } = {}) => {
    if (href === "#top") {
      syncAddressBar(href);
      window.scrollTo({ top: 0, behavior });
      return;
    }

    const target = document.getElementById(href.slice(1));
    if (!target) {
      return;
    }

    syncAddressBar(href);
    target.scrollIntoView({ behavior, block: "start" });
  };
  const scrollToSectionRef = useRef(scrollToSection);

  useEffect(() => {
    scrollToSectionRef.current = scrollToSection;
  });

  const handleNavRequest = (href: NavHref) => {
    if (isMenuOpen) {
      pendingNavigationRef.current = href;
      setIsMenuOpen(false);
      return;
    }

    scrollToSection(href);
  };

  const handleNavClick = (event: MouseEvent<HTMLAnchorElement>, href: NavHref) => {
    if (event.button !== 0 || event.metaKey || event.altKey || event.ctrlKey || event.shiftKey) {
      return;
    }

    event.preventDefault();
    handleNavRequest(href);
  };

  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;
    const restoreBodyScroll = () => {
      if (!previousStyles.current) {
        return;
      }

      body.style.position = previousStyles.current.bodyPosition;
      body.style.top = previousStyles.current.bodyTop;
      body.style.left = previousStyles.current.bodyLeft;
      body.style.right = previousStyles.current.bodyRight;
      body.style.width = previousStyles.current.bodyWidth;
      body.style.overflow = previousStyles.current.bodyOverflow;
      html.style.overflow = previousStyles.current.htmlOverflow;
      previousStyles.current = null;

      const y = lockedScrollY.current;
      const previousInlineScrollBehavior = html.style.scrollBehavior;
      html.style.scrollBehavior = "auto";
      window.scrollTo(0, y);
      html.style.scrollBehavior = previousInlineScrollBehavior;
      lockedScrollY.current = 0;
    };

    if (isMenuOpen) {
      const scrollY = window.scrollY;
      lockedScrollY.current = scrollY;
      previousStyles.current = {
        bodyPosition: body.style.position,
        bodyTop: body.style.top,
        bodyLeft: body.style.left,
        bodyRight: body.style.right,
        bodyWidth: body.style.width,
        bodyOverflow: body.style.overflow,
        htmlOverflow: html.style.overflow,
      };

      body.style.position = "fixed";
      body.style.top = `-${scrollY}px`;
      body.style.left = "0";
      body.style.right = "0";
      body.style.width = "100%";
      body.style.overflow = "hidden";
      html.style.overflow = "hidden";

      return () => {
        restoreBodyScroll();
      };
    }

    restoreBodyScroll();
  }, [isMenuOpen]);

  useEffect(() => {
    if (isMenuOpen || !pendingNavigationRef.current) {
      return;
    }

    const pendingNavigation = pendingNavigationRef.current;
    pendingNavigationRef.current = null;

    let secondFrame: number | null = null;
    const firstFrame = window.requestAnimationFrame(() => {
      secondFrame = window.requestAnimationFrame(() => {
        scrollToSectionRef.current(pendingNavigation, { behavior: "smooth" });
      });
    });

    return () => {
      window.cancelAnimationFrame(firstFrame);
      if (secondFrame !== null) {
        window.cancelAnimationFrame(secondFrame);
      }
    };
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isMenuOpen]);

  useEffect(() => {
    if (!isMenuOpen) {
      return;
    }

    const onPointerDown = (event: PointerEvent) => {
      const menu = mobileMenuRef.current;
      const target = event.target;
      if (!menu || !(target instanceof Node)) {
        return;
      }

      if (!menu.contains(target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [isMenuOpen]);

  useEffect(() => {
    setIsDesktopNavEnabled(defaultNavLayoutMode === "full");
  }, [defaultNavLayoutMode]);

  useEffect(() => {
    if (!isDesktopNavEnabled) {
      return;
    }

    setIsMenuOpen(false);
  }, [isDesktopNavEnabled]);

  useEffect(() => {
    const syncScrollWithLocation = () => {
      const href = window.location.hash || "#top";
      if (!navHrefs.has(href as NavHref)) {
        return;
      }

      scrollToSectionRef.current(href as NavHref, { behavior: "auto" });
    };

    let timeoutId: number | null = null;
    if (window.location.hash) {
      timeoutId = window.setTimeout(syncScrollWithLocation, 0);
    }

    const onPopState = () => {
      syncScrollWithLocation();
    };

    window.addEventListener("popstate", onPopState);
    return () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId);
      }
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  return (
    <header
      ref={headerRef}
      className={`site-header ${isDesktopNavEnabled ? "site-header--desktop-nav" : "site-header--hamburger-only"}`}
    >
      <div className="site-header__inner">
        <a
          href="#top"
          aria-label="Skara Home"
          className="site-header__logo"
          onClick={(event) => handleNavClick(event, "#top")}
        >
          <Image
            src="/logo white lite.png"
            alt="Skara logo"
            width={160}
            height={62}
            priority
          />
        </a>

        <nav aria-label="Main" className="site-nav">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="site-nav__link"
              data-track-button="true"
              data-track-label={item.label}
              onClick={(event) => handleNavClick(event, item.href)}
            >
              {item.label}
            </a>
          ))}
          <a
            href="#contact"
            className="site-nav__cta"
            data-track-button="true"
            data-track-label="Book Now"
            onClick={(event) => handleNavClick(event, "#contact")}
          >
            Book Now
          </a>
        </nav>

        <button
          type="button"
          className={`site-nav__toggle ${isMenuOpen ? "is-open" : ""}`}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <span className="site-nav__toggle-line" />
          <span className="site-nav__toggle-line" />
          <span className="site-nav__toggle-line" />
        </button>
      </div>

      <div
        className={`site-nav__drawer-wrap ${isMenuOpen ? "is-open" : ""}`}
        aria-hidden={!isMenuOpen}
        onClick={() => setIsMenuOpen(false)}
      >
        <div className="site-nav__drawer-backdrop" />
        <nav
          id="mobile-menu"
          ref={mobileMenuRef}
          aria-label="Mobile"
          className={`site-nav__mobile ${isMenuOpen ? "is-open" : ""}`}
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            className="site-nav__mobile-close"
            aria-label="Close menu"
            onClick={() => setIsMenuOpen(false)}
          >
            x
          </button>
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="site-nav__mobile-link"
              data-track-button="true"
              data-track-label={item.label}
              onClick={(event) => handleNavClick(event, item.href)}
            >
              {item.label}
            </a>
          ))}
          <a
            href="#contact"
            className="site-nav__mobile-cta"
            data-track-button="true"
            data-track-label="Book Now"
            onClick={(event) => handleNavClick(event, "#contact")}
          >
            Book Now
          </a>
        </nav>
      </div>
    </header>
  );
}
