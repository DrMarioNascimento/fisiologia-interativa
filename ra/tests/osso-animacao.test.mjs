import {test} from 'node:test';
import assert from 'node:assert/strict';
import {quadro,superficie,percurso,maturacaoLocal} from '../osso-vivo/animacao.js';
import {estado} from '../osso-vivo/fisica.js';
test('osso: desmontagem e exibição de carga não alteram balanço fisiológico',()=>{
 for(const scenario of ['habitual','exercicio','imobilizacao'])for(let k=0;k<=100;k++){
  const t=k/100,base=estado(t,scenario);
  for(const separation of [0,.5,1])for(const load of [false,true]){const a=quadro(t,scenario,separation,load);for(const key of Object.keys(base))assert.equal(a[key],base[key]);}
 }
});
test('osso: força relativa e deformação ampliada respondem ao cenário e fecham o ciclo',()=>{
 assert(quadro(.025,'exercicio').forca>quadro(.025,'habitual').forca);
 assert(quadro(.025,'habitual').forca>quadro(.025,'imobilizacao').forca);
 assert.equal(quadro(.025,'habitual',0,false).forca,0);
 assert.equal(quadro(.025,'habitual',0,false).deformacao,0);
 assert(Math.abs(quadro(0).forca-quadro(1).forca)<1e-12);
 for(let k=0;k<=1000;k++)assert(quadro(k/1000).deformacao<=.025);
});
test('osso: remoção e reposição mudam superfície na ordem das curvas',()=>{
 for(const scenario of ['habitual','exercicio','imobilizacao']){
  const h=t=>superficie(-.7,0,quadro(t,scenario));
  assert(h(.3)<h(0));assert.equal(h(.30),h(.39));assert(h(.85)>h(.40));
  const h0=h(0),h1=h(1);if(scenario==='habitual')assert(Math.abs(h0-h1)<1e-12);if(scenario==='exercicio')assert(h1>h0);if(scenario==='imobilizacao')assert(h1<h0);
 }
});
test('osso: transporte não funciona fora da fase da célula e as rotas não saltam',()=>{
 for(const t of [0,.07,.30,.35,.6,1])assert.equal(quadro(t).transporteReabsorcao,0);
 for(const t of [0,.30,.39,.85,.95,1])assert.equal(quadro(t).transporteFormacao,0);
 assert(quadro(.2).transporteReabsorcao>0);assert(quadro(.6).transporteFormacao>0);
 for(let k=0;k<20;k++)for(let i=0;i<=100;i++){const p=percurso(i/100,k,1);assert(p.u>=0&&p.u<=1);assert(p.escala>=0&&p.escala<=1);assert.equal(percurso(i/100,k,0).escala,0);}
 assert.equal(percurso(0,0,1).escala,0);assert(percurso(.999/12,0,1,12).escala<.001);
});
test('osso: cristais locais nunca precedem a matriz orgânica e são posteriores a ela',()=>{
 for(let i=0;i<=20;i++)for(let k=0;k<=1000;k++){const a=maturacaoLocal(k/1000,i/20);assert(a.mineral<=a.colageno+1e-12);if(a.colageno===0)assert.equal(a.mineral,0);}
 assert.equal(maturacaoLocal(.42,0).mineral,0);assert(maturacaoLocal(.5,0).colageno>maturacaoLocal(.5,0).mineral);
});
