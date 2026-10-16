#!/usr/bin/env bash
# AWS ECR & ECS Deployment Script for DecisionHub Backend (Bash)
# Usage: ./aws/deploy-aws.sh [AWS_REGION] [AWS_ACCOUNT_ID]

set -euo pipefail

AWS_REGION="${1:-${AWS_REGION:-us-east-1}}"
ACCOUNT_ID="${2:-${AWS_ACCOUNT_ID:-}}"
REPOSITORY_NAME="decisionhub-backend"
CLUSTER_NAME="decisionhub-cluster"
SERVICE_NAME="decisionhub-backend-service"
IMAGE_TAG="${IMAGE_TAG:-latest}"

echo "=========================================================="
echo "   DecisionHub AWS Cloud Deployment Tool                 "
echo "=========================================================="

if [ -z "$ACCOUNT_ID" ]; then
    echo "Resolving AWS Account ID via STS..."
    ACCOUNT_ID=$(aws sts get-caller-identity --query "Account" --output text | tr -d '[:space:]')
fi

ECR_REGISTRY="${ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
IMAGE_URI="${ECR_REGISTRY}/${REPOSITORY_NAME}:${IMAGE_TAG}"

echo "AWS Region:     ${AWS_REGION}"
echo "Account ID:     ${ACCOUNT_ID}"
echo "ECR Registry:   ${ECR_REGISTRY}"
echo "Target Image:   ${IMAGE_URI}"

# 1. Ensure ECR repository exists
echo -e "\n[Step 1/5] Verifying ECR repository..."
aws ecr describe-repositories --repository-names "${REPOSITORY_NAME}" --region "${AWS_REGION}" >/dev/null 2>&1 || \
    aws ecr create-repository --repository-name "${REPOSITORY_NAME}" --region "${AWS_REGION}" --image-scanning-configuration scanOnPush=true >/dev/null

# 2. Authenticate Docker with Amazon ECR
echo -e "\n[Step 2/5] Authenticating Docker with Amazon ECR..."
aws ecr get-login-password --region "${AWS_REGION}" | docker login --username AWS --password-stdin "${ECR_REGISTRY}"

# 3. Build container image from source
echo -e "\n[Step 3/5] Building Docker image from source..."
docker build -f backend/springboot-project/Dockerfile.cloud -t "${REPOSITORY_NAME}:${IMAGE_TAG}" backend/springboot-project

# 4. Tag and push container image to ECR
echo -e "\n[Step 4/5] Tagging and pushing image to Amazon ECR..."
docker tag "${REPOSITORY_NAME}:${IMAGE_TAG}" "${IMAGE_URI}"
docker push "${IMAGE_URI}"

# 5. Trigger ECS service deployment
echo -e "\n[Step 5/5] Updating ECS Service with zero-downtime rolling deployment..."
aws ecs update-service \
    --cluster "${CLUSTER_NAME}" \
    --service "${SERVICE_NAME}" \
    --force-new-deployment \
    --region "${AWS_REGION}" >/dev/null

echo "=========================================================="
echo " Deployment successfully initiated!"
echo " Image:   ${IMAGE_URI}"
echo " Service: ${SERVICE_NAME} on cluster ${CLUSTER_NAME}"
echo "=========================================================="
