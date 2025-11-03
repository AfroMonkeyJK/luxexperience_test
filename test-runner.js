#!/usr/bin/env node

import { spawn } from "child_process";
import { generate } from "multiple-cucumber-html-reporter";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import {
  Environments,
  validEnvironments,
  isValidEnvironment,
} from "./util/environment-config.js";

let cucumberProcess = null;
let isShuttingDown = false;
const handleShutdown = () => {
  process.env.FORCE_SHUTDOWN = "true";
  if (cucumberProcess && !cucumberProcess.killed) {
    try {
      cucumberProcess.kill("SIGKILL");
    } catch {}
  }
  process.nextTick(() => process.exit(0));
  setImmediate(() => process.exit(0));
  process.exit(0);
};

process.on("SIGINT", handleShutdown);
process.removeAllListeners("uncaughtException");
process.removeAllListeners("unhandledRejection");

const args = process.argv.slice(2);
const environment = args[0] || Environments.PRODUCTION;
const shouldGenerateReport =
  args.includes("--report") ||
  args.includes("report") ||
  process.env.CI === "true";
const tagIndex = args.findIndex((arg) => arg === "--tags");
const tags = tagIndex !== -1 && args[tagIndex + 1] ? args[tagIndex + 1] : null;
if (!isValidEnvironment(environment)) {
  console.error(`❌ Invalid environment: ${environment}`);
  console.log(`✅ Valid environments: ${validEnvironments.join(", ")}`);
  process.exit(1);
}
console.log(`🚀 Running tests in ${environment.toUpperCase()} environment...`);
if (tags) {
  console.log(`🏷️  Filtering tests with tags: ${tags}`);
} else {
  console.log("📁 Running all tests (no tag filter)");
}
process.env.ENV_VARS = environment;
let cucumberArgs = [
  'cucumber-js',
  '--import', 'step-definitions/console-steps.js',
  '--import', 'hooks/hooks.js',
  '--format', 'progress',
  '--publish-quiet'
];

if (tags) {
  cucumberArgs.push("--tags", tags);
}

