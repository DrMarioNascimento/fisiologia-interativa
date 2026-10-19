import { advance, scenarioState, DEFAULT_PARAMS } from './thyroid-model.js?v=20261019-reference4';
export function referenceTrajectory(scenario, days = 180) {
  if (!Number.isInteger(days) || days < 0 || days > 180) throw new RangeError('Horizonte inválido');
  const params = { ...DEFAULT_PARAMS, ...scenario.params };
  let state = scenarioState(scenario);
  const rows = [Object.freeze({ ...state })];
  for (let day = 1; day <= days; day++) {
    state = advance(state, params, 1);
    rows.push(Object.freeze({ ...state }));
  }
  return Object.freeze(rows);
}

