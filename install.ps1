# ClaudeXP installer (Windows PowerShell)
# One-liner:
#   irm https://raw.githubusercontent.com/EvanPaules/ClaudeXP/main/install.ps1 | iex

$ErrorActionPreference = 'Stop'
$Repo = if ($env:CLAUDEXP_REPO) { $env:CLAUDEXP_REPO } else { 'EvanPaules/ClaudeXP' }

Write-Host ""
Write-Host "⚡  Installing ClaudeXP from github:$Repo" -ForegroundColor Cyan
Write-Host ""

if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  Write-Host "Node.js 18+ is required. Install it from https://nodejs.org and re-run." -ForegroundColor Red
  exit 1
}

$nodeVer = (node --version).TrimStart('v')
$major   = [int]$nodeVer.Split('.')[0]
if ($major -lt 18) {
  Write-Host "Node $nodeVer found — ClaudeXP needs 18+. Upgrade: https://nodejs.org" -ForegroundColor Red
  exit 1
}

if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
  Write-Host "npm not found (should come bundled with Node.js)." -ForegroundColor Red
  exit 1
}

npm install -g "github:$Repo"
if ($LASTEXITCODE -ne 0) {
  Write-Host "npm install failed." -ForegroundColor Red
  exit $LASTEXITCODE
}

Write-Host ""
Write-Host "✓  ClaudeXP installed. Running setup..." -ForegroundColor Green
Write-Host ""

claudexp setup
