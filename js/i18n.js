/* ============================================
   FROSTLIGHT - Internationalization (i18n)
   ============================================ */

(function () {
  'use strict';

  const LANGUAGES = {
    'en': TEXT_ENUS,
    'it': TEXT_ITIT
  };

  const DEFAULT_LANG = 'en';
  const STORAGE_KEY = 'frostlight-lang';

  /**
   * Apply translations to all elements with data-i18n attributes.
   */
  function applyTranslations(lang) {
    const dict = LANGUAGES[lang];
    if (!dict) return;

    // Text content
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      var key = el.getAttribute('data-i18n');
      if (dict[key] != null) {
        el.textContent = dict[key];
      }
    });

    // HTML content (for elements with inline tags like <em>)
    document.querySelectorAll('[data-i18n-html]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-html');
      if (dict[key] != null) {
        el.innerHTML = dict[key];
      }
    });

    // Placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-placeholder');
      if (dict[key] != null) {
        el.placeholder = dict[key];
      }
    });

    // Title attribute (e.g. iframe title)
    document.querySelectorAll('[data-i18n-title]').forEach(function (el) {
      var key = el.getAttribute('data-i18n-title');
      if (dict[key] != null) {
        el.title = dict[key];
      }
    });

    // Page title
    if (dict['meta.title']) {
      document.title = dict['meta.title'];
    }

    // Meta description
    var metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc && dict['meta.description']) {
      metaDesc.setAttribute('content', dict['meta.description']);
    }

    // Update html lang attribute
    document.documentElement.lang = lang === 'it' ? 'it' : 'en';

    // Update active flag button
    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
    });
  }

  /**
   * Set language, save preference, and apply translations.
   */
  function setLanguage(lang) {
    if (!LANGUAGES[lang]) lang = DEFAULT_LANG;
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch (e) { /* localStorage unavailable */ }
    applyTranslations(lang);
  }

  /**
   * Get saved language from localStorage.
   */
  function getSavedLanguage() {
    try {
      return localStorage.getItem(STORAGE_KEY);
    } catch (e) {
      return null;
    }
  }

  /**
   * Detect language from IP geolocation.
   * Uses ipapi.co (free, HTTPS, no API key needed for moderate traffic).
   * Falls back to default language on error.
   */
  function detectLanguageFromIP() {
    fetch('https://ipapi.co/country_code/')
      .then(function (response) {
        if (!response.ok) throw new Error('Geo lookup failed');
        return response.text();
      })
      .then(function (countryCode) {
        var lang = countryCode.trim().toUpperCase() === 'IT' ? 'it' : 'en';
        setLanguage(lang);
      })
      .catch(function () {
        setLanguage(DEFAULT_LANG);
      });
  }

  /**
   * Initialize i18n on DOM ready.
   */
  function init() {
    // Bind language switcher buttons
    document.querySelectorAll('.lang-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        setLanguage(btn.getAttribute('data-lang'));
      });
    });

    // Check for saved preference
    var saved = getSavedLanguage();
    if (saved && LANGUAGES[saved]) {
      applyTranslations(saved);
    } else {
      // Apply default immediately, then override with geo-detected
      applyTranslations(DEFAULT_LANG);
      detectLanguageFromIP();
    }
  }

  // Expose for external use
  window.FrostlightI18n = {
    setLanguage: setLanguage,
    applyTranslations: applyTranslations
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
