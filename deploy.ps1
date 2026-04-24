# Zivara Deploy Script
# Run from the repo root: .\deploy.ps1

$serverIp = "192.168.1.32"
$apiShare = "\\$serverIp\Zivara"
$webShare = "\\$serverIp\ZivaraWeb"
$apiPublishPath = ".\backend\Zivara\Zivara.Api\publish"
$webBuildPath = ".\web\dist"
$serviceName = "ZivaraApi"

# Prompt for server credentials once and reuse
$creds = Get-Credential -Message "Enter server credentials"
$username = $creds.UserName
$password = $creds.GetNetworkCredential().Password

# -------------------- API --------------------
Write-Host "Publishing Zivara API..." -ForegroundColor Yellow
dotnet publish .\backend\Zivara\Zivara.Api\Zivara.Api.csproj -c Release -r win-x64 --self-contained -o $apiPublishPath

if ($LASTEXITCODE -ne 0) {
    Write-Host "API publish failed. Aborting deploy." -ForegroundColor Red
    exit 1
}

Write-Host "Stopping API service on server..." -ForegroundColor Yellow
Invoke-Command -ComputerName $serverIp -Credential $creds -ScriptBlock {
    Stop-Service ZivaraApi -Force -ErrorAction SilentlyContinue
}

Write-Host "Copying API files to server..." -ForegroundColor Yellow
net use $apiShare $password /user:$username | Out-Null
robocopy $apiPublishPath $apiShare /MIR /NFL /NDL /NJH /NJS /XF "appsettings.Production.json"
net use $apiShare /delete | Out-Null

Write-Host "Starting API service on server..." -ForegroundColor Yellow
Invoke-Command -ComputerName $serverIp -Credential $creds -ScriptBlock {
    Start-Service ZivaraApi
}

# -------------------- Web --------------------
Write-Host "Building Zivara web frontend..." -ForegroundColor Yellow
cd web
npm run build
cd ..

if ($LASTEXITCODE -ne 0) {
    Write-Host "Web build failed. Aborting deploy." -ForegroundColor Red
    exit 1
}

Write-Host "Copying web files to server..." -ForegroundColor Yellow
net use $webShare $password /user:$username | Out-Null
robocopy $webBuildPath $webShare /MIR /NFL /NDL /NJH /NJS
net use $webShare /delete | Out-Null

# -------------------- Status --------------------
Write-Host "Checking API service status..." -ForegroundColor Yellow
Invoke-Command -ComputerName $serverIp -Credential $creds -ScriptBlock {
    Get-Service ZivaraApi
}

Write-Host "Deploy complete." -ForegroundColor Green