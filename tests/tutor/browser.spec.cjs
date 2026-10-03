const {test,expect}=require('@playwright/test');
const {createTutorServer}=require('../../server/tutor.cjs');
let server,base;
test.beforeAll(async()=>{
  server=createTutorServer({env:{TUTOR_SERVE_SITE:'1'}});
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
  base=`http://127.0.0.1:${server.address().port}`;
});
test.afterAll(async()=>{server.closeAllConnections();await new Promise(resolve=>server.close(resolve));});
async function open(page,course='ef') {
  await page.route('**/api/tutor/status',r=>r.fulfill({json:{enabled:true}}));
  await page.goto(`${base}/tutor-${course}.html`);
  await page.locator('#tutorLauncher').click();
  await page.locator('#tutorAiEnabled').check();
}
async function send(page,text) { await page.locator('#tutorInput').fill(text);await page.locator('.tutor-send').click(); }
test('junção neuromuscular: níveis e controles cabem no viewport do projeto',async({page})=>{
 await page.route('**/ra/juncao-neuromuscular/app.js*',r=>r.fulfill({body:'',contentType:'text/javascript'}));
 await page.route('**/model-viewer.min.js',r=>r.fulfill({body:'',contentType:'text/javascript'}));
 await page.goto(`${base}/ra/juncao-neuromuscular/?percurso=fisioterapia`);
 await expect(page.locator('[data-step]')).toHaveCount(5);
 await expect(page.locator('[data-voltar-tutor]').last()).toHaveAttribute('href',`${base}/tutor-fisio.html`);
 await expect(page.locator('#play')).toHaveText('Iniciar');
 const dimensions=await page.evaluate(()=>({width:innerWidth,content:document.documentElement.scrollWidth,buttons:[...document.querySelectorAll('[data-step],.journey-controls button')].map(e=>({left:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right}))}));
 expect(dimensions.content).toBeLessThanOrEqual(dimensions.width+1);
 for(const b of dimensions.buttons){expect(b.left).toBeGreaterThanOrEqual(0);expect(b.right).toBeLessThanOrEqual(dimensions.width);}
});
for(const course of ['ef','fisio']) test(`${course}: context, history, text safety and clear`,async({page},info)=>{
  const requests=[];
  await page.route('**/api/tutor',async r=>{requests.push(r.request().postDataJSON());await r.fulfill({json:{text:'Explicação de teste: <img src=x onerror=alert(1)>\nQual mudança você prevê?'}});});
  await open(page,course);
  await send(page,'Por que o sódio entra na célula?');
  await expect(page.locator('.tutor-ai-answer')).toHaveCount(1);
  expect(requests[0].course).toBe(course);expect(requests[0].module).toBeTruthy();
  await expect(page.locator('.tutor-ai-answer img')).toHaveCount(0);
  await send(page,'Pode explicar com uma analogia?');
  await expect(page.locator('.tutor-ai-answer')).toHaveCount(2);
  expect(requests[1].history).toHaveLength(2);
  const form=await page.locator('#tutorForm').boundingBox();
  expect(form.x).toBeGreaterThanOrEqual(0);expect(form.y+form.height).toBeLessThanOrEqual(page.viewportSize().height);
  await page.screenshot({path:info.outputPath('tutor.png')});
  await page.locator('#tutorAiClear').click();
  await expect(page.locator('.tutor-ai-answer')).toHaveCount(0);
  await send(page,'O que faz a bomba de sódio?');
  await expect(page.locator('.tutor-ai-answer')).toHaveCount(1);
  expect(requests[2].history).toHaveLength(0);
  await page.reload();await page.locator('#tutorLauncher').click();
  await expect(page.locator('#tutorAiEnabled')).not.toBeChecked();
  await expect(page.locator('.tutor-ai-answer')).toHaveCount(0);
  expect(await page.evaluate(()=>Object.keys(localStorage).filter(k=>k!=='tutorEFPosition'))).toEqual([]);
  await page.locator('.tutor-close').click();
  const card=page.locator('#cards .card').first();
  await card.locator('[data-open]').click();
  await card.locator('.opts button').first().click();
  await page.locator('#tutorLauncher').click();await page.locator('#tutorAiEnabled').check();
  await send(page,'Explique a alternativa que escolhi.');
  await expect(page.locator('.tutor-ai-answer')).toHaveCount(1);
  expect(requests[3].question).toEqual({index:0,choice:0});
});
test('quiz remains local, chosen answer accompanies explanation; quota fallback',async({page})=>{
  const requests=[];
  await page.route('**/api/tutor',r=>{requests.push(r.request().postDataJSON());return r.fulfill({status:429,json:{error:'limit'}});});
  await open(page);
  await page.locator('.tutor-close').click();
  await page.locator('#cards .card').first().locator('h2').click();
  await page.locator('#tutorLauncher').click();
  await page.locator('[data-prompt="Teste meu entendimento"]').click();
  await page.locator('.tutor-option').first().click();
  expect(requests).toHaveLength(0);
  await send(page,'Por que errei?');
  await expect(page.locator('#tutorMessages')).toContainText('limite de uso');
  expect(requests[0].question.choice).toBe(0);
  await expect(page.locator('.tutor-send')).toBeEnabled();
});
test('cancel releases input; unavailable key retains original tutor',async({page})=>{
  await page.route('**/api/tutor',async r=>{await new Promise(resolve=>setTimeout(resolve,300));await r.fulfill({json:{text:'Não deve aparecer'}}).catch(()=>{});});
  await open(page);await send(page,'Explique a contração muscular');
  await page.locator('#tutorAiCancel').click();
  await expect(page.locator('#tutorMessages')).toContainText('Resposta cancelada');
  await expect(page.locator('.tutor-send')).toBeEnabled();
  await page.unroute('**/api/tutor/status');
  await page.reload();await page.locator('#tutorLauncher').click();
  await expect(page.locator('#tutorAiEnabled')).toBeDisabled();
  await expect(page.locator('#tutorAiNotice')).toContainText('ainda não disponível');
});
for(const course of ['ef','fisio']) test(`Moodle ${course} iframe: shared API, context, clearing, links and no saved conversation`,async({page})=>{
  const requests=[];
  await page.route('**/api/tutor/status',r=>r.fulfill({json:{enabled:true}}));
  await page.route('**/api/tutor',r=>{requests.push(r.request().postDataJSON());return r.fulfill({json:{text:'Resposta simulada: <b>texto seguro</b>'}});});
  await page.goto(base+'/tutor-ef.html');
  await page.setContent(`<iframe title="Tutor Moodle" src="${base}/tutor-moodle.html${course==='fisio'?'?percurso=fisioterapia':''}" style="border:0;width:100%;height:300px"></iframe>`);
  const frame=page.frameLocator('iframe');
  await expect(frame.locator('.head span')).toContainText(course==='fisio'?'Fisioterapia':'Educação Física');
  await frame.locator('[data-action="simuladores"]').click();
  const actual=await frame.locator('a.link').evaluateAll(nodes=>nodes.map(n=>n.getAttribute('href')));
  const {loadCatalog}=require('../../server/catalog.cjs');
  const catalog=loadCatalog(require('node:path').resolve(__dirname,'../..'));
  const extraHref = course === 'ef' ? 'atleta-box.html' : 'fisioterapia/uti-fisiologica.html';
  const expected = catalog[course].filter(m=>!m.ra).map(m=>'https://drmarionascimento.github.io/fisiologia-interativa/'+m.href+(course==='fisio'?'?percurso=fisioterapia':''));
  expected.push('https://drmarionascimento.github.io/fisiologia-interativa/'+extraHref+(course==='fisio'?'?percurso=fisioterapia':'?percurso=educacao-fisica'));
  expected.push(...catalog[course].filter(m=>m.ra).map(m=>'https://drmarionascimento.github.io/fisiologia-interativa/'+m.href+'?percurso='+(course==='fisio'?'fisioterapia':'educacao-fisica')));
  expect(actual).toEqual(expected);
  await frame.locator('#aiEnabled').check();
  await frame.locator('#input').fill('Por que o sódio entra na célula?');await frame.locator('.send').click();
  await expect(frame.locator('.ai-response')).toContainText('<b>texto seguro</b>');
  await expect(frame.locator('.ai-response b')).toHaveCount(0);
  await frame.locator('#input').fill('Explique com outra analogia');await frame.locator('.send').click();
  await expect(frame.locator('.ai-response')).toHaveCount(2);
  expect(requests[1].history).toHaveLength(2);expect(requests[0].course).toBe(course);
  await frame.locator('[data-action="mapas"]').click();
  await expect(frame.locator('a.link').first()).toHaveAttribute('href',/^https:\/\/drmarionascimento.github.io/);
  expect(requests).toHaveLength(2);
  await frame.locator('#aiClear').click();
  await frame.locator('#input').fill('Explique o potencial de ação');await frame.locator('.send').click();
  await expect(frame.locator('.ai-response')).toHaveCount(2);
  expect(requests[2].history).toHaveLength(0);
  await page.locator('iframe').evaluate(el=>el.contentWindow.location.reload());
  await expect(frame.locator('#aiEnabled')).not.toBeChecked();
  await expect(frame.locator('.ai-response')).toHaveCount(0);
});

