# Do nervo à força

Experiência original do Sistema Muscular, para EF e Fisioterapia. Cinco ampliações: O encontro, O terminal, A fenda, A tríade e A contração. Sem mesas, pedestais, autenticação Google ou dependências do Lab RA.

Anatomia procedural: axônio mielinizado antes da arborização terminal, células de Schwann, vesículas e mitocôndrias em corte, membranas separadas por uma fenda, pregas com receptores nicotínicos nas cristas e canais de sódio nas regiões profundas. Tríade com túbulo T entre duas cisternas do retículo. Dimensões, cores e partículas são ilustrativas; não há escala comum aos cinco níveis.

O sarcômero do nível 5 importa `../musculo-sarcomero/modelos.js`, conservando o modelo aprovado. Nenhum arquivo dessa experiência foi alterado. O encurtamento é uma visualização em carga livre ilustrativa, não uma previsão de força, trabalho ou relação força–velocidade.

## Modelo causal e unidades

Uma fibra e um terminal: sem recrutamento. Passo fixo de 0,1 ms; impulso inicial aos 20 ms. Um impulso tem janela de 320 ms; a sequência de 1–50 Hz termina até 400 ms e usa janela de 650 ms para mostrar recuperação. Velocidade altera apenas a reprodução: 1× corresponde a 40 ms simulados por segundo real. Pausa e cursor preservam o mesmo instante em cena, leituras e gráficos.

- Acetilcolina: diferença de exponenciais normalizada, atraso de 0,6 ms, constantes de subida/queda de 0,3/2,5 ms. O controle de liberação multiplica essa resposta, sem farmacologia ou depleção.
- Potencial de placa: repouso de −90 mV mais ganho ilustrativo de 45 mV × acetilcolina × receptores; limitado ao potencial de reversão de 0 mV. O fator de segurança é a despolarização máxima dividida por 25 mV; não é medição clínica.
- Potencial de ação muscular: disparado na passagem ascendente por −65 mV; período refratário de 6 ms. Curva por trechos de amplitude fixa, pico +30 mV e pós-hiperpolarização −96 mV. Não resolve Hodgkin–Huxley nem correntes individuais.
- Cálcio pré-sináptico: sinal relativo separado, acionado pelo impulso nervoso. Reduzir a liberação não elimina esse sinal.
- Cálcio muscular: transientes normalizados somados, atraso de 2 ms após o disparo muscular, subida/queda de 2/35 ms. Representa qualitativamente liberação pelo RyR1 e recaptura por SERCA, sem concentração absoluta ou dinâmica espacial.
- Ativação: alvo `Ca²/(Ca²+0,3²)`, relaxação exponencial com constantes de 35 ms na subida e 65 ms na queda. Relativa, entre 0 e 1, posterior ao cálcio. Não é força em newtons.

Os estados rápidos comparam abalo, somação, alta frequência e falha de transmissão por menor liberação ou menos receptores. Não representam doenças específicas, doses, fadiga, desensibilização, metabolismo ou uma simulação clínica. Alta frequência produz uma resposta contrátil mais sustentada neste modelo idealizado.

## Exploração e RA

Iniciar/Pausar, Reiniciar, Recentrar, Legendas, Ampliar, Velocidade e Instante da observação. Os cinco botões de navegação e a seleção de RA ficam disponíveis. A exportação GLB leva a peça e o instante pausados; o modelo é ampliado para aproximadamente 65 cm. A animação fica na página. Abrir a câmera exige aparelho e navegador compatíveis; preparação de GLB não confirma funcionamento em hardware físico.

Os quatro Tutores compartilham catálogo, roteiro e três questões; os links preservam o percurso e abrem nova aba. A IA usa o catálogo do serviço existente, sem acesso ao estado da cena em tempo real.

## Referências conceituais

- [Wood & Slater (1997), contribuição das pregas pós-sinápticas para o fator de segurança](https://pubmed.ncbi.nlm.nih.gov/9097941/).
- [A stochastic simulation of skeletal muscle calcium transients in a structurally realistic sarcomere model using MCell](https://pmc.ncbi.nlm.nih.gov/articles/PMC6424466/).

Referências sustentam os mecanismos e a organização; seus parâmetros experimentais não foram transplantados para este exercício. Cálculos e testes estão em `fisica.js` e `../tests/juncao-neuromuscular.test.mjs`.
