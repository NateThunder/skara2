"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import type { AboutContent } from "@/app/lib/site-content";

type BioBannerProps = {
  about: AboutContent;
};

export default function BioBanner({ about }: BioBannerProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const headingLines = about.heading.split(/\r?\n/);

  useEffect(() => {
    const target = sectionRef.current;
    if (!target) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.28 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      className={`about-section ${isVisible ? "is-visible" : ""}`}
      aria-label="About Skara"
    >
      <div className="about-section__inner">
        <div className="about-section__content">
          <p className="about-section__eyebrow">{about.eyebrow}</p>
          <h2 className="about-section__title">
            {headingLines.map((line, index) => (
              <span key={`${line}-${index}`}>
                {line}
                {index < headingLines.length - 1 ? <br /> : null}
              </span>
            ))}
          </h2>
          <p className="about-section__text">{about.text}</p>
        </div>

        <div className="about-section__media">
          <Image
            src="/bio-banner.jpg"
            alt="Skara band members with instruments"
            width={1600}
            height={980}
            sizes="(max-width: 1023px) 100vw, 62vw"
            className="about-section__image"
          />
          <div className="about-section__media-fade" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
