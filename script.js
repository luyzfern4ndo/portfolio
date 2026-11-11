/* =========================================================
   LUIZ FERNANDO TAVARES — PORTFOLIO · interações
   ========================================================= */
(() => {
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  /* weaker machines (<=4 cores or <=4 GB): lighter effects */
  const lite = (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4;
  if (lite) document.documentElement.classList.add('lite');
  const fine = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGSAP = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined';

  /* ---------- small utilities that don't need GSAP ---------- */
  // relógio (horário de Brasília)
  const clock = $('#clock');
  const tick = () => {
    if (!clock) return;
    clock.textContent = new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' }).format(new Date()) + ' BRT';
  };
  tick(); setInterval(tick, 15000);
  // pause infinite CSS animations of sections that are off screen
  if ('IntersectionObserver' in window) { const pio = new IntersectionObserver(es => es.forEach(e => e.target.classList.toggle('off-screen', !e.isIntersecting)), { rootMargin: '100px 0px' }); $$('section, .hero, footer').forEach(el => pio.observe(el)); }

  // copiar e-mail
  const toast = $('#toast');
  $$('[data-copy]').forEach(a => a.addEventListener('click', e => {
    if (!navigator.clipboard) return;
    e.preventDefault();
    navigator.clipboard.writeText(a.dataset.copy).then(() => {
      toast.classList.add('is-on');
      setTimeout(() => toast.classList.remove('is-on'), 2200);
    }).catch(() => { location.href = a.href; });
  }));

  // menu mobile
  const burger = $('#burger');
  const setMenu = open => {
    document.body.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', open);
    $('#menu').setAttribute('aria-hidden', !open);
    if (window.__lenis) open ? window.__lenis.stop() : window.__lenis.start();
  };
  burger.addEventListener('click', () => setMenu(!document.body.classList.contains('menu-open')));
  $$('#menu a').forEach(a => a.addEventListener('click', () => setMenu(false)));

  // projetos sem link real ainda: evita pular para o topo
  $$('.proj__link').forEach(a => a.addEventListener('click', e => { if (a.getAttribute('href') === '#') e.preventDefault(); }));

  /* ---------- fallback sem GSAP: mostra tudo ---------- */
  if (!hasGSAP) {
    $('#loader').remove();
    document.body.classList.remove('is-loading');
    $$('[data-count]').forEach(el => el.textContent = el.dataset.count);
    $$('.manifesto__text').forEach(el => el.style.opacity = 1);
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  document.body.classList.add('is-loading');

  /* ---------- smooth scroll (Lenis) ---------- */
  let lenis = null;
  if (!reduce && !lite && fine && typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({ duration: 1.15, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothWheel: true });
    window.__lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
    lenis.stop();
  }
  // âncoras
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (id.length < 2) return;
    const target = $(id);
    if (!target) return;
    e.preventDefault();
    if (lenis) lenis.scrollTo(target, { offset: 0, duration: 1.6 });
    else target.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  }));

  /* ---------- helpers ---------- */
  const splitWords = el => {
    // divide apenas nós de texto em palavras, preservando <em>, .pill etc.
    const walk = node => {
      [...node.childNodes].forEach(n => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          n.textContent.split(/(\s+)/).forEach(part => {
            if (!part) return;
            if (/^\s+$/.test(part)) frag.appendChild(document.createTextNode(' '));
            else { const s = document.createElement('span'); s.className = 'w'; s.textContent = part; frag.appendChild(s); }
          });
          n.replaceWith(frag);
        } else if (n.nodeType === 1 && n.classList.contains('pill')) {
          n.classList.add('w');
        } else if (n.nodeType === 1) walk(n);
      });
    };
    walk(el);
    return $$('.w', el);
  };

  /* ---------- initial states ---------- */
  const giantLetters = $$('.giant-row > span');
  gsap.set(giantLetters, { yPercent: 105 });
  gsap.set('.hero__img-wrap', { yPercent: 18, opacity: 0, scale: 1.04, transformOrigin: '50% 100%' });
  gsap.set('.hero__ring', { opacity: 0, scale: .7 });
  gsap.set('.hero .line > span', { yPercent: 110 });
  gsap.set('.hello', { opacity: 0, x: -20 });
  gsap.set('.hero .reveal-up', { opacity: 0, y: 24 });
  gsap.set('.hero__badge', { scale: 0, rotate: -120 });
  gsap.set('.nav', { yPercent: -120 });
  gsap.set('.cross', { scale: 0 });

  /* ---------- PRELOADER ---------- */
  const countEl = $('#loaderCount');
  const barEl = $('#loaderBar');
  const imgs = $$('img').filter(i => i.loading !== 'lazy');
  let loaded = 0;
  const total = Math.max(imgs.length, 1);
  const prog = { v: 0 };
  const target = { v: 0 };
  const onImg = () => { loaded++; target.v = loaded / total; };
  imgs.forEach(i => (i.complete ? onImg() : (i.addEventListener('load', onImg), i.addEventListener('error', onImg))));
  if (!imgs.length) target.v = 1;

  const loaderTl = gsap.timeline({ paused: true });
  loaderTl.from('.loader__mark span', { yPercent: 100, duration: .9, stagger: .08, ease: 'expo.out' })
          .from('.loader__name', { opacity: 0, letterSpacing: '1em', duration: 1, ease: 'expo.out' }, '<.2');
  loaderTl.play();

  const minTime = reduce ? 200 : 1500;
  const t0 = performance.now();
  const loop = () => {
    const elapsed = performance.now() - t0;
    // progresso guiado pelo tempo (suave mesmo se o rAF for limitado) e travado pelo carregamento real
    const cap = 1 - Math.pow(1 - Math.min(1, elapsed / minTime), 3);
    prog.v = Math.max(prog.v, Math.min(target.v, cap));
    const pct = Math.round(prog.v * 100);
    countEl.textContent = String(pct).padStart(3, '0');
    barEl.style.transform = `scaleX(${prog.v})`;
    if (prog.v < 1) requestAnimationFrame(loop);
    else finishLoading();
  };
  // segurança: nunca prende mais que 3,5s
  setTimeout(() => { target.v = 1; }, 3500);
  requestAnimationFrame(loop);

  function finishLoading() {
    const tl = gsap.timeline({
      onComplete: () => {
        $('#loader').remove();
        document.body.classList.remove('is-loading');
        lenis && lenis.start();
        ScrollTrigger.refresh();
      }
    });
    tl.to('.loader__mark span, .loader__name, .loader__top, .loader__bottom', { yPercent: -100, opacity: 0, duration: .6, stagger: .04, ease: 'power3.in' })
      .to('#loader', { clipPath: 'inset(0 0 100% 0)', duration: 1.05, ease: 'expo.inOut' }, '-=.15')
      .add(heroIntro(), '-=.55');
  }

  function heroIntro() {
    const tl = gsap.timeline();
    tl.to(giantLetters, { yPercent: 0, duration: 1.3, stagger: { each: .055, from: 'center' }, ease: 'expo.out' })
      .to('.hero__img-wrap', { yPercent: 0, opacity: 1, scale: 1, duration: 1.6, ease: 'expo.out' }, '<.15')
      .to('.hero__ring', { opacity: .6, scale: 1, duration: 2, ease: 'expo.out' }, '<.1')
      .to('.nav', { yPercent: 0, duration: 1, ease: 'expo.out' }, '<.3')
      .to('.hello', { opacity: 1, x: 0, duration: 1, ease: 'expo.out' }, '<.1')
      .to('.hero .line > span', { yPercent: 0, duration: 1.1, stagger: .08, ease: 'expo.out' }, '<.05')
      .to('.hero .reveal-up', { opacity: 1, y: 0, duration: 1, stagger: .06, ease: 'expo.out' }, '<.25')
      .to('.hero__badge', { scale: 1, rotate: 0, duration: 1.4, ease: 'elastic.out(1,.6)' }, '<')
      .to('.cross', { scale: 1, duration: .8, stagger: .1, ease: 'back.out(3)' }, '<.2')
      .add(() => countUp($$('.hero [data-count]')), '<');
    return tl;
  }

  function countUp(els) {
    els.forEach(el => {
      const o = { v: 0 };
      gsap.to(o, { v: +el.dataset.count, duration: 2, ease: 'power3.out', onUpdate: () => el.textContent = Math.round(o.v) });
    });
  }

  /* ---------- CURSOR ---------- */
  if (fine && !reduce) {
    document.documentElement.classList.add('has-cursor');
    const cursor = $('.cursor');
    const dot = $('.cursor__dot'), ring = $('.cursor__ring'), label = $('.cursor__label');
    const dx = gsap.quickTo(dot, 'x', { duration: .08 }), dy = gsap.quickTo(dot, 'y', { duration: .08 });
    const rx = gsap.quickTo(ring, 'x', { duration: .45, ease: 'power3' }), ry = gsap.quickTo(ring, 'y', { duration: .45, ease: 'power3' });
    addEventListener('pointermove', e => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); }, { passive: true });
    addEventListener('pointerdown', () => cursor.classList.add('is-down'));
    addEventListener('pointerup', () => cursor.classList.remove('is-down'));
    document.addEventListener('pointerover', e => {
      const lab = e.target.closest('[data-cursor]');
      const link = e.target.closest('a, button, .skills span');
      if (lab) { label.textContent = lab.dataset.cursor; cursor.classList.add('is-label'); cursor.classList.remove('is-hover'); }
      else { cursor.classList.remove('is-label'); cursor.classList.toggle('is-hover', !!link); }
    });
    document.addEventListener('pointerleave', () => gsap.to(cursor, { opacity: 0, duration: .3 }));
    document.addEventListener('pointerenter', () => gsap.to(cursor, { opacity: 1, duration: .3 }));
  }

  /* ---------- MAGNETIC ---------- */
  if (fine && !reduce) {
    $$('[data-magnetic]').forEach(el => {
      const strength = el.classList.contains('cta-orb') ? .45 : .3;
      const xTo = gsap.quickTo(el, 'x', { duration: .8, ease: 'elastic.out(1,.4)' });
      const yTo = gsap.quickTo(el, 'y', { duration: .8, ease: 'elastic.out(1,.4)' });
      el.addEventListener('pointermove', e => {
        const r = el.getBoundingClientRect();
        xTo((e.clientX - r.left - r.width / 2) * strength);
        yTo((e.clientY - r.top - r.height / 2) * strength);
      });
      el.addEventListener('pointerleave', () => { xTo(0); yTo(0); });
    });
  }

  /* ---------- SCRAMBLE nos links ---------- */
  const glyphs = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&*+=/<>';
  $$('[data-scramble]').forEach(el => {
    const original = el.textContent;
    let raf;
    el.addEventListener('pointerenter', () => {
      let frame = 0;
      cancelAnimationFrame(raf);
      const run = () => {
        el.textContent = original.split('').map((c, i) => i < frame / 2 ? original[i] : glyphs[Math.floor(Math.random() * glyphs.length)]).join('');
        frame++;
        if (frame / 2 <= original.length) raf = requestAnimationFrame(run); else el.textContent = original;
      };
      run();
    });
  });

  /* ---------- NAV: esconde/mostra + ativo ---------- */
  const nav = $('#nav');
  let lastY = 0;
  ScrollTrigger.create({
    start: 0, end: 'max',
    onUpdate: self => {
      const y = self.scroll();
      nav.classList.toggle('is-scrolled', y > 40);
      if (!document.body.classList.contains('menu-open')) nav.classList.toggle('is-hidden', y > lastY && y > 400);
      lastY = y;
      gsap.set('.progress i', { scaleX: self.progress });
    }
  });

  /* ---------- HERO: mouse parallax + luz ---------- */
  const hero = $('#hero');
  const coord = $('#coord');
  if (fine && !reduce) {
    const gX = gsap.quickTo('.hero__giant', 'x', { duration: 1.2, ease: 'power3' });
    const pX = gsap.quickTo('#heroPhoto', 'x', { duration: 1.2, ease: 'power3' });
    const pR = gsap.quickTo('.hero__img-wrap', 'rotateY', { duration: 1.2, ease: 'power3' });
    const glX = gsap.quickTo('.hero__glow', 'x', { duration: 1.6, ease: 'power3' });
    const glY = gsap.quickTo('.hero__glow', 'y', { duration: 1.6, ease: 'power3' });
    const rim = $('.hero__rim');
    gsap.set('.hero__img-wrap', { transformPerspective: 1200 });
    let hr = null, pe = null, pq = false;
    const heroRect = () => { hr = hero.getBoundingClientRect(); };
    addEventListener('resize', () => { hr = null; }, { passive: true });
    addEventListener('scroll', () => { hr = null; }, { passive: true });
    hero.addEventListener('pointermove', e => { pe = e; if (!pq) { pq = true; requestAnimationFrame(heroMove); } });
    function heroMove() {
      pq = false; const e = pe; if (!hr) heroRect(); const r = hr;
      const nx = (e.clientX - r.left) / r.width - .5;
      const ny = (e.clientY - r.top) / r.height - .5;
      gX(nx * -40);
      pX(nx * 26);
      pR(nx * 6);
      glX(nx * 160); glY(ny * 120);
      // luz de recorte acompanha o cursor
      const ang = Math.atan2(ny, nx) * 180 / Math.PI + 90;
      if (!lite) rim.style.setProperty('--rim-a', `${(ang + 180).toFixed(0)}deg`);
      coord.textContent = `X ${String(Math.round(e.clientX)).padStart(4, '0')} · Y ${String(Math.round(e.clientY)).padStart(4, '0')}`;
    }
  }

  /* ---------- HERO: scroll out ---------- */
  if (!reduce) {
    const heroOut = gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
    heroOut.to('.hero__giant', { yPercent: 40, scale: 1.12, opacity: .2, ease: 'none' }, 0)
           .to('#heroPhoto', { yPercent: 12, ease: 'none' }, 0)
           .to('.hero__intro', { yPercent: -30, opacity: 0, ease: 'none' }, 0)
           .to('.hero__side', { yPercent: -50, opacity: 0, ease: 'none' }, 0);
    // separa as letras do PORTFOLIO
    giantLetters.forEach((l, i) => {
      const c = (i - (giantLetters.length - 1) / 2);
      heroOut.to(l, { x: c * 18, ease: 'none' }, 0);
    });
  }

  /* ---------- HERO CANVAS: grid de pontos ---------- */
  (() => {
    const cv = $('#heroCanvas');
    const ctx = cv.getContext('2d');
    let w, h, dpr, pts = [], mx = -999, my = -999, running = true;
    const GAP = 30;
    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, lite ? 1 : 1.5);
      w = cv.clientWidth; h = cv.clientHeight;
      cv.width = w * dpr; cv.height = h * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      pts = [];
      for (let y = GAP / 2; y < h; y += GAP) for (let x = GAP / 2; x < w; x += GAP) pts.push({ x, y, ox: x, oy: y });
    };
    resize();
    addEventListener('resize', resize);
    let cr = null, lastMove = 0, last = 0, queued = false;
    addEventListener('resize', () => { cr = null; }, { passive: true });
    addEventListener('scroll', () => { cr = null; }, { passive: true });
    const wake = () => { if (running && !queued) { queued = true; requestAnimationFrame(draw); } };
    hero.addEventListener('pointermove', e => { if (!cr) cr = cv.getBoundingClientRect(); mx = e.clientX - cr.left; my = e.clientY - cr.top; lastMove = performance.now(); wake(); });
    hero.addEventListener('pointerleave', () => { mx = my = -999; lastMove = performance.now(); wake(); });
    ScrollTrigger.create({ trigger: hero, start: 'top bottom', end: 'bottom top', onToggle: s => { running = s.isActive; wake(); } });
    document.addEventListener('visibilitychange', () => { running = !document.hidden && ScrollTrigger.isInViewport(hero); wake(); });
    let t = 0;
    const BUCKETS = 10, paths = [];
    function draw(now) {
      queued = false;
      if (!running) return;
      now = now || performance.now();
      const active = now - lastMove < 1200;
      // idle: ~30fps wave (weak machines: hold still until the mouse moves)
      if (!active && (lite || now - last < 32)) { if (!lite) wake(); return; }
      t += (now - (last || now)) * .0006; last = now;
      ctx.clearRect(0, 0, w, h);
      for (let i = 0; i < BUCKETS; i++) paths[i] = new Path2D();
      const R = 170;
      for (const p of pts) {
        const dx = p.ox - mx, dy = p.oy - my, d = Math.hypot(dx, dy);
        let a = .07 + .05 * Math.sin(t + p.ox * .01 + p.oy * .013);
        let s = 1;
        if (d < R && !reduce) {
          const f = 1 - d / R;
          p.x += ((p.ox + dx / d * f * 14) - p.x) * .2;
          p.y += ((p.oy + dy / d * f * 14) - p.y) * .2;
          a += f * .75; s += f * 1.4;
        } else { p.x += (p.ox - p.x) * .1; p.y += (p.oy - p.y) * .1; }
        const b = Math.min(BUCKETS - 1, Math.round(a * BUCKETS));
        if (s < 1.3) paths[b].rect(p.x - s, p.y - s, s * 2, s * 2);
        else { paths[b].moveTo(p.x + s, p.y); paths[b].arc(p.x, p.y, s, 0, 6.283); }
      }
      for (let i = 0; i < BUCKETS; i++) { ctx.fillStyle = `rgba(110,155,255,${((i + .5) / BUCKETS).toFixed(2)})`; ctx.fill(paths[i]); }
      wake();
    }
    lastMove = performance.now(); last = 0; wake();
  })();

  /* ---------- MARQUEE com velocidade do scroll ---------- */
  (() => {
    const track = $('#marquee');
    const group = $('.marquee__group', track);
    let x = 0, dir = -1, boost = 0, gw = 0, vis = true;
    const measure = () => { gw = group.offsetWidth; };
    measure(); addEventListener('resize', measure, { passive: true }); addEventListener('load', measure);
    new IntersectionObserver(es => es.forEach(e => { vis = e.isIntersecting; })).observe(track);
    if (lenis) lenis.on('scroll', e => { boost = Math.min(Math.abs(e.velocity) * .9, 30); dir = e.direction === 1 ? -1 : 1; });
    gsap.ticker.add(() => {
      if (!gw || !vis) return;
      x += dir * (reduce ? 0 : (1 + boost));
      boost *= .92;
      if (x <= -gw) x += gw;
      if (x > 0) x -= gw;
      track.style.transform = `translate3d(${x}px,0,0)`;
    });
    gsap.fromTo('.marquee', { rotate: -4 }, { rotate: 1, ease: 'none', scrollTrigger: { trigger: '.marquee', start: 'top bottom', end: 'bottom top', scrub: true } });
  })();

  /* ---------- MANIFESTO: palavras acendem ---------- */
  const words = splitWords($('#manifestoText'));
  gsap.to(words, {
    opacity: 1, stagger: .1, ease: 'none',
    scrollTrigger: { trigger: '#manifestoText', start: 'top 80%', end: 'bottom 45%', scrub: .6 }
  });
  gsap.from('.pill', { width: 0, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '#manifestoText', start: 'top 70%' } });
  gsap.from('.manifesto__foot', { opacity: 0, y: 30, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: '.manifesto__foot', start: 'top 90%' } });

  /* ---------- títulos de seção (linhas) ---------- */
  $$('section:not(.hero) .sec-title, .contact__title').forEach(t => {
    gsap.from($$('.line > span', t), {
      yPercent: 110, rotate: 3, duration: 1.2, stagger: .1, ease: 'expo.out',
      scrollTrigger: { trigger: t, start: 'top 85%' }
    });
  });
  $$('section:not(.hero) .sec-label').forEach(l => gsap.from(l, { opacity: 0, x: -30, duration: 1, ease: 'expo.out', scrollTrigger: { trigger: l, start: 'top 90%' } }));

  /* ---------- PROJETOS ---------- */
  const mm = gsap.matchMedia();
  const track = $('#projectsTrack');
  const cards = $$('.proj', track);
  mm.add('(min-width: 901px)', () => {
    const getDist = () => Math.max(0, track.scrollWidth - window.innerWidth + track.offsetLeft + 64);
    const horiz = gsap.to(track, {
      x: () => -getDist(), ease: 'none',
      scrollTrigger: {
        trigger: '#projetos', start: 'top top', end: () => '+=' + getDist(), pin: true, scrub: 1, invalidateOnRefresh: true, anticipatePin: 1,
        onUpdate: self => {
          const idx = Math.min(4, Math.max(1, Math.round(self.progress * 4 + .5)));
          $('#projCur').textContent = String(Math.min(idx, 4)).padStart(2, '0');
        }
      }
    });
    gsap.to('.projects__head', { xPercent: -30, opacity: .15, ease: 'none', scrollTrigger: { trigger: '#projetos', start: 'top top', end: () => '+=' + window.innerWidth * .6, scrub: true } });
    // parallax interno nas imagens + entrada dos cards
    $$('.proj__shot img', track).forEach(img => {
      gsap.fromTo(img, { xPercent: -6 }, { xPercent: 6, ease: 'none', scrollTrigger: { trigger: img.closest('.proj'), containerAnimation: horiz, start: 'left right', end: 'right left', scrub: true } });
    });
    cards.forEach(card => {
      gsap.from(card, { rotate: 4, y: 60, opacity: .3, ease: 'none', scrollTrigger: { trigger: card, containerAnimation: horiz, start: 'left 95%', end: 'left 55%', scrub: true } });
    });
    return () => {};
  });
  mm.add('(max-width: 900px)', () => {
    cards.forEach(card => gsap.from(card, { y: 60, opacity: 0, duration: 1.1, ease: 'expo.out', scrollTrigger: { trigger: card, start: 'top 88%' } }));
  });

  // tilt 3D + luz nos cards
  if (fine && !reduce) {
    $$('.proj__frame').forEach(fr => {
      const rX = gsap.quickTo(fr, 'rotateX', { duration: .8, ease: 'power3' });
      const rY = gsap.quickTo(fr, 'rotateY', { duration: .8, ease: 'power3' });
      gsap.set(fr, { transformPerspective: 1400 });
      let r = null;
      fr.addEventListener('pointerenter', () => { r = fr.getBoundingClientRect(); });
      fr.addEventListener('pointermove', e => {
        if (!r) r = fr.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width, ny = (e.clientY - r.top) / r.height;
        rY((nx - .5) * 8); rX((.5 - ny) * 8);
        fr.style.setProperty('--mx', nx * 100 + '%'); fr.style.setProperty('--my', ny * 100 + '%');
      });
      fr.addEventListener('pointerleave', () => { rX(0); rY(0); r = null; });
    });
  }

  /* ---------- SERVIÇOS ---------- */
  gsap.from('.svc__row', { y: 50, opacity: 0, duration: 1, stagger: .1, ease: 'expo.out', scrollTrigger: { trigger: '.svc', start: 'top 80%' } });

  /* ---------- SKILLS / PROCESSO / QUOTE ---------- */
  gsap.from('#skills span', { y: 20, opacity: 0, scale: .9, duration: .7, stagger: .04, ease: 'back.out(2)', scrollTrigger: { trigger: '#skills', start: 'top 85%' } });
  $$('#skills span').forEach(s => s.addEventListener('pointermove', e => {
    const r = s.getBoundingClientRect();
    s.style.setProperty('--x', e.clientX - r.left + 'px'); s.style.setProperty('--y', e.clientY - r.top + 'px');
  }));
  $$('.sbar__track i').forEach(bar => gsap.fromTo(bar, { '--s': 0 }, { '--s': 1, duration: 1.6, ease: 'expo.out', scrollTrigger: { trigger: bar, start: 'top 92%' } }));

  const steps = $$('#steps li');
  gsap.fromTo('#stepsLine', { '--p': 0 }, {
    '--p': 1, ease: 'none',
    scrollTrigger: {
      trigger: '#steps', start: 'top 70%', end: 'bottom 55%', scrub: .5,
      onUpdate: self => steps.forEach((li, i) => li.classList.toggle('is-on', self.progress >= i / (steps.length - 1) - .02))
    }
  });
  gsap.from(steps, { x: -30, opacity: 0, duration: .9, stagger: .1, ease: 'expo.out', scrollTrigger: { trigger: '#steps', start: 'top 85%' } });

  gsap.from('.about__quote blockquote', { y: 40, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: '#quote', start: 'top 75%' } });
  gsap.fromTo('.quote__sign', { '--sig': '100%' }, { '--sig': '0%', duration: 2.2, ease: 'power2.inOut', scrollTrigger: { trigger: '.quote__sign', start: 'top 90%' } });
  gsap.from('.quote__mark', { scale: 0, rotate: -90, duration: 1.2, ease: 'back.out(2)', scrollTrigger: { trigger: '#quote', start: 'top 75%' } });

  /* ---------- CONTATO + FOOTER ---------- */
  gsap.from('.contact__list li', { y: 30, opacity: 0, duration: 1, stagger: .08, ease: 'expo.out', scrollTrigger: { trigger: '.contact__list', start: 'top 85%' } });
  gsap.from('.cta-orb', { scale: 0, rotate: -90, duration: 1.4, ease: 'elastic.out(1,.6)', scrollTrigger: { trigger: '.cta-orb', start: 'top 90%' } });
  gsap.from('.footer__big span', { yPercent: 100, duration: 1.4, stagger: .1, ease: 'expo.out', scrollTrigger: { trigger: '.footer', start: 'top 90%' } });

  /* ---------- link ativo no menu (criado por último para respeitar o pin) ---------- */
  $$('.nav__links a').forEach(a => {
    const sec = $(a.getAttribute('href'));
    if (!sec) return;
    ScrollTrigger.create({ trigger: sec, start: 'top 50%', end: 'bottom 50%', onToggle: s => a.classList.toggle('is-active', s.isActive) });
  });

  addEventListener('load', () => ScrollTrigger.refresh());
})();
