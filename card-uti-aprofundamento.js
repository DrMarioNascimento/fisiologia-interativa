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
      a.module-card[data-uti-card="1"]{cursor:pointer;text-decoration:none;color:inherit}
      .module-card[data-uti-card="1"] .module-category{text-transform:none;letter-spacing:.035em}
      .module-card[data-uti-card="1"] h3{-webkit-line-clamp:2}
      .uti-kicker{margin:0 0 6px;color:var(--group-color,var(--petrol-800));font-size:.68rem;font-weight:850;letter-spacing:.08em;text-transform:uppercase}
      .uti-actions{margin-top:auto;color:var(--group-color,var(--petrol-800));font-size:.7rem;font-weight:900;letter-spacing:.035em}
    `;
    document.head.appendChild(style);
  };

  const markup=()=>`
      <span class="module-category">Integração - Módulo de aprofundamento</span>
      <div class="uti-kicker">Desafio de fechamento</div>
      <h3>ESCAPE ROOM</h3>
      <p>Plantão de 6 horas: regular água, eletrólitos, circulação, ventilação, ácido-base e rim num único paciente. O monitor mostra o estado; o aluno decide.</p>
      <div class="uti-actions">Abrir simulador →</div>`;

  const paint=card=>{
    card.className='module-card';
    card.dataset.utiCard='1';
    card.dataset.deepened='1';
    card.dataset.group='integracao';
    card.dataset.title='escape room';
    card.href=SIM;
    card.target='_blank';
    card.rel='noopener noreferrer';
    card.setAttribute('aria-label','Abrir simulador ESCAPE ROOM');
    card.style.cursor='pointer';
    card.innerHTML=markup();
    return card;
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
    if(term && !cardText.includes(term) && term!=='escape' && term!=='uti' && term!=='desafio'){
      named.forEach(item=>item.remove());
      return;
    }

    let card=target.querySelector('a.module-card[data-uti-card="1"]');
    named.filter(item=>item!==card).forEach(item=>item.remove());
    if(card && card.getAttribute('href')===SIM && card.parentElement===target && card===target.lastElementChild){
      const count=target.closest('.curriculum-block')?.querySelector('.curriculum-count');
      if(count){const n=target.querySelectorAll('.module-card').length;count.textContent=`${n} ${n===1?'simulador':'simuladores'}`;} 
      return;
    }
    if(!card){
      card=document.createElement('a');
      target.appendChild(paint(card));
    }else{
      paint(card);
      if(card.parentElement!==target||card!==target.lastElementChild) target.appendChild(card);
    }
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
