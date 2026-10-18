import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs';
import { DEFAULT_PARAMS, BASELINE_STATE, advance, step, DT, waterFlows, waterLimitReached } from './model.js';
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
 const env={AXES,PARAM_DEFS,formatParam,BASELINE_STATE,DEFAULT_PARAMS,advance,waterLimitReached,computeLabs,BASELINE_LABS,LAB_DEFS,formatLab,labStatus,SCENARIOS,interpret,document,setInterval:()=>0};
 const evaluate=new Function(...Object.keys(env),source+'\nreturn {snapshot:()=>({state,params,history,running,scenarioId,axis})};');
 const ui=evaluate(...Object.values(env));const el=id=>document.getElementById(id);
 el('scenario').value='cushing-exo';el('scenario').onchange();for(let i=0;i<30;i++)el('step').onclick();
 el('tabs').onclick({target:{closest:()=>({dataset:{axis:'tireoide'}})}});
 el('scenario').value='hashimoto';el('scenario').onchange();let s=ui.snapshot();assert.equal(s.state.t,0);assert.equal(s.history.length,1);assert.equal(s.state.adrenalMass,BASELINE_STATE.adrenalMass);assert.equal(s.params.exoGlucocorticoid,0);
 el('sliders').oninput({target:{dataset:{param:'thyroidFn'},value:'0.3',setAttribute(){}}});
 el('tabs').onclick({target:{closest:()=>({dataset:{axis:'adrenal'}})}});assert.equal(el('cross-axis').hidden,false);
 el('restore').onclick();s=ui.snapshot();assert.deepEqual(s.params,DEFAULT_PARAMS);assert.equal(el('cross-axis').hidden,true);
 el('tabs').onclick({target:{closest:()=>({dataset:{axis:'ocitocina'}})}});el('scenario').value='parto';el('scenario').onchange();el('step').onclick();assert.ok(ui.snapshot().state.contraction>0);
});

