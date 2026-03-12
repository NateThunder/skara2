"use client";

import { useSyncExternalStore } from "react";
import {
  readConsentCookie,
  requestConsentPanelOpen,
  subscribeToConsentStore,
  type ConsentState,
} from "@/app/lib/cookie-consent";

function getConsentSnapshot(): ConsentState {
  if (typeof window === "undefined") {
    return "loading";
  }

  return readConsentCookie() ?? "unknown";
}

export default function CookieSettingsLink() {
  const consent = useSyncExternalStore(subscribeToConsentStore, getConsentSnapshot, () => "loading");

  if (consent !== "accepted" && consent !== "rejected") {
    return null;
  }

  return (
    <p className="mt-6 text-sm text-white/70">
      <button
        type="button"
        onClick={requestConsentPanelOpen}
        className="text-inherit underline decoration-white/45 underline-offset-4 transition hover:text-white hover:decoration-[#cba454] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        data-track-ignore="true"
      >
        Need to change your analytics preference?
      </button>
    </p>
  );
}
