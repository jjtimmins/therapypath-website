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

  function initContactForm() {
    var form = document.querySelector(".tp-contact-form");
    if (!form) return;

    form.addEventListener("submit", function () {
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
  }

  function resolvePath(href) {
    var link = document.createElement("a");
    link.href = href;
    return link.pathname;
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

  showSentBanner();
  initContactForm();
  initLanguageSwitcher();
})();
