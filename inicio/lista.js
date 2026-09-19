/* Fisiologia Interativa — lista das unidades, filtros, busca (Ctrl K), navegação e janela de entrada.
   Lê os mesmos dados da Célula-Mapa (inicio/dados-<curso>.js). Prof. Mário César Nascimento, PhD © */
(function () {
  'use strict';
  const D = window.FI_DADOS;
  const esc = s => String(s).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const norm = s => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const colorVar = {celular:'--u1', muscular:'--u2', osteoarticular:'--u3', cardiovascular:'--u4', respiratorio:'--u5', integracao:'--u6'};
  const cor = id => 'var(' + colorVar[id] + ')';
  const mapIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 5.5 9 3l6 2.5 6-2.5v14L15 20l-6-2.5-6 2.5z"/><path d="M9 3v14.5M15 5.5V20"/></svg>';
  const lockIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>';

  /* pontos coloridos da barra */
  const dots = document.getElementById('dots');
  D.unidades.forEach(u => {
    const a = document.createElement('a');
    a.href = '#u-' + u.id; a.style.setProperty('--c', cor(u.id));
    a.title = u.num + ' · ' + u.nome; a.setAttribute('aria-label', 'Ir para ' + u.num + ' · ' + u.nome);
    dots.appendChild(a);
  });

  /* filtros */
  const filters = document.getElementById('filters');
  const fdata = [{id:'todos', t:'Todas'}].concat(D.unidades.map(u => ({id:u.id, t:u.curto})));
  let filtro = 'todos';
  fdata.forEach(f => {
    const b = document.createElement('button');
    b.type = 'button'; b.className = 'filter'; b.dataset.f = f.id; b.setAttribute('aria-pressed', f.id === 'todos');
    if (f.id !== 'todos') b.style.setProperty('--c', cor(f.id));
    b.innerHTML = (f.id !== 'todos' ? '<i></i>' : '') + esc(f.t);
    b.onclick = () => { filtro = f.id; filters.querySelectorAll('.filter').forEach(x => x.setAttribute('aria-pressed', x === b)); render(); };
    filters.appendChild(b);
  });

  /* lista */
  const list = document.getElementById('units');
  const search = document.getElementById('search');
  function card(u, s, k) {
    const deep = !!s.deep;
    const leitura = s.leitura ? `<a href="${esc(s.leitura)}" target="_blank" rel="noopener">Leitura complementar ↗</a>` : '';
    return `<article class="card rv${deep ? ' deep' : ''}" style="--c:${cor(u.id)};--i:${(k % 3) + 1}">
      ${deep ? `<span class="badge">${esc(s.deep)}</span>` : `<span class="cat">${esc(s.cat || u.curto)}</span>`}
      <h4>${esc(s.t)}</h4><p>${esc(s.obj)}</p>
      <div class="go"><a href="${esc(s.href)}">${deep && /desafio/.test(s.deep) ? 'Abrir o desafio' : 'Abrir simulador'} →</a>${leitura}</div>
    </article>`;
  }
  function render() {
    const q = norm(search.value.trim());
    let total = 0;
    list.innerHTML = D.unidades.filter(u => filtro === 'todos' || filtro === u.id).map(u => {
      const sims = u.sims.filter(s => !q || norm([s.t, s.obj, s.cat, u.nome].join(' ')).includes(q));
      if (q && !sims.length) return '';
      total += sims.length;
      const maps = u.mapas.map((m, i) => `<button type="button" data-map="${u.id}" data-i="${i}">${mapIcon}${u.mapas.length > 1 ? 'Mapa ' + String(i + 1).padStart(2, '0') : 'Mapa mental'}</button>`).join('');
      return `<section class="unit" id="u-${u.id}" style="--c:${cor(u.id)}" aria-labelledby="h-${u.id}">
        <div class="unit-side rv">
          <span class="unit-num" aria-hidden="true">${u.num}</span>
          <h3 id="h-${u.id}">${esc(u.nome)}</h3>
          <p>${esc(u.desc)}</p>
          <div class="chips">${maps}<a class="lock" href="${esc(u.sala.href)}">${lockIcon}${esc(u.sala.nome)}</a></div>
        </div>
        <div class="cards">${sims.map((s, k) => card(u, s, k)).join('')}</div>
      </section>`;
    }).join('');
    document.getElementById('empty').hidden = total > 0;
  }
  list.addEventListener('click', e => {
    const b = e.target.closest('[data-map]'); if (!b) return;
    if (window.FI_openMap) window.FI_openMap(+b.dataset.i, b.dataset.map);
  });
  search.addEventListener('input', render);
  render();

  /* Ctrl K / ⌘K abre a busca */
  const goSearch = () => { document.getElementById('simuladores').scrollIntoView(); setTimeout(() => search.focus({preventScroll:true}), 250); };
  document.getElementById('btnSearch').addEventListener('click', goSearch);
  addEventListener('keydown', e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); goSearch(); } });

  /* ponto aceso = unidade visível na lista */
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(en => {
      const a = dots.querySelector(`a[href="#${en.target.id}"]`); if (a) a.classList.toggle('on', en.isIntersecting);
    }), {rootMargin: '-40% 0px -50% 0px'});
    const watch = () => list.querySelectorAll('.unit').forEach(s => io.observe(s));
    watch(); new MutationObserver(watch).observe(list, {childList: true});
  }

  /* surgimento ao rolar: a abertura aparece ao entrar; do "Mapa das unidades" para baixo,
     nada aparece antes de o aluno começar a rolar a página */
  if (document.documentElement.classList.contains('js-rv')) {
    let rolou = scrollY > 40 || !!location.hash;
    const rvIO = new IntersectionObserver(es => es.forEach(en => {
      if (!en.isIntersecting) return;
      if (!rolou && !en.target.closest('#inicio')) return;
      en.target.classList.add('in'); rvIO.unobserve(en.target);
    }), {rootMargin: '0px 0px -12% 0px', threshold: .12});
    const armar = () => document.querySelectorAll('.rv:not(.in)').forEach(el => { rvIO.unobserve(el); rvIO.observe(el); });
    const acordar = () => { if (rolou) return; rolou = true; armar(); };
    addEventListener('scroll', () => { if (scrollY > 40) acordar(); }, {passive: true});
    addEventListener('hashchange', acordar);
    armar(); new MutationObserver(armar).observe(list, {childList: true});
  }

  /* janela de entrada: uma vez por sessão, como no site anterior */
  const w = document.getElementById('welcome');
  let visto = false;
  try { visto = sessionStorage.getItem('fisiologia-didactic-orientation') === 'acknowledged'; } catch (err) {}
  if (!visto && w.showModal) w.showModal();
  document.getElementById('welcomeAccept').addEventListener('click', () => {
    try { sessionStorage.setItem('fisiologia-didactic-orientation', 'acknowledged'); } catch (err) {}
    w.close();
  });
})();
