const { test, expect } = require('@playwright/test');

const tasks = [
  { key: 'copo', label: /copo/i },
  { key: 'medicine', label: /medicine/i },
  { key: 'joelho', label: /joelho|extens/i }
];
const screens = ['parallel','recruitment','muscle','feedback'];

function luminance(rgb) {
  const c = rgb.map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); });
  return .2126*c[0]+.7152*c[1]+.0722*c[2];
}

async function auditContrast(page, tag) {
  const failures = await page.locator('#dim-root').evaluate((root) => {
    const parse = s => { const m=(s||'').match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/); return m ? m.slice(1,4).map(Number) : null; };
    const lum = rgb => { const c=rgb.map(v=>{v/=255;return v<=.03928?v/12.92:Math.pow((v+.055)/1.055,2.4)});return .2126*c[0]+.7152*c[1]+.0722*c[2]; };
    const ratio=(a,b)=>{const x=lum(a),y=lum(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05)};
    const bgOf = el => { let n=el; while(n){ const c=parse(getComputedStyle(n).backgroundColor); if(c && getComputedStyle(n).backgroundColor !== 'rgba(0, 0, 0, 0)') return c; n=n.parentElement; } return [255,255,255]; };
    return [...root.querySelectorAll('p,span,b,strong,label,h1,h2,h3,h4,button')].filter(el=>{
      const r=el.getBoundingClientRect(),cs=getComputedStyle(el); return r.width>0&&r.height>0&&cs.visibility!=='hidden'&&cs.display!=='none'&&el.textContent.trim();
    }).map(el=>{const fg=parse(getComputedStyle(el).color),bg=bgOf(el);return {text:el.textContent.trim().slice(0,90),ratio:fg?ratio(fg,bg):99,fg,bg};}).filter(x=>x.ratio<3.5);
  });
  expect(failures, `Low contrast elements at ${tag}: ${JSON.stringify(failures.slice(0,8))}`).toEqual([]);
}

async function auditLayout(page, tag) {
  const bad = await page.locator('#dim-root').evaluate(root => [...root.querySelectorAll('*')].filter(el=>{
    const r=el.getBoundingClientRect(); if(!r.width||!r.height)return false; return r.right > document.documentElement.clientWidth + 3 || r.left < -3;
  }).slice(0,12).map(el=>({tag:el.tagName,cls:el.className,left:el.getBoundingClientRect().left,right:el.getBoundingClientRect().right})));
  expect(bad, `Horizontal overflow at ${tag}`).toEqual([]);
}

test.describe('Da intenção ao movimento — auditoria completa', () => {
  for (const task of tasks) {
    test(`${task.key}: telas, contraste e responsividade`, async ({ page }, testInfo) => {
      const consoleErrors=[];
      page.on('console',m=>{if(m.type()==='error')consoleErrors.push(m.text())});
      page.on('pageerror',e=>consoleErrors.push(e.message));
      await page.goto('/da-intencao-ao-movimento.html?v=playwright', { waitUntil:'networkidle' });
      await expect(page.locator('#dim-root')).toBeVisible();
      const card=page.locator('.dim-task-card').filter({hasText:task.label}).first();
      await expect(card).toBeVisible();
      await card.click();
      await auditContrast(page, `${task.key}-intro`); await auditLayout(page, `${task.key}-intro`);
      await page.screenshot({path:testInfo.outputPath(`${task.key}-intro.png`),fullPage:true});

      for (const screen of screens) {
        await page.evaluate(id => window.dimGo(id), screen);
        await page.waitForTimeout(250);
        await expect(page.locator(`#screen-${screen}`)).toBeVisible();
        await auditContrast(page, `${task.key}-${screen}`);
        await auditLayout(page, `${task.key}-${screen}`);
        const selected=page.locator(`#screen-${screen} [data-selected-task]`).first();
        if(await selected.count()){
          const styles=await selected.evaluate(el=>({bg:getComputedStyle(el).backgroundColor,color:getComputedStyle(el).color}));
          expect(styles.bg).not.toBe('rgb(255, 255, 255)');
        }
        await page.screenshot({path:testInfo.outputPath(`${task.key}-${screen}.png`),fullPage:true});
      }
      expect(consoleErrors, `Console errors: ${consoleErrors.join('\n')}`).toEqual([]);
    });
  }
});
