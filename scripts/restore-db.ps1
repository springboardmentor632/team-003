<#
.SYNOPSIS
    Database Restore Script for DecisionHub on Windows.
.DESCRIPTION
    Restores a target .sql backup file into the running PostgreSQL container.
#>
param (
    [Parameter(Mandatory=$true)]
    [string]$BackupFile,
    [string]$DbUser = "decisionhub",
    [string]$DbName = "decisionhub"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $BackupFile)) {
    Write-Error "[ERROR] Backup file '$BackupFile' does not exist!"
}

Write-Warning "This will overwrite existing data in database '$DbName' with '$BackupFile'."
$confirm = Read-Host "Type 'YES' to proceed"
if ($confirm -ne "YES") {
    Write-Host "Restoration aborted." -ForegroundColor Yellow
    exit 0
}

Write-Host "[INFO] Restoring database from '$BackupFile'..." -ForegroundColor Cyan

$runningContainer = docker ps --filter "name=postgres" --format "{{.Names}}" | Select-Object -First 1

if ($runningContainer) {
    Get-Content $BackupFile | docker exec -i $runningContainer psql -U $DbUser -d $DbName
} else {
    Get-Content $BackupFile | & psql -U $DbUser -d $DbName
}

Write-Host "[SUCCESS] Database restoration completed successfully!" -ForegroundColor Green
