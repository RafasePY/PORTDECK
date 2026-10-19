# PortDeck v0.4 — Especificação de desenvolvimento (Console UI)

Status: **aprovado para implementação**, não significa que a v0.4 já tenha sido lançada.
Referência visual: mockup aprovado pelo usuário em 19/10/2026, com biblioteca horizontal superior, capa selecionada, wallpaper panorâmico, logotipo e botões de ação.
Compatibilidade alvo: Windows 10/11 x64, mouse/teclado e controles Xbox, PlayStation e 8BitDo reconhecidos pelo sistema.

## 1. Objetivo

Fazer o PortDeck se comportar como um **launcher de console**, não uma página web:
- uma faixa horizontal de capas na parte superior;
- capa selecionada maior, foco inequívoco e movimento fluido;
- plano de fundo 16:9 do **jogo selecionado**, com crossfade;
- logotipo transparente grande e legível;
- painel textual breve à esquerda e gameplay/artwork dominante à direita;
- **Jogar**, **Configurar**, **Mais opções**;
- perfil local no topo e relógio;
- instruções de controle discretas no rodapé.

Usar design original do PortDeck: o mockup é referência de composição. Não reproduzir elementos, áudios, marcas nem arquivos proprietários do PlayStation/Steam.

## 2. O que foi observado na v0.3 (causa provável das artes invisíveis)

