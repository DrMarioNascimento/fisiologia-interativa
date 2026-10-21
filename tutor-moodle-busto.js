/* Shared 3D tutor launcher for both compact Moodle courses. */
(function () {
  'use strict';
  const chat = document.querySelector('.chat');
  const btn = document.querySelector('#moodleTutorLauncher');
  if (!chat || !btn || !window.tutorEFCoin) return;
  const toggle = () => {
    chat.hidden = !chat.hidden;
    btn.setAttribute('aria-expanded', String(!chat.hidden));
    btn.setAttribute('aria-label', chat.hidden ? 'Abrir Tutor de Fisiologia' : 'Minimizar Tutor de Fisiologia');
    if (!chat.hidden) document.querySelector('#input').focus();
  };
  document.querySelector('#moodleTutorClose')?.addEventListener('click', toggle);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !chat.hidden) { toggle(); btn.focus(); }
  });
  window.tutorEFCoin.attach(btn, toggle, () => {});
})();
