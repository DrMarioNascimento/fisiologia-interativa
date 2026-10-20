const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'../respirar');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
function worker(prefix='/respirar/'){
 const scope='https://example.test'+prefix,events={},stores=new Map();let network=0,claimed=false;
 const caches={async open(key){if(!stores.has(key))stores.set(key,new Map());const store=stores.get(key);return {
 async addAll(requests){for(const request of requests){const p=new URL(request.url).pathname.slice(prefix.length);store.set(request.url,new Response(fs.readFileSync(path.join(root,p))))}},
 async match(request){const key=new URL(typeof request==='string'?request:request.url);key.search='';return store.get(key.href)?.clone()}
 }},async keys(){return [...stores.keys()]},async delete(key){return stores.delete(key)}};
 vm.runInNewContext(read('sw.js'),{self:{registration:{scope},clients:{async claim(){claimed=true}},addEventListener(name,handler){events[name]=handler}},URL,Request,caches,fetch:async()=>{network++;throw Error('offline')}});
 const run=async name=>{let pending;events[name]({waitUntil(p){pending=p}});await pending};
 return {events,stores,scope,run,get network(){return network},get claimed(){return claimed},async get(p,mode='cors'){let response;events.fetch({request:{method:'GET',url:new URL(p,scope).href,mode},respondWith(p){response=p}});return response&&await response}};
}
test('Offline app is self-contained and has installable icons, explicit scope and no remote tutor',()=>{
 const html=read('index.html'),manifest=JSON.parse(read('manifest.webmanifest'));
 assert.equal(manifest.scope,'./');assert.equal(manifest.start_url,'./');assert.equal(manifest.display,'standalone');
 for(const icon of manifest.icons){assert.ok(fs.existsSync(path.join(root,icon.src)));const bytes=fs.readFileSync(path.join(root,icon.src));assert.equal(bytes.readUInt32BE(16),+icon.sizes.split('x')[0]);}
 assert.doesNotMatch(html,/<script[^>]+src="(?:https?:|\.\.\/|tutor-|ef-simuladores\.js)/);
 for(const match of html.matchAll(/<(?:script|link|image)[^>]+(?:src|href)="([^"#]+)"/g)){
  if(match[1]==='./')continue;assert.ok(fs.existsSync(path.join(root,match[1].split('?')[0])),match[1]);
 }
 assert.doesNotMatch(html,/href="respirar\//);
 for(const [,attrs,script]of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g))if(!/\bsrc=/.test(attrs)&&script.trim())new vm.Script(script);
});
test('After installation, cold navigation, audio and app files work with network completely unavailable',async()=>{
 for(const prefix of ['/respirar/','/fisiologia-interativa/respirar/']){
  const s=worker(prefix);await s.run('install');await s.run('activate');assert.ok(s.claimed);
  const nav=await s.get('./?v=offline','navigate');assert.equal(nav.status,200);assert.match(await nav.text(),/Biofeedback Respiratório/);
  for(const file of ['biofeedback-audio.js','biofeedback-session.js','biofeedback-agenda.js','app.js','ef-simuladores.css','avatar-prof-mario.webp','manifest.webmanifest','icons/icon-192.png','icons/icon-512.png','icons/apple-touch-icon.png',...['inspire','expire','pausa','orientacoes'].map(n=>'assets/audio/biofeedback/'+n+'.mp3')]){
   const response=await s.get(file+'?version=test');assert.equal(response.status,200,file);assert.ok((await response.arrayBuffer()).byteLength>0,file);
  }
  assert.equal(s.network,0);
 }
});
test('Activation only removes old caches of this app; requests outside its scope are untouched',async()=>{
 const s=worker();s.stores.set('another-app',new Map());s.stores.set('fi-respirar-%2Frespirar%2F-old',new Map());s.stores.set('fi-respirar-%2Fother%2F-old',new Map());
 await s.run('install');await s.run('activate');assert.ok(s.stores.has('another-app'));assert.ok(s.stores.has('fi-respirar-%2Fother%2F-old'));assert.ok(!s.stores.has('fi-respirar-%2Frespirar%2F-old'));
 assert.equal(await s.get('../biofeedback-respiratorio.html'),undefined);assert.equal(s.network,0);
});
