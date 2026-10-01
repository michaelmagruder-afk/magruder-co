import { test, expect } from "@playwright/test";
import path from "path";

test.describe("Magruder.co Estate Reconciliation & Quality Audit", () => {
  const filePath = "file://" + path.resolve(__dirname, "../index.html");

  test.beforeEach(async ({ page }) => {
    await page.goto(filePath, { waitUntil: "domcontentloaded" });
  });

  test("1. Page title and brand mark integrity", async ({ page }) => {
    await expect(page).toHaveTitle(/Magruder & Company/);
    const navBrand = page.locator(".nav-brand");
    await expect(navBrand).toBeVisible();
    await expect(navBrand).toContainText(/Magruder/i);
    await expect(navBrand).toContainText(/Company/i);
  });

  test("2. Hero section renders with exact $1M metric and no broken pricing", async ({ page }) => {
    const hero = page.locator(".hero");
    await expect(hero).toBeVisible();
    const heroH1 = hero.locator("h1");
    await expect(heroH1).toBeVisible();
    await expect(heroH1).toContainText("AI Governance Starts at the Executive Table");
    
    const heroLead = page.locator(".hero-lead");
    await expect(heroLead).toContainText("$1M");
    
    // Assert zero commodity prices in hero or body
    const bodyText = await page.evaluate(() => document.body.innerText);
    expect(bodyText).not.toContain("$24,500");
    expect(bodyText).not.toContain("24,500");
  });

  test("3. Market Condition Statistics strip renders with all 4 verified citations", async ({ page }) => {
    const marketSection = page.locator("#market");
    await expect(marketSection).toBeVisible();
    
    const statsGrid = marketSection.locator(".stats-grid");
    await expect(statsGrid).toBeVisible();
    
    const statCards = marketSection.locator(".stat-card");
    await expect(statCards).toHaveCount(4);
    
    await expect(statCards.nth(0)).toContainText("95%");
    await expect(statCards.nth(0)).toContainText("MIT NANDA Report");
    
    await expect(statCards.nth(1)).toContainText("12%");
    await expect(statCards.nth(1)).toContainText("PwC Executive Study");
    
    await expect(statCards.nth(2)).toContainText("75%");
    await expect(statCards.nth(2)).toContainText("Writer / Harris Poll");
    
    await expect(statCards.nth(3)).toContainText("78%");
    await expect(statCards.nth(3)).toContainText("Grant Thornton Audit");
  });

  test("4. 3+1 Canonical Services Architecture renders correctly", async ({ page }) => {
    const services = page.locator("#services");
    await expect(services).toBeVisible();
    
    const serviceCards = services.locator(".service-card");
    await expect(serviceCards).toHaveCount(4);
    
    // Service 01: Constraint Map
    await expect(serviceCards.nth(0)).toContainText("Service 01");
    await expect(serviceCards.nth(0)).toContainText("Constraint Map");
    
    // Service 02: GenGov OS
    await expect(serviceCards.nth(1)).toContainText("Service 02");
    await expect(serviceCards.nth(1)).toContainText("GenGov OS");
    await expect(serviceCards.nth(1)).toContainText("CACI");
    
    // Service 03: H2AI
    await expect(serviceCards.nth(2)).toContainText("Service 03");
    await expect(serviceCards.nth(2)).toContainText("H2AI");
    
    // Specialized Crucible: The One Friday Constraint
    await expect(serviceCards.nth(3)).toContainText("The One Friday Constraint");
    await expect(serviceCards.nth(3)).toContainText("Outcome Sprint");
  });

  test("5. Proof of Work telemetry grid renders all 4 empirical metrics", async ({ page }) => {
    const proof = page.locator("#proof");
    await expect(proof).toBeVisible();
    
    const proofCards = proof.locator(".proof-card");
    await expect(proofCards).toHaveCount(4);
    
    await expect(proofCards.nth(0)).toContainText("100");
    await expect(proofCards.nth(0)).toContainText("Decision Models");
    
    await expect(proofCards.nth(1)).toContainText("1,976+");
    await expect(proofCards.nth(1)).toContainText("Archived Sessions");
    
    await expect(proofCards.nth(2)).toContainText("4");
    await expect(proofCards.nth(2)).toContainText("Judicial Nodes");
    
    await expect(proofCards.nth(3)).toContainText("100%");
    await expect(proofCards.nth(3)).toContainText("Sole Practitioner");
  });

  test("6. Practitioner Profile renders Michael Magruder and pedigree", async ({ page }) => {
    const practitioner = page.locator("#practitioner");
    await expect(practitioner).toBeVisible();
    await expect(practitioner).toContainText("Michael Magruder");
    await expect(practitioner).toContainText("Razorfish");
    await expect(practitioner).toContainText("Lifeway");
  });

  test("7. Universal Platform Sovereignty renders 5 vendor marks with functional subtext", async ({ page }) => {
    const platforms = page.locator("#platforms");
    await expect(platforms).toBeVisible();
    
    const cards = platforms.locator(".platform-card");
    await expect(cards).toHaveCount(5);
    
    await expect(cards.nth(0)).toContainText("Anthropic");
    await expect(cards.nth(1)).toContainText("OpenAI");
    await expect(cards.nth(2)).toContainText("Microsoft");
    await expect(cards.nth(3)).toContainText("Google Cloud");
    await expect(cards.nth(4)).toContainText("Air-Gapped Sovereign");
  });

  test("8. Complete Link Audit: All in-page anchors resolve to authentic DOM elements", async ({ page }) => {
    const anchorLinks = await page.$$eval("a[href^='#']", (elements) =>
      elements.map((el) => el.getAttribute("href")!).filter((href) => href && href.length > 1)
    );

    expect(anchorLinks.length).toBeGreaterThan(5);

    for (const href of anchorLinks) {
      const targetId = href.replace("#", "");
      const targetEl = page.locator(`#${targetId}`);
      await expect(targetEl, `Target element ${href} should exist in DOM`).toHaveCount(1);
    }
  });

  test("9. Complete Link Audit: All article links are valid anchor tags pointing to authentic endpoints", async ({ page }) => {
    const articleLinks = await page.$$eval(".article-item", (elements) =>
      elements.map((el) => ({
        tag: el.tagName.toLowerCase(),
        href: el.getAttribute("href") || "",
        target: el.getAttribute("target"),
      }))
    );

    expect(articleLinks.length).toBeGreaterThanOrEqual(14);

    for (const link of articleLinks) {
      // Must be an authentic anchor tag
      expect(link.tag).toBe("a");
      expect(link.target).toBe("_blank");
      expect(link.href).toMatch(/^\/|https:\/\/magruder\.co\//);
    }
  });

  test("10. Strict MCo Typography & Invariant Standards: Zero em dashes and zero emojis", async ({ page }) => {
    const bodyText = await page.evaluate(() => document.body.innerText);

    // Em dash check: \u2014 (em dash), \u2013 (en dash)
    const hasEmDash = bodyText.includes("\u2014") || bodyText.includes("\u2013");
    expect(hasEmDash, "Body text must have ZERO em dashes").toBe(false);

    // Emoji check
    const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    const hasEmoji = emojiRegex.test(bodyText);
    expect(hasEmoji, "Body text must have ZERO emojis").toBe(false);
  });

  test("11. SEO Canonical tag and Schema.org JSON-LD structured data", async ({ page }) => {
    const canonical = page.locator("link[rel='canonical']");
    await expect(canonical).toHaveAttribute("href", "https://magruder.co/");

    const jsonLd = await page.locator("script[type='application/ld+json']").textContent();
    expect(jsonLd).toBeTruthy();
    const parsed = JSON.parse(jsonLd!);
    expect(parsed["@context"]).toBe("https://schema.org");
    expect(parsed["@graph"].some((item: any) => item["@type"] === "Organization")).toBe(true);
  });

  test("12. Mobile viewport rendering with zero horizontal overflow", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.reload({ waitUntil: "domcontentloaded" });

    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1);
  });

  test("13. Netlify Contact Form Integrity: Zero email harvesting exposure and valid form schema", async ({ page }) => {
    const form = page.locator("form[name='contact']");
    await expect(form).toHaveCount(1);
    await expect(form).toHaveAttribute("data-netlify", "true");
    await expect(form).toHaveAttribute("data-netlify-honeypot", "bot-field");

    // Required fields
    await expect(form.locator("input[name='name']")).toBeVisible();
    await expect(form.locator("input[name='company']")).toBeVisible();
    await expect(form.locator("input[name='email']")).toBeVisible();
    await expect(form.locator("textarea[name='context']")).toBeVisible();

    // Assert zero mailto links on the entire page
    const mailtoLinks = await page.locator("a[href^='mailto:']").count();
    expect(mailtoLinks, "Entire page must contain ZERO mailto links to prevent bot scraping").toBe(0);

    // Assert Michael personal email is not exposed in body
    const bodyText = await page.evaluate(() => document.body.innerText);
    expect(bodyText).not.toContain("michael@magruder.co");
  });

  test("14. Desktop Navigation Bar Layout: Single-line rendering with zero wrap collision", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(filePath, { waitUntil: "domcontentloaded" });

    const brandBox = await page.locator(".nav-brand").boundingBox();
    const navBox = await page.locator("nav").boundingBox();
    expect(brandBox).toBeTruthy();
    expect(navBox).toBeTruthy();

    // Nav must be positioned strictly to the right of brand with zero wrap collision
    expect(navBox!.x).toBeGreaterThan(brandBox!.x + brandBox!.width);

    // Nav and brand must be vertically aligned on the single top header bar
    const brandCenterY = brandBox!.y + brandBox!.height / 2;
    const navCenterY = navBox!.y + navBox!.height / 2;
    expect(Math.abs(brandCenterY - navCenterY)).toBeLessThan(15);
  });

  test("15. Executive Monograph Canon: Full-depth hydration and graphic exhibit rendering", async ({ page }) => {
    const monographs = [
      { file: "the-operating-partners-q3-reality-check.html", minLength: 6000, img: "/images/the_traceability_bridge.png" },
      { file: "executive-fluency-and-strategic-clarity.html", minLength: 9000, img: "/images/mco_elt_fluency_and_clarity_matrix.png" },
      { file: "the-executive-governed-ai-manifest.html", minLength: 8000, img: "/images/the_ai_reasoning_trap.png" },
      { file: "the-record-is-not-the-memory.html", minLength: 7000, img: "/images/mco_governed_corporate_memory_pipeline.png" },
      { file: "the-five-crises-of-modern-enterprise-ai-governance.html", minLength: 30000, img: "../images/insights/MCo_Five_Crises_Risograph_Print.png" }
    ];

    for (const m of monographs) {
      const fullPath = "file://" + path.resolve(__dirname, "../insights", m.file);
      await page.goto(fullPath, { waitUntil: "domcontentloaded" });

      const text = await page.evaluate(() => document.body.textContent || "");
      expect(text.length, `${m.file} must be fully hydrated with substantive depth`).toBeGreaterThan(m.minLength);

      // Invariants: Zero em dashes & zero emojis
      expect(text.includes("\u2014") || text.includes("\u2013"), `${m.file} must have zero em/en dashes`).toBe(false);
      const emojiRegex = /[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
      expect(emojiRegex.test(text), `${m.file} must have zero emojis`).toBe(false);

      // Graphic exhibit present in DOM
      const imgSelector = `img[src='${m.img}']`;
      const imgCount = await page.locator(imgSelector).count();
      expect(imgCount, `${m.file} must contain exhibit image ${m.img}`).toBeGreaterThanOrEqual(1);
    }
  });

  test("16. Author Byline Invariant: All articles link to Michael Magruder LinkedIn profile", async ({ page }) => {
    const articles = [
      "insights/the-friday-crucible-q4-executive-challenge.html",
      "insights/the-operating-partners-q3-reality-check.html",
      "insights/executive-fluency-and-strategic-clarity.html",
      "insights/the-executive-governed-ai-manifest.html",
      "insights/the-record-is-not-the-memory.html",
      "insights/the-five-crises-of-modern-enterprise-ai-governance.html",
      "constraint-01.html",
      "constraint-02.html",
      "constraint-03.html",
      "constraint-04.html",
      "constraint-05.html",
      "insights/manufacturing-01.html",
      "insights/manufacturing-02.html",
      "insights/manufacturing-03.html",
      "insights/manufacturing-04.html",
      "manufacturing.html",
      "q2-imperative.html",
      "q3-imperative.html"
    ];

    for (const relPath of articles) {
      const fullPath = "file://" + path.resolve(__dirname, "../", relPath);
      await page.goto(fullPath, { waitUntil: "domcontentloaded" });

      const authorLink = page.locator("a[href='https://www.linkedin.com/in/michaeljmagruder/']");
      const linkCount = await authorLink.count();
      expect(linkCount, `${relPath} must feature at least one link to Michael Magruder LinkedIn profile`).toBeGreaterThanOrEqual(1);

      // Verify author name text
      const firstLinkText = await authorLink.first().textContent();
      expect(firstLinkText, `${relPath} author link text must contain 'Michael Magruder'`).toContain("Michael Magruder");

      // Verify security attributes
      await expect(authorLink.first()).toHaveAttribute("target", "_blank");
      await expect(authorLink.first()).toHaveAttribute("rel", "noopener");
    }
  });
});

