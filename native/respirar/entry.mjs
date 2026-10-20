import { Capacitor } from '@capacitor/core';
import { LocalNotifications } from '@capacitor/local-notifications';
import agenda from '../../biofeedback-agenda.js';
import { createReminders } from './reminders.mjs';

if (Capacitor.isNativePlatform()) {
  const content = document.querySelector('#agendaDropdown .dropdown-content');
  const box = document.createElement('div');
  box.className = 'native-reminders';
  box.innerHTML = '<h3>Lembretes da agenda</h3><p>Receba um lembrete nos dias e horários salvos. A sessão começa somente quando você tocar em iniciar.</p><button type="button" class="resp-audio-preview" id="nativeEnable">Ativar lembretes</button><button type="button" class="resp-audio-preview" id="nativeDisable">Desativar lembretes</button><p role="status" id="nativeReminderStatus">Lembretes opcionais, desativados inicialmente.</p>';
  content.append(box);
  const status = box.querySelector('#nativeReminderStatus');
  const buttons = [...box.querySelectorAll('button')];
  let controller;
  try {
    controller = createReminders({plugin:LocalNotifications, storage:localStorage,
      platform:Capacitor.getPlatform(), readPlan:() => {
        const raw = localStorage.getItem('respiratoryAgenda.v1');
        try { return raw ? agenda.normalize(JSON.parse(raw)) : null; }
        catch (_) { throw Error('Não foi possível ler a agenda. Salve-a novamente antes de ativar os lembretes.'); }
      }});
  } catch (_) { status.textContent = 'O armazenamento está indisponível. Os lembretes não foram ativados.'; buttons.forEach(b => b.disabled = true); }
  let uiQueue = Promise.resolve();
  function run(action) {
    if (!controller) return;
    const task = uiQueue.then(async () => {
    buttons.forEach(b => b.disabled = true);
    try { status.textContent = await action(); }
    catch (error) { status.textContent = error.message || 'Não foi possível atualizar os lembretes.'; }
    finally { buttons.forEach(b => b.disabled = false); }
    });
    uiQueue = task.catch(() => {}); return task;
  }
  buttons[0].addEventListener('click', () => run(() => controller.enable()));
  buttons[1].addEventListener('click', () => run(() => controller.disable()));
  // The agenda's existing save handler runs first. Only a successful save changes
  // its status text; this avoids applying an invalid or unsaved draft.
  const agendaStatus = document.getElementById('agendaStatus');
  new MutationObserver(() => {
    if (agendaStatus.textContent.startsWith('Agenda salva') && controller?.enabled()) run(() => controller.sync());
  }).observe(agendaStatus, {childList:true, characterData:true, subtree:true});
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) run(() => controller.sync());
  });
  LocalNotifications.addListener('localNotificationActionPerformed', event => {
    if (event.notification?.extra?.feature !== 'respiratory-agenda') return;
    document.querySelector('#agendaDropdown .dropdown-toggle').setAttribute('aria-expanded', 'true');
    document.getElementById('agendaDropdown').classList.add('open');
    document.getElementById('agendaStart').focus();
  }).catch(() => { status.textContent = 'Não foi possível conectar a abertura pelo lembrete. Abra o aplicativo normalmente.'; });
  run(() => controller.sync());
}
