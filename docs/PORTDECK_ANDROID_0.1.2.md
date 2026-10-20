# PortDeck Android (Preview segura)

Esta versão mantém a biblioteca Android, navegação touch e por gamepad, Start+Select quando o PortDeck está em foco, seletor de atividades de ports, capas e banner e bateria **somente do tablet**.

## Removido a pedido do usuário
- Nenhum convite ou botão para trocar a tela inicial Samsung One UI.
- Nenhuma opção de solicitação da permissão de launcher padrão.
- Nenhum código LauncherApps para consultar ou iniciar atalhos fixados na tela inicial.
- O AndroidManifest não declara `android.intent.category.HOME`.
- Indicador e consulta nativa da bateria do controle foram retirados. A identificação do controle e os símbolos dos botões continuam funcionando.

## Limite do controle
Start + Select ou Home só podem ser interpretados pelo PortDeck quando ele recebe os eventos. Trocar para R3 + Start não faz o app receber eventos enquanto outro jogo está em primeiro plano. Uma interceptação global exigiria integração especial (como serviço de acessibilidade com permissão explícita), que **não** está habilitada nesta versão.

## Atalhos e ports
Ainda é possível escolher atividades publicamente expostas pelos ports e importar um atalho quando o próprio aplicativo oferecer a interface `ACTION_CREATE_SHORTCUT`. Não é possível ler os ícones de atalhos privativos já fixados pela Samsung One UI.

## Dados
Não desinstale as versões anteriores. Esta Preview mantém `com.portdeck.pulse.preview`, mas APKs debug de CI podem ter assinaturas distintas e bloquear instalação por cima da Preview existente. Para preservar os dados da Preview, não desinstale; aguardamos assinatura estável e backup/exportação de perfis para migração segura.
