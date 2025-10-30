import { Before, After, BeforeStep, AfterAll, setWorldConstructor } from '@cucumber/cucumber';
import { chromium } from '@playwright/test';
import { testHelpers } from '../util/ui-constants.js';
import { mimeTypes, browserArgs, fileExtensions, testPaths } from '../util/technical-constants.js';
import logger from '../util/logger.js';
import timeouts from '../util/timeout.js';
import fs from 'fs';
import path from 'path';

const failedTests = [];

/**
 * Sleep utility for async delays
 * @param {number} ms - Milliseconds to wait
 */
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Safe file operation wrapper with retry logic
 * @param {Function} operation - File operation to execute
 * @param {number} retries - Number of retries (default: 3)
 * @param {number} delay - Delay between retries in ms
 */
async function safeFileOperation(operation, retries = 3, delay = 500) {
  for (let i = 0; i < retries; i++) {
    try {
      await operation();
      return true;
    } catch (error) {
      if (i === retries - 1) {
        logger.warn(`File operation failed after ${retries} attempts: ${error.message}`);
        return false;
      }
      await sleep(delay);
    }
  }
  return false;
}

/**
 * Clean up browser resources safely
 * @param {Object} world - Cucumber world object
 */
async function cleanupBrowser(world) {
  const resources = [
    { name: 'page', resource: world.page },
    { name: 'context', resource: world.context },
    { name: 'browser', resource: world.browser }
  ];

  for (const { name, resource } of resources) {
    if (resource) {
      try {
        await resource.close();
        logger.debug(`${name} closed successfully`);
      } catch (error) {
        logger.warn(`Error closing ${name}: ${error.message}`);
      }
    }
  }
}

/**
 * Handle video file based on test result
 * @param {string} videoPath - Path to video file
 * @param {string} testStatus - Test status (PASSED/FAILED)
 * @param {string} scenarioName - Scenario name for naming
 */
