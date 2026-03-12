import { expect, test } from "@playwright/test";

test.describe("homepage PDF v2 structure", () => {
  test("renders updated header tabs and keeps Book Now CTA", async ({ page }) => {
    await page.goto("/");

    const desktopBandLink = page.getByRole("link", { name: "The Band" }).first();
    if (!(await desktopBandLink.isVisible().catch(() => false))) {
      await page.getByRole("button", { name: "Open menu" }).click();
    }

    for (const label of ["Home", "The Band", "Media", "Services", "FAQs", "Reviews", "Contact"]) {
      await expect(page.getByRole("link", { name: label }).first()).toBeVisible();
    }

    await expect(page.getByRole("link", { name: "Book Now" }).first()).toBeVisible();

    await page.getByRole("link", { name: "Services" }).first().click();
    await expect(page).toHaveURL(/#services$/);
  });

  test("shows FAQs to the right of contact form on desktop", async ({ page }) => {
    await page.goto("/");

    const contactSection = page.locator("#contact");
    await contactSection.scrollIntoViewIfNeeded();

    const formCard = page.getByTestId("contact-form-card");
    const faqCard = page.getByTestId("faq-card");
    await expect(formCard).toBeVisible();
    await expect(faqCard).toBeVisible();

    const formBox = await formCard.boundingBox();
    const faqBox = await faqCard.boundingBox();

    expect(formBox).not.toBeNull();
    expect(faqBox).not.toBeNull();

    if (!formBox || !faqBox) {
      throw new Error("Expected contact form and FAQ cards to have measurable layouts.");
    }

    expect(faqBox.x).toBeGreaterThan(formBox.x + 40);
    expect(Math.abs(faqBox.y - formBox.y)).toBeLessThan(80);
  });
});

test.describe("homepage FAQ layout on mobile", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("stacks FAQ below the contact form", async ({ page }) => {
    await page.goto("/");

    const contactSection = page.locator("#contact");
    await contactSection.scrollIntoViewIfNeeded();

    const formCard = page.getByTestId("contact-form-card");
    const faqCard = page.getByTestId("faq-card");
    await expect(formCard).toBeVisible();
    await expect(faqCard).toBeVisible();

    const formBox = await formCard.boundingBox();
    const faqBox = await faqCard.boundingBox();

    expect(formBox).not.toBeNull();
    expect(faqBox).not.toBeNull();

    if (!formBox || !faqBox) {
      throw new Error("Expected contact form and FAQ cards to have measurable layouts.");
    }

    expect(faqBox.y).toBeGreaterThan(formBox.y + formBox.height - 8);
    expect(Math.abs(faqBox.x - formBox.x)).toBeLessThan(24);
  });
});
