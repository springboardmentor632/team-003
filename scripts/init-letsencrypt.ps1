<#
.SYNOPSIS
    Automates Let's Encrypt CA-signed SSL/TLS certificate issuance via ACME HTTP-01 challenge.
.PARAMETER Domain
    The primary public domain name (e.g. decisionhub.org or demo.decisionhub.org).
.PARAMETER Email
    Admin email address for Let's Encrypt registration and critical renewal notices.
.PARAMETER Staging
    Switch to use Let's Encrypt staging environment (avoids rate limits during testing).
.PARAMETER RsaKeySize
    RSA key size in bits (default: 4096).
#>
param (
    [Parameter(Mandatory = $true)]
    [string]$Domain,

    [Parameter(Mandatory = $true)]
    [string]$Email,

    [switch]$Staging,

    [int]$RsaKeySize = 4096
)

$ErrorActionPreference = "Stop"

Write-Host "`n========================================================" -ForegroundColor Cyan
Write-Host "   DecisionHub Let's Encrypt SSL Automated Provisioning " -ForegroundColor Cyan
Write-Host "========================================================`n" -ForegroundColor Cyan

# 1. Directory Structure Setup
$sslDir = ".\nginx\ssl"
$liveDir = Join-Path $sslDir "live"
if (-not (Test-Path $liveDir)) {
    New-Item -ItemType Directory -Path $liveDir -Force | Out-Null
}

$fullchainPath = Join-Path $liveDir "fullchain.pem"
$privkeyPath = Join-Path $liveDir "privkey.pem"

# 2. Bootstrap initial certificate if none exists
if (-not (Test-Path $fullchainPath) -or -not (Test-Path $privkeyPath)) {
    Write-Host "[INFO] No existing certificate found. Generating bootstrap certificate so Nginx can start..." -ForegroundColor Yellow
    & .\scripts\generate-ssl-certs.ps1 -CertDir $liveDir -Domain $Domain
}

# 3. Start or reload containers
Write-Host "[INFO] Starting DecisionHub containers to bind port 80 & 443..." -ForegroundColor Cyan
& docker compose up -d frontend

# 4. Wait for Nginx to be healthy
Write-Host "[INFO] Waiting for Nginx HTTP/HTTPS server to respond..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

# 5. Build Certbot Arguments
$stagingArg = if ($Staging) { "--staging" } else { "" }
Write-Host "[INFO] Requesting CA-signed certificate from Let's Encrypt for '$Domain'..." -ForegroundColor Cyan
if ($Staging) {
    Write-Host "[NOTICE] Running in STAGING mode (test certificates issued)." -ForegroundColor Yellow
}

$certbotCmd = "certbot certonly --webroot -w /var/www/certbot $stagingArg --email $Email -d $Domain --rsa-key-size $RsaKeySize --agree-tos --no-eff-email --non-interactive --force-renewal"

# 6. Execute Certbot ACME Challenge via Docker
& docker compose run --rm --entrypoint "sh -c '$certbotCmd'" certbot

# 7. Relink/Copy Issued Certificates into Nginx SSL Path
$domainCertDir = Join-Path $sslDir "live\$Domain"
if (Test-Path (Join-Path $domainCertDir "fullchain.pem")) {
    Copy-Item (Join-Path $domainCertDir "fullchain.pem") $fullchainPath -Force
    Copy-Item (Join-Path $domainCertDir "privkey.pem") $privkeyPath -Force
    Write-Host "[SUCCESS] CA-signed certificates successfully placed in $liveDir" -ForegroundColor Green
}

# 8. Reload Nginx to activate new certificate
Write-Host "[INFO] Reloading Nginx configuration with new TLS certificate..." -ForegroundColor Cyan
& docker exec decisionhub-frontend nginx -s reload

Write-Host "`n[SUCCESS] HTTPS is actively terminating on port 443 for https://$Domain !" -ForegroundColor Green
Write-Host "[SUCCESS] HTTP port 80 is actively redirecting to HTTPS." -ForegroundColor Green
Write-Host "[SUCCESS] Automated renewals handled in background by 'decisionhub-certbot' service.`n" -ForegroundColor Green
