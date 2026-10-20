const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const {createModel}=require('../biofeedback-session.js');
const root=path.resolve(__dirname,'..');
const rhythm={name:'Diafragmática',times:[4,1,6,1]};
const memory=()=>{const data=new Map();return {getItem:k=>data.get(k),setItem:(k,v)=>data.set(k,v),data}};
test('Timed session becomes due at the target and completes only at a cycle boundary',()=>{
 const model=createModel(memory());model.start({targetMs:60000,rhythm});
 assert.equal(model.update(59999,4).due,false);assert.equal(model.update(60000,4).complete,false);
 assert.equal(model.update(61000,4).due,true);assert.equal(model.update(72000,5,true).complete,true);
 const {record,saved}=model.finish();assert.equal(saved,true);assert.equal(record.elapsedMs,72000);assert.equal(record.cycles,5);assert.equal(record.targetMs,60000);
 assert.equal(model.finish(),null);assert.equal(model.list().length,1);
});
test('Free sessions never end automatically; history survives recreation and preserves rhythm changes',()=>{
 const storage=memory(),model=createModel(storage);model.start({rhythm});assert.equal(model.update(3600000,300,true).complete,false);
 model.rhythmChanged({name:'Personalizado',times:[5,0,5,0]},3600000);model.rhythmChanged({name:'Personalizado',times:[5,0,5,0]},3600100);
 model.update(3601000,300);model.finish('completed');const history=createModel(storage).list();assert.equal(history[0].rhythms.length,2);assert.deepEqual(history[0].rhythms[1].times,[5,0,5,0]);
});
test('Storage failure keeps a usable summary and prevents duplicate saves',()=>{
 const model=createModel({getItem(){throw Error('blocked')},setItem(){throw Error('blocked')}});model.start({targetMs:60000,rhythm});model.update(3000,0);
 const result=model.finish('reset');assert.equal(result.saved,false);assert.equal(result.record.status,'interrupted');assert.equal(model.list().length,1);assert.equal(model.finish(),null);
});
class Node {
 constructor(id=''){this.id=id;this.value='';this.checked=false;this.textContent='';this.children=[];this.events={};this.hidden=false;this.options=[];this.min='0';this.max='10';const classes=new Set();this.classList={add:x=>classes.add(x),remove:x=>classes.delete(x),contains:x=>classes.has(x),toggle:(x,on)=>{if(on===undefined)on=!classes.has(x);on?classes.add(x):classes.delete(x);return on}};this.style={setProperty(){}};}
 addEventListener(type,fn){(this.events[type]??=[]).push(fn)}
 setAttribute(name,value){this[name]=value}append(...nodes){this.children.push(...nodes)}replaceChildren(...nodes){this.children=nodes}
 querySelector(){return this.button??=new Node('button')}setCustomValidity(s){this.validityMessage=s}reportValidity(){this.reported=true;return !this.validityMessage}
}
function page(file='biofeedback-respiratorio-smartphone.html'){
 const nodes=new Map(),storage=memory(),frames=new Map();let clock=0,frame=0,beeps=0;
 const defaults={inspiracao:'4',pausaCheia:'1',expiracao:'6',pausaVazia:'1',sessionDuration:'free',sessionCustomMinutes:'5'};
 const get=id=>{if(!nodes.has(id)){const n=new Node(id);n.value=defaults[id]??'';if(id==='protocolCurrent')n.textContent='Diafragmática';nodes.set(id,n);}return nodes.get(id)};
 const doc={getElementById:get,createElement:()=>new Node(),querySelectorAll:()=>[],querySelector:()=>new Node(),addEventListener(){},documentElement:new Node('html'),hidden:false,visibilityState:'visible'};
 const audio={unlock:async()=>true,setRunning(){},phase(){},stop(){},complete(){beeps++}};
 const context=vm.createContext({window:{localStorage:storage,createRespiratoryAudio:()=>audio,addEventListener(){},innerWidth:400,innerHeight:800},document:doc,localStorage:storage,performance:{now:()=>clock},navigator:{userAgent:'test',platform:'',maxTouchPoints:0},requestAnimationFrame(fn){frames.set(++frame,fn);return frame},cancelAnimationFrame:id=>frames.delete(id),setTimeout,clearTimeout,console});
 vm.runInContext(fs.readFileSync(path.join(root,'biofeedback-session.js'),'utf8'),context);
 const html=fs.readFileSync(path.join(root,file),'utf8'),main=[...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)].find(m=>!m[1].includes('src=')&&m[2].includes('const ids='))[2];vm.runInContext(main,context);
 return {get,storage,context,call:s=>vm.runInContext(s,context),setClock:t=>{clock=t},tick(t){clock=t;const callbacks=[...frames.values()];frames.clear();callbacks.forEach(f=>f(t))},get beeps(){return beeps},get pending(){return frames.size},history:()=>JSON.parse(storage.getItem('respiratorySessionHistory.v1')||'[]')};
}
for(const file of ['biofeedback-respiratorio-smartphone.html','biofeedback-respiratorio.html'])test(file+': pause time is excluded; completion saves once and restart creates a fresh session',async()=>{
 const p=page(file);p.get('sessionDuration').value='custom';p.get('sessionCustomMinutes').value='1';p.get('sessionEndSound').checked=true;
 await p.call('iniciar()');for(let t=250;t<=3000;t+=250)p.tick(t);await p.call('pausar()');
 p.setClock(20000);await p.call('iniciar()');for(let t=20250;t<=77000;t+=250)p.tick(t);
 assert.equal(p.history().length,1);assert.equal(p.history()[0].elapsedMs,60000);assert.equal(p.history()[0].cycles,5);assert.equal(p.get('fase').textContent,'CONCLUÍDA');assert.equal(p.beeps,1);assert.equal(p.pending,0);
 await p.call('resetar()');assert.equal(p.history().length,1);await p.call('iniciar()');assert.equal(p.get('ciclos').textContent,'0');p.tick(78000);await p.call('encerrarSessao()');assert.equal(p.history().length,2);assert.equal(p.history()[0].status,'interrupted');assert.equal(p.history()[0].elapsedMs,1000);
});
test('Reset saves partial progress, invalid durations cannot start, and sound is off by default',async()=>{
 const p=page();p.get('sessionDuration').value='custom';p.get('sessionCustomMinutes').value='0';await p.call('iniciar()');assert.equal(p.pending,0);assert.equal(p.get('sessionCustomMinutes').reported,true);
 p.get('sessionCustomMinutes').value='1';await p.call('iniciar()');p.tick(3000);await p.call('resetar()');await p.call('resetar()');assert.equal(p.history().length,1);assert.equal(p.history()[0].reason,'reset');assert.equal(p.beeps,0);
});
test('A deadline in the middle of a 13-second cycle waits until 65 seconds',async()=>{
 const p=page();p.get('sessionDuration').value='custom';p.get('sessionCustomMinutes').value='1';p.get('expiracao').value='7';await p.call('iniciar()');
 for(let t=250;t<=60000;t+=250)p.tick(t);assert.equal(p.history().length,0);assert.equal(p.get('sessionLive').textContent,'Finalizando o ciclo atual…');
 for(let t=60250;t<=65000;t+=250)p.tick(t);assert.equal(p.history()[0].elapsedMs,65000);assert.equal(p.history()[0].cycles,5);assert.equal(p.pending,0);
});
