import { HCG_PEAK_DAY, ovulationDay, PREGNANCY_TOTAL_DAYS, TERM_DAY } from './cycle-model.js?v=20261018-ciclo1';


                                                               

                         
            
               
                
                
                                                  
               
                       
 

                                                                   

export function segments(mode      , cycleLength        )            {
  if (mode === 'ciclo') {
    const ov = ovulationDay(cycleLength)
    return [
      { label: 'Menstrual', start: 0, end: 5 },
      { label: 'Folicular', start: 5, end: ov - 1 },
      { label: 'Ovulação', start: ov - 1, end: ov + 1 },
      { label: 'Lútea', start: ov + 1, end: cycleLength },
    ]
  }
  return [
    { label: '1º trimestre', start: 0, end: 98 },
    { label: '2º trimestre', start: 98, end: 196 },
    { label: '3º trimestre', start: 196, end: TERM_DAY },
    { label: 'Puerpério', start: TERM_DAY, end: PREGNANCY_TOTAL_DAYS },
  ]
}

                                                     

export function landmarks(mode      , cycleLength        )             {
  if (mode === 'ciclo') {
    const ov = ovulationDay(cycleLength)
    return [
      { label: 'Menstruação', day: 0 },
      { label: 'Pico de estradiol', day: ov - 1.8 },
      { label: 'Pico de LH', day: ov - 0.6 },
      { label: 'Pico de progesterona', day: ov + 7 },
      { label: 'Luteólise', day: cycleLength - 2 },
    ]
  }
  return [
    { label: 'Ovulação', day: 14 },
    { label: 'Implantação', day: 22 },
    { label: 'Pico de hCG', day: HCG_PEAK_DAY },
    { label: 'Transição lúteo-placentária', day: 56 },
    { label: 'Parto', day: TERM_DAY - 0.5 },
    { label: 'Puerpério', day: TERM_DAY + 14 },
  ].sort((a, b) => a.day - b.day)
}

const DOPAMINE_NOTE =
  'A prolactina está sob inibição tônica da dopamina hipotalâmica (via túbero-infundibular); por isso permanece estável ao longo do ciclo.'

