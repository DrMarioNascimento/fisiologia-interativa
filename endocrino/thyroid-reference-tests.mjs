import { test } from 'node:test';
import assert from 'node:assert/strict';
import { referenceTrajectory } from './thyroid-reference.js';
import { scenarios } from './thyroid-scenarios.js';
import { DEFAULT_PARAMS, advance, scenarioState, BASELINE_STATE } from './thyroid-model.js';
import { recordSample, exportCSV } from './thyroid-recording.js';
test('Curva esperada já cobre 42 dias no instante zero',()=>{
 const r=referenceTrajectory(scenarios.graves);
 assert.equal(r[0].t,0);assert(r.some(x=>Math.abs(x.t-42)<1e-8));
 assert(r[42].t4>r[0].t4);assert(r[42].tsh<r[0].tsh);
});
test('Alterar o experimento preserva a referência original',()=>{
 const r=referenceTrajectory(scenarios.normal,42),before=JSON.stringify(r);
 const state=advance(scenarioState(scenarios.normal),{...DEFAULT_PARAMS,thyroidFn:0},42);
 assert(state.t4<.1);assert.equal(JSON.stringify(r),before);assert.equal(r[42].t4,1);
 assert(Object.isFrozen(r)&&Object.isFrozen(r[0]));
});
test('Referência corresponde ao cenário e ao estado inicial escolhidos',()=>{
 const r=referenceTrajectory(scenarios.hashimoto,7);
 assert.equal(r[0].t,0);assert(r[0].t4<.85&&r[0].tsh>1.2);
 const actual=advance(scenarioState(scenarios.hashimoto),{...DEFAULT_PARAMS,...scenarios.hashimoto.params},7);
 for(const k of ['t4','t3','tsh'])assert(Math.abs(r[7][k]-actual[k])<1e-9);
});
test('Trocar cenário gera sua própria referência e rejeita horizontes inválidos',()=>{
 const a=referenceTrajectory(scenarios.absent,7),b=referenceTrajectory(scenarios.normal,7);
 assert.equal(a[0].store4,0);assert.equal(b[0].store4,9);
 assert.throws(()=>referenceTrajectory(scenarios.normal,181),RangeError);
});
test('CSV identifica referência do modelo e seus parâmetros originais',()=>{
 const r=referenceTrajectory(scenarios.normal,1);
 const csv=exportCSV([recordSample(r[0],DEFAULT_PARAMS,'normal','Cenário original','reference')],BASELINE_STATE);
 assert(csv.includes('"reference"'));assert(csv.includes('"Cenário original"'));assert(csv.includes('"hht-shared-20261019"'));
});

