import type { AxisId } from './axes'
import { labStatus, type Labs } from './labs'
import type { Params } from './model'

export type Interpretation = {
  title: string
  tone: 'normal' | 'alerta'
  points: string[]
}

const NORMAL = 'normal'

function thyroid(l: Labs, p: Params): Interpretation {
  const tsh = labStatus('tsh', l.tsh)
  const t4 = labStatus('ft4', l.ft4)
  const t3 = labStatus('t3', l.t3)
  const extra: string[] = []
  if (p.iodine < 0.6) extra.push('Iodo insuficiente limita a organificação da tireoglobulina e a síntese hormonal.')
  if (p.methimazole > 0) extra.push('O metimazol inibe a tireoperoxidase (TPO), reduzindo a síntese de T4/T3.')
  if (l.goiter > 18) extra.push('O estímulo crônico do receptor de TSH (TSH ou TRAb) causa hiperplasia: bócio.')
  if (l.trh > 1.5) extra.push('O TRH elevado também estimula os lactotrofos, podendo elevar a prolactina.')

  if (tsh === 'alto' && t4 === 'baixo')
    return { title: 'Hipotireoidismo primário', tone: 'alerta', points: ['A tireoide produz pouco T4/T3 → menos retroalimentação negativa.', 'Hipotálamo e hipófise respondem com ↑TRH e ↑TSH na tentativa de compensar.', ...extra] }
  if (tsh === 'alto' && t4 === NORMAL)
    return { title: 'Hipotireoidismo subclínico', tone: 'alerta', points: ['O TSH elevado ainda consegue manter o T4 livre dentro da referência.', 'O TSH é o marcador mais sensível porque responde de forma log-linear ao T4.', ...extra] }
  if (tsh === 'alto' && t4 === 'alto')
    return { title: 'TSH inapropriadamente elevado', tone: 'alerta', points: ['T4 alto deveria suprimir o TSH: sugere adenoma tireotrófico ou resistência ao hormônio tireoidiano.', ...extra] }
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
    return { title: 'Hipertireoidismo subclínico', tone: 'alerta', points: ['T4 livre ainda normal, mas já suficiente para suprimir o TSH.', ...extra] }
  if (t4 === 'baixo' && tsh !== 'alto')
    return { title: 'Hipotireoidismo central', tone: 'alerta', points: ['T4 baixo com TSH normal ou baixo: a hipófise (secundário) ou o hipotálamo (terciário) não respondem.', 'Neste caso o TSH não serve para monitorar o tratamento — use o T4 livre.', ...extra] }
  if (t3 === 'baixo' && p.deiodinase < 0.8)
    return { title: 'Síndrome do eutireoidiano doente', tone: 'alerta', points: ['A doença sistêmica reduz a desiodação de T4 em T3 nos tecidos.', 'T3 cai primeiro; T4 e TSH costumam permanecer normais.', ...extra] }
  return {
    title: 'Eixo tireoidiano em equilíbrio',
    tone: 'normal',
    points: ['TRH estimula TSH, que estimula a captação de iodo e a síntese de T4 (≈90%) e T3.', 'T4 é convertido em T3 (forma ativa) pelas desiodases; T3/T4 inibem TRH e TSH.', ...extra],
  }
}

