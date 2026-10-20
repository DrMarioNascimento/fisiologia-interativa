/* Weekly planning stored on this device. This module does not schedule notifications. */
(function(root){
 'use strict';
 const KEY='respiratoryAgenda.v1';
 const PRESETS={coerencia:[5,0,5,0],relaxamento:[4,0,6,0],'478':[4,7,8,0],diafragmatica:[4,1,6,1]};
 const NAMES={coerencia:'Coerência',relaxamento:'Relaxamento','478':'Técnica 4–7–8',diafragmatica:'Diafragmática',custom:'Personalizado'};
 const DAYS=['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];
 function normalize(input){
  if(!input||typeof input!=='object')throw Error('Preencha as escolhas da agenda.');
  const days=Array.isArray(input.days)?[...new Set(input.days)].sort((a,b)=>a-b):[];
  if(days.some(d=>!Number.isInteger(d)||d<0||d>6)||(input.enabled!==false&&days.length===0))throw Error('Escolha pelo menos um dia da semana.');
  if(typeof input.time!=='string'||!/^([01]\d|2[0-3]):[0-5]\d$/.test(input.time))throw Error('Escolha um horário válido.');
  if(!Object.hasOwn(NAMES,input.protocol))throw Error('Escolha um protocolo.');
  const times=PRESETS[input.protocol]?[...PRESETS[input.protocol]]:input.times;
  const ranges=[[2,8],[0,8],[2,10],[0,5]];
  if(!Array.isArray(times)||times.length!==4||times.some((v,i)=>!Number.isInteger(v)||v<ranges[i][0]||v>ranges[i][1]))throw Error('Copie um ritmo válido da sessão.');
  if(input.minutes!==null&&(!Number.isInteger(input.minutes)||input.minutes<1||input.minutes>180))throw Error('A duração deve ser livre ou de 1 a 180 minutos inteiros.');
  const audio=input.audio;
  if(!audio||!['off','continuous','voice','chime'].includes(audio.mode)||!['recorded','device'].includes(audio.voiceSource)||!Number.isFinite(audio.volume)||audio.volume<0||audio.volume>100)throw Error('Escolha um guia sonoro e um volume válidos.');
  return {enabled:input.enabled!==false,days,time:input.time,protocol:input.protocol,times:[...times],minutes:input.minutes,endSound:input.endSound===true,audio:{mode:audio.mode,voiceSource:audio.voiceSource,voiceURI:typeof audio.voiceURI==='string'?audio.voiceURI.slice(0,1024):'',volume:audio.volume}};
 }
 function nextOccurrence(plan,now=new Date()){
  if(!plan||!plan.enabled)return null;
  const [hours,minutes]=plan.time.split(':').map(Number);
  for(let offset=0;offset<=7;offset++){
   const date=new Date(now);date.setDate(now.getDate()+offset);date.setHours(hours,minutes,0,0);
   if(plan.days.includes(date.getDay())&&date.getTime()>=now.getTime())return date;
  }
  return null;
 }
 function createStore(storage){
  let plan=null;
  try{const value=storage?.getItem(KEY);if(value)plan=normalize(JSON.parse(value));}catch(_){}
  return {get:()=>plan&&normalize(plan),save(input){const next=normalize(input);if(!storage)throw Error('O navegador não permitiu salvar a agenda.');try{storage.setItem(KEY,JSON.stringify(next));}catch(_){throw Error('O navegador não permitiu salvar a agenda. Suas escolhas anteriores foram preservadas.');}plan=next;return normalize(plan);}};
 }
 function createUI({getCurrent,startPlan,isBusy}){
  const $=id=>document.getElementById(id);let storage;try{storage=window.localStorage;}catch(_){}
  const store=createStore(storage),status=$('agendaStatus'),start=$('agendaStart'),summary=$('agendaSummary'),next=$('agendaNext');
  const dayNodes=[0,1,2,3,4,5,6].map(d=>$('agendaDay'+d));
  let copiedTimes=[4,1,6,1],voiceURI='',starting=false,timer=null;
  const audioNames={off:'Desligado',continuous:'Tom suave contínuo',voice:'Voz em português',chime:'Sinal discreto'};
  function form(){return {enabled:$('agendaEnabled').checked,days:dayNodes.filter(n=>n.checked).map(n=>+n.value),time:$('agendaTime').value,protocol:$('agendaProtocol').value,times:copiedTimes,minutes:$('agendaDuration').value==='free'?null:$('agendaDuration').value==='custom'?+$('agendaMinutes').value:+$('agendaDuration').value,endSound:$('agendaEndSound').checked,audio:{mode:$('agendaAudioMode').value,voiceSource:$('agendaVoiceSource').value,voiceURI,volume:+$('agendaVolume').value}};}
  function fields(){
   $('agendaCustomWrap').hidden=$('agendaDuration').value!=='custom';$('agendaVoiceWrap').hidden=$('agendaAudioMode').value!=='voice';
   $('agendaVolumeValue').textContent=$('agendaVolume').value+'%';
   const times=PRESETS[$('agendaProtocol').value]||copiedTimes;
   $('agendaRhythm').textContent='Ritmo: '+times.join('–')+' s (inspirar · pausa · expirar · pausa).';
  }
  function fill(plan){
   $('agendaEnabled').checked=plan.enabled;dayNodes.forEach(n=>n.checked=plan.days.includes(+n.value));$('agendaTime').value=plan.time;
   $('agendaProtocol').value=plan.protocol;copiedTimes=[...plan.times];
   $('agendaDuration').value=plan.minutes===null?'free':[3,5,10].includes(plan.minutes)?String(plan.minutes):'custom';if(plan.minutes!==null)$('agendaMinutes').value=String(plan.minutes);
   $('agendaEndSound').checked=plan.endSound;$('agendaAudioMode').value=plan.audio.mode;$('agendaVoiceSource').value=plan.audio.voiceSource;$('agendaVolume').value=String(plan.audio.volume);voiceURI=plan.audio.voiceURI||'';fields();
  }
  function render(){
   const plan=store.get();start.disabled=starting||!plan?.enabled;
   if(!plan){$('agendaCurrent').textContent='Não configurada';summary.textContent='Escolha sua rotina e salve a agenda neste aparelho.';next.textContent='';return;}
   $('agendaCurrent').textContent=plan.enabled?plan.time:'Desativada';
   const voice=plan.audio.mode==='voice'?' · '+(plan.audio.voiceSource==='device'?'voz do aparelho':'voz gravada'):'';
   summary.textContent=plan.days.map(d=>DAYS[d]).join(', ')+' · '+plan.time+' · '+NAMES[plan.protocol]+' · '+(plan.minutes===null?'tempo livre':plan.minutes+' min')+' · '+audioNames[plan.audio.mode]+voice;
   const date=nextOccurrence(plan);next.textContent=date?'Próxima sessão: '+date.toLocaleString('pt-BR',{weekday:'long',day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})+'. Horário deste aparelho.':'Agenda desativada.';
  }
  function save(){try{const plan=store.save(form());fill(plan);render();status.textContent='Agenda salva neste aparelho. '+(plan.enabled?'Inicie a sessão planejada quando preferir.':'A agenda está desativada.');}catch(error){status.textContent=error.message;}}
  $('agendaSave').addEventListener('click',save);
  $('agendaCopy').addEventListener('click',()=>{
   try{const choices=getCurrent();const draft=form();fill(normalize({...draft,...choices,days:draft.days.length?draft.days:[1,2,3,4,5]}));status.textContent='Escolhas da sessão copiadas. Toque em Salvar agenda para guardar.';}catch(error){status.textContent=error.message;}
  });
  for(const id of ['agendaProtocol','agendaDuration','agendaAudioMode','agendaVoiceSource'])$(id).addEventListener('change',fields);
  $('agendaVolume').addEventListener('input',fields);
  start.addEventListener('click',async()=>{
   if(starting)return;
   const plan=store.get();if(!plan?.enabled)return;
   try{if(JSON.stringify(normalize(form()))!==JSON.stringify(plan)){status.textContent='Salve as alterações da agenda antes de iniciar.';return;}}catch(error){status.textContent=error.message;return;}
   if(isBusy()){status.textContent='Encerre a sessão atual antes de iniciar a sessão planejada.';return;}
   starting=true;render();status.textContent='Preparando a sessão planejada…';
   try{const result=await startPlan(plan);status.textContent=result.ok?'Sessão planejada iniciada.':result.message||'A sessão não foi iniciada. Verifique as escolhas e tente novamente.';}catch(_){status.textContent='Não foi possível iniciar. Verifique as escolhas e tente novamente.';}finally{starting=false;render();}
  });
  fill(store.get()||{enabled:true,days:[1,2,3,4,5],time:'08:00',protocol:'coerencia',times:PRESETS.coerencia,minutes:5,endSound:false,audio:{mode:'off',voiceSource:'recorded',voiceURI:'',volume:45}});render();
  function refresh(){render();if(timer===null)timer=window.setInterval(render,60000);}
  window.addEventListener('pageshow',refresh);window.addEventListener('pagehide',()=>{if(timer!==null)window.clearInterval(timer);timer=null;});
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)render();});refresh();
  return {refresh:render};
 }
 if(typeof module==='object'&&module.exports)module.exports={normalize,nextOccurrence,createStore};
 if(root)root.createRespiratoryAgendaUI=createUI;
})(typeof window==='object'?window:null);
