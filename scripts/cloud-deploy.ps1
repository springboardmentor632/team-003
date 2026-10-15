# DecisionHub - Public Cloud Push & Deployment Helper
# Usage: .\scripts\cloud-deploy.ps1 [-Target <render|railway|vercel|aws|git>] [-RemoteUrl <url>]

param(
    [ValidateSet("git", "render", "railway", "vercel", "aws", "all")]
    [string]$Target = "all",

    [string]$RemoteUrl = ""
)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "   DecisionHub Public Cloud Hosting & Deployment Tool     " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

# 1. Check Git Status
$currentBranch = (git branch --show-current).Trim()
Write-Host "`nCurrent Git branch: $currentBranch" -ForegroundColor Green

if ($RemoteUrl) {
    Write-Host "Configuring git remote 'origin' -> $RemoteUrl" -ForegroundColor Yellow
    git remote remove origin 2>$null
    git remote add origin $RemoteUrl
    Write-Host "Pushing main to remote repository..." -ForegroundColor Yellow
    git push -u origin main
    Write-Host "Code successfully pushed to remote repository!" -ForegroundColor Green
} else {
    $existingRemote = (git remote get-url origin 2>$null)
    if ($existingRemote) {
        Write-Host "Existing remote 'origin' found: $existingRemote" -ForegroundColor Green
        Write-Host "Pushing updates to remote..." -ForegroundColor Yellow
        git push origin $currentBranch
    } else {
        Write-Host "No Git remote configured yet." -ForegroundColor Yellow
        Write-Host "To link and push to your GitHub / GitLab repository, run:" -ForegroundColor White
        Write-Host "  git remote add origin https://github.com/<your-username>/decisionhub.git" -ForegroundColor White
        Write-Host "  git push -u origin main" -ForegroundColor White
    }
}

# 2. Render Deployment Instructions
if ($Target -eq "render" -or $Target -eq "all") {
    Write-Host "`n----------------------------------------------------------" -ForegroundColor Magenta
    Write-Host " [Render Deployment] (1-Click Blueprint)" -ForegroundColor Magenta
    Write-Host "----------------------------------------------------------" -ForegroundColor Magenta
    Write-Host "1. Open https://dashboard.render.com/blueprints" -ForegroundColor White
    Write-Host "2. Click 'New Blueprint Instance' and select your GitHub repository." -ForegroundColor White
    Write-Host "3. Render will automatically read 'render.yaml' and deploy:" -ForegroundColor White
    Write-Host "   - Managed PostgreSQL 16 Database" -ForegroundColor Gray
    Write-Host "   - Docker Backend Web Service (Spring Boot 4 / Java 25)" -ForegroundColor Gray
    Write-Host "   - React 18 SPA Static Site (Vite 5 / Nginx rewrites)" -ForegroundColor Gray
}

# 3. Railway Deployment Instructions
if ($Target -eq "railway" -or $Target -eq "all") {
    Write-Host "`n----------------------------------------------------------" -ForegroundColor Magenta
    Write-Host " [Railway Deployment]" -ForegroundColor Magenta
    Write-Host "----------------------------------------------------------" -ForegroundColor Magenta
    Write-Host "1. Install Railway CLI: npm i -g @railway/cli" -ForegroundColor White
    Write-Host "2. Login: railway login" -ForegroundColor White
    Write-Host "3. Deploy stack: railway up" -ForegroundColor White
    Write-Host "   Railway automatically consumes 'railway.json' and builds with Docker." -ForegroundColor Gray
}

# 4. Vercel Deployment Instructions
if ($Target -eq "vercel" -or $Target -eq "all") {
    Write-Host "`n----------------------------------------------------------" -ForegroundColor Magenta
    Write-Host " [Vercel Deployment] (Frontend Edge CDN)" -ForegroundColor Magenta
    Write-Host "----------------------------------------------------------" -ForegroundColor Magenta
    Write-Host "1. Login to Vercel: npx vercel login" -ForegroundColor White
    Write-Host "2. Deploy frontend: cd decisionhub-frontend; npx vercel --prod" -ForegroundColor White
    Write-Host "   Configured with 'decisionhub-frontend/vercel.json' for SPA routing." -ForegroundColor Gray
}

# 5. AWS Deployment Instructions
if ($Target -eq "aws" -or $Target -eq "all") {
    Write-Host "`n----------------------------------------------------------" -ForegroundColor Magenta
    Write-Host " [AWS Deployment] (ECS Fargate / App Runner)" -ForegroundColor Magenta
    Write-Host "----------------------------------------------------------" -ForegroundColor Magenta
    Write-Host "Run the automated AWS deployment script:" -ForegroundColor White
    Write-Host "  .\aws\deploy-aws.ps1 -AwsRegion us-east-1" -ForegroundColor Yellow
    Write-Host "This builds the Docker image from source, pushes to Amazon ECR," -ForegroundColor Gray
    Write-Host "and updates the ECS service defined in 'aws/task-definition.json'." -ForegroundColor Gray
}

Write-Host "`n==========================================================" -ForegroundColor Cyan
Write-Host " Full documentation available at: DEPLOYMENT.md" -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan
