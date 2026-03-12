"use client";

export const CONSENT_COOKIE_NAME = "skara_cookie_consent";
export const CONSENT_COOKIE_MAX_AGE = 60 * 60 * 24 * 180;
export const CONSENT_CHANGE_EVENT = "skara-consent-change";
export const OPEN_CONSENT_PANEL_EVENT = "skara-open-consent-panel";

export type StoredConsentValue = "accepted" | "rejected";
export type ConsentState = StoredConsentValue | "loading" | "unknown";

export function readConsentCookie(): StoredConsentValue | null {
  if (typeof document === "undefined") {
    return null;
  }

  const cookies = document.cookie.split(";").map((value) => value.trim());
  const match = cookies.find((value) => value.startsWith(`${CONSENT_COOKIE_NAME}=`));
  const consentValue = match?.slice(CONSENT_COOKIE_NAME.length + 1);

  return consentValue === "accepted" || consentValue === "rejected" ? consentValue : null;
}

export function writeConsentCookie(value: StoredConsentValue): void {
  if (typeof document === "undefined" || typeof window === "undefined") {
    return;
  }

  const attributes = [
    `${CONSENT_COOKIE_NAME}=${value}`,
    "path=/",
    `max-age=${CONSENT_COOKIE_MAX_AGE}`,
    "SameSite=Lax",
  ];

  if (window.location.protocol === "https:") {
    attributes.push("Secure");
  }

  document.cookie = attributes.join("; ");
}

export function subscribeToConsentStore(onStoreChange: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener(CONSENT_CHANGE_EVENT, onStoreChange);
  return () => {
    window.removeEventListener(CONSENT_CHANGE_EVENT, onStoreChange);
  };
}

export function notifyConsentChange(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(CONSENT_CHANGE_EVENT));
}

export function requestConsentPanelOpen(): void {
  if (typeof window === "undefined") {
    return;
  }

  window.dispatchEvent(new Event(OPEN_CONSENT_PANEL_EVENT));
}

export function subscribeToConsentPanelOpen(onOpen: () => void): () => void {
  if (typeof window === "undefined") {
    return () => {};
  }

  window.addEventListener(OPEN_CONSENT_PANEL_EVENT, onOpen);
  return () => {
    window.removeEventListener(OPEN_CONSENT_PANEL_EVENT, onOpen);
  };
}
