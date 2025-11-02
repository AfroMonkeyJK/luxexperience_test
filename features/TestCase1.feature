@smoke
Feature: Test Case 1 - Console Error Detection

  Background:
    Given the browser captures console messages

  Scenario: Verify home page has no console errors
    When the user navigates to the home page
    Then the page should have no console errors

  Scenario: Verify about page intentional error is detected
    When the user navigates to the about page
    Then the page should have console errors
    And the console errors should contain "Uncaught" or "Error"