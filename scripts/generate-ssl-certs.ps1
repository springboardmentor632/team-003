<#
.SYNOPSIS
    Generates self-signed SSL/TLS certificates on Windows for staging/local HTTPS.
#>
param (
    [string]$CertDir = ".\nginx\ssl\live",
    [string]$Domain = "localhost"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $CertDir)) {
    New-Item -ItemType Directory -Path $CertDir -Force | Out-Null
}

$keyPath = Join-Path $CertDir "privkey.pem"
$certPath = Join-Path $CertDir "fullchain.pem"

Write-Host "[INFO] Generating self-signed SSL certificate for $Domain..." -ForegroundColor Cyan

# Check if openssl is available
if (Get-Command openssl -ErrorAction SilentlyContinue) {
    & openssl req -x509 -nodes -days 365 -newkey rsa:2048 `
        -keyout $keyPath `
        -out $certPath `
        -subj "/CN=$Domain" `
        -addext "subjectAltName=DNS:$Domain,IP:127.0.0.1"
    Write-Host "[SUCCESS] Generated certificates via OpenSSL at $CertDir" -ForegroundColor Green
} else {
    Write-Host "[INFO] OpenSSL not found in PATH. Generating via PowerShell New-SelfSignedCertificate..." -ForegroundColor Yellow
    $cert = New-SelfSignedCertificate -DnsName $Domain, "127.0.0.1" -CertStoreLocation "cert:\CurrentUser\My" -NotAfter (Get-Date).AddYears(1)
    
    # Export certificate
    $certBytes = $cert.Export([System.Security.Cryptography.X509Certificates.X509ContentType]::Cert)
    [System.IO.File]::WriteAllBytes($certPath, $certBytes)
    Write-Host "[SUCCESS] Created certificate at $certPath" -ForegroundColor Green
}
