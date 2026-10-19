import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const root = new URL('../', import.meta.url);
const read = path => fs.readFileSync(new URL(path, root), 'utf8');
const json = value => JSON.parse(JSON.stringify(value));
const capture = context => json(vm.runInContext('({axes,maps,modules,fisio:window.fisioterapiaTutor})', context));
function environment(address) {
  const elements = new Map();
  const node = () => ({innerHTML:'',src:'',hidden:true,textContent:'',alt:'',classList:{add(){},remove(){}},addEventListener(){},querySelectorAll(){return [];}});
  const context = vm.createContext({URL,URLSearchParams,location:new URL(address),window:{cardRealidadeAumentada:()=>''},document:{body:node(),documentElement:{style:{setProperty(){}}},addEventListener(){},querySelector(selector){if(!elements.has(selector))elements.set(selector,node());return elements.get(selector);}}});
  vm.runInContext(read('tutor-ef-data.js'),context);
  return context;
}
const add = context => vm.runInContext(read('tutor-ef-endocrino.js'),context);
function widget(context) {
  const code = read('tutor-widget.js');
  const point = '  selectedModule = allModules().find(m => location.pathname';
  assert.equal(code.split(point).length,2);
  vm.runInContext(code.replace(point,'  window.widgetTest = {allModules,axisNames,findModules,mapReply,resourceLinks,quiz}; return;\n'+point),context);
  return context.window.widgetTest;
}
test('Tutor EF ganha seis percursos e 36 questões; preserva os percursos e a configuração de Fisioterapia',()=>{
  const context=environment('https://site.test/tutor-ef.html?eixo=endocrino');
  const before=capture(context);add(context);const after=capture(context);
  assert.deepEqual(after.modules.filter(m=>m.group!=='endocrino'),before.modules);
  assert.deepEqual(after.fisio,before.fisio);
  assert.equal(after.axes.filter(a=>a.id==='endocrino').length,1);
  assert.equal(vm.runInContext('active',context),'endocrino');
  assert.equal(after.maps.endocrino.src,'assets/maps/sistema-endocrino.webp');
  const list=after.modules.filter(m=>m.group==='endocrino');
  const catalog=JSON.parse(read('inicio/dados-ef.js').replace(/^[\s\S]*?window\.FI_DADOS\s*=\s*/,'').replace(/;\s*$/,''));
  assert.deepEqual(list.map(m=>m.href).sort(),catalog.unidades.find(u=>u.id==='endocrino').sims.map(m=>m.href).sort());
  assert.equal(list.length,6);assert.equal(list.flatMap(m=>m.qs).length,36);
  const counts=[0,0,0],questions=new Set();
  for(const m of list){
    assert.equal(m.steps.length,3);assert.equal(m.qs.length,6);
    assert.ok(fs.existsSync(new URL(m.href.split('?')[0],root)),m.href);
    for(const q of m.qs){assert.ok(!questions.has(q.q));questions.add(q.q);assert.equal(q.opts.length,3);assert.equal(new Set(q.opts).size,3);assert.ok(Number.isInteger(q.a)&&q.a>=0&&q.a<3);assert.ok(q.why.length>50);counts[q.a]++;}
  }
  assert.deepEqual(counts,[12,12,12]);
  add(context);assert.equal(capture(context).modules.length,after.modules.length);
});
test('A extensão não altera nenhum dado fora da página de Tutor EF',()=>{
  for(const path of ['/tutor-fisio.html','/fisioterapia/','/index.html','/endocrino/cortisol.html','/tutor-ef.html?percurso=fisioterapia']){
    const context=environment('https://site.test'+path),before=capture(context);add(context);
    assert.deepEqual(capture(context),before,path);assert.equal(context.window.educacaoFisicaTutor,undefined);
  }
});
test('Busca, mapa, leitura e quiz do widget reconhecem os percursos endócrinos apenas no Tutor EF',()=>{
  const context=environment('https://site.test/tutor-ef.html?eixo=endocrino');add(context);const api=widget(context);
  assert.equal(api.axisNames.endocrino,'06 Sistema Endócrino');
  assert.ok(!api.axisNames.integracao.startsWith('06'));
  for(const [query,href] of [['cortisol','endocrino/cortisol.html'],['menopausa','endocrino/menopausa/index.html'],['tireoide','endocrino/thyroid.html'],['gestação','endocrino/ciclo/index.html?modo=gestacao']])assert.equal(api.findModules(query)[0].href,href,query);
  assert.match(api.mapReply(null,'mapa do sistema endócrino'),/assets\/maps\/sistema-endocrino.webp/);
  const cortisol=api.allModules().find(m=>m.href==='endocrino/cortisol.html');
  assert.match(api.resourceLinks(cortisol),/Cortisol_Guia_Visual/);
  assert.match(api.quiz(cortisol),/Questão 1 de 6/);
  const fisio=environment('https://site.test/tutor-fisio.html');add(fisio);const fi=widget(fisio);
  assert.equal(fi.axisNames.endocrino,undefined);assert.ok(fi.allModules().every(m=>m.group!=='endocrino'));
});
