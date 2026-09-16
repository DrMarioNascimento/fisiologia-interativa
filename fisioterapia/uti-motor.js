/* ==========================================================================
   FisioLab UTI — motor fisiológico
   --------------------------------------------------------------------------
   Modelo didático de um adulto de 70 kg em ventilação mecânica.
   Tudo o que aparece na tela sai daqui; a página só desenha.

   Tempo em MINUTOS simulados. Volumes em L, massas em mEq / mmol / g.

   Blocos, na ordem em que o passo os calcula:
     1. Água e solutos: LIC, LEC (interstício + plasma), Na⁺, K⁺, Cl⁻, HCO₃⁻,
        glicose, lactato, albumina, hemácias.
        - água corre entre LIC e LEC até igualar a osmolalidade (instantâneo);
        - plasma ↔ interstício segue Starling (albumina, extravasamento, PVC).
     2. Circulação: curva de função cardíaca × curva de retorno venoso
        (Guyton). PAM = DC × RVS + PVC. Barorreflexo com atraso.
     3. Ventilação e gases: ventilação alveolar, espaço morto, shunt, PEEP,
        complacência, Severinghaus com efeito Bohr, oferta e consumo de O₂.
     4. Ácido-base: Henderson–Hasselbalch; lactato consome HCO₃⁻, rim regenera.
     5. Rim: TFG com autorregulação, ADH, excreção osmolar, furosemida.
     6. Eventos letais: arritmias por K⁺, isquemia, hipóxia, acidose,
        dívida de O₂, Na⁺ extremo, hipoglicemia.
   ========================================================================== */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.UTIMotor = factory();
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const PESO = 70;
  const DURACAO = 360;            // min: 6 h de plantão
  const DIVIDA_LETAL = 120;       // mL O₂/kg (ordem de grandeza de choque hemorrágico experimental)

  // lactato se distribui no LEC e em parte do LIC
  const volLac = s => s.ecf + 0.5 * s.icf;
  const clamp = (x, a, b) => (x < a ? a : x > b ? b : x);
  const relax = (x, alvo, dt, tau) => x + (alvo - x) * (1 - Math.exp(-dt / tau));
  const satura = x => x / (x + 1);

  // Severinghaus (1979): saturação a partir da PO₂ "virtual" já corrigida por pH e temperatura
  function satO2(po2, ph, temp) {
    const pv = Math.max(0.1, po2 * Math.pow(10, 0.48 * (ph - 7.4) - 0.024 * (temp - 37)));
    return 1 / (23400 / (pv * pv * pv + 150 * pv) + 1);
  }

  // ------------------------------------------------------------------ fluidos
  // concentrações por litro. hem = fração do volume que é hemácia.
  const FLUIDOS = {
    sf:    { nome: 'Soro fisiológico 0,9%',     na: 154, cl: 154, k: 0,  hco3: 0,    lac: 0,  glic: 0,   alb: 0,   hem: 0,   citrato: 0 },
    rl:    { nome: 'Ringer lactato',            na: 130, cl: 109, k: 4,  hco3: 0,    lac: 28, glic: 0,   alb: 0,   hem: 0,   citrato: 0 },
    sg5:   { nome: 'Soro glicosado 5%',         na: 0,   cl: 0,   k: 0,  hco3: 0,    lac: 0,  glic: 278, alb: 0,   hem: 0,   citrato: 0 },
    hs3:   { nome: 'Salina hipertônica 3%',     na: 513, cl: 513, k: 0,  hco3: 0,    lac: 0,  glic: 0,   alb: 0,   hem: 0,   citrato: 0 },
    alb20: { nome: 'Albumina 20%',              na: 140, cl: 110, k: 0,  hco3: 0,    lac: 0,  glic: 0,   alb: 200, hem: 0,   citrato: 0 },
    ch:    { nome: 'Concentrado de hemácias',   na: 140, cl: 100, k: 30, hco3: 0,    lac: 0,  glic: 0,   alb: 10,  hem: 0.6, citrato: 0.35 },
    bic:   { nome: 'Bicarbonato de sódio 8,4%', na: 1000, cl: 0,  k: 0,  hco3: 1000, lac: 0,  glic: 0,   alb: 0,   hem: 0,   citrato: 0 },
    glic50:{ nome: 'Glicose 50%',               na: 0,   cl: 0,   k: 0,  hco3: 0,    lac: 0,  glic: 2775,alb: 0,   hem: 0,   citrato: 0 }
  };

  // ----------------------------------------------------------------- cenários
  const CENARIOS = {
    septico: {
      id: 'septico', nome: 'Choque séptico', sub: 'Pneumonia grave · 2º dia de internação',
      historia: 'Homem, 58 anos, 70 kg, intubado por pneumonia. Febril, vasodilatado, capilares extravasando. Pressão caindo desde a madrugada e lactato subindo. O foco infeccioso ainda não foi tratado.',
      pede: 'Volume, vasopressor, antibiótico com controle do foco, e ventilação que não piore o pulmão.',
      ini: { pv: 3.0, isf: 13.6, na: 136, k: 4.0, cl: 104, hco3: 18, lac: 4.0, glic: 9, albg: 27, hct: 0.35, temp: 38.9,
             paco2: 34, S: 0.8, pcomp: 0 },
      dz: { vaso: 0.42, leak: 0.65, contr: 0.82, metab: 0.28, extr: 0.58, colapso: 0.14, compl: 45, sens: 0.8, estresse: 1.35, dor: 5, tempAlvo: 38.9, tfg: 1, liberaK: 0, sangra: 0 },
      vent: { fio2: 0.40, peep: 5, vt: 500, fr: 16 },
      resolvivel: true
    },
    hemorragico: {
      id: 'hemorragico', nome: 'Choque hemorrágico', sub: 'Politrauma · fratura de pelve',
      historia: 'Mulher, 34 anos, 70 kg, atropelamento. Já perdeu cerca de 1,5 L de sangue e continua sangrando pela pelve. Intubada no pronto-socorro, chegou fria à UTI. O centro cirúrgico leva 20 minutos para conter o sangramento depois de acionado.',
      pede: 'Parar o sangramento, repor o que se perdeu com o fluido certo, e não diluir o sangue que resta.',
      ini: { pv: 2.45, isf: 10.3, na: 139, k: 4.3, cl: 106, hco3: 19, lac: 4.5, glic: 8, albg: 36, hct: 0.33, rbcv: 1.2, temp: 35.8,
             paco2: 36, S: 0.9, pcomp: 0, ica: -0.08 },
      dz: { vaso: 1.0, leak: 0.1, contr: 1.0, metab: 0.0, extr: 0.72, colapso: 0.04, compl: 55, sens: 0.9, estresse: 1.25, dor: 18, tempAlvo: 35.8, tfg: 1, liberaK: 0, sangra: 40 },
      vent: { fio2: 0.40, peep: 5, vt: 450, fr: 14 },
      resolvivel: false
    },
    sdra: {
      id: 'sdra', nome: 'Insuficiência respiratória (SDRA)', sub: 'Pneumonia bilateral · pulmão rígido',
      historia: 'Homem, 45 anos, 70 kg. Pneumonia viral grave evoluiu para síndrome do desconforto respiratório agudo. Alvéolos colapsados e pulmão pouco complacente. O ventilador ainda está nos parâmetros de quando foi intubado.',
      pede: 'Recrutar o pulmão sem machucá-lo e sem derrubar o retorno venoso. Controlar CO₂ e pH.',
      ini: { pv: 2.8, isf: 11.6, na: 138, k: 4.2, cl: 103, hco3: 23, lac: 2.0, glic: 8, albg: 32, hct: 0.38, temp: 38.2,
             paco2: 52, S: 0.5, pcomp: 0 },
      dz: { vaso: 0.85, leak: 0.35, contr: 0.95, metab: 0.12, extr: 0.68, colapso: 0.46, compl: 27, sens: 0.85, estresse: 1.2, dor: 8, tempAlvo: 38.2, tfg: 1, liberaK: 0, sangra: 0 },
      vent: { fio2: 0.50, peep: 5, vt: 620, fr: 14 },
      resolvivel: false, progrideSemPeep: true
    },
    hiperk: {
      id: 'hiperk', nome: 'Hipercalemia e lesão renal aguda', sub: 'Rabdomiólise · rim parado',
      historia: 'Homem, 29 anos, 70 kg. Soterrado por 6 h e resgatado. Os músculos lesados liberam potássio, e o rim entupido de mioglobina quase não filtra. Chegou encharcado de volume, acidótico, com o ECG mudando.',
      pede: 'Proteger o coração agora, tirar o K⁺ do plasma, corrigir a acidose, e retirar o excesso de água e potássio de verdade.',
      ini: { pv: 3.45, isf: 14.1, na: 130, k: 6.0, cl: 102, hco3: 14, lac: 1.8, glic: 6, albg: 34, hct: 0.38, temp: 37.2,
             paco2: 38, S: 0.2, pcomp: 0 },
      dz: { vaso: 1.05, leak: 0.2, contr: 0.95, metab: 0.05, extr: 0.7, colapso: 0.10, compl: 42, sens: 0.95, estresse: 1.1, dor: 6, tempAlvo: 37.2, tfg: 0.07, liberaK: 1.8, sangra: 0 },
      vent: { fio2: 0.40, peep: 5, vt: 480, fr: 14 },
      resolvivel: false
    }
  };

  // ------------------------------------------------------------ estado inicial
  function criar(idCenario) {
    const sc = CENARIOS[idCenario];
    const I = sc.ini;
    const ecf = I.pv + I.isf;
    const hct = I.hct;
    const rbcv = I.rbcv != null ? I.rbcv : I.pv * hct / (1 - hct);
    // osmolalidade inicial define o LIC em equilíbrio com o LEC
    const osmE = 2 * I.na * ecf + I.glic * ecf;
    const tonic = osmE / ecf;
    const icf = 28;
    const s = {
      cenario: idCenario, t: 0, dz: JSON.parse(JSON.stringify(sc.dz)),
      // massas e volumes
      tbw: icf + ecf, ecf, icf, pv: I.pv, rbcv,
      naM: I.na * ecf, clM: I.cl * ecf, hco3M: I.hco3 * ecf, glicM: I.glic * ecf, lacM: I.lac * (ecf + 14),
      kM: I.k * ecf,                // K⁺ "equivalente de LEC" (ver bloco de potássio)
      osmI: tonic * icf, albM: I.albg * I.pv,
      // estados lentos
      paco2: I.paco2, S: I.S, temp: I.temp, icaExtra: I.ica || 0,
      divida: 0, lesaoRenal: 0, isq: 0, co2Extra: 0,
      eNe: 0, eDobu: 0, eFuro: 0, insDepot: 0, eIns: 0, eCa: 0,
      vo2: 200, deficit: 0,
      // controles
      c: { manutTipo: 'rl', manutTaxa: 0, ne: 0, dobu: 0, kcl: 0, fio2: sc.vent.fio2, peep: sc.vent.peep, vt: sc.vent.vt, fr: sc.vent.fr, ufTaxa: 0 },
      fila: [],                      // infusões em curso {tipo, ml, taxa}
      antibiotico: null, hemostasia: null, dialise: null,
      bal: { entrada: 0, diurese: 0, insensivel: 0, sangue: 0, uf: 0 },
      na24: [],                      // histórico de Na para velocidade de correção
      tm: {},                        // cronômetros de condições letais
      morte: null, alta: null,
      eventos: [], trend: [], v: {}
    };
    // pequena acomodação dos estados rápidos antes de T0
    for (let i = 0; i < 200; i++) {
      const v = calcular(s);
      s.paco2 = relax(s.paco2, v.paco2Alvo, 0.05, 3);
      s.S = relax(s.S, alvoSimpatico(s, v), 0.05, 0.5);
      s.isq = relax(s.isq, v.isqAlvo, 0.05, 4);
      s.vo2 = v.vo2;
    }
    calcular(s);
    registrar(s, 'Início do plantão: ' + sc.nome + '.', 'info');
    s.na24.push({ t: 0, na: s.v.na });
    gravarTendencia(s);
    avisos(s);
    return s;
  }

  function registrar(s, texto, tipo) {
    s.eventos.push({ t: s.t, texto, tipo: tipo || 'info' });
    if (s.eventos.length > 300) s.eventos.shift();
  }

  // -------------------------------------------------- variáveis derivadas (v)
  function calcular(s) {
    const v = s.v, c = s.c, dz = s.dz;

    // --- concentrações
    v.na = s.naM / s.ecf;
    v.cl = s.clM / s.ecf;
    v.hco3met = s.hco3M / s.ecf;
    v.glic = s.glicM / s.ecf;
    v.lac = s.lacM / volLac(s);
    v.alb = s.albM / s.pv;                         // g/L
    v.isf = s.ecf - s.pv;
    v.vs = s.pv + s.rbcv;                          // volemia
    v.hct = s.rbcv / v.vs;
    v.hb = v.hct * 100 / 3;
    v.posm = 2 * v.na + v.glic + 5;

    // --- ventilação
    const vtL = c.vt / 1000;
    const recrut = 1 - Math.exp(-c.peep / 7);
    const colapso = clamp(dz.colapso, 0, 0.9);
    v.compl = dz.compl * (1 - 0.55 * colapso) * (1 + 0.45 * recrut * colapso * 2) / (1 + 0.035 * Math.max(0, c.peep - 14));
    v.pplat = c.peep + c.vt / v.compl;
    v.dp = v.pplat - c.peep;
    const pMedia = c.peep + 0.3 * v.dp;
    v.ppl = 0.35 * pMedia * 0.74;                  // mmHg transmitidos ao tórax

    // --- ácido-base com o CO₂ corrente
    v.paco2 = s.paco2;
    v.hco3 = clamp(v.hco3met + 0.1 * (s.paco2 - 40), 2, 60);
    v.ph = 6.1 + Math.log10(v.hco3 / (0.0307 * s.paco2));
    v.be = (v.hco3met - 24) * 1.2;
    v.ag = v.na - v.cl - v.hco3;

    // --- potássio: massa no LEC + deslocamento transcelular
    v.kShift = 4.8 * (7.4 - v.ph) - 1.1 * s.eIns - 0.25 * satura(s.eDobu / 6);
    v.k = clamp(s.kM / s.ecf + v.kShift, 1.2, 12);
    // --- cálcio ionizado
    v.ica = clamp(1.15 + s.icaExtra - 0.45 * (v.ph - 7.4), 0.4, 2.0);

    // --- simpático e drogas
    const acidBlunt = clamp(1 - (7.25 - v.ph) * 2.5, 0.35, 1);
    const ne = satura(s.eNe / 0.2);                // 0..1
    const db = satura(s.eDobu / 6);
    const S = s.S;
    v.ne = ne; v.db = db;

    // --- coração
    const acidC = clamp(1 - Math.max(0, 7.2 - v.ph) * 1.4, 0.35, 1);
    const caC = Math.pow(clamp(v.ica / 1.0, 0.45, 1), 0.7);
    const hipoxC = (s.v.sao2 != null && s.v.sao2 < 0.65) ? 0.7 : 1;
    const hipoT = clamp(1 - 0.06 * Math.max(0, 36 - s.temp), 0.7, 1);
    v.contr = dz.contr * (1 + 0.35 * S * acidBlunt) * (1 + 0.7 * db) * (1 + 0.1 * ne) * acidC * caC * hipoxC * hipoT * (1 - 0.45 * s.isq);

    const sao2prev = s.v.sao2 != null ? s.v.sao2 : 0.95;
    let hr = 72 * (0.85 + 0.9 * S * acidBlunt) + 10 * (s.temp - 37) + 22 * db + 8 * ne + dz.dor
      + 0.8 * Math.max(0, 90 - sao2prev * 100) + 0.4 * Math.max(0, s.paco2 - 50);
    if (sao2prev < 0.55 || v.ph < 6.95 || v.k > 8.5) hr *= 0.55;
    v.fc = clamp(hr, 25, 185);

    // retorno venoso
    // volume não estressado: venodilatação da sepse aumenta; simpático e noradrenalina reduzem
    const vu = 3.0 * (1 + 0.18 * (1 - Math.min(1, dz.vaso))) * (1 - 0.28 * S * acidBlunt - 0.12 * ne * acidBlunt);
    v.vu = vu;
    v.pmsf = Math.max(0, v.vs - vu) / 0.2;
    const rvr = 1.24;
    const enchHR = v.fc > 115 ? clamp(1 - (v.fc - 115) / 170, 0.5, 1) : 1;
    const pamPrev = s.v.pam || 85;
    const pos = clamp(1 - 0.004 * Math.max(0, pamPrev - 100), 0.7, 1);
    const sv = rap => 140 * v.contr * (1 - Math.exp(-Math.max(0, rap - v.ppl) / 3)) * enchHR * pos;
    const dcCardio = rap => v.fc * sv(rap) / 1000;
    const dcRetorno = rap => Math.max(0, (v.pmsf - rap) / rvr);
    let lo = -2, hi = 45;
    for (let i = 0; i < 40; i++) {
      const m = (lo + hi) / 2;
      if (dcCardio(m) - dcRetorno(m) > 0) hi = m; else lo = m;
    }
    v.pvc = (lo + hi) / 2;
    v.dc = dcCardio(v.pvc);
    v.vs_ml = v.dc * 1000 / v.fc;

    const visc = 0.6 + v.hct;
    const caV = clamp(v.ica / 1.0, 0.6, 1);
    v.rvs = 19.6 * dz.vaso * (0.85 + 0.6 * S * acidBlunt) * (1 + 1.3 * ne * acidBlunt) * (1 - 0.25 * db) * caV * visc;
    v.pam = v.dc * v.rvs + v.pvc;
    const pp = v.vs_ml / 1.5;
    v.pas = v.pam + pp * 2 / 3;
    v.pad = v.pam - pp / 3;
    v.poap = v.pvc - v.ppl + 6;

    // --- gases
    const vco2 = 0.8 * s.vo2 + s.co2Extra;
    const vdAnat = 0.15;
    v.vd = vdAnat + vtL * (0.12 + 0.25 * Math.max(0, v.pplat - 28) / 10 + 0.2 * Math.max(0, 3.5 - v.dc) / 3.5 + 0.12 * colapso);
    v.vdvt = v.vd / vtL;
    v.va = c.fr * Math.max(0.02, vtL - v.vd);
    v.paco2Alvo = clamp(0.863 * vco2 / v.va, 12, 160);
    v.pao2alv = Math.max(0, c.fio2 * 713 - s.paco2 / 0.8);
    // água pulmonar: pressão capilar alta (POAP) e interstício encharcado com capilar permeável
    v.isfExcesso = Math.max(0, v.isf - 13);
    const edema = clamp(0.02 * Math.max(0, v.poap - (20 - 8 * dz.leak)) + 0.012 * v.isfExcesso * (0.4 + dz.leak), 0, 0.3);
    const atelect = 0.04 * Math.max(0, 5 - c.peep) / 5 + (c.vt < 350 ? 0.04 : 0);
    v.shunt = clamp(0.03 + colapso * (1 - 0.7 * recrut) + edema + atelect, 0.02, 0.8);
    v.edema = edema;
    const cc = 1.34 * v.hb * satO2(v.pao2alv, v.ph, s.temp) + 0.003 * v.pao2alv;
    const dcSeguro = Math.max(0.3, v.dc);
    let cao2 = cc - v.shunt / (1 - v.shunt) * s.vo2 / (10 * dcSeguro);
    cao2 = Math.max(0.5, cao2);
    let plo = 1, phi = Math.max(2, v.pao2alv);
    for (let i = 0; i < 40; i++) {
      const m = (plo + phi) / 2;
      if (1.34 * v.hb * satO2(m, v.ph, s.temp) + 0.003 * m > cao2) phi = m; else plo = m;
    }
    v.pao2 = (plo + phi) / 2;
    v.sao2 = satO2(v.pao2, v.ph, s.temp);
    v.cao2 = 1.34 * v.hb * v.sao2 + 0.003 * v.pao2;
    v.do2 = v.dc * v.cao2 * 10;
    v.pf = v.pao2 / c.fio2;

    const metab = 1 + 0.1 * (s.temp - 37) + dz.metab;
    v.vo2dem = 200 * metab;
    // abaixo de ~65 mmHg a perfusão dos tecidos cai mesmo com débito alto (autorregulação perdida)
    v.perfTec = clamp((v.pam - 30) / 35, 0.05, 1);
    const x = dz.extr * v.perfTec * v.do2 / v.vo2dem;
    const frac = x < 0.8 ? x : 1 - 0.2 * Math.exp(-(x - 0.8) / 0.2);
    v.vo2 = v.vo2dem * frac;
    v.deficit = Math.max(0, v.vo2dem - v.vo2);
    v.cvo2 = Math.max(0, v.cao2 - v.vo2 / (10 * dcSeguro));
    v.svo2 = clamp(v.cvo2 / (1.34 * v.hb), 0, 1);
    v.tex = v.vo2 / Math.max(1, v.do2);
    v.etco2 = v.dc < 0.5 ? s.paco2 * v.dc * 0.3 : s.paco2 * Math.max(0, vtL - v.vd) / Math.max(0.01, vtL - vdAnat);

    // --- rim
    const auto = v.pam >= 75 ? 1 : clamp((v.pam - 40) / 35, 0, 1);
    const cong = clamp(1 - 0.03 * Math.max(0, v.pvc - 10), 0.4, 1);
    v.tfgFrac = auto * cong * (1 - s.lesaoRenal) * dz.tfg;
    v.tfg = 120 * v.tfgFrac;
    const adhOsm = clamp((v.posm - 282) / 12, 0, 1);
    const adhVol = clamp((70 - v.pam) / 25, 0, 1);
    v.adh = clamp(Math.max(0.35, adhOsm, adhVol), 0, 1);
    const pvNorm = 0.214 * s.ecf;
    const natri = clamp(0.4 + 0.6 * Math.pow(s.pv / 3.0, 2), 0.3, 3);
    const furo = clamp(s.eFuro, 0, 1.5) * Math.sqrt(v.tfgFrac);
    v.osmEx = 0.7 * v.tfgFrac * natri * (1 + 3 * furo);
    let uosm = 60 + 1100 * v.adh;
    uosm = uosm * (1 - 0.7 * clamp(furo, 0, 1)) + 300 * 0.7 * clamp(furo, 0, 1);
    v.uosm = uosm;
    v.diurese = 1000 * v.osmEx / uosm;             // mL/min
    v.diureseKgH = v.diurese * 60 / PESO;
    v.naEx = v.osmEx * (0.18 + 0.22 * clamp(furo, 0, 1));
    v.kEx = 0.035 * Math.pow(v.k / 4.2, 2) * v.tfgFrac * (1 + 2 * furo) * clamp(0.6 + 0.4 * v.adh + 0.3 * (1 - s.pv / 3), 0.5, 1.6);

    // --- coração: isquemia (demanda HR×PAS contra oferta pressão de perfusão coronária × CaO₂)
    v.ppc = v.pad - v.pvc;
    const demanda = (v.fc * Math.max(40, v.pas)) / (75 * 120);
    const oferta = Math.max(0.02, (Math.max(0, v.ppc) / 60) * (v.cao2 / 18));
    v.razaoMio = demanda / oferta;
    v.isqAlvo = clamp((v.razaoMio - 1.6) / 1.6, 0, 1);

    // --- efeito protetor do cálcio sobre a membrana
    v.kEfetivo = v.k - 1.0 * clamp(s.eCa, 0, 1.2);

    // --- ritmo mostrado no monitor
    v.ritmo = ritmo(s);
    return v;
  }

  function ritmo(s) {
    const v = s.v;
    if (s.morte) return s.morte.ritmo;
    const r = { nome: 'Sinusal', picoT: 0, qrsLargo: 0, senoidal: 0, ondaU: 0, st: 0, qtLongo: 0, ectopia: 0, pAchatada: 0 };
    const ke = v.kEfetivo;
    r.picoT = clamp((v.k - 5.5) / 2, 0, 1);
    r.pAchatada = clamp((ke - 6.8) / 1.2, 0, 1);
    r.qrsLargo = clamp((ke - 7.0) / 1.2, 0, 1);
    r.senoidal = clamp((ke - 8.0) / 0.8, 0, 1);
    r.ondaU = clamp((3.4 - v.k) / 1.2, 0, 1);
    r.st = clamp(s.isq, 0, 1);
    r.qtLongo = clamp(Math.max((0.95 - v.ica) / 0.3, (3.2 - v.k) / 1.2), 0, 1);
    r.ectopia = clamp(Math.max((2.9 - v.k) / 0.8, (s.isq - 0.4) / 0.6, (ke - 7.4) / 1.0), 0, 1);
    if (v.fc > 100) r.nome = 'Taquicardia sinusal';
    if (v.fc < 55) r.nome = 'Bradicardia sinusal';
    if (r.senoidal > 0.5) r.nome = 'Padrão senoidal (hipercalemia)';
    else if (r.qrsLargo > 0.4) r.nome = 'QRS alargado';
    return r;
  }

  // ------------------------------------------------------------- adicionar fluido
  function infundir(s, tipo, ml) {
    const f = FLUIDOS[tipo];
    const L = ml / 1000;
    const plasma = L * (1 - f.hem);
    s.tbw += plasma; s.ecf += plasma; s.pv += plasma;
    s.naM += f.na * plasma; s.clM += f.cl * plasma; s.hco3M += f.hco3 * plasma;
    s.lacM += f.lac * plasma; s.glicM += f.glic * plasma; s.albM += f.alb * plasma;
    s.kM += 0.15 * f.k * plasma;
    s.rbcv += L * f.hem;
    s.icaExtra -= f.citrato * L;
    if (f.hco3 > 0) s.co2Extra += f.hco3 * plasma * 22.4 / 10 * 0.6;  // CO₂ liberado ao tamponar
    s.bal.entrada += ml;
  }

  // retirar líquido plasmático com a composição do plasma (sangramento, ultrafiltração)
  function retirarPlasma(s, L) {
    L = Math.min(L, s.pv * 0.5);
    const conc = L / s.ecf;
    s.naM -= s.naM * conc; s.clM -= s.clM * conc; s.hco3M -= s.hco3M * conc;
    s.lacM -= s.lacM * L / volLac(s); s.glicM -= s.glicM * conc; s.kM -= s.kM * conc * 0.15;
    s.albM -= s.albM * (L / s.pv);
    s.tbw -= L; s.ecf -= L; s.pv -= L;
    return L;
  }

  // --------------------------------------------------------------------- passo
  function passo(s, dtTotal) {
    if (s.morte || s.alta) return s;
    let resta = dtTotal;
    while (resta > 1e-9 && !s.morte && !s.alta) {
      const dt = Math.min(0.05, resta);
      passoInterno(s, dt);
      resta -= dt;
    }
    return s;
  }

  function passoInterno(s, dt) {
    const c = s.c, dz = s.dz;
    const v = calcular(s);

    // 1. drogas até o local de ação
    s.eNe = relax(s.eNe, c.ne, dt, 1.5);
    s.eDobu = relax(s.eDobu, c.dobu, dt, 2);
    s.eFuro *= Math.exp(-dt / 120);
    const absorvido = s.insDepot * (1 - Math.exp(-dt / 15));
    s.insDepot -= absorvido; s.eIns += absorvido; s.eIns *= Math.exp(-dt / 120);
    s.eCa *= Math.exp(-dt / 40);
    s.icaExtra *= Math.exp(-dt / 180);
    s.co2Extra *= Math.exp(-dt / 8);

    // 2. evolução da doença
    evoluirDoenca(s, dt);

    // 3. entradas
    if (c.manutTaxa > 0) infundir(s, c.manutTipo, c.manutTaxa / 60 * dt);
    for (const inf of s.fila) {
      const ml = Math.min(inf.ml, inf.taxa * dt);
      infundir(s, inf.tipo, ml);
      inf.ml -= ml;
    }
    s.fila = s.fila.filter(i => i.ml > 1e-6);
    if (c.kcl > 0) { s.kM += 0.15 * c.kcl / 60 * dt; s.clM += c.kcl / 60 * dt; }

    // 4. saídas
    // sangramento: cresce com a pressão (hipotensão permissiva)
    if (dz.sangra > 0) {
      const q = dz.sangra * clamp(v.pam / 65, 0.2, 1.8) * dt / 1000;   // L de sangue
      const hemacia = q * v.hct;
      s.rbcv = Math.max(0.2, s.rbcv - hemacia);
      const saiu = retirarPlasma(s, q - hemacia);
      s.bal.sangue += (hemacia + saiu) * 1000;
    }
    // perdas insensíveis: água livre
    const insens = 0.55 * (1 + 0.12 * (s.temp - 37)) * dt / 1000;
    s.tbw -= insens; s.ecf -= insens; s.bal.insensivel += insens * 1000;
    // rim
    const urinaL = v.diurese * dt / 1000;
    s.tbw -= urinaL; s.ecf -= urinaL; s.bal.diurese += urinaL * 1000;
    s.naM -= v.naEx * dt;
    s.clM -= v.naEx * dt * (v.cl / v.na);
    s.kM -= 0.15 * v.kEx * dt;
    // diálise
    if (s.dialise && s.t >= s.dialise.inicio) {
      const ecf = s.ecf;
      s.kM -= 0.18 * (v.k - 2.0) * 0.35 * dt;
      s.hco3M += 0.06 * (30 - v.hco3met) * dt;
      s.naM += 0.012 * (140 - v.na) * dt;
      s.lacM -= 0.08 * v.lac * dt;
      s.glicM += 0.03 * (6 - v.glic) * dt;
      if (c.ufTaxa > 0) {
        const L = retirarPlasma(s, c.ufTaxa / 60 * dt / 1000);
        s.bal.uf += L * 1000;
      }
      void ecf;
    }

    // 5. metabolismo
    // glicose
    const prodG = 0.78 * dz.estresse;
    const consG = 0.38 * v.glic / (v.glic + 0.5) + 0.08 * v.glic * dz.sens * (1 + 3 * s.eIns);
    const glicosuria = 0.12 * Math.max(0, v.glic - 10) * v.tfgFrac;
    s.glicM = Math.max(0.5, s.glicM + (prodG - consG - glicosuria) * dt);
    // lactato: produção basal + anaeróbia; depuração hepática depende de perfusão
    const prodL = 1.17 + 0.12 * v.deficit + 4 * Math.max(0, dz.metab - 0.1);
    const perfHep = clamp(Math.min(v.dc / 5, v.pam / 65), 0.15, 1.2);
    const consL = 5.85 * perfHep * v.lac / (v.lac + 4) + 0.3 * v.tfgFrac * v.lac / (v.lac + 4);
    const dL = (prodL - consL) * dt;
    s.lacM = Math.max(0.2 * volLac(s), s.lacM + dL);
    s.hco3M -= 0.5 * dL;
    // ácido fixo e rim
    s.hco3M -= 0.05 * dt;
    const alvoH = 24 + 0.35 * (s.paco2 - 40);
    const regen = v.hco3met < alvoH
      ? (0.05 + (alvoH - v.hco3met) * s.ecf / 3000) * v.tfgFrac          // compensação renal leva dias
      : 0.05 * v.tfgFrac - (v.hco3met - alvoH) * s.ecf / 600 * v.tfgFrac;
    s.hco3M = Math.max(0.03 * s.ecf, s.hco3M + regen * dt);
    // liberação de K⁺ por músculo lesado
    if (dz.liberaK > 0) s.kM += 0.15 * dz.liberaK * dt;
    // albumina escapa com o extravasamento
    s.albM -= s.albM * dz.leak * 0.0006 * dt;

    // 6. água entre LIC e LEC (osmolalidade igual dos dois lados)
    const osmE = 2 * s.naM + s.glicM;
    const ton = (osmE + s.osmI) / s.tbw;
    const ecfNovo = osmE / ton;
    s.pv *= ecfNovo / s.ecf;
    s.ecf = ecfNovo;
    s.icf = s.tbw - s.ecf;

    // 7. plasma ↔ interstício (Starling)
    const albN = clamp(s.albM / s.pv / 40, 0.3, 1.6);
    const f = 0.214 * Math.pow(albN, 0.25) * (1 - 0.12 * dz.leak) * clamp(1 - 0.012 * Math.max(0, v.pvc - 8), 0.75, 1);
    const pvEq = f * s.ecf;
    const tau = s.pv > pvEq ? 25 * (1 - 0.5 * dz.leak) : 90;
    s.pv = clamp(relax(s.pv, pvEq, dt, tau), 0.6, s.ecf - 1);

    // 8. estados rápidos
    s.paco2 = relax(s.paco2, v.paco2Alvo, dt, 3);
    s.S = relax(s.S, alvoSimpatico(s, v), dt, 0.5);
    s.vo2 = v.vo2;
    s.deficit = v.deficit;
    s.temp = relax(s.temp, dz.tempAlvo, dt, 90);
    s.isq = relax(s.isq, v.isqAlvo, dt, 4);

    
    // 9. danos acumulados
    s.divida += v.deficit * dt / PESO;
    if (v.deficit < 1) s.divida = Math.max(0, s.divida - 0.02 * dt);
    const hipoperf = clamp((0.45 - v.tfgFrac / Math.max(0.05, dz.tfg * (1 - s.lesaoRenal))) / 0.45, 0, 1);
    if (dz.tfg > 0.5) s.lesaoRenal = clamp(s.lesaoRenal + hipoperf * 0.0012 * dt - (hipoperf === 0 ? 0.0001 * dt : 0), 0, 0.85);
    if (v.pplat > 30) dz.colapso = clamp(dz.colapso + 0.0007 * (v.pplat - 30) * dt, 0, 0.9);

    s.t += dt;
    verificarMorte(s);
    if (!s.morte && s.t >= DURACAO) darAlta(s);
    if (Math.floor(s.t) !== Math.floor(s.t - dt)) {
      gravarTendencia(s);
      avisos(s);
    }
  }

  function alvoSimpatico(s, v) {
    return clamp(0.05 + Math.max(0, 90 - v.pam) / 40 + Math.max(0, 88 - v.sao2 * 100) / 60 + Math.max(0, s.paco2 - 55) / 80, 0, 1);
  }

  function evoluirDoenca(s, dt) {
    const dz = s.dz, sc = CENARIOS[s.cenario];
    if (sc.resolvivel && s.antibiotico != null) {
      const k = clamp((s.t - s.antibiotico - 60) / 300, 0, 1);   // começa 1 h depois
      const base = sc.dz;
      dz.vaso = base.vaso + (0.9 - base.vaso) * 0.6 * k;
      dz.leak = base.leak * (1 - 0.55 * k);
      dz.metab = base.metab * (1 - 0.5 * k);
      dz.extr = base.extr + (0.7 - base.extr) * 0.6 * k;
      dz.contr = base.contr + (1 - base.contr) * 0.5 * k;
      dz.tempAlvo = base.tempAlvo - (base.tempAlvo - 37.6) * k;
    } else if (sc.resolvivel && s.t > 60) {
      // sem controle do foco, a sepse avança: vasoplegia, extravasamento e depressão miocárdica
      dz.vaso = Math.max(0.2, dz.vaso - 0.0011 * dt);
      dz.leak = Math.min(0.9, dz.leak + 0.0008 * dt);
      dz.contr = Math.max(0.55, dz.contr - 0.0005 * dt);
    }
    if (sc.progrideSemPeep && s.c.peep < 10) dz.colapso = clamp(dz.colapso + 0.0012 * (10 - s.c.peep) / 10 * dt, 0, 0.9);
    if (s.hemostasia != null && s.t >= s.hemostasia + 20) dz.sangra = 0;
    if (s.cenario === 'hiperk') dz.liberaK = Math.max(0.12, sc.dz.liberaK * Math.exp(-s.t / 240));
  }

  // --------------------------------------------------------- mortes e avisos
  const CAUSAS = {
    fvHiperK: {
      titulo: 'Parada cardíaca por hipercalemia', ritmo: 'FV',
      porque: 'O K⁺ extracelular alto torna o potencial de repouso menos negativo. Canais de Na⁺ ficam inativados e a condução fica lenta: a onda T fica apiculada, a onda P some, o QRS alarga e se funde com a T em onda senoidal, até a fibrilação. O cálcio só protege a membrana por 30 a 60 min. Tirar K⁺ do plasma (insulina, alcalose, diálise) é o que resolve.'
    },
    fvHipoK: {
      titulo: 'Arritmia ventricular por hipocalemia', ritmo: 'FV',
      porque: 'Com pouco K⁺ fora da célula a repolarização atrasa: onda T achatada, onda U e QT longo. A janela vulnerável cresce e surgem extrassístoles, até torsades e fibrilação. Furosemida, alcalose e insulina baixam o K⁺ plasmático, e é preciso repor.'
    },
    fvIsquemia: {
      titulo: 'Fibrilação ventricular isquêmica', ritmo: 'FV',
      porque: 'O coração consumiu mais O₂ (frequência × pressão sistólica) do que a coronária entregava (pressão diastólica − PVC, vezes o conteúdo arterial de O₂). Taquicardia, diastólica baixa e hemoglobina baixa somam. Primeiro o segmento ST desce, depois o músculo isquêmico fibrila.'
    },
    hipoxia: {
      titulo: 'Parada por hipóxia', ritmo: 'bradi-assistolia',
      porque: 'A saturação ficou abaixo de 50% por minutos (ou abaixo de 65% por meia hora). O miocárdio sem O₂ primeiro acelera, depois entra em bradicardia e para. As causas estão na troca gasosa: FiO₂, colapso alveolar (PEEP), shunt por edema, ou pouco O₂ chegando porque débito ou hemoglobina caíram.'
    },
    acidose: {
      titulo: 'Parada por acidose extrema', ritmo: 'AESP',
      porque: 'Com pH abaixo de 6,85 as proteínas contráteis e os receptores adrenérgicos param de responder. Nem noradrenalina segura o tônus vascular, e o coração perde a força. A origem pode ser metabólica (lactato, rim, excesso de SF 0,9%) ou respiratória (CO₂ retido por ventilação alveolar insuficiente).'
    },
    choque: {
      titulo: 'Colapso circulatório', ritmo: 'AESP',
      porque: 'A pressão média ficou abaixo de 35 mmHg por minutos. Abaixo desse nível não há perfusão coronária nem cerebral e a atividade elétrica perde o pulso. Falta volume no leito (retorno venoso), tônus (RVS) ou força de bomba (contratilidade).'
    },
    divida: {
      titulo: 'Falência de múltiplos órgãos', ritmo: 'AESP',
      porque: 'A dívida de O₂ passou do limite de ~120 mL por kg. Por muito tempo a oferta ficou abaixo da demanda: o metabolismo anaeróbio gerou lactato, e as células esgotaram o ATP. Não é um evento súbito. É oferta insuficiente, somada minuto a minuto (DO₂ = DC × CaO₂).'
    },
    hiponatremia: {
      titulo: 'Edema cerebral por hiponatremia', ritmo: 'bradi-assistolia',
      porque: 'Com o plasma hipotônico a água entra nos neurônios, e o encéfalo incha dentro do crânio até herniar. Água livre (SG 5%, ADH alto) derruba o Na⁺. A salina hipertônica tira água das células, mas corrigir rápido demais também lesa (mielinólise).'
    },
    hipernatremia: {
      titulo: 'Desidratação cerebral por hipernatremia', ritmo: 'bradi-assistolia',
      porque: 'Com o plasma hipertônico a água sai dos neurônios. O encéfalo retrai e vasos se rompem. Sódio em excesso (salina 3%, bicarbonato) e perdas de água sem reposição levam a isso.'
    },
    hipoglicemia: {
      titulo: 'Coma hipoglicêmico', ritmo: 'bradi-assistolia',
      porque: 'O neurônio depende quase só de glicose. A insulina desloca K⁺ para dentro da célula, mas também desloca glicose, e o efeito dura mais que o da glicose dada junto.'
    }
  };

  function cronometro(s, chave, cond, dt) {
    s.tm[chave] = cond ? (s.tm[chave] || 0) + dt : Math.max(0, (s.tm[chave] || 0) - 2 * dt);
    return s.tm[chave];
  }

  function verificarMorte(s) {
    const v = s.v, dt = 0.05;
    let causa = null;
    if (v.kEfetivo >= 9.2 || cronometro(s, 'hiperK', v.kEfetivo >= 8.3, dt) > 3) causa = 'fvHiperK';
    else if (cronometro(s, 'hipoK', v.k <= 2.0, dt) > 10) causa = 'fvHipoK';
    else if (cronometro(s, 'isq', s.isq > 0.9, dt) > 8) causa = 'fvIsquemia';
    else if (cronometro(s, 'hipox', v.sao2 < 0.5, dt) > 5 || cronometro(s, 'hipox2', v.sao2 < 0.65, dt) > 30) causa = 'hipoxia';
    else if (v.ph < 6.7 || cronometro(s, 'acid', v.ph < 6.85, dt) > 5) causa = 'acidose';
    else if (cronometro(s, 'pam', v.pam < 35, dt) > 5) causa = 'choque';
    else if (s.divida >= DIVIDA_LETAL) causa = 'divida';
    else if (cronometro(s, 'naBaixo', v.na < 116, dt) > 30) causa = 'hiponatremia';
    else if (cronometro(s, 'naAlto', v.na > 165, dt) > 45) causa = 'hipernatremia';
    else if (cronometro(s, 'glic', v.glic < 2.2, dt) > 30) causa = 'hipoglicemia';
    if (causa) {
      const C = CAUSAS[causa];
      s.morte = { causa, t: s.t, titulo: C.titulo, porque: C.porque, ritmo: { nome: C.ritmo, parada: true }, retrato: retrato(s) };
      registrar(s, 'ÓBITO — ' + C.titulo + '.', 'morte');
    }
  }

  function retrato(s) {
    const v = s.v;
    return { pam: v.pam, fc: v.fc, sao2: v.sao2, ph: v.ph, paco2: s.paco2, hco3: v.hco3, k: v.k, na: v.na, lac: v.lac, hb: v.hb, do2: v.do2, vo2dem: v.vo2dem, divida: s.divida, pvc: v.pvc, diurese: v.diureseKgH, glic: v.glic };
  }

  function criterios(v) {
    return [
      ['PAM ≥ 65 mmHg', v.pam >= 65],
      ['SatO₂ ≥ 90%', v.sao2 >= 0.9],
      ['Lactato < 2,5 mmol/L', v.lac < 2.5],
      ['pH 7,30–7,50', v.ph >= 7.3 && v.ph <= 7.5],
      ['K⁺ 3,5–5,5 mEq/L', v.k >= 3.5 && v.k <= 5.5],
      ['Na⁺ 132–150 mEq/L', v.na >= 132 && v.na <= 150],
      ['Diurese ≥ 0,5 mL/kg/h ou diálise', v.diureseKgH >= 0.5],
      ['Pplat ≤ 30 cmH₂O', v.pplat <= 30]
    ];
  }

  function darAlta(s) {
    const lista = criterios(s.v).map(([nome, ok]) => ({ nome, ok: ok || (nome.startsWith('Diurese') && !!s.dialise) }));
    const n = lista.filter(x => x.ok).length;
    s.alta = { t: s.t, lista, estabilizado: n === lista.length, n, total: lista.length, retrato: retrato(s) };
    registrar(s, s.alta.estabilizado ? 'Fim do plantão: paciente vivo e estabilizado.' : 'Fim do plantão: paciente vivo, ainda instável (' + n + '/' + lista.length + ').', 'alta');
  }

  function avisos(s) {
    const v = s.v, a = [];
    if (v.pplat > 30) a.push(['vili', 'Pressão de platô > 30 cmH₂O: o volume corrente está lesando o pulmão']);
    if (s.c.fio2 > 0.6) a.push(['fio2', 'FiO₂ > 60% por tempo prolongado: risco de toxicidade do O₂']);
    if (v.pvc > 14) a.push(['cong', 'PVC alta: congestão venosa (rim e pulmão sofrem)']);
    if (v.edema > 0.05) a.push(['edema', 'Edema pulmonar aumentando o shunt']);
    if (v.hb < 7) a.push(['hb', 'Hemoglobina < 7 g/dL: conteúdo arterial de O₂ comprometido']);
    const antigo = s.na24.find(x => s.t - x.t <= 360);
    if (antigo && v.na - antigo.na > 10) a.push(['ods', 'Na⁺ subiu mais de 10 mEq/L no plantão: risco de mielinólise']);
    if (v.ica < 0.9) a.push(['ica', 'Cálcio ionizado baixo: contratilidade e tônus caem']);
    if (s.dz.sangra > 0) a.push(['sangra', 'Sangramento ativo']);
    if (v.adh > 0.7 && v.na < 135) a.push(['adh', 'ADH alto retendo água livre']);
    s.avisos = a;
    if (Math.floor(s.t) % 30 === 0) s.na24.push({ t: s.t, na: v.na });
  }

  function gravarTendencia(s) {
    const v = s.v;
    s.trend.push({ t: s.t, pam: v.pam, fc: v.fc, sat: v.sao2 * 100, lac: v.lac, k: v.k, na: v.na, ph: v.ph, paco2: s.paco2, pao2: v.pao2, pvc: v.pvc, diurese: v.diureseKgH, hb: v.hb, dc: v.dc, divida: s.divida, glic: v.glic, balanco: balanco(s) });
    if (s.trend.length > 500) s.trend.shift();
  }

  function balanco(s) { const b = s.bal; return b.entrada - b.diurese - b.insensivel - b.sangue - b.uf; }

  // ----------------------------------------------------------------- ações
  const ACOES = {
    bolus(s, tipo, ml, minutos) {
      s.fila.push({ tipo, ml, total: ml, taxa: ml / minutos });
      registrar(s, FLUIDOS[tipo].nome + ' ' + ml + ' mL em ' + minutos + ' min.', 'acao');
    },
    furosemida(s) {
      s.eFuro += 1;
      registrar(s, 'Furosemida 40 mg IV.', 'acao');
    },
    calcio(s) {
      s.eCa = Math.min(1.5, s.eCa + 1); s.icaExtra += 0.12;
      registrar(s, 'Gluconato de cálcio 10% 10 mL IV.', 'acao');
    },
    insulinaGlicose(s) {
      s.insDepot += 1;
      s.fila.push({ tipo: 'glic50', ml: 50, total: 50, taxa: 10 });
      registrar(s, 'Insulina regular 10 U + glicose 50% 50 mL.', 'acao');
    },
    glicose(s) {
      s.fila.push({ tipo: 'glic50', ml: 50, total: 50, taxa: 10 });
      registrar(s, 'Glicose 50% 50 mL.', 'acao');
    },
    bicarbonato(s) {
      s.fila.push({ tipo: 'bic', ml: 50, total: 50, taxa: 10 });
      registrar(s, 'Bicarbonato de sódio 8,4% 50 mL (50 mEq).', 'acao');
    },
    antibiotico(s) {
      if (s.antibiotico != null) return;
      s.antibiotico = s.t;
      registrar(s, 'Antibiótico e controle do foco infeccioso.' + (CENARIOS[s.cenario].resolvivel ? '' : ' (Neste caso não muda o curso.)'), 'acao');
    },
    hemostasia(s) {
      if (s.hemostasia != null) return;
      s.hemostasia = s.t;
      registrar(s, CENARIOS[s.cenario].dz.sangra > 0 ? 'Centro cirúrgico acionado: sangramento contido em 20 min.' : 'Hemostasia acionada, mas não há sangramento ativo.', 'acao');
    },
    dialise(s) {
      if (s.dialise) { s.dialise = null; s.c.ufTaxa = 0; registrar(s, 'Hemodiálise interrompida.', 'acao'); return; }
      s.dialise = { inicio: s.t + 30 };
      registrar(s, 'Hemodiálise solicitada: cateter e máquina prontos em 30 min.', 'acao');
    },
    controle(s, chave, valor) {
      const antes = s.c[chave];
      s.c[chave] = valor;
      const nomes = { ne: 'Noradrenalina', dobu: 'Dobutamina', kcl: 'KCl', fio2: 'FiO₂', peep: 'PEEP', vt: 'Volume corrente', fr: 'Frequência respiratória', manutTaxa: 'Infusão contínua', manutTipo: 'Tipo da infusão contínua', ufTaxa: 'Ultrafiltração' };
      if (nomes[chave] && antes !== valor) s._ultimoControle = { chave, nome: nomes[chave], valor, t: s.t };
    }
  };

  function executar(s, acao, ...args) {
    if (s.morte || s.alta) return s;
    ACOES[acao](s, ...args);
    return s;
  }

  return { criar, passo, executar, calcular, CENARIOS, FLUIDOS, CAUSAS, DURACAO, DIVIDA_LETAL, PESO, criterios, balanco, satO2 };
});
