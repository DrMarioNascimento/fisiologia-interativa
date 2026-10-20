/* Floating 3D tutor (anatomical bust) for the site and Moodle tutors. The shared header is intentionally untouched.
   Keeps the original "coin" names (tutorEFCoin, .tutor-coin) so tutor-widget.js needs no change. */
(function () {
  'use strict';
  const isMoodle = location.pathname.endsWith('/tutor-moodle.html');
  const isFisio = location.pathname.includes('/fisioterapia/') || location.pathname.endsWith('/tutor-fisio.html') ||
    new URLSearchParams(location.search).get('percurso') === 'fisioterapia';
  const positionKey = isMoodle ? (isFisio ? 'tutorMoodleFisioPosition' : 'tutorMoodleEFPosition') : (isFisio ? 'tutorFisioPosition' : 'tutorEFPosition');
  const soundKey = isMoodle ? (isFisio ? 'tutorMoodleFisioSound' : 'tutorMoodleEFSound') : (isFisio ? 'tutorFisioCoinSound' : 'tutorEFCoinSound');
  const base = new URL('.', document.currentScript.src);
  const href = path => new URL(path, base).href;
  const read = key => { try { return localStorage.getItem(key); } catch (_) { return null; } };
  const save = (key, value) => { try { localStorage.setItem(key, value); } catch (_) {} };

  window.tutorEFCoin = { attach(btn, toggle, placePanel) {
    if (btn.dataset.tutorBustAttached) return;
    btn.dataset.tutorBustAttached = 'true';
    btn.classList.add('tutor-coin');
    btn.title = 'Clique para abrir o tutor. Arraste para mover.';
    const portrait = btn.querySelector('.tutor-portrait');
    portrait.innerHTML = '<img class="tutor-coin-poster" src="' + href('assets/tutor/tutor-ia-poster.webp') + '" alt="" draggable="false">';
    btn.querySelector('.tutor-badge').setAttribute('aria-hidden', 'true');
    let pointer = null, suppressClick = false;
    const clamp = (n, max) => Math.max(6, Math.min(Math.max(6, max), n));
    function position(left, top, persist = false) {
      left = clamp(left, innerWidth - btn.offsetWidth - 6);
      top = clamp(top, innerHeight - btn.offsetHeight - 6);
      Object.assign(btn.style, { left: left + 'px', top: top + 'px', right: 'auto', bottom: 'auto' });
      if (persist) save(positionKey, JSON.stringify({ left, top }));
      placePanel();
    }
    try {
      const p = JSON.parse(read(positionKey));
      if (p && Number.isFinite(p.left) && Number.isFinite(p.top)) position(p.left, p.top);
    } catch (_) {}
    btn.addEventListener('pointerdown', e => {
      if (pointer || !e.isPrimary || e.button !== 0) return;
      pointer = { id: e.pointerId, x: e.clientX, y: e.clientY, left: btn.offsetLeft, top: btn.offsetTop, moved: false };
      suppressClick = false;
      btn.setPointerCapture(e.pointerId);
    });
    btn.addEventListener('pointermove', e => {
      if (!pointer || pointer.id !== e.pointerId) return;
      const dx = e.clientX - pointer.x, dy = e.clientY - pointer.y;
      if (Math.hypot(dx, dy) > 6) pointer.moved = true;
      if (!pointer.moved) return;
      btn.classList.add('is-dragging');
      position(pointer.left + dx, pointer.top + dy);
    });
    const finish = (e, cancelled) => {
      if (!pointer || pointer.id !== e.pointerId) return;
      suppressClick = cancelled || pointer.moved;
      if (pointer.moved) position(btn.offsetLeft, btn.offsetTop, true);
      pointer = null;
      btn.classList.remove('is-dragging');
      if (btn.hasPointerCapture(e.pointerId)) btn.releasePointerCapture(e.pointerId);
    };
    btn.addEventListener('pointerup', e => finish(e, false));
    btn.addEventListener('pointercancel', e => finish(e, true));
    btn.addEventListener('lostpointercapture', e => finish(e, true));
    btn.addEventListener('click', e => {
      // A keyboard click has detail=0 and must work even after dragging.
      if (suppressClick && e.detail !== 0) { suppressClick = false; return; }
      suppressClick = false;
      toggle();
    });
    // Keyboard alternative to dragging: Alt + arrow keys.
    btn.addEventListener('keydown', e => {
      if (!e.altKey || !['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
      e.preventDefault();
      const dx = e.key === 'ArrowLeft' ? -20 : e.key === 'ArrowRight' ? 20 : 0;
      const dy = e.key === 'ArrowUp' ? -20 : e.key === 'ArrowDown' ? 20 : 0;
      position(btn.offsetLeft + dx, btn.offsetTop + dy, true);
    });
    window.addEventListener('resize', () => position(btn.offsetLeft, btn.offsetTop));

    let sound = read(soundKey) !== 'off', audio, lastSound = 0; // som ligado por padrão
    const soundBtn = document.createElement('button');
    soundBtn.type = 'button'; soundBtn.className = 'tutor-coin-sound';
    const updateSound = () => {
      soundBtn.textContent = sound ? 'Som ligado' : 'Som desligado';
      soundBtn.setAttribute('aria-pressed', String(sound));
      soundBtn.setAttribute('aria-label', sound ? 'Desativar sons do tutor' : 'Ativar sons do tutor');
    };
    updateSound();
    document.querySelector('.tutor-head, .chat .head').insertBefore(soundBtn, document.querySelector('.tutor-close'));
    // Safari/iPhone só libera áudio criado e "destravado" dentro de um toque do usuário.
    const unlock = () => {
      try {
        const Audio = window.AudioContext || window.webkitAudioContext;
        if (!Audio) return;
        audio ||= new Audio();
        if (audio.state !== 'running') {
          const b = audio.createBuffer(1, 1, 22050), s = audio.createBufferSource();
          s.buffer = b; s.connect(audio.destination); s.start(0);
          void audio.resume().catch(() => {});
        }
      } catch (_) {}
    };
    ['pointerdown', 'touchend', 'keydown'].forEach(ev => document.addEventListener(ev, unlock, { capture: true, passive: true }));
    function note(frequency, t, dur, type, vol) {
      const oscillator = audio.createOscillator(), gain = audio.createGain();
      oscillator.type = type; oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(0, t); gain.gain.linearRampToValueAtTime(vol, t + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      oscillator.connect(gain); gain.connect(audio.destination); oscillator.start(t); oscillator.stop(t + dur + 0.01);
      oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
    }
    function tone(kind) {
      if (!sound || document.hidden || performance.now() - lastSound < 150) return;
      try {
        const Audio = window.AudioContext || window.webkitAudioContext;
        if (!Audio) return;
        audio ||= new Audio();
        void audio.resume().catch(() => {});
        lastSound = performance.now();
        const t0 = audio.currentTime;
        if (kind === 'open') {
          // "fiuuu" ascendente acompanhando o giro, depois um "plim"
          const o = audio.createOscillator(), g = audio.createGain();
          o.type = 'triangle'; o.frequency.setValueAtTime(300, t0); o.frequency.exponentialRampToValueAtTime(1100, t0 + 0.35);
          g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(0.16, t0 + 0.05); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.4);
          o.connect(g); g.connect(audio.destination); o.start(t0); o.stop(t0 + 0.42);
          o.onended = () => { o.disconnect(); g.disconnect(); };
          note(1318.5, t0 + 0.36, 0.5, 'sine', 0.14); note(1975.5, t0 + 0.36, 0.6, 'sine', 0.06);
          return;
        }
        const notes = kind === 'correct' ? [660, 880] : kind === 'wrong' ? [330] : [620];
        notes.forEach((frequency, i) => note(frequency, t0 + i * 0.09, 0.18, 'sine', 0.12));
      } catch (_) {}
    }
    soundBtn.addEventListener('click', () => { sound = !sound; save(soundKey, sound ? 'on' : 'off'); updateSound(); if (sound) tone('tab'); });

    let animate = () => {};
    let reactionTimer;
    const react = kind => {
      clearTimeout(reactionTimer);
      btn.dataset.reaction = kind;
      reactionTimer = setTimeout(() => { delete btn.dataset.reaction; }, 950);
      animate(kind); tone(kind);
    };
    new MutationObserver(() => react(btn.getAttribute('aria-expanded') === 'true' ? 'open' : 'tab'))
      .observe(btn, { attributes: true, attributeFilter: ['aria-expanded'] });
    document.addEventListener('click', e => {
      const el = e.target.closest?.('button, a'); if (!el || el.disabled && !el.matches('.tutor-option,.opts button')) return;
      if (el.matches('.tutor-option')) react(el.classList.contains('wrong') ? 'wrong' : 'correct');
      else if (el.matches('.opts button')) react(el.classList.contains('ok') ? 'correct' : 'wrong');
      else if (el.matches('.axis,[data-map],[data-open],.tutor-chip,.tutor-next,[data-tutor-action],.chip,.ai button')) react('tab');
    });
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    init3D().catch(() => { btn.dataset.coinState = 'fallback'; });
    async function init3D() {
      const THREE = await import(href('ra/celula/visualizador/vendor/three.module.js'));
      const { GLTFLoader } = await import(href('ra/celula/visualizador/vendor/GLTFLoader.js'));
      const { RoomEnvironment } = await import(href('assets/tutor/RoomEnvironment.js'));
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
      renderer.setClearColor(0, 0); renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(30, 1, 0.1, 20);
      camera.position.z = 3.9;
      // The bust is metallic: it needs an environment map to look silver instead of dark.
      const pmrem = new THREE.PMREMGenerator(renderer);
      scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
      pmrem.dispose();
      const gltf = await new GLTFLoader().loadAsync(href('assets/tutor/tutor-ia.glb'));
      const bust = new THREE.Group();
      const center = new THREE.Box3().setFromObject(gltf.scene).getCenter(new THREE.Vector3());
      gltf.scene.position.sub(center);
      bust.add(gltf.scene); scene.add(bust);
      const canvas = renderer.domElement;
      canvas.setAttribute('aria-hidden', 'true'); canvas.className = 'tutor-coin-canvas';
      portrait.appendChild(canvas);

      let frame = 0, start = 0, kind = '', idle0 = performance.now();
      const ease = x => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
      const durations = { open: 1100, correct: 650, wrong: 600, tab: 450 };
      function pose(now) {
        // Idle: slow side-to-side turn and "breathing".
        const s = (now - idle0) / 1000, calm = media.matches;
        bust.rotation.set(0, calm ? 0 : Math.sin(s * 0.6) * 0.22, 0);
        bust.position.y = calm ? 0 : Math.sin(s * 1.4) * 0.025;
        if (!kind) return;
        const t = Math.min(1, (now - start) / durations[kind]), pulse = Math.sin(Math.PI * t);
        if (kind === 'open') { bust.rotation.y += Math.PI * 2 * ease(t); bust.position.y += pulse * 0.14; }
        else if (kind === 'correct') { bust.position.y += Math.abs(Math.sin(t * Math.PI * 2)) * (1 - t) * 0.16; bust.rotation.y += pulse * 0.35; }
        else if (kind === 'wrong') bust.rotation.y += Math.sin(t * Math.PI * 6) * (1 - t) * 0.35; // "não" com a cabeça
        else bust.rotation.x = pulse * 0.12; // aceno
        if (t >= 1) kind = '';
      }
      const draw = now => { pose(now); renderer.render(scene, camera); };
      function tick(now) {
        frame = 0;
        if (document.hidden) return;
        draw(now);
        if (!media.matches || kind) frame = requestAnimationFrame(tick);
      }
      const run = () => { if (!frame && !document.hidden) frame = requestAnimationFrame(tick); };
      animate = next => {
        if (document.hidden || pointer?.moved || media.matches) return;
        kind = next; start = performance.now(); run();
      };
      const resize = () => {
        const w = portrait.clientWidth, h = portrait.clientHeight; if (!w || !h) return;
        renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); draw(performance.now());
      };
      new ResizeObserver(resize).observe(portrait);
      media.addEventListener('change', () => { kind = ''; run(); });
      document.addEventListener('visibilitychange', () => { if (!document.hidden) run(); });
      canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); cancelAnimationFrame(frame); frame = 0; btn.classList.remove('coin-ready'); btn.dataset.coinState = 'fallback'; });
      canvas.addEventListener('webglcontextrestored', () => { draw(performance.now()); run(); btn.classList.add('coin-ready'); btn.dataset.coinState = 'ready'; });
      resize(); btn.classList.add('coin-ready'); btn.dataset.coinState = 'ready';
      if (!media.matches) { kind = 'open'; start = performance.now(); } // giro de boas-vindas (sem som)
      run();
    }
  }};
})();
