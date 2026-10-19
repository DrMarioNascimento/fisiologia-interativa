


                                                                                       

                        
               
              
             
             
              
                                                               
 

export const PARAM_DEFS                             = {
  adenoFn: { label: 'Função adeno-hipofisária global', hint: 'Reduza para simular pan-hipopituitarismo (Sheehan).', min: 0, max: 1.5, step: 0.01, format: 'percent' },
  stalk: { label: 'Integridade da haste hipofisária', hint: 'Transporte portal de hormônios hipotalâmicos e dopamina.', min: 0, max: 1, step: 0.01, format: 'percent' },

  trhDrive: { label: 'Estímulo hipotalâmico de TRH', hint: 'Frio ↑ · doença grave/jejum ↓', min: 0, max: 3, step: 0.05, format: 'multiplier' },
  thyrotropeFn: { label: 'Função dos tireotrofos', hint: 'Células da adeno-hipófise que secretam TSH.', min: 0, max: 1.5, step: 0.01, format: 'percent' },
  thyroidFn: { label: 'Massa funcional da tireoide', hint: 'Capacidade funcional; alterar o controle preserva as reservas anteriores.', min: 0, max: 1.5, step: 0.01, format: 'percent' },
  iodine: { label: 'Disponibilidade de iodo', hint: 'Necessário para organificação da tireoglobulina.', min: 0, max: 2, step: 0.01, format: 'percent' },
  trab: { label: 'TRAb estimulador (Graves)', hint: 'Anticorpo que ativa o receptor de TSH.', min: 0, max: 4, step: 0.05, format: 'multiplier' },
  methimazole: { label: 'Metimazol (bloqueio da TPO)', hint: 'Inibe a síntese de T4/T3.', min: 0, max: 0.95, step: 0.01, format: 'percent' },
  deiodinase: { label: 'Atividade das desiodases (T4→T3)', hint: 'D1/D2 convertem T4 em T3 ativo.', min: 0.1, max: 1.5, step: 0.01, format: 'percent' },
  levothyroxine: { label: 'Levotiroxina (T4 exógeno)', hint: 'Entrada normalizada de T4, sem equivalência de dose clínica.', min: 0, max: 3, step: 0.05, format: 'dose' },

  stress: { label: 'Estresse (estímulo de CRH)', hint: 'Dor, cirurgia, infecção, hipoglicemia ↑', min: 0.2, max: 3, step: 0.05, format: 'multiplier' },
  corticotropeFn: { label: 'Função dos corticotrofos', hint: 'Células que clivam POMC em ACTH.', min: 0, max: 1.5, step: 0.01, format: 'percent' },
  adrenalFn: { label: 'Função do córtex adrenal', hint: 'Addison (autoimune, TB) ↓', min: 0, max: 1.5, step: 0.01, format: 'percent' },
  ectopicActh: { label: 'ACTH ectópico (tumor)', hint: 'Não sofre retroalimentação negativa.', min: 0, max: 8, step: 0.1, format: 'multiplier' },
  exoGlucocorticoid: { label: 'Glicocorticoide exógeno', hint: 'Prednisona/dexametasona; não medido no cortisol sérico.', min: 0, max: 4, step: 0.05, format: 'dose' },

  gnrhDrive: { label: 'Pulsos de GnRH', hint: 'Kallmann, anorexia, exercício intenso ↓', min: 0, max: 2, step: 0.01, format: 'multiplier' },
  gonadotropeFn: { label: 'Função dos gonadotrofos', hint: 'Células que secretam LH e FSH.', min: 0, max: 1.5, step: 0.01, format: 'percent' },
  gnrhAgonist: { label: 'Agonista contínuo de GnRH', hint: 'Leuprorrelina: flare e depois supressão.', min: 0, max: 1, step: 0.01, format: 'percent' },
  testicularFn: { label: 'Função testicular', hint: 'Leydig (testosterona) e Sertoli (inibina).', min: 0, max: 1.5, step: 0.01, format: 'percent' },
  exoTestosterone: { label: 'Testosterona exógena', hint: 'Anabolizantes / reposição.', min: 0, max: 4, step: 0.05, format: 'dose' },

  ghrhDrive: { label: 'Estímulo de GHRH', hint: 'Sono profundo, exercício, hipoglicemia ↑', min: 0, max: 3, step: 0.05, format: 'multiplier' },
  somatostatinTone: { label: 'Tônus de somatostatina', hint: 'Hiperglicemia ↑ · inibe GH (e TSH).', min: 0.1, max: 3, step: 0.05, format: 'multiplier' },
  somatotropeFn: { label: 'Função dos somatotrofos', hint: 'Células que secretam GH.', min: 0, max: 1.5, step: 0.01, format: 'percent' },
  liverIgf: { label: 'Resposta hepática ao GH', hint: 'Receptor de GH / produção de IGF-1.', min: 0, max: 1.5, step: 0.01, format: 'percent' },
  ghTumor: { label: 'Adenoma secretor de GH', hint: 'Secreção autônoma (acromegalia).', min: 0, max: 15, step: 0.1, format: 'multiplier' },

  dopamineTone: { label: 'Tônus dopaminérgico (TIDA)', hint: 'Neurônios tuberoinfundibulares inibem PRL.', min: 0.1, max: 3, step: 0.05, format: 'multiplier' },
  d2Blockade: { label: 'Bloqueio do receptor D2', hint: 'Antipsicóticos, metoclopramida.', min: 0, max: 0.95, step: 0.01, format: 'percent' },
  suckling: { label: 'Estímulo de sucção', hint: 'Reflexo neuroendócrino: PRL e ocitocina.', min: 0, max: 1, step: 0.01, format: 'percent' },
  prolactinoma: { label: 'Prolactinoma', hint: 'Secreção autônoma de prolactina.', min: 0, max: 20, step: 0.1, format: 'multiplier' },

  magnocellularFn: { label: 'Neurônios magnocelulares (NSO/NPV)', hint: 'Síntese de ADH e ocitocina. DI central ↓', min: 0, max: 1.5, step: 0.01, format: 'percent' },
  renalAdhSensitivity: { label: 'Sensibilidade renal ao ADH (V2)', hint: 'DI nefrogênico (lítio) ↓', min: 0, max: 1, step: 0.01, format: 'percent' },
  ectopicAdh: { label: 'ADH inapropriado (SIADH)', hint: 'Carcinoma de pequenas células, fármacos.', min: 0, max: 20, step: 0.5, format: 'pgml' },
  bloodVolume: { label: 'Volume sanguíneo efetivo', hint: 'Hemorragia ↓ (barorreceptores).', min: 0.6, max: 1.15, step: 0.01, format: 'percent' },
  waterAccess: { label: 'Ingestão de água basal', hint: '0 = sem acesso · 3× = polidipsia primária', min: 0, max: 3, step: 0.05, format: 'multiplier' },
  labor: { label: 'Estiramento cervical (parto)', hint: 'Reflexo de Ferguson: retroalimentação positiva.', min: 0, max: 1, step: 0.01, format: 'percent' },
}

