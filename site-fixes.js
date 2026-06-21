(function () {
  var MOBILE_VIEWPORT_QUERY = "(max-width: 980px)";
  var MOBILE_SHELL_CLASSES = [
    "tp-mobile-site",
    "tp-home-mobile-template-page",
    "tp-mobile-booting",
    "tp-mobile-ready",
    "tp-mobile-nav-open",
  ];
  var MOBILE_NAV_TAP_MOVE_THRESHOLD = 12;
  var mobileNavTouchState = {
    active: false,
    moved: false,
    startX: 0,
    startY: 0,
  };
  var mobileNavSuppressClickUntil = 0;

  function isMobileViewport() {
    if (typeof window.__tpShouldUseMobileSite === "function") {
      return window.__tpShouldUseMobileSite();
    }
    return window.matchMedia(MOBILE_VIEWPORT_QUERY).matches;
  }

  function removeMobileShellClasses() {
    MOBILE_SHELL_CLASSES.forEach(function (cls) {
      document.documentElement.classList.remove(cls);
      if (document.body) document.body.classList.remove(cls);
    });
  }

  var CA_FLAG =
    "data:image/svg+xml," +
    encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs><clipPath id="c"><circle cx="16" cy="16" r="16"/></clipPath></defs><g clip-path="url(#c)"><rect width="32" height="32" fill="#d52b1e"/><rect x="8" width="16" height="32" fill="#fff"/><path fill="#d52b1e" d="M16 8.5l1.1 3.4h3.6l-2.9 2.1 1.1 3.5-3-2.2-3 2.2 1.1-3.5-2.9-2.1h3.6z"/></g></svg>'
    );

  function showSentBanner() {
    if (!/sent=1/.test(location.search)) return;
    var form = document.querySelector(".tp-contact-form");
    if (!form) return;
    var note = document.createElement("p");
    note.className = "tp-contact-sent";
    note.textContent =
      document.documentElement.lang === "fr"
        ? "Merci! Votre message a ete envoye. Nous vous repondrons sous peu."
        : "Thank you! Your message has been sent. We will get back to you soon.";
    form.parentNode.insertBefore(note, form);
  }

  function ensureFormSubmitFields(form) {
    if (!form || location.protocol === "file:") return;

    var pageUrl = location.href.split("#")[0];
    var urlInput = form.querySelector('input[name="_url"]');
    if (!urlInput) {
      urlInput = document.createElement("input");
      urlInput.type = "hidden";
      urlInput.name = "_url";
      form.insertBefore(urlInput, form.firstChild);
    }
    urlInput.value = pageUrl;

    var nextInput = form.querySelector('input[name="_next"]');
    if (nextInput && !/^https?:\/\//i.test(nextInput.value)) {
      var nextPath = nextInput.value.charAt(0) === "/" ? nextInput.value : "/" + nextInput.value;
      nextInput.value = location.origin + nextPath;
    }
  }

  function initContactForm() {
    var form = document.querySelector(".tp-contact-form");
    if (!form) return;

    ensureFormSubmitFields(form);

    var captcha = form.querySelector(".Captcha3940957316__checkbox");
    if (captcha) {
      captcha.removeAttribute("required");
      captcha.checked = true;
    }

    var captchaRoot = form.querySelector("#comp-m4d2ct0y, .wixui-captcha");
    if (captchaRoot) captchaRoot.remove();

    form.addEventListener("submit", function () {
      ensureFormSubmitFields(form);

      var btn = form.querySelector('button[type="submit"]');
      if (btn) {
        btn.disabled = true;
        var label = btn.querySelector(".wixui-button__label");
        if (label) {
          label.textContent =
            document.documentElement.lang === "fr" ? "Envoi..." : "Sending...";
        }
      }
    });

    var sendButton = form.querySelector('button[type="submit"]');
    if (sendButton) {
      sendButton.addEventListener(
        "click",
        function (event) {
          if (!form.checkValidity()) {
            event.preventDefault();
            form.reportValidity();
            return;
          }
          ensureFormSubmitFields(form);
        },
        true
      );
    }
  }

  function resolvePath(href) {
    var link = document.createElement("a");
    link.href = href;
    return link.pathname;
  }

  function normalizeNavHref(href) {
    if (!href) return "";
    if (/^(https?:|mailto:|tel:)/i.test(href)) return href;
    var link = document.createElement("a");
    link.href = href;
    return link.pathname + link.search + link.hash;
  }

  function getDesktopNavLinkMap() {
    var nav = document.getElementById("comp-m4ufk180");
    var map = {};
    if (!nav) return map;

    function addLink(anchor) {
      var href = anchor.getAttribute("href");
      if (!href || href.indexOf("javascript:") === 0) return;
      var anchorId = anchor.getAttribute("data-anchor");
      if (anchorId && href.indexOf("#") < 0) {
        href = href + "#" + anchorId;
      }
      var label = (anchor.textContent || "").replace(/\s+/g, " ").trim();
      if (!label) return;
      map[label] = normalizeNavHref(href);
    }

    nav.querySelectorAll("a.wixui-rich-text__text[href]").forEach(addLink);
    nav.querySelectorAll("a.itemDepth12472627565__root[href]").forEach(addLink);
    nav.querySelectorAll("a.itemDepth02233374943__root[href]").forEach(addLink);

    return map;
  }

  function getMobileMenuAnchorTargets() {
    var isFrench = isFrenchPage();
    var therapyPath = isFrench ? "/fr/services/therapy.html" : "/services/therapy.html";
    var teamPath = isFrench ? "/fr/about-us/our-team.html" : "/about-us/our-team.html";
    var specializationsPath = isFrench
      ? "/fr/about-us/our-specializations.html"
      : "/about-us/our-specializations.html";
    var contactPath = isFrench ? "/fr/contact-us.html" : "/contact-us.html";
    var readingGroupsPath = isFrench
      ? "/fr/services/consultations-workshops-reading-groups.html"
      : "/services/consultations-workshops-reading-groups.html";
    var clickReaderPath = isFrench
      ? "/fr/services/clinical-management-software.html"
      : "/services/clinical-management-software.html";

    return {
      Therapy: therapyPath,
      Therapie: therapyPath,
      "Thérapie": therapyPath,
      Speech: therapyPath + "#anchors-m4u9ygef6",
      Parole: therapyPath + "#anchors-m4u9ygef6",
      Language: therapyPath + "#anchors-m4u9yger9",
      Langage: therapyPath + "#anchors-m4u9yger9",
      "Assistive devices": therapyPath + "#anchors-m4u9ygfe4",
      "Appareils fonctionnels": therapyPath + "#anchors-m4u9ygfe4",
      "Join Our Team": teamPath + "#anchors-m4uaf2y410",
      "Rejoignez notre équipe": teamPath + "#anchors-m4uaf2y410",
      "Brain Injury": specializationsPath + "#anchors-m4u9qh0c",
      "Lésion cérébrale": specializationsPath + "#anchors-m4u9qh0c",
      "Learning Disabilities": specializationsPath + "#anchors-m4u9qh0m1",
      "Troubles d'apprentissage": specializationsPath + "#anchors-m4u9qh0m1",
      Stroke: specializationsPath + "#anchors-m4u9qh0u6",
      "Accident vasculaire cérébral": specializationsPath + "#anchors-m4u9qh0u6",
      "Reading Groups": readingGroupsPath + "#anchors-m4u7nvwq6",
      "Groupes de lecture": readingGroupsPath + "#anchors-m4u7nvwq6",
      "Click Reader": clickReaderPath + "#comp-m4wzb8lj6",
      Fees: contactPath + "#comp-m4uec27w1",
      Frais: contactPath + "#comp-m4uec27w1",
      "Contact Us": contactPath + "#anchors-lvfbdtjs",
      "Contactez nous": contactPath + "#anchors-lvfbdtjs",
    };
  }

  function suppressMobileNavClick(ms) {
    mobileNavSuppressClickUntil = Date.now() + (ms || 650);
  }

  function shouldSuppressMobileNavClick() {
    return Date.now() < mobileNavSuppressClickUntil;
  }

  function resetMobileNavTouchState() {
    mobileNavTouchState.active = false;
    mobileNavTouchState.moved = false;
  }

  function initMobileNavTouchGuard(root) {
    if (!root || root.dataset.tpTouchGuardBound === "true") return;
    root.dataset.tpTouchGuardBound = "true";

    root.addEventListener(
      "touchstart",
      function (event) {
        if (!event.touches || !event.touches.length) return;
        var touch = event.touches[0];
        mobileNavTouchState.active = true;
        mobileNavTouchState.moved = false;
        mobileNavTouchState.startX = touch.clientX;
        mobileNavTouchState.startY = touch.clientY;
      },
      true
    );

    root.addEventListener(
      "touchmove",
      function (event) {
        if (!mobileNavTouchState.active || !event.touches || !event.touches.length) return;
        var touch = event.touches[0];
        var dx = touch.clientX - mobileNavTouchState.startX;
        var dy = touch.clientY - mobileNavTouchState.startY;
        if (dx * dx + dy * dy > MOBILE_NAV_TAP_MOVE_THRESHOLD * MOBILE_NAV_TAP_MOVE_THRESHOLD) {
          mobileNavTouchState.moved = true;
        }
      },
      true
    );

    root.addEventListener(
      "touchend",
      function () {
        if (mobileNavTouchState.moved) {
          suppressMobileNavClick();
        }
        resetMobileNavTouchState();
      },
      true
    );

    root.addEventListener(
      "touchcancel",
      function () {
        suppressMobileNavClick();
        resetMobileNavTouchState();
      },
      true
    );
  }

  function findMobileNavLink(target) {
    if (!target || !target.closest) return null;
    return target.closest(
      "a.tp-mobile-nav__link[href], a.tp-mobile-nav__sublink[href], a.tp-mobile-nav__lang-link[href]"
    );
  }

  function bindMobileNavLink(link) {
    if (!link || link.dataset.tpNavBound === "true") return;
    link.dataset.tpNavBound = "true";
    var touchedAt = 0;

    function activateFromLink(event) {
      var href = link.getAttribute("href");
      if (!href || href.charAt(0) === "#") return;
      if (event) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
      }
      navigateFromMobileMenu(href);
    }

    link.addEventListener(
      "touchend",
      function (event) {
        touchedAt = Date.now();
        if (mobileNavTouchState.moved || shouldSuppressMobileNavClick()) {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          return;
        }
        activateFromLink(event);
      },
      { capture: true, passive: false }
    );

    link.addEventListener(
      "click",
      function (event) {
        if (shouldSuppressMobileNavClick() || Date.now() - touchedAt < 500) {
          event.preventDefault();
          event.stopPropagation();
          event.stopImmediatePropagation();
          return;
        }
        activateFromLink(event);
      },
      true
    );
  }

  function bindAllMobileNavLinks(root) {
    if (!root) return;
    root.querySelectorAll(
      "a.tp-mobile-nav__link[href], a.tp-mobile-nav__sublink[href], a.tp-mobile-nav__lang-link[href]"
    ).forEach(bindMobileNavLink);
  }

  function syncMobileMenuFromDesktop() {
    var mobileNav = document.querySelector(".tp-mobile-nav");
    if (!mobileNav) return;

    var desktopMap = getDesktopNavLinkMap();
    var anchorMap = getMobileMenuAnchorTargets();
    var linksRoot = getMobileNavPanel(mobileNav) || mobileNav;
    linksRoot.querySelectorAll(".tp-mobile-nav__sublink, .tp-mobile-nav__link").forEach(function (link) {
      var label = (link.textContent || "").replace(/\s+/g, " ").trim();
      var href = anchorMap[label] || desktopMap[label];
      if (href) {
        link.setAttribute("href", href);
      }
    });
    bindAllMobileNavLinks(linksRoot);
  }

  function getMobileNavPanel(nav) {
    if (!nav) return null;
    return nav.querySelector(".tp-mobile-nav__panel") || document.body.querySelector(".tp-mobile-nav__panel");
  }

  function closeMobileNavMenu(nav) {
    if (!nav) return;
    var panel = getMobileNavPanel(nav);
    var toggle = nav.querySelector(".tp-mobile-nav__toggle");
    nav.classList.remove("is-open");
    document.body.classList.remove("tp-mobile-nav-open");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
    if (panel) {
      panel.hidden = true;
      if (panel.parentNode !== nav) {
        nav.appendChild(panel);
      }
    }
  }

  function navigateFromMobileMenu(href) {
    var nav = document.querySelector(".tp-mobile-nav");
    if (nav) closeMobileNavMenu(nav);

    if (/^(mailto:|tel:)/i.test(href)) {
      window.location.href = href;
      return;
    }

    var absolute =
      href.indexOf("http") === 0
        ? href
        : window.location.origin + (href.charAt(0) === "/" ? href : "/" + href);
    window.location.assign(absolute);
  }

  function initMobileNavRouting() {
    if (window.__tpMobileNavRoutingBound) return;
    window.__tpMobileNavRoutingBound = true;

    var lastNav = { href: "", time: 0 };

    function handleMobileNavActivate(event) {
      if (shouldSuppressMobileNavClick()) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        return;
      }

      var link = findMobileNavLink(event.target);
      if (!link) return;

      var href = link.getAttribute("href");
      if (!href || href.charAt(0) === "#") return;

      var now = Date.now();
      if (lastNav.href === href && now - lastNav.time < 500) return;
      lastNav = { href: href, time: now };

      event.preventDefault();
      event.stopPropagation();
      event.stopImmediatePropagation();
      navigateFromMobileMenu(href);
    }

    document.addEventListener("click", handleMobileNavActivate, true);
    bindAllMobileNavLinks(document.querySelector(".tp-mobile-nav"));
  }

  function isFrenchPage() {
    var path = window.location.pathname.toLowerCase();
    var lang = (document.documentElement.lang || "").toLowerCase();
    return (
      lang.indexOf("fr") === 0 ||
      path === "/fr" ||
      path === "/fr.html" ||
      path.indexOf("/fr/") === 0
    );
  }

  function getLanguageUrls() {
    var links = Array.prototype.slice.call(
      document.querySelectorAll('link[rel="alternate"][hreflang]')
    );
    var enLink = links.find(function (l) {
      return l.hreflang === "en-ca" || l.hreflang === "x-default";
    });
    var frLink = links.find(function (l) {
      return l.hreflang === "fr-fr";
    });

    var en = enLink ? resolvePath(enLink.href) : "/";
    var fr = frLink ? resolvePath(frLink.href) : "/fr.html";

    if (en === "/index.html") en = "/";
    if (fr === "/fr/index.html") fr = "/fr.html";

    return { en: en, fr: fr };
  }

  function getHomepageUrl() {
    return isFrenchPage() ? "/fr.html" : "/";
  }

  function initHeaderLogoLinks() {
    var homeUrl = getHomepageUrl();
    var french = isFrenchPage();
    var homeLabel = french ? "Accueil" : "The Therapy Path home";

    var desktopLogoLink = document.querySelector(
      "#comp-m4u3wh0r a[data-testid='linkElement']"
    );
    if (desktopLogoLink) {
      desktopLogoLink.setAttribute("href", homeUrl);
      desktopLogoLink.setAttribute("target", "_self");
      if (!desktopLogoLink.getAttribute("aria-label")) {
        desktopLogoLink.setAttribute("aria-label", homeLabel);
      }
    } else {
      var logoRoot = document.getElementById("comp-m4u3wh0r");
      var logoImage = logoRoot && logoRoot.querySelector("img");
      if (logoRoot && logoImage && !logoImage.closest("a[href]")) {
        var wrap = document.createElement("a");
        wrap.href = homeUrl;
        wrap.className = "tp-header-logo-link";
        wrap.setAttribute("aria-label", homeLabel);
        logoImage.parentNode.insertBefore(wrap, logoImage);
        wrap.appendChild(logoImage);
      }
    }

    var mobileLogoLink = document.querySelector(".tp-mobile-header-logo");
    if (mobileLogoLink) {
      mobileLogoLink.setAttribute("href", homeUrl);
      if (!mobileLogoLink.getAttribute("aria-label")) {
        mobileLogoLink.setAttribute("aria-label", homeLabel);
      }
    }
  }

  function initLanguageSwitcher() {
    var mount = document.getElementById("comp-m6k5baee");
    if (!mount || mount.querySelector(".tp-lang-switch")) return;

    var urls = getLanguageUrls();
    var french = isFrenchPage();
    var current = french
      ? { code: "FR", href: urls.fr }
      : { code: "EN", href: urls.en };
    var alternate = french
      ? { code: "EN", href: urls.en }
      : { code: "FR", href: urls.fr };

    var root = document.createElement("div");
    root.className = "tp-lang-switch";
    root.innerHTML =
      '<button type="button" class="tp-lang-current" aria-haspopup="listbox" aria-expanded="false">' +
      '<img class="tp-lang-flag" src="' +
      CA_FLAG +
      '" alt="" width="22" height="22" />' +
      '<span class="tp-lang-code">' +
      current.code +
      "</span>" +
      '<span class="tp-lang-chevron" aria-hidden="true">&#9662;</span>' +
      "</button>" +
      '<div class="tp-lang-menu" hidden>' +
      '<a class="tp-lang-option" href="' +
      alternate.href +
      '">' +
      '<img class="tp-lang-flag" src="' +
      CA_FLAG +
      '" alt="" width="22" height="22" />' +
      "<span>" +
      alternate.code +
      "</span>" +
      "</a>" +
      "</div>";

    mount.innerHTML = "";
    mount.appendChild(root);

    var button = root.querySelector(".tp-lang-current");
    var menu = root.querySelector(".tp-lang-menu");

    function closeMenu() {
      root.classList.remove("is-open");
      button.setAttribute("aria-expanded", "false");
      menu.hidden = true;
    }

    function openMenu() {
      root.classList.add("is-open");
      button.setAttribute("aria-expanded", "true");
      menu.hidden = false;
    }

    button.addEventListener("click", function (event) {
      event.stopPropagation();
      if (menu.hidden) openMenu();
      else closeMenu();
    });

    document.addEventListener("click", function (event) {
      if (!root.contains(event.target)) closeMenu();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeMenu();
    });
  }

  function initHashScroll() {
    var hashScrollTargets = {
      "comp-m4uec27w1": "comp-m4uec27w1",
      "anchors-m4uec27r6": "comp-m4uec27w1",
      "anchors-lvfbdtjs": "comp-m4d289nf",
      "comp-m4d289nf": "comp-m4d289nf",
      "anchors-m4u9ygef6": "comp-m4u9ygeh8",
      "comp-m4u9ygeh8": "comp-m4u9ygeh8",
      "anchors-m4u9yger9": "comp-m4u9ygew",
      "comp-m4u9ygew": "comp-m4u9ygew",
      "anchors-m4u9ygfe4": "comp-m4u9ygfg2",
      "comp-m4u9ygfg2": "comp-m4u9ygfg2",
      "anchors-m4uaf2y410": "comp-m4uaf2y81",
      "join-our-team": "comp-m4uaf2y81",
      "comp-m4uaf2y81": "comp-m4uaf2y81",
      "anchors-m4u9qh0c": "comp-m4u9qh0e6",
      "comp-m4u9qh0e6": "comp-m4u9qh0e6",
      "anchors-m4u9qh0m1": "comp-m4u9qh0q1",
      "comp-m4u9qh0q1": "comp-m4u9qh0q1",
      "anchors-m4u9qh0u6": "comp-m4u9u733",
      "comp-m4u9u733": "comp-m4u9u733",
      "anchors-m4u7nvwq6": "comp-m4u7nvwq8",
      "comp-m4u7nvwq6": "comp-m4u7nvwq8",
      "comp-m4wzb8lj6": "comp-m4wzb8lh3",
    };

    function scrollToHashTarget(hash) {
      var targetId = hashScrollTargets[hash];
      if (!targetId) return false;
      var target = document.getElementById(targetId);
      if (!target) return false;
      var top =
        target.getBoundingClientRect().top + window.pageYOffset - 130;
      window.scrollTo({ top: top, behavior: "auto" });
      return true;
    }

    function handlePageHash() {
      var hash = location.hash.replace(/^#/, "");
      if (!hashScrollTargets[hash]) return;
      scrollToHashTarget(hash);
      window.setTimeout(function () {
        scrollToHashTarget(hash);
      }, 150);
      window.setTimeout(function () {
        scrollToHashTarget(hash);
      }, 500);
    }

    handlePageHash();
    window.addEventListener("hashchange", handlePageHash);

    document.addEventListener("click", function (event) {
      var link = event.target.closest("a[href]");
      if (!link || !link.href) return;
      var url;
      try {
        url = new URL(link.href, location.href);
      } catch (err) {
        return;
      }
      var hash = url.hash.replace(/^#/, "");
      if (!hashScrollTargets[hash]) return;

      var samePage =
        url.pathname === location.pathname ||
        (url.pathname.endsWith("/therapy.html") &&
          location.pathname.endsWith("/therapy.html")) ||
        (url.pathname.endsWith("/our-team.html") &&
          location.pathname.endsWith("/our-team.html")) ||
        (url.pathname.endsWith("/our-specializations.html") &&
          location.pathname.endsWith("/our-specializations.html")) ||
        (url.pathname.endsWith("/contact-us.html") &&
          location.pathname.endsWith("/contact-us.html")) ||
        (url.pathname.endsWith("/consultations-workshops-reading-groups.html") &&
          location.pathname.endsWith("/consultations-workshops-reading-groups.html")) ||
        (url.pathname.endsWith("/clinical-management-software.html") &&
          location.pathname.endsWith("/clinical-management-software.html"));

      if (!samePage) return;

      var targetId = hashScrollTargets[hash];
      if (!document.getElementById(targetId)) return;

      event.preventDefault();
      history.pushState(null, "", url.pathname + url.search + "#" + hash);
      scrollToHashTarget(hash);
    });
  }

  function initTherapyMenuLinks() {
    var targetsByText = getMobileMenuAnchorTargets();

    document
      .querySelectorAll(
        '#comp-m4ufk180 a.wixui-rich-text__text, #comp-m4ufk180 a.itemDepth12472627565__root'
      )
      .forEach(function (link) {
        var label = (link.textContent || "").replace(/\s+/g, " ").trim();
        var href = targetsByText[label];
        if (!href) return;
        link.setAttribute("href", href);
        link.setAttribute("target", "_self");
      });

    syncMobileMenuFromDesktop();
  }

  function initDesktopServicesMegaMenu() {
    if (isMobileViewport()) return;

    var nav = document.getElementById("comp-m4ufk180");
    if (!nav) return;

    var servicesItem = nav.querySelector(
      '.itemDepth02233374943__itemWrapper [aria-label="Services"]'
    );
    if (!servicesItem) return;

    var itemWrapper = servicesItem.closest(".itemDepth02233374943__itemWrapper");
    if (!itemWrapper) return;

    var heightProps = ["height", "maxHeight", "minHeight"];

    function clearServicesMenuHeights() {
      var selectors = [
        '.itemDepth02233374943__positionBox[aria-label="Services"]',
        '[aria-label="Services"] .itemDepth02233374943__animationBox',
        '[aria-label="Services"] .StylableHorizontalMenu3372578893__megaMenuWrapper',
        '[aria-label="Services"] .submenu815198092__containerPageStretchWrapper',
        '[aria-label="Services"] #comp-m4uflx2i',
        '[aria-label="Services"] .submenu815198092__root',
        '[aria-label="Services"] [data-mesh-id="comp-m4uflx3ainlineContent-gridContainer"]',
      ];

      selectors.forEach(function (selector) {
        var node = itemWrapper.querySelector(selector);
        if (!node) return;
        heightProps.forEach(function (prop) {
          node.style[prop] = "";
        });
        node.style.overflow = "";
      });
    }

    itemWrapper.addEventListener("mouseenter", clearServicesMenuHeights);
    itemWrapper.addEventListener("focusin", clearServicesMenuHeights);
  }

  function initHelpCardButtons() {
    document.querySelectorAll('[id^="comp-m4pvn6av__"] a[href]').forEach(function (link) {
      link.setAttribute("aria-label", link.href.indexOf("assessments") >= 0
        ? "Learn more about assessments"
        : "Learn more about therapy services");

      link.addEventListener(
        "click",
        function (event) {
          var href = link.getAttribute("href");
          if (!href || href.charAt(0) === "#") return;
          event.preventDefault();
          event.stopImmediatePropagation();
          window.location.assign(href);
        },
        true
      );
    });
  }

  function initAccessibleLinkLabels() {
    document.querySelectorAll("a[href]").forEach(function (link) {
      if (link.getAttribute("aria-label")) return;

      var text = (link.textContent || "").replace(/\s+/g, " ").trim();
      if (text) return;

      var img = link.querySelector("img[alt]");
      if (img && img.alt.trim()) {
        link.setAttribute("aria-label", img.alt.trim());
        return;
      }

      var href = link.getAttribute("href") || "";
      if (
        href === "/" ||
        href === "index.html" ||
        /\/index\.html$/.test(href) ||
        href.endsWith("/") && href.split("/").filter(Boolean).length <= 1
      ) {
        link.setAttribute("aria-label", "The Therapy Path home");
        return;
      }
      if (href === "fr.html" || href.endsWith("/fr.html")) {
        link.setAttribute("aria-label", "Accueil");
        return;
      }
      if (href.indexOf("facebook.com") >= 0) {
        link.setAttribute("aria-label", "The Therapy Path on Facebook");
        return;
      }
      if (href.indexOf("instagram.com") >= 0) {
        link.setAttribute("aria-label", "The Therapy Path on Instagram");
        return;
      }
      if (href.indexOf("linkedin.com") >= 0) {
        link.setAttribute("aria-label", "The Therapy Path on LinkedIn");
        return;
      }

      var panel =
        link.closest('[id^="comp-m4u4ll70"]') ||
        link.closest('[id^="comp-m4pvn6av"]') ||
        link.closest(".wixui-repeater__item");
      if (panel) {
        var description = panel.querySelector(".wixui-rich-text__text");
        if (description) {
          var snippet = (description.textContent || "")
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 100);
          if (snippet) {
            link.setAttribute("aria-label", snippet);
            return;
          }
        }
      }

      if (href.indexOf("assessments") >= 0) {
        link.setAttribute("aria-label", "Learn more about assessments");
        return;
      }
      if (href.indexOf("therapy") >= 0) {
        link.setAttribute("aria-label", "Learn more about therapy services");
        return;
      }

      var titled = link.closest("[title]");
      var title = link.getAttribute("title") || (titled && titled.getAttribute("title"));
      if (title) {
        link.setAttribute(
          "aria-label",
          title
            .replace(/\.(jpe?g|png|webp|avif)$/i, "")
            .replace(/[_~-]+/g, " ")
            .trim()
        );
      }
    });
  }

  function initConsultationPresentationCards() {
    if (!isMobileViewport()) return;

    var page = document.getElementById("yb9d1");
    if (!page) return;

    var repeater = document.getElementById("comp-m6awikew");
    if (!repeater) return;

    page.querySelectorAll(".comp-m6awikfp.wixui-repeater__item").forEach(function (card) {
      var mesh = card.querySelector("[data-mesh-id$='inlineContent-gridContainer']");
      if (!mesh) return;

      var icon = mesh.querySelector("[id^='comp-m6awikft5__']");
      var title = mesh.querySelector("[id^='comp-m6awikfy__']");
      var link = mesh.querySelector("[id^='comp-m6awikg0__']");
      var description = mesh.querySelector("[id^='comp-m6awikg31__']");
      if (!icon || !title) return;

      card.classList.add("tp-presentation-card");

      var header = mesh.querySelector(".tp-presentation-card__header");
      if (!header) {
        header = document.createElement("div");
        header.className = "tp-presentation-card__header";
        mesh.insertBefore(header, mesh.firstChild);
      }

      icon.classList.add("tp-presentation-card__icon");
      title.classList.add("tp-presentation-card__title");
      if (link) link.classList.add("tp-presentation-card__link");
      if (description) description.classList.add("tp-presentation-card__body");

      icon.style.setProperty("display", "block", "important");
      if (link) link.style.setProperty("display", "block", "important");

      if (!header.contains(icon)) header.appendChild(icon);
      if (!header.contains(title)) header.appendChild(title);
      if (link && !header.contains(link)) header.appendChild(link);

      resetWixMotionEnter(card);
      resetWixMotionEnter(header);
    });

    repeater.classList.add("tp-presentation-cards");
    page.dataset.tpPresentationCardsPatched = "true";
  }

  function restoreConsultationPresentationCards() {
    var page = document.getElementById("yb9d1");
    if (!page || page.dataset.tpPresentationCardsPatched !== "true") return;

    page.querySelectorAll(".comp-m6awikfp.wixui-repeater__item").forEach(function (card) {
      var mesh = card.querySelector("[data-mesh-id$='inlineContent-gridContainer']");
      if (!mesh) return;

      var icon = mesh.querySelector("[id^='comp-m6awikft5__']");
      var title = mesh.querySelector("[id^='comp-m6awikfy__']");
      var link = mesh.querySelector("[id^='comp-m6awikg0__']");
      var description = mesh.querySelector("[id^='comp-m6awikg31__']");
      var header = mesh.querySelector(".tp-presentation-card__header");

      [icon, title, link, description].forEach(function (node) {
        if (!node) return;
        node.classList.remove(
          "tp-presentation-card__icon",
          "tp-presentation-card__title",
          "tp-presentation-card__link",
          "tp-presentation-card__body"
        );
        node.style.removeProperty("display");
        mesh.appendChild(node);
      });

      if (header) header.remove();
      card.classList.remove("tp-presentation-card");
    });

    var repeater = document.getElementById("comp-m6awikew");
    if (repeater) repeater.classList.remove("tp-presentation-cards");

    delete page.dataset.tpPresentationCardsPatched;
  }

  function initConsultationProgramsTitle() {
    if (!isMobileViewport()) return;

    var page = document.getElementById("yb9d1");
    if (!page) return;

    var title = document.getElementById("comp-m4u7nvwo2");
    var card = document.getElementById("comp-m6782her");
    var mesh = document.querySelector(
      "[data-mesh-id='comp-m4u7nvwm2inlineContent-gridContainer']"
    );
    if (!title || !card || !mesh) return;

    title.classList.add("tp-consultation-programs-title");
    if (title.nextElementSibling === card) {
      page.dataset.tpConsultationProgramsTitlePatched = "true";
      return;
    }

    mesh.insertBefore(title, card);
    resetWixMotionEnter(title);
    page.dataset.tpConsultationProgramsTitlePatched = "true";
  }

  function restoreConsultationProgramsTitle() {
    var page = document.getElementById("yb9d1");
    if (!page || page.dataset.tpConsultationProgramsTitlePatched !== "true") return;

    var title = document.getElementById("comp-m4u7nvwo2");
    var card = document.getElementById("comp-m6782her");
    var mesh = document.querySelector(
      "[data-mesh-id='comp-m4u7nvwm2inlineContent-gridContainer']"
    );
    if (!title || !mesh) return;

    title.classList.remove("tp-consultation-programs-title");
    if (card && card.parentElement === mesh) {
      mesh.insertBefore(title, card.nextSibling);
    } else {
      mesh.appendChild(title);
    }

    delete page.dataset.tpConsultationProgramsTitlePatched;
  }

  function initConsultationHeroTuning() {
    if (!isMobileViewport()) return;

    var page = document.getElementById("yb9d1");
    if (!page) return;

    var subtitle = document.getElementById("comp-m4u7nvwj1");
    var heroCopy = page.querySelector(".tp-mobile-page-hero__copy");
    if (!subtitle && !heroCopy) return;

    if (subtitle) {
      subtitle.classList.add("tp-consultation-hero-subtitle");
      subtitle.style.setProperty("display", "none", "important");
    }

    if (heroCopy) {
      heroCopy.classList.add("tp-consultation-hero-copy");
      heroCopy.style.setProperty("padding", "14px 12px 8px", "important");
      heroCopy.style.setProperty("margin-bottom", "0", "important");
    }

    page.dataset.tpConsultationHeroTuned = "true";
  }

  function restoreConsultationHeroTuning() {
    var page = document.getElementById("yb9d1");
    if (!page || page.dataset.tpConsultationHeroTuned !== "true") return;

    var subtitle = document.getElementById("comp-m4u7nvwj1");
    var heroCopy = page.querySelector(".tp-consultation-hero-copy");
    if (subtitle) {
      subtitle.classList.remove("tp-consultation-hero-subtitle");
      subtitle.style.removeProperty("display");
    }
    if (heroCopy) {
      heroCopy.classList.remove("tp-consultation-hero-copy");
      heroCopy.style.removeProperty("padding");
      heroCopy.style.removeProperty("margin-bottom");
    }

    delete page.dataset.tpConsultationHeroTuned;
  }

  function storeConsultationReadingRestorePoint(element) {
    if (!element || element.dataset.tpRestoreMesh) return;

    var parent = element.parentElement;
    element.dataset.tpRestoreMesh = parent
      ? parent.getAttribute("data-mesh-id") || ""
      : "";
    element.dataset.tpRestoreNext = element.nextElementSibling
      ? element.nextElementSibling.id || ""
      : "";
  }

  function restoreConsultationReadingElement(element) {
    if (!element || !element.dataset.tpRestoreMesh) return;

    var mesh = document.querySelector(
      "[data-mesh-id='" + element.dataset.tpRestoreMesh + "']"
    );
    if (!mesh) return;

    var next = document.getElementById(element.dataset.tpRestoreNext || "");
    if (next && next.parentElement === mesh) {
      mesh.insertBefore(element, next);
    } else {
      mesh.appendChild(element);
    }

    element.classList.remove("tp-consultation-reading-image");
    delete element.dataset.tpRestoreMesh;
    delete element.dataset.tpRestoreNext;
  }

  function initConsultationReadingProgramLayout() {
    if (!isMobileViewport()) return;

    var page = document.getElementById("yb9d1");
    if (!page || page.dataset.tpConsultationReadingLayoutPatched === "true") return;

    var boyImage = document.getElementById("comp-m4u7nvwt10");
    var boyLine = document.getElementById("comp-m4u7nvwv1");
    var boyMesh = document.querySelector(
      "[data-mesh-id='comp-m4u7nvwr8inlineContent-gridContainer']"
    );
    if (boyImage && boyLine && boyMesh && boyImage.nextElementSibling !== boyLine) {
      storeConsultationReadingRestorePoint(boyImage);
      boyMesh.insertBefore(boyImage, boyLine);
      boyImage.classList.add("tp-consultation-reading-image");
      resetWixMotionEnter(boyImage);
    }
    if (boyLine) boyLine.classList.add("tp-consultation-reading-line");

    var girlImage = document.getElementById("comp-m4u7unhi");
    var girlLine = document.getElementById("comp-m4u7unhj1");
    var girlMesh = document.querySelector(
      "[data-mesh-id='comp-m4u7unhf7inlineContent-gridContainer']"
    );
    if (girlImage && girlLine && girlMesh && girlImage.nextElementSibling !== girlLine) {
      storeConsultationReadingRestorePoint(girlImage);
      girlMesh.insertBefore(girlImage, girlLine);
      girlImage.classList.add("tp-consultation-reading-image");
      resetWixMotionEnter(girlImage);
    }
    if (girlLine) girlLine.classList.add("tp-consultation-reading-line");

    var teachingImage = document.getElementById("comp-m4u7wneb6");
    var teachingLine = document.getElementById("comp-m4u7wnec15");
    var teachingMesh = document.querySelector(
      "[data-mesh-id='comp-m4u7wne92inlineContent-gridContainer']"
    );
    if (
      teachingImage &&
      teachingLine &&
      teachingMesh &&
      teachingImage.nextElementSibling !== teachingLine
    ) {
      storeConsultationReadingRestorePoint(teachingImage);
      teachingMesh.insertBefore(teachingImage, teachingLine);
      teachingImage.classList.add("tp-consultation-reading-image");
      resetWixMotionEnter(teachingImage);
    }
    if (teachingLine) teachingLine.classList.add("tp-consultation-reading-line");

    var parentalImage = document.getElementById("comp-m4u7x79g1");
    var parentalLine = document.getElementById("comp-m4u7x79h4");
    var parentalMesh = document.querySelector(
      "[data-mesh-id='comp-m4u7x79d8inlineContent-gridContainer']"
    );
    if (
      parentalImage &&
      parentalLine &&
      parentalMesh &&
      parentalImage.nextElementSibling !== parentalLine
    ) {
      storeConsultationReadingRestorePoint(parentalImage);
      parentalMesh.insertBefore(parentalImage, parentalLine);
      parentalImage.classList.add("tp-consultation-reading-image");
      resetWixMotionEnter(parentalImage);
    }
    if (parentalLine) parentalLine.classList.add("tp-consultation-reading-line");

    var eligibilityImage = document.getElementById("comp-m4u7xt0v2");
    var eligibilityLine = document.getElementById("comp-m4u7xt0w9");
    var eligibilityMesh = document.querySelector(
      "[data-mesh-id='comp-m4u7xt0s8inlineContent-gridContainer']"
    );
    if (
      eligibilityImage &&
      eligibilityLine &&
      eligibilityMesh &&
      eligibilityImage.nextElementSibling !== eligibilityLine
    ) {
      storeConsultationReadingRestorePoint(eligibilityImage);
      eligibilityMesh.insertBefore(eligibilityImage, eligibilityLine);
      eligibilityImage.classList.add("tp-consultation-reading-image");
      resetWixMotionEnter(eligibilityImage);
    }
    if (eligibilityLine) eligibilityLine.classList.add("tp-consultation-reading-line");

    page.dataset.tpConsultationReadingLayoutPatched = "true";
  }

  function restoreConsultationReadingProgramLayout() {
    var page = document.getElementById("yb9d1");
    if (!page || page.dataset.tpConsultationReadingLayoutPatched !== "true") return;

    restoreConsultationReadingElement(document.getElementById("comp-m4u7nvwt10"));
    restoreConsultationReadingElement(document.getElementById("comp-m4u7unhi"));
    restoreConsultationReadingElement(document.getElementById("comp-m4u7wneb6"));
    restoreConsultationReadingElement(document.getElementById("comp-m4u7x79g1"));
    restoreConsultationReadingElement(document.getElementById("comp-m4u7xt0v2"));

    var boyLine = document.getElementById("comp-m4u7nvwv1");
    var girlLine = document.getElementById("comp-m4u7unhj1");
    var teachingLine = document.getElementById("comp-m4u7wnec15");
    var parentalLine = document.getElementById("comp-m4u7x79h4");
    var eligibilityLine = document.getElementById("comp-m4u7xt0w9");
    if (boyLine) boyLine.classList.remove("tp-consultation-reading-line");
    if (girlLine) girlLine.classList.remove("tp-consultation-reading-line");
    if (teachingLine) teachingLine.classList.remove("tp-consultation-reading-line");
    if (parentalLine) parentalLine.classList.remove("tp-consultation-reading-line");
    if (eligibilityLine) eligibilityLine.classList.remove("tp-consultation-reading-line");

    delete page.dataset.tpConsultationReadingLayoutPatched;
  }

  function initSpecializationsSectionLayouts() {
    if (!isMobileViewport()) return;

    var page = document.getElementById("rdv5s");
    if (!page || page.dataset.tpSpecializationsSectionLayoutsPatched === "true") return;

    var brainImage = document.getElementById("comp-m4u9qh0j1");
    var brainLine = document.getElementById("comp-m4u9qh0f8");
    var brainMesh = document.querySelector(
      "[data-mesh-id='comp-m4u9qh0d7inlineContent-gridContainer']"
    );
    if (brainImage && brainLine && brainMesh && brainImage.nextElementSibling !== brainLine) {
      storeConsultationReadingRestorePoint(brainImage);
      brainMesh.insertBefore(brainImage, brainLine);
      resetWixMotionEnter(brainImage);
    }

    var learningImage = document.getElementById("comp-m4u9qh0p1");
    var learningParagraph = document.getElementById("comp-m4u9qh0r");
    var learningMesh = document.querySelector(
      "[data-mesh-id='comp-m4u9qh0n4inlineContent-gridContainer']"
    );
    if (
      learningImage &&
      learningParagraph &&
      learningMesh &&
      learningImage.previousElementSibling !== learningParagraph
    ) {
      storeConsultationReadingRestorePoint(learningImage);
      var learningAnchor = learningParagraph.nextElementSibling;
      if (learningAnchor && learningAnchor.parentElement === learningMesh) {
        learningMesh.insertBefore(learningImage, learningAnchor);
      } else {
        learningMesh.appendChild(learningImage);
      }
      resetWixMotionEnter(learningImage);
    }

    var strokeImage = document.getElementById("comp-m4u9qh0y16");
    var strokeLine = document.getElementById("comp-m4u9qh0x8");
    var strokeMesh = document.querySelector(
      "[data-mesh-id='comp-m4u9qh0v7inlineContent-gridContainer']"
    );
    if (strokeImage && strokeLine && strokeMesh && strokeImage.nextElementSibling !== strokeLine) {
      storeConsultationReadingRestorePoint(strokeImage);
      strokeMesh.insertBefore(strokeImage, strokeLine);
      resetWixMotionEnter(strokeImage);
    }

    page.dataset.tpSpecializationsSectionLayoutsPatched = "true";
  }

  function restoreSpecializationsSectionLayouts() {
    var page = document.getElementById("rdv5s");
    if (!page || page.dataset.tpSpecializationsSectionLayoutsPatched !== "true") return;

    restoreConsultationReadingElement(document.getElementById("comp-m4u9qh0j1"));
    restoreConsultationReadingElement(document.getElementById("comp-m4u9qh0p1"));
    restoreConsultationReadingElement(document.getElementById("comp-m4u9qh0y16"));
    delete page.dataset.tpSpecializationsSectionLayoutsPatched;
  }

  function initOurTeamJoinBenefitsLayout() {
    if (!isMobileViewport()) return;

    var page = document.getElementById("n1sxe");
    if (!page || page.dataset.tpOurTeamJoinBenefitsPatched === "true") return;

    var line = document.getElementById("comp-m6i5pxgq");
    var jobList = document.getElementById("comp-m4uaf2y911");
    var mesh = document.querySelector(
      "[data-mesh-id='comp-m4uaf2y59inlineContent-gridContainer']"
    );

    if (line && jobList && mesh && line.previousElementSibling !== jobList) {
      storeConsultationReadingRestorePoint(line);
      var anchor = jobList.nextElementSibling;
      if (anchor && anchor.parentElement === mesh) {
        mesh.insertBefore(line, anchor);
      } else {
        mesh.insertBefore(line, jobList.nextSibling);
      }
    }

    if (line) line.classList.add("tp-our-team-join-line");

    page.dataset.tpOurTeamJoinBenefitsPatched = "true";
  }

  function restoreOurTeamJoinBenefitsLayout() {
    var page = document.getElementById("n1sxe");
    if (!page || page.dataset.tpOurTeamJoinBenefitsPatched !== "true") return;

    var line = document.getElementById("comp-m6i5pxgq");
    restoreConsultationReadingElement(line);
    if (line) line.classList.remove("tp-our-team-join-line");

    delete page.dataset.tpOurTeamJoinBenefitsPatched;
  }

  function initConsultationSnakeInline() {
    if (!isMobileViewport()) return;

    var page = document.getElementById("yb9d1");
    if (!page || page.dataset.tpSnakeInlinePatched === "true") return;

    var textBlock = document.getElementById("comp-m4u7wneb");
    var snake = document.getElementById("comp-m4ugyjbc");
    if (!textBlock || !snake) return;

    var targetP = null;
    textBlock.querySelectorAll("p").forEach(function (para) {
      if (/resembles|ressemble/i.test(para.textContent) && /nake/i.test(para.textContent)) {
        targetP = para;
      }
    });
    if (!targetP || targetP.querySelector(".tp-snake-inline-anchor")) return;

    targetP.dataset.tpSnakeOriginalHtml = targetP.innerHTML;
    targetP.innerHTML = targetP.innerHTML.replace(
      /(resembles|ressemble)((?:\s|&nbsp;|\u00a0|\u202f)+)(?=nake)/i,
      '$1 <span class="tp-snake-inline-anchor"></span>'
    );

    var anchor = targetP.querySelector(".tp-snake-inline-anchor");
    if (!anchor) {
      delete targetP.dataset.tpSnakeOriginalHtml;
      return;
    }

    storeConsultationReadingRestorePoint(snake);
    snake.classList.add("tp-snake-inline-image");
    anchor.appendChild(snake);
    resetWixMotionEnter(snake);
    page.dataset.tpSnakeInlinePatched = "true";
  }

  function restoreConsultationSnakeInline() {
    var page = document.getElementById("yb9d1");
    if (!page || page.dataset.tpSnakeInlinePatched !== "true") return;

    restoreConsultationReadingElement(document.getElementById("comp-m4ugyjbc"));

    var textBlock = document.getElementById("comp-m4u7wneb");
    if (textBlock) {
      textBlock.querySelectorAll("p").forEach(function (para) {
        if (para.dataset.tpSnakeOriginalHtml) {
          para.innerHTML = para.dataset.tpSnakeOriginalHtml;
          delete para.dataset.tpSnakeOriginalHtml;
        }
      });
    }

    delete page.dataset.tpSnakeInlinePatched;
  }

  function initConsultationCardButtons() {
    document
      .querySelectorAll('[id^="comp-m6awikg0__"] a[href*="therapy.html"]')
      .forEach(function (link) {
        if (!link.getAttribute("aria-label")) {
          link.setAttribute("aria-label", "Learn more about language therapy services");
        }
        link.addEventListener(
          "click",
          function (event) {
            var href = link.getAttribute("href");
            if (!href) return;
            event.preventDefault();
            event.stopImmediatePropagation();
            window.location.assign(href);
          },
          true
        );
      });
  }

  function initMobileNavigation() {
    if (!isMobileViewport()) return;

    var header = document.getElementById("SITE_HEADER");
    var desktopNav = document.getElementById("comp-m4ufk180");
    if (!header) return;
    if (header.querySelector(".tp-mobile-nav")) {
      notifyMobileNavReady();
      return;
    }
    if (!desktopNav) {
      window.setTimeout(initMobileNavigation, 250);
      return;
    }

    var isFrench = isFrenchPage();
    var menu = isFrench ? getFrenchMobileMenu() : getEnglishMobileMenu();
    var headerRow = initMobileHeaderRow(header, isFrench);
    var nav = document.createElement("nav");
    nav.className = "tp-mobile-nav";
    nav.setAttribute("aria-label", isFrench ? "Navigation mobile" : "Mobile navigation");
    nav.innerHTML =
      '<button type="button" class="tp-mobile-nav__toggle" aria-expanded="false">' +
      '<span class="tp-mobile-nav__bars" aria-hidden="true"></span>' +
      '<span class="tp-mobile-nav__label">' +
      (isFrench ? "Menu" : "Menu") +
      "</span>" +
      "</button>" +
      '<div class="tp-mobile-nav__panel" hidden>' +
      '<div class="tp-mobile-nav__login" aria-hidden="true"><span></span>Log In</div>' +
      '<button type="button" class="tp-mobile-nav__close" aria-label="Close menu">&times;</button>' +
      '<div class="tp-mobile-nav__items"></div>' +
      '<div class="tp-mobile-nav__language"></div>' +
      "</div>";

    var panel = nav.querySelector(".tp-mobile-nav__panel");
    var itemsRoot = nav.querySelector(".tp-mobile-nav__items");
    var languageRoot = nav.querySelector(".tp-mobile-nav__language");

    menu.forEach(function (item) {
      itemsRoot.appendChild(buildMobileMenuItem(item));
    });
    languageRoot.appendChild(buildMobileLanguageSwitch(isFrench));

    initMobileHeaderAppointment(headerRow, isFrench);
    headerRow.appendChild(nav);
    initMobileHeaderContactBar(header);

    desktopNav.setAttribute("aria-hidden", "true");
    desktopNav.querySelectorAll("a[href]").forEach(function (anchor) {
      anchor.setAttribute("tabindex", "-1");
    });

    var toggle = nav.querySelector(".tp-mobile-nav__toggle");
    var close = nav.querySelector(".tp-mobile-nav__close");

    function closeMenu() {
      closeMobileNavMenu(nav);
    }

    function openMenu() {
      nav.classList.add("is-open");
      document.body.classList.add("tp-mobile-nav-open");
      toggle.setAttribute("aria-expanded", "true");
      panel.hidden = false;
      if (panel.parentNode !== document.body) {
        document.body.appendChild(panel);
      }
      syncMobileMenuFromDesktop();
    }

    initMobileNavTouchGuard(panel);

    nav.querySelectorAll(".tp-mobile-nav__section-toggle").forEach(function (button) {
      button.addEventListener("click", function (event) {
        if (shouldSuppressMobileNavClick()) {
          event.preventDefault();
          event.stopPropagation();
          return;
        }
        event.stopPropagation();
        var expanded = button.getAttribute("aria-expanded") === "true";
        var group = document.getElementById(button.getAttribute("aria-controls"));
        button.setAttribute("aria-expanded", expanded ? "false" : "true");
        if (group) group.hidden = expanded;
      });
    });

    toggle.addEventListener("click", function (event) {
      event.stopPropagation();
      if (panel.hidden) openMenu();
      else closeMenu();
    });

    close.addEventListener("click", closeMenu);

    panel.addEventListener("click", function (event) {
      if (shouldSuppressMobileNavClick()) {
        event.preventDefault();
        return;
      }
      if (event.target.closest("a[href]")) closeMenu();
    });

    document.addEventListener("click", function (event) {
      if (!nav.classList.contains("is-open")) return;
      if (nav.contains(event.target) || panel.contains(event.target)) return;
      closeMenu();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeMenu();
    });

    syncMobileMenuFromDesktop();
    notifyMobileNavReady();
  }

  function buildMobileMenuItem(item) {
    var wrapper = document.createElement("div");
    wrapper.className = "tp-mobile-nav__item";

    if (!item.children || !item.children.length) {
      var link = document.createElement("a");
      link.className = "tp-mobile-nav__link";
      link.href = item.href;
      link.textContent = item.label;
      bindMobileNavLink(link);
      wrapper.appendChild(link);
      return wrapper;
    }

    var id = "tp-mobile-menu-" + item.label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    var row = document.createElement("div");
    row.className = "tp-mobile-nav__section";

    var main = document.createElement("a");
    main.className = "tp-mobile-nav__link";
    main.href = item.href;
    main.textContent = item.label;
    bindMobileNavLink(main);
    row.appendChild(main);

    var toggle = document.createElement("button");
    toggle.type = "button";
    toggle.className = "tp-mobile-nav__section-toggle";
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-controls", id);
    toggle.setAttribute("aria-label", "Toggle " + item.label + " submenu");
    toggle.textContent = "v";
    row.appendChild(toggle);
    wrapper.appendChild(row);

    var group = document.createElement("div");
    group.className = "tp-mobile-nav__subitems";
    group.id = id;
    group.hidden = true;
    item.children.forEach(function (child) {
      var childLink = document.createElement("a");
      childLink.className = "tp-mobile-nav__sublink";
      childLink.setAttribute("href", child.href);
      childLink.textContent = child.label;
      bindMobileNavLink(childLink);
      group.appendChild(childLink);
    });
    wrapper.appendChild(group);
    return wrapper;
  }

  function buildMobileLanguageSwitch(isFrench) {
    var urls = getLanguageUrls();
    var link = document.createElement("a");
    link.className = "tp-mobile-nav__lang-link";
    link.href = isFrench ? urls.en : urls.fr;
    link.innerHTML =
      '<img class="tp-lang-flag" src="' +
      CA_FLAG +
      '" alt="" width="22" height="22" />' +
      '<span>' +
      (isFrench ? "FR" : "EN") +
      "</span>" +
      '<span aria-hidden="true">v</span>';
    bindMobileNavLink(link);
    return link;
  }

  function initMobileHeaderContactBar(header) {
    if (header.querySelector(".tp-mobile-contact-bar")) return;
    var bar = document.createElement("div");
    bar.className = "tp-mobile-contact-bar";

    var emailLink = document.createElement("a");
    emailLink.className = "tp-mobile-contact-bar__email";
    emailLink.href = "mailto:services@therapypath.com";
    emailLink.innerHTML =
      '<span aria-hidden="true">&#9993;</span> services@therapypath.com';

    var phoneLink = document.createElement("a");
    phoneLink.className = "tp-mobile-contact-bar__phone";
    phoneLink.href = "tel:+17053638871";
    phoneLink.innerHTML = '<span aria-hidden="true">&#9742;</span> 705-363-8871';

    bar.appendChild(emailLink);
    bar.appendChild(phoneLink);
    header.appendChild(bar);

    bar.querySelectorAll("a[href]").forEach(function (link) {
      link.addEventListener(
        "click",
        function (event) {
          var href = link.getAttribute("href");
          if (!href) return;
          event.preventDefault();
          event.stopImmediatePropagation();
          window.location.href = href;
        },
        true
      );
    });
  }

  function initMobileHeaderAppointment(header, isFrench) {
    if (header.querySelector(".tp-mobile-appointment")) return;
    var link = document.createElement("a");
    link.className = "tp-mobile-appointment";
    link.href = "https://theramatic.ca/request-appointment/the-therapy-path";
    link.textContent = isFrench ? "Prendre rendez-vous" : "Book an Appointment";
    header.appendChild(link);
  }

  function initMobileHeaderRow(header, isFrench) {
    var existing = header.querySelector(".tp-mobile-header-row");
    if (existing) return existing;

    var row = document.createElement("div");
    row.className = "tp-mobile-header-row";

    var logoLink = document.createElement("a");
    logoLink.className = "tp-mobile-header-logo";
    logoLink.href = getHomepageUrl();

    var logo = document.createElement("img");
    logo.src = "/images/opt/therapy-path-header-logo-286w.webp";
    logo.srcset =
      "/images/opt/therapy-path-header-logo-143w.webp 1x, /images/opt/therapy-path-header-logo-286w.webp 2x";
    logo.alt = "The Therapy Path";
    logo.width = 104;
    logo.height = 104;
    logoLink.appendChild(logo);
    row.appendChild(logoLink);

    logoLink.addEventListener(
      "click",
      function (event) {
        var homeUrl = getHomepageUrl();
        event.preventDefault();
        event.stopPropagation();
        window.location.href = homeUrl;
      },
      true
    );

    header.appendChild(row);
    return row;
  }

  function getEnglishMobileMenu() {
    return [
      { label: "Home", href: "/" },
      {
        label: "Services",
        href: "/services/assessments.html",
        children: [
          { label: "Assessments", href: "/services/assessments.html" },
          { label: "Consultations/Workshops", href: "/services/consultations-workshops-reading-groups.html" },
          { label: "Therapy", href: "/services/therapy.html" },
          { label: "Speech", href: "/services/therapy.html#anchors-m4u9ygef6" },
          { label: "Language", href: "/services/therapy.html#anchors-m4u9yger9" },
          { label: "Assistive devices", href: "/services/therapy.html#anchors-m4u9ygfe4" },
          { label: "Reading Groups", href: "/services/consultations-workshops-reading-groups.html#anchors-m4u7nvwq6" },
        ],
      },
      {
        label: "Products",
        href: "/services/clinical-management-software.html",
        children: [
          { label: "Clinical Management Software", href: "/services/clinical-management-software.html" },
          { label: "Click Reader", href: "/services/clinical-management-software.html#comp-m4wzb8lj6" },
        ],
      },
      {
        label: "About Us",
        href: "/about-us/our-team.html",
        children: [
          { label: "Geographical Coverage", href: "/about-us/geographical-coverage.html" },
          { label: "Our Accomplishments", href: "/about-us/our-accomplishments.html" },
          { label: "Our Team", href: "/about-us/our-team.html" },
          { label: "Join Our Team", href: "/about-us/our-team.html#anchors-m4uaf2y410" },
          { label: "Our Specializations", href: "/about-us/our-specializations.html" },
          { label: "Brain Injury", href: "/about-us/our-specializations.html#anchors-m4u9qh0c" },
          { label: "Learning Disabilities", href: "/about-us/our-specializations.html#anchors-m4u9qh0m1" },
          { label: "Stroke", href: "/about-us/our-specializations.html#anchors-m4u9qh0u6" },
        ],
      },
      {
        label: "Contact Us",
        href: "/contact-us.html",
        children: [
          { label: "Contact Us", href: "/contact-us.html" },
          { label: "Fees", href: "/contact-us.html#comp-m4uec27w1" },
        ],
      },
      { label: "Book Online", href: "/book-online.html" },
    ];
  }

  function getFrenchMobileMenu() {
    return [
      { label: "Accueil", href: "/fr.html" },
      {
        label: "Services",
        href: "/fr/services/assessments.html",
        children: [
          { label: "Evaluations", href: "/fr/services/assessments.html" },
          { label: "Consultations/Ateliers", href: "/fr/services/consultations-workshops-reading-groups.html" },
          { label: "Therapie", href: "/fr/services/therapy.html" },
          { label: "Parole", href: "/fr/services/therapy.html#anchors-m4u9ygef6" },
          { label: "Langage", href: "/fr/services/therapy.html#anchors-m4u9yger9" },
          { label: "Appareils fonctionnels", href: "/fr/services/therapy.html#anchors-m4u9ygfe4" },
          { label: "Groupes de lecture", href: "/fr/services/consultations-workshops-reading-groups.html#anchors-m4u7nvwq6" },
        ],
      },
      {
        label: "Produits",
        href: "/fr/services/clinical-management-software.html",
        children: [
          { label: "Logiciel de gestion clinique", href: "/fr/services/clinical-management-software.html" },
          { label: "Click Reader", href: "/fr/services/clinical-management-software.html#comp-m4wzb8lj6" },
        ],
      },
      {
        label: "A propos de nous",
        href: "/fr/about-us/our-team.html",
        children: [
          { label: "Couverture geographique", href: "/fr/about-us/geographical-coverage.html" },
          { label: "Nos realisations", href: "/fr/about-us/our-accomplishments.html" },
          { label: "Notre equipe", href: "/fr/about-us/our-team.html" },
          { label: "Rejoignez notre equipe", href: "/fr/about-us/our-team.html#anchors-m4uaf2y410" },
          { label: "Nos specialisations", href: "/fr/about-us/our-specializations.html" },
          { label: "Lesion cerebrale", href: "/fr/about-us/our-specializations.html#anchors-m4u9qh0c" },
          { label: "Troubles d'apprentissage", href: "/fr/about-us/our-specializations.html#anchors-m4u9qh0m1" },
          { label: "Accident vasculaire cerebral", href: "/fr/about-us/our-specializations.html#anchors-m4u9qh0u6" },
        ],
      },
      {
        label: "Contactez nous",
        href: "/fr/contact-us.html",
        children: [
          { label: "Contactez nous", href: "/fr/contact-us.html" },
          { label: "Frais", href: "/fr/contact-us.html#comp-m4uec27w1" },
        ],
      },
      { label: "Reservez en ligne", href: "/fr/book-online.html" },
    ];
  }

  function initHomeMobileTemplate() {
    if (!isMobileViewport()) return;

    var path = window.location.pathname.toLowerCase();
    var isEnglishHome =
      path === "/" || path === "/index.html" || path === "/index";
    if (!isEnglishHome || isFrenchPage()) return;

    var sitePages = document.getElementById("SITE_PAGES");
    if (!sitePages) return;
    if (sitePages.querySelector(".tp-mobile-home")) {
      document.documentElement.classList.add("tp-home-mobile-template-page");
      document.body.classList.add("tp-home-mobile-template-page");
      notifyMobileSiteShellReady();
      return;
    }

    document.documentElement.classList.add("tp-home-mobile-template-page");
    document.body.classList.add("tp-home-mobile-template-page");

    var home = document.createElement("main");
    home.className = "tp-mobile-home";
    home.setAttribute("aria-label", "The Therapy Path home page");
    home.innerHTML =
      '<section class="tp-home-hero">' +
      '<div class="tp-home-hero__copy">' +
      '<h1>Your Journey to Improved Communication Starts Here</h1>' +
      '<p>Covering most areas from North Bay to Hearst.</p>' +
      "</div>" +
      "</section>" +
      '<section class="tp-home-intro">' +
      '<p class="tp-home-intro__tagline">Together, we can pave the way for a brighter future filled with clear communication.</p>' +
      '<p>Welcome to The Therapy Path. We proudly provide compassionate and effective speech-language therapy services tailored to each individual&apos;s unique needs across Northern Ontario.</p>' +
      '<p>Our dedicated team of experienced Speech-Language Pathologists (SLPs) and Assistants are here to support you or your loved ones. Let us guide you on the journey to improved communication and literacy skills, fostering growth and connection in every community we serve.</p>' +
      "</section>" +
      '<section class="tp-home-help" aria-labelledby="tp-home-help-title">' +
      '<h2 id="tp-home-help-title">How We Can Help You</h2>' +
      '<div class="tp-home-feature-card">' +
      '<img src="/images/opt/assessment-speech-service-864w.webp" alt="Speech-language assessment session" loading="lazy" />' +
      '<div class="tp-home-feature-card__body">' +
      '<h3>Comprehensive Speech and Language Assessments</h3>' +
      '<p>Discover how our assessments identify strengths and guide our therapy targets.</p>' +
      '<a href="/services/assessments.html" aria-label="Learn more about assessments">&rsaquo;</a>' +
      "</div>" +
      "</div>" +
      '<div class="tp-home-feature-card">' +
      '<img src="/images/opt/adobestock_363566581-864w.webp" alt="Therapy session with a child" loading="lazy" />' +
      '<div class="tp-home-feature-card__body">' +
      '<h3>Comprehensive Therapy Services</h3>' +
      '<p>Discover how our tailored therapy enhances communication.</p>' +
      '<a href="/services/therapy.html" aria-label="Learn more about therapy services">&rsaquo;</a>' +
      "</div>" +
      "</div>" +
      "</section>" +
      '<section class="tp-home-services" aria-labelledby="tp-home-services-title">' +
      '<h2 id="tp-home-services-title">Our Services</h2>' +
      '<p>We offer a variety of specialized services designed to address diverse communication needs:</p>' +
      '<div class="tp-home-service-list">' +
      buildHomeServiceCard("Speech Therapy", "Tailored interventions to improve articulation, fluency, and overall speech clarity.", "/services/therapy.html#anchors-m4u9ygef6") +
      buildHomeServiceCard("Language Therapy", "Support for language comprehension and expression, helping individuals communicate effectively.", "/services/therapy.html#anchors-m4u9yger9") +
      buildHomeServiceCard("Reading Therapy", "A research-supported approach focusing on teaching reading fundamentals to non-readers and at-risk children, fostering a love for literacy.", "/services/consultations-workshops-reading-groups.html") +
      buildHomeServiceCard("Consultation Services", "Professional guidance for families and educators on best practices to support communication.", "/services/consultations-workshops-reading-groups.html") +
      buildHomeServiceCard("Presentations", "Educational workshops for parents, teachers, and community members on speech and language development.", "/services/consultations-workshops-reading-groups.html") +
      buildHomeServiceCard("Assistive Devices", "Recommendations and training on the use of assistive technology to enhance communication.", "/services/therapy.html#anchors-m4u9ygfe4") +
      "</div>" +
      "</section>" +
      '<section class="tp-home-rapid">' +
      '<img src="/images/opt/ba2cd3_ce429fe317704238b6b68ffe39659f77-1076w.webp" alt="Child reading a book" loading="lazy" />' +
      '<div class="tp-home-rapid__card">' +
      '<h2>Rapid Response</h2>' +
      '<p>We understand that timely intervention is critical. That&apos;s why we strive to see new clients within two weeks of referral, ensuring that you receive the support you need without unnecessary delays.</p>' +
      '<p>Whether you are seeking help for yourself or a loved one, we invite you to explore our services and discover how we can make a difference in your life.</p>' +
      '<a class="tp-home-button" href="https://theramatic.ca/request-appointment/the-therapy-path">Schedule an Appointment</a>' +
      "</div>" +
      "</section>" +
      '<section class="tp-home-booking" aria-labelledby="tp-home-booking-title">' +
      '<h2 id="tp-home-booking-title">Book Online</h2>' +
      '<div class="tp-home-booking-list">' +
      buildHomeBookingCard("Speech & Language Assessment with report", "Select your preferred SLP to complete the assessment", "1 hr 30 min", "$990", "/booking-calendar/speech-language-assessment-with-report.html", "/images/opt/5353ca_b05e9a98bc264a0480d92a702e808975-864w.webp") +
      buildHomeBookingCard("45 minute Virtual SLP Therapy", "Virtual speech-language therapy session.", "45 min", "$123.75", "/booking-calendar/45-minute-virtual-slp-therapy.html", "/images/opt/dda575_7d642f34c3524555a2dabdd59ecd1e3f-800w.webp") +
      buildHomeBookingCard("1 hour Virtual SLP Therapy", "Virtual speech-language therapy session.", "1 hr", "$165", "/booking-calendar/1-hour-virtual-slp-therapy.html", "/images/opt/dda575_098fc47f424e46909702a5d5dd49f04f-1600w.webp") +
      "</div>" +
      "</section>";

    sitePages.insertBefore(home, sitePages.firstChild);
    notifyMobileSiteShellReady();
  }

  function getMobileFooterHtml(isFrench) {
    var areas =
      "<li>North Bay</li>" +
      "<li>Iroquois Falls</li>" +
      "<li>Timmins</li>" +
      "<li>Kapuskasing</li>" +
      "<li>New Liskeard</li>" +
      "<li>Hearst</li>" +
      "<li>Kirkland Lake</li>" +
      "<li>James Bay Coast</li>" +
      "<li>Cochrane</li>";

    if (isFrench) {
      return (
        '<div class="tp-mobile-footer__panel">' +
        '<img class="tp-mobile-footer__logo" src="/images/opt/ba2cd3_501a358c30d1498d855bbdeacb20d2ae-620w.webp" alt="The Therapy Path" width="220" height="222" loading="lazy" />' +
        '<section class="tp-mobile-footer__block" aria-labelledby="tp-mobile-footer-contact">' +
        '<h2 id="tp-mobile-footer-contact">Coordonn&eacute;es</h2>' +
        "<p>117, rue Kay Crescent<br>Timmins (Ontario) P4N 8A9</p>" +
        '<p><a href="tel:705-363-8871">705-363-8871</a></p>' +
        '<p><a href="mailto:jstark@therapypath.com">jstark@therapypath.com</a></p>' +
        '<p><a href="mailto:services@therapypath.com">services@therapypath.com</a></p>' +
        "</section>" +
        '<section class="tp-mobile-footer__block" aria-labelledby="tp-mobile-footer-hours">' +
        '<h2 id="tp-mobile-footer-hours">Heures</h2>' +
        "<p>Lundi &ndash; vendredi : 8 h 30 &ndash; 16 h 30</p>" +
        "<p>Samedi : Ferm&eacute;</p>" +
        "<p>Dimanche : Ferm&eacute;</p>" +
        "</section>" +
        '<section class="tp-mobile-footer__block" aria-labelledby="tp-mobile-footer-areas">' +
        '<h2 id="tp-mobile-footer-areas">Zone de service</h2>' +
        '<ul class="tp-mobile-footer__areas">' +
        areas +
        "</ul>" +
        "</section>" +
        "</div>"
      );
    }

    return (
      '<div class="tp-mobile-footer__panel">' +
      '<img class="tp-mobile-footer__logo" src="/images/opt/ba2cd3_501a358c30d1498d855bbdeacb20d2ae-620w.webp" alt="The Therapy Path" width="220" height="222" loading="lazy" />' +
      '<section class="tp-mobile-footer__block" aria-labelledby="tp-mobile-footer-contact">' +
      '<h2 id="tp-mobile-footer-contact">Contact Info</h2>' +
      "<p>117 Kay Crescent<br>Timmins, ON P4N 8A9</p>" +
      '<p><a href="tel:705-363-8871">705-363-8871</a></p>' +
      '<p><a href="mailto:jstark@therapypath.com">jstark@therapypath.com</a></p>' +
      '<p><a href="mailto:services@therapypath.com">services@therapypath.com</a></p>' +
      "</section>" +
      '<section class="tp-mobile-footer__block" aria-labelledby="tp-mobile-footer-hours">' +
      '<h2 id="tp-mobile-footer-hours">Hours</h2>' +
      "<p>Monday &ndash; Friday: 8:30 AM &ndash; 4:30 PM</p>" +
      "<p>Saturday: Closed</p>" +
      "<p>Sunday: Closed</p>" +
      "</section>" +
      '<section class="tp-mobile-footer__block" aria-labelledby="tp-mobile-footer-areas">' +
      '<h2 id="tp-mobile-footer-areas">Service Area</h2>' +
      '<ul class="tp-mobile-footer__areas">' +
      areas +
      "</ul>" +
      "</section>" +
      "</div>"
    );
  }

  function initMobileFooter() {
    if (!isMobileViewport()) return;
    var footer = document.getElementById("SITE_FOOTER");
    var grid = footer && footer.querySelector("[data-mesh-id='SITE_FOOTERinlineContent-gridContainer']");
    if (!grid || grid.querySelector(".tp-mobile-footer")) return;

    var isFrench = isFrenchPage();
    var mobileFooter = document.createElement("div");
    mobileFooter.className = "tp-mobile-footer";
    mobileFooter.setAttribute("aria-label", isFrench ? "Pied de page" : "Site footer");
    mobileFooter.innerHTML = getMobileFooterHtml(isFrench);
    grid.insertBefore(mobileFooter, grid.firstChild);

    var wixFooter = document.getElementById("comp-m221xy5q");
    if (wixFooter) wixFooter.setAttribute("aria-hidden", "true");
  }

  function getActiveSitePage() {
    var pages = document.getElementById("SITE_PAGES");
    if (!pages) return null;

    var children = pages.children;
    for (var i = 0; i < children.length; i++) {
      var child = children[i];
      if (child.classList && child.classList.contains("tp-mobile-home")) continue;
      var style = window.getComputedStyle(child);
      if (style.display !== "none" && style.visibility !== "hidden") return child;
    }

    return pages.firstElementChild;
  }

  function initMobilePageHero() {
    if (!isMobileViewport()) return;
    if (
      document.documentElement.classList.contains("tp-home-mobile-template-page") ||
      document.body.classList.contains("tp-home-mobile-template-page")
    ) {
      return;
    }

    var page = getActiveSitePage();
    if (!page) return;

    var currentHero = page.querySelector(".tp-mobile-page-hero");
    if (currentHero) {
      tuneScopedMobileHero(page, currentHero);
      return;
    }

    var heroImages = page.querySelectorAll("wow-image.bgImage, wow-image[class*='bgImage']");
    var heroImage = null;
    for (var i = 0; i < heroImages.length; i++) {
      var candidate = heroImages[i];
      if (candidate.id && candidate.id.indexOf("pageBackground") !== -1) continue;
      if (candidate.closest("#comp-m6aya1jg")) continue;
      heroImage = candidate;
      break;
    }
    if (!heroImage) return;

    var section = heroImage.closest("section");
    if (!section) return;

    section.classList.add("tp-mobile-page-hero");
    tuneScopedMobileHero(page, section);

    section.querySelectorAll("[data-testid='colorUnderlay']").forEach(function (underlay) {
      underlay.setAttribute("data-tp-mobile-hero-hidden", "true");
    });

    section.querySelectorAll(".wixui-vector-image").forEach(function (graphic) {
      if (!graphic.closest(".tp-mobile-page-hero__copy")) {
        graphic.setAttribute("data-tp-mobile-hero-hidden", "true");
      }
    });

    var existingCopy = section.querySelector(".tp-mobile-page-hero__copy");
    if (existingCopy) {
      tuneScopedMobileHero(page, section, existingCopy);
      return;
    }

    var mesh = section.querySelector("[data-mesh-id$='gridContainer']");
    if (!mesh) return;

    var texts = [];
    mesh.querySelectorAll('[data-testid="richTextElement"]').forEach(function (el) {
      if (el.closest(".tp-mobile-page-hero__copy")) return;
      if (el.querySelector("h1, h2, p")) texts.push(el);
    });

    if (!texts.length) return;

    section.dataset.tpHeroTextIds = texts
      .map(function (el) {
        return el.id || "";
      })
      .filter(Boolean)
      .join(",");

    var copy = document.createElement("div");
    copy.className = "tp-mobile-page-hero__copy";
    mesh.insertBefore(copy, texts[0]);
    texts.forEach(function (el) {
      copy.appendChild(el);
      resetHeroTextMotion(el);
    });
    tuneScopedMobileHero(page, section, copy);
  }

  function tuneScopedMobileHero(page, section, copy) {
    if (!page || !section) return;
    var scopedPage = section.closest("#zbyrt, #qpnc0, #hwr7r, #yb9d1, #n1sxe, #rdv5s, #vwdio") || page;
    if (!/^(zbyrt|qpnc0|hwr7r|yb9d1|n1sxe|rdv5s|vwdio)$/.test(scopedPage.id || "")) return;

    section.style.setProperty("width", "100vw", "important");
    section.style.setProperty("max-width", "100vw", "important");
    section.style.setProperty("margin-left", "calc(50% - 50vw)", "important");
    section.style.setProperty("margin-right", "calc(50% - 50vw)", "important");

    section
      .querySelectorAll("[data-testid='columns'], [data-mesh-id$='gridContainer']")
      .forEach(function (node) {
        node.style.setProperty("padding-left", "0", "important");
        node.style.setProperty("padding-right", "0", "important");
      });

    var heroCopy = copy || section.querySelector(".tp-mobile-page-hero__copy");
    if (heroCopy) {
      if (scopedPage.id === "yb9d1") {
        heroCopy.style.setProperty("top", "11px", "important");
        heroCopy.style.setProperty("margin-top", "15px", "important");
      } else if (scopedPage.id === "qpnc0") {
        heroCopy.style.setProperty("top", "11px", "important");
        heroCopy.style.setProperty("margin-top", "15px", "important");
        heroCopy.style.setProperty("padding", "10px 12px 10px", "important");
      } else if (scopedPage.id === "hwr7r") {
        heroCopy.style.setProperty("top", "11px", "important");
        heroCopy.style.setProperty("margin-top", "15px", "important");
        heroCopy.style.setProperty("padding", "8px 12px 10px", "important");
      } else if (scopedPage.id === "n1sxe") {
        heroCopy.style.setProperty("top", "22px", "important");
        heroCopy.style.setProperty("margin-top", "30px", "important");
        heroCopy.style.setProperty("padding", "14px 12px 16px", "important");
      } else if (scopedPage.id === "rdv5s") {
        heroCopy.style.setProperty("top", "22px", "important");
        heroCopy.style.setProperty("margin-top", "30px", "important");
        heroCopy.style.setProperty("padding", "0 12px 18px", "important");
      } else if (scopedPage.id === "vwdio") {
        heroCopy.style.setProperty("top", "22px", "important");
        heroCopy.style.setProperty("margin-top", "6px", "important");
        heroCopy.style.setProperty("padding", "14px 12px 8px", "important");
      } else {
        heroCopy.style.setProperty("top", "22px", "important");
        heroCopy.style.setProperty("margin-top", "30px", "important");
      }
    }
  }

  function resetWixMotionEnter(root) {
    if (!root) return;
    var nodes = [root];
    if (root.querySelectorAll) {
      nodes = nodes.concat(Array.prototype.slice.call(root.querySelectorAll("*")));
    }
    nodes.forEach(function (node) {
      if (!node || !node.setAttribute) return;
      node.setAttribute("data-motion-enter", "done");
      node.setAttribute("data-tp-motion-reset", "true");
      if (node.style) {
        node.style.opacity = "1";
        node.style.animation = "none";
        node.style.transform = "none";
        node.style.webkitTransform = "none";
      }
    });
  }

  function clearTpMotionInlineStyles() {
    var sitePages = document.getElementById("SITE_PAGES");
    if (!sitePages) return;

    sitePages.querySelectorAll("[data-tp-motion-reset='true']").forEach(function (node) {
      if (node.style) {
        node.style.removeProperty("opacity");
        node.style.removeProperty("animation");
        node.style.removeProperty("transform");
        node.style.removeProperty("-webkit-transform");
        node.style.removeProperty("-webkit-mask-image");
        node.style.removeProperty("mask-image");
      }
      node.removeAttribute("data-tp-motion-reset");
      node.removeAttribute("data-motion-enter");
    });
  }

  function initAssessmentIntroCard() {
    if (!isMobileViewport()) return;

    var page = document.getElementById("zbyrt");
    if (!page) return;

    var title = document.getElementById("comp-m4uabnge8");
    var cardMesh = document.querySelector(
      "[data-mesh-id='comp-m677p2ds1__item1inlineContent-gridContainer']"
    );
    if (!title || !cardMesh) return;

    page.dataset.tpAssessmentIntroPatched = "true";

    if (cardMesh.contains(title)) return;

    title.classList.add("tp-assessment-intro__title");
    cardMesh.insertBefore(title, cardMesh.firstChild);
    resetWixMotionEnter(title);
  }

  function initAssessmentAppointmentImage() {
    if (!isMobileViewport()) return;

    var page = document.getElementById("zbyrt");
    if (!page || page.querySelector(".tp-assessment-appointment-image")) return;

    var appointmentButton =
      document.getElementById("comp-m6gkmrbp") ||
      Array.prototype.slice.call(page.querySelectorAll("a[href*='theramatic.ca/request-appointment']")).pop();
    if (!appointmentButton) return;

    var image = document.createElement("img");
    image.className = "tp-assessment-appointment-image";
    image.src = "/images/opt/assessment-computer-session.png";
    image.alt = "Clinician using a laptop during an assessment session";
    image.loading = "eager";
    image.decoding = "async";
    image.style.setProperty("width", "min(379px, calc(100vw - 48px))", "important");
    image.style.setProperty("max-width", "none", "important");
    image.style.setProperty("height", "auto", "important");
    image.style.setProperty("position", "relative", "important");
    image.style.setProperty("left", "calc(33.333% - 33.333vw)", "important");
    image.style.setProperty("transform", "none", "important");
    image.style.setProperty("margin", "18px 0 8px", "important");
    image.style.setProperty("border-radius", "12px", "important");

    appointmentButton.insertAdjacentElement("afterend", image);
    resetWixMotionEnter(image);
  }

  function restoreAssessmentAppointmentImage() {
    document.querySelectorAll(".tp-assessment-appointment-image").forEach(function (image) {
      image.remove();
    });
  }

  function initTherapyAssistiveImageMove() {
    if (!isMobileViewport()) return;

    var page = document.getElementById("qpnc0");
    if (!page) return;

    var image = document.getElementById("comp-m4u9ygeu8");
    var targetTitle = document.getElementById("comp-m4u9ygew");
    if (!image || !targetTitle || image.classList.contains("tp-therapy-assistive-image")) return;

    var originalParent = image.parentElement;
    if (originalParent && originalParent.id) {
      image.dataset.tpOriginalParent = originalParent.id;
    }
    image.dataset.tpOriginalNext = image.nextElementSibling ? image.nextElementSibling.id || "" : "";
    image.classList.add("tp-therapy-assistive-image");
    targetTitle.parentElement.insertBefore(image, targetTitle);
    resetWixMotionEnter(image);
  }

  function restoreTherapyAssistiveImageMove() {
    var image = document.getElementById("comp-m4u9ygeu8");
    if (!image || !image.classList.contains("tp-therapy-assistive-image")) return;

    var originalParent = document.getElementById(image.dataset.tpOriginalParent || "");
    var originalNext = document.getElementById(image.dataset.tpOriginalNext || "");
    if (originalParent) {
      if (originalNext && originalNext.parentElement === originalParent) {
        originalParent.insertBefore(image, originalNext);
      } else {
        originalParent.appendChild(image);
      }
    }

    image.classList.remove("tp-therapy-assistive-image");
    delete image.dataset.tpOriginalParent;
    delete image.dataset.tpOriginalNext;
  }

  function restoreAssessmentIntroCard() {
    var page = document.getElementById("zbyrt");
    if (!page || page.dataset.tpAssessmentIntroPatched !== "true") return;

    var title = document.getElementById("comp-m4uabnge8");
    var sectionMesh = document.querySelector(
      "[data-mesh-id='comp-m4uabngc13inlineContent-gridContainer']"
    );
    var strip = document.getElementById("comp-m4uabngd6");
    if (!title || !sectionMesh) return;

    title.classList.remove("tp-assessment-intro__title");
    if (strip && strip.parentElement === sectionMesh) {
      sectionMesh.insertBefore(title, strip.nextSibling);
    } else {
      sectionMesh.appendChild(title);
    }

    delete page.dataset.tpAssessmentIntroPatched;
  }

  function restoreMobilePageHeroes() {
    document.querySelectorAll(".tp-mobile-page-hero").forEach(function (section) {
      var mesh = section.querySelector("[data-mesh-id$='gridContainer']");
      var copy = section.querySelector(".tp-mobile-page-hero__copy");
      if (!mesh) return;

      var ids = (section.dataset.tpHeroTextIds || "").split(",").filter(Boolean);
      ids.forEach(function (id) {
        var el = document.getElementById(id);
        if (el && copy && copy.contains(el)) {
          mesh.appendChild(el);
        }
      });

      if (copy && !copy.children.length) {
        copy.remove();
      }

      section.querySelectorAll("[data-tp-mobile-hero-hidden='true']").forEach(function (el) {
        el.removeAttribute("data-tp-mobile-hero-hidden");
      });

      section.classList.remove("tp-mobile-page-hero");
      delete section.dataset.tpHeroTextIds;
    });
  }

  function teardownMobileRetrofit() {
    restoreConsultationHeroTuning();
    restoreConsultationProgramsTitle();
    restoreConsultationPresentationCards();
    restoreConsultationSnakeInline();
    restoreConsultationReadingProgramLayout();
    restoreSpecializationsSectionLayouts();
    restoreOurTeamJoinBenefitsLayout();
    restoreTherapyAssistiveImageMove();
    restoreAssessmentAppointmentImage();
    restoreAssessmentIntroCard();
    restoreMobilePageHeroes();
    clearTpMotionInlineStyles();
    removeMobileChrome();
    removeMobileShellClasses();
    var nav = document.querySelector(".tp-mobile-nav");
    if (nav) closeMobileNavMenu(nav);
  }

  function removeMobileChrome() {
    document
      .querySelectorAll(
        ".tp-mobile-home, .tp-mobile-footer, .tp-mobile-nav, .tp-mobile-header-row, .tp-mobile-contact-bar, .tp-mobile-appointment"
      )
      .forEach(function (node) {
        node.remove();
      });
  }

  function applyMobileRetrofit() {
    var master = document.getElementById("masterPage");
    if (master && master.classList.contains("landingPage")) return;

    document.documentElement.classList.add("tp-mobile-site");
    document.body.classList.add("tp-mobile-site");

    initHomeMobileTemplate();
    initMobileFooter();
    initMobilePageHero();
    initConsultationHeroTuning();
    initAssessmentIntroCard();
    initAssessmentAppointmentImage();
    initTherapyAssistiveImageMove();
    initConsultationProgramsTitle();
    initConsultationPresentationCards();
    initConsultationReadingProgramLayout();
    initSpecializationsSectionLayouts();
    initOurTeamJoinBenefitsLayout();
    initConsultationSnakeInline();
    revealMobileMotionContent();
    notifyMobileSiteShellReady();
  }

  function syncMobileViewportState() {
    if (isMobileViewport()) {
      applyMobileRetrofit();
      maybeRevealMobileSite();
      return;
    }
    teardownMobileRetrofit();
  }

  function resetHeroTextMotion(root) {
    resetWixMotionEnter(root);
  }

  function initDesktopHeroMotionReset() {
    if (isMobileViewport()) return;

    var sitePages = document.getElementById("SITE_PAGES");
    if (!sitePages) return;

    sitePages.querySelectorAll('.wixui-rich-text[data-testid="richTextElement"]').forEach(function (el) {
      resetWixMotionEnter(el);
    });
  }

  function shouldSkipMobileMotionReveal(el) {
    if (!el) return true;
    if (el.closest("#SITE_HEADER, #SITE_FOOTER")) return true;
    if (el.getAttribute("data-tp-mobile-hero-hidden") === "true") return true;
    if (el.classList && el.classList.contains("wixui-vector-image")) return true;
    if (el.closest("#comp-m6aya1jg")) return true;
    return false;
  }

  function isPinnedHeroBackgroundImage(img) {
    if (!img) return false;
    if (img.id && img.id.indexOf("img_comp-") === 0) return true;
    if (img.closest("wow-image.bgImage, wow-image[class*='bgImage']")) return true;
    if (img.closest("#comp-m6aya1jg")) return true;
    return false;
  }

  function revealMobileMotionContent() {
    if (!isMobileViewport()) return;
    if (
      document.documentElement.classList.contains("tp-home-mobile-template-page") ||
      document.body.classList.contains("tp-home-mobile-template-page")
    ) {
      return;
    }

    var sitePages = document.getElementById("SITE_PAGES");
    if (!sitePages) return;

    sitePages.querySelectorAll("[id^='comp-']").forEach(function (comp) {
      if (shouldSkipMobileMotionReveal(comp)) return;
      resetWixMotionEnter(comp);
    });

    sitePages.querySelectorAll(".wixui-image, .ih2JY1, .W4V2qg").forEach(function (wrapper) {
      if (shouldSkipMobileMotionReveal(wrapper)) return;

      resetWixMotionEnter(wrapper);
      wrapper.querySelectorAll("img").forEach(function (img) {
        if (!img || isPinnedHeroBackgroundImage(img)) return;
        img.setAttribute("data-motion-enter", "done");
        img.setAttribute("data-tp-motion-reset", "true");
        img.style.opacity = "1";
        img.style.animation = "none";
        img.style.transform = "none";
        img.style.webkitTransform = "none";
        img.style.webkitMaskImage = "none";
        img.style.maskImage = "none";
        if (img.loading === "lazy") {
          img.loading = "eager";
        }
        if (img.dataset && img.dataset.src && !img.getAttribute("src")) {
          img.setAttribute("src", img.dataset.src);
        }
      });
    });
  }

  function scheduleMobileMotionRetries() {
    function run() {
      if (!isMobileViewport()) return;
      revealMobileMotionContent();
    }

    window.setTimeout(run, 0);
    window.setTimeout(run, 500);
    window.setTimeout(run, 1500);
    window.addEventListener(
      "load",
      function () {
        window.setTimeout(run, 0);
      },
      { once: true }
    );
  }

  function scheduleMobilePageHeroRetries() {
    function run() {
      if (!isMobileViewport()) return;
      initMobilePageHero();
    }

    window.setTimeout(run, 500);
    window.setTimeout(run, 1500);
    window.addEventListener(
      "load",
      function () {
        window.setTimeout(run, 0);
      },
      { once: true }
    );
  }

  function initMobileSite() {
    syncMobileViewportState();
  }

  function markMobileSiteReady() {
    if (!isMobileViewport()) return;

    function reveal() {
      if (typeof window.__tpMarkMobileReady === "function") {
        window.__tpMarkMobileReady();
      } else {
        document.documentElement.classList.remove("tp-mobile-booting");
        document.documentElement.classList.add("tp-mobile-ready");
        document.body.classList.remove("tp-mobile-booting");
        document.body.classList.add("tp-mobile-ready");
      }
      if (document.getElementById("comp-m4uh76kx")) {
        initGeographicCoverageMap();
      }
    }

    requestAnimationFrame(function () {
      requestAnimationFrame(reveal);
    });
  }

  var mobileShellReady = {
    revealed: false,
    nav: false,
    site: false,
  };

  function isEnglishHomePath() {
    var path = window.location.pathname.toLowerCase();
    return (
      !isFrenchPage() &&
      (path === "/" || path === "/index.html" || path === "/index")
    );
  }

  function maybeRevealMobileSite() {
    if (!isMobileViewport()) return;
    if (mobileShellReady.revealed) return;

    var navDone = mobileShellReady.nav || !!document.querySelector(".tp-mobile-nav");
    var siteDone = mobileShellReady.site;

    if (!siteDone) {
      if (isEnglishHomePath()) {
        siteDone = !!document.querySelector(".tp-mobile-home");
      } else {
        siteDone =
          document.documentElement.classList.contains("tp-mobile-site") ||
          document.body.classList.contains("tp-mobile-site");
      }
    }

    if (!navDone || !siteDone) return;

    mobileShellReady.revealed = true;
    markMobileSiteReady();
  }

  function notifyMobileNavReady() {
    mobileShellReady.nav = true;
    maybeRevealMobileSite();
  }

  function notifyMobileSiteShellReady() {
    mobileShellReady.site = true;
    maybeRevealMobileSite();
  }

  function buildHomeServiceCard(title, body, href) {
    var slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    return (
      '<article class="tp-home-service-card tp-home-service-card--' + slug + '">' +
      '<div class="tp-home-service-card__icon" aria-hidden="true"></div>' +
      "<h3>" +
      title +
      "</h3>" +
      "<p>" +
      body +
      "</p>" +
      '<a href="' +
      href +
      '" aria-label="Learn more about ' +
      title +
      '">&rsaquo;</a>' +
      "</article>"
    );
  }

  function buildHomeBookingCard(title, body, duration, price, href, image) {
    return (
      '<article class="tp-home-booking-card">' +
      '<img src="' +
      image +
      '" alt="" loading="lazy" />' +
      '<div class="tp-home-booking-card__body">' +
      "<h3>" +
      title +
      "</h3>" +
      "<p>" +
      body +
      "</p>" +
      '<dl><div><dt>Duration</dt><dd>' +
      duration +
      '</dd></div><div><dt>Price</dt><dd>' +
      price +
      "</dd></div></dl>" +
      '<a class="tp-home-button" href="' +
      href +
      '">Book Now</a>' +
      "</div>" +
      "</article>"
    );
  }

  function loadStylesheet(href) {
    if (document.querySelector('link[href="' + href + '"]')) return;
    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }

  function loadScript(src, callback) {
    if (window.L) {
      callback();
      return;
    }

    var existing = document.querySelector('script[src="' + src + '"]');
    if (existing) {
      existing.addEventListener("load", callback);
      return;
    }

    var script = document.createElement("script");
    script.src = src;
    script.onload = callback;
    document.head.appendChild(script);
  }

  function initGeographicCoverageMap() {
    var mount = document.getElementById("comp-m4uh76kx");
    if (!mount) return;
    var COVERAGE_MAP_ZOOM = 5;

    function refreshCoverageMap(map, tileLayer) {
      if (!map || !map.getContainer()) return;
      var rect = map.getContainer().getBoundingClientRect();
      if (rect.width < 20 || rect.height < 20) return;

      map.invalidateSize({ animate: false, pan: false });
      var center = map.getCenter();
      var zoom = map.getZoom();
      map.setView(center, zoom, { animate: false });
      if (tileLayer && typeof tileLayer.redraw === "function") {
        tileLayer.redraw();
      }
    }

    function nudgeCoverageMapZoom(map, tileLayer) {
      if (!map) return;
      var zoom = map.getZoom();
      map.setZoom(zoom - 1, { animate: false });
      map.invalidateSize({ animate: false, pan: false });
      window.setTimeout(function () {
        map.setZoom(zoom, { animate: false });
        refreshCoverageMap(map, tileLayer);
      }, 50);
    }

    function invalidateCoverageMap(map) {
      refreshCoverageMap(map, mount._tpLeafletTileLayer);
    }

    function scheduleCoverageMapInvalidate(map, tileLayer) {
      var delays = isMobileViewport()
        ? [0, 100, 250, 500, 750, 1000, 1500, 2500]
        : [0, 100, 250, 500, 1000, 2000];

      delays.forEach(function (delay) {
        window.setTimeout(function () {
          refreshCoverageMap(map, tileLayer);
        }, delay);
      });

      if (mount._tpCoverageMapResizeListener) return;
      mount._tpCoverageMapResizeListener = true;
      window.addEventListener("resize", function () {
        refreshCoverageMap(map, tileLayer);
      });
      window.addEventListener("pageshow", function () {
        refreshCoverageMap(map, tileLayer);
      });

      if (window.ResizeObserver) {
        var observer = new ResizeObserver(function () {
          refreshCoverageMap(map, tileLayer);
        });
        observer.observe(mount);
        mount._tpCoverageMapResizeObserver = observer;
      }
    }

    function scheduleMobileCoverageMapTileKick(map, tileLayer) {
      if (!isMobileViewport()) return;

      [400, 1200, 2400].forEach(function (delay) {
        window.setTimeout(function () {
          if (!map || !map.getContainer()) return;
          nudgeCoverageMapZoom(map, tileLayer);
        }, delay);
      });
    }

    function mountHasSize() {
      var rect = mount.getBoundingClientRect();
      return rect.width >= 20 && rect.height >= 20;
    }

    function buildCoverageMap() {
      if (mount.dataset.tpMapReady === "true") {
        invalidateCoverageMap(mount._tpLeafletMap);
        return;
      }
      if (!mountHasSize()) {
        window.requestAnimationFrame(buildCoverageMap);
        return;
      }

      mount.dataset.tpMapReady = "true";
      mount.innerHTML =
        '<div class="tp-coverage-map" role="img" aria-label="Map of The Therapy Path service areas across Northern Ontario"></div>';

      var mapEl = mount.querySelector(".tp-coverage-map");
      loadStylesheet("https://unpkg.com/leaflet@1.9.4/dist/leaflet.css");
      loadScript("https://unpkg.com/leaflet@1.9.4/dist/leaflet.js", function () {
        if (!window.L || !mapEl) return;

        var map = L.map(mapEl, {
          scrollWheelZoom: false,
          zoomControl: true,
        }).setView([48.95, -81.25], COVERAGE_MAP_ZOOM);

        mount._tpLeafletMap = map;

        var tileLayer = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "&copy; OpenStreetMap contributors",
          maxZoom: 18,
        }).addTo(map);

        mount._tpLeafletTileLayer = tileLayer;

        function stabilizeCoverageMap() {
          refreshCoverageMap(map, tileLayer);
        }

        map.whenReady(stabilizeCoverageMap);
        tileLayer.on("load", stabilizeCoverageMap);

        [
          ["North Bay", 46.3091, -79.4608],
          ["Timmins", 48.4758, -81.3305],
          ["New Liskeard", 47.5095, -79.6759],
          ["Kirkland Lake", 48.1446, -80.0377],
          ["Cochrane", 49.0669, -81.0168],
          ["Iroquois Falls", 48.7675, -80.6830],
          ["Kapuskasing", 49.4169, -82.4331],
          ["Hearst", 49.6868, -83.6665],
          ["James Bay Coast", 51.2720, -80.6400],
        ].forEach(function (place) {
          L.marker([place[1], place[2]]).addTo(map).bindPopup(place[0]);
        });

        scheduleCoverageMapInvalidate(map, tileLayer);
        scheduleMobileCoverageMapTileKick(map, tileLayer);
      });
    }

    function whenCoverageMapCanRender(callback) {
      if (!isMobileViewport()) {
        callback();
        return;
      }

      var done = false;
      function run(afterMs) {
        if (done) return;
        done = true;
        window.setTimeout(callback, afterMs || 0);
      }

      if (document.documentElement.classList.contains("tp-mobile-ready")) {
        run(250);
        return;
      }

      window.setTimeout(function () {
        run(0);
      }, 5000);

      var observer = new MutationObserver(function () {
        if (document.documentElement.classList.contains("tp-mobile-ready")) {
          observer.disconnect();
          run(250);
        }
      });
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });
    }

    if (mount.dataset.tpMapInitScheduled === "true") {
      if (mount._tpLeafletMap) invalidateCoverageMap(mount._tpLeafletMap);
      return;
    }
    mount.dataset.tpMapInitScheduled = "true";

    whenCoverageMapCanRender(function () {
      window.requestAnimationFrame(function () {
        window.requestAnimationFrame(buildCoverageMap);
      });
    });
  }

  function pinPageHero() {
    var pages = document.querySelector("#SITE_PAGES");
    if (!pages) return;

    var heroImg = pages.querySelector("wow-image.bgImage img, wow-image[class*='bgImage'] img");
    if (heroImg) {
      heroImg.setAttribute("fetchpriority", "high");
      heroImg.removeAttribute("loading");
    }

    pages.querySelectorAll("img[fetchpriority='high']").forEach(function (img) {
      if (img === heroImg) return;
      if (img.closest("#SITE_HEADER")) return;
      img.removeAttribute("fetchpriority");
      var width = parseInt(img.getAttribute("width") || "0", 10);
      if (width > 0 && width < 500 && !img.getAttribute("loading")) {
        img.setAttribute("loading", "lazy");
      }
    });
  }

  function initClinicalDatabaseCarousel() {
    var carousel = document.getElementById("comp-m6aya1jg");
    if (!carousel) return;

    var imageBlue = "/images/opt/clinical-carousel-blue-1600w.webp";
    carousel.classList.add("tp-clinical-carousel");
    carousel.style.setProperty("--tp-clinical-carousel-bg", "url('" + imageBlue + "')");

    var legacySlide = document.getElementById("img_comp-m6aya26d");
    if (legacySlide) {
      legacySlide.style.backgroundImage = "none";
      legacySlide.querySelectorAll("img").forEach(function (img) {
        img.removeAttribute("src");
        img.removeAttribute("srcset");
      });
    }
    var imageGreen = "/images/opt/clinical-carousel-green-1600w.webp";
    var imageOrange = "/images/opt/clinical-carousel-orange-1600w.webp";
    var isFrench = /^\/fr\//.test(window.location.pathname);
    var title = isFrench ? "Notre base de donnees clinique" : "Our Clinical Database";
    var slides = isFrench
      ? [
          {
            image: imageBlue,
            text: "Genere les rapports d'evaluation et de progres en un seul clic.",
          },
          {
            image: imageGreen,
            text:
              "Saisit efficacement les resultats de depistage et envoie automatiquement des lettres aux parents. Elle envoie aussi des activites ciblees pour soutenir les enfants qui en ont besoin.",
          },
          {
            image: imageOrange,
            text: "Automatise certains aspects des programmes a domicile apres les seances de therapie.",
          },
          {
            image: imageBlue,
            text:
              "Donne continuellement a nos clients un apercu du statut de chaque enfant de notre charge de cas, avec des mises a jour immediates.",
          },
          {
            image: imageGreen,
            text:
              "Simplifie le suivi de la progression des objectifs et la generation des plans de traitement par nos cliniciens.",
          },
        ]
      : [
          {
            image: imageBlue,
            text: "Generates assessment and progress reports with the click of a button.",
          },
          {
            image: imageGreen,
            text:
              "Efficiently captures screening results and automatically sends letters to parents. It also sends tailored activities to address weaknesses for children who need it.",
          },
          {
            image: imageOrange,
            text: "Automates aspects of home program delivery after therapy sessions.",
          },
          {
            image: imageBlue,
            text:
              "Continually provides our customers an overview of the status of each child on our caseload with immediate updates of changes.",
          },
          {
            image: imageGreen,
            text:
              "Simplifies our clinicians tracking of goal progression and generation of treatment plans.",
          },
        ];

    var content = document.createElement("div");
    content.className = "tp-clinical-carousel__content";
    content.innerHTML =
      '<h2 class="tp-clinical-carousel__title"></h2>' +
      '<p class="tp-clinical-carousel__body"></p>';
    carousel.appendChild(content);

    var titleEl = content.querySelector(".tp-clinical-carousel__title");
    var bodyEl = content.querySelector(".tp-clinical-carousel__body");
    var dots = Array.prototype.slice.call(carousel.querySelectorAll(".hImYkx a"));
    var prev = carousel.querySelector('[data-testid="prevButton"]');
    var next = carousel.querySelector('[data-testid="nextButton"]');
    var index = 0;
    var timer;

    function render(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      var slide = slides[index];
      carousel.style.setProperty("--tp-clinical-carousel-bg", "url('" + slide.image + "')");
      titleEl.textContent = title;
      bodyEl.textContent = slide.text;
      dots.forEach(function (dot, dotIndex) {
        var isCurrent = dotIndex === index;
        dot.classList.toggle("JPnvZO", isCurrent);
        dot.parentElement.setAttribute("aria-current", isCurrent ? "true" : "false");
      });
    }

    function restart() {
      window.clearInterval(timer);
      timer = window.setInterval(function () {
        render(index + 1);
      }, 6500);
    }

    if (prev) {
      prev.addEventListener("click", function (event) {
        event.preventDefault();
        render(index - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function (event) {
        event.preventDefault();
        render(index + 1);
        restart();
      });
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function (event) {
        event.preventDefault();
        render(dotIndex);
        restart();
      });
    });

    render(0);
    restart();
  }

  var APPOINTMENT_CARD_IMAGES = {
    "5353ca_b05e9a98bc264a0480d92a702e808975":
      "/images/opt/5353ca_b05e9a98bc264a0480d92a702e808975-864w.webp",
    "dda575_7d642f34c3524555a2dabdd59ecd1e3f":
      "/images/opt/dda575_7d642f34c3524555a2dabdd59ecd1e3f-800w.webp",
    "dda575_098fc47f424e46909702a5d5dd49f04f":
      "/images/opt/dda575_098fc47f424e46909702a5d5dd49f04f-1600w.webp",
    "5f9399_230005879ba74374bc83c6d80f34cb61":
      "/images/opt/5f9399_230005879ba74374bc83c6d80f34cb61-1600w.webp",
    "dda575_725e8414dd764046a35c7d310b0fe9bd":
      "/images/opt/dda575_725e8414dd764046a35c7d310b0fe9bd-1600w.webp",
  };

  function parseWowImageInfo(wowImage) {
    var raw = wowImage.getAttribute("data-image-info");
    if (!raw) return null;
    try {
      return JSON.parse(raw.replace(/&quot;/g, '"'));
    } catch (error) {
      return null;
    }
  }

  function localAppointmentImage(uri) {
    if (!uri) return null;
    return APPOINTMENT_CARD_IMAGES[uri.split("~")[0]] || null;
  }

  function pinAppointmentCardImages() {
    var widget = document.getElementById("comp-m52p2p3b");
    if (!widget) return;

    widget.querySelectorAll("wow-image[data-image-info] img").forEach(function (img) {
      var wowImage = img.closest("wow-image");
      if (!wowImage) return;
      var info = parseWowImageInfo(wowImage);
      var localSrc =
        info && info.imageData ? localAppointmentImage(info.imageData.uri) : null;
      if (!localSrc) return;
      if (img.getAttribute("src") === localSrc && img.src.indexOf("wixstatic.com") === -1) {
        return;
      }
      img.src = localSrc;
      img.removeAttribute("srcset");
    });
  }

  function initAppointmentCardImages() {
    var widget = document.getElementById("comp-m52p2p3b");
    if (!widget) return;

    pinAppointmentCardImages();
    [250, 1000, 3000].forEach(function (delay) {
      window.setTimeout(pinAppointmentCardImages, delay);
    });

    if (!window.MutationObserver) return;
    var observer = new MutationObserver(function () {
      pinAppointmentCardImages();
    });
    observer.observe(widget, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["src", "srcset", "data-image-info"],
    });
  }

  function pinLocalImages() {
    var headerLogo = document.getElementById("img_comp-m4u3wh0r");
    if (headerLogo) {
      headerLogo.src = "/images/opt/therapy-path-header-logo-143w.webp";
      headerLogo.srcset =
        "/images/opt/therapy-path-header-logo-143w.webp 1x, /images/opt/therapy-path-header-logo-286w.webp 2x";
      headerLogo.sizes = "143px";
    }

    var heroImg = document.querySelector("#img_comp-m4n0yl36 img");
    if (heroImg) {
      heroImg.src = "/images/opt/adobestock_495222202-980w.webp";
      heroImg.removeAttribute("srcset");
      heroImg.setAttribute("fetchpriority", "high");
      heroImg.setAttribute("alt", "Speech therapy session");
    }

    var helpCardImages = {
      "img_comp-m4rmsvne__item1": {
        src: "/images/opt/assessment-speech-service-864w.webp",
        srcset:
          "/images/opt/assessment-speech-service-864w.webp 1x, /images/opt/assessment-speech-service-1728w.webp 2x",
      },
      "img_comp-m4rmsvne__item-j9r9uz7e": {
        src: "/images/opt/adobestock_363566581-864w.webp",
        srcset:
          "/images/opt/adobestock_363566581-864w.webp 1x, /images/opt/adobestock_363566581-1728w.webp 2x",
      },
    };

    Object.keys(helpCardImages).forEach(function (id) {
      var img = document.getElementById(id);
      if (!img) return;
      img.src = helpCardImages[id].src;
      img.srcset = helpCardImages[id].srcset;
    });

    document.querySelectorAll('img[src*="wixstatic.com"]').forEach(function (img) {
      if (img.closest("#img_pageBackground_c1dmp")) return;
      var localSrc = img.getAttribute("data-tp-local-src");
      if (localSrc) {
        img.src = localSrc;
        img.removeAttribute("srcset");
      }
    });
  }

  showSentBanner();
  initContactForm();
  initHeaderLogoLinks();
  initLanguageSwitcher();
  initMobileNavRouting();
  initMobileNavigation();
  window.setTimeout(initMobileNavigation, 500);
  window.setTimeout(initMobileNavigation, 1500);
  syncMobileViewportState();
  window.setTimeout(syncMobileViewportState, 500);
  scheduleMobilePageHeroRetries();
  scheduleMobileMotionRetries();
  window.setTimeout(notifyMobileSiteShellReady, 550);

  var viewportMq = window.matchMedia(MOBILE_VIEWPORT_QUERY);
  if (viewportMq.addEventListener) {
    viewportMq.addEventListener("change", syncMobileViewportState);
  } else if (viewportMq.addListener) {
    viewportMq.addListener(syncMobileViewportState);
  }
  initTherapyMenuLinks();
  initDesktopServicesMegaMenu();
  initDesktopHeroMotionReset();
  syncMobileMenuFromDesktop();
  window.setTimeout(syncMobileMenuFromDesktop, 500);
  window.setTimeout(syncMobileMenuFromDesktop, 1500);
  initHashScroll();
  initHelpCardButtons();
  initConsultationCardButtons();
  initAccessibleLinkLabels();
  pinPageHero();
  initClinicalDatabaseCarousel();
  pinLocalImages();
  initAppointmentCardImages();
  initGeographicCoverageMap();
  window.setTimeout(notifyMobileNavReady, 1600);
  window.setTimeout(function () {
    if (!mobileShellReady.revealed) {
      mobileShellReady.nav = true;
      mobileShellReady.site = true;
      maybeRevealMobileSite();
    }
  }, 2500);
})();
