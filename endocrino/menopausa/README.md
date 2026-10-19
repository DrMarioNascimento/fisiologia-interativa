# Transição menopausal — Unidade 06, Educação Física

## Manutenção e origem — 19 de outubro de 2026

Este módulo integra a Unidade 06 — Sistema Endócrino, exclusiva do percurso EF. O catálogo vigente está em `inicio/dados-ef.js`, na raiz do projeto, e as questões da unidade em `tutor-ef-endocrino.js`. A integração cardiorrespiratória permanece em seção própria. Não há sala endócrina de Escape Room cadastrada.

Consulte o [README principal](../../README.md) e a [licença da raiz](../../LICENSE.md). Créditos e licenças específicos deste módulo permanecem nos documentos abaixo.

Simulador estático independente, baseado na apresentação do ciclo menstrual, com os mesmos cards, controles, assinatura e ilustração endometrial.

## Escopo

Fase reprodutiva, perimenopausa inicial/tardia, menopausa como marco retrospectivo e pós-menopausa. A etapa “menopausa” mostra o estado ao completar 12 meses de amenorreia; não trata a menopausa como fase adicional entre a transição e a pós-menopausa. O critério menstrual é contextual, não diagnóstico automatizado.

## Comparação e intervenção

Dois estados são integrados pelo mesmo modelo: referência sem intervenção e experimento. Cada concentração de E2, P4, FSH e LH pode ser pinçada separadamente. Pinçamento não é dose, tratamento ou prescrição. Trocar a etapa limpa todas as intervenções e o histórico. Reiniciar o tempo conserva as imposições; restaurar remove todas.

## Relações representadas

- Produção ovariana limitada pela etapa e pela disponibilidade funcional de folículos.
- Retroalimentação de E2 e P4 nas gonadotrofinas e ação seletiva da inibina B no FSH.
- Produção ovariana de E2 dependente de FSH e substrato estimulado por LH.
- Maturação folicular e relógio ovariano sensíveis a FSH; pico endógeno de LH condicionado à maturação e E2 sustentado por pelo menos 1,5 dia, com P4 baixa. Os limiares são didáticos.
- Progesterona lútea acompanha o tempo real desde a ovulação e o suporte por LH.
- Progesterona ovariana dependente da ocorrência de ovulação e estímulo de LH.
- Memória do preparo estrogênico e diferenciação secretora gradual; oposição progesterônica ao crescimento. Retirada requer tecido preparado e diferenciado, além de queda de P4.
- Ilustração de maturação folicular e corpo lúteo vinculada aos estados do experimento.
- Tendência óssea exclusivamente qualitativa conforme a exposição estrogênica; sem multiplicador ou estimativa de reabsorção, densidade ou risco.

## Limitações materiais

Modelo híbrido: trajetórias foliculares predefinidas por etapa e equações reduzidas de retroalimentação, com passo máximo de 0,05 dia e relaxação exponencial. Faixas, ganhos e constantes de tempo são escolhas didáticas; não foram ajustados nem validados para previsão clínica. O recrutamento/disponibilidade por episódio continua predefinido. O ritmo ovariano responde ao FSH; a maturação e o LH determinam o instante da ovulação, com idade lútea independente do calendário. Não há população folicular completa nem calibração clínica. Não há criação de folículos, farmacocinética, doses, estrona/androgênios, sintomas individualizados, progressão automática do envelhecimento, gravidez, histologia diagnóstica ou previsão de sangramento. Não é um “gêmeo digital” fisiológico.

Perimenopausa: padrões determinísticos de intervalos e amplitudes variáveis exemplificam a heterogeneidade; não são um calendário universal. Pós-menopausa: níveis residuais de E2 representam produção extraovariana e não regeneração folicular. A espessura endometrial é uma saída ilustrativa, sem equivalência ultrassonográfica.

## Referências

- STRAW+10: https://pmc.ncbi.nlm.nih.gov/articles/PMC3580996/
- Hall, Endocrinology of the Menopause: https://pmc.ncbi.nlm.nih.gov/articles/PMC6983294/
- NICE NG23: https://www.nice.org.uk/guidance/ng23/chapter/Recommendations

## Verificação

`node --test endocrino/menopausa/tests.mjs`: 23 grupos, incluindo etapas, ovulação/anovulação, feedback, resposta pós-menopausal, combinações E2/P4, extremos, retirada de intervenções, estado da interface, restauração e assinatura. Os testes verificam coerência interna e direção das respostas; não estabelecem validade clínica quantitativa.

Assinatura: Simuladores interativos utilizados nas disciplinas de Fisiologia Humana do Prof. Dr. Mário César Nascimento ©

## Correções da auditoria de 18/10/2026

Regressões adicionadas: LH nulo com FSH disponível; E2 isolado versus E2/P4; ausência de transformação secretora instantânea; preparo estrogênico seguido de P4 sem E2; ausência de descamação sem preparo; retirada após diferenciação; FSH nulo com LH alto; alteração do ritmo por FSH; ovulações reprodutivas sucessivas; idade do corpo lúteo; integração fracionada; dependência do preparo estrogênico para a supressão central pela P4. Mantidos repetir, CSV pareado e restauração.

A referência sem intervenção usa o mesmo motor: não constitui validação experimental independente. A matriz testa mecanismos e coerência, não precisão individual. Os parâmetros permanecem escolhas educacionais.

Referências humanas específicas para os mecanismos corrigidos:
- Papel de LH na esteroidogênese: https://pubmed.ncbi.nlm.nih.gov/9589647/
- Preparo estrogênico e transformação secretora: https://pubmed.ncbi.nlm.nih.gov/1730810/
- Oposição progesterônica no endométrio (PEPI): https://pubmed.ncbi.nlm.nih.gov/8569016/