function adrenal(l: Labs, p: Params): Interpretation {
  const acth = labStatus('acth', l.acth)
  const cort = labStatus('cortisol', l.cortisol)
  if (cort === 'baixo' && acth === 'alto')
    return { title: 'Insuficiência adrenal primária', tone: 'alerta', points: ['O córtex adrenal não responde → ↓cortisol → ↑CRH e ↑ACTH.', 'ACTH alto (derivado da POMC, assim como o α-MSH) causa hiperpigmentação.'] }
  if (cort === 'baixo' && p.exoGlucocorticoid > 0)
    return { title: l.gcActivity > 180 ? 'Cushing iatrogênico com eixo suprimido' : 'Eixo suprimido por corticoide exógeno', tone: 'alerta', points: ['O corticoide exógeno exerce retroalimentação negativa: ↓CRH e ↓ACTH.', 'O cortisol sérico (endógeno) cai, mas o efeito glicocorticoide total pode estar alto.', 'Sem ACTH, as adrenais atrofiam — a retirada abrupta causa crise adrenal.'] }
  if ((cort === 'baixo' || l.adrenalMass < 70) && l.adrenalMass < 80)
    return { title: 'Recuperação de adrenal atrofiada', tone: 'alerta', points: ['O ACTH sobe, mas as adrenais atrofiadas respondem pouco.', 'A massa adrenal se recupera lentamente sob o efeito trófico do ACTH (semanas).'] }
  if (cort === 'baixo')
    return { title: 'Insuficiência adrenal central', tone: 'alerta', points: ['Cortisol baixo sem ACTH elevado: falha hipofisária ou hipotalâmica.', 'Sem hiperpigmentação, pois o ACTH está baixo.'] }
  if (cort === 'alto' && p.ectopicActh > 0)
    return { title: 'Cushing por ACTH ectópico', tone: 'alerta', points: ['O tumor produz ACTH sem retroalimentação — o cortisol alto não suprime a fonte.', 'CRH e ACTH hipofisário são suprimidos, mas o ACTH total segue alto.'] }
  if (cort === 'alto' || l.crh > 1.5)
    return { title: 'Resposta ao estresse', tone: 'alerta', points: ['O estresse ativa o CRH e redefine o set point do eixo para cima.', 'A retroalimentação negativa continua presente, mas em um nível mais alto.'] }
  if (l.gcActivity > 180)
    return { title: 'Excesso de glicocorticoide', tone: 'alerta', points: ['Efeito glicocorticoide total elevado.'] }
  return { title: 'Eixo adrenal em equilíbrio', tone: 'normal', points: ['CRH (potencializado pelo ADH) estimula a clivagem da POMC em ACTH.', 'ACTH estimula a síntese de cortisol; o cortisol inibe CRH e ACTH.'] }
}

function gonadal(l: Labs, p: Params): Interpretation {
  const lh = labStatus('lh', l.lh)
  const t = labStatus('testo', l.testo)
  if (p.gnrhAgonist > 0.2 && l.gnrhR > 50)
    return { title: 'Flare do agonista de GnRH', tone: 'alerta', points: ['No início, o agonista estimula fortemente os receptores: LH, FSH e testosterona sobem.', 'Com a exposição contínua, os receptores são internalizados (down-regulation).'] }
  if (p.gnrhAgonist > 0.2)
    return { title: 'Dessensibilização por GnRH contínuo', tone: 'alerta', points: ['GnRH não pulsátil causa down-regulation dos receptores dos gonadotrofos.', 'LH, FSH e testosterona caem — base da "castração química".'] }
  if (t === 'baixo' && lh === 'alto')
    return { title: 'Hipogonadismo primário (hipergonadotrófico)', tone: 'alerta', points: ['A falência testicular reduz testosterona e inibina B.', 'Sem retroalimentação, LH e FSH sobem.'] }
  if (p.exoTestosterone > 0 && lh !== 'alto')
    return { title: 'Supressão por androgênio exógeno', tone: 'alerta', points: ['A testosterona exógena inibe GnRH e LH.', 'Com LH e FSH baixos, a produção testicular e a espermatogênese caem (atrofia testicular, infertilidade).'] }
  if (t === 'baixo' && l.prl > 23)
    return { title: 'Hipogonadismo por hiperprolactinemia', tone: 'alerta', points: ['A prolactina elevada inibe os pulsos de GnRH (via kisspeptina).', 'LH e FSH ficam baixos ou inapropriadamente normais.'] }
  if (t === 'baixo')
    return { title: 'Hipogonadismo hipogonadotrófico', tone: 'alerta', points: ['Testosterona baixa com LH/FSH baixos ou normais: defeito hipotalâmico ou hipofisário.', p.gnrhDrive < 0.3 ? 'Na síndrome de Kallmann, os neurônios de GnRH não migram (associada a anosmia).' : 'Pode ocorrer por lesão hipofisária, estresse ou desnutrição.'] }
  return { title: 'Eixo gonadal em equilíbrio', tone: 'normal', points: ['GnRH pulsátil estimula LH (Leydig → testosterona) e FSH (Sertoli → inibina B, espermatogênese).', 'Testosterona inibe GnRH/LH; inibina B inibe seletivamente o FSH.'] }
}