Arquivos analisados:
- \`src/ui/main.jsx\`: o efeito de carregamento adiciona o caminho a \`seen.current\` *antes* de a promessa de leitura resolver e usa uma flag \`alive\` redefinida ao atualizar \`games\`. Se ocorrer atualização durante a leitura, o efeito antigo não atualiza o estado e o novo não tenta novamente. Assim, capa/banner/logo podem continuar ausentes mesmo com caminhos válidos.
- \`src/main.cjs\`: \`covers:load\` devolve string vazia silenciosamente para arquivo inexistente, tipo inadequado ou tamanho acima de **12 MiB**; dificulta identificar a causa.
- \`src/backend/library.cjs\`: \`cover\`, \`banner\` e \`logo\` guardam caminhos absolutos originais; o app não copia arquivos para biblioteca gerenciada.
- \`src/ui/main.jsx\`: configurações de imagens não exibem prévias, só caminhos.

O caminho exato informado pelo usuário **não confirma** que o arquivo seja válido ou esteja dentro do limite de tamanho. A correção deve tratar tanto a race condition quanto erros reais de arquivo.

## 3. Modelo de dados e persistência

Preservar \`%APPDATA%\\PortDeck\\library.json\`, o \`native_library.tsv\` legado e identificadores de jogos. Campos existentes devem manter significado:

\`\`\`json
{
  "id": "uuid",
  "name": "God of War III",
  "exe": "C:\\\\Games\\\\GoW3\\\\God of War III.exe",
  "directExe": "C:\\\\Games\\\\GoW3\\\\Play God of War III.exe",
  "config": "",
  "cwd": "C:\\\\Games\\\\GoW3",
  "args": "",
  "cover": "C:\\\\Users\\\\...\\\\AppData\\\\Roaming\\\\PortDeck\\\\assets\\\\uuid\\\\cover-a1b2.png",
  "banner": "C:\\\\Users\\\\...\\\\AppData\\\\Roaming\\\\PortDeck\\\\assets\\\\uuid\\\\banner-c3d4.jpg",
  "logo": "C:\\\\Users\\\\...\\\\AppData\\\\Roaming\\\\PortDeck\\\\assets\\\\uuid\\\\logo-e5f6.png",
  "playedSeconds": 480,
  "lastPlayed": "2026-10-19T18:00:00.000Z"
}
\`\`\`

\`cover/banner/logo\` continuam strings para compatibilidade, mas **novas imagens importadas** são copiadas para:
\`%APPDATA%\\PortDeck\\assets\\<id-do-jogo>\\<tipo>-<hash-curto>.<extensão>\`

Não remover a imagem original. Nunca apagar a pasta do jogo. Paths antigos devem continuar legíveis. Limpeza de imagens sem referência fica para manutenção futura.

### Fluxo seguro de importação
1. Usuário escolhe capa, banner ou logo em diálogo nativo.
2. Processo principal valida tipo por assinatura dos bytes (PNG/JPEG/WebP), tamanho e existência.
3. Calcula checksum para nome único e grava cópia local com escrita temporária + rename.
4. Entrega ao renderer **caminho gerenciado + prévia** (ou acesso a prévia por IPC).
5. A tela de configuração exibe imediatamente a arte e o resultado do carregamento.
6. Somente ao clicar **Salvar perfil** o caminho passa a ser usado no jogo.
7. Falha de leitura mostra diagnóstico em português e botão **Tentar novamente**; não exibir campo como se estivesse funcionando.

Limites iniciais sugeridos: 12 MiB por imagem, para evitar travamentos no transporte base64; logotipo PNG/WebP com transparência recomendado; banners preferencialmente 16:9 1920×1080 ou superior. Imagens com outros aspectos **não devem quebrar** a UI (usar \`object-fit: cover/contain\`).

### Cache e atualização
- Cache em memória com chave de caminho **com hash**, não pela chave apenas do jogo.
- Promise compartilhada quando várias partes da tela solicitarem o mesmo arquivo.
- Remover entrada do cache se leitura falhar; permitir tentativa posterior.
- Na troca da biblioteca ou cancelamento do editor, nenhuma requisição assíncrona deve bloquear carga futura.
- Ao selecionar um jogo, preload do banner e logo do próximo jogo, quando houver.
- Banner usa transição de opacidade, sem piscar branco.

## 4. Arquitetura — arquivos a criar ou ajustar

| Arquivo | Responsabilidade |
|---|---|
| \`src/backend/library.cjs\` | Preservar \`Game\`, caminhos, horas e migração |
| \`src/backend/assets.cjs\` **novo** | Validar, copiar, versionar, recuperar imagens; testes sem Electron |
| \`src/main.cjs\` | IPC de importação/leitura; validação; execução de jogos preservada |
| \`src/preload.cjs\` | Expor API de assets isolada ao renderer |
| \`src/ui/main.jsx\` | Gradualmente virar ponto de entrada/estado global |
| \`src/ui/components/ConsoleHome.jsx\` **novo** | Faixa de jogos + hero + ações |
| \`src/ui/components/GameCarousel.jsx\` **novo** | Navegação horizontal/foco |
| \`src/ui/components/GameHero.jsx\` **novo** | Wallpaper, logotipo, título, horário e Jogar |
| \`src/ui/components/GameEditor.jsx\` **novo** | Perfil do jogo e prévias de imagens |
| \`src/ui/components/GameDetails.jsx\` **novo** | Tela de detalhes |
| \`src/ui/components/AssetPreview.jsx\` **novo** | Prévia, erro, carregando e fallback |
| \`src/ui/input/gamepad.js\` **novo** | Mapeamento, debounce/repeat, foco |
| \`src/ui/style.css\` | Tema original PortDeck Console 0.4 |
| \`tests/assets.test.cjs\` **novo** | Testar importação, leitura, formatos, erro, paths |
| \`.github/workflows/windows-build.yml\` | Build e upload de artefatos v0.4 |

Construir incrementalmente; manter o renderizador anterior acessível por branch para rollback.

## 5. Componentes e layout (1920×1080 de referência)

### Barra superior
Logo PORTDECK, abas **Jogos** / **Biblioteca**, busca, configurações, status de controle, perfil local e relógio. Reservar altura proporcional a ~7–9% da viewport.

### Carrossel
Faixa de capas logo abaixo. Capa ativa com brilho em azul-ciano suave, aumento de escala com spring, outras capas menores. Não deslocar o layout vertical ao selecionar. Última posição: tile **+ Adicionar**. Sempre funcionar com 0, 1 e muitos jogos.

### Hero
Banner full-bleed 16:9 em camada de fundo, com overlay à esquerda para garantir contraste; logotipo PNG/WebP à esquerda com \`contain\`; fallback para nome em texto caso não exista ou falhe. Descrição curta opcional (não inventar automaticamente textos de jogos). Mostrar tempo total jogado e última sessão.

### Ações
**Jogar** abre \`directExe || exe\`; **Configurar** abre editor PortDeck, que tem ação separada **Abrir configurador original** (\`config || exe\`); **Mais opções** expõe remapear, alterar imagem, remover da biblioteca, sem alterar arquivos do jogo.

### Rodapé
Dicas mudam conforme teclado vs gamepad, somente de acordo com controles efetivamente reconhecidos.

## 6. Máquina de estados

\`boot -> profile -> home -> details -> edit\` (edit como modal).
- v0.4: perfil local único simples, avatar opcional, sem login real e sem obrigar criação de conta.
- Na inicialização: desbloqueio por botão central **se exposto**, A/Start/Enter fallback; timeout opcional para acessibilidade.
- Voltar de details para home preserva jogo selecionado.
- Iniciar jogo não apaga navegação. Quando fechar, retornar ao ponto salvo da biblioteca.

## 7. Input

| Contexto | Teclado | Controle padrão |
|---|---|---|
| Trocar jogo na faixa | ← / → | D-pad / analógico esquerdo horizontal |
| Confirmar elemento em foco | Enter | A (Xbox) / ✕ (PlayStation) |
| Voltar | Esc | B (Xbox) / ○ (PlayStation) |
| Menu de opções do jogo | F2 ou Y, conforme foco | Y / △ (quando mapeado) |
| Navegação vertical | ↑ / ↓, Tab | D-pad / analógico vertical |
| Abas/áreas | Tab | LB/RB |
| Home | Home | botão central (índice 16 **quando disponível**) |
| Trocar tela cheia | F11 | botão nas Configurações |

Importante: botão central pode ser capturado pelo Windows, drivers ou Steam Input e não chegar ao Gamepad API. Não prometer suporte universal. Não interceptar atalhos no editor/inputs. Priorizar input por *foco visual* para que **A/Enter não inicie jogo inesperadamente** enquanto focar configurações.

## 8. Animação e áudio

React + Motion já faz parte da v0.3. Usar:
- seleção de capa: spring 180–280ms, foco claramente visível;
- troca de fundo: crossfade 300–500ms, animação cancelável;
- título/logotipo: translação discreta com fade;
- splash: curta e pulável, com efeitos sonoros próprios do PortDeck;
- opção para desligar áudio; respeitar \`prefers-reduced-motion\`;
- sem vídeo de fundo ou partículas pesadas obrigatórias em PCs modestos.

## 9. Etapas verificáveis de entrega

### A. Assets confiáveis (obrigatória antes do redesenho)
- [ ] Reparar race condition de carregamento;
- [ ] importar imagens para pasta interna e preservar arquivos originais;
- [ ] prévia em Configurar e feedback de erro;
- [ ] verificar com caminhos contendo espaços e acentos, PNG/JPEG/WebP e arquivo ausente;
- [ ] testes \`node --test\` automatizados.

### B. Tela Home Console (principal)
- [ ] carrossel horizontal **no topo**, não no rodapé;
- [ ] arte de fundo muda com a seleção do jogo;
- [ ] logo do jogo substitui corretamente o fallback textual;
- [ ] botões Jogar/Configurar/Mais opções;
- [ ] estado válido para somente um jogo e zero jogos;
- [ ] sem scroll vertical em 1366×768 e 1920×1080.

### C. Navegação e acabamento
- [ ] foco de controle coerente, A/B/X/Y, LB/RB, analógico;
- [ ] botão central com fallback e teste por dispositivo;
- [ ] perfil local simples e splash com opção de pular;
- [ ] efeitos sonoros customizados, volume/mudo;
- [ ] fallback de imagens robusto e log de erro não sensível.

## 10. Critérios de aceite em Windows real

1. Cadastro de God of War III preservado ao migrar 0.3 -> 0.4.
2. Arquivos da capa, banner e logo aparecem corretamente após salvar, fechar, abrir e desconectar a unidade de origem da imagem (cópia interna).
3. O botão Jogar continua abrindo o port pelo executável direto, caso configurado; Configurar abre a interface PortDeck e o botão de launcher abre o original.
4. As horas jogadas não são zeradas e a saída do jogo não fecha o PortDeck.
5. Menu funciona por mouse, teclado, controle Xbox/8BitDo (PlayStation conforme driver) sem ficar preso em modais.
6. Nenhuma execução silenciosa de scripts externos; escolher artes só importa imagens.
7. Build GitHub Actions verde **e teste prático** antes de considerar a entrega estável.

## 11. Não incluir na primeira v0.4

- Pesquisa automática de imagem na internet (primeiro corrigir pipeline local);
- SteamGridDB sem gerenciamento de API key e confirmação de título;
- clone literal da UI/sons/ícones da Sony;
- emulação de jogos, distribuição de ports ou mudanças em binários de terceiros;
- sincronização de contas pessoais na nuvem.

### Decisão
**Primeiro entrega A, depois B e C.** A arte é o núcleo visual do preview aprovado; não adicionar novas animações antes de garantir que os banners e logos realmente aparecem.
