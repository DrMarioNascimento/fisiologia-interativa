import test from 'node:test';
import assert from 'node:assert/strict';
import { BASELINE_STATE as base, DEFAULT_PARAMS, advance } from './model.js';
import { scenarios, describeState } from './thyroid-scenarios.js';

const run = (name, days = 56) => advance({ ...base, t: 0 }, { ...DEFAULT_PARAMS, ...scenarios[name].params }, days);

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
