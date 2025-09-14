/* services.js — mobile menu + video lazy-load */

document.addEventListener('DOMContentLoaded', () => {
  // ====== MOBILE MENU TOGGLE ======
  const header = document.querySelector('.site-header');
  const btn    = document.querySelector('.site-header .menu-toggle');
  const nav    = document.querySelector('.site-header .site-menu');
  const mq     = window.matchMedia('(max-width: 900px)');

  if (header && btn && nav) {
    // Default layout depending on screen width
    const applyLayout = () => {
      if (mq.matches) {
        // Mobile: hide nav by default, show button
        btn.style.display = 'inline-flex';
        if (!btn.hasAttribute('aria-expanded')) btn.setAttribute('aria-expanded', 'false');
        nav.style.display = 'none';
      } else {
        // Desktop: show nav, hide button
        btn.style.display = 'none';
        btn.setAttribute('aria-expanded', 'false');
        nav.style.display = 'flex'; // your CSS may override to inline/flex
      }
    };

    const openMenu = () => {
      btn.setAttribute('aria-expanded', 'true');
      nav.style.display = 'grid';     // stacked links for mobile
      header.classList.add('menu-open');
    };

    const closeMenu = () => {
      btn.setAttribute('aria-expanded', 'false');
      nav.style.display = 'none';
      header.classList.remove('menu-open');
    };

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      expanded ? closeMenu() : openMenu();
    });

    // Close on link click (mobile)
    nav.addEventListener('click', (e) => {
      if (mq.matches && e.target.tagName === 'A') closeMenu();
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!mq.matches) return;
      if (!header.contains(e.target)) closeMenu();
    });

    // Close on ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && mq.matches) closeMenu();
    });

    applyLayout();
    mq.addEventListener('change', applyLayout);
  }

  // ====== LAZY-LOAD VIDEOS (intro + service cards) ======
  const videos = Array.from(document.querySelectorAll('.intro-video, .service-video'));
  if (videos.length) {
    const loadVideo = (video) => {
      if (video.dataset.src && !video.src) {
        video.src = video.dataset.src;
      }
      // iOS autoplay safety
      video.muted = true;
      video.playsInline = true;
      video.loop = true;
      const tryPlay = () => video.play().catch(() => {
        // fallback: wait for first tap
        const unlock = () => { video.play().catch(()=>{}); window.removeEventListener('pointerdown', unlock); };
        window.addEventListener('pointerdown', unlock, { once: true });
      });
      if (video.readyState >= 1) tryPlay();
      else video.addEventListener('loadedmetadata', tryPlay, { once: true });
    };

    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries, obs) => {
       
