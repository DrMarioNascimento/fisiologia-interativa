/* Percursos de Fisiologia: mesmo recurso para EF e Fisioterapia, site e Moodle.
   Acesso público sem Google, sem mesclar os catálogos dos escape rooms. */
(function(){
 'use strict';
 const url='https://fisiologia-em-fuga.drmarionascimento.com.br/percursos/';
 function mount(){
  // Site tutors render paired closing cards directly in their respective course catalogs.
  if(!location.pathname.endsWith('/tutor-moodle.html'))return;
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
  description.textContent='Desafie-se e mostre que pode seguir seu caminho! Ou, fique e estude mais!';
  description.style.display='block';
  const link=document.createElement('a');
  link.href=url;link.target='_blank';link.rel='noopener noreferrer';
  link.textContent='Explorar os Percursos ↗';
  link.style.cssText='display:inline-block;margin-top:9px;padding:8px 13px;background:linear-gradient(#28765c,#125040);border-radius:12px 7px 12px 7px;color:white;font-weight:700;text-decoration:none;box-shadow:inset 0 1px 0 #fff8,0 3px 0 #0b342a;';
  link.addEventListener('pointerdown',()=>{link.style.transform='translateY(2px)';});
  const reset=()=>{link.style.transform='';};
  link.addEventListener('pointerup',reset);link.addEventListener('pointercancel',reset);link.addEventListener('blur',reset);
  card.append(heading,description,link);
  if (!fisio && location.pathname.endsWith('/tutor-moodle.html')) {
   const endocrine=document.createElement('a');
   endocrine.href='https://fisiologia.drmarionascimento.com.br/endocrino/index.html';
   endocrine.target='_blank';endocrine.rel='noopener noreferrer';
   endocrine.textContent='Unidade 06 · Sistema Endócrino (somente EF) ↗';
   endocrine.style.cssText='display:block;margin-top:12px;color:#164c3b;font-weight:700;';
   card.append(endocrine);
  }
  // In Moodle keep the compact activity card in the teaching interface,
  // outside the chat history. In site views place it adjacent to the study cards.
  const target=document.querySelector('#cards')||document.querySelector('#moodleTutorChat')||document.querySelector('main');
  if(target)target.parentNode.insertBefore(card,target);
  else document.body.append(card);
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});else mount();
})();
