/* ============================================
   THE DOLL STUDIO — Script
============================================ */

/* ══════════════════════════════════════════════
   CONFIGURATION GOOGLE SHEETS
   ══════════════════════════════════════════════
   Pour connecter les disponibilités à Google Sheets :
   1. Crée un Google Sheet avec une feuille nommée "Dispos"
   2. Structure de la feuille :
      A1 : Semaine du 2 juin     B1 : (vide)
      A2 : Lundi                 B2 : 9h · 13h
      A3 : Mardi                 B3 : (vide si pas de dispo)
      A4 : Mercredi              B4 : 14h
      A5 : Jeudi                 B5 : 17h
      A6 : Vendredi              B6 : (vide)
      A7 : Samedi                B7 : (vide)
      A8 : Dimanche              B8 : (vide)
   3. Partager → Tous les utilisateurs avec le lien → Lecteur
   4. Copier l'ID de l'URL (entre /spreadsheets/d/ et /edit)
   5. Coller cet ID ci-dessous
══════════════════════════════════════════════ */
const GOOGLE_SHEET_ID = 'VOTRE_ID_ICI';

const FALLBACK_DISPOS = {
  semaine: 'Semaine du 25 mai',
  jours: [
    { jour: 'Lundi',    slot: '9h · 13h' },
    { jour: 'Mardi',    slot: '' },
    { jour: 'Mercredi', slot: '14h' },
    { jour: 'Jeudi',    slot: '17h' },
    { jour: 'Vendredi', slot: '' },
    { jour: 'Samedi',   slot: '' },
    { jour: 'Dimanche', slot: '' },
  ]
};

/* ── Nav scroll ────────────────────────────── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => nav.classList.toggle('scrolled', window.scrollY > 60), { passive: true });

/* ── Avatar fade au scroll ─────────────────── */
const avatarEl = document.querySelector('.hero__avatar');
if (avatarEl) {
  const FADE_START = 55;   // px de scroll avant que ça commence
  const FADE_RANGE = 220;  // px sur lesquels la photo disparaît
  window.addEventListener('scroll', () => {
    const t = Math.max(0, Math.min(1, 1 - (window.scrollY - FADE_START) / FADE_RANGE));
    avatarEl.style.opacity   = t;
    avatarEl.style.transform = `scale(${0.80 + 0.20 * t})`;
  }, { passive: true });
}

/* ── Animations au scroll ──────────────────── */
const scrollObserver = new IntersectionObserver(
  entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in-view'); scrollObserver.unobserve(e.target); } }),
  { threshold: 0.12, rootMargin: '0px 0px -30px 0px' }
);
document.querySelectorAll('[data-animate]').forEach((el, i) => {
  el.style.transitionDelay = `${i * 0.06}s`;
  scrollObserver.observe(el);
});

/* ══════════════════════════════════════════════
   ÉTAT DU BOOKING
══════════════════════════════════════════════ */
const booking = {
  jour:      null,
  heure:     null,
  prenom:    '',
  email:     '',
  instagram: '',
  service:   null,
  teinte:    '',
  message:   '',
};

