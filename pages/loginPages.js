import logger from "../util/logger.js";

export class LoginPage {
  constructor(page) {
    this.page = page;

    // Selectors
    this.selectors = {
      usernameInput: 'input[name="username"]',
      passwordInput: 'input[name="password"]',
      submitButton: 'button[type="submit"]',
      errorMessage: ".error-message, .alert-danger",
      successIndicator: '.user-menu, .dashboard, [data-testid="user-profile"]',
    };
  }

  async navigate(baseUrl) {
    const loginUrl = `${baseUrl}login.html`;
    logger.info(`🌐 Navigating to: ${loginUrl}`);
    await this.page.goto(loginUrl, { waitUntil: "domcontentloaded" });
    await this.page.waitForLoadState("networkidle");
  }

  async login(username, password) {
    logger.info(`🔐 Attempting login with username: ${username}`);

    await this.page.fill(this.selectors.usernameInput, username);
    await this.page.fill(this.selectors.passwordInput, password);
    await this.page.click(this.selectors.submitButton);

    // Wait for response
    await this.page.waitForTimeout(1500);
  }

  async isLoginSuccessful() {
    try {
      // Check if redirected or success indicator appears
      const currentUrl = this.page.url();
      const hasSuccessIndicator = await this.page.isVisible(
        this.selectors.successIndicator
      );
      const notOnLoginPage = !currentUrl.includes("login.html");

      return hasSuccessIndicator || notOnLoginPage;
    } catch (error) {
      logger.error(`Error checking login success: ${error.message}`);
      return false;
    }
  }

  async hasErrorMessage() {
    try {
      return await this.page.isVisible(this.selectors.errorMessage);
    } catch (error) {
      return false;
    }
  }

  async getErrorMessage() {
    return await this.page.textContent(this.selectors.errorMessage);
  }
}
