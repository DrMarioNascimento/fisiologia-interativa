import { labStatus } from './labs.js?v=20261018-audit2';




                              
               
                           
                  
 

const NORMAL = 'normal'

function thyroid(l      , p        )                 {
  const tsh = labStatus('tsh', l.tsh)
  const t4 = labStatus('ft4', l.ft4)
  const t3 = labStatus('t3', l.t3)
  const extra           = []
  if (p.iodine < 0.6) extra.push('Iodo insuficiente limita a organificação da tireoglobulina e a síntese hormonal.')
  if (p.methimazole > 0) extra.push('O metimazol inibe a tireoperoxidase (TPO), reduzindo a síntese de T4/T3.')
  if (l.goiter > 18) extra.push('O estímulo crônico do receptor de TSH (TSH ou TRAb) causa hiperplasia: bócio.')
  if (l.trh > 1.5) extra.push('O TRH elevado também estimula os lactotrofos, podendo elevar a prolactina.')

  const centralLesion = p.adenoFn < 0.7 || p.stalk < 0.7 || p.thyrotropeFn < 0.7 || p.trhDrive < 0.5
  if (t3 === 'baixo' && p.deiodinase < 0.8 && p.thyroidFn >= 0.7 && p.iodine >= 0.6 && p.methimazole === 0)
    return { title: p.trhDrive < 1 ? 'Síndrome do eutireoidiano doente' : 'Conversão periférica de T4 em T3 reduzida', tone: 'alerta', points: ['T3 baixo com conversão reduzida; T4 e TSH dependem também do estímulo central e do tempo.', 'Este padrão não demonstra, isoladamente, falência primária da tireoide.', ...extra] }
  if (centralLesion && tsh !== 'alto' && t4 !== 'alto' && t3 !== 'alto')
    return { title: l.ft4 < 1.1 ? 'Hipotireoidismo central' : 'Redução do estímulo central — resposta em evolução', tone: 'alerta', points: ['O estímulo central foi reduzido; TSH pode cair antes de T4.', 'Não confundir a fase inicial, com T4 ainda preservado, com hipertireoidismo subclínico. Compare o tempo e as variáveis.', ...extra] }

  if (tsh === 'alto' && t4 === 'baixo')
    return { title: 'Hipotireoidismo primário', tone: 'alerta', points: ['A tireoide produz pouco T4/T3 → menos retroalimentação negativa.', 'Hipotálamo e hipófise respondem com ↑TRH e ↑TSH na tentativa de compensar.', ...extra] }
  if (tsh === 'alto' && t4 === NORMAL)
    return { title: 'Hipotireoidismo subclínico', tone: 'alerta', points: ['O TSH elevado ainda consegue manter o T4 livre dentro da referência.', 'O TSH é o marcador mais sensível porque responde de forma log-linear ao T4.', ...extra] }
  if (tsh === 'alto' && t4 === 'alto')
    return { title: 'T4 e TSH simultaneamente elevados', tone: 'alerta', points: ['Pode haver atraso na supressão de TSH após uma intervenção ou combinação de estímulos; acompanhe a evolução.', 'Este modelo não demonstra adenoma tireotrófico ou resistência hormonal.', ...extra] }
  if (tsh === 'baixo' && (t4 === 'alto' || t3 === 'alto')) {
    const points =
      p.trab > 0
        ? ['O TRAb ativa o receptor de TSH independentemente do TSH.', 'O excesso de T4/T3 suprime TRH e TSH por retroalimentação negativa.']
        : p.levothyroxine > 0
          ? ['T4 exógeno em excesso suprime TRH e TSH.', 'Sem TSH, a própria tireoide reduz a produção e diminui de volume.']
          : ['Excesso de hormônio tireoidiano suprime TRH e TSH.']
    return { title: p.trab > 0 ? 'Hipertireoidismo (Graves)' : 'Tireotoxicose', tone: 'alerta', points: [...points, ...extra] }
  }
  if (tsh === 'baixo' && t4 === NORMAL)
    return { title: t3 === 'baixo' ? 'TSH e T3 reduzidos — padrão combinado' : 'Hipertireoidismo subclínico', tone: 'alerta', points: ['TSH baixo com T4 na faixa: confira T3, estímulo central e tempo; o padrão isolado não estabelece diagnóstico.', ...extra] }
  if (tsh !== 'alto' && (t4 === 'baixo' || (centralLesion && l.ft4 < 1.1)))
    return { title: 'Hipotireoidismo central', tone: 'alerta', points: ['T4 livre baixo ou normal-baixo com TSH inapropriadamente normal ou baixo: a hipófise (secundário) ou o hipotálamo (terciário) não respondem.', 'Neste caso o TSH não serve para monitorar o tratamento — use o T4 livre.', ...extra] }
  if (t3 === 'baixo' && p.deiodinase < 0.8)
    return { title: 'Síndrome do eutireoidiano doente', tone: 'alerta', points: ['A doença sistêmica reduz a desiodação de T4 em T3 nos tecidos.', 'T3 cai primeiro; T4 e TSH costumam permanecer normais.', ...extra] }
  return {
    title: 'Eixo tireoidiano em equilíbrio',
    tone: 'normal',
    points: ['TRH estimula TSH, que estimula a captação de iodo e a síntese de T4 (≈90%) e T3.', 'T4 é convertido em T3 (forma ativa) pelas desiodases; T3/T4 inibem TRH e TSH.', ...extra],
  }
}

