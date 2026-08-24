#Requires -Version 5.1
<#
.SYNOPSIS
  Sobe o ambiente de desenvolvimento do Colégio Hiperativo (API + frontend Vite).

.EXAMPLE
  .\run-dev.ps1
#>
[CmdletBinding()]
param()

$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$ApiDir = Join-Path $ProjectRoot "api"
$ApiEnvExample = Join-Path $ApiDir ".env.example"
$ApiEnvPath = Join-Path $ApiDir ".env"
$InfraCompose = Join-Path $ProjectRoot "..\infra\docker-compose.yml"

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

function Test-InfraReady {
  try {
    $db = docker exec filhao-db pg_isready -U filhao -d filhao_projetos 2>$null
    if ($LASTEXITCODE -ne 0) { return $false }

    $health = Invoke-RestMethod -Uri "http://localhost:3010/health" -TimeoutSec 3
    return [bool]$health.ok
  } catch {
    return $false
  }
}

Write-Host ""
Write-Host "Colégio Hiperativo — desenvolvimento" -ForegroundColor Green

if (-not (Test-CommandAvailable "npm")) {
  throw "npm não encontrado. Instale o Node.js."
}

if (-not (Test-Path $ApiEnvExample)) {
  throw "Arquivo não encontrado: $ApiEnvExample"
}

Ensure-EnvFile -ExamplePath $ApiEnvExample -TargetPath $ApiEnvPath

if (-not (Test-InfraReady)) {
  Write-Host ""
  Write-Host "Infra não detectada. Subindo postgres + email-service..." -ForegroundColor Yellow

  if (-not (Test-CommandAvailable "docker")) {
    throw "Docker não encontrado. Rode primeiro: infra\scripts\bootstrap-and-run.ps1"
  }

  Push-Location (Split-Path $InfraCompose -Parent)
  try {
    Ensure-EmailServiceEnv
    docker compose -f $InfraCompose up -d db email-service
    if ($LASTEXITCODE -ne 0) {
      throw "Falha ao subir infra via Docker."
    }
  } finally {
    Pop-Location
  }

  Start-Sleep -Seconds 5
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

$apiCommand = "Set-Location '$ApiDir'; npm run dev"
Start-Process powershell -ArgumentList @("-NoExit", "-Command", $apiCommand) | Out-Null

Push-Location $ProjectRoot
try {
  npm run dev
} finally {
  Pop-Location
}
