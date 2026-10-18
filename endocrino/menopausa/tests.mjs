import assert from 'node:assert/strict';
import {test} from 'node:test';
import fs from 'node:fs';
import * as model from './model.js';
import {endometriumSVG,tissueState} from '../ciclo/tissues.js';
const {STAGES,createState,advance,referenceAt,effects}=model;
const run=(id,forcing={},days=90)=>advance(createState(id),id,days,forcing);
test('Etapas têm trajetórias distintas e marco retrospectivo de 12 meses',()=>{assert.equal(STAGES.find(s=>s.id==='menopausa').months,12);const a=referenceAt('peri-inicial',0),b=referenceAt('peri-inicial',25);assert.notEqual(a.period,b.period);assert.ok(referenceAt('peri-tardia',1).period>=60);for(const id of ['menopausa','pos']){assert.equal(referenceAt(id,0).cycle,null);assert.equal(referenceAt(id,200).ovulatory,false);}});
test('Fisiologia esperada ovula na fase reprodutiva e inclui anovulação na transição',()=>{const a=run('reprodutiva',{},120),b=run('peri-inicial',{},120),c=run('peri-tardia',{},120);assert.ok(a.ovulations>=3);assert.ok(b.ovulations<a.ovulations);assert.ok(c.ovulations<b.ovulations);for(const id of ['menopausa','pos'])assert.equal(run(id).ovulations,0);});
test('Pós-menopausa conserva padrão de baixa produção ovariana e gonadotrofinas altas',()=>{const s=run('pos');assert.ok(s.e2<20&&s.p4<1&&s.fsh>40&&s.lh>20&&s.inhibin<3);assert.ok(s.endo<4);});
test('E2 maior suprime FSH/LH livres e modifica sinal endometrial e ósseo',()=>{const base=run('pos'),higher=run('pos',{e2:100});assert.equal(higher.e2,100);assert.ok(higher.fsh<base.fsh);assert.ok(higher.lh<base.lh);assert.ok(higher.endo>base.endo);assert.ok(effects(higher,'pos').boneSignal<effects(base,'pos').boneSignal);assert.equal(effects(higher,'pos').unopposed,true);});
test('FSH imposto não recria folículos, ovulação ou progesterona após menopausa',()=>{const s=run('pos',{fsh:150});assert.equal(s.fsh,150);assert.equal(s.ovulations,0);assert.equal(s.e2,12);assert.equal(s.p4,.2);});
test('LH suprimido impede ovulação e elevação lútea de progesterona',()=>{let s=createState('reprodutiva'),max=0;for(let d=0;d<56;d++){s=advance(s,'reprodutiva',1,{lh:0});max=Math.max(max,s.p4);}assert.equal(s.ovulations,0);assert.ok(max<1);});
test('P4 atua em combinação com E2; não prolifera sozinha',()=>{const alone=run('pos',{p4:10}),both=run('pos',{e2:100,p4:10}),unopposed=run('pos',{e2:100});assert.ok(alone.endo<4);assert.equal(effects(alone,'pos').secretory,false);assert.equal(effects(both,'pos').secretory,true);assert.equal(effects(both,'pos').unopposed,false);assert.ok(both.lh<unopposed.lh);});
test('Remoção das imposições permite recuperação dos hormônios livres',()=>{const p=run('pos',{e2:100,p4:10},30),r=advance(p,'pos',60);assert.ok(Math.abs(r.e2-12)<.01);assert.ok(Math.abs(r.fsh-72)<1);assert.ok(r.p4<1);});
test('Extremos e combinações permanecem finitos em todas as etapas',()=>{for(const s of STAGES)for(const f of [{},{e2:0},{e2:400},{p4:25},{fsh:0},{fsh:150},{lh:100},{e2:400,p4:25,fsh:150,lh:100},{e2:0,p4:0,fsh:0,lh:0}]){const r=run(s.id,f,240);for(const [k,v]of Object.entries(r))assert.ok(Number.isFinite(v),s.id+':'+k);for(const k of Object.keys(model.HORMONES))assert.ok(r[k]>=0);assert.ok(r.endo>=1&&r.endo<=14);for(const [k,v]of Object.entries(f))assert.equal(r[k],v);}});
test('Etapa e entradas inválidas são rejeitadas',()=>{assert.throws(()=>createState('inexistente'),RangeError);assert.throws(()=>advance(createState('pos'),'pos',-1),RangeError);assert.throws(()=>run('pos',{e2:NaN}),RangeError);assert.throws(()=>run('pos',{e2:401}),RangeError);});
function harness(){const elements=new Map();let interval;const el=id=>{if(!elements.has(id))elements.set(id,{value:'1',innerHTML:'',textContent:'',checked:false,disabled:false,dataset:{}});return elements.get(id);};let downloaded,blob;const document={getElementById:el,body:{append(){}},createElement:()=>({click(){downloaded=this.download;},remove(){}})};const env={Blob,URL:{createObjectURL:b=>{blob=b;return "blob:test";},revokeObjectURL(){}},setTimeout:fn=>fn(),...model,endometriumSVG,tissueState,document,setInterval:fn=>{interval=fn;}};const source=fs.readFileSync(new URL('./app.js',import.meta.url),'utf8').replace(/^import .*$/gm,'');const ui=new Function(...Object.keys(env),source+'\nreturn {snapshot:()=>({stageId,state,expected,forcing,history,running})};')(...Object.values(env));return {ui,el,download:()=>({name:downloaded,blob}),tick:()=>interval(),stage:id=>el('stages').onclick({target:{closest:()=>({dataset:{stage:id}})}}),fix:(id,value)=>{el('h-'+id).value=value;el('sliders').onchange({target:{dataset:{fix:id},checked:true}});},input:(id,value)=>el('sliders').oninput({target:{dataset:{hormone:id},value}})};}
test('Interface fixa hormônio, preserva referência livre e restaura todo o experimento',()=>{const h=harness();h.stage('pos');h.fix('e2',100);assert.equal(h.ui.snapshot().state.e2,100);assert.equal(h.ui.snapshot().expected.e2,12);assert.equal(h.el('h-e2').disabled,false);h.el('step').onclick();assert.equal(Math.round(h.ui.snapshot().state.t),7);assert.ok(h.ui.snapshot().state.fsh<h.ui.snapshot().expected.fsh);h.input('e2',120);assert.equal(h.ui.snapshot().state.e2,120);h.el('reset').onclick();assert.equal(h.ui.snapshot().state.t,0);assert.equal(h.ui.snapshot().state.e2,120);h.el('restore').onclick();assert.deepEqual(h.ui.snapshot().forcing,{});assert.equal(h.ui.snapshot().state.t,0);assert.equal(h.ui.snapshot().state.e2,12);});
test('Troca de etapa limpa intervenções, gráficos e tempo; iniciar/pausar funcionam',()=>{const h=harness();h.fix('e2',200);h.el('step').onclick();h.stage('peri-tardia');const s=h.ui.snapshot();assert.equal(s.state.t,0);assert.equal(s.history.length,1);assert.deepEqual(s.forcing,{});h.el('speed').value='4';h.el('play').onclick();h.tick();assert.ok(h.ui.snapshot().state.t>0);h.el('pause').onclick();const t=h.ui.snapshot().state.t;h.tick();assert.equal(h.ui.snapshot().state.t,t);assert.match(h.el('charts').innerHTML,/stroke-dasharray/);assert.match(h.el('organs').innerHTML,/endo-gland/);});
test('Assinatura correta, fontes e zoom estão presentes',()=>{const h=fs.readFileSync(new URL('./index.html',import.meta.url),'utf8');assert.match(h,/Simuladores interativos utilizados nas disciplinas de Fisiologia Humana do Prof\. Dr\. Mário César Nascimento ©/);assert.ok(!h.includes('maximum-scale'));assert.match(h,/STRAW/);assert.match(h,/Não é um organismo virtual validado/);});

