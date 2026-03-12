import { describe, expect, it } from "vitest";
import {
  ADMIN_IDLE_COOKIE,
  ADMIN_IDLE_TIMEOUT_MS,
  isAdminApiPath,
  isAdminPath,
  isIdleExpired,
  readLastActivityMs,
} from "@/app/lib/admin/auth";

describe("admin auth helpers", () => {
  it("treats admin and admin API paths as protected but leaves public paths alone", () => {
    expect(isAdminPath("/admin")).toBe(true);
    expect(isAdminPath("/admin/settings")).toBe(true);
    expect(isAdminPath("/")).toBe(false);

    expect(isAdminApiPath("/api/admin")).toBe(true);
    expect(isAdminApiPath("/api/admin/kpis")).toBe(true);
    expect(isAdminApiPath("/api/public")).toBe(false);
  });

  it("parses only numeric last-activity cookies", () => {
    const validCookieStore = {
      get(name: string) {
        if (name === ADMIN_IDLE_COOKIE) {
          return { value: "1700000000000" };
        }

        return undefined;
      },
    };
    const invalidCookieStore = {
      get(name: string) {
        if (name === ADMIN_IDLE_COOKIE) {
          return { value: "not-a-number" };
        }

        return undefined;
      },
    };

    expect(readLastActivityMs(validCookieStore)).toBe(1700000000000);
    expect(readLastActivityMs(invalidCookieStore)).toBeNull();
  });

  it("expires sessions only after the configured idle timeout", () => {
    const now = 2_000_000;
    const justInsideWindow = now - ADMIN_IDLE_TIMEOUT_MS;
    const justOutsideWindow = now - ADMIN_IDLE_TIMEOUT_MS - 1;

    expect(isIdleExpired(null, now)).toBe(false);
    expect(isIdleExpired(justInsideWindow, now)).toBe(false);
    expect(isIdleExpired(justOutsideWindow, now)).toBe(true);
  });
});
