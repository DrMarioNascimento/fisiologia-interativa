import test from 'node:test';import assert from 'node:assert/strict';
import {PIH,CORPO,MMHG_POR_CM,pressaoVenosa,pressaoLocal,mmHgParaCmH2O,aberturaValvula,projetarPostura,pulsoCardiaco} from '../retorno-venoso/fisica.js';
test('hidrostática usa desnível vertical, ponto indiferente e unidades consistentes',()=>{
 assert(Math.abs(MMHG_POR_CM-.78)<.001);
 for(const grau of [0,15,45,70,90])assert.equal(pressaoVenosa(PIH,grau),10);
 for(const h of [12,48,75,128,CORPO.jugular])assert.equal(pressaoVenosa(h,0),10);
 assert(pressaoVenosa(CORPO.tornozelo,90)>90&&pressaoVenosa(CORPO.tornozelo,90)<95);
 assert(pressaoVenosa(CORPO.coracao,90)>0&&pressaoVenosa(CORPO.coracao,90)<5);
 assert(pressaoVenosa(CORPO.jugular,90)<0);
 assert(Math.abs(mmHgParaCmH2O(1)-1.35951)<.00001);
 assert(Math.abs(pressaoVenosa(12,45)-10-(pressaoVenosa(12,90)-10)/Math.sqrt(2))<1e-10);
});
test('caminhada diminui pressão distal sem inventar queda na coxa ou pressão negativa',()=>{
 let anterior=Infinity;for(let a=0;a<=1;a+=.1){const p=pressaoLocal(12,90,a);assert(p<=anterior);assert(p>=25);anterior=p;assert.equal(pressaoLocal(75,90,a),pressaoVenosa(75,90));assert.equal(pressaoLocal(12,0,a),10)}
 assert.equal(pressaoLocal(12,90,1),25);
 const eps=1e-7;for(const h of [48,75])assert(Math.abs(pressaoLocal(h-eps,90,1)-pressaoLocal(h+eps,90,1))<1e-5);
});
test('valva demonstra ejeção e bloqueio do refluxo no mesmo ciclo da bomba',()=>{
 assert.equal(aberturaValvula(0,false),1);
 assert.equal(aberturaValvula(.25,true),1);
 assert.equal(aberturaValvula(.75,true),0);
 assert.equal(aberturaValvula(0,true),aberturaValvula(1,true));
 for(let t=0;t<=1;t+=.01){const a=aberturaValvula(t,true);assert(a>=0&&a<=1)}
});
test('figura fica vertical em pé e horizontal no decúbito; o coração tem tempo simulado',()=>{
 const head=projetarPostura(0,1,90),feet=projetarPostura(0,-1,90);assert.equal(head.x,feet.x);assert(head.y>feet.y);
 const lyingHead=projetarPostura(0,1,0),lyingFeet=projetarPostura(0,-1,0);assert(Math.abs(lyingHead.y-lyingFeet.y)<1e-12);assert(lyingHead.x<lyingFeet.x);
 assert(Math.abs(pulsoCardiaco(1/4/1.1)-1)<1e-12);assert.equal(pulsoCardiaco(0),0);
 assert(Math.abs(pulsoCardiaco(.12)-pulsoCardiaco(.12+1/1.1))<1e-12);
});
