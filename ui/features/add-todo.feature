Feature: Add a todo item

  One example scenario demonstrating BDD/Gherkin-style specs on top of
  this suite's existing Page Object Model (see ui/features/steps/add-todo.steps.ts).

  Scenario: Adding a new item shows it in the list
    Given I am on the TodoMVC app
    When I add a todo item "Buy milk"
    Then the todo list shows "Buy milk"
