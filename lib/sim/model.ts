export type Params = {
  adenoFn: number
  stalk: number

  trhDrive: number
  thyrotropeFn: number
  thyroidFn: number
  iodine: number
  trab: number
  methimazole: number
  deiodinase: number
  levothyroxine: number

  stress: number
  corticotropeFn: number
  adrenalFn: number
  ectopicActh: number
  exoGlucocorticoid: number

  gnrhDrive: number
  gonadotropeFn: number
  gnrhAgonist: number
  testicularFn: number
  exoTestosterone: number

  ghrhDrive: number
  somatostatinTone: number
  somatotropeFn: number
  liverIgf: number
  ghTumor: number

  dopamineTone: number
  d2Blockade: number
  suckling: number
  prolactinoma: number

  magnocellularFn: number
  renalAdhSensitivity: number
  ectopicAdh: number
  bloodVolume: number
  waterAccess: number
  labor: number
}

export type ParamKey = keyof Params

export type SimState = {
  t: number
  trh: number
  tsh: number
  t4: number
  t3: number
  goiter: number
  crh: number
  acth: number
  cortisolEndo: number
  adrenalMass: number
  gnrh: number
  lh: number
  fsh: number
  testoEndo: number
  inhibin: number
  gnrhR: number
  ghrh: number
  sst: number
  gh: number
  igf1: number
  dopamine: number
  prl: number
  adh: number
  tbw: number
  uosm: number
  oxytocin: number
  contraction: number
}

export const DEFAULT_PARAMS: Params = {
  adenoFn: 1,
  stalk: 1,
  trhDrive: 1,
  thyrotropeFn: 1,
  thyroidFn: 1,
  iodine: 1,
  trab: 0,
  methimazole: 0,
  deiodinase: 1,
  levothyroxine: 0,
  stress: 1,
  corticotropeFn: 1,
  adrenalFn: 1,
  ectopicActh: 0,
  exoGlucocorticoid: 0,
  gnrhDrive: 1,
  gonadotropeFn: 1,
  gnrhAgonist: 0,
  testicularFn: 1,
  exoTestosterone: 0,
  ghrhDrive: 1,
  somatostatinTone: 1,
  somatotropeFn: 1,
  liverIgf: 1,
  ghTumor: 0,
  dopamineTone: 1,
  d2Blockade: 0,
  suckling: 0,
  prolactinoma: 0,
  magnocellularFn: 1,
  renalAdhSensitivity: 1,
  ectopicAdh: 0,
  bloodVolume: 1,
  waterAccess: 1,
  labor: 0,
}

const INITIAL_STATE: SimState = {
  t: 0,
  trh: 1,
  tsh: 1,
  t4: 1,
  t3: 1,
  goiter: 1,
  crh: 1,
  acth: 1,
  cortisolEndo: 1,
  adrenalMass: 1,
  gnrh: 1,
  lh: 1,
  fsh: 1,
  testoEndo: 1,
  inhibin: 1,
  gnrhR: 1,
  ghrh: 1,
  sst: 1,
  gh: 1,
  igf1: 1,
  dopamine: 1,
  prl: 1,
  adh: 2,
  tbw: 42,
  uosm: 700,
  oxytocin: 1,
  contraction: 0,
}

/** Total body solute (mOsm), assumed constant: 285 mOsm/kg × 42 L. */
const BODY_SOLUTE = 285 * 42
const OSMOLAR_LOAD = 800
const INSENSIBLE_LOSS = 0.8
export const DT = 0.005

const clamp = (x: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, x))
const floor = (x: number) => Math.max(x, 0.02)

export function plasmaOsm(s: SimState) {
  return BODY_SOLUTE / s.tbw
}

export function waterFlows(s: SimState, p: Params) {
  const posm = plasmaOsm(s)
  const urine = OSMOLAR_LOAD / s.uosm
  const lowOsmBrake = posm < 280 ? Math.max(0.5, 1 - 0.05 * (280 - posm)) : 1
  const thirst =
    Math.min(p.waterAccess, 1) *
    (0.6 * Math.max(0, posm - 288) + 0.6 * Math.max(0, 1 - p.bloodVolume))
  const intake = p.waterAccess * 2 * lowOsmBrake + thirst
  return { posm, urine, intake }
}

