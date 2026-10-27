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
})();
