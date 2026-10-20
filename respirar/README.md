# Fisiologia Interativa — Biofeedback Respiratório

Versão piloto instalável pelo navegador, preparada para uso offline após a primeira abertura conectada. O pacote inclui o simulador, os protocolos, a identidade visual, os três comandos gravados e as orientações.

## Usar

Abra `/respirar/` e espere **Pronto para uso offline neste aparelho**. No iPhone, use Safari → Compartilhar → Adicionar à Tela de Início. No Android, use **Instalar aplicativo**, quando disponível, ou o menu do navegador. Depois confira o funcionamento em modo avião.

O guia sonoro é opcional: tom contínuo, voz em português ou sinal discreto. Em voz, a pessoa escolhe gravação ou síntese do aparelho e pode selecionar entre as vozes em português expostas pelo navegador. O funcionamento offline da síntese depende da voz e do aparelho; as gravações fazem parte do pacote offline. Preferências ficam no armazenamento local do navegador.

## Manutenção

- Fonte da interface: `../biofeedback-respiratorio-smartphone.html`.
- Fonte dos sons: `../biofeedback-audio.js` e `../assets/audio/biofeedback/`.
- Gerar novamente: `npm run build:biofeedback`.
- Verificar: `npm run test:biofeedback`.
- O gerador mantém a versão offline autocontida, sem dependências do catálogo ou do tutor online.
- O service worker atua somente nesta pasta. A instalação só termina depois de armazenar todos os arquivos. Atualizações aguardam o encerramento das páginas abertas antes de substituir a versão ativa.
- Os testes simulam a ausência completa de rede para navegação e arquivos, incluindo os quatro MP3, e verificam o isolamento do cache.

## Validação e próximos preparativos

Conferir em iPhone e Android reais: instalação, modo avião após encerrar/reabrir, orientação da tela, áudio, interrupções, bloqueio e retomada. Esta entrega é uma PWA piloto; ainda não inclui pacote nativo Android/iOS para as lojas.

## Minha sessão

Duração livre, 3, 5, 10 minutos ou personalizada entre 1 e 180 minutos inteiros. O tempo ativo exclui pausas. Ao atingir a duração, o guia termina ao concluir o ciclo em andamento, com aviso sonoro opcional, desligado por padrão.

O resumo e o histórico guardam tempo efetivo, quantidade de ciclos completos, duração programada e os ritmos utilizados, inclusive alterações durante a sessão. Encerrar e salvar finaliza manualmente; Resetar registra a parte já realizada como interrompida. O histórico conserva até 100 sessões no armazenamento local deste navegador, sem conta; os registros não são enviados ao servidor. Se o armazenamento falhar, o resumo permanece na tela com um aviso. Preferências de duração e aviso também são locais. Uma sessão ativa não é restaurada depois de recarregar a página.

Próximas etapas de produto: agenda e lembretes opcionais, empacotamento e testes nativos.

Prof. Mário César Nascimento. PhD ©
