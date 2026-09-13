(function () {
  function norm(value) {
    return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }
  function isFisioPage() {
    return location.pathname.endsWith('/tutor-fisio.html') || new URLSearchParams(location.search).get('percurso') === 'fisioterapia';
  }
  function catalogRooms() {
    const source = isFisioPage() ? (window.fisioterapiaTutor && window.fisioterapiaTutor.escapeRooms) : (typeof escapeRooms === 'object' ? escapeRooms : {});
    return Object.entries(source || {}).map(function (entry) {
      return {
        id: entry[0],
        title: entry[1].title,
        href: entry[1].href + (String(entry[1].href).indexOf('?') >= 0 ? '&' : '?') + 'origem=site'
      };
    });
  }
  function catalogModules() {
    if (isFisioPage()) return (window.fisioterapiaTutor && window.fisioterapiaTutor.modules) || [];
    return (typeof modules !== 'undefined' && Array.isArray(modules)) ? modules : [];
  }
  function axisId() {
    return (typeof active !== 'undefined' && active) ? active : '';
  }
  var axisHints = {
    celular: /celular|membrana|potencial|sodio|potassio|sglt|neuronio/,
    muscular: /muscular|musculo|sarcimero|sarcomero|contracao|miosina|actina|placa motora/,
    osteoarticular: /osteo|osso|osteoclasto|osteoblasto|osteocito|calcio|pth|wolff|remodel|articular/,
    cardiovascular: /cardio|coracao|pressao|debito|retorno|poiseuille|sangue|hemodinam/,
    respiratorio: /respirat|pulmao|ventil|hemoglobina|surfactante/,
    integracao: /integrac|fick|vo2|extracao|cardiorrespir/
  };
  function guessedAxis(query) {
    const q = norm(query);
    var found = Object.keys(axisHints).filter(function (id) { return axisHints[id].test(q); });
    if (found.indexOf('osteoarticular') !== -1 && isFisioPage()) {
      found = found.filter(function (id) { return id !== 'osteoarticular'; });
    }
    return found[0] || axisId();
  }
  function relatedModules(query) {
    const axis = guessedAxis(query);
    const list = catalogModules();
    const q = norm(query);
    var scored = list.map(function (item) {
      const hay = norm([item.title, item.goal, item.group, (item.steps || []).join(' ')].join(' '));
      var score = 0;
      q.split(' ').filter(function (t) { return t.length > 3; }).forEach(function (term) {
        if (hay.indexOf(term) !== -1) score += 2;
      });
      if (axis && item.group === axis) score += 4;
      return { item: item, score: score };
    }).filter(function (row) { return row.score > 0; }).sort(function (a, b) { return b.score - a.score; });
    var picked = scored.slice(0, 3).map(function (row) { return row.item; });
    if (!picked.length && axis) picked = list.filter(function (item) { return item.group === axis; }).slice(0, 3);
    return picked;
  }
  function relatedRooms(query) {
    const axis = guessedAxis(query);
    const list = catalogRooms();
    if (!list.length) return [];
    if (axis) {
      const match = list.filter(function (room) { return room.id === axis; });
      if (match.length) return match;
    }
    return list;
  }
  function isGenericEscape(query) {
    return /^(escape|room|escape room|sala|fuga|cadeado|cadeados|todas|todos)$/.test(norm(query).trim());
  }
  function isEscape(text) {
    return /\b(escape|room|fuga|cadeado|cadeados)\b/.test(norm(text));
  }
  function moduleHref(href) {
    return href + (isFisioPage() ? '?percurso=fisioterapia' : '');
  }
  function resourcesHtml(query, opts) {
    opts = opts || {};
    const mods = relatedModules(query);
    const rooms = isGenericEscape(query) ? catalogRooms() : relatedRooms(query);
    if (!mods.length && !rooms.length) return '';
    var html = opts.afterAi
      ? '<p><b>Para continuar neste tutor:</b></p>'
      : '<p>Encontrei estes recursos da disciplina:</p>';
    mods.forEach(function (item) {
      html += '<div class="tutor-result"><b>' + item.title + '</b><span>' + (item.goal || '') + '</span><br><a class="tutor-link" href="' + moduleHref(item.href) + '">Abrir simulador</a></div>';
    });
    rooms.slice(0, opts.allRooms ? rooms.length : 1).forEach(function (room) {
      html += '<div class="tutor-result"><b>' + room.title + '</b><span>Escape room · ' + room.id + '</span><br><a class="tutor-link" href="' + room.href + '">Entrar no escape room</a></div>';
    });
    return html;
  }
  function paint(html, who) {
    var box = document.querySelector('#tutorMessages');
    if (!box || !html) return;
    var el = document.createElement('div');
    el.className = 'tutor-message ' + (who || 'bot');
    if (who === 'user') el.textContent = html;
    else el.innerHTML = html;
    box.appendChild(el);
    box.scrollTop = box.scrollHeight;
    return el;
  }
  var pendingAiQuery = '';
  function watchAi() {
    var box = document.querySelector('#tutorMessages');
    if (!box || box.dataset.catalogWatch) return;
    box.dataset.catalogWatch = '1';
    new MutationObserver(function () {
      if (!pendingAiQuery) return;
      var last = box.lastElementChild;
      if (!last || (last.className || '').indexOf('user') !== -1) return;
      var text = last.textContent || '';
      if (!text || /preparando a explic/.test(norm(text))) return;
      if (last.dataset.catalogAttached) return;
      last.dataset.catalogAttached = '1';
      var extra = resourcesHtml(pendingAiQuery, { afterAi: true });
      pendingAiQuery = '';
      if (extra) paint(extra);
    }).observe(box, { childList: true, subtree: true, characterData: true });
  }
  function ready() {
    var form = document.querySelector('#tutorForm');
    var chips = document.querySelector('.tutor-chips');
    if (!form) return;
    watchAi();
    if (chips && !chips.querySelector('[data-prompt="Escape room"]')) {
      var btn = document.createElement('button');
      btn.className = 'tutor-chip';
      btn.type = 'button';
      btn.dataset.prompt = 'Escape room';
      btn.textContent = 'Escape room';
      chips.appendChild(btn);
      btn.addEventListener('click', function () {
        paint('Escape room', 'user');
        paint(resourcesHtml('todas', { allRooms: true }));
      });
    }
    form.addEventListener('submit', function (event) {
      var input = document.querySelector('#tutorInput');
      var text = input ? input.value : '';
      var aiOn = !!(document.querySelector('#tutorAiEnabled') && document.querySelector('#tutorAiEnabled').checked);
      if (isEscape(text)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        paint(text.trim(), 'user');
        if (input) input.value = '';
        paint(resourcesHtml(text, { allRooms: isGenericEscape(text) }));
        return;
      }
      if (aiOn) pendingAiQuery = text;
    }, true);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready);
  else setTimeout(ready, 0);
})();
