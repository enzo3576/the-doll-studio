/* ============================================
   THE DOLL STUDIO — Script
============================================ */

/* ══════════════════════════════════════════════
   CONFIGURATION GOOGLE SHEETS
   ══════════════════════════════════════════════
   Pour connecter les disponibilités à Google Sheets :
   1. Crée un Google Sheet avec une feuille nommée "Dispos"
   2. Structure de la feuille (exemple) :
      A1 : Semaine du 2 juin     B1 : (vide)
      A2 : Lundi                 B2 : 9h · 13h
      A3 : Mardi                 B3 : (vide)
      A4 : Mercredi              B4 : 14h
      A5 : Jeudi                 B5 : 17h
      A6 : Vendredi              B6 : (vide)
      A7 : Samedi                B7 : (vide)
      A8 : Dimanche              B8 : (vide)
   3. Rendre le sheet public :
      Partager → Tous les utilisateurs avec le lien → Lecteur
   4. Copier l'ID dans l'URL entre /spreadsheets/d/ et /edit
   5. Coller cet ID ci-dessous à la place de 'VOTRE_ID_ICI'
══════════════════════════════════════════════ */
const GOOGLE_SHEET_ID = 'VOTRE_ID_ICI';

/* Données de secours affichées si Google Sheets
   n'est pas encore configuré ⬇️ */
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

/* ── Nav : fond au scroll ──────────────────── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ── Animations au scroll ──────────────────── */
const observer = new IntersectionObserver(
  entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in-view'); observer.unobserve(e.target); }
  }),
  { threshold: 0.12, rootMargin: '0px 0px -30px 0px' }
);

document.querySelectorAll('[data-animate]').forEach((el, i) => {
  el.style.transitionDelay = `${i * 0.06}s`;
  observer.observe(el);
});

/* ══════════════════════════════════════════════
   DISPONIBILITÉS — Google Sheets
══════════════════════════════════════════════ */
async function loadDisponibilites() {
  // Si l'ID n'est pas configuré, on affiche le fallback
  if (!GOOGLE_SHEET_ID || GOOGLE_SHEET_ID === 'VOTRE_ID_ICI') {
    renderDispos(FALLBACK_DISPOS);
    return;
  }

  try {
    const url = `https://docs.google.com/spreadsheets/d/${GOOGLE_SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Dispos`;
    const res  = await fetch(url);
    if (!res.ok) throw new Error('sheet non accessible');
    const csv  = await res.text();
    const data = parseSheetCSV(csv);
    renderDispos(data);
  } catch (err) {
    console.warn('Google Sheets indisponible, affichage du fallback.', err);
    renderDispos(FALLBACK_DISPOS);
  }
}

function parseSheetCSV(csv) {
  const rows = csv.trim().split('\n').map(line =>
    line.split(',').map(cell => cell.trim().replace(/^"|"$/g, ''))
  );

  // Ligne 0 = semaine (ex: "Semaine du 2 juin")
  const semaine = rows[0]?.[0] || '';
  // Lignes 1-7 = jours + slots
  const jours = rows.slice(1, 8).map(row => ({
    jour: row[0] || '',
    slot: row[1] || ''
  })).filter(r => r.jour);

  return { semaine, jours };
}

function renderDispos({ semaine, jours }) {
  document.getElementById('disposWeek').textContent = semaine;

  const grid = document.getElementById('disposGrid');
  grid.innerHTML = '';

  jours.forEach((item, i) => {
    const card = document.createElement('div');
    card.className = 'dispo-card' + (i === 6 ? ' dispo-card--wide' : '');
    card.setAttribute('data-animate', '');
    card.style.transitionDelay = `${i * 0.05}s`;

    card.innerHTML = `
      <span class="dispo-card__day">${item.jour}</span>
      <span class="slot">${item.slot}</span>
    `;
    grid.appendChild(card);

    // Re-observer pour l'animation
    observer.observe(card);
  });
}

// Charger au démarrage
loadDisponibilites();

/* ══════════════════════════════════════════════
   PROFIL CLIENT — localStorage
══════════════════════════════════════════════ */
const CLIENT_KEY = 'tds_client';

function loadClientProfile() {
  try {
    const saved = localStorage.getItem(CLIENT_KEY);
    if (!saved) return;

    const client = JSON.parse(saved);
    if (!client.prenom) return;

    // Pré-remplir les champs
    document.getElementById('prenomInput').value = client.prenom || '';
    document.getElementById('emailInput').value  = client.email  || '';
    document.getElementById('instaInput').value  = client.instagram || '';

    // Afficher le bandeau de bienvenue
    document.getElementById('returningName').textContent = client.prenom;
    document.getElementById('clientReturning').style.display = 'block';
  } catch (_) {}
}

function saveClientProfile(prenom, email, instagram) {
  try {
    localStorage.setItem(CLIENT_KEY, JSON.stringify({ prenom, email, instagram }));
  } catch (_) {}
}

