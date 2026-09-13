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
  function tokens(value) {
    return norm(value).split(/[^a-z0-9]+/).filter(function (part) { return part.length >= 3 || /^(pa|dc|hb|o2)$/.test(part); });
  }
  function stemHit(a, b) {
    if (!a || !b) return false;
    return a === b || (a.length >= 3 && b.length >= 3 && (a.indexOf(b) === 0 || b.indexOf(a) === 0));
  }
  var shortHints = {
    fick: 'fick-integrado-cardiorrespiratorio.html',
    vo2: 'consumo-o2-debito-cardiaco-diferenca-av.html',
    avo2: 'consumo-o2-debito-cardiaco-diferenca-av.html',
    wolff: 'mecanotransducao-lei-de-wolff.html',
    mecano: 'mecanotransducao-lei-de-wolff.html',
    pth: 'homeostase-do-calcio.html',
    calcio: 'homeostase-do-calcio.html',
    sglt: 'transporte-ativo-secundario-sglt.html',
    poiseu: 'lei-de-poiseuille.html',
    hill: 'modelos-hill-isocinetico.html',
    isocin: 'modelos-hill-isocinetico.html',
    hemo: 'curva-dissociacao-hemoglobina.html',
    vent: 'ventilacao-pulmonar.html',
    folego: 'ventilacao-pulmonar.html',
    retorno: 'retorno-venoso.html',
    loop: 'loop-cardiaco-funcional.html',
    sarcom: 'contracao-muscular-sarcomero.html',
    placa: 'contracao-muscular-esqueletica.html',
    neuronio: 'neuronio-interativo.html',
    sgl: 'transporte-ativo-secundario-sglt.html',
    clasto: 'homeostase-do-calcio.html',
    blasto: 'homeostase-do-calcio.html',
    osteo: 'mecanotransducao-lei-de-wolff.html',
    rpt: 'hemodinamica-pa-dc-rpt.html',
    hemodin: 'hemodinamica-pa-dc-rpt.html'
  };
  function matchModule(query) {
    const q = norm(query);
    const qTokens = tokens(query);
    var hinted = null;
    qTokens.concat(q.split(' ').filter(Boolean)).forEach(function (tok) {
      Object.keys(shortHints).forEach(function (key) {
        if (stemHit(tok, key) || q.indexOf(key) !== -1) {
          hinted = shortHints[key];
        }
      });
    });
    if (hinted) {
      var foundHint = catalogModules().filter(function (item) { return item.href === hinted; })[0];
      if (foundHint) return foundHint;
    }
    var best = null, score = 0, second = 0;
    catalogModules().forEach(function (item) {
      const title = norm(item.title);
      const slug = norm(String(item.href || '').replace('.html', '').replace(/-/g, ' '));
      const itemTokens = tokens(item.title + ' ' + item.href + ' ' + (item.goal || ''));
      var s = 0;
      if (title && q.indexOf(title) !== -1) s += 12;
      if (slug && q.indexOf(slug) !== -1) s += 8;
      qTokens.forEach(function (tok) {
        itemTokens.forEach(function (part) {
          if (tok === part) s += tok.length >= 4 ? 8 : 5;
          else if (stemHit(tok, part)) s += 4;
        });
      });
      if (s > score) { second = score; score = s; best = item; }
      else if (s > second) second = s;
    });
    if (score >= 4 && score > second) return best;
    return score >= 8 ? best : null;
  }
  var axisHints = {
    celular: /celular|membrana|potencial|sodio|potassio|sglt|neuronio/,
    muscular: /muscular|musculo|sarcomero|contracao|miosina|actina|placa motora/,
    osteoarticular: /osteo|osso|osteoclasto|osteoblasto|osteocito|clasto|blasto|calcio|pth|wolff|mecanotransduc|remodel|articular/,
    cardiovascular: /cardio|coracao|pressao|debito|retorno|poiseuille|sangue|hemodinam|\brpt\b|\bpa\b|\bdc\b/,
    respiratorio: /respirat|pulmao|ventil|hemoglobina|surfactante/,
    integracao: /integrac|fick|vo2|extracao|cardiorrespir/
  };
  function guessedAxis(query) {
    const named = matchModule(query);
    if (named && named.group) return named.group;
    const q = norm(query);
    var found = Object.keys(axisHints).filter(function (id) { return axisHints[id].test(q); });
    if (found.indexOf('osteoarticular') !== -1 && isFisioPage()) {
      found = found.filter(function (id) { return id !== 'osteoarticular'; });
    }
    return found[0] || axisId();
  }
  function relatedModules(query) {
    const named = matchModule(query);
    if (named) return [named];
    const axis = guessedAxis(query);
    const list = catalogModules();
    var scored = list.map(function (item) {
      const hay = norm([item.title, item.goal, item.group, (item.steps || []).join(' ')].join(' '));
      var score = 0;
      tokens(query).forEach(function (term) {
        if (hay.indexOf(term) !== -1) score += 3;
        hay.split(' ').forEach(function (part) { if (stemHit(term, part)) score += 2; });
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
    var html = opts.afterAi ? '<p><b>Para continuar neste tutor:</b></p>' : '<p>Encontrei estes recursos da disciplina:</p>';
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
  function selectCard(module) {
    if (!module) return;
    document.querySelectorAll('#cards .card').forEach(function (card) {
      var title = card.querySelector('h2');
      if (title && title.textContent === module.title) card.click();
    });
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
  var nativeFetch = window.fetch;
  window.fetch = function (url, options) {
    try {
      const target = String(url || '');
      if (options && options.body && /\/api\/tutor/.test(target)) {
        const body = JSON.parse(options.body);
        const named = matchModule(body.message || '');
        if (named) {
          body.module = named.href;
          options = Object.assign({}, options, { body: JSON.stringify(body) });
        }
      }
    } catch (error) {}
    return options === undefined ? nativeFetch.call(this, url) : nativeFetch.call(this, url, options);
  };
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
      var named = matchModule(text);
      if (named) selectCard(named);
      if (aiOn) pendingAiQuery = text;
    }, true);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready);
  else setTimeout(ready, 0);
})();
