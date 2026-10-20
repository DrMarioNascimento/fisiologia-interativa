/* Optional local respiratory cues; no microphone or external audio service. */
(function () {
  'use strict';
  const base = new URL('assets/audio/biofeedback/', document.currentScript.src);
  window.createRespiratoryAudio = function ({ onChange = () => {} } = {}) {
    const mode = document.getElementById('respAudioMode');
    const volume = document.getElementById('respAudioVolume');
    const output = document.getElementById('respAudioVolumeValue');
    const summary = document.getElementById('respAudioCurrent');
    const description = document.getElementById('respAudioDescription');
    const status = document.getElementById('respAudioStatus');
    const preview = document.getElementById('respAudioPreview');
    const instructions = document.getElementById('respAudioInstructions');
    const Audio = window.AudioContext || window.webkitAudioContext;
    const speech = window.speechSynthesis;
    const deviceAvailable = !!(speech && window.SpeechSynthesisUtterance);
    const voiceSource = document.getElementById('respAudioVoiceSource');
    const voiceChoice = document.getElementById('respAudioDeviceVoice');
    const voiceSettings = document.getElementById('respAudioVoiceSettings');
    const deviceSettings = document.getElementById('respAudioDeviceSettings');
    let voiceURI = '', utterance = null, speechTimer = null;
    if (!Audio && deviceAvailable) voiceSource.value = 'device';
    for (const option of voiceSource.options) option.disabled = option.value === 'device' ? !deviceAvailable : !Audio;
    const labels = { off: 'Desligado', continuous: 'Tom suave contínuo', voice: 'Voz em português', chime: 'Sinal discreto' };
    const descriptions = {
      off: 'Escolha um guia para acompanhar a respiração pelo som.',
      continuous: 'O tom sobe na inspiração e desce na expiração. Nas pausas, fica em silêncio.',
      voice: 'Os áudios “Inspire”, “Expire” e “Pausa” anunciam o início de cada fase, acompanhando a esfera.',
      chime: 'Uma nota breve marca cada fase: mais aguda para inspirar, mais grave para expirar e baixa nas pausas.'
    };
    // Skip only the leading/trailing silence in the supplied recordings, without changing the voice.
    const cues = { inspire: {offset: .10, duration: 1.03}, expire: {offset: .13, duration: 1.12}, pausa: {offset: .14, duration: .74}, orientacoes: {offset: .11, duration: 10.5} };
    let context, master, active, lastPhase = '', running = false, previewing = false, instructing = false;
    let timers = [], generation = 0;
    const buffers = new Map(), loading = new Map();
    const supported = value => value === 'off' || (value === 'voice' ? !!Audio || deviceAvailable : !!Audio);
    for (const option of mode.options) if (!supported(option.value)) option.disabled = true;
    try {
      const saved = JSON.parse(localStorage.getItem('respiratoryAudioPreferences'));
      if (saved && Object.hasOwn(labels, saved.mode) && supported(saved.mode)) mode.value = saved.mode;
      if (saved && ['recorded', 'device'].includes(saved.voiceSource) && (saved.voiceSource === 'device' ? deviceAvailable : !!Audio)) voiceSource.value = saved.voiceSource;
      if (saved && typeof saved.voiceURI === 'string') voiceURI = saved.voiceURI;
      if (saved && Number.isFinite(saved.volume)) volume.value = Math.max(0, Math.min(100, saved.volume));
    } catch (_) {}
    function save() {
      try { localStorage.setItem('respiratoryAudioPreferences', JSON.stringify({ mode: mode.value, volume: +volume.value, voiceSource: voiceSource.value, voiceURI })); } catch (_) {}
    }
    function render() {
      summary.textContent = labels[mode.value]; description.textContent = descriptions[mode.value];
      voiceSettings.hidden = mode.value !== 'voice'; deviceSettings.hidden = voiceSource.value !== 'device';
      if (mode.value === 'voice' && voiceSource.value === 'device') description.textContent = 'A voz do aparelho anuncia cada fase. As vozes e o funcionamento offline dependem do celular e do navegador.';
      output.textContent = volume.value + '%'; volume.disabled = !Audio && !deviceAvailable;
      preview.disabled = running || mode.value === 'off';
      preview.textContent = previewing ? '■ Parar exemplo' : '▶ Ouvir exemplo';
      preview.setAttribute('aria-pressed', String(previewing));
      instructions.disabled = running || !Audio;
      instructions.textContent = instructing ? '■ Parar orientações' : '▶ Ouvir orientações';
      instructions.setAttribute('aria-pressed', String(instructing));
    }
    function refreshVoices() {
      if (!deviceAvailable) return;
      voiceChoice.replaceChildren();
      const auto = document.createElement('option'); auto.value = ''; auto.textContent = 'Automática · português'; voiceChoice.append(auto);
      for (const voice of speech.getVoices().filter(v => /^pt(?:[-_]|$)/i.test(v.lang))) {
        const option = document.createElement('option'); option.value = voice.voiceURI;
        option.textContent = voice.name + (voice.localService ? ' · no aparelho' : ' · pode usar internet'); voiceChoice.append(option);
      }
      voiceChoice.value = [...voiceChoice.options].some(o => o.value === voiceURI) ? voiceURI : '';
    }
    refreshVoices();
    if (deviceAvailable) speech.addEventListener('voiceschanged', refreshVoices);
    async function load(name) {
      if (buffers.has(name)) return buffers.get(name);
      if (!loading.has(name)) {
        const promise = (async () => {
          const response = await fetch(new URL(name + '.mp3', base), {signal: AbortSignal.timeout(12000)});
          if (!response.ok) throw Error('Áudio indisponível');
          const buffer = await context.decodeAudioData(await response.arrayBuffer());
          buffers.set(name, buffer); return buffer;
        })().finally(() => loading.delete(name));
        loading.set(name, promise);
      }
      return loading.get(name);
    }
    async function unlock(force = false) {
      if (!force && mode.value === 'off') return false;
      if (!force && mode.value === 'voice' && voiceSource.value === 'device') {
        if (!deviceAvailable) return false;
        if (speech.paused) speech.resume();
        refreshVoices(); status.textContent = ''; return true;
      }
      if (!Audio) return false;
      try {
        if (!context) {
          context = new Audio(); master = context.createGain(); master.gain.value = +volume.value / 100;
          master.connect(context.destination);
        }
        if (context.state !== 'running') await context.resume();
        if (!force && mode.value === 'voice') {
          status.textContent = 'Preparando a voz…';
          await Promise.all(['inspire', 'expire', 'pausa'].map(load));
        }
        status.textContent = ''; return true;
      } catch (_) {
        status.textContent = 'Não foi possível carregar o áudio. Tente novamente ou escolha outro guia; a esfera continua disponível.';
        return false;
      }
    }
    function stopSound() {
      lastPhase = '';
      if (speechTimer !== null) { clearTimeout(speechTimer); speechTimer = null; }
      if (utterance) { utterance = null; speech.cancel(); }
      if (active) {
        const old = active; active = null;
        try {
          const t = context.currentTime;
          old.gain.gain.cancelScheduledValues(t);
          old.gain.gain.setValueAtTime(old.gain.gain.value, t);
          old.gain.gain.linearRampToValueAtTime(0, t + .025);
          old.source.stop(t + .03);
        } catch (_) {}
      }
    }
    function stop() {
      generation++; timers.forEach(clearTimeout); timers = [];
      previewing = false; instructing = false; stopSound(); render();
    }
    function connect(source, gain, filter) {
      if (filter) { source.connect(filter); filter.connect(gain); } else source.connect(gain);
      gain.connect(master); const node = {source, gain}; active = node;
      source.onended = () => { source.disconnect(); gain.disconnect(); if (filter) filter.disconnect(); if (active === node) active = null; };
      return node;
    }
    function oscillator(start, end, seconds, chime) {
      const t = context.currentTime, o = context.createOscillator(), g = context.createGain();
      o.type = 'sine'; o.frequency.setValueAtTime(start, t);
      if (!chime) o.frequency.linearRampToValueAtTime(end, t + seconds);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(.12, t + Math.min(.025, seconds / 3));
      g.gain.setValueAtTime(.12, t + Math.max(.025, seconds - .04));
      g.gain.linearRampToValueAtTime(0, t + seconds);
      connect(o, g); o.start(t); o.stop(t + seconds + .01);
    }
    function recording(name, remaining = Infinity) {
      const buffer = buffers.get(name); if (!buffer) return;
      const source = context.createBufferSource(), gain = context.createGain();
      source.buffer = buffer; gain.gain.value = 1;
      const node = connect(source, gain), ended = source.onended;
      source.onended = () => { const current = active === node; ended(); if (name === 'orientacoes' && current) { instructing = false; status.textContent = 'Orientações concluídas.'; render(); } };
      const cue = cues[name];
      source.start(0, cue.offset, Math.min(cue.duration, remaining, buffer.duration - cue.offset));
    }
    function deviceCue(f, remaining) {
      if (!deviceAvailable) return;
      const u = new window.SpeechSynthesisUtterance(f.nome === 'INSPIRAR' ? 'Inspire' : f.nome === 'EXPIRAR' ? 'Expire' : 'Pausa');
      const voices = speech.getVoices().filter(v => /^pt(?:[-_]|$)/i.test(v.lang));
      const selected = voices.find(v => v.voiceURI === voiceURI) || voices.find(v => v.default) || voices.find(v => /^pt[-_]BR$/i.test(v.lang) && v.localService) || voices.find(v => /^pt[-_]BR$/i.test(v.lang)) || voices[0];
      if (selected) u.voice = selected;
      u.lang = selected?.lang || 'pt-BR'; u.rate = 1; u.volume = +volume.value / 100; utterance = u;
      u.onend = () => { if (utterance === u) utterance = null; };
      u.onerror = event => { if (utterance !== u) return; utterance = null; if (!['canceled', 'interrupted'].includes(event.error)) status.textContent = 'A voz do aparelho não está disponível. Escolha outra voz ou use a voz gravada.'; };
      speech.speak(u);
      speechTimer = setTimeout(() => { if (utterance === u) { utterance = null; speech.cancel(); } speechTimer = null; }, remaining * 1000);
    }
    function phase(f, elapsed = 0) {
      if (!f || document.hidden || mode.value === 'off' || +volume.value === 0) return;
      const useDevice = mode.value === 'voice' && voiceSource.value === 'device';
      if (!useDevice && (!context || context.state !== 'running')) return;
      if (lastPhase === f.nome) return;
      stopSound(); lastPhase = f.nome;
      const remaining = Math.max(.05, f.dur - elapsed), fraction = Math.max(0, Math.min(1, elapsed / f.dur));
      if (useDevice) { deviceCue(f, remaining); return; }
      if (mode.value === 'continuous') {
        if (f.nome !== 'INSPIRAR' && f.nome !== 'EXPIRAR') return;
        const a = f.nome === 'INSPIRAR' ? 220 : 440, b = f.nome === 'INSPIRAR' ? 440 : 220;
        oscillator(a + (b - a) * fraction, b, remaining, false);

      } else if (mode.value === 'chime') {
        const pitch = f.nome === 'INSPIRAR' ? 523.25 : f.nome === 'EXPIRAR' ? 349.23 : 261.63;
        oscillator(pitch, pitch, Math.min(.22, remaining), true);
      } else if (mode.value === 'voice') recording(f.nome === 'INSPIRAR' ? 'inspire' : f.nome === 'EXPIRAR' ? 'expire' : 'pausa', remaining);
    }
    function setRunning(value) { running = value; stop(); status.textContent = ''; render(); }
    mode.addEventListener('change', () => {
      stop(); save(); status.textContent = ''; render(); const current = generation;
      void unlock().then(() => { if (generation === current) onChange(); });
    });
    voiceSource.addEventListener('change', () => {
      stop(); save(); render(); const current = generation;
      void unlock().then(() => { if (generation === current) onChange(); });
    });
    voiceChoice.addEventListener('change', () => { voiceURI = voiceChoice.value; stop(); save(); render(); if (running) onChange(); });
    volume.addEventListener('input', () => {
      if (master) master.gain.setTargetAtTime(+volume.value / 100, context.currentTime, .025);
      save(); render(); if (+volume.value === 0) { stop(); status.textContent = 'Áudio silenciado.'; } else if (!lastPhase && running) onChange();
    });
    instructions.addEventListener('click', async () => {
      if (instructing) { stop(); status.textContent = ''; return; }
      if (running) return;
      stop(); const current = generation; instructing = true; render(); status.textContent = 'Carregando orientações…';
      try {
        if (!await unlock(true)) { if (generation === current) { instructing = false; render(); } return; }
        await load('orientacoes');
        if (generation !== current || running || document.hidden) return;
        status.textContent = 'Ouvindo orientações.'; recording('orientacoes');
      } catch (_) { if (generation === current) { instructing = false; render(); status.textContent = 'Não foi possível carregar as orientações. Toque para tentar novamente.'; } }
    });
    preview.addEventListener('click', async () => {
      if (previewing) { stop(); status.textContent = ''; return; }
      if (running || mode.value === 'off') return;
      stop(); const current = generation; if (!await unlock()) return;
      if (generation !== current || document.hidden || running) return;
      previewing = true; render(); status.textContent = 'Exemplo de 10 segundos: inspiração, pausa, expiração e pausa.';
      phase({nome: 'INSPIRAR', dur: 4});
      for (const [delay, nome, dur] of [[4000, 'SEGURAR', 1], [5000, 'EXPIRAR', 4], [9000, 'PAUSAR', 1]]) timers.push(setTimeout(() => { if (generation === current) phase({nome, dur}); }, delay));
      timers.push(setTimeout(() => { if (generation === current) { stop(); status.textContent = 'Exemplo concluído.'; } }, 10000));
    });
    window.addEventListener('pagehide', stop);
    document.addEventListener('visibilitychange', () => { if (document.hidden) { stop(); status.textContent = 'Áudio interrompido ao sair da página.'; } });
    function complete() {
      stop();
      if (!context || context.state !== 'running' || +volume.value === 0 || document.hidden) return;
      oscillator(659.25, 659.25, .16, true);const current=generation;
      timers.push(setTimeout(() => { if (generation === current) oscillator(783.99, 783.99, .24, true); }, 220));
    }
    function preferences() { return {mode:mode.value,voiceSource:voiceSource.value,voiceURI,volume:+volume.value}; }
    function configure(prefs) {
      if (!prefs || !Object.hasOwn(labels,prefs.mode) || !supported(prefs.mode)) return false;
      if (prefs.mode === 'voice' && (prefs.voiceSource === 'device' ? !deviceAvailable : !Audio)) return false;
      stop();mode.value=prefs.mode;
      if (prefs.voiceSource === 'device' ? deviceAvailable : !!Audio) voiceSource.value=prefs.voiceSource;
      voiceURI=typeof prefs.voiceURI === 'string'?prefs.voiceURI:'';
      if (Number.isFinite(prefs.volume)) volume.value=Math.max(0,Math.min(100,prefs.volume));
      refreshVoices();save();render();status.textContent='';return true;
    }
    render(); return {unlock, phase, stop, setRunning, complete, preferences, configure};
  };
})();
