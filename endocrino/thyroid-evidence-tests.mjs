import assert from 'node:assert/strict';
import fs from 'node:fs';
import {DEFAULT_PARAMS as P,BASELINE_STATE as B,advance,initialState,scenarioState,iodineContent,flows} from './thyroid-model.js';
import {scenarios} from './thyroid-scenarios.js';
import {DEFAULT_PARAMS as IP,BASELINE_STATE as IB,advance as ia,step as istep} from './model.js';
import {computeLabs} from './labs.js';
import {STUDIES,studyValue,studyCSV,DAILY_GROUPS,HOURS} from './thyroid-daily-data.js';
let n=0;const results=[];
function test(name,f){f();n++;results.push({name,status:'PASS'});}
function run(p,d=180,s=initialState(p)){return advance(s,p,d);}
function finite(s){for(const [k,v]of Object.entries(s))if(typeof v==='number')assert(Number.isFinite(v)&&v>=0,k);else if(v&&typeof v==='object')finite(v);}
const normal=run(P),removed=run({...P,thyroidFn:0}),central=run({...P,thyrotropeFn:.03}),graves=run({...P,trab:2.5}),treated=run({...P,trab:2.5,methimazole:.6}),lowD=run({...P,deiodinase:.4}),iodine=run({...P,iodine:.08});
test('Basal tireoidiano estável por 180 dias',()=>{for(const k of ['trh','tsh','t4','t3'])assert(Math.abs(normal[k]-1)<1e-9,k);});
test('Sem tireoide, hormônios caem e TSH aumenta',()=>{assert(removed.t4<.01&&removed.t3<.02&&removed.tsh>1.2);assert.equal(flows(removed,{...P,thyroidFn:0}).release4,0);});
test('Deficiência central sem aumento compensatório de TSH',()=>assert(central.t4<.85&&central.tsh<1));
test('Graves: excesso com supressão de TSH',()=>assert(graves.t4>1.15&&graves.t3>1.15&&graves.tsh<.8));
test('TPO bloqueada reduz produção no Graves',()=>assert(treated.t4<graves.t4&&treated.t3<graves.t3));
test('Conversão reduzida diminui T3',()=>assert(lowD.t3<1&&lowD.t4>=1));
test('Iodo insuficiente reduz T4 e eleva TSH',()=>assert(iodine.t4<1&&iodine.tsh>1));
const repl=scenarios.replacement,rp={...P,...repl.params},rs=scenarioState(repl),recovered=run(rp,180,rs);
test('Reposição parte de deficiência e recupera T4/T3 sem glândula',()=>{assert(rs.t4<.1);assert(recovered.t4>rs.t4&&recovered.t3>rs.t3);assert.equal(flows(recovered,rp).release4,0);});
const destructive=run({...P,destruction:.05,lesionDays:21},7),late=run({...P,destruction:.05,lesionDays:21},180);
test('Lesão libera estoques no início e perde tecido',()=>{assert(destructive.t4>1);assert(late.tissue<.5);});
for(const id of Object.keys(scenarios))test('Estado finito no cenário '+id,()=>{const p={...P,...scenarios[id].params};finite(run(p,90,scenarioState(scenarios[id])));});
test('Balanço glandular de iodo contabilizado',()=>{const p={...P,destruction:.04,methimazole:.4},a=initialState(p),b=run(p,30,a);assert(Math.abs(iodineContent(b)-iodineContent(a)-b.iodineIn+b.iodineOut)<1e-7);});
test('Convergência ao reduzir passo numérico',()=>{const p={...P,trab:2.5},a=advance(B,p,30,.005),b=advance(B,p,30,.0025);for(const k of ['t4','t3','tsh'])assert(Math.abs(a[k]-b[k])/Math.max(.1,b[k])<.01,k);});
test('Integrado usa exatamente o núcleo compartilhado em cada passo',()=>{const a={...IB},p={...IP,thyroidFn:.3,trab:1};const b=istep(a,p,.005);const expected=advance(a.thyroid,{...P,thyroidFn:p.thyroidFn,thyrotropeFn:p.thyrotropeFn,levothyroxine:p.levothyroxine,deiodinase:p.deiodinase,trab:p.trab,iodine:p.iodine,methimazole:p.methimazole,trhDrive:p.trhDrive,portalTransmission:p.stalk,adenoFn:p.adenoFn,somatostatinTone:a.sst,glucocorticoidIndex:Math.max(.02,a.cortisolEndo+p.exoGlucocorticoid)},.005);assert.deepEqual(b.thyroid,expected);});
test('Basal integrado permanece estável',()=>{const a=ia(IB,IP,30);for(const k of ['t4','t3','tsh','acth','gh','prl'])assert(Math.abs(a[k]-IB[k])/IB[k]<.001,k);});
const summaries=[];
for(const [name,change]of Object.entries({normal:{},primary:{thyroidFn:.07},central:{thyrotropeFn:.03},graves:{trab:2.5},mmi:{trab:2.5,methimazole:.6},replacement:{thyroidFn:0,levothyroxine:1},adeno:{adenoFn:.01},stalk:{stalk:0},cortisol:{exoGlucocorticoid:2},lowConversion:{deiodinase:.4}})){
 const s=ia(IB,{...IP,...change},90);finite(s);const labs=computeLabs(s,{...IP,...change});summaries.push({name,t4:s.t4,t3:s.t3,tsh:s.tsh,trh:s.trh,ft4:labs.ft4,t3total:labs.t3});
 test('Integrado finito '+name,()=>finite(s));
 if(name==='primary')test('Integrado: primário esperado',()=>assert(s.t4<.85&&s.tsh>1.2));
 if(name==='central'||name==='adeno'||name==='stalk')test('Integrado: falha central '+name,()=>assert(s.t4<.85&&s.tsh<1));
 if(name==='graves')test('Integrado: Graves esperado',()=>assert(s.t4>1.15&&s.tsh<.8));
}
for(const sex of ['men','women'])for(const h of ['tsh','ft3','ft4'])test('Pontos de Zhang preservados '+sex+h,()=>{for(let i=0;i<6;i++){const d=studyValue('zhang',sex,h,HOURS[i]);assert.equal(d.value,DAILY_GROUPS[sex][h][i]);assert.equal(d.origin,'mediana publicada');}assert.equal(studyValue('zhang',sex,h,24).origin,'fechamento periódico assumido');assert(Math.abs(studyValue('zhang',sex,h,8,'08h').percent-100)<1e-10);});
test('Cosinor: horários e amplitudes coletivas',()=>{assert.equal(studyValue('russell','mixed','tsh',2+40/60).value,2.219);assert(Math.abs(studyValue('russell','mixed','ft3',4+4/60).value-5.607)<1e-10);assert.equal(studyValue('russell','mixed','ft4',8).unit,'pmol/L');});
test('Sem curva pediátrica inventada',()=>assert.throws(()=>studyValue('children','mixed','tsh',8)));
test('Exportação distingue observações e reconstruções',()=>{assert(studyCSV('zhang','both').includes('mediana publicada'));assert(!studyCSV('russell','both').includes('mediana publicada'));assert(studyCSV('children','both').includes('144'));});
for(const s of [normal,removed,central,graves,treated,lowD,iodine,recovered,destructive,late])finite(s);
fs.writeFileSync(new URL('./auditoria-tireoide-20261019.json',import.meta.url),JSON.stringify({tests:n,results,integrated:summaries,detailed:{normal,removed,central,graves,treated,lowD,iodine,recovered,destructive,late}},null,2));
console.log(n+' verificações PASS');console.table(summaries);
