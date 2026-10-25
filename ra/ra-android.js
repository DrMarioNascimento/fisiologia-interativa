/* A RA no Android que não tem o serviço de RA do Google.

   25/10/2026: quatro aparelhos Xiaomi do Mario não abriram nenhuma RA. Três
   caminhos falhavam, todos fora da página:
   - o visualizador do app Google (Scene Viewer) ficava na tela do cubo, ou o
     app Google caía ("o app Google apresenta falhas contínuas");
   - o Chrome mandava à Play Store para instalar o "Google Play Services para
     RA", que recusa o aparelho ("só disponível para seus outros dispositivos");
   - a página não ficava sabendo de nada e o aluno não tinha saída.
   O que este arquivo faz, em toda página com <model-viewer ar>:
   1. no Android, tira o Scene Viewer dos modos de RA (fica WebXR, que só
      existe com o serviço instalado, e o Quick Look do iPhone);
   2. se a página some logo depois de pedir a RA e a sessão não começou (foi
      para a loja), marca o aparelho como sem o serviço; na volta, mostra o
      modelo em 3D na tela e explica em uma linha;
   3. num aparelho marcado, o modo RA do Android sai de vez: os botões de RA
      ficam desligados pela própria lógica das páginas, e o 3D continua.
   4. e oferece "Ver na mesa com a câmera" (ra/camera/), a RA pelo motor 8th
      Wall dos jogos, que não depende do Google.
   O iPhone não muda em nada. */
