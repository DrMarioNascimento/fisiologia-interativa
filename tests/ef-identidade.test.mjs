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
test('Guardas de curso impedem carregar a identidade da EF na Fisioterapia',()=>{
 for(const href of ['https://site.test/fisioterapia/index.html','https://site.test/potencial-acao-membrana.html?percurso=fisioterapia','https://site.test/neuronio-interativo.html?curso=fi','https://site.test/tutor-fisio.html']){
  let requests=0;vm.runInNewContext(script,{URL,location:new URL(href),document:{currentScript:{src:'https://site.test/ef-simuladores.js'}},fetch:()=>{requests++;return new Promise(()=>{});}});assert.equal(requests,0,href);
 }
});
test('Rotas EF usam o manifesto sem alterar o estado fisiológico ou persistir escolhas de curso',()=>{
 let requests=0;vm.runInNewContext(script,{URL,location:new URL('https://site.test/endocrino/index.html'),document:{currentScript:{src:'https://site.test/ef-simuladores.js'}},fetch:()=>{requests++;return new Promise(()=>{});}});assert.equal(requests,1);
 assert.doesNotMatch(script,/localStorage|sessionStorage|setInterval|\.onclick\s*=|\.value\s*=/);
 assert.match(script,/childList:true,subtree:true/);
});
test('Logo preserva o recorte completo, a moldura e a cabeça acima; cards usam borda curva',()=>{
 const css=read('ef-simuladores.css');assert.match(script,/viewBox="0 0 420 405"/);assert.match(css,/width:100px!important;height:62px!important/);assert.match(css,/bottom:7px!important/);assert.match(css,/border-radius:18px!important;border-left:5px/);assert.match(css,/fi-ef-flat-strip::before/);
});
test('Carregadores preservam modelos e incluem o tema no documento final',()=>{
 for(const p of ['homeostase-do-calcio.html','contracao-muscular-sarcomero.html']){
  const html=read(p);const archived=html.match(/assets\/simulator-sources\/[^"]+\.html/)?.[0];assert.ok(archived,p);
  // O blob original é copiado sem transformação; a página só adiciona apresentação.
  assert.match(html,/document\.write\(html\)/);assert.match(html,/ef-simuladores\.js/);
 }
 assert.match(read('da-intencao-ao-movimento.html'),/h=h\.replace/);assert.match(read('sangue.html'),/html=html\.replace/);
 assert.match(script,/frame\.addEventListener\('load',apply\)/);
});
test('Scripts inline dos documentos alterados continuam sintaticamente válidos',()=>{
 for(const p of Object.keys(manifest)){
  if(p==='mecanotransducao-lei-de-wolff-loader.html')continue;
  const html=read(p);
  for(const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){
   if(/\bsrc\s*=|type\s*=\s*["'](?:module|application\/)/i.test(m[1])||!m[2].trim())continue;
   assert.doesNotThrow(()=>new vm.Script(m[2]),p);
  }
 }
});
