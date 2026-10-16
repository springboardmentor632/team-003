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

$resolvedCertDir = (Resolve-Path $CertDir).Path
$keyPath = Join-Path $CertDir "privkey.pem"
$certPath = Join-Path $CertDir "fullchain.pem"

Write-Host "[INFO] Generating self-signed SSL certificate for $Domain..." -ForegroundColor Cyan

# 1. Check if native OpenSSL is available
if (Get-Command openssl -ErrorAction SilentlyContinue) {
    & openssl req -x509 -nodes -days 365 -newkey rsa:2048 `
        -keyout $keyPath `
        -out $certPath `
        -subj "/CN=$Domain" `
        -addext "subjectAltName=DNS:$Domain,IP:127.0.0.1"
    Write-Host "[SUCCESS] Generated certificates via OpenSSL at $CertDir" -ForegroundColor Green
}
# 2. Check if Docker is available to run OpenSSL in container
elseif (Get-Command docker -ErrorAction SilentlyContinue) {
    Write-Host "[INFO] OpenSSL not found in PATH. Using containerized OpenSSL via Docker..." -ForegroundColor Cyan
    & docker run --rm -v "${resolvedCertDir}:/certs" alpine sh -c "apk add --no-cache openssl >/dev/null 2>&1 && openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout /certs/privkey.pem -out /certs/fullchain.pem -subj '/CN=$Domain' -addext 'subjectAltName=DNS:$Domain,IP:127.0.0.1'"
    Write-Host "[SUCCESS] Generated certificates via Docker OpenSSL at $CertDir" -ForegroundColor Green
}
# 3. Fallback to PowerShell New-SelfSignedCertificate
else {
    Write-Host "[INFO] Generating via PowerShell New-SelfSignedCertificate..." -ForegroundColor Yellow
    $cert = New-SelfSignedCertificate -DnsName $Domain, "127.0.0.1" -CertStoreLocation "cert:\CurrentUser\My" -NotAfter (Get-Date).AddYears(1)
    $certBytes = $cert.Export([System.Security.Cryptography.X509Certificates.X509ContentType]::Cert)
    $certPem = "-----BEGIN CERTIFICATE-----`r`n" + [System.Convert]::ToBase64String($certBytes, [System.Base64FormattingOptions]::InsertLineBreaks) + "`r`n-----END CERTIFICATE-----`r`n"
    [System.IO.File]::WriteAllText($certPath, $certPem)
    Write-Host "[SUCCESS] Created certificate at $certPath" -ForegroundColor Green
}