function cyclePhase(day        , cycleLength        )            {
  const ov = ovulationDay(cycleLength)
  const x = day - ov

  if (day < 5) {
    return {
      id: 'menstrual',
      title: 'Menstruação · fase folicular inicial',
      period: `Dias 1–5`,
      text: [
        'A regressão do corpo lúteo do ciclo anterior derrubou estradiol, progesterona e inibina A. Sem a retroalimentação negativa, o FSH sobe (janela de FSH) e recruta uma coorte de folículos antrais.',
        'A queda da progesterona causa vasoconstrição das arteríolas espiraladas e descamação da camada funcional do endométrio.',
      ],
      feedback: [
        { type: 'negativa', text: 'Fraca: estradiol e progesterona baixos liberam o FSH.' },
        { type: 'estímulo', text: 'GnRH pulsátil (a cada ~90 min) estimula FSH e LH na adeno-hipófise.' },
      ],
      ovary: 'Coorte de folículos antrais recrutados',
      gonadSubtitle: 'Células da granulosa começam a aromatizar androgênios',
    }
  }
  if (x < -4) {
    return {
      id: 'folicular-media',
      title: 'Fase folicular média',
      period: `Dias 6–${Math.max(6, ov - 4)}`,
      text: [
        'Seleção do folículo dominante. Teoria das duas células: o LH estimula a teca a produzir androgênios e o FSH induz a aromatase da granulosa, que os converte em estradiol.',
        'Estradiol e inibina B reduzem o FSH; os folículos menos sensíveis sofrem atresia. O endométrio entra na fase proliferativa.',
      ],
      feedback: [
        { type: 'negativa', text: 'Estradiol em concentração baixa a moderada e inibina B inibem o FSH.' },
        { type: 'estímulo', text: 'O folículo dominante ganha receptores de LH e passa a depender menos do FSH.' },
      ],
      ovary: 'Folículo dominante em crescimento',
      gonadSubtitle: 'Granulosa e teca produzem estradiol crescente',
    }
  }
  if (x < -1.5) {
    return {
      id: 'folicular-tardia',
      title: 'Fase folicular tardia · pico de estradiol',
      period: `Dias ${Math.max(6, ov - 3)}–${ov - 1}`,
      text: [
        'Estradiol acima de ~200 pg/mL mantido por ~36–48 h inverte a retroalimentação: neurônios de kisspeptina (região AVPV) aumentam a frequência do GnRH e a sensibilidade dos gonadotrofos. O pico de estradiol precede o pico de LH em ~24–36 h.',
        'O folículo pré-ovulatório (de Graaf) atinge ~20 mm e o endométrio fica trilaminar.',
      ],
      feedback: [
        { type: 'positiva', text: 'Estradiol alto e sustentado estimula o LH (e o FSH) — prepara o pico.' },
        { type: 'estímulo', text: 'Pulsos de GnRH mais frequentes (~a cada 60 min) favorecem a síntese de LH.' },
      ],
      ovary: 'Folículo pré-ovulatório (~20 mm)',
      gonadSubtitle: 'Estradiol no máximo; início da luteinização',
    }
  }
  if (x < 1) {
    return {
      id: 'ovulacao',
      title: 'Pico de LH e ovulação',
      period: `Dias ${ov}–${ov + 1}`,
      text: [
        'A ovulação ocorre ~36 h após o início do pico de LH (~10–12 h após o seu ápice): o oócito retoma a meiose I (até metáfase II), a granulosa luteiniza e enzimas proteolíticas rompem a parede folicular.',
        'Há um pico menor de FSH. O estradiol cai transitoriamente e a progesterona começa a subir. A ocitocina tem um discreto aumento e contribui para a contratilidade tubária e uterina.',
      ],
      feedback: [
        { type: 'positiva', text: 'Retroalimentação positiva do estradiol no auge: pico de LH ~10× o basal.' },
        { type: 'negativa', text: 'A progesterona emergente começa a desacelerar o gerador de pulsos.' },
      ],
      ovary: 'Ruptura folicular e liberação do oócito',
      gonadSubtitle: 'Folículo roto se transforma em corpo lúteo',
    }
  }
  if (x < 5) {
    return {
      id: 'lutea-inicial',
      title: 'Fase lútea inicial',
      period: `Dias ${ov + 2}–${ov + 5}`,
      text: [
        'O corpo lúteo, mantido pelo LH, produz progesterona e estradiol. A progesterona eleva a temperatura basal em ~0,3–0,5 °C (efeito termogênico hipotalâmico).',
        'O endométrio passa à fase secretora: glândulas tortuosas, acúmulo de glicogênio.',
      ],
      feedback: [
        { type: 'negativa', text: 'Progesterona reduz a frequência dos pulsos de GnRH (para a cada 3–4 h).' },
        { type: 'negativa', text: 'Estradiol + progesterona + inibina A suprimem FSH e LH.' },
      ],
      ovary: 'Corpo lúteo em formação',
      gonadSubtitle: 'Células luteínicas produzem progesterona',
    }
  }
  if (x < 10) {
    return {
      id: 'lutea-media',
      title: 'Fase lútea média · janela de implantação',
      period: `Dias ${ov + 6}–${ov + 10}`,
      text: [
        'Pico de progesterona ~7 dias após a ovulação, com segundo pico de estradiol. É a janela de implantação: um endométrio secretor receptivo aguarda o blastocisto.',
        DOPAMINE_NOTE,
      ],
      feedback: [
        { type: 'negativa', text: 'Retroalimentação negativa máxima: FSH e LH no nível mais baixo do ciclo.' },
        { type: 'estímulo', text: 'Sem gravidez, o LH basal não basta para manter o corpo lúteo além de ~14 dias.' },
      ],
      ovary: 'Corpo lúteo maduro',
      gonadSubtitle: 'Progesterona e estradiol no platô lúteo',
    }
  }
  return {
    id: 'lutea-tardia',
    title: 'Fase lútea tardia · luteólise',
    period: `Dias ${ov + 11}–${cycleLength}`,
    text: [
      'Sem hCG, o corpo lúteo regride (luteólise) e vira corpo albicans. Estradiol e progesterona caem, a temperatura basal volta ao basal e o endométrio entra em isquemia — o ciclo recomeça.',
      'A remoção da retroalimentação negativa permite que o FSH volte a subir já no fim deste ciclo, recrutando os folículos do próximo.',
    ],
    feedback: [
      { type: 'negativa', text: 'Retroalimentação negativa enfraquece à medida que os esteroides caem.' },
      { type: 'estímulo', text: 'Pulsos de GnRH voltam a acelerar com a queda da progesterona.' },
    ],
    ovary: 'Corpo lúteo em regressão',
    gonadSubtitle: 'Queda de progesterona e estradiol',
  }
}

