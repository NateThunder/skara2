import { expect, test } from "@playwright/test";

test.describe("admin auth failure flows", () => {
  test("redirects unauthenticated users away from /admin", async ({ page }) => {
    await page.goto("/admin");

    await expect(page).toHaveURL(/\/login\?redirectTo=%2Fadmin$/);
    await expect(page.getByRole("heading", { name: "Sign in to dashboard" })).toBeVisible();
  });

  test("shows the expired-session error state on the login page", async ({ page }) => {
    await page.goto("/login?error=session-expired&redirectTo=/admin");

    await expect(page.getByText("Your admin session expired after 20 minutes of inactivity. Please sign in again.")).toBeVisible();
    await expect(page.getByRole("button", { name: "Sign in" })).toBeVisible();
  });

  test("rejects unauthenticated admin API requests with 401", async ({ request }) => {
    const response = await request.get("/api/admin/content");

    expect(response.status()).toBe(401);
    await expect(response.json()).resolves.toEqual({
      error: "Unauthorized",
    });
  });
});
