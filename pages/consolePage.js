import { BasePage } from "./BasePage.js";
import logger from "../util/logger.js";

export class ConsolePage extends BasePage {
  constructor(page) {
    super(page);
    this.consoleErrors = [];
    this.consoleWarnings = [];
    this.consoleMessages = [];
  }

  /**
   * Setup console message capture
   */
  setupConsoleCapture() {
    this.consoleErrors = [];
    this.consoleWarnings = [];
    this.consoleMessages = [];

    this.page.on("console", (msg) => {
      const msgType = msg.type();
      const msgText = msg.text();

      this.consoleMessages.push({
        type: msgType,
        text: msgText,
        timestamp: new Date().toISOString(),
      });

      if (msgType === "error") {
        this.consoleErrors.push(msgText);
        logger.error(`Console Error detected: ${msgText}`);
      } else if (msgType === "warning") {
        this.consoleWarnings.push(msgText);
        logger.warn(`Console Warning: ${msgText}`);
      }
    });

    logger.info("✅ Console message capture configured");
  }

  /**
   * Navigate to a specific page and wait for console errors
   */
  async navigateToPage(url, waitTime = 1000) {
    await this.navigate(url);
    await this.wait(waitTime);
  }

  /**
   * Get console errors count
   */
  getConsoleErrorsCount() {
    return this.consoleErrors.length;
  }

  /**
   * Get all console errors
   */
  getConsoleErrors() {
    return this.consoleErrors;
  }

  /**
   * Check if console errors contain specific keyword
   */
  hasErrorContaining(keyword) {
    return this.consoleErrors.some((error) => error.includes(keyword));
  }

  /**
   * Log all console errors
   */
  logConsoleErrors() {
    if (this.consoleErrors.length > 0) {
      logger.error(
        `❌ Console errors detected (${this.consoleErrors.length}):`
      );
      this.consoleErrors.forEach((error, index) => {
        logger.error(`  ${index + 1}. ${error}`);
      });
    } else {
      logger.success("✅ No console errors found");
    }
  }
}
