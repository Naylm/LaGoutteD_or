# Script de démarrage du serveur local de test pour La Goutte d'Or
# Usage : .\start-server.ps1

$ProjectRoot = $PSScriptRoot
$ServerPort = 3001

function Test-PortInUse {
    param([int]$Port)
    $connection = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    return $connection -ne $null
}

function Stop-ProcessOnPort {
    param([int]$Port)
    $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    if ($connections) {
        $processIds = $connections | Select-Object -ExpandProperty OwningProcess -Unique
        foreach ($procId in $processIds) {
            $proc = Get-Process -Id $procId -ErrorAction SilentlyContinue
            if ($proc -and ($proc.ProcessName -in @('node', 'nodejs'))) {
                Write-Host "Port $Port occupe par '$($proc.ProcessName)' (PID $procId). Arret en cours..." -ForegroundColor Yellow
                Stop-Process -Id $procId -Force -ErrorAction SilentlyContinue
            }
        }
        Start-Sleep -Seconds 2
        # Verification
        if (Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue) {
            Write-Warning "Le port $Port est toujours occupe. Arret force via taskkill..."
            taskkill /F /IM node.exe 2>$null
            Start-Sleep -Seconds 1
        }
    }
}

function Install-IfMissing {
    param([string]$Path)
    if (-not (Test-Path (Join-Path $Path "node_modules"))) {
        Write-Host "Dependances manquantes dans $Path. Installation en cours..." -ForegroundColor Yellow
        Set-Location $Path
        npm install
        if ($LASTEXITCODE -ne 0) {
            Write-Error "Echec de l'installation des dependances dans $Path"
            exit 1
        }
    }
}

Write-Host "Lancement de l'environnement local La Goutte d'Or..." -ForegroundColor Green

# 1. Nettoyage du port serveur
Stop-ProcessOnPort -Port $ServerPort

# 2. Installation des dependances si besoin
Install-IfMissing -Path (Join-Path $ProjectRoot "server")
Install-IfMissing -Path (Join-Path $ProjectRoot "client")
Install-IfMissing -Path $ProjectRoot

# 3. Lancement simultane du client et du serveur
Set-Location $ProjectRoot
npm run dev
