function initBASlider(id, start = 50){
  const el = document.getElementById(id); if(!el) return;
  const top = el.querySelector('.top'); const handle = el.querySelector('.handle');
  const rect = ()=> el.getBoundingClientRect();
  const set = (p)=>{ p=Math.max(0,Math.min(100,p)); top.style.width=p+'%'; handle.style.left=p+'%'; };
  set(start);
  const toPct = (clientX)=> ((clientX - rect().left) / rect().width) * 100;
  const drag = (e)=> set(toPct(e.touches?e.touches[0].clientX:e.clientX));
  const stop = ()=>{ document.removeEventListener('mousemove',drag); document.removeEventListener('touchmove',drag); };
  el.addEventListener('mousedown', e=>{ drag(e); document.addEventListener('mousemove',drag); document.addEventListener('mouseup',stop); });
  el.addEventListener('touchstart', e=>{ drag(e); document.addEventListener('touchmove',drag,{passive:false}); document.addEventListener('touchend',stop); }, {passive:false});
}
