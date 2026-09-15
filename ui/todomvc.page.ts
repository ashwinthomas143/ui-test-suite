import { Page, Locator } from '@playwright/test';

// Framework Layer: a Page Object Model isolates *how* to interact with
// the app from *what* each test asserts, so a markup change only needs
// fixing here, not in every spec file.
export class TodoPage {
  readonly page: Page;
  readonly newTodoInput: Locator;
  readonly items: Locator;

  constructor(page: Page) {
    this.page = page;
    this.newTodoInput = page.getByPlaceholder('What needs to be done?');
    this.items = page.getByTestId('todo-item');
  }

  async goto() {
    await this.page.goto('https://demo.playwright.dev/todomvc/');
  }

  async addTodo(title: string) {
    await this.newTodoInput.fill(title);
    await this.newTodoInput.press('Enter');
  }

  async toggleComplete(title: string) {
    await this.items.filter({ hasText: title }).getByRole('checkbox').check();
  }

  async remove(title: string) {
    const item = this.items.filter({ hasText: title });
    await item.hover();
    await item.getByLabel('Delete').click();
  }

  async filterBy(name: 'All' | 'Active' | 'Completed') {
    await this.page.getByRole('link', { name, exact: true }).click();
  }

  get titleLocator() {
    return this.items.locator('label');
  }
}
