/* services.js — RIGHT drawer + lazy videos */
(function () {
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const isMobile = () => window.innerWidth <= 900;

  document.addEventListener('DOMContentLoaded', () => {
    const header = $('.site-header');
    const btn    = header && $('.menu-toggle', header);
    const nav    = header && $('.site-menu', header);
    if (!header || !btn || !nav) return;

    // make sure nav exists on desktop too
    nav.style.display = 'flex';

    // create one backdrop
    let backdrop = $('.menu-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'menu-backdrop';
      document.body.appendChild(backdrop);
    }

    const openMenu = () => {
      header.classList.add('menu-open');
      nav.classList.add('open');
      backdrop.classList.add('show');
      document.body.classList.add('menu-locked');
      btn.setAttribute('aria-expanded','true');
    };
    const closeMenu = () => {
      header.classList.remove('menu-open');
      nav.classList.remove('open');
      backdrop.classList.remove('show');
      document.body.classList.remove('menu-locked');
      btn.setAttribute('aria-expanded','false');
    };

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      header.classList.contains('menu-open') ? closeMenu() : openMenu();
    });
    backdrop.addEventListener('click', closeMenu);
    nav.addEventListener('click', (e) => {
      if (isMobile() && e.target.tagName === 'A') closeMenu();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && header.classList.contains('menu-open')) closeMenu();
    });

    const apply = () => {
      if (isMobile()) { btn.style.display = 'inline-flex'; closeMenu(); }
      else { btn.style.display = 'none'; closeMenu(); }
    };
    window.addEventListener('resize', apply);
    apply();
  });

  /* ---- lazy video loading (hero + cards) ---- */
  document.addEventListener('DOMContentLoaded', () => {
    const vids = $$('video[data-src], .intro-video, .service-video');
    const loadVideo = (v) => {
      if (!v) return;
      if (v.dataset && v.dataset.src && !v.src) v.src = v.dataset.src;
      v.muted = true; v.playsInline = true; v.autoplay = true; v.loop = true; v.controls = false;
      const tryPlay = () => {
        const p = v.play();
        if (p && p.catch) {
          p.catch(() => {
            const unlock = () => { v.play().catch(()=>{}); window.removeEventListener('pointerdown', unlock); };
            window.addEventListener('pointerdown', unlock, { once: true });
          });
        }
      };
      if (v.readyState >= 1) tryPlay();
      else v.addEventListener('loadedmetadata', tryPlay, { once: true });
    };

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((es, o) => {
        es.forEach(en => { if (en.isIntersecting) { loadVideo(en.target); o.unobserve(en.target); } });
      }, { rootMargin: '200px 0px' });
      vids.forEach(v => io.observe(v));
    } else {
      vids.forEach(loadVideo);
    }
  });
})();
