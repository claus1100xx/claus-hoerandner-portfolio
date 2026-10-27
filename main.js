(() => {
  const translatable = Array.from(document.querySelectorAll('[data-de]'));
  translatable.forEach(el => { el.dataset.en = el.innerHTML; });
  const buttons = document.querySelectorAll('.language-toggle');
  function setLanguage(language) {
    const lang = language === 'de' ? 'de' : 'en';
    document.documentElement.lang = lang;
    translatable.forEach(el => { el.innerHTML = el.dataset[lang]; });
    buttons.forEach(button => {
      button.textContent = lang === 'en' ? 'DE' : 'EN';
      button.setAttribute('aria-label', lang === 'en' ? 'Switch to German' : 'Switch to English');
    });
    if (document.body.dataset.titleDe) document.title = lang === 'de' ? document.body.dataset.titleDe : document.body.dataset.titleEn;
    try { localStorage.setItem('portfolio-language', lang); } catch (_) {}
    document.dispatchEvent(new CustomEvent('languagechange', { detail: { language: lang } }));
  }
  buttons.forEach(button => button.addEventListener('click', () => setLanguage(document.documentElement.lang === 'en' ? 'de' : 'en')));
  let initial = 'en';
  try { initial = localStorage.getItem('portfolio-language') || 'en'; } catch (_) {}
  setLanguage(initial);
  const portrait = document.getElementById('portrait-card');
  if (portrait) {
    const front = portrait.querySelector('.portrait-front');
    const back = portrait.querySelector('.portrait-back');
    const returnButton = portrait.querySelector('.portrait-return');
    function updatePortraitLabel() {
      front.setAttribute('aria-label', document.documentElement.lang === 'de'
        ? 'Kontaktdaten von Claus Hoerandner anzeigen'
        : 'Show Claus Hoerandner’s contact details');
    }
    function flipPortrait(showContact) {
      portrait.classList.toggle('is-flipped', showContact);
      front.setAttribute('aria-expanded', String(showContact));
      front.setAttribute('aria-hidden', String(showContact));
      back.setAttribute('aria-hidden', String(!showContact));
      front.inert = showContact;
      back.inert = !showContact;
      (showContact ? back.querySelector('h2') : front).focus({ preventScroll: true });
    }
    front.addEventListener('click', () => flipPortrait(true));
    returnButton.addEventListener('click', () => flipPortrait(false));
    portrait.addEventListener('keydown', event => {
      if (event.key === 'Escape' && portrait.classList.contains('is-flipped')) {
        event.preventDefault(); flipPortrait(false);
      }
    });
    document.addEventListener('languagechange', updatePortraitLabel);
    updatePortraitLabel();
  }
  const resumeLink = document.querySelector('[data-resume-download]');
  const resumeStatus = document.getElementById('resume-download-status');
  if (resumeLink && resumeStatus) {
    let requested = false;
    function downloadMessage() {
      if (requested) resumeStatus.textContent = document.documentElement.lang === 'de'
        ? 'Word-Download angefordert. Die Datei finden Sie im Downloads-Ordner.'
        : 'Word résumé download requested. Check your Downloads folder.';
    }
    resumeLink.addEventListener('click', () => { requested = true; downloadMessage(); });
    document.addEventListener('languagechange', downloadMessage);
  }
})();
