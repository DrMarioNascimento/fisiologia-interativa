import test from 'node:test';
import assert from 'node:assert/strict';
import { BASELINE_STATE as base, DEFAULT_PARAMS, advance, initialState, flows, iodineContent, scenarioState } from './thyroid-model.js';
import { scenarios, describeState } from './thyroid-scenarios.js';

const run = (name, days = 56) => {
  const p = { ...DEFAULT_PARAMS, ...scenarios[name].params };
  return advance(scenarioState(scenarios[name]), p, days);
};
const experiment = (changes, days) => advance(initialState(), { ...DEFAULT_PARAMS, ...changes }, days);
test('TPO bloqueada preserva liberação inicial, mas esgota reservas', () => {
  assert.equal(flows(base, { ...DEFAULT_PARAMS, tpo: 0 }).coupling4, 0);
  assert(flows(base, { ...DEFAULT_PARAMS, tpo: 0 }).release4 > 0);
  assert(experiment({ tpo: 0 }, 7).t4 > run('absent', 7).t4);
  assert(experiment({ tpo: 0 }, 120).store4 < base.store4 * 0.01);
});
test('NIS e iodeto limitam síntese; pendrina possui transporte residual', () => {
  assert.equal(flows(base, { ...DEFAULT_PARAMS, nis: 0 }).uptake, 0);
  assert.equal(flows(base, { ...DEFAULT_PARAMS, iodine: 0 }).uptake, 0);
  for (const changes of [{ nis: 0 }, { iodine: 0 }]) assert(experiment(changes, 90).t4 < 0.2);
  assert(flows(base, { ...DEFAULT_PARAMS, pendrin: 0 }).apical > 0);
  assert(experiment({ pendrin: 0 }, 1).iodide > base.iodide);
});
test('Excesso inibe organificação e escape permite recuperação', () => {
  assert.equal(flows(base, { ...DEFAULT_PARAMS, iodine: 5 }).inhibition, 1, 'Exposição externa não bloqueia instantaneamente um compartimento ainda basal');
  const early = experiment({ iodine: 5 }, 1);
  assert(flows(early, { ...DEFAULT_PARAMS, iodine: 5 }).inhibition < 0.2);
  const escape = experiment({ iodine: 5 }, 90);
  const blocked = experiment({ iodine: 5, escapeEnabled: false }, 90);
  assert(escape.t4 > blocked.t4 && escape.escape > 0);
  assert(escape.t4 > 0.85 && escape.t4 < 1.15, 'Escape aproxima função basal apesar da exposição mantida');
});
test('Lesão libera reservas finitas, causa excesso transitório e depois deficiência', () => {
  assert(run('destructive', 7).t4 > 1);
  const late = run('destructive', 180);
  assert(late.t4 < 0.85 && late.tissue > 0.3 && late.tissue < 0.4);
  assert(Math.abs(run('destructive', 30).tissue - late.tissue) < 1e-10, 'Perda cessa ao terminar a janela');
});
test('Conversão consome T4 além de fornecer T3', () => {
  const stopped = experiment({ deiodinase: 0 }, 1);
  assert(stopped.t4 > base.t4 && stopped.t3 < base.t3);
});
test('Integração em etapas equivale ao avanço contínuo', () => {
  const p = { ...DEFAULT_PARAMS, tpo: 0.2 };
  const direct = advance(initialState(), p, 14);
  const split = advance(advance(initialState(), p, 7), p, 7);
  for (const key of Object.keys(base)) assert(Math.abs(direct[key] - split[key]) < 1e-8, key);
});

