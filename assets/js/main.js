// Year
document.addEventListener('DOMContentLoaded', () => {
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
  initMenu();
});

// Slide-in menu logic
function initMenu(){
  const btn = document.getElementById('menuToggle');
  const panel = document.getElementById('menuPanel');
  const closeBtn = document.getElementById('menuClose');
  const backdrop = document.getElementById('menuBackdrop');
  if(!btn || !panel || !backdrop) return;

  const open = () => {
    panel.classList.add('open'); backdrop.classList.add('open');
    btn.setAttribute('aria-expanded','true'); panel.setAttribute('aria-hidden','false');
  };
  const close = () => {
    panel.classList.remove('open'); backdrop.classList.remove('open');
    btn.setAttribute('aria-expanded','false'); panel.setAttribute('aria-hidden','true');
  };

  btn.addEventListener('click', () => panel.classList.contains('open') ? close() : open());
  closeBtn && closeBtn.addEventListener('click', close);
  backdrop.addEventListener('click', close);
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') close(); });
}
