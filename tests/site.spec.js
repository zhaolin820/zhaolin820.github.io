import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const pages = ["/index.html", "/research.html", "/publications.html", "/software.html"];
const viewports = [
  { name: "mobile", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "desktop", width: 1440, height: 900 }
];

for (const viewport of viewports) {
  for (const route of pages) {
    test(`${route} is responsive at ${viewport.name}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto(route);

      await expect(page.locator("h1")).toHaveCount(1);
      await expect(page.locator("header nav")).toBeVisible();
      await expect(page.locator("main")).toBeVisible();
      await expect(page.locator("footer")).toBeVisible();

      const layout = await page.evaluate(() => {
        const toggle = document.getElementById("theme-toggle").getBoundingClientRect();
        const navLinks = document.querySelector(".nav-links").getBoundingClientRect();
        return {
          viewportWidth: document.documentElement.clientWidth,
          scrollWidth: document.documentElement.scrollWidth,
          toggle: { left: toggle.left, right: toggle.right, top: toggle.top, bottom: toggle.bottom },
          navLinks: { left: navLinks.left, right: navLinks.right, top: navLinks.top, bottom: navLinks.bottom },
          oversizedImages: [...document.images].filter((image) => image.getBoundingClientRect().right > document.documentElement.clientWidth + 1).length
        };
      });

      expect(layout.scrollWidth).toBeLessThanOrEqual(layout.viewportWidth);
      expect(layout.oversizedImages).toBe(0);
      const overlaps = layout.navLinks.right > layout.toggle.left
        && layout.navLinks.left < layout.toggle.right
        && layout.navLinks.bottom > layout.toggle.top
        && layout.navLinks.top < layout.toggle.bottom;
      expect(overlaps).toBe(false);
    });
  }
}

test("theme selection persists across pages", async ({ page }) => {
  await page.goto("/index.html");
  await page.evaluate(() => localStorage.removeItem("theme"));
  await page.reload();

  const toggle = page.getByRole("button", { name: /Switch to (dark|light) mode/ });
  const before = await page.locator("html").getAttribute("data-theme");
  await toggle.click();
  const after = await page.locator("html").getAttribute("data-theme");
  expect(after).not.toBe(before);
  await expect(toggle).toHaveAttribute("aria-pressed", after === "dark" ? "true" : "false");

  await page.goto("/research.html");
  await expect(page.locator("html")).toHaveAttribute("data-theme", after);
});

test("theme safely follows the system when storage is unavailable", async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(Storage.prototype, "getItem", { value() { throw new Error("storage disabled"); } });
    Object.defineProperty(Storage.prototype, "setItem", { value() { throw new Error("storage disabled"); } });
  });
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/index.html");
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

test("keyboard users reach the skip link first", async ({ page }) => {
  await page.goto("/index.html");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Skip to main content" })).toBeFocused();
});

test("all public publications are rendered without JavaScript", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4173/publications.html");
  await expect(page.locator(".publication-list > li")).toHaveCount(80);
  await expect(page.getByText("First Author", { exact: true })).toHaveCount(2);
  await expect(page.getByText("Co-Author", { exact: true })).toHaveCount(2);
  await context.close();
});

test("research citations preserve full arXiv preprint labels", async ({ page }) => {
  await page.goto("/research.html");
  const labels = await page.locator(".research-paper-list cite").evaluateAll((items) =>
    items.map((item) => item.textContent.trim()).filter((text) => text.startsWith("arXiv preprint arXiv:"))
  );

  expect(labels).toHaveLength(13);
  expect(labels).toContain("arXiv preprint arXiv:2605.08772");
  expect(labels).toContain("arXiv preprint arXiv:2607.10746");
  expect(labels.every((label) => /^arXiv preprint arXiv:\d{4}\.\d{4,5}(?:v\d+)?$/.test(label))).toBe(true);
});

test("software projects render as static, structured content", async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4173/software.html");

  await expect(page.getByRole("heading", { name: "OpenAirTwin" })).toBeVisible();
  await expect(page.locator(".software-actions a")).toHaveCount(4);
  await expect(page.getByRole("link", { name: "GitHub Repository" })).toHaveAttribute("href", "https://github.com/HKUOpenSource/OpenAirTwin");
  const structuredData = await page.locator('script[type="application/ld+json"]').textContent();
  expect(structuredData).toContain("SoftwareSourceCode");
  await context.close();
});

test("software logo follows the selected theme", async ({ page }) => {
  await page.goto("/software.html");
  await page.evaluate(() => localStorage.setItem("theme", "light"));
  await page.reload();

  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
  await expect(page.locator(".software-logo-light")).toBeVisible();
  await expect(page.locator(".software-logo-dark")).toBeHidden();

  await page.getByRole("button", { name: "Switch to dark mode" }).click();
  await expect(page.locator(".software-logo-light")).toBeHidden();
  await expect(page.locator(".software-logo-dark")).toBeVisible();
});

test("reduced motion keeps all content visible", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/research.html");
  const hiddenItems = await page.locator(".scroll-reveal").evaluateAll((items) =>
    items.filter((item) => getComputedStyle(item).opacity !== "1").length
  );
  expect(hiddenItems).toBe(0);
});

for (const route of pages) {
  test(`${route} has no serious accessibility violations`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(route);
    const results = await new AxeBuilder({ page }).analyze();
    const blocking = results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact));
    expect(blocking).toEqual([]);
  });

  test(`${route} has required SEO metadata`, async ({ page }) => {
    await page.goto(route);
    await expect(page.locator('meta[name="description"]')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
    await expect(page.locator(`script[src*="${"G-LJH79M478S"}"]`)).toHaveCount(1);
  });
}
