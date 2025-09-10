/* TFD UI v2 scripts: menu drawer, year, reveals, optional tilt */

(function(){
  // Year in footer
  const y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();

  // Drawer
  const panel = document.getElementById('menuPanel');
  const backdrop = document.getElementById('menuBackdrop');
  const openBtn = document.getElementById('menuToggle');
  const closeBtn = document.getElementById('menuClose');
  function open(){ if(panel){ panel.setAttribute('aria-hidden','false'); } }
  function close(){ if(panel){ panel.setAttribute('aria-hidden','true'); } }
  if(openBtn) openBtn.addEventListener('click', open);
  if(closeBtn) closeBtn.addEventListener('click', close);
  if(backdrop) backdrop.addEventListener('click', close);
  window.addEventListener('keydown', (e)=>{ if(e.key==='Escape') close(); });

  // Scroll reveal
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(e=>{ if(e.isIntersecting){ e.target.classList.add('is-visible'); io.unobserve(e.target);} });
  }, { rootMargin: "0px 0px -80px 0px", threshold: .1 });
  document.querySelectorAll('.reveal').forEach(el=> io.observe(el));

  // Optional tilt (add class "tilt" to any card)
  document.querySelectorAll('.tilt').forEach(card=>{
    let rAF = null;
    function onMove(e){
      const b = card.getBoundingClientRect();
      const x = (e.clientX - b.left)/b.width - .5;
      const y = (e.clientY - b.top)/b.height - .5;
      if(rAF) cancelAnimationFrame(rAF);
      rAF = requestAnimationFrame(()=> card.style.transform = `perspective(800px) rotateY(${x*6}deg) rotateX(${ -y*6}deg) translateY(-2px)`);
    }
    function reset(){ card.style.transform=''; }
    card.addEventListener('mousemove', onMove);
    card.addEventListener('mouseleave', reset);
  });
})();
