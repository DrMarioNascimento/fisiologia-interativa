# Fisiologia Interativa

**Simuladores educacionais para explorar mecanismos, testar cenários e integrar variáveis da Fisiologia Humana.**

A **Fisiologia Interativa** é um projeto intelectual pessoal, desenvolvido, organizado e mantido por **Mário César Nascimento, PhD**. A vinculação profissional do autor ao CEFID/UDESC é indicada apenas como informação acadêmica e não representa atribuição automática de autoria ou titularidade institucional sobre este repositório.

O projeto complementa aulas, estudos dirigidos e atividades acadêmicas por meio de modelos interativos que permitem modificar parâmetros, comparar estados fisiológicos e observar, em tempo real, as relações entre diferentes variáveis.

## Acesso

- **Educação Física:** [drmarionascimento.github.io/fisiologia-interativa](https://drmarionascimento.github.io/fisiologia-interativa/)
- **Fisioterapia:** [drmarionascimento.github.io/fisiologia-interativa/fisioterapia](https://drmarionascimento.github.io/fisiologia-interativa/fisioterapia/)
- **Hospedagem institucional:** em processo de implantação na infraestrutura da UDESC
- **Endereço institucional sugerido:** `fisiologia-interativa-sites.cefid.udesc.br`

## Páginas iniciais e tutores (Educação Física e Fisioterapia)

A página inicial usa o tema escuro "fluorescência" e é montada a partir de um único arquivo de dados por curso:

- `inicio/dados-ef.js` e `inicio/dados-fi.js` — unidades, simuladores, mapas mentais, salas da Fisiologia em Fuga, Operação Secreta e desafio de fechamento;
- `inicio/celula-mapa.js` — Célula-Mapa (unidades como células no meio interno), ECG de 75 bpm, ficha da unidade e roleta das salas;
- `inicio/lista.js` — lista das unidades, filtros, busca (Ctrl K), surgimento ao rolar e janela de entrada;
- `inicio/inicio.css` — tokens de cor, tipografia e layout (coluna única no celular).

A Fisioterapia usa o mesmo motor com `inicio/dados-fi.js` (em `fisioterapia/index.html`). As versões anteriores permanecem em `index-legado.html` e `fisioterapia/index-legado.html`. Na página inicial e nos tutores, simuladores, salas e leituras abrem em nova aba.

### Tutores

Os tutores (`tutor-ef.html` e `tutor-fisio.html`) seguem o mesmo padrão visual, com `inicio/tutor-tema.css` e `inicio/tutor-tema.js`. Na página inicial, o tutor abre pelo botão "Estudar … com o tutor" da unidade escolhida, já no eixo correspondente. O arquivo `tutor-ligacao-fuga.js` liga o tutor às salas da Fisiologia em Fuga e à Operação Secreta.

### Fisiologia em Fuga

Cada unidade termina com uma sala de fuga do projeto [Fisiologia em Fuga](https://drmarionascimento.github.io/fisiologia-em-fuga/), acessível pela roleta abaixo do mapa e pelo cadeado da unidade na lista. A **Operação Secreta** reúne todas as unidades e pede confirmação antes de abrir. Os desafios de fechamento são o **Box do Atleta** (Educação Física) e a **UTI fisiológica** (Fisioterapia). As imagens das salas ficam em `assets/salas/` (miniaturas quadradas) e `assets/salas/grande/` (versões verticais usadas na vitrine).

## Finalidade educacional

A plataforma busca favorecer uma aprendizagem ativa e integrativa da Fisiologia Humana. Seus recursos permitem:

- visualizar processos fisiológicos dinâmicos;
- relacionar mecanismos celulares, sistêmicos e integrados;
- alterar parâmetros e interpretar seus efeitos;
- comparar repouso, exercício e situações fisiopatológicas;
- apoiar aulas expositivas, atividades práticas e estudo autônomo;
- aproximar conceitos fisiológicos de aplicações em Educação Física e Fisioterapia.

## Público-alvo

O material foi desenvolvido principalmente para estudantes e professores de:

- Educação Física — Licenciatura;
- Educação Física — Bacharelado;
- Fisioterapia;
- demais cursos da área da saúde que incluam Fisiologia Humana em sua formação.

## Organização curricular

A plataforma utiliza os mesmos simuladores compartilhados, mas apresenta percursos pedagógicos próprios para cada formação. A diferença está na organização, nos textos de orientação e na ordem dos cards — não na duplicação de arquivos ou de modelos.

### Educação Física

O índice principal é organizado em seis eixos:

1. **Fisiologia celular, transporte de substâncias e potenciais de ação**
2. **Excitabilidade e sistema muscular**
3. **Sistema osteoarticular**
4. **Sistema cardiovascular**
5. **Sistema respiratório**
6. **Integração cardiorrespiratória**

### Fisioterapia

O índice específico da Fisioterapia reúne os simuladores em cinco Unidades:

1. **Fisiologia celular, transporte de substâncias e potenciais de ação**
2. **Excitabilidade e Sistema Muscular**
3. **Sistema cardiovascular**
4. **Sistema respiratório**
5. **Integração cardiorrespiratória**

O simulador de homeostase do cálcio e o tópico osteoarticular permanecem disponíveis no projeto e no percurso da Educação Física, mas não são exibidos no índice específico da Fisioterapia.

## Simuladores disponíveis

A fonte de verdade da lista é `inicio/dados-ef.js` (Educação Física) e `inicio/dados-fi.js` (Fisioterapia); esta tabela resume o conteúdo desses arquivos.

| Eixo | Simulador | Percurso | Objetivo pedagógico |
|---|---|---|---|
| Fisiologia celular | Potencial de ação na membrana | EF e Fisio | Acompanhar em sete etapas as mudanças de permeabilidade, os fluxos de Na⁺ e K⁺ e a variação do potencial de membrana. |
| Fisiologia celular | Potencial de ação do neurônio | EF e Fisio | Visualizar o impulso nervoso, a membrana ampliada e a abertura sequencial dos canais dependentes de voltagem. |
| Fisiologia celular | Transporte ativo secundário — SGLT | EF e Fisio | Relacionar o gradiente de Na⁺, a Na⁺/K⁺ ATPase e o cotransporte de glicose através da membrana. |
| Fisiologia celular | Potencial de ação cardíaco | EF e Fisio | Reconhecer as fases do potencial de ação do cardiomiócito e relacioná-las aos fluxos iônicos e ao período refratário. |
| Fisiologia celular | Osmose e equilíbrio hidroeletrolítico | Fisio | Comparar tonicidade, osmolaridade e distribuição de água entre LIC e LEC. |
| Fisiologia celular | Homeostase integrada tricompartimentada | Fisio | Relacionar plasma, líquido intersticial e LIC em um modelo integrado de transporte e distribuição de água. |
| Sistema muscular | Contração muscular esquelética | EF e Fisio | Acompanhar do potencial de ação ao relaxamento: ACh, placa motora, Ca²⁺, pontes cruzadas, ATP e sarcômero. |
| Sistema muscular | Acoplamento excitação–contração | EF e Fisio | Conectar a chegada do impulso nervoso à liberação de Ca²⁺ e à exposição dos sítios de ligação da actina. |
| Sistema muscular | Contração muscular e sarcômero | EF e Fisio | Explorar o ciclo das pontes cruzadas, o consumo de ATP e as alterações da zona H durante a contração. |
| Sistema muscular | Contrações musculares interativas | EF e Fisio | Comparar contrações estática, dinâmica e isocinética, relacionando carga, movimento e produção de força. |
| Sistema muscular | Hill × Isocinético | EF e Fisio | Integrar força, velocidade, ativação neural, torque e potência em diferentes condições de contração. |
| Sistema muscular | Recrutamento de unidades motoras | EF e Fisio | Relacionar recrutamento progressivo, frequência de disparo e tipos de fibras ao desenvolvimento da força muscular. |
| Sistema muscular | Da intenção ao movimento *(módulo de aprofundamento)* | EF e Fisio | Integrar drive motivacional e atenção, giro do cíngulo, relé talâmico, vias motoras, recrutamento, frequência de disparo e acoplamento excitação–contração. |
| Sistema osteoarticular | Homeostase do cálcio | EF | Integrar vitamina D, PTH, calcitonina, intestino, rim, osso e concentração plasmática de cálcio. |
| Sistema osteoarticular | Mecanotransdução Óssea e Lei de Wolff | EF | Relacionar carga mecânica, resposta celular, remodelação óssea e adaptação estrutural segundo a Lei de Wolff. |
| Sistema cardiovascular | Pressão arterial, DC e RPT | EF e Fisio | Relacionar pressão arterial, débito cardíaco, resistência periférica total, PAM e pressão de pulso. |
| Sistema cardiovascular | Retorno venoso | EF e Fisio | Compreender como pressão atrial direita, volume, tônus, complacência, resistência e bombas periféricas determinam o retorno venoso. |
| Sistema cardiovascular | Loop cardíaco funcional | EF e Fisio | Integrar enchimento, ejeção, volumes ventriculares e abertura e fechamento das válvulas ao longo do ciclo cardíaco. |
| Sistema cardiovascular | Lei de Poiseuille | EF e Fisio | Relacionar fluxo, gradiente de pressão, raio, viscosidade e comprimento do vaso. |
| Sistema cardiovascular | Sangue *(módulo de aprofundamento)* | EF e Fisio | Integrar hematopoiese, transporte de oxigênio, viscosidade, débito cardíaco e respostas fisiológicas em cenários clínicos e de exercício. |
| Sistema respiratório | Mecânica ventilatória | EF e Fisio | Visualizar as relações entre pressão pleural, pressão alveolar, volume, complacência, resistência e ventilação minuto. |
| Sistema respiratório | Biofeedback respiratório — PC | EF e Fisio | Guiar ciclos respiratórios no computador com tempos ajustáveis de inspiração, expiração e pausa, favorecendo percepção e autorregulação. |
| Sistema respiratório | Biofeedback respiratório — Smartphone | EF e Fisio | Guiar ciclos respiratórios em uma interface adaptada ao smartphone, com tempos ajustáveis de inspiração, expiração e pausa. |
| Sistema respiratório | Curva de dissociação da hemoglobina | EF e Fisio | Relacionar PO₂, saturação da hemoglobina e deslocamentos da curva provocados por pH, temperatura e 2,3-BPG. |
| Sistema respiratório | Ventilação Pulmonar Neonatal *(módulo de aprofundamento)* | Fisio | Relacionar idade gestacional ao nascimento, idade pós-natal, massa corporal e maturidade pulmonar à mecânica ventilatória neonatal. |
| Integração cardiorrespiratória | Cardiopulmonar integrado | EF e Fisio | Relacionar retorno venoso, débito cardíaco, consumo de oxigênio, pressões e saturações em diferentes estados fisiológicos. |
| Integração cardiorrespiratória | Fick integrado | EF e Fisio | Conectar débito cardíaco, conteúdos arterial e venoso de oxigênio, extração tecidual e consumo de O₂. |
| Integração cardiorrespiratória | Consumo de O₂ e diferença a–vO₂ | EF e Fisio | Integrar consumo de oxigênio, débito cardíaco, diferença arteriovenosa e valor relativo por massa corporal. |
| Integração cardiorrespiratória | Box do Atleta *(desafio de fechamento)* | EF | Provas longas: ritmo, água, sódio, calor, glicogênio e intestino no mesmo atleta. O box mostra o estado; o aluno decide o plano. |
| Integração cardiorrespiratória | UTI fisiológica *(desafio de fechamento)* | Fisio | Plantão de 6 horas: regular água, eletrólitos, circulação, ventilação, ácido-base e rim num único paciente. O monitor mostra o estado; o aluno decide. |

## Como utilizar

A proposta de exploração segue quatro momentos:

1. **Relembre:** revise o conteúdo por meio dos mapas mentais;
2. **Selecione:** escolha um estado fisiológico ou uma situação disponível;
3. **Ajuste:** modifique os parâmetros do simulador;
4. **Interprete:** observe gráficos, indicadores e relações entre as variáveis.

Os simuladores podem ser utilizados em projeção durante as aulas ou individualmente em computador e smartphone, conforme a interface de cada módulo.

## Aviso importante

Este projeto tem finalidade exclusivamente **didática e educacional**. Os simuladores representam modelos simplificados de fenômenos fisiológicos e não substituem fontes acadêmicas, avaliação clínica, diagnóstico, prescrição ou orientação profissional em saúde.

## Características técnicas

- aplicação web estática;
- tecnologias: HTML, CSS e JavaScript;
- não utiliza banco de dados;
- não requer instalação de dependências para uso (os testes automatizados em `tests/` usam Playwright apenas no desenvolvimento);
- não requer compilação ou processo de build;
- índices de acesso: `index.html` (Educação Física) e `fisioterapia/index.html` (Fisioterapia);
- simuladores distribuídos em arquivos HTML independentes;
- recursos visuais organizados na pasta `assets/`;
- links internos e recursos configurados com caminhos relativos;
- funcionamento por hospedagem HTTP/HTTPS convencional de arquivos estáticos;
- fontes carregadas do Google Fonts (sem elas, o navegador usa fontes padrão).

## Estrutura geral

```text
fisiologia-interativa/
├── index.html                 # página inicial da Educação Física
├── index-legado.html          # página inicial anterior (EF)
├── *.html                     # simuladores independentes
├── tutor-ef.html              # tutor da Educação Física
├── tutor-fisio.html           # tutor da Fisioterapia
├── tutor-*.js / tutor-*.css   # dados e componentes dos tutores
├── inicio/                    # motor das páginas iniciais e tema dos tutores
│   ├── dados-ef.js / dados-fi.js
│   ├── celula-mapa.js / lista.js / inicio.css
│   └── tutor-tema.css / tutor-tema.js
├── fisioterapia/
│   ├── index.html             # página inicial da Fisioterapia
│   ├── index-legado.html      # página inicial anterior (Fisio)
│   └── uti-fisiologica.html   # desafio de fechamento da Fisioterapia
├── assets/
│   ├── maps/                  # mapas mentais
│   ├── salas/                 # imagens das salas da Fisiologia em Fuga
│   ├── leituras/              # leituras complementares
│   ├── data/                  # dados usados por alguns simuladores
│   └── demais recursos visuais
└── tests/                     # testes automatizados (Playwright)
```

## Publicação e manutenção

A versão pública atual é publicada pelo GitHub Pages a partir deste repositório. O projeto também está sendo preparado para hospedagem institucional na UDESC por meio do OpenShift.

Os simuladores permanecem na pasta principal e são compartilhados pelos dois índices. Dessa forma, uma correção ou melhoria em qualquer modelo é refletida automaticamente nos percursos de Educação Física e Fisioterapia; somente a organização curricular de cada página inicial é mantida separadamente, em `inicio/dados-ef.js` e `inicio/dados-fi.js`.

A SETIC/CINF será responsável pela infraestrutura e pelo fluxo institucional de publicação. A revisão científica, a manutenção e a atualização do conteúdo permanecem sob responsabilidade do autor.

Como o projeto utiliza caminhos relativos e não depende de processamento no servidor, pode ser publicado em um subdiretório ou domínio institucional destinado a conteúdo estático.

## Autoria e titularidade declarada

**Autor e titular declarado:** Mário César Nascimento, PhD  
**Projeto pessoal:** Fisiologia Interativa  
**Perfil responsável:** [DrMarioNascimento](https://github.com/DrMarioNascimento)

A vinculação profissional do autor ao CEFID/UDESC não transfere, por si só, a autoria declarada neste repositório nem identifica a Universidade como licenciadora deste projeto.

## Direitos autorais e condições de uso

Copyright © 2026 Mário César Nascimento. Todos os direitos reservados.

O uso educacional funcional dos simuladores é permitido nos termos descritos em [LICENSE.md](LICENSE.md). A disponibilização pública do código não autoriza sua cópia, adaptação, republicação ou exploração comercial.
