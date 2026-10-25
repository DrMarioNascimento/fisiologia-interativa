import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';import crypto from 'node:crypto';
const root=new URL('../celula/visualizador/',import.meta.url),code=fs.readFileSync(new URL('ra.js',root),'utf8').replaceAll('export ','');
function harness(userAgent,platform='',touch=0){
 const opened=[],nodes=new Map();const get=id=>{if(!nodes.has(id))nodes.set(id,{disabled:true,hidden:true,attributes:{},listeners:{},setAttribute(k,v){this.attributes[k]=v;},addEventListener(k,fn){this.listeners[k]=fn;}});return nodes.get(id);};
 const topDoc={createElement:tag=>({tag,style:{},append(i){this.child=i;},click(){opened.push({href:this.href,rel:this.rel,child:this.child?.tag});},remove(){}}),body:{append(){}}};
 const env={document:{getElementById:get},window:{top:{document:topDoc}},navigator:{userAgent,platform,maxTouchPoints:touch},location:{href:'https://fisiologia.drmarionascimento.com.br/ra/celula/visualizador/?v=2'},URL,URLSearchParams,setTimeout(){}};
 vm.createContext(env);vm.runInContext(code+';configureAR();this.platform=nativePlatform();this.links=arLinks(location.href);',env);return {env,get,opened};
}
test('iPhone and iPad open a public USDZ through a top-level rel=ar link in the same gesture',()=>{
 for(const [ua,platform,touch] of [['iPhone','iPhone',5],['Macintosh','MacIntel',5]]){
  const h=harness(ua,platform,touch);assert.equal(h.env.platform,'ios');assert.equal(h.get('launch-ar').disabled,false);h.get('launch-ar').onclick();
  assert.equal(h.opened.length,1);assert.equal(h.opened[0].rel,'ar');assert.equal(h.opened[0].child,'img');assert.match(h.opened[0].href,/^https:\/\/.*celula-ios-v2\.usdz$/);
 }
});
test('Android uses a public GLB, AR-preferred mode and a valid 3D fallback',()=>{
 const h=harness('Android');h.get('launch-ar').onclick();assert.equal(h.opened.length,1);const url=h.opened[0].href;
 assert(url.startsWith('intent://arvr.google.com/scene-viewer/1.0?'));const query=new URLSearchParams(url.split('?')[1].split('#')[0]);assert.equal(query.get('mode'),'ar_preferred');assert.match(query.get('file'),/^https:\/\/.*celula-mobile-v2\.glb$/);assert(url.includes('S.browser_fallback_url=https%3A'));assert(!url.includes('blob:'));
});
test('Desktop keeps native AR disabled until a compatible WebXR viewer loads',()=>{
 const h=harness('Firefox Windows');assert.equal(h.get('launch-ar').disabled,true);h.get('prepare-ar').onclick();assert.equal(h.get('cell-ar').hidden,false);assert.equal(h.get('cell-ar').src,h.env.links.glb);
 h.get('cell-ar').canActivateAR=true;h.get('cell-ar').listeners.load();assert.equal(h.get('launch-ar').disabled,false);
});
test('Original desktop GLB is byte-for-byte identical to the supplied model after transport reassembly',()=>{
 const base=new URL('modelo-original-v2/',root);const manifest=JSON.parse(fs.readFileSync(new URL('manifest.json',base)));const parts=manifest.parts.map(p=>{const b=fs.readFileSync(new URL(p.file,base));assert.equal(b.length,p.bytes);return b;});const b=Buffer.concat(parts);assert.equal(b.length,manifest.bytes);assert.equal(crypto.createHash('sha256').update(b).digest('hex'),manifest.sha256);assert.equal(b.readUInt32LE(8),b.length);
 const g=JSON.parse(b.subarray(20,20+b.readUInt32LE(12)));assert.equal(g.animations[0].name,'vida_celular');assert.equal(g.animations[0].channels.length,359);
});
