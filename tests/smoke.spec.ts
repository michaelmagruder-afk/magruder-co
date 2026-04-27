import { test, expect } from "@playwright/test";

test("magruder.co renders correctly", async ({ page }) => {
  const response = await page.goto("https://magruder.co", {
    waitUntil: "networkidle",
    timeout: 30000,
  });

  // HTTP 200
  expect(response?.status()).toBe(200);

  // Content-Type is text/html (not text/plain)
  const contentType = response?.headers()["content-type"] ?? "";
  expect(contentType).toContain("text/html");

  // Page title
  await expect(page).toHaveTitle(/Magruder/);

  // Key structural elements present
  await expect(page.locator("nav")).toBeVisible();
  await expect(page.locator(".hero")).toBeVisible();

  // Brand name visible in hero (scoped to avoid strict mode violation)
  await expect(page.locator(".hero h1").first()).toBeVisible();

  // GenGov OS copy present (v1.3 marker)
  const bodyText = await page.evaluate(() => document.body.innerText);
  expect(bodyText).toContain("GenGov OS");
  expect(bodyText).toContain("1,976");
});
