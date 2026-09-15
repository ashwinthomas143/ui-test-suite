import { test, expect } from '@playwright/test';
import { TodoPage } from './todomvc.page';

// Visual regression testing: a screenshot is compared pixel-by-pixel
// against a committed baseline image, catching *unintentional* layout/
// style changes that functional assertions (which only check text/state,
// not appearance) never would. Deliberately scoped to the app's empty
// initial state — the one state guaranteed not to depend on timing,
// animation, or data — because screenshot tests are genuinely more
// fragile than functional ones: font rendering, OS anti-aliasing, and
// even a 1px layout shift will fail them. Baselines are generated
// per-platform (`npx playwright test --update-snapshots`) and are
// expected to need regeneration if this runs on a different OS/browser
// build than they were captured on — that fragility is a real, known
// limitation of this technique, not a bug in this test.
test('the empty todo app matches its visual baseline', async ({ page }) => {
  const todo = new TodoPage(page);
  await todo.goto();
  await expect(page).toHaveScreenshot('todomvc-empty.png');
});