function pregnancyPhase(day        , breastfeeding         )            {
  if (day < 14) {
    return { ...cyclePhase(day, 28), period: 'Semanas 0–2 (contadas desde a última menstruação)' }
  }
  if (day < 21) {
    return {
      id: 'fecundacao',
      title: 'Ovulação, fecundação e transporte',
      period: 'Semana 2–3',
      text: [
        'A fecundação ocorre na ampola da tuba uterina em até ~24 h após a ovulação. O zigoto se divide durante ~5 dias até chegar ao útero como blastocisto.',
        'Hormonalmente, este período é idêntico à fase lútea inicial: o corpo lúteo ainda depende do LH.',
      ],
      feedback: [{ type: 'negativa', text: 'Progesterona e estradiol lúteos suprimem FSH e LH.' }],
      ovary: 'Corpo lúteo (dependente de LH)',
      gonadSubtitle: 'Ainda sem placenta',
    }
  }
  if (day < 35) {
    return {
      id: 'implantacao',
      title: 'Implantação e reconhecimento materno da gravidez',
      period: 'Semanas 3–5',
      text: [
        'O blastocisto se implanta ~6–10 dias após a ovulação (geralmente 8–9). O sinciciotrofoblasto secreta hCG, análogo do LH, que se liga ao receptor de LH/hCG e resgata o corpo lúteo da luteólise.',
        'O β-hCG fica detectável no sangue ~8–10 dias após a ovulação e dobra a cada ~48 h. Não há menstruação: é o primeiro sinal clínico.',
      ],
      feedback: [
        { type: 'estímulo', text: 'hCG → corpo lúteo gravídico: mais progesterona e estradiol.' },
        { type: 'negativa', text: 'Esteroides crescentes suprimem o GnRH, o FSH e o LH: não há novo ciclo.' },
      ],
      ovary: 'Corpo lúteo gravídico (resgatado pelo hCG)',
      gonadSubtitle: 'Trofoblasto inicia secreção de hCG',
    }
  }
  if (day < 98) {
    const shift = day >= 49
    return {
      id: 'primeiro-trimestre',
      title: shift ? '1º trimestre · transição lúteo-placentária' : '1º trimestre · corpo lúteo gravídico',
      period: 'Semanas 5–13',
      text: shift
        ? [
            'Entre 7 e 9 semanas a placenta assume a produção de progesterona (transição lúteo-placentária). Antes disso, a retirada do corpo lúteo provoca abortamento; depois, não.',
            'O hCG atinge o pico em 8–11 semanas (~50.000–100.000 mUI/mL) e passa a cair. Por homologia com o TSH, estimula a tireoide e pode reduzir o TSH; níveis muito altos também se associam a náuseas e hiperêmese gravídica.',
          ]
        : [
            'O corpo lúteo gravídico, sustentado pelo hCG, é a principal fonte de progesterona, que mantém o endométrio transformado em decídua e o miométrio quiescente.',
            'O hCG sobe rapidamente rumo ao pico das 8–10 semanas.',
          ],
      feedback: [
        { type: 'negativa', text: 'Estradiol e progesterona muito altos mantêm FSH e LH suprimidos.' },
        { type: 'estímulo', text: shift ? 'Placenta produz progesterona a partir do colesterol materno.' : 'hCG mantém o corpo lúteo.' },
      ],
      ovary: shift ? 'Corpo lúteo em involução' : 'Corpo lúteo gravídico',
      gonadSubtitle: shift ? 'Placenta assume a esteroidogênese' : 'Corpo lúteo ainda é a principal fonte',
    }
  }
  if (day < 196) {
    return {
      id: 'segundo-trimestre',
      title: '2º trimestre · placenta dominante',
      period: 'Semanas 14–27',
      text: [
        'O hCG se estabiliza em ~10–20% do pico. A unidade feto-placentária produz estrogênios: o feto fornece DHEA-S (adrenal fetal) e a placenta o aromatiza — principalmente em estriol.',
        'Estrogênio estimula a hiperplasia dos lactotrofos (a hipófise aumenta de volume, podendo crescer até ~1/3 ou mais) e a prolactina sobe. A lactação ainda é bloqueada pela progesterona e estrogênio altos agindo na mama.',
      ],
      feedback: [
        { type: 'estímulo', text: 'Estrogênio placentário → hiperplasia de lactotrofos → prolactina crescente.' },
        { type: 'negativa', text: 'Gonadotrofinas permanecem suprimidas durante toda a gestação.' },
      ],
      ovary: 'Ovários quiescentes',
      gonadSubtitle: 'Placenta: progesterona, estrogênios, hCG e hPL',
    }
  }
  if (day < TERM_DAY - 1.5) {
    return {
      id: 'terceiro-trimestre',
      title: '3º trimestre · preparação para o parto',
      period: 'Semanas 28–40',
      text: [
        'O estrogênio aumenta os receptores de ocitocina, as junções comunicantes (conexina 43) e as prostaglandinas no miométrio. A progesterona mantém a quiescência uterina até perto do termo.',
        'O CRH placentário cresce exponencialmente e funciona como um "relógio" do parto. A prolactina se aproxima de ~200 ng/mL, preparando a lactogênese.',
      ],
      feedback: [
        { type: 'estímulo', text: 'Estrogênio sensibiliza o útero à ocitocina.' },
        { type: 'negativa', text: 'Progesterona ainda bloqueia a contração coordenada e a lactação.' },
      ],
      ovary: 'Ovários quiescentes',
      gonadSubtitle: 'Placenta no máximo de produção hormonal',
    }
  }
  if (day < TERM_DAY + 1.5) {
    return {
      id: 'parto',
      title: 'Trabalho de parto',
      period: 'Semana 40',
      text: [
        'Reflexo de Ferguson: a distensão do colo uterino envia sinais aferentes aos núcleos supraóptico e paraventricular, que liberam ocitocina na neuro-hipófise. A ocitocina intensifica as contrações, que distendem ainda mais o colo.',
        'A expulsão da placenta remove abruptamente a fonte de progesterona, estrogênio e hCG.',
      ],
      feedback: [
        { type: 'positiva', text: 'Distensão cervical → ocitocina → contração → mais distensão (até a expulsão).' },
        { type: 'estímulo', text: 'Prostaglandinas e ocitocina atuam juntas no miométrio.' },
      ],
      ovary: 'Ovários quiescentes',
      gonadSubtitle: 'Dequitação: retirada da placenta',
    }
  }
  if (breastfeeding) {
    return {
      id: 'puerperio-lactacao',
      title: 'Puerpério com amamentação',
      period: `Semanas 0–${Math.round((PREGNANCY_TOTAL_DAYS - TERM_DAY) / 7)} pós-parto`,
      text: [
        'A queda da progesterona libera a lactogênese II ("descida do leite") em 2–3 dias. A sucção do mamilo inibe os neurônios dopaminérgicos e mantém a prolactina alta, com picos a cada mamada.',
        'A mesma via aferente dispara a ocitocina na neuro-hipófise: contração das células mioepiteliais (ejeção do leite) e involução uterina.',
        'Prolactina e sucção inibem a kisspeptina e o GnRH: amenorreia lactacional.',
      ],
      feedback: [
        { type: 'estímulo', text: 'Sucção → ↓ dopamina → ↑ prolactina (produção de leite).' },
        { type: 'estímulo', text: 'Sucção → ocitocina (reflexo de ejeção do leite).' },
        { type: 'negativa', text: 'Prolactina alta suprime GnRH, LH e FSH: anovulação.' },
      ],
      ovary: 'Ovários em repouso (amenorreia lactacional)',
      gonadSubtitle: 'Sem placenta; esteroides muito baixos',
    }
  }
  return {
    id: 'puerperio-sem-lactacao',
    title: 'Puerpério sem amamentação',
    period: `Semanas 0–${Math.round((PREGNANCY_TOTAL_DAYS - TERM_DAY) / 7)} pós-parto`,
    text: [
      'Sem sucção, a dopamina volta a inibir os lactotrofos e a prolactina normaliza em ~3 semanas. A ocitocina retorna ao basal.',
      'O gerador de pulsos de GnRH se recupera: FSH sobe primeiro, depois o LH. A primeira ovulação costuma ocorrer entre 6 e 8 semanas (pode ser já com ~25 dias).',
    ],
    feedback: [
      { type: 'negativa', text: 'Dopamina restabelece a inibição tônica da prolactina.' },
      { type: 'estímulo', text: 'Retorno dos pulsos de GnRH reinicia o desenvolvimento folicular.' },
    ],
    ovary: 'Retomada do recrutamento folicular',
    gonadSubtitle: 'Esteroides voltam a subir com novos folículos',
  }
}

export function describePhase(mode      , day        , cycleLength        , breastfeeding         )            {
  return mode === 'ciclo' ? cyclePhase(day, cycleLength) : pregnancyPhase(day, breastfeeding)
}
