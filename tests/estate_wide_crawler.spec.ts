import { test, expect } from "@playwright/test";
import fs from "fs";
import path from "path";

test.describe("Estate-Wide Comprehensive Link & Anchor Crawler", () => {
  const repoRoot = path.resolve(__dirname, "..");
  
  // Discover all published HTML files
  const htmlFiles: string[] = [];
  function discoverHtml(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== "node_modules" && entry.name !== ".git") {
          discoverHtml(fullPath);
        }
      } else if (entry.name.endsWith(".html") && !entry.name.endsWith("-preview.html") && !/-v[2-5]\.html$/.test(entry.name)) {
        htmlFiles.push(fullPath);
      }
    }
  }
  discoverHtml(repoRoot);

  test(`1. Comprehensive Crawler: Crawls all ${htmlFiles.length} pages and verifies in-page anchors and internal routes`, async ({ page }) => {
    let totalLinksAudited = 0;
    const failures: { file: string; error: string }[] = [];

    for (const filePath of htmlFiles) {
      const relFile = path.relative(repoRoot, filePath);
      const fileUrl = "file://" + filePath;
      await page.goto(fileUrl, { waitUntil: "domcontentloaded" });

      // Gather all DOM IDs on page
      const domIds = new Set(await page.evaluate(() => {
        return Array.from(document.querySelectorAll("[id]")).map(el => el.id);
      }));

      // Gather all links
      const links = await page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll("a[href]")).map(a => a.getAttribute("href")!);
        const linkTags = Array.from(document.querySelectorAll("link[href]")).map(l => l.getAttribute("href")!);
        return [...anchors, ...linkTags];
      });

      for (const rawHref of links) {
        const href = (rawHref || "").trim();
        if (!href || href.startsWith("javascript:") || href.startsWith("tel:") || href.startsWith("mailto:")) {
          continue;
        }

        totalLinksAudited++;

        // In-page anchor check
        if (href.startsWith("#")) {
          const anchor = href.slice(1);
          if (anchor && !domIds.has(anchor)) {
            failures.push({ file: relFile, error: `Broken in-page anchor: ${href}` });
          }
          continue;
        }

        // Internal relative or absolute path check
        if (href.startsWith("/") || href.startsWith("https://magruder.co") || !href.startsWith("http")) {
          const cleanRoute = href.replace("https://magruder.co", "").split("#")[0].split("?")[0];
          if (!cleanRoute || cleanRoute === "/") {
            continue;
          }

          let diskTarget: string;
          if (cleanRoute.startsWith("/")) {
            diskTarget = path.join(repoRoot, cleanRoute.slice(1));
          } else {
            diskTarget = path.resolve(path.dirname(filePath), cleanRoute);
          }

          const fileExists = fs.existsSync(diskTarget) || fs.existsSync(diskTarget + ".html");
          if (!fileExists) {
            failures.push({ file: relFile, error: `Broken internal link: ${href} (target not found at ${diskTarget})` });
          }
        }
      }
    }

    expect(totalLinksAudited).toBeGreaterThan(400);
    expect(failures, `Expected 0 broken links across entire estate, found: ${JSON.stringify(failures, null, 2)}`).toHaveLength(0);
  });
});
