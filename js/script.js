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
// Language toggle (English / Arabic)
// English is authored directly in the HTML and used as the source of
// truth; this dictionary holds only the Arabic strings, keyed by the
// data-i18n / data-i18n-* attribute values in index.html. Original
// English content is cached from the DOM on load so toggling back never
// needs a duplicate English copy here.
// ---------------------------------------------------------------------
const AR = {
  "skip.link": "تخطي إلى المحتوى الرئيسي",
  "nav.logoAria": "الصفحة الرئيسية لمحمد عبده",
  "nav.menuAria": "فتح قائمة التنقل",
  "brand.name": "محمد عبده",
  "nav.services": "الخدمات",
  "nav.industries": "القطاعات",
  "nav.portfolio": "أعمالنا",
  "nav.process": "آلية العمل",
  "nav.results": "النتائج",
  "nav.about": "نبذة",
  "nav.contact": "تواصل",
  "nav.cta": "ابدأ مشروعك",

  "hero.eyebrow": "أخصائي أداء رقمي",
  "hero.h1": "ليدز تتحول لعملاء. حملات تحقق نتائج فعلية.",
  "hero.lead":
    "أبني أنظمة إعلانات جوجل وصفحات هبوط لشركات العقارات والخدمات (B2B) والتجارة الإلكترونية في مصر والسعودية والإمارات.",
  "hero.btnPrimary": "ابدأ حملتك",
  "hero.btnGhost": "شاهد إطار النتائج",
  "hero.point1": "إدارة إعلانات جوجل مركزة على ليدز مؤهلة",
  "hero.point2": "صفحات هبوط مبنية لرفع معدل التحويل",
  "hero.point3": "تنفيذ مصمم لسلوك السوق في مصر والسعودية والإمارات",
  "hero.photoAlt": "محمد عبده، أخصائي أداء رقمي",
  "hero.badgeLabel": "إعلانات جوجل",
  "hero.badgeValue": "هدف 4x عائد على الإنفاق",

  "services.eyebrow": "الخدمات",
  "services.h2": "خدمات أداء مصممة حول مؤشرات نتائج واضحة.",
  "services.card1.title": "إدارة إعلانات جوجل",
  "services.card1.desc":
    "بناء حملات بحث وأداء، تحسين استراتيجية المزايدة، وتتبع تحويلات واضح لتوسع موثوق.",
  "services.card2.title": "تحسين محركات البحث (SEO)",
  "services.card2.desc":
    "تدقيق تقني، هيكلة داخلية للصفحات، واستراتيجية محتوى وكلمات مفتاحية تحول البحث العضوي لمصدر ليدز مستمر.",
  "services.card3.title": "صفحات الهبوط",
  "services.card3.desc":
    "صفحات هبوط عالية التحويل مبنية ومختبرة على حركة إعلانية فعلية، بسرعة تحميل عالية وتطابق رسالة يصمد مع زيادة الإنفاق.",
  "services.card4.title": "متاجر Shopify",
  "services.card4.desc":
    "متاجر Shopify مبنية للتحويل من اليوم الأول: قوالب سريعة، صفحات منتج نظيفة، ومسار شراء مربوط ليعمل مع الحركة الإعلانية لا ضدها.",

  "industries.eyebrow": "القطاعات",
  "industries.h2": "استراتيجية واعية بالسوق للقطاعات التي تثق في نموها معي.",
  "industries.card1.title": "الوساطة العقارية",
  "industries.card1.desc":
    "حملات مبنية لواقع السوق العقاري: طلب محلي، ضغط جودة الليدز، والحاجة لفرص بيع مؤهلة أسرع.",
  "industries.card2.title": "علامات التجارة الإلكترونية",
  "industries.card2.desc":
    "استراتيجية حركة إعلانية وتحويل متوافقة مع اقتصاديات المنتج، متوسط قيمة الطلب، وسلوك الشراء المتكرر.",
  "industries.card3.title": "شركات المصاعد",
  "industries.card3.desc":
    "توليد ليدز لشركات تركيب وصيانة المصاعد، للوصول للمطورين ومديري المرافق وملاك المباني المحتاجين عرض سعر فورًا.",
  "industries.card4.title": "تأسيس الشركات",
  "industries.card4.desc":
    "استفسارات مؤهلة لمستشاري تأسيس الشركات: مؤسسون جاهزون لتسجيل شركة في مصر أو الإمارات، لا مجرد أشخاص يقارنون الخيارات.",

  "portfolio.eyebrow": "أعمالنا",
  "portfolio.h2": "صفحات هبوط تم بناؤها وتسليمها لعملاء حقيقيين.",
  "portfolio.tagDesktop": "ديسكتوب",
  "portfolio.tagMobile": "موبايل",
  "portfolio.item1.title": "Prime Homes Hub — هاسيندا رأس الحكمة",
  "portfolio.item1.desc": "صفحة هبوط عقارية لإطلاق مشروع بالم هيلز على الساحل الشمالي.",
  "portfolio.item1.alt": "صفحة هبوط هاسيندا رأس الحكمة العقارية لـ Prime Homes Hub، عرض ديسكتوب",
  "portfolio.item2.title": "Prime Homes Hub — باديا",
  "portfolio.item2.desc": "صفحة هبوط عقارية لمجتمع بالم هيلز بالقاهرة الجديدة.",
  "portfolio.item2.alt": "صفحة هبوط باديا العقارية لـ Prime Homes Hub، عرض موبايل",
  "portfolio.item3.title": "Bold Homz — مشاريع لا فيستا",
  "portfolio.item3.desc": "صفحة هبوط عقارية لوحدات جاهزة للاستلام بالقاهرة الجديدة.",
  "portfolio.item3.alt": "صفحة هبوط مشاريع لا فيستا العقارية لـ Bold Homz، عرض ديسكتوب",
  "portfolio.item4.title": "Homzeg — تطوير مصر، الساحل الشمالي",
  "portfolio.item4.desc": "صفحة هبوط عقارية لمقارنة مشاريع الساحل الشمالي.",
  "portfolio.item4.alt": "صفحة هبوط تطوير مصر بالساحل الشمالي لـ Homzeg، عرض موبايل",
  "portfolio.item5.title": "مصاعد فرسان",
  "portfolio.item5.desc": "صفحة هبوط لشركة تركيب وصيانة مصاعد سعودية.",
  "portfolio.item5.alt": "الصفحة الرئيسية لمصاعد فرسان، عرض ديسكتوب",
  "portfolio.item6.title": "مصاعد فرسان — مصاعد الفلل",
  "portfolio.item6.desc": "صفحة هبوط لخدمة تركيب مصاعد الفلل تحديدًا.",
  "portfolio.item6.alt": "صفحة هبوط مصاعد الفلل لمصاعد فرسان، عرض موبايل",

  "process.eyebrow": "آلية العمل",
  "process.h2": "مسار واضح من أول مكالمة وحتى نتائج قابلة للقياس.",
  "process.step1.title": "مكالمة استكشافية مجانية",
  "process.step1.desc":
    "استشارة مجانية لفهم نشاطك وأهدافك ومكان تسرب الليدز أو المبيعات حاليًا.",
  "process.step2.title": "تحديد النطاق والخطة",
  "process.step2.desc":
    "نطاق مشروع وخطة تنفيذ واضحة مبنية على ميزانيتك وجدولك الزمني وأرقامك المستهدفة.",
  "process.step3.title": "العرض والتسعير",
  "process.step3.desc":
    "عرض مالي مباشر بمخرجات محددة، لتعرف بدقة مقابل ماذا تدفع ولماذا.",
  "process.step4.title": "التعاقد والتأسيس",
  "process.step4.desc":
    "توقيع الاتفاقية، صلاحيات الوصول للحسابات، وإعداد التتبع الكامل قبل انطلاق حملاتك.",
  "process.step5.title": "الإطلاق والتحسين",
  "process.step5.desc":
    "تنطلق الحملات، ثم يتم تحسينها أسبوعيًا بناءً على تكلفة الليد والعائد على الإنفاق وجودة الليدز، لا حجم الحركة فقط.",

  "results.eyebrow": "سجل الأداء",
  "results.h2": "أداء حقيقي لحسابات إعلانات جوجل، لا أرقام شكلية.",
  "results.metric1.label": "نقرة تم تحقيقها",
  "results.metric2.label": "تحويل تم تحقيقه",
  "results.metric3.label": "متوسط تكلفة التحويل",
  "results.metric4.label": "إجمالي الإنفاق الإعلاني المُدار",
  "results.note": "إجمالي عبر حسابات إعلانات جوجل المُدارة.",

  "about.eyebrow": "نبذة",
  "about.h2": "تسويق مباشر ومبني على الأرقام لنتائج أعمال حقيقية.",
  "about.copy":
    "أنا محمد عبده، أخصائي أداء رقمي متخصص في إعلانات جوجل وصفحات الهبوط وتوليد الليدز. أعمل مع شركات عقارات وتجارة إلكترونية تحتاج نموًا قابلًا للقياس، لا نشاطًا تسويقيًا عامًا.",
  "about.pillar1.title": "شامل من الألف للياء",
  "about.pillar1.desc": "أبني الإعلان والصفحة التي يهبط عليها، بحيث لا يضيع شيء بينهما.",
  "about.pillar2.title": "إقليمي",
  "about.pillar2.desc": "حملات مبنية على سلوك جمهور مصر والسعودية والإمارات الفعلي، لا قوالب عامة.",
  "about.pillar3.title": "دقيق",
  "about.pillar3.desc":
    "أرقام حقيقية لا وعود مبهمة: تكلفة الليد والعائد على الإنفاق ومعدل التحويل، لا مجرد ظهور ووصول.",

  "contact.eyebrow": "تواصل",
  "contact.h2": "شاركني هدفك وجدولك الزمني وسوقك.",
  "contact.intro": "أرسل تفاصيل مشروعك وسأرد عليك بخطة عمل مركزة لتحقيق أهداف حملتك.",
  "contact.channelEmail": "البريد الإلكتروني",
  "contact.channelWhatsapp": "واتساب",
  "contact.channelCall": "اتصال",
  "contact.form.name": "الاسم",
  "contact.form.email": "البريد الإلكتروني",
  "contact.form.company": "الشركة",
  "contact.form.message": "ملخص المشروع",
  "contact.form.placeholder": "ما الذي تريد تحسينه: الليدز، العائد على الإنفاق، ترتيب السيو، أم معدل التحويل؟",
  "contact.form.submit": "أرسل الملخص",
  "contact.form.errorRequired": "من فضلك أدخل الاسم والبريد الإلكتروني وملخص المشروع.",
  "contact.form.errorEmail": "من فضلك أدخل بريدًا إلكترونيًا صحيحًا.",
  "contact.form.success": "جاري فتح برنامج البريد الإلكتروني بملخص مشروعك.",

  "footer.copyright": "محمد عبده. جميع الحقوق محفوظة.",
  "floating.whatsapp": "واتساب",
  "floating.call": "اتصال 01069090021",

  "meta.title": "محمد عبده | خبير إعلانات جوجل — مصر والسعودية والإمارات",
  "meta.description":
    "إدارة إعلانات جوجل وصفحات هبوط ومواقع ثابتة تجيب عملاء محتملين مؤهلين لشركات العقارات والخدمات في مصر والسعودية والإمارات.",

  "thanks.eyebrow": "تم الإرسال",
  "thanks.h1": "شكرًا — وصلني ملخص مشروعك.",
  "thanks.body":
    "هراجع التفاصيل وأرد عليك قريبًا. عايز رد أسرع؟ راسلني مباشرة على واتساب.",
  "thanks.whatsappCta": "تواصل عبر واتساب",
  "thanks.backHome": "العودة للصفحة الرئيسية",
};

