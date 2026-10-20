# Configura las alertas por email (Gmail directo) en local + Vercel y envia un email de prueba.
# Uso:
#   .\scripts\email-activar.ps1 -Gmail "tucorreo@gmail.com" -AppPassword "abcd efgh ijkl mnop"
#
# Antes, en tu cuenta de Google:
#   1. Activa la verificacion en 2 pasos: https://myaccount.google.com/security
#   2. Crea una contrasena de aplicacion: https://myaccount.google.com/apppasswords
#   3. Copia los 16 caracteres (puedes pegarlos con o sin espacios)

[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string]$Gmail,

  [Parameter(Mandatory = $true)]
  [string]$AppPassword,

  [string]$To
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $root ".env.local"

if (-not $To) { $To = $Gmail }
$password = $AppPassword -replace "\s", ""

$keys = @{
  "GMAIL_USER"           = $Gmail
  "GMAIL_APP_PASSWORD"   = $password
  "NOTIFY_EMAIL"         = $To
  "NOTIFY_FROM_NAME"     = "Tueresmigasolina"
}

# 1) Escribir/actualizar .env.local
$lines = @()
if (Test-Path $envFile) { $lines = Get-Content $envFile }

$updated = @{}
$lines = $lines | ForEach-Object {
  $line = $_
  foreach ($k in @($keys.Keys)) {
    if ($line -match "^\s*$k\s*=") { $updated[$k] = $true; $line = "$k=$($keys[$k])" }
  }
  $line
}
foreach ($k in @($keys.Keys)) {
  if (-not $updated.ContainsKey($k)) { $lines += "$k=$($keys[$k])" }
}
Set-Content -Path $envFile -Value $lines -Encoding UTF8
Write-Host "OK: .env.local actualizado" -ForegroundColor Green

# 2) Probar el envio con nodemailer
Write-Host "Probando envio..." -ForegroundColor Cyan
$testScript = Join-Path $PSScriptRoot "email-test.mjs"
node $testScript

# 3) Configurar en Vercel
foreach ($target in @("production", "development")) {
  foreach ($k in @($keys.Keys)) {
    try { vercel env rm $k $target --yes 2>$null | Out-Null } catch {}
    $keys[$k] | vercel env add $k $target 2>$null | Out-Null
  }
  Write-Host "OK: Vercel ($target) configurado" -ForegroundColor Green
}

Write-Host ""
Write-Host "Listo. Reprodega para aplicar cambios:" -ForegroundColor Cyan
Write-Host "  vercel --prod" -ForegroundColor Cyan
