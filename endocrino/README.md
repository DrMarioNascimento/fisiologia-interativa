# Sistema Endócrino — Unidade 06 de Educação Física

## Manutenção e origem — 19 de outubro de 2026

Este módulo integra a Unidade 06 — Sistema Endócrino, exclusiva do percurso EF. O catálogo vigente está em `inicio/dados-ef.js`, na raiz do projeto, e as questões da unidade em `tutor-ef-endocrino.js`. A integração cardiorrespiratória permanece em seção própria. Não há sala endócrina de Escape Room cadastrada. O mapa mental da unidade está em `assets/maps/sistema-endocrino.webp` e a apresentação compartilhada da EF em `ef-simuladores.js` e `ef-simuladores.css`.

Consulte o [README principal](../README.md) e a [licença da raiz](../LICENSE.md). Créditos e licenças específicos deste módulo permanecem nos documentos abaixo.

Aplicação estática para GitHub Pages. Abra `index.html` por HTTP; não requer instalação de dependências ou compilação para uso. Os módulos JavaScript distribuídos foram gerados dos arquivos TypeScript em `src/` com `node build.cjs`. Para validar: `node --test tests.mjs`.

A versão inicial incorporou as correções do v0 presentes no commit `5b8418e37a0c6aaf9f55bc3999da9763b4126a4f`. A cópia completa do projeto Next.js corrigido fica em `origem-v0/`, preservada como referência; ela não substitui a página principal do portal.

O tema segue os simuladores existentes: azul escuro, painéis em relevo, botões 3D, sliders metálicos, layout responsivo e zoom liberado. Há controles explícitos de iniciar, pausar, resetar e avançar; cenários independentes, restauração global, aviso de alterações em outros eixos e exportação CSV. ACTH/cortisol, ADH/água e ocitocina têm acessos separados.

O catálogo de Educação Física insere Endócrino como 06 e preserva Integração como 07. Os dados de Fisioterapia são preservados. Não se anuncia sala de fuga ou mapa mental endócrino inexistente.

## Validação

A revisão ampliada está em [AUDITORIA-20261018.md](AUDITORIA-20261018.md): 25 grupos de testes, 34 cenários em seis momentos (204 observações), 35 parâmetros nos extremos e 64 combinações reproduzíveis. Os testes verificam regressões, mecanismos qualitativos e funcionamento dos controles; não estabelecem validação clínica. Execute `node audit-run.mjs` para reproduzir a matriz de respostas.

O TSH pode apresentar sobre-elevação transitória no modelo; a saturação abrupta antiga foi substituída pelo v0 por saturação suave. As interpretações centrais também consideram o contexto experimental, mesmo com valores próximos às faixas ilustrativas.

Na versão Next.js preservada, zoom, erros de build, duplicação de formatação e cabeçalhos foram corrigidos pelo v0. Na versão estática, a política de referência é declarada em HTML; HSTS e X-Content-Type-Options dependem do servidor de hospedagem, não podem ser impostos por este HTML. Não foi configurada política que bloqueie câmera nos demais simuladores de realidade aumentada.

Modelo educacional simplificado; não é ferramenta de diagnóstico ou prescrição. Referências conceituais: Endotext, Hypopituitarism (https://www.ncbi.nlm.nih.gov/books/NBK278989/), Cushing’s Syndrome (https://www.ncbi.nlm.nih.gov/books/NBK279088/) e The Non-Thyroidal Illness Syndrome (https://www.ncbi.nlm.nih.gov/books/NBK285570/).

Prof. Mário César Nascimento. PhD ©
