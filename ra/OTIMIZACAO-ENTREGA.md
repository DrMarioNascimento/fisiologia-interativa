# Entrega RA — 2 de novembro de 2026

Célula desktop, Película e Travessias recebem cópias GLB com EXT_meshopt_compression, sem executar quantização, simplificação, redução de texturas ou reamostragem de animações. A compilação compara os arrays de atributos, a topologia com orientação preservada, os materiais e imagens, a hierarquia e as trilhas de animação após decodificar cada arquivo. O relatório está em `otimizacao-modelos.json`.

Os GLBs originais continuam disponíveis como fallback. O GLB móvel da Célula mantém a compatibilidade com Scene Viewer; todos os USDZ permanecem iguais. O decodificador Meshoptimizer 1.3.0 está em `vendor/` com licença MIT. O model-viewer 4.1.0 ativa seu carregamento antes de atribuir o GLB comprimido.

A aba da Célula só cria sua navegação quando selecionada. A preparação da RA celular exige o botão correspondente, evitando uma segunda cena e carga automática no Android. A prévia e a RA usam a mesma URL GLB móvel para aproveitar o cache HTTP. A animação celular pausada desenha sob demanda; controles, camadas, corte e redimensionamento continuam atualizando a vista. Coração e pleura evitam desenhar o palco fora da tela, conservando o avanço do motor. A pleura prepara a RA quando a seção se aproxima da tela. Os ciclos portáteis pausam prévias fechadas ou invisíveis e preservam a preferência de reprodução ao retornar, inclusive no modo 3D ampliado.

O tórax aprovado permanece no carregamento da simulação pleural porque faz parte dos níveis anatômicos. Removê-lo mudaria a visualização.

Validação: testes RA automatizados e comparação numérica após compressão. A inspeção deste ambiente não substitui testes físicos de câmera, Quick Look e WebXR em iPhone e Android.
