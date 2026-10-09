# Modelos anatômicos do coração

## Somente Vista Externa

[Realistic Human Heart](https://sketchfab.com/3d-models/realistic-human-heart-3f8072336ce94d18b3d0d055a1ece089), de **neshallads**, sob [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).

O arquivo `coracao.glb` conserva a malha anteriormente usada na experiência de Pleura e também é utilizado no Retorno venoso e na **Vista Externa** de Coração em ação. Adaptações em cena: escala, posição, acabamento e contração visual. A referência *Realistic Human Heart* corresponde somente à Vista Externa; não é a fonte do modelo interno. Os créditos permanecem nas interfaces das três experiências.

SHA-256: `fcb3c1036fe59dfdcc1c30917dbdaa8fbd52c858e6ba3cadaf126b44ccca4b5b`.

## Vista Interna

`coracao-interno.glb` é a cópia do modelo de 79 malhas derivado de **BodyParts3D © The Database Center for Life Science**, sob [CC BY-SA 2.1 JP](https://creativecommons.org/licenses/by-sa/2.1/jp/deed.en), preservado de `DrMarioNascimento/lab-ra/bancadas/11-coracao/export/coracao-bancada11-WIP.glb`, revisão `85d13200078f5201d251c857efde5326cd53daa7`.

SHA-256: `b717a1f2e3880835703d4088a2cc99e06e01efc49695e7e55abf32d5c6af79cd`.

O modelo interno continua em desenvolvimento. A composição, a paleta e o movimento foram adaptados na origem; consulte [metadados](../coracao/MODELO-INTERNO.json), [atribuições](../coracao/ATTRIBUTION.md) e [licenças](../coracao/LICENSE.md).

## Tórax completo da experiência de Pleura

`torax-completo-lobos-corrigidos.glb` deriva de **BodyParts3D © The Database Center for Life Science**, sob [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Fonte e termos do atlas: [BodyParts3D](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/) e [licença](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html).

A versão reúne caixa torácica, pulmões, coração, vias aéreas e diafragma, com orientação e unidades ajustadas para a cena. Os cinco lobos foram reconstruídos como envelopes contínuos mantendo suas dimensões; fissuras são sulcos superficiais aproximados. O entalhe cardíaco esquerdo foi preservado. O diafragma manteve suas extensões e foi conformado localmente à base pulmonar para evitar interseção. Esta revisão acrescenta tubos esquemáticos, criados para esta cena, para artérias pulmonares, quatro veias pulmonares, veias cavas e vasos coronários. Vermelho representa as artérias sistêmicas/coronárias e as veias pulmonares; azul representa as artérias pulmonares, veias cavas e veias coronárias. As malhas preexistentes e suas dimensões foram preservadas.

SHA-256: `f990cb7e6044cb874f99ec476f22d305077bbdfc7381026168bc8b7b768f78fa`.

## Coração e vasos em foco

`coracao-e-vasos-foco.glb` é uma seleção de 24 peças do tórax completo acima: miocárdio, grandes vasos, conexões pulmonares e vasos coronários. Conserva os mesmos dados geométricos, materiais, dimensões e posições; apenas remove as estruturas que ocultavam os vasos e os dados não utilizados. As fontes, atribuições e licenças são as mesmas do tórax completo. A seleção pode ser reproduzida com `node ra/scripts/gerar-coracao-vasos-foco.mjs`.

SHA-256: `2907f30e3805c81e055dc9bca69bf6b268ff1128ec6611cc1150a9c31ed75ad9`.

## Cálculo dos movimentos

Os batimentos de cada área cardíaca (segmento) foram cuidadosamente calculados pelo **Prof. Mário César Nascimento, PhD**, e sincronizados ao ciclo cardíaco simulado. Essa autoria se refere ao trabalho do simulador; os modelos de terceiros conservam seus autores e licenças. A página anima a peça; a RA apresenta o instante estático escolhido.

## Modelo aprovado da simulação de Pleura

pleura-simulacao-aprovada.glb é um instante estático de repouso da simulação de Pleura, com clavículas e escápulas derivadas de BodyParts3D (CC BY 4.0), coração Realistic Human Heart de neshallads (CC BY 4.0), bordas pulmonares revisadas e normais das fissuras corrigidas. A borda esquerda foi simplificada visualmente conforme aprovação do autor. As atribuições anteriores continuam aplicáveis.

SHA-256: c126a8dec4ae0d80d9360593f5f8d4347cf28ceeb17fab678d2260358d62c267.
