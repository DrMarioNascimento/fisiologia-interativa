# Respirar — piloto nativo Android e iOS

A agenda já existe na versão web. Esta base acrescenta lembretes locais opcionais ao aplicativo nativo e reaproveita a mesma interface, os protocolos e os MP3. Não altera a página publicada nem habilita notificações na PWA.

Estado: base nativa e lógica de lembretes verificadas. O workflow Biofeedback — base nativa compila um APK Android de teste e um aplicativo para o simulador iOS, disponíveis como artefatos por 30 dias quando os respectivos jobs terminam com sucesso. O pacote iOS do simulador não instala em iPhone. A validação em aparelhos reais permanece pendente; não há distribuição nas lojas.

## Preparar

Requer Node 22 ou posterior. Nesta pasta:

```sh
npm ci
npm test
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

`cap add` é executado somente uma vez por plataforma. Android Studio e o SDK Android são necessários para compilar o APK. O identificador inicial é `br.com.drmarionascimento.respirar`; confirme-o antes da primeira distribuição assinada.

Em um Mac com Xcode configurado:

```sh
npm ci
npm run build
npx cap add ios
npx cap sync ios
npx cap open ios
```

Selecione a equipe de assinatura no Xcode e execute no iPhone de teste. A distribuição por TestFlight exige a conta e a assinatura da Apple. Este repositório não contém certificados, credenciais nem contas de desenvolvedor.

`www/`, `android/` e `ios/` são gerados localmente e ignorados no Git. A fonte versionada é esta pasta e o simulador compartilhado. O pacote nativo usa os arquivos locais, sem `server.url`, service worker ou download inicial de sons. Após mudanças na fonte, repita build e sync. Ícones de lançamento, identificação final e telas de apresentação precisam ser preparados antes da distribuição; os projetos gerados usam inicialmente os recursos padrão do Capacitor.

## Lembretes

Dentro de Minha agenda, a versão nativa mostra Ativar lembretes e Desativar lembretes. A pessoa salva a agenda e ativa os avisos explicitamente. Só essa ação pode solicitar autorização. Negar ou revogar a autorização não impede o guia respiratório.

Cada dia utiliza um identificador fixo, no intervalo 64010–64016. Salvar alterações na agenda atualiza os avisos se já estavam ativados. Desativar a agenda cancela as ocorrências e preserva a preferência de lembretes para uma futura reativação. Desativar lembretes cancela os sete IDs e impede a reativação automática. Abrir um aviso mostra a agenda, sem iniciar áudio ou sessão.

Os horários seguem o calendário local do aparelho; avisos podem atrasar por economia de bateria, permissões ou ajustes do sistema. Não solicitamos alarme exato no Android. Não há servidor de push. O navegador e o aplicativo nativo têm armazenamentos separados: agenda e histórico anteriores não migram automaticamente.

## Validação em aparelhos reais — pendente

| Verificação | Android | iPhone |
|---|---|---|
| Instalar, abrir em modo avião e tocar os quatro MP3 | Pendente | Pendente |
| Iniciar, pausar, retomar e concluir uma sessão | Pendente | Pendente |
| Voz gravada e voz do aparelho; fonte indisponível | Pendente | Pendente |
| Bloquear a tela, receber chamada e voltar sem áudio inesperado | Pendente | Pendente |
| Negar e depois permitir notificações pelos ajustes | Pendente | Pendente |
| Lembrete com app fechado; toque abre sem iniciar sessão | Pendente | Pendente |
| Editar horário/dias e confirmar ausência do aviso antigo | Pendente | Pendente |
| Desativar agenda e depois desativar lembretes | Pendente | Pendente |
| Reiniciar celular; mudar fuso; verificar próximo dia | Pendente | Pendente |
| Atualizar aplicativo preservando preferências e histórico | Pendente | Pendente |

Não marcar como validado com base apenas nos testes automatizados. Primeiro gerar e instalar os pacotes de teste; registrar modelo, versão do sistema, resultado e problemas encontrados.

Referências: [Capacitor 8](https://capacitorjs.com/docs), [notificações locais](https://capacitorjs.com/docs/apis/local-notifications), [ambiente de desenvolvimento](https://capacitorjs.com/docs/getting-started/environment-setup).

Prof. Mário César Nascimento. PhD ©

## Pacotes de teste no GitHub

Abra Actions → Biofeedback — base nativa → execução concluída. Em Artifacts:

- **Respirar-Android-Teste**: ZIP com APK debug, identificação do commit e SHA-256. Extraia o ZIP e transfira o APK para um Android de teste. A instalação fora da loja é uma ação da pessoa no próprio aparelho. Não é um pacote de produção.
- **Respirar-iOS-Simulador**: aplicativo compilado para o simulador no Mac. Não é IPA e não instala no iPhone. Para teste no iPhone, abrir o projeto no Xcode com uma equipe de assinatura válida, ou preparar distribuição assinada pelo TestFlight.

A execução pode ser iniciada novamente pelo botão Run workflow. Compilar com sucesso confirma a construção do pacote, mas não valida a entrega dos lembretes com o aplicativo fechado. Use a matriz de testes acima no aparelho.
