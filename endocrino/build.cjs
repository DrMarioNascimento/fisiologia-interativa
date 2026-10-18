const fs = require('node:fs');
const path = require('node:path');
const { stripTypeScriptTypes } = require('node:module');
const imports = {
  model: '',
  labs: "import { BASELINE_STATE, DEFAULT_PARAMS, plasmaOsm, waterFlows } from './model.js?v=20261018-audit2';\n",
  axes: '',
  scenarios: '',
  interpret: "import { labStatus } from './labs.js?v=20261018-audit2';\n",
};
for (const name of Object.keys(imports)) {
  const source = fs.readFileSync(path.join(__dirname, 'src', name + '.ts'), 'utf8').replace(/^import .*$/gm, '');
  fs.writeFileSync(path.join(__dirname, name + '.js'), imports[name] + stripTypeScriptTypes(source));
}
