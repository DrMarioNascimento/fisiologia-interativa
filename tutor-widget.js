(function () {
  'use strict';

  const axisNames = {
    celular: '01 Celular e potenciais de ação', muscular: '02 Excitabilidade e sistema muscular',
    osteoarticular: '03 Osteoarticular', cardiovascular: '04 Cardiovascular',
    respiratorio: '05 Respiratório', integracao: '06 Integração cardiorrespiratória'
  };
  const aliases = {
    'curva-dissociacao-hemoglobina.html': 'curva de o2 oxigenio hemoglobina hb afinidade saturacao efeito bohr ph temperatura 2 3 bpg desvio direita esquerda liberacao tecidos',
    'fick-integrado-cardiorrespiratorio.html': 'extracao de o2 oxigenio principio equacao fick diferenca arteriovenosa av o2 cao2 cvo2 debito cardiaco consumo vo2',
    'consumo-o2-debito-cardiaco-diferenca-av.html': 'extracao muscular oxigenio diferenca av arteriovenosa consumo vo2 absoluto relativo oferta tecido',
    'modelos-hill-isocinetico.html': 'hill isocinetico força velocidade torque potencia carga explosiva',
    'da-intencao-ao-movimento.html': 'intencao movimento cortex via motora motoneuronio recrutamento frequencia disparo drive unidade motora',
    'contracoes-musculares-interativas.html': 'isometrica concentrica excentrica isocinetica tensão comprimento ação muscular',
    'contracao-muscular-esqueletica.html': 'calcio ca2 atp relaxamento placa motora acetilcolina ach contracao musculo',
    'acoplamento-excitacao-contracao.html': 'tubulo t reticulo sarcoplasmatico ryr calcio excitação contração',
    'contracao-muscular-sarcomero.html': 'sarcômero actina miosina ponte cruzada zona h filamento deslizamento',
    'potencial-acao-membrana.html': 'potencial de ação membrana sodio na potassio k despolarizacao repolarizacao repouso',
    'neuronio-interativo.html': 'potencial de ação neuronio axonio impulso condução sodio potassio',
    'cardiopulmonar-integrado.html': 'caminho oxigenio ar pulmão coração circulação musculo exercício integração'
  };
  const stop = new Set('a ao aos as com como da das de do dos e em entre eu isso me meu minha na nas no nos o os ou para por qual que quero se sem sobre um uma onde'.split(' '));

  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9+]+/g, ' ').trim();
  const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const allModules = () => (typeof modules !== 'undefined' && Array.isArray(modules)) ? modules : [];
  const currentAxis = () => (typeof active !== 'undefined' ? active : 'muscular');
  let selectedModule = null;

  function createUI() {
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <div class="tutor-hint" id="tutorHint">Olá! Posso ajudar a encontrar e explorar os simuladores.</div>
      <section class="tutor-panel" id="tutorPanel" aria-label="Tutor de Fisiologia" hidden>
        <header class="tutor-head"><div><strong>Tutor de Fisiologia</strong><span>Educação Física • estudo guiado</span></div><button class="tutor-close" type="button" aria-label="Minimizar tutor">×</button></header>
        <div class="tutor-context" id="tutorContext"></div>
        <div class="tutor-messages" id="tutorMessages" aria-live="polite"></div>
        <div><div class="tutor-chips"><button class="tutor-chip" data-prompt="Explique este simulador">Explique este simulador</button><button class="tutor-chip" data-prompt="Ajude-me a explorar">Ajude-me a explorar</button><button class="tutor-chip" data-prompt="Quero encontrar um conteúdo">Encontrar conteúdo</button><button class="tutor-chip" data-prompt="Teste meu entendimento">Teste meu entendimento</button></div><form class="tutor-form" id="tutorForm"><input class="tutor-input" id="tutorInput" maxlength="240" autocomplete="off" placeholder="Ex.: onde estudo extração de O₂?" aria-label="Pergunta ao tutor"><button class="tutor-send" aria-label="Enviar pergunta">➜</button></form></div>
      </section>
      <button class="tutor-launcher" id="tutorLauncher" type="button" aria-label="Abrir Tutor de Fisiologia" aria-expanded="false">
        <span class="tutor-portrait"><img src="assets/tutor-prof-mario.png" alt="" draggable="false"></span>
        <span class="tutor-badge">?</span>
      </button>`;
    document.body.appendChild(wrap);
  }

  const panel = () => document.querySelector('#tutorPanel');
  const launcher = () => document.querySelector('#tutorLauncher');
  const messages = () => document.querySelector('#tutorMessages');

  function updateContext() {
    const label = axisNames[currentAxis()] || 'Educação Física';
    document.querySelector('#tutorContext').textContent = selectedModule ? `${label} • ${selectedModule.title}` : `${label} • percurso geral`;
  }
  function placePanel() {
    const box = panel();
    if (box.hidden) return;
    if (innerWidth <= 640) {
      box.style.left = ''; box.style.top = ''; box.style.right = ''; box.style.bottom = '';
      return;
    }
    const avatar = launcher().getBoundingClientRect();
    const width = box.offsetWidth, height = box.offsetHeight, gap = 12;
    const left = avatar.left + avatar.width / 2 > innerWidth / 2
      ? avatar.left - width - gap
      : avatar.right + gap;
    const top = avatar.top + avatar.height / 2 > innerHeight / 2
      ? avatar.bottom - height
      : avatar.top;
    box.style.left = Math.max(8, Math.min(innerWidth - width - 8, left)) + 'px';
    box.style.top = Math.max(8, Math.min(innerHeight - height - 8, top)) + 'px';
    box.style.right = 'auto'; box.style.bottom = 'auto';
  }
  function addMessage(text, who, html) {
    const el = document.createElement('div');
    el.className = `tutor-message ${who}`;
    if (html) el.innerHTML = text; else el.textContent = text;
    messages().appendChild(el); messages().scrollTop = messages().scrollHeight;
  }
  function openTutor() {
    panel().hidden = false; panel().classList.add('is-open'); launcher().setAttribute('aria-expanded','true');
    document.querySelector('#tutorHint').hidden = true; updateContext(); placePanel();
    if (!messages().children.length) addMessage('Olá! Diga o que deseja estudar ou selecione um card. Eu indicarei um percurso usando os mapas e simuladores da disciplina.', 'bot');
    setTimeout(() => document.querySelector('#tutorInput').focus(), 50);
  }
  function closeTutor() { panel().hidden = true; panel().classList.remove('is-open'); launcher().setAttribute('aria-expanded','false'); }

  function moduleText(m) {
    return normalize([m.title,m.goal,(m.steps||[]).join(' '),(m.qs||[]).map(x=>`${x.q} ${(x.opts||[]).join(' ')} ${x.why}`).join(' '), aliases[m.href]||'', axisNames[m.group]||''].join(' '));
  }
  function findModules(query) {
    const raw = normalize(query);
    const terms = raw.split(' ').filter(x => x.length > 1 && !stop.has(x));
    return allModules().map(m => {
      const hay = moduleText(m); let score = 0;
      terms.forEach(t => { if (hay.includes(t)) score += normalize(m.title).includes(t) ? 5 : 1; });
      if (/extracao|arterioven|av ?o2/.test(raw) && /fick|consumo-o2/.test(m.href)) score += 9;
      if (/curva|hemoglobin|saturacao/.test(raw) && /curva-dissociacao/.test(m.href)) score += 10;
      if (/forca.*velocidade|velocidade.*forca|potencia/.test(raw) && /hill/.test(m.href)) score += 8;
      return {m,score};
    }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,3).map(x=>x.m);
  }
  function linkFor(m) { return `<a class="tutor-link" href="${escapeHtml(m.href)}">Abrir ${escapeHtml(m.title)}</a>`; }
  function explain(m) {
    return `<p><b>1. Ideia:</b> ${escapeHtml(m.goal)}</p><p><b>2. Mecanismo:</b> siga a sequência do módulo e observe como uma alteração produz respostas nas demais variáveis.</p><p><b>3. Aplicação:</b> relacione o resultado à produção e ao controle do movimento ou exercício.</p>${linkFor(m)}<p><b>Para pensar:</b> qual resultado você prevê antes de modificar uma variável?</p>`;
  }
  function guide(m) {
    const steps = (m.steps||[]).map(s=>`<li>${escapeHtml(s)}</li>`).join('');
    return `<p>Use o método da disciplina:</p><ol><li>Relembre o conceito no mapa mental.</li><li>Escolha um estado fisiológico.</li><li>Faça uma previsão.</li><li>Modifique <b>uma variável</b>.</li><li>Interprete a resposta.</li></ol><p>Para este módulo:</p><ol>${steps}</ol>${linkFor(m)}`;
  }
  function quiz(m) {
    const q = (m.qs||[])[Math.floor(Math.random() * Math.max(1,(m.qs||[]).length))];
    if (!q) return 'Abra o simulador, modifique uma variável e descreva o que mudou. Depois tente justificar o mecanismo.';
    return `<p><b>${escapeHtml(q.q)}</b></p><p>${q.opts.map((o,i)=>`${String.fromCharCode(65+i)}) ${escapeHtml(o)}`).join('<br>')}</p><p>Explique primeiro seu raciocínio; não responda apenas com a letra.</p>`;
  }
  function searchReply(query) {
    const found = findModules(query);
    if (!found.length) return `<p>Não encontrei uma correspondência segura no catálogo desta etapa.</p><p>Tente usar o nome de uma estrutura, variável ou mecanismo, como “cálcio”, “retorno venoso”, “hemoglobina” ou “recrutamento”.</p>`;
    const intro = found.length > 1 ? 'Encontrei um percurso relacionado:' : 'Encontrei este módulo relacionado:';
    return `<p>${intro}</p>${found.map((m,i)=>`<div class="tutor-result"><b>${found.length>1 ? `${i+1}. ` : ''}${escapeHtml(m.title)}</b><span>${escapeHtml(m.goal)}</span><br>${linkFor(m)}</div>`).join('')}<p><b>Para pensar:</b> qual variável você pretende modificar primeiro?</p>`;
  }
  function answer(query) {
    const q = normalize(query); const m = selectedModule;
    if (/explica|explique|como funciona|o que e/.test(q) && m) return explain(m);
    if (/explor|orient|passo|comec/.test(q) && m) return guide(m);
    if (/teste|questao|pergunta/.test(q) && m) return quiz(m);
    if (/resposta da prova|gabarito|so a resposta/.test(q)) return '<p>Não forneço gabarito puro. Escreva o seu raciocínio, mesmo que esteja incompleto; depois eu ajudo a localizar o ponto que precisa ser revisto.</p>';
    if (/diagnost|prescrev|tratamento|dose|paciente/.test(q)) return '<p>Este tutor é exclusivamente educacional e não realiza diagnóstico, prescrição ou orientação clínica. Posso ajudar a compreender o mecanismo fisiológico relacionado.</p>';
    return searchReply(query);
  }
  function submit(value) {
    const text = String(value||'').trim(); if (!text) return;
    addMessage(text,'user'); addMessage(answer(text),'bot',true); document.querySelector('#tutorInput').value='';
  }

  function enableDrag() {
    const btn = launcher(); let start=null, moved=false;
    const clamp=(n,min,max)=>Math.min(max,Math.max(min,n));
    btn.addEventListener('pointerdown', e => { start={x:e.clientX,y:e.clientY,left:btn.offsetLeft,top:btn.offsetTop}; moved=false; btn.setPointerCapture(e.pointerId); btn.classList.add('is-dragging'); });
    btn.addEventListener('pointermove', e => { if(!start)return; const dx=e.clientX-start.x,dy=e.clientY-start.y; if(Math.hypot(dx,dy)>5)moved=true; if(!moved)return; btn.style.left=clamp(start.left+dx,6,innerWidth-btn.offsetWidth-6)+'px'; btn.style.top=clamp(start.top+dy,6,innerHeight-btn.offsetHeight-6)+'px'; btn.style.right='auto'; btn.style.bottom='auto'; placePanel(); });
    btn.addEventListener('pointerup', () => {
      btn.classList.remove('is-dragging');
      if (moved) {
        const left = clamp(btn.offsetLeft, 6, innerWidth - btn.offsetWidth - 6);
        const top = clamp(btn.offsetTop, 6, innerHeight - btn.offsetHeight - 6);
        btn.style.left = left + 'px'; btn.style.top = top + 'px';
        localStorage.setItem('tutorEFPosition', JSON.stringify({left, top}));
        placePanel();
      } else openTutor();
      start = null;
    });
    try {
      const p = JSON.parse(localStorage.getItem('tutorEFPosition'));
      if (p && Number.isFinite(p.left) && Number.isFinite(p.top)) {
        btn.style.left = clamp(p.left, 6, innerWidth - btn.offsetWidth - 6) + 'px';
        btn.style.top = clamp(p.top, 6, innerHeight - btn.offsetHeight - 6) + 'px';
        btn.style.right = 'auto'; btn.style.bottom = 'auto';
      }
    } catch(_){}
  }

  createUI(); updateContext(); enableDrag();
  document.querySelector('.tutor-close').addEventListener('click',closeTutor);
  document.querySelector('#tutorForm').addEventListener('submit',e=>{e.preventDefault();submit(document.querySelector('#tutorInput').value);});
  document.querySelectorAll('.tutor-chip').forEach(b=>b.addEventListener('click',()=>submit(b.dataset.prompt)));
  document.querySelector('#axes').addEventListener('click',e=>{if(e.target.closest('.axis')){selectedModule=null;setTimeout(updateContext);}});
  document.querySelector('#cards').addEventListener('click',e=>{const card=e.target.closest('.card');if(!card)return;const title=card.querySelector('h2')?.textContent;selectedModule=allModules().find(m=>m.title===title)||null;updateContext();});
  window.addEventListener('resize', () => { placePanel(); });
  setTimeout(()=>{document.querySelector('#tutorHint').hidden=true;},7000);
})();
