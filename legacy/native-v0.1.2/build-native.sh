#!/usr/bin/env bash
# Cross-compiles Windows x64 native PE apps from a Linux host using LLVM clang + lld-link.
set -euo pipefail
cd "$(dirname "$0")"
python3 make_resource.py
for i in kernel32 user32 gdi32 comdlg32 shell32 user32_extra ole32 advapi32; do
  lld-link "/def:$i.def" /dll /noentry "/out:${i}_stub.dll" "/implib:$i.lib"
done
clang -target x86_64-pc-windows-msvc -fno-stack-protector -ffreestanding -nostdlib -c portdeck_win.c -o PortDeck.obj
clang -target x86_64-pc-windows-msvc -fno-stack-protector -ffreestanding -nostdlib -c support.c -o support.obj
clang -target x86_64-pc-windows-msvc -c chkstk.s -o chkstk.obj
lld-link /subsystem:windows /entry:Main /out:PortDeck.exe PortDeck.obj support.obj chkstk.obj portdeck_icon.res user32.lib user32_extra.lib gdi32.lib kernel32.lib comdlg32.lib
python3 - <<'PY'
b=open('PortDeck.exe','rb').read()
with open('payload.h','w') as f:
 f.write('static const unsigned char embeddedExe[] = {\n')
 for i in range(0,len(b),24):
  f.write('  '+','.join('0x%02x'%c for c in b[i:i+24])+',\n')
 f.write('};\nstatic const unsigned long embeddedExeSize = sizeof(embeddedExe);\n')
PY
clang -target x86_64-pc-windows-msvc -fno-stack-protector -ffreestanding -nostdlib -c setup_win.c -o Setup.obj
lld-link /subsystem:windows /entry:Main /out:PortDeck_Setup_v0.1.exe Setup.obj support.obj chkstk.obj portdeck_icon.res kernel32.lib user32.lib ole32.lib advapi32.lib shell32.lib
file PortDeck.exe PortDeck_Setup_v0.1.exe
