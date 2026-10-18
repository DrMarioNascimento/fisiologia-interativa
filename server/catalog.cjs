'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

// Evaluate only the repository's teaching data, never request-supplied code.
function loadCatalog(root) {
  const context = vm.createContext({ window: {}, document: {
    querySelector: () => null, addEventListener: () => {}
  } });
  vm.runInContext(fs.readFileSync(path.join(root, 'tutor-ef-data.js'), 'utf8'), context, { timeout: 1000 });
  const ef = vm.runInContext('modules', context);
  vm.runInContext(fs.readFileSync(path.join(root, 'tutor-fisio-data.js'), 'utf8'), context, { timeout: 1000 });
  vm.runInContext(fs.readFileSync(path.join(root, 'tutor-ra-data.js'), 'utf8'), context, { timeout: 1000 });
  const ra=context.window.raTutorModules;
  const extras = loadExtras(root);
  return JSON.parse(JSON.stringify({ ef:ef.concat(ra, extras.ef), fisio:context.window.fisioterapiaTutor.modules.concat(context.window.raTutorModulesForCourse('fisio'), extras.fisio) }));
}

// Desafios de fechamento da integração (Box do Atleta na EF, UTI fisiológica na Fisio).
// Lidos do mesmo tutor-desafios-extra.js que as páginas usam, simulando cada percurso.
function loadExtras(root) {
  const file = path.join(root, 'tutor-desafios-extra.js');
  if (!fs.existsSync(file)) return { ef: [], fisio: [] };
  const code = fs.readFileSync(file, 'utf8');
  const run = fisio => {
    const context = vm.createContext({
      modules: [], escapeRooms: {}, URLSearchParams,
      location: { pathname: fisio ? '/tutor-fisio.html' : '/tutor-ef.html', search: '' },
      window: fisio ? { fisioterapiaTutor: { modules: [] } } : {}
    });
    vm.runInContext(code, context, { timeout: 1000 });
    return fisio ? context.window.fisioterapiaTutor.modules : context.modules;
  };
  return { ef: run(false), fisio: run(true) };
}
module.exports = { loadCatalog };
