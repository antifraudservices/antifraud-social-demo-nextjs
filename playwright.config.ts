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
  webServer: [
    {
      command: 'npm --prefix ../antifraud-gw-node-ts run build && npm --prefix ../antifraud-gw-node-ts run start',
      url: 'http://127.0.0.1:3700/healthz',
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        ...process.env,
        PORT: '3700',
        ANTIFRAUD_DEMO_MODE: 'true',
        ANTIFRAUD_DEPLOYMENT_STAGE: 'local',
        ANTIFRAUD_DOCUMENT_BACKEND: 'memory',
        ANTIFRAUD_OBJECT_BACKEND: 'memory',
        ANTIFRAUD_COLLECTION_PREFIX: 'antifraud_e2e_social_',
        ANTIFRAUD_DEMO_BFF_TOKENS_JSON: JSON.stringify({
          controller: 'controller-secret-token',
          professional: 'professional-secret-token',
          personal: 'personal-secret-token',
          social: 'social-secret-token',
        }),
      },
    },
    {
      command: 'npm run build && npm run start',
      url: 'http://127.0.0.1:3620',
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        ...process.env,
        ANTIFRAUD_SOCIAL_DEMO_MODE: 'true',
        ANTIFRAUD_SOCIAL_DEPLOYMENT_STAGE: 'test',
        ANTIFRAUD_SOCIAL_DEMO_DELAY_MS: '20',
        ANTIFRAUD_GATEWAY_URL: 'http://127.0.0.1:3700',
        ANTIFRAUD_GATEWAY_BEARER: 'social-secret-token',
      },
    },
  ],
})
