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
