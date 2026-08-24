#Requires -Version 5.1
<#
.SYNOPSIS
  Sobe o ambiente de desenvolvimento do Colégio Hiperativo (API + frontend Vite).

.PARAMETER GmailClientId
  Google OAuth Client ID (opcional; usado apenas no bootstrap inicial).

.PARAMETER GmailClientSecret
  Google OAuth Client Secret (opcional; usado apenas no bootstrap inicial).

.PARAMETER ForceInfraBootstrap
  Força novo bootstrap da infra mesmo que já tenha sido executado antes.

.EXAMPLE
  .\run-dev.ps1
#>
[CmdletBinding()]
param(
  [string]$GmailClientId,
  [string]$GmailClientSecret,
  [switch]$ForceInfraBootstrap
)

$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$ApiDir = Join-Path $ProjectRoot "api"
$ApiEnvExample = Join-Path $ApiDir ".env.example"
$ApiEnvPath = Join-Path $ApiDir ".env"
$InfraCompose = Join-Path $ProjectRoot "..\infra\docker-compose.yml"
$InfraRoot = Split-Path $InfraCompose -Parent

function Write-Step {
  param([string]$Message)
  Write-Host ""
  Write-Host "==> $Message" -ForegroundColor Cyan
}

function Test-CommandAvailable {
  param([string]$Name)
  return [bool](Get-Command $Name -ErrorAction SilentlyContinue)
}

function Ensure-EnvFile {
  param(
    [string]$ExamplePath,
    [string]$TargetPath
  )

  if (-not (Test-Path $TargetPath)) {
    Copy-Item $ExamplePath $TargetPath
    Write-Host "Criado $TargetPath a partir do .env.example" -ForegroundColor Yellow
  }
}

function Ensure-EmailServiceEnv {
  $emailDir = Join-Path (Split-Path $InfraCompose -Parent) "email-service"
  $example = Join-Path $emailDir ".env.example"
  $target = Join-Path $emailDir ".env"
  if (Test-Path $example) {
    Ensure-EnvFile -ExamplePath $example -TargetPath $target
  }
}

Write-Host ""
Write-Host "Colegio Hiperativo - desenvolvimento" -ForegroundColor Green

if (-not (Test-CommandAvailable "npm")) {
  throw "npm não encontrado. Instale o Node.js."
}

if (-not (Test-Path $ApiEnvExample)) {
  throw "Arquivo não encontrado: $ApiEnvExample"
}

Ensure-EnvFile -ExamplePath $ApiEnvExample -TargetPath $ApiEnvPath

Write-Step "Garantindo repositório infra (GitHub)"
node (Join-Path $ProjectRoot "scripts\ensure-infra.mjs")
if ($LASTEXITCODE -ne 0) {
  throw "Falha ao preparar infra. Verifique conexão com GitHub."
}

$DockerCliScript = Join-Path $InfraRoot "scripts\docker-cli.ps1"
. $DockerCliScript

$needsBootstrap = $ForceInfraBootstrap -or -not (Test-InfraBootstrapComplete -InfraRoot $InfraRoot)

if ($needsBootstrap) {
  Write-Step "Bootstrap inicial da infra (primeira execução)"
  try {
    Invoke-InfraBootstrap `
      -InfraRoot $InfraRoot `
      -ClientId $GmailClientId `
      -ClientSecret $GmailClientSecret
  } catch {
    Write-Host ""
    Write-Host "Bootstrap falhou: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "Tentando subir apenas serviços ausentes..." -ForegroundColor Yellow

    Push-Location $InfraRoot
    try {
      Ensure-EmailServiceEnv
      Start-InfraFromProject -InfraRoot $InfraRoot
    } finally {
      Pop-Location
    }

    Confirm-InfraHealth -RequireEmail | Out-Null
  }
} elseif (-not (Test-InfraReady)) {
  Write-Host ""
  Write-Host "Infra incompleta. Subindo apenas serviços ausentes..." -ForegroundColor Yellow

  Push-Location $InfraRoot
  try {
    Ensure-EmailServiceEnv
    Start-InfraFromProject -InfraRoot $InfraRoot
  } finally {
    Pop-Location
  }

  Confirm-InfraHealth -RequireEmail | Out-Null
} else {
  Write-Host "Infra já em execução (postgres + email)." -ForegroundColor DarkGray
}

Write-Step "Instalando dependências (frontend)"
Push-Location $ProjectRoot
try {
  if (-not (Test-Path "node_modules")) {
    npm install
    if ($LASTEXITCODE -ne 0) { throw "npm install falhou no frontend." }
  }
} finally {
  Pop-Location
}

Write-Step "Instalando dependências (API)"
Push-Location $ApiDir
try {
  if (-not (Test-Path "node_modules")) {
    npm install
    if ($LASTEXITCODE -ne 0) { throw "npm install falhou na API." }
  }
} finally {
  Pop-Location
}

Write-Step "Iniciando serviços"
Write-Host ""
Write-Host "  Frontend : http://localhost:5173"
Write-Host "  API      : http://localhost:3001"
Write-Host "  Email    : http://localhost:3010/health"
Write-Host ""
Write-Host "Pressione Ctrl+C para encerrar." -ForegroundColor DarkGray

$apiCommand = "npm run dev"
Start-Process pwsh -ArgumentList @("-NoExit", "-Command", $apiCommand) -WorkingDirectory $ApiDir | Out-Null

Push-Location $ProjectRoot
try {
  npm run dev
} finally {
  Pop-Location
}
