import test from 'node:test';
import assert from 'node:assert/strict';
import {notificationsFor, createReminders, IDS, KEY} from './reminders.mjs';
const plan = () => ({enabled:true, days:[0,1,6], time:'18:30'});
function setup() {
  const memory = new Map(), calls=[]; let current=plan(), permission='granted', failSchedule=false, failCancel=false;
  const plugin = {
    async checkPermissions(){calls.push('check');return {display:permission}},
    async requestPermissions(){calls.push('request');return {display:permission}},
    async createChannel(c){calls.push(['channel',c])},
    async cancel(c){calls.push(['cancel',c]);if(failCancel)throw Error('cancel')},
    async schedule(c){calls.push(['schedule',c]);if(failSchedule)throw Error('schedule')}
  };
  const c=createReminders({plugin,storage:{getItem:k=>memory.get(k),setItem:(k,v)=>memory.set(k,v)}, readPlan:()=>current,platform:'android'});
  return {c,calls,memory,setPlan:p=>current=p,setPermission:p=>permission=p,failSchedule:()=>failSchedule=true,failCancel:()=>failCancel=true};
}
test('Calendar days map to native Sunday=1 and preserve local time, one ID per day',()=>{
 const items=notificationsFor(plan());assert.deepEqual(items.map(n=>n.schedule.on),[{weekday:1,hour:18,minute:30,second:0},{weekday:2,hour:18,minute:30,second:0},{weekday:7,hour:18,minute:30,second:0}]);
 assert.equal(new Set(items.map(n=>n.id)).size,3);assert.ok(items.every(n=>n.isExactNotification===false));assert.deepEqual(notificationsFor({...plan(),enabled:false}),[]);
});
test('Initial synchronization cancels only owned reminders and never requests permission',async()=>{
 const s=setup();await s.c.sync();assert.equal(s.c.enabled(),false);assert.equal(s.calls.length,1);assert.deepEqual(s.calls[0],['cancel',{notifications:IDS.map(id=>({id}))}]);
});
test('Denied permission or an unsaved agenda cannot create reminders',async()=>{
 const s=setup();s.setPermission('denied');await assert.rejects(s.c.enable(),/não estão autorizadas/);assert.deepEqual(s.calls,['check','request']);assert.equal(s.c.enabled(),false);
 s.calls.length=0;s.setPlan(null);await assert.rejects(s.c.enable(),/Salve e ative/);assert.equal(s.calls.length,0);
});
test('Enable and edits replace the weekly schedule without duplicates',async()=>{
 const s=setup();await s.c.enable();s.setPlan({enabled:true,days:[3],time:'09:15'});await s.c.sync();
 assert.equal(s.c.enabled(),true);const scheduled=s.calls.filter(x=>x[0]==='schedule');assert.equal(scheduled.length,2);assert.equal(scheduled[1][1].notifications.length,1);assert.equal(scheduled[1][1].notifications[0].id,IDS[3]);assert.equal(scheduled[1][1].notifications[0].schedule.on.hour,9);
 s.setPlan({...plan(),enabled:false});await s.c.sync();assert.equal(s.calls.at(-1)[0],'cancel');
});
test('Revoked permission never causes an automatic authorization prompt',async()=>{
 const s=setup();await s.c.enable();s.calls.length=0;s.setPermission('denied');await assert.rejects(s.c.sync(),/não estão autorizadas/);assert.deepEqual(s.calls,['check']);
});
test('Failed scheduling clears partial notifications and reports disabled',async()=>{
 const s=setup();s.failSchedule();await assert.rejects(s.c.enable(),/Não foi possível agendar/);assert.equal(s.c.enabled(),false);assert.equal(s.calls.at(-1)[0],'cancel');
});
test('Disable after enable is serialized and cancels all owned IDs',async()=>{
 const s=setup();await Promise.all([s.c.enable(),s.c.disable()]);assert.equal(s.c.enabled(),false);assert.equal(s.memory.get(KEY),'disabled');assert.equal(s.calls.at(-1)[0],'cancel');
});
test('Failed cancellation is visible and never reported as successful',async()=>{
 const s=setup();await s.c.enable();s.failCancel();await assert.rejects(s.c.disable(),/ajustes do celular/);
});

test('Native bundle preserves the guide and includes local audio, without PWA installation or remote scripts',async()=>{
 const fs=await import('node:fs');const path=await import('node:path');const vm=await import('node:vm');
 const html=fs.readFileSync(new URL('./www/index.html',import.meta.url),'utf8');
 assert.match(html,/<script src="native\.js"><\/script>/);assert.doesNotMatch(html,/<script src="app\.js"|<section class="card app-offline"|As notificações com o aplicativo fechado serão acrescentadas/);
 for(const marker of ['class="main-layout"','class="indicators card"','class="header card"','id="audioDropdown"','id="protocolDropdown"','id="configDropdown"'])assert.ok(html.includes(marker),marker);
 const markers=['class="main-layout"','class="indicators card"','class="header card"','id="audioDropdown"','id="protocolDropdown"','id="configDropdown"'];assert.deepEqual(markers.map(m=>html.indexOf(m)),markers.map(m=>html.indexOf(m)).sort((a,b)=>a-b));
 for(const name of ['inspire','expire','pausa','orientacoes'])assert.ok(fs.statSync(new URL('./www/assets/audio/biofeedback/'+name+'.mp3',import.meta.url)).size>0);
 for(const match of html.matchAll(/<(?:script|link|image)[^>]+(?:src|href)="([^"#]+)"/g))assert.ok(fs.existsSync(new URL('./www/'+match[1].split('?')[0],import.meta.url)),match[1]);
 new vm.Script(fs.readFileSync(new URL('./www/native.js',import.meta.url),'utf8'));
 assert.ok(!fs.existsSync(new URL('./www/sw.js',import.meta.url)));
});
