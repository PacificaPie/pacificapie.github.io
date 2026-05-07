// =========================================================
// Pacifica Zhang — site script
// (1) Language toggle EN / 中
// (2) Splash scroll-leave (fallback for browsers without
//     scroll-driven CSS animations)
// (3) Hero color-blocks animate when scrolled into view
// (4) Subtle scroll-in fade
// =========================================================

(function () {
  const STORAGE_KEY = 'pz-lang';
  const root = document.documentElement;

  function getInitialLang() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'en' || saved === 'zh') return saved;
    const browserLang = (navigator.language || 'en').toLowerCase();
    return browserLang.startsWith('zh') ? 'zh' : 'en';
  }

  function setLang(lang) {
    root.setAttribute('lang', lang);
    localStorage.setItem(STORAGE_KEY, lang);
    document.querySelectorAll('.lang-toggle').forEach((btn) => {
      btn.textContent = lang === 'en' ? '中文' : 'EN';
      btn.setAttribute('aria-label', lang === 'en' ? 'Switch to Chinese' : 'Switch to English');
    });
    const titleEl = document.querySelector('title');
    if (titleEl && titleEl.dataset.en && titleEl.dataset.zh) {
      titleEl.textContent = titleEl.dataset[lang];
    }
  }

  function bindToggles() {
    document.querySelectorAll('.lang-toggle').forEach((btn) => {
      btn.addEventListener('click', () => {
        const current = root.getAttribute('lang') || 'en';
        setLang(current === 'en' ? 'zh' : 'en');
      });
    });
  }

  // ----------------------------------------------------------
  // Splash scroll-leave fallback
  // CSS already handles this in browsers that support
  // `animation-timeline: scroll()`. For others we fall back to
  // a JS scroll listener that mirrors the same effect.
  // ----------------------------------------------------------
  function setupSplashFallback() {
    const supportsScrollTimeline =
      typeof CSS !== 'undefined' &&
      CSS.supports &&
      CSS.supports('animation-timeline: scroll()');
    if (supportsScrollTimeline) return;

    const splashInner = document.querySelector('.splash-inner');
    const splashHint = document.querySelector('.splash-scroll-hint');
    if (!splashInner) return;

    splashInner.classList.add('js-scroll-fade');
    if (splashHint) splashHint.classList.add('js-scroll-fade');

    let ticking = false;

    function update() {
      const scrollY = window.scrollY;
      const vh = window.innerHeight;
      const innerProgress = Math.min(scrollY / (vh * 0.9), 1);
      const hintProgress = Math.min(scrollY / (vh * 0.25), 1);

      splashInner.style.opacity = String(1 - innerProgress);
      splashInner.style.transform = `translateY(${-innerProgress * 22}vh)`;

      if (splashHint) {
        splashHint.style.opacity = String(1 - hintProgress);
        splashHint.style.transform = `translate(-50%, ${hintProgress * 24}px)`;
      }

      ticking = false;
    }

    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          window.requestAnimationFrame(update);
          ticking = true;
        }
      },
      { passive: true }
    );

    // Initial state in case user lands mid-page (refresh + scroll)
    update();
  }

  // ----------------------------------------------------------
  // Trigger color-block hero animation when it enters viewport,
  // not on page load. (Otherwise the bands animate while the
  // user is still on the splash and the moment is wasted.)
  // ----------------------------------------------------------
  function setupHeroBandTrigger() {
    const hero = document.querySelector('.hero');
    if (!hero) return;
    if (!('IntersectionObserver' in window)) {
      hero.classList.add('animated');
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animated');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );
    io.observe(hero);
  }

  // ----------------------------------------------------------
  // Generic fade-in for sections
  // ----------------------------------------------------------
  function setupFadeIn() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.fade-in').forEach((el) => el.classList.add('visible'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.05 }
    );
    document.querySelectorAll('.fade-in').forEach((el) => io.observe(el));
  }

  document.addEventListener('DOMContentLoaded', () => {
    setLang(getInitialLang());
    bindToggles();
    setupSplashFallback();
    setupHeroBandTrigger();
    setupFadeIn();
  });
})();
