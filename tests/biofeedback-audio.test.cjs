const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const source = fs.readFileSync(path.join(root, 'biofeedback-audio.js'), 'utf8');
function setup(saved) {
 const nodes = new Map(), oscillators = [], recordings = [], requests = [], utterances = [], timers = new Map(), events = {};
 let id = 0, cancels = 0, changes = 0;
 const node = key => {
  if (!nodes.has(key)) nodes.set(key, {value:key === 'respAudioVolume' ? '45' : key === 'respAudioVoiceSource' ? 'recorded' : 'off',options:(key === 'respAudioVoiceSource' ? ['recorded','device'] : ['off','continuous','voice','chime']).map(value=>({value})),replaceChildren(){this.options=[]},append(o){this.options.push(o)},events:{},addEventListener(type,fn){this.events[type]=fn},setAttribute(){}});
  return nodes.get(key);
 };
 const param = () => ({value:0,calls:[],setValueAtTime(v,t){this.value=v;this.calls.push(['set',v,t])},linearRampToValueAtTime(v,t){this.value=v;this.calls.push(['ramp',v,t])},cancelScheduledValues(){},setTargetAtTime(v){this.value=v}});
 class Audio {
  state='running'; currentTime=0; destination={};
  createGain(){return {gain:param(),connect(){},disconnect(){}}}
  createOscillator(){const o={frequency:param(),connect(){},disconnect(){},start(){},stop(t){this.stopped=t}};oscillators.push(o);return o}
  createBufferSource(){const o={connect(){},disconnect(){},start(...args){this.args=args},stop(){this.stopped=true}};recordings.push(o);return o}
  decodeAudioData(){return Promise.resolve({duration:12})}
  resume(){this.state='running';return Promise.resolve()}
 }
 const speech={speaking:false,pending:false,addEventListener(){},getVoices:()=>[{lang:'en-US',voiceURI:'en'},{lang:'pt-BR',name:'Português',voiceURI:'pt-local',localService:true}],cancel(){cancels++;this.speaking=false},speak(u){this.speaking=true;utterances.push(u)}};
 const document={createElement:()=>({}),currentScript:{src:'https://example.test/biofeedback-audio.js'},hidden:false,getElementById:node,addEventListener(type,fn){events[type]=fn}};
 const storage = new Map(saved ? [['respiratoryAudioPreferences',JSON.stringify(saved)]] : []);
 const context={URL,AbortSignal,fetch:async url=>{requests.push(url.href);return {ok:true,arrayBuffer:async()=>new ArrayBuffer(8)}},window:{AudioContext:Audio,SpeechSynthesisUtterance:class{constructor(text){this.text=text}},speechSynthesis:speech,addEventListener(){}},document,
  localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},setTimeout(fn){timers.set(++id,fn);return id},clearTimeout(id){timers.delete(id)}};
 vm.runInNewContext(source,context);
 const api=context.window.createRespiratoryAudio({onChange:()=>changes++});
 return {api,node,oscillators,recordings,requests,utterances,speech,document,events,timers,storage,get cancels(){return cancels},get changes(){return changes},
  async select(value){node('respAudioMode').value=value;node('respAudioMode').events.change();await api.unlock()}};
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
test('Recorded voice is preloaded, once per phase, and stopped before the next cue',async()=>{
 const s=setup();await s.select('voice');s.api.phase({nome:'INSPIRAR',dur:4});s.api.phase({nome:'INSPIRAR',dur:4},1);
 assert.equal(s.recordings.length,1);assert.deepEqual(s.recordings[0].args,[0,.10,1.03]);
 s.api.phase({nome:'EXPIRAR',dur:6});assert.equal(s.recordings[0].stopped,true);assert.deepEqual(s.recordings[1].args,[0,.13,1.12]);
 s.api.phase({nome:'PAUSAR',dur:1});assert.deepEqual(s.recordings[2].args,[0,.14,.74]);
 assert.equal(s.requests.length,3);assert.ok(s.requests.every(url=>url.startsWith('https://example.test/assets/audio/biofeedback/')));
 await s.select('off');assert.equal(s.recordings[2].stopped,true);assert.equal(s.node('respAudioPreview').disabled,true);
});
test('Instructions are optional even with guide off and are interrupted by session start',async()=>{
 const s=setup();await s.node('respAudioInstructions').events.click();assert.equal(s.recordings.length,1);
 assert.ok(s.requests[0].endsWith('/orientacoes.mp3'));assert.deepEqual(s.recordings[0].args,[0,.11,10.5]);
 s.api.setRunning(true);assert.equal(s.recordings[0].stopped,true);assert.equal(s.node('respAudioInstructions').disabled,true);
});
test('Muting instructions also resets the listen button',async()=>{
 const s=setup();await s.node('respAudioInstructions').events.click();s.node('respAudioVolume').value='0';s.node('respAudioVolume').events.input();
 assert.equal(s.recordings[0].stopped,true);assert.equal(s.node('respAudioInstructions').textContent,'▶ Ouvir orientações');
});
test('Short phases truncate the recording and volume zero stops it',async()=>{
 const s=setup();await s.select('voice');s.api.phase({nome:'EXPIRAR',dur:1});assert.equal(s.recordings[0].args[2],1);
 s.node('respAudioVolume').value='0';s.node('respAudioVolume').events.input();assert.equal(s.recordings[0].stopped,true);
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

test('Device voice remains selectable, remembers its source and cancels each preceding cue',async()=>{
 const s=setup();await s.select('voice');s.node('respAudioVoiceSource').value='device';s.node('respAudioVoiceSource').events.change();await s.api.unlock();
 s.api.phase({nome:'INSPIRAR',dur:4});s.api.phase({nome:'INSPIRAR',dur:4},1);
 assert.equal(s.utterances.length,1);assert.equal(s.utterances[0].text,'Inspire');assert.equal(s.utterances[0].voice.voiceURI,'pt-local');
 s.api.phase({nome:'EXPIRAR',dur:6});assert.equal(s.utterances.length,2);assert.equal(s.utterances[1].text,'Expire');assert.ok(s.cancels>=1);
 s.node('respAudioDeviceVoice').value='pt-local';s.node('respAudioDeviceVoice').events.change();
 const saved=JSON.parse(s.storage.get('respiratoryAudioPreferences'));assert.equal(saved.voiceSource,'device');assert.equal(saved.voiceURI,'pt-local');
 const restored=setup(saved);assert.equal(restored.node('respAudioVoiceSource').value,'device');
 restored.api.setRunning(true);restored.api.phase({nome:'PAUSAR',dur:1});assert.equal(restored.utterances[0].text,'Pausa');
 restored.document.hidden=true;restored.events.visibilitychange();assert.equal(restored.cancels,1);
});
test('Device speech is canceled at the phase deadline and source switching stops it',async()=>{
 const s=setup({mode:'voice',voiceSource:'device',volume:45});await s.api.unlock();s.api.phase({nome:'INSPIRAR',dur:2});
 for(const fn of [...s.timers.values()])fn();assert.equal(s.cancels,1);
 s.api.phase({nome:'EXPIRAR',dur:4});s.node('respAudioVoiceSource').value='recorded';s.node('respAudioVoiceSource').events.change();await s.api.unlock();assert.equal(s.cancels,2);
 s.api.phase({nome:'PAUSAR',dur:1});assert.equal(s.recordings.length,1);
});

test('Completion cue is optional, obeys volume, and a new action cancels its second note',async()=>{
 const s=setup();await s.api.unlock(true);s.api.complete();assert.equal(s.oscillators.length,1);assert.equal(s.oscillators[0].frequency.calls[0][1],659.25);
 s.api.stop();assert.equal(s.timers.size,0);s.node('respAudioVolume').value='0';s.api.complete();assert.equal(s.oscillators.length,1);
});
