export const scenarios = {
  normal: { group: 'Referência', params: {}, text: 'Eutireoidismo: eixo íntegro em equilíbrio. TRH estimula TSH; TSH estimula síntese e secreção tireoidiana; T3 intracelular exerce feedback negativo.' },
  hashimotoPreserved: { group: 'Hashimoto — doença autoimune', params: {}, text: 'Hashimoto com função preservada: autoimunidade não implica hipotireoidismo obrigatório. Neste cenário, a função hormonal permanece basal. Anticorpos e inflamação não são variáveis simuladas.' },
  hashimoto: { group: 'Hashimoto — doença autoimune', params: { thyroidFn: 0.15 }, text: 'Hashimoto com perda acentuada de função: representa a consequência da destruição folicular autoimune, não sua progressão. Espera-se T4 baixo e aumento compensatório de TSH. Anti-TPO/anti-Tg apoiam a etiologia; não medem a intensidade da deficiência.' },
  destructive: { group: 'Tireotoxicose destrutiva — sem hiperprodução', params: { destruction: 0.05 }, text: 'Lesão folicular libera estoques e reduz tecido viável. Pode haver excesso transitório, seguido de deficiência; representa o mecanismo da hashitoxicose/tireoidite, não a evolução habitual de todo Hashimoto. Taxa didática acelerada, não velocidade clínica.' },
  absent: { group: 'Hipotireoidismo — estado funcional', params: { thyroidFn: 0 }, text: 'Hipotireoidismo primário após tireoidectomia total: cessa a secreção glandular de T4 e T3. Os hormônios já circulantes são eliminados progressivamente; a conversão do T4 residual continua.' },
  central: { group: 'Hipotireoidismo — estado funcional', params: { thyrotropeFn: 0.05 }, text: 'Hipotireoidismo central por deficiência hipofisária: T4 cai sem elevação apropriada de TSH. Na clínica, TSH pode ser baixo, normal ou discretamente elevado com atividade biológica reduzida. O modelo representa apenas redução da secreção.' },
  graves: { group: 'Graves — doença autoimune', params: { trab: 5 }, text: 'Graves com hipertireoidismo: anticorpos estimulantes do receptor de TSH (TSI) sustentam a produção mesmo com TSH suprimido. O parâmetro TRAb representa somente atividade estimulante, não todos os anticorpos medidos pelo exame.' },
  replacement: { group: 'Reposição de T4', params: { thyroidFn: 0, levothyroxine: 1 }, pretreatment: { thyroidFn: 0 }, text: 'Reposição após deficiência estabelecida: inicia após 56 dias simulados sem tireoide nem reposição. T4 exógeno fornece substrato para T3; não regenera a glândula. 100% é entrada normalizada, não garantia de eutiroidismo nem dose clínica.' },
  excess: { group: 'Tireotoxicose sem hiperprodução glandular', params: { levothyroxine: 2 }, text: 'Excesso de T4 exógeno: tireotoxicose sem hipertireoidismo glandular. O feedback suprime TSH e reduz a produção endógena; o aporte externo persiste. Diferente de Graves, não há estímulo por anticorpo.' },
};

export function describeState(state, baseline, params) {
  const ratio = Object.fromEntries(['trh', 'tsh', 't4', 't3'].map(id => [id, state[id] / baseline[id]]));
  const feedback = (0.6 * state.t4 + 0.4 * state.t3) / (0.6 * baseline.t4 + 0.4 * baseline.t3);
  const feedbackText = feedback < 0.9 ? 'O sinal combinado de T4 e T3 diminuiu: há menor freio central. A elevação de TSH depende da reserva hipofisária.' : feedback > 1.1 ? 'O sinal combinado de T4 e T3 aumentou: o freio central tende a reduzir TRH e TSH. Não bloqueia diretamente os anticorpos de Graves nem a entrada exógena.' : 'O sinal combinado de T4 e T3 está próximo do basal. TSH e TRH ainda podem estar em adaptação.';
  let interpretation;
  if (ratio.t4 < 0.85) {
    interpretation = ratio.tsh > 1.2 ? 'T4 abaixo do basal e TSH aumentado: resposta compatível com deficiência primária no modelo.' : 'T4 abaixo do basal sem aumento apropriado de TSH: padrão central ou fase transitória; não classificar pelo T4 isolado.';
  } else if (ratio.t4 > 1.15 || ratio.t3 > 1.15) {
    interpretation = ratio.tsh < 0.8 ? 'T4 e/ou T3 acima do basal com TSH reduzido: padrão de excesso hormonal no modelo.' : 'T4 e/ou T3 acima do basal, mas TSH ainda não suprimido: observe a transição; isto não estabelece uma etiologia.';
    if (params.trab > 0) interpretation += ' Há estímulo estimulante do receptor de TSH, como em Graves.';
    if (params.levothyroxine > 0) interpretation += ' Há contribuição de T4 exógeno.';
  } else if (ratio.t3 < 0.85) {
    interpretation = 'T3 abaixo do basal com T4 próximo do basal: examine a conversão periférica. T3 baixo isolado não diagnostica hipotireoidismo.';
  } else if (ratio.tsh > 1.2 || ratio.tsh < 0.8) {
    interpretation = 'T4 e T3 próximos do basal com TSH alterado: compensação ou transição no modelo. Na clínica, doença subclínica exige faixas laboratoriais e contexto, não estes percentuais.';
  } else {
    interpretation = 'T4, T3 e TSH próximos do basal do modelo. Isso não exclui autoimunidade (por exemplo, Hashimoto com função preservada).';
  }
  return { feedbackText, interpretation };
}
