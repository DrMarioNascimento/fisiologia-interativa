const { test, expect } = require('@playwright/test');

/* Página inicial (Educação Física): carrega sem erros, abre unidades pelo mapa,
   mapas mentais abrem ampliados, lista completa, sem rolagem lateral e contraste mínimo. */

async function auditLayout(page, tag) {
  const bad = await page.evaluate(() => [...document.querySelectorAll('body *')].filter(el => {
    if (el.closest('.ambient-layer, .dialbox, dialog')) return false;
    const r = el.getBoundingClientRect(); if (!r.width || !r.height) return false;
    return r.right > document.documentElement.clientWidth + 3 || r.left < -3;
  }).slice(0, 12).map(el => ({ tag: el.tagName, cls: String(el.className), right: Math.round(el.getBoundingClientRect().right) })));
  expect(bad, `Horizontal overflow at ${tag}`).toEqual([]);
}

async function auditContrast(page, tag) {
  const failures = await page.evaluate(() => {
    const parse = s => { const m = (s || '').match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?/); return m ? { c: m.slice(1, 4).map(Number), a: m[4] == null ? 1 : +m[4] } : null; };
    const lum = rgb => { const c = rgb.map(v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }); return .2126 * c[0] + .7152 * c[1] + .0722 * c[2]; };
    const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + .05) / (Math.min(x, y) + .05); };
    const bgOf = el => { let n = el; while (n) { const p = parse(getComputedStyle(n).backgroundColor); if (p && p.a > .5) return p.c; n = n.parentElement; } return [7, 11, 16]; };
    return [...document.querySelectorAll('main p, main h1, main h2, main h3, main h4, main li a, main .card p, main button, footer strong')].filter(el => {
      const r = el.getBoundingClientRect(), cs = getComputedStyle(el);
      return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && el.textContent.trim() && !el.closest('.grad') && cs.backgroundImage === 'none';
    }).map(el => { const fg = parse(getComputedStyle(el).color); return { text: el.textContent.trim().slice(0, 60), ratio: fg && fg.a > .5 ? ratio(fg.c, bgOf(el)) : 99 }; })
      .filter(x => x.ratio < 4.5);
  });
  expect(failures, `Low contrast at ${tag}: ${JSON.stringify(failures.slice(0, 8))}`).toEqual([]);
}

test('página inicial — mapa, fichas, lista e salas', async ({ page }, testInfo) => {
  const errors = [];
  page.on('console', m => { if (m.type() === 'error' && !/fonts\.g/.test(m.text())) errors.push(m.text()); });
  page.on('pageerror', e => errors.push(e.message));
  page.on('response', r => { if (r.status() >= 400 && !/fonts\.g/.test(r.url())) errors.push(r.status() + ' ' + r.url()); });

  await page.goto('/index.html?v=playwright', { waitUntil: 'networkidle' });
  const welcome = page.locator('#welcome');
  await expect(welcome).toBeVisible();
  await page.click('#welcomeAccept');
  await expect(welcome).toBeHidden();

  await expect(page.locator('#cm')).toBeVisible();
  await expect(page.locator('#pills button')).toHaveCount(6);
  await expect(page.locator('.card')).toHaveCount(26);

  // cada botão de unidade abre a ficha certa, com mapas e simuladores
  for (const [i, nome] of [[3, 'Sistema cardiovascular'], [4, 'Sistema respiratório'], [0, 'Fisiologia celular']]) {
    await page.locator('#pills button').nth(i).click();
    await expect(page.locator('#p-name')).toContainText(nome);
    await expect(page.locator('#p-sims li').first()).toBeVisible();
    await expect(page.locator('#p-doors .mapthumb').first()).toBeVisible();
  }

  // mapa mental ampliado
  await page.locator('#p-doors .mapthumb').first().click();
  await expect(page.locator('#mapdlg')).toBeVisible();
  await page.click('#md-x');
  await expect(page.locator('#mapdlg')).toBeHidden();

  // Operação Secreta pede confirmação
  await page.locator('#tfB .arrows button').first().click();
  await expect(page.locator('#tfB .roomname')).toContainText('Operação Secreta');
  await page.locator('#tfB a.enter').click();
  await expect(page.locator('#opdlg')).toBeVisible();
  await page.click('#op-nao');
  await expect(page.locator('#opdlg')).toBeHidden();
  await page.locator('#tfB').screenshot({ path: testInfo.outputPath('salas.png') });

  // busca
  await page.fill('#search', 'poiseuille');
  await expect(page.locator('.card')).toHaveCount(1);
  await page.fill('#search', '');

  await auditLayout(page, testInfo.project.name);
  await auditContrast(page, testInfo.project.name);
  await page.screenshot({ path: testInfo.outputPath('inicio.png'), fullPage: true });
  expect(errors, `Console errors: ${errors.join('\n')}`).toEqual([]);
});
