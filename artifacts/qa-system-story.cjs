const { chromium } = require("C:/Users/pavlo/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright-core");

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:/Users/pavlo/AppData/Local/ms-playwright/chromium-1228/chrome-win64/chrome.exe"
  });
  const report = [];
  const captures = [
    ["opening", ".system-story__opening"],
    ["panorama", ".system-story__panorama"],
    ["content", ".system-chapter:not(.system-chapter--reverse)"],
    ["statement", ".system-story__statement"],
    ["authority", ".system-chapter--reverse"],
    ["closing", ".system-story__closing"]
  ];

  for (const viewport of [
    { label: "desktop", width: 1440, height: 900 },
    { label: "mobile", width: 390, height: 844 }
  ]) {
    const context = await browser.newContext({ viewport });
    const page = await context.newPage();
    const errors = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto("http://127.0.0.1:4173/", { waitUntil: "networkidle" });

    const lightStates = {};
    for (const [label, selector] of captures) {
      await page.evaluate((target) => document.querySelector(target).scrollIntoView({ block: "start" }), selector);
      await page.waitForTimeout(950);
      lightStates[label] = await page.evaluate(() => document.body.classList.contains("is-light-scene"));
      await page.screenshot({ path: `artifacts/system-${label}-${viewport.label}.png` });
    }

    const metrics = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      images: Array.from(document.querySelectorAll("#system img")).map((image) => ({
        src: image.getAttribute("src"),
        complete: image.complete,
        width: image.naturalWidth,
        height: image.naturalHeight
      })),
      configTitleApplied: document.querySelector(".system-story__opening h2 span").textContent.trim() === "VISIBILITY IS NOT",
      visibleReveals: Array.from(document.querySelectorAll("#system .editorial-reveal")).every((element) => getComputedStyle(element).opacity === "1")
    }));
    report.push({ viewport: viewport.label, errors, lightStates, ...metrics });
    await context.close();
  }

  const reducedContext = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
  const reducedPage = await reducedContext.newPage();
  const reducedErrors = [];
  reducedPage.on("console", (message) => {
    if (message.type() === "error") reducedErrors.push(message.text());
  });
  reducedPage.on("pageerror", (error) => reducedErrors.push(error.message));
  await reducedPage.goto("http://127.0.0.1:4173/", { waitUntil: "networkidle" });
  await reducedPage.evaluate(() => document.querySelector(".system-story__statement").scrollIntoView({ block: "start" }));
  const reducedVisible = await reducedPage.locator("#system .editorial-reveal").evaluateAll((elements) => elements.every((element) => getComputedStyle(element).opacity === "1"));
  report.push({ viewport: "mobile-reduced", errors: reducedErrors, reducedVisible });
  await reducedContext.close();

  console.log(JSON.stringify(report, null, 2));
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
