/* =========================================================
   Lubella Buffet Infantil — scripts
   ========================================================= */

/* >>> TROQUE AQUI o número do WhatsApp (DDI 55 + DDD + número, só dígitos) <<< */
const WHATSAPP_NUMBER = '55XXXXXXXXXXX';

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** Monta o link do WhatsApp com a mensagem já preenchida */
  function whatsappLink(message) {
    return 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message);
  }

  /* ---------- Links de WhatsApp (data-wa) ---------- */
  document.querySelectorAll('[data-wa]').forEach(function (el) {
    el.href = whatsappLink(el.getAttribute('data-wa'));
    el.target = '_blank';
    el.rel = 'noopener';
  });

  /* ---------- Botões "Quero este pacote" ---------- */
  document.querySelectorAll('[data-pacote]').forEach(function (el) {
    const pacote = el.getAttribute('data-pacote');
    el.href = whatsappLink(
      'Olá, Lubella! Tenho interesse no *Pacote ' + pacote + '* e gostaria de consultar valores e datas disponíveis.'
    );
    el.target = '_blank';
    el.rel = 'noopener';
    el.setAttribute('aria-label', 'Quero o pacote ' + pacote + ' (abre o WhatsApp)');
  });

  /* ---------- Header: sombra ao rolar ---------- */
  const header = document.querySelector('.site-header');
  const onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 10); };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Menu mobile ---------- */
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.getElementById('menu-principal');

  function setMenu(open) {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    nav.classList.toggle('is-open', open);
  }

  toggle.addEventListener('click', function () {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    setMenu(open);
    if (open) { const first = nav.querySelector('a'); if (first) first.focus(); }
  });
  nav.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () { setMenu(false); });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && nav.classList.contains('is-open')) { setMenu(false); toggle.focus(); }
  });
  document.addEventListener('click', function (e) {
    if (nav.classList.contains('is-open') && !nav.contains(e.target) && !toggle.contains(e.target)) setMenu(false);
  });

  /* ---------- Animação de entrada + contadores ---------- */
  function animateCount(el) {
    const target = parseInt(el.getAttribute('data-count'), 10);
    const prefix = el.getAttribute('data-prefix') || '';
    const suffix = el.getAttribute('data-suffix') || '';
    if (prefersReducedMotion) return;
    const duration = 1400;
    const start = performance.now();
    function frame(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(target * eased).toLocaleString('pt-BR') + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !prefersReducedMotion) {
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        entry.target.querySelectorAll('[data-count]').forEach(animateCount);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ---------- FAQ (acordeão) ---------- */
  const triggers = Array.prototype.slice.call(document.querySelectorAll('.accordion-trigger'));
  triggers.forEach(function (btn, i) {
    btn.addEventListener('click', function () {
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!expanded));
      document.getElementById(btn.getAttribute('aria-controls')).hidden = expanded;
    });
    btn.addEventListener('keydown', function (e) {
      let next = null;
      if (e.key === 'ArrowDown') next = triggers[(i + 1) % triggers.length];
      else if (e.key === 'ArrowUp') next = triggers[(i - 1 + triggers.length) % triggers.length];
      else if (e.key === 'Home') next = triggers[0];
      else if (e.key === 'End') next = triggers[triggers.length - 1];
      if (next) { e.preventDefault(); next.focus(); }
    });
  });

  /* ---------- Carrossel de depoimentos ---------- */
  const carousel = document.querySelector('.carousel');
  if (carousel) {
    const track = carousel.querySelector('.carousel-track');
    const slides = carousel.querySelectorAll('.carousel-slide');
    const dotsWrap = carousel.querySelector('.carousel-dots');
    const status = carousel.querySelector('.carousel-status');
    let index = 0;
    let timer = null;

    const dots = Array.prototype.map.call(slides, function (_, i) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'carousel-dot';
      dot.setAttribute('aria-label', 'Ver depoimento ' + (i + 1));
      dot.addEventListener('click', function () { goTo(i, true); });
      dotsWrap.appendChild(dot);
      return dot;
    });

    function goTo(i, announce) {
      index = (i + slides.length) % slides.length;
      track.style.transform = 'translateX(' + (-100 * index) + '%)';
      slides.forEach(function (s, n) {
        const active = n === index;
        s.setAttribute('aria-hidden', String(!active));
        if (active) s.removeAttribute('inert'); else s.setAttribute('inert', '');
      });
      dots.forEach(function (d, n) {
        if (n === index) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current');
      });
      if (announce) status.textContent = 'Depoimento ' + (index + 1) + ' de ' + slides.length;
    }

    function start() { if (!prefersReducedMotion) { stop(); timer = setInterval(function () { goTo(index + 1); }, 7000); } }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }

    carousel.querySelector('.carousel-prev').addEventListener('click', function () { goTo(index - 1, true); });
    carousel.querySelector('.carousel-next').addEventListener('click', function () { goTo(index + 1, true); });
    carousel.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { goTo(index - 1, true); }
      if (e.key === 'ArrowRight') { goTo(index + 1, true); }
    });
    // Pausa ao passar o mouse ou focar (WCAG 2.2.2)
    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    carousel.addEventListener('focusin', stop);
    carousel.addEventListener('focusout', function (e) { if (!carousel.contains(e.relatedTarget)) start(); });

    // Swipe no celular
    let startX = null;
    track.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; stop(); }, { passive: true });
    track.addEventListener('touchend', function (e) {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) goTo(index + (dx < 0 ? 1 : -1), true);
      startX = null;
      start();
    });

    goTo(0);
    start();
  }

  /* ---------- Lightbox da galeria ---------- */
  const lightbox = document.getElementById('lightbox');
  const items = Array.prototype.slice.call(document.querySelectorAll('.galeria-item'));
  if (lightbox && items.length) {
    const lbImg = lightbox.querySelector('img');
    const lbCaption = lightbox.querySelector('figcaption');
    const btnClose = lightbox.querySelector('.lightbox-close');
    let current = 0;
    let lastFocus = null;

    function show(i) {
      current = (i + items.length) % items.length;
      const item = items[current];
      lbImg.src = item.getAttribute('data-full');
      lbImg.alt = item.querySelector('img').alt;
      lbCaption.textContent = item.getAttribute('data-caption') + ' (' + (current + 1) + ' de ' + items.length + ')';
    }
    function open(i) {
      lastFocus = document.activeElement;
      show(i);
      lightbox.hidden = false;
      document.body.classList.add('no-scroll');
      btnClose.focus();
    }
    function close() {
      lightbox.hidden = true;
      document.body.classList.remove('no-scroll');
      if (lastFocus) lastFocus.focus();
    }

    items.forEach(function (item, i) { item.addEventListener('click', function () { open(i); }); });
    btnClose.addEventListener('click', close);
    lightbox.querySelector('.lightbox-prev').addEventListener('click', function () { show(current - 1); });
    lightbox.querySelector('.lightbox-next').addEventListener('click', function () { show(current + 1); });
    lightbox.addEventListener('click', function (e) { if (e.target === lightbox) close(); });
    lightbox.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') show(current - 1);
      else if (e.key === 'ArrowRight') show(current + 1);
      else if (e.key === 'Tab') {
        // Mantém o foco dentro do lightbox
        const focusables = lightbox.querySelectorAll('button');
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  }

  /* ---------- Formulário → WhatsApp ---------- */
  const form = document.getElementById('form-orcamento');
  if (form) {
    // Não permite escolher datas passadas
    const dateInput = form.querySelector('#f-data');
    const today = new Date();
    today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
    dateInput.min = today.toISOString().slice(0, 10);

    // Máscara simples de telefone: (43) 99999-9999
    const phone = form.querySelector('#f-whats');
    phone.addEventListener('input', function () {
      const d = phone.value.replace(/\D/g, '').slice(0, 11);
      let out = d;
      if (d.length > 2) out = '(' + d.slice(0, 2) + ') ' + d.slice(2);
      if (d.length > 7) out = '(' + d.slice(0, 2) + ') ' + d.slice(2, d.length - 4) + '-' + d.slice(-4);
      phone.value = out;
    });

    function setError(input, show) {
      const err = document.getElementById(input.id + '-erro');
      input.setAttribute('aria-invalid', String(show));
      if (show) input.setAttribute('aria-describedby', err.id); else input.removeAttribute('aria-describedby');
      err.hidden = !show;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const data = new FormData(form);
      const nome = (data.get('nome') || '').trim();
      const whats = (data.get('whatsapp') || '').replace(/\D/g, '');

      const nomeInput = form.querySelector('#f-nome');
      setError(nomeInput, !nome);
      setError(phone, whats.length < 10);
      if (!nome) { nomeInput.focus(); return; }
      if (whats.length < 10) { phone.focus(); return; }

      let dataFesta = data.get('data');
      if (dataFesta) dataFesta = dataFesta.split('-').reverse().join('/');

      const linhas = [
        'Olá, Lubella! Gostaria de solicitar um orçamento 🎉',
        '',
        '*Nome:* ' + nome,
        '*WhatsApp:* ' + phone.value
      ];
      if (dataFesta) linhas.push('*Data desejada:* ' + dataFesta);
      if (data.get('idade')) linhas.push('*Idade do aniversariante:* ' + data.get('idade') + ' anos');
      if (data.get('convidados')) linhas.push('*Número de convidados:* ' + data.get('convidados'));
      if (data.get('tema')) linhas.push('*Tema:* ' + data.get('tema').trim());
      if (data.get('pacote')) linhas.push('*Pacote de interesse:* ' + data.get('pacote'));
      if ((data.get('mensagem') || '').trim()) linhas.push('', '*Mensagem:* ' + data.get('mensagem').trim());

      const url = whatsappLink(linhas.join('\n'));
      const win = window.open(url, '_blank');
      if (win) win.opener = null; else window.location.href = url; // se o pop-up for bloqueado
    });
  }

  /* ---------- Ano no rodapé ---------- */
  const ano = document.getElementById('ano');
  if (ano) ano.textContent = new Date().getFullYear();
})();
