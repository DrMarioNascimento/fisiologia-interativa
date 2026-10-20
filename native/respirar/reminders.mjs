// Notifications use only these seven IDs; other notification features are untouched.
export const IDS = Array.from({length:7}, (_, day) => 64010 + day);
export const KEY = 'respiratoryNativeReminders.v1';
export function notificationsFor(plan) {
  if (!plan?.enabled) return [];
  const [hour, minute] = plan.time.split(':').map(Number);
  return plan.days.map(day => ({
    id: IDS[day], title: 'Sua sessão de respiração',
    body: 'Abra o Respirar e inicie sua sessão planejada quando preferir.',
    channelId: 'respirar-agenda',
    schedule: {on: {weekday: day + 1, hour, minute, second: 0}, allowWhileIdle: true},
    isExactNotification: false,
    extra: {feature: 'respiratory-agenda'}
  }));
}
export function createReminders({plugin, storage, readPlan, platform}) {
  let queue = Promise.resolve();
  const enabled = () => storage.getItem(KEY) === 'enabled';
  const serial = action => {
    const next = queue.then(action); queue = next.catch(() => {}); return next;
  };
  const cancel = () => plugin.cancel({notifications: IDS.map(id => ({id}))});
  async function apply(requestPermission) {
    const plan = readPlan();
    if (!plan?.enabled) {
      if (requestPermission) throw Error('Salve e ative a agenda antes de ativar os lembretes.');
      await cancel(); return 'Agenda desativada. Nenhum lembrete agendado.';
    }
    let permission = await plugin.checkPermissions();
    if (permission.display !== 'granted' && requestPermission) permission = await plugin.requestPermissions();
    if (permission.display !== 'granted') throw Error('As notificações não estão autorizadas. Você pode permiti-las nos ajustes do celular.');
    if (platform === 'android') await plugin.createChannel({id:'respirar-agenda', name:'Agenda de respiração', importance:3, visibility:0});
    // Persist intent first so no schedule can be created if local storage fails.
    storage.setItem(KEY, 'enabled');
    try { await cancel(); } catch (_) { throw Error('Não foi possível substituir os lembretes anteriores. Desative as notificações nos ajustes do celular e tente novamente.'); }
    try { await plugin.schedule({notifications: notificationsFor(plan)}); }
    catch (error) {
      try { await cancel(); storage.setItem(KEY, 'disabled'); }
      catch (_) { throw Error('Não foi possível confirmar o cancelamento. Desative as notificações nos ajustes do celular e tente novamente.'); }
      throw Error('Não foi possível agendar os lembretes. Toque em Ativar lembretes para tentar novamente.');
    }
    return 'Lembretes da agenda ativados. O horário pode variar conforme os ajustes e a economia de bateria do celular.';
  }
  return {
    enabled,
    enable: () => serial(() => apply(true)),
    sync: () => serial(async () => {
      if (!enabled()) { await cancel(); return 'Lembretes desativados.'; }
      return apply(false);
    }),
    disable: () => serial(async () => {
      storage.setItem(KEY, 'disabled');
      try { await cancel(); } catch (_) { throw Error('Não foi possível cancelar os lembretes. Desative as notificações nos ajustes do celular e tente novamente.'); }
      return 'Lembretes desativados.';
    })
  };
}
