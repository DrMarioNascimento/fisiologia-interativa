# Transição menopausal — Unidade 06, Educação Física

Simulador estático independente, baseado na apresentação do ciclo menstrual, com os mesmos cards, controles, assinatura e ilustração endometrial.

## Escopo

Fase reprodutiva, perimenopausa inicial/tardia, menopausa como marco retrospectivo e pós-menopausa. A etapa “menopausa” mostra o estado ao completar 12 meses de amenorreia; não trata a menopausa como fase adicional entre a transição e a pós-menopausa. O critério menstrual é contextual, não diagnóstico automatizado.

## Comparação e intervenção

Dois estados são integrados pelo mesmo modelo: referência sem intervenção e experimento. Cada concentração de E2, P4, FSH e LH pode ser pinçada separadamente. Pinçamento não é dose, tratamento ou prescrição. Trocar a etapa limpa todas as intervenções e o histórico. Reiniciar o tempo conserva as imposições; restaurar remove todas.

## Relações representadas

- Produção ovariana limitada pela etapa e pela disponibilidade funcional de folículos.
- Retroalimentação de E2 e P4 nas gonadotrofinas e ação seletiva da inibina B no FSH.
- Pico de LH condicionado à janela folicular e E2 sustentado; P4 alta ou LH insuficiente podem impedir ovulação no modelo.
- Progesterona ovariana dependente da ocorrência de ovulação e estímulo de LH.
- Respostas endometriais à exposição, combinação e retirada hormonal, com atraso temporal.
- Índice ilustrativo de reabsorção óssea dependente do sinal estrogênico; não representa densidade, diagnóstico ou risco de fratura.

## Limitações materiais

Modelo híbrido: trajetórias foliculares predefinidas por etapa e equações reduzidas de retroalimentação, com passo máximo de 0,05 dia e relaxação exponencial. Faixas, ganhos e constantes de tempo são escolhas didáticas; não foram ajustados nem validados para previsão clínica. Ovulação está restrita às janelas das trajetórias predefinidas. Não há criação de folículos, farmacocinética, doses, estrona/androgênios, sintomas individualizados, progressão automática do envelhecimento, gravidez, histologia diagnóstica ou previsão de sangramento. Não é um “gêmeo digital” fisiológico.

Perimenopausa: padrões determinísticos de intervalos e amplitudes variáveis exemplificam a heterogeneidade; não são um calendário universal. Pós-menopausa: níveis residuais de E2 representam produção extraovariana e não regeneração folicular. A espessura endometrial é uma saída ilustrativa, sem equivalência ultrassonográfica.

## Referências

- STRAW+10: https://pmc.ncbi.nlm.nih.gov/articles/PMC3580996/
- Hall, Endocrinology of the Menopause: https://pmc.ncbi.nlm.nih.gov/articles/PMC6983294/
- NICE NG23: https://www.nice.org.uk/guidance/ng23/chapter/Recommendations

## Verificação

`node --test endocrino/menopausa/tests.mjs`: 13 grupos, incluindo etapas, ovulação/anovulação, feedback, resposta pós-menopausal, combinações E2/P4, extremos, retirada de intervenções, estado da interface, restauração e assinatura. Os testes verificam coerência interna e direção das respostas; não estabelecem validade clínica quantitativa.

Assinatura: Simuladores interativos utilizados nas disciplinas de Fisiologia Humana do Prof. Dr. Mário César Nascimento ©
