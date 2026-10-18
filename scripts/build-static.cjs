const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const output = path.join(root, 'dist-vercel');
const excluded = new Set(['node_modules', '.git', '.github', '.vercel', '.next', 'dist-vercel', 'server', 'tests', 'scripts', 'origem-v0', 'user_read_only_context', 'v0_memories', 'test-results', 'playwright-report']);
const extensions = new Set(['.html', '.css', '.js', '.mjs', '.json', '.svg', '.png', '.jpg', '.jpeg', '.webp', '.gif', '.avif', '.ico', '.woff', '.woff2', '.ttf', '.otf', '.glb', '.gltf', '.bin', '.mp3', '.wav', '.ogg', '.mp4', '.webm', '.pdf', '.wasm', '.xml', '.txt', '.webmanifest', '.hdr', '.ktx2', '.usdz']);
let count = 0;
fs.rmSync(output, { recursive: true, force: true });
function copyDirectory(directory, relative = '') {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || excluded.has(entry.name) || entry.isSymbolicLink()) continue;
    const source = path.join(directory, entry.name);
    const target = path.join(relative, entry.name);
    if (entry.isDirectory()) {
      copyDirectory(source, target);
    } else if (extensions.has(path.extname(entry.name).toLowerCase()) && !/^(package(?:-lock)?\.json|vercel\.json|tsconfig.*\.json)$|(?:\.test|\.spec)\.[cm]?js$|^tests?\.mjs$/.test(entry.name)) {
      const destination = path.join(output, target);
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.copyFileSync(source, destination);
      count++;
    }
  }
}
copyDirectory(root);
for (const required of ['index.html', 'endocrino/thyroid.html', 'endocrino/thyroid-model.js']) {
  if (!fs.existsSync(path.join(output, required))) throw new Error(`Arquivo público ausente: ${required}`);
}
console.log(`Publicação estática preparada: ${count} arquivos.`);
