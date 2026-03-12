import type { BookingEnquiryRecord } from "@/app/lib/booking-enquiries";

export const missingBookingEmailEnvMessage =
  "Missing booking email environment variables. Set ZOHO_CLIENT_ID, ZOHO_CLIENT_SECRET, ZOHO_REFRESH_TOKEN, ZOHO_ACCOUNT_ID, and BOOKING_EMAIL_TO (or ZOHO_FROM_EMAIL).";

export type BookingEmailConfig = {
  zohoClientId: string;
  zohoClientSecret: string;
  zohoRefreshToken: string;
  zohoAccountId: string;
  fromEmail: string;
  toEmail: string;
};

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(missingBookingEmailEnvMessage);
  }

  return value;
}

export function getBookingEmailConfig(): BookingEmailConfig {
  const toEmail = process.env.BOOKING_EMAIL_TO?.trim() ?? "";
  const fromEmail = process.env.ZOHO_FROM_EMAIL?.trim() ?? toEmail;

  if (!fromEmail) {
    throw new Error(missingBookingEmailEnvMessage);
  }

  return {
    zohoClientId: requireEnv("ZOHO_CLIENT_ID"),
    zohoClientSecret: requireEnv("ZOHO_CLIENT_SECRET"),
    zohoRefreshToken: requireEnv("ZOHO_REFRESH_TOKEN"),
    zohoAccountId: requireEnv("ZOHO_ACCOUNT_ID"),
    fromEmail,
    toEmail: toEmail || fromEmail,
  };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function line(label: string, value: string): string {
  return `${label}: ${value || "-"}`;
}

export function buildBookingEmailText(
  enquiry: BookingEnquiryRecord,
  metadata: { ipAddress: string; userAgent: string }
): string {
  return [
    "New booking enquiry",
    "",
    line("Name", enquiry.name),
    line("Email", enquiry.email),
    line("Phone", enquiry.phone),
    line("Event date", enquiry.date),
    line("Event type", enquiry.eventType),
    line("Location", enquiry.location),
    line("Source", enquiry.source),
    "",
    "Message:",
    enquiry.message || "-",
    "",
    line("IP", metadata.ipAddress),
    line("User-Agent", metadata.userAgent),
  ].join("\n");
}

export function buildBookingEmailHtml(
  enquiry: BookingEnquiryRecord,
  metadata: { ipAddress: string; userAgent: string }
): string {
  const rows = [
    ["Name", enquiry.name],
    ["Email", enquiry.email],
    ["Phone", enquiry.phone],
    ["Event date", enquiry.date],
    ["Event type", enquiry.eventType],
    ["Location", enquiry.location],
    ["Source", enquiry.source],
    ["IP", metadata.ipAddress],
    ["User-Agent", metadata.userAgent],
  ]
    .map(
      ([label, value]) =>
        `<tr><td style="padding:8px 12px;font-weight:700;vertical-align:top;">${escapeHtml(label)}</td><td style="padding:8px 12px;">${escapeHtml(value || "-")}</td></tr>`
    )
    .join("");

  return [
    '<div style="font-family:Arial,sans-serif;line-height:1.5;color:#10233a;">',
    "<h2>New booking enquiry</h2>",
    '<table style="border-collapse:collapse;margin:16px 0;">',
    rows,
    "</table>",
    "<h3>Message</h3>",
    `<p style="white-space:pre-wrap;">${escapeHtml(enquiry.message || "-")}</p>`,
    "</div>",
  ].join("");
}
