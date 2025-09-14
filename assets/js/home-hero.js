// Ensure hero video plays (Safari/iOS can be picky)
document.addEventListener('DOMContentLoaded', () => {
  const v = document.getElementById('heroVideo');
  if (!v) return;

  // Defensive: try to play once metadata is ready
  const tryPlay = () => {
    v.muted = true;
    v.playsInline = true;
    v.loop = true;
    v.play().catch(() => {
      // If autoplay still blocked, try once on first user interaction
      const unlock = () => {
        v.play().catch(() => {});
        window.removeEventListener('pointerdown', unlock);
      };
      window.addEventListener('pointerdown', unlock, { once: true });
    });
  };

  if (v.readyState >= 1) tryPlay();
  else v.addEventListener('loadedmetadata', tryPlay, { once: true });

  // Mobile nav (if you want it)
  const burger = document.querySelector('.tfd-burger');
  const nav = document.querySelector('.tfd-nav');
  if (burger && nav) {
    burger.style.display = 'none'; // keep your desktop nav; enable if you need mobile
  }

  // Brief form -> compose email + WhatsApp
  const form = document.getElementById('briefForm');
  const waBtn = document.getElementById('waBtn');

  const buildMessage = () => {
    const fd = new FormData(form);
    const lines = [
      'Neue Projektanfrage (Web):',
      '',
      `Name: ${fd.get('name') || ''}`,
      `E-Mail: ${fd.get('email') || ''}`,
      `Telefon: ${fd.get('phone') || ''}`,
      `Ort/PLZ: ${fd.get('city') || ''}`,
      `Leistung: ${fd.get('service') || ''}`,
      `Fläche/Umfang: ${fd.get('scope') || ''}`,
      '',
      'Kurzbeschreibung:',
      (fd.get('desc') || '')
    ];
    return lines.join('\n');
  };

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const subject = encodeURIComponent('Projektanfrage über tfd-bau.de');
      const body = encodeURIComponent(buildMessage());
      window.location.href = `mailto:Almamo@tfd-bau.de?subject=${subject}&body=${body}`;
    });
  }

  if (waBtn && form) {
    waBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const text = encodeURIComponent(buildMessage());
      window.open(`https://wa.me/4915770070701?text=${text}`, '_blank', 'noopener');
    });
  }
});
