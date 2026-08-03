const { chromium } = require("C:/Users/pavlo/AppData/Local/npm-cache/_npx/e41f203b7505f1fb/node_modules/playwright-core");

const cases = [
  { name: "home", path: "index.html", open: "#hero-nav-toggle", close: "#orbit-nav-toggle", panel: "#site-navigation", services: "#services-nav-toggle" },
  { name: "home-docked", path: "index.html#services", open: "#orbit-nav-toggle", close: "#orbit-nav-toggle", panel: "#site-navigation", services: "#services-nav-toggle" },
  { name: "internal", path: "audit-technical-seo.html", open: "#unified-nav-toggle", close: "#unified-nav-toggle", panel: "#unified-site-navigation", services: "#unified-services-toggle" }
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const report = [];
  for (const [width, height] of [[390, 844], [320, 568]]) {
    for (const item of cases) {
      const context = await browser.newContext({ viewport: { width, height }, isMobile: true, hasTouch: true });
      await context.addInitScript(() => localStorage.setItem("orbit_cookie_consent", JSON.stringify({
        version: "1.0", necessary: true, analytics: false,
        updatedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 86400000).toISOString()
      })));
      const page = await context.newPage();
      const errors = [];
      page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
      page.on("pageerror", error => errors.push(error.message));
      await page.goto("http://127.0.0.1:4173/" + item.path, { waitUntil: "networkidle" });
      await page.waitForTimeout(350);
      const beforeScroll = await page.evaluate(() => scrollY);
      await page.locator(item.open).click();
      await page.waitForTimeout(320);
      const panel = page.locator(item.panel);
      const openState = await panel.evaluate(element => {
        const style = getComputedStyle(element);
        const links = element.querySelector("nav");
        return {
          opacity: style.opacity,
          visibility: style.visibility,
          overflowY: style.overflowY,
          touchAction: style.touchAction,
          clientHeight: element.clientHeight,
          scrollHeight: element.scrollHeight,
          linksPosition: getComputedStyle(links).position,
          transitionDuration: style.transitionDuration
        };
      });
      if (width === 320) await page.screenshot({ path: `artifacts/mobile-menu-${item.name}-top.png` });

      await page.locator(item.services).click();
      await page.waitForTimeout(240);
      const expandedHeight = await panel.evaluate(element => element.scrollHeight);
      await panel.hover();
      await page.mouse.wheel(0, 1200);
      await page.waitForTimeout(200);
      let scrollTop = await panel.evaluate(element => element.scrollTop);
      if (scrollTop === 0) {
        scrollTop = await panel.evaluate(element => {
          element.scrollTo({ top: element.scrollHeight, behavior: "instant" });
          return element.scrollTop;
        });
      }
      if (width === 320) await page.screenshot({ path: `artifacts/mobile-menu-${item.name}-bottom.png` });

      await page.locator(item.close).click({ force: true });
      await page.waitForTimeout(320);
      const closedState = await panel.evaluate(element => ({
        visibility: getComputedStyle(element).visibility,
        ariaHidden: element.getAttribute("aria-hidden")
      }));
      const afterScroll = await page.evaluate(() => scrollY);
      report.push({ viewport: `${width}x${height}`, name: item.name, errors, beforeScroll, afterScroll, openState, expandedHeight, scrollTop, closedState,
        overflow: await page.evaluate(() => Math.max(0, document.documentElement.scrollWidth - innerWidth)) });
      await context.close();
    }
  }
  await browser.close();
  console.log(JSON.stringify(report, null, 2));
})();
