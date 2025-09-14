/* /assets/js/site.js — universal drawer wiring (right side) */
(function () {
  const $  = (s, r=document) => r.querySelector(s);

  document.addEventListener('DOMContentLoaded', () => {
    // Support BOTH markups — pick what exists on this page
    const toggle = $('#menuToggle') || $('.menu-toggle');
    const panel  = $('#menuPanel') || $('.site-header .site-menu');
    if (!toggle || !panel) return;

    // Backdrop: reuse if present, else create
    let backdrop = $('#menuBackdrop') || $('.menu-backdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.className = 'menu-backdrop';
      backdrop.id = 'menuBackdrop';
      document.body.appendChild(backdrop);
    }

    // Avoid double-binding
    if (toggle.dataset.bound) return;
    toggle.dataset.bound = '1';

    const open = () => {
      panel.classList.add('open');
      backdrop.classList.add('show');
      document.body.classList.add('menu-locked');
      toggle.setAttribute('aria-expanded','true');
      panel.setAttribute('aria-hidden','false');
    };
    const close = () => {
      panel.classList.remove('open');
      backdrop.classList.remove('show');
      document.body.classList.remove('menu-locked');
      toggle.setAttribute('aria-expanded','false');
      panel.setAttribute('aria-hidden','true');
    };

    toggle.addEventListener('click', (e) => {
      e.preventDefault();
      panel.classList.contains('open') ? close() : open();
    });

    // Optional close button inside panel
    const closeBtn = $('#menuClose') || panel.querySelector('.menu-close');
    closeBtn && closeBtn.addEventListener('click', close);

    backdrop.addEventListener('click', close);
    window.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

    // Close when clicking a link in drawer
    panel.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') close();
    });
  });
})();
