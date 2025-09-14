/* /assets/js/site.js — right-side drawer, works on every page */
(function () {
  const $ = (s, r=document) => r.querySelector(s);

  function wireDrawer() {
    const toggle  = $('#menuToggle') || $('.menu-toggle');
    const panel   = $('#menuPanel')  || $('.site-header .site-menu');
    if (!toggle || !panel) return;

    // Backdrop (reuse if present, else create)
    let backdrop = $('#menuBackdrop') || $('.menu-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'menu-backdrop';
      backdrop.id = 'menuBackdrop';
      document.body.appendChild(backdrop);
    }

    const open = () => {
      panel.classList.add('open');
      backdrop.classList.add('show');
      document.body.classList.add('menu-locked');
      toggle.setAttribute('aria-expanded', 'true');
      panel.setAttribute('aria-hidden', 'false');
    };
    const close = () => {
      panel.classList.remove('open');
      backdrop.classList.remove('show');
      document.body.classList.remove('menu-locked');
      toggle.setAttribute('aria-expanded', 'false');
      panel.setAttribute('aria-hidden', 'true');
    };

    // Avoid double-binding if main.js already ran
    if (!toggle.dataset.bound) {
      toggle.dataset.bound = '1';
      toggle.addEventListener('click', (e) => {
        e.preventDefault();
        panel.classList.contains('open') ? close() : open();
      });
    }

    const closeBtn = $('#menuClose') || panel.querySelector('.menu-close');
    closeBtn && closeBtn.addEventListener('click', close);
    backdrop.addEventListener('click', close);
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
    panel.addEventListener('click', (e) => { if (e.target.tagName === 'A') close(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', wireDrawer);
  } else {
    wireDrawer();
  }
})();
