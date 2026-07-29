/* ==========================================================================
   KARAMI — Portfolio interactions (vanilla JS, no dependencies)
   Modules: utils · preloader · cursor · atmosphere · navbar · scroll/reveal
   · counters · typing · terminal · skills · projects · dialog · timeline
   · certificates · links · resume · contact · footer · easter eggs
   ========================================================================== */
(function () {
  'use strict';

  /* --- Utilities -------------------------------------------------------- */
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches;
  // Low-power heuristic: few CPU cores, little memory, or a small screen.
  const lowPower = (navigator.deviceMemory && navigator.deviceMemory <= 4) ||
    (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
    window.matchMedia('(max-width: 600px)').matches;
  if (lowPower) document.documentElement.classList.add('perf-lite');
  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);
  const lerp = (a, b, t) => a + (b - a) * t;

  function throttleRAF(fn) {
    let ticking = false;
    return function (...args) {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => { fn.apply(this, args); ticking = false; });
    };
  }
  const announce = (msg) => { const el = $('#announcer'); if (el) el.textContent = msg; };
  const onReady = (fn) => document.readyState === 'loading'
    ? document.addEventListener('DOMContentLoaded', fn) : fn();

  /* --- Preloader -------------------------------------------------------- */
  function initPreloader() {
    const preloader = $('#preloader');
    if (!preloader) return document.body.classList.remove('is-loading');
    document.body.classList.add('is-loading');

    const log = $('#preloader-log');
    const bar = $('#preloader-bar');
    const percent = $('#preloader-percent');
    const lines = ['Loading components...', 'Compiling UI...', 'Loading assets...', 'Establishing archive link...', 'Ready.'];
    let progress = 0;

    const finish = () => {
      preloader.classList.add('is-done');
      document.body.classList.remove('is-loading');
      document.body.dispatchEvent(new Event('kiro:loaded'));
      window.setTimeout(() => preloader.remove(), 1100);
    };

    if (prefersReduced) {
      if (bar) bar.style.width = '100%';
      if (percent) percent.textContent = '100%';
      return window.setTimeout(finish, 300);
    }

    let i = 0;
    const addLine = () => {
      if (i < lines.length && log) {
        const p = document.createElement('p');
        p.innerHTML = '<span class="terminal-prompt">\u203a</span> ' + lines[i];
        log.appendChild(p);
        log.scrollTop = log.scrollHeight;
        i++;
      }
    };
    const lineTimer = window.setInterval(addLine, 480);

    const tick = () => {
      progress = Math.min(100, progress + Math.random() * 13 + 4);
      if (bar) bar.style.width = progress + '%';
      if (percent) percent.textContent = Math.floor(progress) + '%';
      if (progress < 100) {
        window.setTimeout(tick, 180 + Math.random() * 160);
      } else {
        window.clearInterval(lineTimer);
        while (i < lines.length) addLine();
        window.setTimeout(finish, 650);
      }
    };
    window.setTimeout(tick, 400);
  }

  /* --- Custom cursor ---------------------------------------------------- */
  function initCursor() {
    if (isTouch) return;
    const dot = $('.cursor--dot');
    const ring = $('.cursor--ring');
    const ringLabel = ring ? $('span', ring) : null;
    if (!dot || !ring) return;

    let mx = window.innerWidth / 2, my = window.innerHeight / 2;
    let rx = mx, ry = my, visible = false;

    window.addEventListener('mousemove', (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px, ${my}px) translate(-50%,-50%)`;
      if (!visible) { visible = true; dot.style.opacity = ring.style.opacity = '1'; }
    }, { passive: true });

    const render = () => {
      rx = lerp(rx, mx, 0.18); ry = lerp(ry, my, 0.18);
      ring.style.transform = `translate(${rx}px, ${ry}px) translate(-50%,-50%)`;
      requestAnimationFrame(render);
    };
    requestAnimationFrame(render);

    document.addEventListener('mouseleave', () => { dot.style.opacity = ring.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { dot.style.opacity = ring.style.opacity = '1'; });

    const hoverSel = 'a, button, input, textarea, select, .tilt-card, .skill-node, [data-cursor]';
    document.addEventListener('mouseover', (e) => {
      const t = e.target.closest(hoverSel);
      if (!t) return;
      ring.classList.add('is-hovering');
      const label = t.getAttribute('data-cursor');
      if (label === 'logo' && ringLabel) { ring.classList.add('is-label'); ringLabel.textContent = 'HOME'; }
    });
    document.addEventListener('mouseout', (e) => {
      if (!e.target.closest(hoverSel)) return;
      ring.classList.remove('is-hovering', 'is-label');
      if (ringLabel) ringLabel.textContent = '';
    });
  }

  /* --- Magnetic buttons & ripple --------------------------------------- */
  function initMagnetic() {
    if (isTouch || prefersReduced) return;
    const strength = 0.35;
    $$('.magnetic').forEach((el) => {
      let rect = null, frame = 0, tx = 0, ty = 0;
      el.addEventListener('mouseenter', () => { rect = el.getBoundingClientRect(); });
      el.addEventListener('mousemove', (e) => {
        if (!rect) rect = el.getBoundingClientRect();
        tx = (e.clientX - rect.left - rect.width / 2) * strength;
        ty = (e.clientY - rect.top - rect.height / 2) * strength;
        if (!frame) frame = requestAnimationFrame(() => {
          el.style.transform = `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px)`;
          frame = 0;
        });
      });
      el.addEventListener('mouseleave', () => { rect = null; el.style.transform = ''; });
    });
  }
  function initRipple() {
    $$('.ripple-target').forEach((el) => {
      el.addEventListener('click', (e) => {
        if (prefersReduced) return;
        const r = el.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.className = 'ripple';
        ripple.style.left = (e.clientX - r.left) + 'px';
        ripple.style.top = (e.clientY - r.top) + 'px';
        el.appendChild(ripple);
        window.setTimeout(() => ripple.remove(), 650);
      });
    });
  }

  /* --- Atmosphere: spotlight + particles + hero symbols ---------------- */
  function initAtmosphere() {
    const spotlight = $('#spotlight');
    if (spotlight && !isTouch && !prefersReduced && !lowPower) {
      let sx = window.innerWidth / 2, sy = window.innerHeight / 2;
      window.addEventListener('mousemove', (e) => { sx = e.clientX; sy = e.clientY; }, { passive: true });
      const paint = throttleRAF(() => {
        spotlight.style.transform = `translate3d(${sx}px, ${sy}px, 0) translate(-50%, -50%)`;
      });
      window.addEventListener('mousemove', paint, { passive: true });
    }

    if (!prefersReduced && !lowPower) {
      const field = $('#global-particles');
      if (field) {
        const count = window.innerWidth < 720 ? 8 : 14;
        const frag = document.createDocumentFragment();
        for (let i = 0; i < count; i++) {
          const p = document.createElement('span');
          p.className = 'particle';
          p.style.setProperty('--x', Math.random() * 100 + '%');
          p.style.setProperty('--size', (Math.random() * 5 + 3).toFixed(1) + 'px');
          p.style.setProperty('--duration', (Math.random() * 14 + 14).toFixed(1) + 's');
          p.style.setProperty('--delay', '-' + (Math.random() * 20).toFixed(1) + 's');
          frag.appendChild(p);
        }
        field.appendChild(frag);
      }

      const heroSymbols = $('#hero-symbols');
      if (heroSymbols) {
        // Mathematics motif: integrals, operators, constants, set notation
        const glyphs = ['\u222b', '\u2202', '\u2211', '\u220f', '\u221a', '\u03c0', '\u03bb', '\u221e',
          '\u2207', '\u2208', '\u2245', '\u2260', '\u211d', '\u2102', 'e^{i\u03c0}', 'dx', '\u03c6', '\u2135\u2080'];
        const frag = document.createDocumentFragment();
        for (let i = 0; i < 9; i++) {
          const s = document.createElement('span');
          s.className = 'ambient-code';
          s.textContent = glyphs[i % glyphs.length];
          s.style.left = Math.random() * 100 + '%';
          s.style.top = Math.random() * 100 + '%';
          s.style.fontSize = (Math.random() * 1.6 + 0.8).toFixed(2) + 'rem';
          s.style.animationDelay = '-' + (Math.random() * 14).toFixed(1) + 's';
          s.style.opacity = '0.5';
          frag.appendChild(s);
        }
        heroSymbols.appendChild(frag);
      }
    }
  }

  /* --- Navbar: hide on scroll down, active section, mobile toggle ------ */
  function initNavbar() {
    const header = $('#site-header');
    const toggle = $('.nav-toggle');
    const navLinks = $('#nav-links');
    const links = $$('.nav-links a');
    let lastY = window.scrollY;

    const onScroll = throttleRAF(() => {
      const y = window.scrollY;
      if (header) {
        if (y > lastY && y > 400) header.classList.add('is-hidden');
        else header.classList.remove('is-hidden');
      }
      lastY = y;
    });
    window.addEventListener('scroll', onScroll, { passive: true });

    if (toggle && navLinks) {
      toggle.addEventListener('click', () => {
        const open = navLinks.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', String(open));
        toggle.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
      });
      navLinks.addEventListener('click', (e) => {
        if (e.target.closest('a')) {
          navLinks.classList.remove('is-open');
          toggle.setAttribute('aria-expanded', 'false');
        }
      });
    }

    const sections = links.map((l) => $(l.getAttribute('href'))).filter(Boolean);
    if (sections.length && 'IntersectionObserver' in window) {
      const spy = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id;
            links.forEach((l) => l.classList.toggle('is-active', l.getAttribute('href') === '#' + id));
          }
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      sections.forEach((s) => spy.observe(s));
    }
  }

  /* --- Smooth in-page scrolling ---------------------------------------- */
  function initSmoothScroll() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;
      const id = link.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: prefersReduced ? 'auto' : 'smooth', block: 'start' });
      history.replaceState(null, '', id);
    });
  }

  /* --- Scroll progress + parallax -------------------------------------- */
  function initScrollProgress() {
    const bar = $('#scroll-progress-bar');
    const parallaxEls = $$('[data-parallax]');
    const update = throttleRAF(() => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;
      const ratio = max > 0 ? h.scrollTop / max : 0;
      if (bar) bar.style.transform = `scaleX(${ratio})`;
      if (!prefersReduced) {
        parallaxEls.forEach((el) => {
          const speed = parseFloat(el.dataset.parallax) || 0.1;
          const rect = el.getBoundingClientRect();
          const offset = (rect.top + rect.height / 2 - window.innerHeight / 2) * -speed;
          el.style.transform = `translateY(${offset.toFixed(1)}px)`;
        });
      }
    });
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* --- Reveal on scroll ------------------------------------------------- */
  function initReveal() {
    const items = $$('.reveal');
    if (prefersReduced || !('IntersectionObserver' in window)) {
      items.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = parseInt(entry.target.dataset.delay || '0', 10);
          window.setTimeout(() => entry.target.classList.add('is-visible'), delay);
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    items.forEach((el) => io.observe(el));
  }

  /* --- Animated counters ----------------------------------------------- */
  function initCounters() {
    const counters = $$('[data-counter]');
    if (!counters.length) return;
    const run = (el) => {
      const target = parseFloat(el.dataset.counter);
      const suffix = el.dataset.suffix || '';
      if (prefersReduced) { el.textContent = target + suffix; return; }
      const dur = 1600; const start = performance.now();
      const step = (now) => {
        const t = clamp((now - start) / dur, 0, 1);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(target * eased) + suffix;
        if (t < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };
    if (!('IntersectionObserver' in window)) return counters.forEach(run);
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { run(entry.target); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => io.observe(el));
  }

  /* --- Typing effect ---------------------------------------------------- */
  function initTyping() {
    const el = $('#typing-text');
    if (!el) return;
    const roles = ['Applied Mathematics Graduate', 'Backend Developer', 'PINN Researcher', 'Laravel Developer', 'Problem Solver'];
    if (prefersReduced) { el.textContent = roles[0]; return; }
    let r = 0, c = 0, deleting = false;
    const tick = () => {
      const word = roles[r];
      el.textContent = word.slice(0, c);
      if (!deleting) {
        c++;
        if (c > word.length) { deleting = true; return window.setTimeout(tick, 1700); }
      } else {
        c--;
        if (c < 0) { deleting = false; r = (r + 1) % roles.length; c = 0; return window.setTimeout(tick, 300); }
      }
      window.setTimeout(tick, deleting ? 45 : 85);
    };
    tick();
  }

  /* --- Tilt cards ------------------------------------------------------- */
  function initTilt() {
    if (isTouch || prefersReduced) return;
    $$('.tilt-card').forEach((card) => {
      const strength = parseFloat(card.dataset.tiltStrength) || 8;
      let rect = null, frame = 0, px = 0, py = 0;
      card.addEventListener('mouseenter', () => { rect = card.getBoundingClientRect(); });
      card.addEventListener('mousemove', (e) => {
        if (!rect) rect = card.getBoundingClientRect();
        px = (e.clientX - rect.left) / rect.width - 0.5;
        py = (e.clientY - rect.top) / rect.height - 0.5;
        if (!frame) frame = requestAnimationFrame(() => {
          card.style.transform = `perspective(900px) rotateY(${(px * strength).toFixed(2)}deg) rotateX(${(-py * strength).toFixed(2)}deg)`;
          frame = 0;
        });
      });
      card.addEventListener('mouseleave', () => { rect = null; card.style.transform = ''; });
    });
  }

  /* --- Interactive terminal (About) ------------------------------------ */
  function initTerminal() {
    const form = $('#terminal-form');
    const input = $('#terminal-command');
    const output = $('#terminal-output');
    if (!form || !input || !output) return;

    const print = (html, cls) => {
      const p = document.createElement('p');
      if (cls) p.className = cls;
      p.innerHTML = html;
      const hint = $('.terminal-hint', output);
      output.insertBefore(p, hint || null);
      output.scrollTop = output.scrollHeight;
    };
    const commands = {
      help: () => 'Available: <b>whoami</b>, <b>skills</b>, <b>projects</b>, <b>contact</b>, <b>math</b>, <b>flower</b>, <b>clear</b>',
      whoami: () => 'applied_mathematician + backend_engineer',
      skills: () => 'backend \u00b7 infrastructure \u00b7 mathematics \u00b7 data \u00b7 deployment',
      projects: () => 'Veloura Cinema \u00b7 eKursus System \u00b7 rcPINN  \u2014 scroll to #projects',
      contact: () => 'aimankarami27@gmail.com \u2014 or use the form in #contact',
      flower: () => { triggerEaster('Knowledge blooms in every direction.'); return 'A flower unfolds. \u2726'; },
      sudo: () => 'Permission granted. You always had it.',
      ls: () => 'about/  skills/  projects/  experience/  contact/',
      euler: () => 'e^{i\u03c0} + 1 = 0 \u2014 the most beautiful equation in mathematics.',
      pi: () => '\u03c0 \u2248 3.14159265358979 \u2014 circles never end.',
      fib: () => { const s = [0, 1]; while (s.length < 12) s.push(s[s.length - 1] + s[s.length - 2]); return 'fibonacci: ' + s.join(', ') + ' \u2026 (rcPINN uses this for adaptive chunk sizing)'; },
      matrix: () => '[ 1 0 ]<br>[ 0 1 ] \u2014 the identity. Everything begins here.',
      math: () => 'Try: <b>euler</b>, <b>pi</b>, <b>fib</b>, <b>matrix</b>',
    };

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const raw = input.value.trim();
      if (!raw) return;
      print('<span class="terminal-prompt">$</span> ' + escapeHTML(raw));
      const cmd = raw.toLowerCase();
      if (cmd === 'clear') { clearTerminal(); }
      else if (commands[cmd]) { print(commands[cmd](), 'terminal-user-response'); }
      else { print(`command not found: ${escapeHTML(cmd)} \u2014 try 'help'`, 'terminal-user-response'); }
      input.value = '';
    });

    const clearTerminal = () => {
      $$('#terminal-output > p, #terminal-output > .terminal-code').forEach((n) => {
        if (!n.classList.contains('terminal-hint')) n.remove();
      });
    };
    $('.terminal-clear')?.addEventListener('click', clearTerminal);
    $$('.terminal-hint button').forEach((b) => {
      b.addEventListener('click', () => { input.value = b.dataset.command; form.requestSubmit(); });
    });
  }
  const escapeHTML = (s) => s.replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));

  /* --- Skills constellation -------------------------------------------- */
  function initSkills() {
    const nodes = $$('.skill-node');
    const detail = $('#skill-detail');
    if (!nodes.length || !detail) return;
    const data = {
      systems: { i: 'NODE / 00', h: 'Systems thinking', p: 'Connecting architecture, data, infrastructure, and user needs into one coherent whole.', xp: 'Multi-domain', pr: '03+', cf: 'High' },
      backend: { i: 'NODE / 01', h: 'Backend engineering', p: 'Java EE and Laravel services with clean architecture, auth, and maintainable APIs.', xp: 'Core focus', pr: '02', cf: 'Strong' },
      infrastructure: { i: 'NODE / 02', h: 'Infrastructure', p: 'Linux servers, Nginx reverse proxy, SSL, Docker, and production deployment.', xp: 'Hands-on', pr: '01', cf: 'Strong' },
      mathematics: { i: 'NODE / 03', h: 'Applied mathematics', p: 'Numerical methods and modeling, including PINN training frameworks.', xp: 'Research', pr: '01', cf: 'High' },
      data: { i: 'NODE / 04', h: 'Data & databases', p: 'Relational schema design in MySQL with an eye for real workflows.', xp: 'Applied', pr: '02', cf: 'Strong' },
      research: { i: 'NODE / 05', h: 'Research', p: 'Turning open questions into reproducible experiments and results.', xp: 'Ongoing', pr: '01', cf: 'Growing' },
      deployment: { i: 'NODE / 06', h: 'Deployment', p: 'Shipping to VPS infrastructure with reliable, repeatable processes.', xp: 'Practical', pr: '02', cf: 'Strong' },
    };
    const show = (node) => {
      const d = data[node.dataset.skill];
      if (!d) return;
      nodes.forEach((n) => {
        const active = n === node;
        n.classList.toggle('is-active', active);
        n.setAttribute('aria-pressed', String(active));
      });
      detail.innerHTML = `<span class="skill-detail__index mono">${d.i}</span><h3>${d.h}</h3><p>${d.p}</p>` +
        `<div><span><small>EXPERIENCE</small><strong>${d.xp}</strong></span><span><small>PROJECTS</small><strong>${d.pr}</strong></span><span><small>CONFIDENCE</small><strong>${d.cf}</strong></span></div>`;
      detail.classList.add('is-visible');
    };
    const hide = () => {
      detail.classList.remove('is-visible');
      nodes.forEach((n) => { n.classList.remove('is-active'); n.setAttribute('aria-pressed', 'false'); });
    };
    nodes.forEach((node) => {
      // Show only while hovering the node; hide the moment the pointer leaves it.
      node.addEventListener('mouseenter', () => show(node));
      node.addEventListener('mouseleave', hide);
      // Keyboard accessibility: mirror hover with focus/blur.
      node.addEventListener('focus', () => show(node));
      node.addEventListener('blur', hide);
    });
  }

  /* --- Projects: filter + search --------------------------------------- */
  function initProjects() {
    const grid = $('#project-grid');
    const cards = $$('.project-card');
    const filters = $$('.filter-button');
    const search = $('#project-search');
    const noResults = $('#no-results');
    if (!grid) return;
    let activeFilter = 'all', query = '';

    const apply = () => {
      let visible = 0;
      cards.forEach((card) => {
        const cats = card.dataset.category || '';
        const title = (card.dataset.title || '').toLowerCase();
        const matchFilter = activeFilter === 'all' || cats.includes(activeFilter);
        const matchQuery = !query || title.includes(query);
        const show = matchFilter && matchQuery;
        card.classList.toggle('is-hidden', !show);
        if (show) visible++;
      });
      if (noResults) noResults.hidden = visible !== 0;
    };

    filters.forEach((btn) => {
      btn.addEventListener('click', () => {
        filters.forEach((b) => { b.classList.remove('is-active'); b.setAttribute('aria-pressed', 'false'); });
        btn.classList.add('is-active'); btn.setAttribute('aria-pressed', 'true');
        activeFilter = btn.dataset.filter;
        apply();
      });
    });
    if (search) {
      search.addEventListener('input', () => { query = search.value.trim().toLowerCase(); apply(); });
      document.addEventListener('keydown', (e) => {
        if (e.key === '/' && document.activeElement !== search && !/input|textarea|select/i.test(document.activeElement.tagName)) {
          e.preventDefault(); search.focus();
        }
      });
    }
  }

  /* --- Project case-study dialog --------------------------------------- */
  function initDialog() {
    const dialog = $('#project-dialog');
    if (!dialog) return;
    const data = {
      veloura: {
        index: '01', title: 'Veloura Cinema', lead: 'A Java-based movie booking platform running on production Linux infrastructure.',
        stats: [['ROLE', 'Full-stack'], ['STACK', 'Java EE'], ['STATUS', 'Live demo']],
        challenge: 'Deliver a reliable booking experience while owning the full deployment pipeline on a VPS.',
        response: 'Built the application on Java EE + Tomcat, backed by MySQL, containerized with Docker and served behind Nginx with SSL.',
        bullets: ['Configured the Tomcat deployment environment', 'Integrated the MySQL database architecture', 'Configured SSL and a reverse proxy with Nginx', 'Deployed on VPS infrastructure'],
      },
      ekursus: {
        index: '02', title: 'eKursus System', lead: 'A centralized platform replacing manual course workflows and fragmented data collection.',
        stats: [['ROLE', 'Backend'], ['STACK', 'Laravel'], ['FOCUS', 'Data model']],
        challenge: 'Disjointed Google Forms and manual steps made course operations slow and error-prone.',
        response: 'Designed a primary relational schema and role-based workflows to centralize the entire process.',
        bullets: ['Designed and engineered the primary relational database structure', 'Replaced disjointed Google Forms with structured data collection', 'Implemented role-based administrative workflows'],
      },
      rcpinn: {
        index: '03', title: 'rcPINN', lead: 'A Restarting\u2013Chunking PINN training framework for long-time horizon problems.',
        stats: [['ROLE', 'Research'], ['STACK', 'Python'], ['FIELD', 'Numerics']],
        challenge: 'Vanilla PINNs struggle to converge on complex, long-time dynamical systems.',
        response: 'Introduced restarting and chunking with Fibonacci adaptive chunk sizing to improve convergence without manual tuning.',
        bullets: ['Improved convergence compared to vanilla PINNs', 'Implemented Fibonacci adaptive chunk sizing (no manual tuning)', 'Improved robustness for complex dynamical systems'],
      },
    };
    const supportsDialog = typeof dialog.showModal === 'function';

    const open = (key) => {
      const d = data[key];
      if (!d) return;
      $('#dialog-index').textContent = d.index;
      $('#dialog-title').textContent = d.title;
      $('#dialog-lead').textContent = d.lead;
      $('#dialog-challenge').textContent = d.challenge;
      $('#dialog-response').textContent = d.response;
      $('#dialog-stats').innerHTML = d.stats.map(([k, v]) => `<div><small>${k}</small><strong>${v}</strong></div>`).join('');
      $('#dialog-bullets').innerHTML = d.bullets.map((b) => `<li>${b}</li>`).join('');
      if (supportsDialog) dialog.showModal(); else dialog.setAttribute('open', '');
      document.body.style.overflow = 'hidden';
    };
    const close = () => {
      if (supportsDialog && dialog.open) dialog.close(); else dialog.removeAttribute('open');
      document.body.style.overflow = '';
    };

    $$('[data-project-open]').forEach((btn) => btn.addEventListener('click', () => open(btn.dataset.projectOpen)));
    $$('[data-dialog-close], .dialog-close').forEach((btn) => btn.addEventListener('click', close));
    dialog.addEventListener('click', (e) => { if (e.target === dialog) close(); });
    dialog.addEventListener('cancel', () => { document.body.style.overflow = ''; });
  }

  /* --- Experience timeline: accordion + progress ----------------------- */
  function initTimeline() {
    $$('.timeline-entry').forEach((entry) => {
      const header = $('.timeline-entry__header', entry);
      if (!header) return;
      header.addEventListener('click', () => {
        const open = entry.classList.toggle('is-open');
        header.setAttribute('aria-expanded', String(open));
      });
    });
    const line = $('#timeline-progress');
    const timeline = $('#timeline');
    if (line && timeline) {
      const update = throttleRAF(() => {
        const r = timeline.getBoundingClientRect();
        const vh = window.innerHeight;
        const ratio = clamp((vh * 0.6 - r.top) / r.height, 0, 1);
        line.style.height = (ratio * 100) + '%';
      });
      window.addEventListener('scroll', update, { passive: true });
      update();
    }
  }

  /* --- Certificates ----------------------------------------------------- */
  function initCertificates() {
    $$('[data-certificate]').forEach((btn) => {
      btn.addEventListener('click', () => showToast('Certificate', `"${btn.dataset.certificate}" preview is a local placeholder.`));
    });
  }

  /* --- Local link placeholders + toast --------------------------------- */
  let toastTimer;
  function showToast(title, msg) {
    const toast = $('#toast');
    if (!toast) return;
    $('strong', toast).textContent = title;
    $('small', toast).textContent = msg;
    toast.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 3600);
  }
  function initLocalLinks() {
    $$('[data-local-link]').forEach((el) => {
      el.addEventListener('click', (e) => {
        e.preventDefault();
        showToast('Local demo', `${el.dataset.localLink} link is a placeholder \u2014 add your URL.`);
      });
    });
  }
  function initResume() {
    const btn = $('[data-resume-download]');
    if (!btn) return;
    btn.addEventListener('click', () => {
      const a = document.createElement('a');
      a.href = 'assets/docs/resume.pdf';
      a.download = 'Muhamad-Noraiman-Karami-Resume.pdf';
      a.target = '_blank';
      a.rel = 'noopener';
      document.body.appendChild(a); a.click(); a.remove();
      showToast('Résumé', 'Opening résumé (PDF).');
    });
  }

  /* --- Contact form: validation + success ------------------------------ */
  function initContact() {
    const form = $('#contact-form');
    if (!form) return;
    const fields = $$('.form-field input, .form-field textarea, .form-field select', form);
    const message = $('#message');
    const count = $('#message-count');

    const validators = {
      name: (v) => v.trim().length >= 2 || 'Please enter at least 2 characters.',
      email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || 'Enter a valid email address.',
      subject: (v) => !!v || 'Please choose a subject.',
      message: (v) => v.trim().length >= 20 || 'Tell me a little more (20+ characters).',
    };
    const validate = (field) => {
      const fn = validators[field.name];
      if (!fn) return true;
      const result = fn(field.value);
      const wrap = field.closest('.form-field');
      const error = $('.form-error', wrap);
      if (result === true) { wrap.classList.remove('is-invalid'); if (error) error.textContent = ''; return true; }
      wrap.classList.add('is-invalid'); if (error) error.textContent = result; return false;
    };

    fields.forEach((f) => {
      f.addEventListener('blur', () => validate(f));
      f.addEventListener('input', () => { if (f.closest('.form-field').classList.contains('is-invalid')) validate(f); });
    });
    if (message && count) {
      const max = 800;
      message.addEventListener('input', () => {
        if (message.value.length > max) message.value = message.value.slice(0, max);
        count.textContent = message.value.length;
      });
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const ok = fields.map(validate).every(Boolean);
      if (!ok) { announce('Please fix the highlighted fields.'); return; }
      const submit = $('.contact-submit', form);
      submit.classList.add('is-sending');
      window.setTimeout(() => {
        submit.classList.remove('is-sending');
        form.classList.add('is-sent');
        announce('Message sent successfully.');
        if (!prefersReduced) petalBurst(10);
      }, 1400);
    });

    $('#send-another')?.addEventListener('click', () => {
      form.reset();
      form.classList.remove('is-sent');
      if (count) count.textContent = '0';
      $$('.form-field', form).forEach((w) => w.classList.remove('is-invalid'));
    });
  }

  /* --- Footer: stars + hidden flower + year ---------------------------- */
  function initFooter() {
    const yearEl = $('#current-year');
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    const stars = $('#footer-stars');
    if (stars && !prefersReduced && !lowPower) {
      const frag = document.createDocumentFragment();
      for (let i = 0; i < 22; i++) {
        const s = document.createElement('span');
        s.className = 'footer-star';
        s.style.left = Math.random() * 100 + '%';
        s.style.top = Math.random() * 100 + '%';
        s.style.setProperty('--dur', (Math.random() * 3 + 2).toFixed(1) + 's');
        s.style.setProperty('--delay', '-' + (Math.random() * 4).toFixed(1) + 's');
        frag.appendChild(s);
      }
      stars.appendChild(frag);
    }
    $('#hidden-flower')?.addEventListener('click', () => triggerEaster('You found a hidden flower. Curiosity rewarded.'));
  }

  /* --- Easter eggs ------------------------------------------------------ */
  function petalBurst(n) {
    const petals = ['\u2726', '\u2727', '\u273f', '\u2735'];
    for (let i = 0; i < n; i++) {
      const petal = document.createElement('span');
      petal.className = 'easter-petal';
      petal.textContent = petals[i % petals.length];
      petal.style.left = Math.random() * 100 + 'vw';
      petal.style.fontSize = (Math.random() * 1.2 + 0.7).toFixed(2) + 'rem';
      petal.style.animationDuration = (Math.random() * 3 + 3).toFixed(1) + 's';
      petal.style.animationDelay = (Math.random() * 0.5).toFixed(2) + 's';
      document.body.appendChild(petal);
      window.setTimeout(() => petal.remove(), 6500);
    }
  }
  let easterTimer;
  function triggerEaster(text) {
    const overlay = $('#easter-overlay');
    if (overlay) {
      if (text) $('span', overlay).textContent = text;
      overlay.classList.add('is-visible');
      window.clearTimeout(easterTimer);
      easterTimer = window.setTimeout(() => overlay.classList.remove('is-visible'), 2600);
    }
    if (!prefersReduced) petalBurst(16);
    announce('Easter egg unlocked. ' + (text || ''));
  }

  function initEasterEggs() {
    // Type "robin" anywhere
    let buffer = '';
    const konami = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let kIndex = 0;
    document.addEventListener('keydown', (e) => {
      const tag = document.activeElement && document.activeElement.tagName;
      if (!/input|textarea|select/i.test(tag || '')) {
        if (e.key && e.key.length === 1) {
          buffer = (buffer + e.key.toLowerCase()).slice(-8);
          if (buffer.includes('robin')) { buffer = ''; triggerEaster('The flower of the demon. Hana Hana no Mi.'); }
        }
      }
      // Konami code
      const key = e.key === 'B' ? 'b' : e.key === 'A' ? 'a' : e.key;
      if (key === konami[kIndex]) {
        kIndex++;
        if (kIndex === konami.length) { kIndex = 0; triggerEaster('Konami archive unlocked. Thirty fingers bloom.'); }
      } else {
        kIndex = key === konami[0] ? 1 : 0;
      }
    });

    // Double-click the logo
    $('.logo')?.addEventListener('dblclick', (e) => { e.preventDefault(); triggerEaster('Logo secret: built from first principles.'); });

    // Dismiss overlay on click
    $('#easter-overlay')?.addEventListener('click', function () { this.classList.remove('is-visible'); });
  }

  /* --- Boot ------------------------------------------------------------- */
  onReady(() => {
    initPreloader();
    initCursor();
    initMagnetic();
    initRipple();
    initAtmosphere();
    initNavbar();
    initSmoothScroll();
    initScrollProgress();
    initReveal();
    initCounters();
    initTyping();
    initTilt();
    initTerminal();
    initSkills();
    initProjects();
    initDialog();
    initTimeline();
    initCertificates();
    initLocalLinks();
    initResume();
    initContact();
    initFooter();
    initEasterEggs();
    // eslint-disable-next-line no-console
    console.log('%cKARAMI // system ready', 'color:#c084fc;font-family:monospace;font-size:12px;');
    console.log('%cTip: type "robin", try the Konami code, or double-click the logo.', 'color:#64748b;font-family:monospace;');
  });
})();
