// Registros independentes da apresentação: histórico completo e parâmetros por amostra.
export function recordSample(state, parameters, scenario, event = '', kind = 'observation') {
  return { ...state, parameters: { ...parameters }, scenario, event, kind };
}
export function percentOfBaseline(id, value, baseline) {
  return 100 * value / baseline[id];
}
export function chartBounds(records, visible, baseline) {
  const maxValue = Math.max(100, ...records.flatMap(row => visible.map(id => percentOfBaseline(id, row[id], baseline))).filter(Number.isFinite));
  const target = Math.max(120, maxValue * 1.12);
  const rawStep = target / 4;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const fraction = rawStep / magnitude;
  const step = (fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10) * magnitude;
  return { yMax: Math.ceil(target / step) * step, step, xMax: Math.max(7, Math.ceil((records.at(-1)?.t || 0) / 7) * 7) };
}
export function exportCSV(records, baseline) {
  const ids = ['trh', 'tsh', 't4', 't3'];
  const parameterKeys = [...new Set(records.flatMap(row => Object.keys(row.parameters)))].sort();
  const number = value => Number.isFinite(value) ? value.toLocaleString('pt-BR', { useGrouping: false, maximumFractionDigits: 8 }) : '';
  const cell = value => '"' + String(value).replaceAll('"', '""') + '"';
  const headers = ['Cenário', 'Dia', 'TRH (% do basal)', 'TSH (% do basal)', 'T4 (% do basal)', 'T3 (% do basal)', 'Tipo de registro', 'Intervenção',
    ...parameterKeys.map(key => 'Parâmetro ' + key + ' (valor do modelo)')];
  const rows = records.map(row => [row.scenario, number(row.t), ...ids.map(id => number(percentOfBaseline(id, row[id], baseline))), row.kind, row.event,
    ...parameterKeys.map(key => typeof row.parameters[key] === 'number' ? number(row.parameters[key]) : String(row.parameters[key] ?? ''))]);
  return '\ufeff' + [headers, ...rows].map(row => row.map(cell).join(';')).join('\r\n');
}
