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
test('Nenhuma duração produz diagnóstico muscular',()=>{
 assert.match(muscleAssessment(end({}),defaults),/não classifica catabolismo/);
 assert.match(muscleAssessment(simulate({intensity:100})[50],defaults),/Janela aguda/);
 assert.match(muscleAssessment(end({days:28,autonomy:200}),defaults),/não classifica catabolismo nem prevê adaptação muscular/);
});
test('Basal mantém fator trófico e ciclo diário por 28 dias',()=>{
 const r=simulate({days:28});
 for(const x of r)assert.equal(x.capacity,1);
 assert.ok(Math.abs(r.at(-1).cortisol-r[0].cortisol)<.01);
});
test('CAR incremental atinge máximo entre 30 e 45 minutos; sem sono não há CAR',()=>{
 const r=simulate(),off=simulate({car:0});
 const peak=r.map((x,i)=>({t:x.t,d:x.cortisol-off[i].cortisol})).reduce((a,b)=>a.d>b.d?a:b);
 assert.ok(peak.t>=450&&peak.t<=465);
 for(const x of simulate({bed:7,wake:7}))assert.equal(x.awakening,0);
});
test('Pulsos impostos aparecem ao longo do dia e mínimo é noturno',()=>{
 const r=simulate(),peaks=r.filter((x,i)=>i>0&&i<r.length-1&&x.cortisol>r[i-1].cortisol&&x.cortisol>r[i+1].cortisol);
 assert.ok(peaks.length>=12);assert.ok(peaks.some(x=>x.h<6));assert.ok(peaks.some(x=>x.h>18));
 const low=r.reduce((a,b)=>a.cortisol<b.cortisol?a:b);assert.ok(low.h>=22||low.h<=2);
});
test('Hipófise e hipotálamo têm respostas de CRH distintas',()=>{
 const p=end({days:7,central:15}),h=end({days:7,hypothalamus:15});assert.ok(p.crh>h.crh);
});
test('Contexto nutricional não se apresenta como cálculo metabólico',()=>{
 assert.deepEqual(simulate({energy:40,protein:40,resistance:100}),simulate());
 const message=muscleAssessment(end({}),{...defaults,resistance:100});
 assert.doesNotMatch(message,/sessão com componente resistido/);assert.match(message,/não classifica/);
 assert.match(muscleAssessment(end({}),{...defaults,intensity:70,duration:60,resistance:100}),/sessão com componente resistido/);
});
test('Retirada mantém supressão prévia e interrompe apenas sinal exógeno',()=>{
 const r=simulate({days:28,exogenous:180,withdrawalDay:15}),before=r.find(x=>x.t===14*1440-10),after=r.find(x=>x.t===14*1440);
 assert.equal(before.exogenous,180);assert.equal(after.exogenous,0);
 assert.ok(after.capacity<1);assert.ok(Math.abs(after.capacity-before.capacity)<.001);
 assert.ok(r.at(-1).capacity>after.capacity);
 assert.equal(simulate({exogenous:180,withdrawalDay:15}).at(-1).exogenous,180);
});
test('Validação e execução são determinísticas',()=>{
 assert.throws(()=>simulate({days:365}));assert.throws(()=>simulate({stress:NaN}));assert.deepEqual(simulate({stress:50}),simulate({stress:50}));
});
