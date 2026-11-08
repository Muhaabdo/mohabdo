const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");
const navAnchors = Array.from(document.querySelectorAll(".nav-links a[href^='#']"));
const yearEl = document.getElementById("year");
const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");

if (yearEl) {
  yearEl.textContent = new Date().getFullYear();
}

if (menuToggle && navLinks) {
  menuToggle.addEventListener("click", () => {
    const expanded = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!expanded));
    navLinks.classList.toggle("open");
  });

  navAnchors.forEach((anchor) => {
    anchor.addEventListener("click", () => {
      navLinks.classList.remove("open");
      menuToggle.setAttribute("aria-expanded", "false");
    });
  });
}

const sections = Array.from(document.querySelectorAll("main section[id]"));

// Sections are visible by default (see .reveal in style.css). Only arm the
// hidden -> fade-in animation once we know IntersectionObserver is available
// and about to run, so a slow, blocked, or failed script never leaves
// content permanently invisible.
if ("IntersectionObserver" in window) {
  sections.forEach((section) => {
    section.classList.add("reveal-armed");
  });

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
        }

        const sectionId = entry.target.getAttribute("id");
        if (sectionId && entry.isIntersecting) {
          navAnchors.forEach((a) => {
            const active = a.getAttribute("href") === `#${sectionId}`;
            a.classList.toggle("active", active);
          });
        }
      });
    },
    {
      threshold: 0.18,
      rootMargin: "-20% 0px -55% 0px"
    }
  );

  sections.forEach((section) => {
    sectionObserver.observe(section);
  });

  // Safety net: if a section somehow never intersects (very short pages,
  // throttled/backgrounded frames, edge-case viewports), reveal it anyway
  // after a short delay instead of leaving it hidden forever.
  window.setTimeout(() => {
    sections.forEach((section) => section.classList.add("show"));
  }, 2500);
}

// The contact form posts directly to FormSubmit.co (see the form's action=
// attribute and its hidden _subject/_template/_captcha/_next fields in
// index.html) — no fetch/AJAX needed. FormSubmit emails the submission to
// info@mohabdo.com and, on success, redirects the browser to thank-you.html
// itself via the hidden _next field. This handler only runs client-side
// validation for a nicer on-brand inline error message than the browser's
// native validation UI; it never intercepts a valid submission, so the
// real POST to FormSubmit always goes through normally.
if (contactForm && formStatus) {
  contactForm.addEventListener("submit", (event) => {
    const name = contactForm.name.value.trim();
    const email = contactForm.email.value.trim();
    const message = contactForm.message.value.trim();

    if (!name || !email || !message) {
      event.preventDefault();
      formStatus.textContent =
        currentLang === "ar" ? AR["contact.form.errorRequired"] : "Please fill in name, email, and project brief.";
      return;
    }

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailValid) {
      event.preventDefault();
      formStatus.textContent =
        currentLang === "ar" ? AR["contact.form.errorEmail"] : "Please enter a valid email address.";
    }
  });
}

// ---------------------------------------------------------------------
// Language
// English lives at / and Arabic at /ar/ as separate static pages (each
// indexable, linked with hreflang). The page language comes from <html lang>;
// the header language link just navigates between the two.
// ---------------------------------------------------------------------
const currentLang = document.documentElement.lang === "ar" ? "ar" : "en";

const AR = {
  "contact.form.errorRequired": "من فضلك أدخل الاسم والبريد الإلكتروني وملخص المشروع.",
  "contact.form.errorEmail": "من فضلك أدخل بريدًا إلكترونيًا صحيحًا."
};

// Old builds stored a language choice for the in-page toggle; clear it.
try { localStorage.removeItem("mohabdo_lang"); } catch (e) {}

// ---------------------------------------------------------------------
// Analytics: dataLayer events picked up by GTM (GTM-PZN8QJ2T) and sent to
// GA4 (G-90LSNG1SQE). One delegated listener covers every WhatsApp, call
// and email link on the page, including ones added later.
// ---------------------------------------------------------------------
window.dataLayer = window.dataLayer || [];

document.addEventListener("click", (event) => {
  const link = event.target.closest("a[href]");
  if (!link) return;
  const href = link.getAttribute("href") || "";
  let eventName = null;
  if (href.indexOf("wa.me") !== -1 || href.indexOf("api.whatsapp.com") !== -1) eventName = "whatsapp_click";
  else if (href.indexOf("tel:") === 0) eventName = "phone_click";
  else if (href.indexOf("mailto:") === 0) eventName = "email_click";
  if (!eventName) return;

  const placement = link.closest(".mobile-sticky-bar")
    ? "mobile_sticky"
    : link.closest(".floating-contact")
    ? "floating"
    : link.closest(".contact-channels")
    ? "contact_section"
    : link.closest(".thanks-wrap")
    ? "thank_you"
    : "other";

  window.dataLayer.push({ event: eventName, link_placement: placement, page_language: currentLang });
});

// Lead: FormSubmit redirects to thank-you.html after a successful submission.
// Fire generate_lead once per session so reloads don't double-count.
if (/thank-you/.test(window.location.pathname)) {
  try {
    if (!sessionStorage.getItem("mohabdo_lead_sent")) {
      window.dataLayer.push({ event: "generate_lead", form_name: "contact_brief", page_language: currentLang });
      sessionStorage.setItem("mohabdo_lead_sent", "1");
    }
  } catch (e) {
    window.dataLayer.push({ event: "generate_lead", form_name: "contact_brief", page_language: currentLang });
  }
}
