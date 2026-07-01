// BrowserStack real-device smoke suite (@playwright/test runner, driven by browserstack-node-sdk).
// A small sanity check that the built UMD bundle parses and runs across the real-browser matrix.
// The main per-engine coverage lives in the Vitest+Playwright suite (test/unit/showdown*.js).
//
// showdown is injected into a blank page via addScriptTag (Playwright reads the file locally and
// injects its contents), so there is NO localhost server and NO BrowserStack Local tunnel needed.

const { test, expect } = require('@playwright/test');
const path = require('path');

const BUNDLE = path.resolve(__dirname, '../../dist/showdown.js');

test.beforeEach(async ({ page }) => {
  await page.setContent('<!doctype html><html><head></head><body></body></html>');
  await page.addScriptTag({ path: BUNDLE });
});

test('makeHtml renders a heading', async ({ page }) => {
  const html = await page.evaluate(() => new window.showdown.Converter().makeHtml('# hi'));
  expect(html).toContain('<h1');
  expect(html).toContain('hi');
});

test('makeHtml renders emphasis', async ({ page }) => {
  const html = await page.evaluate(() => new window.showdown.Converter().makeHtml('**bold** and _em_'));
  expect(html).toContain('<strong>bold</strong>');
  expect(html).toContain('<em>em</em>');
});

test('makeHtml renders a gfm feature (strikethrough)', async ({ page }) => {
  const html = await page.evaluate(() => {
    const c = new window.showdown.Converter({ strikethrough: true });
    return c.makeHtml('~~struck~~');
  });
  expect(html).toContain('<del>struck</del>');
});

test('makeMarkdown round-trips a heading (uses the DOM)', async ({ page }) => {
  const md = await page.evaluate(() => new window.showdown.Converter().makeMarkdown('<h1>hi</h1>').trim());
  expect(md).toBe('# hi');
});
