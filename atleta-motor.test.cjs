// Testes do motor fisiológico do Box do Atleta (atleta-motor.js).
// Cada caso afirma o DESFECHO e o MECANISMO, não só que o código rodou.
// Rodar: npm run test:atleta
const test = require('node:test');
const assert = require('node:assert/strict');
const M = require('./atleta-motor.js');

const X = (s, ...a) => M.executar(s, ...a);
const seg = s => M.segAtual(s).id;
function rodar(id, plano, ate = 1100) {
  const s = M.criar(id);
  for (let t = 0; t < ate && !s.fim; t++) { if (plano) plano(s, t); M.passo(s, 1); }
  return s;
}

// conduta fisiologicamente razoável: ritmo moderado, carboidrato 60–90 g/h com
// glicose + frutose, líquido perto do suor, sódio para quem sua sal
function conduta(i1, i2, o = {}) {
  return (s, t) => {
    const g = seg(s);
    if (t === 0) X(s, 'controle', 'intensidade', i1);
    if (g === 't1' && !s._t1) { s._t1 = 1; X(s, 'controle', 'hidratacao', o.hid || 'fixo'); X(s, 'controle', 'bebida', o.bebida || 'b21'); X(s, 'controle', 'taxa', o.taxa || 700); }
    if (g === 'ciclismo' && t % 60 === 30 && !o.semGel) X(s, 'dar', o.comida || 'gel');
    if ((g === 'ciclismo' || g === 'corrida') && t % 60 === 0 && !o.semSal) X(s, 'dar', 'sal');
    if (g === 't2' && !s._t2) { s._t2 = 1; X(s, 'controle', 'intensidade', i2); X(s, 'controle', 'bebida', o.bebida2 || 'iso'); X(s, 'controle', 'taxa', o.taxa2 || 800); }
    if (g === 'corrida' && t % 45 === 0 && !o.semGel) X(s, 'dar', o.comida || 'gel');
    if (o.extra) o.extra(s, t, g);
  };
}
// ironmanSal: com a evaporação limitada ao suor produzido, quem sua muito perde ~1,1–1,2 L/h no calor;
// a reposição passa de 700/800 para 800/900 mL/h (ainda abaixo do suor, perda final de ~3,5% do peso).
const SAL_BOA = { taxa: 800, taxa2: 900 };
const BOA = {
  ironmanSal: conduta(0.62, 0.60, SAL_BOA),
  ironmanBebe: conduta(0.62, 0.60, { bebida: 'iso', taxa: 600, bebida2: 'iso', taxa2: 600, semSal: 1 })
};

for (const id of Object.keys(BOA)) {
  test(`${id}: com conduta fisiológica termina com todos os alvos`, () => {
    const s = rodar(id, BOA[id]);
    assert.equal(s.fim.tipo, 'chegada', s.fim.causa);
    assert.ok(s.fim.t < 14 * 60, 'tempo ' + M.hhmm(s.fim.t));
    assert.equal(s.fim.n, s.fim.total, 'falhou: ' + s.fim.lista.filter(x => !x.ok).map(x => x.nome).join(', '));
  });
}

test('suor salgado sem carboidrato: o fígado esvazia e a glicemia cai no ciclismo', () => {
  const s = rodar('ironmanSal', null);
  assert.equal(s.fim.causa, 'hipoglicemia');
  assert.equal(seg(s), 'ciclismo');
  assert.ok(s.glyL / s.a.glyL < 0.05, 'fígado ainda tinha glicogênio');
  assert.ok(s.glyM / s.a.glyM > 0.25, 'foi o músculo, não o fígado');
});

test('beber 1,5 L/h de água: hiponatremia com peso ACIMA da largada e urina clara', () => {
  // gel a cada 30 min no ciclismo só para isolar a água: sem nenhum carboidrato, a hipoglicemia
  // (5 h) e a hiponatremia (~5 h) chegam juntas e disputam a causa do abandono
  const s = rodar('ironmanBebe', (s, t) => { if (seg(s) === 'ciclismo' && t % 30 === 0) X(s, 'dar', 'gel'); });
  assert.equal(s.fim.causa, 'hiponatremia');
  assert.ok(s.v.perda < -2, 'peso ' + s.v.perda);
  assert.ok(s.eventos.some(e => /urina clara/.test(e.texto)));
});

test('sódio não protege de hiponatremia quando a água sobra', () => {
  const s = rodar('ironmanBebe', (s, t) => {
    if (t === 0) { X(s, 'controle', 'intensidade', 0.62); X(s, 'controle', 'bebida', 'iso'); }
    if ((seg(s) === 'ciclismo' || seg(s) === 'corrida') && t % 30 === 0) X(s, 'dar', 'sal');
  });
  assert.equal(s.fim.causa, 'hiponatremia');
  assert.ok(s.bal.na * 23 > 8000, 'recebeu pouco sódio: ' + s.bal.na * 23);
});

