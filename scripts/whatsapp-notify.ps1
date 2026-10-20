# Envia un WhatsApp de alerta a tu numero usando el proveedor configurado
# (Meta Cloud API > WhatsAble > CallMeBot, el primero que este listo).
# Uso:
#   .\scripts\whatsapp-notify.ps1 "Mensaje de prueba"
#   .\scripts\whatsapp-notify.ps1 -Text "Proceso terminado"
# Lee la config del entorno o de .env.local

[CmdletBinding()]
param(
  [Parameter(Position = 0)]
  [string]$Text = "Alerta de Tueresmigasolina"
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot

function Get-EnvValue([string]$key) {
  $fromProcess = [Environment]::GetEnvironmentVariable($key)
  if ($fromProcess) { return $fromProcess }
  $envFile = Join-Path $root ".env.local"
  if (Test-Path $envFile) {
    foreach ($line in Get-Content $envFile) {
      if ($line -match "^\s*$key\s*=\s*(.+)\s*$") {
        return $Matches[1].Trim().Trim('"')
      }
    }
  }
  return $null
}

$phone = Get-EnvValue "WHATSAPP_PHONE"
if (-not $phone) { $phone = Get-EnvValue "WHATSAPP_CALLMEBOT_PHONE" }
$metaToken = Get-EnvValue "WHATSAPP_META_TOKEN"
$metaPhoneId = Get-EnvValue "WHATSAPP_META_PHONE_ID"
$version = Get-EnvValue "WHATSAPP_META_VERSION"
if (-not $version) { $version = "v23.0" }
$whatsableKey = Get-EnvValue "WHATSABLE_API_KEY"
$callmebotKey = Get-EnvValue "WHATSAPP_CALLMEBOT_APIKEY"

if (-not $phone) {
  Write-Error "Falta WHATSAPP_PHONE en .env.local"
  exit 1
}

if ($metaToken -and $metaPhoneId) {
  $body = @{
    messaging_product = "whatsapp"
    recipient_type    = "individual"
    to                = "+$phone"
    type              = "text"
    text              = @{ preview_url = $false; body = $Text }
  } | ConvertTo-Json -Depth 5
  try {
    $response = Invoke-WebRequest -Uri "https://graph.facebook.com/$version/$metaPhoneId/messages" `
      -Method POST -Headers @{ Authorization = "Bearer $metaToken" } -ContentType "application/json" `
      -Body $body -UseBasicParsing -TimeoutSec 20
    Write-Host "OK (Meta): $($response.Content)" -ForegroundColor Green
  } catch {
    Write-Error "Error enviando por Meta Cloud API: $($_.Exception.Message)"
    if ($_.Exception.Response) {
      $sr = New-Object IO.StreamReader($_.Exception.Response.GetResponseStream())
      Write-Host $sr.ReadToEnd() -ForegroundColor Red
    }
    exit 1
  }
} elseif ($whatsableKey) {
  $body = @{ to = "+$phone"; text = $Text } | ConvertTo-Json
  try {
    $response = Invoke-WebRequest -Uri "https://dashboard.whatsable.app/api/whatsapp/messages/v2.0.0/send" `
      -Method POST -Headers @{ Authorization = $whatsableKey } -ContentType "application/json" `
      -Body $body -UseBasicParsing -TimeoutSec 20
    Write-Host "OK (WhatsAble): $($response.Content)" -ForegroundColor Green
  } catch {
    Write-Error "Error enviando por WhatsAble: $($_.Exception.Message)"
    exit 1
  }
} elseif ($callmebotKey) {
  $encoded = [uri]::EscapeDataString($Text)
  $url = "https://api.callmebot.com/whatsapp.php?phone=$phone&text=$encoded&apikey=$callmebotKey"
  try {
    $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 20
    if ($response.Content -match "queued|sent") {
      Write-Host "OK (CallMeBot): WhatsApp enviado a $phone" -ForegroundColor Green
    } else {
      Write-Host "Respuesta CallMeBot: $($response.Content)" -ForegroundColor Yellow
    }
  } catch {
    Write-Error "Error enviando por CallMeBot: $($_.Exception.Message)"
    exit 1
  }
} else {
  Write-Error "Configura WHATSAPP_META_TOKEN+WHATSAPP_META_PHONE_ID, WHATSABLE_API_KEY o WHATSAPP_CALLMEBOT_APIKEY"
  exit 1
}
