                                       

                                                                                   

                                                                            

                          
               
              
               
              
              
 

export const GLAND_COLOR                        = {
  hipotalamo: 'var(--chart-4)',
  neuro: 'var(--chart-1)',
  adeno: 'var(--chart-3)',
  ovario: 'var(--chart-2)',
  placenta: 'var(--ok)',
}

export const GLAND_LABEL                        = {
  hipotalamo: 'Hipotálamo',
  neuro: 'Neuro-hipófise',
  adeno: 'Adeno-hipófise',
  ovario: 'Ovário',
  placenta: 'Placenta',
}

export const HORMONES                                = {
  gnrh: { id: 'gnrh', name: 'GnRH (frequência de pulsos)', short: 'GnRH', unit: 'pulsos/dia', gland: 'hipotalamo' },
  oxt: { id: 'oxt', name: 'Ocitocina', short: 'Ocitocina', unit: 'pg/mL', gland: 'neuro' },
  fsh: { id: 'fsh', name: 'Hormônio folículo-estimulante', short: 'FSH', unit: 'mUI/mL', gland: 'adeno' },
  lh: { id: 'lh', name: 'Hormônio luteinizante', short: 'LH', unit: 'mUI/mL', gland: 'adeno' },
  prl: { id: 'prl', name: 'Prolactina', short: 'PRL', unit: 'ng/mL', gland: 'adeno' },
  e2: { id: 'e2', name: 'Estradiol', short: 'Estradiol', unit: 'pg/mL', gland: 'ovario' },
  p4: { id: 'p4', name: 'Progesterona', short: 'Progesterona', unit: 'ng/mL', gland: 'ovario' },
  hcg: { id: 'hcg', name: 'Gonadotrofina coriônica humana', short: 'β-hCG', unit: 'mUI/mL', gland: 'placenta' },
}

export const CYCLE_HORMONES              = ['gnrh', 'fsh', 'lh', 'prl', 'oxt', 'e2', 'p4']
export const PREGNANCY_HORMONES              = ['gnrh', 'fsh', 'lh', 'prl', 'oxt', 'e2', 'p4', 'hcg']

export const LUTEAL_LENGTH = 14
export const TERM_DAY = 280
export const POSTPARTUM_DAYS = 84
export const PREGNANCY_TOTAL_DAYS = TERM_DAY + POSTPARTUM_DAYS
export const PREGNANCY_CYCLE_LENGTH = 28

                                                    
                            
                            
 

const gauss = (x        , mu        , sigma        ) => Math.exp(-((x - mu) ** 2) / (2 * sigma * sigma))
const skewGauss = (x        , mu        , left        , right        ) => gauss(x, mu, x < mu ? left : right)
const sigmoid = (x        ) => 1 / (1 + Math.exp(-x))
const clamp01 = (x        ) => Math.min(1, Math.max(0, x))
const smoothstep = (a        , b        , x        ) => {
  const t = clamp01((x - a) / (b - a))
  return t * t * (3 - 2 * t)
}

export const ovulationDay = (cycleLength        ) => cycleLength - LUTEAL_LENGTH

export function cycleAt(day        , cycleLength        )           {
  const ov = ovulationDay(cycleLength)
  const x = day - ov
  const follicularStretch = Math.sqrt(ov / 14)

  const e2 = 35 + 235 * skewGauss(x, -1.8, 2.4 * follicularStretch, 1.1) + 105 * gauss(x, 7, 2.8)
  const p4 = 0.4 + 13 * gauss(x, 7, 2.6)
  const surge = skewGauss(x, -0.6, 0.9, 0.7)

  const lhBase = 5 - 1.8 * sigmoid((x - 1) / 1.2) + 1.8 * sigmoid((x - 13.2) / 0.6)
  const lh = lhBase + 48 * surge

  const intercycleRise = gauss(day, 1.5, 3) + gauss(day - cycleLength, 1.5, 3)
  const fsh = 4.2 + 2.6 * intercycleRise + 9 * surge - 1.2 * gauss(x, 6, 3)

  const prl = 11 + 4 * gauss(x, 7, 4)
  const oxt = 1.4 + 0.7 * gauss(x, -0.5, 1.5)
  const gnrh = 16 + 6 * clamp01((e2 - 40) / 230) - 13 * (p4 / (p4 + 3))

  let endometrium        
  if (day < 5) endometrium = 2 + 11 * (1 - smoothstep(0, 4, day))
  else if (x < 0) endometrium = 2 + 8 * clamp01((day - 5) / Math.max(1, ov - 5))
  else endometrium = 10 + 3 * clamp01(x / 7)

  const temperature = 36.4 + 0.35 * sigmoid((x - 1) / 0.8) - 0.35 * sigmoid((x - 13.5) / 0.4)

  return { gnrh, fsh, lh, prl, oxt, e2, p4, hcg: 0, endometrium, temperature }
}

function gestationalHcg(d        ) {
  if (d < 21) return 0
  // Log-hCG rises with a progressively longer doubling time (~1.5–2 days at first).
  const rise = 10 ** (0.7 + 4.35 * (1 - Math.exp(-Math.max(0, d - 22) / 16.8)))
  const decline = 0.2 + 0.8 * Math.exp(-((Math.max(0, d - 65) / 25) ** 2))
  const lateRise = 1 + 0.4 * sigmoid((d - 240) / 15)
  return rise * decline * lateRise * sigmoid((d - 22) / 0.5)
}

export const HCG_PEAK_DAY = (() => {
  let best = 21
  for (let d = 21; d < 140; d += 0.5) if (gestationalHcg(d) > gestationalHcg(best)) best = d
  return best
})()