export function step(s: SimState, p: Params, dt = DT): SimState {
  const relax = (x: number, target: number, tau: number) =>
    x + (target - x) * (1 - Math.exp(-dt / tau))

  const H = p.stalk
  const A = p.adenoFn
  const C = floor(s.cortisolEndo + p.exoGlucocorticoid)
  const T = floor(s.testoEndo + p.exoTestosterone)

  // Tireoide
  const F = floor(0.6 * s.t4 + 0.4 * s.t3)
  const trhT = p.trhDrive * F ** -1.5
  const trhPortal = s.trh * H
  const cortOnTsh = C > 1.2 ? (C / 1.2) ** -0.4 : 1
  // A damaged pituitary cannot mount the full compensatory TSH rise, so its
  // feedback gain is capped by the remaining thyrotrope reserve.
  const thyrotropeReserve = A * p.thyrotropeFn
  const feedbackGain = Math.min(F ** -5, 1 + 79 * Math.min(1, thyrotropeReserve) ** 2)
  const tshRaw =
    thyrotropeReserve * (0.15 + 0.85 * trhPortal ** 0.7) * feedbackGain * cortOnTsh
  const tshT = (80 * tshRaw) / (80 + tshRaw)
  const iodineFactor = (1.3 * p.iodine) / (0.3 + p.iodine)
  const stim = (s.tsh + p.trab) ** 0.8
  const secretion =
    p.thyroidFn * iodineFactor * (1 - p.methimazole) * s.goiter * ((3 * stim) / (2 + stim))
  const t4T = secretion + p.levothyroxine
  const t3T = 0.2 * secretion + 0.8 * s.t4 * p.deiodinase
  const goiterT = clamp((s.tsh + 1.5 * p.trab) ** 0.4, 0.5, 3)

  // Adrenal
  const crhT = p.stress * C ** -0.7
  const crhPortal = s.crh * H
  const adhSynergy = clamp(1 + 0.25 * (s.adh / 2 - 1), 0.75, 2)
  const acthT = Math.min(
    40,
    A * p.corticotropeFn * (0.1 + 0.9 * crhPortal ** 0.8) * adhSynergy * C ** -1.2 +
      p.ectopicActh,
  )
  const acthDrive = floor(s.acth) ** 0.8
  const cortEndoT = (p.adrenalFn * s.adrenalMass * 2 * acthDrive) / (1 + acthDrive)
  // A destroyed cortex cannot hypertrophy in response to ACTH.
  const massT = clamp(s.acth ** 0.5, 0.15, 0.5 + 2.5 * Math.min(1, p.adrenalFn))

  // Gônadas (modelo masculino)
  const prlOnGnrh = s.prl > 1.5 ? (s.prl / 1.5) ** -0.6 : 1
  const cortOnGnrh = C > 1.5 ? (C / 1.5) ** -0.5 : 1
  const gnrhT = p.gnrhDrive * T ** -0.5 * prlOnGnrh * cortOnGnrh
  const gnrhStim = s.gnrh * H + 3 * p.gnrhAgonist
  const receptorT = 1 / (1 + 200 * p.gnrhAgonist)
  const lhT = Math.min(
    40,
    A * p.gonadotropeFn * s.gnrhR * gnrhStim ** 0.8 * T ** -1.5,
  )
  const fshT = Math.min(
    40,
    A * p.gonadotropeFn * s.gnrhR * gnrhStim ** 0.6 * floor(s.inhibin) ** -0.8 * T ** -0.3,
  )
  const testoT = p.testicularFn * s.lh ** 0.8
  const inhibinT = p.testicularFn * s.fsh ** 0.5

  // GH / IGF-1
  const igf = floor(s.igf1)
  const sstT = p.somatostatinTone * igf ** 0.5
  const ghrhT = p.ghrhDrive * igf ** -0.3
  const t3OnGh = clamp(floor(s.t3) ** 0.4, 0.3, 1.5)
  const cortOnGh = C > 1.5 ? (C / 1.5) ** -0.6 : 1
  const ghT = Math.min(
    60,
    A *
      p.somatotropeFn *
      (0.1 + 0.9 * (s.ghrh * H) ** 0.8) *
      (2 / (1 + s.sst * H)) *
      igf ** -0.5 *
      t3OnGh *
      cortOnGh +
      p.ghTumor,
  )
  const igfT = p.liverIgf * s.gh ** 0.6

  // Prolactina
  const daT = Math.min(5, p.dopamineTone * floor(s.prl) ** 0.5)
  const daEffective = s.dopamine * H * (1 - p.d2Blockade)
  const trhOnPrl = 0.7 + 0.3 * trhPortal ** 0.6
  const prlT = Math.min(
    80,
    (A * trhOnPrl * (1 + 8 * p.suckling) * 4) / (1 + 3 * daEffective) + p.prolactinoma,
  )

  // Neuro-hipófise
  const { posm, urine, intake } = waterFlows(s, p)
  const volumeFactor = Math.exp(4 * (1 - p.bloodVolume))
  const magno = p.magnocellularFn * (0.15 + 0.85 * H)
  const baroreceptorAdh = 25 * Math.max(0, 1 - p.bloodVolume) ** 1.5
  const adhT = Math.min(
    60,
    (Math.max(0, 0.4 * (posm - 280)) * volumeFactor + baroreceptorAdh + 0.1) * magno +
      p.ectopicAdh,
  )
  const effectiveAdh = s.adh * p.renalAdhSensitivity
  const uosmT = 50 + 1150 * (1 - Math.exp(-effectiveAdh / 2.5))
  const tbw = clamp(s.tbw + (intake - urine - INSENSIBLE_LOSS) * dt, 28, 60)
  const otT = Math.min(40, magno * (1 + 8 * p.suckling + p.labor * (2 + 20 * s.contraction)))
  const contractionT = Math.min(1, (p.labor * s.oxytocin) / 12)

  return {
    t: s.t + dt,
    trh: relax(s.trh, trhT, 0.02),
    tsh: relax(s.tsh, tshT, 0.08),
    t4: relax(s.t4, t4T, 10),
    t3: relax(s.t3, t3T, 1.2),
    goiter: relax(s.goiter, goiterT, 25),
    crh: relax(s.crh, crhT, 0.01),
    acth: relax(s.acth, acthT, 0.02),
    cortisolEndo: relax(s.cortisolEndo, cortEndoT, 0.05),
    adrenalMass: relax(s.adrenalMass, massT, 20),
    gnrh: relax(s.gnrh, gnrhT, 0.01),
    lh: relax(s.lh, lhT, 0.04),
    fsh: relax(s.fsh, fshT, 0.15),
    testoEndo: relax(s.testoEndo, testoT, 0.05),
    inhibin: relax(s.inhibin, inhibinT, 0.4),
    gnrhR: relax(s.gnrhR, receptorT, 4),
    ghrh: relax(s.ghrh, ghrhT, 0.02),
    sst: relax(s.sst, sstT, 0.02),
    gh: relax(s.gh, ghT, 0.02),
    igf1: relax(s.igf1, igfT, 0.6),
    dopamine: relax(s.dopamine, daT, 0.02),
    prl: relax(s.prl, prlT, 0.03),
    adh: relax(s.adh, adhT, 0.01),
    tbw,
    uosm: relax(s.uosm, uosmT, 0.03),
    oxytocin: relax(s.oxytocin, otT, 0.01),
    contraction: relax(s.contraction, contractionT, 0.05),
  }
}

export function advance(s: SimState, p: Params, days: number) {
  let next = s
  const steps = Math.round(days / DT)
  for (let i = 0; i < steps; i++) next = step(next, p)
  return next
}

export const BASELINE_STATE: SimState = {
  ...advance(INITIAL_STATE, DEFAULT_PARAMS, 200),
  t: 0,
}
