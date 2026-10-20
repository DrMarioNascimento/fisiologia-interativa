/* Identidade compartilhada dos simuladores, com percurso e unidades de cada curso. */
(function(){
 'use strict';
 const script=document.currentScript;
 const root=new URL('.',script.src);
 const VERSION='20261020-curvas4';
 const CARDS='.card,.panel,.lab,.metric,.metric-card,.metric-box,.stat,.stat-card,.kpi,.section-card,.stage,.hypothalamus-origin,.pituitary-group,.lactation-bridge,.stage-node,.top-col,.control-group,.slider-card,.toggle-card,.chart-card,.tissue-card,.concepts>p,.response-indicators>div,.tabs>button,.tabs>a,.states>button,.quick>button,.state-row>button,.stage-track>button,.stage-track>.stage,[class$="-card"],[class*="-card "],.dim-hero,.module-card,.canal,.controls,.toolbar,.states,.quick,.stage-map,.timeline-step,.status-banner,.perm-section,.phase-banner,.intervention-console,.system-reading,.boundary-card,.graph-metric,.activation-panel-clean,.result-pill,.interpret-block,.eq-box,.capacity-panel,.learning-panel,.reading-banner,.equation,.footer-box,.explain-box,.formula-card,.mode-panel,.settings-panel,.control-capsule,.slider-box,.co2-box,.co2-card,.vo2-card,.readout-box,.graph-block,.eq-mini,.interpret-inline,.painel,.caixa,.cartao,.selector-line,.mechanics-line,.actions,.metrics-wide,.fi-ef-ui[data-fi-course="fi"] .monitor,.fi-ef-ui[data-fi-course="fi"] .mini,.fi-ef-ui[data-fi-course="fi"] .tend,.fi-ef-ui[data-fi-course="fi"] .caso-c,.card-output,.card-context,.card-wide,[class$="-box"],[class*="-box "],[class$="-readout"],[class*="-readout "],.readout,.vital-chip,.monitor-chip,.epo-mini,.interpret-card,.modal-box,.formula-box,.current-scenario-card,.scenario-panel,.mobile-topbar,.control-board,.control-accordion,.state-panel,.membrane-control,.comp-control,.comp,.eq,.science,.science-note,.clinical-summary,.molecule-legend,.legend,.scenario-row,.selector,.topbar,.top-ui,.top-grid,.bottom-grid,.footer-block,.time-speed,.modes,.mode-tabs,.chronometer,.protocol,.control,.pick,.toggle,.speed-wrap,.speed-control,.parameter-controls,.action-controls,.variables-controls,.figure-toolbar,.state-section,.settings-grid>label,.physio-alerts>p,.stage-status,.step-box,.note,.howto>p,.flow .node,.cycle-groups .grp,.ux-feedback,.state-group-title,.dim-guide,.dim-control-block,.dim-selected-task,.dim-neural-readout,.dim-pedcell,.dim-parallel-card,.dim-guide-item,.dim-force-compare>div,.dim-mhead-live>span,.readouts>div,.daily-readouts>div,.bone-state-item,.diagram-wrap,.chart-wrap,.mech-cascade,.stage-wrap,.units-stage,.chart,.wide-chart,.setting,.chain,.summary-line:has([id^="graph"]),.num,.faixa,.scenario-picker,.scenario-help,.concept-guide,.feedback,.notice,.interpretation,.table-wrap,details,.controls>label,.parameter-controls>label,.action-controls>label,.pharm-label,#readoutBody tr,#interpretationRow>details,#interpretAll,#rum-sim #scenario-guide,#rum-sim #fiber-guide,.fi-ef-ui .monitor,.fi-ef-ui .mini,.fi-ef-ui .tend,.fi-ef-ui .spark,.fi-ef-ui .caso-c,.regras>div,.sinais>div,.avisos>div,.checklist>div,.fluxo-nums>div,.splits>div,.porque,.atend,.limites,.interpret details';
 function isFisio(url){const u=new URL(url,root);return /\/fisioterapia\//i.test(u.pathname)||/tutor-fisio\.html$/i.test(u.pathname)||['fisioterapia','fi','fisio'].includes((u.searchParams.get('percurso')||u.searchParams.get('curso')||'').toLowerCase());}
 if(/\/tutor-(?:ef|fisio)\.html$/i.test(location.pathname))return;
 const fisio=isFisio(location.href),course=fisio?'fi':'ef',courseName=fisio?'Fisioterapia':'Educação Física';
 const home=new URL(fisio?'fisioterapia/index.html':'index.html',root);
 const relative=decodeURIComponent(location.pathname).slice(root.pathname.length).replace(/^\//,'');
 const route=!relative||relative.endsWith('/')?relative+'index.html':relative;
 fetch(new URL((fisio?'fi':'ef')+'-simuladores-manifest.json?v='+VERSION,root)).then(r=>{if(!r.ok)throw Error('Manifesto visual indisponível');return r.json();}).then(manifest=>{
  const entry=manifest[route];if(!entry)return;
  function mount(doc,info){
   if(!doc.body||doc.documentElement.classList.contains('fi-ef-ui'))return;
   const win=doc.defaultView;
   doc.documentElement.classList.add('fi-ef-ui');doc.documentElement.dataset.fiEfUnit=info.unit;doc.documentElement.dataset.fiCourse=course;
   const css=doc.createElement('link');css.rel='stylesheet';css.href=new URL('ef-simuladores.css?v='+VERSION,root);css.dataset.fiEfStyle='';doc.head.append(css);
   const frames=[...doc.querySelectorAll('iframe')].filter(f=>{try{return new URL(f.src,root).origin===root.origin;}catch{return false;}});
   // Página intermediária: o aluno interage com o documento dentro do iframe.
   if(frames.length&&doc.body.children.length<=4){
    for(const frame of frames){const apply=()=>{try{mount(frame.contentDocument,info);}catch{}};frame.addEventListener('load',apply);apply();}
    return;
   }
   const a=doc.createElement('a');a.className='fi-ef-brand';a.href=home.href+(info.unit==='inicio'?'':'#u-'+info.unit);
   a.setAttribute('aria-label','Fisiologia Interativa - '+courseName+(info.number?' - Unidade '+info.number:''));
   const label=info.number?courseName+' · Unidade '+info.number:info.unit==='integracao'?courseName+' · Integração 4 e 5':courseName+' · Todas as unidades';
   a.innerHTML='<span class="fi-ef-brand-frame" aria-hidden="true"><svg class="fi-ef-brand-portrait" viewBox="0 0 420 405" focusable="false"><image width="420" height="655"/></svg></span><span class="fi-ef-brand-copy"><b>Fisiologia Interativa</b><small></small></span>';
   a.querySelector('image').setAttribute('href',new URL('assets/avatar-prof-mario.webp',root));a.querySelector('small').textContent=label;
   const native=[...doc.querySelectorAll('a.brand')].find(e=>!e.querySelector('h1,input,button'));
   if(native){
    native.replaceWith(a);
    const top=a.parentElement.getBoundingClientRect().top+win.scrollY;
    if(top<42)a.parentElement.style.paddingTop=(parseFloat(win.getComputedStyle(a.parentElement).paddingTop)||0)+(42-top)+'px';
   }else{
    const row=doc.createElement('div');row.className='fi-ef-brand-row';row.append(a);
    const first=doc.querySelector('header,main,.app,h1');if(first)first.before(row);else doc.body.prepend(row);
    for(const old of doc.querySelectorAll('header .brand,header .brand-mark')){
     if(old.querySelector('h1,input,button')){const small=old.querySelector('small');if(small&&/fisiologia interativa/i.test(small.textContent))small.classList.add('fi-ef-legacy-label');}
     else if(/fisiologia interativa/i.test(old.textContent))old.classList.add('fi-ef-legacy-label');
    }
   }
   function mark(el){
    if(el.namespaceURI!=='http://www.w3.org/1999/xhtml'||el.closest('.fi-ef-brand,#fi-tutor-widget,.fi-tutor-widget,[data-fi-tutor],#tutorPanel,#tutorLauncher,#tutorHint,.tutor-panel,.tutor-hint,.tutor-launcher'))return;
    if(el.tagName==='LABEL'&&!el.hasAttribute('data-fi-ef-card')){
     const s=win.getComputedStyle(el);
     const edge=parseFloat(s.borderTopWidth)+parseFloat(s.borderRightWidth)+parseFloat(s.borderBottomWidth)+parseFloat(s.borderLeftWidth);
     const transparent=s.backgroundColor==='transparent'||s.backgroundColor==='rgba(0, 0, 0, 0)';
     if(!edge&&transparent&&s.backgroundImage==='none'&&s.boxShadow==='none')return;
    }
    el.setAttribute('data-fi-ef-card','');
    for(const pseudo of ['before','after']){
     const style=win.getComputedStyle(el,'::'+pseudo),width=parseFloat(style.width);
     // Only suppress an empty decorative strip, never text, icons or the corner glow.
     if(!['none','normal','""',"''"].includes(style.content)||style.position!=='absolute'||!(width>0&&width<=12)||!(parseFloat(style.left)<=1)||!(parseFloat(style.top)<=1)||!(parseFloat(style.bottom)<=1||parseFloat(style.height)>=el.clientHeight-4))continue;
     if(style.content==='none'||style.content==='normal')continue;
     el.classList.add(pseudo==='before'?'fi-ef-flat-strip':'fi-ef-flat-strip-after');
    }
   }
   const SURFACES='div,section,aside,article,fieldset,details,label,header,footer';
   const DRAWINGS='.tank,.fluid,.ion,.flow,.membrane,.channel,.molecule,.cell,.vessel,.tube,.bone,.scene,.orbital,.sphere,.sphere-wrap,.ring-track,.ring-progress,.cycle-track,.cycle-bar,.progresso,.barra,.medidor,.trilho,.rail,.time-line,.battery-scale,.stage-wrap,.canvas-stage,.units-stage,.diagram-wrap,svg,[role="progressbar"],.fi-ef-brand,#fi-tutor-widget,.fi-tutor-widget,[data-fi-tutor],#tutorLauncher,#tutorHint';
   function surface(el){
    if(el.hasAttribute('data-fi-ef-card')||el.closest(DRAWINGS))return;
    const s=win.getComputedStyle(el);
    const vertical=parseFloat(s.borderLeftWidth)+parseFloat(s.borderRightWidth);
    const background=s.backgroundColor!=='transparent'&&s.backgroundColor!=='rgba(0, 0, 0, 0)';
    // Detect existing boxes regardless of their local names, including nested grids.
    // Layout wrappers without a visible surface and the physiological drawings are left alone.
    if(vertical>0&&(background||s.backgroundImage!=='none'||s.boxShadow!=='none'))mark(el);
   }
   function scan(node){
    if(node.nodeType!==1)return;
    if(node.matches(CARDS))mark(node);
    node.querySelectorAll(CARDS).forEach(mark);
    if(node.matches(SURFACES))surface(node);
    node.querySelectorAll(SURFACES).forEach(surface);
   }
   scan(doc.body);
   css.addEventListener('load',()=>scan(doc.body));
   let queued=false;const pending=new Set();
   const observer=new win.MutationObserver(records=>{for(const r of records){if(r.target.nodeType===1&&r.target.matches('style'))pending.add(doc.body);for(const n of r.addedNodes)if(n.nodeType===1)pending.add(n.matches('style,link[rel="stylesheet"]')?doc.body:n);}if(pending.size&&!queued){queued=true;win.requestAnimationFrame(()=>{queued=false;for(const n of pending)if(n.isConnected)scan(n);pending.clear();});}});
   observer.observe(doc.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>mount(document,entry),{once:true});else mount(document,entry);
 }).catch(e=>console.warn('Padronização visual '+courseName+':',e.message));
})();
