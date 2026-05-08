/* ============================================================
   CLAUS HOERANDNER — SITE SCRIPT
============================================================ */
(function () {
  'use strict';

  /* 1 — NAVBAR scroll + hamburger */
  const nav = document.getElementById('nav');
  const menuBtn = document.querySelector('.nav__menu-btn');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('nav--scrolled', window.scrollY > 40);
  }, { passive: true });

  if (menuBtn) {
    menuBtn.addEventListener('click', () => {
      const open = nav.classList.toggle('nav--open');
      menuBtn.setAttribute('aria-expanded', String(open));
    });
    document.querySelectorAll('.nav__links a').forEach(a => {
      a.addEventListener('click', () => {
        nav.classList.remove('nav--open');
        menuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* 2 — ACTIVE section link */
  const sections = document.querySelectorAll('section[id], footer[id]');
  const navLinks = document.querySelectorAll('.nav__links a');
  const sectionObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        navLinks.forEach(l => l.classList.remove('active'));
        const match = document.querySelector(`.nav__links a[href="#${e.target.id}"]`);
        if (match) match.classList.add('active');
      }
    });
  }, { threshold: 0.25, rootMargin: '-80px 0px -40% 0px' });
  sections.forEach(s => sectionObs.observe(s));

  /* 3 — REVEAL on scroll */
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

  /* 4 — STAT counters (hero facts) — preserves <sup>+ */
  const countObs = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || '';
      const hasSup = !!el.querySelector('sup');
      const supHTML = hasSup ? '<sup>+</sup>' : '';
      const steps = 48;
      const dur = 1400;
      let count = 0;
      const inc = target / steps;
      const timer = setInterval(() => {
        count++;
        const val = Math.min(Math.round(count * inc), target);
        el.innerHTML = val.toLocaleString() + suffix + supHTML;
        if (count >= steps) clearInterval(timer);
      }, dur / steps);
      countObs.unobserve(el);
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('[data-target]').forEach(el => countObs.observe(el));

  /* 5 — LANGUAGE toggle */
  const T = window.I18N || {};
  let lang = localStorage.getItem('lang') || 'en';

  function applyLang(l) {
    document.documentElement.lang = l;
    const dict = T[l]; if (!dict) return;
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const k = el.dataset.i18n;
      if (dict[k] !== undefined) el.textContent = dict[k];
    });
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const k = el.dataset.i18nHtml;
      if (dict[k] !== undefined) el.innerHTML = dict[k];
    });
  }

  const langBtn = document.getElementById('langToggle');
  if (langBtn) {
    // Apply persisted lang on load
    if (lang === 'de') {
      langBtn.querySelectorAll('.lang-toggle__opt').forEach(o => {
        o.classList.toggle('lang-toggle__opt--active', o.dataset.l === lang);
      });
      applyLang(lang);
    }

    langBtn.addEventListener('click', () => {
      lang = lang === 'en' ? 'de' : 'en';
      localStorage.setItem('lang', lang);
      langBtn.querySelectorAll('.lang-toggle__opt').forEach(o => {
        o.classList.toggle('lang-toggle__opt--active', o.dataset.l === lang);
      });
      applyLang(lang);
    });
  }
})();