test('Repetir reinicia janela mantendo imposições e sem unir gráficos de execuções distintas',()=>{
 const h=harness();h.stage('pos');h.fix('e2',100);h.el('speed').value='10';h.el('loop').checked=true;h.el('play').onclick();
 for(let i=0;i<97;i++)h.tick();
 let s=h.ui.snapshot();assert.ok(s.state.t<3);assert.equal(s.running,true);assert.equal(s.state.e2,100);assert.equal(s.expected.e2,12);assert.equal(s.history.length,2);
 h.el('loop').checked=false;for(let i=0;i<96;i++)h.tick();
 s=h.ui.snapshot();assert.ok(Math.abs(s.state.t-240)<.001);assert.equal(s.running,false);
 h.el('play').onclick();assert.equal(h.ui.snapshot().state.t,0);assert.equal(h.ui.snapshot().state.e2,100);
 h.el('restore').onclick();assert.equal(h.el('loop').checked,false);
});

test('CSV baixa histórico com unidades, referência pareada e imposições de cada amostra',async()=>{
 const h=harness();h.stage('pos');h.fix('e2',100);h.el('step').onclick();h.input('e2',120);h.el('export').onclick();
 const d=h.download();assert.equal(d.name,'transicao-menopausal-pos.csv');
 const bytes=new Uint8Array(await d.blob.arrayBuffer());assert.deepEqual([...bytes.slice(0,3)],[239,187,191]);
 const lines=(await d.blob.text()).split('\r\n');assert.equal(lines.length,h.ui.snapshot().history.length+1);
 assert.match(lines[0],/Estradiol \(E2\) esperado \(pg\/mL\)/);assert.match(lines[0],/Endométrio experimento \(mm\)/);
 const first=lines[1].split(';'),last=lines.at(-1).split(';');
 assert.equal(first[4],'"não"');assert.equal(last[1],'"7,0000"');assert.equal(last[2],'"12,0000"');assert.equal(last[3],'"120,0000"');assert.equal(last[4],'"sim"');
 h.el('reset').onclick();h.el('export').onclick();assert.equal((await h.download().blob.text()).split('\r\n').length,2);
});
