import { defineConfig, devices } from '@playwright/test';

const base = process.env.SITE_BASE ?? '/SAFTG';

export default defineConfig({
  testDir: 'tests/e2e',
  webServer: {
    command: 'npm run build && npm run preview -- --host 127.0.0.1',
    port: 4321,
    reuseExistingServer: !process.env.CI,
  },
  use: { baseURL: `http://127.0.0.1:4321${base}/`, trace: 'retain-on-failure' },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
});
