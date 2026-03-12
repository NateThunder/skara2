"use client";

import Image from "next/image";
import { useId, useRef, useState, type JSX } from "react";
import type { ServicesContent } from "@/app/lib/homepage-content";

type ServicesSectionProps = {
  content: ServicesContent;
};

type ServiceKey = "ceilidhs" | "backgroundMusic" | "djDisco" | "bagpiper";

type IconProps = {
  className?: string;
};

type ServiceCard = {
  key: ServiceKey;
  title: string;
  summary: string;
  Icon: (props: IconProps) => JSX.Element;
};

const SERVICE_CARDS: ServiceCard[] = [
  {
    key: "ceilidhs",
    title: "Ceilidhs",
    summary: "Full ceilidh experience",
    Icon: CeilidhIcon,
  },
  {
    key: "backgroundMusic",
    title: "Background Music",
    summary: "Elegant acoustic atmosphere",
    Icon: HeadphonesIcon,
  },
  {
    key: "djDisco",
    title: "DJ / Disco",
    summary: "Keep the party going",
    Icon: DiscIcon,
  },
  {
    key: "bagpiper",
    title: "Bagpiper",
    summary: "Traditional Scottish pipes",
    Icon: BagpiperIcon,
  },
];

const BACKGROUND_MUSIC_IMAGE = "/59759789_858220537873606_773378478769700864_n.jpg";
const BACKGROUND_MUSIC_ICON_IMAGE = "/background music icon.PNG";
const DJ_ICON_IMAGE = "/dj icon.PNG";
const MOBILE_QUERY = "(max-width: 760px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const MOBILE_PACKAGES_TOP_GAP = 10;
const MOBILE_MIN_PACKAGE_VISIBILITY = 84;
const MOBILE_MIN_DETAIL_VISIBILITY = 120;
const MOBILE_SCROLL_TOLERANCE = 8;

function CeilidhIcon({ className }: IconProps) {
  const iconClassName = className ? `${className} services-icon--ceilidh` : "services-icon--ceilidh";

  return <span aria-hidden="true" className={iconClassName} />;
}

function HeadphonesIcon({ className }: IconProps) {
  const iconClassName = className
    ? `${className} services-icon--background-music`
    : "services-icon--background-music";

  return (
    <Image
      src={BACKGROUND_MUSIC_ICON_IMAGE}
      alt=""
      aria-hidden="true"
      width={699}
      height={700}
      className={iconClassName}
    />
  );
}

function DiscIcon({ className }: IconProps) {
  const iconClassName = className ? `${className} services-icon--dj-disco` : "services-icon--dj-disco";

  return (
    <Image
      src={DJ_ICON_IMAGE}
      alt=""
      aria-hidden="true"
      width={731}
      height={575}
      className={iconClassName}
    />
  );
}

function BagpiperIcon({ className }: IconProps) {
  const iconClassName = className ? `${className} services-icon--bagpiper` : "services-icon--bagpiper";

  return <span aria-hidden="true" className={iconClassName} />;
}

function CheckCircleIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className}>
      <path
        fill="currentColor"
        d="M12 3.5a8.5 8.5 0 1 0 8.5 8.5A8.5 8.5 0 0 0 12 3.5Zm0 1.8a6.7 6.7 0 1 1-6.7 6.7A6.7 6.7 0 0 1 12 5.3Zm3.1 4.7-3.8 3.9-1.8-1.8a.9.9 0 0 0-1.3 1.2l2.5 2.5a.9.9 0 0 0 1.2 0l4.5-4.5a.9.9 0 0 0-1.3-1.3Z"
      />
    </svg>
  );
}

function DetailHeading({ title, Icon }: { title: string; Icon: (props: IconProps) => JSX.Element }) {
  return (
    <h3 className="services-detail__service-title">
      <Icon className="services-detail__service-icon" />
      <span>{title}</span>
    </h3>
  );
}

