# Auditoria funcional e fisiológica — 18/10/2026

Revisão da versão publicada pelo PR #67, seguida de correções no módulo estático `endocrino/`. O projeto v0 em `origem-v0/` permanece como registro da importação; o módulo publicado usa os arquivos desta pasta e `src/`.

## Cobertura e evidências

- 34 cenários em seis momentos: 0,1; 1; 7; 30; 90; 365 dias (204 observações), reproduzíveis por `node audit-run.mjs` e registradas em [auditoria-20261018.json](auditoria-20261018.json).
- 25 grupos de testes em `node --test tests.mjs`, cobrindo mecanismos, sinais das respostas, casos clássicos, conservação de massa, transientes, comandos e exportação.
- 35 parâmetros nos dois extremos admitidos (70 experimentos) e 64 combinações com semente fixa 20261018.
- Estabilidade basal por 365 dias e comparação entre etapas numéricas de 0,005 e 0,0025 dia nos casos críticos (diferença relativa tolerada de 2,5%).
- A existência de valores finitos, isoladamente, não foi considerada evidência de correção fisiológica: foram testadas também relações causais e interpretações concorrentes.

## Falhas confirmadas e correções

| Achado | Correção e verificação |
|---|---|
| Falha central precoce podia aparecer como hipertireoidismo subclínico | O contexto central e a sequência de queda de TSH/T4 precedem o rótulo; testado de 0,1 a 30 dias. |
| Redução isolada da conversão T4→T3 podia ser confundida com falência primária | Interpretação distingue menor conversão, contexto de doença sistêmica e capacidade da tireoide. |
| T4/TSH altos podiam inferir tumor não implementado | Apresenta o padrão combinado e a possibilidade de atraso da retroalimentação; não afirma adenoma. |
| ACTH podia compensar excessivamente perda central de reserva | Ganho compensatório limitado pela reserva corticotrófica e integridade da haste; o mesmo princípio foi aplicado ao braço tireoidiano. |
| ACTH zerado ainda mantinha cortisol por um piso artificial | O piso numérico foi retirado da resposta adrenal; perda completa de corticotrofos leva os dois a valores próximos de zero. |
| Sucção aumentava dopamina enquanto o texto dizia que a inibia | Introduzida inibição de secreção dopaminérgica pela sucção; PRL, OT e potencial de ejeção aumentam com dopamina reduzida. |
| A alça curta de GH e a inibição tireotrófica por somatostatina eram descritas, mas não operavam | Ambas passaram a atuar, com regressões direcionais e estabilidade basal. |
| Haste zerada ainda liberava ADH/OT por uma fração residual fixa | O transporte acompanha a integridade da haste; interrupção completa impede essa liberação. Não se simulam as fases transitórias de lesão axonal. |
| SIADH inicial podia aparecer em equilíbrio | Fonte não regulada é sinalizada antes de haver hiponatremia. |
| Água alta podia mascarar SIADH; déficit e resistência simultâneos recebiam causa única | Prioridades corrigidas e interpretação de combinações explícita. |
| Compartimento hídrico podia parar no piso e continuar exibindo um estado aparentemente estável | Balanço inclui perdas insensíveis; avanço interrompido no limite com desequilíbrio e aviso persistente. |
| “Sem acesso à água” ainda fornecia água e sede compensatória | Cenário renomeado como acesso restrito; ausência total é o slider em zero. |
| “Hemorragia” sugeria retirada real de sangue, que não existia no modelo | Cenário identifica estímulo sustentado de hipovolemia; limitações explicitadas. |
| Ocitocina tinha uma concentração e faixa clínicas sem calibração | Apresentada como atividade relativa ao basal. Contração e ativação mioepitelial são índices demonstrativos. |
| Ejeção zerava instantaneamente ao retirar sucção, apesar de OT residual | Potencial de ativação acompanha OT e relaxa com sua queda. Não quantifica leite; exige disponibilidade não simulada. |
| Aba de ocitocina anunciava resposta positiva mesmo com síntese bloqueada | Interpretação considera a capacidade de síntese/transporte e a resposta observada. |
| Explicações ficavam antigas quando o título não mudava | Atualização considera o resultado completo; regressão verifica a troca do texto com título de DI central preservado. |
| Valores ainda na faixa eram tratados como equilíbrio após novo estímulo | A interface projeta 0,25 dia: mudança superior a 1% nos indicadores monitorados sinaliza resposta em evolução. É um critério de apresentação do modelo, não um limite fisiológico clínico. |
| Avanço muito pequeno era arredondado para zero | Restos de tempo são integrados; entradas de tempo inválidas são rejeitadas. |
| Intervenções instantâneas não entravam imediatamente nos dados exportados | O ponto da intervenção é amostrado; CSV identifica a janela do eixo ativo, com unidades. |
| Módulos de versões diferentes podiam ser misturados pelo cache após a atualização | Entrada, estilos e dependências JavaScript usam a mesma versão na URL. |

## Relações verificadas

Menor função tireoidiana → menor T4/maior TSH; T4 exógeno → maior T4/menor TSH; menor conversão → menor T3; perda adrenal → menor cortisol/maior ACTH; mais CRH de estresse → mais cortisol; perda corticotrófica → menos cortisol; perda testicular → menos testosterona/mais LH; androgênio exógeno → menor LH; GHRH → maior GH; somatostatina → menor GH e TSH; menor resposta hepática → menor IGF-1/maior GH; dopamina → menor PRL; bloqueio D2 → maior PRL; deficiência de ADH → mais urina; resistência renal → maior estímulo de ADH; ADH não regulado → retenção e menor sódio; sucção e estiramento → resposta de OT dependente de tecido funcional.

O sódio continua sendo uma estimativa de `Posm ≈ 2×Na + 10`, com solutos não sódicos constantes. Não há balanço independente de sódio, glicose ou ureia. O balanço hídrico em cada etapa é ingestão − diurese − 0,8 L/dia, verificado numericamente.

## Limites da conclusão

O modelo é fenomenológico e qualitativo. Não foi validado contra séries clínicas ou um modelo endócrino quantitativo de referência. Não reproduz pulsos reais, ritmo circadiano, eixos ovarianos, estados gestacionais, fertilidade, disponibilidade/produção volumétrica de leite, renina/aldosterona, ajustes renais de solutos ou o curso real de uma hemorragia. Tempo acelerado e faixas ilustrativas não devem ser usados para prever doses, concentrações ou prognóstico individual. A sobre-elevação transitória de TSH ainda pode ocorrer; eliminar o teto antigo não torna essa curva clinicamente calibrada.

## Referências consultadas

- Endotext — [Normal Physiology of ACTH and GH Release](https://www.ncbi.nlm.nih.gov/books/NBK279116/).
- Endotext — [Normal Physiology of Growth Hormone in Normal Adults](https://www.ncbi.nlm.nih.gov/books/NBK279056/).
- Endotext — [Hypopituitarism](https://www.ncbi.nlm.nih.gov/books/NBK278989/).
- Endotext — [The Neurohypophysis: Vasopressin and Oxytocin](https://www.ncbi.nlm.nih.gov/books/NBK279157/).
- Endotext — [Diagnostic Tests for Diabetes Insipidus](https://www.ncbi.nlm.nih.gov/books/NBK537591/).
- Endotext — [Clinical Strategies in the Testing of Thyroid Function](https://www.ncbi.nlm.nih.gov/books/NBK285558/).
- OMS — [The Physiological Basis of Breastfeeding](https://www.ncbi.nlm.nih.gov/books/NBK148970/).

Prof. Mário César Nascimento. PhD ©
