# Coração em ação · realidade aumentada

Experiência independente do Fisiologia Interativa. Origem confirmada pelo professor: `DrMarioNascimento/lab-ra/bancadas/11-coracao/prototipo/duas-pecas.html`, revisão `85d13200078f5201d251c857efde5326cd53daa7`.

## Vistas preservadas

- Vista Externa: `../assets/coracao.glb`, idêntico ao scan da origem e ao arquivo já usado na Pleura/Retorno venoso; SHA-256 `fcb3c1036fe59dfdcc1c30917dbdaa8fbd52c858e6ba3cadaf126b44ccca4b5b`.
- Vista Interna: `../assets/coracao-interno.glb`, cópia integral do GLB de 79 malhas; SHA-256 `b717a1f2e3880835703d4088a2cc99e06e01efc49695e7e55abf32d5c6af79cd`.

Modelos, cores, materiais, campos de deformação e motor cardíaco conservam a origem. A transferência não corrige as limitações anatômicas do modelo interno em desenvolvimento; consulte `MODELO-INTERNO.json`. Marcação externa é aproximada. Não existe trajeto anatômico do sistema de condução nesses dois modelos; a leitura elétrica e o ECG são esquemáticos.

## Apresentação e controles

Tema, assinatura, cards e navegação seguem as experiências RA do novo repositório. Os dois Tutores oferecem Coração e Retorno venoso no destaque cardiovascular, em nova aba. Voltar ao Tutor preserva Educação Física/Fisioterapia. Não há credencial Google ou dependência de execução do Lab RA.

A experiência abre na Vista Interna, pausada, em 75 bpm e fase 0,300. Iniciar/Pausar, Um ciclo e Reiniciar usam o mesmo relógio da peça, das leituras, das valvas e do gráfico. Um ciclo percorre uma volta a partir do instante corrente e pausa. Mudar o instante pausa a reprodução. Velocidade altera apenas a reprodução; frequência recalcula o ciclo; amplitude e ajustes visuais não alteram o motor. Restaurar parâmetros recupera os valores iniciais e a vista interna; Restaurar vista recupera apenas a câmera.

Enchimento/Ejeção selecionam amostras do ciclo na frequência atual, com os pares apropriados de valvas abertos e fluxo positivo. O gráfico de Wiggers mostra as mesmas pressões/volume/ECG/bulhas do motor, com dimensão responsiva e cursor compartilhado. Cards mostram pressões em mmHg e cmH₂O; a conversão é 1 mmHg = 1,35951 cmH₂O.

## Exportação RA

A RA recebe a vista e o instante pausado escolhidos, com escala anatômica herdada da origem. O exportador calcula normais ausentes antes de preparar o GLB. Trocar vista/instante ou iniciar o ciclo invalida exportações anteriores; o botão permanece desativado durante batimento. A página tem animação; a RA apresenta o estado estático escolhido. Câmera RA exige dispositivo/navegador compatíveis.

## Validação

Testes fisiológicos herdados verificam referências a 75 bpm, fases isovolumétricas, gradientes valvulares, redução de diástole com frequência, condução e atividade elétrica. Testes de migração conferem identidade dos dois GLBs, 79 malhas internas, recursos locais, atribuições, percursos e instantes rápidos. Comparação no navegador verifica posições, transformações, atributos e materiais das duas vistas ao longo do ciclo; verifica também início/pausa, ciclo único, velocidade, responsividade, legendas e exportação GLB de ambas as vistas.

Veja [atribuições](ATTRIBUTION.md) e [licenças](LICENSE.md). A origem permanece disponível e não foi alterada.
