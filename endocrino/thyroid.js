import { recordSample, chartBounds, exportCSV } from './thyroid-recording.js';
import { BASELINE_STATE, DEFAULT_PARAMS, advance, scenarioState, flows } from './thyroid-model.js';
const bindings = [['capacity', 'thyroidFn'], ['replacement', 'levothyroxine'], ['conversion', 'deiodinase'], ['iodine', 'iodine'], ['nis', 'nis'], ['tpo', 'tpo'], ['pendrin', 'pendrin'], ['destruction', 'destruction'], ['trab', 'trab']];

const $ = (id) => document.getElementById(id);
import { scenarios, describeState } from './thyroid-scenarios.js';
let state, params, history, timer;
const visibleHormones = new Set(['trh', 'tsh', 't4', 't3']);
const colors = { trh: '#c4a2f6', tsh: '#ffab73', t4: '#70bcff', t3: '#87d29e' };
const ids = ['trh', 'tsh', 't4', 't3'];
const percent = (id, value) => 100 * value / BASELINE_STATE[id];
const fmt = (x) => x.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
function pause() { clearInterval(timer); timer = null; $('play').textContent = $('graph-play').textContent = 'Iniciar'; }
function controls() {
  for (const [id, key] of bindings) {
    $(id).value = Math.round(params[key] * 100);
    $(`${id}-value`).textContent = `${Math.round(params[key] * 100)}%`;
  }
}
function render() {
  $('clock').textContent = $('graph-clock').textContent = `Dia ${fmt(state.t)}`;
  drawProfiles();
  for (const id of ids) $(id).textContent = `${fmt(percent(id, state[id]))}% do basal`;
  const assessment = describeState(state, BASELINE_STATE, params);
  $('feedback').textContent = assessment.feedbackText;
  $('interpretation').textContent = assessment.interpretation;
  const rows = history.slice(-12).map((s) => {
    const row = document.createElement('tr');
    for (const value of [fmt(s.t), ...ids.map((id) => `${fmt(percent(id, s[id]))}%`)]) {
      const cell = document.createElement('td'); cell.textContent = value; row.append(cell);
    }
    return row;
  });
  $('history').replaceChildren(...rows);
  const flux = flows(state, params);
  for (const key of ['iodide', 'colloid', 'mit', 'dit', 'store4', 'store3', 'tissue']) $(`pool-${key}`).textContent = `${fmt(100 * state[key] / BASELINE_STATE[key])}%`;
  $('fluxes').textContent = `Captação NIS: ${fmt(flux.uptake / 2 * 100)}% · organificação: ${fmt(flux.organification / 1.2 * 100)}% · síntese T4: ${fmt(flux.coupling4 / 0.3 * 100)}% · liberação de T4 dos estoques: ${fmt((flux.release4 + flux.leak4) / 0.3 * 100)}% do fluxo basal.`;
  $('iodine-response').textContent = `Iodeto intracelular por unidade funcional: ${fmt(flux.intracellular * 100)}% do basal. Atividade após inibição: ${fmt(flux.inhibition * 100)}%; adaptação NIS: ${fmt(state.escape * 100)}%. Gatilhos didáticos, não doses de ingestão.`;
  $('adaptations').textContent = `Sítios não iodados de Tg: ${fmt(state.tg / BASELINE_STATE.tg * 100)}% · disfunção reversível: ${fmt(state.injury * 100)}% · sinal T3 central: ${fmt(state.centralT3 * 100)}% · adaptação periférica: ${fmt(state.peripheralD * 100)}% · reserva secretora hipofisária: ${fmt(state.pituitaryReserve * 100)}%.`;
  $('lesion-status').textContent = flux.lesion > 0 ? `Lesão ativa até o dia ${fmt(params.lesionStart + params.lesionDays)}.` : 'Lesão inativa. Alterar intensidade ou duração inicia uma nova janela a partir do dia atual.';
}
function reset() {
  pause(); params = { ...DEFAULT_PARAMS, ...scenarios[$('scenario').value].params };
  const scenario = scenarios[$('scenario').value];
  state = scenarioState(scenario);
  $('lesion-days').value = params.lesionDays;
  $('permanent').value = params.permanentFraction;
  $('escape').checked = params.escapeEnabled;
  history = [recordSample(state, params, $('scenario').value, 'Início do cenário', 'initial')];
  $('category').textContent = scenario.group;
  $('description').textContent = scenario.text;
  controls(); render();
}
function tick(days) {
  if (state.t >= 180) { pause(); return; }
  const duration = Math.min(days, 180 - state.t);
  for (let day = 0; day < duration; day++) {
    state = advance(state, params, Math.min(1, duration - day));
    history.push(recordSample(state, params, $('scenario').value));
  }
  render();
  if (state.t >= 180) { pause(); $('clock').textContent += ' · limite do experimento'; $('graph-clock').textContent = $('clock').textContent; }
}
$('scenario').addEventListener('change', reset);
$('reset').addEventListener('click', reset);
$('step').addEventListener('click', () => { pause(); tick(7); });
function togglePlayback() {
  if (timer) { pause(); return; }
  if (state.t >= 180) reset();
  $('play').textContent = $('graph-play').textContent = 'Pausar';
  timer = setInterval(() => tick(1), 500);
}
$('play').addEventListener('click', togglePlayback);
$('graph-play').addEventListener('click', togglePlayback);
$('graph-step').addEventListener('click', () => { pause(); tick(7); });
$('graph-reset').addEventListener('click', reset);
for (const [id, key] of bindings) {
  $(id).addEventListener('input', () => {
    const previous = params[key];
    params[key] = Number($(id).value) / 100;
    if (key === 'destruction') params.lesionStart = state.t;
    if (previous !== params[key]) logIntervention($(id).labels[0].childNodes[0].textContent.trim() + ': ' + fmt(previous * 100) + '% → ' + fmt(params[key] * 100) + '%');
    controls(); render();
    $('description').textContent = `${scenarios[$('scenario').value].text} Parâmetros personalizados a partir do dia ${fmt(state.t)}.`;
  });
}
$('lesion-days').addEventListener('change', () => {
  params.lesionDays = Math.max(1, Math.min(180, Number($('lesion-days').value) || 21));
  $('lesion-days').value = params.lesionDays;
  params.lesionStart = state.t;
  logIntervention('Nova janela de lesão: ' + params.lesionDays + ' dias');
  $('description').textContent = 'Experimento personalizado: nova janela de lesão configurada a partir do dia atual.';
  render();
});
$('permanent').addEventListener('change', () => {
  params.permanentFraction = Number($('permanent').value);
  logIntervention('Fração permanente da lesão: ' + fmt(params.permanentFraction * 100) + '%');
  $('description').textContent = 'Experimento personalizado: reversibilidade alterada para lesões futuras. Tecido já perdido não é recuperado.';
  render();
});
$('escape').addEventListener('change', () => { params.escapeEnabled = $('escape').checked; logIntervention('Escape ao excesso de iodeto: ' + (params.escapeEnabled ? 'ativado' : 'desativado')); render(); $('description').textContent = 'Experimento personalizado: escape ao excesso de iodeto alterado. Avance o tempo para observar a resposta.'; });

