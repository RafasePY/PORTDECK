# Guia para agentes de IA (e pessoas) que mexem no PortDeck

Leia isto antes de alterar o código. Visão de usuário, download e controles: [`README.md`](README.md). Histórico por versão: [`docs/`](docs).

## O projeto
Launcher de jogos em tela cheia com experiência de console (referência visual: **PS4/PS5**). O dono do projeto testa num **tablet Samsung** (Android, One UI, Brasil) e num **PC Windows**, sem ambiente de desenvolvimento local: tudo que ele instala vem dos artefatos do GitHub Actions. Ele conversa em português; textos de interface, docs e mensagens ao usuário são em **pt-BR**.

## Estrutura
```
src/main.cjs, src/preload.cjs     Electron (Windows): janela, IPC, execução de jogos, ponte de controle
src/backend/*.cjs                 biblioteca (library.json), importação da v0.1.2, armazenamento de artes
src/native/InputBridge.cs         ponte XInput (Start+Select em segundo plano), compilada no CI Windows
src/ui/                           interface React compartilhada (Windows usa main.jsx; Android reaproveita componentes)
  components/                     ConsoleHome (fileira + destaque), GameContextMenu/TileMenu (menu ao lado da capa),
                                  IntroScreen (entrada estilo PS4), PlayerProfiles ("Alternar usuário" estilo PS4) + ProfilePhoto,
                                  BrandMark (monograma PD)
  input/controller.mjs            identificação de controles e combos (Start+Select etc.)
  profiles.mjs, avatar.mjs        modelo dos perfis (v1) e recorte da foto
android-web/src/                  interface Android (main.jsx, ControlHints, Notifications)
android-source/                   Java nativo copiado para o projeto Capacitor + res/ (ícones) + portdeck-signing.keystore
scripts/prepare-android.cjs       injeta Java, manifest, ícones e a assinatura fixa no projeto gerado por `cap add android`
scripts/render-icons.mjs          gera os ícones PD (Android + build/icon.png do Windows)
tests/*.test.cjs                  testes unitários (node --test)
tests/browser/*.spec.mjs          Playwright: Windows na porta 4173, Android na 4174 (APIs nativas simuladas/ausentes)
legacy/native-v0.1.2/             launcher Win32 original, só para consulta
src/renderer/                     interface antiga da 0.2, NÃO é carregada (o Electron abre dist/index.html)
```
A pasta `android/` não é versionada: o CI gera com `npx cap add android` a cada build.

## Comandos
```
npm install
npm test                                  # unitários
npm run build && npm run build:android    # as duas interfaces
npx playwright test                       # requer `npm install --no-save @playwright/test` e Chromium
```
Os testes de navegador usam `dist/` já compilado para o Windows: rode `npm run build` antes, senão testa código velho. A interface Android é compilada pelo próprio Playwright (webServer da porta 4174).

## Regras do projeto
- **Assinatura do APK:** todo APK é assinado com `android-source/portdeck-signing.keystore` (alias e senhas `portdeck`), injetada por `prepare-android.cjs`. É isso que permite instalar por cima. **Nunca troque, regenere ou remova essa chave**; se o build deixar de usá-la, o tablet volta a exigir desinstalar e perde os dados.
- **Nunca quebrar dados do usuário:** `appId` Android `com.portdeck.pulse.safe` fixo; chaves de `localStorage` versionadas (`portdeck-android-library-v1`, `portdeck-player-profiles-v1`…); perfis v1 sem foto continuam válidos; a v0.1.2 é importada sem ser alterada. Oriente sempre a instalar o APK **por cima**, nunca desinstalar.
- **Android "Safe":** sem categoria HOME, sem permissão de launcher padrão, sem atalhos da tela inicial, sem bateria do controle (removidos a pedido do dono).
- **Play Protect (Brasil):** apps instalados fora da loja que declaram `NotificationListenerService` ou `AccessibilityService` são bloqueados sem opção de continuar. Por isso os dois (leitor de notificações e `PortDeckGamepadService`, o Start+Select dentro dos jogos) só entram no manifest com `PORTDECK_NOTIFICATIONS=1`, no APK opcional **"Completo"**. `scripts/verify-apk.cjs` derruba o CI se o APK padrão tiver qualquer um deles. Não adicione permissões sensíveis (SMS, acessibilidade, leitor de notificações) ao APK padrão. `KILL_BACKGROUND_PROCESSES` (Fechar jogo) é permissão comum e fica nos dois.
- **Jogo aberto no Android:** o estado vem de `portdeck-android-running-v1` (o que o PortDeck abriu), não de detecção do sistema. O Android não informa a outro app quando um jogo é fechado pelos recentes; não prometa detecção exata.
- **Windows:** nada de shell; executáveis iniciados diretamente. `nodeIntegration` desligado, CSP no `index.html` (imagens: `self data: blob:`).
- **Perfis:** a troca de usuário **não abre sozinha** ao iniciar (pedido do dono). Entrada → início direto. A tela "Alternar usuário" só abre pelo avatar, pela tecla P ou por ↑ + A.
- **Controle primeiro:** toda tela nova precisa funcionar com controle (direcional, A, B, Start), teclado e toque. Diálogos prendem o foco; ao fechar, o foco volta para um lugar que as setas consigam usar (normalmente a capa selecionada).
- **Movimento reduzido:** respeite `prefers-reduced-motion`.
- **Estilo de código:** JSX/JS compacto, muitas vezes em uma linha, sem TypeScript nem linter; siga o estilo do arquivo. Comentários curtos em português explicando o porquê.

