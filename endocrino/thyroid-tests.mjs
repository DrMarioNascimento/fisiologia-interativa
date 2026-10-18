import test from 'node:test';
import assert from 'node:assert/strict';
import { BASELINE_STATE as base, DEFAULT_PARAMS, advance, initialState, flows } from './thyroid-model.js';
import { scenarios, describeState } from './thyroid-scenarios.js';

const run = (name, days = 56) => {
  const p = { ...DEFAULT_PARAMS, ...scenarios[name].params };
  return advance(initialState(p), p, days);
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
  assert(flows(base, { ...DEFAULT_PARAMS, iodine: 5 }).inhibition < 0.1);
  const escape = experiment({ iodine: 5 }, 90);
  const blocked = experiment({ iodine: 5, escapeEnabled: false }, 90);
  assert(escape.t4 > blocked.t4 && escape.escape > 0.99);
});
test('Lesão libera reservas finitas, causa excesso transitório e depois deficiência', () => {
  assert(run('destructive', 7).t4 > 1);
  const late = run('destructive', 180);
  assert(late.t4 < 0.2 && late.tissue < 0.01 && late.store4 < 0.1);
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
  assert(Math.abs(state.t4 / base.t4 - Math.exp(-0.7)) < 0.001);
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
test('Todos os cenários permanecem finitos, não negativos e chegam a 180 dias', () => {
  for (const name of Object.keys(scenarios)) {
    const state = run(name, 180);
    assert(Math.abs(state.t - 180) < 0.001, name);
    for (const id of ['trh', 'tsh', 't4', 't3']) assert(Number.isFinite(state[id]) && state[id] >= 0, `${name}: ${id}`);
  }
});
