# PortDeck Android v0.1.1 — Nintendo, adicionar com controle, modos de lançamento

## Correções desta versão

- **Nintendo Switch:** ícones de botões diferenciados no rodapé. Há seletor no canto superior: Automático, Touch, 8BitDo, Xbox, PlayStation ou Nintendo Switch. Útil quando o 8BitDo se anuncia como XInput.
- **Adicionar:** a faixa horizontal agora inclui o cartão **+** na navegação por D-pad/analógico. Quando o cartão estiver selecionado, pressione A (botão confirmado no mapeamento) para escolher apps. Na lista de apps, use cima/baixo e A.
- **Port direto:** o PortDeck agora enumera **atividades Android distintas** em vez de deduplicar apenas pelo pacote. Assim, quando um port publica duas entradas \`MAIN+LAUNCHER\`, ambas podem aparecer.
- **Como abrir este port:** no menu do jogo ou no editor, escolha launcher padrão, uma atividade de inicialização disponível, ou peça ao port para fornecer seu próprio atalho quando ele implementar \`ACTION_CREATE_SHORTCUT\`.
- Ao salvar o perfil, os parâmetros de inicialização escolhidos são armazenados **somente dentro do PortDeck** e usados na próxima execução.

## O limite importante do Android

Um atalho fixado na tela inicial Samsung/One UI, como o ícone “Dragon Rage” com selo de outro aplicativo, **pode não estar disponível para o PortDeck**. A leitura de atalhos dinâmicos/fixados de outros aplicativos por \`LauncherApps.getShortcuts\` exige permissão de host de atalhos normalmente disponível ao launcher padrão. O PortDeck não exige essa substituição.

O método opcional \`ACTION_CREATE_SHORTCUT\` só funciona quando o **próprio port** oferece uma tela de criação de atalhos. Pode ser que o atalho fixado existente tenha sido criado por \`ShortcutManager.requestPinShortcut\` e não exista essa interface legada. Nesse caso, esta versão não importa automaticamente o atalho.

O PortDeck também **não executa .exe**, não força o fechamento de apps Android e não garante que Start+Select funcione fora do PortDeck.

## Checklist no tablet Samsung

1. Abra PortDeck, conecte 8BitDo e escolha **Nintendo Switch** no seletor de botões: confirme que os glifos mudam.
2. Com capa de jogo focada, pressione direita até **Adicionar**, então confirme; tente escolher uma atividade.
3. Segure a capa do port > **Escolher inicialização do port**. Compare as entradas disponíveis.
4. Caso apareça **Importar atalho direto criado pelo port**, toque e tente escolher o jogo na tela retornada pelo próprio port, depois **Salvar perfil**.
5. Confirme que jogar abre a atividade/atalho escolhido, e que o jogo anterior e as capas ficaram salvos.
6. Se o botão Start+Select não abrir a Home durante o jogo, é limitação de foco do Android e não um erro de personalização de botões.

**Beta não validada em hardware real.** A CI compila APK debug e executa os testes automatizados; é necessário validar na One UI.
