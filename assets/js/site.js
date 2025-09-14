/* site.js — unified header drawer + lazy videos */
(function () {
  const $  = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));
  const isMobile = () => window.innerWidth <= 900;

  document.addEventListener('DOMContentLoaded', () => {
    const header = $('.site-header');
    const btn    = header?.querySelector('.menu-toggle');
    const nav    = header?.querySelector('.site-menu');
    if (!header || !btn || !nav) return;

    // Backdrop (one per page)
    let backdrop = $('.menu-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'menu-backdrop';
      document.body.appendChild(backdrop);
    }

    const open = () => {
      nav.classList.add('open');
      backdrop.classList.add('show');
      document.body.classList.add('menu-locked');
      btn.setAttribute('aria-expanded','true');
    };
    const close = () => {
      nav.classList.remove('open');
      backdrop.classList.remove('show');
      document.body.classList.remove('menu-locked');
      btn.setAttribute('aria-expanded','false');
    };

    btn.addEventListener('click', (e) => {
      e.preventDefault();
      nav.classList.contains('open') ? close() : open();
    });
    backdrop.addEventListener('click', close);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

    // Close when a link is tapped in the drawer
    nav.addEventListener('click', (e) => {
      if (isMobile() && e.target.tagName === 'A') close();
    });

    // Show toggle only on mobile
    const apply = () => {
      btn.style.display = isMobile() ? 'inline-flex' : 'none';
      if (!isMobile()) close();
    };
    window.addEventListener('resize', apply);
    apply();
  });

  // Lazy-load & autoplay videos marked with data-src
  document.addEventListener('DOMContentLoaded', () => {
    const vids = $$('video[data-src]');
    const load = (v) => {
      if (v.dataset?.src && !v.src) v.src = v.dataset.src;
      v.muted = true; v.playsInline = true; v.autoplay = true; v.loop = true; v.controls = false;
      const play = () => v.play().catch(()=>{});
      if (v.readyState >= 1) play(); else v.addEventListener('loadedmetadata', play, { once:true });
    };
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries,o)=>{
        entries.forEach(en=>{ if(en.isIntersecting){ load(en.target); o.unobserve(en.target); } });
      },{ rootMargin:'200px 0px' });
      vids.forEach(v=>io.observe(v));
    } else { vids.forEach(load); }
  });
})();
