# MongoDB Installation Script for Windows
Write-Host "🔧 Installing MongoDB Community Server..." -ForegroundColor Green

# Check if running as administrator
if (-NOT ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "❌ Please run this script as Administrator" -ForegroundColor Red
    exit 1
}

# Download and install MongoDB
try {
    # Try winget first
    Write-Host "📦 Attempting installation via winget..." -ForegroundColor Yellow
    winget install MongoDB.Server
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ MongoDB installed successfully via winget" -ForegroundColor Green
    } else {
        throw "winget installation failed"
    }
} catch {
    Write-Host "⚠️ winget failed, trying chocolatey..." -ForegroundColor Yellow
    
    # Check if chocolatey is installed
    if (Get-Command choco -ErrorAction SilentlyContinue) {
        choco install mongodb -y
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ MongoDB installed successfully via chocolatey" -ForegroundColor Green
        }
    } else {
        Write-Host "❌ Neither winget nor chocolatey available" -ForegroundColor Red
        Write-Host "📋 Manual installation required:" -ForegroundColor Yellow
        Write-Host "1. Download MongoDB from: https://www.mongodb.com/try/download/community"
        Write-Host "2. Run the installer and follow the setup wizard"
        Write-Host "3. Install as a Windows Service"
        exit 1
    }
}

# Start MongoDB service
Write-Host "🚀 Starting MongoDB service..." -ForegroundColor Green
try {
    Start-Service -Name "MongoDB"
    Write-Host "✅ MongoDB service started successfully" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Could not start MongoDB service automatically" -ForegroundColor Yellow
    Write-Host "💡 Try manually: net start MongoDB" -ForegroundColor Cyan
}

# Test connection
Write-Host "🔍 Testing MongoDB connection..." -ForegroundColor Green
$testResult = Test-NetConnection -ComputerName localhost -Port 27017 -InformationLevel Quiet
if ($testResult) {
    Write-Host "✅ MongoDB is running on port 27017" -ForegroundColor Green
} else {
    Write-Host "❌ MongoDB is not responding on port 27017" -ForegroundColor Red
}

Write-Host "🎉 MongoDB setup complete!" -ForegroundColor Green
Write-Host "📝 Your connection string: mongodb://localhost:27017/clothing_store" -ForegroundColor Cyan