function adrenal(l      , p        )                 {
  const acth = labStatus('acth', l.acth)
  const cort = labStatus('cortisol', l.cortisol)
  const centralLesion = p.adenoFn < 0.7 || p.stalk < 0.7 || p.corticotropeFn < 0.7

  if (p.exoGlucocorticoid > 0)
    return { title: l.gcActivity > 180 ? 'Cushing iatrogênico com eixo suprimido' : 'Exposição a glicocorticoide exógeno', tone: 'alerta', points: ['A atividade total inclui a fonte exógena; o cortisol sérico indica apenas produção endógena.', 'CRH e ACTH tendem a cair; a supressão e a atrofia se desenvolvem com o tempo.', ...(p.adrenalFn < 0.5 ? ['Há também perda de função do córtex: o padrão combina mais de uma alteração.'] : [])] }
  if (centralLesion && acth !== 'alto' && l.cortisol >= 8)
    return { title: 'Redução do estímulo de ACTH — resposta em evolução', tone: 'alerta', points: ['ACTH pode cair antes de o cortisol sair da faixa; não confundir falha central com estresse.'] }
  if (acth === 'alto' && cort === 'baixo')
    return { title: 'Insuficiência adrenal primária', tone: 'alerta', points: ['O córtex adrenal não responde → ↓cortisol → ↑CRH e ↑ACTH.', 'ACTH alto (derivado da POMC, assim como o α-MSH) causa hiperpigmentação.'] }
  if (cort === 'baixo' && p.exoGlucocorticoid > 0)
    return { title: l.gcActivity > 180 ? 'Cushing iatrogênico com eixo suprimido' : 'Eixo suprimido por corticoide exógeno', tone: 'alerta', points: ['O corticoide exógeno exerce retroalimentação negativa: ↓CRH e ↓ACTH.', 'O cortisol sérico (endógeno) cai, mas o efeito glicocorticoide total pode estar alto.', 'Sem ACTH, as adrenais atrofiam — a retirada abrupta causa crise adrenal.'] }
  if (!centralLesion && (cort === 'baixo' || l.adrenalMass < 70) && l.adrenalMass < 80)
    return { title: 'Recuperação de adrenal atrofiada', tone: 'alerta', points: ['O ACTH sobe, mas as adrenais atrofiadas respondem pouco.', 'A massa adrenal se recupera lentamente sob o efeito trófico do ACTH (semanas).'] }
  if (acth !== 'alto' && (cort === 'baixo' || (centralLesion && l.cortisol < 8)))
    return { title: 'Insuficiência adrenal central', tone: 'alerta', points: ['Cortisol baixo ou normal-baixo sem ACTH elevado: falha hipofisária ou hipotalâmica.', 'Sem hiperpigmentação, pois o ACTH não sobe.'] }
  if (p.ectopicActh > 0)
    return { title: cort === 'alto' ? 'Cushing por ACTH ectópico' : 'ACTH ectópico — resposta adrenal em evolução', tone: 'alerta', points: ['O tumor produz ACTH sem retroalimentação — o cortisol alto não suprime a fonte.', 'CRH e ACTH hipofisário são suprimidos, mas o ACTH total segue alto.'] }
  if (p.stress > 1.2 && (cort === 'alto' || l.crh > 1.5))
    return { title: 'Resposta ao estresse', tone: 'alerta', points: ['O estresse ativa o CRH e redefine o set point do eixo para cima.', 'A retroalimentação negativa continua presente, mas em um nível mais alto.'] }
  if (l.gcActivity > 180)
    return { title: 'Excesso de glicocorticoide', tone: 'alerta', points: ['Efeito glicocorticoide total elevado.'] }
  return { title: 'Eixo adrenal em equilíbrio', tone: 'normal', points: ['CRH (potencializado pelo ADH) estimula a clivagem da POMC em ACTH.', 'ACTH estimula a síntese de cortisol; o cortisol inibe CRH e ACTH.'] }
}

