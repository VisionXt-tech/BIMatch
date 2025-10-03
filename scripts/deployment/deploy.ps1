# Script deploy BIMatch con Node 20 (workaround NVM PATH)

Write-Host "BIMatch Deploy Script" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan
Write-Host ""

$nvmPath = "C:\Users\lucar\AppData\Roaming\nvm\nvm.exe"

# Check if NVM exists
if (-not (Test-Path $nvmPath)) {
    Write-Host "ERROR: NVM not found at $nvmPath" -ForegroundColor Red
    Write-Host "Please install NVM first: https://github.com/coreybutler/nvm-windows/releases" -ForegroundColor Yellow
    exit 1
}

Write-Host "NVM found" -ForegroundColor Green

# Install Node 20 if not present
Write-Host "Checking Node 20..." -ForegroundColor Cyan
& $nvmPath list | Out-Null
& $nvmPath install 20 2>$null

# Use Node 20
Write-Host "Switching to Node 20..." -ForegroundColor Cyan
& $nvmPath use 20

if ($LASTEXITCODE -ne 0) {
    Write-Host "Failed to switch to Node 20" -ForegroundColor Red
    exit 1
}

# Reload PATH to pick up node.exe
Write-Host "Reloading environment..." -ForegroundColor Cyan
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")

# Verify Node version
$nodeVersion = node --version 2>$null
if (-not $nodeVersion) {
    Write-Host "Node not found in PATH after reload. Trying symlink path..." -ForegroundColor Yellow
    $env:Path = $env:Path + ";C:\Program Files\nodejs"
    $nodeVersion = node --version 2>$null
}
Write-Host "Node version: $nodeVersion" -ForegroundColor Green

if ($nodeVersion -notlike "v20.*") {
    Write-Host "WARNING: Not using Node 20! Current: $nodeVersion" -ForegroundColor Yellow
    Write-Host "Trying to continue anyway..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Starting Firebase deploy..." -ForegroundColor Cyan
Write-Host ""

# Deploy
firebase deploy --only hosting

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Deploy completed successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Your app should be live at:" -ForegroundColor Cyan
    Write-Host "https://bimatch-cd100.web.app" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "Deploy failed" -ForegroundColor Red
    Write-Host "Check the error messages above" -ForegroundColor Yellow
}
