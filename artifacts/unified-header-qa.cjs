const { chromium } = require("playwright");
const path = require("path");

const baseUrl = "http://127.0.0.1:4173";
const pages = [
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
  const report = [];

  for (const file of pages) {
    const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(`${file}: ${message.text()}`);
    });
    page.on("pageerror", (error) => errors.push(`${file}: ${error.message}`));
    await page.goto(`${baseUrl}/${file}`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts && document.fonts.ready);
    if (file === "privacy-policy.html") {
      await page.screenshot({ path: path.join(__dirname, "unified-header-closed-light.png") });
    }
    await page.click("#unified-nav-toggle");
    await page.waitForTimeout(650);

    const panelHeightBefore = await page.locator(".unified-header__panel").evaluate((element) => element.getBoundingClientRect().height);
    await page.locator("#unified-services-group").hover();
    await page.waitForTimeout(250);
    const state = await page.evaluate(() => {
      const header = document.querySelector(".unified-header");
      const panel = document.querySelector(".unified-header__panel");
      const submenu = document.querySelector(".unified-header__submenu");
      return {
        unifiedHeaders: document.querySelectorAll(".unified-header").length,
        open: header.classList.contains("is-open"),
        servicesOpen: document.querySelector(".unified-header__group").classList.contains("is-open"),
        panelHeight: Math.round(panel.getBoundingClientRect().height),
        submenuVisible: getComputedStyle(submenu).visibility,
        activeMain: [...document.querySelectorAll(".unified-header__links .is-active")].map((element) => element.textContent.trim()),
        currentSubmenu: document.querySelector(".unified-header__submenu [aria-current='page']")?.textContent.trim() || "",
        horizontalOverflow: Math.max(0, document.documentElement.scrollWidth - innerWidth),
        triggerPosition: getComputedStyle(document.querySelector(".unified-header__trigger")).position,
        panelAriaHidden: panel.getAttribute("aria-hidden")
      };
    });
    state.panelHeightBefore = Math.round(panelHeightBefore);
    const triggerTopBeforeScroll = await page.locator("#unified-nav-toggle").evaluate((element) => Math.round(element.getBoundingClientRect().top));
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
    await page.waitForTimeout(100);
    state.triggerTopBeforeScroll = triggerTopBeforeScroll;
    state.triggerTopAfterScroll = await page.locator("#unified-nav-toggle").evaluate((element) => Math.round(element.getBoundingClientRect().top));
    report.push({ file, desktop: state });

    if (file === "audit-technical-seo.html") {
      await page.screenshot({ path: path.join(__dirname, "unified-header-desktop.png") });
    }
    await page.close();
  }

  for (const file of ["contact.html", "privacy-policy.html", "audit-technical-seo.html", "404.html"]) {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(`mobile ${file}: ${message.text()}`);
    });
    page.on("pageerror", (error) => errors.push(`mobile ${file}: ${error.message}`));
    await page.goto(`${baseUrl}/${file}`, { waitUntil: "networkidle" });
    await page.click("#unified-nav-toggle");
    await page.waitForTimeout(500);
    await page.click("#unified-services-toggle");
    await page.waitForTimeout(350);
    const state = await page.evaluate(() => {
      const panel = document.querySelector(".unified-header__panel");
      const lastLink = [...document.querySelectorAll(".unified-header__links a")].at(-1);
      const submenu = document.querySelector(".unified-header__submenu");
      return {
        panel: [Math.round(panel.getBoundingClientRect().top), Math.round(panel.getBoundingClientRect().bottom)],
        lastMainLinkBottom: Math.round(lastLink.getBoundingClientRect().bottom),
        submenu: [Math.round(submenu.getBoundingClientRect().top), Math.round(submenu.getBoundingClientRect().bottom)],
        bodyLocked: document.body.classList.contains("unified-nav-open"),
        servicesOpen: document.querySelector(".unified-header__group").classList.contains("is-open"),
        horizontalOverflow: Math.max(0, document.documentElement.scrollWidth - innerWidth)
      };
    });
    report.find((item) => item.file === file).mobile = state;
    if (file === "contact.html") {
      await page.screenshot({ path: path.join(__dirname, "unified-header-mobile.png") });
    }
    await page.close();
  }

  const reducedPage = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce"
  });
  await reducedPage.goto(`${baseUrl}/content-strategy.html`, { waitUntil: "networkidle" });
  const reduced = await reducedPage.evaluate(() => ({
    requested: matchMedia("(prefers-reduced-motion: reduce)").matches,
    transitionDuration: getComputedStyle(document.querySelector(".unified-header__panel")).transitionDuration
  }));
  await reducedPage.close();

  console.log(JSON.stringify({ report, reduced, errors }, null, 2));
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
