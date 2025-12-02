# AI Job Matcher Service

AI-powered job recommendation system using vector embeddings, semantic search, and Google Gemini AI.

## Features

- 🤖 **AI-Powered Matching**: Uses Gemini 2.0 Flash for intelligent job recommendations
- 🔍 **Vector Search**: Semantic job matching using Qdrant vector database
- 📄 **Resume Processing**: Supports PDF and TXT file uploads with automatic text extraction
- 🌐 **Multi-Source Jobs**: Fetches jobs from RemoteOK, Jobicy, and Adzuna APIs
- ⏰ **Auto-Sync**: Daily cron job to fetch latest job postings
- 🔐 **Clerk Authentication**: Integrated with existing CareerCoach auth system

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express 5
- **Database**: PostgreSQL (shared with main server)
- **Vector DB**: Qdrant
- **AI/ML**: Google Gemini (text-embedding-004 + gemini-2.0-flash-exp)
- **File Processing**: pdf-parse, multer
- **Cron**: node-cron

## Quick Start

### Prerequisites

- Node.js 20+
- PostgreSQL running (shared with main server)
- Qdrant instance (Docker or Cloud)
- Gemini API key
- Optional: Adzuna API credentials

### Installation

```bash
cd ai-job-matcher
npm install
```

### Environment Setup

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL` - PostgreSQL connection string
- `QDRANT_URL` - Qdrant instance URL  
- `GEMINI_API_KEY` - Google AI API key

Optional:
- `ADZUNA_APP_ID` - Adzuna API app ID
- `ADZUNA_APP_KEY` - Adzuna API key

### Database Setup

```bash
npm run prisma:push
npm run prisma:generate
```

### Development

```bash
npm run dev
```

Server runs on http://localhost:4001

### Production

```bash
npm start
```

## API Endpoints

### Health Check
```
GET /health
```

### Jobs
```
GET  /api/jobs              - List all jobs (with pagination)
GET  /api/jobs/sync         - Manually trigger job sync
GET  /api/jobs/:id          - Get single job
```

### Resumes
```
POST /api/resumes/upload    - Upload resume (PDF/TXT)
GET  /api/resumes           - List user's resumes
GET  /api/resumes/:id       - Get resume details
DELETE /api/resumes/:id     - Delete resume
```

### Recommendations
```
POST /api/recommendations/:resumeId  - Generate AI recommendations
GET  /api/recommendations/:resumeId  - Get cached recommendations
```

## How It Works

1. **Job Syncing**: 
   - Fetches jobs from remote APIs daily (2 AM)
   - Normalizes data into common format
   - Generates embeddings using Gemini
   - Stores in PostgreSQL + Qdrant

2. **Resume Upload**:
   - Extracts text from PDF/TXT
   - Generates embedding vector
   - Stores in database + Qdrant

3. **Recommendation Generation**:
   - Performs vector similarity search (top 30 matches)
   - Sends resume + matched jobs to Gemini AI
   - AI analyzes fit and returns structured JSON
   - Caches recommendations in database

## Docker Deployment

The service is included in the main docker-compose.yml:

```bash
docker-compose up -d
```

Services:
- `db` - PostgreSQL database
- `server` - Main CareerCoach API
- `client` - Next.js frontend
- `qdrant` - Vector database
- `ai-job-matcher` - This service (port 4001)

## File Upload Limits

- Max file size: 5MB
- Allowed types: PDF, TXT
- Uploads stored temporarily then deleted after processing

## Cron Schedule

- **Job Sync**: Every day at 2:00 AM
- Fetches 50 jobs from each configured API
- Automatically deduplicates based on externalId + source

## Vector Dimensions

- Embedding model: `text-embedding-004`
- Vector size: 768 dimensions
- Distance metric: Cosine similarity

## Error Handling

All endpoints include comprehensive error handling:
- Validation errors (400)
- Authentication errors (401)  
- Not found errors (404)
- Internal server errors (500)

## Development Notes

- Resume text must be at least 100 characters
- Job recommendations return top 10 matches
- Vector search queries top 30 similar jobs
- Recommendations are cached to reduce API costs
