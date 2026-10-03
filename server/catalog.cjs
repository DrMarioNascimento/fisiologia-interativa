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
  return JSON.parse(JSON.stringify({ ef:ef.concat(ra), fisio:context.window.fisioterapiaTutor.modules.concat(ra) }));
}
module.exports = { loadCatalog };
