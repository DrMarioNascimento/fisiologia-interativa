/* Identidade compartilhada dos simuladores, com percurso e unidades de cada curso. */
(function(){
 'use strict';
 const script=document.currentScript;
 const root=new URL('.',script.src);
 const VERSION='20261018-cursos1';
 const CARDS='.card,.panel,.lab,.metric,.metric-card,.metric-box,.stat,.stat-card,.kpi,.section-card,.stage,.hypothalamus-origin,.pituitary-group,.lactation-bridge,.stage-node,.top-col,.control-group,.slider-card,.toggle-card,.chart-card,.tissue-card,.concepts>p,.response-indicators>div,.tabs>button,.tabs>a,.states>button,.quick>button,.state-row>button,.stage-track>button,.stage-track>.stage,[class$="-card"],[class*="-card "],.dim-hero,.module-card,.canal,.controls,.toolbar,.states,.quick,.stage-map,.timeline-step,.status-banner,.perm-section,.phase-banner,.intervention-console,.system-reading,.boundary-card,.graph-metric,.activation-panel-clean,.result-pill,.interpret-block,.eq-box,.capacity-panel,.learning-panel,.reading-banner,.equation,.footer-box,.explain-box,.formula-card,.mode-panel,.settings-panel,.control-capsule,.slider-box,.co2-box,.co2-card,.vo2-card,.readout-box,.graph-block,.eq-mini,.interpret-inline,.painel,.caixa,.cartao,.selector-line,.mechanics-line,.actions,.metrics-wide,.monitor,.mini,.tend,.caso-c,.medidor';
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
    if(el.namespaceURI!=='http://www.w3.org/1999/xhtml'||el.closest('.fi-ef-brand,#fi-tutor-widget,.fi-tutor-widget,[data-fi-tutor]')||el.hasAttribute('data-fi-ef-card'))return;
    el.setAttribute('data-fi-ef-card','');
    const before=win.getComputedStyle(el,'::before'),width=parseFloat(before.width);
    if(before.content!=='none'&&before.position==='absolute'&&width>0&&width<=12&&parseFloat(before.left)<=1)el.classList.add('fi-ef-flat-strip');
   }
   function scan(node){if(node.nodeType!==1)return;if(node.matches(CARDS))mark(node);node.querySelectorAll(CARDS).forEach(mark);}
   scan(doc.body);
   let queued=false;const pending=new Set();
   const observer=new win.MutationObserver(records=>{for(const r of records)for(const n of r.addedNodes)if(n.nodeType===1)pending.add(n);if(pending.size&&!queued){queued=true;win.requestAnimationFrame(()=>{queued=false;for(const n of pending)if(n.isConnected)scan(n);pending.clear();});}});
   observer.observe(doc.body,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>mount(document,entry),{once:true});else mount(document,entry);
 }).catch(e=>console.warn('Padronização visual '+courseName+':',e.message));
})();
