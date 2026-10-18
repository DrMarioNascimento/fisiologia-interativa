import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import * as model from './model.js';
import * as phases from './phases.js';
import * as exercise from './exercise.js';
import * as tissues from './tissues.js';
for(const mode of ['ciclo','gestacao'])for(const cycleLength of [21,28,35])for(const breastfeeding of [true,false]){
 const s={mode,cycleLength,breastfeeding},series=model.buildSeries(s);
 for(const p of series){for(const id of model.PREGNANCY_HORMONES)assert.ok(Number.isFinite(p[id])&&p[id]>=0);assert.ok(phases.describePhase(mode,p.t,cycleLength,breastfeeding).title);}
}
const peak=id=>model.buildSeries({mode:'ciclo',cycleLength:28,breastfeeding:true}).reduce((a,b)=>a[id]>b[id]?a:b).t;
assert.ok(peak('e2')<peak('lh'));assert.ok(peak('lh')<peak('p4'));
assert.ok(model.pregnancyAt(300,true).prl>model.pregnancyAt(300,false).prl);
assert.ok(model.pregnancyAt(300,true).gnrh<model.pregnancyAt(300,false).gnrh);
assert.ok(model.pregnancyAt(300,true).p4<model.pregnancyAt(270,true).p4);
const els=new Map();const get=id=>{if(!els.has(id))els.set(id,{value:'1',checked:id==='breast',hidden:false,disabled:false,children:[],dataset:{},setAttribute(k,v){this[k]=v;}});return els.get(id);};
let tick,downloaded=false,blob;
const context={...model,...phases,...exercise,...tissues,document:{getElementById:get,createElement:()=>({click(){downloaded=true;}})},location:{search:'?modo=ciclo',href:'https://example.test/endocrino/ciclo/index.html?modo=ciclo'},history:{replaceState(){}},URL:class extends URL{static createObjectURL(b){blob=b;return 'blob:test';}static revokeObjectURL(){}},URLSearchParams,Blob,setInterval(fn){tick=fn;},setTimeout(){}};
vm.createContext(context);let source=fs.readFileSync(new URL('./app.js',import.meta.url),'utf8').replace(/^import .*$/gm,'');vm.runInContext(source,context);
assert.equal(get('tissues').hidden,false);assert.match(get('tissues').innerHTML,/Menstruação/);
for(const length of [21,28,35]){
 const ov=length-14;
 for(let day=0;day<length;day+=.25){const snap=model.cycleAt(day,length),s=tissues.tissueState(day,length,snap.endometrium);for(const svg of [tissues.ovarianSVG(s),tissues.endometriumSVG(s)]){assert.ok(!/NaN|Infinity|undefined/.test(svg));assert.match(svg,/role="img"/);}}
 assert.equal(tissues.tissueState(2,length,4).ovarian,'folicular');assert.equal(tissues.tissueState(2,length,4).endometrial,'menstrual');assert.equal(tissues.tissueState(ov,length,10).ovarian,'ovulacao');assert.equal(tissues.tissueState(ov+5,length,12).endometrial,'secretora');assert.equal(tissues.tissueState(length-1,length,13).ovarian,'regressao');
}
get('day').oninput({target:{value:'21'}});assert.match(get('tissues').innerHTML,/Corpo lúteo produtor/);assert.match(get('tissues').innerHTML,/Fase secretora/);get('reset').onclick();assert.match(get('tissues').innerHTML,/Menstruação/);
get('gestacao').onclick();assert.equal(get('tissues').hidden,true);get('ciclo').onclick();assert.equal(get('tissues').hidden,false);
assert.match(get('clock').textContent,/Dia 1/);get('play').onclick();tick();assert.equal(get('day').value,.25);get('pause').onclick();const saved=get('day').value;tick();assert.equal(get('day').value,saved);
get('gestacao').onclick();assert.match(get('clock').textContent,/IG/);assert.equal(get('breast-wrap').hidden,false);assert.equal(get('length-wrap').hidden,true);
get('day').oninput({target:{value:'300'}});assert.match(get('clock').textContent,/Puerpério/);get('exercise').onchange({target:{value:'alta'}});assert.match(get('exercise-note').textContent,/hipótese|variação/);
get('restore').onclick();assert.equal(get('day').value,0);assert.equal(get('exercise').value,'');assert.equal(get('breast').checked,true);get('export').onclick();assert.ok(downloaded);assert.match(await blob.text(),/Gonadotrofina/);
get('ciclo').onclick();get('length').oninput({target:{value:'21'}});assert.equal(get('length-value').textContent,'21 dias');get('day').oninput({target:{value:'20.9'}});get('step').onclick();assert.equal(get('play').disabled,false);
const html=fs.readFileSync(new URL('./index.html',import.meta.url),'utf8');assert.ok(html.includes('Simuladores interativos utilizados nas disciplinas de Fisiologia Humana do Prof. Dr. Mário César Nascimento ©'));assert.ok(!html.includes('maximum-scale'));console.log('OK: perfis completos, sequência hormonal, puerpério, controles, modos, restauração, CSV e assinatura.');