## Fluxo de versões e CI
- Cada versão nasce numa branch empilhada sobre a anterior e vira um PR **rascunho** apontando para a branch da versão anterior (cadeia #8 → #13 → …). A `main` ainda só tem o README inicial. Nada é mesclado antes do dono testar no aparelho.
- Ao criar uma versão: atualize `version` no `package.json`, os nomes dos artefatos nos workflows (`PortDeck-Windows-vX`, `PortDeck-Android-Safe-vX-APK`, `...-Completo-APK`) e **inclua a branch nova na lista `push.branches`** de `android-build.yml` e `ui-check.yml` (senão o APK não é gerado).
- **Registro obrigatório de cada atualização** (o dono pediu, para outras IAs continuarem o trabalho). Crie `docs/PORTDECK_X.md` no modelo de [`docs/PORTDECK_0.8.md`](docs/PORTDECK_0.8.md):
  1. **Pedido do dono**, nas palavras dele, resumido.
  2. **O que mudou**, com causa, arquivos, componentes, classes CSS, props e chaves de armazenamento envolvidos, e o comportamento antes/depois.
  3. **Telas**: capturas em `docs/screenshots/X/` (JPG, geradas com Playwright e capas falsas) e, quando o dono mandar, fotos do aparelho dele (reduzidas para ~1600 px). Não versione imagens da Sony/PlayStation que ele manda como referência; descreva-as.
  4. **Testes**: o que foi rodado e o resultado.
  5. **Pendências**: o que só dá para validar no aparelho.

  Atualize também a seção "Estado" deste arquivo e o README quando o comportamento visível mudar.
- Workflows: `windows-build.yml` (instalador e portátil), `android-build.yml` (APK padrão + APK Completo, ambos conferidos por `verify-apk.cjs`, que lê a versão do `package.json`), `ui-check.yml` (unitários + build + Playwright).
- O Java nativo só é compilado no CI (não há Android SDK local): depois de mexer em `android-source/`, confira o workflow Android antes de dizer que está pronto.

## Estado em 1.0 (out/2026)
Pronto: tudo da 0.9 + navegação por controle com foco visível (`pad-nav`) na central, na lista de apps e nos diálogos; central começa no primeiro cartão; selo "Em execução", Voltar ao jogo e **Fechar jogo** (Android `closeApp`/`killBackgroundProcesses`, Windows `beginClose`); Start+Select dentro dos jogos no APK Completo (`PortDeckGamepadService`, abre a central ao voltar); nome longo não estica a capa. versionCode 1000000, mesma chave. Registro: `docs/PORTDECK_1.0.md`, capturas em `docs/screenshots/1.0/`.
Validação: 18 testes unitários e 24 de navegador (controle simulado via `navigator.getGamepads`). Java novo só compila no CI.
Pendente no aparelho: atualizar 0.9 → 1.0 por cima, controle físico na central e na lista de apps, Fechar jogo no Minecraft, Start+Select dentro do jogo no APK Completo (ativar em Acessibilidade).
Ideias futuras: capas automáticas por nome (exige API licenciada e confirmação do usuário); detecção real de jogo aberto via acessibilidade no Completo.