function logIntervention(label) {
  history.push(recordSample(state, params, $('scenario').value, label, 'intervention'));
}
const escapeText = text => String(text).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
function drawProfiles() {
  const visible = ids.filter(id => visibleHormones.has(id));
  const { xMax, yMax, step } = chartBounds(history, visible, BASELINE_STATE);
  const box = { left: 78, top: 30, width: 792, height: 248 };
  const x = day => box.left + day / xMax * box.width;
  const y = value => box.top + box.height * (1 - value / yMax);
  let svg = '<title id="profile-chart-title">Perfis hormonais do eixo tireoidiano</title><desc id="profile-chart-desc">Curvas selecionadas: ' + visible.map(id => id.toUpperCase()).join(', ') + '. Percentual do basal por dia; linha de referência em 100%.</desc>';
  for (let value = 0; value <= yMax + step / 10; value += step) {
    svg += '<line class="chart-grid" x1="' + box.left + '" x2="870" y1="' + y(value) + '" y2="' + y(value) + '"/><text x="68" y="' + (y(value) + 5) + '" text-anchor="end">' + fmt(value) + '%</text>';
  }
  for (let i = 0; i <= 4; i++) {
    const day = xMax * i / 4;
    svg += '<line class="chart-grid" x1="' + x(day) + '" x2="' + x(day) + '" y1="30" y2="278"/><text x="' + x(day) + '" y="302" text-anchor="middle">' + fmt(day) + '</text>';
  }
  svg += '<text x="78" y="18">% do basal</text><text x="474" y="329" text-anchor="middle">Dias do experimento</text>';
  svg += '<line class="basal-line" x1="78" x2="870" y1="' + y(100) + '" y2="' + y(100) + '"/>';
  const changes = history.filter(row => row.kind === 'intervention');
  const grouped = new Map();
  for (const change of changes) {
    if (!grouped.has(change.t)) grouped.set(change.t, []);
    grouped.get(change.t).push(change.event);
  }
  for (const [day, events] of grouped) {
    svg += '<g><title>' + escapeText('Dia ' + fmt(day) + ': ' + events.join('; ')) + '</title><line class="intervention-line" x1="' + x(day) + '" x2="' + x(day) + '" y1="30" y2="278"/><circle cx="' + x(day) + '" cy="30" r="4" fill="#e9bd82"/></g>';
  }
  for (const id of visible) {
    const points = history.map(row => x(row.t).toFixed(2) + ',' + y(percent(id, row[id])).toFixed(2)).join(' ');
    const last = history.at(-1);
    svg += '<polyline class="hormone-line" data-series="' + id + '" points="' + points + '" stroke="' + colors[id] + '"/>';
    svg += '<circle cx="' + x(last.t) + '" cy="' + y(percent(id, last[id])) + '" r="4" fill="' + colors[id] + '"><title>' + id.toUpperCase() + ': ' + fmt(percent(id, last[id])) + '% do basal</title></circle>';
  }
  $('thyroid-chart').innerHTML = svg;
  $('chart-caption').textContent = 'Dia ' + fmt(state.t) + ' · ' + history.filter(row => row.kind !== 'intervention').length + ' amostras · referência tracejada: 100% do basal · marcadores dourados: intervenções.';
  $('intervention-count').textContent = '(' + changes.length + ')';
  const items = changes.map(change => {
    const item = document.createElement('li');
    item.textContent = 'Dia ' + fmt(change.t) + ' — ' + change.event;
    return item;
  });
  if (!items.length) {
    const item = document.createElement('li'); item.textContent = 'Nenhuma variável personalizada neste cenário.'; items.push(item);
  }
  $('intervention-list').replaceChildren(...items);
}
for (const button of document.querySelectorAll('[data-hormone]')) {
  button.addEventListener('click', () => {
    const id = button.dataset.hormone;
    if (visibleHormones.has(id)) {
      if (visibleHormones.size === 1) return;
      visibleHormones.delete(id);
    } else visibleHormones.add(id);
    for (const item of document.querySelectorAll('[data-hormone]')) {
      const selected = visibleHormones.has(item.dataset.hormone);
      item.setAttribute('aria-pressed', String(selected));
      item.disabled = selected && visibleHormones.size === 1;
    }
    drawProfiles();
  });
}
$('export-csv').addEventListener('click', () => {
  const blob = new Blob([exportCSV(history, BASELINE_STATE)], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url; link.download = 'tireoide-' + $('scenario').value + '-dia-' + Math.round(state.t) + '.csv';
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
});
document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
reset();