function gonadal(l      , p        )                 {
  const lh = labStatus('lh', l.lh)
  const t = labStatus('testo', l.testo)
  if (p.gnrhAgonist > 0.2 && l.gnrhR > 50)
    return { title: 'Flare do agonista de GnRH', tone: 'alerta', points: ['No início, o agonista estimula fortemente os receptores: LH, FSH e testosterona sobem.', 'Com a exposição contínua, os receptores são internalizados (down-regulation).'] }
  if (p.gnrhAgonist > 0.2)
    return { title: 'Dessensibilização por GnRH contínuo', tone: 'alerta', points: ['GnRH não pulsátil causa down-regulation dos receptores dos gonadotrofos.', 'LH, FSH e testosterona caem — base da "castração química".'] }
  if (t === 'baixo' && lh === 'alto')
    return { title: 'Hipogonadismo primário (hipergonadotrófico)', tone: 'alerta', points: ['A falência testicular reduz testosterona e inibina B.', 'Sem retroalimentação, LH e FSH sobem.'] }
  if (p.exoTestosterone > 0 && lh !== 'alto')
    return { title: 'Supressão por androgênio exógeno', tone: 'alerta', points: ['A testosterona exógena inibe GnRH e LH.', 'LH/FSH baixos tendem a reduzir a produção endógena. O modelo não mede espermatogênese, volume testicular ou fertilidade.'] }
  if (t === 'baixo' && l.prl > 23)
    return { title: 'Hipogonadismo por hiperprolactinemia', tone: 'alerta', points: ['A prolactina elevada inibe os pulsos de GnRH (via kisspeptina).', 'LH e FSH ficam baixos ou inapropriadamente normais.'] }
  if (t === 'baixo')
    return { title: 'Hipogonadismo hipogonadotrófico', tone: 'alerta', points: ['Testosterona baixa com LH/FSH baixos ou normais: defeito hipotalâmico ou hipofisário.', p.gnrhDrive < 0.3 ? 'Na síndrome de Kallmann, os neurônios de GnRH não migram (associada a anosmia).' : 'Pode ocorrer por lesão hipofisária, estresse ou desnutrição.'] }
  return { title: 'Eixo gonadal em equilíbrio', tone: 'normal', points: ['GnRH pulsátil estimula LH (Leydig → testosterona) e FSH (Sertoli → inibina B, espermatogênese).', 'Testosterona inibe GnRH/LH; inibina B inibe seletivamente o FSH.'] }
}