function growth(l: Labs, p: Params): Interpretation {
  const gh = labStatus('gh', l.gh)
  const igf = labStatus('igf1', l.igf1)
  if (igf === 'alto')
    return { title: 'Excesso de GH (acromegalia)', tone: 'alerta', points: ['O adenoma somatotrófico secreta GH de forma autônoma.', 'IGF-1 alto estimula somatostatina, mas não consegue suprimir o tumor.', 'O IGF-1 é o melhor marcador de rastreio: meia-vida longa e níveis estáveis.'] }
  if (igf === 'baixo' && gh !== 'baixo' && l.gh > 1.5)
    return { title: 'Resistência ao GH (Laron)', tone: 'alerta', points: ['O fígado não responde ao GH e produz pouco IGF-1.', 'Sem retroalimentação do IGF-1, GH fica elevado.'] }
  if (igf === 'baixo')
    return { title: 'Deficiência de GH', tone: 'alerta', points: ['GH baixo → IGF-1 baixo.', l.t3 < 80 ? 'O hipotireoidismo também reduz a secreção de GH.' : 'Em crianças causa baixa estatura; em adultos, alteração da composição corporal.'] }
  return { title: 'Eixo GH/IGF-1 em equilíbrio', tone: 'normal', points: ['GHRH estimula e somatostatina inibe o GH.', 'GH estimula IGF-1 hepático; IGF-1 inibe GH e estimula a somatostatina.'] }
}

function prolactin(l: Labs, p: Params): Interpretation {
  const prl = labStatus('prl', l.prl)
  const hypogonad = 'Prolactina alta inibe GnRH → hipogonadismo, galactorreia e infertilidade.'
  if (prl === 'alto') {
    if (p.prolactinoma > 0) return { title: 'Prolactinoma', tone: 'alerta', points: ['O adenoma secreta prolactina sem depender do hipotálamo.', 'A dopamina sobe pela alça curta, mas não suprime o tumor (agonistas D2 como cabergolina, sim).', hypogonad] }
    if (p.d2Blockade > 0.3) return { title: 'Hiperprolactinemia por bloqueio D2', tone: 'alerta', points: ['Antipsicóticos e metoclopramida bloqueiam o receptor D2 dos lactotrofos.', 'Sem a inibição dopaminérgica, a prolactina sobe.', hypogonad] }
    if (p.stalk < 0.6) return { title: 'Efeito haste', tone: 'alerta', points: ['A lesão da haste interrompe a dopamina portal → prolactina sobe.', 'Os demais hormônios adeno-hipofisários caem por falta dos hormônios liberadores.', 'Pode haver diabetes insípido pela interrupção dos axônios magnocelulares.'] }
    if (p.suckling > 0.2) return { title: 'Hiperprolactinemia fisiológica (lactação)', tone: 'normal', points: ['A sucção inibe a dopamina e estimula a prolactina (lactogênese).', 'Simultaneamente libera ocitocina (ejeção do leite).', 'A inibição do GnRH explica a amenorreia lactacional.'] }
    return { title: 'Hiperprolactinemia', tone: 'alerta', points: [l.trh > 1.5 ? 'TRH elevado (hipotireoidismo primário) estimula os lactotrofos.' : 'Causa secundária de hiperprolactinemia.', hypogonad] }
  }
  if (prl === 'baixo')
    return { title: 'Hipoprolactinemia', tone: 'alerta', points: ['Falência adeno-hipofisária: a prolactina é o único hormônio que cai pela perda das células, não do estímulo.', 'Na síndrome de Sheehan, a agalactia pós-parto costuma ser o primeiro sinal.'] }
  return { title: 'Prolactina sob controle dopaminérgico', tone: 'normal', points: ['É o único hormônio adeno-hipofisário sob controle predominantemente inibitório.', 'A dopamina (neurônios TIDA) inibe a prolactina via receptor D2; TRH e sucção estimulam.'] }
}

