# Auditoria dos simuladores endócrino e tireoidiano — 19/10/2026

Os simuladores permanecem separados, com o mesmo núcleo tireoidiano (`thyroid-model.js`, versão `hht-shared-20261019`). O integrado acrescenta influências da haste, adeno-hipófise, somatostatina e glicocorticoides; o aprofundamento expõe síntese, compartimentos e reservas. Resultados só são comparáveis com entradas, estado inicial e tempo equivalentes.

## Revisão fisiológica

| Situação | Critério qualitativo | Resultado da revisão |
| --- | --- | --- |
| Basal | Manutenção de T4, T3 e TSH sem intervenção | Estacionário; verificado até 365 dias no integrado |
| Falha primária | Queda de T4 e compensação por TSH | Preservada; Hashimoto crônico inicia com reservas proporcionais e pré-estabilização, como no aprofundamento |
| Falha central | Queda de T4 sem resposta compensatória adequada de TSH | Preservada; a fase inicial não é rotulada como hipertireoidismo subclínico |
| Graves | Estímulo do receptor independente de TSH, aumento hormonal e supressão central | Preservado; o parâmetro representa apenas atividade estimulante de anticorpos |
| Bloqueio de TPO | Redução de nova síntese, sem eliminação instantânea das reservas | Preservado; removida promessa de normalização com um bloqueio fixo |
| Tireoidectomia | Ausência de tecido e reservas glandulares; conversão de T4 residual persiste | Preservada no cenário específico; reduzir um controle de capacidade durante um experimento não recria cirurgia |
| Lesão destrutiva | Vazamento de estoques finitos seguido de perda funcional | Preservado; permanente e reversível são distinguidos; não há regeneração fictícia do tecido perdido |
| T4 exógeno | Entrada fornece substrato para T3 e modifica feedback | Preservado; sem equivalência de dose ou garantia de normalização |
| Menor conversão periférica | Redução de T3 e de uma parcela da depuração de T4 | Preservada; adaptação periférica separada do sensor central |
| Falha da haste/adeno-hipófise | Comprometimento dos eixos e relações preservadas | Testes de regressão dos outros eixos aprovados |

“Dentro do esperado” significa coerência de mecanismo e direção da resposta. Não significa validação de valores absolutos, amplitudes ou tempos de recuperação. A escala laboratorial do integrado é conceitual; o aprofundamento usa índices relativos. Constantes e limiares não foram ajustados a séries clínicas humanas.

## Evidência diária

- Zhang 2023, DOI 10.1093/labmed/lmac105: seis medianas por grupo; 17 homens e 14 mulheres. Marcadores identificam horários publicados. Interpolação e fechamento assumido são identificados. FT3/FT4 não tiveram diferenças intradiárias significativas nessa amostra.
- Russell 2008, DOI 10.1210/jc.2007-2674: cosinor coletivo reconstruído dos parâmetros da tabela 2, sem separar o grupo misto por sexo. Amplitudes relativas coletivas de TSH, FT3 e FT4: 24,66%, 3,45% e 0,60%. Não se usaram as médias das amplitudes individuais para construir a curva.
- Rose 1989, DOI 10.1210/jcem-68-6-1086, e Mantagos 1992, DOI 10.1210/jcem.74.1.1727831: resumos de extremos e janelas pediátricas. Sem série contínua recuperada, nenhuma curva horária foi criada.
- Não há multiplicadores universais de sexo, fase menstrual ou idade. Não se aplica curva saudável a doenças. CV não é convertido em amplitude e intervalos marginais não viram bandas de confiança.
- CSV distingue fonte, população, referência e origem. Exportações do modelo incluem versão, parâmetros por amostra e natureza conceitual dos valores.

## Verificação reproduzível

`node --test endocrino/tests.mjs`: 27 testes aprovados, incluindo todos os cenários, controles extremos, 64 combinações reproduzíveis, estado basal até 365 dias, convergência numérica, conservação hídrica, troca de cenário, pausa/reinício e CSV. As verificações de estado percorrem o novo compartimento tireoidiano; tempo e acumuladores de iodeto não são confundidos com variáveis estacionárias.

`node endocrino/thyroid-evidence-tests.mjs`: 47 verificações aprovadas, incluindo conservação glandular de iodeto, ausência de secreção após remoção, lesão destrutiva, resposta à reposição, comparação exata do núcleo em entradas equivalentes, preservação dos pontos publicados, fases/amplitudes do cosinor, unidades e rejeição de curva pediátrica não identificável. Resultado: `auditoria-tireoide-20261019.json`.

Auditoria longitudinal adicional: 34 cenários do integrado em 0,1, 1, 7, 30, 90 e 365 dias, com estados e indicadores finitos. Limites hídricos interrompem o tempo onde necessário; valores mantidos no limite não são apresentados como equilíbrio validado.

A prévia foi inspecionada em desktop e celular. Verificaram-se carregamento sem erros de JavaScript, troca de estudo, unidades nativas, referência às 08h, modo de experimento, cenário cirúrgico, avanço do tempo, tabelas e escolha dos hormônios. O painel pediátrico usa uma coluna para evitar espaço lateral desnecessário. Os avisos correspondem ao método do estudo selecionado.

## Limites remanescentes

Modelo didático qualitativo, sem validação externa de concentrações ou tempos. Não reproduz pulsos, farmacocinética individual, TBG/fração livre dinâmica, rT3, todas as doenças tireoidianas, gestação ou curvas individuais de crianças. A aprovação dos testes não substitui validação científica independente. Fontes, valores extraídos e limites de acesso estão no guia visual de 14 páginas, disponível na leitura complementar da Unidade 06.
