# PortDeck 0.3 — Cinematic UI (React + Motion)

Nova implementação **somente da interface**. O núcleo Windows, biblioteca e execução dos jogos permanecem baseados na versão 0.2.1.

## Como testar
- Node.js 22 LTS
- \`npm install\`
- \`npm test\`
- \`npm start\` (compila a interface e abre o Electron)
- \`npm run dist:win\` (gera portátil e instalador em \`release\`)

No GitHub, os artefatos estão na aba **Actions**, no workflow **Windows installer**.

## O que mudou
- Interface realmente imersiva com wallpaper full-bleed, capa em carrossel e detalhe do jogo.
- Navegação gamepad-first (Xbox/8BitDo/PlayStation quando o Chromium reconhecer), teclado e mouse.
- Animações com React Motion, splash curta e efeitos sonoros sintetizados.
- Biblioteca preservada no diretório do usuário, com tempos jogados e executáveis separados.
- Campo de banner 16:9 e logotipo transparente, além da capa vertical.
- Interface sem dependência de artes remotas. Ao cadastrar imagens locais, aparecem imediatamente após salvar.

## Limitações
- Não são fornecidos jogos nem obras de arte de terceiros.
- Capas automáticas exigirão um provedor com termos de uso e seleção confirmada (etapa seguinte).
- As animações usam as preferências de redução de movimento do Windows.
- O build de GitHub Actions **não substitui** o teste manual no Windows.

Revisar o PR antes de incorporar à branch principal.
