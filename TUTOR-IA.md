# Tutor com respostas personalizadas — Gemini

O tutor de Educação Física e de Fisioterapia pode explicar dúvidas livres, adaptar uma explicação e comentar o raciocínio numa questão respondida. O servidor fornece ao Gemini o objetivo e o roteiro do módulo, a questão e a alternativa escolhida. Mapas e questões originais continuam locais, inclusive quando a IA está desligada ou indisponível.

Não há conta de aluno, banco de conversas, retomada de estudos ou histórico entre visitas. Somente os três últimos pares de mensagens ficam em memória na página e acompanham uma nova pergunta. Limpar a conversa, recarregar ou sair da página descarta esse contexto. A posição do avatar já era salva pelo site e continua independente.

## Experimentar no computador

Requer Node.js 22.9+ (testado com 24). O servidor não precisa de pacotes npm em produção.

1. Copie `server/.env.example` para `server/.env` e preencha **somente nesse arquivo** `GEMINI_API_KEY` com sua chave existente do projeto gratuito do AI Studio. Não envie a chave por chat nem ao GitHub. No Linux, `python3 server/configure.py` faz esse preenchimento com entrada oculta e permissão restrita; ele substitui a configuração anterior.
2. Na pasta do projeto, execute `npm run start:tutor`.
3. Abra http://127.0.0.1:8787/tutor-ef.html ou http://127.0.0.1:8787/tutor-fisio.html.
4. Abra o avatar e marque **Respostas personalizadas com IA**. Comece por “Por que o sódio entra na célula?” e depois “Explique com uma analogia”. Escolha um cartão de simulador para fixar o assunto; responda uma questão no painel do tutor e peça “Por que errei?”.

Sem chave, o site funciona com o tutor guiado e informa que a IA está indisponível. Os testes automatizados usam respostas simuladas explicitamente; não comprovam a qualidade de uma resposta real do Gemini.

## Uso da API gratuita

O modelo inicial é `gemini-3.6-flash`, correspondente ao modelo da tabela consultada pelo proprietário. `GEMINI_MODEL` permite alterá-lo, após conferir a disponibilidade e a gratuidade no seu projeto. Não há troca automática de modelo ou ativação de faturamento. A integração não consegue garantir gratuidade se a conta for convertida ao nível pago.

