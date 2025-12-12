# Career Coach - Deployment Guide

Complete guide for deploying the Career Coach application using Docker in development and production environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Development Deployment](#development-deployment)
- [Production Deployment](#production-deployment)
- [Environment Configuration](#environment-configuration)
- [Database Management](#database-management)
- [Platform-Specific Guides](#platform-specific-guides)
- [Monitoring](#monitoring)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

- **Docker** (v20.10 or higher)
- **Docker Compose** (v2.0 or higher)
- **Git** (for cloning the repository)

### Required API Keys

1. **Clerk** - User authentication ([clerk.com](https://clerk.com))
   - Publishable Key
   - Secret Key

2. **Google Gemini AI** - AI features ([ai.google.dev](https://ai.google.dev))
   - API Key

## Quick Start

```bash
# 1. Clone the repository
git clone <repository-url>
cd hackathon

# 2. Copy environment files
cp .env.example .env
cp server/.env.example server/.env
cp client/.env.example client/.env.local

# 3. Edit environment files with your API keys
nano .env  # or use your preferred editor

# 4. Build and start services
docker-compose up -d

# 5. Run database migrations
docker-compose exec server npx prisma migrate deploy

# 6. Access the application
# Client: http://localhost:3000
# Server: http://localhost:4000
```

## Development Deployment

Development mode includes hot-reload for both frontend and backend.

### Start Development Environment

```bash
# Start all services with hot-reload
docker-compose -f docker-compose.dev.yml up

# Or run in background
docker-compose -f docker-compose.dev.yml up -d

# View logs
docker-compose -f docker-compose.dev.yml logs -f

# Stop services
docker-compose -f docker-compose.dev.yml down
```

### Development Features

- ✅ Hot reload for server (nodemon)
- ✅ Hot reload for client (Next.js fast refresh)
- ✅ Source code mounted as volumes
- ✅ Node.js debugging port exposed (9229)
- ✅ Separate development database

## Production Deployment

Production mode uses optimized builds with multi-stage Docker images.

### Build Production Images

```bash
# Build all images
docker-compose build

# Build specific service
docker-compose build server
docker-compose build client

# Build with no cache (full rebuild)
docker-compose build --no-cache
```

### Start Production Environment

```bash
# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes (⚠️ deletes database)
docker-compose down -v
```

### Production Features

- ✅ Multi-stage builds for smaller images
- ✅ Non-root user execution
- ✅ Health checks
- ✅ Automatic restarts
- ✅ Resource limits (CPU + memory)
- ✅ Custom network isolation

## Environment Configuration

### Root .env File

```env
# Database
POSTGRES_USER=user
POSTGRES_PASSWORD=secure_password_here
POSTGRES_DB=careercoach
DB_PORT=5555

# Ports
SERVER_PORT=4000
CLIENT_PORT=3000

# Client Build Args
NEXT_PUBLIC_API_URL=https://api.yourdomain.com/api
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
```

### Server .env File

```env
# Database
DATABASE_URL="postgresql://user:password@db:5432/careercoach"

# Clerk
CLERK_SECRET_KEY=sk_live_xxxxx
CLERK_PUBLISHABLE_KEY=pk_live_xxxxx

# AI
GEMINI_API_KEY=your_gemini_api_key

# Server
PORT=4000
NODE_ENV=production
```

### Client .env.local File

For local development only. In production, use build args.

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
```

## Database Management

### Run Migrations

```bash
# Apply migrations (production)
docker-compose exec server npx prisma migrate deploy

# Create new migration (development)
docker-compose exec server npx prisma migrate dev

# Generate Prisma Client
docker-compose exec server npx prisma generate

# Open Prisma Studio
docker-compose exec server npx prisma studio
```

### Backup Database

```bash
# Create backup
docker-compose exec db pg_dump -U user mydb > backup-$(date +%Y%m%d-%H%M%S).sql

# Or with Docker run
docker run --rm \
  --network hackathon_careercoach-network \
  postgres:15-alpine \
  pg_dump -h careercoach-db -U user mydb > backup.sql
```

### Restore Database

```bash
# Restore from backup
docker-compose exec -T db psql -U user mydb < backup.sql

# Or with Docker run
cat backup.sql | docker run --rm -i \
  --network hackathon_careercoach-network \
  postgres:15-alpine \
  psql -h careercoach-db -U user mydb
```

## Platform-Specific Guides

### AWS ECS

```bash
# 1. Push images to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account-id>.dkr.ecr.us-east-1.amazonaws.com
docker tag careercoach-server:latest <account-id>.dkr.ecr.us-east-1.amazonaws.com/careercoach-server:latest
docker push <account-id>.dkr.ecr.us-east-1.amazonaws.com/careercoach-server:latest

# 2. Create ECS task definition with environment variables
# 3. Create ECS service
# 4. Configure load balancer
```

### Google Cloud Run

```bash
# 1. Build and push to GCR
gcloud builds submit --tag gcr.io/[PROJECT-ID]/careercoach-server ./server
gcloud builds submit --tag gcr.io/[PROJECT-ID]/careercoach-client ./client

# 2. Deploy services
gcloud run deploy careercoach-server \
  --image gcr.io/[PROJECT-ID]/careercoach-server \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

gcloud run deploy careercoach-client \
  --image gcr.io/[PROJECT-ID]/careercoach-client \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars NEXT_PUBLIC_API_URL=[SERVER_URL]
```

### DigitalOcean App Platform

1. Connect your GitHub repository
2. Configure app:
   - Add server service (Node.js)
   - Add client service (Node.js)
   - Add PostgreSQL database
3. Set environment variables in dashboard
4. Deploy

### Railway

```bash
# 1. Install Railway CLI
npm i -g @railway/cli

# 2. Login
railway login

# 3. Initialize project
railway init

# 4. Add services
railway add --database postgresql
railway add --service server
railway add --service client

# 5. Set environment variables
railway variables set CLERK_SECRET_KEY=xxx

# 6. Deploy
railway up
```

### Render.com

1. Create new Web Services for server and client
2. Add PostgreSQL database
3. Configure build commands:
   - Server: `npm install && npx prisma generate`
   - Client: `npm install && npm run build`
4. Configure start commands:
   - Server: `npm start`
   - Client: `npm start`
5. Set environment variables

## Monitoring

### Health Checks

```bash
# Check server health
curl http://localhost:4000/health

# Check client health  
curl http://localhost:3000/api/health

# Docker health status
docker-compose ps
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f server
docker-compose logs -f client
docker-compose logs -f db

# Last 100 lines
docker-compose logs --tail=100

# Since specific time
docker-compose logs --since=1h
```

### Resource Usage

```bash
# Container stats
docker stats

# Disk usage
docker system df

# Clean up unused images/containers
docker system prune -a
```

## Troubleshooting

### Container Won't Start

```bash
# Check logs
docker-compose logs [service-name]

# Inspect container
docker inspect careercoach-server

# Rebuild from scratch
docker-compose build --no-cache
docker-compose up -d
```

### Database Connection Issues

```bash
# Check if DB is running
docker-compose ps db

# Check database logs
docker-compose logs db

# Test connection
docker-compose exec server node -e "require('./src/lib/prisma.js').default.\$connect().then(() => console.log('Connected!')).catch(e => console.error(e))"

# Recreate database
docker-compose down -v
docker-compose up -d db
docker-compose exec server npx prisma migrate deploy
```

### Port Already in Use

```bash
# Find process using port
# Windows:
netstat -ano | findstr :3000
taskkill /PID <pid> /F

# Linux/Mac:
lsof -i :3000
kill -9 <pid>

# Or change port in .env file
```

### Health Check Failing

```bash
# Check health endpoint
curl -v http://localhost:4000/health
curl -v http://localhost:3000/api/health

# Increase start period if service needs more time
# Edit docker-compose.yml healthcheck.start_period
```

### Image Size Too Large

```bash
# Check image sizes
docker images | grep careercoach

# Ensure .dockerignore is working
docker build -t test . 2>&1 | grep -i "sending build context"

# Use dive to analyze layers
docker run --rm -it \
  -v /var/run/docker.sock:/var/run/docker.sock \
  wagoodman/dive:latest careercoach-server
```

### Environment Variables Not Working

```bash
# Verify env vars are loaded
docker-compose exec server printenv | grep CLERK
docker-compose config  # Shows final compose config with env vars

# For Next.js public vars, rebuild with build args
docker-compose build --build-arg NEXT_PUBLIC_API_URL=http://localhost:4000/api client
```

## Useful Commands

```bash
# Restart specific service
docker-compose restart server

# Rebuild and restart service
docker-compose up -d --build server

# Execute command in running container
docker-compose exec server npm run test

# Shell into container
docker-compose exec server sh
docker-compose exec client sh

# Remove all stopped containers
docker container prune

# Remove all unused images
docker image prune -a

# Full cleanup
docker system prune -a --volumes
```

## Security Best Practices

1. ✅ Never commit .env files
2. ✅ Use strong database passwords
3. ✅ Run containers as non-root user (already configured)
4. ✅ Keep images updated
5. ✅ Use secrets management in production (AWS Secrets Manager, etc.)
6. ✅ Enable HTTPS in production (reverse proxy like nginx)
7. ✅ Implement rate limiting
8. ✅ Regular security audits: `docker scan careercoach-server`

## Performance Optimization

1. ✅ Use multi-stage builds (already configured)
2. ✅ Optimize layer caching (dependencies before code)
3. ✅ Use .dockerignore (already configured)
4. ✅ Implement CDN for static assets
5. ✅ Use connection pooling for database
6. ✅ Configure memory limits (already configured)
7. ✅ Monitor and scale based on metrics

## Support

For issues or questions:
1. Check [Troubleshooting](#troubleshooting) section
2. Review Docker logs
3. Check platform-specific documentation
4. Contact support team

---

**Last Updated:** 2025-12-01
**Version:** 1.0.0