function growth(l      , p        )                 {
  const gh = labStatus('gh', l.gh)
  const igf = labStatus('igf1', l.igf1)
  if (igf === 'alto' && p.ghTumor <= 0)
    return { title: 'IGF-1 elevado — maior atividade do eixo', tone: 'alerta', points: ['Os estímulos combinados aumentaram IGF-1. Não há fonte tumoral configurada; o modelo não permite inferir acromegalia.', 'A faixa é ilustrativa e não ajustada por idade.'] }
  if (igf === 'alto')
    return { title: 'Excesso de GH (acromegalia)', tone: 'alerta', points: ['O adenoma somatotrófico secreta GH de forma autônoma.', 'IGF-1 alto estimula somatostatina, mas não consegue suprimir o tumor.', 'O IGF-1 é o melhor marcador de rastreio: meia-vida longa e níveis estáveis.'] }
  if (igf === 'baixo' && p.liverIgf < 0.6 && gh !== 'baixo' && l.gh > 1.5)
    return { title: 'Resistência ao GH (Laron)', tone: 'alerta', points: ['O fígado não responde ao GH e produz pouco IGF-1.', 'Sem retroalimentação do IGF-1, GH fica elevado.'] }
  if (igf === 'baixo' && l.gh >= 0.5)
    return { title: 'IGF-1 reduzido — resposta em evolução ou combinação de fatores', tone: 'alerta', points: ['IGF-1 baixo isolado não demonstra deficiência de GH. Compare GH, resposta hepática e evolução.'] }
  if (igf === 'baixo')
    return { title: 'Deficiência de GH', tone: 'alerta', points: ['GH baixo → IGF-1 baixo.', l.t3 < 80 ? 'O hipotireoidismo também reduz a secreção de GH.' : 'Em crianças causa baixa estatura; em adultos, alteração da composição corporal.'] }
  return { title: 'Eixo GH/IGF-1 em equilíbrio', tone: 'normal', points: ['GHRH estimula e somatostatina inibe o GH.', 'GH estimula IGF-1 hepático; IGF-1 inibe GH e estimula a somatostatina.'] }
}

function prolactin(l      , p        )                 {
  const prl = labStatus('prl', l.prl)
  const hypogonad = 'Prolactina elevada pode reduzir o estímulo de GnRH; a intensidade depende do contexto. A simulação não mede fertilidade.'
  if (prl === 'alto') {
    if (p.prolactinoma > 0) return { title: 'Prolactinoma', tone: 'alerta', points: ['O adenoma secreta prolactina sem depender do hipotálamo.', 'A dopamina sobe pela alça curta, mas não suprime o tumor (agonistas D2 como cabergolina, sim).', hypogonad] }
    if (p.d2Blockade > 0.3) return { title: 'Hiperprolactinemia por bloqueio D2', tone: 'alerta', points: ['Antipsicóticos e metoclopramida bloqueiam o receptor D2 dos lactotrofos.', 'Sem a inibição dopaminérgica, a prolactina sobe.', hypogonad] }
    if (p.stalk < 0.6) return { title: 'Efeito haste', tone: 'alerta', points: ['A lesão da haste interrompe a dopamina portal → prolactina sobe.', 'Os demais hormônios adeno-hipofisários caem por falta dos hormônios liberadores.', 'Pode haver diabetes insípido pela interrupção dos axônios magnocelulares.'] }
    if (p.suckling > 0.2) return { title: 'Hiperprolactinemia fisiológica (lactação)', tone: 'normal', points: ['A sucção inibe a dopamina e estimula a prolactina (lactogênese).', 'Simultaneamente libera ocitocina (ejeção do leite).', 'A inibição de GnRH é ilustrada por um módulo gonadal masculino. Este simulador não reproduz ciclo ovariano ou amenorreia.'] }
    return { title: 'Hiperprolactinemia', tone: 'alerta', points: [l.trh > 1.5 ? 'TRH elevado (hipotireoidismo primário) estimula os lactotrofos.' : 'Causa secundária de hiperprolactinemia.', hypogonad] }
  }
  if (prl === 'baixo')
    return { title: 'Hipoprolactinemia', tone: 'alerta', points: ['Falência adeno-hipofisária: a perda dos lactotrofos reduz a prolactina, mesmo com menos dopamina inibindo.', 'Na síndrome de Sheehan, a agalactia pós-parto costuma ser o primeiro sinal.'] }
  return { title: 'Prolactina sob controle dopaminérgico', tone: 'normal', points: ['É o único hormônio adeno-hipofisário sob controle predominantemente inibitório.', 'A dopamina (neurônios TIDA) inibe a prolactina via receptor D2; TRH e sucção estimulam.'] }
}

