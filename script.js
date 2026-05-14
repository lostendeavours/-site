(() => {
  const LANG_KEY = 'le-lang';
  const THEME_KEY = 'le-theme';
  const SUPPORTED = ['en', 'de'];
  const THEMES = ['dark', 'light'];

  let translations = {};
  let currentLang = 'en';
  let currentTheme = 'dark';

  /* ===== Language detection ===== */
  function detectInitialLang() {
    const stored = localStorage.getItem(LANG_KEY);
    if (stored && SUPPORTED.includes(stored)) return stored;
    const nav = (navigator.language || 'en').toLowerCase();
    if (nav.startsWith('de')) return 'de';
    return 'en';
  }

  /* ===== Theme handling ===== */
  function detectInitialTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored && THEMES.includes(stored)) return stored;
    return 'dark';
  }

  function applyTheme(theme) {
    currentTheme = theme;
    if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    updateThemeButtonLabel();
  }

  function updateThemeButtonLabel() {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    const dict = translations[currentLang] || {};
    const nextIsLight = currentTheme === 'dark';
    const key = nextIsLight ? 'nav.theme_to_light' : 'nav.theme_to_dark';
    btn.setAttribute('data-i18n', key);
    const label = dict[key];
    if (label) btn.setAttribute('aria-label', label);
  }

  /* ===== Translation apply ===== */
  function applyTranslations(lang) {
    const dict = translations[lang] || translations.en || {};
    currentLang = lang;
    document.documentElement.lang = lang;

    document.querySelectorAll('[data-i18n]').forEach((el) => {
      const key = el.getAttribute('data-i18n');
      const val = dict[key];
      if (val == null) return;
      const attr = el.getAttribute('data-i18n-attr');
      if (attr) {
        el.setAttribute(attr, val);
      } else {
        el.textContent = val;
      }
    });

    document.querySelectorAll('.lang-btn').forEach((btn) => {
      btn.setAttribute('aria-pressed', String(btn.dataset.lang === lang));
    });

    updateThemeButtonLabel();

    // Re-render concerts so date formatting follows the current locale
    if (loadedConcerts) renderConcerts(loadedConcerts);
  }

  /* ===== Concerts ===== */
  let loadedConcerts = null;

  function todayISO() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function formatDate(iso, lang) {
    const d = new Date(iso + 'T00:00:00');
    if (isNaN(d.getTime())) return iso;
    const locale = lang === 'de' ? 'de-DE' : 'en-US';
    return d.toLocaleDateString(locale, { day: '2-digit', month: 'short', year: 'numeric' });
  }

  function renderConcerts(list) {
    const container = document.getElementById('shows-list');
    const empty = document.getElementById('shows-empty');
    if (!container || !empty) return;

    const today = todayISO();
    const upcoming = list
      .filter((c) => c && typeof c.date === 'string' && c.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date));

    container.innerHTML = '';

    if (upcoming.length === 0) {
      empty.hidden = false;
      return;
    }
    empty.hidden = true;

    const dict = translations[currentLang] || {};
    const ticketsLabel = dict['shows.tickets'] || 'Tickets';

    const frag = document.createDocumentFragment();
    upcoming.forEach((c) => {
      const li = document.createElement('li');
      li.className = 'show-item';

      const date = document.createElement('div');
      date.className = 'show-date';
      date.textContent = formatDate(c.date, currentLang);

      const info = document.createElement('div');
      info.className = 'show-info';
      const venue = document.createElement('span');
      venue.className = 'show-venue';
      venue.textContent = c.venue || '';
      const location = document.createElement('span');
      location.className = 'show-location';
      const locParts = [c.city, c.country].filter(Boolean);
      location.textContent = locParts.join(', ');
      info.appendChild(venue);
      info.appendChild(location);

      li.appendChild(date);
      li.appendChild(info);

      if (c.ticketUrl) {
        const a = document.createElement('a');
        a.href = c.ticketUrl;
        a.className = 'show-tickets';
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = ticketsLabel;
        li.appendChild(a);
      }

      frag.appendChild(li);
    });
    container.appendChild(frag);
  }

  /* ===== Language switcher wiring ===== */
  function wireLanguageSwitcher() {
    document.querySelectorAll('.lang-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        const lang = btn.dataset.lang;
        if (!SUPPORTED.includes(lang) || lang === currentLang) return;
        try { localStorage.setItem(LANG_KEY, lang); } catch (_) {}
        applyTranslations(lang);
      });
    });
  }

  /* ===== Theme toggle wiring ===== */
  function wireThemeToggle() {
    const btn = document.getElementById('theme-toggle');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const next = currentTheme === 'dark' ? 'light' : 'dark';
      try { localStorage.setItem(THEME_KEY, next); } catch (_) {}
      applyTheme(next);
    });
  }

  /* ===== Mobile nav toggle ===== */
  function wireMobileNav() {
    const toggle = document.querySelector('.nav-toggle');
    const menu = document.getElementById('nav-menu');
    if (!toggle || !menu) return;
    toggle.addEventListener('click', () => {
      const open = menu.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    menu.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => {
        menu.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ===== Year ===== */
  function setYear() {
    const el = document.getElementById('year');
    if (el) el.textContent = new Date().getFullYear();
  }

  /* ===== Data loading ===== */
  async function loadJSON(path, fallback) {
    try {
      const res = await fetch(path, { cache: 'no-cache' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      console.warn(`Could not load ${path}:`, err);
      return fallback;
    }
  }

  /* ===== Init ===== */
  function applyThemeEarly() {
    // Apply theme before fetch to avoid a flash of dark mode for light users
    applyTheme(detectInitialTheme());
  }

  async function init() {
    applyThemeEarly();
    setYear();
    wireMobileNav();
    wireLanguageSwitcher();
    wireThemeToggle();

    translations = await loadJSON('translations.json', { en: {}, de: {} });
    const initialLang = detectInitialLang();
    applyTranslations(initialLang);

    loadedConcerts = await loadJSON('concerts.json', []);
    renderConcerts(loadedConcerts);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
