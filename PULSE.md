# PortDeck PULSE · experiência em tela cheia

Esta branch desenvolve a identidade visual própria **PULSE** e o início direto de jogos. A versão 0.2.1 preserva a biblioteca existente da 0.2 e da 0.1.2.

## God of War III Remastered (PC)

Se você possui os executáveis da distribuição do port:

1. No PortDeck, clique **Configurar** no jogo.
2. Em **Arquivo executável**, mantenha o launcher normal: \`God of War III.exe\`.
3. Em **Executável direto para Jogar**, escolha \`Play God of War III.exe\`.
4. Salve o perfil. Agora **Jogar** tenta abrir o executável direto com os ajustes já salvos; **ABRIR CONFIGURADOR ORIGINAL** abre o launcher normal.

Esses nomes de arquivos são documentados no projeto do port (veja https://github.com/void-land/gow3_pc). Se sua instalação não tem \`Play God of War III.exe\`, deixe o campo direto vazio e use o launcher existente até identificarmos qual distribuição e mecanismo de início ela suporta. **Não** renomeie nem mova os binários do jogo.

## Recursos adicionados
- Abertura com marca animada PortDeck e efeito sonoro sintetizado, sem reutilizar áudio da Steam.
- Animações na vitrine, capas, navegação e mudança de telas.
- Controle de som no canto superior, preferência persistida no dispositivo.
- Navegação por teclado/controle preservada.
- Opção \`directExe\` por jogo e botão para executar o launcher de configuração.
- Respeito à configuração de acessibilidade "reduzir animações" do sistema.

## Limitações
- Não é possível pular genericamente o launcher de todo jogo: cada port decide quais argumentos ou executáveis suporta.
- \`Play God of War III.exe\` existe em algumas distribuições do port; confirme na sua pasta.
- A contagem de horas continua baseada na vida do processo diretamente iniciado. Ports que abrem um processo filho podem precisar de acompanhamento específico.
- O suporte a busca automática de capas fica para uma próxima versão; será necessário fonte autorizada e confirmação do título encontrado.

## Rodar e compilar
\`\`\`powershell
npm install
npm test
npm start
npm run dist:win
\`\`\`
O workflow de Windows no GitHub Actions também compila o instalador e a versão portátil em branches \`feature/**\`.