/* ══════════════════════════════════════════════
   DISPONIBILITÉS — Google Sheets
══════════════════════════════════════════════ */
async function loadDisponibilites() {
  if (!GOOGLE_SHEET_ID || GOOGLE_SHEET_ID === 'VOTRE_ID_ICI') {
    renderDispos(FALLBACK_DISPOS);
    return;
  }
  try {
    const url = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Dispos`;
    const res  = await fetch(url);
    if (!res.ok) throw new Error();
    renderDispos(parseSheetCSV(await res.text()));
  } catch {
    renderDispos(FALLBACK_DISPOS);
  }
}

function parseSheetCSV(csv) {
  const rows = csv.trim().split('\n').map(line =>
    line.split(',').map(c => c.trim().replace(/^"|"$/g, ''))
  );
  return {
    semaine: rows[0]?.[0] || '',
    jours: rows.slice(1, 8).map(r => ({ jour: r[0] || '', slot: r[1] || '' })).filter(r => r.jour)
  };
}

function parseTimes(slotStr) {
  return slotStr ? slotStr.split('·').map(t => t.trim()).filter(Boolean) : [];
}

function renderDispos({ semaine, jours }) {
  document.getElementById('disposWeek').textContent = semaine;
  const grid = document.getElementById('daysGrid');
  grid.innerHTML = '';

  // Recalcule la hauteur du carousel une fois les jours rendus
  setTimeout(() => updateCarouselHeight(currentPanel), 50);

  jours.forEach((item, idx) => {
    const times     = parseTimes(item.slot);
    const available = times.length > 0;

    const card = document.createElement('div');
    card.className = 'day-card' + (!available ? ' day-card--off' : '') + (idx === 6 ? ' day-card--wide' : '');

    card.innerHTML = `
      <span class="day-card__name">${item.jour}</span>
      <span class="day-card__slot">${item.slot || '—'}</span>
    `;

    if (available) {
      card.addEventListener('click', () => selectDay(card, item.jour, times));
    }

    grid.appendChild(card);
  });
}

function selectDay(card, jour, times) {
  // Reset sélection précédente
  document.querySelectorAll('.day-card').forEach(c => c.classList.remove('day-card--selected'));
  card.classList.add('day-card--selected');
  booking.jour  = jour;
  booking.heure = null;

  // Afficher les créneaux horaires
  const slotsBox  = document.getElementById('timeSlots');
  const slotsGrid = document.getElementById('timeSlotsGrid');
  const label     = document.getElementById('timeSlotsLabel');

  label.textContent = `Créneaux — ${jour}`;
  slotsGrid.innerHTML = '';

  times.forEach(t => {
    const btn = document.createElement('button');
    btn.type      = 'button';
    btn.className = 'time-btn';
    btn.textContent = t;
    btn.addEventListener('click', () => selectTime(btn, t));
    slotsGrid.appendChild(btn);
  });

  slotsBox.classList.add('visible');
  // Recalcule la hauteur du carousel après l'animation des créneaux
  setTimeout(() => updateCarouselHeight(1), 370);
}

function selectTime(btn, heure) {
  document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('time-btn--selected'));
  btn.classList.add('time-btn--selected');
  booking.heure = heure;
  // Auto-avance vers le panel Profil après un bref délai
  setTimeout(() => { if (currentPanel === 1) nextPanel(); }, 380);
}

loadDisponibilites();

/* ══════════════════════════════════════════════
   PROFIL CLIENT — localStorage
══════════════════════════════════════════════ */
const CLIENT_KEY = 'tds_client';

function loadClientProfile() {
  try {
    const client = JSON.parse(localStorage.getItem(CLIENT_KEY) || '{}');
    if (!client.prenom) return;
    document.getElementById('prenomInput').value = client.prenom    || '';
    document.getElementById('emailInput').value  = client.email     || '';
    document.getElementById('instaInput').value  = client.instagram || '';
    document.getElementById('returningName').textContent = client.prenom;
    document.getElementById('clientReturning').style.display = 'block';
  } catch {}
}

function saveClientProfile() {
  try {
    localStorage.setItem(CLIENT_KEY, JSON.stringify({
      prenom:    document.getElementById('prenomInput').value.trim(),
      email:     document.getElementById('emailInput').value.trim(),
      instagram: document.getElementById('instaInput').value.trim(),
    }));
  } catch {}
}

function resetClient() {
  localStorage.removeItem(CLIENT_KEY);
  ['prenomInput','emailInput','instaInput'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('clientReturning').style.display = 'none';
}

loadClientProfile();

/* ══════════════════════════════════════════════
   CAROUSEL
══════════════════════════════════════════════ */
let currentPanel = 1;
const TOTAL      = 4;

function updateCarouselHeight(n) {
  const panels   = document.querySelectorAll('.carousel__panel');
  const carousel = document.getElementById('carousel');
  const panel    = panels[n - 1];
  if (panel) carousel.style.height = panel.scrollHeight + 'px';
}

function goToPanel(n) {
  const track = document.getElementById('carouselTrack');
  track.style.transform = `translateX(-${(n - 1) * 100}%)`;
  updateCarouselHeight(n);

  // Steps
  document.querySelectorAll('.bstep').forEach((s, i) => {
    s.classList.toggle('active', i + 1 === n);
    s.classList.toggle('done',   i + 1 <  n);
  });

  currentPanel = n;
}

function nextPanel() {
  if (!validatePanel(currentPanel)) return;
  if (currentPanel === 2) saveClientProfile();
  if (currentPanel < TOTAL) goToPanel(currentPanel + 1);
}

function prevPanel() {
  if (currentPanel > 1) goToPanel(currentPanel - 1);
}

/* ── Swipe tactile ─────────────────────────── */
let touchX = 0, touchY = 0;
const carousel = document.getElementById('carousel');

carousel.addEventListener('touchstart', e => {
  touchX = e.touches[0].clientX;
  touchY = e.touches[0].clientY;
}, { passive: true });

carousel.addEventListener('touchend', e => {
  const dx = e.changedTouches[0].clientX - touchX;
  const dy = e.changedTouches[0].clientY - touchY;
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 55) {
    dx < 0 ? nextPanel() : prevPanel();
  }
}, { passive: true });

/* ── Validation ────────────────────────────── */
function validatePanel(n) {
  if (n === 1) {
    if (!booking.jour) {
      shake(document.getElementById('daysGrid'));
      return false;
    }
    if (!booking.heure) {
      shake(document.getElementById('timeSlotsGrid'));
      return false;
    }
    return true;
  }

  if (n === 2) {
    const p = document.getElementById('prenomInput');
    const e = document.getElementById('emailInput');
    const i = document.getElementById('instaInput');
    let ok  = true;
    if (!p.value.trim()) { shake(p); p.classList.add('error'); ok = false; }
    if (!e.value.trim() || !e.value.includes('@')) { shake(e); e.classList.add('error'); ok = false; }
    if (!i.value.trim()) { shake(i); i.classList.add('error'); ok = false; }
    [p, e, i].forEach(el => el.addEventListener('input', () => el.classList.remove('error'), { once: true }));
    return ok;
  }

  if (n === 3) {
    if (!document.querySelector('input[name="service"]:checked')) {
      shake(document.getElementById('serviceGroup'));
      return false;
    }
    if (!document.getElementById('teinteSelect').value) {
      shake(document.getElementById('teinteSelect'));
      return false;
    }
    return true;
  }

  return true; // panel 4 : photos optionnelles
}

function shake(el) {
  el.style.animation = 'none';
  el.offsetHeight;
  el.style.animation = 'shake 0.4s ease';
  el.addEventListener('animationend', () => el.style.animation = '', { once: true });
}

const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%,100%{ transform:translateX(0); }
    20%    { transform:translateX(-6px); }
    40%    { transform:translateX(6px); }
    60%    { transform:translateX(-4px); }
    80%    { transform:translateX(4px); }
  }
`;
document.head.appendChild(shakeStyle);

/* ── Upload photos ─────────────────────────── */
function handleUpload(input, previewId, labelId) {
  const preview = document.getElementById(previewId);
  const label   = document.getElementById(labelId);
  preview.innerHTML = '';
  const files = Array.from(input.files).slice(0, 3);
  if (!files.length) return;
  files.forEach(file => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = e => {
      const img = document.createElement('img');
      img.src = e.target.result;
      preview.appendChild(img);
    };
    reader.readAsDataURL(file);
  });
  label.textContent = `${files.length} photo${files.length > 1 ? 's' : ''} sélectionnée${files.length > 1 ? 's' : ''} ✓`;
}

/* ── Soumission ────────────────────────────── */
function submitBooking() {
  /* Option Formspree — décommenter après avoir configuré :
  const fd = new FormData();
  fd.append('jour',      booking.jour);
  fd.append('heure',     booking.heure);
  fd.append('prenom',    document.getElementById('prenomInput').value);
  fd.append('email',     document.getElementById('emailInput').value);
  fd.append('instagram', document.getElementById('instaInput').value);
  fd.append('service',   document.querySelector('input[name="service"]:checked')?.value);
  fd.append('teinte',    document.getElementById('teinteSelect').value);
  fd.append('message',   document.getElementById('messageInput').value);
  fetch('https://formspree.io/f/VOTRE_ID', { method:'POST', body:fd, headers:{ Accept:'application/json' } });
  */

  const prenom    = document.getElementById('prenomInput').value;
  const service   = document.querySelector('input[name="service"]:checked')?.value || '—';
  const teinte    = document.getElementById('teinteSelect').value || '—';
  const message   = document.getElementById('messageInput').value;

  document.getElementById('confirmRecap').innerHTML = `
    <strong>Jour :</strong> ${booking.jour}<br>
    <strong>Heure :</strong> ${booking.heure}<br>
    <strong>Prénom :</strong> ${prenom}<br>
    <strong>Instagram :</strong> ${document.getElementById('instaInput').value}<br>
    <strong>Service :</strong> ${service}<br>
    <strong>Teinte :</strong> ${teinte}
    ${message ? `<br><strong>Message :</strong> ${message}` : ''}
  `;

  document.getElementById('bsteps').style.display            = 'none';
  document.getElementById('carousel').style.display          = 'none';
  document.getElementById('bookingReschedule').style.display = 'none';

  const conf = document.getElementById('confirmation');
  conf.classList.add('show');
  conf.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

/* ── Auto-avance Panel 3 ───────────────────── */
function checkPanel3AutoAdvance() {
  const hasService = !!document.querySelector('input[name="service"]:checked');
  const hasTeinte  = !!document.getElementById('teinteSelect').value;
  if (hasService && hasTeinte) {
    setTimeout(() => { if (currentPanel === 3) nextPanel(); }, 400);
  }
}
document.querySelectorAll('input[name="service"]').forEach(r =>
  r.addEventListener('change', checkPanel3AutoAdvance)
);
document.getElementById('teinteSelect').addEventListener('change', checkPanel3AutoAdvance);

/* ── Dots de progression cliquables (retour) ── */
document.querySelectorAll('.bstep').forEach(step => {
  const n = parseInt(step.dataset.step);
  step.style.cursor = 'pointer';
  step.addEventListener('click', () => {
    if (n < currentPanel) goToPanel(n);
  });
});

/* Initialisation carousel */
goToPanel(1);
