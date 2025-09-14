/* services.js — mobile menu (iOS-safe) + video lazy-load & autoplay */

(function () {
  // Tiny helper
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const debounce = (fn, ms = 150) => {
    let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  };
  const isMobile = () => window.innerWidth <= 900;

  // =========================
  // 1) MOBILE MENU TOGGLE
  // =========================
  document.addEventListener('DOMContentLoaded', () => {
    try {
      const header = $('.site-header');
      if (!header) return;

      const btn = $('.menu-toggle', header);
      const nav = $('.site-menu', header);
      if (!btn || !nav) return;

      const applyLayout = () => {
        if (isMobile()) {
          // Show button, hide nav until opened
          btn.style.display = 'inline-flex';
          if (header.classList.contains('menu-open')) {
            nav.style.display = 'grid';     // stack links for mobile
          } else {
            nav.style.display = 'none';
          }
        } else {
          // Desktop: show nav, hide button
          btn.style.display = 'none';
          nav.style.display = 'flex';       // your CSS can override to inline/flex
          header.classList.remove('menu-open');
        }
      };

      const toggleMenu = (open) => {
        const willOpen = typeof open === 'boolean' ? open : !header.classList.contains('menu-open');
        if (willOpen) {
          header.classList.add('menu-open');
          nav.style.display = 'grid';
          btn.setAttribute('aria-expanded', 'true');
        } else {
          header.classList.remove('menu-open');
          nav.style.display = 'none';
          btn.setAttribute('aria-expanded', 'false');
        }
      };

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleMenu();
      });

      // Close when clicking a link (mobile)
      nav.addEventListener('click', (e) => {
        if (isMobile() && e.target.tagName === 'A') toggleMenu(false);
      });

      // Close when clicking outside (mobile)
      document.addEventListener('click', (e) => {
        if (!isMobile()) return;
        if (!header.contains(e.target)) toggleMenu(false);
      });

      // Close on ESC
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isMobile()) toggleMenu(false);
      });

      window.addEventListener('resize', debounce(applyLayout, 100));
      applyLayout();
    } catch (err) {
      // Never let this block kill the rest
      console.error('Menu init error:', err);
    }
  });

  // =========================
  // 2) LAZY-LOAD VIDEOS
  // =========================
  document.addEventListener('DOMContentLoaded', () => {
    try {
      const videos = $$('video[data-src], .intro-video, .service-video');

      const loadVideo = (video) => {
        if (!video) return;
        // Copy data-src -> src once
        if (video.dataset && video.dataset.src && !video.src) {
          video.src = video.dataset.src;
        }
        // iOS autoplay requirements
        video.muted = true;
        video.playsInline = true;
        video.autoplay = true;
        video.loop = true;
        video.controls = false;

        const tryPlay = () => {
          const p = video.play();
          if (p && typeof p.catch === 'function') {
            p.catch(() => {
              // Unlock on first user interaction if autoplay still blocked
              const unlock = () => {
                video.play().catch(() => {});
                window.removeEventListener('pointerdown', unlock);
              };
              window.addEventListener('pointerdown', unlock, { once: true });
            });
          }
        };

        if (video.readyState >= 1) tryPlay();
        else video.addEventListener('loadedmetadata', tryPlay, { once: true });
      };

      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              loadVideo(entry.target);
              obs.unobserve(entry.target);
            }
          });
        }, { rootMargin: '200px 0px' });

        videos.forEach(v => io.observe(v));
      } else {
        // Fallback: load immediately
        videos.forEach(loadVideo);
      }
    } catch (err) {
      console.error('Video init error:', err);
    }
  });
})();
