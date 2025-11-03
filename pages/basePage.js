import { expect } from "@playwright/test";
import logger from "../util/logger.js";
import { timeouts } from "../util/timeout.js";

export class BasePage {
  constructor(page) {
    this.page = page;
  }

  /**
   * Navigate to a URL
   */
  async navigate(url, options = {}) {
    const { waitUntil = "domcontentloaded", timeout = timeouts.navigation } =
      options;
    logger.info(`🌐 Navigating to: ${url}`);
    await this.page.goto(url, { waitUntil, timeout });
    await this.page.waitForLoadState("networkidle");
    logger.success(`✅ Successfully navigated to: ${url}`);
  }

  /**
   * Verify element visibility
   */
  async verifyElementVisibility(
    shouldBeVisible,
    locator,
    timeout = timeouts.long
  ) {
    if (shouldBeVisible) {
      await expect(locator).toBeVisible({ timeout });
      logger.debug(`✅ Element is visible: ${locator.toString()}`);
    } else {
      await expect(locator).not.toBeVisible({ timeout });
      logger.debug(`✅ Element is not visible: ${locator.toString()}`);
    }
  }

  /**
   * Wait for timeout
   */
  async wait(ms) {
    await this.page.waitForTimeout(ms);
    logger.debug(`⏱️  Waited ${ms}ms`);
  }
}
