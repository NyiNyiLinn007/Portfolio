/* =========================================================
   Alex Morgan — Portfolio interactions
   ========================================================= */
(function () {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Theme toggle ---------- */
  const root = document.documentElement;
  const metaTheme = $('meta[name="theme-color"]');
  const applyThemeMeta = (t) => metaTheme && metaTheme.setAttribute('content', t === 'light' ? '#fafafc' : '#0a0a10');
  applyThemeMeta(root.getAttribute('data-theme'));

  $('#themeToggle').addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    applyThemeMeta(next);
  });

  /* ---------- Header scroll state ---------- */
  const header = $('#header');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 12);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------- Mobile navigation ---------- */
  const navToggle = $('#navToggle');
  const navLinks = $('#navLinks');
  const setMenu = (open) => {
    navLinks.classList.toggle('is-open', open);
    navToggle.setAttribute('aria-expanded', String(open));
    navToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  };
  navToggle.addEventListener('click', () => setMenu(!navLinks.classList.contains('is-open')));
  $$('a', navLinks).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });
  window.addEventListener('resize', () => { if (window.innerWidth > 860) setMenu(false); });

  /* ---------- Active nav link on scroll ---------- */
  const sectionLinks = $$('.nav__link');
  const sections = sectionLinks.map((l) => $(l.getAttribute('href'))).filter(Boolean);
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      sectionLinks.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === '#' + entry.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach((s) => navObserver.observe(s));

  /* ---------- Reveal on scroll (with stagger) ---------- */
  const reveals = $$('.reveal');
  // Stagger siblings inside the same parent
  const groups = new Map();
  reveals.forEach((el) => {
    const p = el.parentElement;
    const i = groups.get(p) || 0;
    el.style.setProperty('--d', Math.min(i * 0.08, 0.4) + 's');
    groups.set(p, i + 1);
  });
  if (prefersReducedMotion || !('IntersectionObserver' in window)) {
    reveals.forEach((el) => el.classList.add('is-visible'));
  } else {
    const revealObserver = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach((el) => revealObserver.observe(el));
  }

  /* ---------- Typing role rotator ---------- */
  const typedEl = $('#typed');
  const roles = [
    'Full Stack Web Application Developer',
    'Java & Spring Boot Developer',
    'Angular Developer',
    'Core Banking & FinTech Engineer',
    'Clean Code Enthusiast',
  ];
  if (typedEl && !prefersReducedMotion) {
    let r = 0, c = roles[0].length, deleting = true;
    const tick = () => {
      const word = roles[r];
      typedEl.textContent = word.slice(0, c);
      let delay = deleting ? 35 : 70;
      if (deleting && c === 0) { deleting = false; r = (r + 1) % roles.length; delay = 350; }
      else if (!deleting && c === roles[r].length) { deleting = true; delay = 2200; }
      c += deleting ? -1 : 1;
      setTimeout(tick, delay);
    };
    setTimeout(tick, 2400);
  }

  /* ---------- Animated counters ---------- */
  const counters = $$('[data-count]');
  const formatCount = (el, n) => {
    const pad = parseInt(el.dataset.pad || '0', 10);
    return String(n).padStart(pad, '0') + (el.dataset.suffix || '');
  };
  const animateCount = (el) => {
    const target = parseFloat(el.dataset.count);
    const duration = 1600;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = formatCount(el, Math.round(target * eased));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const countObserver = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { animateCount(entry.target); obs.unobserve(entry.target); }
    });
  }, { threshold: 0.6 });
  counters.forEach((el) => {
    if (prefersReducedMotion) el.textContent = formatCount(el, el.dataset.count);
    else countObserver.observe(el);
  });

  /* ---------- Cursor spotlight on cards ---------- */
  if (window.matchMedia('(hover: hover)').matches) {
    document.addEventListener('pointermove', (e) => {
      const card = e.target.closest('.spotlight');
      if (!card) return;
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mx', e.clientX - rect.left + 'px');
      card.style.setProperty('--my', e.clientY - rect.top + 'px');
    }, { passive: true });
  }

  /* ---------- Project filters ---------- */
  const filters = $$('.filter');
  const projects = $$('.project');
  filters.forEach((btn) => {
    btn.addEventListener('click', () => {
      const f = btn.dataset.filter;
      filters.forEach((b) => {
        const active = b === btn;
        b.classList.toggle('is-active', active);
        b.setAttribute('aria-selected', String(active));
      });
      projects.forEach((p) => {
        const show = f === 'all' || p.dataset.category === f;
        p.classList.toggle('is-hidden', !show);
        // In filtered views the featured card stacks vertically and takes a single column
        if (p.classList.contains('project--featured')) p.classList.toggle('project--compact', f !== 'all');
        if (show) p.classList.add('is-visible');
      });
    });
  });

  /* ---------- Toast ---------- */
  const toast = $('#toast');
  let toastTimer;
  const showToast = (msg) => {
    toast.textContent = msg;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2400);
  };

  /* ---------- Copy email ---------- */
  $$('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(btn.dataset.copy);
        btn.textContent = 'Copied!';
        showToast('Email copied to clipboard ✓');
        setTimeout(() => (btn.textContent = 'Copy'), 1800);
      } catch {
        showToast('Copy failed: ' + btn.dataset.copy);
      }
    });
  });

  /* ---------- Contact form ---------- */
  const form = $('#contactForm');
  const status = $('#formStatus');
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  const validateField = (input) => {
    const field = input.closest('.field');
    let valid = true;
    if (input.required && !input.value.trim()) valid = false;
    if (valid && input.type === 'email') valid = emailRe.test(input.value.trim());
    if (valid && input.minLength > 0) valid = input.value.trim().length >= input.minLength;
    field.classList.toggle('has-error', !valid);
    return valid;
  };

  $$('input, textarea', form).forEach((input) => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.closest('.field').classList.contains('has-error')) validateField(input);
    });
  });

  const CONTACT_EMAIL = 'nyinyilinn@ucssittway.edu.mm';

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const inputs = $$('input[required], textarea[required]', form);
    const allValid = inputs.map(validateField).every(Boolean);
    if (!allValid) {
      status.style.color = '#f87171';
      status.textContent = 'Please fix the highlighted fields.';
      return;
    }

    // No backend: open the visitor's email client with a pre-filled message.
    // To send directly from the page, swap this for Formspree / EmailJS / your own API.
    const data = new FormData(form);
    const subject = `[Portfolio] ${data.get('subject')} from ${data.get('name')}`;
    const body = `${data.get('message')}\n\n-- \n${data.get('name')}\n${data.get('email')}`;
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    status.style.color = '#22c55e';
    status.textContent = 'Your email app should open with the message ready to send.';
    showToast('Opening your email app ✉️');
  });

  /* ---------- Footer year ---------- */
  $('#year').textContent = new Date().getFullYear();
})();
