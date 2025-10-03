# Script per switchare automaticamente a Node 20 per BIMatch
# Uso: .\use-node-20.ps1

Write-Host "Switching to Node 20 for BIMatch..." -ForegroundColor Cyan

# Check if nvm is installed
$nvmVersion = nvm version 2>$null
if (-not $nvmVersion) {
    Write-Host "ERROR: NVM not installed!" -ForegroundColor Red
    Write-Host "Install NVM from: https://github.com/coreybutler/nvm-windows/releases" -ForegroundColor Yellow
    exit 1
}

# Switch to Node 20
nvm use 20

# Verify
$nodeVersion = node --version
Write-Host "Node version: $nodeVersion" -ForegroundColor Green

if ($nodeVersion -like "v20.*") {
    Write-Host "✓ Successfully switched to Node 20!" -ForegroundColor Green
    Write-Host ""
    Write-Host "You can now run:" -ForegroundColor Cyan
    Write-Host "  npm run dev" -ForegroundColor White
    Write-Host "  npm run build" -ForegroundColor White
    Write-Host "  firebase deploy --only hosting" -ForegroundColor White
} else {
    Write-Host "✗ Failed to switch to Node 20" -ForegroundColor Red
    Write-Host "Current version: $nodeVersion" -ForegroundColor Yellow
}
