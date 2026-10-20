/* Installable respiratory guide: installation is always initiated by the person. */
(function () {
  'use strict';
  const state = document.getElementById('offlineStatus');
  const install = document.getElementById('installApp');
  const retry = document.getElementById('prepareOffline');
  let prompt, ready = false;
  function render() {
    if (ready) state.textContent = navigator.onLine ? 'Pronto para uso offline neste aparelho.' : 'Sem conexão. O guia e os áudios gravados estão disponíveis offline.';
  }
  window.addEventListener('online', render); window.addEventListener('offline', render);
  window.addEventListener('beforeinstallprompt', event => { event.preventDefault(); prompt = event; install.hidden = false; });
  window.addEventListener('appinstalled', () => { install.hidden = true; prompt = null; });
  install.addEventListener('click', async () => {
    if (!prompt) return;
    const current = prompt; prompt = null; install.hidden = true;
    try { await current.prompt(); await current.userChoice; } catch (_) { state.textContent = 'Use o menu do navegador para adicionar à tela de início.'; }
  });
  async function prepare() {
    if (!('serviceWorker' in navigator)) { state.textContent = 'Este navegador não oferece o preparo offline. Abra este endereço no Safari ou Chrome atualizado.'; return; }
    retry.disabled = true; state.textContent = 'Preparando o uso offline… mantenha esta página aberta.';
    try {
      const registration = await navigator.serviceWorker.register('./sw.js', {scope: './', updateViaCache: 'none'});
      if (!registration.active && registration.installing) {
        const worker = registration.installing;
        await new Promise((resolve, reject) => {
          const check = () => { if (worker.state === 'activated') resolve(); else if (worker.state === 'redundant') reject(Error('Preparo interrompido')); };
          worker.addEventListener('statechange', check); check();
        });
      }
      await navigator.serviceWorker.ready;
      ready = true; render();
      if (registration.waiting) state.textContent = 'Nova versão pronta. Ao terminar a sessão, feche e reabra o aplicativo para atualizar.';
      registration.addEventListener('updatefound', () => {
        const worker = registration.installing;
        if (worker) worker.addEventListener('statechange', () => {
          if (worker.state === 'installed' && navigator.serviceWorker.controller) state.textContent = 'Nova versão pronta. Ao terminar a sessão, feche e reabra o aplicativo para atualizar.';
          if (worker.state === 'redundant' && !ready) state.textContent = 'O preparo offline não terminou. Verifique a conexão e tente novamente.';
        });
      });
    } catch (_) { state.textContent = 'Não foi possível preparar o uso offline. Verifique a conexão e toque em Preparar novamente.'; }
    finally { retry.disabled = false; }
  }
  retry.addEventListener('click', prepare);
  prepare();
})();
