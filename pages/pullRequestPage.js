import { BasePage } from "./basePage.js";
import logger from "../util/logger.js";
import { timeouts } from "../util/timeout.js";
import { selectors } from "../util/selectors.js";

export class PullRequestPage extends BasePage {
  constructor(page) {
    super(page);
    this.selectors = selectors(page);
    this.pullRequests = [];
    this.prCount = 0;
  }

  /**
   * Navigate to GitHub PR page
   */
  async navigateToGitHubPRs(repoUrl) {
    await this.navigate(repoUrl, {
      waitUntil: "networkidle",
      timeout: timeouts.actionTimeout,
    });
    logger.success("✅ GitHub PR page loaded");
  }

  /**
   * Count open pull requests
   */
  async countOpenPullRequests() {
    const hoverCardSelector = this.selectors.pullRequest.hoverCard;
    try {
      await this.page.waitForSelector(hoverCardSelector, {
        timeout: timeouts.medium,
      });

      this.prCount = await this.page.evaluate(() => {
        const prElements = document.querySelectorAll(".js-navigation-item");
        return prElements.length;
      });

      logger.success(`✅ Found ${this.prCount} open pull requests`);
      return this.prCount;
    } catch (error) {
      logger.error(`❌ Failed to count PRs: ${error.message}`);
      throw error;
    }
  }

  /**
   * Extract all open pull requests (basic info)
   */
  async extractPullRequests() {
    const hoverCardSelector = this.selectors.pullRequest.hoverCard;
    try {
      await this.page.waitForSelector(hoverCardSelector, {
        timeout: timeouts.medium,
      });

      this.pullRequests = await this.page.evaluate(() => {
        const prElements = document.querySelectorAll(".js-navigation-item");
        const prs = [];

        prElements.forEach((prElement, index) => {
          try {
            //Using hardcoded selectors as hovercard selector is not directly usable here.
            const titleElement = prElement.querySelector('[data-hovercard-type="pull_request"]');
            const prName = titleElement
              ? titleElement.textContent.trim()
              : "N/A";

            const authorElement = prElement.querySelector(".opened-by a");
            const author = authorElement
              ? authorElement.textContent.trim()
              : "N/A";

            const prNumberElement = prElement.querySelector(".opened-by");
            const prNumberMatch = prNumberElement
              ? prNumberElement.textContent.match(/#(\d+)/)
              : null;
            const prNumber = prNumberMatch ? prNumberMatch[1] : index + 1;

            if (prName !== "N/A" && author !== "N/A") {
              prs.push({
                number: prNumber,
                title: prName,
                author: author,
              });
            }
          } catch (error) {
            console.log("Error parsing PR element:", error);
          }
        });

        return prs;
      });

      this.prCount = this.pullRequests.length;

      logger.success(`✅ Extracted ${this.prCount} pull requests`);
      return this.pullRequests;
    } catch (error) {
      logger.error(`❌ Failed to extract PRs: ${error.message}`);
      throw error;
    }
  }

  /**
   * Display all pull requests
   */
  displayPullRequests() {
    if (this.pullRequests.length === 0) {
      logger.warn("⚠️ No pull requests to display");
      return;
    }

    console.log("\n" + "=".repeat(80));
    console.log(`📋 OPEN PULL REQUESTS (Total: ${this.pullRequests.length})`);
    console.log("=".repeat(80));

    this.pullRequests.forEach((pr, index) => {
      console.log(
        `${index + 1}. PR #${pr.number}: ${pr.title}\n   👤 Author: ${
          pr.author
        }`
      );
    });

    console.log("=".repeat(80) + "\n");
  }

  /**
   * Get PR count
   */
  getPRCount() {
    return this.prCount;
  }

  /**
   * Get all PRs
   */
  getPullRequests() {
    return this.pullRequests;
  }
}
