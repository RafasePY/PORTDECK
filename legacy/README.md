# PortDeck 0.1.2 (Win32 nativo)

O código original da versão **0.1.2** está preservado nesta pasta.
É a versão que já foi testada em um PC Windows e conseguiu iniciar um jogo.

A interface 0.2 (Electron) usa outro front-end, mas **importa os dados**
da v0.1.2 a partir de `%APPDATA%\PortDeck\native_library.tsv` sem alterá-los.

O arquivo de log da versão legada fica em `%APPDATA%\PortDeck\portdeck_debug.txt`.
O código foi preservado para possibilitar correções e consulta de histórico.

Os scripts `.sh` de compilação são específicos do toolchain original (LLVM/lld em Linux),
não substituem a compilação para Windows disponibilizada nas Actions para a versão 0.2.
