# Fisiologia em realidade aumentada

## Manutenção e origem — 19 de outubro de 2026

Módulo de Fisiologia em RA, mantido neste repositório e acessado pelos percursos dos tutores. A Unidade 06 — Sistema Endócrino possui documentação separada em `endocrino/`; sua inclusão não altera a procedência dos modelos desta experiência. Os créditos e as licenças específicos abaixo permanecem aplicáveis.

Consulte o [README principal](../README.md) e a [licença da raiz](../LICENSE.md). Créditos e licenças específicos deste módulo permanecem nos documentos abaixo.

Experiências independentes do Fisiologia Interativa, abertas pelos Tutores de Educação Física e Fisioterapia. Pleura inclui Camadas, Mecânica, Pneumotórax, Gradiente e Zonas de West, controles de respiração e velocidade, Repouso, Exercício, Enfisema, Fibrose e Capacidade vital forçada.

Acesse [Pleura RA](https://fisiologia.drmarionascimento.com.br/ra/pleura/). “Voltar ao Tutor” respeita o percurso de origem. Não há catálogo de bancadas, porta de acesso ou credenciais Google.

Todas as cenas, cálculos, estilos, modelos GLB e marcas usados nesta experiência estão nesta pasta. Three.js 0.180.0 e model-viewer 4.1.0 conservam as dependências fixadas no CDN; nenhum recurso é carregado do repositório anterior. Modelo cardíaco: `assets/coracao.glb`; atribuição em [assets/ATRIBUICAO.md](assets/ATRIBUICAO.md). A RA exporta o estado visual para visualização espacial, como antes.

Proveniência: adaptação da experiência Pleura em `DrMarioNascimento/lab-ra`, revisão `f290ff9f5fa619b4ac828877171674e7d66c4e1c`. Foram preservados anatomia, sincronização costal, cálculos e acabamento. [Auditoria fisiológica](pleura/AUDITORIA-FISIOLOGIA.md) documenta as aproximações didáticas.

Execute `npm run test:ra` na raiz. O manifesto registra os arquivos desta instalação para verificar a integridade da transferência.

## Retorno venoso · Sistema cardiovascular

[Retorno venoso RA](https://fisiologia.drmarionascimento.com.br/ra/retorno-venoso/) é uma segunda experiência independente, acessível pelo destaque de realidade aumentada do sistema cardiovascular nos dois Tutores. O simulador clássico `retorno-venoso.html` permanece disponível.

Foram transferidos os cinco níveis (Corpo, Perna, Válvula, Bomba e Ciclo) da revisão aprovada `85d13200078f5201d251c857efde5326cd53daa7` de `DrMarioNascimento/lab-ra`. Corpo, contorno, vasos, coração, tendões, câmera, iluminação e válvulas giradas em 90° conservam a geometria e os materiais da origem. O modelo cardíaco já presente em `assets/coracao.glb` é idêntico ao da origem; não há dependência do repositório antigo.

O padrão da Pleura foi aplicado à apresentação: navegação para o Tutor de origem, assinatura, controles persistentes, velocidade de reprodução, ampliação, cards de pressão (mmHg e cmH₂O), volume em grupo separado, gráficos com eixos e estados rápidos. Iniciar/Pausar controlam o mesmo relógio do músculo, circulação e pulsação; Um passo completa um ciclo de 1,15 s. Caminhada ativa a bomba; Em pé parado permite o reenchimento gradual. Pausar conserva o estado corrente. Reiniciar limpa o ciclo e o histórico; Restaurar parâmetros também retorna à inclinação inicial.

A apresentação atual reúne PA média e PV em cada região, nas duas unidades. A referência central é 100/2 mmHg (aorta/átrio direito), com 95/5 mmHg periféricos no decúbito. Ambas recebem o mesmo desnível hidrostático. Jugular colabada é identificada sem exibir a extrapolação negativa como pressão sustentada. A bomba reduz a PV distal e preserva a pressão média femoral; o volume é demonstrativo, sem cálculo de débito cardíaco.

Validação de migração: comparação de 113 malhas, atributos, transformações, materiais e shaders com a origem; pressões idênticas em 0°, 45° e 90°; cinco níveis em desktop e celular; início, pausa, passo, parada com reenchimento, ciclo único, velocidade, gráficos, tela cheia e exportação GLB; abertura e retorno nos dois percursos. A ativação da câmera em RA depende do navegador/dispositivo compatível.

## Revisão posterior de postura e sincronização

O corpo inteiro foi centralizado e ampliado, sem alterar sua silhueta ou contorno. As cores venosas respondem à postura mesmo durante a pausa; as três válvulas acompanham a caminhada. O coração usa o relógio simulado. O gráfico mostra a postura corporal e pressões regionais. Pressões, distensão e volume compartilham o efeito regional da bomba; todas as regiões usam a mesma referência hidrostática. A geometria e os materiais da Bomba foram preservados. Veja [a auditoria fisiológica e suas limitações](retorno-venoso/AUDITORIA-FISIOLOGIA.md).

A vista inicial do Corpo/Ciclo é lateral, em pé, e o movimento de Deitar reclina sobre as costas. Restaurar parâmetros retorna a essa postura; links com `grau=0` continuam abrindo em decúbito. A exportação RA conserva a reclinação. A figura do gráfico se adapta à largura da janela e as pressões aparecem nas duas unidades, também no indicador da cena, nos desníveis das válvulas e nos eixos temporais.

PA/PV compartilham a escala dos gráficos, e os cards informam o desnível em relação ao átrio direito. O detalhe de leitura explica por que valores do slide variam com as alturas representadas. As referências centrais são fixas para isolar gravidade e bomba; barorreflexo e resposta transitória central não são simulados.

## Coração em ação · Sistema cardiovascular

[Coração RA](https://fisiologia.drmarionascimento.com.br/ra/coracao/) reúne a Vista Interna de 79 malhas e a Vista Externa do coração aprovado, com motor cardíaco, contração, estados valvulares, leituras e Wiggers no mesmo relógio. A migração mantém os modelos da experiência `bancadas/11-coracao/prototipo/duas-pecas.html` do Lab RA, revisão `85d13200078f5201d251c857efde5326cd53daa7`; suas limitações anatômicas estão documentadas.

Coração e Retorno venoso têm acessos próprios no destaque RA cardiovascular dos Tutores EF e Fisioterapia. Iniciar/Pausar, Um ciclo, Reiniciar, velocidade, frequência, amplitude, instantes rápidos, ampliação e legendas usam o padrão das outras experiências. A exportação RA preserva o instante pausado escolhido e invalida exportações antigas ao iniciar ou trocar a vista. Não exige Google nem carrega recursos do repositório anterior. [Detalhes, validação e atribuições](coracao/README.md).

Os dois botões cardiovasculares usam o mesmo acabamento dourado com profundidade 3D. A referência *Realistic Human Heart* corresponde somente à Vista Externa; a Vista Interna deriva de BodyParts3D. Os batimentos de cada área cardíaca (segmento) foram cuidadosamente calculados pelo Prof. Mário César Nascimento, PhD. Consulte as [atribuições dos modelos](assets/ATRIBUICAO.md), as [licenças do coração](coracao/LICENSE.md) e a [licença principal](../LICENSE.md), que preserva as licenças próprias dos componentes de terceiros.

## Do músculo ao sarcômero · Sistema muscular

[Músculo RA](https://fisiologia.drmarionascimento.com.br/ra/musculo-sarcomero/) transfere a versão aprovada `6792eb577870bb72933b845791743bc872bcbad2` do Lab RA. O arquivo de modelos é idêntico à origem: cinco níveis, ventre contínuo, janela no epimísio, tendões, sarcômero e texturas preservados, sem bases em nenhum nível. O card aparece no Sistema Muscular dos dois percursos; a experiência também integra o catálogo compartilhado dos quatro Tutores, com e sem IA.

A apresentação segue as demais experiências: assinatura, retorno ao Tutor de origem, navegação por níveis, botões com profundidade, giro com início/pausa e velocidade, rótulos e ampliação. Esses controles de giro não alteram a contração nem a curva comprimento–tensão. Os controles e os cálculos do sarcômero permanecem iguais à versão aprovada; a RA exporta o nível e o comprimento selecionados. [Detalhes e limites didáticos](musculo-sarcomero/README.md).

## A película de carga · Fisiologia celular

[A película de carga RA](https://fisiologia.drmarionascimento.com.br/ra/potencial-membrana/) transfere a revisão aprovada `303bad15b77d7c995fdc90f20fa0e2b9eaa0902f`. Modelos procedurais e cálculos preservados, cinco níveis, organelas, bicamada e onda amielínica. Acesso celular nos dois percursos e catálogo dos quatro Tutores; apresentação comum com giro, velocidade, ampliação e retorno ao Tutor. [Detalhes e limites](potencial-membrana/README.md).

## Forças de Starling · Unidade 1 — Celular

[Forças de Starling RA](https://fisiologia.drmarionascimento.com.br/ra/starling/) conserva integralmente app, modelos, física, paleta e estilos da revisão aprovada `5ac3f4cce5b8d62d76d9fc3cced1e0e0bc2f224d`. Cinco níveis, seleção explícita de RA, guia Como interpretar, cores consistentes, pressões nas duas unidades e balanço linfático. O card celular mantém A película de carga e acrescenta um segundo botão com o mesmo acabamento. Os quatro Tutores compartilham roteiro e questões. [Detalhes, referências e limites](starling/README.md).

## Do nervo à força · Sistema muscular

[Nova experiência](https://fisiologia.drmarionascimento.com.br/ra/juncao-neuromuscular/), construída neste repositório: cinco níveis da junção neuromuscular ao acoplamento excitação–contração. O último importa o modelo de sarcômero aprovado, sem editar seus arquivos. Cena e gráficos compartilham o instante; pausas preparam a peça estática escolhida em RA. Catálogo, roteiro, três questões e os dois botões musculares integram os quatro Tutores, preservando EF/Fisioterapia. [Cálculos, referências e limites](juncao-neuromuscular/README.md).

## Viagem ao osso vivo

[Nova experiência](https://fisiologia.drmarionascimento.com.br/ra/osso-vivo/) procedural original: desmontagem do osso, compacto e esponjoso, ósteon com vasos e canalículos, osteoclasto com transcitose, osteoblasto com síntese e mineralização extracelular. Colágeno entrelaçado e cristais em placas ganham uma ampliação própria; setas e deformação ampliada tornam a carga visível. Três cenários de carga compartilham um ciclo demonstrativo; valores são volumes relativos escolhidos, sem densitometria ou calendário clínico. Controles de reprodução, rótulos, cinco peças estáticas em RA, roteiro e questões nos quatro Tutores. EF: Osteoarticular; Fisioterapia: Sistema muscular, preservando suas cinco unidades. [Modelo, referências e limites](osso-vivo/README.md).

## Volume e movimento — 25/10/2026

Placas e textos extrudados, ciclos portáteis em GLB e USDZ e preservação das exportações de estado. Consulte [a revisão e os limites de compatibilidade](REVISAO-VOLUME-MOVIMENTO.md).

## Bíceps braquial · Sistema muscular — 10/11/2026

[Bíceps braquial RA](https://fisiologia.drmarionascimento.com.br/ra/biceps-braquial/) é uma experiência nova, de anatomia funcional: origens, inserções e trajeto dos tendões do bíceps braquial, com cartilagens articulares e tecido conjuntivo. Ganhou um terceiro botão no card de RA do Sistema Muscular dos dois percursos (EF e Fisioterapia) e uma entrada no catálogo compartilhado dos quatro Tutores, com roteiro e três questões. Não altera "Do músculo ao sarcômero" nem "Do nervo à força".

Modelo (`biceps-braquial/modelo.glb`, 6,1 MB): escápula, clavícula, úmero, rádio, ulna, tendões das duas cabeças e membrana interóssea do BodyParts3D (DBCLS, CC BY), membro superior direito; ventres musculares do modelo do autor, encaixados no trajeto do BodyParts3D; cartilagens articulares e ligamentos (transverso do úmero, anular do rádio, coracoacromial, conoide, trapezoide, acromioclavicular e aponeurose bicipital) modelados sobre a superfície dos ossos, como representação esquemática. Cada peça tem nome próprio no arquivo; a página usa esses nomes para rótulos e botões (rótulos, músculo translúcido, tecido conjuntivo, cartilagens).

RA: no iPhone/iPad, link `rel="ar"` escrito no HTML para `biceps-braquial/modelo.usdz` (gerado do mesmo GLB), sem conversão no toque; no Android, model-viewer com o GLB e `ra-android.js`. O braço aparece em tamanho real. Validação: carga do modelo, rótulos, botões, retorno ao Tutor nos dois percursos e link nativo com agente de iPhone, em navegador automatizado; não testado em aparelho físico.

### Bíceps braquial — movimento (10/11/2026)

O modelo passou a ter um ciclo de 8 s gravado no GLB e no USDZ: pronação com o bíceps relaxado (o tendão se enrola no rádio), contração com supinação e flexão do cotovelo até 95° (ventre encurta e engrossa; o encurtamento é calculado para manter o comprimento dos tendões) e relaxamento com extensão. Antebraço e rádio giram como nós rígidos (eixos do cotovelo, ajustado na tróclea/capítulo, e da pronossupinação, da cabeça do rádio à cabeça da ulna); ventres, tendões, aponeurose e membrana interóssea são morph targets reduzidos por PCA (erro ≤ 0,35 mm) e comprimidos com Draco (4,0 MB). O USDZ saiu do GLB cru pelo conversor `celula/tools/usdz.py` e passou por `scripts/esqueleto-ios.py` (5 peças, 160 articulações, pior erro 4,9 % da excursão, cerca de 2,5 mm). A página ganhou "Pausar movimento", a fase do ciclo no painel e rótulos presos a vértices, que acompanham o movimento; o model-viewer toca o ciclo no Android. Versões estáticas guardadas como `modelo_SUBSTITUIDO_2026-11-10.*`. Também corrige a publicação anterior: `index.html` não tinha entrado no repositório porque o `.gitignore` ignora `*.html` (adicionado com `git add -f`).

## Do músculo ao sarcômero — movimento nos níveis 01 a 04 (11/11/2026)

O nível 01 passou a usar o bíceps com ossos e tendões do BodyParts3D (o mesmo da RA "Bíceps braquial"), com a janela no epimísio refeita e rosca direta de 8 s; os níveis 02 a 04 ganharam ciclos em RA que encurtam no mesmo ritmo do sarcômero, e o seletor "Ciclo em movimento" passou a oferecer os cinco níveis. Detalhes em `musculo-sarcomero/README.md`. `scripts/construir-portateis.cjs` aceita `experiência:nível` para gerar só um nível.

### Correções de 11/11/2026 (tarde)

Pedidas pelo autor ao ver o modelo: (1) os rótulos "Cabeça longa" e "Cabeça curta" caíam no mesmo ventre — as cabeças agora são separadas por agrupamento (2-médias no plano x-z da faixa do meio do ventre), e não pela metade da caixa; (2) o ligamento anular estava largo e horizontal — agora acompanha o eixo do rádio, com raio da cabeça + cartilagem + 0,6 mm (11,1 mm) e faixa de 6 mm; (3) no início do tendão distal, a superfície do BodyParts3D dentro do ventre abria em abas brancas afastadas do músculo — o tendão agora entra no ventre como um cordão (raio do próprio tendão, 8 mm de sobreposição) e a ponta do ventre afina menos. Valem para a RA "Bíceps braquial" e para o nível 01 / ciclo 01 de Do músculo ao sarcômero. Versões anteriores: `*_SUBSTITUIDO_2026-11-11.*` (ciclos em `musculo-sarcomero/ciclos/_substituido/`).

