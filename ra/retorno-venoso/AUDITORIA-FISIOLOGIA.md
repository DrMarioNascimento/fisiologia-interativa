# Revisão de postura, pressões e sincronização

O modelo demonstra hidrostática, válvulas e bomba muscular. Não resolve a circulação completa, o débito cardíaco ou a curva de retorno venoso de Guyton.

## Pressões e unidades

O cálculo usa densidade sanguínea de 1.060 kg/m³, gravidade de 9,80665 m/s² e 133,322387415 Pa/mmHg: 0,779693 mmHg por cm de coluna vertical. A conversão é 1 mmHg = 1,35951 cmH₂O. A inclinação entra pelo seno, aplicado ao desnível anatômico.

A referência didática é 10 mmHg no diafragma, a 118 cm do solo. Em pé e em repouso, resulta em aproximadamente 92,65 mmHg no tornozelo, 43,53 na coxa e 2,20 na altura do coração. Todas as regiões usam a mesma referência; no decúbito, ficam em 10 mmHg. A extrapolação na jugular, a 150 cm, é negativa em pé e é apresentada como veia colabada, sem tratá-la como pressão negativa sustentada.

O card “Coração (ref.)” apresenta essa referência hidrostática regional, não uma previsão clínica da pressão venosa central. Um modelo completo precisaria representar redistribuição sanguínea, complacência central e função cardíaca.

Válvulas competentes, sozinhas, não eliminam a pressão hidrostática estática em pé. As três válvulas do nível Válvula abrem na fase de ejeção da caminhada e fecham na fase de relaxamento, demonstrando o bloqueio do refluxo. Em repouso, a representação fica aberta para fluxo basal. Os valores entre os marcos são desníveis hidrostáticos, não perdas de pressão nas válvulas; o segmento de 12 a 56 cm totaliza 34,31 mmHg em pé.

## Bomba, volume e relógio

O ciclo muscular dura 1,15 s. A atividade aproxima a pressão média distal de 25 mmHg, com constante de tempo de 2,4 s na ativação e 7 s no reenchimento. São aproximações didáticas, não picos de pressão intramuscular nem medidas individualizadas. O efeito é pleno até o joelho e diminui suavemente até zero na coxa; não se atribui à caminhada uma queda da pressão média na coxa.

Cores venosas, distensão e volume estimado usam o mesmo campo de pressão. A referência de volume de 600 mL é uma calibração demonstrativa; o modelo não fecha um balanço sanguíneo de toda a circulação. As cores venosas indicam pressão, não oxigenação. As artérias conservam sua identificação visual.

Coração (66 bpm de referência), partículas, bomba, válvulas e histórico acompanham o tempo simulado. Pausa e velocidade afetam esse relógio; mudar postura durante a pausa atualiza as pressões e cores sem avançar a animação.

## Apresentação e validação

O corpo e o contorno conservam as malhas, materiais e shaders aprovados. A geometria e os materiais da Bomba permanecem iguais, inclusive em sete fases de comparação. O enquadramento dos níveis Corpo e Ciclo usa os vértices reais do corpo para centralizar e ampliar a vista, respeitando os limites no celular.

A experiência abre em pé, vista de perfil. Corpo e Ciclo reclinam no plano sagital, com a cabeça para trás e a face para cima no decúbito dorsal; a exportação RA usa a mesma postura. O gráfico projeta a silhueta aprovada de perfil, dimensionada à largura disponível: vertical em pé, horizontal no decúbito e inclinada nas posições intermediárias. As barras, o indicador do tornozelo e os desníveis valvulares identificam pressões em mmHg e cmH₂O; o gráfico temporal usa as duas escalas equivalentes. As barras não representam um ângulo de tilt. O ponto verde identifica o diafragma como referência hidrostática.

A verificação automatizada cobre fórmulas e unidades, válvulas, efeito regional da bomba, relógio cardíaco, cores, reenchimento, pausa, enquadramento em três posturas e dois tamanhos de tela, comparação das malhas protegidas e exportação GLB. A câmera de realidade aumentada exige dispositivo e navegador compatíveis.

## Referências consultadas

- [NCBI Bookshelf — Venous Insufficiency](https://www.ncbi.nlm.nih.gov/books/NBK534256/): pressão estática em pé, válvulas e bomba muscular.
- [PubMed — Hydrostatic and venous pressure indifference points](https://pubmed.ncbi.nlm.nih.gov/24481962/): distinção entre referência hidrostática e resposta venosa à postura.
- [PubMed — Ambulatory venous pressure](https://pubmed.ncbi.nlm.nih.gov/11173991/): redução da pressão durante atividade e recuperação.
- [Calf muscle pump and venous hemodynamics](https://pmc.ncbi.nlm.nih.gov/articles/PMC3699225/): pressão média na coxa e ação da bomba da panturrilha.
- [Central venous pressure assessment](https://pmc.ncbi.nlm.nih.gov/articles/PMC11699050/): contexto clínico da pressão venosa central, distinto da referência simplificada do modelo.
