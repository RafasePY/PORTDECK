# PortDeck 0.5 — Dashboard e perfis locais

Base: feature/android-safe-no-home (PR #11), contendo a implementação compartilhada Windows 0.4.2.

## Experiência
- Faixa horizontal com capas quadradas, tile selecionado maior, contornos brancos e fundo azul com ondas discretas.
- Tipografia mais leve, redução de elementos decorativos, ações claras e regras para telas pequenas.
- Perfis pessoais locais: criar até 12, editar nome/símbolo/tema, trocar perfil e persistir a escolha.
- Mouse/toque no avatar ou tecla P abrem perfis. No controle, subir a partir da faixa seleciona o perfil e confirmar abre. Dentro do diálogo, direções navegam, confirmar aciona e voltar fecha.
- Foco contido no diálogo e restaurado ao fechar; comandos da biblioteca suspensos durante o perfil.
- Respeita preferência de movimento reduzido na faixa e na transição de informações.
- Android identifica horas como estimadas.

## Limites
Perfis são identidades locais e temas: biblioteca, contagem de horas e saves continuam compartilhados. Não são contas, autenticação, sincronização ou isolamento de saves.
Android mantém appId Safe, não altera One UI, não adiciona launcher padrão, acessibilidade nem leitura de bateria do controle.
A assinatura debug de builds Android anteriores continua sendo uma pendência. Não desinstale a instalação com seus dados para testar; um APK com assinatura incompatível não atualiza a versão instalada. Esta mudança não resolve assinatura de release nem migração.

## Validação
Testes de persistência, normalização e erros de armazenamento em tests/profiles.test.cjs.
Workflows compilarão Windows e Android desta branch. Ambiente local indisponível nesta sessão; não foi possível executar preview ou validação visual local.
Pendente no dispositivo: resolução 1366x768/1920x1080, tablet em ambas orientações, controle 8BitDo, abertura/retorno de jogo e atualização Android com assinatura estável.
