import { BasePage } from "./basePage.js";
import logger from "../util/logger.js";
import timeouts from "../util/timeout.js";

export class StatusCodePage extends BasePage {
  constructor(page) {
    super(page);
    this.links = [];
    this.statusResults = [];
  }

  /**
   * Navigate and setup response listener
   */
  async setupStatusCodeTracking() {
    this.statusResults = [];
    logger.info("✅ Status code tracking configured");
  }

  /**
   * Check status code for a specific URL
   */
  async checkStatusCode(url) {
    logger.info(`🔍 Checking status code for: ${url}`);

    try {
      const response = await this.page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: timeouts.medium,
      });
      const statusCode = response.status();
      const statusText = response.statusText();
      return {
        url,
        statusCode,
        statusText,
        isValid: this.isValidStatusCode(statusCode),
        is4xx: this.is4xxStatusCode(statusCode),
      };
    } catch (error) {
      logger.error(`❌ Failed to check ${url}: ${error.message}`);
      return {
        url,
        statusCode: 0,
        statusText: error.message,
        isValid: false,
        is4xx: false,
        error: true,
      };
    }
  }

  /**
   * Extract all links from current page
   */
  async extractAllLinks() {
    logger.info("🔗 Extracting all links from page...");

    const links = await this.page.evaluate(() => {
      const anchorElements = Array.from(document.querySelectorAll("a[href]"));
      return anchorElements
        .map((a) => a.href)
        .filter((href) => {
          return (
            href &&
            !href.startsWith("javascript:") &&
            !href.startsWith("#") &&
            !href.startsWith("mailto:") &&
            !href.startsWith("tel:")
          );
        });
    });
    this.links = [...new Set(links)];
    if (this.links.length > 0) {
      logger.info("📋 Links found:");
      this.links.forEach((link, index) => {
        logger.info(`   ${index + 1}. ${link}`);
      });
    }

    return this.links;
  }

  /**
   * Check status codes for all extracted links
   */
  async checkAllLinksStatusCodes() {
    if (this.links.length === 0) {
      logger.warn("⚠️ No links to check");
      return [];
    }

    logger.info(`🔍 Checking status codes for ${this.links.length} links...`);
    this.statusResults = [];

    for (let i = 0; i < this.links.length; i++) {
      const link = this.links[i];
      logger.info(`\n[${i + 1}/${this.links.length}] Checking: ${link}`);
      const result = await this.checkStatusCode(link);
      this.statusResults.push(result);
      await this.wait(timeouts.instant);
    }
    return this.statusResults;
  }

  /**
   * Get all results
   */
  getStatusResults() {
    return this.statusResults;
  }

  /**
   * Get only invalid status codes (not 200 or 30x)
   */
  getInvalidStatusCodes() {
    return this.statusResults.filter((result) => !result.isValid);
  }

  /**
   * Get 40x status codes
   */
  get4xxStatusCodes() {
    return this.statusResults.filter((result) => result.is4xx);
  }

  /**
   * Check if status code is valid (200 or 30x)
   */
  isValidStatusCode(statusCode) {
    return statusCode === 200 || (statusCode >= 300 && statusCode < 400);
  }

  /**
   * Check if status code is 40x
   */
  is4xxStatusCode(statusCode) {
    return statusCode >= 400 && statusCode < 500;
  }

  /**
   * Log all status results
   */
  logStatusResults() {
    if (this.statusResults.length === 0) {
      logger.info("ℹ️ No status results to display");
      return;
    }

    logger.info("\n📊 STATUS CODE RESULTS:");
    logger.info("=".repeat(80));

    const validResults = this.statusResults.filter((r) => r.isValid);
    const invalidResults = this.statusResults.filter((r) => !r.isValid);
    const error4xx = this.statusResults.filter((r) => r.is4xx);

    logger.info(`✅ Valid (200/30x): ${validResults.length}`);
    logger.info(`❌ Invalid: ${invalidResults.length}`);
    logger.info(`🚫 4xx Errors: ${error4xx.length}`);
    logger.info("=".repeat(80));

    // Log invalid results in detail
    if (invalidResults.length > 0) {
      logger.error("\n❌ INVALID STATUS CODES:");
      invalidResults.forEach((result, index) => {
        logger.error(`   ${index + 1}. [${result.statusCode}] ${result.url}`);
      });
    }

    // Log 4xx errors in detail
    if (error4xx.length > 0) {
      logger.error("\n🚫 4XX STATUS CODES:");
      error4xx.forEach((result, index) => {
        logger.error(`   ${index + 1}. [${result.statusCode}] ${result.url}`);
      });
    }
  }
}