if (shouldGenerateReport) {
  const now = new Date();
  const dateString = now.toLocaleDateString("en-GB").replace(/\//g, "-");
  const timeString = now
    .toLocaleTimeString("en-GB", { hour12: false })
    .replace(/:/g, "-");
  const tagSuffix = tags
    ? `_${tags.replace("@", "").replace(/\s+/g, "_")}`
    : "";
  const reportBaseName = `E2E-Report-${environment.toUpperCase()}${tagSuffix}-${dateString}_${timeString}`;
  const jsonReportPath = `reports/json/${reportBaseName}.json`;
  console.log(`📊 JSON Report: ${jsonReportPath}`);
  cucumberArgs.push("--format", `json:${jsonReportPath}`);
} else {
  console.log("📊 No report generation requested");
}
cucumberProcess = spawn("npx", cucumberArgs, {
  stdio: "inherit",
  shell: true,
  env: {
    ...process.env,
    ENV_VARS: environment === Environments.TEST ? undefined : environment,
  },
});
// Handle process completion
cucumberProcess.on("close", (code) => {
  cucumberProcess = null; // Clear reference
  if (isShuttingDown) {
    console.log("🛑 Process was terminated by user");
    process.exit(0);
  }
  const testType = tags ? `Tagged tests (${tags})` : "All tests";
  console.log(`📋 ${testType} completed with exit code: ${code}`);
  if (shouldGenerateReport) {
    console.log("📊 Generating HTML report...");
    try {
      generateReport();
      console.log("✅ Report generated successfully!");
    } catch (error) {
      console.error("❌ Failed to generate report:", error.message);
      if (process.env.CI === "true") {
        console.log("🔄 Continuing in CI mode...");
      }
    }
  }
  if (process.env.CI !== "true") {
    console.log("📹 Videos saved in: test-results/videos/");
    console.log("📸 Screenshots saved in: test-results/screenshots/");
  }
  process.exit(code);
});
// Handle process errors
cucumberProcess.on("error", (error) => {
  console.error("❌ Failed to start cucumber process:", error);
  cucumberProcess = null;
  process.exit(1);
});
// Handle child process spawn errors
cucumberProcess.on("spawn", () => {
  console.log("🎬 Cucumber process started successfully");
});
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export function generateReport() {
  console.log(
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  );
  console.log("📊 Test Report Generator");
  console.log(
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  );
  const environment = process.env.ENV_VARS || "dev";
  const jsonDir = path.join(__dirname, "reports/json/");
  const htmlDir = path.join(__dirname, "reports/html/");

  try {
    if (!fs.existsSync(jsonDir)) {
      fs.mkdirSync(jsonDir, { recursive: true });
    }

    const jsonFiles = fs
      .readdirSync(jsonDir)
      .filter((file) => file.endsWith(".json"))
      .filter((file) => {
        const filePath = path.join(jsonDir, file);
        const stats = fs.statSync(filePath);
        return stats.size > 0;
      })
      .sort((a, b) => {
        const pathA = path.join(jsonDir, a);
        const pathB = path.join(jsonDir, b);
        return fs.statSync(pathB).mtime - fs.statSync(pathA).mtime;
      });

    if (jsonFiles.length === 0) {
      throw new Error(
        `No valid JSON files found in ${jsonDir}. Make sure tests have run successfully.`
      );
    }

    const latestJsonFile = jsonFiles[0];
    console.log(`📊 Processing latest report: ${latestJsonFile}`);

    const reportNameFromFile = latestJsonFile.replace(".json", "");
    const filenameParts = reportNameFromFile.match(
      /E2E-Report-([A-Z]+)(_[^-]+)?-(\d{2}-\d{2}-\d{4})_(\d{2}-\d{2}-\d{2})/
    );
    let reportDisplayName, tags, dateString, timeString;
    if (filenameParts) {
      const [, env, tagSuffix, date, time] = filenameParts;
      reportDisplayName = `E2E-Report-${env}${tagSuffix || ""}-${date}`;
      tags = tagSuffix
        ? tagSuffix.replace("_", "").replace(/\s+/g, " ")
        : "All Tests";
      dateString = date;
      timeString = time;
    } else {
      const now = new Date();
      dateString = now.toLocaleDateString("en-GB").replace(/\//g, "-");
      timeString = now
        .toLocaleTimeString("en-GB", { hour12: false })
        .replace(/:/g, "-");
      reportDisplayName = `E2E-Report-${environment.toUpperCase()}-${dateString}`;
      tags = "All Tests";
    }

    console.log(`🏷️  Report Name: ${reportDisplayName}`);
    console.log(`🎯 Tags: ${tags}`);
    console.log(`🌍 Environment: ${environment.toUpperCase()}`);

    const customHtmlDir = path.join(htmlDir, reportNameFromFile);

    const reportOptions = {
      jsonDir: jsonDir,
      reportPath: customHtmlDir,
      openReportInBrowser: false,
      saveCollectedJSON: false,
      disableLog: true,
      metadata: {
        browser: {
          name: "chrome",
          version: "latest",
        },
        device: "Local test machine",
        platform: {
          name: process.platform,
          version: process.version,
        },
      },
      customData: {
        title: `Test Automation Report - ${environment.toUpperCase()}`,
        data: [
          { label: "Project", value: "E2E Testing" },
          { label: "Release", value: "1.0.0" },
          { label: "Test Suite", value: tags },
          { label: "Environment", value: environment.toUpperCase() },
          { label: "Execution Date", value: dateString.replace(/-/g, "/") },
          { label: "Execution Time", value: timeString.replace(/-/g, ":") },
          { label: "JSON Source", value: latestJsonFile },
        ],
      },
      displayDuration: true,
      displayReportTime: true,
      useCDN: true,
      pageTitle: `${reportDisplayName} - Automation`,
      reportName: reportDisplayName,
      pageFooter: `<div><p>Generated Andreu Test Automation Framework | ${reportNameFromFile}</p></div>`,
      hideMetadata: false,
      customMetadata: true,
    };

    console.log("📊 Generating HTML report...");
    generate(reportOptions);

    try {
      console.log("🔧 Post-processing report files...");
      const oldIndexPath = path.join(customHtmlDir, "index.html");
      const newIndexPath = path.join(customHtmlDir, "Automation-report.html");
      if (fs.existsSync(oldIndexPath)) {
        fs.renameSync(oldIndexPath, newIndexPath);
        console.log("✅ Renamed index.html → Automation-report.html");
      }

      const featuresDir = path.join(customHtmlDir, "features");
      if (fs.existsSync(featuresDir)) {
        const subFolders = fs.readdirSync(featuresDir);
        subFolders.forEach((folder) => {
          const folderPath = path.join(featuresDir, folder);
          const isDirectory = fs.statSync(folderPath).isDirectory();
          if (isDirectory && folder.includes("-") && folder.length > 50) {
            const cleanFolderName = folder.replace(
              /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}-/,
              ""
            );
            if (cleanFolderName !== folder) {
              const newFolderPath = path.join(featuresDir, cleanFolderName);
              try {
                fs.renameSync(folderPath, newFolderPath);
                console.log(
                  `✅ Cleaned folder name: ${folder} → ${cleanFolderName}`
                );
                if (fs.existsSync(newIndexPath)) {
                  let reportContent = fs.readFileSync(newIndexPath, "utf8");
                  reportContent = reportContent.replace(
                    new RegExp(folder, "g"),
                    cleanFolderName
                  );
                  fs.writeFileSync(newIndexPath, reportContent);
                }
              } catch (renameError) {
                console.warn(
                  `⚠️ Could not rename folder ${folder}:`,
                  renameError.message
                );
              }
            }
          }
        });
        console.log("✅ Cleaned up feature folder names");
      }

      const infoFile = path.join(customHtmlDir, "report-info.txt");
      const reportInfo = `
Automation Test Report
===========================
Report Name: ${reportDisplayName}
Environment: ${environment.toUpperCase()}
Test Suite: ${tags}
Execution Date: ${dateString.replace(/-/g, "/")}
Execution Time: ${timeString.replace(/-/g, ":")}
JSON Source: ${latestJsonFile}

Files:
- Main Report: Automation-report.html
- Features: features/ directory

Generated: ${new Date().toISOString()}
`.trim();
      fs.writeFileSync(infoFile, reportInfo);
      console.log("✅ Created report-info.txt");
    } catch (postProcessError) {
      console.warn("⚠️ Post-processing warning:", postProcessError.message);
    }

    console.log("✅ HTML report generated successfully!");
    console.log(`📁 Report location: ${customHtmlDir}`);
    console.log(
      `🌐 Open report: file://${path.resolve(
        customHtmlDir,
        "Automation-report.html"
      )}`
    );
    console.log(`🏷️ Report identifier: ${reportNameFromFile}`);
    console.log(
      "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    );
  } catch (error) {
    console.error(`❌ Failed to generate report: ${error.message}`);
    if (process.env.CI === "true") {
      console.log("🔄 Continuing in CI mode...");
      return null;
    }
    throw error;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  generateReport();
}
