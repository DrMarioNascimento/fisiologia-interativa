import { AXES, PARAM_DEFS, formatParam } from './axes.js?v=20261018-audit2';
import { BASELINE_STATE, DEFAULT_PARAMS, advance, waterLimitReached } from './model.js?v=20261018-audit2';
import { computeLabs, BASELINE_LABS, LAB_DEFS, formatLab, labStatus } from './labs.js?v=20261018-audit2';
import { SCENARIOS } from './scenarios.js?v=20261018-audit2';
import { interpret } from './interpret.js?v=20261018-audit2';

const $ = id => document.getElementById(id);
const esc = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const axes = AXES.map(a => ({...a, interpretAxis:a.id, tabLabel:a.id === 'adrenal' ? 'ACTH / Cortisol' : a.id === 'neuro' ? 'ADH / Água' : a.tabLabel}));
const neuro = axes.find(a=>a.id==='neuro');
neuro.name = 'ADH — hormônio antidiurético (vasopressina)';
neuro.summary = 'Síntese hipotalâmica, liberação pela neuro-hipófise e controle renal da água.';
neuro.params = ['magnocellularFn','stalk','renalAdhSensitivity','ectopicAdh','bloodVolume','waterAccess'];
neuro.panel = ['posm','na','adh','uosm','urine','intake','tbw','waterBalance'];
neuro.stages = neuro.stages.slice(0,3);
neuro.stages[1] = {...neuro.stages[1], labs:['adh'], arrow:{label:'ADH na circulação → receptor V2 renal',signal:'adh'}};
neuro.feedback = neuro.feedback.filter(f=>f.type!=='positiva');
axes.push({...neuro,id:'ocitocina',interpretAxis:'neuro',tabLabel:'Ocitocina',name:'Ocitocina — parto e ejeção do leite',summary:'A ocitocina é sintetizada no hipotálamo e liberada pela neuro-hipófise; prolactina participa da produção do leite, e ocitocina da ejeção.',params:['magnocellularFn','stalk','labor','suckling'],monitor:['oxytocin','contraction','milk'],panel:['oxytocin','contraction','milk','prl'],stages:[{title:'Estímulo sensorial',subtitle:'Sucção ou estiramento cervical',labs:[],arrow:{label:'Aferências ao hipotálamo',signal:'oxytocin'}},{title:'Hipotálamo → neuro-hipófise',subtitle:'Síntese → transporte axonal → liberação',labs:['oxytocin'],arrow:{label:'Ocitocina → receptor OXTR',signal:'oxytocin'}},{title:'Útero',subtitle:'Contração do miométrio no contexto do parto',labs:['contraction']},{title:'Mama',subtitle:'Contração mioepitelial: ejeção do leite',labs:['milk']}],feedback:[{type:'positiva',text:'No parto: estiramento cervical → ocitocina → contrações → maior estiramento. O modelo representa a amplificação, sem simular o nascimento.'},{type:'integração',text:'A sucção participa dos reflexos de prolactina e ocitocina. Produção de leite e ejeção são processos diferentes.'}],chart:{mode:'relative',series:[{lab:'oxytocin',color:'var(--chart-1)'},{lab:'contraction',color:'var(--chart-2)'},{lab:'milk',color:'var(--chart-3)'}]}});
let axis=axes[0], params={...DEFAULT_PARAMS}, state={...BASELINE_STATE}, labs=computeLabs(state,params), running=false, history=[], scenarioId='normal', interpretationSignature='';
function sample(){history.push({t:state.t,labs:{...labs}});if(history.length>400)history.shift();}
function reset(){running=false;params={...DEFAULT_PARAMS};state={...BASELINE_STATE};labs=computeLabs(state,params);scenarioId='normal';history=[];sample();renderStructure();renderValues();}
function scenarioList(){return SCENARIOS.filter(s=>s.id==='normal'||(axis.id==='ocitocina'?['parto','lactacao'].includes(s.id):axis.id==='neuro'?s.axis==='neuro'&&s.id!=='parto':s.axis===axis.id));}
function renderStructure(){
 $('tabs').innerHTML=axes.map(a=>`<button type="button" data-axis="${a.id}" aria-pressed="${a.id===axis.id}">${esc(a.tabLabel)}</button>`).join('');
 $('axis-title').textContent=axis.name;$('axis-summary').textContent=axis.summary;
 const choices=scenarioList();const local=choices.some(s=>s.id===scenarioId);$('scenario').innerHTML=(!local?'<option value="" disabled>Experimento ativo em outro eixo / personalizado</option>':'')+choices.map(s=>`<option value="${s.id}">${esc(s.name)}</option>`).join('');$('scenario').value=local?scenarioId:'';
 $('scenario-description').textContent=SCENARIOS.find(s=>s.id===scenarioId)?.description||'Experimento personalizado';
 $('sliders').innerHTML=axis.params.map(key=>{const d=PARAM_DEFS[key];return `<div class="control"><label for="p-${key}">${esc(d.label)}<output id="v-${key}">${esc(formatParam(key,params[key]))}</output></label><input id="p-${key}" data-param="${key}" type="range" min="${d.min}" max="${d.max}" step="${d.step}" value="${params[key]}" aria-valuetext="${esc(formatParam(key,params[key]))}" aria-describedby="hint-${key}"><p class="muted" id="hint-${key}">${esc(d.hint)}</p></div>`}).join('');
 $('feedback').innerHTML=axis.feedback.map(f=>`<p class="${f.type==='positiva'?'positive':''}"><strong>${esc(f.type)}:</strong> ${esc(f.text)}</p>`).join('');
 $('legend').innerHTML=axis.chart.series.map(s=>`<span style="--c:${s.color}">${esc(LAB_DEFS[s.lab].short)}${['contraction','milk'].includes(s.lab)?' (% do máximo)':''}</span>`).join('');
}
function chip(id){const d=LAB_DEFS[id], status=d.low===undefined&&d.high===undefined?'':labStatus(id,labs[id]);return `<div class="lab"><small>${esc(d.label)}</small><b class="${status}">${formatLab(id,labs[id])}</b><small>${esc(d.unit)}</small><span class="status ${status}">${status||'efeito simulado'}${d.low!==undefined?' · '+d.low+'–'+d.high:''}</span></div>`;}
function renderValues(){
 const atLimit=waterLimitReached(state,params);if(atLimit)running=false;
 $('model-limit').hidden=!atLimit;$('model-limit').textContent=atLimit?'Limite do modelo atingido: balanço hídrico ainda diferente de zero. O avanço foi interrompido para não mostrar um falso equilíbrio. Modifique as entradas/perdas ou use Resetar.':'';
 $('clock').textContent='Dia '+state.t.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});$('play').disabled=running||atLimit;$('pause').disabled=!running;$('step').disabled=atLimit;
 $('diagram').innerHTML=axis.stages.map((s,i)=>`<div class="stage"><h3><span class="stage-number">${i+1}</span>${esc(s.title)}</h3><small>${esc(s.subtitle)}</small><div class="labs">${s.labs.map(chip).join('')}</div>${s.arrow?`<p class="signal">↓ ${esc(s.arrow.label)}</p>`:''}</div>`).join('');
 const result=interpret(axis.interpretAxis,labs,params);
 if(result.title.includes('em equilíbrio')) {
   const projected=computeLabs(advance(state,params,.25),params);
   if(axis.monitor.some(id=>Math.abs(projected[id]-labs[id])/Math.max(1,Math.abs(labs[id]))>.01)) {
     result.title='Resposta do eixo em evolução';result.points=['Os valores ainda podem estar na faixa, mas a resposta ao estímulo está em andamento. Acompanhe o tempo antes de interpretar um novo equilíbrio.',...result.points];
   }
 }
 if(axis.id==='ocitocina') {
   const stimulus=params.labor>0||params.suckling>0;
   result.title=stimulus&&params.magnocellularFn*params.stalk<.5?'Resposta de ocitocina comprometida':params.labor>0?(labs.contraction<10?'Estiramento cervical — resposta em desenvolvimento':'Reflexo de Ferguson — amplificação positiva'):params.suckling>0?(labs.milk<10?'Sucção — resposta em desenvolvimento':'Reflexo de ejeção do leite'):labs.oxytocin>1.1?'Estímulo removido — resposta em relaxamento':'Ocitocina em condição basal';
   result.points=[...(stimulus&&params.magnocellularFn*params.stalk<.5?['Há estímulo sensorial, mas a síntese/transporte foi reduzida; o estímulo não garante uma resposta hormonal preservada.']:[]),...axis.feedback.map(f=>f.text),'O indicador de ejeção representa potencial de ativação mioepitelial, não volume de leite. A ejeção efetiva exige leite disponível, que não é simulado.'];
 }
 const context=params.adenoFn<.2?'Contexto do experimento: falência adeno-hipofisária global (pan-hipopituitarismo anterior). Compare tireoide, adrenal, gônadas, GH e prolactina.':params.stalk<.1?'Contexto do experimento: interrupção da haste hipofisária. Compare os déficits dos eixos e a perda da inibição dopaminérgica da prolactina.':'';
 $('global-context').hidden=!context;$('global-context').textContent=context;
 const title='Padrão didático: '+result.title;
 const signature=JSON.stringify(result);if(interpretationSignature!==signature){interpretationSignature=signature;$('interpret-title').textContent=title;$('interpret-points').innerHTML=result.points.map(p=>`<li>${esc(p)}</li>`).join('');}
 const elsewhere=Object.keys(params).filter(k=>!axis.params.includes(k)&&params[k]!==DEFAULT_PARAMS[k]);
 $('cross-axis').hidden=!elsewhere.length;
 $('cross-axis').textContent=elsewhere.length?'Há variáveis alteradas em outros eixos: '+elsewhere.map(k=>PARAM_DEFS[k].label).join('; ')+'.':'';
 $('labs').innerHTML=axis.panel.map(chip).join('');drawChart();
}
function drawChart(){
 const left=56,top=18,w=720,h=218,start=history[0]?.t||0,end=Math.max(start+.1,state.t);
 const normalized=(l,id)=>l[id]/(BASELINE_LABS[id]||100)*100;
 let max=150;for(const row of history)for(const s of axis.chart.series)max=Math.max(max,normalized(row.labs,s.lab)*1.1);
 max=Math.ceil(max/50)*50;
 let svg='';for(let i=0;i<=4;i++){const y=top+h-i*h/4;svg+=`<line x1="${left}" y1="${y}" x2="${left+w}" y2="${y}" stroke="#385466"/><text x="${left-8}" y="${y+4}" text-anchor="end">${Math.round(max*i/4)}%</text>`;}
 for(const s of axis.chart.series){const points=history.map(r=>`${left+(r.t-start)/(end-start)*w},${top+h-normalized(r.labs,s.lab)/max*h}`).join(' ');svg+=`<polyline fill="none" stroke="${s.color}" stroke-width="2.5" points="${points}"><title>${esc(LAB_DEFS[s.lab].label)}</title></polyline>`;const last=history.at(-1);if(last)svg+=`<circle cx="${left+(last.t-start)/(end-start)*w}" cy="${top+h-normalized(last.labs,s.lab)/max*h}" r="3.5" fill="${s.color}"><title>${esc(LAB_DEFS[s.lab].label)}: ${formatLab(s.lab,last.labs[s.lab])} ${esc(LAB_DEFS[s.lab].unit)}</title></circle>`;}
 svg+=`<text x="${left}" y="263">Dia ${start.toFixed(1)}</text><text x="${left+w}" y="263" text-anchor="end">Dia ${state.t.toFixed(1)}</text>`;$('chart').innerHTML=svg;
 $('chart-time').textContent='Janela: '+history.length+' amostras. Hormônios: % do basal; contração e ejeção: % do máximo.';
}
function tick(days){state=advance(state,params,days);labs=computeLabs(state,params);sample();renderValues();}
setInterval(()=>{if(running)tick(Number($('speed').value)*.2)},200);
$('play').onclick=()=>{running=true;renderValues()};$('pause').onclick=()=>{running=false;renderValues()};$('reset').onclick=reset;$('step').onclick=()=>{running=false;tick(1)};
$('tabs').onclick=e=>{const b=e.target.closest('[data-axis]');if(!b)return;axis=axes.find(a=>a.id===b.dataset.axis);renderStructure();renderValues();};
$('scenario').onchange=()=>{const s=SCENARIOS.find(s=>s.id===$('scenario').value);if(!s)return;running=false;params={...DEFAULT_PARAMS,...s.params};state={...BASELINE_STATE,...s.statePatch};labs=computeLabs(state,params);scenarioId=s.id;history=[];sample();renderStructure();renderValues();};
$('sliders').oninput=e=>{const key=e.target.dataset.param;if(!key||!PARAM_DEFS[key])return;const d=PARAM_DEFS[key],v=Number(e.target.value);if(!Number.isFinite(v))return;params[key]=Math.min(d.max,Math.max(d.min,v));$('v-'+key).textContent=formatParam(key,params[key]);e.target.setAttribute('aria-valuetext',formatParam(key,params[key]));scenarioId='custom';$('scenario').value='';$('scenario-description').textContent='Experimento personalizado — inicie ou avance o tempo para observar a resposta.';labs=computeLabs(state,params);sample();renderValues();};
$('restore').onclick=()=>{params={...DEFAULT_PARAMS};scenarioId='normal';labs=computeLabs(state,params);sample();renderStructure();renderValues();$('scenario-description').textContent='Todas as variáveis foram restauradas. O estado e o histórico são preservados para observar a recuperação; Resetar inicia um novo experimento.';};
$('export').onclick=()=>{const ids=axis.panel;const rows=[['dia',...ids.map(id=>LAB_DEFS[id].label+' ('+LAB_DEFS[id].unit+')')],...history.map(r=>[r.t,...ids.map(id=>r.labs[id])])];const csv='\uFEFF'+rows.map(row=>row.map(x=>'"'+String(x).replaceAll('"','""')+'"').join(';')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='sistema-endocrino-'+axis.id+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
reset();
