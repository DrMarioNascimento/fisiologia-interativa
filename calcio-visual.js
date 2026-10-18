/* Ampliar o mesmo canvas mantém animação, pausa e estado sincronizados. */
(() => {
  const dialog = document.createElement('dialog');
  dialog.id = 'calcio-zoom';
  dialog.setAttribute('aria-labelledby', 'calcio-zoom-title');
  dialog.innerHTML = '<div class="zoom-toolbar"><strong id="calcio-zoom-title"></strong><button type="button" autofocus>Fechar</button></div><div class="zoom-content"></div>';
  document.body.append(dialog);
  let anchor, content, trigger;
  document.querySelectorAll('[data-zoom]').forEach(button => {
    button.addEventListener('click', () => {
      trigger = button;
      const canvas = document.getElementById(button.dataset.zoom);
      content = canvas.closest('.scene-wrap') || canvas;
      anchor = document.createComment('posição do painel ampliado');
      content.before(anchor);
      dialog.querySelector('.zoom-content').append(content);
      dialog.querySelector('strong').textContent = button.dataset.zoom === 'sceneCanvas' ? 'Integração entre os órgãos' : 'Resposta ao longo do processo';
      dialog.showModal();
    });
  });
  dialog.querySelector('button').addEventListener('click', () => dialog.close());
  dialog.addEventListener('close', () => {
    if (anchor) anchor.replaceWith(content);
    trigger?.focus();
  });
})();
