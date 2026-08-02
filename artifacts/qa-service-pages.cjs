const { chromium } = require("C:/Users/pavlo/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright-core");

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:/Users/pavlo/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe"
  });
  const pages = ["audit-technical-seo", "content-strategy", "authority-growth"];
  const viewports = [
    { label: "desktop", width: 1440, height: 900 },
    { label: "mobile", width: 390, height: 844 }
  ];
  const report = [];

  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport });
    for (const name of pages) {
      const page = await context.newPage();
      const errors = [];
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(`http://127.0.0.1:4173/${name}.html`, { waitUntil: "networkidle" });
      await page.waitForTimeout(1100);
      await page.screenshot({ path: `artifacts/${name}-${viewport.label}.png` });
      if (name === "audit-technical-seo") {
        for (const selector of [".service-overview", ".service-scope", ".service-method", ".service-deliverables", ".detail-cta"]) {
          const label = selector.slice(1);
          await page.locator(selector).scrollIntoViewIfNeeded();
          await page.waitForTimeout(950);
          await page.screenshot({ path: `artifacts/audit-${label}-${viewport.label}.png` });
        }
        const secondScope = page.locator(".scope-item").nth(1);
        await secondScope.locator("button").click();
        const scopeInteraction = {
          secondOpen: await secondScope.evaluate((element) => element.classList.contains("is-open")),
          expanded: await secondScope.locator("button").getAttribute("aria-expanded"),
          answerHidden: await secondScope.locator(".scope-item__answer").getAttribute("aria-hidden")
        };
        await page.locator(".service-overview").scrollIntoViewIfNeeded();
        await page.waitForTimeout(100);
        page.__scopeInteraction = scopeInteraction;
      }
      const metrics = await page.evaluate(() => ({
        title: document.title,
        viewport: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        h1Rect: (() => {
          const rect = document.querySelector("h1").getBoundingClientRect();
          return { x: Math.round(rect.x), y: Math.round(rect.y), width: Math.round(rect.width), height: Math.round(rect.height) };
        })(),
        headerColor: getComputedStyle(document.querySelector(".service-header")).color,
        openScopes: document.querySelectorAll(".scope-item.is-open").length
      }));
      report.push({ name, viewport: viewport.label, errors, scopeInteraction: page.__scopeInteraction || null, ...metrics });
      await page.close();
    }
    await context.close();
  }

  const homepageContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const homepage = await homepageContext.newPage();
  const homepageErrors = [];
  homepage.on("console", (message) => {
    if (message.type() === "error") homepageErrors.push(message.text());
  });
  homepage.on("pageerror", (error) => homepageErrors.push(error.message));
  await homepage.goto("http://127.0.0.1:4173/", { waitUntil: "networkidle" });
  for (const [label, selector] of [["audit", ".service-editorial--audit"], ["content", ".service-editorial--content"], ["authority", ".service-editorial--authority"]]) {
    await homepage.evaluate((target) => document.querySelector(target).scrollIntoView({ block: "start" }), selector);
    await homepage.waitForTimeout(900);
    await homepage.screenshot({ path: `artifacts/homepage-service-${label}-desktop.png` });
  }
  const serviceLinks = await homepage.locator(".service-editorial__link").evaluateAll((links) => links.map((link) => link.getAttribute("href")));
  report.push({ name: "homepage-service-links", viewport: "desktop", errors: homepageErrors, serviceLinks });
  await homepageContext.close();

  const reducedContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce"
  });
  const reducedPage = await reducedContext.newPage();
  const reducedErrors = [];
  reducedPage.on("console", (message) => {
    if (message.type() === "error") reducedErrors.push(message.text());
  });
  reducedPage.on("pageerror", (error) => reducedErrors.push(error.message));
  await reducedPage.goto("http://127.0.0.1:4173/audit-technical-seo.html", { waitUntil: "networkidle" });
  await reducedPage.locator(".service-overview").scrollIntoViewIfNeeded();
  const reducedMetrics = await reducedPage.evaluate(() => ({
    revealVisible: Array.from(document.querySelectorAll(".reveal")).every((element) => getComputedStyle(element).opacity === "1"),
    titleVisible: getComputedStyle(document.querySelector(".service-hero h1 span")).opacity === "1",
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
  }));
  report.push({ name: "reduced-motion", viewport: "mobile", errors: reducedErrors, ...reducedMetrics });
  await reducedContext.close();

  console.log(JSON.stringify(report, null, 2));
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
