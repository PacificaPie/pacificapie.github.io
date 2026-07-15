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
  // Splash — time-driven one-shot cover (CSS animates the exit).
  // After it has fully played (≤1.5s) remove it from the tree so
  // it can never intercept anything.
  // ----------------------------------------------------------
  function setupSplashTimed() {
    const splash = document.querySelector('.splash');
    if (!splash) return;
    window.setTimeout(() => {
      splash.remove();
    }, 1600);
  }

  // ----------------------------------------------------------
  // Trigger color-block hero animation once the splash cover has
  // faded (time-driven, ≤1.5s), so the bands slide in exactly as
  // the hero is revealed. Pages without a splash animate when the
  // hero scrolls into view.
  // ----------------------------------------------------------
  function setupHeroBandTrigger() {
    const hero = document.querySelector('.hero');
    if (!hero) return;

    const reducedMotion =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const splash = document.querySelector('.splash');
    const delay = splash && !reducedMotion ? 1050 : 0;

    function observe() {
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

    if (delay > 0) window.setTimeout(observe, delay);
    else observe();
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

  // ----------------------------------------------------------
  // Project constellation (index page only)
  // (a) node click/keyboard navigation
  // (b) restrained programmatic starfield on <canvas>
  //     — rAF, < 100 particles, paused when offscreen,
  //       static frame under prefers-reduced-motion
  // ----------------------------------------------------------
  function setupConstellation() {
    const container = document.getElementById('constellation');
    if (!container) return;

    // --- (a) node navigation ---
    const nodes = Array.from(container.querySelectorAll('.constellation-node'));
    function go(node) {
      const href = node.dataset.href;
      if (!href) return;
      if (node.dataset.external) {
        window.open(href, '_blank', 'noopener');
      } else {
        window.location.href = href;
      }
    }
    nodes.forEach((node) => {
      node.addEventListener('click', (e) => {
        // let real links inside the card (e.g. GitHub badge) work on their own
        if (e.target.closest('a')) return;
        go(node);
      });
      node.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          go(node);
        }
      });
    });

    // --- (b) starfield ---
    const canvas = container.querySelector('canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const reducedMotion =
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const TINTS = [
      [244, 228, 188], // cream
      [229, 181, 61],  // saffron
      [182, 197, 212], // pale blue
      [201, 181, 209], // pale lilac
    ];

    let w = 0;
    let h = 0;
    let stars = [];
    let rafId = null;
    let visible = false;

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = container.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      makeStars();
      if (reducedMotion || !visible) draw(performance.now());
    }

    function makeStars() {
      const count = Math.min(70, Math.max(30, Math.round((w * h) / 9000)));
      stars = [];
      for (let i = 0; i < count; i += 1) {
        const tint = TINTS[Math.floor(Math.random() * TINTS.length)];
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: 0.5 + Math.random() * 1.3,
          tint,
          base: 0.12 + Math.random() * 0.35,
          phase: Math.random() * Math.PI * 2,
          twinkle: 0.6 + Math.random() * 1.2,   // rad/s
          vx: (Math.random() - 0.5) * 3,        // px/s — slow drift
          vy: (Math.random() - 0.5) * 2,
        });
      }
    }

    function nodeCenters() {
      return nodes.map((n) => ({
        x: (parseFloat(n.style.getPropertyValue('--x')) / 100) * w,
        y: (parseFloat(n.style.getPropertyValue('--y')) / 100) * h,
      }));
    }

    let last = performance.now();
    function draw(now) {
      const dt = Math.min((now - last) / 1000, 0.1);
      last = now;
      ctx.clearRect(0, 0, w, h);

      // faint constellation lines between neighboring nodes (sorted by x)
      const centers = nodeCenters().sort((a, b) => a.x - b.x);
      ctx.strokeStyle = 'rgba(244, 228, 188, 0.12)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      centers.forEach((c, i) => {
        if (i === 0) ctx.moveTo(c.x, c.y);
        else ctx.lineTo(c.x, c.y);
      });
      ctx.stroke();

      // stars
      const t = now / 1000;
      stars.forEach((s) => {
        if (!reducedMotion) {
          s.x += s.vx * dt;
          s.y += s.vy * dt;
          if (s.x < -2) s.x = w + 2;
          if (s.x > w + 2) s.x = -2;
          if (s.y < -2) s.y = h + 2;
          if (s.y > h + 2) s.y = -2;
        }
        const alpha = reducedMotion
          ? s.base
          : s.base * (0.55 + 0.45 * Math.sin(s.phase + t * s.twinkle));
        ctx.beginPath();
        ctx.fillStyle = `rgba(${s.tint[0]}, ${s.tint[1]}, ${s.tint[2]}, ${Math.max(alpha, 0.04)})`;
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });
    }

    function loop(now) {
      draw(now);
      rafId = window.requestAnimationFrame(loop);
    }
    function start() {
      if (rafId !== null || reducedMotion) return;
      last = performance.now();
      rafId = window.requestAnimationFrame(loop);
    }
    function stop() {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
        rafId = null;
      }
    }

    resize();
    window.addEventListener('resize', resize, { passive: true });

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            visible = entry.isIntersecting;
            if (visible) start();
            else stop();
          });
        },
        { threshold: 0.05 }
      );
      io.observe(container);
    } else {
      visible = true;
      start();
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    setLang(getInitialLang());
    bindToggles();
    setupSplashTimed();
    setupHeroBandTrigger();
    setupFadeIn();
    setupConstellation();
  });
})();
