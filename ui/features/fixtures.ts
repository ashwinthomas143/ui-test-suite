import { test as base, createBdd } from 'playwright-bdd';
import { TodoPage } from '../todomvc.page';

// This is the piece that makes BDD and the Page Object Model compose
// instead of compete: a `todoPage` fixture wraps the exact same
// `TodoPage` class that todomvc.spec.ts uses, so step definitions get a
// ready-to-use page object rather than re-deriving locators or actions.
// playwright-bdd's generator picks up this custom `test` because this
// file is included in the `steps` glob in playwright.config.ts.
type Fixtures = {
  todoPage: TodoPage;
};

export const test = base.extend<Fixtures>({
  todoPage: async ({ page }, use) => {
    await use(new TodoPage(page));
  },
});

export const { Given, When, Then } = createBdd(test);
