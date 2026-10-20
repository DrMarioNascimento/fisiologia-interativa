/* Offline files for the respiratory app only. Updates activate after open sessions close. */
const PREFIX='fi-respirar-'+encodeURIComponent(new URL(self.registration.scope).pathname)+'-';
const CACHE=PREFIX+'1f94292843779398';
const ASSETS=["index.html","app.js","manifest.webmanifest","biofeedback-audio.js","biofeedback-session.js","biofeedback-agenda.js","ef-simuladores.css","avatar-prof-mario.webp","icons/icon-192.png","icons/icon-512.png","icons/apple-touch-icon.png","assets/audio/biofeedback/inspire.mp3","assets/audio/biofeedback/expire.mp3","assets/audio/biofeedback/pausa.mp3","assets/audio/biofeedback/orientacoes.mp3"];
self.addEventListener('install',event=>event.waitUntil((async()=>{
 const cache=await caches.open(CACHE);
 await cache.addAll(ASSETS.map(p=>new Request(new URL(p,self.registration.scope),{cache:'reload'})));
})()));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
 for(const key of await caches.keys())if(key.startsWith(PREFIX)&&key!==CACHE)await caches.delete(key);
 await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
 if(event.request.method!=='GET'||!event.request.url.startsWith(self.registration.scope))return;
 event.respondWith((async()=>{
  const cache=await caches.open(CACHE);
  const request=event.request.mode==='navigate'?new URL('index.html',self.registration.scope).href:event.request;
  const hit=await cache.match(request,{ignoreSearch:true});
  return hit||fetch(event.request);
 })());
});
