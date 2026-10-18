import { AXES, PARAM_DEFS, formatParam } from './axes.js';
import { BASELINE_STATE, DEFAULT_PARAMS, advance } from './model.js';
import { computeLabs, BASELINE_LABS, LAB_DEFS, formatLab, labStatus } from './labs.js';
import { SCENARIOS } from './scenarios.js';
import { interpret } from './interpret.js';

const $ = id => document.getElementById(id);
const esc = value => String(value).replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const axes = AXES.map(a => ({...a, interpretAxis:a.id, tabLabel:a.id === 'adrenal' ? 'ACTH / Cortisol' : a.id === 'neuro' ? 'ADH / Água' : a.tabLabel}));
const neuro = axes.find(a=>a.id==='neuro');
neuro.name = 'ADH — hormônio antidiurético (vasopressina)';
neuro.summary = 'Síntese hipotalâmica, liberação pela neuro-hipófise e controle renal da água.';
neuro.params = ['magnocellularFn','stalk','renalAdhSensitivity','ectopicAdh','bloodVolume','waterAccess'];
neuro.panel = ['posm','na','adh','uosm','urine','intake','tbw'];
neuro.stages = neuro.stages.slice(0,3);
neuro.stages[1] = {...neuro.stages[1], labs:['adh'], arrow:{label:'ADH na circulação → receptor V2 renal',signal:'adh'}};
neuro.feedback = neuro.feedback.filter(f=>f.type!=='positiva');
axes.push({...neuro,id:'ocitocina',interpretAxis:'neuro',tabLabel:'Ocitocina',name:'Ocitocina — parto e ejeção do leite',summary:'A ocitocina é sintetizada no hipotálamo e liberada pela neuro-hipófise; prolactina participa da produção do leite, e ocitocina da ejeção.',params:['magnocellularFn','stalk','labor','suckling'],monitor:['oxytocin','contraction','milk'],panel:['oxytocin','contraction','milk','prl'],stages:[{title:'Estímulo sensorial',subtitle:'Sucção ou estiramento cervical',labs:[],arrow:{label:'Aferências ao hipotálamo',signal:'oxytocin'}},{title:'Hipotálamo → neuro-hipófise',subtitle:'Síntese → transporte axonal → liberação',labs:['oxytocin'],arrow:{label:'Ocitocina → receptor OXTR',signal:'oxytocin'}},{title:'Útero',subtitle:'Contração do miométrio no contexto do parto',labs:['contraction']},{title:'Mama',subtitle:'Contração mioepitelial: ejeção do leite',labs:['milk']}],feedback:[{type:'positiva',text:'No parto: estiramento cervical → ocitocina → contrações → maior estiramento. O modelo representa a amplificação, sem simular o nascimento.'},{type:'integração',text:'A sucção participa dos reflexos de prolactina e ocitocina. Produção de leite e ejeção são processos diferentes.'}],chart:{mode:'relative',series:[{lab:'oxytocin',color:'var(--chart-1)'},{lab:'contraction',color:'var(--chart-2)'},{lab:'milk',color:'var(--chart-3)'}]}});
let axis=axes[0], params={...DEFAULT_PARAMS}, state={...BASELINE_STATE}, labs=computeLabs(state,params), running=false, history=[], scenarioId='normal';
function sample(){history.push({t:state.t,labs:{...labs}});if(history.length>400)history.shift();}
function reset(){running=false;params={...DEFAULT_PARAMS};state={...BASELINE_STATE};labs=computeLabs(state,params);scenarioId='normal';history=[];sample();renderStructure();renderValues();}
function scenarioList(){return SCENARIOS.filter(s=>s.id==='normal'||(axis.id==='ocitocina'?['parto','lactacao'].includes(s.id):axis.id==='neuro'?s.axis==='neuro'&&s.id!=='parto':s.axis===axis.id));}
function renderStructure(){
 $('tabs').innerHTML=axes.map(a=>`<button type="button" data-axis="${a.id}" aria-pressed="${a.id===axis.id}">${esc(a.tabLabel)}</button>`).join('');
 $('axis-title').textContent=axis.name;$('axis-summary').textContent=axis.summary;
 const choices=scenarioList();$('scenario').innerHTML=choices.map(s=>`<option value="${s.id}">${esc(s.name)}</option>`).join('');$('scenario').value=choices.some(s=>s.id===scenarioId)?scenarioId:'';
 $('scenario-description').textContent=SCENARIOS.find(s=>s.id===scenarioId)?.description||'Experimento personalizado';
 $('sliders').innerHTML=axis.params.map(key=>{const d=PARAM_DEFS[key];return `<div class="control"><label for="p-${key}">${esc(d.label)}<output id="v-${key}">${esc(formatParam(key,params[key]))}</output></label><input id="p-${key}" data-param="${key}" type="range" min="${d.min}" max="${d.max}" step="${d.step}" value="${params[key]}" aria-describedby="hint-${key}"><p class="muted" id="hint-${key}">${esc(d.hint)}</p></div>`}).join('');
 $('feedback').innerHTML=axis.feedback.map(f=>`<p class="${f.type==='positiva'?'positive':''}"><strong>${esc(f.type)}:</strong> ${esc(f.text)}</p>`).join('');
 $('legend').innerHTML=axis.chart.series.map(s=>`<span style="--c:${s.color}">${esc(LAB_DEFS[s.lab].short)}${['contraction','milk'].includes(s.lab)?' (% do máximo)':''}</span>`).join('');
}
function chip(id){const d=LAB_DEFS[id], status=d.low===undefined&&d.high===undefined?'':labStatus(id,labs[id]);return `<div class="lab"><small>${esc(d.label)}</small><b class="${status}">${formatLab(id,labs[id])}</b><small>${esc(d.unit)}</small><span class="status ${status}">${status||'efeito simulado'}${d.low!==undefined?' · '+d.low+'–'+d.high:''}</span></div>`;}
function renderValues(){
 $('clock').textContent='Dia '+state.t.toLocaleString('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2});$('play').disabled=running;$('pause').disabled=!running;
 $('diagram').innerHTML=axis.stages.map((s,i)=>`<div class="stage"><h3><span class="stage-number">${i+1}</span>${esc(s.title)}</h3><small>${esc(s.subtitle)}</small><div class="labs">${s.labs.map(chip).join('')}</div>${s.arrow?`<p class="signal">↓ ${esc(s.arrow.label)}</p>`:''}</div>`).join('');
 const result=interpret(axis.interpretAxis,labs,params);
 if(axis.id==='ocitocina') {result.title=params.labor>0?'Reflexo de Ferguson — amplificação positiva':params.suckling>0?'Reflexo de ejeção do leite':'Ocitocina em condição basal';result.points=axis.feedback.map(f=>f.text);}
 const context=params.adenoFn<.2?'Contexto do experimento: falência adeno-hipofisária global (pan-hipopituitarismo anterior). Compare tireoide, adrenal, gônadas, GH e prolactina.':params.stalk<.1?'Contexto do experimento: interrupção da haste hipofisária. Compare os déficits dos eixos e a perda da inibição dopaminérgica da prolactina.':'';
 $('global-context').hidden=!context;$('global-context').textContent=context;
 const title='Padrão didático: '+result.title;
 if($('interpret-title').textContent!==title){$('interpret-title').textContent=title;$('interpret-points').innerHTML=result.points.map(p=>`<li>${esc(p)}</li>`).join('');}
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
 for(const s of axis.chart.series){const points=history.map(r=>`${left+(r.t-start)/(end-start)*w},${top+h-normalized(r.labs,s.lab)/max*h}`).join(' ');svg+=`<polyline fill="none" stroke="${s.color}" stroke-width="2.5" points="${points}"><title>${esc(LAB_DEFS[s.lab].label)}</title></polyline>`;}
 svg+=`<text x="${left}" y="263">Dia ${start.toFixed(1)}</text><text x="${left+w}" y="263" text-anchor="end">Dia ${state.t.toFixed(1)}</text>`;$('chart').innerHTML=svg;
 $('chart-time').textContent='Janela: '+history.length+' amostras. Hormônios: % do basal; contração e ejeção: % do máximo.';
}
function tick(days){state=advance(state,params,days);labs=computeLabs(state,params);sample();renderValues();}
setInterval(()=>{if(running)tick(Number($('speed').value)*.2)},200);
$('play').onclick=()=>{running=true;renderValues()};$('pause').onclick=()=>{running=false;renderValues()};$('reset').onclick=reset;$('step').onclick=()=>{running=false;tick(1)};
$('tabs').onclick=e=>{const b=e.target.closest('[data-axis]');if(!b)return;axis=axes.find(a=>a.id===b.dataset.axis);renderStructure();renderValues();};
$('scenario').onchange=()=>{const s=SCENARIOS.find(s=>s.id===$('scenario').value);if(!s)return;running=false;params={...DEFAULT_PARAMS,...s.params};state={...BASELINE_STATE,...s.statePatch};labs=computeLabs(state,params);scenarioId=s.id;history=[];sample();renderStructure();renderValues();};
$('sliders').oninput=e=>{const key=e.target.dataset.param;if(!key)return;params[key]=Number(e.target.value);$('v-'+key).textContent=formatParam(key,params[key]);scenarioId='custom';$('scenario').value='';$('scenario-description').textContent='Experimento personalizado — inicie ou avance o tempo para observar a resposta.';labs=computeLabs(state,params);renderValues();};
$('restore').onclick=()=>{params={...DEFAULT_PARAMS};scenarioId='normal';labs=computeLabs(state,params);renderStructure();renderValues();$('scenario-description').textContent='Todas as variáveis foram restauradas. O estado e o histórico são preservados para observar a recuperação; Resetar inicia um novo experimento.';};
$('export').onclick=()=>{const ids=axis.panel;const rows=[['dia',...ids.map(id=>LAB_DEFS[id].label+' ('+LAB_DEFS[id].unit+')')],...history.map(r=>[r.t,...ids.map(id=>r.labs[id])])];const csv='\uFEFF'+rows.map(row=>row.map(x=>'"'+String(x).replaceAll('"','""')+'"').join(';')).join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='sistema-endocrino-'+axis.id+'.csv';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)};
reset();
