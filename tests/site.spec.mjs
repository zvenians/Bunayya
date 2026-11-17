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
  await expect(page.locator("[data-gallery-id]")).toHaveCount(3);
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
  test.skip(testInfo.project.name.startsWith("desktop"));
  await page.locator("[data-menu]").click();
  await expect(page.locator("#nav")).toHaveClass(/open/);
  await page.locator("#nav a").first().click();
  await expect(page.locator("#nav")).not.toHaveClass(/open/);
});
test("mobile menu closes with Escape and restores focus", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name.startsWith("desktop"));
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

test("navigation is legible, mobile actions remain reachable, and custom fonts are applied", async ({ page }, testInfo) => {
  const nav = page.locator(".site-header nav");
  const font = await page.locator("body").evaluate(el => getComputedStyle(el).fontFamily);
  expect(font).toContain("Plus Jakarta Sans");
  await expect(page.locator(".site-header .brand")).toBeVisible();
  if (testInfo.project.name.startsWith("desktop")) {
    await expect(nav).toBeVisible();
    await expect(nav.locator("a").first()).toBeVisible();
  } else {
    await expect(page.locator(".site-header .header-actions .button")).toBeVisible();
    const layout = await page.evaluate(() => {
      const r = s => document.querySelector(s).getBoundingClientRect();
      const brand = r(".site-header .brand"), menu = r("[data-menu]"), actions = r(".header-actions");
      return { brandRight: brand.right, menuLeft: menu.left, menuRight: menu.right,
        actionsLeft: actions.left, screenWidth: innerWidth, actionsRight: actions.right };
    });
    expect(layout.brandRight, JSON.stringify(layout)).toBeLessThanOrEqual(layout.menuLeft + 2);
    expect(layout.menuRight, JSON.stringify(layout)).toBeLessThanOrEqual(layout.actionsLeft + 2);
    expect(layout.actionsRight).toBeLessThanOrEqual(layout.screenWidth + 1);
    await page.locator("[data-menu]").click();
    await expect(nav).toBeVisible();
    await expect(page.locator("[data-menu]")).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator("[data-menu]")).toHaveAttribute("aria-label", /menu|navigasi/i);
  }
});

test("hero text stays clear of carousel controls on phones", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.startsWith("desktop"));
  const bounds = await page.evaluate(() => {
    const stage = document.querySelector(".hero-stage");
    const visibleSlide = [...document.querySelectorAll("[data-slide]")].find(el => !el.hidden);
    const caption = visibleSlide.querySelector("div").getBoundingClientRect();
    const controls = stage.querySelector(".hero-controls").getBoundingClientRect();
    return { captionBottom: caption.bottom, controlsTop: controls.top };
  });
  expect(bounds.captionBottom, JSON.stringify(bounds)).toBeLessThanOrEqual(bounds.controlsTop + 2);
});

test("mobile tables expose complete information as readable cards", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.startsWith("desktop"));
  await expect(page.locator("[data-fee-table] tr")).toHaveCount(3);
  const styles = await page.evaluate(() => {
    const tr = document.querySelector(".fee-table tbody tr");
    return { display: getComputedStyle(tr).display,
      labels: [...tr.querySelectorAll("td")].slice(1).map(td => td.dataset.label) };
  });
  expect(styles.display).toBe("grid");
  expect(styles.labels.every(Boolean)).toBeTruthy();
  await expect(page.locator(".schedule tbody tr")).toHaveCount(3);
});

test("campus mobile navigation has an accessible label", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name.startsWith("desktop"));
  for (const path of ["/bunayya-i.html", "/bunayya-ii.html"]) {
    await page.goto(path);
    const button = page.locator("[data-menu]");
    await expect(button).toHaveAttribute("aria-label", /menu|navigasi/i);
    await button.click();
    await expect(page.locator("#nav")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(button).toHaveAttribute("aria-expanded", "false");
  }
});

test("latest YouTube data renders three cards and creates an iframe only after play", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop");
  await page.route("**/assets/youtube-latest.json", route => route.fulfill({
    contentType: "application/json",
    body: JSON.stringify({ videos: [
      { id: "HrK5yS7unyI", title: "Video satu", publishedAt: "2026-08-14T08:03:00Z", url: "https://youtu.be/HrK5yS7unyI", thumbnail: "https://i.ytimg.com/vi/HrK5yS7unyI/hqdefault.jpg" },
      { id: "HssHrop8GnY", title: "Video dua", publishedAt: "2026-08-14T08:01:27Z", url: "https://youtu.be/HssHrop8GnY", thumbnail: "https://i.ytimg.com/vi/HssHrop8GnY/hqdefault.jpg" },
      { id: "eU4f9PDEtok", title: "Video tiga", publishedAt: "2026-08-07T02:11:36Z", url: "https://youtu.be/eU4f9PDEtok", thumbnail: "https://i.ytimg.com/vi/eU4f9PDEtok/hqdefault.jpg" },
    ] }),
  }));
  await page.reload();
  await expect(page.locator(".video-card")).toHaveCount(3);
  await expect(page.locator(".video-media iframe")).toHaveCount(0);
  await page.locator(".video-play").first().click();
  await expect(page.locator(".video-media iframe")).toHaveAttribute("src", /youtube-nocookie\.com/);
});

test("campus maps use the verified place identifiers", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop");
  const maps = page.locator('[data-map-frame] iframe');
  await expect(maps).toHaveCount(2);
  await expect(maps.nth(0)).toHaveAttribute("src", /ChIJ_TqGBqL_aS4R4VII-RjtEOk/);
  await expect(maps.nth(1)).toHaveAttribute("src", /ChIJE58rYpv_aS4RbqjFT5THxyA/);
  await page.goto("/bunayya-i.html");
  await expect(page.locator('[data-map-frame] iframe')).toHaveCount(1);
  await page.goto("/bunayya-ii.html");
  await expect(page.locator('[data-map-frame] iframe')).toHaveCount(1);
});
