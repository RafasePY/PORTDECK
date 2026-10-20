# PortDeck 🎮

Launcher de jogos em tela cheia com cara de console (inspirado no PS4/PS5 e no Steam Big Picture), para **Windows** (ports e jogos `.exe`) e **tablets Android** (apps e ports já instalados). Navegação por controle, teclado, mouse e toque. Projeto comunitário independente, sem afiliação com Sony, Valve ou outros fabricantes.

> O PortDeck não emula, converte nem distribui jogos ou firmware. Ele só abre o que você já tem instalado.

## Versão atual: 0.8 — Usuários estilo PS4

- **Entrada estilo PS4:** fundo azul com feixes de luz, "Bem-vindo de volta ao PortDeck" e "Pressione A para usar o controle". Espera o jogador apertar um botão.
- **Alternar usuário estilo PS4:** cartões grandes com foto ou símbolo, "Novo usuário" e editar perfil. Só abre quando você quer (avatar, tecla P ou ↑ + A); o PortDeck vai direto para os jogos.
- **Atualiza por cima:** desde a 0.8 todo APK tem a mesma assinatura, então não precisa desinstalar a versão anterior.
- **Início estilo PS5:** fileira de capas no topo, arte do jogo em tela cheia, logo do jogo, botões Jogar / Configurar / Mais opções.
- **Menu de opções ao lado da capa**, como no PS5, sem escurecer a tela.
- **Android em tela cheia de verdade:** barra de status, navegação e barra de tarefas da Samsung escondidas.
- **Ícone próprio PD** no APK e no executável do Windows; no Windows, jogo sem capa mostra o ícone do próprio `.exe`.
- **Notificações do tablet (opcional):** WhatsApp, Gmail etc. aparecem como aviso no canto da tela; tocar abre o app.

Detalhes de cada versão, com fotos, em [`docs/`](docs) (ex.: [`docs/PORTDECK_0.8.md`](docs/PORTDECK_0.8.md)).

## Baixar e instalar

Os instaladores são gerados automaticamente pelo GitHub Actions. Abra a aba **Actions**, escolha a execução mais recente da branch desejada e baixe em **Artifacts** (precisa estar logado no GitHub; os arquivos expiram em 30 dias).

### Windows
Workflow **Windows installer** → artefato `PortDeck-Windows-v0.8.0`: instalador e versão portátil (`.exe`, x64). Ainda não são assinados digitalmente, então o Windows pode avisar na primeira execução.

### Android (tablet)
Workflow **Android APK** gera dois APKs. Extraia o `.zip` e instale o `app-debug.apk` **por cima** da versão anterior (não desinstale: os jogos e perfis ficam no app).

> **Vindo da 0.7 ou anterior:** essas versões tinham uma assinatura diferente a cada build, então a 0.8 exige desinstalar **uma última vez** (a biblioteca e os perfis do tablet são apagados). Da 0.8 em diante, tudo instala por cima.

| Artefato | Para quem | Instalação |
|---|---|---|
| `PortDeck-Android-Safe-v0.8-APK` | Todo mundo | Normal, pelo gerenciador de arquivos |
| `PortDeck-Android-Safe-v0.8-Notificacoes-APK` | Quem quer os pop-ups de notificação | O **Play Protect bloqueia** (proteção contra fraude barra apps de fora da loja com leitor de notificações). Instale por `adb install -r app-debug.apk` ou desligue a verificação do Play Protect só durante a instalação e religue depois. Depois, no PortDeck: sininho → **Liberar acesso**. Se o Android disser "configuração restrita": Configurações → Apps → PortDeck Safe → ⋮ → **Permitir configurações restritas**. |

Os dois usam o mesmo app (`com.portdeck.pulse.safe`) e os mesmos dados.

## Controles

| Ação | Controle | Teclado | Toque |
|---|---|---|---|
| Navegar | Direcional / analógico | Setas | Tocar na capa |
| Confirmar | A | Enter | Tocar |
| Voltar | B | Esc | — |
| Opções do jogo | Start / Options | Tecla Menu, Shift+F10 ou botão direito | Segurar a capa |
| Configurar jogo (Windows) | — | F2 | — |
| Voltar ao início | Start + Select (Home quando disponível) | Ctrl+Shift+H | — |
| Alternar usuário | ↑ a partir da fileira, A (Start edita) | P | Tocar no avatar |

No Windows, Start + Select também traz o PortDeck de volta com um jogo aberto (ponte XInput em segundo plano). No Android isso só funciona com o PortDeck em primeiro plano.

## Desenvolvimento

Requer Node.js 22.

```
npm install
npm test                 # testes unitários (node --test)
npm run build            # interface do Windows (Vite) → dist/
npm start                # build + Electron
npm run build:android    # interface do Android → dist-android/
npx playwright test      # testes de navegador (Windows e Android); requer @playwright/test
```

APK local: `npm run build:android && npx cap add android && node scripts/prepare-android.cjs && npx cap sync android && cd android && ./gradlew assembleDebug` (use `PORTDECK_NOTIFICATIONS=1` no `prepare-android` para incluir o leitor de notificações).

Para quem vai mexer no código (pessoas ou IAs): leia [`AGENTS.md`](AGENTS.md).

## Roadmap

- ✅ 0.1.2 launcher Win32 nativo · 0.2 Electron em tela cheia · 0.3 visual cinemático · 0.4 interface de console e menu de contexto · 0.4.2 identidade PULSE e Start+Select · Android 0.1 → Safe · 0.5 dashboard e perfis · 0.6 foto de perfil · 0.7 modo console · 0.8 usuários estilo PS4 e atualização por cima
- **Próximos:** central de controle (botão PS: jogo aberto, perfil, som, bateria) · capas, banners e logos automáticos por nome com confirmação e API licenciada · fileira de Mídia/Apps (YouTube, WhatsApp…) · favoritos, busca e filtros · retorno ao Steam Big Picture

## Segurança e privacidade

- Windows: nenhum comando de shell; o executável é iniciado diretamente com argumentos analisados separadamente. `nodeIntegration` desativado, IPC por preload isolado, CSP restrita.
- Android: sem permissão de launcher padrão nem de atalhos da tela inicial. O leitor de notificações só existe no APK opcional, só funciona depois de liberado pelo usuário e não salva nem envia nada.
- Perfis são locais (não são contas); biblioteca, horas e saves são compartilhados entre perfis.
