/* === Config (adjust if needed) === */
const PHONE_INTL = '+4915770070701';
const EMAIL_TO   = 'Almamo@tfd-bau.de';
// Optional: if you later add a real endpoint (Apps Script/Formspree), put it here:
const FORMS_ENDPOINT = ''; // e.g. 'https://script.google.com/macros/s/XXXXX/exec'

/* === Mobile menu (if you use it) === */
document.querySelector('[data-menu-btn]')?.addEventListener('click', () => {
  document.querySelector('.site-menu')?.classList.toggle('open');
});

/* === Hero video smart control === */
const hero = document.getElementById('heroVideo');
const heroBtn = document.getElementById('heroToggle');

if (hero && heroBtn) {
  heroBtn.addEventListener('click', () => {
    if (hero.paused) { hero.play(); heroBtn.textContent = '⏸'; }
    else { hero.pause(); heroBtn.textContent = '▶︎'; }
  });

  // Autoplay hint on iOS
  hero.addEventListener('playing', () => heroBtn.textContent = '⏸');
  hero.addEventListener('pause',   () => heroBtn.textContent = '▶︎');
}

/* === Subtle parallax for ambient grid === */
let lastY = window.scrollY;
const onScroll = () => {
  const dy = window.scrollY - lastY;
  lastY = window.scrollY;
  // nothing heavy—just a tiny redraw to keep background alive
  document.body.style.setProperty('--scroll', String(window.scrollY));
};
window.addEventListener('scroll', onScroll, { passive: true });

/* === Sticky mobile CTA show after slight scroll === */
const mobileCta = document.getElementById('mobileCta');
let ctaShown = false;
const maybeShowCta = () => {
  if (!mobileCta) return;
  if (window.scrollY > 220 && !ctaShown) {
    mobileCta.style.transform = 'translateX(-50%) translateY(0)';
    ctaShown = true;
  }
};
window.addEventListener('scroll', maybeShowCta, { passive: true });

/* === Projekt-Brief handling === */
const form = document.getElementById('briefForm');
const success = document.getElementById('briefSuccess');

const uploadInput = form?.querySelector('input[type=file]');
const uploadName = document.querySelector('[data-upload-name]');
uploadInput?.addEventListener('change', (e) => {
  const f = e.target.files?.[0];
  uploadName.textContent = f ? f.name : 'Kein Foto gewählt';
});

function buildMailtoBody(data) {
  const lines = [
    `Name: ${data.get('name') || ''}`,
    `Telefon: ${data.get('phone') || ''}`,
    `E-Mail: ${data.get('email') || ''}`,
    `Ort/PLZ: ${data.get('city') || ''}`,
    `Fläche (m²): ${data.get('qm') || ''}`,
    `Kategorie: ${data.get('category') || ''}`,
    '',
    'Beschreibung:',
    (data.get('desc') || ''),
    '',
    '(Hinweis: Dateiupload wird separat nachgereicht.)'
  ];
  return encodeURIComponent(lines.join('\n'));
}

form?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const fd = new FormData(form);
  // Simple validation
  const required = ['name','phone','desc','privacy'];
  for (const k of required) {
    const v = fd.get(k);
    if (!v || (k==='privacy' && v !== 'on')) {
      alert('Bitte füllen Sie alle Pflichtfelder aus und akzeptieren Sie den Datenschutz.');
      return;
    }
  }

  // If you later configure FORMS_ENDPOINT, this sends to your sheet/backend
  if (FORMS_ENDPOINT) {
    try {
      const res = await fetch(FORMS_ENDPOINT, { method:'POST', body: fd });
      if (!res.ok) throw new Error('Fehler beim Senden');
    } catch (err) {
      console.error(err);
      // fallback to mailto below
    }
  }

  // Fallback: open mail client prefilled (works everywhere)
  const subject = encodeURIComponent('TFD Projekt-Brief (Website)');
  const body = buildMailtoBody(fd);
  const mailto = `mailto:${EMAIL_TO}?subject=${subject}&body=${body}`;
  window.location.href = mailto;

  // Show success UI
  success?.classList.remove('hidden');
  form?.classList.add('hidden');
});

/* ===== Tiny QoL: close WhatsApp FAB on small screens until user scrolls ===== */
const waFab = document.querySelector('.wa-fab');
setTimeout(() => { waFab?.classList.add('visible'); }, 6000);
