// Simple before/after slider (drag + touch)
function initBASlider(rootId, start=50){
  const root = document.getElementById(rootId);
  if(!root) return;
  const top = root.querySelector('.top');
  const handle = root.querySelector('.handle');
  function setPct(p){ const pct = p + '%'; top.style.width = pct; handle.style.left = pct; }
  setPct(start);

  let dragging = false;
  function pos(e){
    const r = root.getBoundingClientRect();
    const clientX = (e.touches? e.touches[0].clientX : e.clientX);
    const x = clientX - r.left;
    const p = Math.max(0, Math.min(100, (x / r.width) * 100));
    setPct(p);
  }
  root.addEventListener('mousedown', (e)=>{ dragging = true; pos(e); });
  window.addEventListener('mousemove', (e)=>{ if(dragging) pos(e); });
  window.addEventListener('mouseup', ()=> dragging=false);
  root.addEventListener('touchstart', (e)=>{ dragging = true; pos(e); }, {passive:true});
  window.addEventListener('touchmove', (e)=>{ if(dragging) pos(e); }, {passive:true});
  window.addEventListener('touchend', ()=> dragging=false);
}
