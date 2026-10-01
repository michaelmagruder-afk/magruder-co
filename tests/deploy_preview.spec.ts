import { test, expect } from "@playwright/test";

const PREVIEW_URL = "https://deploy-preview-10--magruder-co.netlify.app";

test.describe("Netlify Deploy Preview (PR #10) Verification", () => {
  test("1. Homepage renders HTTP 200 with MCo typography and hero metric", async ({ page }) => {
    const res = await page.goto(PREVIEW_URL, { waitUntil: "networkidle" });
    expect(res?.status()).toBe(200);
    await expect(page).toHaveTitle(/Magruder & Company/);
    await expect(page.locator("h1")).toContainText("AI Governance Starts at the Executive Table");
    await expect(page.locator(".hero-lead")).toContainText("$1M");
  });

  test("2. Canonical 3+1 services and market citations render cleanly", async ({ page }) => {
    await page.goto(PREVIEW_URL, { waitUntil: "domcontentloaded" });
    const services = page.locator("#services .service-card");
    await expect(services).toHaveCount(4);
    
    // Market stats
    const market = page.locator("#market");
    await expect(market).toBeVisible();
    const stats = market.locator(".stat-card");
    await expect(stats).toHaveCount(4);
    await expect(stats.nth(0)).toContainText("MIT NANDA Report");
    await expect(stats.nth(1)).toContainText("PwC Executive Study");
  });

  test("3. Live navigation to newly authored monographs returns HTTP 200", async ({ page }) => {
    // Test Monograph 1
    const res1 = await page.goto(`${PREVIEW_URL}/insights/the-operating-partners-q3-reality-check`, { waitUntil: "networkidle" });
    expect(res1?.status()).toBe(200);
    await expect(page.locator("h1")).toContainText("The Operating Partner's Q3 Reality Check");

    // Test Monograph 2
    const res2 = await page.goto(`${PREVIEW_URL}/insights/executive-fluency-and-strategic-clarity`, { waitUntil: "networkidle" });
    expect(res2?.status()).toBe(200);
    await expect(page.locator("h1")).toContainText(/Executive Fluency/);
    await expect(page.locator("h1")).toContainText(/Strategic Clarity/);
  });

  test("4. Live DOM text enforces zero em dashes and zero emojis", async ({ page }) => {
    await page.goto(PREVIEW_URL, { waitUntil: "domcontentloaded" });
    const bodyText = await page.locator("body").innerText();
    expect(bodyText).not.toContain("—");
    expect(bodyText).not.toContain("–");
    const emojiRegex = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u;
    expect(emojiRegex.test(bodyText)).toBe(false);
  });
});
