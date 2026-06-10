<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="Vision Web — Criamos ecossistemas digitais imersivos. Sites a partir de R$399,99. Design focado em autoridade, performance e conversão máxima.">
  <meta property="og:title" content="Vision Web — Tecnologia & Design de Elite">
  <meta property="og:description" content="Sites a partir de R$399,99. Criamos ecossistemas digitais imersivos que dominam o mercado.">
  <title>Vision Web — Tecnologia & Design de Elite</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Unbounded:wght@400;600;700;800;900&family=Outfit:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;700&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { margin:0; padding:0; box-sizing:border-box; }
    html { scroll-behavior: smooth; font-size: 16px; }
    ::-webkit-scrollbar { width: 4px; }
    ::-webkit-scrollbar-track { background: #05050A; }
    ::-webkit-scrollbar-thumb { background: #1852E8; border-radius: 99px; }
    ::selection { background: rgba(24,82,232,0.32); color: #fff; }
    body {
      background: #05050A; color: #F0F0FF;
      font-family: 'Outfit', sans-serif; font-weight: 400;
      line-height: 1.6; overflow-x: hidden; cursor: none;
    }
    img { max-width: 100%; display: block; }
    a { text-decoration: none; }
    :root {
      --bg: #05050A; --bg-2: #090912; --bg-3: #0D0D1A;
      --blue: #1852E8; --blue-2: #3D6FFF; --blue-3: #0D3DBF;
      --blue-glow: rgba(24,82,232,0.28); --white: #F0F0FF;
      --muted: #52526A; --border: #16162A; --radius: 16px;
      --ease: cubic-bezier(0.23,1,0.32,1);
      --shadow: 0 0 80px rgba(24,82,232,0.22);
      --neon: 0 0 20px rgba(61,111,255,0.5), 0 0 40px rgba(61,111,255,0.3), 0 0 80px rgba(61,111,255,0.1);
    }
    body::after {
      content:''; position:fixed; inset:0;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23g)' opacity='0.05'/%3E%3C/svg%3E");
      opacity: 0.28; pointer-events: none; z-index: 9990;
    }
    /* SCROLL PROGRESS */
    .scroll-progress {
      position: fixed; top: 0; left: 0; height: 2px; width: 0%;
      background: linear-gradient(90deg, var(--blue-3), var(--blue), var(--blue-2), #fff);
      z-index: 10001; box-shadow: 0 0 10px var(--blue);
    }
    /* LOADER */
    .loader {
      position: fixed; inset: 0; background: var(--bg); z-index: 10000;
      display: flex; align-items: center; justify-content: center;
      flex-direction: column; gap: 24px;
      transition: opacity 0.8s var(--ease), visibility 0.8s;
    }
    .loader.out { opacity: 0; visibility: hidden; }
    .loader-logo {
      font-family: 'Unbounded', sans-serif; font-size: 2rem; font-weight: 900;
      color: var(--white); letter-spacing: -0.02em; animation: logoPulse 1.4s ease infinite;
    }
    .loader-logo span { color: var(--blue); text-shadow: 0 0 30px rgba(61,111,255,0.6); }
    @keyframes logoPulse { 0%,100%{opacity:1} 50%{opacity:0.7} }
    .loader-bar { width: 200px; height: 1px; background: var(--border); overflow: hidden; }
    .loader-fill {
      height: 100%;
      background: linear-gradient(90deg, var(--blue-3), var(--blue), var(--blue-2));
      animation: loadFill 1.3s var(--ease) forwards;
      box-shadow: 0 0 8px var(--blue);
    }
    @keyframes loadFill { from{width:0} to{width:100%} }
    .loader-pct {
      font-family: 'JetBrains Mono', monospace; font-size: 0.72rem;
      color: var(--muted); letter-spacing: 0.1em;
    }
    /* CUSTOM CURSOR */
    .cursor-ring {
      position: fixed; top:0; left:0; width: 36px; height: 36px;
      border: 1.5px solid rgba(24,82,232,0.5); border-radius: 50%;
      transform: translate(-50%,-50%); pointer-events: none; z-index: 9998;
      transition: width .3s var(--ease), height .3s var(--ease), background .3s, border-color .3s;
      will-change: transform;
    }
    .cursor-dot {
      position: fixed; top:0; left:0; width: 6px; height: 6px;
      background: var(--blue-2); border-radius: 50%;
      transform: translate(-50%,-50%); pointer-events: none; z-index: 9999;
      box-shadow: 0 0 8px var(--blue-2);
    }
    body.cursor-hover .cursor-ring {
      width: 56px; height: 56px;
      background: rgba(24,82,232,0.07); border-color: var(--blue-2);
      box-shadow: 0 0 20px rgba(61,111,255,0.2);
    }
    body.cursor-text .cursor-ring { width: 3px; height: 28px; border-radius: 2px; }
    /* WHATSAPP FAB */
    .whatsapp-fab {
      position: fixed; bottom: 28px; right: 28px; z-index: 1000;
      width: 60px; height: 60px; background: #25D366; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      box-shadow: 0 8px 30px rgba(37,211,102,0.4); transition: transform .3s var(--ease), box-shadow .3s;
      cursor: none;
    }
    .whatsapp-fab:hover { transform: scale(1.15); box-shadow: 0 14px 44px rgba(37,211,102,0.55); }
    .whatsapp-fab svg { width: 28px; height: 28px; fill: white; }
    .fab-pulse {
      position: absolute; inset: -8px; border-radius: 50%;
      border: 2px solid rgba(37,211,102,0.4); animation: fabPulse 2.5s ease infinite;
    }
    .fab-pulse-2 {
      position: absolute; inset: -16px; border-radius: 50%;
      border: 1px solid rgba(37,211,102,0.2); animation: fabPulse 2.5s ease infinite 0.8s;
    }
    @keyframes fabPulse { 0%{opacity:1;transform:scale(1)} 100%{opacity:0;transform:scale(1.5)} }
    /* MOBILE MENU */
    .mobile-menu {
      position: fixed; inset: 0; background: rgba(5,5,10,0.97);
      backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
      z-index: 999; padding: 100px 32px 40px;
      display: flex; flex-direction: column; gap: 32px;
      transform: translateX(100%); transition: transform .5s var(--ease);
    }
    .mobile-menu.open { transform: translateX(0); }
    .mobile-nav { list-style: none; display: flex; flex-direction: column; gap: 12px; }
    .mobile-nav a {
      font-family: 'Unbounded', sans-serif; font-size: 1.8rem; font-weight: 700;
      color: var(--white); transition: color .3s; display: block;
    }
    .mobile-nav a:hover { color: var(--blue-2); }
    /* NAVBAR */
    .navbar {
      position: fixed; top: 0; left: 0; right: 0; z-index: 998;
      padding: 24px 0; transition: padding .4s, background .4s, box-shadow .4s;
    }
    .navbar.scrolled {
      padding: 14px 0; background: rgba(5,5,10,0.92);
      backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
      box-shadow: 0 1px 0 var(--border);
    }
    .nav-inner {
      display: flex; align-items: center; justify-content: space-between;
      max-width: 1280px; margin: 0 auto; padding: 0 32px;
    }
    .nav-logo { display: flex; align-items: center; gap: 10px; }
    .nav-logo img { height: 36px; border-radius: 8px; }
    .nav-logo-fallback {
      font-family: 'Unbounded', sans-serif; font-weight: 900; font-size: 1.15rem;
      color: var(--white);
    }
    .nav-logo-fallback em { color: var(--blue); font-style: normal; }
    .nav-links { display: flex; align-items: center; gap: 36px; list-style: none; }
    .nav-links a {
      color: var(--muted); font-size: 0.78rem; font-weight: 500;
      font-family: 'Outfit', sans-serif; position: relative; transition: color .3s;
      text-transform: uppercase; letter-spacing: 0.07em;
    }
    .nav-links a::after {
      content: ''; position: absolute; bottom: -4px; left: 0;
      width: 0; height: 1px; background: var(--blue-2); transition: width .3s;
    }
    .nav-links a:hover { color: var(--white); }
    .nav-links a:hover::after { width: 100%; }
    .nav-ctas { display: flex; align-items: center; gap: 10px; }
    /* BUTTONS */
    .btn {
      display: inline-flex; align-items: center; gap: 8px;
      padding: 11px 24px; border-radius: 100px;
      font-family: 'Outfit', sans-serif; font-weight: 600; font-size: 0.84rem;
      cursor: none; transition: all .4s var(--ease); white-space: nowrap; letter-spacing: 0.01em;
      position: relative; overflow: hidden;
    }
    .btn::after {
      content: ''; position: absolute; inset: 0; border-radius: inherit;
      background: rgba(255,255,255,0.07); opacity: 0; transition: opacity .3s;
    }
    .btn:hover::after { opacity: 1; }
    .btn-ghost { color: var(--white); border: 1.5px solid var(--border); background: transparent; }
    .btn-ghost:hover { border-color: var(--blue-2); background: rgba(24,82,232,0.07); }
    .btn-blue { background: var(--blue); color: white; border: 1.5px solid var(--blue); }
    .btn-blue:hover { background: var(--blue-2); box-shadow: var(--shadow); transform: translateY(-2px); }
    .btn-white { background: var(--white); color: #05050A; border: 1.5px solid var(--white); font-weight: 700; }
    .btn-white:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(240,240,255,0.2); background: #fff; }
    .btn-green { background: #25D366; color: white; border: 1.5px solid #25D366; font-weight: 700; }
    .btn-green:hover { transform: translateY(-2px); box-shadow: 0 12px 40px rgba(37,211,102,0.35); }
    .btn-lg { padding: 16px 34px; font-size: 0.9rem; }
    /* HAMBURGER */
    .hamburger {
      display: none; flex-direction: column; gap: 5px;
      background: none; border: none; cursor: none; padding: 6px;
    }
    .hamburger span {
      width: 24px; height: 1.5px; background: var(--white);
      transition: all .4s var(--ease); display: block;
    }
    .hamburger.open span:nth-child(1) { transform: translateY(6.5px) rotate(45deg); }
    .hamburger.open span:nth-child(2) { opacity: 0; }
    .hamburger.open span:nth-child(3) { transform: translateY(-6.5px) rotate(-45deg); }
    /* SHARED LAYOUT */
    .container { max-width: 1280px; margin: 0 auto; padding: 0 32px; }
    .section-tag {
      display: inline-flex; align-items: center; gap: 10px;
      font-size: 0.68rem; font-weight: 600; color: var(--blue-2);
      text-transform: uppercase; letter-spacing: 0.14em; margin-bottom: 20px;
      font-family: 'JetBrains Mono', monospace;
    }
    .section-tag::before { content: ''; width: 20px; height: 1px; background: var(--blue); }
    h2.display { font-family: 'Unbounded', sans-serif; font-weight: 900; }
    .d-xl { font-size: clamp(3.4rem, 8vw, 9rem); line-height: 0.9; letter-spacing: -0.04em; }
    .d-lg { font-size: clamp(2.4rem, 5vw, 5rem); line-height: 0.92; letter-spacing: -0.03em; }
    .d-md { font-size: clamp(1.8rem, 3vw, 3rem); line-height: 1; letter-spacing: -0.02em; }
    .grad { background: linear-gradient(110deg, #fff 20%, var(--blue-2) 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
    .c-blue { color: var(--blue-2); }
    .outline-text { -webkit-text-stroke: 1.5px rgba(255,255,255,0.22); color: transparent; }
    /* Scroll Reveal */
    .reveal, .reveal-l, .reveal-r {
      opacity: 0; transition: opacity .9s var(--ease), transform .9s var(--ease);
    }
    .reveal { transform: translateY(40px); }
    .reveal-l { transform: translateX(-40px); }
    .reveal-r { transform: translateX(40px); }
    .reveal.vis, .reveal-l.vis, .reveal-r.vis { opacity:1; transform:none; }
    .d1{transition-delay:.1s} .d2{transition-delay:.2s}
    .d3{transition-delay:.3s} .d4{transition-delay:.4s} .d5{transition-delay:.5s}
    /* PARTICLES */
    .particles { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
    .particle {
      position: absolute; border-radius: 50%;
      background: var(--blue-2); pointer-events: none;
    }
    @keyframes particleFloat {
      0% { transform: translateY(100vh) scale(0); opacity: 0; }
      10% { opacity: 1; }
      90% { opacity: 0.6; }
      100% { transform: translateY(-100px) scale(1); opacity: 0; }
    }
    /* HERO */
    .hero {
      min-height: 100vh; display: flex; flex-direction: column; justify-content: center;
      padding: 140px 0 80px; position: relative; overflow: hidden;
    }
    .hero-glow {
      position: absolute; top: -80px; left: 50%; transform: translateX(-50%);
      width: 1200px; height: 900px;
      background: radial-gradient(ellipse, rgba(24,82,232,0.14) 0%, transparent 65%);
      pointer-events: none; animation: glowPulse 8s ease-in-out infinite;
    }
    @keyframes glowPulse { 0%,100%{opacity:1} 50%{opacity:0.6} }
    .hero-grid {
      position: absolute; inset: 0;
      background-image:
        linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
      background-size: 64px 64px; pointer-events: none;
      -webkit-mask-image: radial-gradient(ellipse 80% 70% at 50% 20%, black 20%, transparent 75%);
      mask-image: radial-gradient(ellipse 80% 70% at 50% 20%, black 20%, transparent 75%);
    }
    .hero-orb {
      position: absolute; border-radius: 50%; pointer-events: none; filter: blur(90px);
    }
    .hero-orb-1 {
      width: 700px; height: 700px; background: rgba(24,82,232,0.09);
      top: -100px; right: -100px; animation: floatOrb 9s ease-in-out infinite;
    }
    .hero-orb-2 {
      width: 450px; height: 450px; background: rgba(61,111,255,0.06);
      bottom: -50px; left: -80px; animation: floatOrb 12s ease-in-out infinite reverse;
    }
    .hero-orb-3 {
      width: 300px; height: 300px; background: rgba(24,82,232,0.05);
      top: 50%; left: 50%; transform: translate(-50%,-50%);
      animation: floatOrb 6s ease-in-out infinite 2s;
    }
    @keyframes floatOrb {
      0%,100% { transform: translateY(0) scale(1); }
      50% { transform: translateY(-40px) scale(1.06); }
    }
    .hero-badge {
      display: inline-flex; align-items: center; gap: 10px;
      background: rgba(24,82,232,0.08); border: 1px solid rgba(24,82,232,0.25);
      border-radius: 100px; padding: 10px 22px;
      font-size: 0.72rem; color: var(--blue-2); font-weight: 600;
      margin-bottom: 44px; width: fit-content;
      font-family: 'JetBrains Mono', monospace; letter-spacing: 0.06em;
      box-shadow: 0 0 20px rgba(24,82,232,0.1);
    }
    .hero-badge-dot {
      width: 7px; height: 7px; background: var(--blue-2); border-radius: 50%;
      animation: blink 2.5s ease infinite; box-shadow: 0 0 10px var(--blue-2);
    }
    @keyframes blink { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.35;transform:scale(1.4)} }
    .hero-title {
      font-family: 'Unbounded', sans-serif; font-weight: 900;
      font-size: clamp(3.4rem, 9vw, 10rem); line-height: 0.88;
      letter-spacing: -0.04em; margin-bottom: 32px;
    }
    .hero-sub {
      max-width: 500px; color: var(--muted); font-size: 1rem;
      line-height: 1.82; margin-bottom: 48px;
    }
    .hero-actions { display: flex; align-items: center; gap: 14px; flex-wrap: wrap; }
    .hero-price-note {
      display: flex; align-items: center; gap: 10px;
      margin-top: 20px;
      font-family: 'JetBrains Mono', monospace; font-size: 0.72rem; color: var(--muted);
    }
    .price-badge {
      display: inline-flex; align-items: center; gap: 6px;
      background: linear-gradient(135deg, rgba(24,82,232,0.15), rgba(61,111,255,0.1));
      border: 1px solid rgba(61,111,255,0.3); border-radius: 100px;
      padding: 5px 14px; font-family: 'JetBrains Mono', monospace;
      font-size: 0.72rem; color: var(--blue-2); font-weight: 700;
      box-shadow: 0 0 14px rgba(61,111,255,0.15); white-space: nowrap;
    }
    .price-badge-star { color: var(--blue-2); font-size: 0.6rem; }
    .hero-scroll-hint {
      display: flex; align-items: center; gap: 16px; margin-top: 80px;
      color: var(--muted); font-size: 0.7rem;
      font-family: 'JetBrains Mono', monospace; letter-spacing: 0.1em;
    }
    .scroll-line { width: 40px; height: 1px; background: var(--border); }
    .scroll-arrow { animation: bounce 2.5s ease infinite; }
    @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(8px)} }
    /* HERO SHAPES */
    .hero-shapes { position: absolute; right: -50px; top: 50%; transform: translateY(-50%); pointer-events:none; }
    .shape-ring { width: 500px; height: 500px; position: relative; opacity: 0.055; }
    .shape-ring::before {
      content:''; position:absolute; inset:0;
      border: 1px solid var(--blue); border-radius: 50%;
      animation: spinRing 28s linear infinite;
    }
    .shape-ring::after {
      content:''; position:absolute; inset:80px;
      border: 1px solid var(--blue-2); border-radius: 50%;
      animation: spinRing 20s linear infinite reverse;
    }
    .shape-ring-inner {
      position: absolute; inset: 170px;
      border: 1px solid rgba(255,255,255,0.4); border-radius: 50%;
      animation: spinRing 13s linear infinite;
    }
    @keyframes spinRing { from{transform:rotate(0)} to{transform:rotate(360deg)} }
    /* HERO STATS */
    .hero-stats {
      display: grid; grid-template-columns: repeat(4,1fr);
      gap: 1px; background: var(--border);
      border: 1px solid var(--border); border-radius: 20px;
      overflow: hidden; margin-top: 80px;
    }
    .hstat {
      background: var(--bg-2); padding: 30px 20px; text-align: center;
      transition: background .3s; position: relative; overflow: hidden;
    }
    .hstat::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
      background: linear-gradient(90deg, var(--blue-3), var(--blue-2));
      transform: scaleX(0); transition: transform .4s var(--ease);
    }
    .hstat:hover { background: var(--bg-3); }
    .hstat:hover::before { transform: scaleX(1); }
    .hstat-num {
      font-family: 'Unbounded', sans-serif; font-weight: 900; font-size: 2.1rem;
      color: var(--white); line-height: 1; margin-bottom: 6px; display: block;
    }
    .hstat-num.c-blue { color: var(--blue-2); }
    .hstat-label { font-size: 0.72rem; color: var(--muted); font-family: 'Outfit', sans-serif; }
    /* MARQUEE */
    .marquee-wrap {
      border-top: 1px solid var(--border); border-bottom: 1px solid var(--border);
      padding: 16px 0; overflow: hidden; background: var(--bg-2); position: relative; z-index: 1;
    }
    .marquee-wrap::before, .marquee-wrap::after {
      content: ''; position: absolute; top: 0; bottom: 0; width: 100px; z-index: 2; pointer-events: none;
    }
    .marquee-wrap::before { left: 0; background: linear-gradient(90deg, var(--bg-2), transparent); }
    .marquee-wrap::after { right: 0; background: linear-gradient(-90deg, var(--bg-2), transparent); }
    .marquee-track { display: flex; animation: ticker 38s linear infinite; width: max-content; }
    .marquee-track:hover { animation-play-state: paused; }
    @keyframes ticker { from{transform:translateX(0)} to{transform:translateX(-50%)} }
    .m-item {
      display: flex; align-items: center; gap: 12px; padding: 0 22px;
      font-family: 'JetBrains Mono', monospace; font-size: 0.72rem; font-weight: 500;
      text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted); white-space: nowrap;
    }
    .m-item.hi { color: var(--white); }
    .m-item.price { color: #4ADE80; font-weight: 700; }
    .m-sep { width: 4px; height: 4px; border-radius: 50%; background: var(--blue); flex-shrink: 0; }
    /* SERVICES */
    .services { padding: 120px 0; }
    .sec-header {
      display: flex; align-items: flex-end; justify-content: space-between;
      gap: 40px; margin-bottom: 64px;
    }
    .sec-header-right { max-width: 340px; color: var(--muted); line-height: 1.82; font-size: 0.9rem; }
    .cards-grid {
      display: grid; grid-template-columns: repeat(3,1fr); gap: 2px;
      background: var(--border); border: 1px solid var(--border);
      border-radius: 24px; overflow: hidden;
    }
    .s-card {
      background: var(--bg-2); padding: 48px 36px; position: relative;
      overflow: hidden; transition: background .4s, transform .4s var(--ease); cursor: none;
    }
    .s-card::before {
      content:''; position:absolute; inset:0;
      background: linear-gradient(160deg, rgba(24,82,232,0.07) 0%, transparent 60%);
      opacity: 0; transition: opacity .4s;
    }
    .s-card::after {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
      background: linear-gradient(90deg, var(--blue-3), var(--blue-2));
      transform: scaleX(0); transform-origin: left; transition: transform .5s var(--ease);
    }
    .s-card:hover { background: var(--bg-3); }
    .s-card:hover::before { opacity: 1; }
    .s-card:hover::after { transform: scaleX(1); }
    .s-card-glow {
      position: absolute; width: 200px; height: 200px; border-radius: 50%;
      background: rgba(24,82,232,0.1); filter: blur(60px);
      top: -40px; right: -40px; pointer-events: none; opacity: 0;
      transition: opacity .4s;
    }
    .s-card:hover .s-card-glow { opacity: 1; }
    .s-card-num {
      font-family: 'JetBrains Mono', monospace; font-size: 0.65rem;
      color: var(--blue-2); margin-bottom: 28px; opacity: 0.5;
    }
    .s-card-icon {
      width: 54px; height: 54px; background: rgba(24,82,232,0.08);
      border: 1px solid rgba(24,82,232,0.18); border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      margin-bottom: 24px; transition: all .4s var(--ease);
    }
    .s-card-icon svg { width: 22px; height: 22px; stroke: var(--blue-2); fill: none; stroke-width: 1.5; stroke-linecap: round; stroke-linejoin: round; }
    .s-card:hover .s-card-icon {
      background: rgba(24,82,232,0.15); border-color: var(--blue);
      transform: scale(1.08) rotate(-4deg); box-shadow: 0 0 28px rgba(24,82,232,0.25);
    }
    .s-card h3 {
      font-family: 'Unbounded', sans-serif; font-size: 1.1rem; font-weight: 700;
      color: var(--white); margin-bottom: 14px; line-height: 1.3;
    }
    .s-card p { color: var(--muted); font-size: 0.86rem; line-height: 1.82; margin-bottom: 28px; }
    .tags { display: flex; flex-wrap: wrap; gap: 6px; }
    .tag {
      padding: 5px 12px; background: rgba(255,255,255,0.03);
      border: 1px solid var(--border); border-radius: 100px; font-size: 0.68rem;
      color: var(--muted); font-family: 'JetBrains Mono', monospace; transition: all .3s;
    }
    .s-card:hover .tag { border-color: rgba(24,82,232,0.22); color: var(--blue-2); }
    .card-arrow {
      position: absolute; bottom: 36px; right: 36px; width: 34px; height: 34px;
      border: 1px solid var(--border); border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      color: var(--muted); font-size: 0.9rem;
      transition: all .4s var(--ease); opacity: 0; transform: translateX(-8px);
    }
    .s-card:hover .card-arrow { opacity: 1; transform: none; border-color: var(--blue-2); color: var(--blue-2); }
    /* PROCESS */
    .process-sec {
      padding: 120px 0; background: var(--bg-2); position: relative; overflow: hidden;
    }
    .process-sec::before {
      content:''; position:absolute; bottom:-200px; right:-200px; width:700px; height:700px;
      background: radial-gradient(circle, rgba(24,82,232,0.05) 0%, transparent 60%); pointer-events:none;
    }
    .process-inner { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: start; margin-top: 64px; }
    .step {
      display: flex; gap: 24px; padding: 28px 0;
      border-bottom: 1px solid var(--border); cursor: none; transition: all .4s var(--ease);
    }
    .step:last-child { border-bottom: none; }
    .step-num {
      font-family: 'JetBrains Mono', monospace; font-size: 0.66rem;
      color: var(--blue); font-weight: 700; min-width: 28px; padding-top: 4px;
      opacity: 0.35; transition: opacity .3s;
    }
    .step:hover .step-num, .step.active .step-num { opacity: 1; color: var(--blue-2); }
    .step-title {
      font-family: 'Unbounded', sans-serif; font-size: 0.95rem; font-weight: 700;
      color: var(--white); margin-bottom: 8px; transition: color .3s; line-height: 1.3;
    }
    .step:hover .step-title, .step.active .step-title { color: var(--blue-2); }
    .step-desc {
      color: var(--muted); font-size: 0.84rem; line-height: 1.82;
      max-height: 0; overflow: hidden; transition: max-height .6s var(--ease), opacity .4s; opacity: 0;
    }
    .step.active .step-desc { max-height: 160px; opacity: 1; }
    .proc-visual { position: sticky; top: 120px; }
    .proc-card {
      background: var(--bg-3); border: 1px solid var(--border);
      border-radius: 24px; padding: 48px; overflow: hidden; position: relative;
    }
    .proc-card::before {
      content:''; position:absolute; top:-120px; right:-120px; width:380px; height:380px;
      background: radial-gradient(circle, rgba(24,82,232,0.14) 0%, transparent 65%); pointer-events:none;
    }
    .proc-card-sup {
      font-family: 'JetBrains Mono', monospace; font-size: 0.66rem;
      color: var(--muted); text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 12px;
    }
    .proc-card-num {
      font-family: 'Unbounded', sans-serif; font-size: 7rem; font-weight: 900; line-height: 0.85;
      -webkit-text-stroke: 1.5px rgba(24,82,232,0.35); color: transparent; margin-bottom: 8px; transition: opacity .3s;
    }
    .proc-card-title {
      font-family: 'Unbounded', sans-serif; font-size: 1.55rem; font-weight: 700;
      color: var(--white); transition: opacity .3s; line-height: 1.2;
    }
    .proc-card-divider { width: 40px; height: 1px; background: var(--blue); margin: 22px 0; }
    .proc-card-hint { color: var(--muted); font-size: 0.82rem; line-height: 1.82; transition: opacity .3s; }
    .proc-dots { display: flex; gap: 8px; margin-top: 40px; }
    .proc-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--border); transition: all .3s; cursor: none; }
    .proc-dot.active { background: var(--blue); width: 28px; border-radius: 99px; box-shadow: 0 0 8px var(--blue); }
    /* DEVICE SHOWCASE */
    .device-sec { padding: 120px 0; background: var(--bg); position: relative; overflow: hidden; }
    .device-sec::before {
      content: ''; position: absolute; inset: 0;
      background: radial-gradient(ellipse 60% 50% at 50% 55%, rgba(24,82,232,0.055) 0%, transparent 70%);
      pointer-events: none;
    }
    .device-sec-header { text-align: center; margin-bottom: 80px; }
    .device-sec-header .section-tag { justify-content: center; }
    .device-sec-header p { color: var(--muted); font-size: 0.95rem; max-width: 500px; margin: 20px auto 0; line-height: 1.82; }
    .devices-showcase { display: flex; align-items: flex-end; justify-content: center; position: relative; height: 500px; }
    .device-laptop { position: relative; z-index: 2; animation: floatDevice 6s ease-in-out infinite; transition: transform .2s ease-out; }
    .laptop-outer {
      width: 510px; background: linear-gradient(180deg, #151522 0%, #0F0F1C 100%);
      border: 1.5px solid #222238; border-radius: 14px 14px 0 0; padding: 13px;
      box-shadow: 0 0 0 1px #09091A, 0 30px 80px rgba(0,0,0,0.75), 0 0 50px rgba(24,82,232,0.09);
    }
    .laptop-screen { background: #07070E; border-radius: 6px; overflow: hidden; aspect-ratio: 16/10; border: 1px solid #191930; }
    .laptop-base {
      width: 548px; height: 14px; background: linear-gradient(180deg, #181830, #0F0F1C);
      border: 1.5px solid #222238; border-radius: 0 0 6px 6px; margin: 0 auto;
      box-shadow: 0 8px 24px rgba(0,0,0,0.5);
    }
    .laptop-base::after {
      content: ''; display: block; width: 56px; height: 5px;
      background: #0C0C1C; border-radius: 0 0 4px 4px; margin: 0 auto;
    }
    .device-tablet { position: absolute; left: 50%; margin-left: -372px; bottom: 14px; z-index: 1; animation: floatDevice 8s ease-in-out infinite 1.2s; }
    .tablet-outer {
      width: 175px; background: linear-gradient(180deg, #151522 0%, #0F0F1C 100%);
      border: 1.5px solid #222238; border-radius: 14px; padding: 11px 8px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 28px rgba(24,82,232,0.07);
    }
    .tablet-screen { background: #07070E; border-radius: 5px; overflow: hidden; aspect-ratio: 3/4; border: 1px solid #191930; }
    .tablet-btn { width: 28px; height: 3px; background: #1A1A30; border-radius: 99px; margin: 7px auto 0; }
    .device-phone { position: absolute; right: 50%; margin-right: -372px; bottom: 14px; z-index: 1; animation: floatDevice 5s ease-in-out infinite 0.6s; }
    .phone-outer {
      width: 106px; background: linear-gradient(180deg, #151522 0%, #0F0F1C 100%);
      border: 1.5px solid #222238; border-radius: 22px; padding: 9px 6px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 28px rgba(24,82,232,0.07);
    }
    .phone-screen { background: #07070E; border-radius: 10px; overflow: hidden; aspect-ratio: 9/19; border: 1px solid #191930; }
    .phone-notch { width: 34px; height: 5px; background: #151522; border-radius: 0 0 6px 6px; margin: 0 auto 5px; position: relative; z-index: 1; }
    .phone-btn { width: 22px; height: 3px; background: #1A1A30; border-radius: 99px; margin: 7px auto 0; }
    @keyframes floatDevice { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-14px); } }
    .mini-site { width: 100%; height: 100%; display: flex; flex-direction: column; }
    .mini-nav { height: 20px; background: #0C0C18; display: flex; align-items: center; padding: 0 8px; gap: 5px; border-bottom: 1px solid #1A1A2E; flex-shrink: 0; }
    .mini-nav-dot { width: 4px; height: 4px; border-radius: 50%; }
    .mini-nav-logo { margin-left: 6px; height: 5px; width: 38px; background: linear-gradient(90deg, var(--blue-3), var(--blue-2)); border-radius: 99px; opacity: 0.8; }
    .mini-nav-links { display: flex; gap: 6px; margin-left: 8px; }
    .mini-nav-link { height: 3px; border-radius: 99px; background: rgba(255,255,255,0.12); }
    .mini-nav-btn { height: 7px; width: 22px; border-radius: 99px; background: var(--blue); opacity: 0.7; margin-left: auto; }
    .mini-hero { flex: 1; background: #05050A; display: flex; flex-direction: column; justify-content: center; align-items: flex-start; padding: 14px 12px; position: relative; overflow: hidden; }
    .mini-hero::before { content: ''; position: absolute; top: -20px; left: 50%; transform: translateX(-50%); width: 200px; height: 200px; background: radial-gradient(circle, rgba(24,82,232,0.14) 0%, transparent 70%); }
    .mini-hero-line { height: 7px; border-radius: 99px; margin-bottom: 5px; }
    .mini-hero-sub { height: 4px; border-radius: 99px; margin-bottom: 3px; background: rgba(255,255,255,0.11); }
    .mini-btn-row { display: flex; gap: 5px; margin-top: 8px; }
    .mini-btn-w { height: 7px; width: 32px; border-radius: 99px; background: rgba(255,255,255,0.85); }
    .mini-btn-b { height: 7px; width: 22px; border-radius: 99px; background: rgba(24,82,232,0.45); border: 1px solid rgba(24,82,232,0.5); }
    .mini-cards-row { display: flex; gap: 4px; padding: 7px 12px; background: #09091A; border-top: 1px solid #1A1A2E; flex-shrink: 0; }
    .mini-card { flex: 1; height: 26px; border-radius: 4px; background: #0D0D1E; border: 1px solid #1A1A2E; }
    .mini-stats-row { display: flex; gap: 2px; background: #1A1A2E; flex-shrink: 0; }
    .mini-stat { flex: 1; height: 18px; background: #0A0A16; }
    .mini-site-m { width: 100%; height: 100%; background: #05050A; display: flex; flex-direction: column; overflow: hidden; }
    .mini-mob-nav { height: 14px; background: #0C0C18; display: flex; align-items: center; justify-content: space-between; padding: 0 5px; border-bottom: 1px solid #1A1A2E; flex-shrink: 0; }
    .mini-mob-logo { height: 4px; width: 22px; background: linear-gradient(90deg, var(--blue-3), var(--blue-2)); border-radius: 99px; opacity: 0.8; }
    .mini-mob-ham { display: flex; flex-direction: column; gap: 1.5px; }
    .mini-mob-ham span { width: 7px; height: 1px; background: rgba(255,255,255,0.4); display: block; }
    .mini-mob-hero { flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 5px; }
    .mini-mob-line { height: 4px; border-radius: 99px; margin-bottom: 2.5px; }
    .mini-mob-btn { height: 5px; border-radius: 99px; background: rgba(255,255,255,0.8); margin-top: 5px; }
    .mini-mob-cards { display: flex; flex-direction: column; gap: 2px; padding: 5px; background: #09091A; border-top: 1px solid #1A1A2E; flex-shrink: 0; }
    .mini-mob-card { height: 12px; border-radius: 3px; background: #0D0D1E; border: 1px solid #1A1A2E; }
    .devices-glow-line { height: 1px; background: linear-gradient(90deg, transparent, var(--blue-3), var(--blue-2), var(--blue), transparent); margin: 0 auto; width: 600px; max-width: 100%; opacity: 0.35; }
    .devices-labels { display: flex; align-items: center; justify-content: center; gap: 80px; margin-top: 28px; }
    .device-label { font-family: 'JetBrains Mono', monospace; font-size: 0.65rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.12em; text-align: center; }
    .device-label-dot { width: 5px; height: 5px; border-radius: 50%; background: var(--blue); margin: 0 auto 6px; box-shadow: 0 0 8px var(--blue); }
    /* TECH STACK */
    .tech-sec { padding: 80px 0; background: var(--bg-2); border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
    .tech-header { text-align: center; margin-bottom: 48px; }
    .tech-header .section-tag { justify-content: center; }
    .tech-header p { color: var(--muted); font-size: 0.78rem; font-family: 'JetBrains Mono', monospace; letter-spacing: 0.1em; text-transform: uppercase; }
    .tech-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 1px; background: var(--border); border: 1px solid var(--border); border-radius: 18px; overflow: hidden; }
    .tech-item { background: var(--bg); padding: 28px 16px; display: flex; flex-direction: column; align-items: center; gap: 10px; transition: background .3s; cursor: default; position: relative; overflow: hidden; }
    .tech-item::before { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, var(--blue-3), var(--blue-2)); transform: scaleX(0); transition: transform .4s var(--ease); }
    .tech-item:hover { background: var(--bg-3); }
    .tech-item:hover::before { transform: scaleX(1); }
    .tech-icon { width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; }
    .tech-icon svg { width: 30px; height: 30px; }
    .tech-name { font-family: 'JetBrains Mono', monospace; font-size: 0.6rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.1em; text-align: center; }
    .tech-item:hover .tech-name { color: var(--blue-2); }
    /* WHY US */
    .why-sec { padding: 120px 0; background: var(--bg); }
    .why-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 80px; align-items: start; margin-top: 64px; }
    .why-points { display: flex; flex-direction: column; }
    .why-point { display: flex; gap: 20px; padding: 24px 0; border-bottom: 1px solid var(--border); transition: all .3s var(--ease); }
    .why-point:first-child { border-top: 1px solid var(--border); }
    .why-point-icon { width: 40px; height: 40px; border-radius: 10px; background: rgba(24,82,232,0.07); border: 1px solid rgba(24,82,232,0.13); display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: all .3s; }
    .why-point-icon svg { width: 16px; height: 16px; stroke: var(--blue-2); fill: none; stroke-width: 1.8; stroke-linecap: round; stroke-linejoin: round; }
    .why-point:hover .why-point-icon { background: rgba(24,82,232,0.14); border-color: var(--blue); }
    .why-point-title { font-family: 'Unbounded', sans-serif; font-size: 0.85rem; font-weight: 700; color: var(--white); margin-bottom: 6px; }
    .why-point-desc { color: var(--muted); font-size: 0.84rem; line-height: 1.8; }
    .skill-bars { display: flex; flex-direction: column; gap: 18px; margin-top: 36px; }
    .skill-bar-header { display: flex; justify-content: space-between; margin-bottom: 7px; }
    .skill-bar-name { font-size: 0.78rem; color: var(--white); font-weight: 600; }
    .skill-bar-pct { font-size: 0.7rem; color: var(--blue-2); font-family: 'JetBrains Mono', monospace; }
    .skill-bar-track { height: 3px; background: var(--border); border-radius: 99px; overflow: hidden; }
    .skill-bar-fill { height: 100%; border-radius: 99px; background: linear-gradient(90deg, var(--blue-3), var(--blue-2)); transform: scaleX(0); transform-origin: left; transition: transform 1.4s var(--ease); box-shadow: 0 0 6px rgba(61,111,255,0.5); }
    .why-right-card { background: var(--bg-2); border: 1px solid var(--border); border-radius: 28px; padding: 48px; position: relative; overflow: hidden; }
    .why-right-card::before { content:''; position:absolute; top:-80px; right:-80px; width:320px; height:320px; background: radial-gradient(circle, rgba(24,82,232,0.11) 0%, transparent 65%); pointer-events:none; }
    .why-metric { margin-bottom: 30px; padding-bottom: 30px; border-bottom: 1px solid var(--border); }
    .why-metric:last-child { margin-bottom: 0; padding-bottom: 0; border-bottom: none; }
    .why-metric-num { font-family: 'Unbounded', sans-serif; font-size: 2.8rem; font-weight: 900; color: var(--blue-2); line-height: 1; margin-bottom: 6px; display: block; text-shadow: 0 0 30px rgba(61,111,255,0.3); }
    .why-metric-label { color: var(--white); font-size: 0.86rem; font-weight: 600; }
    .why-metric-sub { color: var(--muted); font-size: 0.75rem; margin-top: 2px; }
    /* STATS */
    .stats-sec { padding: 100px 0; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }
    .stats-grid { display: grid; grid-template-columns: repeat(4,1fr); gap: 0; background: var(--border); border: 1px solid var(--border); border-radius: 20px; overflow:hidden; }
    .stat-block { background: var(--bg); padding: 48px 32px; text-align: center; transition: background .3s; position: relative; overflow: hidden; }
    .stat-block::before { content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, var(--blue-3), var(--blue-2)); transform: scaleX(0); transition: transform .4s var(--ease); }
    .stat-block:hover { background: var(--bg-2); }
    .stat-block:hover::before { transform: scaleX(1); }
    .stat-num { font-family: 'Unbounded', sans-serif; font-weight: 900; font-size: clamp(2.2rem, 4vw, 4rem); color: var(--white); line-height: 1; display: block; margin-bottom: 10px; }
    .stat-num.c-blue { color: var(--blue-2); text-shadow: 0 0 30px rgba(61,111,255,0.25); }
    .stat-label { font-size: 0.82rem; color: var(--muted); }
    /* TESTIMONIALS */
    .testi-sec { padding: 120px 0; background: var(--bg-2); }
    .testi-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; margin-top: 64px; }
    .t-card { background: var(--bg-3); border: 1px solid var(--border); border-radius: 24px; padding: 44px; position: relative; overflow: hidden; transition: all .4s var(--ease); cursor: none; }
    .t-card::before { content:''; position: absolute; top: 0; left: 0; right: 0; height: 2px; background: linear-gradient(90deg, var(--blue-3), var(--blue-2)); transform: scaleX(0); transform-origin: left; transition: transform .5s var(--ease); }
    .t-card:hover::before { transform: scaleX(1); }
    .t-card:hover { border-color: rgba(24,82,232,0.2); transform: translateY(-5px); box-shadow: 0 20px 60px rgba(0,0,0,0.4), 0 0 40px rgba(24,82,232,0.07); }
    .t-stars { display: flex; gap: 4px; margin-bottom: 22px; }
    .t-stars span { color: #FFB800; font-size: 0.88rem; }
    .t-quote-mark { font-size: 3.5rem; color: var(--blue); font-family: Georgia, serif; line-height: 1; margin-bottom: 14px; opacity: 0.28; }
    .t-text { color: var(--white); font-size: 0.93rem; line-height: 1.88; font-style: italic; margin-bottom: 34px; opacity: 0.82; }
    .t-author { display: flex; align-items: center; gap: 16px; }
    .t-avatar { width: 46px; height: 46px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-family: 'Unbounded', sans-serif; font-weight: 700; font-size: 0.95rem; color: white; flex-shrink: 0; }
    .t-name { font-weight: 700; font-size: 0.88rem; color: var(--white); font-family: 'Unbounded', sans-serif; letter-spacing: -0.01em; }
    .t-role { font-size: 0.75rem; color: var(--muted); margin-top: 3px; }
    .testi-mini-row { display: grid; grid-template-columns: 1fr 1fr; gap: 22px; margin-top: 22px; }
    .t-card-mini { background: var(--bg-3); border: 1px solid var(--border); border-radius: 20px; padding: 30px; transition: all .4s var(--ease); cursor: none; }
    .t-card-mini:hover { border-color: rgba(24,82,232,0.2); transform: translateY(-3px); }
    .t-card-mini .t-text { font-size: 0.86rem; margin-bottom: 22px; }
    /* FAQ */
    .faq-sec { padding: 120px 0; }
    .faq-layout { display: grid; grid-template-columns: 1fr 1.4fr; gap: 80px; align-items: start; }
    .faq-left { position: sticky; top: 120px; }
    .faq-cta-box { margin-top: 40px; background: var(--bg-2); border: 1px solid var(--border); border-radius: 18px; padding: 32px; }
    .faq-cta-box p { color: var(--muted); font-size: 0.88rem; line-height: 1.75; margin-bottom: 20px; }
    .faq-item { border-bottom: 1px solid var(--border); }
    .faq-item:first-child { border-top: 1px solid var(--border); }
    .faq-q { width: 100%; background: none; border: none; text-align: left; padding: 26px 0; display: flex; align-items: center; justify-content: space-between; gap: 24px; cursor: none; color: var(--white); font-family: 'Unbounded', sans-serif; font-weight: 700; font-size: 0.88rem; transition: color .3s; line-height: 1.4; }
    .faq-q:hover { color: var(--blue-2); }
    .faq-icon { width: 30px; height: 30px; border-radius: 50%; border: 1.5px solid var(--border); display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-size: 0.9rem; line-height: 1; color: var(--muted); transition: all .4s var(--ease); }
    .faq-q.open .faq-icon { border-color: var(--blue); background: rgba(24,82,232,0.1); color: var(--blue-2); transform: rotate(45deg); }
    .faq-a { max-height: 0; overflow: hidden; transition: max-height .55s var(--ease); }
    .faq-a-inner { padding: 0 0 26px; color: var(--muted); line-height: 1.82; font-size: 0.88rem; }
    /* CONTACT */
    .contact-sec { padding: 120px 0; background: var(--bg-2); position: relative; overflow: hidden; }
    .contact-sec::before { content:''; position:absolute; top:-200px; right:-200px; width:700px; height:700px; background: radial-gradient(circle, rgba(24,82,232,0.055) 0%, transparent 65%); pointer-events:none; }
    .contact-sec::after { content:''; position:absolute; bottom:-200px; left:-200px; width:600px; height:600px; background: radial-gradient(circle, rgba(61,111,255,0.04) 0%, transparent 65%); pointer-events:none; }
    .contact-grid { display: grid; grid-template-columns: 1fr 1.3fr; gap: 72px; align-items: start; }
    .contact-left h2 { margin-bottom: 18px; }
    .contact-left > p { color: var(--muted); line-height: 1.82; margin-bottom: 40px; font-size: 0.9rem; }
    .c-info { display: flex; flex-direction: column; gap: 10px; }
    .c-info-item { display: flex; align-items: center; gap: 16px; padding: 15px 20px; background: var(--bg-3); border: 1px solid var(--border); border-radius: 13px; color: var(--white); transition: all .4s var(--ease); }
    .c-info-item:hover { border-color: var(--blue); transform: translateX(6px); box-shadow: 0 4px 20px rgba(24,82,232,0.1); }
    .c-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .c-icon svg { width: 18px; height: 18px; }
    .c-info-label { font-size: 0.65rem; color: var(--muted); display: block; font-family: 'JetBrains Mono', monospace; letter-spacing: 0.08em; }
    .c-info-val { font-size: 0.88rem; font-weight: 600; }
    .c-info-arr { color: var(--muted); margin-left: auto; transition: transform .3s; }
    .c-info-item:hover .c-info-arr { transform: translateX(4px); color: var(--blue-2); }
    /* PRICE HIGHLIGHT in contact */
    .price-highlight-box {
      background: linear-gradient(135deg, rgba(24,82,232,0.1), rgba(61,111,255,0.05));
      border: 1px solid rgba(61,111,255,0.25); border-radius: 18px; padding: 24px 28px;
      margin-top: 20px; position: relative; overflow: hidden;
    }
    .price-highlight-box::before {
      content:''; position:absolute; top:0; left:0; right:0; height:2px;
      background: linear-gradient(90deg, var(--blue-3), var(--blue-2));
    }
    .price-highlight-label { font-family: 'JetBrains Mono', monospace; font-size: 0.62rem; color: var(--blue-2); text-transform: uppercase; letter-spacing: 0.12em; margin-bottom: 6px; }
    .price-highlight-num {
      font-family: 'Unbounded', sans-serif; font-size: 1.6rem; font-weight: 900;
      color: var(--white); line-height: 1; margin-bottom: 4px;
    }
    .price-highlight-num span { color: var(--blue-2); }
    .price-highlight-sub { color: var(--muted); font-size: 0.78rem; }
    /* FORM */
    .form-card {
      background: rgba(13,13,26,0.8); border: 1px solid var(--border);
      border-radius: 28px; padding: 44px;
      backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
      position: relative; overflow: hidden;
    }
    .form-card::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
      background: linear-gradient(90deg, var(--blue-3), var(--blue), var(--blue-2));
    }
    .form-card-title {
      font-family: 'Unbounded', sans-serif; font-size: 1rem; font-weight: 700;
      color: var(--white); margin-bottom: 6px;
    }
    .form-card-sub { color: var(--muted); font-size: 0.82rem; margin-bottom: 30px; line-height: 1.7; }
    @keyframes shake {
      0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-5px)} 80%{transform:translateX(5px)}
    }
    .form-card.shake { animation: shake .5s var(--ease); }
    .fg { margin-bottom: 16px; }
    .fg label { display: block; font-size: 0.63rem; font-weight: 600; color: var(--muted); margin-bottom: 7px; text-transform: uppercase; letter-spacing: 0.1em; font-family: 'JetBrains Mono', monospace; }
    .fc {
      width: 100%; background: var(--bg); border: 1.5px solid var(--border);
      border-radius: 10px; padding: 12px 15px; color: var(--white);
      font-family: 'Outfit', sans-serif; font-size: 0.88rem; outline: none;
      transition: border-color .3s, box-shadow .3s, background .3s;
      -webkit-appearance: none; appearance: none;
    }
    .fc:focus { border-color: var(--blue); box-shadow: 0 0 0 3px rgba(24,82,232,0.12), 0 0 15px rgba(24,82,232,0.08); background: rgba(5,5,10,0.9); }
    .fc::placeholder { color: var(--muted); opacity: 0.45; }
    .fc option { background: #0D0D1A; color: var(--white); }
    .fc.error { border-color: #F04A3A !important; box-shadow: 0 0 0 3px rgba(240,74,58,0.1) !important; animation: shake .4s ease; }
    .fc.error:focus { border-color: #F04A3A; }
    .fr { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    .form-divider { height: 1px; background: var(--border); margin: 20px 0; }
    .form-divider-label {
      display: flex; align-items: center; gap: 12px; margin: 20px 0;
      font-family: 'JetBrains Mono', monospace; font-size: 0.6rem;
      color: var(--muted); text-transform: uppercase; letter-spacing: 0.1em;
    }
    .form-divider-label::before, .form-divider-label::after { content: ''; flex: 1; height: 1px; background: var(--border); }
    .form-note { display: flex; align-items: center; gap: 8px; margin-top: 14px; font-size: 0.7rem; color: var(--muted); font-family: 'JetBrains Mono', monospace; }
    .form-note-dot { width: 6px; height: 6px; border-radius: 50%; background: #4ADE80; flex-shrink: 0; box-shadow: 0 0 6px rgba(74,222,128,0.5); }
    .required-star { color: #3D6FFF; margin-left: 2px; }
    /* FOOTER */
    .footer { padding: 64px 0 32px; border-top: 1px solid var(--border); }
    .footer-top { display: grid; grid-template-columns: 1.6fr 1fr 1fr; gap: 64px; padding-bottom: 48px; border-bottom: 1px solid var(--border); }
    .footer-logo { height: 34px; border-radius: 7px; margin-bottom: 16px; }
    .footer-brand-name { display: none; font-family: 'Unbounded', sans-serif; font-weight: 900; font-size: 1.25rem; color: var(--white); margin-bottom: 16px; }
    .footer-brand-name em { color: var(--blue); font-style: normal; }
    .footer-tagline { color: var(--muted); font-size: 0.84rem; line-height: 1.7; max-width: 260px; margin-bottom: 26px; }
    .socials { display: flex; gap: 8px; }
    .soc { width: 38px; height: 38px; border: 1px solid var(--border); border-radius: 9px; display: flex; align-items: center; justify-content: center; color: var(--muted); transition: all .3s var(--ease); }
    .soc svg { width: 15px; height: 15px; }
    .soc:hover { border-color: var(--blue); color: var(--blue-2); background: rgba(24,82,232,0.08); box-shadow: 0 0 12px rgba(24,82,232,0.15); }
    .foot-nav-title { font-family: 'Unbounded', sans-serif; font-weight: 700; font-size: 0.68rem; color: var(--white); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 20px; }
    .foot-nav { list-style: none; display: flex; flex-direction: column; gap: 10px; }
    .foot-nav a { color: var(--muted); font-size: 0.84rem; transition: color .3s; }
    .foot-nav a:hover { color: var(--white); }
    .footer-bottom { display: flex; align-items: center; justify-content: space-between; padding-top: 32px; color: var(--muted); font-size: 0.75rem; flex-wrap: wrap; gap: 12px; font-family: 'JetBrains Mono', monospace; }
    /* RESPONSIVE */
    @media(max-width:1100px) {
      .devices-showcase { height: 400px; }
      .laptop-outer { width: 400px; }
      .laptop-base { width: 432px; }
      .device-tablet { margin-left: -300px; }
      .device-phone { margin-right: -300px; }
    }
    @media(max-width:1024px) {
      .process-inner { grid-template-columns: 1fr; gap: 48px; }
      .proc-visual { position: static; }
      .faq-layout { grid-template-columns: 1fr; gap: 48px; }
      .faq-left { position: static; }
      .contact-grid { grid-template-columns: 1fr; gap: 48px; }
      .hero-shapes { display: none; }
      .why-grid { grid-template-columns: 1fr; gap: 48px; }
      .tech-grid { grid-template-columns: repeat(3, 1fr); }
    }
    @media(max-width:768px) {
      .container { padding: 0 20px; }
      .nav-links, .nav-ctas { display: none; }
      .hamburger { display: flex; }
      .cards-grid { grid-template-columns: 1fr; }
      .sec-header { flex-direction: column; align-items: flex-start; gap: 20px; }
      .hero-stats { grid-template-columns: repeat(2,1fr); margin-top: 48px; }
      .testi-grid { grid-template-columns: 1fr; }
      .testi-mini-row { grid-template-columns: 1fr; }
      .footer-top { grid-template-columns: 1fr; gap: 40px; }
      .footer-bottom { flex-direction: column; text-align: center; }
      .fr { grid-template-columns: 1fr; }
      .stats-grid { grid-template-columns: repeat(2,1fr); }
      .cursor-ring, .cursor-dot { display: none; }
      body, .btn, a, button, select, input, textarea { cursor: auto !important; }
      .devices-showcase { height: auto; flex-direction: column; align-items: center; gap: 24px; padding-bottom: 20px; }
      .device-tablet, .device-phone { position: static; margin: 0; }
      .devices-labels { gap: 28px; flex-wrap: wrap; }
      .tech-grid { grid-template-columns: repeat(3, 1fr); }
      .form-card { padding: 28px 22px; }
    }
    @media(max-width:480px) {
      .hero-title { font-size: clamp(2.8rem, 13vw, 4.5rem); }
      .hero-stats { grid-template-columns: repeat(2,1fr); }
      .tech-grid { grid-template-columns: repeat(2, 1fr); }
      .laptop-outer { width: 290px; }
      .laptop-base { width: 316px; }
      .device-tablet { display: none; }
      .devices-labels { gap: 20px; }
    }

    /* PORTFOLIO */
    .portfolio-sec { padding: 120px 0; background: var(--bg-2); }
    .portfolio-grid {
      display: grid; grid-template-columns: repeat(2, 1fr);
      gap: 22px; margin-top: 64px;
    }
    .p-card {
      background: var(--bg-3); border: 1px solid var(--border);
      border-radius: 24px; overflow: hidden; cursor: none;
      transition: all .4s var(--ease); position: relative;
    }
    .p-card::before {
      content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
      background: linear-gradient(90deg, var(--blue-3), var(--blue-2));
      transform: scaleX(0); transform-origin: left;
      transition: transform .5s var(--ease); z-index: 1;
    }
    .p-card:hover {
      border-color: rgba(24,82,232,0.25); transform: translateY(-6px);
      box-shadow: 0 24px 64px rgba(0,0,0,0.45), 0 0 40px rgba(24,82,232,0.08);
    }
    .p-card:hover::before { transform: scaleX(1); }
    .p-card-preview {
      width: 100%; aspect-ratio: 16/9; overflow: hidden;
      background: var(--bg); position: relative; border-bottom: 1px solid var(--border);
    }
    .p-card-preview img {
      width: 100%; height: 100%; object-fit: cover; object-position: top;
      transition: transform .7s var(--ease), filter .4s;
      filter: brightness(0.85) saturate(0.85);
    }
    .p-card:hover .p-card-preview img { transform: scale(1.05); filter: brightness(1) saturate(1); }
    .p-card-overlay {
      position: absolute; inset: 0;
      background: linear-gradient(to top, rgba(5,5,10,0.75) 0%, transparent 55%);
      display: flex; align-items: flex-end; padding: 20px;
      opacity: 0; transition: opacity .4s;
    }
    .p-card:hover .p-card-overlay { opacity: 1; }
    .p-visit-btn {
      display: inline-flex; align-items: center; gap: 7px;
      background: var(--blue); color: white;
      padding: 10px 22px; border-radius: 100px;
      font-family: 'Outfit', sans-serif; font-size: 0.8rem; font-weight: 600;
      transition: all .3s var(--ease); transform: translateY(8px);
      box-shadow: 0 4px 24px rgba(24,82,232,0.45);
    }
    .p-card:hover .p-visit-btn { transform: translateY(0); }
    .p-visit-btn:hover { background: var(--blue-2); }
    .p-card-preview--video {
      background: radial-gradient(ellipse at 50% 60%, rgba(24,82,232,0.12) 0%, var(--bg) 70%);
    }
    .p-video-thumb {
      width: 100%; height: 100%;
      display: flex; flex-direction: column; align-items: center; justify-content: center;
      gap: 14px; min-height: 200px;
    }
    .p-video-icon {
      width: 72px; height: 72px; border-radius: 50%;
      background: rgba(24,82,232,0.1); border: 1px solid rgba(24,82,232,0.22);
      display: flex; align-items: center; justify-content: center;
      transition: all .4s var(--ease);
    }
    .p-video-icon svg { width: 28px; height: 28px; }
    .p-card:hover .p-video-icon {
      background: rgba(24,82,232,0.2); border-color: var(--blue);
      box-shadow: 0 0 28px rgba(24,82,232,0.3); transform: scale(1.1);
    }
    .p-video-label {
      font-family: 'JetBrains Mono', monospace; font-size: 0.62rem;
      color: var(--muted); text-transform: uppercase; letter-spacing: 0.14em;
    }
    .p-card-body { padding: 26px 30px 30px; }
    .p-card-meta {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 10px;
    }
    .p-type {
      font-family: 'JetBrains Mono', monospace; font-size: 0.6rem;
      color: var(--blue-2); text-transform: uppercase; letter-spacing: 0.12em;
    }
    .p-card-num {
      font-family: 'JetBrains Mono', monospace; font-size: 0.6rem;
      color: var(--muted); opacity: 0.4;
    }
    .p-card-title {
      font-family: 'Unbounded', sans-serif; font-size: 1.05rem; font-weight: 700;
      color: var(--white); margin-bottom: 10px; line-height: 1.3;
    }
    .p-card-desc {
      color: var(--muted); font-size: 0.84rem; line-height: 1.82;
      margin-bottom: 20px;
    }
    @media(max-width: 768px) {
      .portfolio-grid { grid-template-columns: 1fr; }
    }
  </style>
</head>
<body>
  <div class="scroll-progress" id="scrollProgress"></div>

  <!-- LOADER -->
  <div class="loader" id="loader">
    <div class="loader-logo">Vision<span>Web</span></div>
    <div class="loader-bar"><div class="loader-fill"></div></div>
    <div class="loader-pct" id="loaderPct">Iniciando... 0%</div>
  </div>

  <!-- CURSOR -->
  <div class="cursor-ring" id="cRing"></div>
  <div class="cursor-dot" id="cDot"></div>

  <!-- WHATSAPP FAB -->
  <a class="whatsapp-fab" href="https://wa.me/558189963849" target="_blank" rel="noopener" title="Falar no WhatsApp">
    <div class="fab-pulse"></div>
    <div class="fab-pulse-2"></div>
    <svg viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
  </a>

  <!-- MOBILE MENU -->
  <div class="mobile-menu" id="mobileMenu">
    <ul class="mobile-nav">
      <li><a href="#servicos" onclick="closeMob()">Serviços</a></li>
      <li><a href="#metodo" onclick="closeMob()">Método</a></li>
      <li><a href="#dispositivos" onclick="closeMob()">Dispositivos</a></li>
      <li><a href="#portfolio" onclick="closeMob()">Portfólio</a></li><li><a href="#depoimentos" onclick="closeMob()">Depoimentos</a></li>
      <li><a href="#faq" onclick="closeMob()">FAQ</a></li>
      <li><a href="#contato" onclick="closeMob()">Contato</a></li>
    </ul>
    <a href="https://wa.me/558189963849" target="_blank" class="btn btn-white btn-lg">Falar com Especialista →</a>
  </div>

  <!-- NAVBAR -->
  <nav class="navbar" id="navbar">
    <div class="nav-inner">
      <a href="#inicio" class="nav-logo">
        <img src="https://i.postimg.cc/kXjt4SfR/logo-png-edited.jpg" alt="Vision Web" id="logoImg">
        <span class="nav-logo-fallback" id="logoFallback" style="display:none;">Vision<em>Web</em></span>
      </a>
      <ul class="nav-links">
        <li><a href="#servicos">Serviços</a></li>
        <li><a href="#metodo">Método</a></li>
        <li><a href="#dispositivos">Dispositivos</a></li>
        <li><a href="#portfolio">Portfólio</a></li><li><a href="#depoimentos">Depoimentos</a></li>
        <li><a href="#faq">FAQ</a></li>
      </ul>
      <div class="nav-ctas">
        <a href="#contato" class="btn btn-ghost">Ver Planos</a>
        <a href="https://wa.me/558189963849" target="_blank" class="btn btn-blue">Falar Agora →</a>
      </div>
      <button class="hamburger" id="hamburger" onclick="toggleMob()" aria-label="Menu">
        <span></span><span></span><span></span>
      </button>
    </div>
  </nav>

  <!-- HERO -->
  <section class="hero" id="inicio">
    <div class="hero-glow"></div>
    <div class="hero-grid"></div>
    <div class="hero-orb hero-orb-1"></div>
    <div class="hero-orb hero-orb-2"></div>
    <div class="hero-orb hero-orb-3"></div>
    <div class="hero-shapes">
      <div class="shape-ring"><div class="shape-ring-inner"></div></div>
    </div>
    <div class="particles" id="heroParticles"></div>

    <div class="container" style="position:relative;z-index:1;">
      <div class="hero-badge reveal">
        <div class="hero-badge-dot"></div>
        Tecnologia &amp; Design de Elite — Pernambuco, BR
      </div>

      <h1 class="hero-title reveal d1">
        <span class="grad">Sua Visão,</span><br>
        <span class="outline-text">Código</span><br>
        <span style="color:var(--white);">Absoluto.</span>
      </h1>

      <p class="hero-sub reveal d2">
        Criamos ecossistemas digitais imersivos que dominam o mercado.
        Design focado em autoridade, performance técnica e conversão máxima.
      </p>

      <div class="hero-actions reveal d3">
        <a href="#contato" class="btn btn-white btn-lg">Iniciar Projeto →</a>
        <a href="#servicos" class="btn btn-ghost btn-lg">Explorar Serviços</a>
      </div>

      <div class="hero-price-note reveal d3" style="margin-top:18px;">
        <span class="price-badge">
          <span class="price-badge-star">✦</span>
          Sites a partir de R$&nbsp;399,99
        </span>
        <span style="color:var(--border);">·</span>
        <span>Entrega em até 7 dias</span>
      </div>

      <div class="hero-scroll-hint reveal d4">
        <div class="scroll-line"></div>
        <span class="scroll-arrow">↓</span>
        <span>Role para explorar</span>
      </div>

      <div class="hero-stats reveal d4">
        <div class="hstat">
          <span class="hstat-num" data-count="120" data-sfx="+">0</span>
          <div class="hstat-label">Projetos Entregues</div>
        </div>
        <div class="hstat">
          <span class="hstat-num c-blue" data-count="97" data-sfx="%">0</span>
          <div class="hstat-label">Taxa de Retenção</div>
        </div>
        <div class="hstat">
          <span class="hstat-num" data-count="24" data-sfx="/7">0</span>
          <div class="hstat-label">Horas de Suporte</div>
        </div>
        <div class="hstat">
          <span class="hstat-num" data-count="7" data-sfx=" dias">0</span>
          <div class="hstat-label">Prazo de Entrega</div>
        </div>
      </div>
    </div>
  </section>

  <!-- MARQUEE -->
  <div class="marquee-wrap">
    <div class="marquee-track">
      <div class="m-item hi">Vision Web</div><div class="m-sep"></div>
      <div class="m-item">Design de Elite</div><div class="m-sep"></div>
      <div class="m-item price">A partir de R$399,99</div><div class="m-sep"></div>
      <div class="m-item hi">Desenvolvimento Web</div><div class="m-sep"></div>
      <div class="m-item">Landing Pages</div><div class="m-sep"></div>
      <div class="m-item hi">E-Commerce</div><div class="m-sep"></div>
      <div class="m-item">Performance</div><div class="m-sep"></div>
      <div class="m-item hi">UI / UX</div><div class="m-sep"></div>
      <div class="m-item">SEO Técnico</div><div class="m-sep"></div>
      <div class="m-item price">Entrega em 7 dias</div><div class="m-sep"></div>
      <div class="m-item hi">Pernambuco, BR</div><div class="m-sep"></div>
      <div class="m-item">Conversão Máxima</div><div class="m-sep"></div>
      <div class="m-item hi">Mobile-First</div><div class="m-sep"></div>
      <div class="m-item">Pixel Perfeito</div><div class="m-sep"></div>
      <!-- duplicate for seamless loop -->
      <div class="m-item hi">Vision Web</div><div class="m-sep"></div>
      <div class="m-item">Design de Elite</div><div class="m-sep"></div>
      <div class="m-item price">A partir de R$399,99</div><div class="m-sep"></div>
      <div class="m-item hi">Desenvolvimento Web</div><div class="m-sep"></div>
      <div class="m-item">Landing Pages</div><div class="m-sep"></div>
      <div class="m-item hi">E-Commerce</div><div class="m-sep"></div>
      <div class="m-item">Performance</div><div class="m-sep"></div>
      <div class="m-item hi">UI / UX</div><div class="m-sep"></div>
      <div class="m-item">SEO Técnico</div><div class="m-sep"></div>
      <div class="m-item price">Entrega em 7 dias</div><div class="m-sep"></div>
      <div class="m-item hi">Pernambuco, BR</div><div class="m-sep"></div>
      <div class="m-item">Conversão Máxima</div><div class="m-sep"></div>
      <div class="m-item hi">Mobile-First</div><div class="m-sep"></div>
      <div class="m-item">Pixel Perfeito</div><div class="m-sep"></div>
    </div>
  </div>

  <!-- SERVICES -->
  <section class="services" id="servicos">
    <div class="container">
      <div class="sec-header">
        <div>
          <div class="section-tag reveal">Nossos Serviços</div>
          <h2 class="display d-lg reveal d1">
            Soluções<br><span class="grad">High-End</span>
          </h2>
        </div>
        <p class="sec-header-right reveal d2">
          Onde a estética refinada encontra a engenharia robusta. Um leque completo de serviços digitais para escalar seu faturamento. <strong style="color:var(--blue-2);">Sites a partir de R$399,99.</strong>
        </p>
      </div>

      <div class="cards-grid">
        <div class="s-card reveal d1">
          <div class="s-card-glow"></div>
          <div class="s-card-num">01 / 03</div>
          <div class="s-card-icon">
            <svg viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
          </div>
          <h3>Speed Landing</h3>
          <p>Interfaces otimizadas para carregamento instantâneo (sub-1s) e fluxos de navegação psicológica que guiam o usuário direto para a ação de compra.</p>
          <div class="tags">
            <span class="tag">Alta Conversão</span>
            <span class="tag">Sub-1s Load</span>
            <span class="tag">Mobile-First</span>
            <span class="tag">A/B Test</span>
          </div>
          <div class="card-arrow">→</div>
        </div>

        <div class="s-card reveal d2">
          <div class="s-card-glow"></div>
          <div class="s-card-num">02 / 03</div>
          <div class="s-card-icon">
            <svg viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          </div>
          <h3>Brand UI / UX</h3>
          <p>Identidade visual projetada para posicionar sua marca como autoridade. Design Systems escaláveis e consistentes em todos os pontos de contato digitais.</p>
          <div class="tags">
            <span class="tag">Design System</span>
            <span class="tag">Figma HiFi</span>
            <span class="tag">Branding</span>
            <span class="tag">Motion</span>
          </div>
          <div class="card-arrow">→</div>
        </div>

        <div class="s-card reveal d3">
          <div class="s-card-glow"></div>
          <div class="s-card-num">03 / 03</div>
          <div class="s-card-icon">
            <svg viewBox="0 0 24 24"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>
          </div>
          <h3>E-Commerce Turbo</h3>
          <p>Lojas virtuais estruturadas para conversão. Checkout transparente, recuperação de carrinho nativa e arquitetura para alto volume de tráfego.</p>
          <div class="tags">
            <span class="tag">Checkout PIX</span>
            <span class="tag">Alto Tráfego</span>
            <span class="tag">Mercado Pago</span>
            <span class="tag">Analytics</span>
          </div>
          <div class="card-arrow">→</div>
        </div>
      </div>
    </div>
  </section>

  <!-- PROCESS -->
  <section class="process-sec" id="metodo">
    <div class="container">
      <div class="sec-header">
        <div>
          <div class="section-tag reveal">Nosso Processo</div>
          <h2 class="display d-lg reveal d1">O Método <span class="grad">Vision</span></h2>
        </div>
        <p class="sec-header-right reveal d2">
          Um processo estruturado e transparente. Você acompanha cada etapa do seu projeto em tempo real.
        </p>
      </div>

      <div class="process-inner">
        <div class="reveal d1">
          <div class="step active" data-n="01" data-t="Imersão &amp; Estratégia" data-h="Mapeamos seu funil de vendas, entendemos seu público-alvo e definimos uma estrutura persuasiva antes de desenhar qualquer tela.">
            <div class="step-num">01</div>
            <div>
              <div class="step-title">Imersão &amp; Estratégia</div>
              <div class="step-desc">Mapeamos seu funil de vendas, entendemos seu público-alvo e definimos uma estrutura persuasiva antes de desenhar qualquer tela.</div>
            </div>
          </div>
          <div class="step" data-n="02" data-t="Blueprint &amp; Figma" data-h="Você recebe um protótipo navegável de alta fidelidade. Validamos cada pixel, texto e interação com você antes de ir para o código.">
            <div class="step-num">02</div>
            <div>
              <div class="step-title">Blueprint &amp; Figma</div>
              <div class="step-desc">Você recebe um protótipo navegável de alta fidelidade. Validamos cada pixel, texto e interação com você antes de ir para o código.</div>
            </div>
          </div>
          <div class="step" data-n="03" data-t="Desenvolvimento Clean" data-h="Transformamos o design em código limpo, semântico e ultrarrápido, priorizando a experiência Mobile-First em cada detalhe.">
            <div class="step-num">03</div>
            <div>
              <div class="step-title">Desenvolvimento Clean</div>
              <div class="step-desc">Transformamos o design em código limpo, semântico e ultrarrápido, priorizando a experiência Mobile-First em cada detalhe.</div>
            </div>
          </div>
          <div class="step" data-n="04" data-t="Launch &amp; Scale" data-h="Testes rigorosos de QA, SEO técnico e integração com Pixel &amp; GA4. Seu projeto nasce pronto para vender e escalar continuamente.">
            <div class="step-num">04</div>
            <div>
              <div class="step-title">Launch &amp; Scale</div>
              <div class="step-desc">Testes rigorosos de QA, SEO técnico e integração com Pixel &amp; GA4. Seu projeto nasce pronto para vender e escalar continuamente.</div>
            </div>
          </div>
        </div>

        <div class="proc-visual reveal d3">
          <div class="proc-card">
            <div class="proc-card-sup">Etapa Atual</div>
            <div class="proc-card-num" id="pcNum">01</div>
            <div class="proc-card-title" id="pcTitle">Imersão &amp; Estratégia</div>
            <div class="proc-card-divider"></div>
            <div class="proc-card-hint" id="pcHint">Mapeamos seu funil de vendas, entendemos seu público-alvo e definimos uma estrutura persuasiva antes de desenhar qualquer tela.</div>
            <div class="proc-dots">
              <div class="proc-dot active"></div>
              <div class="proc-dot"></div>
              <div class="proc-dot"></div>
              <div class="proc-dot"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- DEVICE SHOWCASE -->
  <section class="device-sec" id="dispositivos">
    <div class="container">
      <div class="device-sec-header reveal">
        <div class="section-tag">Responsividade</div>
        <h2 class="display d-lg">
          Perfeito em<br><span class="grad">Todo Dispositivo</span>
        </h2>
        <p>Cada pixel é otimizado para oferecer a melhor experiência — seja no smartphone, tablet ou notebook do seu cliente.</p>
      </div>

      <div class="devices-showcase reveal d1">
        <div class="device-laptop" id="deviceLaptop">
          <div class="laptop-outer">
            <div class="laptop-screen">
              <div class="mini-site">
                <div class="mini-nav">
                  <div class="mini-nav-dot" style="background:#FF5F57;"></div>
                  <div class="mini-nav-dot" style="background:#FEBC2E;"></div>
                  <div class="mini-nav-dot" style="background:#28C840;"></div>
                  <div class="mini-nav-logo"></div>
                  <div class="mini-nav-links">
                    <div class="mini-nav-link" style="width:14px;"></div>
                    <div class="mini-nav-link" style="width:18px;"></div>
                    <div class="mini-nav-link" style="width:12px;"></div>
                  </div>
                  <div class="mini-nav-btn"></div>
                </div>
                <div class="mini-hero">
                  <div class="mini-hero-line" style="width:58%;background:linear-gradient(90deg,rgba(255,255,255,0.9),rgba(255,255,255,0.5));"></div>
                  <div class="mini-hero-line" style="width:42%;background:linear-gradient(90deg,rgba(61,111,255,0.8),rgba(61,111,255,0.4));"></div>
                  <div class="mini-hero-sub" style="width:72%;"></div>
                  <div class="mini-hero-sub" style="width:60%;"></div>
                  <div class="mini-btn-row">
                    <div class="mini-btn-w"></div>
                    <div class="mini-btn-b"></div>
                  </div>
                </div>
                <div class="mini-stats-row">
                  <div class="mini-stat"></div>
                  <div class="mini-stat" style="background:rgba(24,82,232,0.15);"></div>
                  <div class="mini-stat"></div>
                  <div class="mini-stat"></div>
                </div>
                <div class="mini-cards-row">
                  <div class="mini-card" style="background:rgba(24,82,232,0.18);border-color:rgba(24,82,232,0.28);"></div>
                  <div class="mini-card"></div>
                  <div class="mini-card"></div>
                </div>
              </div>
            </div>
          </div>
          <div class="laptop-base"></div>
        </div>

        <div class="device-tablet">
          <div class="tablet-outer">
            <div class="tablet-screen">
              <div class="mini-site-m">
                <div class="mini-mob-nav">
                  <div class="mini-mob-logo"></div>
                  <div class="mini-mob-ham"><span></span><span></span><span></span></div>
                </div>
                <div class="mini-mob-hero" style="padding:10px;">
                  <div class="mini-mob-line" style="width:82%;background:rgba(255,255,255,0.82);height:6px;"></div>
                  <div class="mini-mob-line" style="width:62%;background:rgba(61,111,255,0.7);height:5px;"></div>
                  <div class="mini-mob-line" style="width:92%;background:rgba(255,255,255,0.12);"></div>
                  <div class="mini-mob-line" style="width:72%;background:rgba(255,255,255,0.12);"></div>
                  <div class="mini-mob-btn" style="width:36px;"></div>
                </div>
                <div class="mini-mob-cards">
                  <div class="mini-mob-card"></div>
                  <div class="mini-mob-card" style="background:rgba(24,82,232,0.15);border-color:rgba(24,82,232,0.25);"></div>
                </div>
              </div>
            </div>
            <div class="tablet-btn"></div>
          </div>
        </div>

        <div class="device-phone">
          <div class="phone-outer">
            <div class="phone-notch"></div>
            <div class="phone-screen">
              <div class="mini-site-m">
                <div class="mini-mob-nav" style="height:12px;">
                  <div class="mini-mob-logo" style="width:16px;"></div>
                  <div class="mini-mob-ham"><span></span><span></span></div>
                </div>
                <div class="mini-mob-hero">
                  <div class="mini-mob-line" style="width:88%;background:rgba(255,255,255,0.82);"></div>
                  <div class="mini-mob-line" style="width:68%;background:rgba(61,111,255,0.7);"></div>
                  <div class="mini-mob-line" style="width:98%;background:rgba(255,255,255,0.1);"></div>
                  <div class="mini-mob-btn" style="width:26px;"></div>
                </div>
                <div class="mini-mob-cards" style="padding:3px;gap:2px;">
                  <div class="mini-mob-card" style="height:9px;"></div>
                  <div class="mini-mob-card" style="height:9px;background:rgba(24,82,232,0.15);"></div>
                  <div class="mini-mob-card" style="height:9px;"></div>
                </div>
              </div>
            </div>
            <div class="phone-btn"></div>
          </div>
        </div>
      </div>

      <div class="devices-glow-line reveal d2" style="margin-top:24px;"></div>
      <div class="devices-labels reveal d2">
        <div class="device-label">
          <div class="device-label-dot"></div>
          Notebook
        </div>
        <div class="device-label">
          <div class="device-label-dot"></div>
          Tablet
        </div>
        <div class="device-label">
          <div class="device-label-dot"></div>
          Smartphone
        </div>
      </div>
    </div>
  </section>

  <!-- TECH STACK -->
  <section class="tech-sec">
    <div class="container">
      <div class="tech-header reveal">
        <div class="section-tag">Stack</div>
        <p>Tecnologias de ponta para resultados extraordinários</p>
      </div>
      <div class="tech-grid">
        <div class="tech-item reveal">
          <div class="tech-icon">
            <svg viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke="#61DAFB" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <div class="tech-name">React</div>
        </div>
        <div class="tech-item reveal d1">
          <div class="tech-icon">
            <svg viewBox="0 0 24 24" fill="none"><rect width="24" height="24" rx="3" fill="#111"/><text x="4" y="17" font-family="Arial" font-weight="900" font-size="13" fill="white">N</text></svg>
          </div>
          <div class="tech-name">Next.js</div>
        </div>
        <div class="tech-item reveal d2">
          <div class="tech-icon">
            <svg viewBox="0 0 24 24" fill="none"><path d="M5 12.5C5 8.91 7.91 6 11.5 6H19l-3 3m3-3l-3-3" stroke="#38BDF8" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M19 11.5C19 15.09 16.09 18 12.5 18H5l3-3M5 18l3 3" stroke="#38BDF8" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <div class="tech-name">Tailwind</div>
        </div>
        <div class="tech-item reveal d3">
          <div class="tech-icon">
            <svg viewBox="0 0 24 24" fill="none"><path d="M5 3h14l-4 9 4 9H5l4-9-4-9z" stroke="#A259FF" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <div class="tech-name">Figma</div>
        </div>
        <div class="tech-item reveal d4">
          <div class="tech-icon">
            <svg viewBox="0 0 24 24" fill="none"><path d="M7 8l-4 4 4 4M17 8l4 4-4 4M14 4l-4 16" stroke="#F7DF1E" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </div>
          <div class="tech-name">JavaScript</div>
        </div>
        <div class="tech-item reveal d5">
          <div class="tech-icon">
            <svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#21759B" stroke-width="1.6"/><path d="M12 7v5l3 3" stroke="#21759B" stroke-width="1.6" stroke-linecap="round"/></svg>
          </div>
          <div class="tech-name">WordPress</div>
        </div>
      </div>
    </div>
  </section>

  <!-- WHY US -->
  <section class="why-sec" id="porque">
    <div class="container">
      <div class="sec-header">
        <div>
          <div class="section-tag reveal">Por Que Nós</div>
          <h2 class="display d-lg reveal d1">O que nos<br><span class="grad">Diferencia</span></h2>
        </div>
        <p class="sec-header-right reveal d2">
          Não somos uma agência genérica. Somos parceiros estratégicos obsessivos com resultados mensuráveis.
        </p>
      </div>

      <div class="why-grid">
        <div>
          <div class="why-points">
            <div class="why-point reveal">
              <div class="why-point-icon">
                <svg viewBox="0 0 24 24"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
              </div>
              <div>
                <div class="why-point-title">Velocidade de Entrega</div>
                <div class="why-point-desc">Projetos entregues em até 7 dias úteis sem abrir mão da qualidade. Agilidade é nosso padrão operacional.</div>
              </div>
            </div>
            <div class="why-point reveal d1">
              <div class="why-point-icon">
                <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              </div>
              <div>
                <div class="why-point-title">Suporte 24/7</div>
                <div class="why-point-desc">Problema não espera horário comercial. Estamos disponíveis a qualquer momento para garantir o funcionamento do seu negócio.</div>
              </div>
            </div>
            <div class="why-point reveal d2">
              <div class="why-point-icon">
                <svg viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><path d="M22 4L12 14.01l-3-3"/></svg>
              </div>
              <div>
                <div class="why-point-title">Foco em Conversão</div>
                <div class="why-point-desc">Cada elemento do design é estratégico. Não fazemos bonito pelo bonito — fazemos para converter visitantes em clientes.</div>
              </div>
            </div>
            <div class="why-point reveal d3">
              <div class="why-point-icon">
                <svg viewBox="0 0 24 24"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              </div>
              <div>
                <div class="why-point-title">Código Proprietário</div>
                <div class="why-point-desc">Zero dependência de construtores visuais. Código 100% próprio, limpo e escalável. Velocidade real, SEO real.</div>
              </div>
            </div>
          </div>

          <div class="skill-bars reveal d4">
            <div class="skill-bar-item">
              <div class="skill-bar-header">
                <span class="skill-bar-name">Performance Web (Core Vitals)</span>
                <span class="skill-bar-pct">98%</span>
              </div>
              <div class="skill-bar-track"><div class="skill-bar-fill" data-width="0.98"></div></div>
            </div>
            <div class="skill-bar-item">
              <div class="skill-bar-header">
                <span class="skill-bar-name">Satisfação do Cliente</span>
                <span class="skill-bar-pct">97%</span>
              </div>
              <div class="skill-bar-track"><div class="skill-bar-fill" data-width="0.97"></div></div>
            </div>
            <div class="skill-bar-item">
              <div class="skill-bar-header">
                <span class="skill-bar-name">Entrega no Prazo</span>
                <span class="skill-bar-pct">95%</span>
              </div>
              <div class="skill-bar-track"><div class="skill-bar-fill" data-width="0.95"></div></div>
            </div>
          </div>
        </div>

        <div class="why-right-card reveal-r">
          <div class="section-tag" style="margin-bottom:32px;">Resultados Reais</div>
          <div class="why-metric">
            <span class="why-metric-num" data-count="320" data-sfx="%">0%</span>
            <div class="why-metric-label">Aumento médio de conversão</div>
            <div class="why-metric-sub">Em Landing Pages otimizadas pela Vision Web</div>
          </div>
          <div class="why-metric">
            <span class="why-metric-num" data-count="2" data-sfx="s">0s</span>
            <div class="why-metric-label">Tempo médio de carregamento</div>
            <div class="why-metric-sub">Performance real medida via PageSpeed Insights</div>
          </div>
          <div class="why-metric">
            <span class="why-metric-num" data-count="120" data-sfx="+">0+</span>
            <div class="why-metric-label">Projetos entregues</div>
            <div class="why-metric-sub">Desde landing pages a e-commerces complexos</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- STATS -->
  <section class="stats-sec">
    <div class="container">
      <div class="stats-grid">
        <div class="stat-block reveal">
          <span class="stat-num" data-count="120" data-sfx="+">0</span>
          <div class="stat-label">Projetos Entregues</div>
        </div>
        <div class="stat-block reveal d1">
          <span class="stat-num c-blue" data-count="97" data-sfx="%">0</span>
          <div class="stat-label">Taxa de Satisfação</div>
        </div>
        <div class="stat-block reveal d2">
          <span class="stat-num" data-count="7" data-sfx=" dias">0</span>
          <div class="stat-label">Prazo Médio de Entrega</div>
        </div>
        <div class="stat-block reveal d3">
          <span class="stat-num" data-count="24" data-sfx="h">0</span>
          <div class="stat-label">Suporte ao Cliente</div>
        </div>
      </div>
    </div>
  </section>

  <!-- PORTFOLIO -->
  <section class="portfolio-sec" id="portfolio">
    <div class="container">
      <div class="sec-header">
        <div>
          <div class="section-tag reveal">Portfólio</div>
          <h2 class="display d-lg reveal d1">Projetos<br><span class="grad">Reais</span></h2>
        </div>
        <p class="sec-header-right reveal d2">
          Não falamos de resultado apenas no discurso. Cada link abaixo é prova concreta do que entregamos — veja com seus próprios olhos.
        </p>
      </div>

      <div class="portfolio-grid">

        <div class="p-card reveal d1">
          <div class="p-card-preview">
            <img src="https://i.postimg.cc/bvDJ5Nmp/Studio-Roberta-Arquitetura-da-Beleza-Estetica-Avancada-Google-Chrome-06-06-2026-18-38-22.png" alt="Site Roberta Rodrigues" loading="lazy">
            <div class="p-card-overlay">
              <a href="https://robertarodrigues.netlify.app" target="_blank" rel="noopener" class="p-visit-btn">Ver Site →</a>
            </div>
          </div>
          <div class="p-card-body">
            <div class="p-card-meta">
              <span class="p-type">Site Institucional</span>
              <span class="p-card-num">01 / 04</span>
            </div>
            <h3 class="p-card-title">Roberta Rodrigues</h3>
            <p class="p-card-desc">Esteticista e cosmetóloga. Site com identidade visual elegante, posicionamento de autoridade e experiência mobile refinada.</p>
            <div class="tags">
              <span class="tag">Site Institucional</span>
              <span class="tag">Saúde &amp; Estética</span>
              <span class="tag">Mobile-First</span>
            </div>
          </div>
        </div>

        <div class="p-card reveal d2">
          <div class="p-card-preview">
            <img src="https://i.postimg.cc/wB886q6T/Whats-App-Beta-06-06-2026-18-44-38.png" alt="Landing Page Anderson Augusto - Ukulele" loading="lazy">
            <div class="p-card-overlay">
              <a href="https://ukuleleparaprofissionaisdainfancia.kpages.online/" target="_blank" rel="noopener" class="p-visit-btn">Ver Site →</a>
            </div>
          </div>
          <div class="p-card-body">
            <div class="p-card-meta">
              <span class="p-type">Landing Page</span>
              <span class="p-card-num">02 / 04</span>
            </div>
            <h3 class="p-card-title">Anderson Augusto — Ukulelê</h3>
            <p class="p-card-desc">Curso e imersão de ukulele para profissionais da infância. Landing page com copy persuasivo e foco total em conversão de inscrições.</p>
            <div class="tags">
              <span class="tag">Landing Page</span>
              <span class="tag">Educação</span>
              <span class="tag">Alta Conversão</span>
            </div>
          </div>
        </div>

        <div class="p-card reveal d3">
          <div class="p-card-preview">
            <img src="https://i.postimg.cc/152bHmVp/Eletromix-Cell-Assistencia-Tecnica-e-Loja-Virtual-Google-Chrome-06-06-2026-18-46-48.png" alt="Site Anderson - Conserto de Celular" loading="lazy">
            <div class="p-card-overlay">
              <a href="https://marvelous-moxie-e0e80d.netlify.app" target="_blank" rel="noopener" class="p-visit-btn">Ver Site →</a>
            </div>
          </div>
          <div class="p-card-body">
            <div class="p-card-meta">
              <span class="p-type">Site Institucional</span>
              <span class="p-card-num">03 / 04</span>
            </div>
            <h3 class="p-card-title">Anderson Tech</h3>
            <p class="p-card-desc">Assistência técnica em conserto de celular. Site profissional para gerar credibilidade, captar clientes locais e aumentar visibilidade no Google.</p>
            <div class="tags">
              <span class="tag">Negócio Local</span>
              <span class="tag">Tecnologia</span>
              <span class="tag">SEO Local</span>
            </div>
          </div>
        </div>

        <div class="p-card reveal d4">
          <div class="p-card-preview p-card-preview--video">
            <div class="p-video-thumb">
              <div class="p-video-icon">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15.5 12L9.5 8v8l6-4z" fill="var(--blue-2)"/>
                  <path d="M21 12c0 4.97-4.03 9-9 9S3 16.97 3 12 7.03 3 12 3s9 4.03 9 9z" stroke="var(--blue-2)" stroke-width="1.4"/>
                </svg>
              </div>
              <span class="p-video-label">Produção Audiovisual</span>
            </div>
          </div>
          <div class="p-card-body">
            <div class="p-card-meta">
              <span class="p-type">Edição de Vídeo</span>
              <span class="p-card-num">04 / 04</span>
            </div>
            <h3 class="p-card-title">Bayma Mentoria</h3>
            <p class="p-card-desc">Conteúdo audiovisual profissional para mentoria de alto impacto. Edição estratégica de vídeos para reels, anúncios pagos e conteúdo institucional.</p>
            <div class="tags">
              <span class="tag">Edição de Vídeo</span>
              <span class="tag">Mentoria</span>
              <span class="tag">Reels &amp; Ads</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  </section>

  <!-- TESTIMONIALS -->
  <section class="testi-sec" id="depoimentos">
    <div class="container">
      <div class="sec-header">
        <div>
          <div class="section-tag reveal">Depoimentos</div>
          <h2 class="display d-lg reveal d1">Prova<br><span class="grad">Social</span></h2>
        </div>
        <p class="sec-header-right reveal d2">
          O que os líderes que já confiaram na Vision Web têm a dizer sobre nossos ecossistemas digitais.
        </p>
      </div>

      <div class="testi-grid">
        <div class="t-card reveal d1">
          <div class="t-stars"><span>★</span><span>★</span><span>★</span><span>★</span><span>★</span></div>
          <div class="t-quote-mark">"</div>
          <div class="t-text">A taxa de conversão da nossa Landing Page triplicou na primeira semana de tráfego pago. O design não é apenas bonito, ele é absurdamente funcional.</div>
          <div class="t-author">
            <div class="t-avatar" style="background:linear-gradient(135deg,#1852E8,#3D6FFF);">A</div>
            <div>
              <div class="t-name">Anderson Augusto</div>
              <div class="t-role">Fundador · Empresa de Cursos Online</div>
            </div>
          </div>
        </div>

        <div class="t-card reveal d2">
          <div class="t-stars"><span>★</span><span>★</span><span>★</span><span>★</span><span>★</span></div>
          <div class="t-quote-mark">"</div>
          <div class="t-text">Velocidade de carregamento impressionante. Nossa antiga página demorava muito e perdíamos clientes. A Vision Web resolveu isso com maestria técnica.</div>
          <div class="t-author">
            <div class="t-avatar" style="background:linear-gradient(135deg,#0D3DBF,#1852E8);">R</div>
            <div>
              <div class="t-name">Roberta Rodrigues</div>
              <div class="t-role">Proprietária · Estética &amp; Cosmetologia</div>
            </div>
          </div>
        </div>
      </div>

      <div class="testi-mini-row">
        <div class="t-card-mini reveal d3">
          <div class="t-stars"><span>★</span><span>★</span><span>★</span><span>★</span><span>★</span></div>
          <div class="t-text">"Do briefing ao lançamento, tudo foi muito bem comunicado. Site moderno, rápido e que representa nossa marca com autoridade total."</div>
          <div class="t-author">
            <div class="t-avatar" style="background:linear-gradient(135deg,#1852E8,#4A7DFF);font-size:0.85rem;width:38px;height:38px;">M</div>
            <div>
              <div class="t-name">Marcos Oliveira</div>
              <div class="t-role">Diretor · Construtora Regional</div>
            </div>
          </div>
        </div>
        <div class="t-card-mini reveal d4">
          <div class="t-stars"><span>★</span><span>★</span><span>★</span><span>★</span><span>★</span></div>
          <div class="t-text">"A loja virtual superou todas as expectativas. Nas primeiras 72 horas do lançamento já tivemos nosso investimento retornado com lucro."</div>
          <div class="t-author">
            <div class="t-avatar" style="background:linear-gradient(135deg,#0D3DBF,#1852E8);font-size:0.85rem;width:38px;height:38px;">J</div>
            <div>
              <div class="t-name">Juliana Mendes</div>
              <div class="t-role">CEO · Boutique de Moda</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- FAQ -->
  <section class="faq-sec" id="faq">
    <div class="container">
      <div class="faq-layout">
        <div class="faq-left">
          <div class="section-tag reveal">FAQ</div>
          <h2 class="display d-lg reveal d1">
            Transparência<br><span class="grad">Total</span>
          </h2>
          <div class="faq-cta-box reveal d2">
            <p>Tem alguma dúvida que não está aqui? Nossa equipe está pronta para responder em minutos.</p>
            <a href="https://wa.me/558189963849" target="_blank" class="btn btn-blue">Falar Agora →</a>
          </div>
        </div>

        <div class="faq-list">
          <div class="faq-item reveal">
            <button class="faq-q" onclick="toggleFaq(this)">
              Qual o prazo médio de entrega?
              <div class="faq-icon">+</div>
            </button>
            <div class="faq-a"><div class="faq-a-inner">Nossa média para Landing Pages de alta conversão é de 7 a 10 dias úteis. Projetos maiores (E-commerces, Sistemas) seguem cronogramas personalizados, detalhados na fase de Blueprint com você.</div></div>
          </div>
          <div class="faq-item reveal d1">
            <button class="faq-q" onclick="toggleFaq(this)">
              Qual o valor dos sites?
              <div class="faq-icon">+</div>
            </button>
            <div class="faq-a"><div class="faq-a-inner">Nossos sites começam a partir de R$399,99 para Landing Pages simples. Sites institucionais, e-commerces e projetos personalizados têm valores sob consulta, definidos após o briefing completo. Trabalhamos com 50% de entrada e 50% na entrega.</div></div>
          </div>
          <div class="faq-item reveal d2">
            <button class="faq-q" onclick="toggleFaq(this)">
              Quais tecnologias vocês utilizam?
              <div class="faq-icon">+</div>
            </button>
            <div class="faq-a"><div class="faq-a-inner">Trabalhamos com o estado da arte do desenvolvimento web. Construímos do zero usando HTML5, CSS3 moderno, JavaScript puro ou frameworks robustos como React e Next.js, dependendo da necessidade estratégica do projeto.</div></div>
          </div>
          <div class="faq-item reveal d3">
            <button class="faq-q" onclick="toggleFaq(this)">
              Os sites são otimizados para Mobile?
              <div class="faq-icon">+</div>
            </button>
            <div class="faq-a"><div class="faq-a-inner">Absolutamente. Adotamos a filosofia Mobile-First. Como mais de 80% do tráfego hoje vem de smartphones, seu projeto é desenhado primeiramente para a melhor experiência na palma da mão.</div></div>
          </div>
          <div class="faq-item reveal d4">
            <button class="faq-q" onclick="toggleFaq(this)">
              Vocês oferecem suporte após o lançamento?
              <div class="faq-icon">+</div>
            </button>
            <div class="faq-a"><div class="faq-a-inner">Sim. Oferecemos 30 dias de suporte técnico gratuito após a entrega, e temos planos de manutenção mensal. Nossa equipe está disponível para ajustes, atualizações e evoluções contínuas.</div></div>
          </div>
          <div class="faq-item reveal d5">
            <button class="faq-q" onclick="toggleFaq(this)">
              Como funciona o processo de pagamento?
              <div class="faq-icon">+</div>
            </button>
            <div class="faq-a"><div class="faq-a-inner">Trabalhamos com 50% de entrada antes do início e 50% na entrega final. Aceitamos PIX, transferência bancária e cartão de crédito. Após o briefing completo, você recebe um contrato formal com todos os detalhes.</div></div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- CONTACT -->
  <section class="contact-sec" id="contato">
    <div class="container">
      <div class="contact-grid">
        <div class="contact-left">
          <div class="section-tag reveal">Fale Conosco</div>
          <h2 class="display d-md reveal d1">
            Solicite sua<br><span class="grad">Proposta</span>
          </h2>
          <p class="reveal d2">
            Preencha o formulário ao lado com seus dados. Nossa equipe analisará seu negócio e entrará em contato com uma estratégia digital focada em ROI real e mensurável.
          </p>
          <div class="c-info reveal d3">
            <a href="https://wa.me/558189963849" target="_blank" class="c-info-item">
              <div class="c-icon" style="background:rgba(37,211,102,.1);">
                <svg viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              </div>
              <div>
                <span class="c-info-label">WhatsApp — Resposta Rápida</span>
                <span class="c-info-val">Clique para conversar agora</span>
              </div>
              <span class="c-info-arr">→</span>
            </a>
          </div>

          <div class="price-highlight-box reveal d4">
            <div class="price-highlight-label">✦ Investimento</div>
            <div class="price-highlight-num">A partir de <span>R$&nbsp;399,99</span></div>
            <div class="price-highlight-sub">Landing Pages · Sites Institucionais · E-commerce · Projetos sob medida</div>
          </div>
        </div>

        <div class="form-card reveal d2" id="formCard">
          <div class="form-card-title">Solicitar Proposta Estratégica</div>
          <div class="form-card-sub">Preencha os campos abaixo e enviaremos direto no seu WhatsApp com todos os detalhes.</div>

          <div class="fg">
            <label>Objetivo Principal <span class="required-star">*</span></label>
            <select class="fc" id="fObjetivo">
              <option value="" disabled selected>Selecione seu objetivo</option>
              <option>Landing Page (Captura / Vendas)</option>
              <option>Loja Virtual / E-Commerce</option>
              <option>Site Institucional / Redesign</option>
              <option>Blog ou Portal de Conteúdo</option>
              <option>Sistema Web Personalizado</option>
              <option>Outro Projeto</option>
            </select>
          </div>

          <div class="fr">
            <div class="fg">
              <label>Nome Completo <span class="required-star">*</span></label>
              <input type="text" class="fc" id="fNome" placeholder="Seu nome completo">
            </div>
            <div class="fg">
              <label>Nome da Empresa</label>
              <input type="text" class="fc" id="fEmpresa" placeholder="Nome da empresa / marca">
            </div>
          </div>

          <div class="fr">
            <div class="fg">
              <label>E-mail / Gmail <span class="required-star">*</span></label>
              <input type="email" class="fc" id="fEmail" placeholder="seu@gmail.com">
            </div>
            <div class="fg">
              <label>WhatsApp <span class="required-star">*</span></label>
              <input type="tel" class="fc" id="fTelefone" placeholder="(81) 99999-9999">
            </div>
          </div>

          <div class="fr">
            <div class="fg">
              <label>Segmento / Nicho</label>
              <select class="fc" id="fSegmento">
                <option value="" disabled selected>Área de atuação</option>
                <option>Saúde &amp; Estética</option>
                <option>Educação &amp; Cursos</option>
                <option>Moda &amp; Varejo</option>
                <option>Alimentação &amp; Restaurantes</option>
                <option>Imóveis &amp; Construção</option>
                <option>Advocacia &amp; Jurídico</option>
                <option>Tecnologia &amp; SaaS</option>
                <option>Serviços Profissionais</option>
                <option>Indústria &amp; B2B</option>
                <option>Outro Segmento</option>
              </select>
            </div>
            <div class="fg">
              <label>Orçamento Estimado</label>
              <select class="fc" id="fOrcamento">
                <option value="" disabled selected>Faixa de investimento</option>
                <option>Até R$500</option>
                <option>R$500 – R$1.000</option>
                <option>R$1.000 – R$3.000</option>
                <option>R$3.000 – R$7.000</option>
                <option>R$7.000 – R$15.000</option>
                <option>Acima de R$15.000</option>
                <option>A definir</option>
              </select>
            </div>
          </div>

          <div class="fg">
            <label>Mensagem / Detalhes do Projeto</label>
            <textarea class="fc" id="fMensagem" rows="3" placeholder="Descreva seu projeto, dúvidas, prazo desejado ou qualquer informação relevante..."></textarea>
          </div>

          <button onclick="enviarProposta()" class="btn btn-green btn-lg" style="width:100%;justify-content:center;margin-top:8px;font-size:0.92rem;" id="btnEnviar">
            <svg viewBox="0 0 24 24" fill="white" style="width:18px;height:18px;flex-shrink:0;"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            Enviar Proposta pelo WhatsApp
          </button>
          <div class="form-note">
            <div class="form-note-dot"></div>
            Dados 100% Seguros &nbsp;·&nbsp; Resposta em até 2h &nbsp;·&nbsp; <span class="required-star">*</span>&nbsp;Campos obrigatórios
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- FOOTER -->
  <footer class="footer">
    <div class="container">
      <div class="footer-top">
        <div>
          <img src="https://i.postimg.cc/kXjt4SfR/logo-png-edited.jpg" alt="Vision Web" class="footer-logo" id="footerLogoImg">
          <div class="footer-brand-name" id="footerBrandFallback">Vision<em>Web</em></div>
          <p class="footer-tagline">Engenharia digital para marcas que não aceitam o medíocre. Sites a partir de R$399,99.</p>
          <div class="socials">
            <a class="soc" href="https://wa.me/558189963849" target="_blank" title="WhatsApp">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
            </a>
          </div>
        </div>
        <div>
          <div class="foot-nav-title">Serviços</div>
          <ul class="foot-nav">
            <li><a href="#servicos">Speed Landing</a></li>
            <li><a href="#servicos">Brand UI/UX</a></li>
            <li><a href="#servicos">E-Commerce Turbo</a></li>
            <li><a href="#contato">Briefing Grátis</a></li>
          </ul>
        </div>
        <div>
          <div class="foot-nav-title">Empresa</div>
          <ul class="foot-nav">
            <li><a href="#metodo">Nosso Método</a></li>
            <li><a href="#dispositivos">Responsividade</a></li>
            <li><a href="#depoimentos">Depoimentos</a></li>
            <li><a href="#faq">FAQ</a></li>
            <li><a href="#contato">Contato</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© 2026 Vision Web. Todos os direitos reservados.</span>
        <span>Feito com dedicação em Pernambuco, Brasil</span>
      </div>
    </div>
  </footer>

  <script>
    /* ---- LOADER ---- */
    let pct = 0;
    const loaderPctEl = document.getElementById('loaderPct');
    const pctInt = setInterval(() => {
      pct = Math.min(pct + Math.random() * 18, 99);
      loaderPctEl.textContent = 'Iniciando... ' + Math.round(pct) + '%';
    }, 110);
    window.addEventListener('load', () => {
      clearInterval(pctInt);
      loaderPctEl.textContent = 'Iniciando... 100%';
      setTimeout(() => document.getElementById('loader').classList.add('out'), 900);
    });

    /* ---- LOGO FALLBACK ---- */
    document.getElementById('logoImg').addEventListener('error', function(){
      this.style.display='none';
      document.getElementById('logoFallback').style.display='block';
    });
    document.getElementById('footerLogoImg').addEventListener('error', function(){
      this.style.display='none';
      document.getElementById('footerBrandFallback').style.display='block';
    });

    /* ---- PARTICLES ---- */
    (function createParticles(){
      const container = document.getElementById('heroParticles');
      if(!container) return;
      for(let i=0; i<22; i++){
        const p = document.createElement('div');
        p.className = 'particle';
        const size = Math.random()*3 + 1;
        const left = Math.random()*100;
        const delay = Math.random()*12;
        const dur = Math.random()*10 + 8;
        p.style.cssText = `
          width:${size}px;height:${size}px;
          left:${left}%;bottom:-10px;
          opacity:${Math.random()*0.5+0.1};
          animation: particleFloat ${dur}s linear ${delay}s infinite;
          background: ${Math.random()>0.5?'rgba(61,111,255,0.8)':'rgba(255,255,255,0.4)'};
        `;
        container.appendChild(p);
      }
    })();

    /* ---- CUSTOM CURSOR ---- */
    const ring = document.getElementById('cRing');
    const dot = document.getElementById('cDot');
    let rx=0, ry=0, mx=0, my=0;
    document.addEventListener('mousemove', e => {
      mx=e.clientX; my=e.clientY;
      dot.style.left=mx+'px'; dot.style.top=my+'px';
    });
    (function track(){
      rx+=(mx-rx)*.1; ry+=(my-ry)*.1;
      ring.style.left=rx+'px'; ring.style.top=ry+'px';
      requestAnimationFrame(track);
    })();
    document.querySelectorAll('a,button,.s-card,.t-card,.t-card-mini,.p-card,.step,.proc-dot,.hstat,.stat-block,.faq-q,.why-point,.tech-item').forEach(el => {
      el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
      el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
    });
    document.querySelectorAll('input,textarea,select').forEach(el => {
      el.addEventListener('focus', () => document.body.classList.add('cursor-text'));
      el.addEventListener('blur', () => document.body.classList.remove('cursor-text'));
    });

    /* ---- SCROLL PROGRESS + NAVBAR ---- */
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      const total = document.body.scrollHeight - window.innerHeight;
      document.getElementById('scrollProgress').style.width = (scrolled / total * 100) + '%';
      document.getElementById('navbar').classList.toggle('scrolled', scrolled > 60);
    });

    /* ---- MOBILE MENU ---- */
    let mobOpen = false;
    function toggleMob(){
      mobOpen = !mobOpen;
      document.getElementById('mobileMenu').classList.toggle('open', mobOpen);
      document.getElementById('hamburger').classList.toggle('open', mobOpen);
    }
    function closeMob(){
      mobOpen = false;
      document.getElementById('mobileMenu').classList.remove('open');
      document.getElementById('hamburger').classList.remove('open');
    }

    /* ---- SCROLL REVEAL ---- */
    const ro = new IntersectionObserver((entries) => {
      entries.forEach(e => { if(e.isIntersecting) e.target.classList.add('vis'); });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });
    document.querySelectorAll('.reveal,.reveal-l,.reveal-r').forEach(el => ro.observe(el));

    /* ---- COUNTER ANIMATION ---- */
    function countUp(el){
      const target = +el.dataset.count;
      const sfx = el.dataset.sfx || '';
      const dur = 2000; const fps = 60;
      const step = target / (dur / (1000/fps));
      let cur = 0;
      const t = setInterval(() => {
        cur = Math.min(cur+step, target);
        el.textContent = Math.round(cur) + sfx;
        if(cur >= target) clearInterval(t);
      }, 1000/fps);
    }
    const co = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if(e.isIntersecting && !e.target.dataset.counted){
          e.target.dataset.counted = '1'; countUp(e.target);
        }
      });
    }, { threshold: 0.4 });
    document.querySelectorAll('[data-count]').forEach(el => co.observe(el));

    /* ---- SKILL BARS ---- */
    const skillObs = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if(e.isIntersecting){
          e.target.style.transform = 'scaleX(' + e.target.dataset.width + ')';
        }
      });
    }, { threshold: 0.4 });
    document.querySelectorAll('.skill-bar-fill').forEach(el => skillObs.observe(el));

    /* ---- FAQ ---- */
    function toggleFaq(btn){
      const a = btn.nextElementSibling;
      const open = btn.classList.contains('open');
      document.querySelectorAll('.faq-q.open').forEach(q => {
        q.classList.remove('open'); q.nextElementSibling.style.maxHeight = '0';
      });
      if(!open){ btn.classList.add('open'); a.style.maxHeight = a.scrollHeight+'px'; }
    }

    /* ---- PROCESS STEPS ---- */
    const steps = document.querySelectorAll('.step');
    const pcNum = document.getElementById('pcNum');
    const pcTitle = document.getElementById('pcTitle');
    const pcHint = document.getElementById('pcHint');
    const procDots = document.querySelectorAll('.proc-dot');
    let curStep = 0;
    function setStep(i){
      steps[curStep].classList.remove('active');
      procDots[curStep].classList.remove('active');
      curStep = i;
      const s = steps[i];
      s.classList.add('active'); procDots[i].classList.add('active');
      const fade = el => {
        el.style.opacity=0;
        setTimeout(()=>{
          el.textContent = s.dataset[el===pcNum?'n':el===pcTitle?'t':'h'];
          el.style.opacity=1;
        }, 240);
      };
      pcNum.style.transition = pcTitle.style.transition = pcHint.style.transition = 'opacity .24s';
      fade(pcNum); fade(pcTitle); fade(pcHint);
    }
    steps.forEach((s,i) => s.addEventListener('click', () => { clearInterval(autoStep); setStep(i); }));
    procDots.forEach((d,i) => d.addEventListener('click', () => { clearInterval(autoStep); setStep(i); }));
    let autoStep = setInterval(() => setStep((curStep+1)%4), 3500);
    setStep(0);

    /* ---- SMOOTH SCROLL ---- */
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const t = document.querySelector(a.getAttribute('href'));
        if(t){ e.preventDefault(); t.scrollIntoView({behavior:'smooth',block:'start'}); closeMob(); }
      });
    });

    /* ---- DEVICE TILT ---- */
    const laptopEl = document.getElementById('deviceLaptop');
    if(laptopEl && window.innerWidth > 768){
      document.addEventListener('mousemove', e => {
        const rect = laptopEl.getBoundingClientRect();
        if(rect.top > window.innerHeight || rect.bottom < 0) return;
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const dx = (e.clientX - cx) / window.innerWidth * 10;
        const dy = (e.clientY - cy) / window.innerHeight * 10;
        laptopEl.style.transform = `perspective(1200px) rotateY(${dx}deg) rotateX(${-dy}deg)`;
      });
    }

    /* ---- 3D CARD TILT ---- */
    document.querySelectorAll('.s-card').forEach(card => {
      card.addEventListener('mousemove', e => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const cx = rect.width / 2;
        const cy = rect.height / 2;
        const rotX = ((y - cy) / cy) * -5;
        const rotY = ((x - cx) / cx) * 5;
        card.style.transform = `perspective(1000px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateZ(4px)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });

    /* ---- FORM: ENVIA DADOS PARA WHATSAPP ---- */
    function enviarProposta(){
      const objetivo  = document.getElementById('fObjetivo').value;
      const nome      = document.getElementById('fNome').value.trim();
      const empresa   = document.getElementById('fEmpresa').value.trim();
      const email     = document.getElementById('fEmail').value.trim();
      const telefone  = document.getElementById('fTelefone').value.trim();
      const segmento  = document.getElementById('fSegmento').value;
      const orcamento = document.getElementById('fOrcamento').value;
      const mensagem  = document.getElementById('fMensagem').value.trim();

      // Clear previous errors
      document.querySelectorAll('.fc.error').forEach(el => el.classList.remove('error'));

      let valid = true;
      if (!objetivo)  { document.getElementById('fObjetivo').classList.add('error');  valid = false; }
      if (!nome)      { document.getElementById('fNome').classList.add('error');       valid = false; }
      if (!email)     { document.getElementById('fEmail').classList.add('error');      valid = false; }
      if (!telefone)  { document.getElementById('fTelefone').classList.add('error');   valid = false; }

      if (!valid){
        const fc = document.getElementById('formCard');
        fc.classList.add('shake');
        setTimeout(() => fc.classList.remove('shake'), 600);
        const firstErr = document.querySelector('.fc.error');
        if(firstErr) firstErr.scrollIntoView({behavior:'smooth', block:'center'});
        return;
      }

      const texto =
`🚀 *NOVA PROPOSTA — Vision Web* 🚀

━━━━━━━━━━━━━━━━━━━━━
👤 *DADOS DO CLIENTE*
━━━━━━━━━━━━━━━━━━━━━
📛 *Nome:* ${nome}
🏢 *Empresa:* ${empresa || '(não informado)'}
📧 *E-mail:* ${email}
📱 *WhatsApp:* ${telefone}

━━━━━━━━━━━━━━━━━━━━━
🎯 *DETALHES DO PROJETO*
━━━━━━━━━━━━━━━━━━━━━
🔥 *Objetivo:* ${objetivo}
📊 *Segmento:* ${segmento || '(não informado)'}
💰 *Orçamento:* ${orcamento || '(não informado)'}

━━━━━━━━━━━━━━━━━━━━━
💬 *MENSAGEM DO CLIENTE*
━━━━━━━━━━━━━━━━━━━━━
${mensagem || '(sem mensagem adicional)'}

━━━━━━━━━━━━━━━━━━━━━
🌐 _Enviado pelo site Vision Web_
⏰ _${new Date().toLocaleString('pt-BR')}_`;

      window.open('https://wa.me/558189963849?text=' + encodeURIComponent(texto), '_blank');
    }
  </script>
</body>
</html
