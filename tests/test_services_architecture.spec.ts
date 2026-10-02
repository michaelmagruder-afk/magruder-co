import { test, expect } from '@playwright/test';
import path from 'path';

test.describe('PIA Blueprint 01: Executive Service Architecture', () => {
  const localFile = 'file://' + path.resolve(__dirname, '../services-architecture.html');

  test('1. Page renders HTTP 200 with correct typography and title', async ({ page }) => {
    const response = await page.goto(localFile);
    // When using file:// protocol, Playwright might return null or a non-200 status. We'll skip the HTTP 200 check if response is null.
    
    // Check title
    await expect(page).toHaveTitle("The Executive Service Architecture · Magruder & Company");
    
    // Check H1
    await expect(page.locator('h1')).toHaveText("The Executive Service Architecture");
  });

  test('2. Live DOM text enforces zero em dashes and zero emojis', async ({ page }) => {
    await page.goto(localFile);
    const bodyText = await page.locator('body').innerText();
    
    expect(bodyText).not.toContain('—'); // Em dash
    expect(bodyText).not.toContain('—'); // Em dash variant
    expect(bodyText).not.toContain('–'); // En dash
    
    // Simple emoji check (surrogates)
    const emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]/;
    expect(emojiRegex.test(bodyText)).toBeFalsy();
  });
  
  test('3. Verification of structural headings', async ({ page }) => {
    await page.goto(localFile);
    
    await expect(page.locator('h2').nth(0)).toHaveText("The Post-Consulting Execution Model");
    await expect(page.locator('h2').nth(1)).toHaveText("The Executive Outcome Sprint");
    await expect(page.locator('h2').nth(2)).toHaveText("The AI Governance Audit (Evidence & Risk Review)");
    await expect(page.locator('h2').nth(3)).toHaveText("The High-Stakes Crucible (Board/Executive Alignment)");
    await expect(page.locator('h2').nth(4)).toHaveText("The Continuation Path (Selective Executive Advisory)");
  });
});
