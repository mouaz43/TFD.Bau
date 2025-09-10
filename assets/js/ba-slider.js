/* Better Before/After slider — centered by default, drag/click/keyboard, clip-path reveal */
(function(){
  function initBASlider(id, startPct = 50){
    const wrap = document.getElementById(id);
    if(!wrap) return;
    const top = wrap.querySelector('.top');
    const handle = wrap.querySelector('.handle');
    if(!top || !handle){ return; }

    wrap.classList.add('ba-ready');

    function setPos(pct){
      pct = Math.max(0, Math.min(100, pct));
      top.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
      handle.style.left = pct + '%';
      handle.setAttribute('aria-valuenow', Math.round(pct));
    }
    setPos(startPct); // start centered

    // drag/click support
    let dragging = false;
    const startDrag = (e)=>{ dragging = true; wrap.classList.add('dragging'); move(e); };
    const endDrag = ()=>{ dragging = false; wrap.classList.remove('dragging'); };
    const move = (e)=>{
      if(!dragging) return;
      const rect = wrap.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const pct = ((clientX - rect.left)/rect.width)*100;
      setPos(pct);
    };
    handle.addEventListener('mousedown', startDrag);
    window.addEventListener('mouseup', endDrag);
    wrap.addEventListener('mousemove', move);
    handle.addEventListener('touchstart', startDrag, {passive:true});
    window.addEventListener('touchend', endDrag);
    wrap.addEventListener('touchmove', move, {passive:true});

    // click anywhere to jump
    wrap.addEventListener('click', (e)=>{
      if(e.target === handle) return;
      const rect = wrap.getBoundingClientRect();
      const pct = ((e.clientX - rect.left)/rect.width)*100;
      setPos(pct);
    });

    // accessibility / keyboard
    handle.tabIndex = 0;
    handle.setAttribute('role','slider');
    handle.setAttribute('aria-label','Vorher/Nachher Schieber');
    handle.setAttribute('aria-valuemin','0');
    handle.setAttribute('aria-valuemax','100');
    handle.addEventListener('keydown', (e)=>{
      const cur = parseFloat(handle.style.left) || startPct;
      if(e.key==='ArrowLeft' || e.key==='ArrowDown'){ e.preventDefault(); setPos(cur - 2); }
      if(e.key==='ArrowRight' || e.key==='ArrowUp'){ e.preventDefault(); setPos(cur + 2); }
      if(e.key==='Home'){ e.preventDefault(); setPos(0); }
      if(e.key==='End'){ e.preventDefault(); setPos(100); }
    });
  }
  window.initBASlider = initBASlider;
})();
