# DecisionHub — Production Cloud Deployment Guide

> **System**: DecisionHub Multi-Cloud Production Architecture  
> **Supported Public Cloud Platforms**:
> 1. **Render** (1-Click Blueprint: Web Service + Static Site + Managed PostgreSQL)
> 2. **Railway** (Zero-Config Docker + Managed PostgreSQL Plugin)
> 3. **Vercel** (Global Edge CDN React SPA + Proxy Rewrites)
> 4. **AWS** (ECS Fargate / App Runner + RDS PostgreSQL + S3 Storage + Route53 ALB)
> 5. **Self-Hosted / VPS** (Docker Compose with Nginx TLS Termination)

---

## Architecture Overview

```mermaid
flowchart TD
    subgraph Clients["Clients & Edge Tier"]
        Browser["User Web Browser"]
        Mobile["Mobile Web / PWA"]
        EdgeCDN["Cloudflare / Vercel CDN"]
    end

    subgraph Frontends["Frontend Delivery Options"]
        VercelApp["Vercel SPA Hosting (Edge Network)"]
        RenderStatic["Render Static Site Service"]
        NginxProd["Nginx Production Container (:80 / :443)"]
    end

    subgraph Backends["Backend Application Tier"]
        RenderWeb["Render Web Service (Docker)"]
        RailwayWeb["Railway Container (Docker)"]
        AwsECS["AWS ECS Fargate Task / App Runner (:8080)"]
    end

    subgraph DataServices["Data & Persistence Tier"]
        RDS["PostgreSQL 16 (AWS RDS / Render DB / Railway Postgres)"]
        S3["AWS S3 / Cloudinary (Media & Attachments)"]
        FCM["Firebase Cloud Messaging (Push Notifications)"]
        GoogleAuth["Google Identity (OAuth2 Login)"]
    end

    Browser --> EdgeCDN
    Mobile --> EdgeCDN
    EdgeCDN --> Frontends
    Frontends -->|REST API Requests /api/*| Backends
    Backends -->|JDBC Connection Pool| RDS
    Backends -->|Multipart Uploads| S3
    Backends -->|Push API v1| FCM
    Backends -->|OAuth2 Token Exchange| GoogleAuth
```

---

## Cloud Deployment Matrix

| Cloud Target | Best For | Included Artifacts | Setup Effort |
| :--- | :--- | :--- | :--- |
| **Render** | All-in-one deployment with managed DB | [`render.yaml`](./render.yaml) | 5 minutes (1-click Blueprint) |
| **Railway** | Quick container + database hosting | [`railway.json`](./railway.json) | 5 minutes (Git connect) |
| **Vercel** | Lightning-fast static frontend CDN | [`vercel.json`](./vercel.json) | 2 minutes (Zero-config) |
| **AWS** | Enterprise scalable production | [`aws/task-definition.json`](./aws/task-definition.json), [`aws/apprunner.yaml`](./aws/apprunner.yaml), [`aws/deploy-aws.ps1`](./aws/deploy-aws.ps1) | 20 minutes (Full IAM & VPC) |
| **Docker Compose** | Single VPS (EC2/DigitalOcean/Linode) | [`docker-compose.yml`](./docker-compose.yml), [`.env.example`](./.env.example) | 5 minutes (`docker compose up`) |

---

## 1. Render Deployment (Blueprint)

Render allows you to launch the entire stack (PostgreSQL database, Spring Boot backend, and React static frontend) from a single declarative file: [`render.yaml`](./render.yaml).

