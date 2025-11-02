export const mimeTypes = {
  png: "image/png",
  webm: "video/webm",
  json: "application/json",
};

export const browserArgs = {
  ci: [
    "--disable-dev-shm-usage",
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-gpu",
  ],
};

export const fileExtensions = {
  png: ".png",
  webm: ".webm",
  json: ".json",
};

export const testPaths = {
  videos: "test-results/videos/",
  screenshots: "test-results/screenshots/",
  reports: "reports/",
};

export const technicalConstants = {
  keyboard: {
    enter: "Enter",
    escape: "Escape",
    tab: "Tab",
    ctrlA: "Control+A",
    backspace: "Backspace",
  },
  sensitivePatterns: [
    "password",
    "pass",
    "pwd",
    "secret",
    "token",
    "key",
    "credential",
    "auth",
  ],
};
