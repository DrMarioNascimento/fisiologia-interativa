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
   O iPhone não muda em nada. */
(function () {
  'use strict';
  var ANDROID = /Android/i.test(navigator.userAgent);
  if (!ANDROID) return;
  var CHAVE = 'ra:sem-arcore';
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
    aviso('Este aparelho não tem a realidade aumentada do Google. O modelo abriu em 3D na tela: arraste para girar e use dois dedos para aproximar.');
    ver3d(v);
  });

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
  var CERTA = 'Este celular Android não tem a realidade aumentada do Google (Google Play Services para RA), por isso a câmera não abre aqui. O modelo continua em 3D nesta página: arraste para girar e use dois dedos para aproximar.';
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
