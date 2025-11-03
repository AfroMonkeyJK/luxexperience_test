@smoke
Feature: Test Case 3 - Login Functionality

  Background:
    Given the user is on the login page

  Scenario: Successful login with valid credentials
    When the user enters valid credentials
    And the user clicks the login button
    Then the user should be logged in successfully

  Scenario: Login fails with invalid credentials
    When the user enters invalid credentials
    And the user clicks the login button
    Then the user should see an error message