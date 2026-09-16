(function () {
  'use strict';
  function hasHref(list, href) {
    return (list || []).some(function (item) { return item && item.href === href; });
  }

  var atleta = {
    group: 'integracao',
    title: 'Box do Atleta',
    href: 'atleta-box.html',
    goal: 'Conduzir um atleta em Ironman, maratona, ultra ou aventura: ritmo, hidratação, sódio, calor e carboidrato acoplados.',
    steps: [
      'Escolha o caso e leia o que o atleta pede.',
      'Defina intensidade e o plano de bebida antes da natação acabar.',
      'Mude uma variável por vez e veja TC, Na⁺, glicemia e peso.'
    ],
    qs: [
      { q: 'Beber água demais, acima do suor, tende a:', opts: ['Subir o Na⁺ plasmático', 'Baixar o Na⁺ (hiponatremia) com peso acima da largada', 'Só aumentar o glicogênio'], a: 1, why: 'A água dilui o sódio; o peso sobe ou cai pouco.' },
      { q: 'Glicose + frutose (2:1) comparado a só glicose, na mesma gramatura:', opts: ['Absorve menos', 'Absorve mais porque usa dois transportadores', 'Não muda a absorção'], a: 1, why: 'SGLT1 e GLUT5 em paralelo elevam o teto (~90 g/h).' },
      { q: 'Corrida forte no calor da tarde aumenta o risco de:', opts: ['Hipotermia', 'Intermação (TC alta)', 'Hiponatremia por falta de água'], a: 1, why: 'Produção de calor > perda; o núcleo sobe.' },
      { q: 'Quem sua muito sal e bebe só água precisa repor:', opts: ['Só frutose', 'Água e sódio', 'Somente cafeína'], a: 1, why: 'O suor leva Na⁺; repor só água dilui o plasma.' },
      { q: 'O sensor de glicose do box atrasa cerca de:', opts: ['10 minutos', '2 horas', 'Não atrasa'], a: 0, why: 'CGM lê o interstício, não o plasma instantâneo.' }
    ]
  };

  var uti = {
    group: 'integracao',
    title: 'ESCAPE ROOM — Plantão de UTI',
    href: 'fisioterapia/uti-fisiologica.html',
    goal: 'Plantão de 6 h: água, eletrólitos, circulação, ventilação, ácido-base e rim num único paciente.',
    steps: [
      'Leia o caso (SDRA, choque, hipercalemia…).',
      'Olhe o monitor e a gasometria antes de agir.',
      'Mude uma conduta e acompanhe PAM, DC, RVS, DO₂ e lactato.'
    ],
    qs: [
      { q: 'PAM se relaciona com DC e RVS por:', opts: ['PAM ≈ DC × RVS + PVC', 'PAM = FC × SaO₂', 'PAM = pH × PaCO₂'], a: 0, why: 'A pressão é o produto do fluxo pela resistência, somada à PVC.' },
      { q: 'DO₂ (oferta de O₂) é:', opts: ['DC × CaO₂ × 10', 'Só a SpO₂', 'Só o lactato'], a: 0, why: 'Oferta = fluxo × conteúdo arterial.' },
      { q: 'Platô > 30 cmH₂O no volume corrente sugere:', opts: ['Lesão pulmonar pelo ventilador', 'Que o pH está alto', 'Que o DC subiu'], a: 0, why: 'Pressão de platô alta distende demais o alvéolo.' },
      { q: 'SvO₂ baixa com DC baixo indica:', opts: ['O tecido extraiu mais porque chegou pouco', 'Saturação arterial de 100%', 'Alcalose respiratória isolada'], a: 0, why: 'Cai a oferta; a extração sobe e o venoso desce.' },
      { q: 'Este plantão é:', opts: ['Modelo didático de fisiologia, não conduta clínica', 'Prescrição para UTI real', 'Substitui gasometria do laboratório'], a: 0, why: 'Ensina integração; não substitui o paciente.' }
    ]
  };

  if (typeof escapeRooms === 'object' && escapeRooms) {
    escapeRooms.atleta = { title: 'BOX DO ATLETA', href: 'atleta-box.html', goal: atleta.goal };
  }
  if (typeof modules !== 'undefined' && Array.isArray(modules) && !hasHref(modules, atleta.href)) {
    modules.push(atleta);
  }

  if (window.fisioterapiaTutor) {
    window.fisioterapiaTutor.escapeRooms = window.fisioterapiaTutor.escapeRooms || {};
    window.fisioterapiaTutor.escapeRooms.uti = { title: uti.title, href: uti.href, goal: uti.goal };
    if (Array.isArray(window.fisioterapiaTutor.modules) && !hasHref(window.fisioterapiaTutor.modules, uti.href)) {
      window.fisioterapiaTutor.modules.push(uti);
    }
  }

  function integracaoAtiva() {
    var btn = document.querySelector('.axis[aria-pressed="true"]');
    if (!btn) return false;
    return btn.getAttribute('data-id') === 'integracao' || btn.getAttribute('data-axis') === 'integracao';
  }

  function card(title, lead, href, label) {
    return '<article class="card escape-card" data-desafio-extra="1">' +
      '<span class="meta">Desafio de fechamento</span>' +
      '<h2>' + title + '</h2>' +
      '<p class="escape-call">' + lead + '</p>' +
      '<div class="actions"><a class="btn btn-primary" href="' + href + '">' + label + '</a></div>' +
      '</article>';
  }

  function pintar() {
    var grid = document.querySelector('#cards');
    if (!grid || !integracaoAtiva()) return;
    if (grid.querySelector('[data-desafio-extra="1"]')) return;
    var html = '';
    if (typeof escapeRooms === 'object' && escapeRooms && escapeRooms.atleta) {
      html += card('BOX DO ATLETA', 'Prova longa — o box mostra o estado; você decide o plano.', 'atleta-box.html', 'Abrir o box');
    }
    if (window.fisioterapiaTutor && window.fisioterapiaTutor.escapeRooms && window.fisioterapiaTutor.escapeRooms.uti) {
      html += card('ESCAPE ROOM', 'Plantão de UTI — o monitor mostra o estado; você decide.', 'fisioterapia/uti-fisiologica.html?percurso=fisioterapia', 'Abrir o plantão');
    }
    if (html) grid.insertAdjacentHTML('beforeend', html);
  }

  document.addEventListener('click', function (event) {
    if (event.target.closest && event.target.closest('.axis')) setTimeout(pintar, 50);
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { setTimeout(pintar, 80); });
  else setTimeout(pintar, 80);
})();
