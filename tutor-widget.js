(function () {
  'use strict';

  const isFisioterapia = location.pathname.includes('/fisioterapia/') || location.pathname.endsWith('/tutor-fisio.html') || new URLSearchParams(location.search).get('percurso') === 'fisioterapia';
  const courseConfig = isFisioterapia && window.fisioterapiaTutor ? window.fisioterapiaTutor : null;
  const axisNames = courseConfig?.axisNames || {
    celular: '01 Celular e potenciais de ação', muscular: '02 Excitabilidade e sistema muscular',
    osteoarticular: '03 Osteoarticular', cardiovascular: '04 Cardiovascular',
    respiratorio: '05 Respiratório', integracao: '06 Integração cardiorrespiratória'
  };
  const courseLabel = courseConfig?.courseLabel || 'Educação Física';
  const assetHref = src => {
    const clean=String(src||'').replace(/^(\.\.\/|\.\/)+/,'');
    return (location.pathname.includes('/fisioterapia/') ? '../' : '') + clean;
  };
  const moduleHref = href => {
    const base=location.pathname.includes('/fisioterapia/') ? '../' : '';
    return base + href + (isFisioterapia ? '?percurso=fisioterapia' : '');
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
    'cardiopulmonar-integrado.html': 'caminho oxigenio ar pulmão coração circulação musculo exercício integração',
    'ventilacao-pulmonar-neonatal.html': 'neonatal recém nascido prematuro prematuridade idade gestacional pós natal pós menstrual surfactante sdr dbp cpap peep fio2 ventilação mecânica complacência resistência traqueia calibre vias aéreas espaço morto vda vdalv vdf shunt recrutamento alveolar'
  };
  const stop = new Set('a ao aos as com como da das de do dos e em entre eu isso me meu minha na nas no nos o os ou para por qual que quero se sem sobre um uma onde'.split(' '));

  const normalize = value => String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9+]+/g, ' ').trim();
  const escapeHtml = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const allModules = () => courseConfig?.modules || ((typeof modules !== 'undefined' && Array.isArray(modules)) ? modules : []);
  const allMaps = () => courseConfig?.maps || ((typeof maps !== 'undefined' && maps) ? maps : {});
  const mapsForGroup = group => {
    const value=allMaps()[group];
    if (!value) return [];
    return (Array.isArray(value) ? value : [value]).map(item=>({...item,src:assetHref(item.src)}));
  };
  let selectedModule = null;
  const quizProgress = new Map();
  let lastQuiz = null;
  const currentAxis = () => selectedModule?.group || (typeof active !== 'undefined' ? active : (courseConfig?.defaultAxis || 'muscular'));

  function createUI() {
    const wrap = document.createElement('div');
    wrap.innerHTML = `
      <div class="tutor-hint" id="tutorHint">Olá! Posso ajudar a encontrar e explorar os simuladores.</div>
      <section class="tutor-panel" id="tutorPanel" aria-label="Tutor de Fisiologia" hidden>
        <header class="tutor-head"><div><strong>Tutor de Fisiologia</strong><span>${escapeHtml(courseLabel)} • estudo guiado</span></div><button class="tutor-close" type="button" aria-label="Minimizar tutor">×</button></header>
        <div class="tutor-context" id="tutorContext"></div>
        <div class="tutor-messages" id="tutorMessages" aria-live="polite"></div>
        <div><div class="tutor-chips"><button class="tutor-chip" data-prompt="Explique este simulador">Explique este simulador</button><button class="tutor-chip" data-prompt="Ajude-me a explorar">Ajude-me a explorar</button><button class="tutor-chip" data-prompt="Abra o mapa mental">Mapa mental</button><button class="tutor-chip" data-prompt="Quero encontrar um conteúdo">Encontrar conteúdo</button><button class="tutor-chip" data-prompt="Teste meu entendimento">Teste meu entendimento</button></div><form class="tutor-form" id="tutorForm"><input class="tutor-input" id="tutorInput" maxlength="240" autocomplete="off" placeholder="Ex.: onde estudo extração de O₂?" aria-label="Pergunta ao tutor"><button class="tutor-send" aria-label="Enviar pergunta">➜</button></form></div>
      </section>
      <button class="tutor-launcher" id="tutorLauncher" type="button" aria-label="Abrir Tutor de Fisiologia" aria-expanded="false">
        <span class="tutor-portrait"><img src="${escapeHtml(assetHref('assets/tutor-prof-mario.png'))}" alt="" draggable="false"></span>
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
      if (/neonat|recem nascid|prematur|surfact|gestacional|pos menstrual|sdr|dbp|vdalv/.test(raw) && /ventilacao-pulmonar-neonatal/.test(m.href)) score += 14;
      return {m,score};
    }).filter(x=>x.score>0).sort((a,b)=>b.score-a.score).slice(0,3).map(x=>x.m);
  }
  function linkFor(m) { return `<a class="tutor-link" href="${escapeHtml(moduleHref(m.href))}">Abrir ${escapeHtml(m.title)}</a>`; }
  function resourceLinks(m) {
    let moduleMaps = m.href === 'sangue.html'
      ? [{src:assetHref('assets/maps/cardiovascular-01-sangue.webp'),title:'Sangue'}]
      : mapsForGroup(m.group);
    const links = moduleMaps.map(item=>`<a class="tutor-link" href="${escapeHtml(item.src)}" target="_blank" rel="noopener">Mapa — ${escapeHtml(item.title)}</a>`);
    if (m.href === 'da-intencao-ao-movimento.html') links.push(`<a class="tutor-link" href="${escapeHtml(assetHref('assets/leituras/da-intencao-ao-movimento-guia-visual.pdf?v=20260821'))}" target="_blank" rel="noopener">Leitura de aprofundamento</a>`);
    if (m.href === 'sangue.html') links.push(`<a class="tutor-link" href="${escapeHtml(assetHref('assets/leituras/Sangue_Guia_Visual_Prof_Mario_Nascimento.pdf?v=20260823'))}" target="_blank" rel="noopener">Guia visual de Sangue</a>`);
    if (m.href === 'ventilacao-pulmonar-neonatal.html') links.push(`<a class="tutor-link" href="${escapeHtml(assetHref('assets/leituras/Ventilacao_Pulmonar_Neonatal_Guia_Visual_Prof_Mario_Nascimento.pdf?v=20260902-2'))}" target="_blank" rel="noopener">Guia visual neonatal</a>`);
    return links.join(' ');
  }
  function renderMapLinks(items, intro) {
    if (!items.length) return '<p>Não encontrei mapas mentais cadastrados.</p>';
    return `<p>${intro}</p><div class="tutor-map-list">${items.map(item => `<a class="tutor-link" href="${escapeHtml(item.src)}" target="_blank" rel="noopener">${escapeHtml(item.title)}</a>`).join(' ')}</div>`;
  }
  function mapReply(m, query) {
    const raw = normalize(query);
    const bloodMap = {src:assetHref('assets/maps/cardiovascular-01-sangue.webp'),title:'Sangue'};
    const requestedGroup = [
      ['celular', /celular|membrana|potencial/],
      ['muscular', /muscular|musculo|excitabilidade|contracao|sarcomero/],
      ['osteoarticular', /osteo|osso|articular|articulacao/],
      ['respiratorio', /respiratorio|pulmao|ventilacao/],
      ['integracao', /integracao|cardiorrespiratoria|exercicio/],
      ['cardiovascular', /cardiovascular|circulacao|hemodinamica|coracao/]
    ].find(([, pattern]) => pattern.test(raw))?.[0];

    let selectedMaps = [];
    if (/sangue|hemacia|hematopo/.test(raw)) selectedMaps = [bloodMap];
    else if (requestedGroup) selectedMaps = mapsForGroup(requestedGroup);
    else if (/hemoglobina/.test(raw) && isFisioterapia) selectedMaps = mapsForGroup('respiratorio');
    else if (m?.href === 'sangue.html') selectedMaps = [bloodMap];
    else if (m) selectedMaps = mapsForGroup(m.group);

    if (selectedMaps.length) {
      const intro=selectedMaps.length===1
        ? `Relembre primeiro os conceitos no mapa <b>${escapeHtml(selectedMaps[0].title)}</b>. Depois retorne ao simulador, escolha um estado e modifique apenas uma variável.`
        : 'Este eixo possui mais de um mapa. Escolha o que corresponde ao mecanismo que deseja revisar:';
      return renderMapLinks(selectedMaps,intro);
    }

    const available = Object.values(allMaps()).flatMap(value => Array.isArray(value) ? value : [value])
      .map(item=>({...item,src:assetHref(item.src)}));
    if (!isFisioterapia) available.push(bloodMap);
    return renderMapLinks(available,'Qual mapa mental você quer abrir?') + '<p>Você também pode escrever, por exemplo, <b>“mapa de Sangue”</b> ou <b>“mapa respiratório”</b>.</p>';
  }
  function explain(m) {
    const application=isFisioterapia
      ? 'relacione o resultado à avaliação funcional, à reabilitação e às respostas ao esforço, sem transformá-lo em orientação clínica.'
      : 'relacione o resultado à produção e ao controle do movimento ou exercício.';
    return `<p><b>1. Ideia:</b> ${escapeHtml(m.goal)}</p><p><b>2. Mecanismo:</b> siga a sequência do módulo e observe como uma alteração produz respostas nas demais variáveis.</p><p><b>3. Aplicação:</b> ${application}</p>${linkFor(m)} ${resourceLinks(m)}<p><b>Para pensar:</b> qual resultado você prevê antes de modificar uma variável?</p>`;
  }
  function guide(m) {
    const steps = (m.steps||[]).map(s=>`<li>${escapeHtml(s)}</li>`).join('');
    return `<p>Use o método da disciplina:</p><ol><li>Relembre o conceito no mapa mental.</li><li>Escolha um estado fisiológico.</li><li>Faça uma previsão.</li><li>Modifique <b>uma variável</b>.</li><li>Interprete a resposta.</li></ol><p>Para este módulo:</p><ol>${steps}</ol>${linkFor(m)} ${resourceLinks(m)}`;
  }
  function quizMenu() {
    const group = currentAxis();
    const available = allModules().filter(item => item.group === group && Array.isArray(item.qs) && item.qs.length);
    if (!available.length) return '<p>Não há questões cadastradas para este eixo nesta etapa.</p>';
    return `<p>Escolha um simulador para responder às questões:</p>${available.map(item => `<div class="tutor-result"><b>${escapeHtml(item.title)}</b><span>${item.qs.length} questões disponíveis</span><br>${linkFor(item)}</div>`).join('')}<p>Ao abrir o simulador, escreva <b>“questões”</b> ou use o botão <b>Teste meu entendimento</b>.</p>`;
  }
  function quiz(m) {
    const list = m.qs || [];
    const qi = quizProgress.get(m.href) || 0;
    const q = list[qi % Math.max(1,list.length)];
    if (q) lastQuiz = {module:m, question:q};
    if (!q) return 'Abra o simulador, modifique uma variável e descreva o que mudou. Depois tente justificar o mecanismo.';
    const options=q.opts.map((o,i)=>`<button class="tutor-option" type="button" data-choice="${i}">${String.fromCharCode(65+i)}) ${escapeHtml(o)}</button>`).join('');
    return `<div class="tutor-quiz" data-module="${escapeHtml(m.href)}" data-correct="${q.a}" data-next="${(qi+1)%list.length}" data-why="${escapeHtml(q.why)}"><p><b>Questão ${qi+1} de ${list.length}</b></p><p>${escapeHtml(q.q)}</p><div class="tutor-options">${options}</div><p class="tutor-feedback" hidden></p><button class="tutor-next" type="button" hidden>Próxima questão</button></div>`;
  }
  function searchReply(query) {
    const found = findModules(query);
    if (!found.length) return `<p>Não encontrei uma correspondência segura no catálogo desta etapa.</p><p>Tente usar o nome de uma estrutura, variável ou mecanismo, como “cálcio”, “retorno venoso”, “hemoglobina” ou “recrutamento”.</p>`;
    const intro = found.length > 1 ? 'Encontrei um percurso relacionado:' : 'Encontrei este módulo relacionado:';
    return `<p>${intro}</p>${found.map((m,i)=>`<div class="tutor-result"><b>${found.length>1 ? `${i+1}. ` : ''}${escapeHtml(m.title)}</b><span>${escapeHtml(m.goal)}</span><br>${linkFor(m)}</div>`).join('')}<p><b>Para pensar:</b> qual variável você pretende modificar primeiro?</p>`;
  }
  function editDistance(a,b) {
    const row = Array.from({length:b.length+1},(_,i)=>i);
    for (let i=1;i<=a.length;i++) {
      let previous=row[0]; row[0]=i;
      for (let j=1;j<=b.length;j++) {
        const saved=row[j];
        row[j]=Math.min(row[j]+1,row[j-1]+1,previous+(a[i-1]===b[j-1]?0:1));
        previous=saved;
      }
    }
    return row[b.length];
  }
  function recognizes(q, phrases, words) {
    if (phrases.some(item => q.includes(item))) return true;
    const tokens=q.split(' ').filter(Boolean);
    return tokens.some(token => words.some(word => word.length>=5 && token.length>=4 && editDistance(token,word)<=2));
  }
  function actionButton(label, action) {
    return `<button class="tutor-chip tutor-inline-action" type="button" data-tutor-action="${action}">${label}</button>`;
  }
  function clarifyQuiz(m) {
    if (!m) return quizMenu();
    return `<p>Você quer questões deste simulador ou de outro conteúdo?</p><div class="tutor-action-row">${actionButton('Deste simulador','quiz-current')} ${actionButton('Escolher outro','quiz-other')}</div>`;
  }
  function clarifyMap(m) {
    return `<p>Você quer o mapa deste simulador ou escolher outro mapa?</p><div class="tutor-action-row">${actionButton('Deste simulador','map-current')} ${actionButton('Escolher outro','map-list')}</div>`;
  }
  function nextQuiz(m) {
    if (!m) return quizMenu();
    const list=m.qs||[];
    if (!list.length) return quiz(m);
    const current=quizProgress.get(m.href)||0;
    quizProgress.set(m.href,(current+1)%list.length);
    return quiz(m);
  }
  function answer(query) {
    const q = normalize(query); const m = selectedModule;
    const wantsMap = recognizes(q,['mapa','map mental','voltar ao mapa'],['mapa']);
    const wantsQuiz = recognizes(q,['teste','quiz','questao','questoes','pergunta','perguntas','exercicio','exercicios','me pergunte','quero treinar','qst','qsts','perg','exerc'],['questao','questoes','pergunta','exercicio']);
    const wantsNext = recognizes(q,['outra','outro','proxima','proximo','mais uma','seguinte','manda outra'],['outra','proxima','seguinte']);
    const wantsExplainAnswer = /nao entendi|explique a resposta|explica a resposta|por que|porque errei/.test(q);

    if (/resposta da prova|gabarito|so a resposta/.test(q)) return '<p>Não forneço gabarito puro. Escreva o seu raciocínio, mesmo que esteja incompleto; depois eu ajudo a localizar o ponto que precisa ser revisto.</p>';
    if (/diagnost|prescrev|tratamento|dose|paciente/.test(q)) return '<p>Este tutor é exclusivamente educacional e não realiza diagnóstico, prescrição ou orientação clínica. Posso ajudar a compreender o mecanismo fisiológico relacionado.</p>';
    if (wantsMap && wantsQuiz) return `<p>Você mencionou mapa e questões. Por onde deseja começar?</p><div class="tutor-action-row">${actionButton('Mapa mental','map-current')} ${actionButton('Questões','quiz-current')}</div>`;
    if (wantsExplainAnswer && lastQuiz) return `<p><b>Mecanismo:</b> ${escapeHtml(lastQuiz.question.why)}</p><p>Agora tente explicar com suas palavras: o que causou essa resposta?</p>`;
    if (wantsQuiz && /deste ou|desse ou|ou outro|outra materia|outro conteudo/.test(q)) return clarifyQuiz(m);
    if (wantsMap && /deste ou|desse ou|ou outro|outro mapa/.test(q)) return clarifyMap(m);
    if (wantsNext && m) return nextQuiz(m);
    if (wantsMap) return mapReply(m, query);
    if (wantsQuiz) return m ? quiz(m) : quizMenu();
    if (/explica|explique|como funciona|o que e/.test(q) && m) return explain(m);
    if (/explor|orient|passo|comec/.test(q) && m) return guide(m);
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
      } else if (panel().hidden) openTutor(); else closeTutor();
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

  selectedModule = allModules().find(m => location.pathname.endsWith('/' + m.href) || location.pathname.endsWith(m.href)) || null;
  createUI(); updateContext(); enableDrag();
  document.querySelector('.tutor-close').addEventListener('click',closeTutor);
  document.querySelector('#tutorForm').addEventListener('submit',e=>{e.preventDefault();submit(document.querySelector('#tutorInput').value);});
  document.querySelectorAll('.tutor-chip').forEach(b=>b.addEventListener('click',()=>submit(b.dataset.prompt)));
  messages().addEventListener('click', e => {
    const action = e.target.closest('[data-tutor-action]');
    if (action) {
      const type=action.dataset.tutorAction;
      if(type==='quiz-current') addMessage(selectedModule ? quiz(selectedModule) : quizMenu(),'bot',true);
      if(type==='quiz-other') addMessage(quizMenu(),'bot',true);
      if(type==='map-current') addMessage(mapReply(selectedModule,''),'bot',true);
      if(type==='map-list') addMessage(mapReply(null,''),'bot',true);
      return;
    }
    const option = e.target.closest('.tutor-option');
    if (option) {
      const quizBox = option.closest('.tutor-quiz');
      const chosen = Number(option.dataset.choice), correct = Number(quizBox.dataset.correct);
      quizBox.querySelectorAll('.tutor-option').forEach((button,index)=>{button.disabled=true;if(index===correct)button.classList.add('correct');});
      if(chosen!==correct) option.classList.add('wrong');
      const feedback=quizBox.querySelector('.tutor-feedback');
      feedback.hidden=false; feedback.textContent=(chosen===correct?'Certo. ':'Ainda não. ')+quizBox.dataset.why;
      quizBox.querySelector('.tutor-next').hidden=false;
      messages().scrollTop=messages().scrollHeight;
      return;
    }
    const next = e.target.closest('.tutor-next');
    if (next) {
      const quizBox=next.closest('.tutor-quiz');
      const m=allModules().find(item=>item.href===quizBox.dataset.module);
      if(m){quizProgress.set(m.href,Number(quizBox.dataset.next));addMessage(quiz(m),'bot',true);}
    }
  });
  const axesNode = document.querySelector('#axes');
  const cardsNode = document.querySelector('#cards');
  if (axesNode) axesNode.addEventListener('click',e=>{if(e.target.closest('.axis')){selectedModule=null;setTimeout(updateContext);}});
  if (cardsNode) cardsNode.addEventListener('click',e=>{const card=e.target.closest('.card');if(!card)return;const title=card.querySelector('h2')?.textContent;selectedModule=allModules().find(m=>m.title===title)||null;updateContext();});
  window.addEventListener('resize', () => { placePanel(); });
  setTimeout(()=>{document.querySelector('#tutorHint').hidden=true;},7000);
})();
