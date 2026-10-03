# Do nervo à força

Experiência original do Sistema Muscular, para EF e Fisioterapia. Cinco ampliações: O encontro, O terminal, A fenda, A tríade e A contração. Sem mesas, pedestais, autenticação Google ou dependências do Lab RA.

Anatomia procedural: axônio com segmentos de mielina e núcleos de Schwann, arborização alongada junto ao sarcolema e núcleos periféricos da fibra. O terminal em corte mostra vesículas de tamanhos variados, algumas junto às zonas ativas, mitocôndrias com cristas e cobertura glial. A fenda mantém as membranas separadas, a bicamada visível na borda, pregas arredondadas com receptores nicotínicos nas cristas, canais de sódio nas regiões profundas e acetilcolinesterase ancorada. Na tríade, o túbulo T cruza o eixo das miofibrilas entre duas cisternas conectadas ao retículo que acompanha os feixes. Texturas, cortes, cores e partículas são ilustrativos; não há escala comum aos cinco níveis.

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

Iniciar/Pausar, Reiniciar, Recentrar, Legendas, Ampliar, Velocidade, Repetir em loop e Instante da observação. O loop é opcional e desmarcado inicialmente: reapresenta o mesmo ensaio, conserva o excedente de tempo na virada e não acumula cálcio ou acrescenta estímulos. Pausa interrompe a reprodução e Reiniciar volta ao início; mudanças de parâmetros iniciam uma nova observação pausada.

Cena, controles e leituras ficam juntos. Gráficos, Como interpretar, Realidade aumentada e Modelo e referências aparecem em abas, sem remover explicações. As setas, Home e End navegam pelas abas; mudar de aba não altera o instante nem a reprodução. Os cinco níveis permanecem disponíveis.

A exportação GLB é preparada ao abrir a aba Realidade aumentada, evitando esse trabalho durante a primeira visualização. Leva a peça e o instante pausados; o modelo é ampliado para aproximadamente 65 cm. A animação fica na página. Abrir a câmera exige aparelho e navegador compatíveis; preparação de GLB não confirma funcionamento em hardware físico.

Os quatro Tutores compartilham catálogo, roteiro e três questões; os links preservam o percurso e abrem nova aba. A IA usa o catálogo do serviço existente, sem acesso ao estado da cena em tempo real.

## Referências conceituais

- [Wood & Slater (1997), contribuição das pregas pós-sinápticas para o fator de segurança](https://pubmed.ncbi.nlm.nih.gov/9097941/).
- [A stochastic simulation of skeletal muscle calcium transients in a structurally realistic sarcomere model using MCell](https://pmc.ncbi.nlm.nih.gov/articles/PMC6424466/).

Referências sustentam os mecanismos e a organização; seus parâmetros experimentais não foram transplantados para este exercício. Cálculos e testes estão em `fisica.js` e `../tests/juncao-neuromuscular.test.mjs`.
