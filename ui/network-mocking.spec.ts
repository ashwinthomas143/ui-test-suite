import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// A deliberately minimal single-page "app" that fetches from the exact
// same JSONPlaceholder API the `api` project already tests directly —
// so this suite proves the frontend actually handles what that API can
// really return, rather than mocking an imaginary contract. See
// learn-ai/qa-interview-prep/06-playwright-network-control.md for the
// three techniques demonstrated here.
const appHtml = fs.readFileSync(path.join(__dirname, 'fixtures', 'post-viewer.html'), 'utf-8');

test('Mock: the app shows an error state when the API is unreachable', async ({ page }) => {
  await page.route('https://jsonplaceholder.typicode.com/posts/1', (route) =>
    route.abort('failed')
  );
  await page.setContent(appHtml);
  await expect(page.locator('#status')).toHaveText('error');
});

test('Mock: the app shows an error state on a 500 response', async ({ page }) => {
  await page.route('https://jsonplaceholder.typicode.com/posts/1', (route) =>
    route.fulfill({ status: 500, body: 'Internal Server Error' })
  );
  await page.setContent(appHtml);
  await expect(page.locator('#status')).toHaveText('error');
});

test('Modify: editing the real response title renders the edited value', async ({ page }) => {
  await page.route('https://jsonplaceholder.typicode.com/posts/1', async (route) => {
    const response = await route.fetch();
    const body = await response.json();
    body.title = 'Edited by the Modify test';
    await route.fulfill({ response, json: body });
  });
  await page.setContent(appHtml);
  await expect(page.locator('#status')).toHaveText('loaded');
  await expect(page.locator('#title')).toHaveText('Edited by the Modify test');
});

test('the unmocked app loads the real live post (contrast case)', async ({ page }) => {
  await page.setContent(appHtml);
  await expect(page.locator('#status')).toHaveText('loaded');
  await expect(page.locator('#title')).not.toBeEmpty();
});