export function formatParam(key          , value        ) {
  const { format } = PARAM_DEFS[key]
  switch (format) {
    case 'percent':
      return `${Math.round(value * 100)}%`
    case 'multiplier':
      return `${value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}×`
    case 'dose':
      return value === 0 ? 'nenhuma' : `${value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}× dose`
    case 'pgml':
      return `${value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} pg/mL`
    case 'liters':
      return `${value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })} L`
  }
}

                     
               
                  
               
                                          
 

                                                                                     

                                                       

                          
            
              
                  
                 
                    
                  
                
                 
                      
        
                                                 
                                                                                         
 

export const AXES               = [
  {
    id: 'tireoide',
    name: 'Eixo hipotálamo-hipófise-tireoide',
    tabLabel: 'Tireoide',
    summary: 'TRH → TSH → T4/T3. Núcleo comum ao aprofundamento, com estoques glandulares e influência dos outros eixos; respostas ao longo de dias, sem ritmo circadiano imposto.',
    params: ['trhDrive', 'thyrotropeFn', 'thyroidFn', 'iodine', 'trab', 'methimazole', 'deiodinase', 'levothyroxine'],
    monitor: ['tsh', 'ft4', 't3'],
    panel: ['trh', 'tsh', 'ft4', 't3', 'goiter', 'hr', 'bmr'],
    stages: [
      { title: 'Hipotálamo', subtitle: 'Núcleo paraventricular', labs: ['trh'], arrow: { label: 'TRH via sistema porta', signal: 'trh' } },
      { title: 'Adeno-hipófise', subtitle: 'Tireotrofos', labs: ['tsh'], arrow: { label: 'TSH na circulação', signal: 'tsh' } },
      { title: 'Tireoide', subtitle: 'Folículos: T4 (~90%) e T3 (~10%)', labs: ['ft4', 'goiter'], arrow: { label: 'Desiodação D1/D2: T4 → T3', signal: 'ft4' } },
      { title: 'Tecidos periféricos', subtitle: 'T3 liga-se ao receptor nuclear (TR)', labs: ['t3', 'hr', 'bmr'] },
    ],
    feedback: [
      { type: 'negativa', text: 'T3/T4 inibem a síntese de TRH e TSH (alça longa).' },
      { type: 'integração', text: 'TRH também estimula prolactina; cortisol alto reduz TSH; T3 é necessário para a secreção de GH.' },
    ],
    chart: {
      mode: 'relative',
      series: [
        { lab: 'tsh', color: 'var(--chart-1)' },
        { lab: 'ft4', color: 'var(--chart-2)' },
        { lab: 't3', color: 'var(--chart-3)' },
        { lab: 'trh', color: 'var(--chart-4)' },
      ],
    },
  },
  {
    id: 'adrenal',
    name: 'Eixo hipotálamo-hipófise-adrenal',
    tabLabel: 'Adrenal',
    summary: 'CRH (+ ADH) → ACTH → cortisol.',
    params: ['stress', 'corticotropeFn', 'adrenalFn', 'ectopicActh', 'exoGlucocorticoid'],
    monitor: ['acth', 'cortisol', 'gcActivity'],
    panel: ['crh', 'acth', 'cortisol', 'gcActivity', 'adrenalMass'],
    stages: [
      { title: 'Hipotálamo', subtitle: 'Núcleo paraventricular', labs: ['crh'], arrow: { label: 'CRH (+ ADH sinérgico)', signal: 'crh' } },
      { title: 'Adeno-hipófise', subtitle: 'Corticotrofos (POMC)', labs: ['acth'], arrow: { label: 'ACTH via receptor MC2R', signal: 'acth' } },
      { title: 'Córtex adrenal', subtitle: 'Zona fasciculada', labs: ['cortisol', 'adrenalMass'], arrow: { label: 'Cortisol na circulação', signal: 'cortisol' } },
      { title: 'Tecidos-alvo', subtitle: 'Receptor glicocorticoide', labs: ['gcActivity'] },
    ],
    feedback: [
      { type: 'negativa', text: 'Cortisol (e corticoides exógenos) inibem CRH e ACTH.' },
      { type: 'integração', text: 'ACTH tem efeito trófico: sem ele, a adrenal atrofia em semanas.' },
    ],
    chart: {
      mode: 'relative',
      series: [
        { lab: 'acth', color: 'var(--chart-1)' },
        { lab: 'cortisol', color: 'var(--chart-2)' },
        { lab: 'gcActivity', color: 'var(--chart-3)' },
        { lab: 'adrenalMass', color: 'var(--chart-4)' },
      ],
    },
  },
  {
    id: 'gonadas',
    name: 'Eixo hipotálamo-hipófise-gônadas',
    tabLabel: 'Gônadas',
    summary: 'GnRH pulsátil → LH/FSH → testosterona e inibina (modelo masculino).',
    params: ['gnrhDrive', 'gonadotropeFn', 'gnrhAgonist', 'testicularFn', 'exoTestosterone'],
    monitor: ['lh', 'fsh', 'testo'],
    panel: ['gnrh', 'lh', 'fsh', 'testo', 'inhibin', 'gnrhR'],
    stages: [
      { title: 'Hipotálamo', subtitle: 'Núcleo arqueado (kisspeptina)', labs: ['gnrh'], arrow: { label: 'GnRH pulsátil', signal: 'gnrh' } },
      { title: 'Adeno-hipófise', subtitle: 'Gonadotrofos', labs: ['lh', 'fsh', 'gnrhR'], arrow: { label: 'LH → Leydig · FSH → Sertoli', signal: 'lh' } },
      { title: 'Testículos', subtitle: 'Leydig e Sertoli', labs: ['testo', 'inhibin'] },
    ],
    feedback: [
      { type: 'negativa', text: 'Testosterona inibe GnRH e LH; inibina B inibe seletivamente o FSH.' },
      { type: 'integração', text: 'Prolactina e cortisol elevados suprimem os pulsos de GnRH.' },
    ],
    chart: {
      mode: 'relative',
      series: [
        { lab: 'lh', color: 'var(--chart-1)' },
        { lab: 'fsh', color: 'var(--chart-2)' },
        { lab: 'testo', color: 'var(--chart-3)' },
        { lab: 'gnrhR', color: 'var(--chart-4)' },
      ],
    },
  },
  {
    id: 'gh',
    name: 'Eixo GH / IGF-1',
    tabLabel: 'GH',
    summary: 'GHRH (+) e somatostatina (−) → GH → IGF-1 hepático.',
    params: ['ghrhDrive', 'somatostatinTone', 'somatotropeFn', 'liverIgf', 'ghTumor'],
    monitor: ['gh', 'igf1', 'sst'],
    panel: ['ghrh', 'sst', 'gh', 'igf1'],
    stages: [
      { title: 'Hipotálamo', subtitle: 'Arqueado (GHRH) · periventricular (SST)', labs: ['ghrh', 'sst'], arrow: { label: 'GHRH estimula · SST inibe', signal: 'ghrh' } },
      { title: 'Adeno-hipófise', subtitle: 'Somatotrofos', labs: ['gh'], arrow: { label: 'GH via JAK2/STAT5', signal: 'gh' } },
      { title: 'Fígado', subtitle: 'Síntese de IGF-1', labs: ['igf1'] },
    ],
    feedback: [
      { type: 'negativa', text: 'IGF-1 inibe GH e GHRH e estimula a somatostatina; GH inibe a si mesmo (alça curta).' },
      { type: 'integração', text: 'Hipotireoidismo e excesso de cortisol reduzem a secreção de GH.' },
    ],
    chart: {
      mode: 'relative',
      series: [
        { lab: 'gh', color: 'var(--chart-1)' },
        { lab: 'igf1', color: 'var(--chart-2)' },
        { lab: 'sst', color: 'var(--chart-3)' },
        { lab: 'ghrh', color: 'var(--chart-4)' },
      ],
    },
  },
  {
    id: 'prolactina',
    name: 'Prolactina e hipófise global',
    tabLabel: 'Prolactina',
    summary: 'Controle predominantemente inibitório pela dopamina.',
    params: ['dopamineTone', 'd2Blockade', 'suckling', 'prolactinoma', 'stalk', 'adenoFn'],
    monitor: ['prl', 'dopamine', 'lh'],
    panel: ['dopamine', 'trh', 'prl', 'lh', 'testo'],
    stages: [
      { title: 'Hipotálamo', subtitle: 'Neurônios TIDA (dopamina) · TRH', labs: ['dopamine', 'trh'], arrow: { label: 'Dopamina inibe (D2) · TRH estimula', signal: 'dopamine' } },
      { title: 'Adeno-hipófise', subtitle: 'Lactotrofos', labs: ['prl'], arrow: { label: 'Prolactina na circulação', signal: 'prl' } },
      { title: 'Mama e gônadas', subtitle: 'Lactogênese · inibição de GnRH', labs: ['lh', 'testo'] },
    ],
    feedback: [
      { type: 'negativa', text: 'Prolactina estimula os neurônios dopaminérgicos (alça curta), limitando a própria secreção.' },
      { type: 'integração', text: 'Prolactina alta suprime GnRH → hipogonadismo, galactorreia e infertilidade.' },
    ],
    chart: {
      mode: 'relative',
      series: [
        { lab: 'prl', color: 'var(--chart-1)' },
        { lab: 'dopamine', color: 'var(--chart-2)' },
        { lab: 'lh', color: 'var(--chart-3)' },
        { lab: 'tsh', color: 'var(--chart-4)' },
      ],
    },
  },
  {
    id: 'neuro',
    name: 'Neuro-hipófise: ADH e ocitocina',
    tabLabel: 'Neuro-hipófise',
    summary: 'Neurônios magnocelulares projetam axônios até a neuro-hipófise.',
    params: ['magnocellularFn', 'renalAdhSensitivity', 'ectopicAdh', 'bloodVolume', 'waterAccess', 'labor', 'suckling'],
    monitor: ['na', 'adh', 'urine'],
    panel: ['posm', 'na', 'adh', 'uosm', 'urine', 'intake', 'tbw', 'oxytocin', 'contraction', 'milk'],
    stages: [
      { title: 'Hipotálamo', subtitle: 'Núcleos supraóptico e paraventricular', labs: ['posm'], arrow: { label: 'Transporte axonal pela haste', signal: 'adh' } },
      { title: 'Neuro-hipófise', subtitle: 'Armazenamento e liberação', labs: ['adh', 'oxytocin'], arrow: { label: 'ADH → rim · Ocitocina → útero/mama', signal: 'adh' } },
      { title: 'Rim (ducto coletor)', subtitle: 'Receptor V2 → aquaporina-2', labs: ['uosm', 'urine', 'na'] },
      { title: 'Útero e mama', subtitle: 'Músculo liso e células mioepiteliais', labs: ['contraction', 'milk'] },
    ],
    feedback: [
      { type: 'negativa', text: 'Reabsorção de água reduz a osmolalidade → osmorreceptores diminuem o ADH.' },
      { type: 'positiva', text: 'Parto: estiramento cervical → ocitocina → contração → mais estiramento (Ferguson).' },
      { type: 'integração', text: 'Hipovolemia estimula ADH via barorreceptores; ADH potencializa o CRH na liberação de ACTH.' },
    ],
    chart: {
      mode: 'absolute',
      domain: [0, 20],
      unit: 'valor absoluto',
      series: [
        { lab: 'adh', color: 'var(--chart-1)' },
        { lab: 'urine', color: 'var(--chart-2)' },
        { lab: 'intake', color: 'var(--chart-3)' },
      ],
    },
  },
]

export const AXIS_MAP = Object.fromEntries(AXES.map((a) => [a.id, a]))                              


