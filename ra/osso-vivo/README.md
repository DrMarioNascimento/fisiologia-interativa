# Viagem ao osso vivo

Experiência procedural original e independente de outros repositórios. Cinco ampliações: fêmur em corte, rede trabecular, osteócito e canalículos, osteoclasto e osteoblastos. A matriz sob as células é o tecido estudado, sem pedestal de apresentação. Three.js 0.180.0 e model-viewer 4.0.0 vêm do CDN; apresentação, geometria e cálculos estão neste repositório.

## Reprodução e escalas

Iniciar/Pausar, Reiniciar, Recentrar, Ampliar, Repetir em loop, Rótulos, Velocidade e Progresso do ciclo. Um único relógio atualiza cena, fase, leituras e cursor. A velocidade altera somente a apresentação. Um ciclo dura 40 segundos a 1×, sem conversão para dias; o loop reapresenta o estado inicial sem acumular matriz. A remodelação real se desenvolve em semanas a meses. A movimentação rápida do fluido e a renovação lenta são ampliações didáticas em escalas distintas.

Trocar nível mantém o progresso e o cenário. Trocar cenário inicia uma nova comparação pausada. Carga habitual, Exercício e Imobilização usam condições fixadas, não uma dose de treino. O percurso EF abre o destaque Osteoarticular; Fisioterapia utiliza Sistema muscular, preservando suas cinco unidades. Os dois Tutores nativos e os dois acessos Moodle compartilham roteiro, três questões e contexto para a IA opcional.

## Cálculo demonstrativo

Uma região inicia com matriz mineralizada = 1. As curvas cumulativas usam smoothstep e frações da apresentação. Reabsorção ocupa 8–30% do ciclo; deposição ocupa 40–85%. Cada parcela depositada começa a mineralizar após uma defasagem de 3% do ciclo, com transição de 12%. Esses intervalos são escolhas de apresentação, sem estimativa de velocidade biológica. A integração determinística usa 100 parcelas da deposição.

- Habitual: retirada final = 0,18; deposição final = 0,18.
- Exercício: retirada = 0,18; deposição = 0,18 × 1,12.
- Imobilização: retirada = 0,18 × 1,12; deposição = 0,18 × 0,65.
- Osteoide ainda não mineralizado = depositada − mineralizada.
- Matriz orgânica e mineral total = 1 − retirada + depositada.
- Matriz mineralizada total = 1 − retirada + mineralizada.

Coeficientes escolhidos para separar tendências, não extraídos de resultados clínicos. Não se calculam densitometria, risco de fratura, idade, hormônios, nutrição, doenças, fármacos, deformação, resistência ou dose de exercício. Esclerostina é uma tendência qualitativa, sem concentração calculada. Espessura trabecular é uma ilustração do balanço da região, sem reconstrução tomográfica.

## RA

Pause e selecione uma das cinco peças. O arquivo GLB preserva a geometria do estado escolhido, sem rótulos, controles ou referências de animação nos extras. A peça é normalizada para aproximadamente 65 cm. A prévia espacial estática funciona no navegador; ativar a câmera requer aparelho compatível e permissão. A animação permanece na página.

## Referências conceituais

- [NIAMS — biologia óssea, remodelação e mecanotransdução](https://www.niams.nih.gov/grants-funding/supported-scientific-areas/bone-biology-metabolic-bone-disorders-and-osteoporosis).
- [NIAMS — Skeletal Mechanobiology Laboratory](https://www.niams.nih.gov/skeletal-mechanobiology-laboratory).
- [Tu et al. — esclerostina, Wnt e resposta à carga](https://pmc.ncbi.nlm.nih.gov/articles/PMC3246572/).
- [NIAMS — exercício e saúde óssea](https://www.niams.nih.gov/health-topics/exercise-your-bone-health).

As fontes fundamentam mecanismos e tendências, não validam os coeficientes demonstrativos. Nenhum modelo ou textura foi copiado dessas fontes. Os modelos originais são abrangidos pela licença do repositório; bibliotecas conservam suas próprias licenças.
