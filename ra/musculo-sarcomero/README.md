# Do músculo ao sarcômero · Sistema muscular

Experiência independente em `Fisiologia Interativa`, acessível pelo destaque RA do Sistema Muscular nos Tutores de Educação Física e Fisioterapia. “Voltar ao Tutor” preserva o percurso de origem. Não exige Google nem carrega recursos do Lab RA.

Origem: `DrMarioNascimento/lab-ra/musculo-sarcomero`, revisão aprovada `6792eb577870bb72933b845791743bc872bcbad2`. O arquivo `modelos.js` foi transferido sem alterações: ventre contínuo, janela no epimísio, fascículos, tendões e os cinco níveis mantêm a versão aprovada. Não há base em nenhum nível.

## Controles

- Músculo → Fascículo → Fibra → Miofibrila → Sarcômero: níveis e escalas distintas.
- Iniciar giro/Pausar giro e Velocidade do giro: rotação da peça, sem efeito nos cálculos. A página abre com o giro pausado.
- Rótulos, Restaurar vista e Ampliar: exploração da cena.
- No Sarcômero, Comprimento do sarcômero, Contrair e Relaxar conservam o mecanismo original. Restaurar parâmetros retorna a 2,4 µm e ao giro pausado, com velocidade 1×.
- Abrir em realidade aumentada exporta o nível e o comprimento selecionados como uma peça estática. A ativação da câmera depende de dispositivo compatível.

## Limites didáticos e referência

A banda A mantém 1,6 µm; banda I e zona H variam com o comprimento, conforme a implementação aprovada. A curva de tensão ativa relativa é uma aproximação por trechos da relação isométrica em fibras musculares de rã de [Gordon, Huxley e Julian (1966)](https://pubmed.ncbi.nlm.nih.gov/5921536/). Não é força absoluta, tensão passiva, curva força–velocidade nem uma medida clínica individual. As contas e o sarcômero não foram modificados na transferência.

Modelos e texturas são procedurais, criados no código do projeto. Não foi acrescentado um modelo anatômico de terceiros. A autoria e a licença principal permanecem em [LICENSE.md](../../LICENSE.md); Three.js e model-viewer conservam suas licenças próprias.
