const { chromium } = require("playwright");
const path = require("path");

const base = "http://127.0.0.1:4173";
const files = [
  "index.html",
  "audit-technical-seo.html",
  "content-strategy.html",
  "authority-growth.html",
  "contact.html",
  "privacy-policy.html",
  "cookies-policy.html",
  "terms-of-service.html",
  "404.html"
];

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
  });
  const errors = [];
  const pageReport = [];

  for (const file of files) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(`${file}: ${message.text()}`);
    });
    page.on("pageerror", (error) => errors.push(`${file}: ${error.message}`));
    await page.goto(`${base}/${file}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(900);
    pageReport.push(await page.evaluate((pageName) => {
      const banner = document.querySelector(".cookie-consent");
      const rect = banner.getBoundingClientRect();
      return {
        page: pageName,
        visible: banner.classList.contains("is-visible"),
        bounds: [Math.round(rect.left), Math.round(rect.top), Math.round(rect.right), Math.round(rect.bottom)],
        overflow: Math.max(0, document.documentElement.scrollWidth - innerWidth),
        policyHref: banner.querySelector("a").getAttribute("href")
      };
    }, file));
    await context.close();
  }

  const desktopContext = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const desktop = await desktopContext.newPage();
  desktop.on("pageerror", (error) => errors.push(`desktop: ${error.message}`));
  await desktop.goto(base, { waitUntil: "domcontentloaded" });
  await desktop.waitForTimeout(900);
  await desktop.screenshot({ path: path.join(__dirname, "cookie-banner-desktop.png") });
  await desktop.click('[data-consent="manage"]');
  await desktop.waitForTimeout(500);
  await desktop.screenshot({ path: path.join(__dirname, "cookie-banner-preferences-desktop.png") });
  await desktop.click(".cookie-consent__category:has(#cookie-analytics) .cookie-consent__switch");
  await desktop.click('[data-consent="save"]');
  await desktop.waitForTimeout(400);
  const saved = await desktop.evaluate(() => ({
    stored: JSON.parse(localStorage.getItem("orbit_cookie_consent")),
    analyticsState: document.documentElement.dataset.analyticsConsent,
    bannerVisible: document.querySelector(".cookie-consent").classList.contains("is-visible"),
    settingsVisible: document.querySelector(".cookie-settings-trigger").classList.contains("is-visible")
  }));
  await desktop.reload({ waitUntil: "domcontentloaded" });
  await desktop.waitForTimeout(500);
  const reloaded = await desktop.evaluate(() => ({
    analyticsState: document.documentElement.dataset.analyticsConsent,
    bannerVisible: document.querySelector(".cookie-consent").classList.contains("is-visible"),
    settingsVisible: document.querySelector(".cookie-settings-trigger").classList.contains("is-visible")
  }));
  await desktop.click(".cookie-settings-trigger");
  await desktop.waitForTimeout(300);
  const reopened = await desktop.evaluate(() => ({
    managing: document.querySelector(".cookie-consent").classList.contains("is-managing"),
    analyticsChecked: document.querySelector("#cookie-analytics").checked,
    necessaryDisabled: document.querySelector(".cookie-consent__category input").disabled
  }));
  await desktopContext.close();

  const mobileContext = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const mobile = await mobileContext.newPage();
  mobile.on("pageerror", (error) => errors.push(`mobile: ${error.message}`));
  await mobile.goto(`${base}/contact.html`, { waitUntil: "domcontentloaded" });
  await mobile.waitForTimeout(850);
  await mobile.screenshot({ path: path.join(__dirname, "cookie-banner-mobile.png") });
  await mobile.click('[data-consent="manage"]');
  await mobile.waitForTimeout(450);
  await mobile.screenshot({ path: path.join(__dirname, "cookie-banner-preferences-mobile.png") });
  const mobileState = await mobile.evaluate(() => {
    const banner = document.querySelector(".cookie-consent").getBoundingClientRect();
    return {
      bounds: [Math.round(banner.left), Math.round(banner.top), Math.round(banner.right), Math.round(banner.bottom)],
      scrollable: document.querySelector(".cookie-consent").scrollHeight <= document.querySelector(".cookie-consent").clientHeight || getComputedStyle(document.querySelector(".cookie-consent")).overflowY === "auto",
      overflow: Math.max(0, document.documentElement.scrollWidth - innerWidth)
    };
  });
  await mobileContext.close();

  const rejectContext = await browser.newContext({ viewport: { width: 1024, height: 768 } });
  const rejectPage = await rejectContext.newPage();
  await rejectPage.goto(`${base}/audit-technical-seo.html`, { waitUntil: "domcontentloaded" });
  await rejectPage.waitForTimeout(800);
  await rejectPage.click('[data-consent="necessary"]');
  await rejectPage.waitForTimeout(250);
  const rejected = await rejectPage.evaluate(() => ({
    stored: JSON.parse(localStorage.getItem("orbit_cookie_consent")),
    analyticsState: document.documentElement.dataset.analyticsConsent,
    bannerVisible: document.querySelector(".cookie-consent").classList.contains("is-visible")
  }));
  await rejectContext.close();

  const reducedContext = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const reduced = await reducedContext.newPage();
  await reduced.goto(base, { waitUntil: "domcontentloaded" });
  await reduced.waitForTimeout(100);
  const reducedState = await reduced.evaluate(() => ({
    requested: matchMedia("(prefers-reduced-motion: reduce)").matches,
    transition: getComputedStyle(document.querySelector(".cookie-consent")).transitionDuration
  }));
  await reducedContext.close();

  console.log(JSON.stringify({ pageReport, saved, reloaded, reopened, rejected, mobileState, reducedState, errors }, null, 2));
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
