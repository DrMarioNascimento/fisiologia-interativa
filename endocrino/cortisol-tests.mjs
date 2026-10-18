import test from 'node:test';
import assert from 'node:assert/strict';
import {defaults,scenarios,simulate,sleeping,sleepHours,muscleAssessment} from './cortisol-model.js';
const end=p=>simulate(p).at(-1);
test('Basal coincide com referência e todos os cenários permanecem finitos',()=>{
 for(const r of simulate())assert.equal(r.cortisol,r.baseline);
 for(const {values} of Object.values(scenarios))for(const r of simulate(values))for(const [k,v] of Object.entries(r))if(typeof v==='number')assert.ok(Number.isFinite(v),`${k} não finito`);
});
test('Sono atravessa meia-noite e permite turno diurno',()=>{
 assert.equal(sleepHours(defaults),8);assert.equal(sleeping(1,defaults),true);assert.equal(sleeping(12,defaults),false);
 const day={...defaults,bed:8,wake:16};assert.equal(sleeping(12,day),true);assert.equal(sleeping(23,day),false);
 assert.equal(sleepHours({...defaults,bed:7,wake:7}),0);
});
test('Primária eleva ACTH e reduz cortisol; central reduz ambos',()=>{
 const b=end({days:7}),p=end({days:7,adrenal:15}),c=end({days:7,central:15});
 assert.ok(p.cortisol<b.cortisol);assert.ok(p.acth>b.acth);assert.ok(c.acth<b.acth);assert.ok(c.cortisol<b.cortisol);
});
test('Autonomia adrenal suprime ACTH e exógeno não é cortisol endógeno',()=>{
 const b=end({days:7}),a=end({days:7,autonomy:170}),e=end({days:28,exogenous:180});
 assert.ok(a.cortisol>b.cortisol);assert.ok(a.acth<b.acth);assert.ok(e.cortisol<b.cortisol);assert.ok(e.acth<b.acth);assert.ok(e.capacity<1);assert.equal(e.effective,e.cortisol+180);
});
test('Exercício provoca resposta e recuperação em escalas distintas',()=>{
 const r=simulate({intensity:80,duration:60,exerciseHour:12}),at=m=>r.find(x=>x.t===m);
 assert.ok(at(750).sym>at(710).sym);assert.ok(at(810).cortisol>at(810).baseline);
 assert.ok(at(900).sym<at(750).sym);assert.ok(at(1380).cortisol<at(810).cortisol);
});
test('Fase se desloca gradualmente e déficit de sono se acumula',()=>{
 const r=simulate({days:7,bed:2,wake:7,phase:9});assert.ok(r[0].phase<.1);assert.ok(r.at(-1).phase>7);assert.ok(r.at(-1).debt>r[0].debt);
});
test('Pico agudo não equivale a perda muscular; exposição prolongada muda interpretação',()=>{
 assert.match(muscleAssessment(end({}),defaults),/Sem sinal/);
 assert.match(muscleAssessment(simulate({intensity:100})[50],defaults),/Janela aguda/);
 assert.match(muscleAssessment(end({days:28,autonomy:200}),defaults),/catabolismo/);
});
test('Validação e execução são determinísticas',()=>{
 assert.throws(()=>simulate({days:365}));assert.throws(()=>simulate({stress:NaN}));assert.deepEqual(simulate({stress:50}),simulate({stress:50}));
});
