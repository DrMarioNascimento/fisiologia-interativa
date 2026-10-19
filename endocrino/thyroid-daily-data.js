// Medianas da Tabela 2: Zhang et al., Laboratory Medicine 2023;54:282–286.
// DOI 10.1093/labmed/lmac105. Dados de grupos; não são previsões individuais.
export const HOURS = Object.freeze([0, 4, 8, 12, 16, 20]);
export const DAILY_GROUPS = Object.freeze({
  men: Object.freeze({ label: 'Homens', n: 17, tsh: Object.freeze([3.116, 3.031, 2.357, 2.146, 1.658, 1.946]), ft4: Object.freeze([1.04, 1.07, 1.08, 1.10, 1.10, 1.08]), ft3: Object.freeze([3.68, 3.65, 3.55, 3.54, 3.57, 3.47]) }),
  women: Object.freeze({ label: 'Mulheres', n: 14, tsh: Object.freeze([3.377, 2.608, 2.127, 1.394, 1.584, 1.724]), ft4: Object.freeze([1.02, 1.00, 1.03, 1.01, 1.04, 1.05]), ft3: Object.freeze([3.10, 3.05, 3.12, 3.13, 3.01, 2.95]) })
});
export const DAILY_HORMONES = Object.freeze({
  tsh: { label: 'TSH', unit: 'mUI/L', color: '#ffab73' },
  ft4: { label: 'T4 livre', unit: 'ng/dL', color: '#70bcff' },
  ft3: { label: 'T3 livre', unit: 'pg/mL', color: '#87d29e' }
});
export function groupsFor(selection) { return selection === 'both' ? ['men', 'women'] : [selection]; }
export function groupMean(group, hormone) { const values = DAILY_GROUPS[group][hormone]; return values.reduce((sum, value) => sum + value, 0) / values.length; }
export function dailyValue(group, hormone, hour) {
  if (!DAILY_GROUPS[group] || !DAILY_HORMONES[hormone] || !Number.isFinite(hour)) throw new Error('Perfil diário inválido');
  const time = ((hour % 24) + 24) % 24;
  const index = Math.floor(time / 4), fraction = (time - index * 4) / 4;
  const values = DAILY_GROUPS[group][hormone];
  const value = values[index] + fraction * (values[(index + 1) % 6] - values[index]);
  return { value, percent: 100 * value / groupMean(group, hormone), observed: fraction === 0 };
}
export function dailyCSV(selection) {
  const number = value => value.toLocaleString('pt-BR', { useGrouping: false, maximumFractionDigits: 6 });
  const rows = [['Fonte', 'Grupo', 'n do grupo', 'Horário', 'TSH (mUI/L)', 'Variação TSH (% da média dos seis horários)', 'T4 livre (ng/dL)', 'Variação T4 livre (%)', 'T3 livre (pg/mL)', 'Variação T3 livre (%)', 'Tipo de dado']];
  for (const group of groupsFor(selection)) for (const hour of HOURS) {
    const values = ['tsh', 'ft4', 'ft3'].flatMap(id => { const data = dailyValue(group, id, hour); return [number(data.value), number(data.percent - 100)]; });
    rows.push(['Zhang et al. 2023; DOI:10.1093/labmed/lmac105; tabela 2', DAILY_GROUPS[group].label, DAILY_GROUPS[group].n, String(hour).padStart(2, '0') + ':00', ...values, 'Mediana publicada']);
  }
  return '\ufeff' + rows.map(row => row.map(value => '"' + String(value).replaceAll('"', '""') + '"').join(';')).join('\r\n');
}
