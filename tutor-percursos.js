/* Percursos de Fisiologia: mesmo recurso para EF e Fisioterapia, site e Moodle.
   Acesso público sem Google, sem mesclar os catálogos dos escape rooms. */
(function(){
 'use strict';
 const url='https://fisiologia-em-fuga.drmarionascimento.com.br/percursos/';
 function mount(){
  if(document.getElementById('tutor-percursos-link'))return;
  const fisio=location.pathname.endsWith('/tutor-fisio.html')||new URLSearchParams(location.search).get('percurso')==='fisioterapia';
  const card=document.createElement('aside');
  card.id='tutor-percursos-link';
  card.setAttribute('aria-label','Percursos de Fisiologia: atividade compartilhada');
  card.style.cssText='box-sizing:border-box;margin:12px auto;padding:13px 15px;max-width:1000px;border:1px solid #81c3a5;border-radius:22px 11px 22px 11px;background:linear-gradient(145deg,#e7f9ec,#c6e9d5);box-shadow:inset 0 2px 0 #fff,0 5px 0 #6b9b85,0 11px 20px #092f2828;color:#153f36;font:14px/1.5 system-ui,sans-serif;';
  const heading=document.createElement('strong');
  heading.textContent='Percursos de Fisiologia · EF + Fisioterapia';
  heading.style.display='block';
  const description=document.createElement('span');
  description.textContent='12 unidades, nove contextos e síntese de investigação. Compartilhado pelos dois cursos · teste público sem login Google.';
  description.style.display='block';
  const link=document.createElement('a');
  link.href=url;link.target='_blank';link.rel='noopener noreferrer';
  link.textContent='Explorar os Percursos ↗';
  link.style.cssText='display:inline-block;margin-top:9px;padding:8px 13px;background:linear-gradient(#28765c,#125040);border-radius:12px 7px 12px 7px;color:white;font-weight:700;text-decoration:none;box-shadow:inset 0 1px 0 #fff8,0 3px 0 #0b342a;';
  link.addEventListener('pointerdown',()=>{link.style.transform='translateY(2px)';});
  const reset=()=>{link.style.transform='';};
  link.addEventListener('pointerup',reset);link.addEventListener('pointercancel',reset);link.addEventListener('blur',reset);
  card.append(heading,description,link);
  // In Moodle keep the compact activity card in the teaching interface,
  // outside the chat history. In site views place it adjacent to the study cards.
  const target=document.querySelector('#cards')||document.querySelector('#moodleTutorChat')||document.querySelector('main');
  if(target)target.parentNode.insertBefore(card,target);
  else document.body.append(card);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
