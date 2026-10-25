import {test} from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import vm from 'node:vm';import crypto from 'node:crypto';
const root=new URL('../celula/visualizador/',import.meta.url),layerCode=fs.readFileSync(new URL('layers.js',root),'utf8').replaceAll('export ',''),code=fs.readFileSync(new URL('ra.js',root),'utf8').replaceAll('export ','');
function harness(userAgent,platform='',touch=0){
 const opened=[],nodes=new Map();const get=id=>{if(!nodes.has(id))nodes.set(id,{disabled:true,hidden:true,attributes:{},listeners:{},setAttribute(k,v){this.attributes[k]=v;},addEventListener(k,fn){this.listeners[k]=fn;}});return nodes.get(id);};
 const topDoc={createElement:tag=>({tag,style:{},append(i){this.child=i;},click(){opened.push({href:this.href,rel:this.rel,child:this.child?.tag});},remove(){}}),body:{append(){}}};
 const env={document:{getElementById:get},window:{top:{document:topDoc}},navigator:{userAgent,platform,maxTouchPoints:touch},location:{href:'https://fisiologia.drmarionascimento.com.br/ra/celula/visualizador/?v=2'},URL,URLSearchParams,setTimeout(){}};
 vm.createContext(env);vm.runInContext(layerCode+';'+code+';this.layers=configureLayers();configureAR(this.layers);this.platform=nativePlatform();this.links=arLinks(location.href);',env);return {env,get,opened};
}
test('iPhone and iPad open a public USDZ through a top-level rel=ar link in the same gesture',()=>{
 for(const [ua,platform,touch] of [['iPhone','iPhone',5],['Macintosh','MacIntel',5]]){
  const h=harness(ua,platform,touch);assert.equal(h.env.platform,'ios');assert.equal(h.get('launch-ar').disabled,false);h.get('launch-ar').onclick();
  assert.equal(h.opened.length,1);assert.equal(h.opened[0].rel,'ar');assert.equal(h.opened[0].child,'img');assert.match(h.opened[0].href,/^https:\/\/.*celula-v3-completa\.usdz$/);
 }
});
test('Android uses a public GLB, AR-preferred mode and a valid 3D fallback',()=>{
 const h=harness('Android');h.get('launch-ar').onclick();assert.equal(h.opened.length,1);const url=h.opened[0].href;
 assert(url.startsWith('intent://arvr.google.com/scene-viewer/1.0?'));const query=new URLSearchParams(url.split('?')[1].split('#')[0]);assert.equal(query.get('mode'),'ar_preferred');assert.match(query.get('file'),/^https:\/\/.*celula-v3-completa\.glb$/);assert(url.includes('S.browser_fallback_url=https%3A'));assert(!url.includes('blob:'));
});
test('Desktop keeps native AR disabled until a compatible WebXR viewer loads',()=>{
 const h=harness('Firefox Windows');assert.equal(h.get('launch-ar').disabled,true);h.get('prepare-ar').onclick();assert.equal(h.get('cell-ar').hidden,false);assert.equal(h.get('cell-ar').src,h.env.links.glb);
 h.get('cell-ar').canActivateAR=true;h.get('cell-ar').listeners.load();assert.equal(h.get('launch-ar').disabled,false);
});
test('Original desktop GLB is byte-for-byte identical to the supplied model after transport reassembly',()=>{
 const base=new URL('modelo-original-v3/',root);const manifest=JSON.parse(fs.readFileSync(new URL('manifest.json',base)));const parts=manifest.parts.map(p=>{const b=fs.readFileSync(new URL(p.file,base));assert.equal(b.length,p.bytes);return b;});const b=Buffer.concat(parts);assert.equal(b.length,manifest.bytes);assert.equal(crypto.createHash('sha256').update(b).digest('hex'),manifest.sha256);assert.equal(b.readUInt32LE(8),b.length);
 const g=JSON.parse(b.subarray(20,20+b.readUInt32LE(12)));assert.equal(g.animations[0].name,'vida_celular');assert.equal(g.animations[0].channels.length,359);
});


test('Membranes start visible, toggle independently, and preserve organelles and animation parents',()=>{
 const h=harness('iPhone'),nodes=['membrana_plasmatica','citosol','mitocondria_01_membrana','mitocondria_11_membrana','mitocondria_01_cristas','mitocondria_01','nucleolo'].map(name=>({name,visible:true}));
 h.env.layers.attachModel({traverse(fn){nodes.forEach(fn);}});
 assert.equal(h.env.layers.getVariant(),'completa');assert(nodes.every(n=>n.visible));
 h.get('mem').onclick();assert.equal(h.env.layers.getVariant(),'sem-membrana-celular');assert(nodes.slice(0,2).every(n=>!n.visible));assert(nodes.slice(2).every(n=>n.visible));
 h.get('mito').onclick();assert.equal(h.env.layers.getVariant(),'sem-membranas');assert(nodes.slice(0,4).every(n=>!n.visible));assert(nodes.slice(4).every(n=>n.visible));
 h.get('mem').onclick();assert.equal(h.env.layers.getVariant(),'sem-membranas-mitocondriais');assert(nodes.slice(0,2).every(n=>n.visible));
 h.get('mito').onclick();assert(nodes.every(n=>n.visible));
});
test('Every layer combination opens the corresponding animated native asset immediately',()=>{
 for(const ua of ['iPhone','Android']){
  const h=harness(ua);
  for(const [button,variant] of [[null,'completa'],['mem','sem-membrana-celular'],['mito','sem-membranas'],['mem','sem-membranas-mitocondriais']]){
   if(button)h.get(button).onclick();h.get('launch-ar').onclick();const href=decodeURIComponent(h.opened.at(-1).href);
   assert(href.includes('celula-v3-'+variant+(ua==='iPhone'?'.usdz':'.glb')));
   assert(h.get('cell-ar').attributes['ios-src'].endsWith('celula-v3-'+variant+'.usdz'));
  }
 }
});
test('Four variants retain the same animation and hide only the requested membrane meshes',()=>{
 let animation;
 for(const [variant,cell,mito] of [['completa',true,true],['sem-membrana-celular',false,true],['sem-membranas-mitocondriais',true,false],['sem-membranas',false,false]]){
  const b=fs.readFileSync(new URL('celula-v3-'+variant+'.glb',root)),g=JSON.parse(b.subarray(20,20+b.readUInt32LE(12)));
  assert(b.length<15000000);assert.equal(g.nodes.some(n=>n.name==='membrana_plasmatica'&&n.mesh!==undefined),cell);
  assert.equal(g.nodes.filter(n=>/^mitocondria_\d+_membrana$/.test(n.name)&&n.mesh!==undefined).length,mito?11:0);
  assert.equal(g.nodes.filter(n=>/^mitocondria_\d+_cristas$/.test(n.name)&&n.mesh!==undefined).length,11);
  const tracks=g.animations[0].channels.map(ch=>({name:g.nodes[ch.target.node].name,path:ch.target.path}));
  if(animation)assert.deepEqual(tracks,animation);else animation=tracks;
  assert.equal(tracks.length,359);
  const usdz=fs.readFileSync(new URL('celula-v3-'+variant+'.usdz',root));assert.equal(usdz.toString('ascii',0,2),'PK');
 }
});
