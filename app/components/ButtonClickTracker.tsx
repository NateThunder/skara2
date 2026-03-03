"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function toEventSlug(value: string): string {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  if (!slug) {
    return "unknown";
  }

  return slug.slice(0, 24);
}

function getButtonLabel(element: HTMLElement): string {
  const explicit = element.dataset.trackLabel?.trim();
  if (explicit) {
    return explicit;
  }

  const ariaLabel = element.getAttribute("aria-label")?.trim();
  if (ariaLabel) {
    return ariaLabel;
  }

  const text = element.textContent?.replace(/\s+/g, " ").trim();
  if (text) {
    return text;
  }

  return "Unknown button";
}

function trackButtonClick(element: HTMLElement): void {
  const label = getButtonLabel(element);
  const eventName = `button_click_${toEventSlug(label)}`;
  const locationPath = window.location.pathname;

  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, {
      button_label: label,
      page_path: locationPath,
    });
    return;
  }

  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({
    event: eventName,
    button_label: label,
    page_path: locationPath,
  });
}

export default function ButtonClickTracker() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) {
        return;
      }

      const tracked = target.closest("button, a[data-track-button='true']");
      if (!(tracked instanceof HTMLElement)) {
        return;
      }

      trackButtonClick(tracked);
    };

    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  return null;
}
