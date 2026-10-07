/* =========================================================
   Fazendinha Co-Có-Ri-Có | Buffet Rural – scripts do site
   JavaScript puro, sem dependências.
   ========================================================= */

/* ---------------------------------------------------------
   CONFIGURAÇÃO DO WHATSAPP  (edite aqui)
   ---------------------------------------------------------
   WHATSAPP_NUMBER: apenas números, com DDI 55 + DDD 65.
     Ex.: "5565999998888"
   Enquanto estiver "[PREENCHER]" (ou vazio), todos os botões
   usam o link curto WHATSAPP_FALLBACK (bit.ly), que não leva
   a mensagem pronta.
   Com o número preenchido, os botões abrem o WhatsApp
   (wa.me) já com a mensagem de cada botão escrita.
   [PREENCHER] Confirmar com o cliente se o número abaixo está
   certo no WhatsApp (celulares hoje têm 9 dígitos após o DDD;
   o número informado tem 8: 9982-0746). Teste clicando no botão.
   --------------------------------------------------------- */
const WHATSAPP_NUMBER = "556599820746";
const WHATSAPP_FALLBACK = "https://bit.ly/FazendinhaCocorico";

(function () {
  "use strict";

  document.documentElement.classList.add("js");

  /* ---------- Links de WhatsApp com mensagem pronta ----------
     Qualquer link com o atributo data-wa="mensagem" recebe o
     endereço correto. Sem JavaScript, o href original (bit.ly)
     continua funcionando.                                     */
  const numero = String(WHATSAPP_NUMBER).replace(/\D/g, "");
  const numeroValido = numero.length >= 12 && numero.length <= 13;

  function linkWhatsApp(mensagem) {
    if (!numeroValido) return WHATSAPP_FALLBACK;
    const texto = mensagem ? "?text=" + encodeURIComponent(mensagem) : "";
    return "https://wa.me/" + numero + texto;
  }

  document.querySelectorAll("[data-wa]").forEach(function (link) {
    link.href = linkWhatsApp(link.getAttribute("data-wa"));
    link.target = "_blank";
    link.rel = "noopener";
  });

  /* ---------- Header: sombra ao rolar ---------- */
  const header = document.querySelector(".site-header");
  if (header) {
    const aoRolar = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    aoRolar();
    window.addEventListener("scroll", aoRolar, { passive: true });
  }

  /* ---------- Menu mobile ---------- */
  const toggle = document.querySelector(".nav-toggle");
  const nav = document.getElementById("menu");
  if (toggle && nav) {
    const fechar = function (devolverFoco) {
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", "Abrir menu");
      nav.classList.remove("is-open");
      if (devolverFoco) toggle.focus();
    };
    toggle.addEventListener("click", function () {
      const aberto = toggle.getAttribute("aria-expanded") === "true";
      if (aberto) {
        fechar(false);
      } else {
        toggle.setAttribute("aria-expanded", "true");
        toggle.setAttribute("aria-label", "Fechar menu");
        nav.classList.add("is-open");
        // espera o menu ficar visível antes de mover o foco (navegação por teclado)
        setTimeout(function () {
          const primeiro = nav.querySelector("a");
          if (primeiro) primeiro.focus();
        }, 60);
      }
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) fechar(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) fechar(true);
    });
    window.matchMedia("(min-width: 1200px)").addEventListener("change", function () {
      fechar(false);
    });
  }

  /* ---------- Agenda: destaca o dia de hoje (horário de Cuiabá) ---------- */
  try {
    const nomeDia = new Intl.DateTimeFormat("en-US", {
      weekday: "short",
      timeZone: "America/Cuiaba",
    }).format(new Date());
    const indice = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(nomeDia);
    if (indice >= 0) {
      document.querySelectorAll('[data-dia="' + indice + '"]').forEach(function (el) {
        el.classList.add("is-hoje");
      });
      const servicoHoje = indice === 0 ? "dayuse" : indice === 6 ? "festa" : "escola";
      document.querySelectorAll('[data-servico="' + servicoHoje + '"]').forEach(function (el) {
        el.classList.add("is-hoje");
      });
    }
  } catch (e) {
    /* navegador sem suporte a fuso horário: apenas não destaca */
  }

  /* ---------- Ano atual no rodapé ---------- */
  document.querySelectorAll("[data-ano]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- Animações ao rolar ---------- */
  const revelar = document.querySelectorAll(".reveal");
  const semMovimento = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if ("IntersectionObserver" in window && !semMovimento) {
    const obs = new IntersectionObserver(
      function (entradas) {
        entradas.forEach(function (entrada) {
          if (entrada.isIntersecting) {
            entrada.target.classList.add("is-visible");
            obs.unobserve(entrada.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );
    revelar.forEach(function (el) { obs.observe(el); });
  } else {
    revelar.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Galeria com lightbox ---------- */
  const galeria = document.querySelector("[data-galeria]");
  const dialog = document.getElementById("lightbox");
  if (galeria && dialog && typeof dialog.showModal === "function") {
    const links = Array.from(galeria.querySelectorAll("a"));
    const img = dialog.querySelector("img");
    const legenda = dialog.querySelector("figcaption");
    const contador = dialog.querySelector(".lightbox-contador");
    let atual = 0;
    let origemFoco = null;

    const mostrar = function (i) {
      atual = (i + links.length) % links.length;
      const link = links[atual];
      const miniatura = link.querySelector("img");
      img.src = link.getAttribute("href");
      img.alt = miniatura ? miniatura.alt : "";
      legenda.textContent = link.getAttribute("data-legenda") || (miniatura ? miniatura.alt : "");
      contador.textContent = atual + 1 + " / " + links.length;
    };

    links.forEach(function (link, i) {
      link.addEventListener("click", function (e) {
        e.preventDefault();
        origemFoco = link;
        mostrar(i);
        dialog.showModal();
      });
    });

    dialog.querySelector(".lightbox-fechar").addEventListener("click", function () { dialog.close(); });
    dialog.querySelector(".lightbox-ant").addEventListener("click", function () { mostrar(atual - 1); });
    dialog.querySelector(".lightbox-prox").addEventListener("click", function () { mostrar(atual + 1); });
    dialog.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") mostrar(atual - 1);
      if (e.key === "ArrowRight") mostrar(atual + 1);
    });
    // clique fora da foto fecha
    dialog.addEventListener("click", function (e) {
      if (e.target === dialog || e.target.tagName === "FIGURE") dialog.close();
    });
    // deslizar o dedo no celular
    let toqueX = null;
    dialog.addEventListener("touchstart", function (e) { toqueX = e.touches[0].clientX; }, { passive: true });
    dialog.addEventListener("touchend", function (e) {
      if (toqueX === null) return;
      const dx = e.changedTouches[0].clientX - toqueX;
      if (Math.abs(dx) > 50) mostrar(atual + (dx < 0 ? 1 : -1));
      toqueX = null;
    });
    dialog.addEventListener("close", function () {
      if (origemFoco) origemFoco.focus();
    });
  }
})();
