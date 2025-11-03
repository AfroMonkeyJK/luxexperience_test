#!/usr/bin/env node

import { readdir, rm, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

/**
 * Clean reports utility that preserves folder structure
 */

async function cleanDirectory(dirPath) {
  try {
    if (!existsSync(dirPath)) {
      console.log(`📁 Directory ${dirPath} doesn't exist, creating it...`);
      await mkdir(dirPath, { recursive: true });
      return;
    }

    const files = await readdir(dirPath);
    const deletePromises = files.map(async (file) => {
      const filePath = path.join(dirPath, file);
      await rm(filePath, { recursive: true, force: true });
    });

    await Promise.all(deletePromises);
    console.log(`🧹 Cleaned ${files.length} items from ${dirPath}`);
  } catch (error) {
    console.error(`❌ Error cleaning ${dirPath}:`, error.message);
  }
}

async function cleanReports() {
  console.log('🧹 Cleaning reports...');

  const jsonDir = path.join(process.cwd(), 'reports', 'json');
  const htmlDir = path.join(process.cwd(), 'reports', 'html');

  await cleanDirectory(jsonDir);
  await cleanDirectory(htmlDir);

  console.log('✅ Reports cleaned successfully!');
  console.log('📁 Folder structure preserved');
}

// Get command line arguments
const args = process.argv.slice(2);
const command = args[0];

if (command === 'json') {
  const jsonDir = path.join(process.cwd(), 'reports', 'json');
  console.log('🧹 Cleaning JSON reports...');
  await cleanDirectory(jsonDir);
  console.log('✅ JSON reports cleaned!');
} else if (command === 'html') {
  const htmlDir = path.join(process.cwd(), 'reports', 'html');
  console.log('🧹 Cleaning HTML reports...');
  await cleanDirectory(htmlDir);
  console.log('✅ HTML reports cleaned!');
} else {
  // Clean all reports by default
  await cleanReports();
}
