/* ============================================
   THE DOLL STUDIO — Script
============================================ */

/* ── Nav : fond au scroll ──────────────────── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

/* ── Animations au scroll ──────────────────── */
const observer = new IntersectionObserver(
  entries => entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in-view'); observer.unobserve(e.target); } }),
  { threshold: 0.12, rootMargin: '0px 0px -30px 0px' }
);

document.querySelectorAll('[data-animate]').forEach((el, i) => {
  el.style.transitionDelay = `${i * 0.06}s`;
  observer.observe(el);
});

/* ── Formulaire multi-étapes ───────────────── */
let currentStep = 1;

function nextStep(step) {
  if (!validateStep(step)) return;

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
    const serviceChecked = document.querySelector('input[name="service"]:checked');
    if (!serviceChecked) {
      shake(document.getElementById('serviceGroup'));
      ok = false;
    }

    const teinte = document.getElementById('teinteSelect');
    if (!teinte.value) {
      shake(teinte);
      ok = false;
    }

    const creneau = document.getElementById('creneauInput');
    if (!creneau.value.trim()) {
      shake(creneau);
      creneau.classList.add('error');
      creneau.addEventListener('input', () => creneau.classList.remove('error'), { once: true });
      ok = false;
    }
  }

  if (step === 3) {
    const prenom = document.getElementById('prenomInput');
    const contact = document.getElementById('contactInput');

    if (!prenom.value.trim()) { shake(prenom); prenom.classList.add('error'); ok = false; }
    if (!contact.value.trim()) { shake(contact); contact.classList.add('error'); ok = false; }

    [prenom, contact].forEach(el => el.addEventListener('input', () => el.classList.remove('error'), { once: true }));
  }

  return ok;
}

function shake(el) {
  el.style.animation = 'none';
  el.offsetHeight; /* reflow */
  el.style.animation = 'shake 0.4s ease';
  el.addEventListener('animationend', () => el.style.animation = '', { once: true });
}

/* Animation tremblement pour la validation */
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

/* ── Soumission du formulaire ──────────────── */
document.getElementById('bookingForm').addEventListener('submit', function (e) {
  e.preventDefault();

  if (!validateStep(3)) return;

  const data = Object.fromEntries(new FormData(this));

  /* ── Option Formspree ───────────────────────
     Pour recevoir les demandes par email, créez un compte
     gratuit sur https://formspree.io et remplacez VOTRE_ID.
     Décommentez les lignes ci-dessous.

  fetch('https://formspree.io/f/VOTRE_ID', {
    method: 'POST',
    body: new FormData(this),
    headers: { 'Accept': 'application/json' }
  });
  ──────────────────────────────────────────── */

  /* Récapitulatif affiché dans la confirmation */
  document.getElementById('confirmRecap').innerHTML = `
    <strong>Service&nbsp;:</strong> ${data.service || '—'}<br>
    <strong>Teinte&nbsp;:</strong> ${data.teinte || '—'}<br>
    <strong>Créneau souhaité&nbsp;:</strong> ${data.creneau || '—'}<br>
    <strong>Prénom&nbsp;:</strong> ${data.prenom || '—'}<br>
    <strong>Contact&nbsp;:</strong> ${data.contact || '—'}
    ${data.message ? `<br><strong>Message&nbsp;:</strong> ${data.message}` : ''}
  `;

  /* Masquer le formulaire, afficher la confirmation */
  document.getElementById('formSteps').style.display = 'none';
  this.style.display = 'none';

  const conf = document.getElementById('confirmation');
  conf.classList.add('show');
  conf.scrollIntoView({ behavior: 'smooth', block: 'center' });
});
