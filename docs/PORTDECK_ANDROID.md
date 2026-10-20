# PortDeck PULSE · Android (primeira versão)

Implementação nativa Android usando **Capacitor 8 + React + Motion** e o mesmo design PULSE do PortDeck para Windows. A interface é independente, para não comprometer o executável desktop.

## O que abre no tablet
Apenas aplicativos e ports **Android já instalados** com atividade de inicialização visível. O launcher busca esses aplicativos no Android usando \`MAIN + LAUNCHER\` e permite adicioná-los à biblioteca. Não instala nem executa jogos de Windows \`.exe\`, jogos de Switch/PS4, APK não instalado ou arquivos de ROM. Não inclui jogos comerciais.

## Entrada
- Toque curto: seleciona a capa.
- Botão Jogar: abre o app Android selecionado.
- Pressionar a capa por aproximadamente 550 ms: abre o menu de ações (equivalente ao botão direito).
- Controle: setas/analógico navegam, A confirma, B volta, Start abre opções, Start+Select retorna ao PortDeck **enquanto a interface tem foco**.
- Tela de abertura: toque/Enter/A/Start+Select; as opções nativas podem variar por controle e versão do Android.

## Arte
As capas iniciais são os ícones fornecidos pelos aplicativos instalados; usuários podem escolher capa vertical, banner e logo para cada jogo via toque, armazenados em IndexedDB local. Banner do jogo selecionado fica como wallpaper; sem banner, usa gradiente original. Imagens ficam apenas no tablet.

## Tempo de jogo
O tempo exibido é estimado pela duração entre sair do PortDeck e retornar depois de abrir um aplicativo. O Android não fornece livremente tempo real de outros aplicativos a qualquer launcher; o recurso **não diferencia** jogar de ficar em outros apps durante essa ausência. Não há sincronização automática de horas com Windows.

## Limitações importantes
- Permissões de consulta de aplicativos são declaradas apenas para o tipo \`MAIN/LAUNCHER\`; não solicita acesso a todos os pacotes.
- Android não permite que o PortDeck encerre à força outros aplicativos como o Windows faz. Menu só oferece abrir ou ver configurações do sistema.
- O botão Home/Guide pode ser reservado pelo Android ou por outros apps. O atalho não é global dentro dos jogos; não instalamos um serviço de acessibilidade ou driver para interceptar botões.
- Suporte aos modelos exatos de 8BitDo/PlayStation/Xbox depende do identificador do driver, como no desktop.
- Android WebView e Windows Electron podem ter pequenas diferenças de tipografia, gestos e renderização.
- O aplicativo Android é uma **primeira beta**, a validar em tablet real.

## Como gerar APK no GitHub
GitHub Actions -> **Android APK** -> artefato \`PortDeck-Android-v0.1-APK\`. O APK gerado é debug, assinado com a chave de teste do Android. Para lançamento público, gerar assinatura release própria.

## Desenvolvimento local
\`\`\`bash
npm install
npm run build:android
npx cap add android
node scripts/prepare-android.cjs
npx cap sync android
cd android && ./gradlew assembleDebug
\`\`\`