test('beber pela sede protege da hiponatremia', () => {
  const s = rodar('ironmanBebe', conduta(0.62, 0.60, { hid: 'sede', bebida: 'agua', bebida2: 'agua', semSal: 1 }));
  assert.equal(s.fim.tipo, 'chegada');
  assert.ok(s.ext.naMin >= 135, 'Na mínimo ' + s.ext.naMin);
});

test('corrida forte no calor da tarde: intermação', () => {
  const s = rodar('ironmanSal', conduta(0.62, 0.75));
  assert.equal(s.fim.causa, 'intermacao');
  assert.equal(seg(s), 'corrida');
});

test('resfriar a pele no calor da corrida reduz o pico de temperatura central', () => {
  const sem = rodar('ironmanSal', conduta(0.62, 0.72));
  const com = rodar('ironmanSal', conduta(0.62, 0.72, { extra: (s, t, g) => { if (g === 'corrida' && t % 10 === 0) X(s, 'dar', 'esponja'); if (g === 'corrida' && t % 30 === 0) X(s, 'dar', 'gelo'); } }));
  assert.ok(sem.ext.tcMax > com.ext.tcMax + 0.15, `tcMax sem ${sem.ext.tcMax.toFixed(2)} × com ${com.ext.tcMax.toFixed(2)}`);
});

test('pouco líquido para quem sua muito: colapso com sódio alto', () => {
  const s = rodar('ironmanSal', conduta(0.62, 0.60, { taxa: 300, taxa2: 300 }));
  assert.equal(s.fim.causa, 'colapso');
  assert.ok(s.v.na > 146, 'Na ' + s.v.na);
  assert.ok(s.v.pvRel < 0.8, 'volume plasmático ' + s.v.pvRel);
});

test('barra de proteína no lugar do gel: o estômago não esvazia e ele vomita', () => {
  const s = rodar('ironmanSal', conduta(0.62, 0.60, { comida: 'proteina' }));
  assert.ok(s.vomitos >= 1);
  assert.notEqual(s.fim.tipo, 'chegada');
});

test('com a mesma quantidade de carboidrato, glicose + frutose é mais absorvida que só glicose', () => {
  const medir = (bebida, gelACada) => {
    const s = M.criar('ironmanSal');
    X(s, 'controle', 'intensidade', 0.6);
    let exo0 = 0, cho0 = 0;
    for (let t = 0; t < 330; t++) {
      if (seg(s) === 't1' && !s._t1) { s._t1 = 1; X(s, 'controle', 'hidratacao', 'fixo'); X(s, 'controle', 'bebida', bebida); X(s, 'controle', 'taxa', 1000); }
      if (seg(s) === 'ciclismo' && gelACada && t % gelACada === 0) X(s, 'dar', 'gel');
      if (t === 150) { exo0 = s.bal.choExo; cho0 = s.bal.cho; }
      M.passo(s, 1);
    }
    return { absorvido: (s.bal.choExo - exo0) / 3, ingerido: (s.bal.cho - cho0) / 3 };
  };
  const mista = medir('b21', 0);                  // 90 g/h, 2:1
  const soGlicose = medir('agua', 15);            // 88 g/h, só glicose
  assert.ok(mista.ingerido > 80 && soGlicose.ingerido > 80, `ingerido ${mista.ingerido} × ${soGlicose.ingerido}`);
  assert.ok(mista.absorvido > soGlicose.absorvido + 8 && mista.absorvido / mista.ingerido > soGlicose.absorvido / soGlicose.ingerido, `absorvido ${mista.absorvido}/${mista.ingerido} × ${soGlicose.absorvido}/${soGlicose.ingerido}`);
});

test('na natação não se entrega nada; na corrida só no posto', () => {
  const s = M.criar('ironmanSal');
  X(s, 'dar', 'gel');
  assert.equal(s.bal.cho, 0);
  for (let t = 0; seg(s) !== 'corrida'; t++) {
    assert.ok(!s.fim && t < 900, 'não chegou à corrida');
    BOA.ironmanSal(s, t); M.passo(s, 1);
  }
  M.passo(s, 1);
  const cho0 = s.bal.cho;
  X(s, 'dar', 'gel');
  assert.equal(s.bal.cho, cho0, 'gel chegou antes do posto');
  const posto = M.proximoPosto(s);
  for (let i = 0; s.km < posto.km && !s.fim && i < 200; i++) M.passo(s, 0.5);
  assert.ok(s.bal.cho >= cho0 + 22 && s.fila.length === 0);
});

test('água fecha: absorvida + metabólica − suor − urina − respiração = variação da água corporal', () => {
  const s = rodar('ironmanSal', BOA.ironmanSal, 400);
  const b = s.bal;
  const esperado = s.tbw0 + b.absorvida - b.secretada + b.metab - b.suor - b.urina - b.resp;
  assert.ok(Math.abs(s.icf + s.ecf - esperado) < 0.01, `TBW ${s.icf + s.ecf} × ${esperado}`);
});
