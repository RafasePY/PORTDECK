# Compila o helper nativo usando o C# compiler do próprio Windows.
$ErrorActionPreference = 'Stop'
$base = Split-Path -Parent $PSScriptRoot
$candidates = @(
 "$env:WINDIR\Microsoft.NET\Framework64\v4.0.30319\csc.exe",
 "$env:WINDIR\Microsoft.NET\Framework\v4.0.30319\csc.exe"
)
$csc = $candidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $csc) { throw 'Compilador C# do .NET Framework não encontrado. Execute o build em um runner Windows.' }
$outDir = Join-Path $base 'assets\native'
New-Item -ItemType Directory -Force -Path $outDir | Out-Null
$out = Join-Path $outDir 'PortDeckInputBridge.exe'
$source = Join-Path $base 'src\native\InputBridge.cs'
& $csc /nologo /optimize+ /target:exe "/out:$out" "$source"
if ($LASTEXITCODE -ne 0) { throw "Falha na compilação do InputBridge: $LASTEXITCODE" }
Write-Host "XInput bridge criado em $out"
