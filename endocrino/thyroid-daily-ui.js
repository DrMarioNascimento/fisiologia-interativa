import { HOURS, DAILY_HORMONES, STUDIES, studyGroups, groupLabel, studyValue, studyCSV } from './thyroid-daily-data.js?v=20261019-reference3';
export function mountDailyView({pauseExperiment,drawExperiment}) {
 const $=id=>document.getElementById(id);let mode='daily',hour=8,timer=null;
 const visible=new Set(['tsh','ft4','ft3']);
 const num=v=>v.toLocaleString('pt-BR',{maximumFractionDigits:3});
 const delta=v=>(v>=0?'+':'')+num(v)+'%';
 const time=h=>{const m=Math.round(h*60);return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');};
 const esc=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
 function stop(){clearInterval(timer);timer=null;$('daily-play').textContent='Animar 24 h';}
 function setView(next){if(next===mode)return;stop();pauseExperiment();mode=next;const daily=next==='daily';
  document.querySelector('.experiment-workspace').classList.remove('pediatric-view');
  $('daily-results').hidden=false;$('daily-controls').hidden=!daily;
  $('daily-results').classList.toggle('reference-compact',!daily);
  $('expected-study-note').hidden=daily;$('daily-choose-reference').hidden=daily;
  $('daily-heading').textContent=daily?'Padrão esperado · dados dos estudos':'Padrão publicado · referência em 24 horas';
  if(!daily) $('sex-legend').textContent=$('daily-study').value==='zhang'?studyGroups('zhang',$('daily-sex').value).map(g=>groupLabel(g)+(g==='women'?' · marcadores vazados':' · marcadores preenchidos')).join(' | '):'Adultos · grupo misto · ajuste publicado';
  $('experiment-results').hidden=$('experiment-controls').hidden=$('experiment-data').hidden=daily;
  $('view-daily').setAttribute('aria-pressed',String(daily));$('view-experiment').setAttribute('aria-pressed',String(!daily));
  $('investigation-mode-title').textContent=daily?'Compare estudos e populações':'Modifique uma variável';
  $('investigation-mode-description').textContent=daily?'Escolha a fonte e a referência percentual.':'Preveja a resposta, altere um controle e avance os dias.';
  if(daily)render();else { $('expected-study-note').textContent=$('daily-study').value==='children'?'Pediatria: os estudos recuperados não fornecem uma curva horária completa. Consulte as janelas no painel de estudos.':'Linhas pontilhadas: referência publicada em adultos saudáveis. Este gráfico usa horas; seu experimento abaixo usa dias. A referência permanece intacta, sem prever a curva da doença.';render();drawExperiment(); }
 }
 function render(){
  const study=$('daily-study').value,ref=$('daily-reference').value,children=study==='children';
  document.querySelector('.experiment-workspace').classList.toggle('pediatric-view',children&&mode==='daily');
  $('daily-interpolation-note').textContent=children?'Sem curva contínua: compare as janelas e os extremos recuperados.':study==='russell'?'Cada ponto da curva é calculado do ajuste coletivo publicado, sem novas dosagens.':'Nos intervalos entre as coletas, os valores mostrados são interpolados. O fechamento em 24 h repete 00:00.';
  $('daily-scope-note').textContent=children?'A idade e o protocolo diferem entre estudos. Recém-nascidos não recebem uma curva adulta.': 'Dados de adultos saudáveis. Cenários e intervenções ficam em “Experimento · dias”.';
  $('daily-description').textContent=STUDIES[study].description;
  $('daily-sex-label').hidden=$('daily-sex').hidden=study!=='zhang';
  $('daily-reference-label').hidden=$('daily-reference').hidden=children;
  $('daily-adult-controls').hidden=children;$('daily-adult-results').hidden=children;$('daily-pediatric').hidden=!children;$('daily-readouts').hidden=children;
  if(children){stop();$('daily-readouts').replaceChildren();return;}
  const groups=studyGroups(study,$('daily-sex').value),ids=[...visible],read=(g,h,t)=>studyValue(study,g,h,t,ref);
  $('daily-hour').value=hour;$('daily-clock').textContent=$('daily-hour-value').textContent=time(hour);
  const width=Math.max(280,Math.min(900,$('daily-chart').clientWidth||900)),height=mode==='experiment'?220:width<500?310:340,left=width<500?61:72,right=width-24,bottom=height-60;
  const times=study==='zhang'?[...HOURS,24]:Array.from({length:97},(_,i)=>i/4);
  const vals=groups.flatMap(g=>ids.flatMap(h=>times.map(t=>read(g,h,t).percent))),lo=Math.min(100,...vals),hi=Math.max(100,...vals),raw=Math.max(10,hi-lo+10)/4,mag=10**Math.floor(Math.log10(raw)),f=raw/mag,step=(f<=1?1:f<=2?2:f<=5?5:10)*mag;
  const min=Math.max(0,Math.floor((lo-5)/step)*step),max=Math.ceil((hi+5)/step)*step,x=t=>left+t/24*(right-left),y=v=>30+(bottom-30)*(max-v)/(max-min);
  $('daily-chart').setAttribute('viewBox',`0 0 ${width} ${height}`);
  let svg='<title id="daily-chart-title">'+esc(STUDIES[study].label)+'</title><desc id="daily-chart-desc">Zhang: pontos publicados e interpolação. Russell: ajuste coletivo reconstruído, sem pontos medidos.</desc>';
  for(let v=min;v<=max+step/10;v+=step)svg+=`<line class="daily-grid" x1="${left}" x2="${right}" y1="${y(v)}" y2="${y(v)}"/><text x="${left-8}" y="${y(v)+4}" text-anchor="end">${num(v)}%</text>`;
  for(const t of [...HOURS,24])svg+=`<text x="${x(t)}" y="${bottom+22}" text-anchor="middle">${t}h</text>`;
  const reference=ref==='08h'?'valor às 08h':study==='zhang'?'média de 6 medianas':'mesor publicado';
  svg+=`<text x="${left}" y="17">100% = ${esc(reference)}</text><line class="daily-basal" x1="${left}" x2="${right}" y1="${y(100)}" y2="${y(100)}"/>`;
  for(const g of groups)for(const h of ids){const info=DAILY_HORMONES[h],dash=g==='women'?' stroke-dasharray="7 5"':'',bodyTimes=study==='zhang'?HOURS:times;
   svg+=`<polyline fill="none" stroke="${info.color}" stroke-width="2.5"${dash} points="${bodyTimes.map(t=>x(t)+','+y(read(g,h,t).percent)).join(' ')}"/>`;
   if(study==='zhang'){svg+=`<line x1="${x(20)}" y1="${y(read(g,h,20).percent)}" x2="${x(24)}" y2="${y(read(g,h,24).percent)}" stroke="${info.color}" stroke-width="2" stroke-dasharray="2 6"/>`;
    for(const t of HOURS){const d=read(g,h,t);svg+=`<circle cx="${x(t)}" cy="${y(d.percent)}" r="3" fill="${g==='women'?'#0b202e':info.color}" stroke="${info.color}"><title>${esc(groupLabel(g)+' · '+time(t)+' · '+info.label+': '+num(d.value)+' '+d.unit)}</title></circle>`;}
   }
  }
  svg+=`<line class="daily-cursor" x1="${x(hour)}" x2="${x(hour)}" y1="30" y2="${bottom}"/>`;$('daily-chart').innerHTML=svg;
  $('daily-caption').textContent=time(hour)+' · '+read(groups[0],ids[0],hour).origin+' · '+STUDIES[study].label;
  $('daily-reading').textContent=study==='zhang'?'As medianas representam esta coorte. FT3 e FT4 não tiveram variação intradiária significativa; ligar pontos não demonstra ritmo universal.':'Ajuste coletivo: amplitude relativa do TSH ≈24,66%, FT3 ≈3,45% e FT4 ≈0,60% em relação ao mesor. Não equivale à média das amplitudes individuais. Sem banda de confiança ou previsão individual.';
  $('sex-legend').textContent=mode==='experiment'?(study==='zhang'?groups.map(g=>groupLabel(g)+(g==='women'?' · marcadores vazados':' · marcadores preenchidos')).join(' | '):'Adultos · grupo misto · ajuste publicado'):groups.map(g=>groupLabel(g)+(g==='women'?' · tracejada':g==='men'?' · contínua':' · ajuste coletivo')).join(' | ')+(study==='zhang'?' | pontilhado fino: fechamento assumido':'');
  const cards=ids.map(h=>{const el=document.createElement('article');el.className='daily-readout metric-card';el.style.setProperty('--series',DAILY_HORMONES[h].color);const title=document.createElement('h3');title.textContent=DAILY_HORMONES[h].label;el.append(title);for(const g of groups){const d=read(g,h,hour),p=document.createElement('p');p.textContent=groupLabel(g)+': '+num(d.value)+' '+d.unit+' · '+delta(d.percent-100)+' da referência';el.append(p);}return el;});$('daily-readouts').replaceChildren(...cards);
  const rows=[];for(const t of study==='zhang'?HOURS:Array.from({length:13},(_,i)=>i*2))for(const g of groups){const tr=document.createElement('tr');for(const v of [time(t),groupLabel(g),...['tsh','ft4','ft3'].flatMap(h=>{const d=read(g,h,t);return[num(d.value)+' '+d.unit,delta(d.percent-100)];}),read(g,'tsh',t).origin]){const td=document.createElement('td');td.textContent=v;tr.append(td);}rows.push(tr);}$('daily-table').replaceChildren(...rows);
 }
 $('daily-choose-reference').onclick=()=>setView('daily');
 $('view-daily').onclick=()=>setView('daily');$('view-experiment').onclick=()=>setView('experiment');
 for(const id of ['daily-study','daily-sex','daily-reference'])$(id).addEventListener('change',()=>{stop();render();});
 $('daily-hour').oninput=()=>{stop();hour=Number($('daily-hour').value);render();};$('daily-step').onclick=()=>{stop();hour=(hour+1)%24;render();};$('daily-reset').onclick=()=>{stop();hour=8;render();};
 $('daily-play').onclick=()=>{if(timer){stop();return;}$('daily-play').textContent='Pausar';timer=setInterval(()=>{hour=(hour+.25)%24;render();},500);};
 for(const b of document.querySelectorAll('[data-daily-hormone]'))b.onclick=()=>{const h=b.dataset.dailyHormone;if(visible.has(h)){if(visible.size===1)return;visible.delete(h);}else visible.add(h);for(const x of document.querySelectorAll('[data-daily-hormone]')){const yes=visible.has(x.dataset.dailyHormone);x.setAttribute('aria-pressed',String(yes));x.disabled=yes&&visible.size===1;}render();};
 $('daily-export').onclick=()=>{const s=$('daily-study').value,u=URL.createObjectURL(new Blob([studyCSV(s,$('daily-sex').value,$('daily-reference').value)],{type:'text/csv;charset=utf-8'})),a=document.createElement('a');a.href=u;a.download='tireoide-estudo-'+s+'.csv';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000);};
 document.defaultView?.addEventListener('resize',render);document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});render();return{showExperiment:()=>setView('experiment')};
}

