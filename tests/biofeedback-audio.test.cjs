const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'biofeedback-audio.js'), 'utf8');
function setup(saved) {
 const nodes = new Map(), oscillators = [], utterances = [], timers = new Map(), events = {};
 let id = 0, cancels = 0, changes = 0;
 const node = key => {
  if (!nodes.has(key)) nodes.set(key, {value:key === 'respAudioVolume' ? '45' : 'off',options:['off','continuous','voice','chime'].map(value=>({value})),events:{},addEventListener(type,fn){this.events[type]=fn},setAttribute(){}});
  return nodes.get(key);
 };
 const param = () => ({value:0,calls:[],setValueAtTime(v,t){this.value=v;this.calls.push(['set',v,t])},linearRampToValueAtTime(v,t){this.value=v;this.calls.push(['ramp',v,t])},cancelScheduledValues(){},setTargetAtTime(v){this.value=v}});
 class Audio {
  state='running'; currentTime=0; destination={};
  createGain(){return {gain:param(),connect(){},disconnect(){}}}
  createOscillator(){const o={frequency:param(),connect(){},disconnect(){},start(){},stop(t){this.stopped=t}};oscillators.push(o);return o}
  resume(){this.state='running';return Promise.resolve()}
 }
 const speech={speaking:false,pending:false,getVoices:()=>[{lang:'en-US'},{lang:'pt-BR',name:'Português'}],cancel(){cancels++;this.speaking=false},speak(u){this.speaking=true;utterances.push(u)}};
 const document={hidden:false,getElementById:node,addEventListener(type,fn){events[type]=fn}};
 const storage = new Map(saved ? [['respiratoryAudioPreferences',JSON.stringify(saved)]] : []);
 const context={window:{AudioContext:Audio,SpeechSynthesisUtterance:class{constructor(text){this.text=text}},speechSynthesis:speech,addEventListener(){}},document,
  localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},setTimeout(fn){timers.set(++id,fn);return id},clearTimeout(id){timers.delete(id)}};
 vm.runInNewContext(source,context);
 const api=context.window.createRespiratoryAudio({onChange:()=>changes++});
 return {api,node,oscillators,utterances,speech,document,events,timers,storage,get cancels(){return cancels},get changes(){return changes},
  async select(value){node('respAudioMode').value=value;node('respAudioMode').events.change();await Promise.resolve();await Promise.resolve()}};
}
test('Audio is optional and disabled initially; preferences can be restored',()=>{
 const s=setup();s.api.phase({nome:'INSPIRAR',dur:4});assert.equal(s.oscillators.length,0);assert.equal(s.utterances.length,0);
 assert.equal(s.node('respAudioPreview').disabled,true);
 const saved=setup({mode:'chime',volume:25});assert.equal(saved.node('respAudioMode').value,'chime');assert.equal(+saved.node('respAudioVolume').value,25);
});
test('Continuous tone follows the remaining phase and does not restart every frame',async()=>{
 const s=setup();await s.select('continuous');s.api.phase({nome:'INSPIRAR',dur:4},2);
 assert.deepEqual(s.oscillators[0].frequency.calls,[['set',330,0],['ramp',440,2]]);
 s.api.phase({nome:'INSPIRAR',dur:4},2.1);assert.equal(s.oscillators.length,1);
 s.api.phase({nome:'SEGURAR',dur:1});assert.equal(s.oscillators.length,1);assert.equal(s.oscillators[0].stopped,.03);
 s.api.phase({nome:'EXPIRAR',dur:6});assert.deepEqual(s.oscillators[1].frequency.calls,[['set',440,0],['ramp',220,6]]);
 s.api.setRunning(false);assert.equal(s.oscillators[1].stopped,.03);
});
test('Portuguese voice uses phase cues without queued repetitions; switching off cancels speech',async()=>{
 const s=setup();await s.select('voice');s.api.phase({nome:'INSPIRAR',dur:4});s.api.phase({nome:'INSPIRAR',dur:4},1);
 assert.equal(s.utterances.length,1);assert.equal(s.utterances[0].text,'Inspire');assert.equal(s.utterances[0].voice.lang,'pt-BR');
 s.api.phase({nome:'EXPIRAR',dur:6});assert.equal(s.utterances[1].text,'Expire');
 s.api.phase({nome:'PAUSAR',dur:1});assert.equal(s.utterances[2].text,'Pausa');
 await s.select('off');assert(s.cancels>=3);assert.equal(s.node('respAudioPreview').disabled,true);
});
test('Discrete cues differ between inspiration, expiration and pause',async()=>{
 const s=setup();await s.select('chime');for(const nome of ['INSPIRAR','EXPIRAR','PAUSAR'])s.api.phase({nome,dur:4});
 assert.deepEqual(s.oscillators.map(o=>o.frequency.calls[0][1]),[523.25,349.23,261.63]);
});
test('Preview is cancellable; starting a session clears its timers; hidden page silences audio',async()=>{
 const s=setup();await s.select('continuous');await s.node('respAudioPreview').events.click();assert.equal(s.timers.size,4);
 s.api.setRunning(true);assert.equal(s.timers.size,0);assert.equal(s.node('respAudioPreview').disabled,true);
 s.api.phase({nome:'INSPIRAR',dur:4});s.document.hidden=true;s.events.visibilitychange();assert.equal(s.oscillators.at(-1).stopped,.03);
 const count=s.oscillators.length;s.api.phase({nome:'EXPIRAR',dur:6});assert.equal(s.oscillators.length,count);
});
test('Page integration is syntactically valid and connects pause, reset, timing and hidden-page handling',()=>{
 const html=fs.readFileSync(path.join(root,'biofeedback-respiratorio-smartphone.html'),'utf8');
 for(const [,attributes,script] of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g))if(!/\bsrc=/.test(attributes)&&script.trim())new vm.Script(script);
 assert.match(html,/respiratoryAudio\.phase\(f,dec\)/);
 assert.match(html,/document\.hidden&&executando&&!pausado\)pausar\(\)/);
});