function Checklist({ items, singleColumn = false }: { items: string[]; singleColumn?: boolean }) {
  const listClassName = singleColumn
    ? "services-detail__checklist services-detail__checklist--single"
    : "services-detail__checklist";

  return (
    <ul className={listClassName}>
      {items.map((item, index) => (
        <li key={`${item}-${index}`}>
          <CheckCircleIcon className="services-detail__check-icon" />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function parseTimelineEntry(entry: string) {
  const match = entry.match(/^(.*?)\s*\((\d{2}:\d{2})\)\s*$/);
  if (!match) {
    return { label: entry.trim(), time: "" };
  }

  return {
    label: match[1].trim(),
    time: match[2],
  };
}

function ServiceDetail({ service, content }: { service: ServiceKey; content: ServicesContent }) {
  if (service === "ceilidhs") {
    return (
      <div className="services-detail__grid">
        <div className="services-detail__content">
          <DetailHeading title="Ceilidhs" Icon={CeilidhIcon} />
          <p className="services-detail__text">{content.ceilidhs.intro}</p>
          <p className="services-detail__text">{content.ceilidhs.teaching}</p>
          <h4 className="services-detail__label">Perfect For</h4>
          <Checklist items={content.ceilidhs.events} />
        </div>

        <aside className="services-detail__aside">
          <h4 className="services-detail__label">Ceilidh Dances</h4>
          <ul className="services-detail__dance-list">
            {content.ceilidhs.dances.map((dance) => (
              <li key={dance}>{dance}</li>
            ))}
          </ul>
        </aside>
      </div>
    );
  }

  if (service === "backgroundMusic") {
    return (
      <div className="services-detail__grid">
        <div className="services-detail__content">
          <DetailHeading title="Background Music" Icon={HeadphonesIcon} />
          <p className="services-detail__text">{content.backgroundMusic.intro}</p>
          <h4 className="services-detail__label">Perfect For</h4>
          <Checklist items={content.backgroundMusic.events} />
        </div>

        <aside className="services-detail__aside">
          <figure className="services-detail__media">
            <Image
              src={BACKGROUND_MUSIC_IMAGE}
              alt="Skara performing live at a recent wedding"
              width={2048}
              height={1536}
              sizes="(max-width: 1023px) 100vw, 44vw"
              className="services-detail__media-image"
            />
          </figure>
        </aside>
      </div>
    );
  }

  if (service === "djDisco") {
    return (
      <div className="services-detail__grid">
        <div className="services-detail__content">
          <DetailHeading title="DJ / Disco" Icon={DiscIcon} />
          <p className="services-detail__text">{content.djDisco.intro}</p>
          <p className="services-detail__text">{content.djDisco.details}</p>
        </div>

        <aside className="services-detail__aside">
          <h4 className="services-detail__label">{content.djDisco.weddingFormatTitle}</h4>
          <ul className="services-detail__timeline">
            {content.djDisco.weddingFormat.map((entry, index) => {
              const parsed = parseTimelineEntry(entry);

              return (
                <li key={`${parsed.label}-${index}`} className="services-detail__timeline-item">
                  <span className="services-detail__timeline-time">{parsed.time || "--:--"}</span>
                  <span className="services-detail__timeline-dot" aria-hidden="true" />
                  <span className="services-detail__timeline-text">{parsed.label}</span>
                </li>
              );
            })}
          </ul>
        </aside>
      </div>
    );
  }

  return (
    <div className="services-detail__grid services-detail__grid--bagpiper">
      <div className="services-detail__content">
        <DetailHeading title="Bagpiper" Icon={BagpiperIcon} />
        <p className="services-detail__text">{content.bagpiper.intro}</p>
        <p className="services-detail__text">Fully tailored to your event requirements.</p>
        <h4 className="services-detail__label">Wedding Options</h4>
        <Checklist items={content.bagpiper.options} singleColumn />
      </div>

      <aside className="services-detail__aside services-detail__aside--symbol">
        <BagpiperIcon className="services-detail__symbol-icon" />
        <p className="services-detail__symbol-text">Fully tailored to your event</p>
      </aside>
    </div>
  );
}

export default function ServicesSection({ content }: ServicesSectionProps) {
  const [activeService, setActiveService] = useState<ServiceKey>("ceilidhs");
  const packagesRef = useRef<HTMLDivElement | null>(null);
  const detailsRef = useRef<HTMLDivElement | null>(null);
  const idBase = useId().replace(/:/g, "");

  const handlePackageClick = (service: ServiceKey) => {
    setActiveService(service);

    if (!window.matchMedia(MOBILE_QUERY).matches) {
      return;
    }

    window.requestAnimationFrame(() => {
      const packages = packagesRef.current;
      const details = detailsRef.current;
      if (!packages || !details) {
        return;
      }

      const packagesRect = packages.getBoundingClientRect();
      const detailsRect = details.getBoundingClientRect();
      const headerHeightValue = Number.parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--header-height"),
      );
      const headerHeight = Number.isFinite(headerHeightValue) ? headerHeightValue : 88;
      const targetPackagesTop = headerHeight + MOBILE_PACKAGES_TOP_GAP;
      const currentScrollY = window.scrollY;

      let targetScrollY = currentScrollY + (packagesRect.top - targetPackagesTop);

      const detailsTopAtTarget = detailsRect.top - (targetScrollY - currentScrollY);
      const maxDetailsTop = window.innerHeight - MOBILE_MIN_DETAIL_VISIBILITY;
      if (detailsTopAtTarget > maxDetailsTop) {
        targetScrollY += detailsTopAtTarget - maxDetailsTop;
      }

      const packagesBottomAtTarget = packagesRect.bottom - (targetScrollY - currentScrollY);
      if (packagesBottomAtTarget < MOBILE_MIN_PACKAGE_VISIBILITY) {
        targetScrollY -= MOBILE_MIN_PACKAGE_VISIBILITY - packagesBottomAtTarget;
      }

      targetScrollY = Math.max(0, Math.round(targetScrollY));
      if (Math.abs(targetScrollY - currentScrollY) <= MOBILE_SCROLL_TOLERANCE) {
        return;
      }

      const behavior = window.matchMedia(REDUCED_MOTION_QUERY).matches ? "auto" : "smooth";
      window.scrollTo({ top: targetScrollY, behavior });
    });
  };

  return (
    <section id="services" className="services-section" aria-label="Services">
      <div className="services-section__inner">
        <header className="services-section__header">
          <p className="services-section__eyebrow">{content.eyebrow}</p>
          <h2 className="services-section__title">{content.heading}</h2>
          <p className="services-section__subtitle">{content.subtitle}</p>
        </header>

        <div
          ref={packagesRef}
          className="services-section__packages"
          role="tablist"
          aria-label="Professional service packages"
        >
          {SERVICE_CARDS.map((card) => {
            const isActive = card.key === activeService;
            const tabId = `${idBase}-service-tab-${card.key}`;
            const panelId = `${idBase}-service-panel-${card.key}`;

            return (
              <button
                key={card.key}
                id={tabId}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={panelId}
                tabIndex={isActive ? 0 : -1}
                className={`services-package-card ${isActive ? "is-active" : ""}`}
                onClick={() => handlePackageClick(card.key)}
              >
                <span className="services-package-card__icon-wrap">
                  <card.Icon className="services-package-card__icon" />
                </span>
                <span className="services-package-card__title">{card.title}</span>
                <span className="services-package-card__summary">{card.summary}</span>
              </button>
            );
          })}
        </div>

        <div ref={detailsRef} className="services-section__details">
          {SERVICE_CARDS.map((card) => {
            const isActive = card.key === activeService;
            const tabId = `${idBase}-service-tab-${card.key}`;
            const panelId = `${idBase}-service-panel-${card.key}`;

            return (
              <article
                key={card.key}
                id={panelId}
                role="tabpanel"
                aria-labelledby={tabId}
                className="services-detail"
                hidden={!isActive}
              >
                <ServiceDetail service={card.key} content={content} />
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
