# Configura las credenciales de WhatsApp (Meta Cloud API o WhatsAble) en local + Vercel
# y envia un WhatsApp de prueba.
#
# Uso Meta (recomendado):
#   .\scripts\whatsapp-activar.ps1 -Token "EAAG..." -PhoneId "123456789012345"
#
# Uso WhatsAble:
#   .\scripts\whatsapp-activar.ps1 -WhatsableKey "tu_api_key"
#
# Antes (Meta):
#   1. https://developers.facebook.com -> crear app -> Add Product -> WhatsApp
#   2. En WhatsApp > API Setup: copia el "Phone number ID"
#   3. Crea un System User y genera un token permanente con permiso
#      whatsapp_business_messaging (o usa el temporal para probar)

[CmdletBinding()]
param(
  [string]$Token,
  [string]$PhoneId,
  [string]$WhatsableKey,
  [string]$Phone = "34604442172"
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $root ".env.local"

if (-not $Token -and -not $WhatsableKey) {
  Write-Error "Pasa -Token y -PhoneId (Meta) o -WhatsableKey"
  exit 1
}

# 1) Escribir/actualizar .env.local
$lines = @()
if (Test-Path $envFile) { $lines = Get-Content $envFile }

$keys = @{
  "WHATSAPP_PHONE" = $Phone
}
if ($Token) { $keys["WHATSAPP_META_TOKEN"] = $Token }
if ($PhoneId) { $keys["WHATSAPP_META_PHONE_ID"] = $PhoneId }
if ($WhatsableKey) { $keys["WHATSABLE_API_KEY"] = $WhatsableKey }

$updated = @{}
$lines = $lines | ForEach-Object {
  $line = $_
  foreach ($k in @($keys.Keys)) {
    if ($line -match "^\s*$k\s*=") {
      $updated[$k] = $true
      $line = "$k=$($keys[$k])"
    }
  }
  $line
}
foreach ($k in @($keys.Keys)) {
  if (-not $updated.ContainsKey($k)) { $lines += "$k=$($keys[$k])" }
}

Set-Content -Path $envFile -Value $lines -Encoding UTF8
Write-Host "OK: .env.local actualizado" -ForegroundColor Green

# 2) Probar en local
& (Join-Path $PSScriptRoot "whatsapp-notify.ps1") "Tueresmigasolina: WhatsApp activado correctamente"

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
