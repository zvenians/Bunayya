import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests",
  testMatch: "site.spec.mjs",
  outputDir: "test-results",
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "playwright-report" }],
  ],
  use: { baseURL: "http://127.0.0.1:4173", trace: "retain-on-failure" },
  webServer: {
    command: "npm run serve",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: true,
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 900 } } },
    { name: "desktop-1920", use: { viewport: { width: 1920, height: 1080 } } },
    { name: "desktop-1280", use: { viewport: { width: 1280, height: 900 } } },
    { name: "desktop-1024", use: { viewport: { width: 1024, height: 900 } } },
    { name: "tablet", use: { viewport: { width: 768, height: 1024 } } },
    { name: "mobile-430", use: { viewport: { width: 430, height: 900 } } },
    { name: "mobile-390", use: { viewport: { width: 390, height: 844 } } },
    { name: "mobile-375", use: { viewport: { width: 375, height: 812 } } },
    { name: "mobile-360", use: { viewport: { width: 360, height: 800 } } },
    { name: "mobile-320", use: { viewport: { width: 320, height: 720 } } },
  ],
});
