#!/usr/bin/env bash
# ==============================================================================
# DecisionHub Performance & Latency Benchmark Script
# Simulates concurrent API load against public / health endpoints
# ==============================================================================
set -euo pipefail

TARGET_URL="${1:-http://localhost/actuator/health}"
REQUESTS="${2:-100}"
CONCURRENCY="${3:-10}"

echo "================================================================="
echo "DecisionHub Performance Benchmark"
echo "Target URL:  $TARGET_URL"
echo "Requests:    $REQUESTS"
echo "Concurrency: $CONCURRENCY"
echo "================================================================="

if command -v ab &> /dev/null; then
    echo "[INFO] Running ApacheBench (ab)..."
    ab -n "$REQUESTS" -c "$CONCURRENCY" "$TARGET_URL"
elif command -v curl &> /dev/null; then
    echo "[INFO] Running curl latency evaluation ($REQUESTS iterations)..."
    TOTAL_TIME=0
    SUCCESS=0
    FAIL=0
    for i in $(seq 1 "$REQUESTS"); do
        TIME=$(curl -o /dev/null -s -w '%{time_total}\n' "$TARGET_URL")
        STATUS=$(curl -o /dev/null -s -w '%{http_code}\n' "$TARGET_URL")
        if [ "$STATUS" -eq 200 ]; then
            SUCCESS=$((SUCCESS + 1))
        else
            FAIL=$((FAIL + 1))
        fi
        TOTAL_TIME=$(echo "$TOTAL_TIME + $TIME" | bc)
    done
    AVG_TIME=$(echo "scale=4; $TOTAL_TIME / $REQUESTS" | bc)
    echo "================================================================="
    echo "Results:"
    echo "  Total Requests:  $REQUESTS"
    echo "  Successful (200): $SUCCESS"
    echo "  Failed:          $FAIL"
    echo "  Average Latency: ${AVG_TIME}s"
    echo "================================================================="
else
    echo "[ERROR] Neither 'ab' nor 'curl' found in PATH."
    exit 1
fi
