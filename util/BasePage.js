import { expect } from "@playwright/test";
import logger from "./logger.js";
import { timeouts } from "./timeout.js";
import { technicalConstants } from "./technical-constants.js";
import uiConstants from "./ui-constants.js";

export class BasePage {
  constructor(page) {
    this.page = page;
  }

  /**
   * Navigate to a URL
   * @param {string} url - URL to navigate to
   * @param {object} options - Navigation options
   */
  async navigate(url, options = {}) {
    const { waitUntil = "domcontentloaded", timeout = timeouts.navigation } =
      options;
    await this.page.goto(url, { waitUntil, timeout });
    await this.page.waitForLoadState("networkidle");
    logger.success(`✅ Successfully navigated to: ${url}`);
  }

  /**
   * Click on an element
   * @param {import('@playwright/test').Locator} locator - Element to click
   */
  async click(locator) {
    await this.waitForClickable(locator);
    await locator.click();
    logger.info(`Clicked element: ${locator.toString()}`);
  }

  /**
   * Fill input field with text
   * @param {import('@playwright/test').Locator} locator - Input element
   * @param {string} text - Text to fill
   */
  async fill(locator, text) {
    await this.verifyElementVisibility(true, locator);
    await locator.fill(text);
    logger.info(`Filled input: ${locator.toString()} with "${text}"`);
  }

  /**
   * Fill input field with automatic sensitive data detection
   * @param {import('@playwright/test').Locator} locator - Input element
   * @param {string} text - Text to fill
   * @param {boolean} forceSensitive - Force treat as sensitive
   */
  async fillSensitive(locator, text, forceSensitive = false) {
    await this.verifyElementVisibility(true, locator);
    await locator.fill(text);

    const isSensitive =
      forceSensitive || (await this.isSensitiveField(locator));
    const displayValue = isSensitive ? "[MASKED]" : text;

    logger.info(
      `Filled input: ${locator.toString()} with "${displayValue}"`
    );
  }

  /**
   * Check if field contains sensitive data
   * @param {import('@playwright/test').Locator} locator - Input element
   * @returns {Promise<boolean>}
   */
  async isSensitiveField(locator) {
    try {
      const type = await locator
        .getAttribute(uiConstants.attributes.type)
        .catch(() => "");
      if (type === uiConstants.attributes.password) return true;

      const attrs = await Promise.all([
        locator.getAttribute(uiConstants.attributes.name).catch(() => ""),
        locator.getAttribute(uiConstants.attributes.id).catch(() => ""),
        locator
          .getAttribute(uiConstants.attributes.placeholder)
          .catch(() => ""),
      ]);

      const combined = attrs.join(" ").toLowerCase();
      return technicalConstants.sensitivePatterns.some((pattern) =>
        combined.includes(pattern)
      );
    } catch {
      return true;
    }
  }

  /**
   * Clear input field
   * @param {import('@playwright/test').Locator} locator - Input element
   */
  async clear(locator) {
    await this.verifyElementVisibility(true, locator);
    await locator.clear();
    logger.info(`🧹 Cleared input: ${locator.toString()}`);
  }

  /**
   * Get text content from element
   * @param {import('@playwright/test').Locator} locator - Element
   * @returns {Promise<string>}
   */
  async getText(locator) {
    await this.verifyElementVisibility(true, locator);
    const text = await locator.textContent();
    logger.info(`Got text from element: ${locator.toString()} -> "${text}"`);
    return text || "";
  }

  /**
   * Verify element visibility
   * @param {boolean} shouldBeVisible - Expected visibility state
   * @param {import('@playwright/test').Locator} locator - Element
   * @param {number} timeout - Timeout in ms
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
   * Verify element text
   * @param {import('@playwright/test').Locator} locator - Element
   * @param {string} expectedText - Expected text
   * @param {boolean} exactMatch - Exact or partial match
   */
  async verifyElementText(locator, expectedText, exactMatch = true) {
    await expect(locator).toBeVisible();

    if (exactMatch) {
      await expect(locator).toHaveText(expectedText);
      logger.info(`✅ Verified exact text: "${expectedText}"`);
    } else {
      await expect(locator).toContainText(expectedText);
      logger.info(`✅ Verified text contains: "${expectedText}"`);
    }
  }

  /**
   * Wait for element to be clickable
   * @param {import('@playwright/test').Locator} locator - Element
   * @param {number} timeout - Timeout in ms
   */
  async waitForClickable(locator, timeout = timeouts.long) {
    try {
      await locator.waitFor({ state: "visible", timeout });

      const startTime = Date.now();
      while (Date.now() - startTime < timeout) {
        const isEnabled = await locator.isEnabled();
        const isVisible = await locator.isVisible();

        if (isEnabled && isVisible) {
          logger.debug(`✅ Element is clickable: ${locator.toString()}`);
          return;
        }
        await this.page.waitForTimeout(100);
      }

      throw new Error(
        `Element not clickable within ${timeout}ms: ${locator.toString()}`
      );
    } catch (error) {
      logger.error(`❌ Error waiting for clickable element: ${error.message}`);
      throw error;
    }
  }

  /**
   * Wait for element to disappear
   * @param {import('@playwright/test').Locator} locator - Element
   * @param {number} timeout - Timeout in ms
   */
  async waitForElementToDisappear(locator, timeout = timeouts.medium) {
    await expect(locator).toBeHidden({ timeout });
    logger.debug(`✅ Element disappeared: ${locator.toString()}`);
  }

  /**
   * Check if element exists
   * @param {import('@playwright/test').Locator} locator - Element
   * @returns {Promise<boolean>}
   */
  async isVisible(locator) {
    try {
      return await locator.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Wait for page load
   * @param {string} state - Load state to wait for
   */
  async waitForPageLoad(state = "networkidle") {
    await this.page.waitForLoadState(state);
    logger.debug(`✅ Page load state: ${state}`);
  }

  /**
   * Press keyboard key
   * @param {string} key - Key to press
   */
  async pressKey(key) {
    await this.page.keyboard.press(key);
    logger.info(`Pressed key: ${key}`);
  }

  /**
   * Wait for timeout
   * @param {number} ms - Milliseconds to wait
   */
  async wait(ms) {
    await this.page.waitForTimeout(ms);
    logger.info(`Waited ${ms}ms`);
  }
}
