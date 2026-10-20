# PortDeck 0.7 — Modo console
Base: PortDeck 0.6 / PR #13. Windows e Android Safe.

- Android em tela cheia de verdade: barra de status (hora, Wi-Fi, bateria, notificações), navegação e barra de tarefas da Samsung ficam escondidas. O modo é reaplicado ao voltar de um jogo, de um diálogo ou das configurações; um gesto na borda mostra as barras por alguns segundos.
- Ícone próprio: monograma PD no APK (ícone adaptativo com fundo em degradê e versões legadas/redondas) e no instalador/executável do Windows. `scripts/render-icons.mjs` gera tudo de novo a partir do mesmo desenho.
- Windows: jogo sem capa mostra o ícone do próprio `.exe` na fileira e na Biblioteca. Capa cadastrada continua tendo prioridade.
- Notificações do tablet (opcional): sininho no topo abre a explicação e o botão "Liberar acesso", que leva à tela de Acesso a notificações do Android. Com o acesso liberado, mensagens de WhatsApp, Gmail ou qualquer app com notificação ativada aparecem como aviso no canto da tela, com ícone, app, título e texto. Toque abre o app de origem; o aviso some sozinho em 7 s; até 3 por vez. Pop-ups podem ser desligados. Não aparecem durante a abertura nem com o PortDeck em segundo plano. Nada é salvo ou enviado à rede.
- Notificações fixas (música, download em andamento) e resumos de grupo são ignorados.
- Controle: no cabeçalho, ← vai ao sininho e → ao perfil; A abre o item focado; B fecha a janela de notificações.
- Correção: depois da tela "Quem vai jogar?", o foco vai para o jogo selecionado e as setas funcionam de imediato (antes ficavam presas no botão do perfil).
- Testes de navegador cobrem foco após boas-vindas (Windows e Android), ícone do executável e a janela/pop-up de notificações.
- Pendente de validação no aparelho: tela cheia no tablet Samsung, ícone na tela inicial, acesso a notificações e abertura do app ao tocar no aviso (Android 14+ exige autorização explícita, já incluída). Ícone do `.exe` só pode ser conferido no Windows.
