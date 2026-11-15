import { test, expect } from "@playwright/test";
test.beforeEach(async ({ page }) => {
  await page.goto("/index.html");
});
test("home renders without console errors and no horizontal overflow", async ({
  page,
}) => {
  const errors = [];
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  await page.reload();
  await expect(page.locator("h1")).toBeVisible();
  expect(
    await page.evaluate(
      () =>
        document.documentElement.scrollWidth <=
        document.documentElement.clientWidth + 1,
    ),
  ).toBeTruthy();
  expect(errors).toEqual([]);
});
test("language persists and interface switches", async ({ page }) => {
  await page.evaluate(() => localStorage.setItem("bunayya-language", "id"));
  await page.reload();
  await page.locator("[data-language]").click();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
  await expect(page.locator('#admissions h2 [data-lang="en"]')).toContainText(
    "Clear, transparent",
  );
  await expect(page.locator('#admissions h2 [data-lang="en"]')).toBeVisible();
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "en");
});
test("language switching preserves calculator state and hides inactive language", async ({
  page,
}) => {
  await page.locator("#campus").selectOption("BUNAYYA II");
  await page.locator("#level").selectOption("TK B");
  await page.locator("#period").selectOption("2");
  await page.locator("[data-language]").click();
  await expect(page.locator("#campus")).toHaveValue("BUNAYYA II");
  await expect(page.locator("#level")).toHaveValue("TK B");
  await expect(page.locator("#period")).toHaveValue("2");
  await expect(page.locator("[data-total]")).toHaveText("Rp 6.305.000");
  expect(await page.locator('[data-lang="id"]:visible').count()).toBe(0);
});
test("gallery filters, carousel, and lightbox work", async ({ page }) => {
  await page.locator('[data-filter="learning"]').click();
  await expect(page.locator("[data-gallery-id]")).toHaveCount(2);
  await page.locator("[data-gallery-id]").first().click();
  await expect(page.locator("[data-lightbox]")).toHaveAttribute("open", "");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Escape");
  await expect(page.locator("[data-lightbox]")).not.toHaveAttribute("open", "");
});
test("calculator and WhatsApp summary work", async ({ page }) => {
  await page.locator("#level").selectOption("TK A");
  await page.locator("#period").selectOption("0");
  await expect(page.locator("[data-total]")).toHaveText("Rp 6.255.000");
  await expect(page.locator("[data-calc-wa]")).toHaveAttribute(
    "href",
    /wa\.me\/6287888889199/,
  );
});
test("all 12 tuition combinations are correct", async ({ page }) => {
  const expected = {
    KB: [5775000, 6025000, 6275000, 6525000],
    "TK A": [6255000, 6505000, 6755000, 7005000],
    "TK B": [5805000, 6055000, 6305000, 6555000],
  };
  for (const [level, totals] of Object.entries(expected))
    for (let period = 0; period < 4; period++) {
      await page.locator("#level").selectOption(level);
      await page.locator("#period").selectOption(String(period));
      await expect(page.locator("[data-total]")).toHaveText(
        "Rp " + new Intl.NumberFormat("id-ID").format(totals[period]),
      );
    }
});
test("mobile menu opens and closes", async ({ page }, testInfo) => {
  test.skip(["desktop", "desktop-1024"].includes(testInfo.project.name));
  await page.locator("[data-menu]").click();
  await expect(page.locator("#nav")).toHaveClass(/open/);
  await page.locator("#nav a").first().click();
  await expect(page.locator("#nav")).not.toHaveClass(/open/);
});
test("mobile menu closes with Escape and restores focus", async ({
  page,
}, testInfo) => {
  test.skip(["desktop", "desktop-1024"].includes(testInfo.project.name));
  const button = page.locator("[data-menu]");
  await button.focus();
  await button.click();
  await page.keyboard.press("Escape");
  await expect(page.locator("#nav")).not.toHaveClass(/open/);
  await expect(button).toBeFocused();
  await expect(page.locator("body")).not.toHaveAttribute("data-menu-open", "");
});
test("downloads and campus pages return 200", async ({ page, request }) => {
  for (const path of [
    "/brochures/profil-bunayya.pdf",
    "/brochures/biaya-pendidikan-2027-2028.pdf",
    "/brochures/paket-lengkap-bunayya.pdf",
    "/bunayya-i.html",
    "/bunayya-ii.html",
  ])
    expect((await request.get(path)).status()).toBe(200);
  await page.goto("/bunayya-i.html");
  await expect(page.locator("h1")).toContainText("BUNAYYA I");
  await page.goto("/bunayya-ii.html");
  await expect(page.locator("h1")).toContainText("BUNAYYA II");
});
test("keyboard focus is visible and semantic controls are named", async ({
  page,
}) => {
  await page.keyboard.press("Tab");
  await expect(page.locator(".skip")).toBeFocused();
  for (const button of await page.locator("button").all())
    expect(
      (await button.getAttribute("aria-label")) || (await button.textContent()),
    ).toBeTruthy();
});
test("reduced motion does not hide reveal content", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.reload();
  await expect(page.locator(".reveal").first()).toBeVisible();
});
