import logger from "../util/logger.js";
import { selectors } from "../util/selectors.js";
import { timeouts } from "../util/timeout.js";

export class LoginPage {
  constructor(page) {
    this.page = page;
    this.selectors = selectors(page);
  }

  async navigate(baseUrl) {
    const loginUrl = `${baseUrl}login.html`;
    await this.page.goto(loginUrl, { waitUntil: "domcontentloaded" });
    await this.page.waitForLoadState("networkidle");
  }

  async login(username, password) {
    await this.page.fill(this.selectors.loginPage.usernameInput, username);
    await this.page.fill(this.selectors.loginPage.passwordInput, password);
    await this.page.click(this.selectors.loginPage.submitButton);
    await this.page.waitForTimeout(timeouts.short);
  }

  async isLoginSuccessful() {
    try {
      const currentUrl = this.page.url();
      const hasSuccessIndicator = await this.page.isVisible(
        this.selectors.loginPage.successIndicator
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
      return await this.page.isVisible(this.selectors.loginPage.errorMessage);
    } catch (error) {
      return false;
    }
  }

  async getErrorMessage() {
    return await this.page.textContent(this.selectors.loginPage.errorMessage);
  }
}
