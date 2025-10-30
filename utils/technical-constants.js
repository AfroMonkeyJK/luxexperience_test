/**
 * MIME Types - Standard identifiers that tell browsers/applications what kind of file they're dealing with
 * Format: type/subtype (e.g., 'image/png')
 * Used for: File uploads, downloads, attachments, and content type identification
 */
export const mimeTypes = {
  // Images
  png: "image/png",
  jpeg: "image/jpeg",
  webp: "image/webp",
  // Documents
  pdf: "application/pdf",
  json: "application/json",
  xml: "application/xml",
  zip: "application/zip",
  // Text
  html: "text/html",
  css: "text/css",
  javascript: "text/javascript",
  plain: "text/plain",
  // Video
  mp4: "video/mp4",
  webm: "video/webm",
  avi: "video/avi",
};
/**
 * File Extensions - Used for file naming and identification
 */
export const fileExtensions = {
  // Images
  png: ".png",
  jpeg: ".jpg",
  webp: ".webp",
  // Documents
  pdf: ".pdf",
  json: ".json",
  xml: ".xml",
  zip: ".zip",
  // Text
  html: ".html",
  css: ".css",
  javascript: ".js",
  text: ".txt",
  // Video
  mp4: ".mp4",
  webm: ".webm",
  avi: ".avi",
};

/**
 * Browser Arguments - Command line flags for Chromium/Chrome browser
 * CI args: Optimized for headless CI environments (Docker, GitHub Actions, etc.)
 */
export const browserArgs = {
  ci: [
    "--no-sandbox", // Disables Chrome sandbox (required in Docker)
    "--disable-dev-shm-usage", // Uses /tmp instead of /dev/shm (prevents crashes)
    "--disable-gpu", // Disables GPU acceleration (not needed headless)
    "--disable-web-security", // Allows cross-origin requests for testing
    "--disable-features=VizDisplayCompositor", // Prevents display compositor issues
  ],
  debug: [
    "--remote-debugging-port=9222", // Enables Chrome DevTools debugging
    "--disable-web-security", // Allows cross-origin requests
    "--disable-features=VizDisplayCompositor",
  ],
};

/**
 * Test Directories - Standard folder paths for test artifacts
 */
export const testPaths = {
  videos: "test-results/videos/",
  screenshots: "test-results/screenshots/",
  reports: "reports/",
  jsonReports: "reports/json/",
  htmlReports: "reports/html/",
  downloads: "test-results/downloads/",
};

/**
 * Keyboard Key Mappings - Standard key names for keyboard interactions
 * Used for: Simulating key presses in browser automation
 */
export const keyboard = {
  escape: "Escape",
  backspace: "Backspace",
  enter: "Enter",
  tab: "Tab",
  ctrlA: "Control+A",
  ctrlC: "Control+C",
};

/**
 * Sensitive Field Patterns - Keywords to detect sensitive input fields
 * Used for: Automatic masking of sensitive data in logs
 */
export const sensitivePatterns = [
  "password",
  "passwd",
  "pwd",
  "secret",
  "token",
  "key",
  "apikey",
  "api_key",
  "auth",
  "authorization",
  "credential",
  "otp",
  "pin",
  "ssn",
  "cvv",
  "card",
];

// Export everything as a combined object for convenience
export const technicalConstants = {
  mimeTypes,
  fileExtensions,
  browserArgs,
  viewport,
  encoding,
  testPaths,
  keyboard,
  sensitivePatterns,
};

export default technicalConstants;
