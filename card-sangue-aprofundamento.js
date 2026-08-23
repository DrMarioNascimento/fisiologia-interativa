document.addEventListener('DOMContentLoaded',()=>{
  const ROOT=location.pathname.includes('/fisioterapia/')?'../':'./';
  const SIM=`${ROOT}sangue.html`;
  const READING=`${ROOT}assets/leituras/Sangue_Guia_Visual_Prof_Mario_Nascimento.pdf?v=20260823`;
  const norm=value=>(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const cardText='sangue cardiovascular hematopoiese hemacias leucocitos plaquetas oxigenio hemodinamica';

  const ensureStyle=()=>{
    if(document.getElementById('sangue-card-style')) return;
    const style=document.createElement('style');
    style.id='sangue-card-style';
    style.textContent=`
      .module-card[data-sangue-card="1"]{cursor:default}
      .module-card[data-sangue-card="1"] .module-category{text-transform:none;letter-spacing:.035em}
      .module-card[data-sangue-card="1"] h3{-webkit-line-clamp:1}
      .sangue-actions{display:flex!important;align-items:center!important;flex-flow:row nowrap!important;gap:18px!important;margin-top:auto!important;width:100%!important}
      .sangue-actions a{display:inline-flex!important;width:auto!important;min-height:0!important;white-space:nowrap!important;color:var(--group-color,var(--petrol-800));font-size:.7rem;font-weight:900;letter-spacing:.035em;text-decoration:none}
      .sangue-actions a:hover{text-decoration:underline;text-underline-offset:4px}
      @media(max-width:420px){.sangue-actions{gap:10px!important}.sangue-actions a{font-size:.64rem!important}}
    `;
    document.head.appendChild(style);
  };

  const apply=()=>{
    ensureStyle();
    const root=document.querySelector('#moduleGrid');
    if(!root) return;
    const cardiovascular=[...root.querySelectorAll('.curriculum-block')].find(block=>norm(block.querySelector('h3[id]')?.textContent).includes('sistema cardiovascular'));
    const target=cardiovascular?.querySelector('.module-grid');
    if(!target) return;

    const term=norm(document.querySelector('#search')?.value);
    const bloodCards=[...root.querySelectorAll('.module-card')].filter(item=>norm(item.querySelector('h3')?.textContent)==='sangue');
    const existing=target.querySelector('[data-sangue-card="1"]')||bloodCards[0];
    bloodCards.filter(item=>item!==existing).forEach(item=>item.remove());
    if(term && !cardText.includes(term)){
      existing?.remove();
      return;
    }

    let card=existing;
    if(!card){
      card=document.createElement('article');
      card.className='module-card';
      card.dataset.sangueCard='1';
      card.dataset.deepened='1';
      card.dataset.group='cardiovascular';
      card.dataset.title='sangue';
      card.innerHTML=`
        <span class="module-category">Cardiovascular - Módulo de aprofundamento</span>
        <h3>Sangue</h3>
        <p>Integrar hematopoiese, transporte de oxigênio, viscosidade, débito cardíaco e respostas fisiológicas em cenários clínicos e de exercício.</p>
        <div class="sangue-actions">
          <a href="${READING}" target="_blank" rel="noopener noreferrer">LEITURA COMPLEMENTAR →</a>
          <a href="${SIM}" target="_blank" rel="noopener noreferrer">Abrir simulador →</a>
        </div>`;
    }
    if(card.parentElement!==target||card!==target.lastElementChild) target.appendChild(card);
    const count=target.closest('.curriculum-block')?.querySelector('.curriculum-count');
    if(count){const n=target.querySelectorAll('.module-card').length;count.textContent=`${n} ${n===1?'simulador':'simuladores'}`;}
  };

  let queued=false;
  const queue=()=>{
    if(queued) return;
    queued=true;
    requestAnimationFrame(()=>{queued=false;apply();});
  };

  const observer=new MutationObserver(queue);
  const grid=document.querySelector('#moduleGrid');
  if(grid) observer.observe(grid,{childList:true,subtree:true});
  document.querySelector('#search')?.addEventListener('input',()=>setTimeout(apply,0));
  document.querySelectorAll('.filter').forEach(button=>button.addEventListener('click',()=>setTimeout(apply,0)));
  apply();
  setTimeout(apply,400);
  setTimeout(apply,1400);
});
