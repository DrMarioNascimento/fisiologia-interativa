export const DEFAULT_PARAMS = Object.freeze({ thyroidFn: 1, thyrotropeFn: 1, levothyroxine: 0, deiodinase: 1, trab: 0, iodine: 1, nis: 1, tpo: 1, pendrin: 1, destruction: 0, escapeEnabled: true });
export const BASELINE_STATE = Object.freeze({ t: 0, trh: 1, tsh: 1, t4: 1, t3: 1, iodide: 1, colloid: 1, mit: 1, dit: 1, store4: 9, store3: 3, tissue: 1, escape: 0 });
const clamp = (x, lo, hi) => Math.max(lo, Math.min(hi, x));
const sat = x => 2 * x / (1 + x);
const relax = (x, target, tau, dt) => target + (x - target) * Math.exp(-dt / tau);

export function initialState(params = DEFAULT_PARAMS) {
  const p = { ...DEFAULT_PARAMS, ...params };
  const s = { ...BASELINE_STATE };
  if (p.thyroidFn === 0) for (const key of ['iodide', 'colloid', 'mit', 'dit', 'store4', 'store3']) s[key] = 0;
  return s;
}

export function flows(s, input) {
  const p = { ...DEFAULT_PARAMS, ...input };
  const capacity = p.thyroidFn * s.tissue;
  const stimulus = sat(Math.max(0, s.tsh + p.trab));
  const excess = Math.max(0, p.iodine - 2);
  const inhibition = 1 / (1 + 4 * excess * (1 - s.escape));
  const uptake = 1.5 * capacity * p.nis * stimulus * (2 * p.iodine / (1 + p.iodine)) / (1 + Math.max(0, 2 * p.iodine / (1 + p.iodine) - 1) * s.escape);
  // Residual apical transport prevents pendrin loss from being equated to total transport failure.
  const apical = 1.5 * (0.3 + 0.7 * p.pendrin) * s.iodide;
  const activity = capacity * stimulus * p.tpo * inhibition;
  const organification = activity * sat(s.colloid);
  const secondIodination = 0.7 * activity * sat(s.colloid) * s.mit;
  const coupling4 = 0.3 * activity * s.dit * s.dit;
  const coupling3 = 0.1 * activity * s.mit * s.dit;
  const recycle = 0.2 * s.mit;
  const release4 = capacity > 0 ? s.store4 / 30 * stimulus : 0;
  const release3 = capacity > 0 ? s.store3 / 30 * stimulus : 0;
  const leak4 = p.destruction * s.store4;
  const leak3 = p.destruction * s.store3;
  return { uptake, apical, organification, secondIodination, coupling4, coupling3, recycle, release4, release3, leak4, leak3, inhibition };
}

export function advance(state, input, days) {
  const p = { ...DEFAULT_PARAMS, ...input };
  if (!Number.isFinite(days) || days < 0 || days > 365) throw new RangeError('Intervalo inválido');
  for (const [key, value] of Object.entries(p)) if (key !== 'escapeEnabled' && (!Number.isFinite(value) || value < 0)) throw new RangeError(`Parâmetro inválido: ${key}`);
  let s = { ...state };
  const steps = Math.ceil(days / 0.005);
  const dt = steps ? days / steps : 0;
  for (let i = 0; i < steps; i++) {
    const f = flows(s, p);
    const feedback = Math.max(0.05, 0.6 * s.t4 + 0.4 * s.t3);
    const tshTarget = Math.min(80, p.thyrotropeFn * (0.05 + 0.95 * Math.pow(s.trh, 0.7)) * Math.min(Math.pow(feedback, -3), 1 + 79 * Math.min(1, p.thyrotropeFn) ** 2));
    const next = { ...s, t: s.t + dt,
      trh: relax(s.trh, Math.min(30, feedback ** -1), 0.02, dt),
      tsh: relax(s.tsh, tshTarget, 2, dt),
      tissue: s.tissue * Math.exp(-p.destruction * dt),
      escape: relax(s.escape, p.iodine > 2 && p.escapeEnabled ? 1 : 0, p.iodine > 2 ? 3 : 1, dt),
      iodide: s.iodide + dt * (f.uptake - f.apical),
      colloid: s.colloid + dt * (f.apical + f.recycle - f.organification - f.secondIodination),
      mit: s.mit + dt * (f.organification - f.secondIodination - f.coupling3 - f.recycle),
      dit: s.dit + dt * (f.secondIodination - 2 * f.coupling4 - f.coupling3),
      store4: s.store4 + dt * (f.coupling4 - f.release4 - f.leak4),
      store3: s.store3 + dt * (f.coupling3 - f.release3 - f.leak3),
      // Normalized plasma pools: conversion consumes T4 and supplies T3; scale factors are not clinical volumes.
      t4: s.t4 + dt * (0.1 * ((f.release4 + f.leak4) / 0.3 + p.levothyroxine) - (0.08 + 0.02 * p.deiodinase) * s.t4),
      t3: s.t3 + dt / 1.2 * (0.2 * (f.release3 + f.leak3) / 0.1 + 0.8 * p.deiodinase * s.t4 - s.t3),
    };
    for (const key of Object.keys(next)) {
      if (!Number.isFinite(next[key])) throw new Error('Instabilidade numérica no modelo');
      next[key] = Math.max(0, next[key]);
    }
    next.escape = clamp(next.escape, 0, 1);
    s = next;
  }
  return s;
}
