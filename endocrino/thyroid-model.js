export const DEFAULT_PARAMS = Object.freeze({ thyroidFn: 1, thyrotropeFn: 1, levothyroxine: 0, deiodinase: 1, trab: 0, iodine: 1, nis: 1, tpo: 1, pendrin: 1, destruction: 0, lesionDays: 21, lesionStart: 0, permanentFraction: 1, escapeEnabled: true });
export const BASELINE_STATE = Object.freeze({ t: 0, trh: 1, tsh: 1, t4: 1, t3: 1, iodide: 1, colloid: 1, mit: 1, dit: 1, tg: 10, store4: 9, store3: 3, tissue: 1, injury: 0, growth: 1, escape: 0, centralT3: 1, peripheralD: 1, pituitaryReserve: 1, iodineIn: 0, iodineOut: 0 });
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const sat = x => 2 * x / (1 + x);
const relax = (x, target, tau, dt) => target + (x - target) * Math.exp(-dt / tau);
const poolKeys = ['iodide', 'colloid', 'mit', 'dit', 'tg', 'store4', 'store3'];

export function initialState(params = DEFAULT_PARAMS) {
  const p = { ...DEFAULT_PARAMS, ...params };
  const s = { ...BASELINE_STATE };
  for (const key of poolKeys) s[key] *= p.thyroidFn;
  if (p.thyroidFn === 0) s.tissue = 0;
  return s;
}

export function iodineContent(s) {
  return s.iodide + s.colloid + s.mit + 2 * s.dit + 4 * s.store4 + 3 * s.store3;
}

export function flows(s, input) {
  const p = { ...DEFAULT_PARAMS, ...input };
  const mass = p.thyroidFn * s.tissue * (1 - s.injury) * s.growth;
  const volume = Math.max(0.01, mass);
  const stimulus = 5 * Math.max(0, s.tsh + p.trab) / (4 + Math.max(0, s.tsh + p.trab));
  const intracellular = s.iodide / volume;
  const excess = Math.max(0, intracellular - 1.5);
  const inhibition = 1 / (1 + 4 * excess * excess);
  const uptake = 2 * mass * p.nis * stimulus * p.iodine / (1 + 8 * s.escape);
  // Both alternative and pendrin-mediated transport have finite capacity.
  const apical = 2.3 * mass * stimulus * (0.3 + 0.7 * p.pendrin) * sat(intracellular);
  const efflux = 0.3 * s.iodide;
  const colloidEfflux = 0.2 * s.colloid;
  const activity = mass > 0 ? stimulus * p.tpo * inhibition : 0;
  const organification = 1.2 * activity * sat(s.colloid / volume) * s.tg / 10;
  const secondIodination = 0.9 * activity * sat(s.colloid / volume) * s.mit;
  const coupling4 = 0.3 * activity * s.dit * sat(s.dit / volume);
  const coupling3 = 0.1 * activity * s.mit * sat(s.dit / volume);
  const processing = mass > 0 ? stimulus * Math.sqrt(inhibition) : 0;
  const recycleM = 0.2 * processing * s.mit;
  const recycleD = 0.2 * processing * s.dit;
  const release4 = s.store4 / 30 * processing;
  const release3 = s.store3 / 30 * processing;
  const lesion = s.t + 1e-9 >= p.lesionStart && s.t + 1e-9 < p.lesionStart + p.lesionDays ? p.destruction : 0;
  const leak4 = lesion * s.store4;
  const leak3 = lesion * s.store3;
  const sites = s.tg + s.mit + s.dit + 2 * (s.store4 + s.store3);
  const siteBalance = (36 * mass - sites) / 30;
  const tgSynthesis = Math.max(0, siteBalance);
  const tgRemoval = Math.min(s.tg, Math.max(0, -siteBalance));
  return { uptake, apical, efflux, colloidEfflux, organification, secondIodination, coupling4, coupling3, recycleM, recycleD, release4, release3, leak4, leak3, inhibition, lesion, stimulus, intracellular, tgSynthesis, tgRemoval };
}

