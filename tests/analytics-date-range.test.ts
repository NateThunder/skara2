import { describe, expect, it, vi } from "vitest";
import { resolveDateRange } from "@/app/lib/analytics/date-range";

describe("resolveDateRange adversarial cases", () => {
  it("rejects custom ranges with impossible calendar dates", () => {
    const params = new URLSearchParams({
      preset: "custom",
      startDate: "2026-02-31",
      endDate: "2026-03-01",
    });

    expect(() => resolveDateRange(params)).toThrow("Invalid custom dates. Use YYYY-MM-DD format.");
  });

  it("rejects custom ranges that end before they start", () => {
    const params = new URLSearchParams({
      preset: "custom",
      startDate: "2026-03-05",
      endDate: "2026-03-01",
    });

    expect(() => resolveDateRange(params)).toThrow("Custom endDate must be on or after startDate.");
  });

  it("rejects future end dates", () => {
    vi.setSystemTime(new Date("2026-03-09T12:00:00Z"));

    const params = new URLSearchParams({
      preset: "custom",
      startDate: "2026-03-01",
      endDate: "2026-03-10",
    });

    expect(() => resolveDateRange(params)).toThrow("Custom endDate cannot be in the future.");
  });

  it("rejects custom ranges longer than 366 days", () => {
    const params = new URLSearchParams({
      preset: "custom",
      startDate: "2025-01-01",
      endDate: "2026-01-02",
    });

    expect(() => resolveDateRange(params)).toThrow("Custom range is too large. Please use 366 days or fewer.");
  });
});