for(const course of ['ef','fisio'])for(const moodle of [false,true])test(`${course} ${moodle?'Moodle':'completo'}: RA com e sem IA preserva curso e contexto`,async({page})=>{
 const {loadCatalog}=require('../../server/catalog.cjs'),{validate}=require('../../server/tutor.cjs');
 const catalog=loadCatalog(require('node:path').resolve(__dirname,'../..')),requests=[];
 await page.route('**/api/tutor/status',r=>r.fulfill({json:{enabled:true}}));
 await page.route('**/api/tutor',r=>{const body=r.request().postDataJSON();validate(body,catalog);requests.push(body);return r.fulfill({json:{text:'Resposta simulada com contexto RA correto.'}})});
 await page.goto(`${base}/${moodle?'tutor-moodle':`tutor-${course}`}.html${moodle&&course==='fisio'?'?percurso=fisioterapia':''}`);
 if(!moodle)await page.locator('#tutorLauncher').click();
 const input=page.locator(moodle?'#input':'#tutorInput'),send=page.locator(moodle?'.send':'.tutor-send'),toggle=page.locator(moodle?'#aiEnabled':'#tutorAiEnabled'),messages=page.locator(moodle?'#messages':'#tutorMessages');
 for(const [query,href]of [['onde estudo coração RA','ra/coracao/'],['onde estudo retorno venoso RA','ra/retorno-venoso/'],['onde estudo pleura RA','ra/pleura/'],['onde estudo músculo sarcômero RA','ra/musculo-sarcomero/'],['onde estudo potencial membrana RA','ra/potencial-membrana/'],['onde estudo forças de Starling RA','ra/starling/'],['onde estudo junção neuromuscular RA','ra/juncao-neuromuscular/']]){
  await input.fill(query);await send.click();const link=messages.locator(`a[href*="${href}"]`).last();
  await expect(link).toHaveAttribute('href',new RegExp(`${href}\\?percurso=${course==='fisio'?'fisioterapia':'educacao-fisica'}$`));
  await expect(link).toHaveAttribute('target','_blank');await expect(link).toHaveAttribute('rel','noopener noreferrer');
 }
 expect(requests).toHaveLength(0);await toggle.check();
 for(const [query,href]of [['Explique a placa motora na junção neuromuscular RA','ra/juncao-neuromuscular/'],['Explique o movimento do coração RA','ra/coracao/'],['Explique a bomba do retorno venoso RA','ra/retorno-venoso/'],['Explique o gradiente da pleura RA','ra/pleura/'],['Explique o comprimento do sarcômero muscular RA','ra/musculo-sarcomero/'],['Explique a película de carga em realidade aumentada','ra/potencial-membrana/'],['Explique o retorno linfático nas forças de Starling RA','ra/starling/'],['Explique por que a banda A não muda na experiência muscular RA, em até quatro linhas.','ra/musculo-sarcomero/']]){
  await input.fill(query);await send.click();await expect(messages.locator(moodle?'.ai-response':'.tutor-ai-answer').last()).toHaveText('Resposta simulada com contexto RA correto.');
  await expect.poll(()=>requests.length).toBeGreaterThan(0);await expect.poll(()=>requests.at(-1).module).toBe(href);expect(requests.at(-1).course).toBe(course);
 }
 const count=requests.length;await input.fill('Abrir pleura em realidade aumentada');await send.click();await expect(messages.locator('a[href*="ra/pleura/"]').last()).toBeVisible();expect(requests).toHaveLength(count);
 await toggle.uncheck();await input.fill('onde estudo coração RA');await send.click();await expect(messages.locator('a[href*="ra/coracao/"]').last()).toBeVisible();expect(requests).toHaveLength(count);
});

