# Pleura em realidade aumentada

Experiência independente do Fisiologia Interativa, aberta pelos Tutores de Educação Física e Fisioterapia. Inclui Camadas, Mecânica, Pneumotórax, Gradiente e Zonas de West, controles de respiração e velocidade, Repouso, Exercício, Enfisema, Fibrose e Capacidade vital forçada.

Acesse [Pleura RA](https://drmarionascimento.github.io/fisiologia-interativa/ra/pleura/). “Voltar ao Tutor” respeita o percurso de origem. Não há catálogo de bancadas, porta de acesso ou credenciais Google.

Todas as cenas, cálculos, estilos, modelos GLB e marcas usados nesta experiência estão nesta pasta. Three.js 0.180.0 e model-viewer 4.1.0 conservam as dependências fixadas no CDN; nenhum recurso é carregado do repositório anterior. Modelo cardíaco: `assets/coracao.glb`; atribuição em [assets/ATRIBUICAO.md](assets/ATRIBUICAO.md). A RA exporta o estado visual para visualização espacial, como antes.

Proveniência: adaptação da experiência Pleura em `DrMarioNascimento/lab-ra`, revisão `f290ff9f5fa619b4ac828877171674e7d66c4e1c`. Foram preservados anatomia, sincronização costal, cálculos e acabamento. [Auditoria fisiológica](pleura/AUDITORIA-FISIOLOGIA.md) documenta as aproximações didáticas.

Execute `npm run test:ra` na raiz. O manifesto registra os arquivos desta instalação para verificar a integridade da transferência.
