(function () {
  'use strict';

  const params = new URLSearchParams(location.search);
  const mode = String(params.get('modo') || '').toLowerCase();
  const tema = String(params.get('tema') || '').trim();
  const pergunta = String(params.get('pergunta') || '').trim();

  if (!mode && !tema && !pergunta) return;

  const normalize = value => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9+]+/g, ' ')
    .trim();

  const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  }[c]));

  const groupAliases = {
    celular: ['celular','membrana','potencial','potenciais'],
    muscular: ['muscular','musculo','excitabilidade','contracao','sarcomero'],
    osteoarticular: ['osteo','osteoarticular','osso','articular'],
    cardiovascular: ['cardiovascular','circulacao','hemodinamica','coracao','sangue'],
    respiratorio: ['respiratorio','respiracao','pulmao','ventilacao'],
    integracao: ['integracao','cardiorrespiratoria','cardiorrespiratorio','exercicio']
  };

  function resolveGroup(value) {
    const q = normalize(value);
    if (!q) return '';
    return Object.entries(groupAliases).find(([, aliases]) => aliases.some(a => q.includes(a)))?.[0] || '';
  }

  function openPanel() {
    const panel = document.querySelector('#tutorPanel');
    const launcher = document.querySelector('#tutorLauncher');
    const hint = document.querySelector('#tutorHint');
    if (!panel || !launcher) return false;
    panel.hidden = false;
    panel.classList.add('is-open');
    launcher.setAttribute('aria-expanded', 'true');
    if (hint) hint.hidden = true;
    return true;
  }

  function addBot(html) {
    const messages = document.querySelector('#tutorMessages');
    if (!messages) return;
    const el = document.createElement('div');
    el.className = 'tutor-message bot';
    el.innerHTML = html;
    messages.appendChild(el);
    messages.scrollTop = messages.scrollHeight;
  }

  function submitPrompt(text) {
    const input = document.querySelector('#tutorInput');
    const form = document.querySelector('#tutorForm');
    if (!input || !form) return false;
    input.value = text;
    form.dispatchEvent(new Event('submit', {bubbles:true, cancelable:true}));
    return true;
  }

  function moduleList(group) {
    const list = (typeof modules !== 'undefined' && Array.isArray(modules)) ? modules : [];
    return group ? list.filter(item => item.group === group) : list;
  }

  function renderModules(items, title) {
    if (!items.length) return '<p>Não encontrei simuladores cadastrados para esse tema.</p>';
    return `<p><b>${escapeHtml(title)}</b></p><div class="tutor-map-list">${items.map(item =>
      `<a class="tutor-link" href="${escapeHtml(item.href)}">${escapeHtml(item.title)}</a>`
    ).join(' ')}</div><p>Escolha um simulador. O Tutor continuará disponível dentro dele.</p>`;
  }

  function renderAprofundamentos(group) {
    const candidates = moduleList(group).filter(item => [
      'da-intencao-ao-movimento.html',
      'sangue.html',
      'ventilacao-pulmonar-neonatal.html'
    ].includes(item.href));

    const items = candidates.length ? candidates : moduleList(group).filter(item =>
      /aprofund|integr|sangue|neonatal|intencao/i.test(`${item.title || ''} ${item.goal || ''} ${item.href || ''}`)
    );

    return renderModules(items, group ? 'Aprofundamentos deste tema' : 'Aprofundamentos disponíveis');
  }

  function init() {
    if (!openPanel()) return;

    const group = resolveGroup(tema);

    if (pergunta) {
      submitPrompt(pergunta);
      return;
    }

    if (mode === 'mapas' || mode === 'mapa') {
      submitPrompt(group ? `mapa mental ${tema}` : 'mapa mental');
      return;
    }

    if (mode === 'simuladores' || mode === 'simulador') {
      addBot(renderModules(moduleList(group), group ? `Simuladores — ${tema}` : 'Qual simulador você quer explorar?'));
      return;
    }

    if (mode === 'aprofundamentos' || mode === 'aprofundamento') {
      addBot(renderAprofundamentos(group));
      return;
    }

    // modo=tutor: abre o Tutor no estado geral, pronto para pergunta livre.
    const input = document.querySelector('#tutorInput');
    if (input) setTimeout(() => input.focus(), 50);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => setTimeout(init, 0), {once:true});
  } else {
    setTimeout(init, 0);
  }
})();
