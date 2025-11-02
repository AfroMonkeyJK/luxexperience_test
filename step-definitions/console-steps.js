import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { ConsolePage } from "../pages/consolePage.js";
import envConfig from "../util/environment-config.js";
import logger from "../util/logger.js";
import { timeouts } from '../util/timeout.js';

let consolePage;

Given('the browser captures console messages', {timeout: timeouts.long }, async function () {
  consolePage = new ConsolePage(this.page);
  consolePage.setupConsoleCapture();
});

When('the user navigates to the home page', {timeout: timeouts.medium}, async function () {
  const config = envConfig.getConfig();
  const url = config.baseUrl;

  await consolePage.navigateToPage(url);
  logger.success(`✅ Navigated to home page`);
});

When("the user navigates to the about page", {timeout: timeouts.medium}, async function () {
  const config = envConfig.getConfig();
  const url = `${config.baseUrl}about.html`;

  await consolePage.navigateToPage(url);
  logger.success(`✅ Navigated to about page`);
});

When("the user navigates to the {string} page", {timeout: timeouts.medium}, async function (pageName) {
  const config = envConfig.getConfig();

  const pageMap = {
    home: config.baseUrl,
    products: `${config.baseUrl}products.html`,
    contact: `${config.baseUrl}contact.html`,
    about: `${config.baseUrl}about.html`,
    login: `${config.baseUrl}login.html`,
  };

  const url = pageMap[pageName.toLowerCase()] || config.baseUrl;
  await consolePage.navigateToPage(url);
  logger.success(`✅ Navigated to ${pageName} page`);
});

Then("the page should have no console errors", async function () {
  const errorCount = consolePage.getConsoleErrorsCount();
  logger.info(`🔍 Checking for console errors... Found: ${errorCount}`);

  if (errorCount > 0) {
    consolePage.logConsoleErrors();
  }

  expect(errorCount, `Expected no console errors but found ${errorCount}`).toBe(
    0
  );
  logger.success("✅ No console errors found");
});

Then("the page should have console errors", async function () {
  const errorCount = consolePage.getConsoleErrorsCount();
  logger.info(`🔍 Checking for console errors... Found: ${errorCount}`);

  expect(errorCount, "Expected console errors to be present").toBeGreaterThan(
    0
  );

  logger.info(`✅ Console errors detected as expected (${errorCount})`);
  consolePage.logConsoleErrors();
});

Then(
  "the console errors should contain {string} or {string}",
  async function (keyword1, keyword2) {
    const hasKeyword1 = consolePage.hasErrorContaining(keyword1);
    const hasKeyword2 = consolePage.hasErrorContaining(keyword2);
    const hasKeyword = hasKeyword1 || hasKeyword2;

    expect(
      hasKeyword,
      `Expected console errors to contain "${keyword1}" or "${keyword2}"`
    ).toBe(true);
    logger.success(`✅ Console error contains expected keyword`);
  }
);
