/* Build the self-contained, scoped PWA from the shared smartphone simulator. */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..'), out = path.join(root, 'respirar');
const read = p => fs.readFileSync(path.join(root, p), 'utf8');
const write = (p, text) => { fs.mkdirSync(path.dirname(path.join(out, p)), {recursive:true}); fs.writeFileSync(path.join(out, p), text); };
let html = read('biofeedback-respiratorio-smartphone.html');
html = html.replace(/<link[^>]+(?:href="tutor-widget\.css[^"\s]*")[^>]*>/g, '');
html = html.replace(/<script\b[^>]*src="(?:ef-simuladores|tutor-[^"]+)\.js[^"\s]*"[^>]*><\/script>/g, '');
html = html.replace(/<script\b[^>]*src="tutor-[^"]+"[^>]*><\/script>/g, '');
html = html.replace('href="brand/orientador.webp"', 'href="icons/icon-192.png"');
html = html.replace(/biofeedback-audio\.js\?[^"\s]+/g, 'biofeedback-audio.js');
html = html.replace('<html lang="pt-BR">', '<html lang="pt-BR" class="fi-ef-ui" data-fi-ef-unit="respiratorio">');
html = html.replace('<title>Biofeedback Respiratório Mobile — Fisiologia Interativa</title>', '<title>Fisiologia Interativa — Biofeedback Respiratório</title>');
html = html.replace('</head>', '<link rel="manifest" href="manifest.webmanifest"><link rel="apple-touch-icon" href="icons/apple-touch-icon.png"><meta name="apple-mobile-web-app-capable" content="yes"><meta name="apple-mobile-web-app-status-bar-style" content="black-translucent"><link rel="stylesheet" href="ef-simuladores.css"><style>[hidden]{display:none!important}.app-offline{padding:16px}.app-offline h2{font-size:16px;margin:0 0 10px}.app-offline p{font-size:13px;color:#b9d0df;line-height:1.6}.app-offline button{min-height:44px;border:1px solid #64879d;border-radius:12px;background:linear-gradient(#36576c,#172d3e);padding:10px 14px;margin:6px 4px 0 0}.app-offline li{font-size:13px;line-height:1.7;color:#b9d0df}</style></head>');
html = html.replace('<body>', '<body><div class="fi-ef-brand-row"><a class="fi-ef-brand" href="./" aria-label="Fisiologia Interativa — Biofeedback Respiratório"><span class="fi-ef-brand-frame" aria-hidden="true"><svg class="fi-ef-brand-portrait" viewBox="0 0 420 405"><image width="420" height="655" href="avatar-prof-mario.webp"/></svg></span><span class="fi-ef-brand-copy"><b>Fisiologia Interativa</b><small>Biofeedback Respiratório</small></span></a></div>');
html = html.replace(/<a[^>]+href="respirar\/"[^>]*>[\s\S]*?<\/a>/g, '');
html = html.replace('    <section id="protocolDropdown"', `    <section class="card app-offline" aria-labelledby="offlineTitle">
      <h2 id="offlineTitle">Leve seu guia com você</h2>
      <p id="offlineStatus" role="status">Preparando o uso offline…</p>
      <button id="installApp" type="button" hidden>Instalar aplicativo</button>
      <button id="prepareOffline" type="button">Preparar novamente</button>
      <details><summary>Como adicionar à tela de início</summary><ul><li>No iPhone: abra no Safari, toque em Compartilhar e em Adicionar à Tela de Início.</li><li>No Android: use Instalar aplicativo ou a opção equivalente no menu do navegador.</li><li>Espere a mensagem “Pronto para uso offline” antes de fechar a página.</li></ul></details>
    </section>
    <section id="protocolDropdown"`);
// Static card marking preserves the curved identity without fetching course catalogs or the tutor.
html += `<script>document.querySelectorAll('.card,.metric,.chronometer,.control-capsule,.slider-box,.protocol,details').forEach(e=>e.setAttribute('data-fi-ef-card',''));document.querySelectorAll('.metric').forEach(e=>e.classList.add('fi-ef-flat-strip'));</script><script src="app.js"></script>`;
write('index.html', html);
for (const file of ['biofeedback-audio.js', 'ef-simuladores.css']) write(file, read(file));
fs.copyFileSync(path.join(root, 'assets/avatar-prof-mario.webp'), path.join(out, 'avatar-prof-mario.webp'));
for (const name of ['inspire','expire','pausa','orientacoes']) {
  const file = 'assets/audio/biofeedback/'+name+'.mp3';fs.mkdirSync(path.dirname(path.join(out,file)),{recursive:true});fs.copyFileSync(path.join(root,file),path.join(out,file));
}
const manifest = {id:'./',name:'Fisiologia Interativa — Biofeedback Respiratório',short_name:'Respirar',lang:'pt-BR',description:'Guia respiratório com ritmos visuais e sonoros opcionais.',start_url:'./',scope:'./',display:'standalone',background_color:'#071019',theme_color:'#071019',icons:[{src:'icons/icon-192.png',sizes:'192x192',type:'image/png',purpose:'any'},{src:'icons/icon-512.png',sizes:'512x512',type:'image/png',purpose:'any maskable'}]};
write('manifest.webmanifest',JSON.stringify(manifest,null,2)+'\n');
const assets=['index.html','app.js','manifest.webmanifest','biofeedback-audio.js','ef-simuladores.css','avatar-prof-mario.webp','icons/icon-192.png','icons/icon-512.png','icons/apple-touch-icon.png',...['inspire','expire','pausa','orientacoes'].map(n=>'assets/audio/biofeedback/'+n+'.mp3')];
const hash=crypto.createHash('sha256');for(const file of assets)hash.update(file).update(fs.readFileSync(path.join(out,file)));
const version=hash.digest('hex').slice(0,16);
write('sw.js', `/* Offline files for the respiratory app only. Updates activate after open sessions close. */
const PREFIX='fi-respirar-'+encodeURIComponent(new URL(self.registration.scope).pathname)+'-';
const CACHE=PREFIX+'${version}';
const ASSETS=${JSON.stringify(assets)};
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
`);
console.log('Biofeedback offline: '+assets.length+' arquivos, versão '+version);
