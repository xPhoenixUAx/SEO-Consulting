const { chromium } = require("playwright");
const path = require("path");

(async () => {
  const browser = await chromium.launch({
    headless: true,
    executablePath: "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
  });
  const consoleErrors = [];
  const sizes = [
    { name: "desktop", width: 1440, height: 900 },
    { name: "mobile", width: 390, height: 844 }
  ];

  for (const size of sizes) {
    const page = await browser.newPage({ viewport: size, deviceScaleFactor: 1 });
    page.on("console", (message) => {
      if (message.type() === "error") consoleErrors.push(`${size.name}: ${message.text()}`);
    });
    page.on("pageerror", (error) => consoleErrors.push(`${size.name}: ${error.message}`));
    await page.goto("http://127.0.0.1:4175/", { waitUntil: "domcontentloaded" });
    await page.evaluate(() => document.fonts && document.fonts.ready);

    for (const progress of [0, 0.34, 0.5, 0.69, 0.95]) {
      await page.evaluate((amount) => {
        const section = document.getElementById("work");
        const travel = section.offsetHeight - innerHeight;
        scrollTo(0, section.offsetTop + travel * amount);
      }, progress);
      await page.waitForTimeout(progress === 0 ? 900 : 650);
      const suffix = String(Math.round(progress * 100)).padStart(2, "0");
      await page.screenshot({
        path: path.join(__dirname, `work-${size.name}-${suffix}.png`),
        fullPage: false
      });
    }

    await page.click("#orbit-nav-toggle");
    await page.waitForTimeout(850);
    await page.screenshot({
      path: path.join(__dirname, `work-${size.name}-navigation.png`),
      fullPage: false
    });
    await page.keyboard.press("Escape");

    const editorialTargets = [
      ["services", "#services"],
      ["content", ".service-editorial--content"],
      ["authority", ".service-editorial--authority"],
      ["service-cta", ".service-cta"],
      ["method", "#process"],
      ["expectation", ".method-expectation"],
      ["faq", "#faq"]
    ];
    for (const [name, selector] of editorialTargets) {
      await page.evaluate((targetSelector) => {
        const target = document.querySelector(targetSelector);
        const rect = target.getBoundingClientRect();
        scrollTo(0, scrollY + rect.top);
      }, selector);
      await page.waitForTimeout(750);
      await page.screenshot({
        path: path.join(__dirname, `editorial-${size.name}-${name}.png`),
        fullPage: false
      });
    }

    await page.click("#faq-question-2");
    await page.waitForTimeout(650);
    await page.screenshot({
      path: path.join(__dirname, `editorial-${size.name}-faq-open.png`),
      fullPage: false
    });

    const serviceDisclosureTargets = [
      ["audit-open", ".service-editorial--audit .service-disclosure:nth-child(2) .service-disclosure__trigger"],
      ["content-open", ".service-editorial--content .service-disclosure:nth-child(2) .service-disclosure__trigger"],
      ["authority-open", ".service-editorial--authority .service-disclosure:nth-child(2) .service-disclosure__trigger"]
    ];
    for (const [name, selector] of serviceDisclosureTargets) {
      await page.click(selector);
      await page.waitForTimeout(550);
      await page.screenshot({
        path: path.join(__dirname, `editorial-${size.name}-${name}.png`),
        fullPage: false
      });
    }

    const state = await page.evaluate(() => {
      const stage = document.getElementById("work-stage").getBoundingClientRect();
      const nav = document.getElementById("orbit-navigation");
      const trigger = document.getElementById("orbit-nav-toggle");
      return {
        scrollY,
        viewport: [innerWidth, innerHeight],
        stage: [stage.top, stage.bottom],
        bodyWidth: document.body.scrollWidth,
        htmlWidth: document.documentElement.scrollWidth,
        loadedImages: [...document.images].filter((image) => image.complete && image.naturalWidth > 0).length,
        totalImages: document.images.length,
        docked: nav.classList.contains("is-docked"),
        triggerOpacity: getComputedStyle(trigger).opacity,
        triggerPosition: getComputedStyle(trigger).position
      };
    });
    console.log(size.name, JSON.stringify(state));
    await page.close();
  }

  const reducedPage = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    reducedMotion: "reduce"
  });
  reducedPage.on("pageerror", (error) => consoleErrors.push(`reduced: ${error.message}`));
  await reducedPage.goto("http://127.0.0.1:4175/", { waitUntil: "domcontentloaded" });
  await reducedPage.evaluate(() => document.fonts && document.fonts.ready);
  await reducedPage.evaluate(() => {
    const section = document.getElementById("work");
    scrollTo(0, section.offsetTop + (section.offsetHeight - innerHeight) * 0.5);
  });
  await reducedPage.waitForTimeout(500);
  const reducedState = await reducedPage.evaluate(() => ({
    reduced: matchMedia("(prefers-reduced-motion: reduce)").matches,
    scrollY,
    workProgress: getComputedStyle(document.documentElement).getPropertyValue("--work-spine-progress").trim(),
    docked: document.getElementById("orbit-navigation").classList.contains("is-docked"),
    activeChapters: [...document.querySelectorAll(".work-chapter")]
      .filter((chapter) => Number(getComputedStyle(chapter).opacity) > 0.5)
      .map((chapter) => chapter.querySelector("h3").textContent)
  }));
  console.log("reduced", JSON.stringify(reducedState));
  await reducedPage.close();

  console.log("consoleErrors", JSON.stringify(consoleErrors));
  await browser.close();
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
