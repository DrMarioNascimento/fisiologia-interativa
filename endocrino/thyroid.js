import { BASELINE_STATE, DEFAULT_PARAMS, advance, initialState, flows } from './thyroid-model.js';
const bindings = [['capacity', 'thyroidFn'], ['replacement', 'levothyroxine'], ['conversion', 'deiodinase'], ['iodine', 'iodine'], ['nis', 'nis'], ['tpo', 'tpo'], ['pendrin', 'pendrin'], ['destruction', 'destruction'], ['trab', 'trab']];

const $ = (id) => document.getElementById(id);
import { scenarios, describeState } from './thyroid-scenarios.js';
let state, params, history, timer;
const ids = ['trh', 'tsh', 't4', 't3'];
const percent = (id, value) => 100 * value / BASELINE_STATE[id];
const fmt = (x) => x.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
function pause() { clearInterval(timer); timer = null; $('play').textContent = 'Iniciar'; }
function controls() {
  for (const [id, key] of bindings) {
    $(id).value = Math.round(params[key] * 100);
    $(`${id}-value`).textContent = `${Math.round(params[key] * 100)}%`;
  }
}
function render() {
  $('clock').textContent = `Dia ${fmt(state.t)}`;
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
  $('fluxes').textContent = `Captação NIS: ${fmt(flux.uptake / 1.5 * 100)}% · organificação: ${fmt(flux.organification * 100)}% · síntese T4: ${fmt(flux.coupling4 / 0.3 * 100)}% · liberação de T4 dos estoques: ${fmt((flux.release4 + flux.leak4) / 0.3 * 100)}% do fluxo basal.`;
  $('iodine-response').textContent = params.iodine > 2 ? `Excesso de iodeto: atividade relativa após inibição ${fmt(flux.inhibition * 100)}%; adaptação de escape ${fmt(state.escape * 100)}%. Curva didática, não limiar de ingestão humana.` : 'Sem gatilho de excesso de iodeto. Os valores de transporte e estoques mudam ao avançar o tempo.';
}
function reset() {
  pause(); params = { ...DEFAULT_PARAMS, ...scenarios[$('scenario').value].params };
  const scenario = scenarios[$('scenario').value];
  state = scenario.pretreatment
    ? { ...advance(initialState({ ...DEFAULT_PARAMS, ...scenario.pretreatment }), { ...DEFAULT_PARAMS, ...scenario.pretreatment }, 56), t: 0 }
    : initialState(params);
  $('escape').checked = params.escapeEnabled;
  history = [{ ...state }];
  $('category').textContent = scenario.group;
  $('description').textContent = scenario.text;
  controls(); render();
}
function tick(days) {
  if (state.t >= 180) { pause(); return; }
  state = advance(state, params, Math.min(days, 180 - state.t));
  history.push({ ...state }); render();
  if (state.t >= 180) { pause(); $('clock').textContent += ' · limite do experimento'; }
}
$('scenario').addEventListener('change', reset);
$('reset').addEventListener('click', reset);
$('step').addEventListener('click', () => { pause(); tick(7); });
$('play').addEventListener('click', () => {
  if (timer) { pause(); return; }
  if (state.t >= 180) reset();
  $('play').textContent = 'Pausar'; timer = setInterval(() => tick(1), 500);
});
for (const [id, key] of bindings) {
  $(id).addEventListener('input', () => {
    params[key] = Number($(id).value) / 100; controls();
    $('description').textContent = `${scenarios[$('scenario').value].text} Parâmetros personalizados a partir do dia ${fmt(state.t)}.`;
  });
}
$('escape').addEventListener('change', () => { params.escapeEnabled = $('escape').checked; $('description').textContent = 'Experimento personalizado: escape ao excesso de iodeto alterado. Avance o tempo para observar a resposta.'; });
document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
reset();
