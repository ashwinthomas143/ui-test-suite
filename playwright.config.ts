import { defineConfig, devices } from '@playwright/test';
import { defineBddConfig } from 'playwright-bdd';

// playwright-bdd generates real Playwright spec files from the
// .feature file(s) below into `.features-gen` (via `npx bddgen`);
// Playwright then runs those generated files like any other test.
// `steps` includes both the step definitions and `fixtures.ts`, since
// the latter exports the custom `test` the generator wires into them.
const bddTestDir = defineBddConfig({
  features: 'ui/features/*.feature',
  steps: ['ui/features/steps/*.ts', 'ui/features/fixtures.ts'],
});

export default defineConfig({
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
  // Two projects because BDD-generated tests live in their own
  // directory (`.features-gen`, output by `bddgen`), separate from the
  // hand-written specs in `./ui` — Playwright projects are the
  // documented way to run both testDirs in one `playwright test` run.
  // The first project is left unnamed (matching this suite's original,
  // implicit single-project setup) so existing committed snapshot
  // filenames in ui/visual.spec.ts-snapshots/ — which encode the
  // project name — keep resolving unchanged.
  projects: [
    { testDir: './ui' },
    { name: 'bdd', testDir: bddTestDir },
  ],
});
