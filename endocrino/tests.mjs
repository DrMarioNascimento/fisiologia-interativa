import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import { DEFAULT_PARAMS, BASELINE_STATE, advance } from './model.js';
import { computeLabs, BASELINE_LABS, LAB_DEFS, formatLab, labStatus } from './labs.js';
import { AXES, PARAM_DEFS, formatParam } from './axes.js';
import { SCENARIOS } from './scenarios.js';
import { interpret } from './interpret.js';

const run=(id,days)=>{const c=SCENARIOS.find(s=>s.id===id),p={...DEFAULT_PARAMS,...c.params};const state=advance({...BASELINE_STATE,...c.statePatch},p,days);return {p,state,l:computeLabs(state,p)};};
test('Polidipsia não recebe rótulo de diabetes insípido',()=>{for(const d of [1,7,30,90]){const {p,l}=run('polidipsia',d);assert.equal(interpret('neuro',l,p).title,'Polidipsia primária');}});
test('Addison preserva cortisol baixo e ACTH alto até 90 dias',()=>{for(const d of [1,7,30,90]){const {p,l}=run('addison',d);assert.ok(l.cortisol<5);assert.ok(l.acth>60);assert.equal(interpret('adrenal',l,p).title,'Insuficiência adrenal primária');assert.ok(l.adrenalMass<=100);}});
test('Sheehan e haste preservam padrões centrais aos 30 e 90 dias',()=>{for(const id of ['sheehan','haste'])for(const d of [30,90]){const {p,l}=run(id,d);assert.equal(interpret('tireoide',l,p).title,'Hipotireoidismo central');assert.equal(interpret('adrenal',l,p).title,'Insuficiência adrenal central');}});
test('Hashimoto não encosta no teto antigo de TSH e mantém padrão primário',()=>{const c=SCENARIOS.find(s=>s.id==='hashimoto'),p={...DEFAULT_PARAMS,...c.params};let s={...BASELINE_STATE},peak=0;for(let i=0;i<180;i++){s=advance(s,p,.5);const l=computeLabs(s,p);peak=Math.max(peak,l.tsh);assert.ok(Object.values(s).every(Number.isFinite));if(i>=59)assert.equal(interpret('tireoide',l,p).title,'Hipotireoidismo primário');}assert.ok(peak<159);});
test('Todos os cenários permanecem finitos e não negativos por 90 dias',()=>{for(const c of SCENARIOS){const {state,l}=run(c.id,90);assert.ok(Object.values(state).every(x=>Number.isFinite(x)&&x>=0),c.id);assert.ok(Object.values(l).every(Number.isFinite),c.id);}});
test('Troca de cenário limpa tempo/histórico e restaurar alcança todos os eixos',()=>{
 const elements=new Map();const document={getElementById(id){if(!elements.has(id))elements.set(id,{textContent:'',innerHTML:'',value:'',hidden:false});return elements.get(id);}};
 const source=fs.readFileSync(new URL('./app.js',import.meta.url),'utf8').replace(/^import .*$/gm,'');
 const env={AXES,PARAM_DEFS,formatParam,BASELINE_STATE,DEFAULT_PARAMS,advance,computeLabs,BASELINE_LABS,LAB_DEFS,formatLab,labStatus,SCENARIOS,interpret,document,setInterval:()=>0};
 const evaluate=new Function(...Object.keys(env),source+'\nreturn {snapshot:()=>({state,params,history,running,scenarioId,axis})};');
 const ui=evaluate(...Object.values(env));const el=id=>document.getElementById(id);
 el('scenario').value='cushing-exo';el('scenario').onchange();for(let i=0;i<30;i++)el('step').onclick();
 el('tabs').onclick({target:{closest:()=>({dataset:{axis:'tireoide'}})}});
 el('scenario').value='hashimoto';el('scenario').onchange();let s=ui.snapshot();assert.equal(s.state.t,0);assert.equal(s.history.length,1);assert.equal(s.state.adrenalMass,BASELINE_STATE.adrenalMass);assert.equal(s.params.exoGlucocorticoid,0);
 el('sliders').oninput({target:{dataset:{param:'thyroidFn'},value:'0.3'}});
 el('tabs').onclick({target:{closest:()=>({dataset:{axis:'adrenal'}})}});assert.equal(el('cross-axis').hidden,false);
 el('restore').onclick();s=ui.snapshot();assert.deepEqual(s.params,DEFAULT_PARAMS);assert.equal(el('cross-axis').hidden,true);
 el('tabs').onclick({target:{closest:()=>({dataset:{axis:'ocitocina'}})}});el('scenario').value='parto';el('scenario').onchange();el('step').onclick();assert.ok(ui.snapshot().state.contraction>0);
});
