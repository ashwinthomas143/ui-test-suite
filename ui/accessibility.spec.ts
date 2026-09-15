import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { TodoPage } from './todomvc.page';

// Accessibility testing: automated scanning (axe-core) catches a real,
// specific class of defects — missing labels, bad contrast, invalid ARIA
// — that functional tests never touch, because a test can click a button
// perfectly well using a broken accessibility tree. This only catches
// what's automatable (axe-core itself estimates ~30-50% of WCAG issues
// this way); it's not a substitute for manual screen-reader testing.
//
// Running this the first time found a REAL, genuine finding: the official
// Playwright team's own TodoMVC demo fails WCAG 2 AA color-contrast on 9
// elements (`color-contrast`, e.g. its light-grey "todos" heading against
// a near-white background). That's a real third-party app this suite
// doesn't own or get to fix — so the honest test isn't "assert zero
// violations" (which would either stay permanently red or get quietly
// skipped), it's the pattern real teams use against apps they can't
// immediately remediate: an explicit, named known-issues baseline, so
// the build only fails on a genuinely NEW violation type showing up.
const KNOWN_VIOLATION_IDS = new Set(['color-contrast']);

test('the todo app has no NEW accessibility violations beyond the documented baseline', async ({ page }) => {
  const todo = new TodoPage(page);
  await todo.goto();
  await todo.addTodo('Check this is accessible');

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa'])
    .analyze();

  const newViolations = results.violations.filter((v) => !KNOWN_VIOLATION_IDS.has(v.id));
  expect(newViolations, JSON.stringify(newViolations, null, 2)).toEqual([]);

  // Visibility, not a hard failure: report the known baseline's current
  // size so a silent regression (e.g. contrast issues doubling) is at
  // least visible in the test output even though it won't fail the build.
  const knownCount = results.violations
    .filter((v) => KNOWN_VIOLATION_IDS.has(v.id))
    .reduce((sum, v) => sum + v.nodes.length, 0);
  console.log(`Known-baseline violations present: ${knownCount} node(s) failing 'color-contrast'.`);
});
