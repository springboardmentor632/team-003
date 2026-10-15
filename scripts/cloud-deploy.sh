#!/usr/bin/env bash
# DecisionHub - Public Cloud Push & Deployment Helper
# Usage: ./scripts/cloud-deploy.sh [render|railway|vercel|aws|git|all] [REMOTE_URL]

set -euo pipefail

TARGET="${1:-all}"
REMOTE_URL="${2:-}"

echo "=========================================================="
echo "   DecisionHub Public Cloud Hosting & Deployment Tool     "
echo "=========================================================="

CURRENT_BRANCH=$(git branch --show-current)
echo -e "\nCurrent Git branch: ${CURRENT_BRANCH}"

if [ -n "$REMOTE_URL" ]; then
    echo "Configuring git remote 'origin' -> ${REMOTE_URL}"
    git remote remove origin 2>/dev/null || true
    git remote add origin "$REMOTE_URL"
    echo "Pushing main to remote repository..."
    git push -u origin main
    echo "Code successfully pushed to remote repository!"
else
    if git remote get-url origin >/dev/null 2>&1; then
        EXISTING_REMOTE=$(git remote get-url origin)
        echo "Existing remote 'origin' found: ${EXISTING_REMOTE}"
        echo "Pushing updates to remote..."
        git push origin "$CURRENT_BRANCH"
    else
        echo "No Git remote configured yet."
        echo "To link and push to your GitHub / GitLab repository, run:"
        echo "  git remote add origin https://github.com/<your-username>/decisionhub.git"
        echo "  git push -u origin main"
    fi
fi

if [ "$TARGET" = "render" ] || [ "$TARGET" = "all" ]; then
    echo -e "\n----------------------------------------------------------"
    echo " [Render Deployment] (1-Click Blueprint)"
    echo "----------------------------------------------------------"
    echo "1. Open https://dashboard.render.com/blueprints"
    echo "2. Click 'New Blueprint Instance' and connect your repository."
    echo "3. Render automatically reads 'render.yaml' and provisions PostgreSQL, Docker Backend, and Static Site."
fi

if [ "$TARGET" = "railway" ] || [ "$TARGET" = "all" ]; then
    echo -e "\n----------------------------------------------------------"
    echo " [Railway Deployment]"
    echo "----------------------------------------------------------"
    echo "1. Install Railway CLI: npm i -g @railway/cli"
    echo "2. Login & Deploy: railway login && railway up"
fi

if [ "$TARGET" = "vercel" ] || [ "$TARGET" = "all" ]; then
    echo -e "\n----------------------------------------------------------"
    echo " [Vercel Deployment] (Frontend Edge CDN)"
    echo "----------------------------------------------------------"
    echo "1. Login & Deploy: cd decisionhub-frontend && npx vercel --prod"
fi

if [ "$TARGET" = "aws" ] || [ "$TARGET" = "all" ]; then
    echo -e "\n----------------------------------------------------------"
    echo " [AWS Deployment] (ECS Fargate / App Runner)"
    echo "----------------------------------------------------------"
    echo "Run: ./aws/deploy-aws.sh us-east-1"
fi

echo -e "\n=========================================================="
echo " Full documentation available at: DEPLOYMENT.md"
echo "=========================================================="
