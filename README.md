# PortDeck 🎮

Launcher de ports Windows em tela cheia, inspirado na experiência de navegação por controle de consoles e do Steam Big Picture. Projeto comunitário independente, sem afiliação com a Valve ou outros fabricantes.

## Situação

- **v0.1.2 (legado):** launcher Win32 original; já confirmado pelo usuário que abre seus jogos.
- **v0.2 (interface renovada / experimental):** Electron + HTML/CSS/JS, biblioteca em tela cheia com animações, controles e migração automática da biblioteca nativa.

### Começar no Windows (desenvolvimento)

1. Instale Node.js 22 LTS.
2. `npm install`
3. `npm start`
4. `npm test` para testes do núcleo.

### Baixar um instalador sem Node.js

Em **Actions → Windows installer → Run workflow**, aguarde o build e baixe `PortDeck-Windows-v0.2` em **Artifacts**. Dentro estarão o instalador `.exe` e o portátil `.exe` de Windows x64. Os instaladores ainda não são assinados digitalmente.

## Compatibilidade com v0.1.2

Na primeira execução, se `%APPDATA%\\PortDeck\\library.json` não existir, o PortDeck importa automaticamente `%APPDATA%\\PortDeck\\native_library.tsv` (UTF-16) preservando nomes, parâmetros, caminhos, capas, FPS de referência e tempo jogado. O arquivo antigo **não é modificado**. Essa migração ocorre uma única vez; versões 0.1.2 e 0.2 não sincronizam novas alterações automaticamente.

## Funcionamento atual

- Selecionar um `.exe` e cadastrar o jogo
- Jogar sem passar por configuração (argumentos e diretório salvos)
- Configurador separado por jogo, quando definido
- Tempo jogado acumulado (enquanto o processo monitorado estiver ativo)
- Capas locais JPG, PNG ou WEBP
- Controles reconhecidos pelo Gamepad API do Chromium; XInput/Steam Input podem ser necessários para controles específicos
- Teclado: setas, Enter, Esc, F11

> O PortDeck não emula, converte nem distribui jogos. Apenas abre executáveis locais. Jogos que iniciam outros processos podem demandar detecção avançada em versões futuras.

## Roadmap

- **0.2** Visual em tela cheia, transições, foco do controle, biblioteca migrada
- **0.3** Busca de capas com confirmação manual e provedores oficiais autorizados
- **0.4** Perfis de controle, identificação mais precisa e remapeamento
- **0.5** Biblioteca, favoritos, buscas e filtros avançados
- **0.6** Melhor integração com Steam e retorno automático após sair do jogo

### Segurança

O aplicativo não executa comandos shell: o executável é iniciado diretamente com argumentos separadamente analisados. `nodeIntegration` está desativado, IPC usa preload isolado. O executor roda com as permissões normais do usuário Windows.

## Organização

```
src/main.cjs             # Windows, executores, armazenamento e IPC
src/preload.cjs          # API isolada para a interface
src/backend/library.cjs  # biblioteca e importação legada
src/renderer/            # interface visual
.github/workflows/       # build Windows automático
```
