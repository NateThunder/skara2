export type BookingMailtoFields = {
  name: string;
  email: string;
  phone: string;
  date: string;
  eventType: string;
  location: string;
  message: string;
  source: string;
};

const bookingInbox = "info@skaraceilidh.com";

function line(label: string, value: string): string {
  return `${label}: ${value || "-"}`;
}

export function buildBookingMailtoHref(fields: BookingMailtoFields): string {
  const subject = `Booking enquiry from ${fields.name || "website visitor"}`;
  const body = [
    "Hello Skara,",
    "",
    "I'm getting in touch about a booking.",
    "",
    line("Name", fields.name),
    line("Email", fields.email),
    line("Phone", fields.phone),
    line("Event date", fields.date),
    line("Event type", fields.eventType),
    line("Location", fields.location),
    line("Source", fields.source),
    "",
    "Message:",
    fields.message || "-",
  ].join("\n");

  return `mailto:${bookingInbox}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
