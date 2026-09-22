# ui-test-suite

[![CI](https://github.com/ashwinthomas143/ui-test-suite/actions/workflows/ci.yml/badge.svg)](https://github.com/ashwinthomas143/ui-test-suite/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

A real Playwright/TypeScript **browser-automation** test suite — E2E
functional testing, network mocking, automated accessibility scanning,
and visual regression, all in one standalone repo. This is the UI
counterpart to `api-test-suite` (a separate repo, on purpose — see "Why
two repos" below).

## Why this exists

This isn't a tutorial-follow-along. It's a proof project built to
demonstrate real browser-automation ability, and something more
specific — the habit of verifying what an app *actually does*, not just
what it appears to do, which carries over directly from real QA work (see
the case log in [my portfolio](https://claude.ai/artifact/Fnnwnje4ZZfoczcGAsgLsF)).
Running the accessibility scan here for the first time surfaced a real,
genuine finding (see below) — this isn't staged.

## Why two repos, not one

UI and API testing are different disciplines with different tools,
different runtimes, and — in this case — literally zero shared code.
Nesting them under one project misrepresents both: a recruiter looking
for API-testing skill shouldn't have to wade through browser-automation
code to find it, and vice versa. `api-test-suite` and `ui-test-suite` are
each named for exactly what they contain.

## Testing types covered

| Type | Where | Notes |
|---|---|---|
| E2E / functional | `todomvc.spec.ts` | Page Object Model, auto-retrying assertions |
| Network mocking | `network-mocking.spec.ts` | Mock / Modify a real API's response |
| Accessibility | `accessibility.spec.ts` | Automated axe-core scan, WCAG 2 A/AA |
| Visual regression | `visual.spec.ts` | Pixel-diff against a committed baseline |
| Smoke | tests tagged `@smoke` | `npm run test:smoke` — fast subset |
| BDD / Gherkin | `features/add-todo.feature` | One example scenario via playwright-bdd, reusing the existing Page Object |

## What's tested

- `todomvc.page.ts` + `todomvc.spec.ts` — a Page Object Model and E2E
  suite against the [official Playwright team's own TodoMVC demo](https://demo.playwright.dev/todomvc/)
  (add/complete/filter/delete/reload-persistence), using Playwright's
  auto-retrying `expect(locator).toHaveText()` assertions rather than
  manually snapshotting text and comparing it — the first version of this
  suite raced the app's post-navigation re-render and flaked until that
  was fixed by switching to locator-based assertions.
- `network-mocking.spec.ts` — a minimal local page (`fixtures/post-viewer.html`)
  that fetches from a public API (JSONPlaceholder), used to demonstrate
  Playwright's network-control techniques: **Mock** (fake an unreachable
  API / a 500 response), **Modify** (let the real request happen, then
  edit the response before it reaches the page), and a live contrast case
  with no mocking at all.
- `accessibility.spec.ts` — an automated axe-core scan (WCAG 2 A/AA). The
  first run surfaced a real finding: the official TodoMVC demo itself
  fails color-contrast on 9 elements. Since this suite doesn't own that
  app, it asserts against an explicit known-issues baseline (fail only on
  a genuinely *new* violation type) rather than a false "zero violations"
  that would either stay permanently red or get quietly skipped.
- `visual.spec.ts` — a pixel-diff screenshot test of the app's empty
  state against a committed baseline. Scoped to the one state with no
  timing/animation/data dependency, because screenshot baselines are
  genuinely platform-sensitive — regenerate with
  `npx playwright test --update-snapshots` if it fails on a different
  OS/browser build than it was captured on.
- `features/add-todo.feature` + `features/steps/add-todo.steps.ts` — one
  Given/When/Then scenario via [`playwright-bdd`](https://vitalets.github.io/playwright-bdd/),
  showing BDD-style specs on top of this suite rather than instead of
  it: the step definitions reuse `todomvc.page.ts` through a fixture
  (`features/fixtures.ts`) instead of re-deriving locators, so BDD and
  the Page Object Model compose. This is one example demonstrating the
  pattern, not a BDD rewrite of the suite — the rest of the suite stays
  plain Playwright/TypeScript on purpose.

## How this was built

Built by directing Claude (Anthropic's AI) rather than hand-writing every
line — deliberately, as part of getting sharper at using AI tools well
rather than pretending not to. The discipline applied: every test's
assertions and the reasoning behind them were reviewed and understood
before being accepted, not just run once and left alone because they
passed — including the flaky-test race condition above, which was
actually diagnosed and fixed properly rather than papered over with a
sleep or retry.

## Running it

```bash
npm ci
npx playwright install chromium
npx playwright test          # full suite
npm run test:smoke           # fast @smoke subset only
```

## Optional: AI-assisted failure triage

`npm run test:summarize` reads the JSON report Playwright already writes
and prints a pass/fail summary. If `ANTHROPIC_API_KEY` is set, it also
asks Claude to group related failures and suggest a likely cause; without
a key, it prints the same facts without that step. The test suite itself
never requires this key — it's a genuinely optional, additive tool, not a
requirement to run the tests.
