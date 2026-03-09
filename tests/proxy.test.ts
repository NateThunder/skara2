import { describe, expect, it } from "vitest";
import { NextRequest } from "next/server";
import { proxyTestUtils } from "@/proxy";

describe("proxy idle-session helpers", () => {
  it("treats admin and admin API paths as protected but leaves public paths alone", () => {
    expect(proxyTestUtils.isAdminPath("/admin")).toBe(true);
    expect(proxyTestUtils.isAdminPath("/admin/settings")).toBe(true);
    expect(proxyTestUtils.isAdminPath("/")).toBe(false);

    expect(proxyTestUtils.isAdminApiPath("/api/admin")).toBe(true);
    expect(proxyTestUtils.isAdminApiPath("/api/admin/kpis")).toBe(true);
    expect(proxyTestUtils.isAdminApiPath("/api/public")).toBe(false);
  });

  it("parses only numeric last-activity cookies", () => {
    const validRequest = new NextRequest("https://example.com/admin", {
      headers: {
        cookie: `${proxyTestUtils.ADMIN_IDLE_COOKIE}=1700000000000`,
      },
    });
    const invalidRequest = new NextRequest("https://example.com/admin", {
      headers: {
        cookie: `${proxyTestUtils.ADMIN_IDLE_COOKIE}=not-a-number`,
      },
    });

    expect(proxyTestUtils.readLastActivityMs(validRequest)).toBe(1700000000000);
    expect(proxyTestUtils.readLastActivityMs(invalidRequest)).toBeNull();
  });

  it("expires sessions only after the configured idle timeout", () => {
    const now = 2_000_000;
    const justInsideWindow = now - proxyTestUtils.ADMIN_IDLE_TIMEOUT_MS;
    const justOutsideWindow = now - proxyTestUtils.ADMIN_IDLE_TIMEOUT_MS - 1;

    expect(proxyTestUtils.isIdleExpired(null, now)).toBe(false);
    expect(proxyTestUtils.isIdleExpired(justInsideWindow, now)).toBe(false);
    expect(proxyTestUtils.isIdleExpired(justOutsideWindow, now)).toBe(true);
  });
});