function neuro(l: Labs, p: Params): Interpretation {
  const na = labStatus('na', l.na)
  const extra: string[] = []
  if (l.contraction > 60) extra.push('Parto: estiramento cervical → ocitocina → contração → mais estiramento (retroalimentação positiva).')
  if (l.milk > 30) extra.push('Reflexo de ejeção: a sucção libera ocitocina, que contrai as células mioepiteliais.')

  if (p.renalAdhSensitivity < 0.5 && l.urine > 3)
    return { title: 'Diabetes insípido nefrogênico', tone: 'alerta', points: ['ADH elevado, mas o rim não responde (receptor V2/aquaporina-2).', 'Urina diluída e poliúria; desmopressina não corrige.', ...extra] }
  if (l.adh < 0.8 && l.urine > 3 && na !== 'baixo')
    return { title: 'Diabetes insípido central', tone: 'alerta', points: ['Pouco ADH → aquaporina-2 não é inserida → urina diluída e poliúria.', na === 'alto' ? 'Sem ingestão suficiente, a perda de água livre causa hipernatremia.' : 'A sede compensa a perda de água e mantém o sódio próximo do normal.', 'Responde à desmopressina (análogo do ADH).', ...extra] }
  if (na === 'baixo' && p.ectopicAdh > 0)
    return { title: 'SIADH', tone: 'alerta', points: ['ADH não suprimido apesar da hipo-osmolalidade.', 'Retenção de água livre → hiponatremia euvolêmica com urina concentrada.', ...extra] }
  if (na === 'baixo' && p.bloodVolume < 0.9)
    return { title: 'Hiponatremia hipovolêmica', tone: 'alerta', points: ['Barorreceptores estimulam ADH mesmo com osmolalidade baixa.', 'Na hipovolemia, a defesa do volume tem prioridade sobre a osmolalidade.', ...extra] }
  if (p.waterAccess > 1.5)
    return { title: 'Polidipsia primária', tone: 'alerta', points: ['A ingestão excessiva dilui o plasma e suprime o ADH.', 'Urina máxima diluída: diferente do DI, a osmolalidade plasmática fica baixa.', ...extra] }
  if (p.bloodVolume < 0.9)
    return { title: 'Resposta à hipovolemia', tone: 'alerta', points: ['Barorreceptores (átrio, carótida) reduzem a inibição do ADH.', 'ADH retém água e, em altas doses, causa vasoconstrição (V1).', ...extra] }
  if (na === 'alto')
    return { title: 'Hipernatremia', tone: 'alerta', points: ['Perda de água livre maior que a ingestão.', ...extra] }
  if (extra.length) return { title: 'Ação da ocitocina', tone: 'normal', points: extra }
  return { title: 'Osmorregulação em equilíbrio', tone: 'normal', points: ['Osmorreceptores detectam ↑osmolalidade → ADH é liberado pela neuro-hipófise.', 'ADH insere aquaporina-2 no ducto coletor → reabsorção de água → osmolalidade volta ao normal.'] }
}

export function interpret(axis: AxisId, labs: Labs, params: Params): Interpretation {
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
