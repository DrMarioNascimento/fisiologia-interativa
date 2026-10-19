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

// Russell et al., 2008, table 2 (p.2303), checked against the rendered article.
// Group cosinor coefficients; these are NOT mean individual amplitudes.
export const STUDIES = Object.freeze({
  zhang: { label:'Zhang 2023 · medianas por sexo', doi:'10.1093/labmed/lmac105', kind:'medians', n:31, reference:'média das seis medianas', description:'17 homens e 14 mulheres. Pontos publicados em seis horários; linhas interpoladas. O fechamento 20h–24h repete 00h. TSH variou com o horário; FT3/FT4 não tiveram diferenças intradiárias significativas. Diferenças entre grupos não estabelecem um efeito universal do sexo.' },
  russell: { label:'Russell 2008 · ajuste de adultos mistos', doi:'10.1210/jc.2007-2674', kind:'cosinor', n:33, reference:'mesor do ajuste', description:'Grupo misto: 24 homens e 9 mulheres; TSH n=33 e hormônios livres n=29. Linhas reconstruídas dos parâmetros publicados, sem dosagens individuais. Não há separação por sexo nem faixa de normalidade. A amplitude coletiva é menor que a média das amplitudes individuais.' },
  children: { label:'Crianças e lactentes · evidência disponível', kind:'summary', description:'Há evidência de ritmo do TSH, mas os resultados recuperados não identificam uma curva horária completa. Não extrapole a curva adulta para recém-nascidos ou para todas as idades.' },
});
export const GROUP_COSINOR = Object.freeze({
  tsh:{mesor:1.78, amplitude:0.439, peak:2+40/60, unit:'mUI/L'},
  ft3:{mesor:5.42, amplitude:0.187, peak:4+4/60, unit:'pmol/L'},
  ft4:{mesor:16.2, amplitude:0.097, peak:16+20/60, unit:'pmol/L'},
});
export function studyGroups(study, selection) {
  if(study==='children') return [];
  if(study==='russell') return ['mixed'];
  if(study!=='zhang' || !['men','women','both'].includes(selection)) throw new RangeError('Estudo ou grupo inválido');
  return groupsFor(selection);
}
export function groupLabel(group) { return group==='mixed'?'Adultos · grupo misto':DAILY_GROUPS[group].label; }
export function studyValue(study, group, hormone, hour, reference='study') {
  if(!Number.isFinite(hour) || !DAILY_HORMONES[hormone] || !['study','08h'].includes(reference)) throw new RangeError('Perfil inválido');
  let value, baseline, unit, origin;
  if(study==='zhang' && DAILY_GROUPS[group]) {
    const v=dailyValue(group,hormone,hour);
    value=v.value; unit=DAILY_HORMONES[hormone].unit;
    baseline=reference==='08h'?DAILY_GROUPS[group][hormone][2]:groupMean(group,hormone);
    const t=((hour%24)+24)%24;
    origin=hour<0||hour>=24||t>20?'fechamento periódico assumido':v.observed?'mediana publicada':'interpolação linear';
  } else if(study==='russell' && group==='mixed') {
    const m=GROUP_COSINOR[hormone], at=t=>m.mesor+m.amplitude*Math.cos(2*Math.PI*(t-m.peak)/24);
    value=at(hour); baseline=reference==='08h'?at(8):m.mesor; unit=m.unit; origin='reconstrução do cosinor publicado';
  } else throw new RangeError('Curva indisponível para esta população');
  return {value,unit,baseline,percent:100*value/baseline,origin,observed:origin==='mediana publicada'};
}
export function studyCSV(study, selection, reference='study') {
  if(study==='children') return '\ufeffEstudo;População;Indicador;Valor;Unidade;Origem\r\nRose 1989;5–18 anos;Média dos mínimos individuais;1.6;mUI/L;Resumo publicado\r\nRose 1989;5–18 anos;Média dos máximos individuais;3.7;mUI/L;Resumo publicado\r\nRose 1989;5–18 anos;Média do aumento individual vale-pico;144;% do vale individual;Resumo publicado\r\nMantagos 1992;1–2 meses;Média janela 11h;2.8;mUI/L;Resumo publicado\r\nMantagos 1992;1–2 meses;Média janela 23h;3.5;mUI/L;Resumo publicado\r\nMantagos 1992;3–4 meses;Média janela 11h;3;mUI/L;Resumo publicado\r\nMantagos 1992;3–4 meses;Média janela 23h;4.1;mUI/L;Resumo publicado\r\nMantagos 1992;5–6 meses;Média janela 11h;1.8;mUI/L;Resumo publicado\r\nMantagos 1992;5–6 meses;Média janela 23h;2.6;mUI/L;Resumo publicado';
  const rows=[['Estudo','DOI','Grupo','Horário (h)','Hormônio','Valor','Unidade','Referência percentual','Valor da referência','Variação (%)','Origem']];
  const times=study==='zhang'?HOURS:Array.from({length:97},(_,i)=>i/4);
  for(const g of studyGroups(study,selection)) for(const t of times) for(const h of ['tsh','ft4','ft3']) {
    const d=studyValue(study,g,h,t,reference);
    rows.push([STUDIES[study].label,STUDIES[study].doi,groupLabel(g),t,DAILY_HORMONES[h].label,d.value,d.unit,reference==='08h'?'valor da série às 08h':STUDIES[study].reference,d.baseline,d.percent-100,d.origin]);
  }
  return '\ufeff'+rows.map(row=>row.map(v=>'"'+String(v).replaceAll('"','""')+'"').join(';')).join('\r\n');
}

