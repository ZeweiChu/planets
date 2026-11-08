import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests', testMatch: '**/*.spec.ts',
  timeout: 45_000, expect: { timeout: 15_000 },
  fullyParallel: false, workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4173/planets/',
    trace: 'retain-on-failure', screenshot: 'only-on-failure',
    launchOptions: { args: ['--enable-webgl', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', ...(process.env.SOFTWARE_GL ? ['--use-angle=swiftshader'] : [])] },
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], channel: process.env.CI || process.env.PLAYWRIGHT_BUNDLED ? undefined : 'chrome', viewport: { width: 1440, height: 1000 } } },
    { name: 'mobile', use: { ...devices['Pixel 7'], channel: process.env.CI || process.env.PLAYWRIGHT_BUNDLED ? undefined : 'chrome' } },
  ],
  webServer: {
    command: 'bun run preview --port 4173 --strictPort',
    url: 'http://127.0.0.1:4173/planets/', reuseExistingServer: !process.env.CI,
  },
});
