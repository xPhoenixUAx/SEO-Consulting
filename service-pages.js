(() => {
  "use strict";

  const config = window.SITE_CONFIG || {};
  const body = document.body;
  let header = document.querySelector(".service-header");
  const visual = document.querySelector(".service-hero__visual");
  const scopeItems = Array.from(document.querySelectorAll(".scope-item"));
  const reveals = Array.from(document.querySelectorAll(".reveal"));
  const contactForm = document.getElementById("contact-form");

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, (character) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    })[character]);
  }

  function homeHref(value, fallback) {
    const href = typeof value === "string" && value.trim() ? value.trim() : fallback;
    return href.startsWith("#") ? `index.html${href}` : href;
  }

  function buildUnifiedHeader() {
    if (!header) {
      header = document.createElement("header");
      body.insertBefore(header, body.firstChild);
    }

    const navItems = [
      ["navDiscoverLabel", "navDiscoverHref", "OPENING"],
      ["navWorkLabel", "navWorkHref", "THE WORK"],
      ["navServicesLabel", "navServicesHref", "SERVICES"],
      ["navProofLabel", "navProofHref", "EVIDENCE"],
      ["navEngagementLabel", "navEngagementHref", "WAYS TO WORK"],
      ["navMethodLabel", "navMethodHref", "90 DAYS"],
      ["navInsightsLabel", "navInsightsHref", "INSIGHTS"],
      ["navFaqLabel", "navFaqHref", "FAQ"],
      ["navAboutLabel", "navAboutHref", "ABOUT"],
      ["navContactLabel", "navContactHref", "CONTACT"]
    ];
    const mainLinks = navItems.map(([labelKey, hrefKey, fallback], index) => {
      const link = `<a href="${escapeHtml(homeHref(config[hrefKey], index === 9 ? "contact.html" : "#top"))}" data-main-nav="${escapeHtml(labelKey)}"><b>${escapeHtml(config[labelKey] || fallback)}</b></a>`;
      if (index !== 2) return link;
      return `<div class="unified-header__group" id="unified-services-group">
        ${link}
        <button class="unified-header__dropdown-toggle" id="unified-services-toggle" type="button" aria-expanded="false" aria-controls="unified-services-menu" aria-label="Show service pages"><i data-lucide="chevron-down" aria-hidden="true"></i></button>
        <div class="unified-header__submenu" id="unified-services-menu" aria-hidden="true" inert>
          <span>${escapeHtml(config.navServicesMenuLabel || "SELECT A SERVICE")}</span>
          <a href="${escapeHtml(config.auditPageHref || "audit-technical-seo.html")}" data-page="audit-technical-seo.html"><small>01</small><b>${escapeHtml(config.footerAuditLabel || "AUDIT & TECHNICAL SEO")}</b></a>
          <a href="${escapeHtml(config.contentPageHref || "content-strategy.html")}" data-page="content-strategy.html"><small>02</small><b>${escapeHtml(config.footerContentLabel || "CONTENT STRATEGY")}</b></a>
          <a href="${escapeHtml(config.authorityPageHref || "authority-growth.html")}" data-page="authority-growth.html"><small>03</small><b>${escapeHtml(config.footerAuthorityLabel || "AUTHORITY & GROWTH")}</b></a>
        </div>
      </div>`;
    }).join("");

    header.className = "service-header unified-header";
    header.setAttribute("aria-label", "Site navigation");
    header.innerHTML = `<div class="unified-header__shell">
      <div class="unified-header__panel" id="unified-site-navigation" aria-hidden="true" inert>
        <a class="unified-header__brand" href="${escapeHtml(homeHref(config.navDiscoverHref, "#top"))}" aria-label="${escapeHtml(config.companyName || "ORBIT SEO Consulting")} home">
          <strong>${escapeHtml(config.brandName || "ORBIT")}</strong><span>${escapeHtml(config.brandDescriptor || "SEO CONSULTING")}</span>
        </a>
        <nav class="unified-header__links" aria-label="Main pages">${mainLinks}</nav>
        <span class="unified-header__status">${escapeHtml(config.navStatus || "SEARCH SYSTEMS / 2026")}</span>
      </div>
      <button class="unified-header__trigger" id="unified-nav-toggle" type="button" aria-expanded="false" aria-controls="unified-site-navigation" aria-label="Open navigation">
        <span class="brand-mark" aria-hidden="true"><span class="brand-mark__row brand-mark__row--top">OR/</span><span class="brand-mark__row brand-mark__row--bottom">BIT</span><i class="brand-mark__accent"></i></span>
      </button>
      <span class="unified-header__trace" aria-hidden="true"></span>
    </div>`;
  }

  function applyConfig() {
    document.querySelectorAll("[data-config]").forEach((element) => {
      const value = config[element.dataset.config];
      if (typeof value === "string") element.textContent = value;
    });

    document.querySelectorAll("[data-config-href]").forEach((element) => {
      const value = config[element.dataset.configHref];
      if (typeof value === "string" && value.trim()) element.href = value.trim();
    });

    document.querySelectorAll("[data-config-action]").forEach((element) => {
      const value = config[element.dataset.configAction];
      if (typeof value === "string" && value.trim()) element.action = value.trim();
    });

    document.querySelectorAll("[data-config-src]").forEach((element) => {
      const value = config[element.dataset.configSrc];
      if (typeof value === "string" && value.trim()) element.src = value.trim();
    });

    document.querySelectorAll("[data-config-alt]").forEach((element) => {
      const value = config[element.dataset.configAlt];
      if (typeof value === "string") element.alt = value;
    });

    document.querySelectorAll("[data-config-visible]").forEach((element) => {
      const value = config[element.dataset.configVisible];
      element.hidden = !(typeof value === "string" && value.trim());
    });
  }

  function setupIcons() {
    if (!window.lucide || typeof window.lucide.createIcons !== "function") return;
    window.lucide.createIcons({
      attrs: {
        "aria-hidden": "true",
        "stroke-width": 1.5
      }
    });
  }

  function setupActiveHeaderNavigation() {
    const shell = header.querySelector(".unified-header__shell");
    const panel = header.querySelector(".unified-header__panel");
    const trigger = header.querySelector(".unified-header__trigger");
    const serviceGroup = header.querySelector(".unified-header__group");
    const serviceToggle = header.querySelector(".unified-header__dropdown-toggle");
    const serviceMenu = header.querySelector(".unified-header__submenu");
    const allLinks = Array.from(header.querySelectorAll("a[href]"));
    const servicePages = new Set(["audit-technical-seo.html", "content-strategy.html", "authority-growth.html"]);
    const currentFile = location.pathname.split("/").pop() || "index.html";
    let navigationOpen = false;
    let servicesOpen = false;

    const serviceMainLink = header.querySelector('[data-main-nav="navServicesLabel"]');
    const contactMainLink = header.querySelector('[data-main-nav="navContactLabel"]');
    if (servicePages.has(currentFile)) {
      serviceMainLink.classList.add("is-active");
      serviceMainLink.setAttribute("aria-current", "page");
      serviceGroup.classList.add("is-current");
    } else if (currentFile === "contact.html") {
      contactMainLink.classList.add("is-active");
      contactMainLink.setAttribute("aria-current", "page");
    }
    header.querySelectorAll(".unified-header__submenu a").forEach((link) => {
      if (link.dataset.page === currentFile) link.setAttribute("aria-current", "page");
    });

    function setServicesOpen(nextState, restoreFocus = false) {
      const next = Boolean(nextState && navigationOpen);
      servicesOpen = next;
      serviceGroup.classList.toggle("is-open", next);
      panel.classList.toggle("has-services-open", next);
      serviceToggle.setAttribute("aria-expanded", String(next));
      serviceToggle.setAttribute("aria-label", next ? "Hide service pages" : "Show service pages");
      serviceMenu.setAttribute("aria-hidden", String(!next));
      serviceMenu.inert = !next;
      if (!next && restoreFocus) serviceToggle.focus({ preventScroll: true });
    }

    function setNavigationOpen(nextState, restoreFocus = false) {
      navigationOpen = Boolean(nextState);
      header.classList.toggle("is-open", navigationOpen);
      shell.classList.toggle("is-open", navigationOpen);
      trigger.setAttribute("aria-expanded", String(navigationOpen));
      trigger.setAttribute("aria-label", navigationOpen ? "Close navigation" : "Open navigation");
      panel.setAttribute("aria-hidden", String(!navigationOpen));
      panel.inert = !navigationOpen;
      body.classList.toggle("unified-nav-open", navigationOpen);
      if (!navigationOpen) setServicesOpen(false);
      if (!navigationOpen && restoreFocus) trigger.focus({ preventScroll: true });
    }

    trigger.addEventListener("click", () => setNavigationOpen(!navigationOpen));
    serviceToggle.addEventListener("click", (event) => {
      event.stopPropagation();
      const shouldToggle = innerWidth <= 820 || event.detail === 0;
      setServicesOpen(shouldToggle ? !servicesOpen : true);
    });
    serviceGroup.addEventListener("pointerenter", () => {
      if (innerWidth > 820 && navigationOpen) setServicesOpen(true);
    });
    serviceGroup.addEventListener("pointerleave", () => {
      if (innerWidth > 820 && navigationOpen) setServicesOpen(false);
    });
    serviceGroup.addEventListener("focusout", () => {
      requestAnimationFrame(() => {
        if (!serviceGroup.contains(document.activeElement)) setServicesOpen(false);
      });
    });
    allLinks.forEach((link) => link.addEventListener("click", () => setNavigationOpen(false)));

    document.addEventListener("pointerdown", (event) => {
      if (navigationOpen && !shell.contains(event.target)) setNavigationOpen(false);
    });
    document.addEventListener("keydown", (event) => {
      if (!navigationOpen) return;
      if (event.key === "Escape") {
        event.preventDefault();
        if (servicesOpen) setServicesOpen(false, true);
        else setNavigationOpen(false, true);
        return;
      }
      if (event.key !== "Tab" || innerWidth > 820) return;
      const focusable = [trigger, ...panel.querySelectorAll("a[href], button:not(:disabled)")]
        .filter((element) => !element.closest("[inert]") && getComputedStyle(element).visibility !== "hidden");
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  function setupScope() {
    scopeItems.forEach((item) => {
      const button = item.querySelector(".scope-item__trigger");
      const answer = item.querySelector(".scope-item__answer");
      if (!button || !answer) return;

      button.addEventListener("click", () => {
        const open = !item.classList.contains("is-open");
        scopeItems.forEach((candidate) => {
          const candidateButton = candidate.querySelector(".scope-item__trigger");
          const candidateAnswer = candidate.querySelector(".scope-item__answer");
          const shouldOpen = candidate === item && open;
          candidate.classList.toggle("is-open", shouldOpen);
          if (candidateButton) candidateButton.setAttribute("aria-expanded", String(shouldOpen));
          if (candidateAnswer) candidateAnswer.setAttribute("aria-hidden", String(!shouldOpen));
        });
      });
    });
  }

  function setupReveals() {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) {
      reveals.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    body.classList.add("has-reveal");
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -9%", threshold: .1 });
    reveals.forEach((element) => observer.observe(element));
  }

  function updateVisualState() {
    if (header) {
      const sample = document.elementFromPoint(innerWidth * .5, Math.min(92, innerHeight * .15));
      const themedSection = sample && sample.closest("[data-theme]");
      header.classList.toggle("is-light", themedSection?.dataset.theme === "light");
    }

    if (visual && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const rect = visual.getBoundingClientRect();
      const progress = Math.max(0, Math.min(1, (innerHeight - rect.top) / (innerHeight + rect.height)));
      visual.style.setProperty("--visual-y", `${(-6 + progress * 4).toFixed(2)}%`);
    }
  }

  function setupContactForm() {
    if (!contactForm || !window.fetch) return;
    const status = contactForm.querySelector(".contact-page-form__status, .contact-form__status");
    const submit = contactForm.querySelector("button[type='submit']");
    if (!status || !submit) return;

    contactForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!contactForm.reportValidity()) return;

      const baseClass = status.classList.contains("contact-page-form__status")
        ? "contact-page-form__status"
        : "contact-form__status";
      status.className = baseClass;
      status.textContent = config.contactFormSending || "Sending your request…";
      submit.disabled = true;
      submit.setAttribute("aria-busy", "true");

      try {
        const formData = new FormData(contactForm);
        const response = await fetch(contactForm.action, {
          method: "POST",
          body: formData,
          headers: { Accept: "application/json" }
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || result.success !== true) throw new Error(result.message || "Request failed");

        contactForm.reset();
        status.classList.add("is-success");
        status.textContent = config.contactFormSuccess || "Thank you! We have successfully received your request. Our team will review your information and get back to you shortly.";
        const formEvent = { form: "contact-page", interest: String(formData.get("interest") || "") };
        window.dispatchEvent(new CustomEvent("orbit:form-success", { detail: formEvent }));
        if (Array.isArray(window.dataLayer)) window.dataLayer.push({ event: "form_submit_success", ...formEvent });
      } catch (error) {
        status.classList.add("is-error");
        status.textContent = config.contactFormError || "We could not send your request. Please try again or contact us by email.";
      } finally {
        submit.disabled = false;
        submit.removeAttribute("aria-busy");
      }
    });
  }

  buildUnifiedHeader();
  applyConfig();
  setupIcons();
  setupActiveHeaderNavigation();
  setupScope();
  setupReveals();
  setupContactForm();
  updateVisualState();
  addEventListener("scroll", updateVisualState, { passive: true });
  addEventListener("resize", updateVisualState, { passive: true });
  requestAnimationFrame(() => body.classList.add("is-ready"));
})();