(function () {
  'use strict';
  var ANDROID = /Android/i.test(navigator.userAgent);
  if (!ANDROID) return;
  var CHAVE = 'ra:sem-arcore';
  /* a tela de câmera mora ao lado deste arquivo: ra/camera/ */
  var CAMERA = (document.currentScript && document.currentScript.src ? document.currentScript.src.replace(/[^/]*$/, '') : '/ra/') + 'camera/index.html';
  function semServico() { try { return localStorage.getItem(CHAVE) === '1'; } catch (e) { return false; } }
  function marcar() { try { localStorage.setItem(CHAVE, '1'); } catch (e) {} }
  function modos(v) {
    var alvo = semServico() ? 'quick-look' : 'webxr quick-look';
    if (v.getAttribute('ar-modes') !== alvo) v.setAttribute('ar-modes', alvo);
  }
  function vigiar(v) {
    if (v.__raAndroid) return; v.__raAndroid = true;
    modos(v);
    /* páginas que escrevem ar-modes depois (a célula) são corrigidas na hora */
    new MutationObserver(function () { modos(v); }).observe(v, { attributes: true, attributeFilter: ['ar-modes'] });
    v.addEventListener('ar-status', function (e) { if (e.detail && e.detail.status === 'session-started') v.__raComecou = true; });
    botaoCamera(v);
  }
  function todos() { document.querySelectorAll('model-viewer[ar]').forEach(vigiar); }
  new MutationObserver(todos).observe(document.documentElement, { childList: true, subtree: true });
  if (document.readyState !== 'loading') todos(); else document.addEventListener('DOMContentLoaded', todos);

  /* pedir a RA e sumir para a loja = aparelho sem o serviço */
  var tentativa = null;
  customElements.whenDefined('model-viewer').then(function () {
    var P = customElements.get('model-viewer').prototype, original = P.activateAR;
    if (!original || P.__raAndroid) return; P.__raAndroid = true;
    P.activateAR = function () { tentativa = { v: this, t: Date.now() }; this.__raComecou = false; return original.apply(this, arguments); };
  });
  var saiu = null;
  document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
      if (tentativa && Date.now() - tentativa.t < 6000 && !tentativa.v.__raComecou) saiu = tentativa;
      return;
    }
    if (!saiu) return;
    var v = saiu.v; saiu = null; tentativa = null;
    if (v.__raComecou) return;
    marcar();
    document.querySelectorAll('model-viewer[ar]').forEach(modos);
    aviso('Este aparelho não tem a realidade aumentada do Google. Use o botão Ver na mesa com a câmera: ele abre a RA por outro caminho, só com a câmera.');
    document.querySelectorAll('model-viewer[ar]').forEach(function (x) { if (x.__raBotao) x.__raBotao.atualizar(); });
    if (v.__raBotao && !v.__raBotao.el.hidden) v.__raBotao.el.scrollIntoView({ block: 'center' }); else ver3d(v);
  });

  /* 25/10/2026 (Mario: "faça isso na fisiologia"): a RA sem o Google. O botão
     aparece quando o modelo está pronto e o Android não tem o serviço (marcado,
     ou o model-viewer diz que não abre RA). Abre ra/camera/ por cima da página,
     com o mesmo GLB — inclusive o blob que a bancada acabou de exportar. */
  function semRA(v) { return semServico() || (v.loaded && !v.canActivateAR); }
  function botaoCamera(v) {
    if (v.__raBotao) return;
    var b = document.createElement('button'); b.type = 'button'; b.className = 'ra-camera-botao'; b.hidden = true;
    b.textContent = 'Ver na mesa com a câmera';
    b.style.cssText = 'display:block;margin:8px auto;min-height:48px;padding:10px 18px;border-radius:12px;border:0;background:linear-gradient(#f3d078,#d9a83a);color:#1a1206;font:700 clamp(14px,3.6vw,16px) system-ui,sans-serif;box-shadow:0 4px 10px #0007';
    function atualizar() { var src = v.getAttribute('src'); b.hidden = !src || v.hidden || !semRA(v); }
    b.onclick = function () { abrirCamera(v); };
    var barra = v.nextElementSibling && v.nextElementSibling.classList && v.nextElementSibling.classList.contains('ra-ver3d-barra') ? v.nextElementSibling : null;
    if (barra) barra.insertBefore(b, barra.firstChild); else v.insertAdjacentElement('afterend', b);
    v.addEventListener('load', atualizar);
    new MutationObserver(atualizar).observe(v, { attributes: true, attributeFilter: ['src', 'hidden'] });
    v.__raBotao = { el: b, atualizar: atualizar }; atualizar();
  }
  function abrirCamera(v) {
    var src = v.getAttribute('src'); if (!src) return;
    var abs = /^(blob:|https?:)/.test(src) ? src : new URL(src, location.href).href;
    var titulo = (document.title || '').split('·')[0].trim() || 'Ver na mesa';
    var f = document.createElement('iframe');
    f.src = CAMERA + '?glb=' + encodeURIComponent(abs) + '&titulo=' + encodeURIComponent(titulo);
    f.allow = 'camera; gyroscope; accelerometer; magnetometer; xr-spatial-tracking; fullscreen';
    f.setAttribute('title', 'Ver na mesa com a câmera');
    f.style.cssText = 'position:fixed;inset:0;width:100vw;height:100dvh;border:0;z-index:2147483500;background:#071219';
    document.body.appendChild(f); document.documentElement.style.overflow = 'hidden';
    function fechar(e) { if (e.source !== f.contentWindow || !e.data || e.data.raCamera !== 'fechar') return; removeEventListener('message', fechar); f.remove(); document.documentElement.style.overflow = ''; }
    addEventListener('message', fechar);
  }

  function ver3d(v) {
    var barra = v.nextElementSibling;
    var botao = barra && barra.classList && barra.classList.contains('ra-ver3d-barra') ? barra.querySelector('button') : null;
    if (botao && !botao.disabled) { botao.click(); return; }
    v.hidden = false;
    try { if (v.requestFullscreen) v.requestFullscreen().catch(function () { v.scrollIntoView({ block: 'center' }); }); else v.scrollIntoView({ block: 'center' }); } catch (e) { v.scrollIntoView({ block: 'center' }); }
  }
  function aviso(txt) {
    var d = document.createElement('div'); d.setAttribute('role', 'status');
    d.style.cssText = 'position:fixed;left:50%;bottom:max(16px,env(safe-area-inset-bottom));transform:translateX(-50%);z-index:2147483600;max-width:min(420px,calc(100vw - 32px));' +
      'padding:12px 16px;border-radius:14px;background:#13222cf2;border:1px solid #8fd8ff99;color:#eef7fb;font:500 clamp(14px,3.6vw,16px)/1.4 system-ui,sans-serif;box-shadow:0 8px 24px #000a';
    d.textContent = txt; document.body.appendChild(d);
    setTimeout(function () { d.remove(); }, 9000);
    d.addEventListener('click', function () { d.remove(); });
  }
  /* As páginas mandam "use o Chrome no Android" quando a RA não abre. Num
     Android sem o serviço do Google a pessoa JÁ está no Chrome, e a frase a
     faz procurar o que não existe (visto no print da célula). A frase certa
     é dita aqui, sem mexer em cada página. */
  var ERRADA = /Chrome no Android|No Android, abra esta página no Chrome|No Android, use o Chrome/;
  var CERTA = 'Este celular Android não tem a realidade aumentada do Google (Google Play Services para RA). Use o botão Ver na mesa com a câmera: ele abre a RA por outro caminho, só com a câmera do celular.';
  function corrigir(raiz) {
    var w = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT), n, achados = [];
    while ((n = w.nextNode())) if (ERRADA.test(n.nodeValue)) achados.push(n);
    achados.forEach(function (t) { t.nodeValue = CERTA; });
  }
  new MutationObserver(function (lista) {
    lista.forEach(function (m) { if (m.type === 'characterData') { if (ERRADA.test(m.target.nodeValue)) m.target.nodeValue = CERTA; } else m.addedNodes.forEach(function (x) { if (x.nodeType === 3) { if (ERRADA.test(x.nodeValue)) x.nodeValue = CERTA; } else if (x.nodeType === 1) corrigir(x); }); });
  }).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  if (document.body) corrigir(document.body); else document.addEventListener('DOMContentLoaded', function () { corrigir(document.body); });

  /* para conferência: window.__raAndroid.estado() / .esquecer() */
  window.__raAndroid = { estado: function () { return { semServico: semServico() }; }, esquecer: function () { try { localStorage.removeItem(CHAVE); } catch (e) {} } };
})();
