const { chromium } = require("C:/Users/pavlo/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright-core");

const base = "http://127.0.0.1:4173/";
const pages = [
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
  const browser = await chromium.launch({ headless: true });
  const report = [];
  for (const file of pages) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
    await context.addInitScript(() => {
      localStorage.setItem("orbit_cookie_consent", JSON.stringify({
        version: "1.0",
        necessary: true,
        analytics: false,
        updatedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400000 * 30).toISOString()
      }));
    });
    const page = await context.newPage();
    const errors = [];
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(base + file, { waitUntil: "networkidle" });
    await page.locator("body > footer.site-footer").scrollIntoViewIfNeeded();
    await page.waitForTimeout(150);
    const data = await page.evaluate(() => {
      const footer = document.querySelector("body > footer.site-footer");
      const computed = getComputedStyle(footer);
      return {
        footerCount: document.querySelectorAll("body > footer.site-footer").length,
        oldFooterCount: document.querySelectorAll("body > footer.service-footer, body > footer.contact-footer, body > footer.legal-footer").length,
        title: footer.querySelector("h2").innerText.replace(/\n/g, " "),
        exploreCount: footer.querySelectorAll('.site-footer__directory nav[aria-label="Footer navigation"] a').length,
        servicesCount: footer.querySelectorAll('.site-footer__directory nav[aria-label="Service pages"] a').length,
        legalCount: footer.querySelectorAll(".site-footer__legal a").length,
        current: footer.querySelector('.site-footer__legal a[aria-current="page"]')?.getAttribute("href") || null,
        cta: footer.querySelector(".site-footer__cta").getAttribute("href"),
        firstExplore: footer.querySelector('.site-footer__directory nav[aria-label="Footer navigation"] a').getAttribute("href"),
        background: computed.backgroundColor,
        color: computed.color,
        iconCount: footer.querySelectorAll("svg").length,
        overflow: Math.max(0, document.documentElement.scrollWidth - innerWidth)
      };
    });
    report.push({ file, errors, ...data });
    if (["index.html", "privacy-policy.html"].includes(file)) {
      await page.locator("body > footer.site-footer").screenshot({ path: `artifacts/footer-${file.replace(".html", "")}-1440.png` });
    }
    await context.close();
  }

  for (const file of ["index.html", "contact.html", "404.html"]) {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
    await context.addInitScript(() => {
      localStorage.setItem("orbit_cookie_consent", JSON.stringify({
        version: "1.0", necessary: true, analytics: false,
        updatedAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 86400000 * 30).toISOString()
      }));
    });
    const page = await context.newPage();
    const errors = [];
    page.on("console", (message) => { if (message.type() === "error") errors.push(message.text()); });
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(base + file, { waitUntil: "networkidle" });
    const footer = page.locator("body > footer.site-footer");
    await footer.scrollIntoViewIfNeeded();
    await page.waitForTimeout(100);
    const mobile = await page.evaluate(() => ({
      overflow: Math.max(0, document.documentElement.scrollWidth - innerWidth),
      footerWidth: Math.round(document.querySelector("body > footer.site-footer").getBoundingClientRect().width),
      errorsInDom: document.querySelectorAll("body > footer.site-footer").length !== 1
    }));
    await footer.screenshot({ path: `artifacts/footer-${file.replace(".html", "")}-390.png` });
    report.push({ file: `${file}@390`, errors, ...mobile });
    await context.close();
  }
  await browser.close();
  console.log(JSON.stringify(report, null, 2));
})();
