(function () {
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

  function syncMobileMenuFromDesktop() {
    var mobileNav = document.querySelector(".tp-mobile-nav");
    if (!mobileNav) return;

    var map = getDesktopNavLinkMap();
    mobileNav.querySelectorAll(".tp-mobile-nav__sublink, .tp-mobile-nav__link").forEach(function (link) {
      var label = (link.textContent || "").replace(/\s+/g, " ").trim();
      if (map[label]) {
        link.setAttribute("href", map[label]);
      }
    });
  }

  function closeMobileNavMenu(nav) {
    if (!nav) return;
    var panel = nav.querySelector(".tp-mobile-nav__panel");
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
      window.top.location.href = href;
      return;
    }

    var absolute =
      href.indexOf("http") === 0
        ? href
        : window.location.origin + (href.charAt(0) === "/" ? href : "/" + href);
    window.top.location.href = absolute;
  }

  function initMobileNavRouting() {
    if (window.__tpMobileNavRoutingBound) return;
    window.__tpMobileNavRoutingBound = true;

    var lastNav = { href: "", time: 0 };

    function handleMobileNavActivate(event) {
      var link = event.target.closest(".tp-mobile-nav a[href]");
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
    var urls = getLanguageUrls();
    return isFrenchPage() ? urls.fr : urls.en;
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
          location.pathname.endsWith("/contact-us.html"));

      if (!samePage) return;

      var targetId = hashScrollTargets[hash];
      if (!document.getElementById(targetId)) return;

      event.preventDefault();
      history.pushState(null, "", url.pathname + url.search + "#" + hash);
      scrollToHashTarget(hash);
    });
  }

  function initTherapyMenuLinks() {
    var isFrench = location.pathname === "/fr.html" || location.pathname.indexOf("/fr/") === 0;
    var therapyPath = isFrench ? "/fr/services/therapy.html" : "/services/therapy.html";
    var teamPath = isFrench ? "/fr/about-us/our-team.html" : "/about-us/our-team.html";
    var specializationsPath = isFrench
      ? "/fr/about-us/our-specializations.html"
      : "/about-us/our-specializations.html";
    var contactPath = isFrench ? "/fr/contact-us.html" : "/contact-us.html";
    var targetsByText = {
      Therapy: therapyPath,
      Therapie: therapyPath,
      "Thérapie": therapyPath,
      "Speech": therapyPath + "#anchors-m4u9ygef6",
      "Parole": therapyPath + "#anchors-m4u9ygef6",
      "Language": therapyPath + "#anchors-m4u9yger9",
      "Langage": therapyPath + "#anchors-m4u9yger9",
      "Assistive devices": therapyPath + "#anchors-m4u9ygfe4",
      "Appareils fonctionnels": therapyPath + "#anchors-m4u9ygfe4",
      "Join Our Team": teamPath + "#anchors-m4uaf2y410",
      "Rejoignez notre équipe": teamPath + "#anchors-m4uaf2y410",
      "Brain Injury": specializationsPath + "#anchors-m4u9qh0c",
      "Lésion cérébrale": specializationsPath + "#anchors-m4u9qh0c",
      "Learning Disabilities": specializationsPath + "#anchors-m4u9qh0m1",
      "Troubles d'apprentissage": specializationsPath + "#anchors-m4u9qh0m1",
      "Stroke": specializationsPath + "#anchors-m4u9qh0u6",
      "Accident vasculaire cérébral": specializationsPath + "#anchors-m4u9qh0u6",
      "Reading Groups":
        (isFrench ? "/fr" : "") +
        "/services/consultations-workshops-reading-groups.html#anchors-m4u7nvwq6",
      "Groupes de lecture":
        "/fr/services/consultations-workshops-reading-groups.html#anchors-m4u7nvwq6",
      "Click Reader":
        (isFrench ? "/fr" : "") +
        "/services/clinical-management-software.html#comp-m4wzb8lj6",
      "Fees": contactPath + "#comp-m4uec27w1",
      "Frais": contactPath + "#comp-m4uec27w1",
    };

    document
      .querySelectorAll('#comp-m4ufk180 a.wixui-rich-text__text')
      .forEach(function (link) {
        var label = (link.textContent || "").replace(/\s+/g, " ").trim();
        var href = targetsByText[label];
        if (!href) return;
        link.setAttribute("href", href);
        link.setAttribute("target", "_self");
      });

    document
      .querySelectorAll('#comp-m4ufk180 .itemDepth12472627565__root')
      .forEach(function (link) {
        var label = (link.textContent || "").replace(/\s+/g, " ").trim();
        if (label === "Contact Us" || label === "Contactez nous") {
          link.setAttribute("href", contactPath + "#anchors-lvfbdtjs");
          link.setAttribute("target", "_self");
          return;
        }
        if (label === "Fees" || label === "Frais") {
          link.setAttribute("href", contactPath + "#comp-m4uec27w1");
          link.setAttribute("target", "_self");
        }
      });

    syncMobileMenuFromDesktop();
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

    nav.querySelectorAll(".tp-mobile-nav__section-toggle").forEach(function (button) {
      button.addEventListener("click", function (event) {
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

    header.appendChild(row);
    return row;
  }

  function getEnglishMobileMenu() {
    return [
      { label: "Home", href: "/" },
      {
        label: "Services",
        href: "/services.html",
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
        href: "/fr/services.html",
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
    var path = window.location.pathname.toLowerCase();
    var isEnglishHome =
      path === "/" || path === "/index.html" || path === "/index";
    if (!isEnglishHome || isFrenchPage()) return;

    var sitePages = document.getElementById("SITE_PAGES");
    if (!sitePages) return;
    if (sitePages.querySelector(".tp-mobile-home")) {
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
    if (
      document.documentElement.classList.contains("tp-home-mobile-template-page") ||
      document.body.classList.contains("tp-home-mobile-template-page")
    ) {
      return;
    }

    var page = getActiveSitePage();
    if (!page || page.querySelector(".tp-mobile-page-hero")) return;

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

    section.querySelectorAll("[data-testid='colorUnderlay']").forEach(function (underlay) {
      underlay.setAttribute("data-tp-mobile-hero-hidden", "true");
    });

    section.querySelectorAll(".wixui-vector-image").forEach(function (graphic) {
      if (!graphic.closest(".tp-mobile-page-hero__copy")) {
        graphic.setAttribute("data-tp-mobile-hero-hidden", "true");
      }
    });

    if (section.querySelector(".tp-mobile-page-hero__copy")) return;

    var mesh = section.querySelector("[data-mesh-id$='gridContainer']");
    if (!mesh) return;

    var texts = [];
    mesh.querySelectorAll('[data-testid="richTextElement"]').forEach(function (el) {
      if (el.closest(".tp-mobile-page-hero__copy")) return;
      if (el.querySelector("h1, h2, p")) texts.push(el);
    });

    if (!texts.length) return;

    var copy = document.createElement("div");
    copy.className = "tp-mobile-page-hero__copy";
    mesh.insertBefore(copy, texts[0]);
    texts.forEach(function (el) {
      copy.appendChild(el);
    });
  }

  function initMobileSite() {
    var master = document.getElementById("masterPage");
    if (master && master.classList.contains("landingPage")) return;

    document.documentElement.classList.add("tp-mobile-site");
    document.body.classList.add("tp-mobile-site");

    initMobileFooter();
    initMobilePageHero();
    notifyMobileSiteShellReady();
  }

  function markMobileSiteReady() {
    if (!window.matchMedia("(max-width: 980px)").matches) return;

    function reveal() {
      if (typeof window.__tpMarkMobileReady === "function") {
        window.__tpMarkMobileReady();
        return;
      }
      document.documentElement.classList.remove("tp-mobile-booting");
      document.documentElement.classList.add("tp-mobile-ready");
      document.body.classList.remove("tp-mobile-booting");
      document.body.classList.add("tp-mobile-ready");
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
    if (!window.matchMedia("(max-width: 980px)").matches) return;
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
    if (!mount || mount.dataset.tpMapReady === "true") return;
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
      }).setView([48.95, -81.25], 6);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 18,
      }).addTo(map);

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

      window.setTimeout(function () {
        map.invalidateSize();
      }, 250);
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
  initHomeMobileTemplate();
  initMobileSite();
  window.setTimeout(initMobileSite, 500);
  window.setTimeout(initMobilePageHero, 500);
  window.setTimeout(notifyMobileSiteShellReady, 550);
  initTherapyMenuLinks();
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
