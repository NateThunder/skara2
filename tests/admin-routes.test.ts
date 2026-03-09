import { describe, expect, it, vi } from "vitest";
import { PUT as putContent } from "@/app/api/admin/content/route";
import { PUT as putNavLayout } from "@/app/api/admin/nav-layout/route";
import { GET as getKpis } from "@/app/api/admin/analytics/kpis/route";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

describe("admin route adversarial inputs", () => {
  it("rejects non-JSON site-content payloads", async () => {
    const request = new Request("https://example.com/api/admin/content", {
      method: "PUT",
      body: "{not-json",
      headers: {
        "content-type": "application/json",
      },
    });

    const response = await putContent(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid request body. Please submit valid JSON content.",
    });
  });

  it("rejects invalid nav layout modes", async () => {
    const request = new Request("https://example.com/api/admin/nav-layout", {
      method: "PUT",
      body: JSON.stringify({ mode: "sideways" }),
      headers: {
        "content-type": "application/json",
      },
    });

    const response = await putNavLayout(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: "Invalid mode. Expected 'full' or 'hamburger'.",
    });
  });

  it("fails fast on impossible analytics date ranges before touching GA", async () => {
    const request = new Request(
      "https://example.com/api/admin/analytics/kpis?preset=custom&startDate=2026-02-31&endDate=2026-03-01"
    );

    const response = await getKpis(request);

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toMatchObject({
      configured: false,
      error: "Invalid custom dates. Use YYYY-MM-DD format.",
    });
  });
});
