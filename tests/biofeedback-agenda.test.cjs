const test=require('node:test');
const assert=require('node:assert/strict');
const {normalize,nextOccurrence,createStore}=require('../biofeedback-agenda.js');
const base=()=>({enabled:true,days:[1,3,5],time:'08:30',protocol:'coerencia',times:[5,0,5,0],minutes:5,endSound:false,audio:{mode:'voice',voiceSource:'device',voiceURI:'pt-BR-local',volume:40}});
test('Agenda normalizes days and preset timing and retains device voice preferences',()=>{
 const p=normalize({...base(),days:[5,1,1],times:[2,0,2,0]});assert.deepEqual(p.days,[1,5]);assert.deepEqual(p.times,[5,0,5,0]);assert.equal(p.audio.voiceURI,'pt-BR-local');
});
test('Local next occurrence handles today, a passed time, weekends and a week rollover',()=>{
 const p=normalize(base());const monday=new Date(2026,9,19,8,0,0);
 assert.equal(nextOccurrence(p,monday).getDate(),19);
 assert.equal(nextOccurrence(p,new Date(2026,9,19,8,31)).getDate(),21);
 assert.equal(nextOccurrence(p,new Date(2026,9,23,9)).getDate(),26);
 const friday={...p,days:[5]};assert.equal(nextOccurrence(friday,new Date(2026,9,23,8,30)).getDate(),23);assert.equal(nextOccurrence(friday,new Date(2026,9,23,8,30,1)).getDate(),30);
 assert.equal(nextOccurrence({...p,enabled:false},monday),null);
});
test('Invalid times, durations and custom rhythms are rejected before storage',()=>{
 for(const patch of [{days:[]},{days:[9]},{time:'25:00'},{time:'08:99'},{minutes:0},{minutes:1.5},{minutes:181},{protocol:'unknown'},{protocol:'custom',times:[0,0,0,0]},{audio:{mode:'voice',voiceSource:'device',volume:101}}])assert.throws(()=>normalize({...base(),...patch}));
 assert.equal(normalize({...base(),enabled:false,days:[]}).enabled,false);
 assert.equal(normalize({...base(),minutes:null}).minutes,null);
});
test('Saving and restoring the agenda works without network and failed writes preserve the previous plan',()=>{
 const data=new Map();let fail=false;const storage={getItem:k=>data.get(k),setItem(k,v){if(fail)throw Error('full');data.set(k,v)}};
 const first=createStore(storage);first.save(base());assert.deepEqual(createStore(storage).get(),normalize(base()));
 fail=true;assert.throws(()=>first.save({...base(),time:'21:00'}));assert.equal(first.get().time,'08:30');
 data.set('respiratoryAgenda.v1','bad json');assert.equal(createStore(storage).get(),null);
});
