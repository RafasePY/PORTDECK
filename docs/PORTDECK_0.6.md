# PortDeck 0.6 — Portal
Base: PortDeck 0.5 / PR #12. Windows e Android Safe.

- Monograma PD vetorial original compartilhado pelo cabeçalho e abertura.
- Abertura com desenho progressivo dos traços, profundidade, pulso de luz, marca e transição automática para perfis; pode pular após preparação.
- Movimento reduzido utiliza transição curta e símbolo estático.
- Som sintetizado original ao pular por toque/clique; respeita opção de som. Navegadores/WebViews podem bloquear áudio sem interação.
- Seleção de perfil após abertura; Android vazio oferece adicionar aplicativo após escolher usuário.
- Foto JPG/PNG/WebP da galeria/arquivos, prévia quadrada, zoom e enquadramento horizontal/vertical. Exporta JPEG 256×256, limite 120 mil caracteres por foto, sem envio à rede.
- Foto aparece no topo, editor e seletor. Remoção ou escolha de símbolo restaura avatar vetorial/textual.
- Modelo v1 preservado: perfis existentes sem foto continuam válidos. Biblioteca, horas e saves permanecem compartilhados.
- Fonte de foto limitada a 12 MB / 40 MP; falhas de leitura/armazenamento aparecem na interface.
- Testes unitários cobrem cortes e migração. Workflow de navegador cobre abertura, importação, persistência, remoção e teclado.
- Ambiente local indisponível; verificar visualmente no tablet e Windows, e validar controle físico. Assinatura estável do APK continua pendência anterior.
