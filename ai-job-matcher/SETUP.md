# AI Job Matcher - Quick Setup Guide

## 📋 Prerequisites Checklist

Before starting, make sure you have:
- ✅ Gemini API key from existing `server/.env`
- ✅ Clerk auth keys from existing `server/.env`
- ✅ PostgreSQL running (shared with main server)

## 🚀 Quick Start

### 1. Setup Environment Variables

Copy your Gemini and Clerk keys from the main server:

```bash
cd ai-job-matcher
cp .env.example .env
```

Then edit `.env` and add:
- `GEMINI_API_KEY` (from ../server/.env)
- `CLERK_PUBLISHABLE_KEY` (from ../server/.env)
- `CLERK_SECRET_KEY` (from ../server/.env)

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Database

```bash
npm run prisma:push
npm run prisma:generate
```

### 4. Start Qdrant (if not using Docker)

```bash
docker run -p 6333:6333 qdrant/qdrant
```

### 5. Run the Service

Development mode:
```bash
npm run dev
```

The service will start on http://localhost:4001

## 🧪 Testing the API

### Health Check
```bash
curl http://localhost:4001/health
```

### Sync Jobs (First Time)
```bash
curl http://localhost:4001/api/jobs/sync
```

This will fetch ~150 jobs from RemoteOK, Jobicy, and Adzuna (if configured).

### Upload a Resume
```bash
curl -X POST http://localhost:4001/api/resumes/upload \
  -F "resume=@/path/to/your/resume.pdf"
```

Response will include a `resumeId`.

### Generate Recommendations
```bash
curl -X POST http://localhost:4001/api/recommendations/{resumeId}
```

## 🐳 Using Docker (Recommended)

From the hackathon root:

```bash
docker-compose up -d qdrant
docker-compose up -d ai-job-matcher
```

## 📝 Next Steps

1. **Frontend Integration**: Add job matching UI to the client
2. **Optional APIs**: Get Adzuna API keys for more job sources
3. **Customize**: Adjust cron schedule, job sources, or AI prompts

## 🔧 Troubleshooting

**"Qdrant connection failed"**
- Make sure Qdrant is running on port 6333
- Check QDRANT_URL in .env

**"Failed to generate embedding"**
- Verify GEMINI_API_KEY is correct
- Check API quota

**"Database error"**
- Run `npm run prisma:push` to sync schema
- Verify DATABASE_URL matches main server

## 🎯 API Endpoints Summary

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/jobs` | List all jobs |
| GET | `/api/jobs/sync` | Manually sync jobs |
| POST | `/api/resumes/upload` | Upload resume |
| GET | `/api/resumes` | List resumes |
| POST | `/api/recommendations/:id` | Generate recommendations |
| GET | `/api/recommendations/:id` | Get cached recommendations |

For detailed API documentation, see [README.md](./README.md).
