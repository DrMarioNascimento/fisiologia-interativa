document.addEventListener('DOMContentLoaded',()=>{
  const IN_FT=location.pathname.includes('/fisioterapia/');
  if(IN_FT) return;
  const SIM='./atleta-box.html?percurso=educacao-fisica';
  const norm=value=>(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const cardText='box atleta ironman maratona ultra aventura hidratacao glicogenio calor';

  const apply=()=>{
    const root=document.querySelector('#moduleGrid');
    if(!root) return;
    const integracao=[...root.querySelectorAll('.curriculum-block')].find(block=>norm(block.querySelector('h3[id]')?.textContent).includes('integracao cardiorrespiratoria'));
    const target=integracao?.querySelector('.module-grid');
    if(!target) return;
    const term=norm(document.querySelector('#search')?.value);
    const named=[...root.querySelectorAll('.module-card')].filter(item=>item.dataset.atletaCard==='1'||norm(item.querySelector('h3')?.textContent)==='box do atleta');
    if(term && !cardText.includes(term) && !['atleta','ironman','box','ultra'].some(k=>term.includes(k))){
      named.forEach(i=>i.remove()); return;
    }
    let card=target.querySelector('a.module-card[data-atleta-card="1"]');
    named.filter(i=>i!==card).forEach(i=>i.remove());
    if(card && card.getAttribute('href')===SIM && card===target.lastElementChild) return;
    if(!card){ card=document.createElement('a'); target.appendChild(card); }
    card.className='module-card';
    card.dataset.atletaCard='1';
    card.dataset.deepened='1';
    card.dataset.group='integracao';
    card.dataset.title='box do atleta';
    card.href=SIM; card.target='_blank'; card.rel='noopener noreferrer';
    card.setAttribute('aria-label','Abrir simulador Box do Atleta');
    card.style.cursor='pointer';
    card.innerHTML=`
      <span class="module-category">Integração - Módulo de aprofundamento</span>
      <div style="margin:0 0 6px;color:var(--group-color,var(--petrol-800));font-size:.68rem;font-weight:850;letter-spacing:.08em;text-transform:uppercase">Desafio de fechamento</div>
      <h3>BOX DO ATLETA</h3>
      <p>Provas longas: ritmo, água, sódio, calor, glicogênio e intestino no mesmo atleta. O box mostra o estado; o aluno decide o plano.</p>
      <div style="margin-top:auto;color:var(--group-color,var(--petrol-800));font-size:.7rem;font-weight:900">Abrir simulador →</div>`;
    if(card!==target.lastElementChild) target.appendChild(card);
    const count=target.closest('.curriculum-block')?.querySelector('.curriculum-count');
    if(count){const n=target.querySelectorAll('.module-card').length;count.textContent=`${n} ${n===1?'simulador':'simuladores'}`;} 
  };
  const grid=document.querySelector('#moduleGrid');
  if(grid) new MutationObserver(()=>requestAnimationFrame(apply)).observe(grid,{childList:true,subtree:true});
  apply();
  setTimeout(apply,400);
  setTimeout(apply,1400);
});
