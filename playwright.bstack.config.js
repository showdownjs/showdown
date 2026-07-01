// Playwright Test config for the BrowserStack smoke suite. Browser provisioning is handled by
// browserstack-node-sdk (see browserstack.yml) — this config only points at the spec dir.
const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './test/browserstack',
  testMatch: '**/*.spec.js',
  timeout: 60000,
  fullyParallel: false,
  reporter: 'line'
});
