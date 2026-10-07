/* =========================================================
   CT BROCKS — configuração
   Edite só este bloco para atualizar contatos do site inteiro.
   ========================================================= */
const CONFIG = {
  // Somente números, com DDI 55 + DDD. Ex.: '5511999998888'
  whatsapp: '5581983169070',
  // Texto exibido para o telefone. Ex.: '(11) 99999-8888'
  telefone: '(81) 98316-9070',
  instagram: 'ct_brocks',
  // Endereço completo: usado no texto, no mapa e no botão "Como chegar"
  endereco: 'R. José Bezerra Filho - Centro, Cabo de Santo Agostinho - PE, 54510-420',
  funcionamento: 'Seg a Sex 5h–22h · Sáb 6h–13h · Dom fechado',
};

(() => {
  'use strict';

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  /* ---------- links e textos vindos da configuração ---------- */
  const waLink = (msg) => {
    const text = encodeURIComponent(msg || 'Olá! Vim pelo site do CT Brocks.');
    return CONFIG.whatsapp
      ? `https://wa.me/${CONFIG.whatsapp}?text=${text}`
      : `https://wa.me/?text=${text}`;
  };
  const igLink = `https://www.instagram.com/${CONFIG.instagram}/`;
  const mapsQuery = encodeURIComponent(CONFIG.endereco);

  $$('[data-wa]').forEach((a) => {
    a.href = waLink(a.dataset.wa);
    a.target = '_blank';
    a.rel = 'noopener';
  });
  $$('[data-ig]').forEach((a) => {
    a.href = igLink;
    a.target = '_blank';
    a.rel = 'noopener';
  });
  $$('[data-maps]').forEach((a) => {
    if (CONFIG.endereco) {
      a.href = `https://www.google.com/maps/dir/?api=1&destination=${mapsQuery}`;
      a.target = '_blank';
      a.rel = 'noopener';
    } else {
      a.href = '#mapa';
    }
  });

  const cfgText = {
    endereco: CONFIG.endereco || 'Endereço do CT (preencher em js/main.js)',
    funcionamento: CONFIG.funcionamento,
    telefone: CONFIG.telefone,
    instagramLabel: '@' + CONFIG.instagram,
  };
  $$('[data-cfg]').forEach((el) => { el.textContent = cfgText[el.dataset.cfg] ?? ''; });

  if (CONFIG.endereco) {
    $('#mapa').innerHTML =
      `<iframe title="Mapa do CT Brocks" loading="lazy" referrerpolicy="no-referrer-when-downgrade"
        src="https://www.google.com/maps?q=${mapsQuery}&output=embed"></iframe>`;
  }

  $('#ano').textContent = new Date().getFullYear();

  /* ---------- espaços de mídia ----------
     Se o arquivo de foto/vídeo ainda não existir, o espaço vira um
     placeholder que mostra o nome do arquivo esperado. Basta salvar
     o arquivo com esse nome na pasta assets/ e recarregar a página. */
  const fileName = (url) => (url || '').replace(/^.*?assets\//, 'assets/');
  const markEmpty = (slot, file) => {
    slot.classList.add('is-empty');
    if (file) slot.dataset.file = file;
  };

  // Se a foto local não existir, tenta a foto reserva (js/fotos.js) antes do placeholder.
  const RESERVA = window.FOTOS_RESERVA || {};
  const watchImage = (img, onFail) => {
    const fail = () => {
      const reserva = RESERVA[fileName(img.getAttribute('src'))];
      if (reserva && !img.dataset.reserva) {
        img.dataset.reserva = '1';
        img.addEventListener('error', onFail, { once: true });
        img.src = reserva;
      } else {
        onFail();
      }
    };
    if (img.complete && img.naturalWidth === 0 && img.getAttribute('src')) fail();
    else img.addEventListener('error', fail, { once: true });
  };

  const watchVideo = (video, onOk, onFail) => {
    const source = $('source', video);
    if (!source) return onFail();
    if (video.readyState >= 2) return onOk();
    if (video.networkState === HTMLMediaElement.NETWORK_NO_SOURCE) return onFail();
    video.addEventListener('loadeddata', onOk, { once: true });
    source.addEventListener('error', onFail, { once: true });
  };

  // Hero: tenta o vídeo; se não existir, usa a foto; se nenhum existir, placeholder.
  const heroMedia = $('.hero__media');
  if (heroMedia) {
    const video = $('video', heroMedia);
    const img = $('.hero__fallback', heroMedia);
    let videoFailed = false;
    let imgFailed = false;
    const check = () => {
      if (videoFailed && imgFailed) markEmpty(heroMedia, 'assets/videos/hero.mp4  ou  assets/fotos/hero.jpg');
    };
    watchVideo(
      video,
      () => { heroMedia.classList.add('has-video'); video.play().catch(() => {}); },
      () => { videoFailed = true; video.remove(); check(); }
    );
    watchImage(img, () => { imgFailed = true; img.remove(); check(); });
  }

  // Demais fotos
  $$('.slot').forEach((slot) => {
    if (slot === heroMedia) return;
    const img = $(':scope > img', slot);
    if (!img) return;
    const original = fileName(img.getAttribute('src'));
    watchImage(img, () => markEmpty(slot, original));
  });

  // Vídeos da galeria: tocam só quando estão visíveis na tela
  const videoObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
        entries.forEach(({ target, isIntersecting }) => {
          if (isIntersecting) target.play().catch(() => {});
          else target.pause();
        });
      }, { threshold: 0.35 })
    : null;

  $$('.slot--video').forEach((slot) => {
    const video = $('video', slot);
    const src = $('source', video)?.getAttribute('src');
    watchVideo(
      video,
      () => videoObserver && videoObserver.observe(video),
      () => {
        // sem vídeo: usa a capa (ou a foto reserva dela) como foto
        const poster = video.getAttribute('poster');
        const reserva = RESERVA[fileName(poster)];
        if (!reserva) return markEmpty(slot, fileName(src));
        const img = document.createElement('img');
        img.alt = slot.dataset.label || '';
        img.loading = 'lazy';
        img.src = poster;
        video.replaceWith(img);
        slot.classList.remove('slot--video');
        watchImage(img, () => markEmpty(slot, fileName(src)));
      }
    );
  });

  /* ---------- header e menu mobile ---------- */
  const header = $('.header');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 30);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const burger = $('#burger');
  const nav = $('#nav');
  const setMenu = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
    nav.classList.toggle('is-open', open);
    header.classList.toggle('menu-active', open);
    document.body.classList.toggle('menu-open', open);
  };
  burger.addEventListener('click', () => setMenu(nav.classList.contains('is-open') === false));
  $$('a', nav).forEach((a) => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setMenu(false); });

  // Destaca o item do menu da seção visível
  const navLinks = $$('.nav a[href^="#"]:not(.btn)');
  if ('IntersectionObserver' in window) {
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id));
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    navLinks.forEach((a) => {
      const section = $(a.getAttribute('href'));
      if (section) sectionObserver.observe(section);
    });
  }

  /* ---------- animação de entrada ---------- */
  const reveals = $$('.reveal');
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-in');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    // pequeno atraso em cascata entre irmãos
    reveals.forEach((el) => {
      const siblings = [...el.parentElement.children].filter((c) => c.classList.contains('reveal'));
      el.style.transitionDelay = `${Math.min(siblings.indexOf(el), 5) * 80}ms`;
      revealObserver.observe(el);
    });
  } else {
    reveals.forEach((el) => el.classList.add('is-in'));
  }

  /* ---------- contador dos números ---------- */
  const counters = $$('[data-count]');
  const animateCount = (el) => {
    const target = Number(el.dataset.count);
    const duration = 1600;
    const start = performance.now();
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ('IntersectionObserver' in window) {
    const countObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        countObserver.unobserve(entry.target);
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => countObserver.observe(el));
  } else {
    counters.forEach((el) => { el.textContent = el.dataset.count; });
  }

  /* ---------- destaca o dia de hoje no horário ---------- */
  const today = $(`.hours [data-day="${new Date().getDay()}"]`);
  if (today) today.classList.add('is-today');

  /* ---------- abas de horários ---------- */
  const tabs = $$('.tab');
  tabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      tabs.forEach((t) => {
        const active = t === tab;
        t.classList.toggle('is-active', active);
        t.setAttribute('aria-selected', String(active));
        const panel = $('#' + t.dataset.tab);
        panel.hidden = !active;
        panel.classList.toggle('is-active', active);
      });
    });
  });

  /* ---------- lightbox da galeria ---------- */
  const lightbox = $('#lightbox');
  const stage = $('.lightbox__stage', lightbox);
  let items = [];
  let current = 0;

  const show = (i) => {
    current = (i + items.length) % items.length;
    const media = $('img, video', items[current]);
    stage.innerHTML = '';
    if (media.tagName === 'VIDEO') {
      const v = document.createElement('video');
      v.src = $('source', media).getAttribute('src');
      v.controls = true;
      v.autoplay = true;
      v.playsInline = true;
      stage.appendChild(v);
    } else {
      const img = document.createElement('img');
      img.src = media.currentSrc || media.src;
      img.alt = media.alt;
      stage.appendChild(img);
    }
  };
  const open = (el) => {
    items = $$('.gallery .g:not(.is-empty)');
    if (!items.length) return;
    show(items.indexOf(el));
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    $('.lightbox__close', lightbox).focus();
  };
  const close = () => {
    lightbox.hidden = true;
    stage.innerHTML = '';
    document.body.style.overflow = '';
  };

  $$('.gallery .g').forEach((g) => {
    g.addEventListener('click', () => { if (!g.classList.contains('is-empty')) open(g); });
  });
  $('.lightbox__close', lightbox).addEventListener('click', close);
  $('.lightbox__prev', lightbox).addEventListener('click', () => show(current - 1));
  $('.lightbox__next', lightbox).addEventListener('click', () => show(current + 1));
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) close(); });
  document.addEventListener('keydown', (e) => {
    if (lightbox.hidden) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(current - 1);
    if (e.key === 'ArrowRight') show(current + 1);
  });
})();