async function handleVideoFile(videoPath, testStatus, scenarioName) {
  if (!videoPath) return;

  // Wait for video to be fully written
  await sleep(timeouts.short);

  if (testStatus === 'FAILED') {
    await safeFileOperation(async () => {
      if (!fs.existsSync(videoPath)) return;

      const videoDir = path.dirname(videoPath);
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[1].substring(0, 8);
      const cleanName = scenarioName
        .replace(/[<>:"/\\|?*]/g, '')
        .replace(/\s+/g, '_')
        .substring(0, 100);

      const newVideoName = `${cleanName}-FAILED-${timestamp}.webm`;
      const newVideoPath = path.join(videoDir, newVideoName);

      fs.renameSync(videoPath, newVideoPath);
      logger.info(`🎥 Video saved: ${newVideoName}`);
    });
  } else if (testStatus === 'PASSED') {
    await safeFileOperation(async () => {
      if (fs.existsSync(videoPath)) {
        fs.unlinkSync(videoPath);
        logger.debug('🗑️ Video deleted (test passed)');
      }
    });
  }
}

/**
 * Take screenshot on test failure
 * @param {Object} page - Playwright page object
 * @param {Object} scenario - Cucumber scenario object
 * @param {Function} attachFn - Cucumber attach function
 */
async function captureFailureScreenshot(page, scenario, attachFn) {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const scenarioName = scenario.pickle.name.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    const screenshotPath = `${testPaths.screenshots}failure-${scenarioName}-${timestamp}${fileExtensions.png}`;

    const screenshot = await page.screenshot({
      path: screenshotPath,
      fullPage: true
    });

    // Attach to Cucumber report if available
    if (attachFn && typeof attachFn === 'function') {
      try {
        attachFn(screenshot, mimeTypes.png);
      } catch {
        // Silently fail if attach is not available
        logger.debug('Could not attach screenshot to report');
      }
    }

    logger.info(`📸 Screenshot saved: ${screenshotPath}`);
  } catch (error) {
    logger.warn(`⚠️ Could not capture screenshot: ${error.message}`);
  }
}

/**
 * Get formatted test duration
 * @param {Object} result - Cucumber test result
 * @returns {string} Formatted duration
 */
function getTestDuration(result) {
  return result.duration?.nanos ? `${(result.duration.nanos / 1000000).toFixed(0)}ms` : 'Unknown';
}

/**
 * Count artifact files
 * @param {string} directory - Directory to count files in
 * @param {string} extension - File extension to filter
 * @returns {number} File count
 */
function countArtifacts(directory, extension) {
  if (!fs.existsSync(directory)) return 0;
  return fs.readdirSync(directory).filter(f => f.endsWith(extension)).length;
}

class CustomWorld {
  constructor() {
    this.browser = null;
    this.page = null;
    this.context = null;
    this.videoPath = null;
    this.scenarioName = null;
    this.stepNumber = 0;
    this.testPassed = false;
  }
}

setWorldConstructor(CustomWorld);

Before(async function (scenario) {
  this.scenarioName = scenario.pickle.name;
  this.stepNumber = 0;
  this.testPassed = false;

  const featureName = scenario.gherkinDocument?.feature?.name || 'Unknown Feature';
  const tags = scenario.pickle.tags.map(tag => tag.name).join(', ') || 'No tags';

  console.log('='.repeat(80) + '\n');
  logger.info(`🎬 STARTING SCENARIO: "${this.scenarioName}"`);
  logger.info(`📋 FEATURE: "${featureName}"`);
  logger.info(`🏷️ TAGS: ${tags}`);
  console.log('='.repeat(80));

  const browser = await chromium.launch({
    headless: process.env.CI === 'true',
    args: process.env.CI ? browserArgs.ci : []
  });

  this.browser = browser;
  this.context = await this.browser.newContext({
    recordVideo: {
      dir: testPaths.videos,
      size: { width: 1280, height: 720 }
    },
    viewport: { width: 1280, height: 720 }
  });

  this.page = await this.context.newPage();
  this.videoPath = await this.page.video()?.path();
});

BeforeStep(async function (step) {
  try {
    this.stepNumber++;
    const stepText = step.pickleStep?.text || 'Unknown step';

    console.log('-'.repeat(80));
    logger.info(`📝 STEP ${this.stepNumber}: ${stepText}`);
    console.log('-'.repeat(80));
  } catch (error) {
    logger.info(`📝 STEP ${this.stepNumber}: Unknown step`);
    logger.warn(`⚠️ Could not get step text: ${error.message}`);
  }
});

After({ timeout: timeouts.long }, async function (scenario) {
  const testStatus = testHelpers.isTestFailure(scenario.result.status)
    ? 'FAILED'
    : testHelpers.isTestSuccess(scenario.result.status)
      ? 'PASSED'
      : testHelpers.isTestSkipped(scenario.result.status)
        ? 'SKIPPED'
        : 'UNKNOWN';

  const duration = getTestDuration(scenario.result);
  let finalVideoPath = null;

  try {
    // Get video path before closing
    if (this.page?.video) {
      finalVideoPath = await this.page.video().path();
    }

    // Handle test results
    if (testStatus === 'FAILED') {
      const failureInfo = {
        name: scenario.pickle.name,
        feature: scenario.gherkinDocument.feature.name,
        error: scenario.result.message,
        timestamp: new Date().toISOString(),
        duration
      };
      failedTests.push(failureInfo);

      logger.error(`❌ TEST FAILED: ${scenario.pickle.name}`);

      // Safely get attach function
      const attachFn = typeof this.attach === 'function' ? this.attach.bind(this) : null;
      await captureFailureScreenshot(this.page, scenario, attachFn);
    } else if (testStatus === 'PASSED') {
      this.testPassed = true;
      logger.info(`✅ TEST PASSED: ${scenario.pickle.name}`);
      logger.info(`📊 Steps completed: ${this.stepNumber} (Duration: ${duration})`);
    } else if (testStatus === 'SKIPPED') {
      logger.warn(`⏭️ TEST SKIPPED: ${scenario.pickle.name} (Status: ${scenario.result.status})`);
    }
  } catch (error) {
    logger.error(`Error in After hook: ${error.message}`);
  } finally {
    // Always clean up browser resources
    await cleanupBrowser(this);

    // Handle video file after cleanup
    if (finalVideoPath) {
      await handleVideoFile(finalVideoPath, testStatus, this.scenarioName);
    }
  }
});

AfterAll({ timeout: timeouts.long }, async function () {
  console.log('\n' + '='.repeat(80));
  console.log('📋 TEST EXECUTION SUMMARY');
  console.log('='.repeat(80));

  if (failedTests.length === 0) {
    console.log('🎉 ALL TESTS PASSED! No failures detected.');
    console.log('✅ No videos or screenshots saved (all tests passed)');
  } else {
    console.log(`❌ FAILED TESTS: ${failedTests.length}`);
    console.log(`\n📊 Summary: ${failedTests.length} test(s) failed`);

    failedTests.forEach((test, index) => {
      console.log(`\n${index + 1}. ${test.name}`);
      console.log(`   Feature: ${test.feature}`);
      console.log(`   Duration: ${test.duration}`);
      console.log(`   Time: ${new Date(test.timestamp).toLocaleTimeString()}`);
    });
  }

  const environment = process.env.CI ? 'CI' : 'local';
  const videoCount = countArtifacts(testPaths.videos, '.webm');
  const screenshotCount = countArtifacts(testPaths.screenshots, '.png');

  console.log(`\n📊 Artifacts Summary (${environment}):`);
  console.log(`🎥 Videos saved: ${videoCount} (failures only)`);
  console.log(`📸 Screenshots saved: ${screenshotCount} (failures only)`);

  if (videoCount > 0) {
    console.log(`📂 Videos location: ${testPaths.videos}`);
  }
  if (screenshotCount > 0) {
    console.log(`📂 Screenshots location: ${testPaths.screenshots}`);
  }

  console.log('='.repeat(80) + '\n');

  failedTests.length = 0;
});

// Graceful shutdown handler
process.on('SIGINT', async () => {
  logger.warn('🛑 SIGINT received - shutting down gracefully...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.warn('🛑 SIGTERM received - shutting down gracefully...');
  process.exit(0);
});
