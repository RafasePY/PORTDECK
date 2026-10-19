# PortDeck 0.4.1 — Menu de console e fechamento de jogos

Versão beta de teste derivada da branch feature/console-ui-v0.4. Não substituir a versão estável sem validação no Windows.

## Layout
- Cabeçalho com aproximadamente 62–78 px e faixa superior de jogos com aproximadamente 124–174 px em telas padrão.
- Capas menores, alinhadas no topo. O banner e o logotipo ocupam a área restante.

## Menu contextual
Abre por clique direito numa capa, botão Start/Menu (índice 9, mapeamento padrão), Shift+F10 ou botão Mais opções.
Ações: Jogar, Abrir launcher original, Gerenciar arquivos, Gerenciar conteúdo, Editar perfil e artes, Informações do jogo e, se estiver em execução, Fechar jogo.
Gerenciar conteúdo ABRE A PASTA do port; não instala nem detecta DLC/mods automaticamente.

## Fechamento
1. Menu Fechar jogo abre tela de confirmação.
2. Fechar normalmente pede ao Windows taskkill /PID (sem /F), exclusivamente para PID do processo iniciado e acompanhado pelo PortDeck.
3. Se não fechar após 6,5 segundos, apresenta botão separado para forçar, explicitando risco de perda de dados. Forçar usa taskkill /PID /F /T.
4. O jogo pode criar processo filho e sair; nessa situação o PortDeck não consegue fechar o processo filho não rastreado.
5. O usuário deve salvar o progresso antes do encerramento. Não há garantia de compatibilidade universal.

## Voltar para a Home
O botão central do controle (índice 16, quando entregue ao aplicativo) retorna à Home SOMENTE enquanto PortDeck tiver foco.
Windows, drivers e Steam Input podem capturar esse botão. Retorno global quando o jogo está em primeiro plano e overlay serão etapas futuras.

## Checklist de Windows
- Validar a altura da faixa com 1366x768 e 1920x1080.
- Testar clique direito, Start/Menu, Esc/B, teclado e controles conectados.
- Testar launcher de configuração separado do executável direto.
- Testar acesso à pasta pelo Explorador do Windows.
- Testar fechamento normal e fechamento forçado somente com software de teste sem dados importantes.
- Confirmar que o histórico de horas e as imagens permanecem no perfil.

Não foram incorporados sons, marcas nem arquivos proprietários da Sony ou Steam.