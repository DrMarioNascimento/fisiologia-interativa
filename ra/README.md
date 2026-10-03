# Fisiologia em realidade aumentada

Experiência independente do Fisiologia Interativa, aberta pelos Tutores de Educação Física e Fisioterapia. Inclui Camadas, Mecânica, Pneumotórax, Gradiente e Zonas de West, controles de respiração e velocidade, Repouso, Exercício, Enfisema, Fibrose e Capacidade vital forçada.

Acesse [Pleura RA](https://drmarionascimento.github.io/fisiologia-interativa/ra/pleura/). “Voltar ao Tutor” respeita o percurso de origem. Não há catálogo de bancadas, porta de acesso ou credenciais Google.

Todas as cenas, cálculos, estilos, modelos GLB e marcas usados nesta experiência estão nesta pasta. Three.js 0.180.0 e model-viewer 4.1.0 conservam as dependências fixadas no CDN; nenhum recurso é carregado do repositório anterior. Modelo cardíaco: `assets/coracao.glb`; atribuição em [assets/ATRIBUICAO.md](assets/ATRIBUICAO.md). A RA exporta o estado visual para visualização espacial, como antes.

Proveniência: adaptação da experiência Pleura em `DrMarioNascimento/lab-ra`, revisão `f290ff9f5fa619b4ac828877171674e7d66c4e1c`. Foram preservados anatomia, sincronização costal, cálculos e acabamento. [Auditoria fisiológica](pleura/AUDITORIA-FISIOLOGIA.md) documenta as aproximações didáticas.

Execute `npm run test:ra` na raiz. O manifesto registra os arquivos desta instalação para verificar a integridade da transferência.

## Retorno venoso · Sistema cardiovascular

[Retorno venoso RA](https://drmarionascimento.github.io/fisiologia-interativa/ra/retorno-venoso/) é uma segunda experiência independente, acessível pelo destaque de realidade aumentada do sistema cardiovascular nos dois Tutores. O simulador clássico `retorno-venoso.html` permanece disponível.

Foram transferidos os cinco níveis (Corpo, Perna, Válvula, Bomba e Ciclo) da revisão aprovada `85d13200078f5201d251c857efde5326cd53daa7` de `DrMarioNascimento/lab-ra`. Corpo, contorno, vasos, coração, tendões, câmera, iluminação e válvulas giradas em 90° conservam a geometria e os materiais da origem. O modelo cardíaco já presente em `assets/coracao.glb` é idêntico ao da origem; não há dependência do repositório antigo.

O padrão da Pleura foi aplicado à apresentação: navegação para o Tutor de origem, assinatura, controles persistentes, velocidade de reprodução, ampliação, cards de pressão (mmHg e cmH₂O), volume em grupo separado, gráficos com eixos e estados rápidos. Iniciar/Pausar controlam o mesmo relógio do músculo, circulação e pulsação; Um passo completa um ciclo de 1,15 s. Caminhada ativa a bomba; Em pé parado permite o reenchimento gradual. Pausar conserva o estado corrente. Reiniciar limpa o ciclo e o histórico; Restaurar parâmetros também retorna à inclinação inicial.

Os cálculos hidrostáticos, de represamento e da bomba mantêm as aproximações didáticas da origem. A velocidade afeta exclusivamente o relógio da reprodução. A conversão apresentada é 1 mmHg = 1,35951 cmH₂O; uma jugular colabada é identificada sem apresentar a extrapolação negativa como pressão sustentada. Coxa/coração/jugular e o perfil de altura são referências em repouso; o tornozelo acompanha o efeito da bomba. O volume estimado não representa uma simulação completa da ejeção muscular ou do débito cardíaco.

Validação de migração: comparação de 113 malhas, atributos, transformações, materiais e shaders com a origem; pressões idênticas em 0°, 45° e 90°; cinco níveis em desktop e celular; início, pausa, passo, parada com reenchimento, ciclo único, velocidade, gráficos, tela cheia e exportação GLB; abertura e retorno nos dois percursos. A ativação da câmera em RA depende do navegador/dispositivo compatível.

## Revisão posterior de postura e sincronização

O corpo inteiro foi centralizado e ampliado, sem alterar sua silhueta ou contorno. As cores venosas respondem à postura mesmo durante a pausa; as três válvulas acompanham a caminhada. O coração usa o relógio simulado. O gráfico mostra a postura corporal e pressões regionais. Pressões, distensão e volume compartilham o efeito regional da bomba; todas as regiões usam a mesma referência hidrostática. A geometria e os materiais da Bomba foram preservados. Veja [a auditoria fisiológica e suas limitações](retorno-venoso/AUDITORIA-FISIOLOGIA.md).

A vista inicial do Corpo/Ciclo é lateral, em pé, e o movimento de Deitar reclina sobre as costas. Restaurar parâmetros retorna a essa postura; links com `grau=0` continuam abrindo em decúbito. A exportação RA conserva a reclinação. A figura do gráfico se adapta à largura da janela e as pressões aparecem nas duas unidades, também no indicador da cena, nos desníveis das válvulas e nos eixos temporais.