const LANG_STORAGE_KEY = "mohabdo_lang";
let currentLang = localStorage.getItem(LANG_STORAGE_KEY) === "ar" ? "ar" : "en";

const originalTitle = document.title;
const metaDescEl = document.querySelector('meta[name="description"]');
const originalMetaDesc = metaDescEl ? metaDescEl.getAttribute("content") : "";

function cacheOriginalI18nContent() {
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    if (el.dataset.origHtml === undefined) el.dataset.origHtml = el.innerHTML;
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    if (el.dataset.origPlaceholder === undefined) el.dataset.origPlaceholder = el.getAttribute("placeholder") || "";
  });
  document.querySelectorAll("[data-i18n-alt]").forEach((el) => {
    if (el.dataset.origAlt === undefined) el.dataset.origAlt = el.getAttribute("alt") || "";
  });
  document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    if (el.dataset.origAria === undefined) el.dataset.origAria = el.getAttribute("aria-label") || "";
  });
}

function applyLang(lang) {
  const isAr = lang === "ar";
  document.documentElement.lang = isAr ? "ar" : "en";
  document.documentElement.dir = isAr ? "rtl" : "ltr";

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    el.innerHTML = isAr && AR[key] ? AR[key] : el.dataset.origHtml;
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    el.setAttribute("placeholder", isAr && AR[key] ? AR[key] : el.dataset.origPlaceholder);
  });
  document.querySelectorAll("[data-i18n-alt]").forEach((el) => {
    const key = el.getAttribute("data-i18n-alt");
    el.setAttribute("alt", isAr && AR[key] ? AR[key] : el.dataset.origAlt);
  });
  document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    const key = el.getAttribute("data-i18n-aria");
    el.setAttribute("aria-label", isAr && AR[key] ? AR[key] : el.dataset.origAria);
  });

  const toggleLabel = document.getElementById("langToggleLabel");
  if (toggleLabel) toggleLabel.textContent = isAr ? "English" : "العربية";

  document.title = isAr && AR["meta.title"] ? AR["meta.title"] : originalTitle;
  if (metaDescEl) {
    metaDescEl.setAttribute("content", isAr && AR["meta.description"] ? AR["meta.description"] : originalMetaDesc);
  }

  currentLang = isAr ? "ar" : "en";
  localStorage.setItem(LANG_STORAGE_KEY, currentLang);
}

cacheOriginalI18nContent();
applyLang(currentLang);

const langToggle = document.getElementById("langToggle");
if (langToggle) {
  langToggle.addEventListener("click", () => {
    applyLang(currentLang === "ar" ? "en" : "ar");
  });
}

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
