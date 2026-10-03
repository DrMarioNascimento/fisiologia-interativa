/* Destaque comum aos Tutores EF e Fisioterapia; a RA vive neste repositório. */
window.cardRealidadeAumentada = function(percurso, eixo) {
  const curso=percurso==='fisioterapia'?'fisioterapia':'educacao-fisica';
  const cardiovascular=eixo==='cardiovascular';
  const experiencia=cardiovascular?'retorno-venoso':'pleura';
  const tema=cardiovascular?'Coração e retorno venoso · Sistema cardiovascular':'Pleura · Sistema respiratório';
  const acoes=cardiovascular?'<a class="btn btn-primary" href="ra/coracao/?percurso='+curso+'" target="_blank" rel="noopener noreferrer">Coração em ação</a><a class="btn btn-primary" href="ra/retorno-venoso/?percurso='+curso+'" target="_blank" rel="noopener noreferrer">Retorno venoso</a>':'<a class="btn btn-primary" href="ra/'+experiencia+'/?percurso='+curso+'" target="_blank" rel="noopener noreferrer">Explorar em realidade aumentada</a>';
  return '<article class="card ra-card"><span class="meta">Uma nova experiência</span><h2>RA - Realidade Aumentada</h2><p class="meta">'+tema+'</p><p class="ra-call">Prepare-se para uma nova experiência em fisiologia humana, venha para essa viagem de aprendizado incrível!</p><div class="actions">'+acoes+'</div></article>';
};
