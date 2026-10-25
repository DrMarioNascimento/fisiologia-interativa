# Conversão do modelo da célula — 24/10/2026

O GLB fornecido por Mário é preservado integralmente no visualizador de computador. Para reconstruí-lo, concatene as partes de `../visualizador/modelo-original-v2/` na ordem do manifesto. SHA-256: `061e1c93694472ada3d6247ffbbfc79b1ebb53cf811dccb05552b7410feb5252`.

A versão móvel simplifica a geometria e converte cores por vértice em texturas, conservando as organelas e a animação `vida_celular` de 24 segundos. São 324 instâncias de malha; 314 apresentam movimento. A simplificação remove duas trilhas constantes (359 → 357), sem remover movimento. O GLB Android tem 11.767.500 bytes; o USDZ iOS tem 11.226.223 bytes. As imagens de relevo usam 192 px no Android e 256 px no iOS. A imagem de contingência é uma renderização do modelo original.

## Reprodução

Execute nesta pasta, com o original reconstruído como `celula-humana.glb`, Node e Python 3 instalados:

```sh
npm ci
python -m pip install -r requirements.txt
node simplify.mjs
python bake.py
python compress.py
node cleanup.mjs
node tangents.mjs
node fix-tangents.mjs
python usdz.py
python mobile-textures.py
node cleanup.mjs
node validate.mjs
```

Copie `celula-mobile-v2.glb` e `celula-ios-v2.usdz` para `../visualizador/`. O USDZ é produzido antes da redução adicional das texturas de relevo Android. Não use os arquivos intermediários na página.

## Validação realizada

- Khronos glTF Validator: nenhum erro e nenhum aviso; mensagens informativas sobre dois samplers constantes não usados e dimensões de textura 192 × 192.
- OpenUSD 26.11, todos os validadores disponíveis: nenhum erro.
- Reprodução com Three.js AnimationMixer: original e móvel mantêm duração de 24 segundos e 314 malhas em movimento aos 5 segundos.
- 11 testes em `ra/tests/celula-{transferencia,nova-ra}.test.mjs`: integridade do original, modelos, navegação e acionamento nativo iOS/Android.
- Não houve teste da câmera em aparelhos físicos. Essa etapa ainda exige iPhone/iPad e Android compatíveis com RA.

## Integração

O iPhone abre um USDZ público via link `rel="ar"` no gesto do toque. Android abre o GLB público no Scene Viewer (`ar_preferred`, com fallback 3D). A abertura nativa independe da prévia WebGL. O botão de conferir modelo só carrega a segunda prévia sob demanda. O corte do núcleo pertence à página; a RA apresenta o modelo completo. O arquivo recebido não contém membrana plasmática externa; nenhuma foi inventada.
