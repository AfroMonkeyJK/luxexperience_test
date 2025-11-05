import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { PullRequestPage } from "../pages/pullRequestPage.js";
import logger from "../util/logger.js";
import { timeouts } from "../util/timeout.js";

// Default GitHub repo for testing
const DEFAULT_REPO = "https://github.com/appwrite/appwrite/pulls";

Given(
  "the user is on the GitHub repository pulls page",
  { timeout: timeouts.long },
  async function () {
    this.pullRequestPage = new PullRequestPage(this.page);
    await this.pullRequestPage.navigateToGitHubPRs(DEFAULT_REPO);
  }
);

When(
  "the user counts the open pull requests",
  { timeout: timeouts.medium },
  async function () {
    this.prCount = await this.pullRequestPage.countOpenPullRequests();
  }
);

When(
  "the user extracts all open pull requests",
  { timeout: timeouts.extralong },
  async function () {
    await this.pullRequestPage.extractPullRequests();
  }
);

Then(
  "the system should display the number of open PRs",
  { timeout: timeouts.medium },
  async function () {
    const count = this.pullRequestPage.getPRCount();

    logger.info("📊 " + "=".repeat(60));
    logger.info(`📊 TOTAL OPEN PULL REQUESTS: ${count}`);
    logger.info("📊 " + "=".repeat(60));

    expect(count, "PR count should be a number").toBeGreaterThanOrEqual(0);
  }
);

Then(
  "the number of open PRs should be greater than {int}",
  { timeout: timeouts.medium },
  async function (minCount) {
    const count = this.pullRequestPage.getPRCount();

    expect(
      count,
      `Expected at least ${minCount} open PR(s), but found ${count}`
    ).toBeGreaterThan(minCount);

    logger.success(`✅ Repository has ${count} open PR(s)`);
  }
);

Then(
  "the system should list all open PR titles",
  { timeout: timeouts.medium },
  async function () {
    const prs = this.pullRequestPage.getPullRequests();

    expect(prs.length, "Should have at least one PR").toBeGreaterThan(0);

    this.pullRequestPage.displayPullRequests();
  }
);

Then(
  "each PR should have a title and author",
  { timeout: timeouts.medium },
  async function () {
    const prs = this.pullRequestPage.getPullRequests();

    expect(prs.length, "Should have PRs to validate").toBeGreaterThan(0);

    // Verify each PR has required fields
    prs.forEach((pr, index) => {
      expect(pr.title, `PR ${index + 1} should have a title`).toBeTruthy();
      expect(pr.author, `PR ${index + 1} should have an author`).toBeTruthy();
    });

    logger.success(`✅ All ${prs.length} PRs have valid title and author`);
  }
);
