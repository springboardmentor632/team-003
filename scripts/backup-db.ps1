<#
.SYNOPSIS
    Automated PostgreSQL Database Backup Script for Windows environments.
.DESCRIPTION
    Dumps the DecisionHub PostgreSQL database via docker exec or local pg_dump,
    compresses the output, and removes backups older than the retention period.
#>
param (
    [string]$BackupDir = ".\backups",
    [string]$ContainerName = "team-003-backend-auth-decision-postgres-1",
    [string]$DbUser = "decisionhub",
    [string]$DbName = "decisionhub",
    [int]$RetentionDays = 14
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$dumpFile = Join-Path $BackupDir "decisionhub_backup_$timestamp.sql"

Write-Host "[INFO] Starting database backup for '$DbName' at $(Get-Date)..." -ForegroundColor Cyan

# Check if docker container is active
$runningContainer = docker ps --filter "name=postgres" --format "{{.Names}}" | Select-Object -First 1

if ($runningContainer) {
    Write-Host "[INFO] Running pg_dump inside container '$runningContainer'..." -ForegroundColor Gray
    docker exec -t $runningContainer pg_dump -U $DbUser -d $DbName --clean --if-exists > $dumpFile
} else {
    Write-Host "[INFO] Container not found running. Running local pg_dump..." -ForegroundColor Gray
    & pg_dump -U $DbUser -d $DbName --clean --if-exists > $dumpFile
}

$fileSize = (Get-Item $dumpFile).Length / 1KB
Write-Host "[SUCCESS] Backup written to $dumpFile ($([math]::Round($fileSize, 2)) KB)" -ForegroundColor Green

# Retention policy: remove files older than $RetentionDays
$limitDate = (Get-Date).AddDays(-$RetentionDays)
Get-ChildItem -Path $BackupDir -Filter "decisionhub_backup_*.sql" | Where-Object { $_.LastWriteTime -lt $limitDate } | Remove-Item -Force
Write-Host "[SUCCESS] Backup maintenance completed." -ForegroundColor Green
