import { defineConfig } from '@playwright/test'

/**
 * Playwright Configuration for Space Manager
 *
 * This configuration is set up for testing Node.js backend services
 * in an Electron + Vite + React + TypeScript environment
 */
export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',

  // Run tests in files in parallel
  fullyParallel: true,

  // Fail the build on CI if you accidentally left test.only in the source code
  forbidOnly: !!process.env.CI,

  // Retry on CI only
  retries: process.env.CI ? 2 : 0,

  // Opt out of parallel tests on CI
  workers: process.env.CI ? 1 : undefined,

  // Reporter to use
  reporter: 'html',

  // Timeout for each test
  timeout: 30000,

  use: {
    // Base URL to use in actions like `await page.goto('/')`
    // baseURL: 'http://127.0.0.1:3000',

    // Collect trace when retrying the failed test
    trace: 'on-first-retry',
  },
})