for(const course of ['ef','fisio']) test(`${course}: unidades destacam Questões e abrem a RA do sistema ativo`,async({page})=>{
 await page.route('**/api/tutor/status',r=>r.fulfill({json:{enabled:false}}));
 await page.goto(`${base}/tutor-${course}.html`);
 const axes=await page.locator('#axes .axis').count();
 for(let i=0;i<axes;i++) {
  await page.locator('#axes .axis').nth(i).click();
  const cards=page.locator('#cards'),questions=cards.locator('[data-open]'),simulators=cards.getByRole('link',{name:'Abrir simulador',exact:true});
  expect(await questions.count()).toBe(await simulators.count());expect(await questions.count()).toBeGreaterThan(0);
  for(const q of await questions.all())await expect(q).toHaveClass(/btn-primary/);
  for(const sim of await simulators.all())await expect(sim).toHaveClass(/btn-ghost/);
  const styles=await cards.evaluate(el=>({q:getComputedStyle(el.querySelector('[data-open]')).backgroundImage,sim:getComputedStyle([...el.querySelectorAll('a')].find(a=>a.textContent==='Abrir simulador')).backgroundImage}));expect(styles.q).not.toBe(styles.sim);
  const axis=await page.locator('#axes .axis').nth(i).evaluate(b=>b.dataset.id||b.dataset.axis);
  const hasRA=['celular','cardiovascular','respiratorio','muscular'].includes(axis);
  await expect(cards.locator('.ra-card')).toHaveCount(hasRA?1:0);
  if(hasRA){
  await expect(cards.locator('.ra-card h2')).toHaveText('RA - Realidade Aumentada');
  await expect(cards.locator('.ra-call')).toContainText('viagem de aprendizado incrível');
  const experiencias=axis==='celular'?['potencial-membrana','starling']:axis==='muscular'?['musculo-sarcomero','juncao-neuromuscular']:axis==='cardiovascular'?['coracao','retorno-venoso']:['pleura'];
  await expect(cards.locator('.ra-card a')).toHaveCount(experiencias.length);
  for(let j=0;j<experiencias.length;j++){
   const acesso=cards.locator('.ra-card a').nth(j);
   await expect(acesso).toHaveAttribute('href',`ra/${experiencias[j]}/?percurso=${course==='fisio'?'fisioterapia':'educacao-fisica'}`);
   await expect(acesso).toHaveAttribute('target','_blank');await expect(acesso).toHaveAttribute('rel','noopener noreferrer');
  }
  }
  const first=questions.first();await first.click();await expect(first.locator('..').locator('..').locator('.panel')).toBeVisible();await first.click();
 }
 await page.locator('#axes [data-id="respiratorio"],#axes [data-axis="respiratorio"]').click();
 const link=page.locator('.ra-card a');await expect(link).toHaveAttribute('target','_blank');
 await page.context().route('**/ra/pleura/app.js*',r=>r.fulfill({body:'',contentType:'text/javascript'}));
 await page.context().route('**/model-viewer.min.js',r=>r.fulfill({body:'',contentType:'text/javascript'}));
 const popupPromise=page.waitForEvent('popup');await link.click();const popup=await popupPromise;await popup.waitForLoadState('domcontentloaded');
 expect(new URL(popup.url()).pathname).toBe('/ra/pleura/');expect(new URL(popup.url()).searchParams.get('percurso')).toBe(course==='fisio'?'fisioterapia':'educacao-fisica');
 await expect(popup.locator('a.small-button[data-voltar-tutor]')).toHaveAttribute('href',`${base}/tutor-${course}.html`);
 expect(await popup.getByRole('link',{name:'Bancadas',exact:true}).count()).toBe(0);
 await expect(link).toHaveAttribute('rel','noopener noreferrer');await popup.close();
 await page.locator('#axes [data-id="cardiovascular"],#axes [data-axis="cardiovascular"]').click();
 await page.context().route('**/ra/retorno-venoso/app.js*',r=>r.fulfill({body:'',contentType:'text/javascript'}));
 const venousPopupPromise=page.waitForEvent('popup');await page.locator('.ra-card a').filter({hasText:'Retorno venoso'}).click();const venous=await venousPopupPromise;await venous.waitForLoadState('domcontentloaded');
 expect(new URL(venous.url()).pathname).toBe('/ra/retorno-venoso/');
 await expect(venous.locator('a.small-button[data-voltar-tutor]')).toHaveAttribute('href',`${base}/tutor-${course}.html`);await venous.close();
 await page.context().route('**/ra/coracao/app.js*',r=>r.fulfill({body:'',contentType:'text/javascript'}));
 const heartPopupPromise=page.waitForEvent('popup');await page.locator('.ra-card a').filter({hasText:'Coração em ação'}).click();const heart=await heartPopupPromise;await heart.waitForLoadState('domcontentloaded');
 expect(new URL(heart.url()).pathname).toBe('/ra/coracao/');expect(new URL(heart.url()).searchParams.get('percurso')).toBe(course==='fisio'?'fisioterapia':'educacao-fisica');
 await expect(heart.locator('a.small-button[data-voltar-tutor]')).toHaveAttribute('href',`${base}/tutor-${course}.html`);
 await expect(heart.locator('#pA')).toHaveText('Vista Externa');await expect(heart.locator('#pB')).toHaveText('Vista Interna');await heart.close();
 await page.locator('#axes [data-id="muscular"],#axes [data-axis="muscular"]').click();
 await page.context().route('**/ra/musculo-sarcomero/app.js*',r=>r.fulfill({body:'',contentType:'text/javascript'}));
 const musclePopupPromise=page.waitForEvent('popup');await page.locator('.ra-card a').filter({hasText:'Do músculo ao sarcômero'}).click();const muscle=await musclePopupPromise;await muscle.waitForLoadState('domcontentloaded');
 expect(new URL(muscle.url()).pathname).toBe('/ra/musculo-sarcomero/');expect(new URL(muscle.url()).searchParams.get('percurso')).toBe(course==='fisio'?'fisioterapia':'educacao-fisica');
 await expect(muscle.locator('a.small-button[data-voltar-tutor]')).toHaveAttribute('href',`${base}/tutor-${course}.html`);
 await expect(muscle.locator('.step')).toHaveCount(5);await expect(muscle.locator('#launchAR')).toHaveText('Abrir em realidade aumentada');await muscle.close();
 await page.context().route('**/ra/juncao-neuromuscular/app.js*',r=>r.fulfill({body:'',contentType:'text/javascript'}));
 const junctionPopupPromise=page.waitForEvent('popup');await page.locator('.ra-card a').filter({hasText:'Do nervo à força'}).click();const junction=await junctionPopupPromise;await junction.waitForLoadState('domcontentloaded');
 expect(new URL(junction.url()).pathname).toBe('/ra/juncao-neuromuscular/');expect(new URL(junction.url()).searchParams.get('percurso')).toBe(course==='fisio'?'fisioterapia':'educacao-fisica');
 await expect(junction.locator('a[data-voltar-tutor]').last()).toHaveAttribute('href',`${base}/tutor-${course}.html`);
 await expect(junction.locator('[data-step]')).toHaveCount(5);await expect(junction.locator('#play')).toHaveText('Iniciar');await junction.close();
});
