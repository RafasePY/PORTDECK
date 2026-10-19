# PortDeck 0.4.2 · Pulse Core

Foco: personalidade visual consistente, splash bloqueante de início e suporte a controles.

## Ícone

**Pulse Core**: portal angulado envolvendo um caminho em forma de P com uma pequena órbita. Vetorial criado em \`src/ui/components/BrandMark.jsx\`; a animação de abertura roda exclusivamente via CSS. Nenhum logotipo da Sony ou Steam é reutilizado.

## Fluxo de abertura

1. Tela escura com Pulse Core e animação inicial curta;
2. “PRESSIONE ENTER PARA INICIAR” (ou botão principal do controle reconhecido);
3. Teclado Enter; controles A/✕, Start+Select, Start ou Home **se mapeados e entregues pelo Windows**;
4. Som da abertura e transição para a biblioteca (configuração de som persistente).

Não há uma interrupção temporizada que automaticamente dispensa o “pressione para iniciar”.

## Controles

- Conectou/desconectou: notificação com tipo detectado, quando o navegador informar.
- 8BitDo, PlayStation, Xbox, Nintendo, XInput genérico ou controle desconhecido.
- Por causa de modos XInput, certos 8BitDo se identificam apenas como XInput. Nesses casos, **não inventar o fabricante**.
- **Start (9) + Select/Back (8)** juntos retornam à Home. A combinação tem prioridade em relação a Start sozinho (menu de opções).
- Durante um jogo em foco, o executável auxiliar `PortDeckInputBridge.exe`, compilado no próprio GitHub Actions, monitora **XInput** em segundo plano sem DLL injection, driver, acesso de administrador ou interceptação de teclado. Ele sinaliza ao PortDeck para recuperar foco somente se um jogo iniciado pelo launcher estiver sob acompanhamento.
- Este retorno global é **experimental e apenas para XInput**: inclui Xbox e 8BitDo em modo XInput, mas não garante funcionamento para DS4/DualSense em modo nativo, DInput ou jogos em fullscreen exclusivo. Alguns ports lançam subprocessos não rastreados; nesse caso o retorno automático pode não funcionar.
- A Steam e os drivers ainda podem capturar o botão Home/Guide. O combo Start+Select evita depender exclusivamente dele; não modifica as configurações da Steam.
- Se o componente nativo falhar, a interface continua abrindo jogos normalmente; o combo funciona apenas com o PortDeck em foco.
- Fallback de teclado: Ctrl+Shift+H com foco no PortDeck.

## Design

- Capas na faixa superior ligeiramente maiores; tile Adicionar menor e menos chamativo.
- Glow reduzido, botões mais sóbrios, tipografia hierarquizada e espaço de apresentação do jogo mais limpo.
- Sem descrição genérica longa para jogos sem descrição disponível.
- Logos são imagens do usuário: selecionar erroneamente uma captura de tela fará o aplicativo exibir essa captura. O editor de imagens mantém prévias para conferir.

## Testes

\`npm test\` e \`npm run dist:win\` geram build pelo Windows Actions. É necessário validar controles físicos (8BitDo em XInput/DInput, Xbox, PlayStation) no Windows do usuário. O ZIP do build continua não assinado digitalmente.
