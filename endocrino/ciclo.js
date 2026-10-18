import { HORMONES, CYCLE_HORMONES, PREGNANCY_HORMONES, PREGNANCY_TOTAL_DAYS, TERM_DAY, snapshotAt, totalDays, buildSeries, formatHormone, formatTime, corpusLuteumShare } from './cycle-model.js?v=20261018-ciclo1';
import { describePhase, segments, landmarks } from './cycle-phases.js?v=20261018-ciclo1';
import { EXERCISE, EXERCISE_LEVELS, applyExercise } from './cycle-exercise.js?v=20261018-ciclo1';

const $ = id => document.getElementById(id);
const esc = v => String(v).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const SPEEDS = { ciclo:[{label:'1× (0,5 dia/s)',rate:.5},{label:'2× (1 dia/s)',rate:1},{label:'4× (2 dias/s)',rate:2}], gestacao:[{label:'1× (2 dias/s)',rate:2},{label:'2× (5 dias/s)',rate:5},{label:'4× (10 dias/s)',rate:10}] };
const COLORS = { gnrh:'#87d29e', oxt:'#70bcff', fsh:'#c4a2f6', lh:'#a98bf0', prl:'#e0b4ff', e2:'#ffab73', p4:'#f4e76a', hcg:'#80c5af' };
const SEGMENT_COLORS = ['#7a3346','#2d5a73','#7a5a2a','#3d5a3a'];
const TICK_MS = 100;

const initialMode = new URLSearchParams(location.search).get('modo') === 'gestacao' ? 'gestacao' : 'ciclo';
const sim = { mode:initialMode, day:0, cycle:1, running:true, speed:0, cycleLength:28, breastfeeding:true, exercise:null };
let series = [];

const settings = () => ({ mode:sim.mode, cycleLength:sim.cycleLength, breastfeeding:sim.breastfeeding });
const total = () => totalDays(settings());
const ids = () => sim.mode === 'ciclo' ? CYCLE_HORMONES : PREGNANCY_HORMONES;
const finished = () => sim.mode === 'gestacao' && sim.day >= PREGNANCY_TOTAL_DAYS - .01;

function rebuild() {
  series = buildSeries(settings());
  renderStructure();
  render();
}

