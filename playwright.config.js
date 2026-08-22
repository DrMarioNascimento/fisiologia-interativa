const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests/visual',
  timeout: 60_000,
  expect: { timeout: 10_000 },
  fullyParallel: false,
  retries: 1,
  reporter: [['html', { outputFolder: 'playwright-report', open: 'never' }], ['list']],
  use: {
    baseURL: process.env.BASE_URL || 'https://drmarionascimento.github.io/fisiologia-interativa',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    { name: 'desktop-1920', use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 } } },
    { name: 'vertical-1440', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 2560 } } },
    { name: 'iphone', use: { ...devices['iPhone 15 Pro Max'] } }
  ],
  outputDir: 'test-results'
});