function gestationalSteroids(d        ) {
  const progress = clamp01((d - 21) / (TERM_DAY - 21))
  const corpusLuteum = 24 * (1 - sigmoid((d - 60) / 5))
  const placentalP4 = 150 * clamp01((d - 35) / (TERM_DAY - 35))
  return {
    p4: corpusLuteum + placentalP4,
    corpusLuteumP4: corpusLuteum,
    e2: 150 + 19850 * progress ** 2.2,
    prl: 13 + 187 * progress ** 1.3,
    oxt: 1.5 + 2.5 * progress ** 3,
  }
}

export const corpusLuteumShare = (d        ) => {
  if (d < 21) return 1
  if (d >= TERM_DAY) return 0
  const s = gestationalSteroids(d)
  return s.corpusLuteumP4 / Math.max(s.p4, 1e-6)
}

const recovery = (pp        , center        , width        ) => {
  const start = sigmoid(-center / width)
  return (sigmoid((pp - center) / width) - start) / (1 - start)
}

const laborOxytocin = (d        ) => 30 * gauss(d, TERM_DAY, 0.5)

export function pregnancyAt(d        , breastfeeding         )           {
  if (d < 21) return cycleAt(d, PREGNANCY_CYCLE_LENGTH)

  if (d < TERM_DAY) {
    // hCG rescues the corpus luteum, so steroids hold at the mid-luteal level instead of declining.
    const luteal = cycleAt(21, PREGNANCY_CYCLE_LENGTH)
    const preg = gestationalSteroids(d)
    const w = smoothstep(21, 30, d)
    const mix = (a        , b        ) => a * (1 - w) + b * w
    return {
      gnrh: mix(luteal.gnrh, 3),
      fsh: mix(luteal.fsh, 0.3),
      lh: mix(luteal.lh, 0.3),
      prl: mix(luteal.prl, preg.prl),
      oxt: mix(luteal.oxt, preg.oxt) + laborOxytocin(d),
      e2: mix(luteal.e2, preg.e2),
      p4: mix(luteal.p4, preg.p4),
      hcg: gestationalHcg(d),
      endometrium: null,
      temperature: null,
    }
  }

  const pp = d - TERM_DAY
  const term = gestationalSteroids(TERM_DAY)
  const hcgTerm = gestationalHcg(TERM_DAY)

  const e2 =
    20 +
    (term.e2 - 20) * Math.exp(-pp / 0.7) +
    (breastfeeding ? 10 * sigmoid((pp - 35) / 10) : 40 * sigmoid((pp - 35) / 6))
  const p4 = 0.4 + (term.p4 - 0.4) * Math.exp(-pp / 0.35)
  const hcg = hcgTerm * Math.exp((-pp * Math.LN2) / 1.6)
  const prl = breastfeeding ? 45 + (term.prl - 45) * Math.exp(-pp / 25) : 11 + (term.prl - 11) * Math.exp(-pp / 5)
  const oxtBase = breastfeeding
    ? term.oxt + 2 * sigmoid((pp - 1) / 0.5)
    : 1.5 + (term.oxt - 1.5) * Math.exp(-pp / 2)
  const fsh = breastfeeding ? 0.3 + 3.5 * recovery(pp, 21, 7) : 0.3 + 5 * recovery(pp, 21, 5)
  const lh = breastfeeding ? 0.3 + 1.5 * recovery(pp, 30, 10) : 0.3 + 5 * recovery(pp, 35, 6)
  const gnrh = breastfeeding ? 3 + 3 * recovery(pp, 28, 10) : 3 + 14 * recovery(pp, 28, 7)

  return { gnrh, fsh, lh, prl, oxt: oxtBase + laborOxytocin(d), e2, p4, hcg, endometrium: null, temperature: null }
}

                                                                                     

export const snapshotAt = (day        , s             ) =>
  s.mode === 'ciclo' ? cycleAt(day, s.cycleLength) : pregnancyAt(day, s.breastfeeding)

export const totalDays = (s                                           ) =>
  s.mode === 'ciclo' ? s.cycleLength : PREGNANCY_TOTAL_DAYS

                                                                   

export function buildSeries(s             )                {
  const step = s.mode === 'ciclo' ? 0.25 : 0.5
  const total = totalDays(s)
  const points                = []
  for (let i = 0; i * step <= total + 1e-9; i++) {
    const t = i * step
    const snap = snapshotAt(Math.min(t, total - 0.001), s)
    points.push({
      t,
      gnrh: snap.gnrh,
      fsh: snap.fsh,
      lh: snap.lh,
      prl: snap.prl,
      oxt: snap.oxt,
      e2: snap.e2,
      p4: snap.p4,
      hcg: snap.hcg,
    })
  }
  return points
}

export function formatHormone(id           , v        ) {
  const digits = id === 'gnrh' || v >= 100 ? 0 : v >= 10 ? 1 : 2
  return v.toLocaleString('pt-BR', { maximumFractionDigits: digits, minimumFractionDigits: digits })
}

export function formatTime(mode      , day        , cycleLength        ) {
  if (mode === 'ciclo') return `Dia ${Math.floor(day) + 1} de ${cycleLength}`
  if (day >= TERM_DAY) {
    const pp = day - TERM_DAY
    return `Puerpério · ${Math.floor(pp / 7)} sem ${Math.floor(pp % 7)} d`
  }
  return `IG ${Math.floor(day / 7)} sem ${Math.floor(day % 7)} d`
}

