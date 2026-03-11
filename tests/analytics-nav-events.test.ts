import { describe, expect, it, vi } from "vitest";
import type { Ga4Client } from "@/app/lib/analytics/ga4-client";
import type { ResolvedDateRange } from "@/app/lib/analytics/contracts";
import { queryTopLandingPages } from "@/app/lib/analytics/queries";

function createRange(): ResolvedDateRange {
  return {
    preset: "28d",
    label: "Last 28 days",
    days: 28,
    current: {
      startDate: "2026-02-10",
      endDate: "2026-03-09",
    },
    previous: {
      startDate: "2026-01-13",
      endDate: "2026-02-09",
    },
    cacheKey: "28d:2026-02-10:2026-03-09",
  };
}

describe("queryTopLandingPages nav label mapping", () => {
  it("maps and aggregates legacy and new nav events into current labels", async () => {
    const runReport = vi.fn().mockResolvedValue({
      rows: [
        {
          dimensionValues: [{ value: "button_click_about" }],
          metricValues: [{ value: "10" }, { value: "5" }],
        },
        {
          dimensionValues: [{ value: "button_click_the_band" }],
          metricValues: [{ value: "8" }, { value: "4" }],
        },
        {
          dimensionValues: [{ value: "button_click_mentions" }],
          metricValues: [{ value: "3" }, { value: "2" }],
        },
        {
          dimensionValues: [{ value: "button_click_reviews" }],
          metricValues: [{ value: "5" }, { value: "4" }],
        },
        {
          dimensionValues: [{ value: "button_click_services" }],
          metricValues: [{ value: "9" }, { value: "7" }],
        },
      ],
    });

    const client: Ga4Client = {
      propertyId: "123456",
      keyEvents: [],
      runReport,
    };

    const result = await queryTopLandingPages(client, createRange());

    expect(result.data.rows).toEqual([
      { target: "The Band", clicks: 18, users: 9 },
      { target: "Services", clicks: 9, users: 7 },
      { target: "Reviews", clicks: 8, users: 6 },
    ]);
  });

  it("queries GA using both legacy and current nav event names", async () => {
    const runReport = vi.fn().mockResolvedValue({ rows: [] });

    const client: Ga4Client = {
      propertyId: "123456",
      keyEvents: [],
      runReport,
    };

    await queryTopLandingPages(client, createRange());

    const payload = runReport.mock.calls[0]?.[0];
    const values = payload?.dimensionFilter?.filter?.inListFilter?.values;

    expect(values).toEqual(
      expect.arrayContaining([
        "button_click_home",
        "button_click_about",
        "button_click_the_band",
        "button_click_media",
        "button_click_services",
        "button_click_faqs",
        "button_click_mentions",
        "button_click_reviews",
        "button_click_book_now",
        "button_click_contact",
      ])
    );
  });
});
