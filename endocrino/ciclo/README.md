# Ciclo menstrual, gestação e puerpério

## Manutenção e origem — 19 de outubro de 2026

Este módulo integra a Unidade 06 — Sistema Endócrino, exclusiva do percurso EF. O catálogo vigente está em `inicio/dados-ef.js`, na raiz do projeto, e as questões da unidade em `tutor-ef-endocrino.js`. A integração cardiorrespiratória permanece em seção própria. Não há sala endócrina de Escape Room cadastrada.

Consulte o [README principal](../../README.md) e a [licença da raiz](../../LICENSE.md). Créditos e licenças específicos deste módulo permanecem nos documentos abaixo.

Adaptação estática do simulador v0 para a Unidade 06, exclusiva do percurso de Educação Física. Usa o estilo compartilhado de `endocrino/style.css` e não depende de Next.js em produção.

## Padronização realizada

- Botões, sliders, cores, painéis, tipografia e comportamento responsivo compartilhados com os eixos endócrinos.
- Navegação entre unidades, eixos, ciclo e gestação; entradas separadas no catálogo.
- Assinatura: Simuladores interativos utilizados nas disciplinas de Fisiologia Humana do Prof. Dr. Mário César Nascimento ©
- Iniciar, pausar, avançar, reiniciar, repetir, velocidade, exploração temporal e exportação CSV.
- Restauração de todas as variáveis; gráficos com escalas normalizadas explicitadas e legenda interativa.
- Modelos de origem preservados em TypeScript; exercício identificado como hipótese ilustrativa de fatores fixos, sem previsão individual.

## Verificação

`node endocrino/ciclo/build.cjs` recompila os módulos com Node 24. `node endocrino/ciclo/tests.mjs` verifica finitude e não negatividade ao longo dos perfis, ordem dos picos, contraste do puerpério, controles, modos, restauração, CSV e assinatura. Estes testes não substituem revisão independente da validade quantitativa das curvas. A interface foi verificada com elementos simulados; não houve teste visual em navegador nesta alteração.
