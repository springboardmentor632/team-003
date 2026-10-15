<#
.SYNOPSIS
    Performance & Latency Benchmark Script for DecisionHub on Windows.
#>
param (
    [string]$TargetUrl = "http://localhost/actuator/health",
    [int]$Requests = 50,
    [int]$Concurrency = 5
)

$ErrorActionPreference = "Stop"

Write-Host "=================================================================" -ForegroundColor Cyan
Write-Host "DecisionHub Performance & Concurrency Benchmark" -ForegroundColor Cyan
Write-Host "Target URL:  $TargetUrl" -ForegroundColor Gray
Write-Host "Requests:    $Requests" -ForegroundColor Gray
Write-Host "=================================================================" -ForegroundColor Cyan

$latencies = [System.Collections.Generic.List[double]]::new()
$successCount = 0
$failCount = 0

for ($i = 1; $i -le $Requests; $i++) {
    $sw = [System.Diagnostics.Stopwatch]::StartNew()
    try {
        $response = Invoke-WebRequest -Uri $TargetUrl -UseBasicParsing -TimeoutSec 5
        $sw.Stop()
        $latencies.Add($sw.Elapsed.TotalMilliseconds)
        if ($response.StatusCode -eq 200) { $successCount++ } else { $failCount++ }
    } catch {
        $sw.Stop()
        $failCount++
    }
}

$sorted = $latencies | Sort-Object
$avg = ($latencies | Measure-Object -Average).Average
$p50 = $sorted[[math]::Floor($sorted.Count * 0.50)]
$p95 = $sorted[[math]::Floor($sorted.Count * 0.95)]
$p99 = $sorted[[math]::Floor($sorted.Count * 0.99)]

Write-Host "=================================================================" -ForegroundColor Green
Write-Host "Benchmark Summary:" -ForegroundColor Green
Write-Host "  Total Requests:  $Requests"
Write-Host "  Success (200):   $successCount"
Write-Host "  Failed:          $failCount"
Write-Host "  Average Latency: $([math]::Round($avg, 2)) ms"
Write-Host "  p50 (Median):    $([math]::Round($p50, 2)) ms"
Write-Host "  p95:             $([math]::Round($p95, 2)) ms"
Write-Host "  p99:             $([math]::Round($p99, 2)) ms"
Write-Host "=================================================================" -ForegroundColor Green
