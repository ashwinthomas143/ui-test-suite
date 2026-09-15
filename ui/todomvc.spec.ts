import { test, expect } from '@playwright/test';
import { TodoPage } from './todomvc.page';

// A real Playwright end-to-end suite (browser automation, not API
// requests) against the official Playwright team's own TodoMVC demo app
// — the same app used in Playwright's own getting-started tutorial.
//
// Every assertion below uses `expect(locator).toHaveText(...)` rather than
// snapshotting `.allTextContents()` and comparing with `toEqual` — the
// locator-based assertion auto-retries until the app's post-navigation
// re-render settles, instead of racing a manual snapshot against it.

test.beforeEach(async ({ page }) => {
  const todo = new TodoPage(page);
  await todo.goto();
});

test('adding a todo shows it in the list', { tag: '@smoke' }, async ({ page }) => {
  const todo = new TodoPage(page);
  await todo.addTodo('Buy milk');
  await expect(todo.items).toHaveCount(1);
  await expect(todo.titleLocator).toHaveText(['Buy milk']);
});

test('completing a todo and filtering to Active hides it', async ({ page }) => {
  const todo = new TodoPage(page);
  await todo.addTodo('Buy milk');
  await todo.addTodo('Walk the dog');
  await todo.toggleComplete('Buy milk');

  await todo.filterBy('Active');
  await expect(todo.titleLocator).toHaveText(['Walk the dog']);

  await todo.filterBy('Completed');
  await expect(todo.titleLocator).toHaveText(['Buy milk']);
});

test('deleting a todo removes it from the list', async ({ page }) => {
  const todo = new TodoPage(page);
  await todo.addTodo('Buy milk');
  await todo.addTodo('Walk the dog');
  await todo.remove('Buy milk');

  await todo.filterBy('All');
  await expect(todo.titleLocator).toHaveText(['Walk the dog']);
});

test('todos persist across a page reload (localStorage)', async ({ page }) => {
  const todo = new TodoPage(page);
  await todo.addTodo('Survive a refresh');
  await page.reload();
  await expect(todo.titleLocator).toHaveText(['Survive a refresh']);
});
