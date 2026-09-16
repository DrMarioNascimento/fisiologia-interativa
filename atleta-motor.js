/* ==========================================================================
   Box do Atleta — motor fisiológico
   --------------------------------------------------------------------------
   Modelo didático de um atleta amador em provas longas: Ironman, maratona,
   ultramaratona de montanha e corrida de aventura.
   Tudo o que aparece na tela sai daqui; a página só desenha.

   Tempo em MINUTOS de prova. Volumes em L (estômago e intestino em mL),
   glicogênio em g, sódio em mmol, calor em W.

   Blocos, na ordem em que o passo os calcula:
     1. Onde ele está: segmento, altitude e inclinação do percurso, clima da
        hora (temperatura com a altitude, umidade, sol, vento, chuva).
     2. Limites do ritmo: o atleta faz a intensidade pedida (%VO₂máx ao nível
        do mar) até esbarrar no que falta — glicogênio, glicemia, calor, frio,
        oxigênio na altitude, débito cardíaco, estômago, músculo, sono. O menor
        limite manda.
     3. Energia: gasto = VO₂ × equivalente calórico (+ tremor no frio). A fração
        de carboidrato sobe com a intensidade. Glicogênio muscular, glicose do
        sangue, fígado (glicogênio + gliconeogênese) e intestino.
     4. Intestino: esvaziamento gástrico e absorção (glicose ~1 g/min pelo
        SGLT1, frutose ~0,6 g/min pelo GLUT5, água acompanhando os solutos).
     5. Calor: produção metabólica menos trabalho. Núcleo → pele pelo fluxo
        cutâneo; pele → ambiente por convecção e radiação através da roupa,
        sol, chuva e evaporação do suor. Na natação, condução para a água.
        No frio: vasoconstrição e tremor, que gasta carboidrato.
     6. Cardiovascular: débito = músculo + pele + órgãos. Volume sistólico cai
        com o volume plasmático e com a FC alta. Na altitude, menos O₂ por
        litro de sangue pede mais débito para o mesmo VO₂.
     7. Água e sódio: suor, respiração, urina com ADH osmótico e não osmótico,
        água metabólica, equilíbrio LIC ↔ LEC.
     8. Sono: pressão homeostática (horas acordado) + ritmo circadiano.
   ========================================================================== */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.AtletaMotor = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
  const relax = (x, alvo, dt, tau) => x + (alvo - x) * (1 - Math.exp(-dt / tau));
  const psat = T => 0.6108 * Math.exp(17.27 * T / (T + 237.3));   // kPa
  function tabela(tab, x) {
    if (x <= tab[0][0]) return tab[0][1];
    for (let i = 1; i < tab.length; i++) {
      if (x <= tab[i][0]) { const [x0, y0] = tab[i - 1], [x1, y1] = tab[i]; return y0 + (y1 - y0) * (x - x0) / (x1 - x0); }
    }
    return tab[tab.length - 1][1];
  }
  // Severinghaus (1979)
  const satO2 = po2 => 1 / (23400 / (po2 * po2 * po2 + 150 * po2) + 1);

  const DT = 0.1;                  // min por subpasso

  // ----------------------------------------------------------- modalidades
  // eff: fração do gasto que vira trabalho externo (não é calor)
  // dano: dano muscular por minuto a 100% (× intensidade²)
  // gi: desconforto gastrointestinal próprio da modalidade (impacto)
  const MOD = {
    nado:      { nome: 'Natação',     eff: 0.06, dano: 0.0003, gi: 0 },
    bike:      { nome: 'Ciclismo',    eff: 0.20, dano: 0.0005, gi: 0,    crr: 0.004, cda: 0.36, bike: 9 },
    mtb:       { nome: 'Mountain bike', eff: 0.20, dano: 0.0008, gi: 0.03, crr: 0.02, cda: 0.55, bike: 13 },
    corrida:   { nome: 'Corrida',     eff: 0.10, dano: 0.0036, gi: 0.06 },
    trekking:  { nome: 'Trekking',    eff: 0.10, dano: 0.0012, gi: 0.02 },
    canoa:     { nome: 'Canoagem',    eff: 0.10, dano: 0.0004, gi: 0 },
    transicao: { nome: 'Transição',   eff: 0,    dano: 0,      gi: 0 }
  };
  const ROUPAS = [
    { nome: 'Leve (camiseta ou macaquinho)', clo: 0.1, impermeavel: false },
    { nome: 'Manga longa + corta-vento',     clo: 0.6, impermeavel: false },
    { nome: 'Jaqueta impermeável, segunda pele, gorro e luvas', clo: 1.2, impermeavel: true }
  ];

  // --------------------------------------------------- o que se come e bebe
  // glic = glicose e polímeros (maltodextrina, amido, sacarose/2); fruc = frutose.
  // lento = proteína + gordura + fibra (g). na, k em mmol. caf em mg.
  // doce = conta para o enjoo de doce. carrega = cabe na mochila. g = massa na mochila.
  const ITENS = {
    agua:     { nome: 'Água',                        porcao: '500 mL', vol: 500, glic: 0,  fruc: 0,  lento: 0,  na: 0,  k: 0,  caf: 0 },
    iso:      { nome: 'Isotônico',                   porcao: '500 mL', vol: 500, glic: 22, fruc: 8,  lento: 0,  na: 10, k: 2,  caf: 0 },
    b21:      { nome: 'Bebida de carboidrato 2:1',   porcao: '500 mL', vol: 500, glic: 30, fruc: 15, lento: 0,  na: 10, k: 1,  caf: 0 },
    gel:      { nome: 'Gel de carboidrato',          porcao: '1 sachê', vol: 40, glic: 22, fruc: 0,  lento: 0,  na: 2,  k: 0,  caf: 0,  doce: true, carrega: true, g: 45 },
    gelcaf:   { nome: 'Gel com cafeína',             porcao: '1 sachê', vol: 40, glic: 22, fruc: 0,  lento: 0,  na: 2,  k: 0,  caf: 75, doce: true, carrega: true, g: 45 },
    cola:     { nome: 'Refrigerante de cola',        porcao: '200 mL', vol: 200, glic: 11, fruc: 11, lento: 0,  na: 0,  k: 0,  caf: 20, doce: true },
    banana:   { nome: 'Banana',                      porcao: '1 média', vol: 90, glic: 16, fruc: 8,  lento: 3,  na: 0,  k: 10, caf: 0,  carrega: true, g: 120 },
    cereal:   { nome: 'Barra de cereal',             porcao: '25 g',   vol: 5,   glic: 14, fruc: 4,  lento: 5,  na: 3,  k: 1,  caf: 0,  doce: true, carrega: true, g: 28 },
    proteina: { nome: 'Barra de proteína',           porcao: '60 g',   vol: 8,   glic: 14, fruc: 6,  lento: 33, na: 8,  k: 3,  caf: 0,  carrega: true, g: 62 },
    batata:   { nome: 'Batata cozida com sal',       porcao: '100 g',  vol: 75,  glic: 20, fruc: 0,  lento: 2,  na: 20, k: 10, caf: 0,  salgado: true, carrega: true, g: 105 },
    sopa:     { nome: 'Caldo quente com macarrão',   porcao: '300 mL', vol: 300, glic: 25, fruc: 0,  lento: 4,  na: 35, k: 5,  caf: 0,  salgado: true, sumidouro: -300 * 4.18 * 23 },
    sal:      { nome: 'Cápsula de sal',              porcao: '250 mg de Na⁺', vol: 0, glic: 0, fruc: 0, lento: 0, na: 11, k: 1, caf: 0, carrega: true, g: 2 },
    cafeina:  { nome: 'Cápsula de cafeína',          porcao: '200 mg', vol: 0,   glic: 0,  fruc: 0,  lento: 0,  na: 0,  k: 0,  caf: 200, carrega: true, g: 1 },
    raspadinha: { nome: 'Raspadinha de gelo',        porcao: '300 mL', vol: 300, glic: 0,  fruc: 0,  lento: 0,  na: 0,  k: 0,  caf: 0, sumidouro: 300 * (334 + 4.18 * 37) },
    esponja:  { nome: 'Esponja com água gelada',     porcao: 'cabeça e nuca', vol: 0, glic: 0, fruc: 0, lento: 0, na: 0, k: 0, caf: 0, esponja: 260 },
    gelo:     { nome: 'Gelo no boné e na nuca',      porcao: 'saco de gelo', vol: 0, glic: 0, fruc: 0, lento: 0, na: 0, k: 0, caf: 0, gelo: 150 }
  };
  const BEBIDAS_PLANO = ['agua', 'iso', 'b21'];
  const CARREGAVEIS = Object.keys(ITENS).filter(k => ITENS[k].carrega);

  // ============================================================== casos
  const CALOR_KONA = {
    altBase: 0, tagua: 26, vento: 3, nuvens: 0.1, nascer: 6.3, por: 18.6,
    tar: [[0, 24], [6, 25], [9, 29], [12, 32.5], [14, 34], [16, 33], [18, 30], [20, 27], [24, 24]],
    ur:  [[0, 0.8], [6, 0.80], [9, 0.66], [12, 0.56], [14, 0.52], [16, 0.55], [18, 0.64], [20, 0.74], [24, 0.8]]
  };

  const IRONMAN = {
    id: 'ironman', nome: 'Ironman', largada: 7, corteFinal: 1020,
    resumo: '3,8 km de natação, 180 km de ciclismo e 42,2 km de corrida, largando às 7 h e terminando no calor da tarde.',
    logistica: 'Na natação não se come. No ciclismo ele carrega o que você mandar. Na corrida só recebe nos postos, a cada 2 km. Corte final: 17 h de prova.',
    cargaBase: 0,
    alvos: { cho: [55, 95], peso: [-4, 0.3] },
    segmentos: [
      { id: 'natacao',  nome: 'Natação',     tipo: 'nado',      km: 3.8,  corte: 140, apoio: 'nenhum', peso: 10 },
      { id: 't1',       nome: 'Transição 1', tipo: 'transicao', min: 6 },
      { id: 'ciclismo', nome: 'Ciclismo',    tipo: 'bike',      km: 180,  corte: 630, posto: 20, apoio: 'carrega', peso: 55 },
      { id: 't2',       nome: 'Transição 2', tipo: 'transicao', min: 5 },
      { id: 'corrida',  nome: 'Corrida',     tipo: 'corrida',   km: 42.2, corte: 1020, posto: 2, apoio: 'posto', peso: 35 }
    ]
  };

  const MARATONA = {
    id: 'maratona', nome: 'Maratona no calor', largada: 7.5, corteFinal: 360,
    resumo: '42,2 km numa cidade litorânea no verão. Largada às 7h30 com 25 °C e ar úmido; às 10 h já passa de 30 °C no asfalto.',
    logistica: 'Postos a cada 2,5 km com água, isotônico, gel, esponja e gelo. O que você pedir, ele pega no posto seguinte. Corte: 6 h.',
    cargaBase: 0,
    alvos: { cho: [30, 90], peso: [-4, 0.3] },
    segmentos: [
      { id: 'maratona', nome: 'Maratona', tipo: 'corrida', km: 42.2, corte: 360, posto: 2.5, apoio: 'posto', peso: 100 }
    ]
  };

  const ULTRA = {
    id: 'ultra', nome: 'Ultra de montanha 100 km', largada: 18, corteFinal: 1740,
    resumo: '100 km de trilha com ~5.000 m de subida, entre 900 e 2.900 m de altitude. Largada às 18 h: a primeira noite inteira nas partes altas, com previsão de chuva, e o dia seguinte quente no vale.',
    logistica: 'Postos a cada 12,5 km com comida quente, bebidas e reabastecimento da mochila. Entre eles, só o que está na mochila. A jaqueta é equipamento obrigatório: está sempre com ele, mas vestir custa uma parada. Corte: 29 h.',
    cargaBase: 1.8, altitude: true, frio: true,
    alvos: { cho: [40, 90], peso: [-5, 0.3] },
    segmentos: [
      { id: 'trilha', nome: 'Trilha 100 km', tipo: 'corrida', km: 100, corte: 1740, posto: 12.5, apoio: 'mochila', terreno: 1.15, peso: 100,
        perfil: [[0, 900], [8, 1500], [15, 2300], [20, 2700], [26, 1800], [33, 1200], [40, 1400], [47, 2100], [52, 2600], [57, 2900],
                 [63, 2200], [70, 1500], [76, 1100], [82, 1700], [88, 2400], [92, 2500], [96, 1600], [100, 900]] }
    ]
  };

  const AVENTURA = {
    id: 'aventura', nome: 'Corrida de aventura 36 h', largada: 10, corteFinal: 2400,
    resumo: 'Trekking de montanha, mountain bike, canoagem no rio, trekking de navegação e mountain bike de novo — cerca de 240 km sem parada obrigatória, atravessando uma noite fria com chuva de madrugada.',
    logistica: 'Só há apoio nas áreas de transição, onde fica a caixa da equipe. Entre elas, só o que está na mochila; água dá para repor em riachos pelo caminho. Dormir é escolha da equipe e custa tempo. Corte: 40 h.',
    cargaBase: 5, altitude: true, frio: true, sono: true,
    alvos: { cho: [35, 90], peso: [-6, 0.3], sono: true },
    segmentos: [
      { id: 'trek1', nome: 'Trekking de montanha', tipo: 'trekking', km: 28, apoio: 'mochila', fontes: 7, terreno: 1.35, peso: 22,
        perfil: [[0, 600], [7, 1300], [14, 1700], [21, 1100], [28, 700]] },
      { id: 'at1', nome: 'Área de transição 1', tipo: 'transicao', min: 20 },
      { id: 'mtb1', nome: 'Mountain bike', tipo: 'mtb', km: 90, apoio: 'mochila', fontes: 20, peso: 22,
        perfil: [[0, 700], [20, 1200], [40, 900], [55, 1400], [70, 800], [90, 300]] },
      { id: 'at2', nome: 'Área de transição 2', tipo: 'transicao', min: 20 },
      { id: 'canoa', nome: 'Canoagem no rio', tipo: 'canoa', km: 32, apoio: 'mochila', fontes: 8, corrente: 0.4, peso: 14 },
      { id: 'at3', nome: 'Área de transição 3', tipo: 'transicao', min: 25 },
      { id: 'trek2', nome: 'Trekking de navegação', tipo: 'trekking', km: 30, apoio: 'mochila', fontes: 10, terreno: 1.5, navegacao: true, peso: 26,
        perfil: [[0, 300], [8, 1100], [15, 1600], [22, 1400], [30, 500]] },
      { id: 'at4', nome: 'Área de transição 4', tipo: 'transicao', min: 20 },
      { id: 'mtb2', nome: 'Mountain bike final', tipo: 'mtb', km: 60, corte: 2400, apoio: 'mochila', fontes: 20, peso: 16,
        perfil: [[0, 500], [20, 900], [40, 600], [60, 200]] }
    ]
  };

  const CENARIOS = {
    ironmanSal: {
      id: 'ironmanSal', prova: IRONMAN, nome: 'Ironman no calor', sub: 'Triatleta de suor salgado · 1º Ironman',
      historia: 'Homem, 38 anos, 72 kg, 1,78 m, VO₂máx 55 mL/kg/min. Sua muito e deixa marcas brancas de sal no uniforme. A prova larga às 7 h, com mar a 26 °C, e a tarde chega a 34 °C com umidade alta. O plano dele: "sair forte e comer quando der fome". Bebe água quando tem sede.',
      pede: 'Ritmo que caiba no calor, carboidrato que o intestino absorva, e reposição de água e sódio de quem perde muito sal.',
      atleta: { massa: 72, altura: 1.78, fracAgua: 0.6, vo2max: 55, lt: 0.76, fcMax: 185, fcRep: 50, sv: 150,
                sud: 1.0, naSuor: 65, glyM: 450, glyL: 95, teimosia: 0.5, nado: 0.9, acordado: 3 },
      plano: { intensidade: 0.72, hidratacao: 'sede', bebida: 'agua', taxa: 600, roupa: 0 },
      ambiente: CALOR_KONA
    },
    ironmanBebe: {
      id: 'ironmanBebe', prova: IRONMAN, nome: 'Ironman no calor', sub: 'Triatleta que bebe em todo posto',
      historia: 'Mulher, 31 anos, 58 kg, 1,65 m, VO₂máx 50 mL/kg/min. Sua pouco e perde pouco sal. Leu que desidratar derruba o desempenho e decidiu "beber para nunca sentir sede": uma caramanhola de água a cada 20 km e copos em todos os postos. Mesma prova, mesmo calor.',
      pede: 'Beber o que se perde e não mais que isso, carboidrato suficiente, e perceber cedo os sinais de que a água está sobrando.',
      atleta: { massa: 58, altura: 1.65, fracAgua: 0.52, vo2max: 50, lt: 0.75, fcMax: 186, fcRep: 54, sv: 118,
                sud: 0.62, naSuor: 30, glyM: 360, glyL: 80, teimosia: 0.5, nado: 0.95, acordado: 3 },
      plano: { intensidade: 0.66, hidratacao: 'fixo', bebida: 'agua', taxa: 1500, roupa: 0 },
      ambiente: CALOR_KONA
    },
    maratona: {
      id: 'maratona', prova: MARATONA, nome: 'Maratona no calor', sub: 'Maratonista amador com meta de inverno',
      historia: 'Homem, 34 anos, 78 kg, 1,80 m, VO₂máx 50 mL/kg/min. Treinou no inverno para 3h50 e quer o mesmo tempo hoje, no verão — sem nenhuma semana de aclimatação ao calor: começa a suar mais tarde, sua menos e perde mais sal que um atleta aclimatado. Largada às 7h30 com 25 °C e 85% de umidade; às 10 h, 31 °C. Bebe água quando tem sede e não gosta de gel.',
      pede: 'Aceitar que o ritmo do inverno não cabe no calor, resfriar a pele nos postos, e não deixar o glicogênio acabar no km 30.',
      atleta: { massa: 78, altura: 1.80, fracAgua: 0.6, vo2max: 50, lt: 0.78, fcMax: 188, fcRep: 58, sv: 160,
                sud: 0.85, limiarSuor: 38.0, suorMax: 0.9, naSuor: 60, glyM: 440, glyL: 90, teimosia: 0.6, nado: 0.8, acordado: 3 },
      plano: { intensidade: 0.80, hidratacao: 'sede', bebida: 'agua', taxa: 600, roupa: 0 },
      ambiente: {
        altBase: 0, tagua: 26, vento: 1.5, nuvens: 0.1, nascer: 5.5, por: 19,
        tar: [[0, 24], [6, 24], [7.5, 25], [9, 28.5], [10, 30.5], [11, 31.5], [13, 32], [16, 30], [20, 26], [24, 24]],
        ur:  [[0, 0.9], [6, 0.9], [7.5, 0.85], [9, 0.74], [10, 0.68], [11, 0.65], [13, 0.62], [16, 0.66], [20, 0.8], [24, 0.9]]
      }
    },
    ultra: {
      id: 'ultra', prova: ULTRA, nome: 'Ultra de montanha 100 km', sub: 'Maratonista na primeira ultra de montanha',
      historia: 'Mulher, 36 anos, 60 kg, 1,66 m, VO₂máx 56 mL/kg/min. Rápida no asfalto, estreante na montanha. Plano dela: largar forte no pelotão, mochila leve com três géis e meio litro de água, e a jaqueta obrigatória no fundo da mochila "porque só atrapalha". Previsão de chuva gelada entre 1 h e 4h30 da madrugada.',
      pede: 'Ritmo de ultra (e não de maratona) nas subidas, roupa certa na altitude e na chuva, comida de verdade à noite, e água suficiente entre os postos.',
      atleta: { massa: 60, altura: 1.66, fracAgua: 0.54, vo2max: 56, lt: 0.78, fcMax: 186, fcRep: 50, sv: 125,
                sud: 0.8, naSuor: 40, glyM: 380, glyL: 85, teimosia: 0.5, nado: 0.9, acordado: 11 },
      plano: { intensidade: 0.70, hidratacao: 'sede', bebida: 'agua', taxa: 500, roupa: 0, autoItem: 'gel', autoCada: 45 },
      mochila: { gel: 3, agua: 500 },
      ambiente: {
        altBase: 1000, tagua: 15, vento: 3, nuvens: 0.2, nascer: 6.2, por: 19.3, chuva: [[25, 28.5]],
        tar: [[0, 11], [4, 8], [6, 7], [9, 14], [12, 22], [14, 26], [16, 25], [18, 22], [21, 15], [24, 11]],
        ur:  [[0, 0.8], [6, 0.85], [9, 0.65], [12, 0.45], [15, 0.4], [18, 0.5], [21, 0.7], [24, 0.8]]
      }
    },
    aventura: {
      id: 'aventura', prova: AVENTURA, nome: 'Corrida de aventura 36 h', sub: 'Atleta de equipe que não quer dormir',
      historia: 'Homem, 40 anos, 76 kg, 1,77 m, VO₂máx 54 mL/kg/min, experiente. Acordou às 5 h para viajar até a largada, às 10 h. A equipe decidiu não dormir: "dormir é para quem quer perder posição". Mochila com 5 kg de equipamento obrigatório, 1,5 L de água, quatro géis e três barras. Madrugada fria, chuva das 2 h às 6 h.',
      pede: 'Ritmo que dure 36 horas, comida de verdade e água entre as transições, roupa para a madrugada e para a chuva, e dormir na hora certa (ou pagar o preço).',
      atleta: { massa: 76, altura: 1.77, fracAgua: 0.58, vo2max: 54, lt: 0.74, fcMax: 180, fcRep: 52, sv: 145,
                sud: 0.9, naSuor: 45, glyM: 470, glyL: 95, teimosia: 0.4, nado: 0.8, acordado: 5 },
      plano: { intensidade: 0.55, hidratacao: 'sede', bebida: 'agua', taxa: 500, roupa: 0, autoItem: 'cereal', autoCada: 60 },
      mochila: { gel: 4, cereal: 3, agua: 1500 },
      ambiente: {
        altBase: 500, tagua: 20, vento: 2, nuvens: 0.25, nascer: 6, por: 18.5, chuva: [[26, 30]],
        tar: [[0, 15], [4, 12], [6, 11], [9, 19], [12, 26], [15, 29], [18, 25], [21, 19], [24, 15]],
        ur:  [[0, 0.85], [6, 0.9], [9, 0.7], [12, 0.5], [15, 0.45], [18, 0.55], [21, 0.75], [24, 0.85]]
      }
    }
  };

  // ----------------------------------------------------- por que abandonou
  const CAUSAS = {
    intermacao: {
      titulo: 'Intermação por esforço',
      porque: 'O músculo produzia mais calor do que a pele conseguia perder. No ar úmido o suor escorre sem evaporar, e evaporar é o único jeito de perder calor quando o ar está quase na temperatura da pele. Com a desidratação, o volume plasmático caiu e o coração não sustentou ao mesmo tempo o músculo e a pele: o fluxo cutâneo foi cortado e o calor ficou preso no núcleo. Acima de ~40,5 °C o sistema nervoso central falha — confusão, marcha cambaleante, colapso. Intensidade alta é o que mais produz calor: por isso a intermação é mais comum em provas mais curtas e rápidas.',
      atendimento: 'Retirado da prova. A tenda médica mede a temperatura retal e faz imersão em água gelada imediata: resfriar primeiro, transportar depois. A letalidade depende de quanto tempo o núcleo fica acima de 40 °C.'
    },
    hiponatremia: {
      titulo: 'Hiponatremia associada ao exercício',
      porque: 'Entrou mais água do que saiu. Durante o exercício o ADH continua alto por estímulos não osmóticos (esforço, náusea, queda de volume), então o rim não elimina o excesso. A água sobrando dilui o sódio do líquido extracelular e entra nas células por osmose — inclusive nos neurônios. O edema cerebral dá dor de cabeça, vômito, confusão e convulsão. O suor levou sódio junto, o que piora a diluição.',
      atendimento: 'Retirado da prova com o peso ACIMA do da largada. A equipe médica mede o sódio antes de qualquer coisa: dar água ou soro fisiológico agrava. O tratamento da encefalopatia é salina hipertônica 3%.'
    },
    hipoglicemia: {
      titulo: 'Colapso por hipoglicemia',
      porque: 'O glicogênio do fígado acabou e a gliconeogênese sozinha não repõe a glicose que o músculo tira do sangue. O cérebro depende de glicose: tremor, suor frio, confusão e colapso. O carboidrato ingerido é a única fonte que chega a tempo, e só se o intestino estiver absorvendo.',
      atendimento: 'Retirado da prova. Glicose por via oral se estiver consciente, intravenosa se não.'
    },
    colapso: {
      titulo: 'Colapso circulatório por desidratação',
      porque: 'O suor tirou água do plasma mais depressa do que ela foi reposta. Com menos volume, o enchimento do coração caiu, o volume sistólico caiu, e a FC chegou ao máximo sem conseguir manter o débito para músculo, pele e cérebro ao mesmo tempo. A pressão cai quando ele para ou fica em pé.',
      atendimento: 'Retirado da prova. Deitar com as pernas elevadas, medir sódio e temperatura, e repor volume por via oral ou intravenosa conforme o sódio.'
    },
    gastrointestinal: {
      titulo: 'Abandono por distúrbio gastrointestinal',
      porque: 'Com intensidade alta, calor e desidratação, o fluxo sanguíneo do intestino cai muito. O estômago para de esvaziar, e o intestino absorve menos. Gel sem água forma conteúdo hipertônico que puxa água para a luz; gordura, proteína e fibra atrasam ainda mais o esvaziamento; correr sacode tudo isso; horas de doce enjoam. O resultado é cólica, náusea e vômito — e quem vomita perde o que bebeu e comeu.',
      atendimento: 'Retirado da prova. Reidratação oral em pequenos goles quando a náusea ceder.'
    },
    hipotermia: {
      titulo: 'Hipotermia',
      porque: 'O corpo perdia mais calor do que produzia. Na altitude o ar é mais frio (~6,5 °C a menos por 1.000 m) e venta mais; molhada, a roupa perde quase todo o isolamento; e à noite, cansado e andando devagar, o músculo produz pouco calor. A vasoconstrição da pele e o tremor seguraram por um tempo — mas o tremor queima glicose, e sem carboidrato entrando ele falha. Abaixo de 35 °C vêm a fala arrastada, a falta de coordenação e o julgamento ruim.',
      atendimento: 'Retirado da prova. Tirar a roupa molhada, isolar do chão e do vento (saco de dormir, manta térmica), bebida quente e doce se estiver consciente, e aquecer o tronco antes das extremidades.'
    },
    sono: {
      titulo: 'Exaustão por privação de sono',
      porque: 'Depois de ~36 horas acordado, a pressão de sono (adenosina acumulada) somada à madrugada do ritmo circadiano vence qualquer motivação: microssonos andando ou pedalando, alucinações, erros de navegação que somam quilômetros, e o risco de queda. Cafeína bloqueia receptores de adenosina e compra algumas horas, mas não paga a dívida.',
      atendimento: 'A equipe decide parar. Dormir em lugar seguro e aquecido; 90 minutos (um ciclo completo) recuperam muito mais que o mesmo tempo fragmentado.'
    },
    corte: {
      titulo: 'Fora do tempo de corte',
      porque: 'O ritmo não coube no tempo limite. Quase sempre isso vem de antes: glicogênio esgotado sem reposição de carboidrato (a "quebra"), calor ou frio que obrigaram a desacelerar, altitude, estômago que não aceitava mais nada, ou horas perdidas por sono e navegação.',
      atendimento: 'Retirado da prova pela organização. Fisiologicamente está bem, mas não termina.'
    }
  };

  // ----------------------------------------------------------- utilidades
  const segAtual = s => s.prova.segmentos[Math.min(s.seg, s.prova.segmentos.length - 1)];

  function posicao(s) {
    const seg = segAtual(s), am = s.amb;
    if (!seg.perfil) return { alt: am.altBase, grade: 0 };
    const p = seg.perfil, km = clamp(s.km, 0, seg.km);
    let i = 1; while (i < p.length - 1 && p[i][0] < km) i++;
    const [k0, a0] = p[i - 1], [k1, a1] = p[i];
    const alt = a0 + (a1 - a0) * clamp((km - k0) / (k1 - k0), 0, 1);
    return { alt, grade: (a1 - a0) / ((k1 - k0) * 1000) };
  }

  function ambiente(s, alt) {
    const am = s.amb, habs = s.prova.largada + s.t / 60, h = habs % 24;
    const dAlt = (alt - am.altBase) / 1000;
    const chuva = (am.chuva || []).some(([a, b]) => habs >= a && habs < b);
    const tar = tabela(am.tar, h) - 6.5 * dAlt - (chuva ? 2 : 0);
    const ur = chuva ? 0.97 : clamp(tabela(am.ur, h) + 0.04 * dAlt, 0.1, 0.97);
    const sol = chuva ? 0 : clamp(Math.sin(Math.PI * (h - am.nascer) / (am.por - am.nascer)), 0, 1) * (1 - am.nuvens);
    const vento = am.vento + 2 * Math.max(0, dAlt);
    const e = ur * psat(tar) * 10;
    const wbgt = 0.567 * tar + 0.393 * e + 3.94 + 2.2 * sol;
    return { habs, h, tar, ur, sol, vento, tagua: am.tagua, wbgt, chuva, alt, noite: sol <= 0 && !chuva ? true : sol <= 0 };
  }

  function massaAtual(s) {
    const a = s.a, E = s.est, I = s.int;
    return s.massa0 + (s.icf + s.ecf - s.tbw0)
      + (E.vol + I.vol + E.glic + E.fruc + E.lento + I.glic + I.fruc + I.lento) / 1000
      + (s.glyM - a.glyM + s.glyL - a.glyL) / 1000
      - s.gorduraOx / 1000
      + s.bexiga / 1000;
  }

  function carga(s) {
    let kg = s.prova.cargaBase;
    if (s.mochila) {
      kg += (s.mochila.agua || 0) / 1000;
      for (const k of CARREGAVEIS) kg += (s.mochila[k] || 0) * ITENS[k].g / 1000;
    }
    return kg;
  }

  function registrar(s, texto, tipo) { s.eventos.push({ t: s.t, texto, tipo }); }
  function hhmm(min) { const m = Math.max(0, Math.round(min)); return Math.floor(m / 60) + 'h' + String(m % 60).padStart(2, '0'); }
  function horaDoDia(s, t) {
    const m = Math.floor(s.prova.largada * 60 + (t == null ? s.t : t));
    const dia = Math.floor(m / 1440) + 1;
    return (dia > 1 ? 'dia ' + dia + ', ' : '') + String(Math.floor(m / 60) % 24).padStart(2, '0') + 'h' + String(m % 60).padStart(2, '0');
  }

  // --------------------------------------------------------- estado inicial
  function criar(id) {
    const sc = CENARIOS[id];
    const a = Object.assign({}, sc.atleta);
    a.vo2L = a.vo2max * a.massa / 1000;
    a.area = 0.007184 * Math.pow(a.massa, 0.425) * Math.pow(a.altura * 100, 0.725);   // DuBois
    const tbw = a.massa * a.fracAgua, ecf = tbw * 0.4, icf = tbw * 0.6;
    const s = {
      cenario: id, prova: sc.prova, t: 0, a, amb: sc.ambiente,
      seg: 0, km: 0, tSeg: 0, postoIdx: 0, fonteIdx: 0, splits: [],
      massa0: a.massa, tbw0: tbw, pv0: ecf * 0.185,
      icf, ecf, pv: ecf * 0.185 * 0.95, naM: 140 * ecf, osmI: 285 * icf,
      G: 5.0, cgm: 5.0, glyM: a.glyM, glyL: a.glyL, gorduraOx: 0, lac: 1.0,
      tc: 37.1, dano: 0, caf: 0, cafGut: 0, gi: 0, doce: 0,
      vigilia: a.acordado, dormindo: 0, ultimoAuto: 0,
      est: { vol: 0, glic: 0, fruc: 0, lento: 0, na: 0, k: 0 },
      int: { vol: 0, glic: 0, fruc: 0, lento: 0, na: 0, k: 0 },
      bexiga: 0, sumidouro: 0, rEsp: 0, rGelo: 0, parada: 0, sombra: false,
      c: Object.assign({}, sc.plano),
      lista: sc.mochila ? Object.assign({}, sc.mochila) : null,
      mochila: sc.mochila ? Object.assign({}, sc.mochila) : null,
      fila: [], pesarPedido: false, sombraPedida: false,
      pesos: [], bal: { agua: 0, cho: 0, na: 0, suor: 0, naSuor: 0, urina: 0, resp: 0, vomito: 0, choOx: 0, choExo: 0, absorvida: 0, secretada: 0, metab: 0, sono: 0 },
      vomitos: 0, tGiAlto: 0, tHipoT: 0, tHipoG: 0, tHipoNa: 0, tFrio: 0, tSono: 0,
      ext: { tcMax: 37.1, tcMin: 37.1, gMin: 5, glyMin: 1, naMin: 140, naMax: 140, sonoMax: 0, sao2Min: 1 },
      choJanela: { cho: 0, min: 0 },
      flags: {}, eventos: [], trend: [], sinais: [], fim: null, v: null
    };
    s.pesos.push({ t: 0, kg: a.massa, onde: 'Largada' });
    registrar(s, 'Largada às ' + horaDoDia(s, 0) + '.', 'prova');
    derivar(s);
    gravarTendencia(s);
    return s;
  }

  // ----------------------------------------------- velocidade de cada modalidade
  // velocidade (m/min) e potência (W) que uma intensidade dá, no terreno e com a carga de agora
  function ritmoPara(s, pct, tipo, pos) {
    const a = s.a, seg = segAtual(s), vo2 = pct * a.vo2L;
    pos = pos || posicao(s);
    const g = pos.grade, terreno = seg.terreno || 1;
    const kgTotal = s.massa0 + carga(s);
    const vo2kg = vo2 * 1000 / kgTotal;                      // a carga custa como massa corporal
    let vel = 0, potencia = 0;
    if (tipo === 'nado') vel = 60 * a.nado * Math.cbrt(Math.max(0, pct - 0.15) / 0.5);
    else if (tipo === 'bike' || tipo === 'mtb') {
      const m = MOD[tipo], rho = 1.2 * Math.exp(-pos.alt / 8400);
      potencia = Math.max(0, (vo2 * 1000 - 7 * s.massa0) / 10.8);
      const pRoda = v => (kgTotal + m.bike) * 9.81 * v * (g + m.crr) + 0.5 * rho * m.cda * v * v * v;
      let lo = 0, hi = tipo === 'mtb' ? 7 : 16;
      if (pRoda(hi) < potencia * 0.97) lo = hi;
      for (let i = 0; i < 30 && hi - lo > 0.01; i++) { const mid = (lo + hi) / 2; if (pRoda(mid) < potencia * 0.97) lo = mid; else hi = mid; }
      vel = Math.max(1.2, (lo + hi) / 2) * 60;               // no mínimo empurrando a bike
      if (tipo === 'mtb' && g > 0.08) vel = Math.min(vel, 60);
    } else if (tipo === 'canoa') {
      potencia = Math.max(0, (vo2 * 1000 - 7 * s.massa0) / 14);
      vel = (2.0 * Math.cbrt(potencia / 100) + (seg.corrente || 0)) * 60;
    } else if (tipo === 'corrida' || tipo === 'trekking') {
      const liq = Math.max(0, vo2kg / terreno - 3.5);
      const cAnda = g >= 0 ? 0.1 + 1.8 * g : 0.1 + Math.max(-0.04, 0.8 * g);
      const vAnda = Math.min(tipo === 'trekking' ? 110 : 100, liq / cAnda);
      if (tipo === 'trekking') vel = vAnda;
      else {
        const cCorre = g >= 0 ? 0.2 + 0.9 * g : 0.2 + Math.max(-0.08, 0.36 * g);
        vel = Math.max(liq / cCorre * (1 - 0.15 * s.dano), vAnda);
      }
      if (g < -0.08) vel = Math.min(vel, 180 * (1 - 0.5 * s.dano));  // descida técnica
    }
    return { vel, potencia };
  }

  // ============================================================== derivadas
  // Calcula tudo o que é instantâneo, sem mudar estados. O passo integra.
  function derivar(s) {
    const a = s.a, seg = segAtual(s), pos = posicao(s), am = ambiente(s, pos.alt), P = s.prova;
    const tipo = s.fim ? 'parado' : seg.tipo;
    const dormindo = s.dormindo > 0 && !s.fim;
    const parado = tipo === 'parado' || s.parada > 0 || dormindo;
    const massa = massaAtual(s);
    const perda = (s.massa0 - massa) / s.massa0 * 100;
    const perdaAgua = (s.tbw0 - s.icf - s.ecf) / s.massa0 * 100;
    const na = s.naM / s.ecf, G = s.G;
    const posm = 2 * na + G + 5;
    const pvRel = s.pv / s.pv0;
    const Tc = s.tc;
    const glyFrac = s.glyM / a.glyM;
    const cafEf = s.caf / (s.caf + 3 * a.massa);
    const mod = MOD[tipo] || MOD.transicao;

    // ---------- oxigênio na altitude
    const pb = 760 * Math.exp(-pos.alt / 8400);
    const paco2 = 40 - 8 * clamp(pos.alt / 4000, 0, 1);
    const pao2 = Math.max(20, 0.2095 * (pb - 47) - paco2 / 0.8 - 6);
    const sao2 = satO2(pao2);
    const fO2 = clamp(sao2 / 0.965, 0.5, 1);

    // ---------- sono
    const circ = 0.3 * Math.exp(-Math.pow(((am.h - 4 + 36) % 24) - 12, 2) / (2 * 2.5 * 2.5));
    const pressao = Math.max(0, (s.vigilia - 16) / 15);
    const sono = clamp(pressao + circ * (0.4 + pressao) - 0.3 * cafEf, 0, 1.3);

    // ---------- 1. limites do ritmo
    const qRest = 2.2;
    const svBase = a.sv * Math.pow(clamp(pvRel, 0.3, 1.2), 1.4);
    const svEm = fc => svBase * (1 - 0.1 * clamp((fc - 140) / 45, 0, 1));
    const qMax = a.fcMax * svEm(a.fcMax) / 1000;
    const bonus = 0.03 * cafEf;
    const limites = [
      ['glicogenio', 0.40 + 0.55 * (1 - Math.exp(-glyFrac / 0.12)) + bonus],
      ['glicemia', 0.35 + 0.65 * clamp((G - 2.5) / 1.5, 0, 1) + bonus],
      ['calor', (Tc > 39.2 ? 1 - (0.15 + 0.35 * clamp((Tc - 39.2) / 1.3, 0, 1)) * (1 - a.teimosia) : 1) + bonus],
      ['frio', Tc < 36 ? 1 - 0.3 * (36 - Tc) : 1],
      ['altitude', fO2],
      ['bracos', tipo === 'canoa' ? 0.72 : 1],
      ['estomago', s.gi > 0.8 ? 0.55 : 1],
      ['musculo', (tipo === 'corrida' || tipo === 'trekking' ? 1 - 0.3 * s.dano : 1) + bonus],
      ['lactato', s.lac > 6 ? 1 - 0.03 * (s.lac - 6) : 1],
      ['sono', 1 - 0.3 * Math.max(0, sono - 0.4)],
      ['cardiovascular', (qMax - 0.3 - 0.6 - qRest) / 5.2 * fO2 / a.vo2L]
    ];
    const alvo = tipo === 'parado' ? 0.12 : dormindo ? 0.07 : parado ? 0.16 : tipo === 'transicao' ? 0.3 : s.c.intensidade;
    let pct = alvo, limite = null;
    if (!parado && tipo !== 'transicao') for (const [k, c] of limites) if (c < pct) { pct = c; limite = k; }
    pct = Math.max(dormindo ? 0.07 : 0.15, pct);

    // ---------- velocidade
    let { vel, potencia } = parado || tipo === 'transicao' ? { vel: 0, potencia: 0 } : ritmoPara(s, pct, tipo, pos);
    const navega = (seg.navegacao || tipo === 'trekking' || tipo === 'mtb') ? 1 - 0.35 * Math.max(0, sono - 0.45) : 1;
    vel *= navega;

    // ---------- 2. energia
    const vo2 = pct * a.vo2L;
    const fBase = 0.12 + 0.88 * Math.pow(clamp((pct - 0.2) / 0.7, 0, 1), 1.5);
    let fCHO = clamp(fBase * (0.55 + 0.45 * clamp(glyFrac / 0.35, 0, 1)), 0.1, 1);
    let E = vo2 * (4.7 + 0.35 * fCHO);            // kcal/min

    // ---------- 3. intestino
    const splanch = clamp(1 - 0.45 * clamp((pct - 0.55) / 0.35, 0, 1) - 0.3 * clamp((Tc - 38.5) / 1.5, 0, 1) - 0.2 * clamp((perdaAgua - 2) / 3, 0, 1), 0.3, 1);
    const Es = s.est, I = s.int;
    const conc = (Es.glic + Es.fruc) / Math.max(50, Es.vol) * 100;       // g/100 mL
    const tauE = 14 * (1 + conc / 7) * (1 + Es.lento / 20) * (1 + 3 * Math.max(0, pct - 0.7))
      * (1 + 0.8 * Math.max(0, Tc - 38.8)) * (1 + 0.12 * Math.max(0, perdaAgua - 2)) * (s.gi > 0.6 ? 1.6 : 1);
    const absGlic = Math.min(I.glic / DT, 1.2 * splanch * I.glic / (I.glic + 2));
    const absFruc = Math.min(I.fruc / DT, 0.6 * splanch * I.fruc / (I.fruc + 2));
    const absNa = I.na / 15, absK = I.k / 15;
    const absLento = Math.min(I.lento / DT, 0.25 * splanch);
    const osmLuz = I.glic * 5.55 * 0.6 + I.fruc * 5.55 + 2 * I.na + 2 * I.k + I.lento * 2;    // mOsm (polímeros de glicose pesam menos)
    const volIso = osmLuz / 300 * 1000;
    const osmAbs = absGlic * 5.55 * 0.6 + absFruc * 5.55 + 2 * absNa + 2 * absK;
    let absAgua = Math.min(I.vol / DT, osmAbs / 300 * 1000), secrecao = 0;
    if (I.vol > volIso) absAgua += (I.vol - volIso) / 6 * splanch;
    else secrecao = (volIso - I.vol) / 10;
    const raGut = absGlic + 0.75 * absFruc;

    // ---------- 5. cardiovascular (define o fluxo da pele)
    const qMus = 5.2 * vo2 / fO2 + 0.3;
    const skDem = tipo === 'nado' ? clamp(0.2 + 1.6 * (Tc - 37.3), 0.12, 7) : clamp(0.4 + 1.8 * (Tc - 37.0), 0.12, 7);
    const skbf = clamp(qMax - qMus - qRest, Math.min(0.5, skDem), skDem);
    let fc = 100;
    for (let i = 0; i < 4; i++) fc = (qMus + skbf + qRest) / svEm(fc) * 1000;
    fc += 4 * cafEf + (G < 3.5 ? 8 : 0);
    fc = clamp(fc, dormindo ? a.fcRep : a.fcRep + 5, a.fcMax);
    const sv = svEm(fc);

    // ---------- 4. calor
    const roupa = ROUPAS[s.c.roupa || 0];
    const molhado = am.chuva && !roupa.impermeavel && tipo !== 'nado';
    const clo = roupa.clo * (molhado ? 0.35 : 1) + (dormindo ? 0.8 : 0);
    const fEvap = 1 / (1 + 1.2 * clo) * (dormindo ? 0.4 : 1);
    const trab = parado || tipo === 'transicao' ? 0 : mod.eff;
    const noSol = tipo !== 'nado' && !(parado && s.sombra);
    const solar = noSol ? am.sol * a.area * 60 : 0;
    const ar = Math.max(0.6, vel / 60 + 0.4 * am.vento);
    const hc = 8.3 * Math.sqrt(ar);
    const hSeco = 1 / (0.155 * clo + 1 / (hc + 4.7));
    const K = 8 + 75 * skbf + (parado ? 0 : 40 * pct);          // músculo ativo aquece a periferia
    const hidr = clamp(1 - 0.05 * Math.max(0, perdaAgua - 2) - 0.015 * Math.max(0, posm - 293), 0.4, 1);
    const chuvaW = molhado ? 110 * a.area : 0;
    const ext = s.rEsp + s.rGelo + chuvaW;
    const pa = am.ur * psat(am.tar);
    const srDe = tsk => clamp(a.sud * (0.15 + 1.0 * Math.max(0, Tc - (a.limiarSuor || 37.0)) + 0.15 * Math.max(0, tsk - 33.5)) * hidr * (Tc < 37 ? Math.max(0, (Tc - 36.5) * 2) : 1), 0, a.suorMax || 2.8);
    const fluxos = tsk => {
      if (tipo === 'nado') return { seco: 200 * a.area * (tsk - am.tagua), evap: 0, sr: srDe(tsk) * 0.35, emax: 0 };
      const seco = hSeco * a.area * (tsk - am.tar);
      const emax = Math.max(0, 16.5 * hc * a.area * fEvap * (psat(tsk) - pa));
      const sr = srDe(tsk), srW = sr * 674;
      return { seco, evap: emax > 1 ? emax * (1 - Math.exp(-1.6 * srW / emax)) : 0, sr, emax };
    };
    let lo = Math.min(am.tar, am.tagua) - 10, hi = Tc, f = null;
    for (let i = 0; i < 26; i++) {
      const mid = (lo + hi) / 2;
      f = fluxos(mid);
      if (K * (Tc - mid) + solar - f.seco - f.evap - ext > 0) lo = mid; else hi = mid;
    }
    const tsk = (lo + hi) / 2;
    f = fluxos(tsk);
    const qPele = K * (Tc - tsk);
    // tremor: frio no núcleo e na pele; precisa de glicose
    const combustivel = clamp((G - 2.5) / 1.5, 0.25, 1) * clamp(glyFrac / 0.1, 0.3, 1);
    const tremor = clamp(260 * (36.9 - Tc) + 20 * ((tipo === 'nado' ? 25 : 30) - tsk), 0, 400) * combustivel;
    E += tremor / 69.78;
    const choTremor = tremor / 69.78 * 0.6 / 4.1;
    const H = (E - tremor / 69.78) * 69.78 * (1 - trab) + tremor;             // W
    const sumidouroW = s.sumidouro / 360;
    const choDem = (E - tremor / 69.78) * fCHO / 4.1 + choTremor;

    // glicose do sangue × glicogênio muscular × fígado
    const share = clamp(0.25 + 0.5 * (1 - clamp(glyFrac / 0.7, 0, 1)) + 0.2 * clamp(raGut, 0, 1), 0.2, 0.95);
    const gF = (G * G / (G * G + 4)) / (25 / 29);
    const Rd = Math.min(choDem * share * gF, 1.6);
    const muscUse = Math.max(0, choDem - Rd) * s.glyM / (s.glyM + 0.03 * a.glyM);
    const gorduraOx = Math.max(0, (E - 4.1 * (Rd + muscUse)) / 9.4);
    const gng = 0.07 + 0.12 * (1 - s.glyL / a.glyL);
    const raMax = 1.2 * s.glyL / (s.glyL + 12) + gng;
    const want = Rd - raGut + 0.35 * (5 - G);
    const raL = want >= 0 ? Math.min(want, raMax) : Math.max(want, -0.6);

    // ---------- 6. água e sódio
    const suor = f.sr / 60;                                                // L/min
    const naSuor = a.naSuor * (0.75 + 0.25 * clamp(f.sr / 1.2, 0, 2));
    const ve = vo2 * (22 + 18 * clamp((pct - a.lt) / 0.2, 0, 1)) / Math.sqrt(fO2) + 6 * Math.max(0, Tc - 38.8);
    const fr = dormindo ? 12 : 12 + 26 * pct + 4 * Math.max(0, Tc - 39) + 8 * (1 - fO2);
    const resp = ve * 0.03 * (1 - 0.6 * am.ur) * (1 + pos.alt / 3000) / 1000;   // L/min
    const adh = clamp(0.3 + 0.07 * (posm - 288) + 0.35 * clamp((pct - 0.4) / 0.3, 0, 1)
      + 0.35 * clamp((s.gi - 0.5) / 0.3, 0, 1) + 0.4 * clamp((perdaAgua - 2) / 4, 0, 1) + 0.3 * clamp(3.8 - G, 0, 1), 0, 1);
    const rbf = 1 - 0.65 * clamp((pct - 0.3) / 0.4, 0, 1);
    const urina = rbf * (0.5 + 11 * Math.pow(1 - adh, 2)) * (Tc < 36.5 ? 1.5 : 1) / 1000;   // frio: diurese
    const uosm = 60 + 1100 * adh;
    const aguaMetab = ((Rd + muscUse) * 0.6 + gorduraOx * 1.07 + muscUse * 1.0) / 1000;
    const sede = clamp((posm - 289) / 6 + (perdaAgua - 1.5) / 3, 0, 1);

    // bebida do plano (contínua). Na natação não há como beber; dormindo, não bebe;
    // em trecho de mochila, só enquanto houver líquido no reservatório.
    let planoML = 0, semAgua = false;
    if (!s.fim && tipo !== 'nado' && !dormindo) {
      if (s.c.hidratacao === 'sede') planoML = 22 * sede;
      else if (s.c.hidratacao === 'fixo') planoML = s.c.taxa / 60;
      if (s.gi > 0.6) planoML *= 1 - s.gi;
      if (seg.apoio === 'mochila' && s.mochila && s.mochila.agua <= 0 && tipo !== 'transicao') { semAgua = planoML > 0 || sede > 0.3; planoML = 0; }
    }

    // lactato e desconforto
    const lacSS = clamp(0.9 + 3.1 * Math.exp((pct - a.lt) / 0.055) * (0.4 + 0.6 * clamp(glyFrac / 0.3, 0, 1)), 0.8, 16);
    const correr = tipo === 'corrida';
    const giAlvo = clamp(0.0009 * Math.max(0, Es.vol - 350) + 0.011 * Math.max(0, Es.lento - 8) * (correr ? 2.2 : 1)
      + 0.012 * Math.max(0, I.glic + I.fruc - 25) + 0.0005 * Math.max(0, I.vol - 500)
      + 1.2 * Math.max(0, pct - 0.75) * (correr ? 1.3 : 1) + 0.18 * Math.max(0, Tc - 38.8)
      + 0.05 * Math.max(0, perdaAgua - 3) + (parado ? 0 : mod.gi)
      + 0.25 * clamp((s.caf / a.massa - 6) / 4, 0, 1) + 0.35 * clamp((132 - na) / 6, 0, 1)
      + 0.0025 * Math.max(0, s.doce - 200), 0, 1);

    const hrr = (fc - a.fcRep) / (a.fcMax - a.fcRep);
    const pse = parado ? 6 + 3 * clamp(1 - glyFrac, 0, 1) : 6 + 14 * clamp(0.75 * hrr + 0.35 * (1 - clamp(glyFrac / 0.25, 0, 1)) + 0.12 * Math.max(0, Tc - 38.5)
      + 0.15 * s.dano + 0.15 * s.gi + 0.25 * clamp((3.8 - G) / 1.3, 0, 1) + 0.2 * sono + 0.15 * Math.max(0, 36.5 - Tc) - 0.08 * cafEf - 0.1, 0, 1);

    s.v = {
      am, pos, tipo, parado, dormindo, seg, massa, perda, perdaAgua, na, posm, pvRel, glyFrac, cafEf,
      sao2, fO2, sono, alvo, pct, limite, limites, vo2, vel, potencia, E, fCHO, choDem, navega,
      splanch, tauE, absGlic, absFruc, absNa, absK, absLento, absAgua, secrecao, raGut,
      share, Rd, muscUse, gorduraOx, gng, raL,
      qMax, skDem, skbf, fc, sv, dc: fc * sv / 1000,
      H, solar, tsk, qPele, seco: f.seco, evap: f.evap, emax: f.emax, sr: f.sr, sumidouroW, ext, hidr, clo, molhado, tremor,
      suor, naSuor, ve, fr, resp, adh, urina, uosm, aguaMetab, sede, planoML, semAgua,
      lacSS, giAlvo, pse, carga: carga(s)
    };
    return s.v;
  }

  // ================================================================ passo
  function passo(s, dtTotal) {
    let rest = dtTotal;
    while (rest > 1e-9 && !s.fim) {
      const dt = Math.min(DT, rest);
      const minAntes = Math.floor(s.t);
      passoInterno(s, dt);
      rest -= dt;
      if (Math.floor(s.t) !== minAntes) { eventosFisiologicos(s); gravarTendencia(s); }
    }
    derivar(s);
    return s;
  }

  function adicionar(dest, it, fator) {
    dest.vol += it.vol * fator; dest.glic += it.glic * fator; dest.fruc += it.fruc * fator;
    dest.lento += it.lento * fator; dest.na += it.na * fator; dest.k += it.k * fator;
  }

  function passoInterno(s, dt) {
    const a = s.a, v = derivar(s);
    s.t += dt; s.tSeg += dt;

    // ---------- progresso, paradas e sono
    if (s.parada > 0) { s.parada -= dt; if (s.parada <= 0) { s.parada = 0; s.sombra = false; } }
    if (s.dormindo > 0) {
      s.dormindo -= dt; s.vigilia = Math.max(0, s.vigilia - dt / 60 * 4); s.bal.sono += dt;
      if (s.dormindo <= 0) { s.dormindo = 0; registrar(s, 'Acordou.', 'prova'); }
    } else s.vigilia += dt / 60;
    if (!v.parado && v.tipo !== 'transicao') s.km += v.vel / 1000 * dt;

    // ---------- energia
    s.glyM = Math.max(0, s.glyM - v.muscUse * dt);
    if (v.raL >= 0) s.glyL = Math.max(0, s.glyL - Math.max(0, v.raL - v.gng) * dt);
    else s.glyL = Math.min(a.glyL, s.glyL - v.raL * dt);
    s.G = clamp(s.G + (v.raGut + v.raL - v.Rd) * dt / (s.ecf * 0.18), 0.8, 20);
    s.cgm = relax(s.cgm, s.G, dt, 8);
    s.gorduraOx += v.gorduraOx * dt;
    s.bal.choOx += (v.Rd + v.muscUse) * dt;
    s.bal.choExo += v.raGut * dt;
    s.lac = relax(s.lac, v.lacSS, dt, 4);
    s.doce *= Math.exp(-dt / 240);

    // ---------- bebida do plano
    if (v.planoML > 0) {
      const b = ITENS[s.c.bebida], fator = v.planoML * dt / 500;
      adicionar(s.est, b, fator);
      s.bal.agua += v.planoML * dt; s.bal.cho += (b.glic + b.fruc) * fator; s.bal.na += b.na * fator;
      if (!v.parado && v.tipo !== 'transicao' && v.tipo !== 'nado') s.choJanela.cho += (b.glic + b.fruc) * fator;
      if (v.seg.apoio === 'mochila' && s.mochila && v.tipo !== 'transicao') s.mochila.agua = Math.max(0, s.mochila.agua - v.planoML * dt);
    }
    if (v.tipo !== 'transicao' && v.tipo !== 'nado' && v.tipo !== 'parado') s.choJanela.min += dt;

    // ---------- intestino
    const Es = s.est, I = s.int;
    const fe = Math.min(1, dt / v.tauE);
    for (const k of ['vol', 'glic', 'fruc', 'lento', 'na', 'k']) { const m = Es[k] * fe; Es[k] -= m; I[k] += m; }
    I.glic = Math.max(0, I.glic - v.absGlic * dt);
    I.fruc = Math.max(0, I.fruc - v.absFruc * dt);
    I.na = Math.max(0, I.na - v.absNa * dt);
    I.k = Math.max(0, I.k - v.absK * dt);
    I.lento = Math.max(0, I.lento - v.absLento * dt);
    const aguaAbs = Math.min(I.vol, v.absAgua * dt), sec = v.secrecao * dt;
    I.vol = Math.max(0, I.vol - aguaAbs + sec);
    if (s.cafGut > 0) { const m = s.cafGut * (1 - Math.exp(-dt / 20)); s.cafGut -= m; s.caf += m; }
    s.caf *= Math.exp(-dt * Math.LN2 / 300);

    // ---------- água e sódio
    let tbw = s.icf + s.ecf;
    const suorL = v.suor * dt, urinaL = v.urina * dt, respL = v.resp * dt;
    tbw += (aguaAbs - sec) / 1000 + v.aguaMetab * dt - suorL - urinaL - respL;
    s.naM += v.absNa * dt - suorL * v.naSuor - urinaL * 40;
    s.bexiga += urinaL * 1000;
    s.bal.suor += suorL; s.bal.naSuor += suorL * v.naSuor; s.bal.urina += urinaL; s.bal.resp += respL;
    s.bal.absorvida += aguaAbs / 1000; s.bal.secretada += sec / 1000; s.bal.metab += v.aguaMetab * dt;
    const osmE = 2 * s.naM + s.G * s.ecf;
    const ecfNovo = tbw * osmE / (osmE + s.osmI);
    s.pv *= ecfNovo / s.ecf;
    s.icf = tbw - ecfNovo; s.ecf = ecfNovo;
    const pvAlvo = s.ecf * 0.185 * (1 - 0.09 * clamp((v.pct - 0.25) / 0.5, 0, 1)) * (v.tipo === 'nado' ? 1.04 : 1);
    s.pv = relax(s.pv, pvAlvo, dt, 5);

    // ---------- calor
    s.tc += (v.H - v.qPele - v.sumidouroW) * dt * 60 / (s.massa0 * 3470);
    const gasto = v.sumidouroW * dt * 60;
    s.sumidouro = Math.abs(gasto) >= Math.abs(s.sumidouro) ? 0 : s.sumidouro - gasto;
    s.rEsp *= Math.exp(-dt / 4);
    s.rGelo *= Math.exp(-dt / 15);

    // ---------- músculo e intestino
    // impacto: na corrida e no trekking o dano vem por quilômetro (e mais nas descidas); no resto, por tempo
    let kDano = 0;
    const kmMin = v.parado ? 0 : v.vel / 1000;
    if (v.tipo === 'corrida') kDano = kmMin * (0.009 * Math.min(1.2, v.vel / 170) + 0.005 * Math.max(0, -v.pos.grade) / 0.1);
    else if (v.tipo === 'trekking') kDano = kmMin * (0.003 + 0.003 * Math.max(0, -v.pos.grade) / 0.1);
    else kDano = (MOD[v.tipo] || MOD.transicao).dano * v.pct * v.pct;
    s.dano = Math.min(1, s.dano + kDano * (1 + 0.1 * Math.max(0, v.perdaAgua - 3)) * dt);
    s.gi = relax(s.gi, v.giAlvo, dt, 8);

    // ---------- extremos
    const e = s.ext;
    e.tcMax = Math.max(e.tcMax, s.tc); e.tcMin = Math.min(e.tcMin, s.tc);
    e.gMin = Math.min(e.gMin, s.G); e.glyMin = Math.min(e.glyMin, s.glyM / a.glyM);
    e.naMin = Math.min(e.naMin, v.na); e.naMax = Math.max(e.naMax, v.na);
    e.sonoMax = Math.max(e.sonoMax, v.sono); e.sao2Min = Math.min(e.sao2Min, v.sao2);

    // hábito do próprio atleta: come sozinho o item combinado, se tiver à mão
    if (s.c.autoItem && s.c.autoCada && !v.parado && v.tipo !== 'nado' && v.tipo !== 'transicao' && s.t - s.ultimoAuto >= s.c.autoCada) {
      s.ultimoAuto = s.t;
      const seg = v.seg;
      if (seg.apoio !== 'mochila') { aplicarItem(s, s.c.autoItem); registrar(s, 'Comeu por conta própria: ' + ITENS[s.c.autoItem].nome.toLowerCase() + '.', 'prova'); }
      else {
        // o que combinou; se acabou, qualquer coisa de comer que ainda tiver na mochila
        const id = [s.c.autoItem, 'gel', 'cereal', 'banana', 'batata', 'gelcaf', 'proteina'].find(k => s.mochila && (s.mochila[k] || 0) > 0);
        if (id) { s.mochila[id]--; aplicarItem(s, id); registrar(s, 'Comeu por conta própria: ' + ITENS[id].nome.toLowerCase() + ' (sobram ' + s.mochila[id] + ').', 'prova'); }
        else falar(s, 'autoAcabou' + s.seg, true, false, '"Acabou a comida da mochila."');
      }
    }

    avancarProva(s, v);
    verificarAbandono(s, v, dt);
  }

  // ------------------------------------------------------ segmentos e postos
  function pesar(s, onde) {
    const kg = massaAtual(s);
    s.pesos.push({ t: s.t, kg, onde });
    const d = (kg - s.massa0) / s.massa0 * 100;
    registrar(s, 'Pesagem (' + onde + '): ' + kg.toFixed(1).replace('.', ',') + ' kg (' + (d >= 0 ? '+' : '') + d.toFixed(1).replace('.', ',') + '%).', 'sinal');
  }

  function entregarFila(s, onde) {
    if (!s.fila.length) return;
    const itens = s.fila.splice(0);
    itens.forEach(id => aplicarItem(s, id));
    registrar(s, onde + ': entregue ' + itens.map(id => ITENS[id].nome.toLowerCase()).join(', ') + '.', 'acao');
  }

  function reabastecer(s, onde, soAgua) {
    if (!s.mochila || !s.lista) return;
    const antes = s.mochila.agua;
    if (soAgua) s.mochila.agua = s.lista.agua;
    else s.mochila = Object.assign({}, s.lista);
    if (soAgua && s.lista.agua - antes > 150) registrar(s, onde + ': reservatório cheio de novo (' + (s.lista.agua / 1000).toFixed(1).replace('.', ',') + ' L).', 'prova');
  }

  function chegouPosto(s, onde) {
    reabastecer(s, onde, false);
    entregarFila(s, onde);
    if (s.pesarPedido) { s.pesarPedido = false; pesar(s, onde); s.parada = Math.max(s.parada, 1); }
    if (s.sombraPedida) { s.sombraPedida = false; s.parada = Math.max(s.parada, 5); s.sombra = true; s.rEsp += 120; registrar(s, onde + ': parada de 5 min na sombra.', 'acao'); }
  }

  function avancarProva(s, v) {
    const seg = segAtual(s);
    if (seg.tipo === 'transicao') {
      if (s.tSeg >= seg.min) proximoSegmento(s);
      return;
    }
    if (seg.posto) {
      const idx = Math.floor(s.km / seg.posto);
      if (idx > s.postoIdx && s.km < seg.km) { s.postoIdx = idx; chegouPosto(s, 'Posto km ' + fmtKm(idx * seg.posto)); }
    }
    if (seg.fontes) {
      const idx = Math.floor(s.km / seg.fontes);
      if (idx > s.fonteIdx && s.km < seg.km) { s.fonteIdx = idx; reabastecer(s, 'Riacho no km ' + fmtKm(idx * seg.fontes), true); }
    }
    if (s.km >= seg.km) proximoSegmento(s);
  }
  const fmtKm = km => String(Math.round(km * 10) / 10).replace('.', ',');

  function proximoSegmento(s) {
    const seg = segAtual(s), segs = s.prova.segmentos;
    s.splits.push({ id: seg.id, nome: seg.nome, t: s.tSeg, fim: s.t });
    registrar(s, seg.nome + ': ' + hhmm(s.tSeg) + ' (prova ' + hhmm(s.t) + ', ' + horaDoDia(s) + ').', 'prova');
    s.seg++; s.km = 0; s.tSeg = 0; s.postoIdx = 0; s.fonteIdx = 0;
    if (s.seg >= segs.length) { terminar(s); return; }
    const novo = segs[s.seg];
    if (novo.tipo === 'transicao') {
      pesar(s, novo.nome);
      reabastecer(s, novo.nome, false);
      entregarFila(s, novo.nome);
      s.sombraPedida = false;
    }
  }

  // ------------------------------------------------------------ abandono
  function abandonar(s, causa) {
    if (s.fim) return;
    const c = CAUSAS[causa];
    s.fim = { tipo: 'abandono', causa, titulo: c.titulo, porque: c.porque, atendimento: c.atendimento, t: s.t,
              segmento: segAtual(s).nome, km: s.km, retrato: retrato(s) };
    registrar(s, 'ABANDONO — ' + c.titulo + '.', 'fim');
  }

  function verificarAbandono(s, v, dt) {
    if (s.fim) return;
    s.tHipoT = s.tc >= 40.5 ? s.tHipoT + dt : 0;
    if (s.tHipoT >= 3 || s.tc >= 41.2) return abandonar(s, 'intermacao');
    s.tFrio = s.tc < 35 ? s.tFrio + dt : 0;
    if (s.tFrio >= 5 || s.tc < 34) return abandonar(s, 'hipotermia');
    s.tHipoNa = v.na < 127 ? s.tHipoNa + dt : 0;
    if (s.tHipoNa >= 3) return abandonar(s, 'hiponatremia');
    s.tHipoG = s.G < 2.8 ? s.tHipoG + dt : 0;
    if (s.tHipoG >= 12 || s.G < 2.2) return abandonar(s, 'hipoglicemia');
    if (v.pvRel < 0.66 || v.perdaAgua > 8) return abandonar(s, 'colapso');
    s.tSono = v.sono >= 1 && !v.dormindo ? s.tSono + dt : 0;
    if (s.tSono >= 20) return abandonar(s, 'sono');
    if (s.gi > 0.85) {
      const Es = s.est;
      s.bal.vomito += Es.vol;
      s.est = { vol: 0, glic: 0, fruc: 0, lento: 0, na: 0, k: 0 };
      s.gi = 0.55; s.vomitos++;
      registrar(s, 'Vomitou' + (Es.vol > 50 ? ' (~' + Math.round(Es.vol) + ' mL do que tinha no estômago)' : '') + '.', 'sinal');
      if (s.vomitos >= 3) return abandonar(s, 'gastrointestinal');
    }
    s.tGiAlto = s.gi > 0.75 ? s.tGiAlto + dt : 0;
    if (s.tGiAlto >= 40) return abandonar(s, 'gastrointestinal');
    const seg = segAtual(s);
    const corte = seg.corte || (s.seg === s.prova.segmentos.length - 1 ? s.prova.corteFinal : null);
    if (corte && s.t > corte) return abandonar(s, 'corte');
    if (s.t > s.prova.corteFinal) return abandonar(s, 'corte');
  }

  // --------------------------------------------------------------- chegada
  function criterios(s) {
    const P = s.prova, al = P.alvos;
    const pesoFinal = s.pesos[s.pesos.length - 1].kg;
    const dPeso = (pesoFinal - s.massa0) / s.massa0 * 100;
    const choH = s.choJanela.min > 0 ? s.choJanela.cho / s.choJanela.min * 60 : 0;
    const lista = [
      ['Temperatura central máxima abaixo de 40 °C', s.ext.tcMax < 40],
      ['Peso final entre ' + al.peso[0] + '% e 0% da largada', dPeso >= al.peso[0] && dPeso <= al.peso[1]],
      ['Na⁺ entre 135 e 145 mEq/L na chegada', s.v.na >= 135 && s.v.na <= 145],
      ['Glicemia nunca abaixo de 70 mg/dL', s.ext.gMin >= 3.9],
      ['Não quebrou (glicogênio muscular nunca abaixo de 10%)', s.ext.glyMin >= 0.10],
      ['Não vomitou', s.vomitos === 0],
      ['Carboidrato de ' + al.cho[0] + ' a ' + (al.cho[1] - 5) + ' g/h em movimento', choH >= al.cho[0] && choH <= al.cho[1]]
    ];
    if (P.frio) lista.push(['Temperatura central nunca abaixo de 35,5 °C', s.ext.tcMin >= 35.5]);
    if (al.sono) lista.push(['Sem alucinação nem microssono (sonolência controlada)', s.ext.sonoMax < 0.8]);
    return lista;
  }

  function terminar(s) {
    pesar(s, 'Chegada');
    derivar(s);
    const lista = criterios(s).map(([nome, ok]) => ({ nome, ok }));
    const n = lista.filter(x => x.ok).length;
    s.fim = { tipo: 'chegada', t: s.t, lista, n, total: lista.length, retrato: retrato(s) };
    registrar(s, 'CHEGADA em ' + hhmm(s.t) + '.', 'fim');
  }

  function retrato(s) {
    const v = derivar(s);
    return { fc: v.fc, tc: s.tc, G: s.G, na: v.na, perda: v.perda, perdaAgua: v.perdaAgua, pvRel: v.pvRel,
             glyM: v.glyFrac, glyL: s.glyL / s.a.glyL, gi: s.gi, vomitos: s.vomitos, pse: v.pse, dano: s.dano,
             suor: s.bal.suor, naSuor: s.bal.naSuor, agua: s.bal.agua, cho: s.bal.cho, urina: s.bal.urina,
             sono: v.sono, sao2: v.sao2, sonoMin: s.bal.sono };
  }

  // ---------------------------------------------- o que o atleta diz e mostra
  function falar(s, chave, liga, desliga, texto, tipo) {
    if (liga && !s.flags[chave]) { s.flags[chave] = true; registrar(s, texto, tipo || 'fala'); }
    else if (desliga && s.flags[chave]) s.flags[chave] = false;
  }

  function eventosFisiologicos(s) {
    if (s.fim) return;
    const v = s.v || derivar(s), a = s.a;
    const quebra = v.limite === 'glicogenio' && v.alvo - v.pct > 0.04;
    const corre = v.tipo === 'corrida' || v.tipo === 'trekking';
    falar(s, 'sede', v.sede > 0.55, v.sede < 0.2, '"Tô com muita sede."');
    falar(s, 'semAgua', v.semAgua && !v.dormindo, !v.semAgua, '"Acabou a água da mochila."');
    falar(s, 'estomago', s.gi > 0.45, s.gi < 0.3, '"Estômago pesado, parece que nada desce."');
    falar(s, 'enjoo', s.gi > 0.66, s.gi < 0.45, '"Tô enjoado..."');
    falar(s, 'doce', s.doce > 280, s.doce < 180, '"Não aguento mais nada doce."');
    falar(s, 'quebra', quebra, !quebra && v.glyFrac > 0.2, '"As pernas apagaram. Não tenho força nenhuma."');
    falar(s, 'hipog', s.G < 3.4, s.G > 3.9, '"Tô tremendo, suando frio e meio tonto."');
    falar(s, 'calor', s.tc > 39.6, s.tc < 39.1, '"Tá muito quente, a cabeça tá latejando."');
    falar(s, 'arrepio', s.tc > 40.1, s.tc < 39.6, '"Tô sentindo arrepio... no meio desse calor."');
    falar(s, 'frio', v.tremor > 120, v.tremor < 30, '"Tô congelando, não para de tremer."');
    falar(s, 'frioGrave', s.tc < 35.6, s.tc > 36.1, 'Fala arrastada, mãos que não conseguem abrir o gel.', 'sinal');
    falar(s, 'confuso', s.tc > 40.3 || v.na < 128.5 || s.G < 2.8, s.tc < 40 && v.na > 130 && s.G > 3.2, 'Fala enrolada, não sabe dizer em que quilômetro está.', 'sinal');
    falar(s, 'na', v.na < 132 && v.perda < 0.5, v.na > 134, '"Dor de cabeça e as mãos inchadas. O anel tá apertado."');
    falar(s, 'tontura', v.pvRel < 0.8, v.pvRel > 0.84, '"Fico tonto quando paro."');
    falar(s, 'altitude', v.sao2 < 0.88 && !v.parado, v.sao2 > 0.91, '"Não consigo puxar ar suficiente aqui em cima."');
    falar(s, 'sono1', v.sono > 0.55 && !v.dormindo, v.sono < 0.4, '"Tô com os olhos fechando."');
    falar(s, 'sono2', v.sono > 0.8 && !v.dormindo, v.sono < 0.6, '"Aquela pedra ali era um cachorro? Tô vendo coisas."');
    falar(s, 'navega', v.navega < 0.9 && !v.parado, v.navega > 0.97, 'Errou a trilha e voltou: discute o mapa com a equipe.', 'sinal');
    falar(s, 'caimbra1', s.dano > 0.5 && corre, false, '"Cãibra na panturrilha!"');
    falar(s, 'caimbra2', s.dano > 0.7 && corre, false, '"As coxas estão travando, principalmente na descida."');
    falar(s, 'limiteCV', v.limite === 'cardiovascular' && v.alvo - v.pct > 0.03, v.limite !== 'cardiovascular', '"O coração tá lá em cima e eu não ando."');
    if (s.bexiga > 350 && v.tipo !== 'nado') {
      const cor = v.uosm < 300 ? 'clara, quase transparente' : v.uosm < 850 ? 'amarelo-palha' : 'escura, cor de chá';
      registrar(s, 'Urinou (~' + Math.round(s.bexiga) + ' mL): urina ' + cor + '.', 'sinal');
      s.bexiga = 0;
    }
    // sinais visíveis de agora
    const sn = [];
    if (v.dormindo) sn.push('Dormindo (' + Math.ceil(s.dormindo) + ' min)');
    if (v.sr > 1.2) sn.push('Uniforme encharcado de suor');
    if (a.naSuor > 50 && s.bal.suor > 3) sn.push('Manchas brancas de sal no uniforme');
    if (s.tc > 39.3) sn.push('Rosto vermelho, pele muito quente');
    if (v.tremor > 120) sn.push('Tremendo de frio');
    if (v.molhado) sn.push('Roupa encharcada de chuva');
    if (corre && v.vel > 0 && v.vel < 100 && v.pos.grade < 0.06) sn.push('Caminhando no plano');
    if (s.G < 3.4) sn.push('Pálido, suando frio');
    if (v.perda < -1) sn.push('Dedos e rosto inchados');
    if (v.perdaAgua > 4) sn.push('Lábios secos, olhos fundos');
    if (s.gi > 0.5) sn.push('Mão na barriga');
    if (v.sao2 < 0.88 && !v.parado) sn.push('Lábios arroxeados, respiração ofegante');
    if (v.sono > 0.7 && !v.dormindo) sn.push('Cabeceando, olhar parado');
    if (s.tc > 40.3 || v.na < 128.5 || s.G < 2.8 || s.tc < 35.3) sn.push('Andar cambaleante');
    s.sinais = sn;
  }

  function gravarTendencia(s) {
    const v = s.v || derivar(s);
    s.trend.push({
      t: s.t, seg: s.seg, fc: v.fc, tc: s.tc, tsk: v.tsk, cgm: s.cgm, G: s.G, pse: v.pse, pct: v.pct, alvo: v.alvo, vel: v.vel, pot: v.potencia,
      glyM: v.glyFrac, glyL: s.glyL / s.a.glyL, na: v.na, pvRel: v.pvRel, perda: v.perda, perdaAgua: v.perdaAgua,
      gi: s.gi, est: s.est.vol, intest: s.int.vol, sr: v.sr, lac: s.lac, dano: s.dano, tar: v.am.tar, wbgt: v.am.wbgt,
      agua: s.bal.agua, cho: s.bal.cho, naIng: s.bal.na, choOx: s.bal.choOx, choExo: s.bal.choExo, suor: s.bal.suor,
      limite: v.limite, skbf: v.skbf, alt: v.pos.alt, sao2: v.sao2, sono: v.sono, tremor: v.tremor, chuva: v.am.chuva,
      reserv: s.mochila ? s.mochila.agua : null, dormindo: v.dormindo
    });
  }

  // ----------------------------------------------------------------- ações
  function aplicarItem(s, id) {
    const it = ITENS[id];
    adicionar(s.est, it, 1);
    s.bal.agua += it.vol; s.bal.cho += it.glic + it.fruc; s.bal.na += it.na;
    if (s.v && !s.v.parado && s.v.tipo !== 'transicao' && s.v.tipo !== 'nado') s.choJanela.cho += it.glic + it.fruc;
    if (it.caf) s.cafGut += it.caf;
    if (it.sumidouro) s.sumidouro += it.sumidouro;
    if (it.esponja) s.rEsp += it.esponja;
    if (it.gelo) s.rGelo += it.gelo;
    if (it.doce) s.doce += it.glic + it.fruc;
    if (it.salgado) s.doce = Math.max(0, s.doce - 60);
  }

  const ACOES = {
    dar(s, id) {
      const seg = segAtual(s), it = ITENS[id];
      if (seg.tipo === 'nado') { registrar(s, 'Na natação não há como entregar ' + it.nome.toLowerCase() + '.', 'alerta'); return; }
      const agora = seg.tipo === 'transicao' || s.parada > 0 && seg.apoio === 'posto';
      if (!agora && seg.apoio === 'mochila') {
        if (it.carrega && s.mochila && (s.mochila[id] || 0) > 0) {
          s.mochila[id]--;
          aplicarItem(s, id);
          registrar(s, it.nome + ' da mochila (sobram ' + s.mochila[id] + ').', 'acao');
          return;
        }
        s.fila.push(id);
        registrar(s, it.nome + (it.carrega ? ' acabou na mochila: fica' : ' só existe no apoio: fica') + ' separado para ' + (seg.posto ? 'o próximo posto' : 'a próxima transição') + '.', 'acao');
        return;
      }
      if (!agora && seg.apoio === 'posto') {
        s.fila.push(id);
        registrar(s, it.nome + ' separado para o próximo posto.', 'acao');
        return;
      }
      aplicarItem(s, id);
      registrar(s, it.nome + ' (' + it.porcao + ').', 'acao');
    },
    pesar(s) {
      const seg = segAtual(s);
      if (seg.tipo === 'nado') { registrar(s, 'Pesagem só depois da natação.', 'alerta'); return; }
      if (seg.tipo === 'transicao') { pesar(s, seg.nome); return; }
      if (!seg.posto) { registrar(s, 'Neste trecho não há balança: pesagem na próxima transição.', 'alerta'); return; }
      s.pesarPedido = true;
      registrar(s, 'Pesagem pedida no próximo posto (custa 1 min).', 'acao');
    },
    sombra(s) {
      const seg = segAtual(s);
      if (seg.tipo === 'nado') return;
      if (seg.tipo === 'transicao' || !seg.posto) { s.parada = Math.max(s.parada, 5); s.sombra = true; s.rEsp += 120; registrar(s, 'Parada de 5 min na sombra.', 'acao'); return; }
      s.sombraPedida = true;
      registrar(s, 'Parada de 5 min na sombra pedida para o próximo posto.', 'acao');
    },
    dormir(s, min) {
      const seg = segAtual(s);
      if (seg.tipo === 'nado' || seg.tipo === 'canoa') { registrar(s, 'Não dá para dormir na ' + (seg.tipo === 'nado' ? 'água' : 'canoa') + ': só na próxima transição.', 'alerta'); return; }
      if (s.dormindo > 0) return;
      s.dormindo = min;
      registrar(s, 'Deitou para dormir ' + min + ' min' + (s.c.roupa < 2 ? ' (com manta térmica, sem jaqueta)' : ' (com jaqueta e manta térmica)') + '.', 'acao');
    },
    acordar(s) {
      if (s.dormindo <= 0) return;
      s.dormindo = 0;
      registrar(s, 'Acordado antes da hora.', 'acao');
    },
    roupa(s, nivel) {
      const seg = segAtual(s);
      if (seg.tipo === 'nado') return;
      if (s.c.roupa === nivel) return;
      s.c.roupa = nivel;
      if (seg.tipo !== 'transicao') s.parada = Math.max(s.parada, 2);
      registrar(s, 'Roupa → ' + ROUPAS[nivel].nome.toLowerCase() + (seg.tipo !== 'transicao' ? ' (parada de 2 min)' : '') + '.', 'acao');
    },
    lista(s, id, qtd) {
      if (!s.lista) return;
      s.lista[id] = qtd;
      if (s.t < 1 || segAtual(s).tipo === 'transicao') s.mochila[id] = qtd;     // mochila arrumada agora
    },
    controle(s, chave, valor) {
      const antes = s.c[chave];
      s.c[chave] = valor;
      const nomes = { intensidade: 'Intensidade', hidratacao: 'Plano de hidratação', bebida: 'Bebida do plano', taxa: 'Volume do plano', autoItem: 'Comer sozinho', autoCada: 'Intervalo para comer sozinho' };
      if (antes !== valor) s._ultimoControle = { chave, nome: nomes[chave], valor, t: s.t };
    }
  };

  function executar(s, acao, ...args) {
    if (s.fim) return s;
    ACOES[acao](s, ...args);
    return s;
  }

  // próximo ponto de apoio: posto, riacho, transição ou chegada
  function proximoApoio(s) {
    const seg = segAtual(s), segs = s.prova.segmentos;
    if (!seg || seg.tipo === 'transicao') return null;
    const v = s.v || derivar(s);
    const eta = km => v.vel > 0 ? (km - s.km) * 1000 / v.vel : Infinity;
    const r = {};
    if (seg.posto) { const km = (Math.floor(s.km / seg.posto) + 1) * seg.posto; if (km < seg.km) r.posto = { km, min: eta(km) }; }
    if (seg.fontes) { const km = (Math.floor(s.km / seg.fontes) + 1) * seg.fontes; if (km < seg.km) r.fonte = { km, min: eta(km) }; }
    const prox = segs[s.seg + 1];
    r.fim = { km: seg.km, min: eta(seg.km), nome: prox ? prox.nome : 'Chegada' };
    return r;
  }
  function proximoPosto(s) { const r = proximoApoio(s); return r && r.posto ? r.posto : null; }

  return { criar, passo, executar, calcular: derivar, massaAtual, proximoApoio, proximoPosto, criterios, ritmoPara, posicao, carga,
           segAtual, horaDoDia, MOD, ROUPAS, ITENS, BEBIDAS_PLANO, CARREGAVEIS, CENARIOS, CAUSAS, hhmm };
});
