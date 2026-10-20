# Configura el webhook de Slack en local + Vercel y envia una alerta de prueba.
# Uso:
#   .\scripts\slack-activar.ps1 -Webhook "https://hooks.slack.com/services/..."
#
# Antes, crea el webhook (gratis, 3 minutos):
#   1. Crea un workspace en https://slack.com
#   2. Ve a https://api.slack.com/apps -> Create App -> From scratch
#   3. Features -> Incoming Webhooks -> Activate Incoming Webhooks (On)
#   4. Add New Webhook to Workspace -> elige el canal (#tu-mandas)
#   5. Copia la Webhook URL

[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string]$Webhook
)

$ErrorActionPreference = "Stop"
$root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $root ".env.local"

if ($Webhook -notmatch "^https://hooks\.slack\.com/") {
  Write-Warning "La URL no parece un webhook de Slack (deberia empezar por https://hooks.slack.com/). Continuo igualmente."
}

# 1) Escribir/actualizar .env.local
$lines = @()
if (Test-Path $envFile) { $lines = Get-Content $envFile }

$found = $false
$lines = $lines | ForEach-Object {
  if ($_ -match "^\s*SLACK_WEBHOOK_URL\s*=") { $found = $true; "SLACK_WEBHOOK_URL=$Webhook" }
  else { $_ }
}
if (-not $found) { $lines += "SLACK_WEBHOOK_URL=$Webhook" }

Set-Content -Path $envFile -Value $lines -Encoding UTF8
Write-Host "OK: .env.local actualizado" -ForegroundColor Green

# 2) Probar el webhook directamente
$body = @{ text = "Tueresmigasolina: Slack activado correctamente :motorcycle:" } | ConvertTo-Json
try {
  $response = Invoke-WebRequest -Uri $Webhook -Method POST -ContentType "application/json" `
    -Body $body -UseBasicParsing -TimeoutSec 20
  if ($response.StatusCode -eq 200 -or $response.Content -match "ok") {
    Write-Host "OK: alerta de prueba enviada a Slack" -ForegroundColor Green
  } else {
    Write-Host "Respuesta Slack: $($response.Content)" -ForegroundColor Yellow
  }
} catch {
  Write-Error "Error enviando a Slack: $($_.Exception.Message)"
  exit 1
}

# 3) Configurar en Vercel
foreach ($target in @("production", "development")) {
  try { vercel env rm SLACK_WEBHOOK_URL $target --yes 2>$null | Out-Null } catch {}
  $Webhook | vercel env add SLACK_WEBHOOK_URL $target 2>$null | Out-Null
  Write-Host "OK: Vercel ($target) configurado" -ForegroundColor Green
}

Write-Host ""
Write-Host "Listo. Reprodega para aplicar cambios:" -ForegroundColor Cyan
Write-Host "  vercel --prod" -ForegroundColor Cyan
