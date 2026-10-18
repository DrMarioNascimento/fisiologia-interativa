import { BASELINE_STATE, DEFAULT_PARAMS, advance } from './model.js';

const $ = (id) => document.getElementById(id);
const scenarios = {
  normal: { params: {}, text: 'Eixo íntegro: TRH estimula TSH, que estimula a tireoide. T3 e T4 limitam esse estímulo por feedback negativo.' },
  hashimoto: { params: { thyroidFn: 0.15 }, text: 'Hashimoto com hipotireoidismo primário: redução importante da capacidade glandular. O TSH aumenta para tentar compensar. O modelo não simula anticorpos nem a fase inicial de liberação de hormônios por destruição folicular.' },
  absent: { params: { thyroidFn: 0 }, text: 'Após tireoidectomia total, cessa a secreção glandular de T4 e T3. Os hormônios circulantes não desaparecem instantaneamente; sem reposição, caem progressivamente.' },
  replacement: { params: { thyroidFn: 0, levothyroxine: 1 }, text: 'A entrada de T4 exógeno substitui a produção ausente e fornece substrato para conversão periférica em T3. É um aporte relativo didático, não uma dose clínica.' },
  central: { params: { thyrotropeFn: 0.05 }, text: 'Hipotireoidismo central: a hipófise não fornece estímulo suficiente. T4 pode cair sem a elevação apropriada de TSH. TSH isolado não é adequado para avaliar essa situação.' },
  graves: { params: { trab: 5 }, text: 'Doença de Graves: anticorpos estimulam o receptor de TSH. A tireoide continua ativa mesmo quando o TSH hipofisário é suprimido pelo feedback.' },
  excess: { params: { levothyroxine: 2 }, text: 'Tireotoxicose por excesso de T4 exógeno: o aporte externo eleva os hormônios e suprime o TSH. Não é aumento primário da síntese pela tireoide.' },
};
let state, params, history, timer;
const ids = ['trh', 'tsh', 't4', 't3'];
const percent = (id, value) => 100 * value / BASELINE_STATE[id];
const fmt = (x) => x.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
function pause() { clearInterval(timer); timer = null; $('play').textContent = 'Iniciar'; }
function controls() {
  for (const [id, key] of [['capacity', 'thyroidFn'], ['replacement', 'levothyroxine'], ['conversion', 'deiodinase']]) {
    $(id).value = Math.round(params[key] * 100);
    $(`${id}-value`).textContent = `${Math.round(params[key] * 100)}%`;
  }
}
function render() {
  $('clock').textContent = `Dia ${fmt(state.t)}`;
  for (const id of ids) $(id).textContent = `${fmt(percent(id, state[id]))}% do basal`;
  const low = state.t4 < BASELINE_STATE.t4 * 0.75;
  const high = state.t4 > BASELINE_STATE.t4 * 1.35;
  $('feedback').textContent = low ? 'Menos T4 circulante: o freio sobre hipotálamo e hipófise diminui. A resposta depende da integridade desses órgãos.' : high ? 'Mais T4 circulante: o freio central aumenta, reduzindo o estímulo por TRH e TSH.' : 'O feedback está próximo da condição basal. Observe como ele muda ao alterar o aporte hormonal.';
  $('interpretation').textContent = low ? (params.thyrotropeFn < 0.2 ? 'T4 reduzido com resposta insuficiente de TSH: padrão central no modelo.' : 'T4 reduzido com tentativa de compensação por TSH: padrão primário no modelo.') : high ? 'T4 aumentado: a secreção hipofisária de TSH tende a ser suprimida. Em Graves, o estímulo pelo anticorpo permanece.' : 'T4 próximo do basal didático. Isso não representa diagnóstico de eutireoidismo; observe também TSH e a evolução.';
  const rows = history.slice(-12).map((s) => {
    const row = document.createElement('tr');
    for (const value of [fmt(s.t), ...ids.map((id) => `${fmt(percent(id, s[id]))}%`)]) {
      const cell = document.createElement('td'); cell.textContent = value; row.append(cell);
    }
    return row;
  });
  $('history').replaceChildren(...rows);
}
function reset() {
  pause(); params = { ...DEFAULT_PARAMS, ...scenarios[$('scenario').value].params };
  state = { ...BASELINE_STATE, t: 0 }; history = [{ ...state }];
  $('description').textContent = scenarios[$('scenario').value].text;
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
for (const [id, key] of [['capacity', 'thyroidFn'], ['replacement', 'levothyroxine'], ['conversion', 'deiodinase']]) {
  $(id).addEventListener('input', () => {
    params[key] = Number($(id).value) / 100; controls();
    $('description').textContent = `${scenarios[$('scenario').value].text} Parâmetros personalizados a partir do dia ${fmt(state.t)}.`;
  });
}
document.addEventListener('visibilitychange', () => { if (document.hidden) pause(); });
reset();
