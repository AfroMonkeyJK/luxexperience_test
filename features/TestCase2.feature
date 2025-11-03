@smoke
Feature: Test Case 2 - HTTP Status Code Verification

  Background:
    Given the browser is ready for status code checking

  Scenario: Verify all links on home page return valid status codes
    When the user navigates to the FashionHub home page
    And the user extracts all links from the page
    Then all links should return valid status codes
    And no links should return 40x status codes

  Scenario: Verify specific page returns 200 status code
    When the user checks the status code for "https://pocketaces2.github.io/fashionhub/"
    Then the status code should be 200

  Scenario: Verify about page returns valid status code
    When the user checks the status code for "https://pocketaces2.github.io/fashionhub/about.html"
    Then the status code should be 200 or 30x