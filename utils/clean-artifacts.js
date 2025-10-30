#!/usr/bin/env node

/**
 * 🧹 ARTIFACT CLEANER
 *
 * Cleans test artifacts (videos, screenshots, reports)
 * Usage:
 *   npm run clean-artifacts              # Clean all
 *   npm run clean-videos                 # Videos only
 *   npm run clean-screenshots            # Screenshots only
 *   npm run clean-reports                # Reports only
 *   node util/clean-artifacts.js --keep-last 3  # Keep last 3 reports
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');

// Parse command line arguments
const args = process.argv.slice(2);
const videosOnly = args.includes('--videos-only');
const screenshotsOnly = args.includes('--screenshots-only');
const reportsOnly = args.includes('--reports-only');
const keepLast = args.includes('--keep-last') ? parseInt(args[args.indexOf('--keep-last') + 1]) || 5 : null;

const paths = {
  videos: path.join(rootDir, 'test-results/videos'),
  screenshots: path.join(rootDir, 'test-results/screenshots'),
  jsonReports: path.join(rootDir, 'reports/json'),
  htmlReports: path.join(rootDir, 'reports/html'),
  testResults: path.join(rootDir, 'test-results') // Only for .log files
};

/**
 * Clean a directory
 * SAFETY: Only cleans files matching the pattern, never deletes the directory itself
 */
function cleanDirectory(dirPath, pattern = null, keepLastN = null) {
  // Safety check: ensure we're not at root directory
  const absolutePath = path.resolve(dirPath);
  const rootPath = path.resolve(rootDir);

  if (absolutePath === rootPath) {
    console.log('  ⚠️  SAFETY: Refusing to clean root directory');
    return { count: 0, size: 0 };
  }

  // Create directory if it doesn't exist
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`  ℹ️  Directory created: ${path.basename(dirPath)}`);
    return { count: 0, size: 0 };
  }

  let files;
  try {
    files = fs.readdirSync(dirPath);
  } catch (error) {
    console.log(`  ⚠️  Cannot read directory: ${error.message}`);
    return { count: 0, size: 0 };
  }

  // Filter out protected files and directories
  let filesToDelete = files.filter(file => {
    const lowerFile = file.toLowerCase();
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);

    // Never delete directories when cleaning
    if (stats.isDirectory()) {
      return false;
    }

    // Protected files
    return (
      file !== '.gitkeep' &&
      file !== '.gitignore' &&
      file !== '.DS_Store' &&
      !lowerFile.startsWith('readme') &&
      !lowerFile.startsWith('.')
    ); // Protects all hidden files
  });

  // Filter by pattern if provided
  if (pattern) {
    filesToDelete = filesToDelete.filter(file => {
      if (pattern instanceof RegExp) {
        return pattern.test(file);
      }
      return file.includes(pattern);
    });
  }

  // Keep last N files if specified
  if (keepLastN !== null && filesToDelete.length > keepLastN) {
    // Sort by modification time (newest first)
    const filesWithStats = filesToDelete.map(file => ({
      name: file,
      path: path.join(dirPath, file),
      mtime: fs.statSync(path.join(dirPath, file)).mtime
    }));

    filesWithStats.sort((a, b) => b.mtime - a.mtime);

    // Keep the newest N, delete the rest
    filesToDelete = filesWithStats.slice(keepLastN).map(f => f.name);
  }

  if (filesToDelete.length === 0) {
    console.log('  ℹ️  Directory is already empty');
    return { count: 0, size: 0 };
  }

  let deletedCount = 0;
  let deletedSize = 0;

  filesToDelete.forEach(file => {
    const filePath = path.join(dirPath, file);
    try {
      const stats = fs.statSync(filePath);
      deletedSize += stats.size;
      fs.unlinkSync(filePath);
      deletedCount++;
    } catch (error) {
      console.log(`  ⚠️  Could not delete ${file}: ${error.message}`);
    }
  });

  return { count: deletedCount, size: deletedSize };
}