test('Falha central inicial nunca é rotulada hipertireoidismo subclínico',()=>{for(const id of ['central','sheehan','haste'])for(const d of [0.1,0.5,1,7,30]){const {p,l}=run(id,d);assert.doesNotMatch(interpret('tireoide',l,p).title,/Hipertireoidismo/);}});
test('Sucção reduz dopamina e aumenta prolactina/ocitocina e ejeção',()=>{const {l}=run('lactacao',7);assert.ok(l.dopamine<BASELINE_LABS.dopamine);assert.ok(l.prl>BASELINE_LABS.prl);assert.ok(l.oxytocin>BASELINE_LABS.oxytocin);assert.ok(l.milk>0);});
test('SIADH em instalação não aparece em equilíbrio e prevalece na combinação com água alta',()=>{for(const days of [.1,1,7,30]){const {p,l}=run('siadh',days);assert.notEqual(interpret('neuro',l,p).title,'Osmorregulação em equilíbrio');}const p={...DEFAULT_PARAMS,waterAccess:3,ectopicAdh:12};const l=computeLabs(advance(BASELINE_STATE,p,7),p);assert.notEqual(interpret('neuro',l,p).title,'Polidipsia primária');assert.ok(l.uosm>100);});
test('Deficiência e resistência simultâneas ao ADH são identificadas como combinação',()=>{const p={...DEFAULT_PARAMS,magnocellularFn:.04,renalAdhSensitivity:.04};const l=computeLabs(advance(BASELINE_STATE,p,7),p);assert.equal(interpret('neuro',l,p).title,'Deficiência e resistência combinadas ao ADH');});
test('Perda completa de corticotrofos não mantém cortisol por piso artificial',()=>{const p={...DEFAULT_PARAMS,corticotropeFn:0};const l=computeLabs(advance(BASELINE_STATE,p,90),p);assert.ok(l.acth<1e-10);assert.ok(l.cortisol<1e-10);});
test('Perda de haste compromete transporte de ADH e ocitocina',()=>{const p={...DEFAULT_PARAMS,stalk:0};const l=computeLabs(advance(BASELINE_STATE,p,7),p);assert.ok(l.adh<1e-10);assert.ok(l.oxytocin<1e-10);assert.ok(l.urine>3);});
test('Água obedece conservação de massa e sódio deriva da osmolalidade',()=>{for(const id of ['normal','di-central','siadh','polidipsia','hemorragia']){const {p,state}=run(id,.5),flows=waterFlows(state,p),next=step(state,p,0.0001);assert.ok(Math.abs((next.tbw-state.tbw)/.0001-flows.balance)<1e-8);const l=computeLabs(state,p);assert.ok(Math.abs(l.posm-(2*l.na+10))<1e-9);assert.equal(l.waterBalance,flows.balance);}});
test('Sem água, limite físico interrompe tempo e sinaliza desequilíbrio',()=>{const p={...DEFAULT_PARAMS,waterAccess:0};const s=advance(BASELINE_STATE,p,90);assert.ok(s.t<90);assert.ok(waterLimitReached(s,p));assert.ok(waterFlows(s,p).balance<0);const again=advance(s,p,30);assert.equal(again.t,s.t);assert.match(interpret('neuro',computeLabs(s,p),p).title,/Limite/);});
test('Avanço fracionário conserva tempo; tempo negativo e NaN são rejeitados',()=>{const s=advance(BASELINE_STATE,DEFAULT_PARAMS,.003);assert.ok(Math.abs(s.t-.003)<1e-12);assert.throws(()=>advance(s,DEFAULT_PARAMS,-1),RangeError);assert.throws(()=>advance(s,DEFAULT_PARAMS,NaN),RangeError);});
test('Basal permanece estacionário até 365 dias',()=>{const s=advance(BASELINE_STATE,DEFAULT_PARAMS,365);for(const [key,value] of Object.entries(BASELINE_STATE)){if(key==='t')continue;assert.ok(Math.abs(s[key]-value)/Math.max(1,Math.abs(value))<.005,key);}});
test('Respostas direcionais dos principais controles preservam os mecanismos',()=>{
 const changes=[['thyroidFn',.1,'ft4',-1],['thyroidFn',.1,'tsh',1],['iodine',.1,'ft4',-1],['methimazole',.8,'ft4',-1],['levothyroxine',2,'tsh',-1],['levothyroxine',2,'ft4',1],['deiodinase',.4,'t3',-1],['adrenalFn',.08,'cortisol',-1],['adrenalFn',.08,'acth',1],['stress',2.5,'cortisol',1],['corticotropeFn',.1,'cortisol',-1],['testicularFn',.15,'testo',-1],['testicularFn',.15,'lh',1],['gnrhDrive',.01,'lh',-1],['exoTestosterone',2.5,'lh',-1],['somatostatinTone',3,'gh',-1],['somatostatinTone',3,'tsh',-1],['ghrhDrive',3,'gh',1],['liverIgf',.25,'igf1',-1],['liverIgf',.25,'gh',1],['somatotropeFn',.08,'gh',-1],['dopamineTone',3,'prl',-1],['d2Blockade',.85,'prl',1],['magnocellularFn',.04,'urine',1],['renalAdhSensitivity',.04,'adh',1],['waterAccess',3,'na',-1],['ectopicAdh',12,'na',-1],['bloodVolume',.78,'adh',1],['labor',.9,'contraction',1]];
 for(const [key,value,lab,sign] of changes){const p={...DEFAULT_PARAMS,[key]:value},l=computeLabs(advance(BASELINE_STATE,p,30),p);assert.ok(sign*(l[lab]-BASELINE_LABS[lab])>0,`${key} -> ${lab}`);}
});
test('Suspensão da sucção e do estímulo cervical permite relaxamento',()=>{for(const id of ['lactacao','parto']){const {state,l}=run(id,1);const immediate=computeLabs(state,DEFAULT_PARAMS);assert.ok(immediate.milk>0,'A atividade residual acompanha ocitocina, sem zerar artificialmente ao remover sucção');const end=computeLabs(advance(state,DEFAULT_PARAMS,1),DEFAULT_PARAMS);assert.ok(end.oxytocin<l.oxytocin);assert.ok(end.contraction<.001);assert.ok(end.milk<.001);}});
test('Redução da etapa numérica mantém resultados dos cenários críticos',()=>{for(const id of ['hashimoto','addison','sheehan','siadh','parto']){const c=SCENARIOS.find(s=>s.id===id),p={...DEFAULT_PARAMS,...c.params};let fine={...BASELINE_STATE,...c.statePatch};for(let i=0;i<7/(DT/2);i++)fine=step(fine,p,DT/2);const coarse=advance({...BASELINE_STATE,...c.statePatch},p,7);for(const k of ['t4','tsh','acth','cortisolEndo','adh','tbw','oxytocin','contraction'])assert.ok(Math.abs(fine[k]-coarse[k])/Math.max(1,Math.abs(fine[k]))<.025,`${id}:${k}`);}});
test('Controles nos extremos e 64 combinações reproduzíveis permanecem finitos',()=>{
 const check=p=>{const s=advance(BASELINE_STATE,p,30),l=computeLabs(s,p);assert.ok(Object.values(s).every(x=>Number.isFinite(x)&&x>=0));assert.ok(Object.values(l).every(Number.isFinite));};
 for(const [key,d] of Object.entries(PARAM_DEFS))for(const v of [d.min,d.max])check({...DEFAULT_PARAMS,[key]:v});
 let seed=20261018;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
 for(let i=0;i<64;i++){const p={...DEFAULT_PARAMS};for(const [key,d] of Object.entries(PARAM_DEFS))if(random()<.2)p[key]=d.min+(d.max-d.min)*random();check(p);}
});

