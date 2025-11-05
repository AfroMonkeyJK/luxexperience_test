import { BasePage } from "./basePage.js";
import logger from "../util/logger.js";
import { selectors } from "../util/selectors.js";
import { timeouts } from "../util/timeout.js";

export class LoginPage extends BasePage {
  constructor(page) {
    super(page);
    this.selectors = selectors(page);
  }

  async navigateToLogin(baseUrl) {
    const loginUrl = `${baseUrl}login.html`;
    logger.info(`🔗 Navigating to login page: ${loginUrl}`);
    await this.navigate(loginUrl);
    logger.success("✅ Login page loaded");
  }

  async fillUsername(username) {
    logger.info(`👤 Entering username: ${this.maskSensitiveData(username)}`);
    await this.page.fill(this.selectors.loginPage.usernameInput, username);
  }

  async fillPassword(password) {
    logger.info(`🔒 Entering password: ${this.maskSensitiveData(password)}`);
    await this.page.fill(this.selectors.loginPage.passwordInput, password);
  }

  async clickLoginButton() {
    logger.info("🖱️ Clicking login button");
    await this.page.click(this.selectors.loginPage.submitButton);
    await this.wait(timeouts.short);
  }

  async login(username, password) {
    await this.fillUsername(username);
    await this.fillPassword(password);
    await this.clickLoginButton();
  }

  async isLoginSuccessful() {
    try {
      const currentUrl = this.page.url();
      logger.info(`🔍 Current URL after login: ${currentUrl}`);

      // Check if redirected away from login page
      const notOnLoginPage = !currentUrl.includes("login.html");

      // Check for success indicators
      const hasSuccessIndicator = await this.page
        .locator(this.selectors.loginPage.successIndicator)
        .isVisible({ timeout: timeouts.medium })
        .catch(() => false);

      const isSuccess = hasSuccessIndicator || notOnLoginPage;

      if (isSuccess) {
        logger.success("✅ Login successful");
      } else {
        logger.error("❌ Login failed");
      }

      return isSuccess;
    } catch (error) {
      logger.error(`❌ Error checking login success: ${error.message}`);
      return false;
    }
  }

  async hasErrorMessage() {
    try {
      const errorVisible = await this.page
        .locator(this.selectors.loginPage.errorMessage)
        .isVisible({ timeout: timeouts.short })
        .catch(() => false);

      if (errorVisible) {
        logger.warn("⚠️ Error message is visible");
      }

      return errorVisible;
    } catch (error) {
      return false;
    }
  }

  async getErrorMessage() {
    try {
      const errorText = await this.page
        .locator(this.selectors.loginPage.errorMessage)
        .textContent();
      logger.info(`📄 Error message: ${errorText}`);
      return errorText;
    } catch (error) {
      logger.error(`❌ Could not get error message: ${error.message}`);
      return null;
    }
  }

  /**
   * Mask sensitive data for logging
   */
  maskSensitiveData(value) {
    if (!value || value.length < 3) return "***";
    return value.substring(0, 2) + "*".repeat(value.length - 2);
  }
}
