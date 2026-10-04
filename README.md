# Fisiologia Interativa

**English** · [Português](#português)

Interactive human physiology simulators for Physical Education and Physiotherapy students: change parameters, compare physiological states and watch variables interact in real time. Runs in any browser, mobile-friendly.

**Fisiologia Interativa** is a personal intellectual project created and maintained by **Mário César Nascimento, PhD**. The author's affiliation with CEFID/UDESC is stated for academic information only and does not imply institutional authorship or ownership of this repository.

## Access

- **Physical Education:** [drmarionascimento.github.io/fisiologia-interativa](https://drmarionascimento.github.io/fisiologia-interativa/)
- **Physiotherapy:** [drmarionascimento.github.io/fisiologia-interativa/fisioterapia](https://drmarionascimento.github.io/fisiologia-interativa/fisioterapia/)

The interface and all content are in Portuguese.

## Who it is for

Undergraduate students and teachers in Physical Education (teaching and bachelor's degrees), Physiotherapy and other health programs that include human physiology. The simulators can be projected in class or used individually on a computer or smartphone.

## What is included

Both courses share the same simulator files; each has its own learning path, defined in `inicio/dados-ef.js` (Physical Education) and `inicio/dados-fi.js` (Physiotherapy).

| Unit | Physical Education | Physiotherapy |
|---|---|---|
| Cell physiology, membrane transport and action potentials | yes | yes |
| Excitability and the muscular system | yes | yes |
| Musculoskeletal system (calcium homeostasis, bone mechanotransduction / Wolff's law) | yes | — |
| Cardiovascular system | yes | yes |
| Respiratory system | yes | yes, plus the **Neonatal Pulmonary Ventilation** module |
| Cardiorespiratory integration | yes, closing challenge **Athlete's Box** | yes, closing challenge **Physiological ICU** |

Each course home page also offers:

- mind maps for review and visual reading guides for the in-depth modules;
- a guided study **tutor** per course, with an optional AI mode (Google Gemini) that the student turns on voluntarily; without it, the guided tutor, maps and questions keep working locally;
- one escape room per unit from the companion project [Fisiologia em Fuga](https://drmarionascimento.github.io/fisiologia-em-fuga/), plus a final "Operação Secreta" covering all units.

### Augmented reality

Eight independent experiences run in this repository, without Google sign-in or runtime dependencies on the former Lab RA repository:

| System | Experience | Explore |
|---|---|---|
| Cardiovascular | Heart in action: external and internal views, beating, valves and Wiggers diagram | [Heart](https://drmarionascimento.github.io/fisiologia-interativa/ra/coracao/) |
| Cardiovascular | Venous return: posture, arterial/venous pressures, valves and muscle pump | [Venous return](https://drmarionascimento.github.io/fisiologia-interativa/ra/retorno-venoso/) |
| Respiratory | Pleura: layers, alveolar gradient, West zones and ventilation | [Pleura](https://drmarionascimento.github.io/fisiologia-interativa/ra/pleura/) |
| Cellular | Charge film: neuron, organelles, bilayer, transport and action potential | [Charge film](https://drmarionascimento.github.io/fisiologia-interativa/ra/potencial-membrana/) |
| Cellular · Unit 1 | Starling forces: microvascular exchange, glycocalyx, edema and lymph | [Starling forces](https://drmarionascimento.github.io/fisiologia-interativa/ra/starling/) |
| Osteoarticular (EF), muscular (Physiotherapy) | Exploded bone anatomy, compact/spongy tissue, vascularized osteon, cellular transport and collagen–mineral formation under mechanical load | [Journey into living bone](https://drmarionascimento.github.io/fisiologia-interativa/ra/osso-vivo/) |
| Muscular | Nerve to force: neuromuscular junction, excitation–contraction coupling and synchronized signals | [Nerve to force](https://drmarionascimento.github.io/fisiologia-interativa/ra/juncao-neuromuscular/) |
| Muscular | Muscle to sarcomere: five structural levels, filament sliding and length–tension curve | [Muscle to sarcomere](https://drmarionascimento.github.io/fisiologia-interativa/ra/musculo-sarcomero/) |

The Tutors provide course-specific links. The browser shows the animation; augmented reality presents the selected static state on a compatible device. Pressures are displayed in mmHg and cmH₂O. See [RA documentation](ra/README.md).

The *Realistic Human Heart* reference applies **only to the External View**; the Internal View derives from BodyParts3D and has separate credits. The beating movements for each cardiac area (segment) were carefully calculated by **Mário César Nascimento, PhD**, and synchronized with the simulated cardiac cycle. Third-party models retain their own licenses, documented in [asset credits](ra/assets/ATRIBUICAO.md) and [heart licenses](ra/coracao/LICENSE.md).

The simulators are simplified educational models. They do not replace academic sources, clinical assessment, diagnosis, prescription or professional guidance.

## Technology

- Static website: HTML, CSS and JavaScript, no build step, no database, no user accounts; relative paths throughout.
- Fonts loaded from Google Fonts (browser defaults are used if unavailable).
- The only server-side part is the optional AI tutor API (Node.js on Google Cloud Run, see [TUTOR-IA.md](TUTOR-IA.md)); the site works without it.
- Automated tests use Playwright and Node's test runner during development only.

See the Portuguese section for the full simulator list, folder structure and maintenance notes.

## Authorship and license

**Author:** Mário César Nascimento, PhD · [github.com/DrMarioNascimento](https://github.com/DrMarioNascimento)

License: see [LICENSE.md](LICENSE.md) (all rights reserved; functional educational use permitted).

---

## Português

**Simuladores educacionais para explorar mecanismos, testar cenários e integrar variáveis da Fisiologia Humana.**

A **Fisiologia Interativa** é um projeto intelectual pessoal, desenvolvido, organizado e mantido por **Mário César Nascimento, PhD**. A vinculação profissional do autor ao CEFID/UDESC é indicada apenas como informação acadêmica e não representa atribuição automática de autoria ou titularidade institucional sobre este repositório.

O projeto complementa aulas, estudos dirigidos e atividades acadêmicas por meio de modelos interativos que permitem modificar parâmetros, comparar estados fisiológicos e observar, em tempo real, as relações entre diferentes variáveis.

## Acesso

- **Educação Física:** [drmarionascimento.github.io/fisiologia-interativa](https://drmarionascimento.github.io/fisiologia-interativa/)
- **Fisioterapia:** [drmarionascimento.github.io/fisiologia-interativa/fisioterapia](https://drmarionascimento.github.io/fisiologia-interativa/fisioterapia/)
- **Hospedagem institucional:** em processo de implantação na infraestrutura da UDESC (endereço institucional sugerido: `fisiologia-interativa-sites.cefid.udesc.br`)

## Público-alvo

O material foi desenvolvido principalmente para estudantes e professores de:

- Educação Física — Licenciatura;
- Educação Física — Bacharelado;
- Fisioterapia;
- demais cursos da área da saúde que incluam Fisiologia Humana em sua formação.

## Finalidade educacional

A plataforma busca favorecer uma aprendizagem ativa e integrativa da Fisiologia Humana. Seus recursos permitem:

- visualizar processos fisiológicos dinâmicos;
- relacionar mecanismos celulares, sistêmicos e integrados;
- alterar parâmetros e interpretar seus efeitos;
- comparar repouso, exercício e situações fisiopatológicas;
- apoiar aulas expositivas, atividades práticas e estudo autônomo;
- aproximar conceitos fisiológicos de aplicações em Educação Física e Fisioterapia.

## Como utilizar

A proposta de exploração segue quatro momentos:

1. **Relembre:** revise o conteúdo por meio dos mapas mentais;
2. **Selecione:** escolha um estado fisiológico ou uma situação disponível;
3. **Ajuste:** modifique os parâmetros do simulador;
4. **Interprete:** observe gráficos, indicadores e relações entre as variáveis.

Os simuladores podem ser utilizados em projeção durante as aulas ou individualmente em computador e smartphone, conforme a interface de cada módulo.

## Aviso importante

Este projeto tem finalidade exclusivamente **didática e educacional**. Os simuladores representam modelos simplificados de fenômenos fisiológicos e não substituem fontes acadêmicas, avaliação clínica, diagnóstico, prescrição ou orientação profissional em saúde.

## O que a plataforma oferece

### Organização curricular

Os dois cursos usam os mesmos arquivos de simuladores, mas cada um tem percurso pedagógico próprio: a diferença está na organização das unidades, nos textos de orientação e na ordem dos cards, não na duplicação de arquivos ou de modelos.

**Educação Física** — seis unidades:

1. Fisiologia celular, transporte de substâncias e potenciais de ação
2. Excitabilidade e Sistema Muscular
3. Sistema Osteoarticular
4. Sistema cardiovascular
5. Sistema respiratório
6. Integração cardiorrespiratória — desafio de fechamento: **Box do Atleta**

**Fisioterapia** — cinco unidades:

1. Fisiologia celular, transporte de substâncias e potenciais de ação
2. Excitabilidade e Sistema Muscular
3. Sistema cardiovascular
4. Sistema respiratório — inclui o módulo **Ventilação Pulmonar Neonatal**, exclusivo da Fisioterapia
5. Integração cardiorrespiratória — desafio de fechamento: **UTI fisiológica**

A unidade de Sistema Osteoarticular (Homeostase do cálcio e Mecanotransdução Óssea e Lei de Wolff) faz parte apenas do percurso da Educação Física; os arquivos permanecem no projeto, mas não são exibidos no índice da Fisioterapia.

### Simuladores disponíveis

A fonte de verdade da lista é `inicio/dados-ef.js` (Educação Física) e `inicio/dados-fi.js` (Fisioterapia); esta tabela resume o conteúdo desses arquivos.

| Unidade | Simulador | Percurso | Objetivo pedagógico |
|---|---|---|---|
| Fisiologia celular | Osmose e equilíbrio hidroeletrolítico | EF e Fisio | Comparar osmolalidade e tonicidade entre LIC e LEC, a ureia como osmol ineficaz, distúrbios do sódio e da água e os efeitos de NaCl 0,9%, NaCl 3% e SG 5%. |
| Fisiologia celular | Homeostase integrada tricompartimentada | EF e Fisio | Relacionar plasma, interstício e célula — osmose, forças de Starling, potencial de membrana e regulação por rim, ADH e sede — nas respostas a sal, água, K⁺, perdas e hemorragia. |
| Fisiologia celular | Potencial de ação na membrana | EF e Fisio | Acompanhar em sete etapas as mudanças de permeabilidade, os fluxos de Na⁺ e K⁺ e a variação do potencial de membrana. |
| Fisiologia celular | Potencial de ação do neurônio | EF e Fisio | Visualizar o impulso nervoso, a membrana ampliada e a abertura sequencial dos canais dependentes de voltagem. |
| Fisiologia celular | Transporte ativo secundário — SGLT | EF e Fisio | Relacionar o gradiente de Na⁺, a Na⁺/K⁺ ATPase e o cotransporte de glicose através da membrana. |
| Fisiologia celular | Potencial de ação cardíaco | EF e Fisio | Reconhecer as fases do potencial de ação do cardiomiócito e relacioná-las aos fluxos iônicos e ao período refratário. |
| Sistema muscular | Contração muscular esquelética | EF e Fisio | Do potencial de ação no sarcolema ao relaxamento pela SERCA: DHPR–RyR1, Ca²⁺ na troponina C, ciclo das pontes cruzadas (Pi e ATP) e sarcômero em escala com zona H e banda I; compara abalo, tétano, rigor e bloqueios. |
| Sistema muscular | Acoplamento excitação–contração | EF e Fisio | Conectar a chegada do impulso nervoso à liberação de Ca²⁺ e à exposição dos sítios de ligação da actina. |
| Sistema muscular | Contração muscular e sarcômero | EF e Fisio | Do músculo aos filamentos em sete etapas: motoneurônio α, ACh na placa motora, túbulos T (DHPR–RyR1), Ca²⁺ na troponina C, pontes cruzadas e relaxamento pela SERCA. |
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

Os módulos de aprofundamento **Da intenção ao movimento**, **Sangue** e **Ventilação Pulmonar Neonatal** têm um guia visual em PDF, acessível pelo link "Leitura complementar" no card do simulador.

### Páginas iniciais

A página inicial de cada curso usa o tema escuro "fluorescência" e é montada a partir de um único arquivo de dados por curso:

- `inicio/dados-ef.js` e `inicio/dados-fi.js` — unidades, simuladores, mapas mentais, leituras complementares, salas da Fisiologia em Fuga, Operação Secreta e desafio de fechamento;
- `inicio/celula-mapa.js` — Célula-Mapa (unidades como células no meio interno), ECG de 75 bpm, ficha da unidade e roleta das salas;
- `inicio/lista.js` — lista das unidades, filtros, busca (Ctrl K), surgimento ao rolar e janela de entrada;
- `inicio/inicio.css` — tokens de cor, tipografia e layout (coluna única no celular).

A Fisioterapia usa o mesmo motor com `inicio/dados-fi.js` (em `fisioterapia/index.html`). As versões anteriores permanecem em `index-legado.html` e `fisioterapia/index-legado.html`. Na página inicial e nos tutores, simuladores, salas e leituras abrem em nova aba.

### Tutores

Os tutores (`tutor-ef.html` e `tutor-fisio.html`) seguem o mesmo padrão visual, com `inicio/tutor-tema.css` e `inicio/tutor-tema.js`. Na página inicial, o tutor abre pelo botão "Estudar … com o tutor" da unidade escolhida, já no eixo correspondente. O arquivo `tutor-ligacao-fuga.js` liga o tutor às salas da Fisiologia em Fuga e à Operação Secreta. `tutor-moodle.html` é a versão do tutor para incorporação no Moodle.

Os quatro acessos preservam o percurso de cada disciplina e o modo guiado local, com IA opcional:

| Acesso | Endereço |
|---|---|
| Tutor Educação Física | [tutor-ef.html](https://drmarionascimento.github.io/fisiologia-interativa/tutor-ef.html) |
| Tutor Fisioterapia | [tutor-fisio.html](https://drmarionascimento.github.io/fisiologia-interativa/tutor-fisio.html) |
| Tutor Moodle — Educação Física | [tutor-moodle.html](https://drmarionascimento.github.io/fisiologia-interativa/tutor-moodle.html) |
| Tutor Moodle — Fisioterapia | [tutor-moodle.html?percurso=fisioterapia](https://drmarionascimento.github.io/fisiologia-interativa/tutor-moodle.html?percurso=fisioterapia) |

### Realidade aumentada

As experiências **Coração em ação**, **Retorno venoso**, **Pleura**, **Do músculo ao sarcômero**, **A película de carga** e **Forças de Starling** são independentes dentro de `ra/`: não exigem credencial Google e não carregam recursos do antigo Lab RA. Coração e Retorno venoso aparecem no destaque cardiovascular; Pleura, no respiratório; Do músculo ao sarcômero, no muscular; A película de carga e Forças de Starling, na Unidade 1 — Celular. Os botões RA usam acabamento dourado, relevo 3D e efeito de pressionamento.

- [Coração em ação](https://drmarionascimento.github.io/fisiologia-interativa/ra/coracao/): vistas interna e externa, contração, valvas, frequência, velocidade, instantes do ciclo e gráfico de Wiggers sincronizados.
- [Retorno venoso](https://drmarionascimento.github.io/fisiologia-interativa/ra/retorno-venoso/): posição em pé/decúbito, PA e PV, válvulas, caminhada e bomba muscular.
- [Pleura](https://drmarionascimento.github.io/fisiologia-interativa/ra/pleura/): camadas, gradiente alveolar, zonas de West, respiração e estados rápidos.
- [Viagem ao osso vivo](https://drmarionascimento.github.io/fisiologia-interativa/ra/osso-vivo/): desmontagem do fêmur, compacto/esponjoso, ósteon vascularizado, osteócito, reabsorção com transporte e formação de colágeno/hidroxiapatita; carga mecânica visível, habitual, exercício e imobilização. Comparação de volumes ilustrativos, sem previsão de densidade mineral. EF: Osteoarticular; Fisioterapia: Sistema muscular. [Modelo e limites](ra/osso-vivo/README.md).
- [Do nervo à força](https://drmarionascimento.github.io/fisiologia-interativa/ra/juncao-neuromuscular/): junção, terminal, fenda, tríade e contração; gráficos sincronizados, estímulos repetidos e transmissão insuficiente. Reutiliza o sarcômero aprovado. [Modelo e limites](ra/juncao-neuromuscular/README.md).
- [Do músculo ao sarcômero](https://drmarionascimento.github.io/fisiologia-interativa/ra/musculo-sarcomero/): músculo, fascículo, fibra, miofibrila e sarcômero, sem bases; giro, rótulos, ampliação, contração e curva comprimento–tensão. A geometria e os cálculos conservam a versão aprovada. [Detalhes e referência](ra/musculo-sarcomero/README.md).

- [A película de carga](https://drmarionascimento.github.io/fisiologia-interativa/ra/potencial-membrana/): neurônio, interior com organelas, película, travessias e onda; Goldman, capacitância e propagação preservados. [Detalhes e limites](ra/potencial-membrana/README.md).

- [Forças de Starling](https://drmarionascimento.github.io/fisiologia-interativa/ra/starling/): rede, capilar, forças, barreira, edema e linfa; princípio clássico e revisado, balanço de líquido, guia de variáveis e cores padronizadas. [Funcionamento e limites](ra/starling/README.md).

As pressões são apresentadas em **mmHg e cmH₂O**. A animação ocorre na página; a RA apresenta o estado estático selecionado e depende de dispositivo/navegador compatíveis. Consulte [documentação RA](ra/README.md), [Coração](ra/coracao/README.md) e [auditoria do Retorno venoso](ra/retorno-venoso/AUDITORIA-FISIOLOGIA.md).

A referência *Realistic Human Heart*, de neshallads, corresponde **somente à Vista Externa**. A Vista Interna deriva do BodyParts3D, com fonte própria. Os batimentos de cada área cardíaca (segmento) foram cuidadosamente calculados pelo **Prof. Mário César Nascimento, PhD**, e sincronizados ao ciclo cardíaco simulado. As limitações do modelo interno e as marcações externas aproximadas permanecem documentadas. Os modelos de terceiros conservam suas licenças: [atribuições dos arquivos](ra/assets/ATRIBUICAO.md) e [licenças do coração](ra/coracao/LICENSE.md).

### Tutor com IA (opcional)

Os tutores podem oferecer **respostas personalizadas com IA** (Google Gemini), ativadas voluntariamente pelo estudante no avatar. Sem a IA, o tutor guiado, os mapas e as questões continuam funcionando localmente. Não há conta de aluno nem histórico de conversas: só as últimas mensagens ficam na memória da página. As respostas geradas por IA podem conter imprecisões e não substituem o material didático nem as aulas.

A API do tutor roda à parte, no Google Cloud Run (`server/tutor.cjs`, imagem definida no `Dockerfile`); a chave fica no Secret Manager e nunca no repositório. Instalação, limites de uso e publicação estão em [TUTOR-IA.md](TUTOR-IA.md).

### Fisiologia em Fuga

Cada unidade termina com uma sala de fuga do projeto [Fisiologia em Fuga](https://drmarionascimento.github.io/fisiologia-em-fuga/), acessível pela roleta abaixo do mapa e pelo cadeado da unidade na lista. A **Operação Secreta** reúne todas as unidades e pede confirmação antes de abrir. Os desafios de fechamento da integração são o **Box do Atleta** (Educação Física) e a **UTI fisiológica** (Fisioterapia).

## Características técnicas

- aplicação web estática, em HTML, CSS e JavaScript;
- não utiliza banco de dados nem conta de usuário;
- não requer compilação, processo de build nem instalação de dependências para uso;
- índices de acesso: `index.html` (Educação Física) e `fisioterapia/index.html` (Fisioterapia);
- simuladores distribuídos em arquivos HTML independentes, compartilhados pelos dois índices;
- links internos e recursos configurados com caminhos relativos;
- funcionamento por hospedagem HTTP/HTTPS convencional de arquivos estáticos;
- fontes carregadas do Google Fonts (sem elas, o navegador usa fontes padrão);
- única parte com servidor: a API opcional do tutor com IA (Node.js no Cloud Run, ver [TUTOR-IA.md](TUTOR-IA.md)); o site continua estático e funciona sem ela.

## Manutenção

### Estrutura geral

```text
fisiologia-interativa/
├── index.html                 # página inicial da Educação Física
├── index-legado.html          # página inicial anterior (EF)
├── *.html                     # simuladores independentes
├── *-visual.css / *-visual.js # camadas visuais de alguns simuladores
├── atleta-box.html            # desafio de fechamento da Educação Física
├── atleta-motor.js            # motor fisiológico do Box do Atleta
├── atleta-motor.test.cjs      # testes do motor do Box do Atleta
├── card-*-aprofundamento.js   # cards de aprofundamento das páginas iniciais legadas
├── tutor-ef.html              # tutor da Educação Física
├── tutor-fisio.html           # tutor da Fisioterapia
├── tutor-moodle.html          # tutor para incorporação no Moodle
├── tutor-*.js / tutor-*.css   # dados e componentes dos tutores
├── TUTOR-IA.md                # tutor com IA: configuração e publicação
├── Dockerfile                 # imagem da API do tutor (Cloud Run)
├── server/                    # API do tutor com IA e scripts de publicação
├── inicio/                    # motor das páginas iniciais e tema dos tutores
│   ├── dados-ef.js / dados-fi.js
│   ├── celula-mapa.js / lista.js / inicio.css
│   └── tutor-tema.css / tutor-tema.js
├── ra/                        # experiências independentes de realidade aumentada
│   ├── coracao/ / retorno-venoso/ / pleura/ / musculo-sarcomero/ / potencial-membrana/ / starling/ / juncao-neuromuscular/ / osso-vivo/
│   ├── assets/ / brand/       # modelos com créditos próprios e identidade visual
│   └── tests/ / manifesto.json # testes e integridade dos arquivos
├── fisioterapia/
│   ├── index.html             # página inicial da Fisioterapia
│   ├── index-legado.html      # página inicial anterior (Fisio)
│   ├── uti-fisiologica.html   # desafio de fechamento da Fisioterapia
│   └── uti-motor.js / uti-visual.css
├── assets/
│   ├── maps/                  # mapas mentais
│   ├── salas/                 # imagens das salas da Fisiologia em Fuga
│   ├── leituras/              # guias visuais e leituras complementares
│   ├── data/                  # dados usados por alguns simuladores
│   └── demais recursos visuais
├── tests/
│   ├── visual/                # testes Playwright (página inicial, Da intenção ao movimento)
│   └── tutor/                 # testes do servidor e do tutor no navegador
└── .github/workflows/         # testes automáticos no GitHub Actions
```

### Testes

Os testes são usados apenas no desenvolvimento (requerem Node.js; `npm install` instala o Playwright):

- `npm run test:visual` — testes Playwright da pasta `tests/visual/`;
- `npm run test:intencao` — auditoria visual de Da intenção ao movimento;
- `npm run test:tutor` e `npm run test:tutor:browser` — testes do servidor e do tutor no navegador;
- `npm run test:ra` — modelos, cálculos, sincronização, recursos e navegação das experiências RA;
- `node --test atleta-motor.test.cjs` — testes do motor fisiológico do Box do Atleta.

No GitHub Actions, `playwright-visual.yml` roda a auditoria visual e `tutor-tests.yml` roda os testes dos tutores quando os arquivos correspondentes mudam.

### Publicação

A versão pública atual é publicada pelo GitHub Pages a partir deste repositório. O projeto também está sendo preparado para hospedagem institucional na UDESC por meio do OpenShift; a SETIC/CINF será responsável pela infraestrutura e pelo fluxo institucional de publicação. A revisão científica, a manutenção e a atualização do conteúdo permanecem sob responsabilidade do autor.

Os simuladores permanecem na pasta principal e são compartilhados pelos dois índices. Dessa forma, uma correção ou melhoria em qualquer modelo é refletida automaticamente nos percursos de Educação Física e Fisioterapia; somente a organização curricular de cada página inicial é mantida separadamente, em `inicio/dados-ef.js` e `inicio/dados-fi.js`.

Como o projeto utiliza caminhos relativos e não depende de processamento no servidor, pode ser publicado em um subdiretório ou domínio institucional destinado a conteúdo estático.

## Autoria, licença e contato

**Autor e titular declarado:** Mário César Nascimento, PhD  
**Projeto pessoal:** Fisiologia Interativa  
**Perfil responsável:** [DrMarioNascimento](https://github.com/DrMarioNascimento)

A vinculação profissional do autor ao CEFID/UDESC não transfere, por si só, a autoria declarada neste repositório nem identifica a Universidade como licenciadora deste projeto.

Copyright © 2026 Mário César Nascimento. Todos os direitos reservados.

Licença: ver [LICENSE.md](LICENSE.md) (todos os direitos reservados; uso educacional funcional permitido). A disponibilização pública do código não autoriza sua cópia, adaptação, republicação ou exploração comercial.


## Corpo em ação — Integração

[Experiência 3D e RA animada](https://drmarionascimento.github.io/fisiologia-interativa/ra/integracao/) conecta respiração, coração, circulação e utilização de O₂ no mesmo estado de repouso/exercício. Cinco aproximações, transição gradual, rótulos, velocidade e sequência automática. Corpo e coração comprimidos com Meshopt sem simplificação; animação calculada em execução. Card na unidade Integração nos dois percursos e catálogo dos quatro Tutores. RA viva exige WebXR com controles sobrepostos; a câmera precisa ser validada em aparelho físico. [Modelo, limites e referências](ra/integracao/README.md).
