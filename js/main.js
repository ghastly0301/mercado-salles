/* =========================================================
   MERCADO SALLES — interações e animações
   ========================================================= */
(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => Array.from(c.querySelectorAll(s));

  /* ---------- Preloader + hero intro ---------- */
  const preloader = $('#preloader');
  const finishLoad = () => {
    document.body.classList.add('is-loaded');
    if (preloader) preloader.classList.add('is-done');
    // dispara reveals já visíveis (hero)
    $$('.hero .reveal-up').forEach(el => el.classList.add('is-visible'));
    startCounters($$('.hero [data-counter]'));
  };
  if (reduceMotion) {
    finishLoad();
  } else {
    const minDelay = new Promise(r => setTimeout(r, 1500));
    const loaded = new Promise(r => (document.readyState === 'complete' ? r() : window.addEventListener('load', r, { once: true })));
    Promise.all([minDelay, loaded]).then(finishLoad);
    setTimeout(finishLoad, 5000); // nunca deixe o preloader travar
  }

  /* ---------- Delay por data-delay ---------- */
  $$('[data-delay]').forEach(el => el.style.setProperty('--d', `${el.dataset.delay}ms`));

  /* ---------- Header: encolhe, esconde ao descer, mostra ao subir ---------- */
  const header = $('#header');
  const topbar = $('#topbar');
  const toTop = $('#toTop');
  let lastY = window.scrollY;
  let ticking = false;

  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 40);
    if (y > 320 && y > lastY + 6 && !document.body.classList.contains('is-locked')) header.classList.add('is-hidden');
    else if (y < lastY - 6 || y < 320) header.classList.remove('is-hidden');
    toTop.classList.toggle('is-visible', y > 700);
    lastY = y;
    updateActiveLink();
    ticking = false;
  };
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });

  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

  /* ---------- Link ativo no menu ---------- */
  const navLinks = $$('.nav__link');
  const sections = navLinks.map(a => $(a.getAttribute('href'))).filter(Boolean);
  function updateActiveLink() {
    const pos = window.scrollY + window.innerHeight * 0.35;
    let current = null;
    sections.forEach(s => { if (s.offsetTop <= pos) current = s; });
    navLinks.forEach(a => a.classList.toggle('is-active', current && a.getAttribute('href') === `#${current.id}`));
  }

  /* ---------- Menu mobile ---------- */
  const hamburger = $('#hamburger');
  const nav = $('#nav');
  const setMenu = open => {
    nav.classList.toggle('is-open', open);
    hamburger.classList.toggle('is-open', open);
    hamburger.setAttribute('aria-expanded', String(open));
    hamburger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    document.body.classList.toggle('is-locked', open);
    header.classList.toggle('is-menu-open', open);
    if (open) header.classList.remove('is-hidden');
  };
  hamburger.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  $$('a', nav).forEach(a => a.addEventListener('click', () => setMenu(false)));
  window.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });
  window.matchMedia('(min-width: 981px)').addEventListener('change', e => { if (e.matches) setMenu(false); });

  /* ---------- Scroll suave com compensação do header ---------- */
  $$('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = $(id);
      if (!target) return;
      e.preventDefault();
      const offset = (header.classList.contains('is-hidden') ? 0 : header.offsetHeight) + 8;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: reduceMotion ? 'auto' : 'smooth' });
      history.replaceState(null, '', id);
    });
  });

  /* ---------- Reveal on scroll ---------- */
  const revealEls = $$('.reveal-up, .reveal-left, .reveal-right, .reveal-scale').filter(el => !el.closest('.hero'));
  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('is-visible'));
  } else {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(el => io.observe(el));
  }

  /* ---------- Contadores ---------- */
  const fmt = (n, pt) => pt ? n.toLocaleString('pt-BR') : String(n);
  function startCounters(els) {
    els.forEach(el => {
      if (el.dataset.done) return;
      el.dataset.done = '1';
      const target = Number(el.dataset.counter);
      const pt = el.dataset.format === 'pt';
      if (reduceMotion) { el.textContent = fmt(target, pt); return; }
      const dur = 1800, t0 = performance.now();
      const step = now => {
        const p = Math.min(1, (now - t0) / dur);
        const eased = 1 - Math.pow(1 - p, 4);
        el.textContent = fmt(Math.round(target * eased), pt);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }

  /* ---------- Parallax ---------- */
  const parallaxEls = $$('[data-parallax]');
  if (!reduceMotion && parallaxEls.length) {
    const update = () => {
      const vh = window.innerHeight;
      parallaxEls.forEach(el => {
        const r = el.parentElement.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        const progress = (r.top + r.height / 2 - vh / 2) / vh; // -1..1
        el.style.transform = `translate3d(0, ${(-progress * Number(el.dataset.parallax) * 100).toFixed(1)}px, 0)`;
      });
    };
    window.addEventListener('scroll', () => requestAnimationFrame(update), { passive: true });
    update();
  }

  /* ---------- Rotação de palavras no título ---------- */
  const rotator = $('#rotator');
  if (rotator && !reduceMotion) {
    const words = $$('span', rotator);
    let i = 0;
    setInterval(() => {
      const cur = words[i];
      i = (i + 1) % words.length;
      cur.classList.remove('is-active'); cur.classList.add('is-leaving');
      setTimeout(() => cur.classList.remove('is-leaving'), 600);
      words[i].classList.add('is-active');
    }, 3200);
  }

  /* ---------- Marquee: duplica o conteúdo para loop contínuo ---------- */
  const marquee = $('#marquee');
  if (marquee) marquee.innerHTML += marquee.innerHTML;

  /* ---------- Abas de cortes ---------- */
  const tabs = $$('.cuts__tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => { t.classList.remove('is-active'); t.setAttribute('aria-selected', 'false'); });
      $$('.cuts__panel').forEach(p => { p.hidden = true; p.classList.remove('is-active'); });
      tab.classList.add('is-active'); tab.setAttribute('aria-selected', 'true');
      const panel = $(`#${tab.getAttribute('aria-controls')}`);
      panel.hidden = false; panel.classList.add('is-active');
      // reanima os chips com atraso em cascata
      $$('span', panel).forEach((s, idx) => {
        s.style.animation = 'none'; s.offsetHeight; // reflow
        s.style.animation = ''; s.style.animationDelay = `${Math.min(idx * 25, 500)}ms`;
      });
    });
  });
  $$('.cuts__panel span').forEach((s, idx) => s.style.animationDelay = `${Math.min(idx * 25, 500)}ms`);

  /* ---------- Status aberto / fechado (seg–sáb, 7h–20h, horário de Brasília) ---------- */
  const status = $('#openStatus');
  if (status) {
    const render = () => {
      const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Sao_Paulo' }));
      const day = now.getDay(), h = now.getHours() + now.getMinutes() / 60;
      const open = day >= 1 && day <= 6 && h >= 7 && h < 20;
      status.className = `contact-card__status ${open ? 'is-open' : 'is-closed'}`;
      status.textContent = open ? 'Aberto agora' : (day === 0 ? 'Fechado · abre segunda às 7h' : 'Fechado agora');
    };
    render(); setInterval(render, 60000);
  }

  /* ---------- Formulário de contato → WhatsApp ---------- */
  const contactForm = $('#contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', e => {
      e.preventDefault();
      const f = contactForm.elements;
      let ok = true;
      ['nome', 'mensagem'].forEach(name => {
        const inv = !f[name].value.trim();
        f[name].classList.toggle('is-invalid', inv);
        if (inv) ok = false;
      });
      const msgEl = $('#contactMsg');
      if (!ok) { msgEl.textContent = 'Preencha seu nome e a mensagem para continuar.'; msgEl.style.color = '#a12a1f'; return; }
      const text = `Olá! Vim pelo site do Mercado Salles.\n\n*Nome:* ${f.nome.value.trim()}\n*Telefone:* ${f.telefone.value.trim() || '-'}\n*Assunto:* ${f.assunto.value}\n\n${f.mensagem.value.trim()}`;
      const phone = f.assunto.value === 'Workshops' ? '5547984682628' : '5547992027899';
      window.open(`https://api.whatsapp.com/send?phone=${phone}&text=${encodeURIComponent(text)}`, '_blank', 'noopener');
      msgEl.style.color = ''; msgEl.textContent = 'Abrimos o WhatsApp com a sua mensagem. Até já!';
      contactForm.reset();
    });
    $$('input, textarea', contactForm).forEach(el => el.addEventListener('input', () => el.classList.remove('is-invalid')));
  }

  /* ---------- Newsletter → e-mail da loja ---------- */
  const newsletter = $('#newsletterForm');
  if (newsletter) {
    newsletter.addEventListener('submit', e => {
      e.preventDefault();
      const email = newsletter.elements.email.value.trim();
      const msg = $('#newsletterMsg');
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { msg.textContent = 'Digite um e-mail válido.'; return; }
      const body = `Olá! Quero receber as ofertas do Mercado Salles neste e-mail: ${email}`;
      window.location.href = `mailto:contato@mercadosalles.com.br?subject=${encodeURIComponent('Cadastro para ofertas')}&body=${encodeURIComponent(body)}`;
      msg.textContent = 'Obrigado! Confirme o envio no seu aplicativo de e-mail.';
      newsletter.reset();
    });
  }

  /* ---------- Ano no rodapé ---------- */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