export function advance(state, input, days, maxStep = 0.005) {
  const p = { ...DEFAULT_PARAMS, ...input };
  if (!Number.isFinite(days) || days < 0 || days > 365) throw new RangeError('Intervalo inválido');
  for (const [key, value] of Object.entries(p)) if (key !== 'escapeEnabled' && (!Number.isFinite(value) || value < 0)) throw new RangeError(`Parâmetro inválido: ${key}`);
  if (p.permanentFraction > 1 || typeof p.escapeEnabled !== 'boolean') throw new RangeError('Fração ou opção inválida');
  let s = { ...state };
  for (const key of Object.keys(BASELINE_STATE)) if (!Number.isFinite(s[key]) || s[key] < 0) throw new RangeError(`Estado inválido: ${key}`);
  if (!Number.isFinite(maxStep) || maxStep < 0.001 || maxStep > 0.005) throw new RangeError('Passo numérico inválido');
  const steps = Math.ceil(days / maxStep);
  const dt = steps ? days / steps : 0;
  for (let i = 0; i < steps; i++) {
    const f = flows(s, p);
    const feedback = Math.max(0.05, s.centralT3);
    const tshTarget = Math.min(80, p.thyrotropeFn * s.pituitaryReserve * (0.05 + 0.95 * s.trh ** 0.7) * Math.min(feedback ** -3, 1 + 79 * Math.min(1, p.thyrotropeFn) ** 2));
    const conversion = p.deiodinase * s.peripheralD;
    const centralD = clamp(1 / Math.sqrt(Math.max(0.05, s.t4)), 0.6, 1.6);
    const injuryIodineLoss = f.lesion * (s.iodide + s.colloid + s.mit + 2 * s.dit);
    const next = { ...s, t: s.t + dt,
      trh: relax(s.trh, Math.min(30, feedback ** -1), 0.02, dt),
      tsh: relax(s.tsh, tshTarget, 2, dt),
      centralT3: relax(s.centralT3, 0.8 * centralD * s.t4 + 0.2 * s.t3, 0.5, dt),
      peripheralD: relax(s.peripheralD, clamp(1 / Math.sqrt(Math.max(0.05, s.t3)), 0.6, 1.5), 5, dt),
      pituitaryReserve: relax(s.pituitaryReserve, clamp(1 / Math.max(1, feedback ** 2), 0.1, 1), feedback > 1.1 ? 10 : 30, dt),
      tissue: s.tissue + dt * (-f.lesion * p.permanentFraction * s.tissue),
      injury: s.injury + dt * (f.lesion * (1 - p.permanentFraction) * (1 - s.injury) - s.injury / 60),
      growth: relax(s.growth, clamp(1 + 0.25 * (f.stimulus - 1), 0.75, 2), 60, dt),
      // Intrathyroidal exposure drives adaptation; hysteresis avoids an artificial on/off oscillation.
      escape: relax(s.escape, p.escapeEnabled ? clamp(s.escape + (f.intracellular - 1.2) * 0.5, 0, 1) : 0, 3, dt),
      iodide: s.iodide + dt * (f.uptake + f.recycleM + 2 * f.recycleD - f.apical - f.efflux - f.lesion * s.iodide),
      colloid: s.colloid + dt * (f.apical - f.organification - f.secondIodination - f.colloidEfflux - f.lesion * s.colloid),
      mit: s.mit + dt * (f.organification - f.secondIodination - f.coupling3 - f.recycleM - f.lesion * s.mit),
      dit: s.dit + dt * (f.secondIodination - 2 * f.coupling4 - f.coupling3 - f.recycleD - f.lesion * s.dit),
      tg: s.tg + dt * (f.tgSynthesis - f.tgRemoval - f.organification + f.recycleM + f.recycleD + 2 * (f.release4 + f.release3) - f.lesion * s.tg),
      store4: s.store4 + dt * (f.coupling4 - f.release4 - f.leak4),
      store3: s.store3 + dt * (f.coupling3 - f.release3 - f.leak3),
      iodineIn: s.iodineIn + dt * f.uptake,
      iodineOut: s.iodineOut + dt * (f.efflux + f.colloidEfflux + injuryIodineLoss + 4 * (f.release4 + f.leak4) + 3 * (f.release3 + f.leak3)),
      // Plasma indices use distinct scale factors; the exact iodine balance is glandular, not whole-body.
      t4: s.t4 + dt * (0.1 * ((f.release4 + f.leak4) / 0.3 + p.levothyroxine) - (0.08 + 0.02 * conversion) * s.t4),
      t3: s.t3 + dt / 1.2 * (0.2 * (f.release3 + f.leak3) / 0.1 + 0.8 * conversion * s.t4 - s.t3),
    };
    for (const key of Object.keys(next)) {
      if (!Number.isFinite(next[key]) || next[key] < -1e-10) throw new Error(`Instabilidade numérica: ${key}`);
      next[key] = Math.max(0, next[key]);
    }
    s = next;
  }
  return s;
}

export function scenarioState(scenario) {
  const p = { ...DEFAULT_PARAMS, ...scenario.params };
  if (scenario.pretreatment) {
    const before = { ...DEFAULT_PARAMS, ...scenario.pretreatment };
    return { ...advance(initialState(before), before, 56), t: 0, iodineIn: 0, iodineOut: 0 };
  }
  let s = initialState(p);
  if (scenario.established) {
    for (let i = 0; i < 4; i++) s = advance(s, p, 180);
    s = { ...s, t: 0, iodineIn: 0, iodineOut: 0 };
  }
  return s;
}
