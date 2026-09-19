/* Tutores EF e Fisio — cor da unidade ativa nos cartões e links abrindo em nova aba.
   Prof. Mário César Nascimento, PhD © */
(function () {
  var cor = {celular:'#B49BFF', muscular:'#FF9F57', osteoarticular:'#5ED9A6', cardiovascular:'#FF7478', respiratorio:'#63B8FF', integracao:'#3FE0C8'};
  var ax = document.getElementById('axes');
  function pinta() {
    if (!ax) return;
    var b = ax.querySelector('[aria-pressed="true"]'); if (!b) return;
    var id = b.dataset.id || b.dataset.axis;
    if (cor[id]) document.documentElement.style.setProperty('--c', cor[id]);
  }
  if (ax) { new MutationObserver(pinta).observe(ax, {childList:true, subtree:true, attributes:true}); pinta(); }
  /* simuladores, mapas em PDF, salas de fuga: nova aba; "Página inicial" continua na mesma aba */
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href]'); if (!a || a.closest('header')) return;
    var h = a.getAttribute('href') || '';
    if (h.charAt(0) === '#') return;
    a.target = '_blank'; a.rel = 'noopener';
  }, true);
})();