No nível gratuito, o Google pode usar o conteúdo enviado para melhorar seus produtos; por isso a interface pede ativação voluntária e orienta a não enviar dados pessoais. Não salvar conversas neste projeto não significa que o provedor não processe ou retenha dados. Confira [preços](https://ai.google.dev/gemini-api/docs/pricing) e [termos](https://ai.google.dev/gemini-api/terms).

Há limite local de 6 chamadas por minuto por IP, duas simultâneas e 100 por dia UTC para o processo. A cota diária pode ser ajustada com `TUTOR_DAILY_LIMIT`; contadores ficam em memória e reiniciam junto com o servidor. Atrás de um proxy, o limite por IP é compartilhado: cabeçalhos de IP enviados pelo cliente não são aceitos. Esses controles complementam as cotas do Google, não são um limite de faturamento da conta nem autenticação de alunos. Para uma turma grande, preparar autenticação e controle de abuso antes da abertura pública.

## Servidor Google e publicação

Publicado em 05/09/2026. O GitHub Pages serve as páginas e a VM `convite-rasgado-bot`, zona `us-central1-a`, serve a API em `https://tutor-fisiologia.35.208.107.43.sslip.io/api/tutor`. A opção **Respostas personalizadas com IA** precisa ser marcada pelo aluno. O serviço `convite-bot` permanece independente.

Para testar na VM: transfira o projeto para uma pasta própria, instale Node.js 22.9+ e configure a chave nessa pasta. Inicie com `npm run start:tutor`; o padrão escuta apenas em `127.0.0.1:8787`. Para abrir no seu computador, use um túnel SSH: `gcloud compute ssh convite-rasgado-bot --project=convite-rasgado-bot --zone=us-central1-a -- -L 8787:127.0.0.1:8787`, mantendo a conexão aberta. Depois visite o endereço local do passo 3. O gcloud precisa estar instalado e autenticado no computador.

Na VM, o código fica em `/opt/tutor-fisiologia`, o Node 24 em `/opt/tutor-node` e a chave em `/etc/tutor-fisiologia/gemini.env`, acessível somente por root e carregada pelo systemd. O processo `tutor-fisiologia` executa com usuário próprio, limite de memória de 256 MB e escuta apenas `127.0.0.1:8787`. O Caddy publica somente `/api/tutor` e `/api/tutor/status` por HTTPS; o site está desativado no servidor (`TUTOR_SERVE_SITE=0`). A origem permitida é `https://drmarionascimento.github.io`.

O script `server/deploy-vm.sh` registra a instalação e atualização do serviço; requer Caddy, curl, git e xz-utils instalados. A regra `tutor-fisiologia-web` libera somente TCP 80/443 para a tag de mesmo nome na VM. Nunca publique a porta 8787 ou a chave. A configuração pública do endpoint está em `tutor-widget.js` e `tutor-moodle.html`; `window.TUTOR_AI_CONFIG` continua disponível para substituir o endpoint em outra instalação.

O endereço sslip.io depende do IP externo atual, que ainda é efêmero. Se a VM for parada e receber outro IP, será necessário atualizar o hostname no Caddy e nas duas páginas/configurações, ou migrar para um domínio com IP reservado. O limite de 100 chamadas por dia e 6 por minuto é compartilhado por todos os alunos atrás deste proxy; os contadores reiniciam com o serviço. Não equivale a uma implantação dimensionada para uma turma grande.

Verificação: `systemctl is-active tutor-fisiologia caddy convite-bot` e `curl -fsS https://tutor-fisiologia.35.208.107.43.sslip.io/api/tutor/status`. O status verifica a presença da chave, não a qualidade ou disponibilidade de uma resposta do provedor. As cópias temporárias da configuração transferidas pelo Cloud Shell foram removidas após a instalação.

## Limites didáticos

A IA recebe o catálogo do repositório, não o conteúdo integral dos PDFs ou a posição dos controles em tempo real. Ela deve pedir ao aluno que descreva valores e mudanças. Respostas precisam de revisão didática antes do uso amplo. Não há diagnóstico ou prescrição clínica.

## Moodle

`tutor-moodle.html` também usa a mesma API, mas seleciona o catálogo específico de cada curso pelo endereço. Educação Física: http://127.0.0.1:8787/tutor-moodle.html. Fisioterapia: http://127.0.0.1:8787/tutor-moodle.html?percurso=fisioterapia. Use o endereço correspondente no iframe de cada disciplina, conservando o parâmetro ao publicar. O cabeçalho identifica o curso; módulos, objetivos e mapas seguem seu catálogo, e os links de Fisioterapia mantêm esse percurso. O chat compacto preserva mapas, simuladores, aprofundamentos e links em nova aba; a IA acrescenta explicações livres com contexto temporário. Em “Sobre a IA e o assunto da conversa” é possível escolher um módulo. As questões continuam nos simuladores; o quadro do Moodle não recebe automaticamente uma alternativa escolhida em outra aba.

Para incorporar em produção, use um iframe apontando para o endereço HTTPS publicado de `tutor-moodle.html` com o percurso apropriado (altura de 540px recomendada; o quadro de 300px também é testado). A chave permanece no servidor. A configuração pública `window.TUTOR_AI_CONFIG` deve vir antes do script inline do tutor. Se o HTML for hospedado diretamente pelo Moodle, autorize a origem HTTPS do Moodle em `TUTOR_ALLOWED_ORIGINS` e mantenha `tutor-ef-data.js` e `tutor-fisio-data.js` acessíveis no caminho relativo. Se o iframe apontar para outro site, autorize a origem desse site, e não a página externa do Moodle. Um iframe com sandbox precisa permitir scripts e preservar a origem; requisições de origem `null` são recusadas. Inserir apenas HTML em um editor que remove scripts não executará o tutor.

## Verificação

`npm run test:tutor` verifica catálogo, contexto, chave em cabeçalho, validação de requisições, origem, cotas, indisponibilidade, tempo limite e proteção dos arquivos privados. `npm install` e `npm run test:tutor:browser` executam testes com Chrome instalado, nos tamanhos de computador e celular, sem chamar a API real. Verificam contexto da questão, histórico temporário, limpeza, cancelamento, segurança da renderização e funcionamento sem IA.

Antes de abrir para alunos, confira uma explicação real nos dois cursos, um raciocínio errado numa questão e uma pergunta que peça dados não disponíveis no simulador. Referência técnica: [generateContent](https://ai.google.dev/api/generate-content).
