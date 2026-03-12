"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { usePathname } from "next/navigation";
import ButtonClickTracker from "@/app/components/ButtonClickTracker";
import {
  notifyConsentChange,
  readConsentCookie,
  subscribeToConsentPanelOpen,
  subscribeToConsentStore,
  writeConsentCookie,
  type ConsentState,
  type StoredConsentValue,
} from "@/app/lib/cookie-consent";

const GA_MEASUREMENT_ID = "G-FEWPRZQBH9";
const GA_SCRIPT_ID = "skara-ga-script";

declare global {
  interface Window {
    __skaraGaConfigured?: boolean;
    __skaraGaConsentModeReady?: boolean;
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

function getConsentSnapshot(pathname: string): ConsentState {
  if (typeof window === "undefined") {
    return "loading";
  }

  if (pathname === "/login" || pathname.startsWith("/admin")) {
    return "loading";
  }

  return readConsentCookie() ?? "unknown";
}

function getAnalyticsDisableKey(): string {
  return `ga-disable-${GA_MEASUREMENT_ID}`;
}

function getCookieDomainVariants(hostname: string): string[] {
  const segments = hostname.split(".").filter(Boolean);
  const domains = new Set<string>([""]);

  for (let index = 0; index < segments.length - 1; index += 1) {
    const domain = segments.slice(index).join(".");
    domains.add(domain);
    domains.add(`.${domain}`);
  }

  return [...domains];
}

function expireCookie(name: string, domain: string): void {
  const attributes = [`${name}=`, "path=/", "max-age=0", "SameSite=Lax"];

  if (domain) {
    attributes.push(`domain=${domain}`);
  }

  if (window.location.protocol === "https:") {
    attributes.push("Secure");
  }

  document.cookie = attributes.join("; ");
}

function clearAnalyticsCookies(): void {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return;
  }

  const analyticsCookieNames = document.cookie
    .split(";")
    .map((value) => value.trim().split("=")[0])
    .filter((name) => /^_(ga|gid|gat)/.test(name));

  if (analyticsCookieNames.length === 0) {
    return;
  }

  const domains = getCookieDomainVariants(window.location.hostname);

  for (const cookieName of analyticsCookieNames) {
    for (const domain of domains) {
      expireCookie(cookieName, domain);
    }
  }
}

function ensureGaBootstrap(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dataLayer = window.dataLayer ?? [];

  if (typeof window.gtag !== "function") {
    window.gtag = (...args: unknown[]) => {
      window.dataLayer?.push(args);
    };
  }

  if (!window.__skaraGaConsentModeReady) {
    window.gtag("consent", "default", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
    window.__skaraGaConsentModeReady = true;
  }
}

function ensureGaScript(): void {
  if (typeof document === "undefined") {
    return;
  }

  if (document.getElementById(GA_SCRIPT_ID)) {
    return;
  }

  const script = document.createElement("script");
  script.id = GA_SCRIPT_ID;
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);
}

function enableAnalytics(): void {
  if (typeof window === "undefined") {
    return;
  }

  const disableKey = getAnalyticsDisableKey();
  (window as unknown as Record<string, boolean>)[disableKey] = false;

  ensureGaBootstrap();
  ensureGaScript();

  window.gtag?.("consent", "update", {
    analytics_storage: "granted",
    ad_storage: "denied",
    ad_user_data: "denied",
    ad_personalization: "denied",
  });

  if (!window.__skaraGaConfigured) {
    window.gtag?.("js", new Date());
    window.gtag?.("config", GA_MEASUREMENT_ID, {
      anonymize_ip: true,
    });
    window.__skaraGaConfigured = true;
  }
}

function disableAnalytics(): void {
  if (typeof window === "undefined") {
    return;
  }

  const disableKey = getAnalyticsDisableKey();
  (window as unknown as Record<string, boolean>)[disableKey] = true;

  if (typeof window.gtag === "function") {
    window.gtag("consent", "update", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
  }

  clearAnalyticsCookies();
}

export default function CookieConsent() {
  const pathname = usePathname();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const consent = useSyncExternalStore(
    subscribeToConsentStore,
    () => getConsentSnapshot(pathname),
    () => "loading"
  );

  useEffect(() => {
    if (consent === "accepted") {
      enableAnalytics();
      return;
    }

    if (consent === "rejected") {
      disableAnalytics();
    }
  }, [consent]);

  useEffect(() => {
    if (pathname === "/login" || pathname.startsWith("/admin")) {
      return;
    }

    return subscribeToConsentPanelOpen(() => {
      setIsPanelOpen(true);
    });
  }, [pathname]);

  if (pathname === "/login" || pathname.startsWith("/admin") || consent === "loading") {
    return null;
  }

  const showPanel = consent === "unknown" || isPanelOpen;
  const canDismissPanel = consent !== "unknown";

  const handleChoice = (value: StoredConsentValue) => {
    writeConsentCookie(value);
    notifyConsentChange();
    setIsPanelOpen(false);
  };

  return (
    <>
      {consent === "accepted" ? <ButtonClickTracker /> : null}

      {showPanel ? (
        <div className="cookie-consent" role="dialog" aria-labelledby="cookie-consent-title" aria-modal="false">
          <div className="cookie-consent__panel">
            {canDismissPanel ? (
              <button
                type="button"
                className="cookie-consent__close"
                aria-label="Close cookie settings"
                onClick={() => setIsPanelOpen(false)}
                data-track-ignore="true"
              >
                Close
              </button>
            ) : null}
            <p className="cookie-consent__eyebrow">Cookie settings</p>
            <h2 id="cookie-consent-title" className="cookie-consent__title">
              Analytics stay off until you say yes.
            </h2>
            <p className="cookie-consent__body">
              We use necessary cookies for the admin login and optional analytics cookies to understand which pages
              and buttons help visitors. You can accept or reject analytics, and change this later.
            </p>
            <div className="cookie-consent__actions">
              <button
                type="button"
                className="cookie-consent__button cookie-consent__button--secondary"
                onClick={() => handleChoice("rejected")}
                data-track-ignore="true"
              >
                Reject analytics
              </button>
              <button
                type="button"
                className="cookie-consent__button cookie-consent__button--primary"
                onClick={() => handleChoice("accepted")}
                data-track-ignore="true"
              >
                Accept analytics
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