/**
 * Format bytes to human readable
 */
function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Main cleanup logic
 */
function cleanup() {
  console.log('🧹 Cleaning test artifacts...\n');

  let totalDeleted = 0;
  let totalSize = 0;

  // Clean videos
  if (!screenshotsOnly && !reportsOnly) {
    console.log('📹 Cleaning videos...');
    const result = cleanDirectory(paths.videos, /\.(webm|mp4)$/);
    totalDeleted += result.count;
    totalSize += result.size;
    if (result.count > 0) {
      console.log(`  ✅ Deleted ${result.count} video(s) (${formatBytes(result.size)})`);
    }
    console.log();
  }

  // Clean screenshots
  if (!videosOnly && !reportsOnly) {
    console.log('📸 Cleaning screenshots...');
    const result = cleanDirectory(paths.screenshots, /\.(png|jpg|jpeg)$/);
    totalDeleted += result.count;
    totalSize += result.size;
    if (result.count > 0) {
      console.log(`  ✅ Deleted ${result.count} screenshot(s) (${formatBytes(result.size)})`);
    }
    console.log();
  }

  // Clean reports
  if (!videosOnly && !screenshotsOnly) {
    console.log('📊 Cleaning reports...');

    // JSON reports
    const jsonResult = cleanDirectory(paths.jsonReports, /\.json$/, keepLast);
    totalDeleted += jsonResult.count;
    totalSize += jsonResult.size;

    if (jsonResult.count > 0) {
      if (keepLast) {
        console.log(`  ✅ Deleted ${jsonResult.count} JSON report(s) (kept last ${keepLast})`);
      } else {
        console.log(`  ✅ Deleted ${jsonResult.count} JSON report(s) (${formatBytes(jsonResult.size)})`);
      }
    }

    // HTML reports
    const htmlResult = cleanDirectory(paths.htmlReports);
    totalDeleted += htmlResult.count;
    totalSize += htmlResult.size;
    if (htmlResult.count > 0) {
      console.log(`  ✅ Deleted ${htmlResult.count} HTML report(s) (${formatBytes(htmlResult.size)})`);
    }
    console.log();
  }

  // Clean logs (only .log files in test-results root)
  if (!videosOnly && !screenshotsOnly && !reportsOnly) {
    console.log('📝 Cleaning logs...');
    const logResult = cleanDirectory(paths.testResults, /\.log$/);
    totalDeleted += logResult.count;
    totalSize += logResult.size;
    if (logResult.count > 0) {
      console.log(`  ✅ Deleted ${logResult.count} log file(s) (${formatBytes(logResult.size)})`);
    }
    console.log();
  }

  // Summary
  console.log('━'.repeat(60));
  if (totalDeleted === 0) {
    console.log('✅ Nothing to clean - all directories are empty or don\'t exist');
  } else {
    console.log('✅ Cleanup complete!');
    console.log(`   Total files deleted: ${totalDeleted}`);
    console.log(`   Total space freed: ${formatBytes(totalSize)}`);
  }
  console.log('━'.repeat(60));
}

/**
 * Show help
 */
function showHelp() {
  console.log(`
🧹 Artifact Cleaner - Usage:

  npm run clean-artifacts                   # Clean all artifacts
  npm run clean-videos                      # Clean only videos
  npm run clean-screenshots                 # Clean only screenshots
  npm run clean-reports                     # Clean only reports
  node util/clean-artifacts.js --keep-last 5   # Keep last 5 JSON reports

Examples:
  npm run clean-artifacts                   # Clean everything
  npm run clean-videos                      # Only delete videos
  node util/clean-artifacts.js --keep-last 3   # Keep last 3 reports
  `);
}

// Run
if (args.includes('--help') || args.includes('-h')) {
  showHelp();
} else {
  cleanup();
}
