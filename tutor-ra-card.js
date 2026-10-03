/* Destaque comum aos Tutores EF e Fisioterapia; a RA vive neste repositório. */
window.cardRealidadeAumentada = function(percurso, eixo) {
  if(!['celular','cardiovascular','respiratorio','muscular'].includes(eixo))return '';
  const curso=percurso==='fisioterapia'?'fisioterapia':'educacao-fisica';
  const cardiovascular=eixo==='cardiovascular';
  const experiencia=eixo==='celular'?'potencial-membrana':eixo==='muscular'?'musculo-sarcomero':cardiovascular?'retorno-venoso':'pleura';
  const tema=eixo==='celular'?'A película de carga e Forças de Starling · Unidade 1 · Celular':eixo==='muscular'?'Do músculo ao sarcômero · Sistema muscular':cardiovascular?'Coração e retorno venoso · Sistema cardiovascular':'Pleura · Sistema respiratório';
  const acoes=eixo==='celular'?'<a class="btn btn-primary" href="ra/potencial-membrana/?percurso='+curso+'" target="_blank" rel="noopener noreferrer">Película de carga</a><a class="btn btn-primary" href="ra/starling/?percurso='+curso+'" target="_blank" rel="noopener noreferrer">Forças de Starling</a>':cardiovascular?'<a class="btn btn-primary" href="ra/coracao/?percurso='+curso+'" target="_blank" rel="noopener noreferrer">Coração em ação</a><a class="btn btn-primary" href="ra/retorno-venoso/?percurso='+curso+'" target="_blank" rel="noopener noreferrer">Retorno venoso</a>':'<a class="btn btn-primary" href="ra/'+experiencia+'/?percurso='+curso+'" target="_blank" rel="noopener noreferrer">Explorar em realidade aumentada</a>';
  return '<article class="card ra-card"><span class="meta">Uma nova experiência</span><h2>RA - Realidade Aumentada</h2><p class="meta">'+tema+'</p><p class="ra-call">Prepare-se para uma nova experiência em fisiologia humana, venha para essa viagem de aprendizado incrível!</p><div class="actions">'+acoes+'</div></article>';
};
