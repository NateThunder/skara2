"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";

const navItems = [
  { label: "Home", href: "#top" },
  { label: "About", href: "#about" },
  { label: "Media", href: "#watch" },
  { label: "Mentions", href: "#mentions" },
  { label: "Contact", href: "#bookings" },
];
const fadeRange = 120;

export default function SiteHeader() {
  const headerRef = useRef<HTMLElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
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

  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;
    const restoreBodyScroll = () => {
      if (!previousStyles.current) {
        return;
      }

      const top = body.style.top;
      body.style.position = previousStyles.current.bodyPosition;
      body.style.top = previousStyles.current.bodyTop;
      body.style.left = previousStyles.current.bodyLeft;
      body.style.right = previousStyles.current.bodyRight;
      body.style.width = previousStyles.current.bodyWidth;
      body.style.overflow = previousStyles.current.bodyOverflow;
      html.style.overflow = previousStyles.current.htmlOverflow;
      previousStyles.current = null;

      const y = top ? -parseInt(top, 10) : 0;
      window.scrollTo(0, y);
    };

    if (isMenuOpen) {
      const scrollY = window.scrollY;
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
    const onResize = () => {
      if (window.innerWidth >= 1280) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

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

  const handleMobileLinkClick = (href: string) => {
    setIsMenuOpen(false);

    if (href === "#top") {
      window.requestAnimationFrame(() => {
        window.requestAnimationFrame(() => {
          window.scrollTo({ top: 0, behavior: "smooth" });
        });
      });
    }
  };

  return (
    <header ref={headerRef} className="site-header">
      <div className="site-header__inner">
        <a href="#top" aria-label="Skara Home" className="site-header__logo">
          <Image
            src="/logo white lite.png"
            alt="Skara logo"
            width={160}
            height={62}
            priority
          />
        </a>

        <nav aria-label="Main" className="site-nav">
          {navItems.slice(0, 4).map((item) => (
            <a key={item.label} href={item.href} className="site-nav__link">
              {item.label}
            </a>
          ))}
          <a href="#bookings" className="site-nav__cta">
            Book Now
          </a>
          <a href={navItems[4].href} className="site-nav__link">
            {navItems[4].label}
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
          aria-label="Mobile"
          className={`site-nav__mobile ${isMenuOpen ? "is-open" : ""}`}
          onClick={(event) => event.stopPropagation()}
        >
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="site-nav__mobile-link"
              onClick={() => handleMobileLinkClick(item.href)}
            >
              {item.label}
            </a>
          ))}
        <a
          href="#bookings"
          className="site-nav__mobile-cta"
          onClick={() => setIsMenuOpen(false)}
        >
          Book Now
        </a>
      </nav>
      </div>
    </header>
  );
}

