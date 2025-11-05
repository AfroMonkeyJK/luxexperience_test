import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { LoginPage } from "../pages/loginPage.js";
import envConfig from "../util/environment-config.js";
import logger from "../util/logger.js";
import { timeouts } from "../util/timeout.js";

Given(
  "the user is on the login page",
  { timeout: timeouts.medium },
  async function () {
    this.loginPage = new LoginPage(this.page);
    const config = envConfig.getConfig();
    await this.loginPage.navigateToLogin(config.baseUrl);
  }
);

When(
  "the user enters valid credentials",
  { timeout: timeouts.medium },
  async function () {
    const config = envConfig.getConfig();
    const { username, password } = config.credentials;

    logger.info("🔐 Using valid credentials from environment");
    await this.loginPage.fillUsername(username);
    await this.loginPage.fillPassword(password);
  }
);

When(
  "the user enters invalid credentials",
  { timeout: timeouts.medium },
  async function () {
    logger.info("🔐 Using invalid credentials");
    await this.loginPage.fillUsername("invaliduser");
    await this.loginPage.fillPassword("wrongpassword");
  }
);

When(
  "the user clicks the login button",
  { timeout: timeouts.medium },
  async function () {
    await this.loginPage.clickLoginButton();
  }
);

Then(
  "the user should be logged in successfully",
  { timeout: timeouts.medium },
  async function () {
    const isLoggedIn = await this.loginPage.isLoginSuccessful();

    expect(isLoggedIn, "Expected user to be logged in successfully").toBe(true);

    logger.success("✅ User logged in successfully");
  }
);

Then(
  "the user should see an error message",
  { timeout: timeouts.medium },
  async function () {
    const hasError = await this.loginPage.hasErrorMessage();

    expect(
      hasError,
      "Expected to see an error message for invalid credentials"
    ).toBe(true);

    const errorMessage = await this.loginPage.getErrorMessage();
    logger.info(`📄 Error displayed: ${errorMessage}`);

    logger.success("✅ Error message displayed as expected");
  }
);
