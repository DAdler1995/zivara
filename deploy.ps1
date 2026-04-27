# Zivara Deploy Script
# Run from the repo root: .\deploy.ps1

$serverIp = "192.168.1.32"
$apiPublishPath = ".\backend\Zivara\Zivara.Api\publish"
$webBuildPath   = ".\web\dist"

# Prompt for server credentials once and reuse
$creds = Get-Credential -Message "Enter server credentials"

# -------------------- API --------------------
Write-Host "Publishing Zivara API..." -ForegroundColor Yellow
dotnet publish .\backend\Zivara\Zivara.Api\Zivara.Api.csproj -c Release -r win-x64 --self-contained -o $apiPublishPath

if ($LASTEXITCODE -ne 0) {
    Write-Host "API publish failed. Aborting deploy." -ForegroundColor Red
    exit 1
}

# -------------------- DB Migrations --------------------
Write-Host "Checking for pending migrations..." -ForegroundColor Yellow
$migrationOutput = dotnet ef migrations list --project .\backend\Zivara\Zivara.Api\Zivara.Api.csproj --no-build 2>&1
$pending = $migrationOutput | Where-Object { $_ -match "\(Pending\)" }

if ($pending) {
    Write-Host "Applying $($pending.Count) pending migration(s)..." -ForegroundColor Yellow
    dotnet ef database update --project .\backend\Zivara\Zivara.Api\Zivara.Api.csproj --no-build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Migration failed. Aborting deploy." -ForegroundColor Red
        exit 1
    }
    Write-Host "Migrations applied." -ForegroundColor Green
} else {
    Write-Host "No pending migrations." -ForegroundColor Green
}

# -------------------- Remote session --------------------
$session = New-PSSession -ComputerName $serverIp -Credential $creds

# Discover the real filesystem paths the SMB shares point to on the server
$serverPaths = Invoke-Command -Session $session -ScriptBlock {
    @{
        ApiPath = (Get-SmbShare -Name "Zivara").Path
        WebPath = (Get-SmbShare -Name "ZivaraWeb").Path
    }
}
$apiServerPath = $serverPaths.ApiPath
$webServerPath = $serverPaths.WebPath

Write-Host "Server paths - API: $apiServerPath  Web: $webServerPath" -ForegroundColor DarkGray

# -------------------- Deploy API --------------------
Write-Host "Stopping API service on server..." -ForegroundColor Yellow
Invoke-Command -Session $session -ScriptBlock { Stop-Service ZivaraApi -Force -ErrorAction SilentlyContinue }

Write-Host "Copying API files to server..." -ForegroundColor Yellow
# Mirror: clear destination (preserve Production config), then copy fresh
Invoke-Command -Session $session -ScriptBlock {
    param($path)
    Get-ChildItem -Path $path -Exclude "appsettings.Production.json" |
        Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
} -ArgumentList $apiServerPath

Get-ChildItem -Path $apiPublishPath -Exclude "appsettings.Production.json" | ForEach-Object {
    Copy-Item -Path $_.FullName -Destination $apiServerPath -ToSession $session -Recurse -Force
}

Write-Host "Starting API service on server..." -ForegroundColor Yellow
Invoke-Command -Session $session -ScriptBlock { Start-Service ZivaraApi }

# -------------------- Web --------------------
Write-Host "Building Zivara web frontend..." -ForegroundColor Yellow
cd web
npm run build
cd ..

if ($LASTEXITCODE -ne 0) {
    Write-Host "Web build failed. Aborting deploy." -ForegroundColor Red
    Remove-PSSession $session
    exit 1
}

Write-Host "Copying web files to server..." -ForegroundColor Yellow
Invoke-Command -Session $session -ScriptBlock {
    param($path)
    Get-ChildItem -Path $path | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
} -ArgumentList $webServerPath

Get-ChildItem -Path $webBuildPath | ForEach-Object {
    Copy-Item -Path $_.FullName -Destination $webServerPath -ToSession $session -Recurse -Force
}

# -------------------- Status --------------------
Write-Host "Checking API service status..." -ForegroundColor Yellow
Invoke-Command -Session $session -ScriptBlock { Get-Service ZivaraApi }

Remove-PSSession $session
Write-Host "Deploy complete." -ForegroundColor Green
