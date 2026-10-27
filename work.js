(() => {
 'use strict';
 const de = () => document.documentElement.lang === 'de';
 const t = (en, german) => de() ? german : en;
 const format = (value, digits = 0) => new Intl.NumberFormat(de() ? 'de-DE' : 'en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(value);
 const dialog = document.getElementById('work-lightbox');
 let activeGallery = null;
 function setGallery(gallery, button) {
  gallery.querySelectorAll('[data-image]').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
  const img = gallery.querySelector('.work-image-button img');
  img.src = 'assets/work/' + button.dataset.image + '.jpg';
  img.alt = gallery.querySelector('h3').textContent + ': ' + button.textContent;
  gallery.querySelector('.work-image-button').setAttribute('aria-label', t('Enlarge ', 'Vergrößern: ') + img.alt);
  if (dialog.open && activeGallery === gallery) updateDialog();
 }
 function updateDialog() {
  if (!activeGallery) return;
  const buttons = Array.from(activeGallery.querySelectorAll('[data-image]'));
  const index = buttons.findIndex(button => button.getAttribute('aria-pressed') === 'true');
  const img = activeGallery.querySelector('.work-image-button img');
  const dialogImage = document.getElementById('work-lightbox-image');
  dialogImage.src = img.src; dialogImage.alt = img.alt;
  document.getElementById('work-lightbox-title').textContent = activeGallery.querySelector('h3').textContent + ' — ' + buttons[index].textContent;
  document.getElementById('work-lightbox-count').textContent = `${index + 1} / ${buttons.length}`;
 }
 function moveGallery(direction) {
  if (!activeGallery) return;
  const buttons = Array.from(activeGallery.querySelectorAll('[data-image]'));
  const current = buttons.findIndex(button => button.getAttribute('aria-pressed') === 'true');
  setGallery(activeGallery, buttons[(current + direction + buttons.length) % buttons.length]);
 }
 document.querySelectorAll('.work-gallery').forEach(gallery => {
  gallery.querySelectorAll('[data-image]').forEach(button => button.addEventListener('click', () => setGallery(gallery, button)));
  gallery.querySelector('.work-image-button').addEventListener('click', () => { activeGallery = gallery; updateDialog(); dialog.showModal(); });
 });
 document.getElementById('work-lightbox-close').addEventListener('click', () => dialog.close());
 document.getElementById('work-lightbox-prev').addEventListener('click', () => moveGallery(-1));
 document.getElementById('work-lightbox-next').addEventListener('click', () => moveGallery(1));
 dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
 dialog.addEventListener('keydown', event => { if (event.key === 'ArrowLeft') {event.preventDefault(); moveGallery(-1);} if (event.key === 'ArrowRight') {event.preventDefault(); moveGallery(1);} });
 const policies = [
  {id:'DEMO-1001',premium:10000,ceded:4000}, {id:'DEMO-1002',premium:12500,ceded:5000},
  {id:'DEMO-1003',premium:8000,ceded:3520}, {id:'DEMO-1004',premium:20000,ceded:7000},
  {id:'DEMO-1005',premium:5000,ceded:0}, {id:'DEMO-1006',premium:15000,ceded:6150},
  {id:'DEMO-1007',premium:0,ceded:500}, {id:'DEMO-1008',premium:0,ceded:0},
  {id:'DEMO-1009',premium:10000,ceded:4200}, {id:'DEMO-1010',premium:25000,ceded:10000}
 ];
 function checkCessions() {
  const rateInput = document.getElementById('cession-rate');
  const toleranceInput = document.getElementById('cession-tolerance');
  const error = document.getElementById('cession-validation');
  const rate = rateInput.valueAsNumber; const tolerance = toleranceInput.valueAsNumber;
  const invalid = !Number.isFinite(rate) || !Number.isFinite(tolerance) || rate < 0 || rate > 100 || tolerance < 0 || tolerance > 100;
  error.hidden = !invalid;
  error.textContent = invalid ? t('Enter an expected rate and tolerance between 0 and 100.', 'Erwartete Quote und Toleranz müssen zwischen 0 und 100 liegen.') : '';
  rateInput.setAttribute('aria-invalid', String(!Number.isFinite(rate) || rate < 0 || rate > 100));
  toleranceInput.setAttribute('aria-invalid', String(!Number.isFinite(tolerance) || tolerance < 0 || tolerance > 100));
  const tbody = document.getElementById('cession-rows');
  if (invalid) {tbody.replaceChildren();document.getElementById('cession-summary').textContent='';return;}
  const rows = policies.map(policy => {
   const actual = policy.premium ? policy.ceded / policy.premium * 100 : null;
   const difference = actual === null ? null : actual - rate;
   const needsReview = actual === null || Math.abs(difference) > tolerance + 1e-9;
   let status = t('Within tolerance', 'Innerhalb der Toleranz');
   if (actual === null) status = policy.ceded ? t('Cession without premium', 'Zession ohne Prämie') : t('No subject premium', 'Keine Bezugsprämie');
   else if (needsReview) status = policy.ceded === 0 && rate > 0 ? t('Missing cession', 'Fehlende Zession') : t('Outside tolerance', 'Außerhalb der Toleranz');
   return {...policy, actual, difference, needsReview, status};
  });
  const review = rows.filter(row => row.needsReview).length;
  const onlyExceptions = document.getElementById('cession-exceptions').checked;
  const visible = rows.filter(row => !onlyExceptions || row.needsReview);
  document.getElementById('cession-summary').textContent = t(`${rows.length} synthetic policies checked · ${review} need review · ${rows.length - review} within tolerance`, `${rows.length} synthetische Policen geprüft · ${review} prüfungsbedürftig · ${rows.length - review} innerhalb der Toleranz`);
  tbody.replaceChildren(...visible.map(row => {
   const tr = document.createElement('tr');
   [row.id, format(row.premium), format(row.ceded), row.actual === null ? '—' : format(row.actual, 1) + '%', row.difference === null ? '—' : (row.difference > 0 ? '+' : '') + format(row.difference,1) + ' pp', row.status].forEach((value,index) => { const td = document.createElement('td'); td.textContent = value; if(index===5) td.className='work-status '+(row.actual===null?'review':row.needsReview?'exception':''); tr.appendChild(td); });
   return tr;
  }));
 }
 ['cession-rate','cession-tolerance','cession-exceptions'].forEach(id => document.getElementById(id).addEventListener('input',checkCessions));
 function capacity() {
  const people = Number(document.getElementById('capacity-analysts').value);
  const hours = Number(document.getElementById('capacity-hours').value);
  const share = Number(document.getElementById('capacity-share').value);
  document.getElementById('capacity-analysts-value').textContent = format(people);
  document.getElementById('capacity-hours-value').textContent = format(hours);
  document.getElementById('capacity-share-value').textContent = format(share) + '%';
  const annual = people * hours * share / 100 * 12;
  document.getElementById('capacity-result').textContent = format(annual);
  document.getElementById('capacity-equivalent').textContent = t(`${format(annual/1860,2)} full-time equivalents · ${format(annual/8)} working days`, `${format(annual/1860,2)} Vollzeitäquivalente · ${format(annual/8)} Arbeitstage`);
 }
 ['capacity-analysts','capacity-hours','capacity-share'].forEach(id => document.getElementById(id).addEventListener('input',capacity));
 document.addEventListener('languagechange', () => {checkCessions();capacity();document.querySelectorAll('.work-gallery').forEach(gallery => setGallery(gallery,gallery.querySelector('[aria-pressed="true"]')));updateDialog();});
 document.querySelectorAll('.work-gallery').forEach(gallery => setGallery(gallery,gallery.querySelector('[aria-pressed="true"]')));
 checkCessions();capacity();
})();
