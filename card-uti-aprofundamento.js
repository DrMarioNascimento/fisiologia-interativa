document.addEventListener('DOMContentLoaded',()=>{
  const IN_FT=location.pathname.includes('/fisioterapia/');
  const SIM=IN_FT
    ? './uti-fisiologica.html?percurso=fisioterapia'
    : './fisioterapia/uti-fisiologica.html?percurso=fisioterapia';
  const norm=value=>(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
  const cardText='uti escape room desafio fechamento integracao cardiorrespiratoria choque sdra hipercalemia';

  const ensureStyle=()=>{
    if(document.getElementById('uti-card-style')) return;
    const style=document.createElement('style');
    style.id='uti-card-style';
    style.textContent=`
      .module-card[data-uti-card="1"]{cursor:default}
      .module-card[data-uti-card="1"] .module-category{text-transform:none;letter-spacing:.035em}
      .module-card[data-uti-card="1"] h3{-webkit-line-clamp:2}
      .uti-kicker{margin:0 0 6px;color:var(--group-color,var(--petrol-800));font-size:.68rem;font-weight:850;letter-spacing:.08em;text-transform:uppercase}
      .uti-actions{display:flex!important;align-items:center!important;flex-flow:row nowrap!important;gap:18px!important;margin-top:auto!important;width:100%!important}
      .uti-actions a{display:inline-flex!important;width:auto!important;min-height:0!important;white-space:nowrap!important;color:var(--group-color,var(--petrol-800));font-size:.7rem;font-weight:900;letter-spacing:.035em;text-decoration:none}
      .uti-actions a:hover{text-decoration:underline;text-underline-offset:4px}
      @media(max-width:420px){.uti-actions{gap:10px!important}.uti-actions a{font-size:.64rem!important}}
    `;
    document.head.appendChild(style);
  };

  const apply=()=>{
    ensureStyle();
    const root=document.querySelector('#moduleGrid');
    if(!root) return;
    const integracao=[...root.querySelectorAll('.curriculum-block')].find(block=>norm(block.querySelector('h3[id]')?.textContent).includes('integracao cardiorrespiratoria'));
    const target=integracao?.querySelector('.module-grid');
    if(!target) return;

    const term=norm(document.querySelector('#search')?.value);
    const named=[...root.querySelectorAll('.module-card')].filter(item=>{
      const title=norm(item.querySelector('h3')?.textContent);
      return title==='escape room' || title==='uti fisiologica' || item.dataset.utiCard==='1';
    });
    const existing=target.querySelector('[data-uti-card="1"]')||named[0];
    named.filter(item=>item!==existing).forEach(item=>item.remove());
    if(term && !cardText.includes(term) && term!=='escape' && term!=='uti' && term!=='desafio'){
      existing?.remove();
      return;
    }

    let card=existing;
    if(!card){
      card=document.createElement('article');
      card.className='module-card';
    }
    card.dataset.utiCard='1';
    card.dataset.deepened='1';
    card.dataset.group='integracao';
    card.dataset.title='escape room';
    card.removeAttribute('href');
    card.removeAttribute('target');
    card.removeAttribute('rel');
    card.removeAttribute('aria-label');
    card.style.cursor='default';
    card.innerHTML=`
      <span class="module-category">Integração - Módulo de aprofundamento</span>
      <div class="uti-kicker">Desafio de fechamento</div>
      <h3>ESCAPE ROOM</h3>
      <p>Plantão de 6 horas: regular água, eletrólitos, circulação, ventilação, ácido-base e rim num único paciente. O monitor mostra o estado; o aluno decide.</p>
      <div class="uti-actions">
        <a href="${SIM}" target="_blank" rel="noopener noreferrer">Abrir simulador →</a>
      </div>`;
    card.querySelectorAll('a').forEach(link=>link.addEventListener('click',event=>event.stopPropagation()));
    if(card.parentElement!==target||card!==target.lastElementChild) target.appendChild(card);
    const count=target.closest('.curriculum-block')?.querySelector('.curriculum-count');
    if(count){
      const n=target.querySelectorAll('.module-card').length;
      count.textContent=`${n} ${n===1?'simulador':'simuladores'}`;
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