function interfaceHarness(){
 const elements=new Map();let interval,blob,downloaded=false;
 const document={getElementById(id){if(!elements.has(id))elements.set(id,{textContent:'',innerHTML:'',value:'',hidden:false});return elements.get(id);},createElement(){return {click(){downloaded=true;}};}};
 const source=fs.readFileSync(new URL('./app.js',import.meta.url),'utf8').replace(/^import .*$/gm,'');
 const env={AXES,PARAM_DEFS,formatParam,BASELINE_STATE,DEFAULT_PARAMS,advance,waterLimitReached,computeLabs,BASELINE_LABS,LAB_DEFS,formatLab,labStatus,SCENARIOS,interpret,document,setInterval:fn=>{interval=fn;},setTimeout:()=>0,URL:{createObjectURL(b){blob=b;return 'blob:teste';},revokeObjectURL(){}}};
 const ui=new Function(...Object.keys(env),source+'\nreturn {snapshot:()=>({state,params,history,running,scenarioId,axis})};')(...Object.values(env));
 const el=id=>document.getElementById(id);const axis=id=>el('tabs').onclick({target:{closest:()=>({dataset:{axis:id}})}});
 const input=(key,value)=>el('sliders').oninput({target:{dataset:{param:key},value:String(value),setAttribute(){}}});
 const scenario=id=>{el('scenario').value=id;el('scenario').onchange();};
 return {ui,el,axis,input,scenario,tick:()=>interval(),getBlob:()=>blob,wasDownloaded:()=>downloaded};
}
test('Interface atualiza explicação mesmo com título igual',()=>{const h=interfaceHarness();h.axis('neuro');h.scenario('di-central');h.el('step').onclick();const title=h.el('interpret-title').textContent;assert.match(h.el('interpret-points').innerHTML,/próximo da faixa/);h.input('waterAccess',.25);h.el('step').onclick();assert.equal(h.el('interpret-title').textContent,title);assert.match(h.el('interpret-points').innerHTML,/sódio está elevado/);});
test('Interface não promete reflexo de ocitocina quando síntese foi bloqueada',()=>{const h=interfaceHarness();h.axis('ocitocina');h.scenario('parto');h.input('magnocellularFn',0);h.el('step').onclick();assert.match(h.el('interpret-title').textContent,/comprometida/);assert.ok(h.ui.snapshot().state.contraction<.001);});
test('Interface inicia, pausa, interrompe no limite e permite recuperação',()=>{const h=interfaceHarness();h.el('speed').value='.5';h.el('play').onclick();h.tick();assert.ok(h.ui.snapshot().state.t>0);h.el('pause').onclick();const paused=h.ui.snapshot().state.t;h.tick();assert.equal(h.ui.snapshot().state.t,paused);h.axis('neuro');h.input('waterAccess',0);for(let i=0;i<30;i++)h.el('step').onclick();assert.equal(h.el('model-limit').hidden,false);assert.equal(h.el('play').disabled,true);h.input('waterAccess',1);assert.equal(h.el('model-limit').hidden,true);assert.equal(h.el('play').disabled,false);h.el('step').onclick();assert.ok(h.ui.snapshot().state.tbw>28);});
test('CSV exporta a janela do eixo ativo com tempo e unidades',async()=>{const h=interfaceHarness();h.axis('neuro');h.el('step').onclick();h.el('export').onclick();assert.ok(h.wasDownloaded());const text=await h.getBlob().text();assert.match(text,/"dia";/);assert.match(text,/Balanço hídrico/);assert.match(text,/L\/dia/);assert.equal(text.trim().split('\r\n').length,3);});
test('Interface distingue faixa normal de equilíbrio dinâmico após estímulo',()=>{const h=interfaceHarness();h.scenario('graves');assert.match(h.el('interpret-title').textContent,/evolução/);h.el('reset').onclick();assert.match(h.el('interpret-title').textContent,/equilíbrio/);});
