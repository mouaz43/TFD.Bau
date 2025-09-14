/* services.js — iOS-safe mobile menu + video lazy-load/autoplay */

(function () {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const debounce = (fn, ms = 150) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };
  const isMobile = () => window.innerWidth <= 900;

  // ===== 1) MOBILE MENU =====
  document.addEventListener('DOMContentLoaded', () => {
    try {
      const header = $('.site-header');
      const btn    = header && $('.menu-toggle', header);
      const nav    = header && $('.site-menu', header);
      if (!header || !btn || !nav) return;

      const applyLayout = () => {
        if (isMobile()) {
          btn.style.display = 'inline-flex';
          nav.classList.remove('open');                     // closed by default
          document.body.classList.remove('menu-locked');
          header.classList.remove('menu-open');
          btn.setAttribute('aria-expanded', 'false');
          btn.textContent = '☰ Menü';
        } else {
          btn.style.display = 'none';
          nav.classList.remove('open');
          document.body.classList.remove('menu-locked');
          header.classList.remove('menu-open');
        }
      };

      const openMenu  = () => {
        header.classList.add('menu-open');
        nav.classList.add('open');
        document.body.classList.add('menu-locked');
        btn.setAttribute('aria-expanded', 'true');
        btn.textContent = '× Schließen';
      };
      const closeMenu = () => {
        header.classList.remove('menu-open');
        nav.classList.remove('open');
        document.body.classList.remove('menu-locked');
        btn.setAttribute('aria-expanded', 'false');
        btn.textContent = '☰ Menü';
      };

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        header.classList.contains('menu-open') ? closeMenu() : openMenu();
      });

      // Close when tapping a link
      nav.addEventListener('click', (e) => {
        if (isMobile() && e.target.tagName === 'A') closeMenu();
      });

      // ESC to close
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && header.classList.contains('menu-open')) closeMenu();
      });

      window.addEventListener('resize', debounce(applyLayout, 100));
      applyLayout();
    } catch (err) { console.error('Menu init error:', err); }
  });

  // ===== 2) LAZY-LOAD VIDEOS (hero + service cards) =====
  document.addEventListener('DOMContentLoaded', () => {
    try {
      const videos = $$('video[data-src], .intro-video, .service-video');

      const loadVideo = (video) => {
        if (!video) return;
        if (video.dataset && video.dataset.src && !video.src) video.src = video.dataset.src;
        // iOS autoplay requirements
        video.muted = true;
        video.playsInline = true;
        video.autoplay = true;
        video.loop = true;
        video.controls = false;

        const tryPlay = () => {
          const p = video.play();
          if (p && p.catch) {
            p.catch(() => {
              const unlock = () => { video.play().catch(() => {}); window.removeEventListener('pointerdown', unlock); };
              window.addEventListener('pointerdown', unlock, { once: true });
            });
          }
        };
        if (video.readyState >= 1) tryPlay();
        else video.addEventListener('loadedmetadata', tryPlay, { once: true });
      };

      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries, obs) => {
          entries.forEach((en) => { if (en.isIntersecting) { loadVideo(en.target); obs.unobserve(en.target); } });
        }, { rootMargin: '200px 0px' });
        videos.forEach(v => io.observe(v));
      } else {
        videos.forEach(loadVideo);
      }
    } catch (err) { console.error('Video init error:', err); }
  });
})();
