import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const app = fs.readFileSync(new URL('../musculo-sarcomero/app.js', import.meta.url), 'utf8');

test('miofibrila: o controle de comprimento aparece nos níveis 04 e 05 e usa a função aprovada', () => {
  assert.match(app, /E\.contrBox\.hidden = n < 3;/);
  assert.match(app, /mioPartes\.sarcs\.forEach\(\(s, i\) => \{ aplicarComprimento\(s, L\);/);
  assert.match(app, /E\.contr\.addEventListener\('input', aplicarMiofibrila\);/);
  assert.match(app, /s\.scale\.set\(1, s\.scale\.y, s\.scale\.z\)/);       // discos Z internos sobre os anéis
});

test('miofibrila: a capa encurta como o sarcômero — banda A fixa, banda I e zona H encolhem', () => {
  const fn = app.match(/function posicaoNoComprimento\(xr, L\) \{[\s\S]*?\n\}/)[0];
  const ctx = { SARC: { len: 2.4 }, SCM: { A: 1.6, actina: 1.0 }, N_SARC_MIO: 3, Math };
  vm.runInNewContext(fn, ctx);
  const f = ctx.posicaoNoComprimento;
  for (const L of [1.9, 2.0, 2.4, 3.0, 3.4]) {
    for (const i of [-1, 0, 1]) {
      const c = i * 2.4, cL = i * L;
      assert(Math.abs(f(c, L) - cL) < 1e-9, 'linha M');
      assert(Math.abs(f(c + .8, L) - (cL + .8)) < 1e-9, 'borda da banda A');          // banda A = 1,6 em qualquer L
      assert(Math.abs(f(c - .8, L) - (cL - .8)) < 1e-9);
      assert(Math.abs(f(c + .2, L) - (cL + Math.max(0, L / 2 - 1))) < 1e-9, 'zona H');
    }
    assert(Math.abs(f(1.2, L) - L / 2) < 1e-9 && Math.abs(f(3.6, L) - 1.5 * L) < 1e-9, 'discos Z');
    let ant = -Infinity;                                                             // nunca dobra
    for (let x = -3.6; x <= 3.6; x += .005) { const y = f(x, L); assert(y >= ant - 1e-9); ant = y; }
  }
});

test('músculo: miofibrila e sarcômero vão à RA na escala do repouso', () => {
  assert.match(app, /const LADO_REPOUSO = \{ 3: maiorLado\(modelos\[3\]\), 4: maiorLado\(modelos\[4\]\) \};/);
  assert.match(app, /TAM_REAL\[atual\] \/ \(LADO_REPOUSO\[atual\] \|\| lado\)/);
});
