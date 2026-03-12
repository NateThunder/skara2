export type BookingEnquiryInput = {
  name?: unknown;
  email?: unknown;
  phone?: unknown;
  date?: unknown;
  eventType?: unknown;
  location?: unknown;
  message?: unknown;
  botField?: unknown;
  source?: unknown;
};

export type BookingEnquiryRecord = {
  name: string;
  email: string;
  phone: string;
  date: string;
  eventType: string;
  location: string;
  message: string;
  botField: string;
  source: string;
};

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function isValidIsoDate(value: string): boolean {
  if (!ISO_DATE_PATTERN.test(value)) {
    return false;
  }

  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));

  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  );
}

export function normalizeBookingEnquiry(input: BookingEnquiryInput): BookingEnquiryRecord {
  return {
    name: normalizeText(input.name),
    email: normalizeText(input.email).toLowerCase(),
    phone: normalizeText(input.phone),
    date: normalizeText(input.date),
    eventType: normalizeText(input.eventType),
    location: normalizeText(input.location),
    message: normalizeText(input.message),
    botField: normalizeText(input.botField),
    source: normalizeText(input.source) || "website",
  };
}

export function validateBookingEnquiry(input: BookingEnquiryInput):
  | { ok: true; data: BookingEnquiryRecord }
  | { ok: false; error: string } {
  const normalized = normalizeBookingEnquiry(input);

  if (!normalized.name || !normalized.email || !normalized.date) {
    return {
      ok: false,
      error: "Name, email, and event date are required.",
    };
  }

  if (!EMAIL_PATTERN.test(normalized.email)) {
    return {
      ok: false,
      error: "Enter a valid email address.",
    };
  }

  if (!isValidIsoDate(normalized.date)) {
    return {
      ok: false,
      error: "Enter a valid event date in YYYY-MM-DD format.",
    };
  }

  return {
    ok: true,
    data: normalized,
  };
}
