(function () {
  function norm(value) {
    return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }
  function rooms() {
    const catalog = (window.fisioterapiaTutor && location.pathname.endsWith('/tutor-fisio.html'))
      ? window.fisioterapiaTutor.escapeRooms
      : (typeof escapeRooms === 'object' ? escapeRooms : {});
    return Object.entries(catalog || {}).map(function (entry) {
      const id = entry[0], room = entry[1];
      const href = room.href + (String(room.href).indexOf('?') >= 0 ? '&' : '?') + 'origem=site';
      return { id: id, title: room.title, href: href };
    });
  }
  function axisId() {
    return (typeof active !== 'undefined' && active) ? active : '';
  }
  function isGeneric(query) {
    return /^(escape|room|escape room|sala|fuga|cadeado|cadeados|todas|todos)?$/.test(norm(query).trim());
  }
  function htmlFor(query) {
    const list = rooms();
    if (!list.length) return '<p>Não há escape room cadastrado neste tutor.</p>';
    const q = norm(query);
    var selected = [];
    if (!isGeneric(query)) {
      selected = list.filter(function (room) {
        return q.indexOf(room.id) !== -1 || q.indexOf(norm(room.title)) !== -1;
      });
    }
    if (!selected.length && axisId() && !isGeneric(query) === false && q.indexOf('todas') === -1 && q.indexOf('todos') === -1) {
      selected = list.filter(function (room) { return room.id === axisId(); });
    }
    if (!selected.length && axisId() && !/todas|todos/.test(q)) {
      selected = list.filter(function (room) { return room.id === axisId(); });
    }
    if (!selected.length) selected = list;
    const intro = selected.length === 1 ? 'Escape room desta unidade:' : 'Escape rooms da disciplina:';
    return '<p>' + intro + '</p>' + selected.map(function (room) {
      return '<div class="tutor-result"><b>' + room.title + '</b><span>Unidade ' + room.id + '</span><br><a class="tutor-link" href="' + room.href + '">Entrar no escape room</a></div>';
    }).join('');
  }
  function isEscape(text) {
    return /\b(escape|room|fuga|cadeado|cadeados)\b/.test(norm(text));
  }
  function paint(html) {
    var box = document.querySelector('#tutorMessages');
    if (!box) return;
    var el = document.createElement('div');
    el.className = 'tutor-message bot';
    el.innerHTML = html;
    box.appendChild(el);
    box.scrollTop = box.scrollHeight;
  }
  function paintUser(text) {
    var box = document.querySelector('#tutorMessages');
    if (!box) return;
    var el = document.createElement('div');
    el.className = 'tutor-message user';
    el.textContent = text;
    box.appendChild(el);
  }
  function ready() {
    var form = document.querySelector('#tutorForm');
    var chips = document.querySelector('.tutor-chips');
    if (!form) return;
    if (chips && !chips.querySelector('[data-prompt="Escape room"]')) {
      var btn = document.createElement('button');
      btn.className = 'tutor-chip';
      btn.type = 'button';
      btn.dataset.prompt = 'Escape room';
      btn.textContent = 'Escape room';
      chips.appendChild(btn);
      btn.addEventListener('click', function () {
        paintUser('Escape room');
        paint(htmlFor('todas'));
      });
    }
    form.addEventListener('submit', function (event) {
      var input = document.querySelector('#tutorInput');
      var text = input ? input.value : '';
      if (!isEscape(text)) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      paintUser(text.trim());
      if (input) input.value = '';
      paint(htmlFor(text));
    }, true);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', ready);
  else setTimeout(ready, 0);
})();
