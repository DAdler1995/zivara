# Zivara Dev Startup
# Starts the API and web frontend in Windows Terminal tabs

$repoRoot = "C:\Users\Dakota\Documents\repos\zivara"
$apiPath = "$repoRoot\backend\Zivara\Zivara.Api"
$webPath = "$repoRoot\web"

Write-Host "Starting Zivara dev environment..." -ForegroundColor Cyan

wt `
    new-tab --title "Zivara API" --tabColor "#1a3a1a" --startingDirectory $apiPath powershell -NoExit -Command "dotnet run --launch-profile http" `; `
    new-tab --title "Zivara Web" --tabColor "#1a2a3a" --startingDirectory $webPath powershell -NoExit -Command "npm run dev"