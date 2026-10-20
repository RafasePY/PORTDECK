# PortDeck Android 0.1.2 Preview — Guia de teste

Este APK de teste usa o identificador com.portdeck.pulse.preview, separado do PortDeck original e do PortDeck Beta. Android não atualiza APKs de assinatura diferente. Não desinstale as versões anteriores: os dados ficam preservados, mas esta Preview começa com biblioteca própria.

## Testes
1. Arco da logo apenas durante a inicialização. Após pronta, a logo fica parada.
2. Primeiro jogo: com biblioteca vazia, A ou Start+Select na tela de entrada leva ao seletor Adicionar. Ao cadastrar jogos, o cartão + recebe navegação horizontal.
3. Bateria do tablet aparece no topo. Bateria do controle só se o Android InputDevice.getBatteryState relatar nível válido; caso contrário o indicador fica —.
4. Botão Home do controle e Start+Select voltam à Home quando o PortDeck está com foco.
5. Menu do jogo > Atalhos do Android. Se quiser voluntariamente, escolha PortDeck Preview como launcher padrão no diálogo oficial Android para consultar atalhos do pacote. Isso altera a tela inicial e o destino do Home.
6. Use Início > Voltar à One UI / Apps de tela inicial para restabelecer a tela inicial Samsung.
7. Alguns atalhos antigos fixados na One UI podem não estar disponíveis no PortDeck mesmo como launcher padrão. Não prometer importação universal.

## Limitações
Não há encerramento forçado de apps Android. Não há leitura global de botão Home sem tornar-se launcher padrão.
A API de bateria de controle requer Android 12+ e suporte do driver. Não inventar porcentagem.
APK debug exige teste no tablet. Futuras atualizações precisam de assinatura estável e exportação/importação de perfis para não obrigar recadastro.