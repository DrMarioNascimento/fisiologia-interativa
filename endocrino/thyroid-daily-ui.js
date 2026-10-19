import { HOURS, DAILY_GROUPS, DAILY_HORMONES, groupsFor, dailyValue, dailyCSV } from './thyroid-daily-data.js';
export function mountDailyView({ pauseExperiment, drawExperiment }) {
  const $ = id => document.getElementById(id);
  let mode = 'daily', hour = 8, timer = null;
  const visible = new Set(['tsh', 'ft4', 'ft3']);
  const number = value => value.toLocaleString('pt-BR', { maximumFractionDigits: 2 });
  const delta = value => (value >= 0 ? '+' : '') + number(value) + '%';
  const time = value => { const minutes = Math.round(value * 60); return String(Math.floor(minutes / 60)).padStart(2, '0') + ':' + String(minutes % 60).padStart(2, '0'); };
  const escape = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('"', '&quot;');
  function stop() { clearInterval(timer); timer = null; $('daily-play').textContent = 'Animar 24 h'; }
  function setView(next) {
    if (next === mode) return;
    stop(); pauseExperiment(); mode = next;
    const daily = mode === 'daily';
    $('daily-results').hidden = $('daily-controls').hidden = !daily;
    $('experiment-results').hidden = $('experiment-controls').hidden = $('experiment-data').hidden = daily;
    $('view-daily').setAttribute('aria-pressed', String(daily));
    $('view-experiment').setAttribute('aria-pressed', String(!daily));
    $('investigation-mode-title').textContent = daily ? 'Explore o ritmo diário' : 'Modifique uma variável';
    $('investigation-mode-description').textContent = daily ? 'Compare os grupos e percorra os horários observados.' : 'Faça uma previsão, altere um controle e avance o tempo para testar sua hipótese.';
    if (daily) render(); else drawExperiment();
  }
  function render() {
    if (mode !== 'daily') return;
    const groups = groupsFor($('daily-sex').value);
    const ids = [...visible];
    $('daily-hour').value = hour;
    $('daily-clock').textContent = $('daily-hour-value').textContent = time(hour);
    const width = Math.max(280, Math.min(900, $('daily-chart').clientWidth || 900));
    const height = width < 500 ? 310 : 340, left = width < 500 ? 60 : 72, right = width - 24, bottom = height - 60;
    const values = groups.flatMap(group => ids.flatMap(id => HOURS.map(h => dailyValue(group, id, h).percent)));
    const low = Math.min(100, ...values), high = Math.max(100, ...values);
    const spread = Math.max(10, high - low + 10), rawStep = spread / 4;
    const magnitude = 10 ** Math.floor(Math.log10(rawStep));
    const fraction = rawStep / magnitude;
    const step = (fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 5 ? 5 : 10) * magnitude;
    const yMin = Math.max(0, Math.floor((low - 5) / step) * step), yMax = Math.ceil((high + 5) / step) * step;
    const x = value => left + value / 24 * (right - left);
    const y = value => 30 + (bottom - 30) * (yMax - value) / (yMax - yMin);
    $('daily-chart').setAttribute('viewBox', '0 0 ' + width + ' ' + height);
    let svg = '<title id="daily-chart-title">Perfis diários: ' + groups.map(g => DAILY_GROUPS[g].label).join(' e ') + '</title><desc id="daily-chart-desc">Medianas publicadas em seis horários. Linhas interpoladas; percentual da média de cada grupo.</desc>';
    for (let value = yMin; value <= yMax + step / 10; value += step) svg += '<line class="daily-grid" x1="' + left + '" x2="' + right + '" y1="' + y(value) + '" y2="' + y(value) + '"/><text x="' + (left - 8) + '" y="' + (y(value) + 4) + '" text-anchor="end">' + number(value) + '%</text>';
    for (const value of [...HOURS, 24]) svg += '<line class="daily-grid" x1="' + x(value) + '" x2="' + x(value) + '" y1="30" y2="' + bottom + '"/><text x="' + x(value) + '" y="' + (bottom + 22) + '" text-anchor="middle">' + (width < 500 ? value : String(value).padStart(2, '0') + 'h') + '</text>';
    svg += '<text x="' + left + '" y="17">% da média do grupo</text><text x="' + ((left + right) / 2) + '" y="' + (height - 10) + '" text-anchor="middle">Horário · horas</text><line class="daily-basal" x1="' + left + '" x2="' + right + '" y1="' + y(100) + '" y2="' + y(100) + '"/>';
    for (const group of groups) for (const id of ids) {
      const info = DAILY_HORMONES[id], dashed = group === 'women' ? ' stroke-dasharray="7 5"' : '';
      const points = [...HOURS, 24].map(h => x(h) + ',' + y(dailyValue(group, id, h).percent)).join(' ');
      svg += '<polyline class="daily-series" data-group="' + group + '" data-daily-series="' + id + '" points="' + points + '" fill="none" stroke="' + info.color + '" stroke-width="2.5"' + dashed + '/>';
      for (const h of HOURS) {
        const value = dailyValue(group, id, h);
        svg += '<circle cx="' + x(h) + '" cy="' + y(value.percent) + '" r="3" fill="' + (group === 'women' ? '#0b202e' : info.color) + '" stroke="' + info.color + '" stroke-width="1.5"><title>' + escape(DAILY_GROUPS[group].label + ' · ' + time(h) + ' · ' + info.label + ': ' + number(value.value) + ' ' + info.unit) + '</title></circle>';
      }
    }
    svg += '<line class="daily-cursor" x1="' + x(hour) + '" x2="' + x(hour) + '" y1="30" y2="' + bottom + '"/>';
    $('daily-chart').innerHTML = svg;
    $('daily-caption').textContent = time(hour) + ' · ' + (hour % 4 === 0 && hour < 24 ? 'horário de coleta publicado' : hour === 24 ? 'repetição de 00:00 para fechar o ciclo' : 'valor interpolado entre coletas') + ' · fonte: Zhang et al., 2023.';
    const cards = ids.map(id => {
      const article = document.createElement('article'); article.className = 'daily-readout metric-card';
      article.style.setProperty('--series', DAILY_HORMONES[id].color);
      const title = document.createElement('h3'); title.textContent = DAILY_HORMONES[id].label; article.append(title);
      for (const group of groups) {
        const data = dailyValue(group, id, hour), line = document.createElement('p');
        line.textContent = DAILY_GROUPS[group].label + ': ' + number(data.value) + ' ' + DAILY_HORMONES[id].unit + ' · ' + delta(data.percent - 100) + ' da média';
        article.append(line);
      }
      return article;
    });
    $('daily-readouts').replaceChildren(...cards);
    const rows = [];
    for (const h of HOURS) for (const group of groups) {
      const row = document.createElement('tr');
      const cells = [time(h), DAILY_GROUPS[group].label, ...['tsh', 'ft4', 'ft3'].flatMap(id => { const data = dailyValue(group, id, h); return [number(data.value), delta(data.percent - 100)]; })];
      for (const value of cells) { const cell = document.createElement('td'); cell.textContent = value; row.append(cell); }
      rows.push(row);
    }
    $('daily-table').replaceChildren(...rows);
    $('daily-reading').textContent = 'TSH: valores maiores na madrugada nesta coorte. Compare a oscilação mais ampla do TSH às mudanças pequenas de T4 livre e T3 livre. Uma diferença entre medianas de grupos não prevê o perfil de uma pessoa.';
    const keyItems = $('sex-legend').querySelectorAll('span');
    keyItems[0].hidden = !groups.includes('men'); keyItems[1].hidden = !groups.includes('women');
  }
  $('view-daily').addEventListener('click', () => setView('daily'));
  $('view-experiment').addEventListener('click', () => setView('experiment'));
  $('daily-sex').addEventListener('change', render);
  $('daily-hour').addEventListener('input', () => { stop(); hour = Number($('daily-hour').value); render(); });
  $('daily-step').addEventListener('click', () => { stop(); hour = (hour + 1) % 24; render(); });
  $('daily-reset').addEventListener('click', () => { stop(); hour = 8; render(); });
  $('daily-play').addEventListener('click', () => {
    if (timer) { stop(); return; }
    $('daily-play').textContent = 'Pausar';
    timer = setInterval(() => { hour = (hour + 0.25) % 24; render(); }, 500);
  });
  for (const button of document.querySelectorAll('[data-daily-hormone]')) button.addEventListener('click', () => {
    const id = button.dataset.dailyHormone;
    if (visible.has(id)) { if (visible.size === 1) return; visible.delete(id); } else visible.add(id);
    for (const item of document.querySelectorAll('[data-daily-hormone]')) { const selected = visible.has(item.dataset.dailyHormone); item.setAttribute('aria-pressed', String(selected)); item.disabled = selected && visible.size === 1; }
    render();
  });
  $('daily-export').addEventListener('click', () => {
    const blob = new Blob([dailyCSV($('daily-sex').value)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob), link = document.createElement('a');
    link.href = url; link.download = 'tireoide-24h-' + $('daily-sex').value + '.csv'; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  document.defaultView?.addEventListener('resize', render);
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  render();
  return { showExperiment: () => setView('experiment') };
}
