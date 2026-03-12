import { describe, expect, it } from "vitest";

import { buildBookingMailtoHref } from "@/app/lib/booking-mailto";

describe("booking mailto fallback", () => {
  it("builds a prefilled enquiry draft", () => {
    const href = buildBookingMailtoHref({
      name: "Test User",
      email: "test@example.com",
      phone: "+44 7000 000000",
      date: "2026-06-12",
      eventType: "Wedding",
      location: "Glasgow",
      message: "Need a ceilidh band for 120 guests.",
      source: "contact-faq-section",
    });

    expect(href).toContain("mailto:info@skaraceilidh.com");
    expect(decodeURIComponent(href)).toContain("Booking enquiry from Test User");
    expect(decodeURIComponent(href)).toContain("Event date: 2026-06-12");
    expect(decodeURIComponent(href)).toContain("Message:\nNeed a ceilidh band for 120 guests.");
  });
});
