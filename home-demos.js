(() => {
  const carousel = document.querySelector('.demo-carousel');
  if (!carousel) return;

  const tabs = [...carousel.querySelectorAll('[role="tab"]')];
  const slides = [...carousel.querySelectorAll('.demo-slide')];
  const toolbar = carousel.querySelector('.demo-toolbar');
  const stage = carousel.querySelector('.demo-stage');
  const toggle = carousel.querySelector('.demo-rotation');
  const previous = carousel.querySelector('.demo-previous');
  const next = carousel.querySelector('.demo-next');
  const announcement = carousel.querySelector('.demo-announcement');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const german = () => document.documentElement.lang === 'de';
  let current = 0;
  let playing = !reducedMotion.matches;
  let visible = false;
  let hovered = false;
  let timer;

  function schedule() {
    clearTimeout(timer);
    const focus = document.activeElement;
    if (!playing || !visible || hovered || document.hidden ||
        (carousel.contains(focus) && focus !== toggle)) return;
    timer = setTimeout(() => select(current + 1), 10000);
  }

  function setPlaying(value) {
    playing = value;
    toggle.textContent = playing ? 'Pause' : (german() ? 'Starten' : 'Play');
    toggle.setAttribute('aria-label', playing
      ? (german() ? 'Automatischen Wechsel pausieren' : 'Pause automatic rotation')
      : (german() ? 'Automatischen Wechsel starten' : 'Start automatic rotation'));
    schedule();
  }

  function select(index, manual = false) {
    current = (index + slides.length) % slides.length;
    slides.forEach((slide, i) => {
      const selected = i === current;
      slide.toggleAttribute('data-current', selected);
      slide.inert = !selected;
      tabs[i].setAttribute('aria-selected', String(selected));
      tabs[i].tabIndex = selected ? 0 : -1;
    });
    if (manual) {
      setPlaying(false);
      announcement.textContent = tabs[current].textContent;
    } else schedule();
  }

  function localize() {
    const language = german() ? 'de' : 'en';
    carousel.querySelector('.demo-tabs').setAttribute('aria-label', german() ? 'Interaktive Demos' : 'Interactive demos');
    previous.setAttribute('aria-label', german() ? 'Vorherige Demo' : 'Previous demo');
    next.setAttribute('aria-label', german() ? 'Nächste Demo' : 'Next demo');
    for (const image of carousel.querySelectorAll('[data-preview]')) {
      const src = `assets/demo-previews/${image.dataset.preview}-${language}.jpg`;
      if (image.getAttribute('src') !== src) image.src = src;
      image.alt = german() ? image.dataset.altDe : image.dataset.altEn;
    }
    setPlaying(playing);
  }

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => select(i, true));
    tab.addEventListener('keydown', event => {
      const target = {
        ArrowLeft: current - 1, ArrowRight: current + 1,
        Home: 0, End: tabs.length - 1
      }[event.key];
      if (target === undefined) return;
      event.preventDefault();
      select(target, true);
      tabs[current].focus();
    });
  });
  previous.addEventListener('click', () => select(current - 1, true));
  next.addEventListener('click', () => select(current + 1, true));
  toggle.addEventListener('click', () => setPlaying(!playing));
  stage.addEventListener('pointerenter', event => {
    if (event.pointerType !== 'touch') hovered = true;
    schedule();
  });
  stage.addEventListener('pointerleave', () => { hovered = false; schedule(); });
  carousel.addEventListener('focusin', schedule);
  carousel.addEventListener('focusout', () => queueMicrotask(schedule));
  document.addEventListener('visibilitychange', schedule);
  document.addEventListener('languagechange', localize);
  reducedMotion.addEventListener('change', () => {
    if (reducedMotion.matches) setPlaying(false);
  });
  new IntersectionObserver(([entry]) => {
    visible = entry.intersectionRatio >= 0.25;
    schedule();
  }, { threshold: 0.25 }).observe(stage);

  toolbar.hidden = false;
  localize();
})();
