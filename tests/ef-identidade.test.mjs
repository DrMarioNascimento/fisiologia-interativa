import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const root=new URL('../',import.meta.url),read=p=>fs.readFileSync(new URL(p,root),'utf8');
const manifest=JSON.parse(read('ef-simuladores-manifest.json')),script=read('ef-simuladores.js');
const catalog=JSON.parse(read('inicio/dados-ef.js').replace(/^[\s\S]*?window\.FI_DADOS\s*=\s*/,'').replace(/;\s*$/,''));
test('Todas as unidades e todos os acessos EF recebem a identidade, incluindo os dois modos do ciclo',()=>{
 assert.equal(catalog.unidades.length,7);let count=0;
 for(const u of catalog.unidades)for(const s of u.sims){count++;const path=s.href.split(/[?#]/)[0];assert.ok(manifest[path],path);assert.equal(manifest[path].unit,u.id);assert.equal(manifest[path].number,u.num);assert.match(read(path),/ef-simuladores\.js/);}
 assert.equal(count,33);assert.equal(manifest['endocrino/index.html'].number,'06');assert.equal(manifest['cardiopulmonar-integrado.html'].number,'');
});
test('O acesso seleciona o manifesto do próprio curso sem levar a identidade da EF para Fisioterapia',()=>{
 for(const href of ['https://site.test/fisioterapia/index.html','https://site.test/potencial-acao-membrana.html?percurso=fisioterapia','https://site.test/neuronio-interativo.html?curso=fi']){
  const requests=[];vm.runInNewContext(script,{URL,location:new URL(href),document:{currentScript:{src:'https://site.test/ef-simuladores.js'}},fetch:u=>{requests.push(u.href);return new Promise(()=>{});}});assert.equal(requests.length,1,href);assert.match(requests[0],/\/fi-simuladores-manifest\.json\?/);
 }
 let requests=0;vm.runInNewContext(script,{URL,location:new URL('https://site.test/tutor-fisio.html'),document:{currentScript:{src:'https://site.test/ef-simuladores.js'}},fetch:()=>{requests++;}});assert.equal(requests,0);
});
test('Todos os 27 simuladores de Fisioterapia seguem as cinco unidades do curso',()=>{
 const data=JSON.parse(read('inicio/dados-fi.js').replace(/^[\s\S]*?window\.FI_DADOS\s*=\s*/,'').replace(/;\s*$/,'')),fi=JSON.parse(read('fi-simuladores-manifest.json'));let count=0;
 assert.equal(data.unidades.length,5);
 for(const u of data.unidades)for(const s of u.sims){count++;const url=new URL(s.href,'https://site.test/fisioterapia/'),p=url.pathname.slice(1);assert.equal(url.searchParams.get('percurso'),'fisioterapia');assert.ok(fi[p],p);assert.equal(fi[p].unit,u.id);assert.equal(fi[p].number,u.num);assert.match(read(p),/ef-simuladores\.js/);}
 assert.equal(count,27);assert.equal(fi['hemodinamica-pa-dc-rpt.html'].number,'03');assert.equal(fi['ventilacao-pulmonar-neonatal.html'].number,'04');assert.equal(fi['fisioterapia/uti-fisiologica.html'].number,'05');
 assert.equal(manifest['hemodinamica-pa-dc-rpt.html'].number,'04');assert.equal(manifest['ventilacao-pulmonar.html'].number,'05');
});
test('A página de Fisioterapia também funciona por endereço de pasta',async()=>{
 let mounted=0;vm.runInNewContext(script,{URL,location:new URL('https://site.test/fisioterapia/'),document:{currentScript:{src:'https://site.test/ef-simuladores.js'},readyState:'complete',get body(){mounted++;return null;}},fetch:async()=>({ok:true,json:async()=>JSON.parse(read('fi-simuladores-manifest.json'))}),console});
 await new Promise(setImmediate);assert.equal(mounted,1);
});
test('Rotas EF usam o manifesto sem alterar o estado fisiológico ou persistir escolhas de curso',()=>{
 let requests=0;vm.runInNewContext(script,{URL,location:new URL('https://site.test/endocrino/index.html'),document:{currentScript:{src:'https://site.test/ef-simuladores.js'}},fetch:()=>{requests++;return new Promise(()=>{});}});assert.equal(requests,1);
 assert.doesNotMatch(script,/localStorage|sessionStorage|setInterval|\.onclick\s*=|\.value\s*=/);
 assert.match(script,/childList:true,subtree:true/);
});
test('Endereços de pasta recebem a mesma identidade que index.html, no domínio e no GitHub Pages',async()=>{
 for(const prefix of ['/','/fisiologia-interativa/'])for(const path of ['', 'endocrino/', 'endocrino/ciclo/', 'endocrino/menopausa/']){
  let mounted=0;
  const document={currentScript:{src:'https://site.test'+prefix+'ef-simuladores.js'},readyState:'complete',get body(){mounted++;return null;}};
  vm.runInNewContext(script,{URL,location:new URL('https://site.test'+prefix+path),document,fetch:async()=>({ok:true,json:async()=>manifest}),console});
  await new Promise(setImmediate);
  assert.equal(mounted,1,prefix+path);
 }
});
test('Carregadores preservam o original em quadro acompanhado mesmo quando o documento interno é reescrito',async()=>{
 for(const file of ['homeostase-do-calcio.html','contracao-muscular-sarcomero.html']){
  const original='<!doctype html><title>Original</title><main>Simulador</main>',frame={};let removed=false;
  const document={getElementById:id=>id==='simulator'?frame:{remove:()=>{removed=true;}}};
  const code=[...read(file).matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].find(m=>!m[1].includes('src='))[2];
  await vm.runInNewContext(code,{document,fetch:async()=>({ok:true,text:async()=>original}),console});
  assert.equal(frame.srcdoc,original,file);assert.ok(removed,file);
  assert.match(read(file),/<iframe[^>]*title=/);
 }
});
test('Cards dos eixos hipofisários e etapas dinâmicas usam a lateral curva',()=>{
 for(const name of ['.hypothalamus-origin','.pituitary-group','.lactation-bridge','.stage'])assert.ok(script.includes(name),name);
});
test('Logo preserva o recorte completo, a moldura e a cabeça acima; cards usam borda curva',()=>{
 const css=read('ef-simuladores.css');assert.match(script,/viewBox="0 0 420 405"/);assert.match(css,/width:100px!important;height:62px!important/);assert.match(css,/bottom:7px!important/);assert.match(css,/border-radius:18px!important;border-left:5px/);assert.match(css,/fi-ef-flat-strip::before/);
});
test('Carregadores preservam modelos e incluem o tema no documento final',()=>{
 for(const p of ['homeostase-do-calcio.html','contracao-muscular-sarcomero.html']){
  const html=read(p);const archived=html.match(/assets\/simulator-sources\/[^"]+\.html/)?.[0];assert.ok(archived,p);
  // O blob original é copiado sem transformação; a página só adiciona apresentação.
  assert.match(html,/\.srcdoc=html/);assert.match(html,/ef-simuladores\.js/);
 }
 assert.match(read('da-intencao-ao-movimento.html'),/h=h\.replace/);assert.match(read('sangue.html'),/html=html\.replace/);
 assert.match(script,/frame\.addEventListener\('load',apply\)/);
});
test('Scripts inline dos documentos alterados continuam sintaticamente válidos',()=>{
 const paths=new Set([...Object.keys(manifest),...Object.keys(JSON.parse(read('fi-simuladores-manifest.json')))]);
 for(const p of paths){
  if(p==='mecanotransducao-lei-de-wolff-loader.html')continue;
  const html=read(p);
  for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){
   if(/\bsrc\s*=|type\s*=\s*["'](?:module|application\/)/i.test(m[1])||!m[2].trim())continue;
   assert.doesNotThrow(()=>new vm.Script(m[2]),p);
  }
 }
});
