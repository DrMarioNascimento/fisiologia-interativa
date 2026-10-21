/* Native assets are derived from the existing PWA, never maintained separately. */
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { buildSync } = require('esbuild');
const here = __dirname, root = path.resolve(here, '../..'), out = path.join(here, 'www');
execFileSync(process.execPath, ['scripts/build-biofeedback.cjs'], {cwd:root, stdio:'inherit'});
fs.rmSync(out, {recursive:true, force:true}); fs.mkdirSync(out, {recursive:true});
for (const file of ['index.html','biofeedback-audio.js','biofeedback-session.js','biofeedback-agenda.js','ef-simuladores.css','avatar-prof-mario.webp','assets','icons']) {
  fs.cpSync(path.join(root,'respirar',file), path.join(out,file), {recursive:true});
}
let html = fs.readFileSync(path.join(out,'index.html'), 'utf8');
html = html.replace(/<section class="card app-offline"[\s\S]*?<\/section>/, '');
html = html.replace(/<script src="app\.js"><\/script>/, '<script src="native.js"></script>');
html = html.replace(/<link rel="manifest"[^>]*>/, '');
html = html.replace('A agenda fica salva neste aparelho. Você pode iniciar quando preferir. As notificações com o aplicativo fechado serão acrescentadas na versão nativa.', 'A agenda fica salva neste aparelho. Os lembretes são opcionais e podem ser ativados abaixo.');
html = html.replace(/viewport-fit=cover,?\s*/g, '').replace(/,\s*viewport-fit=cover/g, '').replace('initial-scale=1, ', 'initial-scale=1');
html = html.replace('</body>', '<section class="card" style="padding:16px;margin:16px 0"><a href="privacidade.html" style="color:#8bc4ff">Política de Privacidade</a></section></body>');
fs.copyFileSync(path.join(root, 'respirar-privacidade.html'), path.join(out, 'privacidade.html'));
fs.writeFileSync(path.join(out,'index.html'), html);
buildSync({entryPoints:[path.join(here,'entry.mjs')], outfile:path.join(out,'native.js'), bundle:true, format:'iife', target:['safari15','chrome100'], minify:true});
console.log('Pacote web nativo preparado em native/respirar/www. Não é um APK ou IPA.');
