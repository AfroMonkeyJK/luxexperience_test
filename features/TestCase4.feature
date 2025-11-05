@smoke
Feature: Test Case 4 - GitHub Open Pull Requests Count

  Background:
    Given the user is on the GitHub repository pulls page

  Scenario: Count and display open pull requests
    When the user counts the open pull requests
    Then the system should display the number of open PRs
    And the number of open PRs should be greater than 0

  Scenario: Verify open PRs can be listed
    When the user extracts all open pull requests
    Then the system should list all open PR titles
    And each PR should have a title and author