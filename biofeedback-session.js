/* Active session time is supplied by the simulator; paused time is excluded there. */
(function (root) {
  'use strict';
  const HISTORY = 'respiratorySessionHistory.v1', PREFS = 'respiratorySessionPreferences.v1';
  function createModel(storage) {
    let current = null, history = [], saved = true;
    try {
      const parsed = JSON.parse(storage?.getItem(HISTORY) || '[]');
      if (Array.isArray(parsed)) history = parsed.filter(r => r && typeof r.id === 'string' && Number.isFinite(r.elapsedMs) && r.elapsedMs >= 0 && Number.isInteger(r.cycles) && r.cycles >= 0 && typeof r.endedAt === 'string' && Number.isFinite(Date.parse(r.endedAt)) && (r.targetMs===null||(Number.isFinite(r.targetMs)&&r.targetMs>0)) && ['completed','interrupted'].includes(r.status) && Array.isArray(r.rhythms) && r.rhythms.every(v=>v&&typeof v.name==='string'&&Array.isArray(v.times)&&v.times.length===4&&v.times.every(t=>Number.isFinite(t)&&t>=0))).slice(0,100);
    } catch (_) {}
    const copy = value => JSON.parse(JSON.stringify(value));
    function start({targetMs = null, rhythm, date = new Date().toISOString()}) {
      if (current) return;
      current = {id: Date.now().toString(36)+'-'+Math.random().toString(36).slice(2), startedAt:date, targetMs, elapsedMs:0, cycles:0, rhythms:[{atMs:0,...copy(rhythm)}]};
    }
    function update(elapsedMs, cycles, boundary = false) {
      if (!current) return {active:false, due:false, complete:false};
      current.elapsedMs = Math.max(current.elapsedMs, Math.max(0,elapsedMs)); current.cycles = cycles;
      const due = current.targetMs !== null && current.elapsedMs >= current.targetMs;
      return {active:true, due, complete:due && boundary, remainingMs:current.targetMs === null ? null : Math.max(0,current.targetMs-current.elapsedMs)};
    }
    function rhythmChanged(rhythm, elapsedMs) {
      if (!current) return;
      const previous=current.rhythms.at(-1);
      if (JSON.stringify(previous.times) !== JSON.stringify(rhythm.times)) current.rhythms.push({atMs:Math.max(0,elapsedMs),...copy(rhythm)});
    }
    function finish(reason='completed', date=new Date().toISOString()) {
      if (!current) return null;
      const record={...copy(current),endedAt:date,status:reason==='completed'?'completed':'interrupted',reason}; current=null;
      if (record.elapsedMs <= 0) return null;
      history=[record,...history].slice(0,100); saved=true;
      try { if (!storage) throw Error('Armazenamento indisponível'); storage.setItem(HISTORY,JSON.stringify(history)); } catch (_) { saved=false; }
      return {record, saved};
    }
    return {start,update,rhythmChanged,finish,list:()=>copy(history),get active(){return !!current;},get current(){return current&&copy(current);}};
  }
  function createUI({rhythm,onEnd,onSoundChange}) {
    const $=id=>document.getElementById(id);
    const duration=$('sessionDuration'),custom=$('sessionCustomMinutes'),customWrap=$('sessionCustomWrap'),sound=$('sessionEndSound');
    const live=$('sessionLive'),status=$('sessionStatus'),summary=$('sessionSummary'),summaryBody=$('sessionSummaryBody'),historyBody=$('sessionHistory'),end=$('sessionEnd');
    let storage;try{storage=window.localStorage;}catch(_){}
    const model=createModel(storage);let lastText='';
    function time(ms, ceil=false) { const seconds=Math.max(0,(ceil?Math.ceil:Math.floor)(ms/1000));return String(Math.floor(seconds/60)).padStart(2,'0')+':'+String(seconds%60).padStart(2,'0'); }
    function target() { return duration.value==='free'?null:Math.round((duration.value==='custom'?+custom.value:+duration.value)*60000); }
    function valid() { return duration.value!=='custom'||(Number.isInteger(+custom.value)&&+custom.value>=1&&+custom.value<=180); }
    function prefs() {
      customWrap.hidden=duration.value!=='custom';
      if(!model.active)live.textContent=duration.value==='free'?'Tempo livre':'Sessão programada · '+(valid()?time(target()):'defina a duração');
      $('sessionCurrent').textContent=duration.value==='free'?'Tempo livre':duration.value==='custom'?custom.value+' min':duration.value+' min';
      custom.setCustomValidity(valid()?'':'Escolha um número inteiro de 1 a 180 minutos.');
      try {storage?.setItem(PREFS,JSON.stringify({duration:duration.value,custom:+custom.value,sound:sound.checked}));}catch(_){}
    }
    try {const p=JSON.parse(storage?.getItem(PREFS)||'null');if(p){if(['free','3','5','10','custom'].includes(p.duration))duration.value=p.duration;if(Number.isFinite(p.custom)&&p.custom>=1&&p.custom<=180)custom.value=p.custom;sound.checked=p.sound===true;}}catch(_){}
    function setActive(active) {duration.disabled=active;custom.disabled=active;end.disabled=!active;}
    function rhythmText(item) {
      const times=Array.isArray(item.times)?item.times:[];
      const total=times.reduce((sum,t)=>sum+(Number.isFinite(t)?t:0),0);
      return (item.name||'Personalizado')+' · '+times.join('–')+' s'+(total>0?' · '+(60/total).toLocaleString('pt-BR',{maximumFractionDigits:1})+' resp./min':'');
    }
    function showRecord(container,record,historyItem=false) {
      const title=document.createElement('p');title.className='session-record-title';
      title.textContent=(historyItem?new Date(record.endedAt).toLocaleString('pt-BR')+' · ':'')+(record.status==='completed'?'Sessão concluída':'Sessão encerrada antes da conclusão');container.append(title);
      const details=document.createElement('p');details.textContent='Tempo realizado: '+time(record.elapsedMs)+' · Ciclos completos: '+record.cycles+(record.targetMs===null?' · Tempo livre':' · Programado: '+time(record.targetMs));container.append(details);
      for(const item of record.rhythms){const line=document.createElement('p');line.textContent=(record.rhythms.length>1?'A partir de '+time(item.atMs)+': ':'Ritmo: ')+rhythmText(item);container.append(line);}
    }
    function history() {
      historyBody.replaceChildren();const rows=model.list();
      if(!rows.length){const p=document.createElement('p');p.textContent='Suas sessões aparecerão aqui, neste aparelho.';historyBody.append(p);return;}
      for(const record of rows){const item=document.createElement('article');item.className='session-record';showRecord(item,record,true);historyBody.append(item);}
    }
    function finish(reason) {
      const result=model.finish(reason);setActive(false);if(!result)return;
      summaryBody.replaceChildren();showRecord(summaryBody,result.record);summary.hidden=false;
      const panel=$('sessionDropdown');panel.classList.add('open');panel.querySelector('button').setAttribute('aria-expanded','true');
      status.textContent=result.saved?'Resumo salvo no histórico deste aparelho.':'Resumo disponível abaixo. O navegador não permitiu salvar o histórico.';
      live.textContent=result.record.status==='completed'?'Sessão concluída':'Sessão encerrada';lastText='';history();
    }
    function update(elapsedMs,cycles,boundary=false) {
      const state=model.update(elapsedMs,cycles,boundary);if(!state.active)return false;
      const text=state.due?'Finalizando o ciclo atual…':state.remainingMs===null?'Sessão livre · '+time(elapsedMs):'Tempo restante · '+time(state.remainingMs,true);
      if(text!==lastText){live.textContent=text;lastText=text;}
      if(state.due)status.textContent='O tempo programado terminou. Conclua este ciclo no ritmo da esfera.';
      if(state.complete){finish('completed');return true;}return false;
    }
    duration.addEventListener('change',prefs);custom.addEventListener('input',prefs);sound.addEventListener('change',()=>{prefs();if(sound.checked)onSoundChange();});
    end.addEventListener('click',onEnd);
    prefs();setActive(false);history();
    return {
      soundEnabled:()=>sound.checked,
      canStart:()=>{if(!valid()){$('sessionDropdown').classList.add('open');$('sessionDropdown').querySelector('button').setAttribute('aria-expanded','true');custom.reportValidity();return false;}return true;},
      start(){model.start({targetMs:target(),rhythm:rhythm()});summary.hidden=true;status.textContent='A pausa também interrompe o tempo da sessão.';lastText='';setActive(true);update(0,0);},
      update,
      pause(elapsedMs,cycles){update(elapsedMs,cycles);live.textContent='Sessão pausada · '+(model.current?.targetMs===null?'tempo realizado '+time(elapsedMs):'restam '+time(Math.max(0,(model.current?.targetMs||0)-elapsedMs),true));lastText='';},
      resume(){lastText='';},
      reset(elapsedMs,cycles){if(model.active){model.update(elapsedMs,cycles);finish('reset');}setActive(false);},
      end(elapsedMs,cycles){model.update(elapsedMs,cycles);const current=model.current;finish(current&&(current.targetMs===null||current.elapsedMs>=current.targetMs)?'completed':'manual');},
      rhythmChanged(elapsedMs){model.rhythmChanged(rhythm(),elapsedMs);},
      get active(){return model.active;}
    };
  }
  if(typeof module==='object'&&module.exports)module.exports={createModel};
  if(root)root.createRespiratorySessionUI=createUI;
})(typeof window==='object'?window:null);
