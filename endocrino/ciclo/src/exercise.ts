import type { HormoneId, Mode, Snapshot } from './model'

export type ExerciseLevel = 'baixa' | 'moderada' | 'alta'

type ExerciseDef = {
  id: ExerciseLevel
  label: string
  intensity: string
  examples: string
  mult: Partial<Record<HormoneId, number>>
  add: Partial<Record<HormoneId, number>>
  summary: string
  mechanisms: string[]
  clinical: Record<Mode, string>
}

// Acute changes at the end of a ~45–60 min session relative to rest. PRL and oxytocin
// rise by an absolute amount; steroids rise proportionally (hemoconcentration and lower
// hepatic clearance); GnRH/LH fall with stress-axis activation at high intensity.
export const EXERCISE: Record<ExerciseLevel, ExerciseDef> = {
  baixa: {
    id: 'baixa',
    label: 'Baixa',
    intensity: '< 50% do VO2 máx · conversa sem esforço',
    examples: 'Caminhada, yoga, alongamento',
    mult: { e2: 1.03, p4: 1.03 },
    add: { prl: 1, oxt: 0.2 },
    summary:
      'Estímulo abaixo do limiar que ativa o eixo do estresse: os hormônios reprodutivos praticamente não se alteram.',
    mechanisms: [
      'Ativação simpática discreta; cortisol estável ou levemente reduzido',
      'Pequeno aumento de ocitocina, associado a bem-estar e relaxamento',
      'Pulsatilidade de GnRH e LH preservada',
    ],
    clinical: {
      ciclo: 'Seguro em qualquer fase do ciclo. Não interfere na ovulação nem na fase lútea.',
      gestacao: 'Seguro e recomendado durante toda a gestação sem contraindicações obstétricas.',
    },
  },
  moderada: {
    id: 'moderada',
    label: 'Moderada',
    intensity: '50–70% do VO2 máx · fala, mas não canta',
    examples: 'Corrida leve, bicicleta, natação contínua',
    mult: { gnrh: 0.92, lh: 0.95, fsh: 1.04, e2: 1.12, p4: 1.15 },
    add: { prl: 6, oxt: 1 },
    summary:
      'Aumentos modestos de prolactina, estradiol e progesterona, mais por menor depuração e hemoconcentração do que por maior secreção.',
    mechanisms: [
      'Fluxo sanguíneo hepático cai 20–30% e reduz a depuração de estradiol e progesterona',
      'Perda de volume plasmático (hemoconcentração) eleva as concentrações',
      'Prolactina sobe com a temperatura central e a β-endorfina',
      'LH quase inalterado em uma sessão isolada',
    ],
    clinical: {
      ciclo: 'Não altera o ciclo quando a ingestão energética é adequada. Pode aliviar sintomas pré-menstruais.',
      gestacao: 'Recomenda-se ao menos 150 min/semana de intensidade moderada na gestação sem contraindicações.',
    },
  },
  alta: {
    id: 'alta',
    label: 'Alta',
    intensity: '> 75% do VO2 máx · acima do limiar anaeróbio',
    examples: 'Intervalado (HIIT), tiros, competição',
    mult: { gnrh: 0.7, lh: 0.8, fsh: 1.08, e2: 1.25, p4: 1.3 },
    add: { prl: 20, oxt: 3 },
    summary:
      'Ativa o eixo do estresse: CRH, cortisol e β-endorfina inibem agudamente os pulsos de GnRH e LH, e a prolactina pode dobrar ou triplicar.',
    mechanisms: [
      'CRH e β-endorfina reduzem a frequência de pulsos de GnRH, e o LH cai',
      'Prolactina sobe 2–3× por estresse, hipertermia e menor tônus dopaminérgico',
      'Estradiol e progesterona sobem 20–30%, mais evidente na fase lútea',
      'Catecolaminas, GH e cortisol também se elevam (não mostrados)',
    ],
    clinical: {
      ciclo:
        'Repetido com baixa disponibilidade energética, suprime o eixo de forma crônica: amenorreia hipotalâmica funcional (RED-S, tríade da atleta).',
      gestacao:
        'Evitar esforço exaustivo, calor excessivo e atividades com risco de queda ou trauma. Atletas devem manter acompanhamento obstétrico.',
    },
  },
}

export const EXERCISE_LEVELS: ExerciseLevel[] = ['baixa', 'moderada', 'alta']

export function applyExercise(snap: Snapshot, level: ExerciseLevel): Snapshot {
  const { mult, add } = EXERCISE[level]
  const next = { ...snap }
  for (const id of Object.keys(mult) as HormoneId[]) next[id] = snap[id] * (mult[id] ?? 1)
  for (const id of Object.keys(add) as HormoneId[]) next[id] = next[id] + (add[id] ?? 0)
  return next
}

