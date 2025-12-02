# 🚀 Quick Database Setup for AI Job Matcher

## Current Situation

The AI job matcher models have been added to the **main server's Prisma schema** at:
`server/prisma/schema.prisma`

This means both services will share the **same PostgreSQL database**.

## ✅ Setup Steps

### Step 1: Start PostgreSQL with Docker

```bash
cd c:\Users\ullah\hackathon
docker-compose up -d db
```

This starts the PostgreSQL database container.

### Step 2: Push the Schema to Database

```bash
cd server
npx prisma db push
npx prisma generate
```

This creates the 3 new tables:
- `resume_profiles` - Resume uploads for job matching
- `job_postings` - Jobs fetched from APIs  
- `job_recommendations` - AI-generated recommendations

### Step 3: Generate Prisma Client for ai-job-matcher

```bash
cd ../ai-job-matcher
npx prisma generate
```

This generates the Prisma client for the ai-job-matcher service.

### Step 4: Start Qdrant Vector Database

```bash
docker-compose up -d qdrant
```

### Step 5: Run the AI Job Matcher Service

```bash
cd ai-job-matcher
npm run dev
```

You should see:
```
✅ Created collection: resumes
✅ Created collection: jobs
✅ Qdrant collections initialized
🚀 AI Job Matcher Service
Server running on port 4001
```

## 🧪 Test It Works

### 1. Health Check
```bash
curl http://localhost:4001/health
```

### 2. Sync Jobs (Fetch from APIs)
```bash
curl http://localhost:4001/api/jobs/sync
```

This will fetch ~150 jobs and store them in the database + Qdrant.

### 3. Check Jobs in Database
```bash
curl http://localhost:4001/api/jobs
```

## 📊 Database Structure

All data is in **one shared PostgreSQL database**:

**Main App Tables** (from server):
- `User`
- `Assessment`
- `Resume`
- `CoverLetter`
- `IndustryInsight`

**Job Matcher Tables** (new):
- `resume_profiles` ← Resume uploads for AI matching
- `job_postings` ← Jobs from APIs
- `job_recommendations` ← AI recommendations

**Vector Data** (in Qdrant):
- `resumes` collection ← Resume embeddings
- `jobs` collection ← Job embeddings

## 🔧 Troubleshooting

**"Can't connect to database"**
```bash
docker-compose up -d db
# Wait 5 seconds for it to start
cd server
npx prisma db push
```

**"Qdrant connection failed"**
```bash
docker-compose up -d qdrant
```

**"Can't find Docker containers"**
Check if Docker Desktop is running, then:
```bash
docker ps -a
```

## 📝 Next Steps

Once the backend is running:
1. Test uploading a resume via the API
2. Generate recommendations
3. Build the frontend UI to integrate with this backend