function neuro(l      , p        )                 {
  const poorSecretion = p.magnocellularFn * p.stalk < 0.5
  const poorResponse = p.renalAdhSensitivity < 0.5
  const polyuria = l.urine > 3 && l.uosm < 300
  if (Math.abs(l.waterBalance) > 0.01 && (l.tbw <= 28.00000001 || l.tbw >= 59.99999999))
    return { title: 'Limite do compartimento hídrico atingido', tone: 'alerta', points: ['A água corporal chegou ao limite com balanço diferente de zero. O avanço foi interrompido: isto não é equilíbrio fisiológico.'] }
  if (polyuria && poorSecretion && poorResponse)
    return { title: 'Deficiência e resistência combinadas ao ADH', tone: 'alerta', points: ['Há comprometimento simultâneo da secreção/transporte e da resposta renal; não atribuir o efeito a uma única causa.'] }
  if (polyuria && poorResponse)
    return { title: 'Diabetes insípido nefrogênico', tone: 'alerta', points: ['A resposta renal está reduzida: persiste urina diluída apesar do estímulo de ADH.', 'A compensação depende da capacidade residual e da água disponível.'] }
  if (polyuria && poorSecretion)
    return { title: 'Diabetes insípido central', tone: 'alerta', points: ['A secreção/transporte de ADH está comprometida: poliúria hipotônica.', l.na > 145 ? 'A ingestão não compensou as perdas; o sódio está elevado.' : 'A ingestão compensatória mantém o sódio próximo da faixa.'] }
  if (p.bloodVolume < 0.9)
    return { title: l.na < 135 ? 'Hiponatremia hipovolêmica' : 'Resposta à hipovolemia', tone: 'alerta', points: ['O volume efetivo reduzido estimula ADH mesmo se a osmolalidade cair.', 'O volume é um estímulo imposto e sustentado: não há retirada de sangue ou recuperação de volume sanguíneo neste modelo.', ...(p.ectopicAdh > 0 ? ['Também há uma fonte não regulada de ADH, somada ao estímulo de volume.'] : [])] }
  if (p.ectopicAdh > 0 && l.uosm > 100)
    return { title: l.na < 135 && l.posm < 275 ? 'SIADH' : 'ADH inapropriado — retenção hídrica em evolução', tone: 'alerta', points: ['A fonte não osmótica sustenta ADH; a queda de osmolalidade não a suprime.', 'A urina permanece concentrada. O sódio pode ainda estar na faixa na fase inicial.', ...(p.waterAccess > 1.5 ? ['Ingestão elevada agrava a retenção quando o ADH não é suprimido.'] : [])] }
  if (p.waterAccess > 1.5 && !poorSecretion && !poorResponse)
    return { title: 'Polidipsia primária', tone: 'alerta', points: ['A ingestão aumentada favorece diluição, supressão de ADH e diurese aquosa; os efeitos podem estar em desenvolvimento.', 'Secreção de ADH e resposta renal estão preservadas neste experimento.'] }
  if (l.na > 145) return { title: 'Hipernatremia', tone: 'alerta', points: ['A ingestão não acompanha as perdas de água. Confira oferta, secreção de ADH e resposta renal.'] }
  if (l.na < 135) return { title: 'Hiponatremia — padrão combinado', tone: 'alerta', points: ['Há diluição do sódio neste modelo de solutos constantes; ele não determina etiologia clínica nem volemia real.'] }
  if (poorSecretion || poorResponse)
    return { title: 'Comprometimento do eixo ADH — resposta em evolução', tone: 'alerta', points: ['A alteração pode preceder poliúria ou produzir resposta parcial. Compare ADH, osmolalidade urinária e balanço hídrico.'] }
  if (l.contraction > 60)
    return { title: 'Ação da ocitocina', tone: 'normal', points: ['O reflexo de Ferguson amplifica as contrações. O modelo representa atividade média, sem pulsos ou nascimento.'] }
  if (Math.abs(l.waterBalance) > 0.05)
    return { title: 'Ajuste do balanço hídrico em andamento', tone: 'normal', points: ['Entradas e saídas ainda diferem; observe água corporal, osmolalidade e ADH.'] }
  return { title: 'Osmorregulação em equilíbrio', tone: 'normal', points: ['ADH favorece inserção de aquaporina-2 e reabsorção renal de água.', 'O balanço inclui ingestão, urina e 0,8 L/dia de perdas insensíveis. Sódio é estimado pela osmolalidade com outros solutos constantes.'] }
}

export function interpret(axis        , labs      , params        )                 {
  switch (axis) {
    case 'tireoide':
      return thyroid(labs, params)
    case 'adrenal':
      return adrenal(labs, params)
    case 'gonadas':
      return gonadal(labs, params)
    case 'gh':
      return growth(labs, params)
    case 'prolactina':
      return prolactin(labs, params)
    case 'neuro':
      return neuro(labs, params)
  }
}

