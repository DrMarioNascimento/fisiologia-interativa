document.addEventListener('DOMContentLoaded',()=>{
  const ROOT=location.pathname.includes('/fisioterapia/')?'../':'./';
  const SIM=`${ROOT}ventilacao-pulmonar-neonatal.html?percurso=fisioterapia`;
  const READING=`${ROOT}assets/leituras/Ventilacao_Pulmonar_Neonatal_Guia_Visual_Prof_Mario_Nascimento.pdf?v=20260902-2`;
  const norm=value=>(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();

  const ensureStyle=()=>{
    if(document.getElementById('neonatal-card-style')) return;
    const style=document.createElement('style');
    style.id='neonatal-card-style';
    style.textContent=`
      .module-card[data-neonatal-card="1"]{cursor:default}
      .module-card[data-neonatal-card="1"] .module-category{text-transform:none;letter-spacing:.035em}
      .module-card[data-neonatal-card="1"] h3{-webkit-line-clamp:2}
      .neonatal-actions{display:flex!important;align-items:center!important;flex-flow:row nowrap!important;gap:18px!important;margin-top:auto!important;width:100%!important}
      .neonatal-actions a{display:inline-flex!important;width:auto!important;min-height:0!important;white-space:nowrap!important;color:var(--group-color,var(--petrol-800));font-size:.7rem;font-weight:900;letter-spacing:.035em;text-decoration:none}
      .neonatal-actions a:hover{text-decoration:underline;text-underline-offset:4px}
      @media(max-width:420px){.neonatal-actions{gap:10px!important}.neonatal-actions a{font-size:.64rem!important}}
    `;
    document.head.appendChild(style);
  };

  const apply=()=>{
    ensureStyle();
    const root=document.querySelector('#moduleGrid');
    if(!root) return;
    const respiratory=[...root.querySelectorAll('.curriculum-block')].find(block=>norm(block.querySelector('h3[id]')?.textContent).includes('sistema respiratorio'));
    const target=respiratory?.querySelector('.module-grid');
    if(!target) return;

    const cards=[...root.querySelectorAll('.module-card')].filter(card=>norm(card.querySelector('h3')?.textContent)==='ventilacao pulmonar neonatal');
    const card=target.querySelector('[data-neonatal-card="1"]')||cards[0];
    cards.filter(item=>item!==card).forEach(item=>item.remove());
    if(!card) return;
    if(card.dataset.neonatalCard==='1'&&card.parentElement===target&&card===target.lastElementChild) return;

    card.dataset.neonatalCard='1';
    card.dataset.deepened='1';
    card.dataset.group='respiratorio';
    card.dataset.title='ventilação pulmonar neonatal';
    card.removeAttribute('href');
    card.removeAttribute('target');
    card.removeAttribute('rel');
    card.removeAttribute('aria-label');
    card.style.cursor='default';
    card.querySelector('.module-category').textContent='Respiratório - Módulo de aprofundamento';
    card.querySelector('h3').textContent='Ventilação Pulmonar Neonatal';
    card.querySelector('p').textContent='Relacionar idade gestacional ao nascimento, idade pós-natal, massa corporal e maturidade pulmonar à mecânica ventilatória neonatal.';
    card.querySelectorAll('.open-link,.neonatal-actions').forEach(item=>item.remove());
    const actions=document.createElement('div');
    actions.className='neonatal-actions';
    actions.innerHTML=`
      <a href="${READING}" target="_blank" rel="noopener noreferrer">LEITURA COMPLEMENTAR →</a>
      <a href="${SIM}" target="_blank" rel="noopener noreferrer">Abrir simulador →</a>`;
    actions.querySelectorAll('a').forEach(link=>link.addEventListener('click',event=>event.stopPropagation()));
    card.appendChild(actions);
    if(card.parentElement!==target||card!==target.lastElementChild) target.appendChild(card);
    const count=target.closest('.curriculum-block')?.querySelector('.curriculum-count');
    if(count){
      const total=target.querySelectorAll('.module-card').length;
      count.textContent=`${total} ${total===1?'simulador':'simuladores'}`;
    }
  };

  let queued=false;
  const queue=()=>{
    if(queued) return;
    queued=true;
    requestAnimationFrame(()=>{queued=false;apply();});
  };
  const grid=document.querySelector('#moduleGrid');
  if(grid) new MutationObserver(queue).observe(grid,{childList:true,subtree:true});
  document.querySelector('#search')?.addEventListener('input',()=>setTimeout(apply,0));
  document.querySelectorAll('.filter').forEach(button=>button.addEventListener('click',()=>setTimeout(apply,0)));
  apply();
  setTimeout(apply,400);
  setTimeout(apply,1400);
});