### Steps:
1. Log in to [Render Dashboard](https://dashboard.render.com).
2. Click **New +** → **Blueprint**.
3. Connect your GitHub / GitLab repository containing this code.
4. Render will automatically detect [`render.yaml`](./render.yaml) and parse:
   - `decisionhub-db`: Managed PostgreSQL 16 database.
   - `decisionhub-backend`: Docker container built using `Dockerfile.cloud`.
   - `decisionhub-frontend`: Static site built with `npm ci && npm run build`.
5. Enter required secrets when prompted:
   - `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` (if using Cloudinary)
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` (if enabling Google OAuth2 login)
   - `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` (if enabling FCM push)
6. Click **Apply**.
7. Once deployed:
   - Backend URL: `https://decisionhub-backend.onrender.com`
   - Frontend URL: `https://decisionhub-frontend.onrender.com`

---

## 2. Railway Deployment

Railway offers zero-config container deployments with native PostgreSQL integration.

### Steps:
1. Install Railway CLI (or deploy via [Railway Web](https://railway.app)):
   ```bash
   npm i -g @railway/cli
   railway login
   ```
2. Initialize project in your repository root:
   ```bash
   railway init
   ```
3. Add a PostgreSQL database plugin:
   ```bash
   railway add -d postgres
   ```
4. Deploy the backend service:
   - Railway will detect [`railway.json`](./railway.json) and build using `backend/springboot-project/Dockerfile.cloud`.
   - Set environment variables in Railway service settings:
     ```bash
     railway variables --set SPRING_PROFILES_ACTIVE=prod
     railway variables --set DB_URL='${{Postgres.DATABASE_URL}}'
     railway variables --set DB_USERNAME='${{Postgres.PGUSER}}'
     railway variables --set DB_PASSWORD='${{Postgres.PGPASSWORD}}'
     railway variables --set JWT_SECRET='YOUR_RANDOM_64_CHAR_HEX_SECRET'
     railway variables --set STORAGE_PROVIDER='cloudinary'
     railway variables --set CLOUDINARY_CLOUD_NAME='your_cloud_name'
     railway variables --set CLOUDINARY_API_KEY='your_api_key'
     railway variables --set CLOUDINARY_API_SECRET='your_api_secret'
     ```
5. Deploy the frontend service:
   - Link `decisionhub-frontend` subdirectory as a second Railway service or deploy to Vercel (recommended for lowest latency).

---

## 3. Vercel Deployment (Frontend Edge CDN)

Vercel provides instant global edge deployment for the React SPA with automatic HTTPS and preview environments.

### Steps:
1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```
2. Deploy the frontend directly from `decisionhub-frontend`:
   ```bash
   cd decisionhub-frontend
   vercel
   ```
   *Or import repository in the [Vercel Dashboard](https://vercel.com/new) and set **Root Directory** to `decisionhub-frontend`.*
3. Configure Environment Variables in Vercel:
   - `VITE_API_BASE_URL`: URL of your deployed backend (e.g. `https://decisionhub-backend.onrender.com` or `https://api.yourdomain.com`).
4. Production release:
   ```bash
   vercel --prod
   ```
5. The SPA is automatically configured with client-side routing and cache control headers via [`decisionhub-frontend/vercel.json`](./decisionhub-frontend/vercel.json).

---

## 4. AWS Production Deployment (Enterprise)

For high-availability, compliance, and enterprise scale, deploy on Amazon Web Services using Amazon ECS (Fargate) or AWS App Runner, backed by Amazon RDS PostgreSQL and Amazon S3.

### 4.1 Prerequisites
- AWS CLI v2 configured with Administrator or DevOps IAM permissions:
  ```bash
  aws configure
  ```
- Docker installed and running locally.

### 4.2 Automated AWS Deployment Script
We provide one-click deployment scripts that build the container, push to Amazon ECR, and update your ECS cluster:

**On Windows (PowerShell):**
```powershell
.\aws\deploy-aws.ps1 -AwsRegion "us-east-1" -AccountId "123456789012"
```

**On Linux / macOS (Bash):**
```bash
chmod +x ./aws/deploy-aws.sh
./aws/deploy-aws.sh us-east-1 123456789012
```

### 4.3 Manual AWS Step-by-Step Architecture

#### Step 1: Provision RDS PostgreSQL Database
1. Create a VPC with 2 public subnets and 2 private subnets across 2 Availability Zones.
2. Create an **Amazon RDS PostgreSQL 16** db.t4g.micro or db.t4g.small instance in the private DB subnet group.
3. Save the DB Endpoint, master username, and master password into **AWS Secrets Manager** under `decisionhub/db_url`, `decisionhub/db_username`, and `decisionhub/db_password`.

#### Step 2: Provision Amazon S3 Bucket for Media Storage
1. Create bucket `decisionhub-storage-<account-id>`.
2. Enable versioning and server-side encryption (SSE-S3).
3. Attach IAM policy allowing `s3:PutObject`, `s3:GetObject`, and `s3:DeleteObject` to the `decisionhubTaskRole`.

#### Step 3: Register ECS Fargate Task Definition
Update `aws/task-definition.json` with your AWS Account ID and region, then register:
```bash
aws ecs register-task-definition --cli-input-json file://aws/task-definition.json
```

#### Step 4: Create ECS Fargate Service with Application Load Balancer (ALB)
Create an internet-facing ALB listening on port 443 (HTTPS) with an ACM SSL certificate and a target group pointing to container port 8080 (`/actuator/health`). Then launch the service:
```bash
aws ecs create-service --cli-input-json file://aws/ecs-service.json
```

---

### 4.4 VPS / Linux VM / Docker Compose HTTPS & Let's Encrypt Termination

DecisionHub includes active SSL/TLS termination on port 443 with automated HTTP-to-HTTPS (301) redirection, modern security headers (HSTS, CSP, XFO), and automated Let's Encrypt ACME renewals.

#### Architecture:
- **Port 80 (HTTP)**: Serves `/.well-known/acme-challenge/` for ACME HTTP-01 domain validation, `/healthz` for load balancer probes, and returns `301 Moved Permanently` to `https://$host$request_uri` for all incoming browser traffic.
- **Port 443 (HTTPS)**: High-performance TLS 1.2 / TLS 1.3 termination with Mozilla Modern Ciphers, HSTS preload (`max-age=31536000`), reverse proxies `/api/*` and `/actuator/*` to Spring Boot backend, and serves the minified React SPA.
- **Certbot Service**: Background companion container (`decisionhub-certbot`) checking and renewing certificates automatically every 12 hours.

#### Automated Let's Encrypt CA-Signed Certificate Issuance:

**On Linux / macOS (Bash):**
```bash
chmod +x ./scripts/init-letsencrypt.sh
./scripts/init-letsencrypt.sh yourdomain.com admin@yourdomain.com 0
```
*(Use `1` as the 3rd argument to test against Let's Encrypt Staging API and avoid rate limits).*

**On Windows (PowerShell):**
```powershell
.\scripts\init-letsencrypt.ps1 -Domain yourdomain.com -Email admin@yourdomain.com
```

#### Self-Signed Staging / Local HTTPS:
```powershell
# Windows
.\scripts\generate-ssl-certs.ps1 -CertDir .\nginx\ssl\live -Domain localhost

# Linux / macOS
chmod +x ./scripts/generate-ssl-certs.sh
./scripts/generate-ssl-certs.sh ./nginx/ssl/live localhost
```

#### Launching the Stack:
```bash
docker compose up -d
```
All containers will start with active port 80 (HTTP) and port 443 (HTTPS) termination. Test via `https://localhost` or `https://yourdomain.com`.

---

## 5. Production Environment Variables Reference

| Variable Name | Required | Default / Example | Purpose |
| :--- | :---: | :--- | :--- |
| `SPRING_PROFILES_ACTIVE` | Yes | `prod` | Activates production configuration profile |
| `DB_URL` | Yes | `jdbc:postgresql://host:5432/decisionhub` | PostgreSQL JDBC connection URL |
| `DB_USERNAME` | Yes | `decisionhub` | PostgreSQL database user |
| `DB_PASSWORD` | Yes | `SecretPassword123!` | PostgreSQL database user password |
| `JWT_SECRET` | Yes | *64+ character random hex string* | HMAC-SHA512 secret for signing JWTs |
| `JWT_EXPIRATION` | No | `86400000` (24h in ms) | Access token validity duration |
| `CORS_ALLOWED_ORIGINS` | Yes | `https://yourdomain.com,https://app.vercel.app` | Whitelist of allowed frontend origins |
| `STORAGE_PROVIDER` | Yes | `s3` or `cloudinary` | Active file storage provider |
| `AWS_S3_BUCKET` | Optional | `decisionhub-storage-prod` | AWS S3 bucket name (if `STORAGE_PROVIDER=s3`) |
| `AWS_S3_REGION` | Optional | `us-east-1` | AWS S3 region (if `STORAGE_PROVIDER=s3`) |
| `CLOUDINARY_CLOUD_NAME` | Optional | `my-cloud-name` | Cloudinary account name (if `STORAGE_PROVIDER=cloudinary`) |
| `CLOUDINARY_API_KEY` | Optional | `1234567890` | Cloudinary API Key |
| `CLOUDINARY_API_SECRET` | Optional | `abcdef123456` | Cloudinary API Secret |
| `GOOGLE_CLIENT_ID` | Optional | `xxx.apps.googleusercontent.com` | Google OAuth2 client ID |
| `GOOGLE_CLIENT_SECRET` | Optional | `GOCSPX-xxx` | Google OAuth2 client secret |
| `OAUTH2_FRONTEND_REDIRECT_URI` | Optional | `https://yourdomain.com/oauth2/callback` | OAuth2 callback redirect URL |
| `FIREBASE_PROJECT_ID` | Optional | `decisionhub-fcm` | Firebase Cloud Messaging project ID |
| `FIREBASE_CLIENT_EMAIL` | Optional | `firebase-adminsdk@...iam.gserviceaccount.com`| Firebase service account email |
| `FIREBASE_PRIVATE_KEY` | Optional | `-----BEGIN PRIVATE KEY-----\n...` | Firebase service account RSA private key |
| `FIREBASE_ENABLED` | No | `true` | Enables FCM push notifications subsystem |

---

## 6. Database Migrations & Initial Seeding

When deploying to a fresh database on Render, Railway, or AWS RDS:
1. Connect using `psql` or pgAdmin:
   ```bash
   psql -h YOUR_DB_HOST -U YOUR_DB_USER -d YOUR_DB_NAME -f database/init.sql
   ```
2. `database/init.sql` creates all 17 normalized tables:
   - Users & roles
   - Communities & members
   - Decision boards & options
   - Votes & voting reminders
   - Comments & attachments
   - Reports & audit logs
   - FCM push device tokens (`fcm_tokens`)
3. Spring Boot JPA `ddl-auto: update` validates schema integrity on startup.

---

## 7. Health Checks & Monitoring

- **Application Health**: `GET /actuator/health` (returns `{"status":"UP"}` with database check).
- **Application Info**: `GET /actuator/info`
- **FCM Push Status**: `GET /api/notifications/fcm/status`
- **Storage Status**: `GET /api/files/test`
