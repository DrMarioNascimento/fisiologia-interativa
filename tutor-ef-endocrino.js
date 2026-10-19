/* Unidade endócrina do Tutor EF. Carregada apenas por tutor-ef.html.
   Prof. Mário César Nascimento. PhD © */
(function () {
  'use strict';
  const query = new URLSearchParams(location.search);
  if (!location.pathname.endsWith('/tutor-ef.html') || query.get('percurso') === 'fisioterapia') return;

  const endocrineModules = [
    {
      "group": "endocrino",
      "title": "Hipotálamo, hipófise e eixos endócrinos",
      "href": "endocrino/index.html",
      "goal": "Relacionar sinais hipotalâmicos, adeno-hipófise, neuro-hipófise, órgãos-alvo e feedback.",
      "aliases": "endocrino sistema endocrino hormonios eixo hormonal GH IGF-1 GHRH somatostatina dopamina prolactina ADH vasopressina ocitocina sistema porta",
      "steps": [
        "Abra o mapa e diferencie adeno-hipófise de neuro-hipófise.",
        "Escolha um eixo e modifique apenas um estímulo ou uma função glandular.",
        "Acompanhe a resposta do órgão-alvo e explique o feedback antes de trocar de eixo."
      ],
      "qs": [
        {
          "q": "Como os hormônios hipotalâmicos reguladores chegam principalmente à adeno-hipófise?",
          "opts": [
            "Pelo sistema porta hipofisário",
            "Por axônios que terminam diretamente nos tireotrofos",
            "Pelos ductos das glândulas-alvo"
          ],
          "a": 0,
          "why": "O sistema porta leva sinais hipotalâmicos à adeno-hipófise. Axônios hipotalâmicos chegam à neuro-hipófise, onde liberam ADH e ocitocina."
        },
        {
          "q": "Qual combinação descreve corretamente o controle da secreção de GH?",
          "opts": [
            "GHRH estimula e somatostatina inibe",
            "GHRH inibe e somatostatina estimula",
            "TSH estimula e prolactina inibe"
          ],
          "a": 0,
          "why": "GHRH favorece a secreção de GH; somatostatina a reduz. O IGF-1 participa das ações de crescimento e do feedback negativo."
        },
        {
          "q": "Se a chegada de dopamina aos lactotrofos diminui, com essas células funcionais, a prolactina tende a:",
          "opts": [
            "Diminuir por perda de estímulo",
            "Aumentar por redução da inibição",
            "Permanecer igual porque só responde ao TSH"
          ],
          "a": 1,
          "why": "A dopamina exerce inibição tônica sobre a prolactina. Reduzir esse freio pode elevar a secreção, desde que os lactotrofos estejam funcionais."
        },
        {
          "q": "ADH e ocitocina são sintetizados principalmente:",
          "opts": [
            "Nas células dos órgãos-alvo",
            "Nas células da adeno-hipófise",
            "Em neurônios do hipotálamo"
          ],
          "a": 2,
          "why": "São produzidos por neurônios hipotalâmicos, transportados por axônios e armazenados e liberados na neuro-hipófise."
        },
        {
          "q": "Com função renal preservada, o aumento de ADH favorece:",
          "opts": [
            "Menor permeabilidade à água no ducto coletor",
            "Maior reabsorção de água no ducto coletor",
            "Maior excreção de água por retirada de aquaporinas"
          ],
          "a": 1,
          "why": "O ADH favorece a inserção de aquaporinas-2 na membrana apical das células principais, aumentando a reabsorção de água e a capacidade de concentrar a urina."
        },
        {
          "q": "No parto, a distensão do colo uterino pode desencadear um circuito em que:",
          "opts": [
            "A ocitocina reduz a contração e a distensão",
            "A prolactina substitui a ocitocina no miométrio",
            "A ocitocina intensifica contrações e pode ampliar o estímulo"
          ],
          "a": 2,
          "why": "É um exemplo de feedback positivo dependente do estímulo. O circuito difere do feedback negativo dos eixos e perde sua principal entrada quando termina a distensão associada ao parto."
        }
      ]
    },
    {
      "group": "endocrino",
      "title": "Ciclo menstrual e controle hormonal",
      "href": "endocrino/ciclo/index.html?modo=ciclo",
      "goal": "Integrar FSH, LH, estradiol e progesterona às fases ovarianas e endometriais.",
      "aliases": "ciclo menstrual ovario foliculo ovulacao fase folicular lutea corpo luteo estradiol progesterona endometrio GnRH FSH LH",
      "steps": [
        "Percorra o ciclo em repouso e identifique as fases folicular, ovulatória e lútea.",
        "Pause antes do pico de LH e depois da ovulação; compare estradiol e progesterona.",
        "Altere a duração do ciclo e explique o que é uma hipótese do modelo e o que varia na fisiologia real."
      ],
      "qs": [
        {
          "q": "Na fase folicular, o aumento do estradiol se relaciona principalmente:",
          "opts": [
            "Ao desenvolvimento dos folículos ovarianos",
            "À secreção do corpo lúteo já formado",
            "À produção placentária de hCG"
          ],
          "a": 0,
          "why": "O folículo em desenvolvimento produz estradiol. O corpo lúteo se forma após a ovulação; a placenta não participa de um ciclo menstrual sem gestação."
        },
        {
          "q": "Antes da ovulação, estradiol elevado e sustentado pode favorecer:",
          "opts": [
            "Supressão persistente de LH até o fim do ciclo",
            "Secreção de hCG pela adeno-hipófise",
            "Feedback positivo e pico de LH"
          ],
          "a": 2,
          "why": "No contexto pré-ovulatório, a elevação sustentada de estradiol pode mudar o sinal do feedback e favorecer o pico de LH. Isso não significa que todo aumento de estradiol produza feedback positivo."
        },
        {
          "q": "Após a ovulação, a principal fonte de progesterona no ciclo é:",
          "opts": [
            "A neuro-hipófise",
            "O folículo primordial",
            "O corpo lúteo"
          ],
          "a": 2,
          "why": "O corpo lúteo secreta progesterona, que participa da transformação secretora do endométrio e do feedback sobre o eixo reprodutivo."
        },
        {
          "q": "No modelo, a fase lútea é fixada em 14 dias. Ao passar de um ciclo de 28 para 35 dias, a ovulação representada fica:",
          "opts": [
            "Mais tarde, próxima do dia 21",
            "No dia 14 em ambos os ciclos",
            "Mais cedo, próxima do dia 7"
          ],
          "a": 0,
          "why": "O modelo usa dia de ovulação = duração do ciclo − 14. Essa regra organiza a simulação; não garante uma data individual de ovulação na vida real."
        },
        {
          "q": "Sem gestação, a regressão do corpo lúteo e a queda de progesterona e estradiol favorecem:",
          "opts": [
            "Manutenção indefinida do endométrio secretor",
            "Descamação endometrial e menstruação",
            "Aumento de hCG para iniciar um novo ciclo"
          ],
          "a": 1,
          "why": "A retirada do suporte esteroide contribui para a menstruação. A hCG está ligada ao início da gestação, não ao reinício habitual do ciclo."
        },
        {
          "q": "Ao ativar uma hipótese de exercício agudo neste simulador, uma conclusão adequada é:",
          "opts": [
            "Considerar comprovada uma nova data de ovulação",
            "Comparar as alterações ilustrativas sem prever fertilidade",
            "Usar a curva para definir um método contraceptivo"
          ],
          "a": 1,
          "why": "A hipótese de exercício modifica sinais ilustrativos, sem alterar a data da ovulação no programa. O recurso não prevê fertilidade nem orienta contracepção."
        }
      ]
    },
    {
      "group": "endocrino",
      "title": "Gestação, parto e puerpério",
      "href": "endocrino/ciclo/index.html?modo=gestacao",
      "goal": "Acompanhar hCG, transição lúteo-placentária, prolactina, ocitocina e retorno do eixo no puerpério.",
      "aliases": "gestacao gravidez placenta hCG corpo luteo parto puerperio amamentacao lactacao leite prolactina ocitocina",
      "steps": [
        "Abra o modo gestação e acompanhe a hCG no início e a produção placentária depois.",
        "Avance até o parto e separe a produção de leite da ejeção do leite.",
        "Compare o puerpério com e sem amamentação, sem transformar a curva em previsão contraceptiva."
      ],
      "qs": [
        {
          "q": "No início da gestação, a hCG contribui para:",
          "opts": [
            "Inibir diretamente a produção de progesterona",
            "Produzir a ejeção do leite nos alvéolos mamários",
            "Manter o corpo lúteo e sua produção de progesterona"
          ],
          "a": 2,
          "why": "A hCG sustenta a função do corpo lúteo no início da gestação. Esse suporte é importante antes de a placenta assumir a produção de esteroides."
        },
        {
          "q": "A transição lúteo-placentária corresponde:",
          "opts": [
            "À transferência progressiva da produção de esteroides para a placenta",
            "À transferência da síntese de ocitocina para o ovário",
            "Ao início de ciclos menstruais regulares na gestação"
          ],
          "a": 0,
          "why": "A placenta passa a sustentar a produção de esteroides durante a gestação. Não se trata de uma simples continuação dos ciclos menstruais."
        },
        {
          "q": "Qual associação distingue corretamente os dois hormônios da lactação?",
          "opts": [
            "Prolactina: produção; ocitocina: ejeção",
            "Prolactina: ejeção; ocitocina: produção",
            "Prolactina: contração uterina; ocitocina: síntese de hCG"
          ],
          "a": 0,
          "why": "A prolactina atua na produção de leite; a ocitocina contrai células mioepiteliais e favorece sua ejeção. A sucção participa da ativação dos dois processos."
        },
        {
          "q": "Após a saída da placenta, a queda de progesterona contribui para:",
          "opts": [
            "Impedir a ação mamária da prolactina",
            "Manter o corpo lúteo como fonte placentária de hCG",
            "Permitir a ativação da secreção abundante de leite"
          ],
          "a": 2,
          "why": "A retirada da progesterona placentária permite a lactogênese secretora, com ação da prolactina. Produção e ejeção continuam sendo processos diferentes."
        },
        {
          "q": "Com sucção frequente, a retomada do eixo reprodutivo no puerpério pode:",
          "opts": [
            "Antecipar-se obrigatoriamente para o primeiro dia após o parto",
            "Ser retardada pela redução da atividade pulsátil de GnRH",
            "Tornar-se independente do estímulo de amamentação"
          ],
          "a": 1,
          "why": "A amamentação pode suprimir a atividade pulsátil do eixo e retardar o retorno da ovulação. A intensidade e a duração variam; o simulador não determina proteção contraceptiva."
        },
        {
          "q": "Na contagem obstétrica usada pelo simulador, o início da idade gestacional é:",
          "opts": [
            "O momento do pico máximo de hCG",
            "O primeiro dia da última menstruação",
            "O dia em que a placenta assume a produção de esteroides"
          ],
          "a": 1,
          "why": "A idade gestacional é contada desde a última menstruação. Em um ciclo de referência, a fecundação ocorre depois; as duas contagens não são equivalentes."
        }
      ]
    },
    {
      "group": "endocrino",
      "title": "Tireoide: TRH, TSH, T4 e T3",
      "href": "endocrino/thyroid.html",
      "goal": "Interpretar o eixo tireoidiano e distinguir alterações primárias, centrais e estímulo por TRAb.",
      "aliases": "tireoide tireoidiano TRH TSH T4 T3 Hashimoto Graves TRAb iodo desiodases hipotireoidismo hipertireoidismo metabolismo",
      "steps": [
        "Observe o eixo em repouso: TRH → TSH → tireoide.",
        "Compare redução da função tireoidiana com redução da função central.",
        "Explore Graves e explique por que TSH baixo pode coexistir com produção tireoidiana elevada."
      ],
      "qs": [
        {
          "q": "Se a função da tireoide diminui e hipotálamo e hipófise permanecem funcionais, espera-se:",
          "opts": [
            "T4 reduzido e TSH aumentado por menor feedback",
            "T4 reduzido e TSH reduzido por feedback",
            "T4 aumentado e TSH aumentado por compensação"
          ],
          "a": 0,
          "why": "Na redução primária da função tireoidiana, a queda de T4/T3 retira parte do feedback negativo, permitindo elevação do estímulo de TSH."
        },
        {
          "q": "T4 baixo com TSH que não se eleva adequadamente sugere, como raciocínio de mecanismo:",
          "opts": [
            "Possível redução da estimulação central",
            "Compensação hipofisária preservada",
            "Aumento de TRAb como única explicação"
          ],
          "a": 0,
          "why": "Uma alteração hipotalâmica ou hipofisária pode impedir a resposta compensatória adequada de TSH. A questão trata do mecanismo; a interpretação clínica exige contexto e exames apropriados."
        },
        {
          "q": "Na doença de Graves representada no modelo, os TRAb estimuladores:",
          "opts": [
            "Impedem a síntese de TRH no hipotálamo como ação principal",
            "Ativam o receptor de TSH na tireoide",
            "Transformam T3 diretamente em TSH"
          ],
          "a": 1,
          "why": "Os anticorpos estimulam o receptor tireoidiano de TSH. Assim, a glândula pode continuar estimulada enquanto o TSH hipofisário está suprimido pelo feedback."
        },
        {
          "q": "A conversão periférica de T4 em T3 envolve principalmente:",
          "opts": [
            "Desiodases",
            "Lactotrofos",
            "Receptores de ocitocina"
          ],
          "a": 0,
          "why": "Desiodases participam da conversão de T4 em T3 e de outras vias de metabolismo dos hormônios tireoidianos. TSH regula a tireoide, mas não é a enzima de conversão."
        },
        {
          "q": "O iodo é importante para o eixo porque:",
          "opts": [
            "Substitui o TSH nos receptores hipofisários",
            "Integra a síntese dos hormônios tireoidianos",
            "Transporta TRH pelo sistema porta"
          ],
          "a": 1,
          "why": "O iodo participa da formação de T4 e T3. A disponibilidade de substrato e o estímulo hormonal são componentes diferentes da produção tireoidiana."
        },
        {
          "q": "Quando T4/T3 aumentam por uma fonte tireoidiana, o feedback negativo tende a:",
          "opts": [
            "Elevar apenas TSH para manter a produção",
            "Elevar TRH e TSH",
            "Reduzir TRH e TSH"
          ],
          "a": 2,
          "why": "Os hormônios tireoidianos limitam o estímulo hipotalâmico e hipofisário. Isso ajuda a explicar TSH baixo diante de excesso de hormônio tireoidiano."
        }
      ]
    },
    {
      "group": "endocrino",
      "title": "Ciclo de vida da mulher — transição menopausal",
      "href": "endocrino/menopausa/index.html",
      "goal": "Relacionar reserva folicular, variabilidade do estradiol, inibina, FSH e ciclos anovulatórios.",
      "aliases": "menopausa perimenopausa pos-menopausa climaterio reserva ovariana reserva folicular inibina B FSH LH estradiol progesterona anovulacao",
      "steps": [
        "Comece na fase reprodutiva e avance pelas etapas da transição.",
        "Compare variabilidade do estradiol, FSH e ocorrência de ovulação.",
        "Explique a redução do feedback ovariano e diferencie perimenopausa de menopausa."
      ],
      "qs": [
        {
          "q": "Na perimenopausa, o estradiol deve ser interpretado como:",
          "opts": [
            "Um sinal que cai de forma linear em todos os ciclos",
            "Um sinal invariavelmente ausente desde a primeira irregularidade",
            "Um sinal variável, que ainda pode apresentar picos elevados"
          ],
          "a": 2,
          "why": "A transição pode incluir grandes oscilações e ciclos com produção preservada ou elevada de estradiol. Um único valor não descreve toda a trajetória."
        },
        {
          "q": "A redução de inibina B contribui para a elevação de FSH porque:",
          "opts": [
            "Transforma progesterona em FSH no ovário",
            "Reduz uma inibição exercida sobre a hipófise",
            "Aumenta diretamente a reserva folicular"
          ],
          "a": 1,
          "why": "A inibina B participa do feedback que limita FSH. Sua redução pode permitir aumento de FSH mesmo antes de uma queda persistente de estradiol."
        },
        {
          "q": "No contexto da transição natural e sem outra causa de amenorreia, a menopausa é reconhecida retrospectivamente após:",
          "opts": [
            "Três meses com ciclos irregulares",
            "Doze meses sem menstruar",
            "Um único resultado de FSH elevado"
          ],
          "a": 1,
          "why": "O marco é reconhecido após 12 meses de amenorreia sem outra causa. Perimenopausa é a transição e pode incluir menstruação e ovulação intermitentes."
        },
        {
          "q": "Em um ciclo anovulatório, a elevação lútea de progesterona tende a ser menor porque:",
          "opts": [
            "Não se forma um corpo lúteo funcional após ovulação",
            "O estradiol passa a ser convertido diretamente em FSH",
            "A neuro-hipófise deixa de produzir progesterona"
          ],
          "a": 0,
          "why": "A progesterona lútea depende principalmente do corpo lúteo. Sem ovulação, falta o padrão típico de formação e atividade dessa estrutura."
        },
        {
          "q": "Na pós-menopausa, FSH elevado com baixa produção ovariana se explica principalmente por:",
          "opts": [
            "Menor feedback de hormônios ovarianos e inibinas",
            "Aumento sustentado de hCG placentária",
            "Secreção de FSH pelo próprio ovário"
          ],
          "a": 0,
          "why": "Com menor produção ovariana de esteroides e inibinas, diminui o freio sobre o eixo. FSH é secretado pela adeno-hipófise, não pelo ovário."
        },
        {
          "q": "Diante de ciclos irregulares na perimenopausa, uma interpretação adequada é:",
          "opts": [
            "Toda ovulação já cessou definitivamente",
            "Pode haver ovulação em alguns ciclos",
            "Todo ciclo passou a durar exatamente 28 dias"
          ],
          "a": 1,
          "why": "A irregularidade não significa ausência definitiva de ovulação. O modelo inclui trajetórias com ciclos ovulatórios e anovulatórios, sem prever fertilidade individual."
        }
      ]
    },
    {
      "group": "endocrino",
      "title": "Cortisol: estresse, sono e exercício",
      "href": "endocrino/cortisol.html",
      "goal": "Integrar eixo HHA, vias autonômicas e ritmo biológico; separar resposta aguda de exposição persistente.",
      "aliases": "cortisol ACTH CRH HHA adrenal estresse sono circadiano despertar CAR catecolaminas exercicio proteina energia glicocorticoide exogeno",
      "reading": "assets/leituras/Cortisol_Guia_Visual_Prof_Mario_Nascimento.pdf?v=20261019",
      "steps": [
        "Compare as vias HHA, adrenomedular e autonômica no mapa.",
        "Altere um evento e observe os atrasos em relação ao basal do mesmo horário.",
        "Use 28 dias para observar retirada no dia 15 e separe cortisol endógeno de sinal efetivo."
      ],
      "qs": [
        {
          "q": "Qual associação distingue corretamente as duas regiões da adrenal?",
          "opts": [
            "ACTH → medula → cortisol; simpático → córtex → catecolaminas",
            "ACTH → córtex → cortisol; simpático → medula → catecolaminas",
            "CRH → medula → cortisol; TSH → córtex → catecolaminas"
          ],
          "a": 1,
          "why": "O ACTH estimula o córtex adrenal. A medula recebe estímulo simpático pré-ganglionar e libera catecolaminas; as duas vias não são uma única sequência."
        },
        {
          "q": "Após um evento agudo no modelo, qual relação temporal é mais coerente?",
          "opts": [
            "Cortisol precisa atingir o pico antes da resposta autonômica",
            "Todas as variáveis devem mudar sem nenhum atraso",
            "Índices autonômicos podem responder antes do pico de cortisol"
          ],
          "a": 2,
          "why": "As vias neurais são mais rápidas que a resposta hormonal do eixo HHA. O modelo ilustra essa diferença, sem reproduzir medidas neurais em segundos."
        },
        {
          "q": "Para comparar cortisol após exercícios feitos em horários diferentes, primeiro é necessário:",
          "opts": [
            "Usar o pico para calcular perda de massa muscular",
            "Ignorar a fase circadiana e comparar apenas os picos",
            "Comparar com a referência do mesmo horário"
          ],
          "a": 2,
          "why": "O valor absoluto contém o ritmo basal e a resposta ao evento. Comparar o mesmo horário ajuda a separar esses componentes; um pico não demonstra perda muscular."
        },
        {
          "q": "A resposta de cortisol ao despertar (CAR) corresponde:",
          "opts": [
            "A uma elevação adicional associada ao despertar",
            "A toda a secreção de cortisol das 24 horas",
            "A uma medida direta de força muscular"
          ],
          "a": 0,
          "why": "A CAR é uma elevação adicional, frequentemente nos primeiros 30–45 minutos após o despertar. Não é sinônimo de todo o ritmo circadiano da manhã."
        },
        {
          "q": "Ao modificar apenas energia, proteína ou componente resistido neste simulador, espera-se:",
          "opts": [
            "Uma estimativa quantitativa de hipertrofia",
            "Uma queda calculada de cortisol por aumento de proteína",
            "Mudança do contexto declarado, sem efeito direto nas curvas"
          ],
          "a": 2,
          "why": "Esses controles são informações de contexto. O programa não calcula balanço proteico, massa, força nem adaptações de treinamento."
        },
        {
          "q": "Durante sinal glicocorticoide exógeno persistente, é possível observar:",
          "opts": [
            "Ausência de feedback sobre o eixo",
            "Aumento obrigatório de ACTH e de cortisol endógeno",
            "Sinal efetivo elevado e cortisol endógeno reduzido"
          ],
          "a": 2,
          "why": "O sinal externo pode aumentar a ação efetiva e suprimir o estímulo central. Produção endógena e sinal efetivo são variáveis diferentes; a retirada é ilustrativa, sem esquema de desmame."
        }
      ]
    }
  ];

  maps.endocrino = {src:'assets/maps/sistema-endocrino.webp', title:'Sistema Endócrino — hormônios, tempo e feedback'};
  if (!axes.some(axis => axis.id === 'endocrino')) axes.push({id:'endocrino', label:'Endócrino'});
  for (const item of endocrineModules) if (!modules.some(existing => existing.href === item.href)) modules.push(item);
  window.educacaoFisicaTutor = {
    courseLabel:'Educação Física', defaultAxis:'celular', maps, modules,
    axisNames:{celular:'01 Celular e potenciais de ação', muscular:'02 Excitabilidade e sistema muscular', osteoarticular:'03 Osteoarticular', cardiovascular:'04 Cardiovascular', respiratorio:'05 Respiratório', integracao:'Integração cardiorrespiratória — Unidades 4 e 5', endocrino:'06 Sistema Endócrino'}
  };
  const requested = query.get('eixo');
  if (axes.some(axis => axis.id === requested)) active = requested;
  renderAxes(); renderCards();
  const setEndocrineColor = () => { if (active === 'endocrino') document.documentElement.style.setProperty('--c','#D795FF'); };
  axesEl.addEventListener('click',setEndocrineColor);
  setEndocrineColor();
})();
