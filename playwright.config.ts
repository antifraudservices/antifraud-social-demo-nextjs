import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  reporter: 'line',
  use: {
    baseURL: 'http://127.0.0.1:3620',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1487, height: 1058 },
      },
    },
    {
      name: 'mobile',
      use: {
        ...devices['iPhone 13'],
        browserName: 'chromium',
      },
    },
  ],
  webServer: {
    command: 'npm run build && npm run start',
    url: 'http://127.0.0.1:3620',
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      ANTIFRAUD_SOCIAL_DEMO_MODE: 'true',
      ANTIFRAUD_SOCIAL_DEPLOYMENT_STAGE: 'test',
      ANTIFRAUD_SOCIAL_DEMO_DELAY_MS: '20',
    },
  },
})
