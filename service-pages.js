(() => {
  "use strict";

  const config = window.SITE_CONFIG || {};
  const body = document.body;
  const header = document.querySelector(".service-header");
  const visual = document.querySelector(".service-hero__visual");
  const scopeItems = Array.from(document.querySelectorAll(".scope-item"));
  const reveals = Array.from(document.querySelectorAll(".reveal"));
  const contactForm = document.getElementById("contact-form");

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
    const currentPath = new URL(window.location.href).pathname.replace(/\/$/, "/index.html");
    document.querySelectorAll(".service-header__nav a").forEach((link) => {
      const linkPath = new URL(link.href, window.location.href).pathname.replace(/\/$/, "/index.html");
      if (linkPath === currentPath) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
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
        const response = await fetch(contactForm.action, {
          method: "POST",
          body: new FormData(contactForm),
          headers: { Accept: "application/json" }
        });
        const result = await response.json().catch(() => ({}));
        if (!response.ok || result.success !== true) throw new Error(result.message || "Request failed");

        contactForm.reset();
        status.classList.add("is-success");
        status.textContent = config.contactFormSuccess || "Thank you! We have successfully received your request. Our team will review your information and get back to you shortly.";
      } catch (error) {
        status.classList.add("is-error");
        status.textContent = config.contactFormError || "We could not send your request. Please try again or contact us by email.";
      } finally {
        submit.disabled = false;
        submit.removeAttribute("aria-busy");
      }
    });
  }

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