function resetClient() {
  localStorage.removeItem(CLIENT_KEY);
  document.getElementById('prenomInput').value = '';
  document.getElementById('emailInput').value  = '';
  document.getElementById('instaInput').value  = '';
  document.getElementById('clientReturning').style.display = 'none';
}

// Charger le profil au démarrage
loadClientProfile();

/* ══════════════════════════════════════════════
   FORMULAIRE MULTI-ÉTAPES
══════════════════════════════════════════════ */
let currentStep = 1;

function nextStep(step) {
  if (!validateStep(step)) return;

  // Sauvegarder le profil après l'étape 1
  if (step === 1) {
    saveClientProfile(
      document.getElementById('prenomInput').value.trim(),
      document.getElementById('emailInput').value.trim(),
      document.getElementById('instaInput').value.trim()
    );
  }

  document.querySelector(`[data-step="${step}"]`).classList.replace('active', 'done');
  document.querySelector(`[data-panel="${step}"]`).classList.remove('active');

  currentStep = step + 1;
  document.querySelector(`[data-panel="${currentStep}"]`).classList.add('active');
  document.querySelector(`[data-step="${currentStep}"]`).classList.add('active');

  document.getElementById('bookingForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function prevStep(step) {
  document.querySelector(`[data-panel="${step}"]`).classList.remove('active');
  document.querySelector(`[data-step="${step}"]`).classList.remove('active');

  currentStep = step - 1;
  document.querySelector(`[data-panel="${currentStep}"]`).classList.add('active');
  document.querySelector(`[data-step="${currentStep}"]`).classList.remove('done');
  document.querySelector(`[data-step="${currentStep}"]`).classList.add('active');

  document.getElementById('bookingForm').scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function validateStep(step) {
  let ok = true;

  if (step === 1) {
    const prenom = document.getElementById('prenomInput');
    const email  = document.getElementById('emailInput');
    const insta  = document.getElementById('instaInput');

    if (!prenom.value.trim()) { shake(prenom); prenom.classList.add('error'); ok = false; }
    if (!email.value.trim() || !email.value.includes('@')) { shake(email); email.classList.add('error'); ok = false; }
    if (!insta.value.trim()) { shake(insta); insta.classList.add('error'); ok = false; }

    [prenom, email, insta].forEach(el =>
      el.addEventListener('input', () => el.classList.remove('error'), { once: true })
    );
  }

  if (step === 2) {
    const serviceChecked = document.querySelector('input[name="service"]:checked');
    if (!serviceChecked) {
      shake(document.getElementById('serviceGroup'));
      ok = false;
    }

    const teinte = document.getElementById('teinteSelect');
    if (!teinte.value) { shake(teinte); ok = false; }

    const creneau = document.getElementById('creneauInput');
    if (!creneau.value.trim()) {
      shake(creneau);
      creneau.classList.add('error');
      creneau.addEventListener('input', () => creneau.classList.remove('error'), { once: true });
      ok = false;
    }
  }

  return ok;
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
    0%, 100% { transform: translateX(0); }
    20%       { transform: translateX(-6px); }
    40%       { transform: translateX(6px); }
    60%       { transform: translateX(-4px); }
    80%       { transform: translateX(4px); }
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
      img.alt = 'Aperçu';
      preview.appendChild(img);
    };
    reader.readAsDataURL(file);
  });

  label.textContent = `${files.length} photo${files.length > 1 ? 's' : ''} sélectionnée${files.length > 1 ? 's' : ''} ✓`;
}

/* ── Soumission ────────────────────────────── */
document.getElementById('bookingForm').addEventListener('submit', function (e) {
  e.preventDefault();

  const data = Object.fromEntries(new FormData(this));

  /* ── Option Formspree (recommandé) ─────────
     Créer un compte sur https://formspree.io
     Remplacer VOTRE_ID par votre identifiant.
     Décommenter les lignes ci-dessous.

  fetch('https://formspree.io/f/VOTRE_ID', {
    method: 'POST',
    body: new FormData(this),
    headers: { 'Accept': 'application/json' }
  });
  ─────────────────────────────────────────── */

  // Récapitulatif
  document.getElementById('confirmRecap').innerHTML = `
    <strong>Prénom&nbsp;:</strong> ${data.prenom || '—'}<br>
    <strong>Email&nbsp;:</strong> ${data.email || '—'}<br>
    <strong>Instagram&nbsp;:</strong> ${data.instagram || '—'}<br>
    <strong>Service&nbsp;:</strong> ${data.service || '—'}<br>
    <strong>Teinte&nbsp;:</strong> ${data.teinte || '—'}<br>
    <strong>Créneau souhaité&nbsp;:</strong> ${data.creneau || '—'}
    ${data.message ? `<br><strong>Message&nbsp;:</strong> ${data.message}` : ''}
  `;

  // Masquer le formulaire
  document.getElementById('formSteps').style.display = 'none';
  this.style.display = 'none';

  // Afficher la confirmation
  const conf = document.getElementById('confirmation');
  conf.classList.add('show');
  conf.scrollIntoView({ behavior: 'smooth', block: 'center' });
});