function renderStructure() {
  document.querySelectorAll('[data-mode]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.mode === sim.mode)));
  $('speed').innerHTML = SPEEDS[sim.mode].map((s,i) => `<option value="${i}">${s.label}</option>`).join('');
  $('speed').value = String(sim.speed);
  $('len-wrap').hidden = sim.mode !== 'ciclo';
  $('bf-wrap').hidden = sim.mode !== 'gestacao';
  const t = total();
  $('seek').max = String(t - .01);
  $('seek').step = sim.mode === 'ciclo' ? '0.05' : '0.5';
  $('segments').innerHTML = segments(sim.mode, sim.cycleLength).map((s,i) => `<span data-seg="${i}" style="flex:${s.end - s.start};background:${SEGMENT_COLORS[i % 4]}">${esc(s.label)}</span>`).join('');
  $('landmarks').innerHTML = landmarks(sim.mode, sim.cycleLength).map(l => `<button type="button" data-day="${l.day}">${esc(l.label)}</button>`).join('');
  $('ex-levels').innerHTML = EXERCISE_LEVELS.map(id => `<button type="button" role="radio" data-ex="${id}" aria-checked="false">${esc(EXERCISE[id].label)}</button>`).join('');
  renderCharts();
}

function trend(id) {
  const prev = snapshotAt(Math.max(0, sim.day - .5), settings())[id];
  const now = snapshotAt(sim.day, settings())[id];
  const r = (now - prev) / Math.max(Math.abs(prev), .01);
  return r > .03 ? 'up' : r < -.03 ? 'down' : 'flat';
}

function chip(id, snap) {
  const h = HORMONES[id], t = trend(id), arrow = t === 'up' ? '↑' : t === 'down' ? '↓' : '→';
  return `<div class="lab" style="border-left:3px solid ${COLORS[id]}"><small>${esc(h.short)}</small><b>${formatHormone(id, snap[id])}<span class="trend ${t}" aria-label="${t === 'up' ? 'subindo' : t === 'down' ? 'caindo' : 'estável'}">${arrow}</span></b><small>${esc(h.unit)}</small></div>`;
}
const extra = (label, value) => `<div class="lab"><small>${esc(label)}</small><b>${esc(value)}</b></div>`;
const fmt1 = v => v.toLocaleString('pt-BR', { minimumFractionDigits:1, maximumFractionDigits:1 });

function arrow(label, intensity) {
  const i = Math.min(1, Math.max(0, intensity));
  return `<div class="arrow"><svg width="20" height="34" viewBox="0 0 20 34" aria-hidden="true"><line x1="10" y1="0" x2="10" y2="25" stroke="currentColor" stroke-width="${(1.5 + 5 * i).toFixed(1)}" stroke-linecap="round" opacity="${(.3 + .7 * i).toFixed(2)}"/><path d="M4 25 L10 33 L16 25 Z" fill="currentColor" opacity="${(.3 + .7 * i).toFixed(2)}"/></svg><span>${esc(label)}</span></div>`;
}
function stage(n, title, subtitle, body) {
  return `<div class="stage"><h3><span class="stage-number">${n}</span>${esc(title)}</h3><small>${esc(subtitle)}</small><div class="labs">${body}</div></div>`;
}

function renderFlow(snap, phase) {
  const d = sim.day, pregnant = sim.mode === 'gestacao' && d >= 21, postpartum = sim.mode === 'gestacao' && d >= TERM_DAY;
  const placenta = pregnant && !postpartum;
  const gonadTitle = placenta ? (corpusLuteumShare(d) > .5 ? 'Corpo lúteo + trofoblasto' : 'Placenta') : 'Ovário';
  const gonadIds = placenta || (postpartum && snap.hcg > 5) ? ['hcg','e2','p4'] : ['e2','p4'];
  let targets, targetSub;
  if (sim.mode === 'ciclo' || d < 21) { targets = extra('Endométrio', fmt1(snap.endometrium ?? 0) + ' mm') + extra('Temp. basal', fmt1(snap.temperature ?? 36.5) + ' °C'); targetSub = 'Endométrio, muco cervical e centro termorregulador'; }
  else if (!postpartum) { targets = extra('Miométrio', d >= TERM_DAY - 1.5 ? 'Contrações' : 'Quiescente') + extra('Mamas', 'Lactogênese I'); targetSub = 'Decídua, miométrio e glândula mamária'; }
  else { targets = extra('Útero', 'Involução') + extra('Mamas', sim.breastfeeding ? 'Lactação' : 'Involução'); targetSub = sim.breastfeeding ? 'Sucção estimula prolactina e ocitocina' : 'Sem estímulo de sucção'; }
  const pulse = Math.round(1440 / Math.max(snap.gnrh, .5));
  $('flow-title').textContent = placenta ? 'Eixo hipotálamo–hipófise–placenta' : 'Eixo hipotálamo–hipófise–ovário';
  $('diagram').innerHTML =
    stage(1, 'Hipotálamo', 'Núcleo arqueado (GnRH) · núcleos supraóptico e paraventricular (ocitocina)', chip('gnrh', snap) + extra('Intervalo de pulsos', pulse + ' min')) +
    arrow('GnRH pelo sistema porta-hipofisário · ocitocina por transporte axonal', snap.gnrh / 22) +
    `<div class="row">${stage(2, 'Neuro-hipófise', 'Libera a ocitocina produzida no hipotálamo', chip('oxt', snap))}${stage(3, 'Adeno-hipófise', 'Gonadotrofos (FSH, LH) e lactotrofos (PRL)', chip('fsh', snap) + chip('lh', snap) + chip('prl', snap))}</div>` +
    arrow(placenta ? 'hCG placentário mantém o corpo lúteo; FSH e LH suprimidos' : 'FSH e LH estimulam folículos e corpo lúteo', placenta ? .25 : Math.min(1, (snap.lh + snap.fsh) / 25)) +
    stage(4, gonadTitle, phase.gonadSubtitle || phase.ovary || '', gonadIds.map(id => chip(id, snap)).join('')) +
    arrow('Estradiol e progesterona nos tecidos-alvo e retroalimentação ao eixo', Math.min(1, Math.log10(1 + snap.e2 / 30 + snap.p4) / 2.5)) +
    stage(5, 'Tecidos-alvo', targetSub, targets);
}

function renderPhase(phase) {
  $('phase-period').textContent = phase.period;
  $('phase-title').textContent = phase.title;
  $('phase-text').innerHTML = phase.text.map(p => `<p>${esc(p)}</p>`).join('') + (phase.ovary ? `<p class="muted"><strong>${sim.mode === 'gestacao' && sim.day >= 21 ? 'Gônada / placenta' : 'Ovário'}:</strong> ${esc(phase.ovary)}</p>` : '');
  $('phase-feedback').innerHTML = phase.feedback.map(f => `<p class="${f.type === 'positiva' ? 'positive' : f.type === 'estímulo' ? 'stimulus' : ''}"><strong>Retroalimentação ${esc(f.type)}:</strong> ${esc(f.text)}</p>`).join('');
}

function renderCharts() {
  const t = total(), w = 600, h = 58;
  const rows = ids().map(id => {
    const max = Math.max(...series.map(p => p[id])) || 1;
    const pts = series.map(p => `${(p.t / t * w).toFixed(1)},${(h - 4 - p[id] / max * (h - 10)).toFixed(1)}`).join(' ');
    return `<div class="chart-row"><header><b style="color:${COLORS[id]}">${esc(HORMONES[id].short)}</b><span class="muted">pico ${formatHormone(id, max)} ${esc(HORMONES[id].unit)}</span></header><svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" role="img" aria-label="Curva de ${esc(HORMONES[id].name)}" data-chart><polyline fill="none" stroke="${COLORS[id]}" stroke-width="2" vector-effect="non-scaling-stroke" points="${pts}"/><line class="cursor" x1="0" x2="0" y1="0" y2="${h}" stroke="#dcebf5" stroke-width="1.5" vector-effect="non-scaling-stroke" opacity=".8"/></svg></div>`;
  });
  const end = sim.mode === 'ciclo' ? `Dia ${sim.cycleLength}` : 'Puerpério 12 sem';
  const mid = sim.mode === 'ciclo' ? `Dia ${Math.round(sim.cycleLength / 2)}` : 'Parto (40 sem)';
  $('charts').innerHTML = rows.join('') + `<div class="chart-axis"><span></span><div><span>${sim.mode === 'ciclo' ? 'Dia 1' : 'DUM'}</span><span>${mid}</span><span>${end}</span></div></div>`;
}

function renderExercise(rest) {
  document.querySelectorAll('[data-ex]').forEach(b => b.setAttribute('aria-checked', String(b.dataset.ex === sim.exercise)));
  if (!sim.exercise) {
    $('ex-detail').innerHTML = '<p class="muted">Escolha uma intensidade para ver a resposta rápida e o significado clínico na fase atual.</p>';
    return;
  }
  const ex = EXERCISE[sim.exercise], after = applyExercise(rest, sim.exercise);
  const changed = ['gnrh','lh','fsh','prl','oxt','e2','p4'];
  const cards = changed.map(id => {
    const pct = (after[id] - rest[id]) / Math.max(rest[id], .01) * 100;
    const cls = pct > 1 ? 'up' : pct < -1 ? 'down' : '';
    return `<div class="lab"><small>${esc(HORMONES[id].short)}</small><b>${formatHormone(id, after[id])}</b><small class="delta ${cls}">${pct > 0 ? '+' : ''}${Math.round(pct)}% vs repouso</small></div>`;
  }).join('');
  $('ex-detail').innerHTML = `<div class="ex-card"><p><strong>${esc(ex.intensity)}</strong><br><span class="muted">${esc(ex.examples)}</span></p><p>${esc(ex.summary)}</p><div class="labs">${cards}</div><ul>${ex.mechanisms.map(m => `<li>${esc(m)}</li>`).join('')}</ul><p class="ex-clinical"><strong>Clínica (${sim.mode === 'ciclo' ? 'ciclo' : 'gestação'}):</strong> ${esc(ex.clinical[sim.mode])}</p><button type="button" id="ex-clear">Voltar ao repouso</button></div>`;
}

function render() {
  const t = total(), rest = snapshotAt(sim.day, settings());
  const snap = sim.exercise ? applyExercise(rest, sim.exercise) : rest;
  const phase = describePhase(sim.mode, sim.day, sim.cycleLength, sim.breastfeeding);
  $('clock').textContent = formatTime(sim.mode, sim.day, sim.cycleLength);
  $('cycle-count').textContent = sim.mode === 'ciclo' ? `Ciclo ${sim.cycle}` : `Dia ${Math.floor(sim.day)} desde a DUM`;
  $('phase-chip').textContent = phase.title;
  $('toggle').textContent = finished() ? 'Recomeçar' : sim.running ? 'Pausar' : 'Iniciar';
  if (document.activeElement !== $('seek')) $('seek').value = String(sim.day);
  $('seek').setAttribute('aria-valuetext', formatTime(sim.mode, sim.day, sim.cycleLength));
  segments(sim.mode, sim.cycleLength).forEach((s,i) => $('segments').children[i]?.classList.toggle('active', sim.day >= s.start && sim.day < s.end));
  const x = (sim.day / t * 600).toFixed(1);
  document.querySelectorAll('#charts .cursor').forEach(l => { l.setAttribute('x1', x); l.setAttribute('x2', x); });
  renderFlow(snap, phase);
  renderPhase(phase);
  renderExercise(rest);
}

function setMode(m) {
  if (m === sim.mode) return;
  Object.assign(sim, { mode:m, day:0, cycle:1, running:true, speed:0, exercise:null });
  history.replaceState(null, '', `?modo=${m}`);
  rebuild();
}
function seek(day) { sim.day = Math.min(Math.max(0, day), total() - .01); render(); }

setInterval(() => {
  if (!sim.running) return;
  sim.day += SPEEDS[sim.mode][sim.speed].rate * TICK_MS / 1000;
  if (sim.mode === 'ciclo' && sim.day >= sim.cycleLength) { sim.day -= sim.cycleLength; sim.cycle += 1; }
  if (sim.mode === 'gestacao' && sim.day >= PREGNANCY_TOTAL_DAYS - .01) { sim.day = PREGNANCY_TOTAL_DAYS - .01; sim.running = false; }
  render();
}, TICK_MS);

document.querySelectorAll('[data-mode]').forEach(b => b.onclick = () => setMode(b.dataset.mode));
$('toggle').onclick = () => {
  if (finished()) { sim.day = 0; sim.cycle = 1; sim.running = true; }
  else { if (!sim.running) sim.exercise = null; sim.running = !sim.running; }
  render();
};
$('reset').onclick = () => { sim.day = 0; sim.cycle = 1; sim.exercise = null; render(); };
$('speed').onchange = e => { sim.speed = Number(e.target.value) || 0; };
$('cycle-length').oninput = e => {
  const len = Math.min(35, Math.max(21, Number(e.target.value) || 28));
  sim.cycleLength = len; sim.day = Math.min(sim.day, len - .01);
  $('cycle-length-v').textContent = len + ' dias';
  rebuild();
};
$('breastfeeding').onchange = e => { sim.breastfeeding = e.target.checked; rebuild(); };
$('seek').oninput = e => { sim.running = false; seek(Number(e.target.value)); };
$('landmarks').onclick = e => { const b = e.target.closest('[data-day]'); if (!b) return; sim.running = false; seek(Number(b.dataset.day)); };
$('charts').onclick = e => {
  const svg = e.target.closest('[data-chart]'); if (!svg) return;
  const r = svg.getBoundingClientRect(); sim.running = false; seek((e.clientX - r.left) / r.width * total());
};
$('ex-levels').onclick = e => { const b = e.target.closest('[data-ex]'); if (!b) return; sim.exercise = b.dataset.ex; sim.running = false; render(); };
$('ex-detail').onclick = e => { if (e.target.id === 'ex-clear') { sim.exercise = null; render(); } };

rebuild();
