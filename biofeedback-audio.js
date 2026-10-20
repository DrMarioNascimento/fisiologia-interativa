/* Optional respiratory cues. No microphone, recordings or external audio services. */
(function () {
  'use strict';
  window.createRespiratoryAudio = function ({ onChange = () => {} } = {}) {
    const mode = document.getElementById('respAudioMode');
    const volume = document.getElementById('respAudioVolume');
    const output = document.getElementById('respAudioVolumeValue');
    const summary = document.getElementById('respAudioCurrent');
    const description = document.getElementById('respAudioDescription');
    const status = document.getElementById('respAudioStatus');
    const preview = document.getElementById('respAudioPreview');
    const Audio = window.AudioContext || window.webkitAudioContext;
    const speech = window.speechSynthesis;
    const voiceAvailable = !!(speech && window.SpeechSynthesisUtterance);
    const labels = { off: 'Desligado', continuous: 'Tom suave cont�nuo', voice: 'Voz em portugu�s', chime: 'Sinal discreto' };
    const descriptions = {
      off: 'Escolha um guia para acompanhar a respira��o pelo som.',
      continuous: 'O tom sobe na inspira��o e desce na expira��o. Nas pausas, fica em sil�ncio.',
      voice: 'Uma voz anuncia "inspire", "expire" ou "pausa" no in�cio de cada fase. A voz depende do aparelho e pode precisar de conex�o.',
      chime: 'Uma nota breve marca cada fase: mais aguda para inspirar, mais grave para expirar e baixa nas pausas.'
    };
    let context, master, active, lastPhase = '', running = false, previewing = false;
    let timers = [], generation = 0;
    const supported = value => value === 'off' || (value === 'voice' ? voiceAvailable : !!Audio);
    for (const option of mode.options) if (!supported(option.value)) option.disabled = true;
    try {
      const saved = JSON.parse(localStorage.getItem('respiratoryAudioPreferences'));
      if (saved && Object.hasOwn(labels, saved.mode) && supported(saved.mode)) mode.value = saved.mode;
      if (saved && Number.isFinite(saved.volume)) volume.value = Math.max(0, Math.min(100, saved.volume));
    } catch (_) {}
    function save() {
      try { localStorage.setItem('respiratoryAudioPreferences', JSON.stringify({ mode: mode.value, volume: +volume.value })); } catch (_) {}
    }
    function render() {
      summary.textContent = labels[mode.value];
      description.textContent = descriptions[mode.value];
      output.textContent = volume.value + '%';
      volume.disabled = mode.value === 'off';
      preview.disabled = running || mode.value === 'off';
      preview.textContent = previewing ? '� Parar exemplo' : '? Ouvir exemplo';
      preview.setAttribute('aria-pressed', String(previewing));
    }
    async function unlock() {
      if (mode.value === 'off' || mode.value === 'voice' || !Audio) return;
      try {
        if (!context) {
          context = new Audio(); master = context.createGain();
          master.gain.value = +volume.value / 100 * 0.12;
          master.connect(context.destination);
        }
        if (context.state !== 'running') await context.resume();
        status.textContent = '';
      } catch (_) { status.textContent = 'N�o foi poss�vel ativar o �udio. Toque em Ouvir exemplo ou tente iniciar novamente.'; }
    }
    function stopSound() {
      lastPhase = '';
      if (active) {
        const old = active; active = null;
        try {
          const t = context.currentTime;
          old.gain.gain.cancelScheduledValues(t);
          old.gain.gain.setValueAtTime(old.gain.gain.value, t);
          old.gain.gain.linearRampToValueAtTime(0, t + 0.025);
          old.oscillator.stop(t + 0.03);
        } catch (_) {}
      }
      if (speech && (speech.speaking || speech.pending)) speech.cancel();
    }
    function stop() {
      generation++;
      timers.forEach(clearTimeout); timers = [];
      previewing = false; stopSound(); render();
    }
    function oscillator(start, end, seconds, chime) {
      const t = context.currentTime;
      const o = context.createOscillator(), g = context.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(start, t);
      if (!chime) o.frequency.linearRampToValueAtTime(end, t + seconds);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(1, t + Math.min(0.025, seconds / 3));
      g.gain.setValueAtTime(1, t + Math.max(0.025, seconds - 0.04));
      g.gain.linearRampToValueAtTime(0, t + seconds);
      o.connect(g); g.connect(master);
      const node = { oscillator: o, gain: g }; active = node;
      o.onended = () => { o.disconnect(); g.disconnect(); if (active === node) active = null; };
      o.start(t); o.stop(t + seconds + 0.01);
    }
    function phase(f, elapsed = 0) {
      if (!f || document.hidden || mode.value === 'off' || +volume.value === 0) return;
      if (mode.value !== 'voice' && (!context || context.state !== 'running')) return;
      if (lastPhase === f.nome) return;
      stopSound(); lastPhase = f.nome;
      const remaining = Math.max(0.05, f.dur - elapsed);
      if (mode.value === 'continuous') {
        if (f.nome !== 'INSPIRAR' && f.nome !== 'EXPIRAR') return;
        const a = f.nome === 'INSPIRAR' ? 220 : 440;
        const b = f.nome === 'INSPIRAR' ? 440 : 220;
        const fraction = Math.max(0, Math.min(1, elapsed / f.dur));
        oscillator(a + (b - a) * fraction, b, remaining, false);
      } else if (mode.value === 'chime') {
        const pitch = f.nome === 'INSPIRAR' ? 523.25 : f.nome === 'EXPIRAR' ? 349.23 : 261.63;
        oscillator(pitch, pitch, Math.min(0.22, remaining), true);
      } else if (voiceAvailable) {
        const u = new window.SpeechSynthesisUtterance(f.nome === 'INSPIRAR' ? 'Inspire' : f.nome === 'EXPIRAR' ? 'Expire' : 'Pausa');
        const voices = speech.getVoices();
        const selected = voices.find(v => /^pt[-_]BR$/i.test(v.lang)) || voices.find(v => /^pt/i.test(v.lang));
        if (selected) u.voice = selected;
        u.lang = selected?.lang || 'pt-BR'; u.rate = 0.9; u.volume = +volume.value / 100;
        u.onerror = e => { if (!['canceled', 'interrupted'].includes(e.error)) status.textContent = 'A voz n�o est� dispon�vel. Verifique a voz em portugu�s no aparelho ou escolha outro guia.'; };
        speech.speak(u);
      }
    }
    function setRunning(value) {
      running = value; stop(); status.textContent = ''; render();
    }
    mode.addEventListener('change', () => {
      stop(); save(); status.textContent = ''; render();
      const current = generation;
      void unlock().then(() => { if (generation === current) onChange(); });
    });
    volume.addEventListener('input', () => {
      if (master) master.gain.setTargetAtTime(+volume.value / 100 * 0.12, context.currentTime, 0.025);
      save(); render();
      // Zero volume also cancels a spoken cue; restoring it re-syncs with the session.
      if (+volume.value === 0) stopSound();
      else if (!lastPhase && running) onChange();
    });
    preview.addEventListener('click', async () => {
      if (previewing) { stop(); status.textContent = ''; return; }
      if (running || mode.value === 'off') return;
      stop(); const current = generation; await unlock();
      if (generation !== current || document.hidden || running) return;
      previewing = true; render(); status.textContent = 'Exemplo de 10 segundos: inspira��o, pausa, expira��o e pausa.';
      phase({ nome: 'INSPIRAR', dur: 4 });
      for (const [delay, nome, dur] of [[4000, 'SEGURAR', 1], [5000, 'EXPIRAR', 4], [9000, 'PAUSAR', 1]]) {
        timers.push(setTimeout(() => { if (generation === current) phase({ nome, dur }); }, delay));
      }
      timers.push(setTimeout(() => { if (generation === current) { stop(); status.textContent = 'Exemplo conclu�do.'; } }, 10000));
    });
    window.addEventListener('pagehide', stop);
    document.addEventListener('visibilitychange', () => { if (document.hidden) { stop(); status.textContent = '�udio interrompido ao sair da p�gina.'; } });
    render();
    return { unlock, phase, stop, setRunning };
  };
})();
