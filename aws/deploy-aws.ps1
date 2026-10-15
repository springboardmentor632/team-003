# AWS ECR & ECS Deployment Script for DecisionHub Backend (PowerShell)
# Usage: .\aws\deploy-aws.ps1 -AwsRegion "us-east-1" -AccountId "123456789012"

param (
    [Parameter(Mandatory=$false)]
    [string]$AwsRegion = "us-east-1",

    [Parameter(Mandatory=$false)]
    [string]$AccountId = $env:AWS_ACCOUNT_ID,

    [Parameter(Mandatory=$false)]
    [string]$RepositoryName = "decisionhub-backend",

    [Parameter(Mandatory=$false)]
    [string]$ClusterName = "decisionhub-cluster",

    [Parameter(Mandatory=$false)]
    [string]$ServiceName = "decisionhub-backend-service",

    [Parameter(Mandatory=$false)]
    [string]$ImageTag = "latest"
)

$ErrorActionPreference = "Stop"

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   DecisionHub AWS Cloud Deployment Tool                 " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

if (-not $AccountId) {
    Write-Host "Resolving AWS Account ID via STS..." -ForegroundColor Yellow
    $AccountId = (aws sts get-caller-identity --query "Account" --output text).Trim()
}

if (-not $AccountId) {
    Write-Error "AWS Account ID could not be detected. Please configure AWS CLI or pass -AccountId."
}

$EcrRegistry = "$AccountId.dkr.ecr.$AwsRegion.amazonaws.com"
$ImageUri = "$EcrRegistry/$RepositoryName`:$ImageTag"

Write-Host "AWS Region:     $AwsRegion" -ForegroundColor Green
Write-Host "Account ID:     $AccountId" -ForegroundColor Green
Write-Host "ECR Registry:   $EcrRegistry" -ForegroundColor Green
Write-Host "Target Image:   $ImageUri" -ForegroundColor Green

# 1. Ensure ECR repository exists
Write-Host "`n[Step 1/5] Verifying ECR repository..." -ForegroundColor Yellow
$repoCheck = aws ecr describe-repositories --repository-names $RepositoryName --region $AwsRegion 2>$null
if (-not $repoCheck) {
    Write-Host "Creating ECR repository '$RepositoryName'..." -ForegroundColor Yellow
    aws ecr create-repository --repository-name $RepositoryName --region $AwsRegion --image-scanning-configuration scanOnPush=true | Out-Null
}

# 2. Authenticate Docker with Amazon ECR
Write-Host "`n[Step 2/5] Authenticating Docker with Amazon ECR..." -ForegroundColor Yellow
aws ecr get-login-password --region $AwsRegion | docker login --username AWS --password-stdin $EcrRegistry

# 3. Build container image using multi-stage Dockerfile
Write-Host "`n[Step 3/5] Building Docker image from source..." -ForegroundColor Yellow
docker build -f backend/springboot-project/Dockerfile.cloud -t $RepositoryName`:$ImageTag backend/springboot-project

# 4. Tag and push container image to ECR
Write-Host "`n[Step 4/5] Tagging and pushing image to Amazon ECR..." -ForegroundColor Yellow
docker tag $RepositoryName`:$ImageTag $ImageUri
docker push $ImageUri

# 5. Trigger ECS service deployment
Write-Host "`n[Step 5/5] Updating ECS Service with zero-downtime rolling deployment..." -ForegroundColor Yellow
aws ecs update-service `
    --cluster $ClusterName `
    --service $ServiceName `
    --force-new-deployment `
    --region $AwsRegion | Out-Null

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host " Deployment successfully initiated!" -ForegroundColor Green
Write-Host " Image: $ImageUri" -ForegroundColor Green
Write-Host " Service: $ServiceName on cluster $ClusterName" -ForegroundColor Green
Write-Host " Monitor progress with:" -ForegroundColor White
Write-Host " aws ecs describe-services --cluster $ClusterName --services $ServiceName --region $AwsRegion" -ForegroundColor White
Write-Host "==========================================================" -ForegroundColor Green
