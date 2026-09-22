import { expect } from '@playwright/test';
import { Given, When, Then } from '../fixtures';

// Step definitions for add-todo.feature. Every action and locator here
// comes from the existing `TodoPage` Page Object Model (via the
// `todoPage` fixture defined in ../fixtures.ts) — nothing below
// duplicates a locator or re-implements what that class already does.

Given('I am on the TodoMVC app', async ({ todoPage }) => {
  await todoPage.goto();
});

When('I add a todo item {string}', async ({ todoPage }, title: string) => {
  await todoPage.addTodo(title);
});

Then('the todo list shows {string}', async ({ todoPage }, title: string) => {
  await expect(todoPage.titleLocator).toHaveText([title]);
});
