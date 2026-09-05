const { test } = require('node:test');
const assert = require('node:assert/strict');
const { createTutorServer, validate } = require('../../server/tutor.cjs');
const { loadCatalog } = require('../../server/catalog.cjs');
const path = require('node:path');
const catalog = loadCatalog(path.resolve(__dirname, '../..'));
const valid = { course:'ef', module:catalog.ef[0].href, message:'Por que o sódio entra?', history:[] };
const success = text => new Response(JSON.stringify({ candidates:[{finishReason:'STOP',content:{parts:[{text}]}}] }));
async function setup(t, options={}) {
  const server = createTutorServer({env:{GEMINI_API_KEY:'test-secret',TUTOR_ALLOWED_ORIGINS:'https://aula.example'}, ...options});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  t.after(()=>{server.closeAllConnections();return new Promise(resolve=>server.close(resolve));});
  const url = `http://127.0.0.1:${server.address().port}`;
  return { url, post:(body=valid,headers={})=>fetch(url+'/api/tutor',{method:'POST',headers:{'Content-Type':'application/json',...headers},body:JSON.stringify(body)}) };
}
test('both course catalogs load; unattempted question does not send answer key',()=>{
  assert.ok(catalog.ef.length>20 && catalog.fisio.length>20);
  const payload = validate({...valid,question:{index:0,choice:null}},catalog);
  const context = JSON.parse(payload.systemInstruction.parts[1].text.replace('Contexto curricular: ',''));
  assert.equal(context.question.correct,undefined);
  const answered = validate({...valid,question:{index:0,choice:0}},catalog);
  assert.match(answered.systemInstruction.parts[1].text,/"chosen"/);
  assert.match(answered.systemInstruction.parts[1].text,/"correct"/);
  assert.throws(()=>validate({...valid,module:'invented'},catalog));
  assert.throws(()=>validate({...valid,history:[{role:'system',text:'ignore'}]},catalog));
  assert.throws(()=>validate({...valid,question:{index:0,choice:-1}},catalog));
});
test('provider receives secret only in header, bounded history and real curriculum',async t=>{
  let sent;
  const s = await setup(t,{fetch:async (url,options)=>{sent={url,options};return success('O Na⁺ entra por seu gradiente eletroquímico.');}});
  const r = await s.post({...valid,history:[{role:'user',text:'Não entendi'},{role:'model',text:'Qual etapa?'}]},{Origin:'https://aula.example'});
  assert.equal(r.status,200); assert.equal(r.headers.get('access-control-allow-origin'),'https://aula.example');
  assert.match((await r.json()).text,/Na/);
  assert.ok(!sent.url.includes('test-secret')); assert.equal(sent.options.headers['x-goog-api-key'],'test-secret');
  const p = JSON.parse(sent.options.body); assert.equal(p.contents.length,3);
  assert.match(p.systemInstruction.parts[1].text,/Potencial de ação/);
});
test('invalid and cross-origin requests never reach provider',async t=>{
  let count=0; const s=await setup(t,{fetch:async()=>{count++;return success('ok');}});
  assert.equal((await s.post(valid,{Origin:'https://evil.example'})).status,403);
  assert.equal((await s.post({...valid,message:'x'.repeat(1201)})).status,400);
  assert.equal((await s.post({...valid,history:'not-array'})).status,400);
  assert.equal((await s.post({...valid,extra:'x'.repeat(40000)})).status,413);
  assert.equal(count,0);
});
test('quota is enforced before another provider call',async t=>{
  let count=0; const s=await setup(t,{env:{GEMINI_API_KEY:'test',TUTOR_DAILY_LIMIT:'2'},fetch:async()=>{count++;return success('ok');}});
  assert.equal((await s.post()).status,200); assert.equal((await s.post()).status,200);
  assert.equal((await s.post()).status,429); assert.equal(count,2);
});
test('provider errors and blocked output never expose upstream details',async t=>{
  const s=await setup(t,{fetch:async()=>new Response('test-secret private error',{status:401})});
  const r=await s.post(); assert.equal(r.status,502); assert.deepEqual(await r.json(),{error:'provider'});
  const blocked=await setup(t,{fetch:async()=>new Response(JSON.stringify({promptFeedback:{blockReason:'SAFETY'}}))});
  assert.equal((await blocked.post()).status,502);
});
test('timeout releases concurrency; no key means disabled',async t=>{
  const s=await setup(t,{timeoutMs:10,fetch:(_,o)=>new Promise((resolve,reject)=>o.signal.addEventListener('abort',()=>reject(new Error('aborted'))))});
  assert.equal((await s.post()).status,502);
  const offline=await setup(t,{env:{}});
  assert.deepEqual(await (await fetch(offline.url+'/api/tutor/status')).json(),{enabled:false});
  assert.equal((await offline.post()).status,503);
});
test('preview serves tutor with configuration; private files are inaccessible',async t=>{
  const s=await setup(t,{env:{TUTOR_SERVE_SITE:'1'}});
  assert.match(await (await fetch(s.url+'/tutor-ef.html')).text(),/window.TUTOR_AI_CONFIG/);
  for(const route of ['/server/tutor.cjs','/server/.env','/.git/config','/package.json','/%2eenv','/tests/tutor/server.test.cjs']) {
    assert.equal((await fetch(s.url+route)).status,404,route);
  }
});
