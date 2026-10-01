import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests/image-sequence/browser',
  testMatch: '**/*.spec.ts',
  outputDir: '.context/image-sequence-results',
  fullyParallel: false,
  workers: 1,
  timeout: 30_000,
  use: {
    baseURL: 'http://localhost:4178',
    viewport: { width: 1000, height: 800 },
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
    { name: 'webkit', use: { browserName: 'webkit' } },
  ],
  webServer: {
    command:
      'pnpm exec vite --config tests/image-sequence/browser/vite.config.mts',
    port: 4178,
    reuseExistingServer: false,
  },
})
