import { chromium } from "@playwright/test";
import { mkdir, readFile, readdir } from "node:fs/promises";
import path from "node:path";

const sourceDir = path.resolve("assets/photos/candidates");
const outputDir = path.resolve("assets/photos");
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

await mkdir(outputDir, { recursive: true });

for (const file of (await readdir(sourceDir)).filter((name) => /\.jpe?g$/i.test(name))) {
  const source = path.join(sourceDir, file);
  const dataUrl = `data:image/jpeg;base64,${(await readFile(source)).toString("base64")}`;
  await page.setContent(`<img id="photo" src="${dataUrl}" alt="">`);
  await page.locator("#photo").waitFor({ state: "visible" });
  const dimensions = await page.locator("#photo").evaluate((image) => ({
    width: image.naturalWidth,
    height: image.naturalHeight,
  }));
  const width = Math.min(1800, dimensions.width);
  const height = Math.round((dimensions.height / dimensions.width) * width);
  await page.setViewportSize({ width, height });
  await page.setContent(
    `<style>*{box-sizing:border-box}html,body{margin:0;width:100%;height:100%;overflow:hidden}img{width:100%;height:100%;object-fit:cover;display:block}</style><img id="photo" src="${dataUrl}" alt="">`,
  );
  await page.locator("#photo").waitFor({ state: "visible" });
  await page.screenshot({
    path: path.join(outputDir, file),
    type: "jpeg",
    quality: 84,
  });
}

await browser.close();
