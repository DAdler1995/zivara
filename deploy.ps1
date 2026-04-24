# Zivara Deploy Script
# Run from the repo root: .\deploy.ps1

$serverIp = "192.168.1.32"
$serverShare = "\\$serverIp\Zivara"
$publishPath = ".\backend\Zivara\Zivara.Api\publish"
$serviceName = "ZivaraApi"

# Prompt for server credentials once and reuse
$creds = Get-Credential -Message "Enter server credentials"
$username = $creds.UserName
$password = $creds.GetNetworkCredential().Password

Write-Host "Publishing Zivara API..." -ForegroundColor Yellow
dotnet publish .\backend\Zivara\Zivara.Api\Zivara.Api.csproj -c Release -r win-x64 --self-contained -o $publishPath

if ($LASTEXITCODE -ne 0) {
    Write-Host "Publish failed. Aborting deploy." -ForegroundColor Red
    exit 1
}

Write-Host "Stopping service on server..." -ForegroundColor Yellow
Invoke-Command -ComputerName $serverIp -Credential $creds -ScriptBlock {
    Stop-Service ZivaraApi -Force -ErrorAction SilentlyContinue
}

Write-Host "Mapping network share..." -ForegroundColor Yellow
net use $serverShare $password /user:$username | Out-Null

Write-Host "Copying files to server..." -ForegroundColor Yellow
robocopy $publishPath $serverShare /MIR /NFL /NDL /NJH /NJS /XF "appsettings.Production.json"

Write-Host "Disconnecting network share..." -ForegroundColor Yellow
net use $serverShare /delete | Out-Null

Write-Host "Starting service on server..." -ForegroundColor Yellow
Invoke-Command -ComputerName $serverIp -Credential $creds -ScriptBlock {
    Start-Service ZivaraApi
}

Write-Host "Checking service status..." -ForegroundColor Yellow
Invoke-Command -ComputerName $serverIp -Credential $creds -ScriptBlock {
    Get-Service ZivaraApi
}

Write-Host "Deploy complete." -ForegroundColor Green