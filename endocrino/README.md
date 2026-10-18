# Sistema Endócrino — Unidade 06 de Educação Física

Aplicação estática para GitHub Pages. Abra `index.html` por HTTP; não requer instalação de dependências ou compilação para uso. Os módulos JavaScript distribuídos foram gerados dos arquivos TypeScript em `src/` com `node build.cjs`. Para validar: `node --test tests.mjs`.

O modelo e as interpretações incorporam as correções do v0 presentes no commit `5b8418e37a0c6aaf9f55bc3999da9763b4126a4f`. A cópia completa do projeto Next.js corrigido fica em `origem-v0/`, preservada como referência; ela não substitui a página principal do portal.

O tema segue os simuladores existentes: azul escuro, painéis em relevo, botões 3D, sliders metálicos, layout responsivo e zoom liberado. Há controles explícitos de iniciar, pausar, resetar e avançar; cenários independentes, restauração global, aviso de alterações em outros eixos e exportação CSV. ACTH/cortisol, ADH/água e ocitocina têm acessos separados.

O catálogo de Educação Física insere Endócrino como 06 e preserva Integração como 07. Os dados de Fisioterapia são preservados. Não se anuncia sala de fuga ou mapa mental endócrino inexistente.

## Validação

Seis testes automatizados: polidipsia nos dias 1/7/30/90; Addison nos mesmos períodos; padrões centrais de Sheehan e haste aos 30/90 dias; curva de Hashimoto por 90 dias sem atingir o teto antigo; todos os cenários com resultados finitos e não negativos aos 90 dias; troca de cenário, limpeza do histórico e restauração global pela interface. Os testes verificam regressões do modelo didático, sem estabelecer validação clínica.

O TSH pode apresentar sobre-elevação transitória no modelo; a saturação abrupta antiga foi substituída pelo v0 por saturação suave. As interpretações centrais também consideram o contexto experimental, mesmo com valores próximos às faixas ilustrativas.

Na versão Next.js preservada, zoom, erros de build, duplicação de formatação e cabeçalhos foram corrigidos pelo v0. Na versão estática, a política de referência é declarada em HTML; HSTS e X-Content-Type-Options dependem do servidor de hospedagem, não podem ser impostos por este HTML. Não foi configurada política que bloqueie câmera nos demais simuladores de realidade aumentada.

Modelo educacional simplificado; não é ferramenta de diagnóstico ou prescrição. Referências conceituais: Endotext, Hypopituitarism (https://www.ncbi.nlm.nih.gov/books/NBK278989/), Cushing’s Syndrome (https://www.ncbi.nlm.nih.gov/books/NBK279088/) e The Non-Thyroidal Illness Syndrome (https://www.ncbi.nlm.nih.gov/books/NBK285570/).

Prof. Mário César Nascimento. PhD ©
