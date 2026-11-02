import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
test('entrada direta em Película e Travessias não baixa o iframe da célula',()=>{
 for(const aba of ['pelicula','travessias']){
  const elements=new Map(),tabs=['celula','pelicula','travessias'].map(name=>({dataset:{aba:name},setAttribute(){}}));
  const el=id=>{if(!elements.has(id))elements.set(id,{href:'https://example.test/ra/potencial-membrana/',setAttribute(){},hasAttribute(k){return Boolean(this[k]);},addEventListener(){},contentWindow:{postMessage(){}}});return elements.get(id);};
  const location={href:'https://example.test/ra/celula/?aba='+aba+'&percurso=fisioterapia',search:'?aba='+aba+'&percurso=fisioterapia',origin:'https://example.test'};
  vm.runInNewContext(read('celula/tabs.js'),{document:{querySelectorAll:()=>tabs,getElementById:el},location,URL,URLSearchParams,addEventListener(){},history:{replaceState(){}}});
  assert.equal(el('cell-frame').src,undefined);assert.match(el('membrane-frame').src,new RegExp('nivel='+(aba==='pelicula'?4:5)));
  tabs[0].onclick();assert.match(el('cell-frame').src,/percurso=fisioterapia/);const src=el('cell-frame').src;tabs[1].onclick();tabs[0].onclick();assert.equal(el('cell-frame').src,src);
 }
 assert.doesNotMatch(read('celula/index.html'),/id="cell-frame"[^>]*\ssrc=/);
});
test('GLBs de entrega conservam os dados originais conforme relatório da compilação',()=>{
 const results=JSON.parse(read('otimizacao-modelos.json'));assert.equal(results.length,3);
 for(const result of results){assert.equal(result.sameGeometryAndAnimationData,true);assert(result.after<result.before);assert.equal(result.animations.length,1);assert(result.animations[0].channels>=100);}
});
test('prévia portátil pausa fechada ou invisível e retoma sem perder a escolha',()=>{
 const code=read('ciclo-portatil.js'),begin=code.indexOf(' function syncPlayback()'),end=code.indexOf(' new IntersectionObserver',begin);
 const viewer={paused:false,expanded:false,closest(){return this.expanded;},play(){this.paused=false;},pause(){this.paused=true;}};
 const state={viewer,document:{hidden:false},box:{open:true},ready:true,playing:true,inView:true,presenting:false};
 vm.createContext(state);vm.runInContext(code.slice(begin,end),state);
 state.syncPlayback();assert.equal(viewer.paused,false);
 state.box.open=false;state.syncPlayback();assert.equal(viewer.paused,true);
 state.box.open=true;state.inView=false;state.syncPlayback();assert.equal(viewer.paused,true);
 viewer.expanded=true;state.syncPlayback();assert.equal(viewer.paused,false);
 state.playing=false;state.syncPlayback();assert.equal(viewer.paused,true);
 state.presenting=true;state.syncPlayback();assert.equal(viewer.paused,false);
 state.document.hidden=true;state.syncPlayback();assert.equal(viewer.paused,true);
});
test('troca de aba durante o download já controla a visibilidade da célula',()=>{
 const code=read('celula/visualizador/app.js'),start=code.indexOf('const stage='),end=code.indexOf('const reduced='),events={};let observer;
 const parent={},context=vm.createContext({document:{getElementById:()=>({})},parent,location:{origin:'https://example.test'},configureLayers:()=>({}),configureAR(){},addEventListener:(name,fn)=>events[name]=fn,IntersectionObserver:class{constructor(fn){observer=fn;}observe(){}}});
 vm.runInContext(code.slice(start,end),context);
 events.message({origin:'https://other.test',source:parent,data:{type:'celula-visibilidade',ativa:false}});assert.equal(vm.runInContext('activeTab',context),true);
 events.message({origin:'https://example.test',source:parent,data:{type:'celula-visibilidade',ativa:false}});assert.equal(vm.runInContext('activeTab',context),false);
 observer([{isIntersecting:false}]);assert.equal(vm.runInContext('stageVisible',context),false);
});
