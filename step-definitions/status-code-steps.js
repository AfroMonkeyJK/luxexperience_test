import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { StatusCodePage } from "../pages/statusCodePage.js";
import envConfig from "../util/environment-config.js";
import logger from "../util/logger.js";
import { timeouts } from "../util/timeout.js";

Given(
  "the browser is ready for status code checking",
  { timeout: timeouts.long },
  async function () {
    this.statusCodePage = new StatusCodePage(this.page);
    await this.statusCodePage.setupStatusCodeTracking();
  }
);

When(
  "the user navigates to the FashionHub home page",
  { timeout: timeouts.medium },
  async function () {
    const config = envConfig.getConfig();
    await this.statusCodePage.navigate(config.baseUrl);
    logger.success("✅ Navigated to FashionHub home page");
  }
);

When(
  "the user extracts all links from the page",
  { timeout: timeouts.medium },
  async function () {
    await this.statusCodePage.extractAllLinks();
  }
);

When(
  "the user checks the status code for {string}",
  { timeout: timeouts.medium },
  async function (url) {
    const result = await this.statusCodePage.checkStatusCode(url);
    this.statusCodePage.statusResults = [result];
  }
);

Then(
  "all links should return valid status codes",
  { timeout: timeouts.extralong },
  async function () {
    await this.statusCodePage.checkAllLinksStatusCodes();
    const results = this.statusCodePage.getStatusResults();
    const invalidResults = this.statusCodePage.getInvalidStatusCodes();
    this.statusCodePage.logStatusResults();
    expect(
      invalidResults.length,
      `Expected all links to return 200 or 30x, but found ${invalidResults.length} invalid status codes`
    ).toBe(0);
    logger.success("✅ All links returned valid status codes");
  }
);

Then(
  "no links should return 40x status codes",
  { timeout: timeouts.medium },
  async function () {
    const error4xx = this.statusCodePage.get4xxStatusCodes();

    if (error4xx.length > 0) {
      logger.error(`❌ Found ${error4xx.length} links with 40x status codes:`);
      error4xx.forEach((result) => {
        logger.error(`   [${result.statusCode}] ${result.url}`);
      });
    }

    expect(
      error4xx.length,
      `Expected no 40x status codes, but found ${error4xx.length}`
    ).toBe(0);

    logger.success("✅ No 40x status codes found");
  }
);

Then(
  "the status code should be {int}",
  { timeout: timeouts.medium },
  async function (expectedStatusCode) {
    const results = this.statusCodePage.getStatusResults();
    expect(results.length).toBeGreaterThan(0)
    const result = results[0];

    logger.info(
      `📊 Expected: ${expectedStatusCode}, Got: ${result.statusCode}`
    );

    expect(
      result.statusCode,
      `Expected status code ${expectedStatusCode} but got ${result.statusCode} for ${result.url}`
    ).toBe(expectedStatusCode);

    logger.success(`✅ Status code is ${expectedStatusCode}`);
  }
);

Then(
  "the status code should be 200 or 30x",
  { timeout: timeouts.medium },
  async function () {
    const results = this.statusCodePage.getStatusResults();

    expect(results.length).toBeGreaterThan(0);

    const result = results[0];
    const isValid = this.statusCodePage.isValidStatusCode(result.statusCode);

    logger.info(`📊 Status code: ${result.statusCode} - Valid: ${isValid}`);

    expect(
      isValid,
      `Expected status code 200 or 30x but got ${result.statusCode} for ${result.url}`
    ).toBe(true);

    logger.success(`✅ Status code ${result.statusCode} is valid`);
  }
);
