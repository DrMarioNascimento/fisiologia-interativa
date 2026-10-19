/* Floating coin for Tutor EF only. The shared header is intentionally untouched. */
(function () {
  'use strict';
  if (!location.pathname.endsWith('/tutor-ef.html')) return;
  const base = new URL('.', document.currentScript.src);
  const href = path => new URL(path, base).href;
  const read = key => { try { return localStorage.getItem(key); } catch (_) { return null; } };
  const save = (key, value) => { try { localStorage.setItem(key, value); } catch (_) {} };

  window.tutorEFCoin = { attach(btn, toggle, placePanel) {
    btn.classList.add('tutor-coin');
    btn.title = 'Clique para abrir o tutor. Arraste para mover.';
    const portrait = btn.querySelector('.tutor-portrait');
    portrait.innerHTML = '<img class="tutor-coin-poster" src="' + href('assets/tutor/moeda-ia-face.jpg') + '" alt="" draggable="false">';
    btn.querySelector('.tutor-badge').setAttribute('aria-hidden', 'true');
    let pointer = null, suppressClick = false;
    const clamp = (n, max) => Math.max(6, Math.min(Math.max(6, max), n));
    function position(left, top, persist = false) {
      left = clamp(left, innerWidth - btn.offsetWidth - 6);
      top = clamp(top, innerHeight - btn.offsetHeight - 6);
      Object.assign(btn.style, { left: left + 'px', top: top + 'px', right: 'auto', bottom: 'auto' });
      if (persist) save('tutorEFPosition', JSON.stringify({ left, top }));
      placePanel();
    }
    try {
      const p = JSON.parse(read('tutorEFPosition'));
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

    let sound = read('tutorEFCoinSound') === 'on', audio, lastSound = 0;
    const soundBtn = document.createElement('button');
    soundBtn.type = 'button'; soundBtn.className = 'tutor-coin-sound';
    const updateSound = () => {
      soundBtn.textContent = sound ? 'Som ligado' : 'Som desligado';
      soundBtn.setAttribute('aria-pressed', String(sound));
      soundBtn.setAttribute('aria-label', sound ? 'Desativar sons da moeda' : 'Ativar sons da moeda');
    };
    updateSound();
    document.querySelector('.tutor-head').insertBefore(soundBtn, document.querySelector('.tutor-close'));
    function tone(kind) {
      if (!sound || document.hidden || performance.now() - lastSound < 150) return;
      try {
        const Audio = window.AudioContext || window.webkitAudioContext;
        if (!Audio) return;
        audio ||= new Audio();
        void audio.resume().catch(() => {});
        lastSound = performance.now();
        const notes = kind === 'correct' ? [660, 880] : kind === 'wrong' ? [330] : [620];
        notes.forEach((frequency, i) => {
          const oscillator = audio.createOscillator(), gain = audio.createGain(), t = audio.currentTime + i * 0.09;
          oscillator.type = 'sine'; oscillator.frequency.value = frequency;
          gain.gain.setValueAtTime(0, t); gain.gain.linearRampToValueAtTime(0.035, t + 0.008);
          gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.15);
          oscillator.connect(gain); gain.connect(audio.destination); oscillator.start(t); oscillator.stop(t + 0.16);
          oscillator.onended = () => { oscillator.disconnect(); gain.disconnect(); };
        });
      } catch (_) {}
    }
    soundBtn.addEventListener('click', () => { sound = !sound; save('tutorEFCoinSound', sound ? 'on' : 'off'); updateSound(); if (sound) tone('open'); });

    let animate = () => {};
    const react = kind => { animate(kind); tone(kind); };
    new MutationObserver(() => react(btn.getAttribute('aria-expanded') === 'true' ? 'open' : 'tab'))
      .observe(btn, { attributes: true, attributeFilter: ['aria-expanded'] });
    document.addEventListener('click', e => {
      const el = e.target.closest?.('button, a'); if (!el || el.disabled && !el.matches('.tutor-option,.opts button')) return;
      if (el.matches('.tutor-option')) react(el.classList.contains('wrong') ? 'wrong' : 'correct');
      else if (el.matches('.opts button')) react(el.classList.contains('ok') ? 'correct' : 'wrong');
      else if (el.matches('.axis,[data-map],[data-open],.tutor-chip,.tutor-next,[data-tutor-action]')) react('tab');
    });
    const media = matchMedia('(prefers-reduced-motion: reduce)');
    init3D().catch(() => { btn.dataset.coinState = 'fallback'; });
    async function init3D() {
      const THREE = await import(href('ra/celula/visualizador/vendor/three.module.js'));
      const { GLTFLoader } = await import(href('ra/celula/visualizador/vendor/GLTFLoader.js'));
      const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'low-power' });
      renderer.setClearColor(0, 0); renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 2));
      renderer.outputColorSpace = THREE.SRGBColorSpace;
      const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(35, 1, 0.1, 20);
      camera.position.z = 3.8;
      scene.add(new THREE.HemisphereLight(0xffffff, 0x566b64, 3));
      const light = new THREE.DirectionalLight(0xffffff, 4); light.position.set(-2, 3, 5); scene.add(light);
      const fill = new THREE.DirectionalLight(0xcfe8ff, 2); fill.position.set(3, -1, 2); scene.add(fill);
      const gltf = await new GLTFLoader().loadAsync(href('assets/tutor/moeda-ia.glb'));
      const coin = new THREE.Group();
      const center = new THREE.Box3().setFromObject(gltf.scene).getCenter(new THREE.Vector3());
      gltf.scene.position.sub(center);
      coin.add(gltf.scene); scene.add(coin);
      // The source face is oriented with its artwork upside down.
      coin.rotation.z = Math.PI;
      const canvas = renderer.domElement;
      canvas.setAttribute('aria-hidden', 'true'); canvas.className = 'tutor-coin-canvas';
      portrait.appendChild(canvas);
      let frame = 0, start = 0, kind = '';
      const rest = () => { coin.rotation.set(0.06, -0.12, Math.PI); coin.position.y = 0; coin.scale.setScalar(1); };
      function draw() { renderer.render(scene, camera); }
      function stop() { cancelAnimationFrame(frame); frame = 0; rest(); draw(); }
      function tick(now) {
        frame = 0;
        if (document.hidden || media.matches) { stop(); return; }
        const t = Math.min(1, (now - start) / (kind === 'open' ? 850 : 480));
        const pulse = Math.sin(Math.PI * t), eased = 1 - Math.pow(1 - t, 3);
        rest();
        if (kind === 'open') coin.rotation.y += Math.PI * 2 * eased;
        else if (kind === 'wrong') coin.rotation.z = Math.PI + Math.sin(t * Math.PI * 4) * pulse * 0.08;
        else { coin.rotation.y += pulse * 0.45; coin.position.y = pulse * (kind === 'correct' ? 0.15 : 0.06); }
        draw();
        if (t < 1) frame = requestAnimationFrame(tick);
        else { coin.rotation.z = Math.PI; stop(); }
      }
      animate = next => {
        if (media.matches || document.hidden || pointer?.moved) return;
        cancelAnimationFrame(frame); kind = next; start = performance.now(); frame = requestAnimationFrame(tick);
      };
      const resize = () => { renderer.setSize(portrait.clientWidth, portrait.clientHeight, false); draw(); };
      new ResizeObserver(resize).observe(portrait);
      media.addEventListener('change', stop);
      document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
      canvas.addEventListener('webglcontextlost', e => { e.preventDefault(); cancelAnimationFrame(frame); btn.classList.remove('coin-ready'); btn.dataset.coinState = 'fallback'; });
      canvas.addEventListener('webglcontextrestored', () => { rest(); draw(); btn.classList.add('coin-ready'); btn.dataset.coinState = 'ready'; });
      rest(); resize(); btn.classList.add('coin-ready'); btn.dataset.coinState = 'ready';
    }
  }};
})();