test('Combinações extremas dos novos controles permanecem não negativas e finitas', () => {
  for (let i = 0; i < 16; i++) {
    const p = { ...DEFAULT_PARAMS, iodine: i & 1 ? 5 : 0, nis: i & 2 ? 1.5 : 0, tpo: i & 4 ? 1 : 0, pendrin: i & 8 ? 1.5 : 0, trab: 5, deiodinase: 1.5, destruction: 0.1 };
    const s = advance(initialState(p), p, 180);
    for (const [key, value] of Object.entries(s)) assert(Number.isFinite(value) && value >= 0, `${i}: ${key}`);
  }
});
test('Equilíbrio basal e Hashimoto com função preservada', () => {
  for (const name of ['normal', 'hashimotoPreserved']) {
    const state = run(name, 180);
    for (const id of ['trh', 'tsh', 't4', 't3']) assert(Math.abs(state[id] / base[id] - 1) < 0.03, `${name}: ${id}`);
  }
});
test('Hashimoto com perda funcional reduz T4 e eleva TSH', () => {
  const state = run('hashimoto');
  assert(state.t4 < base.t4 && state.tsh > base.tsh);
});
test('Tireoidectomia: T4 decai com meia-vida aproximada de sete dias', () => {
  const state = run('absent', 7);
  assert(state.t4 > 0.45 && state.t4 < 0.51, 'Conversão adaptativa permite pequena variação da meia-vida basal');
  assert(state.t3 > 0, 'T4 residual mantém conversão');
  assert(run('absent').tsh > base.tsh);
});
test('Hipotireoidismo central não gera elevação apropriada de TSH', () => {
  const state = run('central');
  assert(state.t4 < base.t4 && state.tsh < base.tsh);
});
test('Graves eleva T4/T3 apesar da supressão de TSH', () => {
  const state = run('graves');
  assert(state.t4 > base.t4 && state.t3 > base.t3 && state.tsh < base.tsh);
});
test('T4 exógeno causa excesso sem TRAb', () => {
  const state = run('excess');
  assert(state.t4 > base.t4 && state.tsh < base.tsh);
  assert.equal(scenarios.excess.params.trab ?? 0, 0);
});
test('Reposição começa em deficiência e recupera T4/T3 sem regenerar a glândula', () => {
  const before = run('absent');
  const params = { ...DEFAULT_PARAMS, ...scenarios.replacement.params };
  const after = advance({ ...before, t: 0 }, params, 56);
  assert(after.t4 > before.t4 && after.t3 > before.t3 && after.tsh < before.tsh);
  assert.equal(params.thyroidFn, 0);
});
test('Conversão periférica reduzida diminui T3', () => {
  const state = advance({ ...base, t: 0 }, { ...DEFAULT_PARAMS, deiodinase: 0 }, 56);
  assert(state.t3 < base.t3);
});
test('Interpretação considera T3 isolado e TSH observado', () => {
  const highT3 = describeState({ ...base, t3: base.t3 * 2, tsh: base.tsh * 0.2 }, base, DEFAULT_PARAMS);
  assert.match(highT3.interpretation, /excesso hormonal/);
  const lowT4 = describeState({ ...base, t4: base.t4 * 0.5 }, base, DEFAULT_PARAMS);
  assert.match(lowT4.interpretation, /sem aumento apropriado de TSH/);
  const lowT3 = describeState({ ...base, t3: base.t3 * 0.5 }, base, DEFAULT_PARAMS);
  assert.match(lowT3.interpretation, /não diagnostica/);
});
test('Balanço glandular de iodo fecha em cenários e intervenções', () => {
  for (const changes of [{}, { tpo: 0 }, { nis: 0 }, { iodine: 5, escapeEnabled: false }, { pendrin: 0 }, { destruction: 0.1 }, { trab: 5 }]) {
    const s = experiment(changes, 180);
    assert(Math.abs(iodineContent(s) - iodineContent(base) - s.iodineIn + s.iodineOut) < 1e-7, JSON.stringify(changes));
  }
});
test('Iodeto sem organificação se aproxima de platô, sem crescimento ilimitado', () => {
  const p = { ...DEFAULT_PARAMS, tpo: 0 };
  const first = advance(initialState(), p, 365);
  const later = advance(first, p, 365);
  assert(Math.abs(later.colloid - first.colloid) / first.colloid < 0.02);
  assert(Math.abs(later.iodide - first.iodide) / first.iodide < 0.02);
});
test('DIT é processado e iodeto reciclado no tireócito mesmo com TPO bloqueada', () => {
  assert(flows(base, { ...DEFAULT_PARAMS, tpo: 0 }).recycleD > 0);
  assert(experiment({ tpo: 0 }, 7).dit < base.dit);
  const empty = { ...base, tg: 0 };
  assert.equal(flows(empty, DEFAULT_PARAMS).organification, 0);
});
test('Tg tem capacidade finita e respeita remoção por lesão', () => {
  const count = s => s.tg + s.mit + s.dit + 2 * (s.store4 + s.store3);
  const normal = experiment({}, 180);
  assert(Math.abs(count(normal) - 36) < 1e-8);
  assert(count(run('destructive')) < count(normal));
});
test('Hashimoto começa em deficiência crônica com reservas ajustadas', () => {
  const s = scenarioState(scenarios.hashimoto);
  assert.equal(s.t, 0);
  assert(s.t4 < 0.85 && s.tsh > 1.2 && s.store4 < base.store4);
  assert(Math.abs(run('hashimoto', 7).t4 - s.t4) < 0.01);
});
test('Lesão transitória recupera função sem regenerar tecido perdido', () => {
  const early = run('transient', 30);
  const later = run('transient', 180);
  assert.equal(later.tissue, 1);
  assert(later.injury < early.injury && later.t4 > early.t4);
  assert(later.t4 > run('destructive', 180).t4);
});
test('Conversão central independe do controle periférico e TSH mantém memória', () => {
  const a = experiment({ deiodinase: 0 }, 1);
  assert(a.centralT3 > a.t3);
  const high = experiment({ levothyroxine: 2 }, 90);
  const recovered = advance(high, DEFAULT_PARAMS, 7);
  assert(high.pituitaryReserve < 0.5);
  assert(recovered.pituitaryReserve < 0.8);
});
test('Retirar bloqueio restaura síntese e recupera hormônios sem instabilidade', () => {
  const blocked = experiment({ tpo: 0 }, 90);
  const restored = advance(blocked, DEFAULT_PARAMS, 180);
  assert(restored.t4 > blocked.t4 && restored.dit > blocked.dit);
  assert(restored.t4 > 0.7 && restored.t4 < 1.3);
});
test('Reduzir passo mantém as respostas e a janela termina no instante correto', () => {
  for (const changes of [{ trab: 5 }, { iodine: 5 }, { destruction: 0.1, lesionDays: 7 }]) {
    const p = { ...DEFAULT_PARAMS, ...changes };
    const a = advance(initialState(), p, 30);
    const b = advance(initialState(), p, 30, 0.0025);
    for (const key of ['t4', 't3', 'tsh', 'mit', 'dit']) assert(Math.abs(a[key] - b[key]) / Math.max(0.1, b[key]) < 0.01, key);
  }
  const p = { ...DEFAULT_PARAMS, destruction: 0.05, lesionDays: 7 };
  const s = advance(initialState(), p, 7);
  assert.equal(flows(s, p).lesion, 0);
  const split = advance(s, p, 7);
  const direct = advance(initialState(), p, 14);
  assert(Math.abs(split.tissue - direct.tissue) < 1e-9);
});
test('Entradas inválidas são rejeitadas', () => {
  for (const changes of [{ permanentFraction: 2 }, { lesionDays: -1 }, { iodine: NaN }]) assert.throws(() => experiment(changes, 1));
});
test('Todos os cenários permanecem finitos, não negativos e chegam a 180 dias', () => {
  for (const name of Object.keys(scenarios)) {
    const state = run(name, 180);
    assert(Math.abs(state.t - 180) < 0.001, name);
    for (const id of ['trh', 'tsh', 't4', 't3']) assert(Number.isFinite(state[id]) && state[id] >= 0, `${name}: ${id}`);
  }
});
