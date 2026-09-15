import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './ui',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // The `json` reporter feeds `scripts/summarize-results.js` — an
  // optional AI-assisted triage step (see that file and the README).
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ['json', { outputFile: 'test-results/results.json' }],
  ],
  use: {
    ...devices['Desktop Chrome'],
    // Evidence for the Reporting layer: a trace is only kept when a
    // test actually fails, so passing runs stay cheap.
    trace: 'retain-on-failure',
  },
});
