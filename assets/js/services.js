// Lazy-load and auto-play/pause service videos + hero video
(function () {
  const toObserve = Array.from(document.querySelectorAll('video[data-src]'));

  // Swap data-src -> src at first intersection, then try to play
  const onEnter = (el) => {
    if (!el.getAttribute('src')) {
      el.src = el.dataset.src;
      el.load();
    }
    // iOS/Safari needs muted+playsinline (already in HTML)
    const tryPlay = () => el.play().catch(() => {});
    if (el.readyState >= 2) tryPlay(); else el.addEventListener('canplay', tryPlay, { once: true });
  };

  const onExit = (el) => {
    // Pause to save CPU/GPU when scrolled away
    try { el.pause(); } catch {}
  };

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      const v = entry.target;
      if (entry.isIntersecting) onEnter(v); else onExit(v);
    });
  }, { rootMargin: '120px 0px', threshold: 0.15 });

  toObserve.forEach(v => io.observe(v));

  // Optional: click anywhere on video to toggle play/pause
  document.addEventListener('click', (e) => {
    const v = e.target.closest('video');
    if (!v) return;
    if (v.paused) v.play().catch(()=>{}); else v.pause();
  });
})();
